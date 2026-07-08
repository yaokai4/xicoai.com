import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sparkle-compatible appcast consumed by the app's UpdateChecker
 * (Info.plist SUFeedURL = https://mac.xicoai.com/appcast.xml). It picks the
 * highest-version <item> and compares to the installed CFBundleShortVersionString.
 *
 * To ship a new release: bump VERSION/PUBDATE/NOTES below and redeploy — users
 * on an older build will be told a new version is available and sent to the DMG.
 * Lives at a dotted path so the mac-subdomain proxy serves it verbatim.
 */
const VERSION = "0.2.7";
const PUBDATE = "Thu, 09 Jul 2026 04:00:00 +0000";
const NOTES =
  "0.2.7：正式接入在线授权体系——支持官网购买后输入激活码即时解锁 Pro；许可证增加定期在线校验（退款/失效的激活码将自动停用，正常用户离线使用不受任何影响）。";

export async function GET() {
  const base = (process.env.NEXT_PUBLIC_MAC_URL || "https://mac.xicoai.com").replace(
    /\/$/,
    "",
  );
  const dmg = `${base}/api/download/xico-clean`;
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:sparkle="http://www.andymatuschak.org/xml-namespaces/sparkle" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Xico Clean</title>
    <link>${base}/mac</link>
    <description>Xico Clean updates</description>
    <language>zh-CN</language>
    <item>
      <title>Xico Clean ${VERSION}</title>
      <sparkle:shortVersionString>${VERSION}</sparkle:shortVersionString>
      <sparkle:version>${VERSION}</sparkle:version>
      <description><![CDATA[${NOTES}]]></description>
      <pubDate>${PUBDATE}</pubDate>
      <link>${base}/mac</link>
      <enclosure url="${dmg}" sparkle:shortVersionString="${VERSION}" sparkle:version="${VERSION}" type="application/x-apple-diskimage" length="0" />
    </item>
  </channel>
</rss>`;
  return new NextResponse(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=600",
    },
  });
}
