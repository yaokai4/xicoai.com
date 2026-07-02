"use client";

import { useActionState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { submitWaitlist, type SubmitState } from "@/app/actions/submit";
import { Honeypot } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormSuccess } from "@/components/form-success";

export function WaitlistForm({ source = "hero" }: { source?: string }) {
  const t = useTranslations("mac.waitlist");
  const tf = useTranslations("mac.waitlist.fields");
  const locale = useLocale();
  const [state, action, pending] = useActionState<SubmitState, FormData>(
    submitWaitlist,
    { ok: false },
  );

  if (state.ok) {
    return <FormSuccess message={tf("success")} />;
  }

  return (
    <form action={action} className="flex w-full flex-col gap-3">
      <Honeypot />
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="locale" value={locale} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor={`wl-email-${source}`} className="sr-only">
          {tf("email")}
        </label>
        <input
          id={`wl-email-${source}`}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={tf("placeholder")}
          className="w-full flex-1 rounded-full border border-border bg-white/[0.03] px-5 py-3.5 text-foreground outline-none transition-colors placeholder:text-faint hover:border-border-strong focus:border-brand/60"
        />
        <SubmitButton
          pending={pending}
          pendingLabel={tf("sending")}
          className="shrink-0 px-6 py-3.5"
        >
          {tf("submit")}
        </SubmitButton>
      </div>

      {state.error && (
        <p className="text-sm text-red-400">{tf("error")}</p>
      )}
      <p className="text-xs text-faint">{t("privacyNote")}</p>
    </form>
  );
}
