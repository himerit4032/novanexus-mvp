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

export function isSupportedLocale(
  code: string | null | undefined
): code is LocaleCode {
  return !!code && SUPPORTED_CODES.has(code);
}

// ───────── JSON 번역 파일 lazy-load 등록 ─────────

const messageFiles: Record<string, () => Promise<unknown>> = import.meta.glob(
  './locales/*.json'
);

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

function resolveInitialLocale(startLocale: LocaleCode = DEFAULT_LOCALE): LocaleCode {
  // SSR 단계에서는 window/localStorage 접근 금지
  if (!browser) {
    return startLocale;
  }

  // 1) localStorage에 저장된 값 우선
  const stored = window.localStorage.getItem('locale');
  if (isSupportedLocale(stored)) return stored;

  // 2) 브라우저 언어 (예: en-US → en)
  const nav = window.navigator?.language?.split?.('-')?.[0];
  if (isSupportedLocale(nav)) return nav;

  // 3) 인자로 넘어온 startLocale 또는 기본값
  return startLocale;
}

// 중복 초기화 방지 (클라이언트 컨텍스트 기준)
let initialized = false;

// ───────── 외부에서 호출하는 초기화 함수 ─────────

export function setupI18n(startLocale: LocaleCode = DEFAULT_LOCALE): void {
  if (initialized) return;
  initialized = true;

  const initial = resolveInitialLocale(startLocale);

  // svelte-i18n 내부 스토어 초기 세팅
  init({
    fallbackLocale: DEFAULT_LOCALE,
    initialLocale: initial
  });

  if (browser) {
    // Svelte store와 localStorage를 동기화
    locale.set(initial);
    window.localStorage.setItem('locale', initial);

    locale.subscribe((value) => {
      if (isSupportedLocale(value)) {
        window.localStorage.setItem('locale', value);
      }
    });
  }
}

// ───────── 런타임에서 언어 변경 헬퍼 ─────────

export function changeLocale(code: string): void {
  const next: LocaleCode = isSupportedLocale(code) ? code : DEFAULT_LOCALE;
  // setupI18n가 아직 안 돌았으면 먼저 한 번 보장
  if (!initialized) {
    setupI18n(next);
  }
  locale.set(next);
}

// 다른 컴포넌트에서 바로 쓸 수 있도록 재-export
export { locale };

// 이 모듈이 import 되는 순간 한 번은 항상 초기화되도록 보장
// (SSR과 클라이언트는 각각 한 번씩 별도 컨텍스트에서 실행됨)
setupI18n();
