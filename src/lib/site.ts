export const site = {
  name: "XICO",
  fullName: {
    zh: "长沙希可科技有限公司",
    ja: "長沙希可科技有限公司",
    en: "Changsha Xico Technology Co., Ltd.",
  },
  domain: "xicoai.com",
  url: "https://xicoai.com",
  email: "hello@xicoai.com",
} as const;

export const navItems = [
  { key: "work", href: "/#work" },
  { key: "services", href: "/services" },
  { key: "about", href: "/about" },
  { key: "careers", href: "/careers" },
  { key: "contact", href: "/contact" },
] as const;
