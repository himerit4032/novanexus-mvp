// src/hooks.server.ts
import type { Handle } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";
import PocketBase from "pocketbase";
import { env } from "$env/dynamic/private";
import { dev } from "$app/environment";

// ─────────────────────────────────────────────
// 상수 / 설정
// ─────────────────────────────────────────────
const SUPPORTED_LOCALES = [
  "en",
  "de",
  "fr",
  "es",
  "it",
  "ja",
  "ko",
  "zh",
  "vi",
  "ar",
] as const;

type SupportedLocaleCode = (typeof SUPPORTED_LOCALES)[number];

const PB_BASE_URL = (() => {
  const fromEnv = env.PB_URL;

  if (!fromEnv) {
    console.warn(`[PB] PB_URL is not set. Falling back to "http://127.0.0.1:8090".`);
    return "http://127.0.0.1:8090";
  }

  if (fromEnv.startsWith("/")) {
    console.warn(
      `[PB] PB_URL is relative ("${fromEnv}"). Using fallback "http://127.0.0.1:8090" instead.`
    );
    return "http://127.0.0.1:8090";
  }

  if (!fromEnv.startsWith("http://") && !fromEnv.startsWith("https://")) {
    console.warn(`[PB] PB_URL has no protocol ("${fromEnv}"). Assuming "http://${fromEnv}".`);
    return `http://${fromEnv}`;
  }

  return fromEnv;
})();

const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30일
const LOCALE_COOKIE_NAME = "nnx_locale";
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1년

const RATE_LIMIT_WINDOW_MS = 15_000; // 15초
const RATE_LIMIT_MAX_REQUESTS = 120; // IP당 15초 120개

type RateBucket = { count: number; windowStart: number };
const rateBuckets = new Map<string, RateBucket>();

// 메모리 누수 방지용(간단한 청소)
const RATE_BUCKET_TTL_MS = 60_000; // 60초 지나면 버킷 정리 대상
let lastRateCleanupAt = 0;

// ─────────────────────────────────────────────
// 유틸: client IP 추출
// ─────────────────────────────────────────────
function getClientIp(event: Parameters<Handle>[0]["event"]): string {
  const anyEvent = event as any;
  const fromAdapter = anyEvent.getClientAddress?.();
  if (fromAdapter && typeof fromAdapter === "string") return fromAdapter;

  const xfwd = event.request.headers.get("x-forwarded-for");
  if (xfwd) {
    const first = xfwd.split(",")[0]?.trim();
    if (first) return first;
  }

  const direct = event.request.headers.get("x-real-ip");
  if (direct) return direct;

  return "unknown";
}

// ─────────────────────────────────────────────
// 유틸: locale 정규화
// ─────────────────────────────────────────────
function normalizeLocale(
  raw: string | null | undefined
): SupportedLocaleCode | null {
  if (!raw) return null;

  const primary = raw.split(",")[0]?.split(";")[0]?.trim() ?? "";
  const base = primary.split("-")[0]?.toLowerCase() ?? "";

  if (SUPPORTED_LOCALES.includes(base as SupportedLocaleCode)) {
    return base as SupportedLocaleCode;
  }
  return null;
}

/**
 * ✅ locale 결정 규칙 (요구사항 반영)
 * 1) URL ?lang=xx 가 있으면 최우선
 * 2) locale cookie가 있으면 그 값
 * 3) 아무 것도 없으면 무조건 "en"
 *
 * ❌ accept-language는 '첫 방문 기본값' 결정에 사용하지 않음
 */
function decideLocale(event: Parameters<Handle>[0]["event"]): {
  locale: SupportedLocaleCode;
  shouldSetCookie: boolean;
  hadLangQuery: boolean;
} {
  const url = new URL(event.request.url);

  // 1) URL override
  const fromQuery = normalizeLocale(url.searchParams.get("lang"));
  if (fromQuery) {
    return { locale: fromQuery, shouldSetCookie: true, hadLangQuery: true };
  }

  // 2) cookie
  const fromCookie = normalizeLocale(event.cookies.get(LOCALE_COOKIE_NAME));
  if (fromCookie) {
    return { locale: fromCookie, shouldSetCookie: false, hadLangQuery: false };
  }

  // 3) first visit default: EN (강제)
  return { locale: "en", shouldSetCookie: true, hadLangQuery: false };
}

// ─────────────────────────────────────────────
// 유틸: rate limiting
// ─────────────────────────────────────────────
function maybeCleanupRateBuckets() {
  const now = Date.now();
  if (now - lastRateCleanupAt < RATE_BUCKET_TTL_MS) return;
  lastRateCleanupAt = now;

  for (const [key, bucket] of rateBuckets) {
    if (now - bucket.windowStart > RATE_BUCKET_TTL_MS) rateBuckets.delete(key);
  }
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(key);

  if (!bucket) {
    rateBuckets.set(key, { count: 1, windowStart: now });
    return true;
  }

  const elapsed = now - bucket.windowStart;

  if (elapsed > RATE_LIMIT_WINDOW_MS) {
    bucket.count = 1;
    bucket.windowStart = now;
    return true;
  }

  bucket.count += 1;
  return bucket.count <= RATE_LIMIT_MAX_REQUESTS;
}

function shouldSkipRateLimit(pathname: string): boolean {
  if (
    pathname.startsWith("/_app/") ||
    pathname.startsWith("/build/") ||
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/font/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt"
  ) {
    return true;
  }
  return false;
}

// ─────────────────────────────────────────────
// 유틸: HTML 네비게이션 요청인지 판별
// ─────────────────────────────────────────────
function isHtmlNavigation(event: Parameters<Handle>[0]["event"]): boolean {
  const accept = event.request.headers.get("accept") ?? "";
  return accept.includes("text/html");
}

