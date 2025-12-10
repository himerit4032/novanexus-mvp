<!-- src/routes/+page.svelte -->

<svelte:head>
  <title>NovaNexus ▢ Manufacturing & automation sourcing hub</title>
</svelte:head>

<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { t } from 'svelte-i18n';
  import { get } from 'svelte/store';

  let mounted = false;
  onMount(() => (mounted = true));

  /**
   * tr(key, fallback)
   * - locales JSON에 key가 있으면 번역 사용
   * - 없으면 fallback(영문 카피) 사용
   * => 키가 비어 있거나 없어도 화면에 home.xxx 같은 게 절대 안 뜸
   */
  const tr = (key: string, fallback: string) => {
    if (!key) return fallback;
    const translate = get(t);
    const value = translate(key);
    return value === key ? fallback : value;
  };

  // 통계 카드
  const stats = [
    {
      value: '160+',
      labelKey: 'home.stats.factories',
      fallbackLabel: 'Vetted factories & SIs'
    },
    {
      value: '12+',
      labelKey: 'home.stats.industries',
      fallbackLabel: 'Industries covered'
    },
    {
      value: '4',
      labelKey: 'home.stats.regions',
      fallbackLabel: 'Regions live'
    }
  ];

  // 플로우 단계
  const flows = [
    {
      step: '01',
      titleKey: 'home.flow.1.title',
      fallbackTitle: 'Upload one structured RFQ',
      bodyKey: 'home.flow.1.body',
      fallbackBody:
        'Drawings, throughput, standards and target dates in a single, clean intake form.'
    },
    {
      step: '02',
      titleKey: 'home.flow.2.title',
      fallbackTitle: 'We match to the right factories',
      bodyKey: 'home.flow.2.body',
      fallbackBody:
        'Short-listed benches filtered by process, region, envelope and certification – not a bulk email blast.'
    },
    {
      step: '03',
      titleKey: 'home.flow.3.title',
      fallbackTitle: 'Quotes, clarifications, award',
      bodyKey: 'home.flow.3.body',
      fallbackBody:
        'Clarifications, quotes and PO kept in one thread so operations, engineering and finance stay aligned.'
    }
  ];

  // 바이어 / 공급사 / 양쪽 공통
  const pillars = [
    {
      titleKey: 'home.pillars.buyer.title',
      fallbackTitle: 'For buyers & plant teams',
      bodyKey: 'home.pillars.buyer.body',
      fallbackBody:
        'Engineers, operations leads and owners running real production lines – not hobby projects.',
      bulletKeys: [
        'home.pillars.buyer.bullets.0',
        'home.pillars.buyer.bullets.1',
        'home.pillars.buyer.bullets.2'
      ],
      fallbackBullets: [
        'Clean RFQs so suppliers see the real requirement on day one.',
        'Realistic budget, lead time and duty expectations before you commit.',
        'Bench of factories you can reuse across future projects.'
      ],
      href: '/how-it-works#buyer-workflows',
      ctaKey: 'home.pillars.buyer.cta',
      fallbackCta: 'See how buyer workflows look'
    },
    {
      titleKey: 'home.pillars.supplier.title',
      fallbackTitle: 'For suppliers & integrators',
      bodyKey: 'home.pillars.supplier.body',
      fallbackBody:
        'Korean & APAC factories, SIs and automation teams who can actually ship, install and support.',
      bulletKeys: [
        'home.pillars.supplier.bullets.0',
        'home.pillars.supplier.bullets.1',
        'home.pillars.supplier.bullets.2'
      ],
      fallbackBullets: [
        'RFQs that match your machines, certifications and install envelope.',
        'Less time cleaning messy drawings and more time quoting.',
        'Signal on what global buyers are asking for next.'
      ],
      href: '/how-it-works#supplier-playbook',
      ctaKey: 'home.pillars.supplier.cta',
      fallbackCta: 'View supplier playbook'
    },
    {
      titleKey: 'home.pillars.both.title',
      fallbackTitle: 'For both sides, long term',
      bodyKey: 'home.pillars.both.body',
      fallbackBody:
        'One shared surface instead of buried email chains and random spreadsheets.',
      bulletKeys: [
        'home.pillars.both.bullets.0',
        'home.pillars.both.bullets.1',
        'home.pillars.both.bullets.2'
      ],
      fallbackBullets: [
        'Project history you can reference on the next RFQ.',
        'Shared context for operations, finance and leadership.',
        'Clearer decisions on where to build your next line.'
      ],
      href: '/how-it-works#full-pipeline',
      ctaKey: 'home.pillars.both.cta',
      fallbackCta: 'Walk through the full pipeline'
    }
  ];

  // 어떤 종류의 일들이 올라오는지
  const capabilityExamples = [
    {
      labelKey: 'home.capabilities.production.label',
      fallbackLabel: 'Production lines',
      detailKey: 'home.capabilities.production.detail',
      fallbackDetail:
        'Aluminum extrusion, racking & AS/RS, press & coil, conveying, packaging and end-of-line.'
    },
    {
      labelKey: 'home.capabilities.precision.label',
      fallbackLabel: 'Precision & assemblies',
      detailKey: 'home.capabilities.precision.detail',
      fallbackDetail:
        'Machined parts, jigs & fixtures, cleanroom equipment, medical and EV components.'
    },
    {
      labelKey: 'home.capabilities.regions.label',
      fallbackLabel: 'Regions',
      detailKey: 'home.capabilities.regions.detail',
      fallbackDetail:
        'Korea-centric bench with coverage across U.S., EU and SE Asia for fabrication and installation.'
    }
  ];
