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
const VERSION = "0.3.0";
const PUBDATE = "Thu, 10 Jul 2026 14:00:00 +0000";
const NOTES =
  "0.3.0：顶级化大版本——空间透镜「绽放」钻取动画与收集篮两段式删除（5 秒可撤销）；菜单栏真「合并项」多仪表并排、电池项、三挡历史时间窗、面板可钉住、每进程流量排行；可解释健康分（每一分可溯源）；释放 iCloud 本地副本；阈值告警防误报；全新 4 步新手引导与「安全承诺」页；全站真材质与暗色高程重绘，菜单栏渲染换血更省电。需要 macOS 14 或更高版本。";

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
