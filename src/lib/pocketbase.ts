// src/lib/pocketbase.ts
import PocketBase from 'pocketbase';

export const pb = new PocketBase('http://127.0.0.1:8090');

// 브라우저에서만 필요한 설정 (옵션)
if (typeof window !== 'undefined') {
  pb.autoCancellation(false);
}
