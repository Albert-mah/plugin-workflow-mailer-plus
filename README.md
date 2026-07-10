# @nocobase/plugin-workflow-node-mailer-plus

**Mailer Plus — workflow email node with attachments and inline images for NocoBase.** An enhanced alternative to the built-in `mailer` node: same familiar SMTP/recipient/content config, plus the two things everyone ends up needing — **file attachments** and **HTML images that actually display in Gmail**. Coexists with the built-in node (`mailer` vs `mailer-plus` types).

## Features

| Capability | built-in `mailer` | `mailer-plus` |
|---|---|---|
| SMTP config / recipients / subject / content | ✅ | ✅ (same UI) |
| **Attachments** | ❌ | ✅ NocoBase attachment fields / URLs / inline text |
| **HTML `<img>` auto CID inlining** | ❌ | ✅ base64 / local storage / external URLs |
| Result exposed to downstream nodes | ❌ | ✅ `messageId` / `accepted` / `rejected` / `attachmentCount` |

### Attachments — smart input resolution

Each attachment item may be:

- a NocoBase **attachment field** variable (`{{$context.data.fileField}}`, arrays expand)
- a **URL** string (`https://.../report.pdf`)
- a local storage path (`/storage/uploads/x.pdf`)
- `{filename, url}` or `{filename, content}` objects (inline text content)

Regular attachments are sent with explicit `contentDisposition: attachment`, so they are never swallowed into the inline-image MIME part.

### HTML image CID inlining

Gmail and most clients refuse `<img src="data:...">` and can't fetch login-protected internal URLs. When HTML content is enabled, `mailer-plus` scans `<img src>` — base64 data URIs are decoded, `/storage/uploads/...` files are read from disk, external URLs are downloaded — and every image is embedded as a proper `cid:` inline attachment inside `multipart/related`, so it renders everywhere.

## Install

```bash
git clone https://github.com/Albert-mah/plugin-workflow-node-mailer-plus \
  packages/plugins/@nocobase/plugin-workflow-node-mailer-plus
yarn install
yarn pm add @nocobase/plugin-workflow-node-mailer-plus
yarn pm enable @nocobase/plugin-workflow-node-mailer-plus
```

## Output (for downstream nodes)

```json
{
  "messageId": "<xxx@example.com>",
  "accepted": ["a@example.com"],
  "rejected": [],
  "attachmentCount": 3
}
```

## Compatibility

Tested on NocoBase `2.1.x` and `2.2.0-beta.10` — full SMTP send verified including mixed regular + CID inline attachments (correct `multipart/mixed` + `multipart/related` MIME structure).

## License

Apache-2.0

---

## 中文

NocoBase 工作流**邮件增强节点**：在内置 mailer 的同款配置上增加**附件**（附件字段变量 / URL / 本地路径 / 内联文本，自动识别展开）与 **HTML 图片自动 CID 内联**（base64 / 本地存储 / 外链统统转成 `cid:` 内嵌，Gmail 也能正常显示），发送结果（messageId/accepted/rejected/attachmentCount）暴露给下游节点。与内置 mailer 共存互不影响。已在 2.1.x 与 2.2.0-beta.10 实测（含普通附件 + 内联图混合的 MIME 结构验证）。
