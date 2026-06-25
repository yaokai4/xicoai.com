import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { applications } from "@/db/schema";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!(await verifySession(token))) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const rows = await getDb()
    .select()
    .from(applications)
    .where(eq(applications.id, Number(id)))
    .limit(1);
  const a = rows[0];
  if (!a?.resumePath) return new NextResponse("Not found", { status: 404 });

  const dir = path.resolve(process.env.UPLOAD_DIR || "./uploads");
  const filePath = path.resolve(dir, a.resumePath);
  if (!filePath.startsWith(dir + path.sep)) {
    return new NextResponse("Bad request", { status: 400 });
  }

  try {
    const data = await fs.readFile(filePath);
    const filename = encodeURIComponent(a.resumeName || a.resumePath);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
      },
    });
  } catch {
    return new NextResponse("File missing", { status: 404 });
  }
}
