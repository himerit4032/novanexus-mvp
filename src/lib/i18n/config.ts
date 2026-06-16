// src/lib/i18n/config.ts
import { register, init, locale as $locale } from "svelte-i18n";
import { browser } from "$app/environment";

// ───────── 지원 언어 정의 ─────────

export const SUPPORTED_LOCALES = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "it", label: "Italiano" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "zh", label: "简体中文" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "ar", label: "العربية" },
] as const;

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number]["code"];

const DEFAULT_LOCALE: LocaleCode = "en";

// ───────── helper ─────────

function isSupported(code: string | null | undefined): code is LocaleCode {
  return !!code && SUPPORTED_LOCALES.some((l) => l.code === code);
}

// 모든 json 파일 lazy-load 등록
for (const { code } of SUPPORTED_LOCALES) {
  register(code, () => import(`./locales/${code}.json`));
}

let initialized = false;

// ───────── 초기화 함수 ─────────

export function setupI18n(preferred?: LocaleCode): void {
  if (initialized) return;

  const initial: LocaleCode = (() => {
    // SSR 에서는 무조건 preferred -> 없으면 en
    if (!browser) return preferred ?? DEFAULT_LOCALE;

    // 1) localStorage 저장값
    const stored = window.localStorage.getItem("locale");
    if (isSupported(stored)) return stored;

    // 2) 브라우저 언어 (en-US -> en)
    const nav = window.navigator.language?.split?.("-")?.[0];
    if (isSupported(nav)) return nav;

    // 3) fallback
    return preferred ?? DEFAULT_LOCALE;
  })();

  init({
    fallbackLocale: DEFAULT_LOCALE,
    initialLocale: initial,
  });

  if (browser) {
    // svelte store + localStorage 동기화
    $locale.set(initial);
    window.localStorage.setItem("locale", initial);

    $locale.subscribe((value) => {
      if (isSupported(value)) {
        window.localStorage.setItem("locale", value);
      }
    });
  }

  initialized = true;
}

// ───────── 런타임에서 언어 변경 ─────────

export function changeLocale(code: string): void {
  const next: LocaleCode = isSupported(code) ? code : DEFAULT_LOCALE;

  // 혹시 아직 초기화 안 됐으면 먼저 초기화
  if (!initialized) {
    setupI18n(next);
  }

  $locale.set(next);

  if (browser) {
    window.localStorage.setItem("locale", next);
  }
}

// 외부에서 locale 스토어도 필요하면 사용
export { $locale as locale };
