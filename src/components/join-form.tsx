"use client";

import { useState, useActionState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { submitJoin, type SubmitState } from "@/app/actions/submit";
import { TextField, TextArea, Honeypot } from "@/components/ui/form";
import { buttonClass, ArrowIcon } from "@/components/ui/button";
import { FormSuccess } from "@/components/form-success";
import { cn } from "@/lib/utils";

const TYPES = ["investor", "partner", "collaborator"] as const;
type JoinType = (typeof TYPES)[number];

export function JoinForm() {
  const t = useTranslations("join");
  const tf = useTranslations("join.fields");
  const locale = useLocale();
  const [type, setType] = useState<JoinType>("investor");
  const [state, action, pending] = useActionState<SubmitState, FormData>(
    submitJoin,
    { ok: false },
  );

  return (
    <div className="flex flex-col gap-8">
      {/* identity tabs */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-surface/40 p-1.5">
        {TYPES.map((ty) => (
          <button
            key={ty}
            type="button"
            onClick={() => setType(ty)}
            className={cn(
              "flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
              type === ty
                ? "bg-foreground text-bg"
                : "text-muted hover:text-foreground",
            )}
          >
            {t(`tabs.${ty}`)}
          </button>
        ))}
      </div>

      <p className="text-sm text-muted">{t(`intro.${type}`)}</p>

      {state.ok ? (
        <FormSuccess message={tf("success")} />
      ) : (
        <form action={action} className="flex flex-col gap-5">
          <Honeypot />
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="locale" value={locale} />

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="name" label={tf("name")} required />
            <TextField name="email" label={tf("email")} type="email" required />
          </div>
          <TextField name="org" label={tf("org")} />

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="field1" label={tf(`${type}.field1`)} />
            <TextField name="field2" label={tf(`${type}.field2`)} />
          </div>
          <TextField name="field3" label={tf(`${type}.field3`)} />
          <TextField name="links" label={tf("links")} />
          <TextArea name="intro" label={tf("intro")} rows={4} />

          {state.error && <p className="text-sm text-red-400">{tf("error")}</p>}

          <button
            type="submit"
            disabled={pending}
            className={buttonClass("primary", "w-full sm:w-auto")}
          >
            {pending ? tf("sending") : tf("submit")}
            {!pending && <ArrowIcon />}
          </button>
        </form>
      )}
    </div>
  );
}
