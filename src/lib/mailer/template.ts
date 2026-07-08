import "server-only";

/**
 * Branded HTML email wrapper. Body text is plain text: blank lines become
 * paragraph breaks, single newlines become <br>, http(s) URLs become links.
 * Marketing mail MUST pass `unsubscribeUrl` (also emitted as List-Unsubscribe
 * by the worker); transactional mail omits it.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function linkify(escaped: string): string {
  return escaped.replace(
    /(https?:\/\/[^\s<]+)/g,
    (m) => `<a href="${m}" style="color:#6d5cff;text-decoration:none;">${m}</a>`,
  );
}

function paragraphs(text: string): string {
  return text
    .trim()
    .split(/\n{2,}/)
    .map(
      (p) =>
        `<p style="margin:0 0 16px;line-height:1.7;">${linkify(
          escapeHtml(p),
        ).replace(/\n/g, "<br>")}</p>`,
    )
    .join("");
}

const UNSUB_LABEL: Record<string, string> = {
  zh: "退订此类邮件",
  "zh-Hant": "退訂此類郵件",
  ja: "配信停止",
  ko: "수신 거부",
  de: "Abbestellen",
  es: "Cancelar suscripción",
  fr: "Se désabonner",
  it: "Annulla iscrizione",
  pt: "Cancelar inscrição",
  ru: "Отписаться",
  en: "Unsubscribe",
};

export function renderEmailHtml(opts: {
  title: string;
  bodyText: string;
  locale?: string | null;
  unsubscribeUrl?: string | null;
}): string {
  const unsubLabel = UNSUB_LABEL[opts.locale ?? "zh"] ?? UNSUB_LABEL.en;
  const footer = opts.unsubscribeUrl
    ? `<p style="margin:24px 0 0;font-size:12px;color:#8b8b96;">
         <a href="${opts.unsubscribeUrl}" style="color:#8b8b96;">${unsubLabel}</a>
       </p>`
    : "";

  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#f5f5f7;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'PingFang SC','Hiragino Sans',sans-serif;color:#1d1d1f;">
    <div style="padding:8px 0 20px;">
      <span style="font-size:18px;font-weight:700;letter-spacing:-0.02em;">Xico&nbsp;Clean</span>
    </div>
    <div style="background:#ffffff;border-radius:16px;padding:32px 28px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
      <h1 style="margin:0 0 20px;font-size:20px;font-weight:600;letter-spacing:-0.01em;">${escapeHtml(
        opts.title,
      )}</h1>
      ${paragraphs(opts.bodyText)}
    </div>
    <div style="padding:20px 4px 0;font-size:12px;color:#8b8b96;line-height:1.6;">
      <p style="margin:0;">Xico Clean · <a href="https://mac.xicoai.com" style="color:#8b8b96;">mac.xicoai.com</a></p>
      ${footer}
    </div>
  </div>
</body>
</html>`;
}
