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

/**
 * Legal / business-registration facts, transcribed from the company's PRC
 * business license (营业执照). Single source of truth for the footer, the About
 * page's company block and the Organization JSON-LD. Do not fabricate — every
 * value here must match the licence on file. Chinese/English variants let CJK
 * locales show the official Chinese wording while Latin locales get a gloss.
 */
export const registration = {
  /** 统一社会信用代码 — verifiable at gsxt.gov.cn. */
  creditCode: "91440115MAKHLQ4BXL",
  /** 法定代表人. */
  legalRep: { zh: "姚凯", en: "Yao Kai" },
  /** 成立日期 (ISO). */
  established: "2026-07-24",
  /** 注册资本. */
  capital: { zh: "人民币 50 万元", en: "CNY 500,000" },
  /** 登记机关. */
  authority: {
    zh: "广州市南沙区市场监督管理局",
    en: "Nansha District Administration for Market Regulation, Guangzhou",
  },
  /** 经营范围. */
  businessScope: {
    zh: "软件和信息技术服务业",
    en: "Software and information technology services",
  },
  /** 住所 / 注册地址. */
  address: {
    zh: "广州市南沙区南沙街广生路19号（自编1栋）4楼410室215A",
    en: "Rm 215A, Rm 410, 4/F, Bldg 1, No. 19 Guangsheng Rd, Nansha, Guangzhou, Guangdong, China",
  },
  /** 国家企业信用信息公示系统 — the official verification entry printed on the licence. */
  verifyUrl: "https://www.gsxt.gov.cn/",
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
