// src/app.d.ts
// See https://svelte.dev/docs/kit/types#app.d.ts for more information

import type PocketBase, { RecordModel } from "pocketbase";

declare global {
  namespace App {
    /**
     * ✅ PocketBase auth user 모델 타입 (프로젝트 공통 표준)
     *
     * - hooks.server.ts에서 locals.user에 넣는 타입과 반드시 일치해야 함
     * - PocketBase 기본 RecordModel 기반 + 프로젝트에서 쓰는 확장 필드 정의
     *
     * 참고:
     * - PB 기본 users 레코드에는 id, created, updated 등 RecordModel 필드 포함
     * - email/verified 등은 auth 컬렉션에 존재 (설정에 따라 일부 필드 제한 가능)
     */
    interface AppUser extends RecordModel {
      // ---- PocketBase auth에서 흔히 쓰는 필드들(환경/설정 따라 없을 수도 있어 optional) ----
      email?: string;
      emailVisibility?: boolean;
      verified?: boolean;

      // ---- 너의 서비스에서 확장해서 쓰는 필드들(필요한 것만 유지/삭제) ----
      name?: string; // display name
      role?: "buyer" | "supplier" | "both"; // 프로젝트 공통 role
      company?: string;
      title?: string;

      // 프로필 이미지(혹은 파일 필드) 사용 시
      avatar?: string; // PB file field name 예시
      avatarUrl?: string; // 프론트에서 계산/캐시한 URL을 넣는 경우

      // 기타
      status?: "active" | "pending" | "blocked";
      lastLoginAt?: string; // ISO string
    }

    /**
     * ✅ 서버에서 event.locals 로 접근 가능한 값들
     * - hooks.server.ts 에서 세팅하는 내용과 반드시 일치해야 함
     */
    interface Locals {
      /**
       * PocketBase 서버 인스턴스
       * - 모든 서버 로직(+page.server.ts, +layout.server.ts 등)에서 사용
       *   ex) locals.pb.collection('rfqs').getList(...)
       */
      pb: PocketBase;

      /**
       * ✅ 현재 로그인한 유저
       * - 로그인 안 되어 있으면 null
       * - App.AppUser 타입으로 통일 (hooks.server.ts와 일치)
       */
      user: AppUser | null;

      /**
       * 감지된 locale (언어 코드)
       * - hooks.server.ts 에서 쿠키/Accept-Language 기반으로 설정
       * - 예: "en", "ko", "de" ...
       *
       * 더 엄격하게 하고 싶으면 아래처럼 LocaleCode를 만들어서 쓰면 됨:
       *   import type { LocaleCode } from '$lib/i18n/config';
       *   locale?: LocaleCode;
       *
       * 단, app.d.ts에서 $lib import는 TS 설정/경로에 따라 이슈가 날 수 있어
       * 여기서는 안전하게 string 유지.
       */
      locale?: string;

      /**
       * 클라이언트 IP (가능한 경우)
       * - rate limiting, 보안 로그 등에 사용
       */
      clientIp?: string;

      /**
       * 요청 단위 고유 ID
       * - 서버 로그/에러 추적용
       */
      requestId?: string;

      /**
       * (선택) 서버에서 구동되는 “보안 플래그/정책” 같은 것들 확장 가능
       * - ex) isBot, riskScore, geoCountry 등
       */
      // riskScore?: number;
      // geoCountry?: string;
    }

    /**
     * ✅ 각 페이지 load 함수에서 내려주는 공통 데이터 타입
     * - 전역으로 자주 쓰는 값들만 여기에 정의
     */
    interface PageData {
      /**
       * ✅ 현재 로그인 유저 (필요한 페이지에서만 사용)
       * - load({ locals }) 에서 locals.user 넘길 때 타입 자동 인식
       */
      user?: AppUser | null;

      /**
       * 현재 언어 코드
       * - i18n 초기화나 언어 스위처에 사용
       */
      locale?: string;

      /**
       * (선택) 페이지 공통으로 쓰는 플래그들 확장 가능
       * - 예: pricingTrialDays, featureFlags 등
       */
      // featureFlags?: Record<string, boolean>;
    }

    /**
     * ✅ 에러 페이지에서 사용할 수 있는 공통 에러 타입
     * - +error.svelte 에서 data로 받아서 사용 가능
     */
    interface Error {
      message?: string;
      code?: string | number;
      requestId?: string;

      /**
       * (선택) 운영에서 매우 유용:
       * - 어떤 URL에서 났는지
       * - 어떤 사용자였는지
       */
      // path?: string;
      // userId?: string;
    }

    // 필요한 경우에만 확장해서 사용
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
