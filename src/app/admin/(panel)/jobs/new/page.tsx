import Link from "next/link";
import { JobForm } from "../job-form";

export const dynamic = "force-dynamic";

export default function NewJobPage() {
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
          新建职位
        </h1>
      </div>
      <JobForm />
    </div>
  );
}
