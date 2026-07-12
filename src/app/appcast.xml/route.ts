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
const VERSION = "0.4.0";
const PUBDATE = "Mon, 13 Jul 2026 06:00:00 +0000";
const NOTES =
  "0.4.0：全新「服务器」远程 SSH 监控套件（无需装 agent 实时监控 CPU/内存/磁盘/网络/进程、交互式终端、SFTP 文件浏览、阈值告警与推送、端口转发、跳板机、导入 ~/.ssh/config、菜单栏迷你监视、Docker/systemd 容器管理）；全新「下载器」（1000+ 站点视频/音频、内置浏览抓取、剪贴板自动捕获、磁力/种子多线程下载、图片批量抓取）。需要 macOS 14 或更高版本。";

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
