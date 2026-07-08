import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { mailSubscribers } from "@/db/schema";
import { ImportForm, SubscriberTable } from "./subscribers-ui";

export const dynamic = "force-dynamic";

export default async function SubscribersAdminPage() {
  const rows = await getDb()
    .select()
    .from(mailSubscribers)
    .orderBy(desc(mailSubscribers.id))
    .limit(1000);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          订阅者
        </h1>
        <p className="mt-2 text-sm text-muted">
          购买用户与等候名单会自动加入；也可手动导入。已退订的地址永远不会被营销邮件触达
          （交易邮件如激活码不受影响）。
        </p>
      </div>
      <ImportForm />
      <SubscriberTable
        subscribers={rows.map((r) => ({
          id: r.id,
          email: r.email,
          name: r.name,
          locale: r.locale,
          source: r.source,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
