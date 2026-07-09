import { NextResponse } from "next/server";
import { getWebmailCredentials } from "@/lib/webmail/session";
import { jmapSession, fetchBlob } from "@/lib/webmail/jmap";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Streams an attachment to the browser using the logged-in user's own
 * credentials — a user can only download blobs their session can read. */
export async function GET(req: Request) {
  const cred = await getWebmailCredentials();
  if (!cred) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const session = await jmapSession(cred);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const blobId = url.searchParams.get("blob") ?? "";
  const name = url.searchParams.get("name") ?? "attachment";
  const type = url.searchParams.get("type") ?? "application/octet-stream";
  if (!blobId) return NextResponse.json({ error: "bad request" }, { status: 400 });

  const blob = await fetchBlob(cred, session, blobId, name, type);
  if (!blob) return NextResponse.json({ error: "not found" }, { status: 404 });

  return new NextResponse(blob.bytes, {
    headers: {
      "content-type": type,
      "content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
      "cache-control": "private, no-store",
    },
  });
}
