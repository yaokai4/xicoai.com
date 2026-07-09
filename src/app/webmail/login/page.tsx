import { getWebmailCredentials } from "@/lib/webmail/session";
import { jmapSession } from "@/lib/webmail/jmap";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function WebmailLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string }>;
}) {
  const { expired } = await searchParams;
  // Already signed in? Skip to the inbox.
  const cred = await getWebmailCredentials();
  if (cred && (await jmapSession(cred))) redirect("/webmail");

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2">
            <span className="text-xl font-semibold tracking-tight">
              智希可科技邮箱系统
            </span>
          </div>
        </div>
        <LoginForm expired={Boolean(expired)} />
        <p className="mt-6 text-center text-xs text-faint">
          忘记密码？请联系管理员重置。
        </p>
      </div>
    </div>
  );
}
