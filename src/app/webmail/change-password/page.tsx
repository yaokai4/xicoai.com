import Link from "next/link";
import { requireWebmail } from "@/app/webmail/_lib";
import { mustChangePassword } from "@/lib/webmail/password-policy";
import { ChangePasswordForm } from "./form";

export const dynamic = "force-dynamic";

export default async function ChangePasswordPage() {
  const { cred } = await requireWebmail();
  const forced = await mustChangePassword(cred.email);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-lg font-semibold tracking-tight">
            {forced ? "首次登录，请设置新密码" : "修改密码"}
          </h1>
          <p className="mt-1 text-sm text-muted">{cred.email}</p>
          {forced && (
            <p className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-300">
              为了账号安全，请把管理员分配的初始密码修改为你自己的密码。
            </p>
          )}
        </div>
        <ChangePasswordForm />
        {!forced && (
          <p className="mt-6 text-center text-xs">
            <Link href="/webmail" className="text-muted hover:text-foreground">
              ← 返回邮箱
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
