<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import '../app.css'; // Tailwind + 전역 CSS
  import { page } from '$app/stores';
  import { afterNavigate, beforeNavigate } from '$app/navigation';
  import { onMount } from 'svelte';

  import { setupI18n } from '$lib/i18n/config';        // i18n 초기화
  import { t } from 'svelte-i18n';                     // 번역 함수(store)
  import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte'; // 언어 선택기

  // 🔹 컴포넌트/페이지가 렌더링되기 전에 i18n 한 번만 초기화
  //    (config.ts 안에 initialized 플래그 있어서 중복 호출 안전)
  setupI18n();

  const links = [
    { href: '/', key: 'nav.howItWorks' },
    { href: '/rfqs', key: 'nav.liveRFQs' },
    { href: '/suppliers', key: 'nav.forSuppliers' },
    { href: '/about', key: 'nav.about' }
  ];

  $: current = $page.url.pathname;

  let navigating = false;

  onMount(() => {
    beforeNavigate(() => {
      navigating = true;
    });

    afterNavigate(() => {
      setTimeout(() => {
        navigating = false;
      }, 200);
    });
  });
</script>

<svelte:head>
  <title>NovaNexus ▢ RFQs for real manufacturing</title>
</svelte:head>

<div class="nn-app">
  <!-- 상단 네비게이션 -->
  <header class="nn-header">
    <div class="nn-header-inner">
      <a class="nn-logo" href="/">
        <span class="nn-logo-dot"></span>
        <span class="nn-logo-text">NOVANEXUS</span>
      </a>

      <nav class="nn-nav">
        {#each links as link}
          <a
            href={link.href}
            class="nn-nav-link {current === link.href ? 'selected' : ''}"
          >
            {$t(link.key)}
          </a>
        {/each}
      </nav>

      <div class="nn-cta">
        <!-- 언어 스위처 -->
        <LanguageSwitcher />

        <a href="/login" class="nn-login-btn">Log in</a>
        <a href="/suppliers" class="nn-beta-btn">
          Join beta
        </a>
      </div>
    </div>
  </header>

  <!-- 페이지 전환 로더 -->
  {#if navigating}
    <div class="nn-page-loader">
      <div class="nn-page-loader-bar"></div>
    </div>
  {/if}

  <!-- 본문 -->
  <main class="nn-main">
    <div class="nn-main-inner">
      <slot />
    </div>
  </main>

  <!-- 푸터 -->
  <footer class="nn-footer">
    <div class="nn-footer-inner">
      <div class="nn-footer-left">
        <div class="nn-footer-logo-row">
          <span class="nn-logo-dot small"></span>
          <span class="nn-footer-name">NovaNexus</span>
        </div>
        <p class="nn-footer-copy">
          RFQ & supplier matching for aluminum lines, racking systems,
          and industrial automation between Korea · APAC · U.S. · Europe.
        </p>
        <p class="nn-footer-meta">
          © {new Date().getFullYear()} NovaNexus. All rights reserved.
        </p>
      </div>

      <div class="nn-footer-cols">
        <div>
          <div class="nn-footer-heading">Platform</div>
          <a href="/rfqs" class="nn-footer-link">Live RFQs</a>
          <a href="/suppliers" class="nn-footer-link">Become a supplier</a>
          <a href="/about" class="nn-footer-link">About NovaNexus</a>
        </div>
        <div>
          <div class="nn-footer-heading">For buyers</div>
          <a href="/dashboard/buyer" class="nn-footer-link">Buyer dashboard</a>
          <a href="/contact" class="nn-footer-link">Contact</a>
        </div>
        <div>
          <div class="nn-footer-heading">For suppliers</div>
          <a href="/dashboard/supplier" class="nn-footer-link">Supplier dashboard</a>
        </div>
      </div>
    </div>
  </footer>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background: #020617;
    color: #e5e7eb;
  }

  .nn-app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* 헤더 */
  .nn-header {
    position: fixed;
    inset: 0 0 auto 0;
    z-index: 40;
    backdrop-filter: blur(16px);
    background: linear-gradient(
      to bottom,
      rgba(2, 6, 23, 0.96),
      rgba(2, 6, 23, 0.8),
      transparent
    );
    border-bottom: 1px solid rgba(148, 163, 184, 0.15);
  }

  .nn-header-inner {
    max-width: 1120px;
    margin: 0 auto;
    padding: 12px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 32px;
  }

  .nn-logo {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
  }

  .nn-logo-dot {
    width: 12px;
    height: 12px;
    border-radius: 999px;
    background: radial-gradient(circle at 30% 30%, #60a5fa, #1d4ed8);
    box-shadow: 0 0 18px rgba(59, 130, 246, 0.7);
  }

  .nn-logo-dot.small {
    width: 9px;
    height: 9px;
  }

  .nn-logo-text {
    font-size: 14px;
    letter-spacing: 0.22em;
    color: #e5e7eb;
  }

  .nn-nav {
    display: flex;
    gap: 22px;
    font-size: 14px;
  }

  .nn-nav-link {
    position: relative;
    text-decoration: none;
    color: #cbd5f5;
    opacity: 0.8;
    padding-bottom: 4px;
    transition: opacity 150ms ease, color 150ms ease;
  }

  .nn-nav-link::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 0;
    height: 2px;
    border-radius: 999px;
    background: linear-gradient(to right, #22d3ee, #0ea5e9);
    transition: width 150ms ease;
  }

  .nn-nav-link:hover {
    opacity: 1;
    color: #f9fafb;
  }

  .nn-nav-link:hover::after {
    width: 100%;
  }

  .nn-nav-link.selected {
    opacity: 1;
    color: #f9fafb;
  }

  .nn-nav-link.selected::after {
    width: 100%;
  }

  .nn-cta {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .nn-login-btn {
    font-size: 13px;
    padding: 8px 14px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.4);
    color: #e5e7eb;
    text-decoration: none;
    background: rgba(15, 23, 42, 0.85);
  }

  .nn-login-btn:hover {
    border-color: rgba(248, 250, 252, 0.8);
  }

  .nn-beta-btn {
    font-size: 13px;
    padding: 9px 18px;
    border-radius: 999px;
    text-decoration: none;
    color: #0b1220;
    font-weight: 600;
    background: radial-gradient(circle at 0 0, #f97316, #e11d48, #6366f1);
    box-shadow: 0 10px 30px rgba(59, 130, 246, 0.45);
  }

  .nn-beta-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 18px 45px rgba(56, 189, 248, 0.4);
  }

  /* 페이지 전환 로더 */
  .nn-page-loader {
    position: fixed;
    inset: 0 0 auto 0;
    z-index: 50;
    pointer-events: none;
  }

  .nn-page-loader-bar {
    height: 3px;
    width: 100%;
    background: linear-gradient(90deg, #22d3ee, #6366f1, #22d3ee);
    background-size: 200% 100%;
    animation: loader-slide 0.8s linear infinite;
  }

  @keyframes loader-slide {
    0% {
      transform: translateX(-40%);
      background-position: 0% 0;
    }
    50% {
      transform: translateX(0%);
      background-position: 100% 0;
    }
    100% {
      transform: translateX(40%);
      background-position: 0% 0;
    }
  }

  .nn-main {
    flex: 1;
    padding-top: 80px;
  }

  .nn-main-inner {
    min-height: calc(100vh - 80px - 160px);
  }

  /* 푸터 */
  .nn-footer {
    border-top: 1px solid rgba(15, 23, 42, 0.95);
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.95), #020617);
    padding: 32px 0 28px;
  }

  .nn-footer-inner {
    max-width: 1120px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    justify-content: space-between;
    gap: 32px;
    align-items: flex-start;
    font-size: 13px;
  }

  .nn-footer-logo-row {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .nn-footer-name {
    letter-spacing: 0.18em;
    font-size: 12px;
    color: #e5e7eb;
  }

  .nn-footer-copy {
    color: #9ca3af;
    max-width: 360px;
    margin: 0 0 6px;
  }

  .nn-footer-meta {
    color: #6b7280;
    font-size: 11px;
  }

  .nn-footer-cols {
    display: flex;
    gap: 40px;
  }

  .nn-footer-heading {
    font-size: 12px;
    font-weight: 600;
    color: #e5e7eb;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  .nn-footer-link {
    display: block;
    font-size: 13px;
    color: #9ca3af;
    text-decoration: none;
    margin-bottom: 4px;
  }

  .nn-footer-link:hover {
    color: #e5e7eb;
  }

  @media (max-width: 768px) {
    .nn-header-inner {
      padding-inline: 16px;
      gap: 16px;
    }

    .nn-nav {
      display: none;
    }

    .nn-main-inner {
      min-height: auto;
    }

    .nn-footer-inner {
      flex-direction: column;
      gap: 20px;
    }

    .nn-footer-cols {
      gap: 24px;
      flex-wrap: wrap;
    }
  }
</style>
