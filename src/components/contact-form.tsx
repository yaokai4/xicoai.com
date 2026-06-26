"use client";

import { useState, useActionState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { submitContact, type SubmitState } from "@/app/actions/submit";
import { TextField, TextArea, Honeypot } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormSuccess } from "@/components/form-success";

const PROJECT_TYPES = [
  "ai",
  "mobile",
  "web",
  "internal",
  "redesign",
  "other",
] as const;

export function ContactForm() {
  const t = useTranslations("contact.form");
  const locale = useLocale();
  const [ptype, setPtype] = useState<string>(PROJECT_TYPES[0]);
  const [state, action, pending] = useActionState<SubmitState, FormData>(
    submitContact,
    { ok: false },
  );

  if (state.ok) return <FormSuccess message={t("success") || t("note")} />;

  return (
    <form action={action} className="flex flex-col gap-5">
      <Honeypot />
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="topic" value={t(`projectTypes.${ptype}`)} />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="name" label={t("name")} required />
        <TextField name="email" label={t("email")} type="email" required />
      </div>
      <TextField name="company" label={t("company")} />

      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted">{t("projectType")}</span>
        <div className="flex flex-wrap gap-2">
          {PROJECT_TYPES.map((key) => (
            <button
              type="button"
              key={key}
              onClick={() => setPtype(key)}
              className={
                "rounded-full border px-4 py-2 text-sm transition-colors " +
                (ptype === key
                  ? "border-brand/50 bg-brand/10 text-foreground"
                  : "border-border text-muted hover:border-border-strong hover:text-foreground")
              }
            >
              {t(`projectTypes.${key}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="timeline" label={t("timeline")} />
        <TextField name="budget" label={t("budget")} />
      </div>

      <TextArea name="message" label={t("build")} rows={5} required />

      {state.error && <p className="text-sm text-red-400">{t("note")}</p>}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SubmitButton pending={pending}>{t("submit")}</SubmitButton>
        <p className="max-w-xs text-xs text-faint">{t("note2")}</p>
      </div>
    </form>
  );
}
