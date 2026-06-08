/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var MailerPlusInstruction_exports = {};
__export(MailerPlusInstruction_exports, {
  default: () => MailerPlusInstruction
});
module.exports = __toCommonJS(MailerPlusInstruction_exports);
var import_path = require("path");
var import_fs = require("fs");
var import_util = require("util");
var import_nodemailer = __toESM(require("nodemailer"));
var import_plugin_workflow = require("@nocobase/plugin-workflow");
var import_get = __toESM(require("lodash/get"));
var import_crypto = require("crypto");
async function resolveAttachments(items, app) {
  var _a, _b, _c, _d;
  if (!items || !Array.isArray(items)) return [];
  const fm = (_b = (_a = app == null ? void 0 : app.pm) == null ? void 0 : _a.get) == null ? void 0 : _b.call(_a, "file-manager");
  const canStream = fm && typeof fm.getFileStream === "function";
  const result = [];
  const localPath = (url) => (0, import_path.resolve)(process.cwd(), decodeURIComponent(url.replace(/^\//, "")));
  for (const item of items) {
    if (!item) continue;
    if (typeof item === "string") {
      if (item.startsWith("/storage/") || item.startsWith("storage/")) {
        result.push({ path: localPath(item), contentDisposition: "attachment" });
      } else {
        result.push({ href: item, contentDisposition: "attachment" });
      }
      continue;
    }
    if (Array.isArray(item)) {
      result.push(...await resolveAttachments(item, app));
      continue;
    }
    if (item.storageId && (item.filename || item.title) && canStream) {
      const name = item.title ? `${item.title}${item.extname || ""}` : item.filename;
      try {
        const { stream, contentType } = await fm.getFileStream(item);
        result.push({
          filename: name,
          content: stream,
          contentDisposition: "attachment",
          contentType: item.mimetype || contentType || "application/octet-stream"
        });
        continue;
      } catch (err) {
        (_d = (_c = app == null ? void 0 : app.logger) == null ? void 0 : _c.warn) == null ? void 0 : _d.call(_c, `mailer-plus: getFileStream failed for attachment ${item.id ?? "?"}: ${err.message}; falling back to URL path`);
      }
    }
    if (item.url && (item.filename || item.title)) {
      const name = item.title ? `${item.title}${item.extname || ""}` : item.filename;
      if (item.url.startsWith("/storage/") || item.url.startsWith("storage/")) {
        result.push({
          filename: name,
          path: localPath(item.url),
          contentDisposition: "attachment",
          ...item.mimetype ? { contentType: item.mimetype } : {}
        });
      } else {
        result.push({
          filename: name,
          href: item.url,
          contentDisposition: "attachment",
          ...item.mimetype ? { contentType: item.mimetype } : {}
        });
      }
      continue;
    }
    if (item.filename && item.url) {
      if (item.url.startsWith("/storage/") || item.url.startsWith("storage/")) {
        result.push({ filename: item.filename, path: localPath(item.url), contentDisposition: "attachment" });
      } else {
        result.push({ filename: item.filename, href: item.url, contentDisposition: "attachment" });
      }
      continue;
    }
    if (item.filename && item.content) {
      result.push({ filename: item.filename, content: item.content, contentDisposition: "attachment" });
      continue;
    }
  }
  return result;
}
const MIME_MAP = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".bmp": "image/bmp",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};
function getExtFromUrl(url) {
  const pathname = url.split("?")[0].split("#")[0];
  const dot = pathname.lastIndexOf(".");
  return dot >= 0 ? pathname.substring(dot).toLowerCase() : "";
}
async function embedInlineImages(htmlContent) {
  var _a, _b;
  if (!htmlContent) return { html: htmlContent, inlineAttachments: [] };
  const inlineAttachments = [];
  const imgRegex = /<img\s+[^>]*src\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let match;
  const replacements = [];
  while ((match = imgRegex.exec(htmlContent)) !== null) {
    const src = match[1];
    const cid = `img-${(0, import_crypto.randomBytes)(8).toString("hex")}@mailer-plus`;
    try {
      if (src.startsWith("data:")) {
        const dataMatch = src.match(/^data:([^;]+);base64,(.+)$/);
        if (dataMatch) {
          const [, mimeType, base64Data] = dataMatch;
          const ext = ((_a = Object.entries(MIME_MAP).find(([, v]) => v === mimeType)) == null ? void 0 : _a[0]) || ".bin";
          inlineAttachments.push({
            filename: `image${ext}`,
            content: Buffer.from(base64Data, "base64"),
            contentType: mimeType,
            contentDisposition: "inline",
            cid
          });
          replacements.push({ original: src, replacement: `cid:${cid}` });
        }
        continue;
      }
      if (src.startsWith("/storage/") || src.startsWith("storage/")) {
        const decoded = decodeURIComponent(src.replace(/^\//, ""));
        const filePath = (0, import_path.resolve)(process.cwd(), decoded);
        if ((0, import_fs.existsSync)(filePath)) {
          const ext = getExtFromUrl(src);
          inlineAttachments.push({
            filename: decoded.split("/").pop() || `image${ext}`,
            path: filePath,
            contentType: MIME_MAP[ext] || "application/octet-stream",
            contentDisposition: "inline",
            cid
          });
          replacements.push({ original: src, replacement: `cid:${cid}` });
        }
        continue;
      }
      if (src.startsWith("http://") || src.startsWith("https://")) {
        const ext = getExtFromUrl(src);
        inlineAttachments.push({
          filename: ((_b = src.split("/").pop()) == null ? void 0 : _b.split("?")[0]) || `image${ext}`,
          href: src,
          contentType: MIME_MAP[ext] || "application/octet-stream",
          contentDisposition: "inline",
          cid
        });
        replacements.push({ original: src, replacement: `cid:${cid}` });
        continue;
      }
    } catch {
    }
  }
  let result = htmlContent;
  for (const { original, replacement } of replacements) {
    result = result.split(original).join(replacement);
  }
  return { html: result, inlineAttachments };
}
class MailerPlusInstruction extends import_plugin_workflow.Instruction {
  static transporterMap = /* @__PURE__ */ new Map();
  static configMap = /* @__PURE__ */ new Map();
  getTransporterKey(provider) {
    const { host, port, auth } = provider;
    return `${host}:${port}:${auth == null ? void 0 : auth.user}`;
  }
  isConfigChanged(oldConfig, newConfig) {
    const fields = ["host", "port", "secure", "auth.user", "auth.pass"];
    return fields.some((key) => (0, import_get.default)(oldConfig, key) !== (0, import_get.default)(newConfig, key));
  }
  createNewTransporter(key, config) {
    const transporter = import_nodemailer.default.createTransport(config);
    MailerPlusInstruction.transporterMap.set(key, transporter);
    MailerPlusInstruction.configMap.set(key, config);
    return transporter;
  }
  getTransporter(provider) {
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
    return MailerPlusInstruction.transporterMap.get(key);
  }
  async run(node, prevJob, processor) {
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
    const send = (0, import_util.promisify)(transporter.sendMail.bind(transporter));
    const attachments = await resolveAttachments(rawAttachments, this.workflow.app);
    for (const att of attachments) {
      if (att.path && !(0, import_fs.existsSync)(att.path)) {
        processor.logger.warn(`mailer-plus (#${node.id}) attachment file not found: ${att.path}`);
      }
    }
    let finalHtml = html;
    let inlineAttachments = [];
    if (contentType === "html" && html) {
      const embedded = await embedInlineImages(html);
      finalHtml = embedded.html;
      inlineAttachments = embedded.inlineAttachments;
    }
    const allAttachments = [...attachments, ...inlineAttachments];
    processor.logger.info(`mailer-plus (#${node.id}) attachments: ${attachments.length} file(s), ${inlineAttachments.length} inline image(s)`);
    const payload = {
      ...options,
      ...contentType === "html" ? { html: finalHtml } : { text },
      subject: subject == null ? void 0 : subject.trim(),
      to: to ? to.flat().map((item) => item == null ? void 0 : item.trim()).filter(Boolean) : void 0,
      cc: cc ? cc.flat().map((item) => item == null ? void 0 : item.trim()).filter(Boolean) : null,
      bcc: bcc ? bcc.flat().map((item) => item == null ? void 0 : item.trim()).filter(Boolean) : null,
      ...allAttachments.length ? { attachments: allAttachments } : {}
    };
    if (sync) {
      try {
        const result = await send(payload);
        return {
          status: import_plugin_workflow.JOB_STATUS.RESOLVED,
          result: {
            messageId: result.messageId,
            accepted: result.accepted,
            rejected: result.rejected,
            attachmentCount: allAttachments.length
          }
        };
      } catch (error) {
        return {
          status: ignoreFail ? import_plugin_workflow.JOB_STATUS.RESOLVED : import_plugin_workflow.JOB_STATUS.FAILED,
          result: { error: error.message }
        };
      }
    }
    const { id } = processor.saveJob({
      status: import_plugin_workflow.JOB_STATUS.PENDING,
      nodeId: node.id,
      nodeKey: node.key,
      upstreamId: (prevJob == null ? void 0 : prevJob.id) ?? null
    });
    await processor.exit();
    const jobDone = { status: import_plugin_workflow.JOB_STATUS.PENDING };
    try {
      const response = await send(payload);
      processor.logger.info(`mailer-plus (#${node.id}) sent successfully.`);
      jobDone.status = import_plugin_workflow.JOB_STATUS.RESOLVED;
      jobDone.result = {
        messageId: response.messageId,
        accepted: response.accepted,
        rejected: response.rejected,
        attachmentCount: attachments.length
      };
    } catch (error) {
      processor.logger.warn(`mailer-plus (#${node.id}) sent failed: ${error.message}`);
      jobDone.status = import_plugin_workflow.JOB_STATUS.FAILED;
      jobDone.result = { error: error.message };
    } finally {
      processor.logger.debug(`mailer-plus (#${node.id}) sending ended, resume workflow...`);
      const job = await this.workflow.app.db.getRepository("jobs").findOne({
        filterByTk: id
      });
      job.set(jobDone);
      this.workflow.resume(job);
    }
  }
  async resume(node, job, processor) {
    const { ignoreFail } = node.config;
    if (ignoreFail) {
      job.set("status", import_plugin_workflow.JOB_STATUS.RESOLVED);
    }
    return job;
  }
}
