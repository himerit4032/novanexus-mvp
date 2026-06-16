// src/lib/pocketbase.ts
import PocketBase from 'pocketbase';
import { browser } from '$app/environment';
import { writable } from 'svelte/store';

// ──────────────────────────────────────────────
// PocketBase 기본 URL 설정
//  - 우선순위: VITE_PB_URL → VITE_POCKETBASE_URL → 로컬 8090
//  - 마지막에 슬래시 제거해서 URL 일관성 유지
// ──────────────────────────────────────────────
const rawBaseUrl =
  import.meta.env.VITE_PB_URL ??
  import.meta.env.VITE_POCKETBASE_URL ??
  'http://127.0.0.1:8090';

const baseUrl = rawBaseUrl.replace(/\/+$/, ''); // 뒤 슬래시 제거

// ──────────────────────────────────────────────
// PocketBase 단일 인스턴스
//  - SSR / 브라우저에서 공통 사용
//  - 상대 경로 대신 항상 절대 URL 사용 → SvelteKit fetch 에러 방지
// ──────────────────────────────────────────────
export const pb = new PocketBase(baseUrl);

// 요청 자동 취소 끔 (기존 동작 유지)
pb.autoCancellation(false);

// 현재 로그인 유저를 전역 스토어로 노출
export const currentUser = writable(pb.authStore.model);

// ──────────────────────────────────────────────
// 브라우저 환경에서만 쿠키 ↔ authStore 동기화
//  - 새로고침 시 세션 유지
//  - 로그인/로그아웃 시 currentUser 스토어 및 쿠키 갱신
// ──────────────────────────────────────────────
if (browser) {
  // 페이지 로드 시 기존 쿠키에서 세션 복원
  pb.authStore.loadFromCookie(document.cookie || '');
  currentUser.set(pb.authStore.model);

  pb.authStore.onChange((_token, model) => {
    // Svelte 컴포넌트에서 사용할 currentUser 갱신
    currentUser.set(model);

    // 쿠키에 다시 저장 (프론트 코드에서 읽을 수 있어야 하므로 httpOnly: false)
    const cookie = pb.authStore.exportToCookie({
      httpOnly: false,
      secure: window.location.protocol === 'https:',
      sameSite: 'Lax',
      path: '/', // 전역 경로
    });

    document.cookie = cookie;
  });
}
