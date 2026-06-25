import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { jobs } from "@/db/schema";
import { JobForm } from "../job-form";

export const dynamic = "force-dynamic";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rows = await getDb()
    .select()
    .from(jobs)
    .where(eq(jobs.id, Number(id)))
    .limit(1);
  const job = rows[0];
  if (!job) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/admin/jobs"
          className="text-sm text-muted hover:text-foreground"
        >
          ← 返回职位列表
        </Link>
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">
          编辑职位
        </h1>
      </div>
      <JobForm job={job} />
    </div>
  );
}
