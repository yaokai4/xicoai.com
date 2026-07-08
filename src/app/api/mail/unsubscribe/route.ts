import { NextResponse } from "next/server";
import { unsubscribeByToken } from "@/lib/mailer/subscribers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function page(title: string, body: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;display:flex;min-height:100vh;align-items:center;justify-content:center;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif;">
<div style="text-align:center;padding:40px;"><h1 style="font-size:20px;color:#1d1d1f;">${title}</h1><p style="color:#6e6e73;font-size:14px;">${body}</p></div>
</body></html>`;
}

/** One-click unsubscribe (linked from every marketing email footer). */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const ok = await unsubscribeByToken(token);
  const html = ok
    ? page("退订成功 / Unsubscribed", "你将不再收到我们的营销邮件。You will no longer receive marketing emails from us.")
    : page("链接无效 / Invalid link", "退订链接无效或已过期。This unsubscribe link is invalid or expired.");
  return new NextResponse(html, {
    status: ok ? 200 : 400,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

/** RFC 8058 List-Unsubscribe=One-Click POST support. */
export async function POST(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const ok = await unsubscribeByToken(token);
  return NextResponse.json({ ok }, { status: ok ? 200 : 400 });
}
