<!-- src/routes/+layout.svelte -->

<script lang="ts">
  import '../app.css'; // Tailwind + 전역 CSS

  import { page } from '$app/stores';
  import { afterNavigate, beforeNavigate } from '$app/navigation';
  import { onMount } from 'svelte';

  import { t } from 'svelte-i18n';
  import { setupI18n } from '$lib/i18n/config';
  import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';

  // ✅ i18n 초기화 (config.ts 안에서 한 번만 동작하도록 이미 가드 있음)
  setupI18n();

  let navigating = false;

  const navLinks: { href: string; key: string }[] = [
    { href: '/how-it-works', key: 'nav.howItWorks' },
    { href: '/rfqs', key: 'nav.liveRFQs' },
    { href: '/suppliers', key: 'nav.forSuppliers' },
    { href: '/about', key: 'nav.about' }
  ];

  const isActive = (href: string, currentPath: string) => {
    if (href === '/') return currentPath === '/';
    return currentPath.startsWith(href);
  };

  onMount(() => {
    const stopBefore = beforeNavigate(() => {
      navigating = true;
    });

    const stopAfter = afterNavigate(() => {
      navigating = false;
    });

    return () => {
      stopBefore();
      stopAfter();
    };
  });
</script>

<svelte:head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
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
            {$t(link.key)}
          </a>
        {/each}
      </nav>

      <!-- Right side: language + CTAs -->
      <div class="nn-header-right">
        <LanguageSwitcher />

        <a href="/login" class="nn-login-btn">
          {$t('nav.login')}
        </a>
        <a href="/auth/join" class="nn-join-btn">
          {$t('nav.joinBeta')}
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
          {$t('footer.tagline')}
        </p>
        <p class="nn-footer-rights">
          © {new Date().getFullYear()} NovaNexus. {$t('footer.rights')}
        </p>
      </div>

      <div class="nn-footer-columns">
        <div class="nn-footer-col">
          <p class="nn-footer-heading">
            {$t('footer.platform')}
          </p>
          <a href="/rfqs" class="nn-footer-link">
            {$t('footer.liveRFQs')}
          </a>
          <a href="/suppliers" class="nn-footer-link">
            {$t('footer.becomeSupplier')}
          </a>
          <a href="/about" class="nn-footer-link">
            {$t('footer.about')}
          </a>
        </div>

        <div class="nn-footer-col">
          <p class="nn-footer-heading">
            {$t('footer.forBuyers')}
          </p>
          <a href="/dashboard/buyer" class="nn-footer-link">
            {$t('footer.buyerDashboard')}
          </a>
          <a href="/contact" class="nn-footer-link">
            {$t('footer.contact')}
          </a>
        </div>

        <div class="nn-footer-col">
          <p class="nn-footer-heading">
            {$t('footer.forSuppliers')}
          </p>
          <a href="/dashboard/supplier" class="nn-footer-link">
            {$t('footer.supplierDashboard')}
          </a>
          <a href="/auth/join" class="nn-footer-link">
            {$t('footer.joinBeta')}
          </a>
        </div>
      </div>
    </div>
  </footer>
</div>

<style>
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
    0% {
      transform: translateX(-100%);
    }
    50% {
      transform: translateX(-10%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  .nn-main {
    flex: 1;
  }

  /* FOOTER */

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

  .nn-footer-brand {
    max-width: 260px;
  }

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

  .nn-footer-col {
    min-width: 150px;
  }

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
    .nn-header-inner {
      padding-inline: 16px;
      gap: 12px;
    }

    .nn-nav {
      display: none;
    }

    .nn-footer-inner {
      flex-direction: column;
      gap: 20px;
    }

    .nn-footer-columns {
      width: 100%;
      justify-content: space-between;
    }
  }

  @media (max-width: 640px) {
    .nn-footer-columns {
      flex-direction: column;
      gap: 16px;
    }
  }
</style>
