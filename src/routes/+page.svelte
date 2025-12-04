<!-- src/routes/+page.svelte -->

<svelte:head>
  <title>NovaNexus ▢ Manufacturing & automation sourcing hub</title>
</svelte:head>

<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { t } from 'svelte-i18n';

  let mounted = false;
  onMount(() => (mounted = true));

  // 통계 카드: 값은 그대로, 라벨만 번역 키 사용
  const stats = [
    { labelKey: 'home.stats.suppliersLabel', value: '160+' },
    { labelKey: 'home.stats.industriesLabel', value: '12+' },
    { labelKey: 'home.stats.regionsLabel', value: '4' }
  ];

  // 플로우 단계: 제목/본문을 번역 키로 관리
  const flows = [
    {
      step: '01',
      titleKey: 'home.flow.step1.title',
      bodyKey: 'home.flow.step1.body'
    },
    {
      step: '02',
      titleKey: 'home.flow.step2.title',
      bodyKey: 'home.flow.step2.body'
    },
    {
      step: '03',
      titleKey: 'home.flow.step3.title',
      bodyKey: 'home.flow.step3.body'
    }
  ];

  // 바이어 / 공급사 / 양쪽 공통
  const pillars = [
    {
      titleKey: 'home.pillars.buyers.title',
      bodyKey: 'home.pillars.buyers.body',
      bulletKeys: [
        'home.pillars.buyers.bullet1',
        'home.pillars.buyers.bullet2',
        'home.pillars.buyers.bullet3'
      ],
      href: '/dashboard/buyer',
      ctaKey: 'home.pillars.buyers.cta'
    },
    {
      titleKey: 'home.pillars.suppliers.title',
      bodyKey: 'home.pillars.suppliers.body',
      bulletKeys: [
        'home.pillars.suppliers.bullet1',
        'home.pillars.suppliers.bullet2',
        'home.pillars.suppliers.bullet3'
      ],
      href: '/suppliers/dashboard',
      ctaKey: 'home.pillars.suppliers.cta'
    },
    {
      titleKey: 'home.pillars.both.title',
      bodyKey: 'home.pillars.both.body',
      bulletKeys: [
        'home.pillars.both.bullet1',
        'home.pillars.both.bullet2',
        'home.pillars.both.bullet3'
      ],
      href: '/how-it-works',
      ctaKey: 'home.pillars.both.cta'
    }
  ];

  // 어떤 종류의 일들이 올라오는지
  const capabilityExamples = [
    {
      labelKey: 'home.capabilities.production.label',
      detailKey: 'home.capabilities.production.detail'
    },
    {
      labelKey: 'home.capabilities.precision.label',
      detailKey: 'home.capabilities.precision.detail'
    },
    {
      labelKey: 'home.capabilities.regions.label',
      detailKey: 'home.capabilities.regions.detail'
    }
  ];
</script>

