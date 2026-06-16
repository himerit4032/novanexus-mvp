<!-- src/routes/+layout.svelte -->

<script lang="ts" context="module">
  /**
   * i18n 초기화는 SSR/브라우저 공통으로 여기서 "한 번"만.
   * (클라이언트에서 다시 setupI18n을 호출하면 충돌/중복 로딩이 생길 수 있음)
   */
  import { setupI18n } from '$lib/i18n/config';
  setupI18n('en');
</script>

<script lang="ts">
  import '../app.css';

  import { page } from '$app/stores';
  import { afterNavigate, beforeNavigate } from '$app/navigation';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  import { t, isLoading } from 'svelte-i18n';
  import { locale as localeStore, SUPPORTED_LOCALES } from '$lib/i18n/config';

  import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
  import IndustryUniverseScanner from '$lib/components/IndustryUniverseScanner.svelte';

  let navigating = false;
  let i18nReady = false;

  // ✅ 공개 Live RFQ 페이지 경로 (필요하면 여기만 변경)
  const LIVE_RFQ_PUBLIC_HREF = '/live-rfq';

  // ✅ navLinks에서 Live RFQ를 공개 라우트로 변경
  const navLinks: { href: string; key: string }[] = [
    { href: '/how-it-works', key: 'nav.howItWorks' },
    { href: LIVE_RFQ_PUBLIC_HREF, key: 'nav.liveRFQs' },
    { href: '/suppliers', key: 'nav.forSuppliers' },
    { href: '/pricing', key: 'nav.pricing' },
    { href: '/about', key: 'nav.about' }
  ];

  const isActive = (href: string, currentPath: string) => {
    if (href === '/') return currentPath === '/';
    return currentPath.startsWith(href);
  };

  const normalizeLocale = (raw: string | null) => {
    const code = (raw || 'en').toLowerCase();
    const ok = SUPPORTED_LOCALES?.some?.((x: any) => x.code === code);
    return ok ? code : 'en';
  };

  onMount(() => {
    // ✅ 브라우저에 저장된 locale이 있으면 store만 동기화 (setupI18n 다시 호출 X)
    if (browser) {
      try {
        const saved = normalizeLocale(localStorage.getItem('locale'));
        localeStore.set(saved);
      } catch {}
    }

    const stopLoading = isLoading.subscribe(($loading) => {
      if (!$loading) i18nReady = true;
    });

    const stopBefore = beforeNavigate(() => {
      navigating = true;
    });

    const stopAfter = afterNavigate(() => {
      navigating = false;
    });

    return () => {
      stopLoading();
      stopBefore();
      stopAfter();
    };
  });
</script>

<svelte:head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>NovaNexus</title>
</svelte:head>

