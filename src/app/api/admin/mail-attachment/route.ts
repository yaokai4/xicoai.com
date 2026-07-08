import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { adminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Serve an inbound-mail attachment from the shared maildata volume.
 * Paths are the relative values stored by the mailer (attachments/<id>/<file>)
 * — anything escaping that root is rejected. Admin-only. */
export async function GET(req: Request) {
  if (!(await adminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const rel = new URL(req.url).searchParams.get("path") ?? "";
  const root = path.resolve(process.env.MAIL_DATA_DIR || "/maildata");
  const abs = path.resolve(root, rel);
  if (!abs.startsWith(root + path.sep) || !rel.startsWith("attachments/")) {
    return NextResponse.json({ error: "bad path" }, { status: 400 });
  }
  try {
    const data = await fs.promises.readFile(abs);
    return new NextResponse(data, {
      headers: {
        "content-type": "application/octet-stream",
        "content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
          path.basename(abs),
        )}`,
        "cache-control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
