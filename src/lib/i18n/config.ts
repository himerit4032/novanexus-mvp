// src/lib/i18n/config.ts
import { register, init, locale } from 'svelte-i18n';
import { browser } from '$app/environment';

// ───────── 지원 언어 정의 ─────────

export const SUPPORTED_LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'it', label: 'Italiano' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'zh', label: '简体中文' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'ar', label: 'العربية' }
] as const;

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number]['code'];

const DEFAULT_LOCALE: LocaleCode = 'en';
const SUPPORTED_CODES = new Set<string>(SUPPORTED_LOCALES.map((l) => l.code));

export function isSupportedLocale(code: string | null | undefined): code is LocaleCode {
  return !!code && SUPPORTED_CODES.has(code);
}

// ───────── JSON 번역 파일 lazy-load 등록 ─────────

const messageFiles = import.meta.glob('./locales/*.json');

for (const { code } of SUPPORTED_LOCALES) {
  const path = `./locales/${code}.json`;
  const loader = messageFiles[path];

  if (!loader) {
    console.warn(`[i18n] Missing messages file for locale: ${code} (${path})`);
    continue;
  }

  register(code, loader as any);
}

// ───────── 초기 locale 결정 로직 ─────────

function resolveInitialLocale(startLocale: LocaleCode = DEFAULT_LOCALE): LocaleCode {
  if (!browser) {
    // SSR에서는 그냥 기본값만 사용
    return startLocale;
  }

  // 1) localStorage
  const stored = window.localStorage.getItem('locale');
  if (isSupportedLocale(stored)) return stored;

  // 2) 브라우저 언어 (en-US → en)
  const nav = window.navigator?.language?.split?.('-')?.[0];
  if (isSupportedLocale(nav)) return nav;

  // 3) 그 외에는 전달된 startLocale
  return startLocale;
}

// 중복 초기화 방지
let initialized = false;

// ───────── 외부에서 호출하는 초기화 함수 ─────────

export function setupI18n(startLocale: LocaleCode = DEFAULT_LOCALE) {
  if (initialized) return;
  initialized = true;

  const initial = resolveInitialLocale(startLocale);

  init({
    fallbackLocale: DEFAULT_LOCALE,
    initialLocale: initial
  });

  if (browser) {
    // 초기값을 store와 localStorage에 동기화
    locale.set(initial);
    window.localStorage.setItem('locale', initial);

    locale.subscribe((value) => {
      if (isSupportedLocale(value)) {
        window.localStorage.setItem('locale', value);
      }
    });
  }
}

// ───────── 헬퍼들 ─────────

export function changeLocale(code: string) {
  const next: LocaleCode = isSupportedLocale(code) ? code : DEFAULT_LOCALE;
  locale.set(next);
}

// 다른 컴포넌트에서 바로 쓸 수 있도록 재-export
export { locale };
