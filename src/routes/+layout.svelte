<!-- src/routes/+layout.svelte -->

<script lang="ts">
  import { page } from '$app/stores';

  $: currentPath = $page.url.pathname;
</script>

<header class="nn-header">
  <div class="nn-header-inner">
    <!-- 로고 -->
    <a href="/" class="nn-logo">
      <span class="nn-logo-dot"></span>
      NovaNexus
    </a>

    <!-- 네비게이션 -->
    <nav class="nn-nav">
      <a
        href="/#how-it-works"
        class="nn-nav-link"
        aria-label="How NovaNexus works"
      >
        How it works
      </a>

      <a
        href="/rfqs"
        class="nn-nav-link"
        class:selected={currentPath === '/rfqs'}
      >
        Live RFQs
      </a>

      <a
        href="/suppliers"
        class="nn-nav-link"
        class:selected={currentPath === '/suppliers'}
      >
        For suppliers
      </a>

      <a
        href="/#about"
        class="nn-nav-link"
      >
        About
      </a>
    </nav>

    <!-- 오른쪽 버튼 -->
    <div class="nn-nav-cta">
      <button type="button" class="nn-btn-outline">
        Log in
      </button>
      <button type="button" class="nn-btn-pill">
        Join beta
      </button>
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

<style>
  .nn-header {
    position: fixed;
    inset-inline: 0;
    top: 0;
    z-index: 40;
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.96), rgba(15, 23, 42, 0.98));
    border-bottom: 1px solid rgba(148, 163, 184, 0.35);
    backdrop-filter: blur(16px);
  }

  .nn-header-inner {
    max-width: 1120px;
    margin: 0 auto;
    padding: 14px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }

  .nn-logo {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: 12px;
    color: #e5e7eb;
    text-decoration: none;
  }

  .nn-logo-dot {
    width: 12px;
    height: 12px;
    border-radius: 999px;
    background: radial-gradient(circle, #22d3ee, #6366f1);
    box-shadow: 0 0 18px rgba(59, 130, 246, 0.9);
  }

  .nn-nav {
    display: flex;
    align-items: center;
    gap: 18px;
    font-size: 13px;
  }

  .nn-nav-link {
    color: #cbd5f5;
    text-decoration: none;
    opacity: 0.86;
    position: relative;
    padding-bottom: 2px;
    transition: opacity 0.16s ease, color 0.16s ease;
  }

  .nn-nav-link::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -4px;
    width: 0;
    height: 2px;
    border-radius: 999px;
    background: linear-gradient(90deg, #6366f1, #22d3ee);
    transition: width 0.18s ease;
  }

  .nn-nav-link:hover {
    opacity: 1;
    color: #e5e7eb;
  }

  .nn-nav-link:hover::after,
  .nn-nav-link.selected::after {
    width: 100%;
  }

  .nn-nav-cta {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .nn-btn-outline,
  .nn-btn-pill {
    border-radius: 999px;
    padding: 8px 18px;
    font-size: 12px;
    border: 1px solid rgba(148, 163, 184, 0.6);
    background: transparent;
    color: #e5e7eb;
    cursor: pointer;
    transition:
      background 0.18s ease,
      color 0.18s ease,
      border-color 0.18s ease,
      transform 0.18s ease;
    white-space: nowrap;
  }

  .nn-btn-outline:hover {
    background: rgba(15, 23, 42, 0.9);
    transform: translateY(-1px);
  }

  .nn-btn-pill {
    background: linear-gradient(135deg, #6366f1, #22d3ee);
    color: #020617;
    border-color: rgba(129, 140, 248, 0.9);
    font-weight: 600;
  }

  .nn-btn-pill:hover {
    filter: brightness(1.06);
    transform: translateY(-1px);
  }

  .nn-main {
    padding-top: 64px; /* 헤더 fixed라서 여유 공간 */
  }

  .nn-footer {
    border-top: 1px solid rgba(31, 41, 55, 0.9);
    background: radial-gradient(circle at bottom, rgba(15, 23, 42, 0.98), #020617);
    margin-top: 32px;
  }

  .nn-footer-inner {
    max-width: 1120px;
    margin: 0 auto;
    padding: 20px 24px 26px;
    display: flex;
    justify-content: space-between;
    gap: 16px;
    font-size: 12px;
    color: #6b7280;
  }

  .nn-footer-links {
    display: flex;
    gap: 14px;
  }

  .nn-footer-links a {
    color: #9ca3af;
    text-decoration: none;
    font-size: 12px;
  }

  .nn-footer-links a:hover {
    color: #e5e7eb;
  }

  @media (max-width: 768px) {
    .nn-header-inner {
      padding-inline: 16px;
      gap: 12px;
    }

    .nn-nav {
      display: none; /* 모바일에서는 일단 숨김 (나중에 햄버거 메뉴 만들면 됨) */
    }

    .nn-footer-inner {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
