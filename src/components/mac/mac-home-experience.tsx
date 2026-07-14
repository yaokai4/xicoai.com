"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Download CTAs intentionally hit a file API route. */
import { useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type FeatureMoment = {
  label: string;
  eyebrow: string;
  title: string;
  desc: string;
  points: string[];
  image: string;
  alt: string;
  metric: string;
  metricLabel: string;
};

type EditorialFeature = {
  image: string;
  title: string;
  description: string;
  detail: string;
};

const HERO_SHOTS = [
  { image: "system-junk.png", className: "xico-hero-shot xico-hero-shot--far" },
  { image: "space-lens.png", className: "xico-hero-shot xico-hero-shot--back" },
  { image: "servers.png", className: "xico-hero-shot xico-hero-shot--mid" },
  { image: "smart-scan.png", className: "xico-hero-shot xico-hero-shot--front" },
];

const ease = [0.16, 1, 0.3, 1] as const;

function Screenshot({
  src,
  alt,
  className,
  eager = false,
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  return (
    <figure className={cn("overflow-hidden rounded-[22px] border border-black/[0.08] bg-white shadow-[0_28px_80px_-34px_rgba(50,44,110,0.42)]", className)}>
      {/* These are captures from the actual native SwiftUI product. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={1080}
        height={734}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        decoding="async"
        className="block h-auto w-full"
      />
    </figure>
  );
}

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-90px" }}
      transition={{ duration: 0.78, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6f63e9]">
        {eyebrow}
      </p>
      <h2 className="mt-4 font-display text-[clamp(2.2rem,5vw,4.9rem)] font-semibold leading-[1.02] tracking-[-0.055em] text-[#0a0c11] text-balance">
        {title}
      </h2>
      {description ? (
        <p className="mt-6 max-w-2xl text-[17px] leading-8 text-[#666d7b] sm:text-[19px]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function EditorialFeatureCollection({
  eyebrow,
  title,
  description,
  features,
  tone = "white",
}: {
  eyebrow: string;
  title: string;
  description: string;
  features: EditorialFeature[];
  tone?: "white" | "pearl";
}) {
  const [lead, ...rest] = features;
  return (
    <section className={cn("px-4 py-28 sm:px-8 sm:py-40", tone === "white" ? "bg-white" : "bg-[#f7f8fc]")}>
      <div className="mx-auto max-w-[1380px]">
        <Reveal>
          <SectionHeading eyebrow={eyebrow} title={title} description={description} />
        </Reveal>

        <Reveal className="mt-16 overflow-hidden rounded-[28px] border border-black/[0.06] bg-[#f7f7fb] shadow-[0_34px_90px_-60px_rgba(60,48,140,.46)] sm:rounded-[40px]">
          <article className="grid items-center gap-9 px-5 pb-5 pt-10 sm:px-9 sm:pb-9 lg:grid-cols-[0.7fr_1.3fr] lg:gap-14 lg:px-14 lg:py-14">
            <div className="px-2 lg:px-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#776be8]">{lead.detail}</p>
              <h3 className="mt-4 font-display text-[clamp(2rem,4vw,4rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-[#151722] text-balance">{lead.title}</h3>
              <p className="mt-5 max-w-xl text-[15px] leading-7 text-[#6d7380]">{lead.description}</p>
            </div>
            <Screenshot src={`/mac/product/live/${lead.image}`} alt={lead.title} />
          </article>
        </Reveal>

        <div className={cn("mt-5 grid gap-5", rest.length >= 3 ? "lg:grid-cols-3" : "md:grid-cols-2")}>
          {rest.map((feature, index) => (
            <Reveal key={feature.image} delay={index * 0.06}>
              <article className="flex h-full flex-col overflow-hidden rounded-[26px] border border-black/[0.06] bg-[#f7f7fb] px-5 pb-5 pt-8 sm:rounded-[32px] sm:px-7 sm:pb-7">
                <div className="px-1 pb-7">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8b82df]">{feature.detail}</p>
                  <h3 className="mt-3 font-display text-[clamp(1.7rem,2.7vw,2.7rem)] font-semibold leading-[1.04] tracking-[-0.045em] text-[#171922] text-balance">{feature.title}</h3>
                  <p className="mt-4 text-[14px] leading-6 text-[#747a87]">{feature.description}</p>
                </div>
                <Screenshot src={`/mac/product/live/${feature.image}`} alt={feature.title} className="mt-auto" />
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MacHomeExperience() {
  const locale = useLocale();
  const isZh = locale.startsWith("zh");
  const t = useTranslations("mac");
  const td = useTranslations("mac.deepdive");
  const tm = useTranslations("mac.monitor");
  const ts = useTranslations("mac.speed");
  const tp = useTranslations("mac.privacy");
  const tdownload = useTranslations("mac.download");
  const reduce = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroVisualY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 46]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.78], [1, 0.38]);
  const [activeFeature, setActiveFeature] = useState(0);

  const deepDive = td.raw("items") as {
    tag: string;
    title: string;
    desc: string;
    points: string[];
  }[];

  const moments: FeatureMoment[] = useMemo(
    () => [
      {
        label: deepDive[0].tag,
        eyebrow: deepDive[0].tag,
        title: deepDive[0].title,
        desc: deepDive[0].desc,
        points: deepDive[0].points,
        image: "/mac/product/live/smart-scan.png",
        alt: isZh ? "希可 Mac 智能扫描真实界面" : "Xico Smart Scan interface",
        metric: "55.32 GB",
        metricLabel: isZh ? "可安全释放" : "safely reclaimable",
      },
      {
        label: deepDive[1].tag,
        eyebrow: deepDive[1].tag,
        title: deepDive[1].title,
        desc: deepDive[1].desc,
        points: deepDive[1].points,
        image: "/mac/product/live/space-lens.png",
        alt: isZh ? "希可 Mac 空间透镜真实界面" : "Xico Space Lens interface",
        metric: "≈ 90s",
        metricLabel: isZh ? "整盘分析" : "full-disk analysis",
      },
      {
        label: tm("eyebrow"),
        eyebrow: tm("eyebrow"),
        title: tm("title"),
        desc: tm("desc"),
        points: tm.raw("points") as string[],
        image: "/mac/product/live/system-monitor.png",
        alt: isZh ? "希可 Mac 系统监视真实界面" : "Xico System Monitor interface",
        metric: "1s",
        metricLabel: isZh ? "实时刷新" : "live refresh",
      },
      {
        label: ts("eyebrow"),
        eyebrow: ts("eyebrow"),
        title: ts("title"),
        desc: ts("desc"),
        points: (ts.raw("points") as string[]).slice(0, 3),
        image: "/mac/product/live/disk-speed.png",
        alt: isZh ? "希可 Mac 磁盘测速真实界面" : "Xico Disk Speed interface",
        metric: "4K IOPS",
        metricLabel: isZh ? "专业级基准" : "professional benchmark",
      },
    ],
    [deepDive, isZh, tm, ts],
  );

  const cleaningFeatures: EditorialFeature[] = [
    {
      image: "system-junk.png",
      title: isZh ? "系统垃圾，清得明明白白。" : "System junk, made transparent.",
      description: isZh ? "缓存、日志、语言包和旧更新逐项列清，先看内容与大小，再决定要不要清。安全项目默认勾选，系统关键路径始终受到保护。" : "Caches, logs, language files, and old updates are listed before you clean, with protected system paths kept off limits.",
      detail: isZh ? "系统垃圾" : "System Junk",
    },
    {
      image: "uninstaller.png",
      title: isZh ? "卸载 App，不留尾巴。" : "Uninstall without leftovers.",
      description: isZh ? "应用本体、缓存、偏好、容器和登录项统一归档，让每一次卸载都完整、可控。" : "Remove the app together with its caches, preferences, containers, and login items.",
      detail: isZh ? "彻底卸载" : "Uninstaller",
    },
    {
      image: "app-updater.png",
      title: isZh ? "所有更新，一处看完。" : "Every update in one place.",
      description: isZh ? "集中检查已安装应用的新版本、当前版本与更新状态，不必逐个打开寻找。" : "Review versions and available updates for installed apps without opening them one by one.",
      detail: isZh ? "应用更新" : "App Updater",
    },
  ];

  const connectedFeatures: EditorialFeature[] = [
    {
      image: "downloader.png",
      title: isZh ? "下载，更干净也更安心。" : "Downloads, cleaner and safer.",
      description: isZh ? "媒体任务、文件状态与隔离检查放在一处，下载过程清晰可见。" : "Keep media tasks, file status, and quarantine checks together in one clear workflow.",
      detail: isZh ? "安全下载" : "Safe Downloads",
    },
    {
      image: "servers.png",
      title: isZh ? "远程服务器，也在 Xico 里。" : "Your remote servers, inside Xico.",
      description: isZh ? "管理主机、SSH、终端和 SFTP，把常用连接与运维入口收进同一套原生体验。" : "Manage hosts, SSH, terminal, and SFTP through one native workspace.",
      detail: isZh ? "服务器套件" : "Server Suite",
    },
    {
      image: "settings.png",
      title: isZh ? "主题与行为，都按你的方式。" : "Make it work your way.",
      description: isZh ? "外观、主题、权限与产品偏好集中管理，让专业工具也保持简单。" : "Control appearance, themes, permissions, and product preferences from one calm settings space.",
      detail: isZh ? "个性化设置" : "Settings",
    },
  ];

  const careFeatures: EditorialFeature[] = [
    {
      image: "optimization.png",
      title: isZh ? "把拖慢 Mac 的后台项目找出来。" : "Find what is slowing your Mac down.",
      description: isZh ? "管理登录项、后台代理与高资源进程，把系统优化从猜测变成清晰判断。" : "Review login items, background agents, and demanding processes with clear context.",
      detail: isZh ? "系统优化" : "Optimization",
    },
    {
      image: "maintenance.png",
      title: isZh ? "日常维护，一次完成。" : "Routine maintenance, in one pass.",
      description: isZh ? "维护脚本、Spotlight 索引、DNS 与系统任务集中执行，每一步都有明确状态。" : "Run maintenance scripts, rebuild Spotlight, refresh DNS, and track every task clearly.",
      detail: isZh ? "维护工具" : "Maintenance",
    },
    {
      image: "hardware.png",
      title: isZh ? "看见硬件真正的状态。" : "See the real state of your hardware.",
      description: isZh ? "电池健康、循环次数、温度、风扇与 SSD SMART 信息，专业但不复杂。" : "Battery health, cycles, thermals, fans, and SSD SMART data without the clutter.",
      detail: isZh ? "硬件健康" : "Hardware Health",
    },
    {
      image: "menu-bar-settings.png",
      title: isZh ? "重要信息，常驻菜单栏。" : "The essentials, always in the menu bar.",
      description: isZh ? "选择 CPU、内存、GPU、网络、磁盘、电池与温度模块，按自己的工作方式组合。" : "Choose CPU, memory, GPU, network, disk, battery, and thermal modules for your workflow.",
      detail: isZh ? "菜单栏监控" : "Menu Bar Monitoring",
    },
  ];

  const heroContainer: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
  };
  const heroItem: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.82, ease } },
  };

  return (
    <div className="xico-home bg-[#f8f9fd] text-[#0a0c11]">
      <section ref={heroRef} className="xico-hero relative min-h-[930px] overflow-hidden pt-28 sm:min-h-[940px] sm:pt-36 lg:min-h-[780px] lg:pt-28">
        <div aria-hidden className="xico-hero-glow xico-hero-glow--one" />
        <div aria-hidden className="xico-hero-glow xico-hero-glow--two" />
        <div aria-hidden className="xico-hero-orbit" />

        <div className="relative mx-auto grid w-full max-w-[1380px] gap-12 px-6 pb-20 sm:px-10 lg:min-h-[700px] lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-4 lg:px-12 xl:px-16">
          <motion.div style={{ y: heroTextY, opacity: heroOpacity }} variants={heroContainer} initial="hidden" animate="show" className="relative z-20 max-w-[610px] lg:pb-14">
            <motion.div variants={heroItem} className="inline-flex items-center gap-2 rounded-full border border-[#6d62e7]/20 bg-white/70 px-3 py-1.5 text-[12px] font-semibold tracking-[0.08em] text-[#665ae0] shadow-[0_10px_30px_-20px_rgba(75,62,190,0.5)] backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-[#42c8ad] shadow-[0_0_12px_rgba(66,200,173,0.8)]" />
              {t("badge")}
            </motion.div>

            <motion.p variants={heroItem} className="mt-8 text-[13px] font-semibold uppercase tracking-[0.16em] text-[#776be8]">
              {t("hero.eyebrow")}
            </motion.p>
            <motion.h1 variants={heroItem} className="mt-4 font-display text-[clamp(3rem,7.4vw,7rem)] font-semibold leading-[0.98] tracking-[-0.065em] text-[#050608] text-balance sm:text-[clamp(3.4rem,7.4vw,7rem)]">
              {isZh ? (
                <>让 Mac<br />回到最佳状态。</>
              ) : (
                <>{t("hero.titleLine1")}<br />{t("hero.titleLine2")}.</>
              )}
            </motion.h1>
            <motion.p variants={heroItem} className="mt-7 max-w-[590px] text-[17px] leading-8 text-[#666d79] sm:text-[19px]">
              {t("hero.subtitle")}
            </motion.p>

            <motion.div variants={heroItem} className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="/api/download/xico-clean" className="inline-flex min-h-13 items-center justify-center rounded-full bg-[#08090d] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_18px_34px_-18px_rgba(8,9,13,0.7)] hover:-translate-y-0.5 hover:bg-[#242531]">
                {t("hero.ctaDownload")}
              </a>
              <a href="#experience" className="inline-flex min-h-13 items-center justify-center rounded-full border border-black/10 bg-white/60 px-7 py-3.5 text-[15px] font-semibold text-[#171923] backdrop-blur-xl hover:-translate-y-0.5 hover:bg-white">
                {t("hero.ctaSecondary")}
              </a>
            </motion.div>
            <motion.p variants={heroItem} className="mt-4 text-[12px] text-[#8b909c]">
              {t("hero.downloadNote")}
            </motion.p>

            <motion.ul variants={heroItem} className="mt-7 flex flex-wrap gap-x-5 gap-y-3">
              {(t.raw("hero.trust") as string[]).map((item) => (
                <li key={item} className="flex items-center gap-2 text-[12px] font-medium text-[#5f6571]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#42bfa8]" />
                  {item}
                </li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div style={{ y: heroVisualY, opacity: heroOpacity }} className="relative z-10 h-[420px] sm:h-[520px] lg:h-[640px]">
            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.76, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.18, ease }}
              className="xico-hero-icon"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/mac/xico-app-icon.png" alt="Xico app icon" width={1024} height={1024} className="h-full w-full" />
            </motion.div>
            {HERO_SHOTS.map((shot, index) => (
              <motion.div
                key={shot.image}
                initial={reduce ? { opacity: 0 } : { opacity: 0, x: 90, y: 34, scale: 0.88 }}
                animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                transition={{ duration: 1.05, delay: 0.26 + index * 0.11, ease }}
                className={shot.className}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/mac/product/live/${shot.image}`} alt="" width={1080} height={734} className="h-auto w-full" />
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-[#f8f9fd]" />
      </section>

      <section aria-label={isZh ? "产品能力" : "Product capabilities"} className="relative z-20 border-y border-black/[0.05] bg-white/65 py-5 backdrop-blur-2xl">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-y-5 px-6 sm:grid-cols-4">
          {moments.map((item, index) => (
            <a key={item.label} href="#experience" onClick={() => setActiveFeature(index)} className="group flex min-h-12 items-center justify-center border-black/[0.06] px-3 text-center text-[13px] font-semibold text-[#747a87] hover:text-[#5e54d4] sm:border-r sm:last:border-r-0">
              <span className="relative py-1">
                {item.label}
                <span className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-[#6f63e9] transition-transform duration-300 group-hover:scale-x-100" />
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="px-6 py-28 sm:px-10 sm:py-36">
        <Reveal>
          <p className="mx-auto max-w-5xl text-center font-display text-[clamp(2rem,4.7vw,4.4rem)] font-semibold leading-[1.1] tracking-[-0.045em] text-[#151722] text-balance">
            {isZh ? "一款原生 App，把清理、空间、系统监视与专业工具，做成一套完整体验。" : "One native app for cleanup, storage, live monitoring, and serious Mac tools."}
          </p>
        </Reveal>
        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-2 gap-y-10 sm:grid-cols-5">
          {[
            [isZh ? "原生体验" : "Native", isZh ? "Swift 6 + SwiftUI" : "Swift 6 + SwiftUI"],
            [isZh ? "全程守护" : "Protected", isZh ? "预览 · 可撤销" : "Preview · Undo"],
            [isZh ? "数据可视" : "Visible", isZh ? "一眼看清空间" : "See every GB"],
            [isZh ? "本地优先" : "Local", isZh ? "文件绝不上传" : "Files never upload"],
            [isZh ? "持续更新" : "Evolving", isZh ? "新能力不断加入" : "New tools included"],
          ].map(([title, detail], index) => (
            <Reveal key={title} delay={index * 0.05} className={cn("text-center", index === 4 && "col-span-2 sm:col-span-1")}>
              <div className="mx-auto mb-4 h-8 w-px bg-gradient-to-b from-[#8c80f3] to-[#5ed6c3]" />
              <p className="font-display text-[16px] font-semibold text-[#191b25]">{title}</p>
              <p className="mt-1.5 text-[12px] text-[#8a909b]">{detail}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="experience" className="scroll-mt-20 px-4 pb-32 sm:px-8 sm:pb-40">
        <div className="mx-auto max-w-[1380px] rounded-[30px] border border-black/[0.06] bg-white/72 p-3 shadow-[0_40px_120px_-70px_rgba(64,54,150,0.36)] backdrop-blur-2xl sm:rounded-[42px] sm:p-6 lg:p-9">
          <div className="grid gap-8 lg:grid-cols-[170px_0.7fr_1.35fr] lg:gap-10">
            <nav aria-label={isZh ? "功能章节" : "Feature chapters"} className="flex gap-2 overflow-x-auto rounded-[22px] bg-[#f3f3f8] p-2 lg:flex-col lg:overflow-visible lg:rounded-[26px] lg:p-3">
              {moments.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setActiveFeature(index)}
                  aria-pressed={activeFeature === index}
                  className={cn(
                    "relative min-h-12 shrink-0 rounded-2xl px-4 py-3 text-left text-[13px] font-semibold transition-colors lg:min-h-20 lg:w-full lg:pl-9",
                    activeFeature === index ? "bg-white text-[#262330] shadow-[0_8px_28px_-20px_rgba(50,45,120,0.55)]" : "text-[#858997] hover:bg-white/60 hover:text-[#575165]",
                  )}
                >
                  <span className={cn("absolute left-3 top-1/2 hidden h-7 w-[2px] -translate-y-1/2 rounded-full bg-[#6e62e7] lg:block", activeFeature === index ? "opacity-100" : "opacity-0")} />
                  <span className="mr-2 text-[10px] tracking-[0.1em] text-[#9a93de]">0{index + 1}</span>
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex min-h-[520px] flex-col justify-center px-3 py-7 sm:px-7 lg:min-h-[620px] lg:px-2">
              <AnimatePresence mode="wait">
                <motion.div key={activeFeature} initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }} transition={{ duration: 0.48, ease }}>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7569e8]">{moments[activeFeature].eyebrow}</p>
                  <h2 className="mt-4 font-display text-[clamp(2.25rem,4vw,4.2rem)] font-semibold leading-[1.02] tracking-[-0.055em] text-[#101119] text-balance">
                    {moments[activeFeature].title}
                  </h2>
                  <p className="mt-6 text-[15px] leading-7 text-[#6c7280]">{moments[activeFeature].desc}</p>
                  <ul className="mt-7 space-y-3">
                    {moments[activeFeature].points.map((point) => (
                      <li key={point} className="flex gap-3 text-[13px] leading-6 text-[#565c69]">
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4dc5ae]" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-9 flex gap-8 border-t border-black/[0.06] pt-6">
                    <div>
                      <p className="font-display text-[25px] font-semibold tracking-[-0.04em] text-[#6b60e2]">{moments[activeFeature].metric}</p>
                      <p className="mt-1 text-[11px] text-[#969aa5]">{moments[activeFeature].metricLabel}</p>
                    </div>
                    <div>
                      <p className="font-display text-[25px] font-semibold tracking-[-0.04em] text-[#2fafa0]">100%</p>
                      <p className="mt-1 text-[11px] text-[#969aa5]">{isZh ? "本地处理" : "on-device"}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="relative flex min-h-[360px] items-center overflow-hidden rounded-[24px] bg-[radial-gradient(circle_at_50%_35%,#ffffff_0%,#f0f1ff_52%,#ebeef8_100%)] p-3 sm:min-h-[560px] sm:p-6 lg:min-h-[620px] lg:rounded-[30px]">
              <div aria-hidden className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(87,76,180,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(87,76,180,.035)_1px,transparent_1px)] [background-size:40px_40px]" />
              <AnimatePresence mode="wait">
                <motion.div key={moments[activeFeature].image} initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, x: 24 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, x: -18 }} transition={{ duration: 0.62, ease }} className="relative z-10 w-full">
                  <Screenshot src={moments[activeFeature].image} alt={moments[activeFeature].alt} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <EditorialFeatureCollection
        eyebrow={isZh ? "清理与应用" : "Cleanup & apps"}
        title={isZh ? "每一次清理，都看得见。" : "See exactly what gets cleaned."}
        description={isZh ? "Xico 不把清理藏在一个按钮后面。系统垃圾、应用残留和可用更新都有自己的完整界面、清楚说明与可控操作。" : "Xico never hides cleanup behind a mystery button. Junk, leftovers, and updates each have a focused, transparent interface."}
        features={cleaningFeatures}
        tone="white"
      />

      <section className="overflow-hidden border-y border-black/[0.05] bg-white py-28 sm:py-36">
        <div className="mx-auto max-w-[1380px] px-6 sm:px-10">
          <Reveal>
            <SectionHeading
              eyebrow={isZh ? "连接与工作流" : "Connections & workflow"}
              title={isZh ? "从清理到服务器。" : "From cleanup to servers."}
              description={isZh ? "Xico 不只照顾本机，也把安全下载、远程服务器和个性化设置统一进一套清爽的原生工作流。" : "Xico goes beyond the local Mac, bringing safe downloads, remote servers, and personal preferences into one calm native workflow."}
            />
          </Reveal>
        </div>

        <div className="mt-16 flex snap-x snap-mandatory gap-5 overflow-x-auto px-[max(24px,calc((100vw-1380px)/2))] pb-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-7">
          {connectedFeatures.map((item, index) => (
            <Reveal key={item.image} delay={index * 0.06} className="w-[84vw] max-w-[560px] shrink-0 snap-center sm:w-[58vw] lg:w-[42vw]">
              <article>
                <Screenshot src={`/mac/product/live/${item.image}`} alt={item.title} />
                <div className="mt-6 px-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8b82df]">{item.detail}</p>
                  <h3 className="font-display text-2xl font-semibold tracking-[-0.035em] text-[#151722]">{item.title}</h3>
                  <p className="mt-3 text-[14px] leading-6 text-[#777d89]">{item.description}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <EditorialFeatureCollection
        eyebrow={isZh ? "系统照顾" : "System care"}
        title={isZh ? "整台 Mac，时刻保持好状态。" : "Keep your whole Mac in shape."}
        description={isZh ? "优化、维护、硬件健康与菜单栏监控各有独立空间。每一种能力都配合真实数据和明确说明，而不是挤进一张功能清单。" : "Optimization, maintenance, hardware health, and menu bar monitoring each get a dedicated, data-rich experience."}
        features={careFeatures}
        tone="pearl"
      />

      <section id="privacy" className="relative overflow-hidden px-6 py-32 sm:px-10 sm:py-44">
        <div aria-hidden className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(118,105,232,.19),rgba(94,214,195,.08)_36%,transparent_70%)] blur-2xl" />
        <div aria-hidden className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#7469e8]/10" />
        <div aria-hidden className="absolute left-1/2 top-1/2 h-[470px] w-[470px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#7469e8]/[0.06]" />
        <Reveal className="relative mx-auto max-w-3xl text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[25px] border border-[#7469e8]/10 bg-white/75 shadow-[0_22px_60px_-30px_rgba(83,70,180,.55)] backdrop-blur-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mac/xico-app-icon.png" alt="" width={1024} height={1024} className="h-14 w-14" />
          </div>
          <p className="mt-8 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7367e5]">{tp("eyebrow")}</p>
          <h2 className="mt-4 font-display text-[clamp(2.5rem,5.6vw,5.2rem)] font-semibold leading-[1.02] tracking-[-0.055em] text-[#11131b] text-balance">
            {isZh ? "本地处理，从不上传。" : tp("title")}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-8 text-[#6a707d]">{tp("subtitle")}</p>
          <ul className="mt-9 flex flex-wrap justify-center gap-3">
            {(tp.raw("points") as string[]).map((point) => (
              <li key={point} className="rounded-full border border-[#6e64dd]/10 bg-white/60 px-4 py-2 text-[12px] font-medium text-[#716b89] backdrop-blur-xl">
                {point}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="px-4 pb-28 sm:px-8 sm:pb-36">
        <Reveal className="mx-auto max-w-[1380px]">
          <div className="relative overflow-hidden rounded-[32px] bg-[#090a10] px-7 py-10 text-white shadow-[0_42px_100px_-48px_rgba(12,10,28,.85)] sm:rounded-[42px] sm:px-12 sm:py-12 lg:grid lg:grid-cols-[auto_1.3fr_0.9fr] lg:items-center lg:gap-12 lg:px-16">
            <div aria-hidden className="absolute -left-20 -top-28 h-80 w-80 rounded-full bg-[#6b5ee5]/25 blur-[90px]" />
            <div aria-hidden className="absolute right-0 top-0 h-72 w-72 rounded-full bg-[#49c9b0]/10 blur-[100px]" />
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/mac/xico-app-icon.png" alt="Xico app icon" width={1024} height={1024} className="h-24 w-24 rounded-[24px] sm:h-28 sm:w-28" />
            </div>
            <div className="relative mt-7 lg:mt-0">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#a99fff]">{tdownload("eyebrow")}</p>
              <h2 className="mt-3 font-display text-[clamp(2.1rem,4vw,4.2rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-white text-balance">
                {tdownload("title")}
              </h2>
              <p className="mt-4 max-w-xl text-[14px] leading-7 text-white/55">{tdownload("subtitle")}</p>
            </div>
            <div className="relative mt-8 flex flex-col gap-3 lg:mt-0 lg:items-end">
              <a href="/api/download/xico-clean" className="inline-flex min-h-13 w-full items-center justify-center rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold text-[#0a0b10] hover:-translate-y-0.5 hover:bg-[#ecebff] sm:w-auto">
                {tdownload("cta")}
              </a>
              <Link href="/mac/buy" className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/10 px-6 py-3 text-[13px] font-medium text-white/70 hover:border-white/25 hover:text-white sm:w-auto">
                {tdownload("buy")}
              </Link>
              <p className="mt-1 text-[10px] text-white/35">{tdownload("trust")}</p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="bg-white px-6 py-24 sm:px-10 sm:py-32">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#776be8]">{isZh ? "完整能力" : "Complete capabilities"}</p>
          <h2 className="mt-4 font-display text-[clamp(2rem,4.5vw,4rem)] font-semibold leading-[1.04] tracking-[-0.05em] text-[#151722] text-balance">{isZh ? "不只是看起来专业。每一项都真的能用。" : "Not just polished. Genuinely capable."}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-7 text-[#737987]">{isZh ? "首页展示的是当前产品的真实界面。更完整的功能、安全策略与技术细节，都可以继续深入了解。" : "Every interface on this page comes from the current product. Explore the complete capability and security details."}</p>
          <Link href="/mac/features" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full border border-black/[0.09] bg-white px-7 py-3 text-[14px] font-semibold text-[#292b35] shadow-[0_16px_36px_-26px_rgba(40,35,100,.5)] hover:-translate-y-0.5 hover:border-[#756ae4]/25 hover:text-[#6157cb]">
            {isZh ? "查看全部功能说明" : "Explore every feature"}
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
