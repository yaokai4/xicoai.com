import "server-only";

import { sendMail, notifyAddress } from "@/lib/mail";
import { isZeroDecimal } from "@/lib/pricing";
import type { MacLicensePlan } from "@/db/schema";

const PLAN_LABEL: Record<MacLicensePlan, string> = {
  personal: "个人版 / Personal",
  family: "家庭版 / Family",
};

/** Emails the buyer their activation key. No-op if SMTP is unconfigured. */
export async function sendKeyEmail(opts: {
  to: string;
  key: string;
  plan: MacLicensePlan;
  orderNo: string;
}) {
  const { to, key, plan, orderNo } = opts;
  const label = PLAN_LABEL[plan];
  const buyUrl = process.env.NEXT_PUBLIC_MAC_URL || "https://mac.xicoai.com";
  const activateUrl = `${buyUrl}/activate?key=${encodeURIComponent(key)}`;
  const text = [
    "感谢购买 希可Mac清理！/ Thank you for buying Xico Clean!",
    "",
    `套餐 / Plan: ${label}`,
    `激活码 / Activation key: ${key}`,
    `订单号 / Order: ${orderNo}`,
    "",
    "如何激活 / How to activate:",
    "1. 打开 希可Mac清理，进入「设置 / 升级 Pro」。",
    "   Open Xico Clean → Settings / Upgrade to Pro.",
    "2. 粘贴上面的激活码并点「激活」。",
    "   Paste the key above and click Activate.",
    "",
    `激活引导页 / Activation guide: ${activateUrl}`,
    `下载 / Download: ${buyUrl}/`,
  ].join("\n");
  await sendMail({
    to,
    subject: `你的 希可Mac清理 激活码 / Your Xico Clean activation key`,
    text,
  });
}

/** Optional internal ping so the owner sees each sale. No-op without SMTP. */
export async function notifySale(opts: {
  plan: MacLicensePlan;
  email?: string | null;
  orderNo: string;
  amount: number;
  currency: string;
}) {
  await sendMail({
    to: notifyAddress(),
    subject: `希可Mac清理 售出：${PLAN_LABEL[opts.plan]}`,
    text: [
      `套餐 / Plan: ${PLAN_LABEL[opts.plan]}`,
      `金额 / Amount: ${opts.currency} ${
        isZeroDecimal(opts.currency) ? opts.amount : (opts.amount / 100).toFixed(2)
      }`,
      `邮箱 / Email: ${opts.email ?? "(未提供)"}`,
      `订单号 / Order: ${opts.orderNo}`,
    ].join("\n"),
  });
}
