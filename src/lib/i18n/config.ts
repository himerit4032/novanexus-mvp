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

// ───────── 유틸 함수들 ─────────

export function isSupportedLocale(
  code: string | null | undefined
): code is LocaleCode {
  return !!code && SUPPORTED_CODES.has(code);
}

// ───────── JSON 번역 파일 lazy-load 등록 ─────────
// Vite의 import.meta.glob 을 이용해서 각 언어의 JSON 파일을 lazy-load
const messageFiles: Record<string, () => Promise<unknown>> = import.meta.glob(
  './locales/*.json'
);

// 코드 기반으로 안전하게 매핑
for (const { code } of SUPPORTED_LOCALES) {
  const path = `./locales/${code}.json`;
  const loader = messageFiles[path];

  if (!loader) {
    console.warn(
      `[i18n] Missing messages file for locale "${code}" (expected at: ${path})`
    );
    continue;
  }

  register(code, loader as any);
}

// ───────── 초기 locale 결정 로직 ─────────

function resolveInitialLocale(
  startLocale: LocaleCode = DEFAULT_LOCALE
): LocaleCode {
  // SSR 환경에서는 window 를 쓸 수 없으니 바로 기본값
  if (!browser) return startLocale;

  // 1) localStorage 우선
  const stored = window.localStorage.getItem('locale');
  if (isSupportedLocale(stored)) return stored;

  // 2) 브라우저 언어 (en-US → en)
  const nav = window.navigator?.language?.split?.('-')?.[0];
  if (isSupportedLocale(nav)) return nav;

  // 3) 지정된 기본값
  return startLocale;
}

let initialized = false;
let initPromise: Promise<void> | null = null;

// ───────── 외부에서 호출하는 초기화 함수 ─────────

/**
 * i18n 을 초기화한다.
 * - 여러 번 호출되어도 실제 init 은 한 번만 수행됨.
 * - 필요하면 await setupI18n() 으로 초기화 완료를 기다릴 수도 있다.
 */
export function setupI18n(startLocale: LocaleCode = DEFAULT_LOCALE): Promise<void> {
  if (initialized && initPromise) return initPromise;

  initialized = true;

  const initial = resolveInitialLocale(startLocale);

  // svelte-i18n 의 init 은 동기지만, 인터페이스는 Promise 로 감싼다.
  init({
    fallbackLocale: DEFAULT_LOCALE,
    initialLocale: initial
  });

  if (browser) {
    // 스토어 값을 명시적으로 세팅
    locale.set(initial);
    window.localStorage.setItem('locale', initial);

    // locale 변경 시 localStorage 에도 반영
    locale.subscribe((value) => {
      if (isSupportedLocale(value)) {
        window.localStorage.setItem('locale', value);
      }
    });
  }

  initPromise = Promise.resolve();
  return initPromise;
}

// ───────── 모듈 로드 시점에서 한 번 자동 초기화 ─────────
// 다른 컴포넌트가 setupI18n() 호출을 깜빡해도
// 이 파일을 import 하기만 하면 기본 locale 은 항상 세팅된다.
setupI18n().catch((err) => {
  console.error('[i18n] Failed to initialize i18n:', err);
});

// ───────── 런타임에서 언어 변경 헬퍼 ─────────

export async function changeLocale(code: string): Promise<void> {
  const next: LocaleCode = isSupportedLocale(code) ? code : DEFAULT_LOCALE;

  // 혹시라도 아직 초기화 전이면 먼저 초기화
  if (!initialized) {
    await setupI18n(next);
  }

  locale.set(next);

  if (browser) {
    window.localStorage.setItem('locale', next);
  }
}

// 다른 컴포넌트에서 바로 쓸 수 있도록 재-export
export { locale };
