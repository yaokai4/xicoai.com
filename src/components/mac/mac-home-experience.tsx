"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Download CTAs intentionally hit a file API route. */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import Image from "next/image";
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
  imageWidth?: number;
  imageHeight?: number;
  alt: string;
  metric: string;
  metricLabel: string;
};

type EditorialFeature = {
  image: string;
  width?: number;
  height?: number;
  title: string;
  description: string;
  detail: string;
};

const ease = [0.16, 1, 0.3, 1] as const;

function Screenshot({
  src,
  alt,
  className,
  eager = false,
  width = 1080,
  height = 734,
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
  width?: number;
  height?: number;
}) {
  return (
    <figure className={cn("overflow-hidden rounded-[22px] border border-black/[0.06] bg-white shadow-[0_30px_90px_-52px_rgba(35,30,85,0.42)]", className)}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        quality={96}
        sizes="(max-width: 767px) 92vw, (max-width: 1279px) 72vw, 760px"
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
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
    <div className={cn("max-w-[820px]", align === "center" && "mx-auto text-center")}>
      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6f63e9]">
        {eyebrow}
      </p>
      <h2 className="mt-4 font-display text-[clamp(2.15rem,4vw,3.9rem)] font-semibold leading-[1.06] tracking-[-0.045em] text-[#14161d] text-balance">
        {title}
      </h2>
      {description ? (
        <p className={cn("mt-6 max-w-2xl text-[16px] leading-8 text-[#666d7b] sm:text-[18px]", align === "center" && "mx-auto")}>
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
    <section className={cn("px-4 py-24 sm:px-8 sm:py-32", tone === "white" ? "bg-white" : "bg-[#f5f5f7]")}>
      <div className="mx-auto max-w-[1280px]">
        <Reveal>
          <SectionHeading eyebrow={eyebrow} title={title} description={description} />
        </Reveal>

        <Reveal className={cn("mt-14 overflow-hidden rounded-[28px] border border-black/[0.055] sm:rounded-[36px]", tone === "white" ? "bg-[#f5f5f7]" : "bg-white/80")}>
          <article className="grid items-center gap-9 px-5 pb-5 pt-9 sm:px-8 sm:pb-8 lg:grid-cols-[0.78fr_1.22fr] lg:gap-12 lg:px-12 lg:py-12">
            <div className="px-2 lg:px-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#776be8]">{lead.detail}</p>
              <h3 className="mt-4 font-display text-[clamp(1.95rem,3.4vw,3.35rem)] font-semibold leading-[1.06] tracking-[-0.045em] text-[#171922] text-balance">{lead.title}</h3>
              <p className="mt-5 max-w-xl text-[15px] leading-7 text-[#6d7380]">{lead.description}</p>
            </div>
            <Screenshot src={lead.image} alt={lead.title} width={lead.width} height={lead.height} />
          </article>
        </Reveal>

        <div className={cn("mt-5 grid gap-5", rest.length >= 3 ? "lg:grid-cols-3" : "md:grid-cols-2")}>
          {rest.map((feature, index) => (
            <Reveal key={feature.image} delay={index * 0.06}>
              <article className={cn("flex h-full flex-col overflow-hidden rounded-[26px] border border-black/[0.055] px-5 pb-5 pt-7 sm:rounded-[30px] sm:px-6 sm:pb-6", tone === "white" ? "bg-[linear-gradient(145deg,#f7f7f9_0%,#f2f3f7_100%)]" : "bg-white/80")}>
                <div className="px-1 pb-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8b82df]">{feature.detail}</p>
                  <h3 className="mt-3 font-display text-[clamp(1.65rem,2.2vw,2.15rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-[#1a1c24] text-balance">{feature.title}</h3>
                  <p className="mt-4 text-[13px] leading-6 text-[#747a87] sm:text-[14px]">{feature.description}</p>
                </div>
                <Screenshot src={feature.image} alt={feature.title} width={feature.width} height={feature.height} className="mt-auto" />
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
  const screenshotLocale = isZh ? "zh" : "en";
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
  const [featurePaused, setFeaturePaused] = useState(false);
  const experienceRef = useRef<HTMLElement>(null);
  const experienceIsInView = useInView(experienceRef, { amount: 0.32 });

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
        image: `/mac/shots/${screenshotLocale}/smartscan.jpg`,
        imageWidth: 2360,
        imageHeight: 1440,
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
        image: `/mac/shots/${screenshotLocale}/monitor.jpg`,
        imageWidth: 1400,
        imageHeight: 1025,
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
      {
        label: isZh ? "安全下载" : "Downloads",
        eyebrow: isZh ? "安全下载" : "Safe downloads",
        title: isZh ? "链接一贴，下载即刻开始。" : "Paste a link. Start downloading.",
        desc: isZh ? "把媒体任务、文件状态与隔离检查放在同一处。整个下载过程清晰可见，不必在浏览器与多个工具之间来回切换。" : "Keep media tasks, file status, and quarantine checks in one clear flow without jumping between browsers and utilities.",
        points: isZh ? ["视频、音频与图片任务统一管理", "文件状态与隔离检查清晰可见", "队列、进度和结果集中呈现"] : ["Manage video, audio, and image tasks together", "Keep file and quarantine status visible", "See queues, progress, and results in one place"],
        image: "/mac/product/live/downloader.png",
        alt: isZh ? "希可 Mac 下载器真实界面" : "Xico Downloader interface",
        metric: "1000+",
        metricLabel: isZh ? "站点解析" : "supported sites",
      },
      {
        label: isZh ? "远程服务器" : "Servers",
        eyebrow: isZh ? "服务器套件" : "Server suite",
        title: isZh ? "远程服务器，也在 Xico 里。" : "Your remote servers, inside Xico.",
        desc: isZh ? "管理主机、SSH、终端和 SFTP，把常用连接与日常运维入口收进同一套原生体验。" : "Manage hosts, SSH, terminal, and SFTP through one native workspace built for everyday operations.",
        points: isZh ? ["导入并管理常用 SSH 主机", "终端、文件与实时监控一处完成", "连接配置始终清楚可控"] : ["Import and manage SSH hosts", "Keep terminal, files, and live monitoring together", "Make every connection clear and controllable"],
        image: "/mac/product/live/servers.png",
        alt: isZh ? "希可 Mac 服务器套件真实界面" : "Xico Server Suite interface",
        metric: "SSH",
        metricLabel: isZh ? "终端 · SFTP" : "terminal · SFTP",
      },
      {
        label: isZh ? "个性化设置" : "Settings",
        eyebrow: isZh ? "个性化设置" : "Personal settings",
        title: isZh ? "主题与行为，都按你的方式。" : "Make it work your way.",
        desc: isZh ? "外观、主题、权限与产品偏好集中管理，让一款功能丰富的专业工具依然保持简单。" : "Control appearance, themes, permissions, and product preferences while keeping a powerful utility calm and simple.",
        points: isZh ? ["浅色、深色与系统外观自由选择", "权限、更新与清理偏好集中设置", "每项选项都有明确说明"] : ["Choose light, dark, or system appearance", "Keep permissions, updates, and cleanup preferences together", "Understand every option before changing it"],
        image: "/mac/product/live/settings.png",
        alt: isZh ? "希可 Mac 个性化设置真实界面" : "Xico Settings interface",
        metric: "3",
        metricLabel: isZh ? "外观主题" : "appearance modes",
      },
    ],
    [deepDive, isZh, screenshotLocale, tm, ts],
  );

  useEffect(() => {
    if (reduce || featurePaused || !experienceIsInView) return;
    const timer = window.setTimeout(() => {
      setActiveFeature((current) => (current + 1) % moments.length);
    }, 6800);
    return () => window.clearTimeout(timer);
  }, [activeFeature, experienceIsInView, featurePaused, moments.length, reduce]);

  const cleaningFeatures: EditorialFeature[] = [
    {
      image: "/mac/product/live/system-junk.png",
      title: isZh ? "系统垃圾，清得明明白白。" : "System junk, made transparent.",
      description: isZh ? "缓存、日志、语言包和旧更新逐项列清，先看内容与大小，再决定要不要清。安全项目默认勾选，系统关键路径始终受到保护。" : "Caches, logs, language files, and old updates are listed before you clean, with protected system paths kept off limits.",
      detail: isZh ? "系统垃圾" : "System Junk",
    },
    {
      image: "/mac/product/live/uninstaller.png",
      title: isZh ? "卸载 App，不留尾巴。" : "Uninstall without leftovers.",
      description: isZh ? "应用本体、缓存、偏好、容器和登录项统一归档，让每一次卸载都完整、可控。" : "Remove the app together with its caches, preferences, containers, and login items.",
      detail: isZh ? "彻底卸载" : "Uninstaller",
    },
    {
      image: "/mac/product/live/app-updater.png",
      title: isZh ? "所有更新，一处看完。" : "Every update in one place.",
      description: isZh ? "集中检查已安装应用的新版本、当前版本与更新状态，不必逐个打开寻找。" : "Review versions and available updates for installed apps without opening them one by one.",
      detail: isZh ? "应用更新" : "App Updater",
    },
  ];

  const careFeatures: EditorialFeature[] = [
    {
      image: "/mac/product/live/optimization.png",
      title: isZh ? "把拖慢 Mac 的后台项目找出来。" : "Find what is slowing your Mac down.",
      description: isZh ? "管理登录项、后台代理与高资源进程，把系统优化从猜测变成清晰判断。" : "Review login items, background agents, and demanding processes with clear context.",
      detail: isZh ? "系统优化" : "Optimization",
    },
    {
      image: "/mac/product/live/maintenance.png",
      title: isZh ? "日常维护，一次完成。" : "Routine maintenance, in one pass.",
      description: isZh ? "维护脚本、Spotlight 索引、DNS 与系统任务集中执行，每一步都有明确状态。" : "Run maintenance scripts, rebuild Spotlight, refresh DNS, and track every task clearly.",
      detail: isZh ? "维护工具" : "Maintenance",
    },
    {
      image: "/mac/product/live/hardware.png",
      title: isZh ? "看见硬件真正的状态。" : "See the real state of your hardware.",
      description: isZh ? "电池健康、循环次数、温度、风扇与 SSD SMART 信息，专业但不复杂。" : "Battery health, cycles, thermals, fans, and SSD SMART data without the clutter.",
      detail: isZh ? "硬件健康" : "Hardware Health",
    },
    {
      image: "/mac/product/live/menu-bar-settings.png",
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
      <section ref={heroRef} className="xico-hero relative min-h-[930px] overflow-hidden pt-24 sm:min-h-[960px] sm:pt-32 lg:min-h-[770px] lg:pt-24">
        <div aria-hidden className="xico-hero-glow xico-hero-glow--one" />
        <div aria-hidden className="xico-hero-glow xico-hero-glow--two" />

        <div className="relative mx-auto grid w-full max-w-[1280px] gap-7 px-7 pb-20 sm:gap-12 sm:px-12 lg:min-h-[690px] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center lg:gap-16 lg:px-16">
          <motion.div style={{ y: heroTextY, opacity: heroOpacity }} variants={heroContainer} initial="hidden" animate="show" className="relative z-20 min-w-0 max-w-[520px] lg:pb-8">
            <motion.div variants={heroItem} className="inline-flex items-center gap-2 rounded-full border border-[#6d62e7]/16 bg-white/65 px-3.5 py-2 text-[11px] font-semibold tracking-[0.06em] text-[#685dde] shadow-[0_14px_38px_-28px_rgba(70,58,165,.55)] backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-[#42c8ad] shadow-[0_0_12px_rgba(66,200,173,0.72)]" />
              {t("badge")}
            </motion.div>

            <motion.p variants={heroItem} className="mt-8 text-[12px] font-semibold uppercase tracking-[0.15em] text-[#776be8] sm:text-[13px]">
              {t("hero.eyebrow")}
            </motion.p>
            <motion.h1
              variants={heroItem}
              className={cn(
                "xico-hero-title-gradient mt-4 font-display font-semibold leading-[1.035]",
                isZh
                  ? "text-[clamp(2.35rem,11.4vw,3rem)] tracking-[-0.047em] sm:text-[clamp(3.25rem,4.35vw,4.35rem)]"
                  : "max-w-[540px] text-[clamp(2.3rem,10vw,2.9rem)] tracking-[-0.04em] text-balance sm:text-[clamp(3rem,3.85vw,3.9rem)]",
              )}
            >
              {isZh ? (
                <>让 Mac<br /><span className="whitespace-nowrap">回到最佳状态。</span></>
              ) : (
                <>{t("hero.titleLine1")}<br /><span>{t("hero.titleLine2")}.</span></>
              )}
            </motion.h1>
            <motion.p variants={heroItem} className="mt-7 max-w-[500px] text-[16px] leading-[1.85] text-[#666d79] sm:text-[17px]">
              {isZh ? "一键找出系统垃圾、开发者缓存、大文件与重复文件。空间透镜、实时监控与专业工具都在一处；全程本地，删除前可预览，删除后可撤销。" : t("hero.subtitle")}
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

          <motion.div style={{ y: heroVisualY, opacity: heroOpacity }} className="relative z-10 flex h-[340px] min-w-0 items-center justify-center sm:h-[500px] lg:h-[620px] lg:justify-end">
            <div className="xico-hero-visual-stack">
              <motion.figure
                initial={reduce ? { opacity: 0 } : { opacity: 0, x: 56, y: 24, scale: 0.94 }}
                animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                transition={{ duration: 1.08, delay: 0.24, ease }}
                className="xico-hero-window"
              >
                <span className="xico-hero-window-surface">
                  <Image
                    src="/mac/product/live/smart-scan.png"
                    alt={isZh ? "希可 Mac 完整产品主页与等待智能扫描界面" : "Complete Xico app window ready for a smart scan"}
                    width={1080}
                    height={734}
                    quality={96}
                    sizes="(max-width: 1023px) 94vw, 52vw"
                    loading="eager"
                    fetchPriority="high"
                    className="block h-auto w-full"
                  />
                  <span aria-hidden className="xico-hero-scan-sheen" />
                </span>
              </motion.figure>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={reduce ? { opacity: 1, y: 0 } : { opacity: 1, y: [0, -6, 0] }}
                transition={reduce ? { duration: 0.3 } : { opacity: { delay: 0.9, duration: 0.45 }, y: { delay: 1.2, duration: 4.8, repeat: Infinity, ease: "easeInOut" } }}
                className="xico-hero-ready-chip"
              >
                <span aria-hidden className="xico-hero-ready-dot" />
                {isZh ? "100% 本地 · 随时开始扫描" : "100% local · ready to scan"}
              </motion.div>
            </div>
          </motion.div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-[#f8f9fd]" />
      </section>

      <section className="px-6 py-28 sm:px-10 sm:py-36">
        <Reveal>
          <p className="mx-auto max-w-5xl text-center font-display text-[clamp(2rem,4.7vw,4.4rem)] font-semibold leading-[1.1] tracking-[-0.045em] text-[#151722] text-balance">
            {isZh ? "一款原生 App，把清理、空间、系统监视与专业工具，做成一套完整体验。" : "One native app for cleanup, storage, live monitoring, and serious Mac tools."}
          </p>
        </Reveal>
        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-5">
          {[
            [isZh ? "原生体验" : "Native", isZh ? "Swift 6 + SwiftUI" : "Swift 6 + SwiftUI"],
            [isZh ? "全程守护" : "Protected", isZh ? "预览 · 可撤销" : "Preview · Undo"],
            [isZh ? "数据可视" : "Visible", isZh ? "一眼看清空间" : "See every GB"],
            [isZh ? "本地优先" : "Local", isZh ? "文件绝不上传" : "Files never upload"],
            [isZh ? "持续更新" : "Evolving", isZh ? "新能力不断加入" : "New tools included"],
          ].map(([title, detail], index) => (
            <Reveal key={title} delay={index * 0.05} className={cn("border-t border-black/[0.08] pt-5 text-center", index === 4 && "col-span-2 sm:col-span-1")}>
              <p className="font-display text-[16px] font-semibold text-[#191b25]">{title}</p>
              <p className="mt-1.5 text-[12px] text-[#8a909b]">{detail}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section
        id="experience"
        ref={experienceRef}
        onMouseEnter={() => setFeaturePaused(true)}
        onMouseLeave={() => setFeaturePaused(false)}
        onFocusCapture={() => setFeaturePaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setFeaturePaused(false);
        }}
        className="scroll-mt-20 px-4 pb-32 sm:px-8 sm:pb-40"
      >
        <div className="mx-auto max-w-[1280px] rounded-[30px] border border-black/[0.06] bg-white/72 p-3 shadow-[0_40px_120px_-70px_rgba(64,54,150,0.36)] backdrop-blur-2xl sm:rounded-[42px] sm:p-6 lg:p-9">
          <div className="grid gap-8 xl:grid-cols-[170px_minmax(0,0.86fr)_minmax(0,1.14fr)] xl:gap-9">
            <nav
              role="tablist"
              aria-label={isZh ? "功能章节" : "Feature chapters"}
              onKeyDown={(event) => {
                let nextIndex: number | null = null;
                if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (activeFeature + 1) % moments.length;
                if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (activeFeature - 1 + moments.length) % moments.length;
                if (event.key === "Home") nextIndex = 0;
                if (event.key === "End") nextIndex = moments.length - 1;
                if (nextIndex === null) return;
                event.preventDefault();
                setActiveFeature(nextIndex);
                window.requestAnimationFrame(() => document.getElementById(`feature-tab-${nextIndex}`)?.focus());
              }}
              className="flex max-w-full gap-2 overflow-x-auto rounded-[22px] bg-[#f3f3f8] p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden xl:flex-col xl:overflow-visible xl:rounded-[26px] xl:p-3"
            >
              {moments.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setActiveFeature(index)}
                  role="tab"
                  id={`feature-tab-${index}`}
                  aria-controls="feature-panel"
                  aria-selected={activeFeature === index}
                  tabIndex={activeFeature === index ? 0 : -1}
                  className={cn(
                    "relative min-h-12 shrink-0 overflow-hidden rounded-2xl px-4 py-3 text-left text-[13px] font-semibold transition-colors xl:min-h-[68px] xl:w-full xl:pl-9",
                    activeFeature === index ? "text-[#262330]" : "text-[#858997] hover:bg-white/60 hover:text-[#575165]",
                  )}
                >
                  {activeFeature === index ? (
                    <motion.span
                      layoutId="active-feature-tab"
                      className="absolute inset-0 rounded-2xl bg-white shadow-[0_8px_28px_-20px_rgba(50,45,120,0.55)]"
                      transition={{ duration: reduce ? 0 : 0.42, ease }}
                    />
                  ) : null}
                  <span className={cn("absolute left-3 top-1/2 z-10 hidden h-7 w-[2px] -translate-y-1/2 rounded-full bg-[#6e62e7] transition-opacity xl:block", activeFeature === index ? "opacity-100" : "opacity-0")} />
                  <span className="relative z-10 mr-2 text-[10px] tracking-[0.1em] text-[#9a93de]">0{index + 1}</span>
                  <span className="relative z-10">{item.label}</span>
                  {activeFeature === index && !reduce ? (
                    <span
                      key={`feature-progress-${activeFeature}-${featurePaused ? "paused" : "running"}`}
                      aria-hidden
                      className="xico-feature-progress"
                      style={{ animationPlayState: featurePaused ? "paused" : "running" }}
                    />
                  ) : null}
                </button>
              ))}
            </nav>

            <div
              id="feature-panel"
              role="tabpanel"
              aria-labelledby={`feature-tab-${activeFeature}`}
              className="flex min-h-[500px] flex-col justify-center px-3 py-7 sm:px-7 xl:min-h-[590px] xl:px-1"
            >
              <AnimatePresence mode="wait">
                <motion.div key={activeFeature} initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }} transition={{ duration: 0.48, ease }}>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7569e8]">{moments[activeFeature].eyebrow}</p>
                  <h2 className="mt-4 font-display text-[clamp(2.05rem,3.45vw,3.35rem)] font-semibold leading-[1.07] tracking-[-0.045em] text-[#171922] text-balance">
                    {moments[activeFeature].title}
                  </h2>
                  <p className="mt-5 text-[15px] leading-7 text-[#6c7280]">{moments[activeFeature].desc}</p>
                  <ul className="mt-6 space-y-2.5">
                    {moments[activeFeature].points.map((point) => (
                      <li key={point} className="flex gap-3 text-[13px] leading-6 text-[#565c69]">
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4dc5ae]" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 flex gap-8 border-t border-black/[0.06] pt-5">
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

            <div className="relative flex min-h-[360px] items-center overflow-hidden rounded-[24px] bg-[#f5f5f7] p-3 sm:min-h-[540px] sm:p-6 xl:min-h-[590px] xl:rounded-[30px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={moments[activeFeature].image}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, x: 24 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, x: -18 }}
                  whileHover={reduce ? undefined : { y: -5, scale: 1.008 }}
                  transition={{ duration: 0.62, ease }}
                  className="relative z-10 w-full"
                >
                  <Screenshot src={moments[activeFeature].image} alt={moments[activeFeature].alt} width={moments[activeFeature].imageWidth} height={moments[activeFeature].imageHeight} />
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

      <EditorialFeatureCollection
        eyebrow={isZh ? "系统照顾" : "System care"}
        title={isZh ? "整台 Mac，时刻保持好状态。" : "Keep your whole Mac in shape."}
        description={isZh ? "优化、维护、硬件健康与菜单栏监控各有独立空间。每一种能力都配合真实数据和明确说明，而不是挤进一张功能清单。" : "Optimization, maintenance, hardware health, and menu bar monitoring each get a dedicated, data-rich experience."}
        features={careFeatures}
        tone="pearl"
      />

      <section id="privacy" className="relative overflow-hidden bg-[#f5f5f7] px-6 py-32 sm:px-10 sm:py-44">
        <Reveal className="relative mx-auto max-w-3xl text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[25px] border border-[#7469e8]/10 bg-white/75 shadow-[0_22px_60px_-30px_rgba(83,70,180,.55)] backdrop-blur-xl">
            <Image src="/mac/xico-app-icon.png" alt="" width={1024} height={1024} quality={100} loading="eager" className="h-14 w-14" />
          </div>
          <p className="mt-8 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7367e5]">{tp("eyebrow")}</p>
          <h2 className="mt-4 font-display text-[clamp(2.35rem,4.8vw,4.55rem)] font-semibold leading-[1.04] tracking-[-0.05em] text-[#11131b] text-balance">
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

      <section className="bg-white px-4 py-28 sm:px-8 sm:py-40">
        <div className="mx-auto max-w-[1280px]">
          <Reveal>
            <SectionHeading
              eyebrow={isZh ? "完整能力" : "Complete capabilities"}
              title={isZh ? "不只是清理。是完整照顾你的 Mac。" : "More than cleanup. Complete care for your Mac."}
              description={isZh ? "从释放空间，到看懂系统状态，再到日常维护与专业工具。Xico 把每一项能力都做成真正可用、彼此连贯的原生体验。" : "From reclaiming space to understanding system health, maintenance, and pro tools, Xico turns every capability into one coherent native experience."}
            />
          </Reveal>

          <div className="mt-16 grid gap-5 lg:grid-cols-12 lg:grid-rows-2">
            <Reveal className="lg:col-span-7 lg:row-span-2">
              <article className="relative flex h-full min-h-[560px] flex-col overflow-hidden rounded-[32px] bg-[#0b0c12] p-7 text-white shadow-[0_38px_100px_-58px_rgba(24,20,62,.85)] sm:rounded-[40px] sm:p-11">
                <div aria-hidden className="absolute -right-28 -top-32 h-96 w-96 rounded-full bg-[#786bea]/24 blur-[100px]" />
                <div aria-hidden className="absolute -bottom-40 -left-28 h-96 w-96 rounded-full bg-[#43c7ad]/10 blur-[110px]" />
                <div className="relative max-w-xl">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a79eff]">{isZh ? "一款 App，四套核心能力" : "One app, four essential systems"}</p>
                  <h3 className="mt-5 font-display text-[clamp(2.25rem,3.9vw,4.1rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-balance">
                    {isZh ? "清理只是开始。" : "Cleanup is only the beginning."}
                  </h3>
                  <p className="mt-5 max-w-lg text-[15px] leading-7 text-white/52">
                    {isZh ? "不用在多款工具之间来回切换。真正重要的 Mac 能力，都在同一套熟悉、克制的界面里。" : "Stop jumping between utilities. The Mac tools that matter live in one familiar, focused interface."}
                  </p>
                </div>

                <div className="relative mt-auto grid gap-x-8 gap-y-7 pt-14 sm:grid-cols-2">
                  {[
                    ["01", isZh ? "智能清理" : "Smart cleanup", isZh ? "六类内容并行扫描，先预览再清理。" : "Six categories scanned together, with preview first."],
                    ["02", isZh ? "空间洞察" : "Storage insight", isZh ? "快速看清每一 GB 到底去了哪里。" : "See exactly where every gigabyte is going."],
                    ["03", isZh ? "实时监控" : "Live monitoring", isZh ? "CPU、内存、GPU 与网络持续可见。" : "Keep CPU, memory, GPU, and network visible."],
                    ["04", isZh ? "专业工具" : "Pro tools", isZh ? "测速、硬件健康、维护与服务器。" : "Benchmarks, hardware health, maintenance, and servers."],
                  ].map(([number, title, detail]) => (
                    <div key={number} className="border-t border-white/10 pt-5">
                      <div className="flex items-baseline gap-3">
                        <span className="text-[10px] font-semibold tracking-[0.12em] text-[#8075ec]">{number}</span>
                        <h4 className="font-display text-[17px] font-semibold tracking-[-0.025em] text-white/92">{title}</h4>
                      </div>
                      <p className="mt-2 pl-8 text-[12px] leading-5 text-white/40">{detail}</p>
                    </div>
                  ))}
                </div>
              </article>
            </Reveal>

            <Reveal delay={0.06} className="lg:col-span-5">
              <article className="relative flex min-h-[270px] flex-col overflow-hidden rounded-[32px] border border-black/[0.055] bg-[linear-gradient(145deg,#f5f3ff_0%,#f7f8fc_52%,#eef8f6_100%)] p-7 sm:rounded-[40px] sm:p-10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7165df]">{isZh ? "先体验，再决定" : "Try first, decide later"}</p>
                <div className="mt-auto flex items-end justify-between gap-6 pt-10">
                  <div>
                    <p className="font-display text-[clamp(3.7rem,7vw,6.3rem)] font-semibold leading-[0.82] tracking-[-0.075em] text-[#151621]">15</p>
                    <p className="mt-4 font-display text-[20px] font-semibold tracking-[-0.03em] text-[#242631]">{isZh ? "天全功能免费试用" : "days, full-feature trial"}</p>
                    <p className="mt-2 text-[12px] text-[#777d89]">{isZh ? "无需注册 · 下载即可体验" : "No signup · download and start"}</p>
                  </div>
                  <span className="mb-1 h-3 w-3 shrink-0 rounded-full bg-[#45c3aa] shadow-[0_0_0_8px_rgba(69,195,170,.10),0_0_24px_rgba(69,195,170,.35)]" />
                </div>
              </article>
            </Reveal>

            <Reveal delay={0.1} className="lg:col-span-5">
              <article className="flex min-h-[270px] flex-col rounded-[32px] border border-black/[0.055] bg-[#f5f5f7] p-7 sm:rounded-[40px] sm:p-10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#777d89]">{isZh ? "简单的拥有方式" : "Simple ownership"}</p>
                <h3 className="mt-5 font-display text-[clamp(2rem,3vw,3.1rem)] font-semibold leading-[1.04] tracking-[-0.045em] text-[#151621] text-balance">
                  {isZh ? "一次买断。没有订阅。" : "Buy once. No subscription."}
                </h3>
                <div className="mt-auto flex flex-wrap items-center gap-3 pt-8">
                  <Link href="/mac/pricing" className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#151621] px-6 py-3 text-[13px] font-semibold text-white hover:-translate-y-0.5 hover:bg-[#2b2d38]">
                    {isZh ? "查看定价" : "See pricing"}
                  </Link>
                  <Link href="/mac/features" className="inline-flex min-h-11 items-center justify-center rounded-full px-4 py-3 text-[13px] font-semibold text-[#655bd2] hover:bg-white/70">
                    {isZh ? "全部功能 →" : "All features →"}
                  </Link>
                </div>
              </article>
            </Reveal>
          </div>

          <Reveal className="mt-5">
            <div className="grid overflow-hidden rounded-[28px] border border-black/[0.055] bg-[#f8f8fa] sm:grid-cols-2 lg:grid-cols-4">
              {[
                [isZh ? "100% 本地" : "100% on-device", isZh ? "文件内容绝不上传" : "Files never leave your Mac"],
                [isZh ? "删除可撤销" : "Undo cleanup", isZh ? "关键操作留有退路" : "A safe way back"],
                [isZh ? "Apple 公证" : "Apple notarized", isZh ? "原生 Swift 构建" : "Built natively in Swift"],
                [isZh ? "30 天保障" : "30-day guarantee", isZh ? "放心购买，不合适可退" : "Buy with confidence"],
              ].map(([title, detail]) => (
                <div key={title} className="border-b border-black/[0.055] px-6 py-6 last:border-b-0 sm:[&:nth-child(odd)]:border-r sm:[&:nth-child(3)]:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0">
                  <p className="font-display text-[15px] font-semibold tracking-[-0.02em] text-[#20222c]">{title}</p>
                  <p className="mt-1.5 text-[11px] text-[#8a8f9a]">{detail}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section id="download" className="scroll-mt-20 bg-white px-4 pb-28 sm:px-8 sm:pb-36">
        <Reveal className="mx-auto max-w-[1280px]">
          <div className="relative overflow-hidden rounded-[32px] bg-[#090a10] px-7 py-10 text-white shadow-[0_42px_100px_-48px_rgba(12,10,28,.85)] sm:rounded-[42px] sm:px-12 sm:py-12 lg:grid lg:grid-cols-[auto_1.3fr_0.9fr] lg:items-center lg:gap-12 lg:px-16">
            <div aria-hidden className="absolute -left-20 -top-28 h-80 w-80 rounded-full bg-[#6b5ee5]/25 blur-[90px]" />
            <div aria-hidden className="absolute right-0 top-0 h-72 w-72 rounded-full bg-[#49c9b0]/10 blur-[100px]" />
            <div className="relative">
              <Image src="/mac/xico-app-icon.png" alt="Xico app icon" width={1024} height={1024} quality={100} loading="eager" className="h-24 w-24 rounded-[24px] sm:h-28 sm:w-28" />
            </div>
            <div className="relative mt-7 lg:mt-0">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#a99fff]">{tdownload("eyebrow")}</p>
              <h2 className="mt-3 font-display text-[clamp(2rem,3.4vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.045em] text-white text-balance">
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
    </div>
  );
}