// ─────────────────────────────────────────────
// 유틸: 보호 라우트 정의
// ─────────────────────────────────────────────
function isProtectedPath(path: string): boolean {
  const protectedPrefixes = ["/dashboard", "/rfqs", "/buyers", "/suppliers"];
  return protectedPrefixes.some((p) => path === p || path.startsWith(p + "/"));
}

// ─────────────────────────────────────────────
// 메인 handle
// ─────────────────────────────────────────────
export const handle: Handle = async ({ event, resolve }) => {
  const start = Date.now();

  const requestId =
    (globalThis as any).crypto?.randomUUID?.() ??
    Math.random().toString(36).slice(2);

  const clientIp = getClientIp(event);
  const method = event.request.method;
  const url = new URL(event.request.url);
  const path = url.pathname;

  // ✅ 0) /auth/login 라우트 흡수
  if (path === "/auth/login") {
    const next = url.searchParams.get("next");
    const target = next
      ? `/auth/join?next=${encodeURIComponent(next)}`
      : "/auth/join";
    throw redirect(302, target);
  }

  // 1) PocketBase 인스턴스 생성
  const pb = new PocketBase(PB_BASE_URL);

  // 2) auth 쿠키 로드
  const cookieHeader = event.request.headers.get("cookie") ?? "";
  try {
    pb.authStore.loadFromCookie(cookieHeader);
  } catch {
    pb.authStore.clear();
  }

  // 3) locale 결정 (✅ 첫 방문 EN 강제)
  const { locale, shouldSetCookie, hadLangQuery } = decideLocale(event);

  // 4) locals 저장
  event.locals.pb = pb;
  event.locals.user = pb.authStore.isValid
    ? (structuredClone(pb.authStore.model) as App.AppUser)
    : null;
  event.locals.locale = locale;
  event.locals.clientIp = clientIp;
  event.locals.requestId = requestId;

  // ✅ 핵심 수정(500 해결):
  // cookies.set()은 반드시 resolve(event) *이전*에 실행해야 합니다.
  if (shouldSetCookie) {
    event.cookies.set(LOCALE_COOKIE_NAME, locale, {
      path: "/",
      httpOnly: false, // 언어는 클라이언트에서도 읽는 편이 편함
      sameSite: "lax",
      secure: !dev,
      maxAge: LOCALE_COOKIE_MAX_AGE,
    });
  }

  // ✅ (선택) URL에 ?lang= 가 붙어온 경우, 깔끔하게 제거하고 싶은 경우
  // - 이건 resolve 이전에 redirect로 처리해야 합니다.
  // - 쿠키는 위에서 이미 set 되어 다음 요청부터 유지됩니다.
  if (isHtmlNavigation(event) && hadLangQuery) {
    const clean = new URL(event.request.url);
    clean.searchParams.delete("lang");
    const suffix = clean.searchParams.toString();
    throw redirect(302, clean.pathname + (suffix ? `?${suffix}` : ""));
  }

  // 5) 보호 라우트 접근 제어 (HTML 네비게이션일 때만)
  const wantsHtml = isHtmlNavigation(event);
  const isApi = path.startsWith("/api/");
  const hasSession = !!event.locals.user;

  if (wantsHtml && !isApi && isProtectedPath(path) && !hasSession) {
    const next = path + (url.search || "");
    throw redirect(302, `/auth/join?next=${encodeURIComponent(next)}`);
  }

  // 6) rate limiting (정적 리소스 제외)
  if (!shouldSkipRateLimit(path)) {
    maybeCleanupRateBuckets();

    const rateKey = `${clientIp}:${path}`;
    const allowed = checkRateLimit(rateKey);

    if (!allowed) {
      const duration = Date.now() - start;
      console.warn(
        `[RATE-LIMIT] ${requestId} ip=${clientIp} ${method} ${path} blocked (${duration}ms)`
      );

      return new Response("Too many requests. Please slow down.", {
        status: 429,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
  }

  // 7) 실제 라우트 처리
  let response: Response;
  try {
    response = await resolve(event, {
      transformPageChunk: ({ html }) => html,
    });
  } catch (err) {
    console.error(`[ERROR] ${requestId} ip=${clientIp} ${method} ${path}`, err);
    throw err;
  }

  // 8) auth 쿠키 export (PB 세션 유지)
  // - 이건 event.cookies.set을 쓰지 않고 response header에 직접 붙이므로 안전합니다.
  const authCookie = pb.authStore.exportToCookie({
    httpOnly: true,
    secure: !dev,
    sameSite: "Lax",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE,
  });
  response.headers.append("set-cookie", authCookie);

  // 9) 보안 헤더
  const headers = response.headers;
  if (!headers.has("x-frame-options")) headers.set("x-frame-options", "SAMEORIGIN");
  if (!headers.has("x-content-type-options")) headers.set("x-content-type-options", "nosniff");
  if (!headers.has("referrer-policy")) headers.set("referrer-policy", "strict-origin-when-cross-origin");
  if (!headers.has("x-xss-protection")) headers.set("x-xss-protection", "0");

  // 10) 로깅
  const duration = Date.now() - start;
  const userId = event.locals.user?.id ?? "anon";

  const logLine = [
    `[REQ] ${requestId}`,
    `${method} ${path}`,
    `status=${response.status}`,
    `user=${userId}`,
    `ip=${clientIp}`,
    `locale=${locale}`,
    `${duration}ms`,
  ].join(" | ");

  if (response.status >= 500) console.error(logLine);
  else if (response.status >= 400) console.warn(logLine);
  else console.info(logLine);

  return response;
};
