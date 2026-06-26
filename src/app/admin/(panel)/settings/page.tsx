import { getSettings } from "@/lib/settings";
import { SOCIAL_KEYS } from "@/lib/social";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const all = await getSettings();
  const initial: Record<string, string> = {};
  for (const k of SOCIAL_KEYS) initial[k] = all[`social_${k}`] ?? "";
  return <SettingsForm initial={initial} />;
}
