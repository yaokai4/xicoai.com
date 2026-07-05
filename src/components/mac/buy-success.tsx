"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Band, Wrap } from "@/components/mac/mac-ui";
import { Link } from "@/i18n/navigation";
import { CheckGlyph } from "@/components/mac/icons";

type Phase = "waiting" | "ready" | "timeout";

const POLL_MS = 2500;
const MAX_TRIES = 28; // ~70s

export function BuySuccess({ orderNo }: { orderNo: string | null }) {
  const t = useTranslations("mac.buySuccess");
  const [phase, setPhase] = useState<Phase>(orderNo ? "waiting" : "timeout");
  const [key, setKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const tries = useRef(0);

  const poll = useCallback(async () => {
    if (!orderNo) return;
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderNo)}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = (await res.json()) as { status: string; key: string | null };
        if (data.status === "paid" && data.key) {
          setKey(data.key);
          setPhase("ready");
          return true;
        }
      }
    } catch {
      /* transient — keep trying */
    }
    return false;
  }, [orderNo]);

  useEffect(() => {
    if (!orderNo) return;
    let stopped = false;
    const tick = async () => {
      if (stopped) return;
      const done = await poll();
      if (done || stopped) return;
      tries.current += 1;
      if (tries.current >= MAX_TRIES) {
        setPhase("timeout");
        return;
      }
      setTimeout(tick, POLL_MS);
    };
    tick();
    return () => {
      stopped = true;
    };
  }, [orderNo, poll]);

  const digits = key ? key.replace(/\D/g, "") : "";

  async function copy() {
    if (!key) return;
    try {
      await navigator.clipboard.writeText(key);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <Band tone="surface" className="pt-32 pb-24 sm:pt-40 sm:pb-32">
      <Wrap className="max-w-xl">
        <div className="rounded-[2rem] border border-border bg-bg p-8 text-center sm:p-10">
          {phase === "waiting" && (
            <>
              <Spinner />
              <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight text-foreground">
                {t("waitingTitle")}
              </h1>
              <p className="mt-2 text-sm text-muted">{t("waitingNote")}</p>
            </>
          )}

          {phase === "ready" && (
            <>
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent">
                <CheckGlyph className="h-6 w-6" />
              </span>
              <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight text-foreground">
                {t("paidTitle")}
              </h1>
              <p className="mt-2 text-sm text-muted">{t("paidNote")}</p>

              <div className="mt-8 rounded-2xl border border-border bg-surface p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-faint">
                  {t("keyLabel")}
                </p>
                <p className="mt-2 select-all font-mono text-xl font-semibold tracking-wide text-foreground">
                  {key}
                </p>
                <button
                  type="button"
                  onClick={copy}
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
                >
                  {copied ? t("copied") : t("copy")}
                </button>
              </div>

              <a
                href={`xico://activate?key=${digits}`}
                className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-brand/40 bg-brand/10 px-5 py-3 text-sm font-medium text-brand transition-colors hover:bg-brand/15"
              >
                {t("openApp")}
              </a>
              <p className="mt-4 text-sm text-muted text-pretty">{t("manualNote")}</p>
              <p className="mt-2 text-xs text-faint text-pretty">{t("emailNote")}</p>
            </>
          )}

          {phase === "timeout" && (
            <>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                {t("timeoutTitle")}
              </h1>
              <p className="mt-2 text-sm text-muted text-pretty">{t("timeoutNote")}</p>
              {orderNo && (
                <p className="mt-4 text-xs text-faint">
                  {t("orderLabel")}: <span className="font-mono">{orderNo}</span>
                </p>
              )}
            </>
          )}

          <div className="mt-8">
            <Link
              href="/mac"
              className="text-sm text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              {t("backHome")}
            </Link>
          </div>
        </div>
      </Wrap>
    </Band>
  );
}

function Spinner() {
  return (
    <span className="mx-auto flex h-12 w-12 items-center justify-center">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand" />
    </span>
  );
}
