import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { logoutAction } from "@/app/admin/actions";
import { Logo } from "@/components/brand/logo";

const NAV = [
  { href: "/admin", label: "概览" },
  { href: "/admin/licenses", label: "激活码" },
  { href: "/admin/pricing", label: "定价" },
  { href: "/admin/mail", label: "收件箱" },
  { href: "/admin/mail/campaigns", label: "营销邮件" },
  { href: "/admin/mail/subscribers", label: "订阅者" },
  { href: "/admin/posts", label: "文章" },
  { href: "/admin/jobs", label: "职位" },
  { href: "/admin/applications", label: "投递" },
  { href: "/admin/join", label: "Join 提交" },
  { href: "/admin/waitlist", label: "等候名单" },
  { href: "/admin/messages", label: "联系表单" },
  { href: "/admin/settings", label: "社交链接" },
];

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  if (!session) redirect("/admin/login");

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-8 lg:flex-row lg:gap-12 lg:py-12">
      <aside className="lg:w-52 lg:shrink-0">
        <div className="lg:sticky lg:top-12">
          <Link href="/admin" className="inline-block">
            <Logo wordmark="智希可" />
          </Link>
          <nav className="mt-8 flex flex-wrap gap-1 lg:flex-col">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-white/5 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={logoutAction} className="mt-8">
            <button
              type="submit"
              className="rounded-lg px-3 py-2 text-sm text-faint transition-colors hover:text-foreground"
            >
              退出登录
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
