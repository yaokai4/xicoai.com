"use client";

import { useActionState } from "react";
import { saveJob, deleteJob, type ActionState } from "@/app/admin/actions";
import type { Job } from "@/db/schema";

const inputCls =
  "w-full rounded-lg border border-border bg-white/[0.02] px-3 py-2 text-sm text-foreground outline-none focus:border-brand/60";

export function JobForm({ job }: { job?: Job }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    saveJob,
    {},
  );

  return (
    <form action={action} className="flex flex-col gap-8">
      {job && <input type="hidden" name="id" value={job.id} />}

      <Section title="基本信息">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Slug（URL，英文）">
            <input
              name="slug"
              required
              defaultValue={job?.slug}
              className={inputCls}
              placeholder="senior-fullstack-engineer"
            />
          </Field>
          <Field label="团队 / 部门">
            <input name="team" defaultValue={job?.team ?? ""} className={inputCls} />
          </Field>
          <Field label="雇佣类型">
            <select
              name="employmentType"
              defaultValue={job?.employmentType ?? "full_time"}
              className={inputCls}
            >
              <option value="full_time">全职</option>
              <option value="part_time">兼职</option>
              <option value="intern">实习</option>
              <option value="partner">合伙人</option>
              <option value="contract">合同</option>
            </select>
          </Field>
          <Field label="状态">
            <select
              name="status"
              defaultValue={job?.status ?? "draft"}
              className={inputCls}
            >
              <option value="draft">草稿</option>
              <option value="open">开放（公开可见）</option>
              <option value="closed">关闭</option>
            </select>
          </Field>
          <Field label="排序（越小越靠前）">
            <input
              name="sortOrder"
              type="number"
              defaultValue={job?.sortOrder ?? 0}
              className={inputCls}
            />
          </Field>
          <label className="flex items-center gap-2 self-end pb-2 text-sm text-muted">
            <input
              type="checkbox"
              name="remote"
              defaultChecked={job?.remote ?? false}
            />
            支持远程
          </label>
        </div>
      </Section>

      <L10nField label="职位名称" base="title" job={job} field="title" required />
      <L10nField label="地点" base="location" job={job} field="location" />
      <L10nField label="一句话摘要" base="summary" job={job} field="summary" />
      <L10nTextarea
        label="职位描述（段落用空行分隔）"
        base="description"
        job={job}
        field="description"
      />
      <L10nTextarea
        label="任职要求（每行一条）"
        base="requirements"
        job={job}
        field="requirements"
        list
      />

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-bg transition-transform hover:scale-[1.03] disabled:opacity-50"
        >
          {pending ? "保存中…" : "保存"}
        </button>
        {job && (
          <button
            type="submit"
            formAction={deleteJob}
            className="rounded-full border border-border px-5 py-2.5 text-sm text-red-400 transition-colors hover:border-red-400/40"
          >
            删除
          </button>
        )}
      </div>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface/40 p-6">
      <h2 className="mb-4 text-sm font-medium text-muted">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-faint">{label}</span>
      {children}
    </div>
  );
}

function defVal(job: Job | undefined, field: keyof Job, lang: "zh" | "ja" | "en") {
  const v = job?.[field] as
    | { zh?: string; ja?: string; en?: string }
    | { zh?: string[]; ja?: string[]; en?: string[] }
    | null
    | undefined;
  const x = v?.[lang];
  if (Array.isArray(x)) return x.join("\n");
  return x ?? "";
}

function L10nField({
  label,
  base,
  job,
  field,
  required,
}: {
  label: string;
  base: string;
  job?: Job;
  field: keyof Job;
  required?: boolean;
}) {
  return (
    <Section title={label}>
      <div className="grid gap-3 sm:grid-cols-3">
        {(["zh", "ja", "en"] as const).map((lang) => (
          <Field key={lang} label={lang.toUpperCase()}>
            <input
              name={`${base}_${lang}`}
              required={required && lang === "zh"}
              defaultValue={defVal(job, field, lang)}
              className={inputCls}
            />
          </Field>
        ))}
      </div>
    </Section>
  );
}

function L10nTextarea({
  label,
  base,
  job,
  field,
  list,
}: {
  label: string;
  base: string;
  job?: Job;
  field: keyof Job;
  list?: boolean;
}) {
  return (
    <Section title={label}>
      <div className="grid gap-3 lg:grid-cols-3">
        {(["zh", "ja", "en"] as const).map((lang) => (
          <Field key={lang} label={lang.toUpperCase()}>
            <textarea
              name={`${base}_${lang}`}
              rows={list ? 4 : 6}
              defaultValue={defVal(job, field, lang)}
              className={`${inputCls} resize-y`}
            />
          </Field>
        ))}
      </div>
    </Section>
  );
}
