import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import QRCode from "qrcode";
import { getDb } from "@/db";
import { macLicenses } from "@/db/schema";
import { adminSession } from "@/lib/admin-auth";
import { decryptKey, formatKey } from "@/lib/license/keys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin-only QR for an issued activation key. Encodes the public activation
 * guide URL (key embedded) — scanning lands on a page with the key, the
 * download link and the 3-step activation walkthrough. Print it on 卡密 cards.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await adminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const licenseId = Number(id);
  if (!Number.isInteger(licenseId)) {
    return NextResponse.json({ error: "bad id" }, { status: 400 });
  }

  const rows = await getDb()
    .select({ enc: macLicenses.keyEncrypted })
    .from(macLicenses)
    .where(eq(macLicenses.id, licenseId))
    .limit(1);
  if (!rows[0]) return NextResponse.json({ error: "not found" }, { status: 404 });

  const key = formatKey(decryptKey(rows[0].enc));
  const base = process.env.NEXT_PUBLIC_MAC_URL || "https://mac.xicoai.com";
  const url = `${base}/activate?key=${encodeURIComponent(key)}`;

  const svg = await QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 2,
    width: 320,
  });

  return new NextResponse(svg, {
    headers: {
      "content-type": "image/svg+xml",
      "cache-control": "no-store",
    },
  });
}
