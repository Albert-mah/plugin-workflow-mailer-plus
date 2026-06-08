import { resolve } from 'path';
import { readFileSync, existsSync } from 'fs';
import { promisify } from 'util';
import nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { FlowNodeModel, IJob, Instruction, JOB_STATUS, Processor } from '@nocobase/plugin-workflow';
import get from 'lodash/get';
import { randomBytes } from 'crypto';

interface Provider {
  port: number;
  host: string;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

/**
 * Resolve attachments to nodemailer format.
 *
 * For NocoBase attachment records (with storageId), delegate to plugin-file-manager's
 * getFileStream() — works across local / ali-oss / s3 / tx-cos without URL-encoding pitfalls.
 *
 * Supported inputs:
 *   1. NocoBase attachment record (with storageId)         → stream via file-manager
 *   2. Array of records                                    → flatten
 *   3. Legacy object { url, filename/title } (no storageId) → decode URL, fallback path/href
 *   4. String URL                                          → path or href
 *   5. Manual { filename, url } / { filename, content }    → path or inline buffer
 */
async function resolveAttachments(items: any[], app: any): Promise<any[]> {
  if (!items || !Array.isArray(items)) return [];

  const fm: any = app?.pm?.get?.('file-manager');
  const canStream = fm && typeof fm.getFileStream === 'function';
  const result: any[] = [];

  const localPath = (url: string) =>
    resolve(process.cwd(), decodeURIComponent(url.replace(/^\//, '')));

  for (const item of items) {
    if (!item) continue;

    if (typeof item === 'string') {
      if (item.startsWith('/storage/') || item.startsWith('storage/')) {
        result.push({ path: localPath(item), contentDisposition: 'attachment' as const });
      } else {
        result.push({ href: item, contentDisposition: 'attachment' as const });
      }
      continue;
    }

    if (Array.isArray(item)) {
      result.push(...(await resolveAttachments(item, app)));
      continue;
    }

    // NocoBase attachment record — prefer storage-aware streaming
    if (item.storageId && (item.filename || item.title) && canStream) {
      const name = item.title ? `${item.title}${item.extname || ''}` : item.filename;
      try {
        const { stream, contentType } = await fm.getFileStream(item);
        result.push({
          filename: name,
          content: stream,
          contentDisposition: 'attachment' as const,
          contentType: item.mimetype || contentType || 'application/octet-stream',
        });
        continue;
      } catch (err) {
        app?.logger?.warn?.(`mailer-plus: getFileStream failed for attachment ${item.id ?? '?'}: ${err.message}; falling back to URL path`);
        // fall through to legacy URL handling
      }
    }

    // Legacy / fallback: object with url + name
    if (item.url && (item.filename || item.title)) {
      const name = item.title ? `${item.title}${item.extname || ''}` : item.filename;
      if (item.url.startsWith('/storage/') || item.url.startsWith('storage/')) {
        result.push({
          filename: name,
          path: localPath(item.url),
          contentDisposition: 'attachment' as const,
          ...(item.mimetype ? { contentType: item.mimetype } : {}),
        });
      } else {
        result.push({
          filename: name,
          href: item.url,
          contentDisposition: 'attachment' as const,
          ...(item.mimetype ? { contentType: item.mimetype } : {}),
        });
      }
      continue;
    }

    // Manual entries
    if (item.filename && item.url) {
      if (item.url.startsWith('/storage/') || item.url.startsWith('storage/')) {
        result.push({ filename: item.filename, path: localPath(item.url), contentDisposition: 'attachment' as const });
      } else {
        result.push({ filename: item.filename, href: item.url, contentDisposition: 'attachment' as const });
      }
      continue;
    }
    if (item.filename && item.content) {
      result.push({ filename: item.filename, content: item.content, contentDisposition: 'attachment' as const });
      continue;
    }
  }

  return result;
}

const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.gif': 'image/gif', '.bmp': 'image/bmp', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};

function getExtFromUrl(url: string): string {
  const pathname = url.split('?')[0].split('#')[0];
  const dot = pathname.lastIndexOf('.');
  return dot >= 0 ? pathname.substring(dot).toLowerCase() : '';
}

/**
 * Scan HTML for <img src="..."> tags, embed images as CID attachments.
 * Supports: local /storage/uploads/ paths, external https:// URLs, data: URIs.
 * Returns { html, inlineAttachments }.
 */
async function embedInlineImages(htmlContent: string): Promise<{
  html: string;
  inlineAttachments: any[];
}> {
  if (!htmlContent) return { html: htmlContent, inlineAttachments: [] };

  const inlineAttachments: any[] = [];
  const imgRegex = /<img\s+[^>]*src\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let match: RegExpExecArray | null;
  const replacements: Array<{ original: string; replacement: string }> = [];

  while ((match = imgRegex.exec(htmlContent)) !== null) {
    const src = match[1];
    const cid = `img-${randomBytes(8).toString('hex')}@mailer-plus`;

    try {
      // data: URI — decode base64
      if (src.startsWith('data:')) {
        const dataMatch = src.match(/^data:([^;]+);base64,(.+)$/);
        if (dataMatch) {
          const [, mimeType, base64Data] = dataMatch;
          const ext = Object.entries(MIME_MAP).find(([, v]) => v === mimeType)?.[0] || '.bin';
          inlineAttachments.push({
            filename: `image${ext}`,
            content: Buffer.from(base64Data, 'base64'),
            contentType: mimeType,
            contentDisposition: 'inline' as const,
            cid,
          });
          replacements.push({ original: src, replacement: `cid:${cid}` });
        }
        continue;
      }

      // Local file: /storage/uploads/... — URL is encoded, decode before fs lookup
      if (src.startsWith('/storage/') || src.startsWith('storage/')) {
        const decoded = decodeURIComponent(src.replace(/^\//, ''));
        const filePath = resolve(process.cwd(), decoded);
        if (existsSync(filePath)) {
          const ext = getExtFromUrl(src);
          inlineAttachments.push({
            filename: decoded.split('/').pop() || `image${ext}`,
            path: filePath,
            contentType: MIME_MAP[ext] || 'application/octet-stream',
            contentDisposition: 'inline' as const,
            cid,
          });
          replacements.push({ original: src, replacement: `cid:${cid}` });
        }
        continue;
      }

      // External URL (https://...)
      if (src.startsWith('http://') || src.startsWith('https://')) {
        const ext = getExtFromUrl(src);
        inlineAttachments.push({
          filename: src.split('/').pop()?.split('?')[0] || `image${ext}`,
          href: src,
          contentType: MIME_MAP[ext] || 'application/octet-stream',
          contentDisposition: 'inline' as const,
          cid,
        });
        replacements.push({ original: src, replacement: `cid:${cid}` });
        continue;
      }
    } catch {
      // Skip images that fail to process
    }
  }

  let result = htmlContent;
  for (const { original, replacement } of replacements) {
    result = result.split(original).join(replacement);
  }

  return { html: result, inlineAttachments };
}

export default class MailerPlusInstruction extends Instruction {
  private static transporterMap = new Map<string, Transporter>();
  private static configMap = new Map<string, any>();

  private getTransporterKey(provider: Provider) {
    const { host, port, auth } = provider;
    return `${host}:${port}:${auth?.user}`;
  }

  private isConfigChanged(oldConfig: any, newConfig: any): boolean {
    const fields = ['host', 'port', 'secure', 'auth.user', 'auth.pass'];
    return fields.some((key) => get(oldConfig, key) !== get(newConfig, key));
  }

  private createNewTransporter(key: string, config: Provider): Transporter {
    const transporter = nodemailer.createTransport(config);
    MailerPlusInstruction.transporterMap.set(key, transporter);
    MailerPlusInstruction.configMap.set(key, config);
    return transporter;
  }

  private getTransporter(provider: Provider): Transporter {
    const key = this.getTransporterKey(provider);
    const newConfig = provider;
    const oldConfig = MailerPlusInstruction.configMap.get(key);

    if (!oldConfig) {
      return this.createNewTransporter(key, newConfig);
    }
    if (this.isConfigChanged(oldConfig, newConfig)) {
      const oldTransporter = MailerPlusInstruction.transporterMap.get(key);
      if (oldTransporter) {
        oldTransporter.close();
      }
      return this.createNewTransporter(key, newConfig);
    }
    return MailerPlusInstruction.transporterMap.get(key)!;
  }

  async run(node: FlowNodeModel, prevJob, processor: Processor) {
    const {
      provider,
      contentType,
      to = [],
      cc,
      bcc,
      subject,
      html,
      text,
      attachments: rawAttachments,
      ignoreFail,
      ...options
    } = processor.getParsedValue(node.config, node.id);

    const { workflow } = processor.execution;
    const sync = this.workflow.isWorkflowSync(workflow);

    const transporter = this.getTransporter(provider);
    const send = promisify(transporter.sendMail.bind(transporter));

    const attachments = await resolveAttachments(rawAttachments, this.workflow.app);

    // Log attachment resolution for debugging
    for (const att of attachments) {
      if (att.path && !existsSync(att.path)) {
        processor.logger.warn(`mailer-plus (#${node.id}) attachment file not found: ${att.path}`);
      }
    }

    // Auto-embed <img src="..."> as CID inline attachments
    let finalHtml = html;
    let inlineAttachments: any[] = [];
    if (contentType === 'html' && html) {
      const embedded = await embedInlineImages(html);
      finalHtml = embedded.html;
      inlineAttachments = embedded.inlineAttachments;
    }

    // Regular attachments first, then CID inline — ensures correct MIME structure
    const allAttachments = [...attachments, ...inlineAttachments];

    processor.logger.info(`mailer-plus (#${node.id}) attachments: ${attachments.length} file(s), ${inlineAttachments.length} inline image(s)`);

    const payload = {
      ...options,
      ...(contentType === 'html' ? { html: finalHtml } : { text }),
      subject: subject?.trim(),
      to: to
        ? to.flat().map((item) => item?.trim()).filter(Boolean)
        : undefined,
      cc: cc
        ? cc.flat().map((item) => item?.trim()).filter(Boolean)
        : null,
      bcc: bcc
        ? bcc.flat().map((item) => item?.trim()).filter(Boolean)
        : null,
      ...(allAttachments.length ? { attachments: allAttachments } : {}),
    };

    if (sync) {
      try {
        const result = await send(payload);
        return {
          status: JOB_STATUS.RESOLVED,
          result: {
            messageId: result.messageId,
            accepted: result.accepted,
            rejected: result.rejected,
            attachmentCount: allAttachments.length,
          },
        };
      } catch (error) {
        return {
          status: ignoreFail ? JOB_STATUS.RESOLVED : JOB_STATUS.FAILED,
          result: { error: error.message },
        };
      }
    }

    const { id } = processor.saveJob({
      status: JOB_STATUS.PENDING,
      nodeId: node.id,
      nodeKey: node.key,
      upstreamId: prevJob?.id ?? null,
    });

    await processor.exit();

    const jobDone: IJob = { status: JOB_STATUS.PENDING };

    try {
      const response = await send(payload);
      processor.logger.info(`mailer-plus (#${node.id}) sent successfully.`);
      jobDone.status = JOB_STATUS.RESOLVED;
      jobDone.result = {
        messageId: response.messageId,
        accepted: response.accepted,
        rejected: response.rejected,
        attachmentCount: attachments.length,
      };
    } catch (error) {
      processor.logger.warn(`mailer-plus (#${node.id}) sent failed: ${error.message}`);
      jobDone.status = JOB_STATUS.FAILED;
      jobDone.result = { error: error.message };
    } finally {
      processor.logger.debug(`mailer-plus (#${node.id}) sending ended, resume workflow...`);
      const job = await this.workflow.app.db.getRepository('jobs').findOne({
        filterByTk: id,
      });
      job.set(jobDone);
      this.workflow.resume(job);
    }
  }

  async resume(node: FlowNodeModel, job, processor: Processor) {
    const { ignoreFail } = node.config;
    if (ignoreFail) {
      job.set('status', JOB_STATUS.RESOLVED);
    }
    return job;
  }
}
