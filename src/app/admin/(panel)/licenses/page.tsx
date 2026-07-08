import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { macLicenses, macLicenseActivations, macOrders } from "@/db/schema";
import { GenerateForm, LicenseTable, type LicenseRow } from "./licenses-ui";

export const dynamic = "force-dynamic";

export default async function LicensesAdminPage() {
  const db = getDb();

  const rows = await db
    .select({
      id: macLicenses.id,
      licenseUid: macLicenses.licenseUid,
      keyLast4: macLicenses.keyLast4,
      plan: macLicenses.plan,
      seats: macLicenses.seats,
      status: macLicenses.status,
      source: macLicenses.source,
      note: macLicenses.note,
      email: macLicenses.email,
      createdAt: macLicenses.createdAt,
      orderNo: macOrders.orderNo,
      used: sql<number>`(
        SELECT count(*)::int FROM ${macLicenseActivations}
        WHERE ${macLicenseActivations.licenseId} = ${macLicenses.id}
      )`,
    })
    .from(macLicenses)
    .leftJoin(macOrders, eq(macLicenses.orderId, macOrders.id))
    .orderBy(desc(macLicenses.id))
    .limit(500);

  const licenses: LicenseRow[] = rows.map((r) => ({
    ...r,
    note: r.note ?? null,
    email: r.email ?? null,
    orderNo: r.orderNo ?? null,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          激活码
        </h1>
        <p className="mt-2 text-sm text-muted">
          激活码只有两个来源：用户付款自动签发（来源「购买」），或在这里手动生成（来源「手动」，
          用于卡密、线下渠道、送测）。个人版可激活 1 台 Mac，家庭版 5 台，用满后无法再激活新设备。
          吊销后立即拒绝新激活，已激活的 App 会在下次在线校验时失效。
        </p>
      </div>

      <GenerateForm />
      <LicenseTable licenses={licenses} />
    </div>
  );
}
