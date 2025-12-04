// src/lib/i18n/config.ts
import { register, init, locale as $locale } from 'svelte-i18n';

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
];

// 각 언어 JSON lazy-load
for (const lang of SUPPORTED_LOCALES) {
  register(lang.code, () => import(`./locales/${lang.code}.json`));
}

// 중복 초기화 방지용 플래그
let initialized = false;

/**
 * SSR + 클라이언트 양쪽에서 안전하게 쓰는 초기화 함수
 */
export function setupI18n(startLocale: string = 'en') {
  if (initialized) return;
  initialized = true;

  // 1) SSR/클라이언트 공통 초기화
  init({
    fallbackLocale: 'en',
    initialLocale: startLocale
  });

  // 2) 브라우저 환경에서만 localStorage / locale 변경 처리
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('locale');

    if (stored) {
      $locale.set(stored);
    } else {
      $locale.set(startLocale);
      localStorage.setItem('locale', startLocale);
    }

    $locale.subscribe((value) => {
      if (value) {
        localStorage.setItem('locale', value);
      }
    });
  }
}