</script>

{#if mounted}
<main class="home-page" in:fade={{ duration: 220 }}>
  <!-- HERO -->
  <section class="home-hero" in:fly={{ y: 18, duration: 260 }}>
    <div class="home-hero-left">
      <div class="home-hero-pill-row">
        <p class="home-hero-kicker">
          {tr(
            'home.hero.kicker',
            'MANUFACTURING ▢ AUTOMATION ▢ GLOBAL SOURCING'
          )}
        </p>
      </div>

      <h1 class="home-title">
        {tr('home.hero.titleLine1', 'Global manufacturing,')}
        <br />
        <span class="home-title-highlight">
          {tr('home.hero.titleHighlight', 'without the fog.')}
        </span>
      </h1>

      <p class="home-sub">
        {tr(
          'home.hero.sub',
          'Turn complex production projects into clear, quotable work. NovaNexus sits as a neutral layer between buyers and vetted factories, translating drawings, capacity and risk into a shared map both sides can work from.'
        )}
      </p>

      <div class="home-cta-row">
        <a href="/rfqs/new" class="btn-primary">
          <span>{tr('home.hero.primaryCta', 'Submit an RFQ')}</span>
          <span class="btn-arrow">→</span>
        </a>
        <a href="/suppliers" class="btn-ghost">
          {tr('home.hero.secondaryCta', 'Become a vetted supplier')}
        </a>
      </div>

      <div class="home-cta-notes">
        <span class="cta-note">
          {tr(
            'home.hero.noteBuyers',
            'For buyers & plant / project teams'
          )}
        </span>
        <span class="cta-note-divider"></span>
        <span class="cta-note">
          {tr(
            'home.hero.noteSuppliers',
            'For factories, SIs & automation partners'
          )}
        </span>
      </div>

      <div class="home-hero-footnote-row">
        <p class="home-hero-footnote">
          {tr(
            'home.hero.footnote',
            'Built for plant managers, project engineers and owners tired of endless email chains.'
          )}
        </p>
        <div class="scroll-hint">
          <span class="scroll-dot"></span>
          <span class="scroll-label">
            {tr('home.hero.scrollLabel', 'Scroll to see the pipeline')}
          </span>
        </div>
      </div>
    </div>

    <div class="home-hero-right">
      <!-- 배경 애니메이션 레이어 -->
      <div class="hero-grid"></div>
      <div class="home-hero-glow"></div>
      <div class="home-hero-orbit"></div>

      <!-- 파이프라인 카드 -->
      <div class="home-orbit-card">
        <div class="orbit-card-header">
          <span class="orbit-chip">
            {tr('home.orbit.headerLabel', 'RFQ pipeline snapshot')}
          </span>
          <span class="orbit-badge">
            {tr('home.orbit.headerBadge', 'Live demo · read-only')}
          </span>
        </div>

        <div class="orbit-body">
          <div class="orbit-timeline">
            <span class="orbit-line"></span>
            <span class="orbit-dot orbit-dot-1"></span>
            <span class="orbit-dot orbit-dot-2"></span>
            <span class="orbit-dot orbit-dot-3"></span>
            <!-- 움직이는 액티브 점 -->
            <span class="orbit-dot-active"></span>
          </div>

          <div class="orbit-steps">
            <div class="orbit-step">
              <p class="orbit-step-label">
                {tr('home.orbit.steps.1.label', '01 · RFQ intake')}
              </p>
              <p class="orbit-step-text">
                {tr(
                  'home.orbit.steps.1.text',
                  'Clean brief with drawings, throughput and standards in one place.'
                )}
              </p>
            </div>
            <div class="orbit-step">
              <p class="orbit-step-label">
                {tr('home.orbit.steps.2.label', '02 · Bench & matching')}
              </p>
              <p class="orbit-step-text">
                {tr(
                  'home.orbit.steps.2.text',
                  'Short list of factories filtered by process, region and envelope.'
                )}
              </p>
            </div>
            <div class="orbit-step">
              <p class="orbit-step-label">
                {tr('home.orbit.steps.3.label', '03 · Decision layer')}
              </p>
              <p class="orbit-step-text">
                {tr(
                  'home.orbit.steps.3.text',
                  'Comparable quotes, duty impact and risk calls surfaced in one view.'
                )}
              </p>
            </div>
          </div>
        </div>

        <div class="orbit-foot">
          <span class="orbit-foot-label">
            {tr('home.orbit.footerLabel', 'Typical cycle')}
          </span>
          <span class="orbit-foot-value">
            {tr(
              'home.orbit.footerValue',
              '5–12 business days from RFQ to award'
            )}
          </span>
        </div>
      </div>

      <!-- 메트릭 카드 -->
      <div class="home-metrics-card">
        {#each stats as s}
          <div class="home-metric">
            <div class="home-metric-value">{s.value}</div>
            <div class="home-metric-label">
              {tr(s.labelKey, s.fallbackLabel)}
            </div>
          </div>
        {/each}
      </div>

      <p class="home-metrics-note">
        {tr(
          'home.metricsNote',
          'NovaNexus connects production-grade buyers and vetted factories across the U.S., Europe, Korea and the wider APAC region on a single qualified bench.'
        )}
      </p>
    </div>
  </section>

  <!-- PILLARS -->
  <section class="home-pillars" in:fade={{ duration: 260, delay: 80 }}>
    <div class="home-section-head">
      <div>
        <p class="section-kicker">
          {tr('home.pillars.kicker', 'WHO WE BUILD FOR')}
        </p>
        <h2 class="section-title">
          {tr(
            'home.pillars.title',
            'A sourcing cockpit for both sides of the table.'
          )}
        </h2>
        <p class="section-sub">
          {tr(
            'home.pillars.sub',
            'Buyers get clarity. Suppliers get signal. Everyone sees the same version of the project instead of fifteen email threads.'
          )}
        </p>
      </div>
    </div>

    <div class="home-pillars-grid">
      {#each pillars as p}
        <article class="pillar-card">
          <h3 class="pillar-title">
            {tr(p.titleKey, p.fallbackTitle)}
          </h3>
          <p class="pillar-body">
            {tr(p.bodyKey, p.fallbackBody)}
          </p>
          <ul class="pillar-list">
            {#each p.fallbackBullets as fb, i}
              <li>
                ▢ {tr(p.bulletKeys[i], fb)}
              </li>
            {/each}
          </ul>
          <a href={p.href} class="pillar-cta">
            {tr(p.ctaKey, p.fallbackCta)} →
          </a>
        </article>
      {/each}
    </div>
  </section>

  <!-- FLOW SUMMARY -->
  <section class="home-flow" in:fade={{ duration: 260, delay: 110 }}>
    <div class="home-section-head">
      <div>
        <p class="section-kicker">
          {tr('home.flow.kicker', 'HOW THE PIPELINE RUNS')}
        </p>
        <h2 class="section-title">
          {tr(
            'home.flow.title',
            'From RFQ upload to awarded PO in three clean steps.'
          )}
        </h2>
        <p class="section-sub">
          {tr(
            'home.flow.sub',
            'The same structure for every project – whether you’re speccing a single saw or a full shuttle rack line.'
          )}
        </p>
      </div>
      <a href="/how-it-works" class="section-link">
        {tr('home.flow.link', 'See detailed flow')} →
      </a>
    </div>

    <div class="home-flow-grid">
      {#each flows as f}
        <article class="flow-card">
          <div class="flow-header">
            <span class="flow-step">{f.step}</span>
          </div>
          <h3 class="flow-title">
            {tr(f.titleKey, f.fallbackTitle)}
          </h3>
          <p class="flow-body">
            {tr(f.bodyKey, f.fallbackBody)}
          </p>
        </article>
      {/each}
    </div>
  </section>

  <!-- SUPPLIER BENCH TEASER -->
  <section class="home-suppliers" in:fade={{ duration: 260, delay: 130 }}>
    <div class="home-section-head">
      <div>
        <p class="section-kicker">
          {tr('home.capabilities.kicker', 'WHAT LIVES INSIDE THE BENCH')}
        </p>
        <h2 class="section-title">
          {tr(
            'home.capabilities.title',
            'Lines, processes and regions we actually support.'
          )}
        </h2>
        <p class="section-sub">
          {tr(
            'home.capabilities.sub',
            'A curated bench instead of a generic directory. Every factory and SI is mapped by process, certification, envelope and install capability.'
          )}
        </p>
      </div>
      <a href="/suppliers" class="section-link">
        {tr(
          'home.capabilities.link',
          'Explore supplier examples'
        )} →
      </a>
    </div>

    <div class="home-suppliers-grid">
      {#each capabilityExamples as c}
        <article class="cap-card">
          <h3 class="cap-title">
            {tr(c.labelKey, c.fallbackLabel)}
          </h3>
          <p class="cap-body">
            {tr(c.detailKey, c.fallbackDetail)}
          </p>
        </article>
      {/each}
    </div>

    <div class="home-suppliers-note">
      {tr(
        'home.capabilities.note',
        'Bench is intentionally small. New suppliers are added only after running real projects together.'
      )}
    </div>
  </section>

  <!-- FINAL CTA -->
  <section class="home-final" in:fade={{ duration: 260, delay: 150 }}>
    <h2 class="home-final-title">
      {tr(
        'home.final.title',
        'Ready to send a real RFQ instead of another “just checking in” email?'
      )}
    </h2>
    <p class="home-final-sub">
      {tr(
        'home.final.sub',
        'Start with one production-grade project. We’ll help you translate drawings, throughput and constraints into a clean RFQ and route it to the right factories.'
      )}
    </p>

    <div class="home-final-cta-row">
      <a href="/rfqs/new" class="btn-primary">
        <span>
          {tr('home.final.primaryCta', 'Submit an RFQ')}
        </span>
        <span class="btn-arrow">→</span>
      </a>
      <a href="/auth/join" class="btn-ghost">
        {tr('home.final.secondaryCta', 'Join the private beta')}
      </a>
    </div>
  </section>
</main>
{/if}

<style>
  /* 글로벌 타이포: 영문 + 한글 모두 선명하게 */
  .home-page,
  .home-page * {
    font-family:
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      'SF Pro Text',
      'Segoe UI',
      Roboto,
      'Noto Sans KR',
      'Apple SD Gothic Neo',
      sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .home-page {
    position: relative;
    max-width: 1120px;
    margin: 0 auto;
    padding: 96px 24px 72px;
    color: #e5e7eb;
    z-index: 0;
  }

  /* GLOBAL BG & FRAME */

  .home-page::before {
    content: '';
    position: fixed;
    inset: 0;
    z-index: -3;
    pointer-events: none;
    background:
      radial-gradient(circle at 10% 0%, rgba(56, 189, 248, 0.18), transparent 52%),
      radial-gradient(circle at 85% 8%, rgba(129, 140, 248, 0.2), transparent 55%),
      radial-gradient(circle at 50% 95%, #020617, #020617);
  }

  .home-page::after {
    content: '';
    position: absolute;
    inset: 40px 16px auto;
    z-index: -2;
    border-radius: 28px;
    border: 1px solid rgba(148, 163, 184, 0.18);
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.98), rgba(2, 6, 23, 0.96));
    box-shadow:
      0 40px 90px rgba(15, 23, 42, 0.96),
      0 0 0 1px rgba(15, 23, 42, 0.9);
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

  .home-hero-pill-row {
    display: inline-flex;
    align-items: center;
    padding: 4px 18px;
    border-radius: 999px;
    background: radial-gradient(
      circle at top,
      rgba(15, 23, 42, 0.95),
      rgba(15, 23, 42, 0.99)
    );
    border: 1px solid rgba(51, 65, 85, 0.9);
    margin-bottom: 10px;
  }

  .home-hero-kicker {
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #cbd5f5;
    white-space: nowrap;
  }

  /* 타이틀 라인 높이 / 하단 여백 조정해서 g/y 꼬리 절대 안 잘리게 */
  .home-title {
    font-size: 34px;
    line-height: 1.3;
    font-weight: 600;
    margin: 0 0 14px;
    padding-bottom: 6px;
    color: #f9fafb;
  }

  .home-title-highlight {
    background: linear-gradient(120deg, #38bdf8, #22c1c3, #a855f7);
    -webkit-background-clip: text;
    color: transparent;
    display: inline-block;
    background-size: 220% 220%;
    animation: homeTitleGradient 18s ease-in-out infinite;
  }

  @keyframes homeTitleGradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
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

  .home-cta-notes {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin-top: 6px;
    font-size: 10px;
    color: #9ca3af;
  }

  .cta-note {
    white-space: nowrap;
  }

  .cta-note-divider {
    width: 12px;
    height: 1px;
    background: rgba(148, 163, 184, 0.7);
  }

  .home-hero-footnote-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    margin-top: 14px;
  }

  .home-hero-footnote {
    font-size: 11px;
    color: #6b7280;
  }

  .scroll-hint {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: #9ca3af;
    opacity: 0.9;
  }

  .scroll-dot {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: #38bdf8;
    box-shadow: 0 0 10px rgba(56, 189, 248, 0.9);
    animation: scrollPulse 1.6s ease-in-out infinite;
  }

  .scroll-label {
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  @keyframes scrollPulse {
    0% {
      transform: translateY(0);
      opacity: 0.6;
    }
    50% {
      transform: translateY(2px);
      opacity: 1;
    }
    100% {
      transform: translateY(0);
      opacity: 0.6;
    }
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

  .btn-arrow {
    margin-left: 4px;
    font-size: 13px;
    transition: transform 0.18s ease;
  }

  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow:
      0 20px 56px rgba(15, 23, 42, 1),
      0 0 0 1px rgba(248, 250, 252, 0.7);
    opacity: 0.97;
    filter: saturate(1.15);
  }

  .btn-primary:hover .btn-arrow {
    transform: translateX(2px);
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
    min-width: 260px;
  }

  /* 배경 그리드/글로우/오빗 */

  .hero-grid {
    position: absolute;
    inset: -28px -48px 12px 8px;
    opacity: 0.28;
    background-image:
      linear-gradient(to right, rgba(30, 64, 175, 0.45) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(15, 23, 42, 0.8) 1px, transparent 1px);
    background-size: 32px 32px;
    border-radius: 32px;
    z-index: -3;
    mask-image: radial-gradient(circle at top, black, transparent 70%);
  }

  .home-hero-glow {
    position: absolute;
    inset: -70px -80px auto auto;
    background:
      radial-gradient(circle at top, rgba(56, 189, 248, 0.4), transparent 55%),
      radial-gradient(circle at bottom, #020617, #020617);
    filter: blur(20px);
    opacity: 0.95;
    z-index: -2;
    border-radius: 999px;
    animation: glowPulse 10s ease-in-out infinite alternate;
  }

  .home-hero-orbit {
    position: absolute;
    inset: -10px -30px 40px 0;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.26);
    opacity: 0.6;
    z-index: -1;
    box-shadow: 0 0 40px rgba(15, 23, 42, 0.9);
  }

  @keyframes glowPulse {
    0% {
      transform: translateY(0) scale(1);
      opacity: 0.8;
    }
    100% {
      transform: translateY(-16px) scale(1.05);
      opacity: 1;
    }
  }

  /* 파이프라인 카드 */

  .home-orbit-card {
    position: relative;
    border-radius: 22px;
    padding: 16px 18px 14px;
    background:
      radial-gradient(circle at top left, rgba(59, 130, 246, 0.35), rgba(15, 23, 42, 0.98)),
      radial-gradient(circle at bottom right, rgba(8, 47, 73, 0.9), rgba(15, 23, 42, 0.98));
    border: 1px solid rgba(148, 163, 184, 0.7);
    box-shadow:
      0 24px 60px rgba(15, 23, 42, 0.98),
      0 0 0 1px rgba(15, 23, 42, 0.9);
    font-size: 11px;
    overflow: hidden;
    animation: heroCardFloat 11s ease-in-out infinite alternate;
  }

  @keyframes heroCardFloat {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(-8px);
    }
  }

  .home-orbit-card::before {
    content: '';
    position: absolute;
    inset: -40%;
    background:
      radial-gradient(circle at 0% 0%, rgba(56, 189, 248, 0.4), transparent 55%),
      radial-gradient(circle at 100% 100%, rgba(129, 140, 248, 0.25), transparent 60%);
    opacity: 0.35;
    pointer-events: none;
    transform: translate3d(0, 0, 0);
    animation: orbitSweep 18s linear infinite;
  }

  /* 스캐너 라인 (좌 -> 우로 지나가는 빛) */
  .home-orbit-card::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 40%;
    background: linear-gradient(
      to right,
      transparent,
      rgba(248, 250, 252, 0.08),
      transparent
    );
    transform: translateX(-100%);
    pointer-events: none;
    mix-blend-mode: screen;
    animation: scannerSweep 9s ease-in-out infinite;
  }

  @keyframes scannerSweep {
    0% {
      transform: translateX(-110%);
      opacity: 0;
    }
    20% {
      opacity: 1;
    }
    60% {
      transform: translateX(120%);
      opacity: 0.9;
    }
    100% {
      transform: translateX(150%);
      opacity: 0;
    }
  }

  @keyframes orbitSweep {
    0% {
      transform: translate3d(0, 0, 0);
    }
    50% {
      transform: translate3d(-10%, -6%, 0);
    }
    100% {
      transform: translate3d(0, 0, 0);
    }
  }

  .home-orbit-card > * {
    position: relative;
    z-index: 1;
  }

  .orbit-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  .orbit-chip {
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid rgba(191, 219, 254, 0.9);
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font-size: 9px;
    color: #e0f2fe;
    background: rgba(15, 23, 42, 0.9);
  }

  .orbit-badge {
    font-size: 10px;
    color: #bfdbfe;
    opacity: 0.8;
    white-space: nowrap;
  }

  .orbit-body {
    display: flex;
    gap: 12px;
  }

  .orbit-timeline {
    position: relative;
    width: 14px;
    display: flex;
    justify-content: center;
  }

  .orbit-line {
    position: absolute;
    inset: 4px 6px 4px 6px;
    border-radius: 999px;
    background: linear-gradient(to bottom, rgba(56, 189, 248, 0.15), rgba(56, 189, 248, 0.8));
    opacity: 0.9;
  }

  .orbit-dot {
    position: absolute;
    left: 50%;
    width: 7px;
    height: 7px;
    margin-left: -3.5px;
    border-radius: 999px;
    background: #e0f2fe;
    box-shadow: 0 0 10px rgba(191, 219, 254, 0.9);
  }

  .orbit-dot-1 {
    top: 8px;
    animation: orbitDotPulse 3.2s ease-in-out infinite;
  }

  .orbit-dot-2 {
    top: 50%;
    margin-top: -3.5px;
    animation: orbitDotPulse 3.2s ease-in-out infinite 0.6s;
  }

  .orbit-dot-3 {
    bottom: 8px;
    animation: orbitDotPulse 3.2s ease-in-out infinite 1.2s;
  }

  /* 위아래로 움직이는 액티브 점 */
  .orbit-dot-active {
    position: absolute;
    left: 50%;
    width: 8px;
    height: 8px;
    margin-left: -4px;
    border-radius: 999px;
    background: #38bdf8;
    box-shadow:
      0 0 12px rgba(56, 189, 248, 0.9),
      0 0 30px rgba(56, 189, 248, 0.8);
    animation: orbitDotTravel 4.6s ease-in-out infinite;
  }

  @keyframes orbitDotPulse {
    0% {
      transform: scale(0.9);
      opacity: 0.7;
    }
    40% {
      transform: scale(1.15);
      opacity: 1;
    }
    100% {
      transform: scale(0.9);
      opacity: 0.7;
    }
  }

  @keyframes orbitDotTravel {
    0% {
      top: 10px;
    }
    50% {
      top: 50%;
      transform: translateY(-50%);
    }
    100% {
      top: calc(100% - 14px);
    }
  }

  .orbit-steps {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .orbit-step-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: #bfdbfe;
    margin-bottom: 2px;
  }

  .orbit-step-text {
    font-size: 11px;
    color: #e5e7eb;
  }

  .orbit-foot {
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 10px;
    color: #cbd5f5;
  }

  .orbit-foot-label {
    text-transform: uppercase;
    letter-spacing: 0.16em;
    opacity: 0.8;
  }

  .orbit-foot-value {
    font-weight: 500;
    white-space: nowrap;
  }

  /* 메트릭 카드 */

  .home-metrics-card {
    position: relative;
    overflow: hidden;
    display: flex;
    gap: 18px;
    padding: 14px 18px;
    border-radius: 18px;
    background:
      radial-gradient(circle at top left, rgba(59, 130, 246, 0.22), rgba(15, 23, 42, 0.98)),
      radial-gradient(circle at bottom right, rgba(8, 47, 73, 0.9), rgba(15, 23, 42, 0.98));
    border: 1px solid rgba(148, 163, 184, 0.65);
    box-shadow:
      0 20px 50px rgba(15, 23, 42, 0.98),
      0 0 0 1px rgba(15, 23, 42, 0.9);
    font-size: 11px;
    justify-content: space-between;
    margin-top: 10px;
  }

  /* 메트릭 카드 위를 천천히 지나가는 하이라이트 */
  .home-metrics-card::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    background:
      radial-gradient(circle at 0% 0%, rgba(56, 189, 248, 0.14), transparent 55%),
      radial-gradient(circle at 100% 100%, rgba(129, 140, 248, 0.16), transparent 60%);
    opacity: 0;
    mix-blend-mode: screen;
    pointer-events: none;
    animation: metricsSweep 11s ease-in-out infinite;
  }

  @keyframes metricsSweep {
    0% {
      transform: translateX(-18%);
      opacity: 0;
    }
    20% {
      opacity: 0.9;
    }
    60% {
      transform: translateX(14%);
      opacity: 0.6;
    }
    100% {
      transform: translateX(24%);
      opacity: 0;
    }
  }

  .home-metric {
    flex: 1;
    min-width: 0;
    transition: transform 0.18s ease, opacity 0.18s ease;
    opacity: 0.9;
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
    margin-top: 8px;
    max-width: 360px;
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
    font-size: 22px;
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
    transform: translateY(-3px);
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
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  }

  .flow-card:hover {
    transform: translateY(-2px);
    border-color: rgba(148, 163, 184, 0.9);
    box-shadow: 0 24px 60px rgba(15, 23, 42, 1);
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
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  }

  .cap-card:hover {
    transform: translateY(-2px);
    border-color: rgba(148, 163, 184, 0.9);
    box-shadow: 0 24px 60px rgba(15, 23, 42, 1);
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

  @media (max-width: 640px) {
    .home-title {
      font-size: 28px;
    }
  }
</style>
