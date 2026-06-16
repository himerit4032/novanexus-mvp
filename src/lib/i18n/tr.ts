// src/lib/i18n/tr.ts
import { t } from "svelte-i18n";
import { get } from "svelte/store";

export function tr(key: string, fallback: string): string {
  if (!key) return fallback;
  const translate = get(t);
  const value = translate(key);
  // 번역이 없으면 fallback 사용 (키 그대로 표시되지 않도록)
  if (!value || value === key) return fallback;
  return value;
}
