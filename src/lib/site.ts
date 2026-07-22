export const site = {
  name: "XICO AI",
  brand: { en: "XICO AI", zh: "智希可", combined: "XICO AI｜智希可" },
  fullName: {
    zh: "智希可科技（广州）有限公司",
    "zh-Hant": "智希可科技（廣州）有限公司",
    ja: "智希可科技（広州）有限公司",
    en: "Zhixike Technology (Guangzhou) Co., Ltd.",
    ko: "Zhixike Technology (Guangzhou) Co., Ltd.",
    de: "Zhixike Technology (Guangzhou) Co., Ltd.",
    es: "Zhixike Technology (Guangzhou) Co., Ltd.",
    fr: "Zhixike Technology (Guangzhou) Co., Ltd.",
    it: "Zhixike Technology (Guangzhou) Co., Ltd.",
    pt: "Zhixike Technology (Guangzhou) Co., Ltd.",
    ru: "Zhixike Technology (Guangzhou) Co., Ltd.",
  },
  domain: "xicoai.com",
  url: "https://xicoai.com",
  email: "hi@xicoai.com",
} as const;

export const navItems = [
  { key: "home", href: "/" },
  { key: "work", href: "/work" },
  { key: "mac", href: "/mac" },
  { key: "services", href: "/services" },
  { key: "blog", href: "/blog" },
  { key: "about", href: "/about" },
] as const;

/** Live product sites, keyed by work item. */
export const productUrls: Record<string, string> = {
  machi: "https://machicity.com",
  shangence: "https://shangence.com",
};

/** Products whose site lives inside this app, keyed by work item → route. */
export const productRoutes: Record<string, string> = {
  xicoclean: "/mac",
};
