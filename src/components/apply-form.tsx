"use client";

import { useActionState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { submitApplication, type SubmitState } from "@/app/actions/submit";
import { TextField, TextArea, FileField, Honeypot } from "@/components/ui/form";
import { buttonClass, ArrowIcon } from "@/components/ui/button";
import { FormSuccess } from "@/components/form-success";

export function ApplyForm({ jobSlug }: { jobSlug?: string }) {
  const t = useTranslations("careers.form");
  const locale = useLocale();
  const [state, action, pending] = useActionState<SubmitState, FormData>(
    submitApplication,
    { ok: false },
  );

  if (state.ok) return <FormSuccess message={t("success")} />;

  return (
    <form action={action} className="flex flex-col gap-5">
      <Honeypot />
      <input type="hidden" name="jobSlug" value={jobSlug ?? ""} />
      <input type="hidden" name="locale" value={locale} />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="name" label={t("name")} required />
        <TextField name="email" label={t("email")} type="email" required />
      </div>
      <TextField name="phone" label={t("phone")} />
      <TextField name="links" label={t("links")} />
      <FileField
        name="resume"
        label={t("resume")}
        hint={t("resumeHint")}
        accept=".pdf,.doc,.docx"
      />
      <TextArea name="note" label={t("note")} rows={4} />

      {state.error && <p className="text-sm text-red-400">{t("error")}</p>}

      <button
        type="submit"
        disabled={pending}
        className={buttonClass("primary", "w-full sm:w-auto")}
      >
        {pending ? t("sending") : t("submit")}
        {!pending && <ArrowIcon />}
      </button>
    </form>
  );
}
