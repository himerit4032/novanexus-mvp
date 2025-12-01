<!-- src/routes/+layout.svelte -->

<script lang="ts">
  import { page } from '$app/stores';

  const links = [
    { href: '/', label: 'How it works' },
    { href: '/rfqs', label: 'Live RFQs' },
    { href: '/suppliers', label: 'For suppliers' },
    { href: '/about', label: 'About' }
  ];

  $: current = $page.url.pathname;
</script>

<header class="nn-header">
  <div class="nn-header-inner">
    <a class="nn-logo" href="/">
      <span class="nn-logo-dot" />
      <span class="nn-logo-text">NOVANEXUS</span>
    </a>

    <nav class="nn-nav">
      {#each links as link}
        <a
          href={link.href}
          class:selected={current === link.href}
          class="nn-nav-link"
        >
          {link.label}
        </a>
      {/each}
    </nav>

    <div class="nn-cta">
      <a href="/login" class="nn-login-btn">Log in</a>
      <a href="/suppliers" class="nn-beta-btn">
        Join beta
      </a>
    </div>
  </div>
</header>


<main class="nn-main">
  <slot />
</main>

<footer class="nn-footer">
  <div class="nn-footer-inner">
    <span>© 2025 NovaNexus. All rights reserved.</span>
    <div class="nn-footer-links">
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
    </div>
  </div>
</footer>

<<style>
  .nn-header {
    position: fixed;
    inset: 0 0 auto 0;
    z-index: 40;
    backdrop-filter: blur(12px);
    background: linear-gradient(
      to bottom,
      rgba(2, 6, 23, 0.92),
      rgba(2, 6, 23, 0.75),
      transparent
    );
    border-bottom: 1px solid rgba(148, 163, 184, 0.15);
  }

  .nn-header-inner {
    max-width: 1120px;
    margin: 0 auto;
    padding: 14px 24px;
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

  .nn-logo-text {
    font-size: 14px;
    letter-spacing: 0.22em;
    color: #e5e7eb;
  }

  .nn-nav {
    display: flex;
    gap: 24px;
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

  /* 현재 페이지 */
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
    gap: 12px;
  }

  .nn-login-btn {
    font-size: 14px;
    padding: 8px 16px;
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
    font-size: 14px;
    padding: 9px 20px;
    border-radius: 999px;
    text-decoration: none;
    color: #0b1220;
    font-weight: 600;
    background: radial-gradient(circle at 0 0, #f97316, #e11d48, #6366f1);
    box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
  }

  .nn-beta-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 18px 45px rgba(56, 189, 248, 0.4);
  }

  @media (max-width: 768px) {
    .nn-header-inner {
      padding-inline: 16px;
      gap: 16px;
    }

    .nn-nav {
      display: none; /* 모바일에선 일단 네비 숨김 (나중에 햄버거 메뉴 만들자) */
    }
  }
</style>
