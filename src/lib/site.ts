export const site = {
  name: "XICO",
  fullName: {
    zh: "长沙智希可科技有限公司",
    ja: "長沙智希可科技有限公司",
    en: "Changsha Xico Technology Co., Ltd.",
  },
  domain: "xicoai.com",
  url: "https://xicoai.com",
  email: "hi@xicoai.com",
} as const;

export const navItems = [
  { key: "home", href: "/" },
  { key: "work", href: "/work" },
  { key: "services", href: "/services" },
  { key: "blog", href: "/blog" },
  { key: "about", href: "/about" },
] as const;

/** Live product sites, keyed by work item. */
export const productUrls: Record<string, string> = {
  machi: "https://machicity.com",
  shangence: "https://shangence.com",
};
