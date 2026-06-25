"use client";

import { useState, useActionState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { submitContact, type SubmitState } from "@/app/actions/submit";
import { TextField, TextArea, Honeypot } from "@/components/ui/form";
import { buttonClass, ArrowIcon } from "@/components/ui/button";
import { FormSuccess } from "@/components/form-success";

const TOPIC_KEYS = ["collaboration", "consulting", "careers", "other"] as const;

export function ContactForm() {
  const t = useTranslations("contact.form");
  const locale = useLocale();
  const [topic, setTopic] = useState<string>(TOPIC_KEYS[0]);
  const [state, action, pending] = useActionState<SubmitState, FormData>(
    submitContact,
    { ok: false },
  );

  if (state.ok) return <FormSuccess message={t("success") || t("note")} />;

  return (
    <form action={action} className="flex flex-col gap-5">
      <Honeypot />
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="topic" value={t(`topics.${topic}`)} />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="name" label={t("name")} required />
        <TextField name="email" label={t("email")} type="email" required />
      </div>
      <TextField name="company" label={t("company")} />

      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted">{t("topic")}</span>
        <div className="flex flex-wrap gap-2">
          {TOPIC_KEYS.map((key) => (
            <button
              type="button"
              key={key}
              onClick={() => setTopic(key)}
              className={
                "rounded-full border px-4 py-2 text-sm transition-colors " +
                (topic === key
                  ? "border-brand/50 bg-brand/10 text-foreground"
                  : "border-border text-muted hover:border-border-strong hover:text-foreground")
              }
            >
              {t(`topics.${key}`)}
            </button>
          ))}
        </div>
      </div>

      <TextArea name="message" label={t("message")} rows={5} required />

      {state.error && <p className="text-sm text-red-400">{t("note")}</p>}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={pending}
          className={buttonClass("primary")}
        >
          {pending ? "…" : t("submit")}
          {!pending && <ArrowIcon />}
        </button>
        <p className="text-xs text-faint">{t("note")}</p>
      </div>
    </form>
  );
}
