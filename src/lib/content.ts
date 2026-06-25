import type { L10n, L10nList } from "@/db/schema";

/** Pick a localized string with graceful fallback to zh → ja → en. */
export function pickL10n(
  value: L10n | null | undefined,
  locale: string,
): string {
  if (!value) return "";
  const key = locale as keyof L10n;
  return value[key] || value.zh || value.ja || value.en || "";
}

export function pickL10nList(
  value: L10nList | null | undefined,
  locale: string,
): string[] {
  if (!value) return [];
  const key = locale as keyof L10nList;
  return value[key] || value.zh || value.ja || value.en || [];
}
