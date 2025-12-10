// src/lib/pocketbase.ts
import PocketBase from 'pocketbase';
import { browser } from '$app/environment';
import { writable } from 'svelte/store';

// 기본 URL: .env 가 있으면 우선, 없으면 로컬 8090
const baseUrl =
  import.meta.env.VITE_POCKETBASE_URL ?? 'http://127.0.0.1:8090';

// PocketBase 클라이언트 단일 인스턴스
export const pb = new PocketBase(baseUrl);

// 요청 자동 취소 끔 (기존 코드 유지)
pb.autoCancellation(false);

// 현재 로그인 유저를 전역 스토어로 노출
export const currentUser = writable(pb.authStore.model);

// 브라우저 환경에서만 쿠키 ↔ authStore 동기화
if (browser) {
  // 새로고침 시 기존 세션 복원
  pb.authStore.loadFromCookie(document.cookie || '');

  pb.authStore.onChange(() => {
    // 스토어 갱신 (Svelte 컴포넌트에서 반영)
    currentUser.set(pb.authStore.model);

    // 쿠키에 다시 저장 (클라이언트에서도 읽을 수 있게)
    document.cookie = pb.authStore.exportToCookie({
      httpOnly: false, // 프론트 코드에서 읽을 수 있어야 해서 false
      secure: false,   // 배포 시 https면 true 로 바꿔도 됨
      sameSite: 'Lax'
    });
  });
}