<div class="layout-shell">
  <!-- HEADER -->
  <header class="nn-header">
    <div class="nn-header-inner">
      <!-- Logo -->
      <a href="/" class="nn-logo" aria-label="NovaNexus home">
        <span class="nn-logo-dot"></span>
        <span class="nn-logo-text">NovaNexus</span>
      </a>

      <!-- Main nav -->
      <nav class="nn-nav" aria-label="Primary">
        {#each navLinks as link}
          <a
            href={link.href}
            class="nn-nav-link {isActive(link.href, $page.url.pathname) ? 'active' : ''}"
          >
            {#if i18nReady}
              {$t(link.key)}
            {:else}
              {link.key}
            {/if}
          </a>
        {/each}
      </nav>

      <!-- Right side: AI RFQ 버튼 + language + CTAs -->
      <div class="nn-header-right">
        <a href="/ai-intake" class="nn-ai-btn">AI RFQ Check</a>

        <LanguageSwitcher />

        <!-- ✅ 로그인은 /auth/login 으로 -->
        <a href="/auth/login" class="nn-login-btn">
          {#if i18nReady}
            {$t('nav.login')}
          {:else}
            nav.login
          {/if}
        </a>

        <a href="/auth/join" class="nn-join-btn">
          {#if i18nReady}
            {$t('nav.joinBeta')}
          {:else}
            nav.joinBeta
          {/if}
        </a>
      </div>
    </div>

    <!-- Top progress bar -->
    <div class="nn-progress-bar-wrap">
      <div class="nn-progress-bar {navigating ? 'visible' : ''}"></div>
    </div>
  </header>

  <!-- MAIN -->
  <main class="nn-main">
    {#if $page.url.pathname === '/'}
      <IndustryUniverseScanner />
    {/if}

    <slot />
  </main>

  <!-- FOOTER -->
  <footer class="nn-footer">
    <div class="nn-footer-inner">
      <div class="nn-footer-brand">
        <div class="nn-footer-logo">
          <span class="nn-footer-dot"></span>
          <span class="nn-footer-name">NovaNexus</span>
        </div>

        <p class="nn-footer-tagline">
          {#if i18nReady}
            {$t('footer.tagline')}
          {:else}
            footer.tagline
          {/if}
        </p>

        <p class="nn-footer-rights">
          © {new Date().getFullYear()} NovaNexus.
          {#if i18nReady}
            {$t('footer.rights')}
          {:else}
            footer.rights
          {/if}
        </p>
      </div>

      <div class="nn-footer-columns">
        <div class="nn-footer-col">
          <p class="nn-footer-heading">
            {#if i18nReady}
              {$t('footer.platform')}
            {:else}
              footer.platform
            {/if}
          </p>

          <!-- ✅ Footer Live RFQ도 공개 링크로 -->
          <a href={LIVE_RFQ_PUBLIC_HREF} class="nn-footer-link">
            {#if i18nReady}
              {$t('footer.liveRFQs')}
            {:else}
              footer.liveRFQs
            {/if}
          </a>

          <a href="/suppliers" class="nn-footer-link">
            {#if i18nReady}
              {$t('footer.becomeSupplier')}
            {:else}
              footer.becomeSupplier
            {/if}
          </a>

          <a href="/pricing" class="nn-footer-link">
            {#if i18nReady}
              {$t('nav.pricing')}
            {:else}
              nav.pricing
            {/if}
          </a>

          <a href="/about" class="nn-footer-link">
            {#if i18nReady}
              {$t('footer.about')}
            {:else}
              footer.about
            {/if}
          </a>
        </div>

        <div class="nn-footer-col">
          <p class="nn-footer-heading">
            {#if i18nReady}
              {$t('footer.forBuyers')}
            {:else}
              footer.forBuyers
            {/if}
          </p>
          <a href="/dashboard/buyer" class="nn-footer-link">
            {#if i18nReady}
              {$t('footer.buyerDashboard')}
            {:else}
              footer.buyerDashboard
            {/if}
          </a>
          <a href="/contact" class="nn-footer-link">
            {#if i18nReady}
              {$t('footer.contact')}
            {:else}
              footer.contact
            {/if}
          </a>
        </div>

        <div class="nn-footer-col">
          <p class="nn-footer-heading">
            {#if i18nReady}
              {$t('footer.forSuppliers')}
            {:else}
              footer.forSuppliers
            {/if}
          </p>
          <a href="/dashboard/supplier" class="nn-footer-link">
            {#if i18nReady}
              {$t('footer.supplierDashboard')}
            {:else}
              footer.supplierDashboard
            {/if}
          </a>
          <a href="/auth/join" class="nn-footer-link">
            {#if i18nReady}
              {$t('footer.joinBeta')}
            {:else}
              footer.joinBeta
            {/if}
          </a>
        </div>
      </div>
    </div>
  </footer>
</div>

<style>
  /* ✅ 스타일은 당신 원본 그대로 (변경 없음) */
  .layout-shell {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: radial-gradient(circle at top, #020617, #000814 80%);
    color: #e5e7eb;
  }

  .nn-header {
    position: sticky;
    top: 0;
    z-index: 40;
    -webkit-backdrop-filter: blur(16px);
    backdrop-filter: blur(16px);
    background: linear-gradient(
      to bottom,
      rgba(15, 23, 42, 0.92),
      rgba(15, 23, 42, 0.7),
      transparent
    );
    border-bottom: 1px solid rgba(15, 23, 42, 0.9);
  }

  .nn-header-inner {
    max-width: 1120px;
    margin: 0 auto;
    padding: 14px 24px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
  }

  .nn-logo {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
  }

  .nn-logo-dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: radial-gradient(circle at 30% 30%, #38bdf8, #1d4ed8);
    box-shadow: 0 0 18px rgba(56, 189, 248, 0.8);
  }

  .nn-logo-text {
    font-size: 15px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #e5e7eb;
  }

  .nn-nav {
    display: flex;
    align-items: center;
    gap: 18px;
  }

  .nn-nav-link {
    position: relative;
    font-size: 13px;
    color: #9ca3af;
    text-decoration: none;
    padding-bottom: 3px;
    transition:
      color 0.16s ease,
      opacity 0.16s ease;
  }

  .nn-nav-link::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -4px;
    height: 2px;
    border-radius: 999px;
    background: linear-gradient(90deg, #38bdf8, #a855f7);
    transform: scaleX(0);
    transform-origin: center;
    transition: transform 0.18s ease;
  }

  .nn-nav-link:hover {
    color: #e5e7eb;
  }

  .nn-nav-link.active {
    color: #f9fafb;
  }

  .nn-nav-link.active::after {
    transform: scaleX(1);
  }

  .nn-header-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .nn-ai-btn {
    font-size: 12px;
    padding: 7px 14px;
    border-radius: 999px;
    text-decoration: none;
    color: #e5e7eb;
    background: radial-gradient(
      circle at top left,
      rgba(56, 189, 248, 0.15),
      rgba(30, 64, 175, 0.35)
    );
    border: 1px solid rgba(56, 189, 248, 0.8);
    box-shadow:
      0 10px 28px rgba(15, 23, 42, 0.9),
      0 0 18px rgba(56, 189, 248, 0.5);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    backdrop-filter: blur(8px);
    transition:
      transform 0.16s ease,
      box-shadow 0.16s ease,
      border-color 0.16s ease,
      background 0.16s ease;
  }

  .nn-ai-btn:hover {
    transform: translateY(-1px) scale(1.02);
    border-color: rgba(125, 211, 252, 0.95);
    background: radial-gradient(
      circle at top left,
      rgba(56, 189, 248, 0.28),
      rgba(30, 64, 175, 0.55)
    );
    box-shadow:
      0 16px 40px rgba(15, 23, 42, 0.95),
      0 0 22px rgba(56, 189, 248, 0.8);
  }

  .nn-login-btn {
    font-size: 13px;
    padding: 7px 14px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.7);
    color: #e5e7eb;
    text-decoration: none;
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.96), #020617);
    transition:
      background 0.16s ease,
      border-color 0.16s ease,
      transform 0.16s ease;
  }

  .nn-login-btn:hover {
    border-color: rgba(248, 250, 252, 0.9);
    transform: translateY(-1px);
  }

  .nn-join-btn {
    font-size: 13px;
    padding: 8px 18px;
    border-radius: 999px;
    text-decoration: none;
    color: #e5e7eb;
    background: radial-gradient(circle at top left, #fb923c, #db2777, #6366f1);
    box-shadow:
      0 18px 40px rgba(15, 23, 42, 0.95),
      0 0 22px rgba(248, 113, 113, 0.7);
    transition:
      transform 0.16s ease,
      box-shadow 0.16s ease;
  }

  .nn-join-btn:hover {
    transform: translateY(-1px) scale(1.01);
    box-shadow:
      0 24px 60px rgba(15, 23, 42, 1),
      0 0 26px rgba(248, 113, 113, 0.8);
  }

  .nn-progress-bar-wrap {
    position: relative;
    height: 2px;
    overflow: hidden;
  }

  .nn-progress-bar {
    position: absolute;
    inset: 0;
    transform: translateX(-100%);
    background: linear-gradient(90deg, #38bdf8, #22c55e, #a855f7);
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .nn-progress-bar.visible {
    opacity: 1;
    animation: nn-progress 1.4s ease-in-out infinite;
  }

  @keyframes nn-progress {
    0% { transform: translateX(-100%); }
    50% { transform: translateX(-10%); }
    100% { transform: translateX(100%); }
  }

  .nn-main { flex: 1; }

  .nn-footer {
    border-top: 1px solid rgba(15, 23, 42, 0.9);
    background: radial-gradient(circle at top, #020617, #020617 60%, #000814);
    padding: 28px 0 32px;
  }

  .nn-footer-inner {
    max-width: 1120px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    justify-content: space-between;
    gap: 32px;
    align-items: flex-start;
  }

  .nn-footer-brand { max-width: 260px; }

  .nn-footer-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  .nn-footer-dot {
    width: 9px;
    height: 9px;
    border-radius: 999px;
    background: radial-gradient(circle at 30% 30%, #38bdf8, #1d4ed8);
    box-shadow: 0 0 16px rgba(56, 189, 248, 0.8);
  }

  .nn-footer-name {
    font-size: 14px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #e5e7eb;
  }

  .nn-footer-tagline {
    font-size: 13px;
    color: #9ca3af;
    margin-bottom: 8px;
  }

  .nn-footer-rights {
    font-size: 11px;
    color: #6b7280;
  }

  .nn-footer-columns {
    display: flex;
    gap: 32px;
  }

  .nn-footer-col { min-width: 150px; }

  .nn-footer-heading {
    font-size: 12px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #9ca3af;
    margin-bottom: 8px;
  }

  .nn-footer-link {
    display: block;
    font-size: 13px;
    color: #e5e7eb;
    text-decoration: none;
    margin-bottom: 4px;
    opacity: 0.8;
    transition:
      opacity 0.16s ease,
      transform 0.16s ease;
  }

  .nn-footer-link:hover {
    opacity: 1;
    transform: translateX(1px);
  }

  @media (max-width: 900px) {
    .nn-header-inner { padding-inline: 16px; gap: 12px; }
    .nn-nav { display: none; }
    .nn-header-right { gap: 8px; }
    .nn-footer-inner { flex-direction: column; gap: 20px; }
    .nn-footer-columns { width: 100%; justify-content: space-between; }
  }

  @media (max-width: 640px) {
    .nn-footer-columns { flex-direction: column; gap: 16px; }
    .nn-ai-btn { display: none; }
  }
</style>