{#if mounted}
<main class="home-page" in:fade={{ duration: 200 }}>
  <!-- HERO -->
  <section class="home-hero" in:fly={{ y: 18, duration: 260 }}>
    <div class="home-hero-left">
      <p class="home-hero-kicker">
        {$t('home.hero.kicker')}
      </p>
      <h1 class="home-title">
        {$t('home.hero.titleLine1')}<br />
        {$t('home.hero.titleLine2')}
      </h1>
      <p class="home-sub">
        {$t('home.hero.sub')}
      </p>

      <div class="home-cta-row">
        <a href="/rfqs/new" class="btn-primary">{$t('home.hero.ctaSubmit')}</a>
        <a href="/suppliers" class="btn-ghost">{$t('home.hero.ctaBrowse')}</a>
      </div>

      <p class="home-hero-footnote">
        {$t('home.hero.footnote') /* 없으면 나중에 추가해도 됨 */}
      </p>
    </div>

    <div class="home-hero-right">
      <div class="home-hero-glow"></div>
      <div class="home-metrics-card">
        {#each stats as s}
          <div class="home-metric">
            <div class="home-metric-value">{s.value}</div>
            <div class="home-metric-label">{$t(s.labelKey)}</div>
          </div>
        {/each}
      </div>
      <p class="home-metrics-note">
        {$t('home.stats.note')}
      </p>
    </div>
  </section>

  <!-- PILLARS: BUYERS / SUPPLIERS / BOTH -->
  <section class="home-pillars" in:fade={{ duration: 260, delay: 80 }}>
    <div class="home-section-head">
      <div>
        <p class="section-kicker">{$t('home.pillars.kicker')}</p>
        <h2 class="section-title">{$t('home.pillars.title')}</h2>
        <p class="section-sub">
          {$t('home.pillars.sub')}
        </p>
      </div>
    </div>

    <div class="home-pillars-grid">
      {#each pillars as p}
        <article class="pillar-card">
          <h3 class="pillar-title">{$t(p.titleKey)}</h3>
          <p class="pillar-body">{$t(p.bodyKey)}</p>
          <ul class="pillar-list">
            {#each p.bulletKeys as key}
              <li>▢ {$t(key)}</li>
            {/each}
          </ul>
          <a href={p.href} class="pillar-cta">{$t(p.ctaKey)} →</a>
        </article>
      {/each}
    </div>
  </section>

  <!-- FLOW SUMMARY -->
  <section class="home-flow" in:fade={{ duration: 260, delay: 110 }}>
    <div class="home-section-head">
      <div>
        <p class="section-kicker">{$t('home.flow.kicker')}</p>
        <h2 class="section-title">{$t('home.flow.title')}</h2>
        <p class="section-sub">
          {$t('home.flow.sub')}
        </p>
      </div>
      <a href="/how-it-works" class="section-link">{$t('home.flow.link')} →</a>
    </div>

    <div class="home-flow-grid">
      {#each flows as f}
        <article class="flow-card">
          <div class="flow-header">
            <span class="flow-step">{f.step}</span>
          </div>
          <h3 class="flow-title">{$t(f.titleKey)}</h3>
          <p class="flow-body">{$t(f.bodyKey)}</p>
        </article>
      {/each}
    </div>
  </section>

  <!-- SUPPLIER BENCH TEASER -->
  <section class="home-suppliers" in:fade={{ duration: 260, delay: 130 }}>
    <div class="home-section-head">
      <div>
        <p class="section-kicker">{$t('home.capabilities.kicker')}</p>
        <h2 class="section-title">{$t('home.capabilities.title')}</h2>
        <p class="section-sub">
          {$t('home.capabilities.sub')}
        </p>
      </div>
      <a href="/suppliers" class="section-link">{$t('home.capabilities.link')} →</a>
    </div>

    <div class="home-suppliers-grid">
      {#each capabilityExamples as c}
        <article class="cap-card">
          <h3 class="cap-title">{$t(c.labelKey)}</h3>
          <p class="cap-body">{$t(c.detailKey)}</p>
        </article>
      {/each}
    </div>

    <div class="home-suppliers-note">
      {$t('home.capabilities.note')}
    </div>
  </section>

  <!-- FINAL CTA -->
  <section class="home-final" in:fade={{ duration: 260, delay: 150 }}>
    <h2 class="home-final-title">{$t('home.final.title')}</h2>
    <p class="home-final-sub">
      {$t('home.final.sub')}
    </p>

    <div class="home-final-cta-row">
      <a href="/rfqs/new" class="btn-primary">{$t('home.final.ctaPrimary')}</a>
      <a href="/dashboard/buyer" class="btn-ghost">{$t('home.final.ctaSecondary')}</a>
    </div>
  </section>
</main>
{/if}

<style>
  .home-page {
    position: relative;
    max-width: 1120px;
    margin: 0 auto;
    padding: 88px 24px 72px;
    color: #e5e7eb;
    z-index: 0;
  }

  /* 배경 글로우 / 프레임 */
  .home-page::before {
    content: '';
    position: fixed;
    inset: 0;
    z-index: -2;
    pointer-events: none;
    background:
      radial-gradient(circle at 10% 0%, rgba(56, 189, 248, 0.16), transparent 55%),
      radial-gradient(circle at 85% 10%, rgba(129, 140, 248, 0.18), transparent 55%),
      radial-gradient(circle at 50% 95%, rgba(15, 23, 42, 1), rgba(2, 6, 23, 1));
  }

  .home-page::after {
    content: '';
    position: absolute;
    inset: 40px 16px auto;
    z-index: -1;
    border-radius: 28px;
    border: 1px solid rgba(148, 163, 184, 0.18);
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.98), rgba(2, 6, 23, 0.96));
    box-shadow:
      0 40px 90px rgba(15, 23, 42, 0.95),
      0 0 0 1px rgba(15, 23, 42, 0.85);
    pointer-events: none;
  }

  /* HERO */

  .home-hero {
    display: flex;
    gap: 44px;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 56px;
    position: relative;
  }

  .home-hero-left {
    flex: 1.6;
  }

  .home-hero-kicker {
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #38bdf8;
    margin-bottom: 8px;
  }

  .home-title {
    font-size: 32px;
    line-height: 1.2;
    font-weight: 600;
    margin-bottom: 12px;
    color: #f9fafb;
  }

  .home-sub {
    font-size: 14px;
    color: #9ca3af;
    max-width: 560px;
  }

  .home-cta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 18px;
  }

  .home-hero-footnote {
    margin-top: 14px;
    font-size: 11px;
    color: #6b7280;
  }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 9px 20px;
    border-radius: 999px;
    background: linear-gradient(135deg, #3b82f6, #22c1c3, #a855f7);
    color: #e5e7eb;
    font-size: 13px;
    font-weight: 600;
    border: none;
    text-decoration: none;
    box-shadow:
      0 14px 36px rgba(15, 23, 42, 0.9),
      0 0 0 1px rgba(148, 163, 184, 0.25);
    transition:
      transform 0.18s ease,
      box-shadow 0.18s ease,
      opacity 0.18s ease,
      filter 0.18s ease;
  }

  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow:
      0 20px 56px rgba(15, 23, 42, 1),
      0 0 0 1px rgba(248, 250, 252, 0.7);
    opacity: 0.97;
    filter: saturate(1.15);
  }

  .btn-ghost {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 9px 18px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.9);
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.98));
    color: #e5e7eb;
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    transition:
      background 0.18s ease,
      border-color 0.18s ease,
      transform 0.18s ease,
      box-shadow 0.18s ease;
  }

  .btn-ghost:hover {
    background: radial-gradient(circle at top, rgba(30, 64, 175, 0.6), rgba(15, 23, 42, 0.98));
    border-color: rgba(209, 213, 219, 1);
    transform: translateY(-1px);
    box-shadow: 0 18px 42px rgba(15, 23, 42, 1);
  }

  .home-hero-right {
    flex: 1;
    position: relative;
  }

  .home-hero-glow {
    position: absolute;
    inset: -60px -70px auto auto;
    background:
      radial-gradient(circle at top, rgba(56, 189, 248, 0.36), transparent 55%),
      radial-gradient(circle at bottom, rgba(15, 23, 42, 1), rgba(2, 6, 23, 1));
    filter: blur(18px);
    opacity: 0.95;
    z-index: -1;
    border-radius: 999px;
    animation: glowPulse 10s ease-in-out infinite alternate;
  }

  @keyframes glowPulse {
    0% {
      transform: translateY(0) scale(1);
      opacity: 0.8;
    }
    100% {
      transform: translateY(-16px) scale(1.06);
      opacity: 1;
    }
  }

  .home-metrics-card {
    display: flex;
    gap: 18px;
    padding: 16px 20px;
    border-radius: 20px;
    background:
      radial-gradient(circle at top left, rgba(59, 130, 246, 0.26), rgba(15, 23, 42, 0.98)),
      radial-gradient(circle at bottom right, rgba(8, 47, 73, 0.9), rgba(15, 23, 42, 0.98));
    border: 1px solid rgba(148, 163, 184, 0.65);
    box-shadow:
      0 22px 52px rgba(15, 23, 42, 0.98),
      0 0 0 1px rgba(15, 23, 42, 0.9);
    font-size: 11px;
    justify-content: space-between;
  }

  .home-metric {
    flex: 1;
    min-width: 0;
    transition: transform 0.18s ease, opacity 0.18s ease;
  }

  .home-metric:hover {
    transform: translateY(-2px);
    opacity: 1;
  }

  .home-metric-value {
    font-size: 20px;
    font-weight: 600;
    color: #f9fafb;
  }

  .home-metric-label {
    color: #cbd5f5;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font-size: 10px;
    margin-top: 4px;
  }

  .home-metrics-note {
    font-size: 11px;
    color: #6b7280;
    margin-top: 10px;
    max-width: 280px;
  }

  @media (max-width: 900px) {
    .home-page::after {
      inset: 72px 10px auto;
    }

    .home-hero {
      flex-direction: column;
      gap: 28px;
    }

    .home-hero-right {
      width: 100%;
    }

    .home-metrics-card {
      width: 100%;
    }

    .home-metrics-note {
      max-width: none;
    }
  }

  /* COMMON SECTION HEAD */

  .home-section-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 16px;
    margin-bottom: 20px;
  }

  .section-kicker {
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #6b7280;
    margin-bottom: 6px;
  }

  .section-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 6px;
    color: #e5e7eb;
  }

  .section-sub {
    font-size: 13px;
    color: #9ca3af;
    max-width: 560px;
  }

  .section-link {
    font-size: 11px;
    color: #bae6fd;
    text-decoration: none;
    font-weight: 600;
    white-space: nowrap;
  }

  .section-link:hover {
    color: #e0f2fe;
  }

  /* PILLARS */

  .home-pillars {
    margin-bottom: 44px;
  }

  .home-pillars-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }

  .pillar-card {
    border-radius: 18px;
    border: 1px solid rgba(31, 41, 55, 1);
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.98), rgba(2, 6, 23, 1));
    padding: 16px 18px 18px;
    box-shadow: 0 20px 40px rgba(15, 23, 42, 1);
    font-size: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  }

  .pillar-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 26px 70px rgba(15, 23, 42, 1);
    border-color: rgba(148, 163, 184, 0.9);
  }

  .pillar-title {
    font-size: 14px;
    font-weight: 600;
    color: #f3f4f6;
  }

  .pillar-body {
    color: #d1d5db;
  }

  .pillar-list {
    margin: 4px 0 4px;
    padding-left: 0;
    list-style: none;
    color: #9ca3af;
  }

  .pillar-list li + li {
    margin-top: 3px;
  }

  .pillar-cta {
    margin-top: auto;
    font-size: 11px;
    color: #bae6fd;
    text-decoration: none;
    font-weight: 600;
  }

  .pillar-cta:hover {
    color: #e0f2fe;
  }

  @media (max-width: 900px) {
    .home-pillars-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  /* FLOW */

  .home-flow {
    margin-bottom: 44px;
  }

  .home-flow-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }

  .flow-card {
    border-radius: 18px;
    border: 1px solid rgba(31, 41, 55, 1);
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.98), rgba(2, 6, 23, 1));
    padding: 16px 18px 18px;
    font-size: 12px;
    box-shadow: 0 18px 42px rgba(15, 23, 42, 1);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .flow-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .flow-step {
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #64748b;
  }

  .flow-title {
    font-size: 14px;
    font-weight: 600;
    color: #e5e7eb;
  }

  .flow-body {
    color: #9ca3af;
  }

  @media (max-width: 900px) {
    .home-flow-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  /* SUPPLIERS TEASER */

  .home-suppliers {
    margin-bottom: 44px;
  }

  .home-suppliers-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }

  .cap-card {
    border-radius: 18px;
    border: 1px solid rgba(31, 41, 55, 1);
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.98), rgba(2, 6, 23, 1));
    padding: 16px 18px 18px;
    font-size: 12px;
    box-shadow: 0 18px 42px rgba(15, 23, 42, 1);
  }

  .cap-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 6px;
    color: #f3f4f6;
  }

  .cap-body {
    color: #9ca3af;
  }

  .home-suppliers-note {
    margin-top: 10px;
    font-size: 11px;
    color: #6b7280;
  }

  @media (max-width: 900px) {
    .home-suppliers-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  /* FINAL CTA */

  .home-final {
    margin-top: 8px;
    padding-top: 24px;
    border-top: 1px solid rgba(31, 41, 55, 1);
    text-align: center;
  }

  .home-final-title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #f9fafb;
  }

  .home-final-sub {
    font-size: 13px;
    color: #9ca3af;
    max-width: 560px;
    margin: 0 auto 16px;
  }

  .home-final-cta-row {
    display: flex;
    justify-content: center;
    gap: 10px;
    flex-wrap: wrap;
  }
</style>
