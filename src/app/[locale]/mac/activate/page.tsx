import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ActivateKeyCard } from "@/components/mac/activate-key-card";

export const dynamic = "force-dynamic";

/**
 * Public activation guide. The admin QR (卡密 cards, offline channels) encodes
 * /activate?key=XXXXXX-XXXXXX-XXXXXX — scanning lands here with the key shown
 * big, plus the download link and the 3-step walkthrough. Also linked from the
 * key email. Strings live in a local dict (11 locales) — they're few and this
 * page must render even while messages catalogs lag behind.
 */

type Dict = {
  title: string;
  yourKey: string;
  copy: string;
  copied: string;
  noKey: string;
  steps: [string, string, string];
  download: string;
  support: string;
};

const DICTS: Record<string, Dict> = {
  zh: {
    title: "激活 希可Mac清理",
    yourKey: "你的激活码",
    copy: "复制激活码",
    copied: "已复制 ✓",
    noKey: "此页面用于展示激活码。若你已购买，请查看购买成功页或邮件中的链接。",
    steps: [
      "下载并打开 希可Mac清理",
      "进入「设置 → 升级 Pro」，粘贴激活码",
      "点击「激活」，即刻解锁全部功能",
    ],
    download: "下载 希可Mac清理",
    support: "遇到问题？联系支持",
  },
  "zh-Hant": {
    title: "啟用 希可Mac清理",
    yourKey: "你的啟用金鑰",
    copy: "複製金鑰",
    copied: "已複製 ✓",
    noKey: "此頁面用於顯示啟用金鑰。若你已購買，請查看購買成功頁或郵件中的連結。",
    steps: [
      "下載並開啟 希可Mac清理",
      "進入「設定 → 升級 Pro」，貼上金鑰",
      "點擊「啟用」，立即解鎖全部功能",
    ],
    download: "下載 希可Mac清理",
    support: "遇到問題？聯絡支援",
  },
  ja: {
    title: "Xico Clean をアクティベート",
    yourKey: "アクティベーションキー",
    copy: "キーをコピー",
    copied: "コピーしました ✓",
    noKey: "このページはキー表示用です。ご購入済みの場合は購入完了ページまたはメールのリンクをご覧ください。",
    steps: [
      "Xico Clean をダウンロードして起動",
      "「設定 → Pro にアップグレード」でキーを貼り付け",
      "「アクティベート」をクリックして全機能を解放",
    ],
    download: "Xico Clean をダウンロード",
    support: "お困りですか？サポートへ",
  },
  en: {
    title: "Activate Xico Clean",
    yourKey: "Your activation key",
    copy: "Copy key",
    copied: "Copied ✓",
    noKey: "This page displays activation keys. If you purchased, use the link on the success page or in your email.",
    steps: [
      "Download and open Xico Clean",
      "Go to Settings → Upgrade to Pro and paste the key",
      "Click Activate — everything unlocks instantly",
    ],
    download: "Download Xico Clean",
    support: "Need help? Contact support",
  },
  ko: {
    title: "Xico Clean 활성화",
    yourKey: "활성화 키",
    copy: "키 복사",
    copied: "복사됨 ✓",
    noKey: "이 페이지는 활성화 키 표시용입니다. 구매하셨다면 완료 페이지 또는 이메일의 링크를 이용하세요.",
    steps: [
      "Xico Clean 다운로드 후 실행",
      "설정 → Pro 업그레이드에서 키 붙여넣기",
      "활성화 클릭 — 모든 기능이 즉시 잠금 해제",
    ],
    download: "Xico Clean 다운로드",
    support: "도움이 필요하신가요? 지원팀 문의",
  },
  de: {
    title: "Xico Clean aktivieren",
    yourKey: "Ihr Aktivierungsschlüssel",
    copy: "Schlüssel kopieren",
    copied: "Kopiert ✓",
    noKey: "Diese Seite zeigt Aktivierungsschlüssel an. Nutzen Sie nach dem Kauf den Link auf der Bestätigungsseite oder in Ihrer E-Mail.",
    steps: [
      "Xico Clean herunterladen und öffnen",
      "Einstellungen → Auf Pro upgraden, Schlüssel einfügen",
      "Auf „Aktivieren“ klicken — alle Funktionen sofort frei",
    ],
    download: "Xico Clean herunterladen",
    support: "Probleme? Support kontaktieren",
  },
  es: {
    title: "Activar Xico Clean",
    yourKey: "Tu clave de activación",
    copy: "Copiar clave",
    copied: "Copiado ✓",
    noKey: "Esta página muestra claves de activación. Si compraste, usa el enlace de la página de éxito o de tu correo.",
    steps: [
      "Descarga y abre Xico Clean",
      "Ve a Ajustes → Mejorar a Pro y pega la clave",
      "Haz clic en Activar: todo se desbloquea al instante",
    ],
    download: "Descargar Xico Clean",
    support: "¿Necesitas ayuda? Contacta soporte",
  },
  fr: {
    title: "Activer Xico Clean",
    yourKey: "Votre clé d'activation",
    copy: "Copier la clé",
    copied: "Copié ✓",
    noKey: "Cette page affiche les clés d'activation. Après achat, utilisez le lien de la page de confirmation ou de votre e-mail.",
    steps: [
      "Téléchargez et ouvrez Xico Clean",
      "Réglages → Passer à Pro, collez la clé",
      "Cliquez sur Activer — tout se débloque instantanément",
    ],
    download: "Télécharger Xico Clean",
    support: "Besoin d'aide ? Contactez le support",
  },
  it: {
    title: "Attiva Xico Clean",
    yourKey: "La tua chiave di attivazione",
    copy: "Copia chiave",
    copied: "Copiato ✓",
    noKey: "Questa pagina mostra le chiavi di attivazione. Se hai acquistato, usa il link nella pagina di conferma o nell'email.",
    steps: [
      "Scarica e apri Xico Clean",
      "Vai su Impostazioni → Passa a Pro e incolla la chiave",
      "Fai clic su Attiva: tutto si sblocca all'istante",
    ],
    download: "Scarica Xico Clean",
    support: "Serve aiuto? Contatta il supporto",
  },
  pt: {
    title: "Ativar o Xico Clean",
    yourKey: "Sua chave de ativação",
    copy: "Copiar chave",
    copied: "Copiado ✓",
    noKey: "Esta página exibe chaves de ativação. Se você comprou, use o link da página de confirmação ou do seu e-mail.",
    steps: [
      "Baixe e abra o Xico Clean",
      "Vá em Ajustes → Fazer upgrade para Pro e cole a chave",
      "Clique em Ativar — tudo desbloqueia na hora",
    ],
    download: "Baixar Xico Clean",
    support: "Precisa de ajuda? Fale com o suporte",
  },
  ru: {
    title: "Активация Xico Clean",
    yourKey: "Ваш ключ активации",
    copy: "Скопировать ключ",
    copied: "Скопировано ✓",
    noKey: "Эта страница показывает ключи активации. Если вы купили лицензию, используйте ссылку со страницы подтверждения или из письма.",
    steps: [
      "Скачайте и откройте Xico Clean",
      "Откройте Настройки → Перейти на Pro и вставьте ключ",
      "Нажмите «Активировать» — все функции откроются мгновенно",
    ],
    download: "Скачать Xico Clean",
    support: "Нужна помощь? Напишите в поддержку",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const d = DICTS[locale] ?? DICTS.en;
  return {
    title: { absolute: d.title },
    robots: { index: false },
  };
}

export default async function ActivatePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ key?: string }>;
}) {
  const { locale } = await params;
  const { key } = await searchParams;
  setRequestLocale(locale);
  const d = DICTS[locale] ?? DICTS.en;

  const cleanKey = (key ?? "").replace(/[^\d-]/g, "").slice(0, 22);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-6 py-24">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
        {d.title}
      </h1>

      {cleanKey ? (
        <div className="mt-8">
          <p className="text-sm text-muted">{d.yourKey}</p>
          <ActivateKeyCard
            keyText={cleanKey}
            copyLabel={d.copy}
            copiedLabel={d.copied}
          />
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted">{d.noKey}</p>
      )}

      <ol className="mt-10 flex flex-col gap-4">
        {d.steps.map((step, i) => (
          <li key={step} className="flex items-start gap-3.5">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/12 text-xs font-semibold text-brand">
              {i + 1}
            </span>
            <span className="text-[15px] text-foreground/90">{step}</span>
          </li>
        ))}
      </ol>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <a
          href="/api/download/xico-clean"
          className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
        >
          {d.download}
        </a>
        <Link
          href="/mac/support"
          className="text-sm text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          {d.support}
        </Link>
      </div>
    </div>
  );
}
