import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The notarized DMG is dropped into the mounted uploads volume out-of-band
// (docker cp), so shipping a new build never requires a code change or bloats
// the repo. Lives under /api so the mac-subdomain proxy doesn't rewrite it.
const FILE = "Xico-Clean.dmg";

export async function GET() {
  const dir = process.env.UPLOAD_DIR || "./uploads";
  const filePath = path.join(dir, FILE);
  try {
    const data = await fs.readFile(filePath);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "content-type": "application/x-apple-diskimage",
        "content-disposition": `attachment; filename="${FILE}"`,
        "content-length": String(data.length),
        "cache-control": "public, max-age=300",
      },
    });
  } catch {
    return NextResponse.json({ error: "not_available" }, { status: 404 });
  }
}
