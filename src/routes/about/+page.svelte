<!-- src/routes/about/+page.svelte -->
<script lang="ts">
  import { fade, fly, scale } from 'svelte/transition';
  import { onMount, onDestroy } from 'svelte';
  import { t } from 'svelte-i18n';

  let mounted = false;
  onMount(() => (mounted = true));

  type RoadmapId = 'now' | 'next' | 'later';

  type RoadmapStep = {
    id: RoadmapId;
    phaseKey: string;
    titleKey: string;
    bodyKey: string;
  };

  type Pillar = {
    id: string;
    labelKey: string;
    titleKey: string;
    bodyKey: string;
    bulletsKey: string;
  };

  const pillars: Pillar[] = [
    {
      id: 'capability',
      labelKey: 'about.pillars.capability.label',
      titleKey: 'about.pillars.capability.title',
      bodyKey: 'about.pillars.capability.body',
      bulletsKey: 'about.pillars.capability.bullets'
    },
    {
      id: 'rfqs',
      labelKey: 'about.pillars.rfqs.label',
      titleKey: 'about.pillars.rfqs.title',
      bodyKey: 'about.pillars.rfqs.body',
      bulletsKey: 'about.pillars.rfqs.bullets'
    },
    {
      id: 'decision',
      labelKey: 'about.pillars.decision.label',
      titleKey: 'about.pillars.decision.title',
      bodyKey: 'about.pillars.decision.body',
      bulletsKey: 'about.pillars.decision.bullets'
    }
  ];

  const roadmap: RoadmapStep[] = [
    {
      id: 'now',
      phaseKey: 'about.roadmap.now.phase',
      titleKey: 'about.roadmap.now.title',
      bodyKey: 'about.roadmap.now.body'
    },
    {
      id: 'next',
      phaseKey: 'about.roadmap.next.phase',
      titleKey: 'about.roadmap.next.title',
      bodyKey: 'about.roadmap.next.body'
    },
    {
      id: 'later',
      phaseKey: 'about.roadmap.later.phase',
      titleKey: 'about.roadmap.later.title',
      bodyKey: 'about.roadmap.later.body'
    }
  ];

  let activeRoadmapIndex = 0;
  let roadmapTimer: ReturnType<typeof setInterval> | null = null;

  const startRoadmapCycle = () => {
    if (roadmapTimer) clearInterval(roadmapTimer);
    roadmapTimer = setInterval(() => {
      activeRoadmapIndex = (activeRoadmapIndex + 1) % roadmap.length;
    }, 4500);
  };

  const setActiveRoadmap = (index: number) => {
    activeRoadmapIndex = index;
    startRoadmapCycle();
  };

  onMount(() => {
    startRoadmapCycle();
  });

  onDestroy(() => {
    if (roadmapTimer) clearInterval(roadmapTimer);
  });
</script>

<svelte:head>
  <title>About ▢ NovaNexus</title>
</svelte:head>

<div class="about-shell">
  {#if mounted}
    <main in:fade={{ duration: 220 }}>
      <!-- HERO / OVERVIEW -->
      <section class="hero" in:fly={{ y: 18, duration: 260 }}>
        <div class="hero-left">
          <div class="chip-row shimmer-soft">
            <span class="chip-dot"></span>
            <span class="chip-label">{$t('about.hero.badge')}</span>
          </div>

          <h1 class="hero-title">
            {$t('about.hero.titleStatic')}
            <span class="hero-gradient hero-gradient-animate">
              {$t('about.hero.titleAccent')}
            </span>
          </h1>

          <p class="hero-body">
            {$t('about.hero.body')}
            <span class="hero-strong">
              {$t('about.hero.bodyStrong')}
            </span>
          </p>

          <div class="hero-actions">
            <a href="/rfqs/new" class="btn-primary float-soft-strong">
              <span>{$t('about.hero.ctaSubmit')}</span>
              <span class="btn-icon">→</span>
            </a>
            <a href="/suppliers" class="btn-ghost">
              <span>{$t('about.hero.ctaBecomeSupplier')}</span>
            </a>
          </div>

          <div class="hero-stats">
            <div class="stat-card float-soft" in:fade={{ duration: 260, delay: 80 }}>
              <span class="stat-label">{$t('about.stats.qualifiedSuppliers')}</span>
              <span class="stat-value">160+</span>
            </div>
            <div class="stat-card float-soft" in:fade={{ duration: 260, delay: 160 }}>
              <span class="stat-label">{$t('about.stats.coreVerticals')}</span>
              <span class="stat-value">12</span>
            </div>
            <div class="stat-card float-soft" in:fade={{ duration: 260, delay: 240 }}>
              <span class="stat-label">{$t('about.stats.activeRegions')}</span>
              <span class="stat-value">4</span>
            </div>
          </div>
        </div>

        <!-- RIGHT: PLATFORM MAP VISUAL -->
        <div class="hero-right" in:scale={{ duration: 260, delay: 120, start: 0.9 }}>
          <div class="map-shell float-soft-strong">
            <div class="map-glow"></div>
            <div class="map-frame">
              <div class="map-orbit map-orbit-outer"></div>
              <div class="map-orbit map-orbit-mid"></div>
              <div class="map-orbit map-orbit-inner"></div>

              <div class="map-node node-us pulse-node">
                {$t('about.hero.map.usEurope')}
              </div>
              <div class="map-node node-apac pulse-node-delayed">
                {$t('about.hero.map.koreaApac')}
              </div>
              <div class="map-node node-lines">
                {$t('about.hero.map.linesAutomation')}
              </div>

              <div class="map-core">
                <p class="map-core-kicker">{$t('about.hero.map.kicker')}</p>
                <p class="map-core-body">
                  {$t('about.hero.map.bodyPrefix')}
                  <span class="map-core-strong">
                    {$t('about.hero.map.bodyStrong')}
                  </span>
                </p>
              </div>
            </div>

            <div class="map-metrics">
              <div>
                <p class="map-metric-label">
                  {$t('about.hero.map.metricLiveRfqs')}
                </p>
                <p class="map-metric-value">27</p>
              </div>
              <div>
                <p class="map-metric-label">
                  {$t('about.hero.map.metricTypicalValue')}
                </p>
                <p class="map-metric-value">$180k–$4.8M</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- PILLARS -->
      <section class="pillars-section">
        <header class="pillars-header">
          <h2>{$t('about.pillars.heading')}</h2>
          <p>{$t('about.pillars.subheading')}</p>
        </header>

        <div class="pillars-strip">
          {#each pillars as pillar, i}
            <article
              class="pillar-card"
              id={pillar.id}
              in:fly={{ y: 20, duration: 260, delay: 40 + i * 90 }}
            >
              <div class="pillar-glow"></div>
              <p class="pillar-tag">{$t(pillar.labelKey)}</p>
              <h3>{$t(pillar.titleKey)}</h3>
              <p class="pillar-body">{$t(pillar.bodyKey)}</p>
              <ul>
                {#each $t(pillar.bulletsKey) as b}
                  <li>
                    <span class="pillar-bullet-mark">▢</span>
                    <span>{b}</span>
                  </li>
                {/each}
              </ul>
            </article>
          {/each}
        </div>
      </section>

      <!-- BUYERS & SUPPLIERS SPLIT -->
      <section class="audience-section" in:fade={{ duration: 260, delay: 80 }}>
        <div class="audience-card">
          <h2>{$t('about.buyers.title')}</h2>
          <p class="audience-copy">
            {$t('about.buyers.copy')}
          </p>
          <div class="audience-inner">
            <p class="audience-tag">{$t('about.buyers.overline')}</p>
            <ul>
              {#each $t('about.buyers.benefits') as item}
                <li>
                  <span class="audience-icon">✔</span>
                  <span>{item}</span>
                </li>
              {/each}
            </ul>
          </div>
        </div>

        <div class="audience-card">
          <h2>{$t('about.suppliers.title')}</h2>
          <p class="audience-copy">
            {$t('about.suppliers.copy')}
          </p>
          <div class="audience-inner">
            <p class="audience-tag">{$t('about.suppliers.overline')}</p>
            <ul>
              {#each $t('about.suppliers.benefits') as item}
                <li>
                  <span class="audience-icon dot">●</span>
                  <span>{item}</span>
                </li>
              {/each}
            </ul>
          </div>
        </div>
      </section>

      <!-- ROADMAP (animated timeline) -->
      <section class="roadmap-section" in:fade={{ duration: 260, delay: 100 }}>
        <div class="roadmap-left">
          <h2>{$t('about.roadmap.heading')}</h2>
          <p>
            {$t('about.roadmap.copy')}
          </p>
        </div>

        <div class="roadmap-right">
          <div class="roadmap-track">
            <div class="roadmap-line"></div>
            {#each roadmap as step, index}
              <button
                type="button"
                class="roadmap-dot {index === activeRoadmapIndex ? 'active' : ''}"
                on:mouseenter={() => setActiveRoadmap(index)}
                aria-label={$t(step.phaseKey)}
              ></button>
            {/each}
          </div>

          {#each roadmap as step, index}
            {#if index === activeRoadmapIndex}
              <div in:fade={{ duration: 220 }}>
                <div class="roadmap-panel" in:fly={{ x: 10, duration: 220 }}>
                  <p class="roadmap-phase">{$t(step.phaseKey)}</p>
                  <h3>{$t(step.titleKey)}</h3>
                  <p class="roadmap-body">{$t(step.bodyKey)}</p>
                </div>
              </div>
            {/if}
          {/each}
        </div>
      </section>

      <!-- FINAL CTA -->
      <section class="cta-section" in:fade={{ duration: 260, delay: 120 }}>
        <h3>{$t('about.cta.heading')}</h3>
        <p>
          {$t('about.cta.copy')}
        </p>

        <p class="cta-overline">{$t('about.cta.overline')}</p>

        <div class="cta-actions">
          <a href="/suppliers" class="btn-primary cta-primary float-soft-strong">
            <span>{$t('about.cta.primary')}</span>
            <span class="btn-icon">→</span>
          </a>
          <a href="/how-it-works" class="btn-ghost cta-secondary">
            <span>{$t('about.cta.secondary')}</span>
            <span class="cta-secondary-arrow">⟶</span>
          </a>
        </div>

        <p class="cta-note">{$t('about.cta.note')}</p>
      </section>
    </main>
  {/if}
</div>

<style>
  /* ---- 기존 CSS 그대로 (위에서 주신 것 100% 복붙) ---- */
  .about-shell {
    position: relative;
    background: radial-gradient(circle at top, #020617, #020617 55%, #000814 100%);
    color: #e5e7eb;
    min-height: 100vh;
    overflow: hidden;
  }

  .about-shell::before,
  .about-shell::after {
    content: '';
    position: fixed;
    border-radius: 999px;
    filter: blur(80px);
    opacity: 0.6;
    pointer-events: none;
    z-index: -1;
  }

  .about-shell::before {
    width: 420px;
    height: 420px;
    background: radial-gradient(circle at 30% 30%, #38bdf8, transparent 60%);
    top: -120px;
    left: -80px;
    animation: bg-drift-1 36s ease-in-out infinite alternate;
  }

  .about-shell::after {
    width: 420px;
    height: 420px;
    background: radial-gradient(circle at 70% 70%, #a855f7, transparent 60%);
    bottom: -140px;
    right: -100px;
    animation: bg-drift-2 42s ease-in-out infinite alternate;
  }

  @keyframes bg-drift-1 {
    0% { transform: translate3d(0, 0, 0); opacity: 0.45; }
    50% { transform: translate3d(30px, 40px, 0); opacity: 0.7; }
    100% { transform: translate3d(80px, -10px, 0); opacity: 0.5; }
  }

  @keyframes bg-drift-2 {
    0% { transform: translate3d(0, 0, 0); opacity: 0.5; }
    50% { transform: translate3d(-40px, -30px, 0); opacity: 0.8; }
    100% { transform: translate3d(-90px, 10px, 0); opacity: 0.55; }
  }

  main {
    max-width: 1120px;
    margin: 0 auto;
    padding: 96px 24px 72px;
  }

  .float-soft {
    animation: float-soft 7s ease-in-out infinite;
  }

  .float-soft-strong {
    animation: float-soft-strong 8s ease-in-out infinite;
  }

  .shimmer-soft {
    position: relative;
    overflow: hidden;
  }

  .shimmer-soft::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      120deg,
      transparent,
      rgba(148, 163, 184, 0.45),
      transparent
    );
    transform: translateX(-120%);
    animation: shimmer 7s ease-in-out infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-120%); }
    30% { transform: translateX(140%); }
    100% { transform: translateX(140%); }
  }

  .pulse-node {
    animation: pulse-node 5s ease-in-out infinite;
  }

  .pulse-node-delayed {
    animation: pulse-node 6s ease-in-out infinite;
  }

  @keyframes pulse-node {
    0%, 100% { box-shadow: 0 0 0 rgba(56, 189, 248, 0); transform: translateY(0); }
    50% { box-shadow: 0 0 18px rgba(56, 189, 248, 0.7); transform: translateY(-1px); }
  }

  .hero-gradient-animate {
    background-size: 200% 200%;
    animation: gradient-shift 16s ease-in-out infinite;
  }

  @keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes float-soft {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
  }

  @keyframes float-soft-strong {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }

  /* HERO */

  .hero {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
    gap: 40px;
    align-items: center;
    margin-bottom: 56px;
  }

  .hero-left {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .chip-row {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.5);
    background: rgba(15, 23, 42, 0.9);
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }

  .chip-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: radial-gradient(circle at 30% 30%, #38bdf8, #1d4ed8);
    box-shadow: 0 0 18px rgba(56, 189, 248, 0.9);
  }

  .chip-label {
    color: #e5e7eb;
  }

  .hero-title {
    font-size: 32px;
    line-height: 1.2;
    font-weight: 600;
  }

  .hero-gradient {
    display: inline-block;
    background: linear-gradient(120deg, #38bdf8, #22c1c3, #a855f7);
    -webkit-background-clip: text;
    color: transparent;
  }

  .hero-body {
    font-size: 14px;
    color: #9ca3af;
    max-width: 560px;
  }

  .hero-strong {
    color: #f9fafb;
    font-weight: 500;
  }

  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 4px;
  }

  .btn-primary,
  .btn-ghost {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 9px 20px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    line-height: 1.1;
    transition:
      transform 0.16s ease,
      box-shadow 0.16s ease,
      background 0.16s ease,
      border-color 0.16s ease,
      color 0.16s ease,
      opacity 0.16s ease;
    cursor: pointer;
  }

  .btn-icon {
    font-size: 13px;
    transition: transform 0.16s ease;
  }

  .btn-primary {
    background: linear-gradient(135deg, #3b82f6, #22c1c3, #a855f7);
    color: #e5e7eb;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.95);
  }

  .btn-primary:hover {
    transform: translateY(-1px) scale(1.01);
    box-shadow: 0 24px 60px rgba(15, 23, 42, 1);
  }

  .btn-primary:hover .btn-icon {
    transform: translateX(2px);
  }

  .btn-ghost {
    border: 1px solid rgba(148, 163, 184, 0.8);
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.96), #020617);
    color: #e5e7eb;
  }

  .btn-ghost:hover {
    border-color: rgba(248, 250, 252, 0.9);
    background: radial-gradient(circle at top, rgba(30, 64, 175, 0.55), #020617);
    transform: translateY(-1px);
  }

  .hero-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-top: 10px;
    align-items: stretch;
  }

  .stat-card {
    padding: 10px 14px;
    border-radius: 18px;
    border: 1px solid rgba(30, 64, 175, 0.7);
    background: radial-gradient(circle at top, rgba(30, 64, 175, 0.5), rgba(15, 23, 42, 0.98));
    box-shadow: 0 20px 45px rgba(15, 23, 42, 0.95);
    font-size: 11px;
    position: relative;
    overflow: hidden;

    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    min-height: 86px;
  }

  .stat-card::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at top, rgba(56, 189, 248, 0.18), transparent 55%);
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .stat-card:hover::after {
    opacity: 1;
  }

  .stat-label {
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: #bfdbfe;
    font-size: 10px;
  }

  .stat-value {
    font-size: 18px;
    font-weight: 600;
    color: #f9fafb;
    line-height: 1.1;
  }

  /* MAP VISUAL */

  .hero-right {
    display: flex;
    justify-content: center;
  }

  .map-shell {
    position: relative;
    width: 260px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .map-glow {
    position: absolute;
    inset: -40px -40px 40%;
    background: radial-gradient(circle at top, rgba(56, 189, 248, 0.3), transparent 70%);
    filter: blur(8px);
    z-index: -1;
    animation: glow-pulse 6s ease-in-out infinite;
  }

  @keyframes glow-pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }

  .map-frame {
    position: relative;
    border-radius: 24px;
    border: 1px solid rgba(148, 163, 184, 0.6);
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.98), #020617);
    padding: 20px;
    box-shadow: 0 28px 80px rgba(15, 23, 42, 0.95);
    overflow: hidden;
  }

  .map-orbit {
    position: absolute;
    inset: 10%;
    border-radius: 999px;
    border: 1px dashed rgba(51, 65, 85, 0.9);
    pointer-events: none;
  }

  .map-orbit-mid {
    inset: 22%;
    opacity: 0.8;
  }

  .map-orbit-inner {
    inset: 36%;
    opacity: 0.7;
  }

  .map-orbit-outer {
    animation: map-orbit-spin 26s linear infinite;
  }

  .map-orbit-mid {
    animation: map-orbit-spin 34s linear infinite reverse;
  }

  .map-orbit-inner {
    animation: map-orbit-spin 44s linear infinite;
  }

  @keyframes map-orbit-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .map-node {
    position: absolute;
    padding: 4px 8px;
    border-radius: 999px;
    font-size: 10px;
    background: rgba(15, 23, 42, 0.96);
    border: 1px solid rgba(148, 163, 184, 0.7);
    color: #e5e7eb;
    white-space: nowrap;
  }

  .node-us { top: 18%; left: 12%; }
  .node-apac { bottom: 18%; right: 10%; }
  .node-lines { top: 50%; right: 5%; }

  .map-core {
    position: relative;
    margin: 0 auto;
    margin-top: 32px;
    max-width: 180px;
    text-align: center;
    padding: 10px 12px;
    border-radius: 16px;
    border: 1px solid rgba(56, 189, 248, 0.9);
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.98), #020617);
    box-shadow: 0 0 40px rgba(56, 189, 248, 0.7);
  }

  .map-core-kicker {
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #7dd3fc;
    margin-bottom: 4px;
  }

  .map-core-body {
    font-size: 11px;
    color: #e5e7eb;
  }

  .map-core-strong {
    font-weight: 600;
  }

  .map-metrics {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    font-size: 11px;
  }

  .map-metric-label {
    color: #9ca3af;
  }

  .map-metric-value {
    font-size: 14px;
    font-weight: 600;
    color: #f9fafb;
  }

  /* PILLARS */

  .pillars-section {
    margin-bottom: 52px;
  }

  .pillars-header {
    max-width: 640px;
    margin-bottom: 16px;
  }

  .pillars-header h2 {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .pillars-header p {
    font-size: 14px;
    color: #9ca3af;
  }

  .pillars-strip {
    position: relative;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }

  .pillar-card {
    position: relative;
    border-radius: 22px;
    border: 1px solid rgba(30, 64, 175, 0.8);
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.98), #020617);
    padding: 18px 18px 20px;
    box-shadow: 0 22px 60px rgba(15, 23, 42, 1);
    font-size: 13px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow: hidden;
    transition:
      border-color 0.16s ease,
      box-shadow 0.16s ease,
      transform 0.16s ease;
  }

  .pillar-glow {
    position: absolute;
    inset: -40%;
    background: radial-gradient(circle at top, rgba(56, 189, 248, 0.12), transparent 70%);
    opacity: 0;
    transition: opacity 0.18s ease;
    pointer-events: none;
  }

  .pillar-card:hover .pillar-glow {
    opacity: 1;
  }

  .pillar-card:hover {
    border-color: rgba(56, 189, 248, 0.9);
    box-shadow: 0 28px 80px rgba(15, 23, 42, 1);
    transform: translateY(-2px);
  }

  .pillar-tag {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    color: #64748b;
  }

  .pillar-card h3 {
    font-size: 15px;
    font-weight: 600;
    color: #e5e7eb;
  }

  .pillar-body {
    color: #cbd5f5;
  }

  .pillar-card ul {
    margin-top: 4px;
    padding-left: 0;
    list-style: none;
    color: #9ca3af;
    font-size: 12px;
  }

  .pillar-card li {
    display: flex;
    gap: 6px;
  }

  .pillar-bullet-mark {
    margin-top: 2px;
    color: #38bdf8;
  }

  /* AUDIENCE SECTION */

  .audience-section {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
    margin-bottom: 48px;
  }

  .audience-card {
    border-radius: 24px;
    border: 1px solid rgba(30, 64, 175, 0.9);
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.98), #020617);
    padding: 20px 20px 22px;
    box-shadow: 0 24px 70px rgba(15, 23, 42, 1);
    font-size: 14px;
  }

  .audience-card h2 {
    font-size: 18px;
    font-weight: 600;
  }

  .audience-copy {
    margin-top: 6px;
    color: #9ca3af;
  }

  .audience-inner {
    margin-top: 14px;
    padding: 12px 12px 12px;
    border-radius: 18px;
    border: 1px solid rgba(51, 65, 85, 1);
    background: rgba(15, 23, 42, 0.96);
  }

  .audience-tag {
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #64748b;
    margin-bottom: 6px;
  }

  .audience-inner ul {
    list-style: none;
    padding-left: 0;
    margin: 0;
    font-size: 13px;
  }

  .audience-inner li {
    display: flex;
    gap: 6px;
    margin-top: 4px;
  }

  .audience-icon {
    margin-top: 2px;
    color: #22c55e;
  }

  .audience-icon.dot {
    color: #38bdf8;
  }

  /* ROADMAP */

  .roadmap-section {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    gap: 28px;
    margin-bottom: 48px;
    border-radius: 24px;
    border: 1px solid rgba(15, 23, 42, 0.95);
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.98), #020617);
    padding: 22px 22px 24px;
  }

  .roadmap-left h2 {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .roadmap-left p {
    font-size: 14px;
    color: #9ca3af;
    max-width: 520px;
  }

  .roadmap-right {
    position: relative;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 14px;
    align-items: center;
  }

  .roadmap-track {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 22px;
    padding: 6px 0;
  }

  .roadmap-line {
    position: absolute;
    inset: 10px auto 10px;
    width: 1px;
    background: linear-gradient(
      to bottom,
      rgba(148, 163, 184, 0.6),
      rgba(51, 65, 85, 1),
      rgba(148, 163, 184, 0.6)
    );
  }

  .roadmap-dot {
    position: relative;
    width: 18px;
    height: 18px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.8);
    background: rgba(15, 23, 42, 0.96);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      background 0.16s ease,
      border-color 0.16s ease,
      box-shadow 0.16s ease,
      transform 0.16s ease;
  }

  .roadmap-dot::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: #64748b;
    transition: background 0.16s ease;
  }

  .roadmap-dot:hover {
    border-color: rgba(56, 189, 248, 0.9);
    box-shadow: 0 0 18px rgba(56, 189, 248, 0.7);
  }

  .roadmap-dot.active {
    border-color: rgba(56, 189, 248, 1);
    background: radial-gradient(circle at top, rgba(56, 189, 248, 0.18), #020617);
    box-shadow: 0 0 22px rgba(56, 189, 248, 0.9);
    transform: scale(1.05);
  }

  .roadmap-dot.active::before {
    background: #38bdf8;
  }

  .roadmap-panel {
    border-radius: 18px;
    border: 1px solid rgba(30, 64, 175, 0.75);
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.98), #020617);
    padding: 14px 16px 16px;
    box-shadow: 0 18px 52px rgba(15, 23, 42, 1);
    font-size: 13px;
  }

  .roadmap-panel h3 {
    font-size: 15px;
    font-weight: 600;
    color: #e5e7eb;
    margin-bottom: 4px;
  }

  .roadmap-phase {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    color: #7dd3fc;
    margin-bottom: 4px;
  }

  .roadmap-body {
    color: #d1d5db;
  }

  /* CTA */

  .cta-section {
    text-align: center;
    border-radius: 24px;
    border: 1px solid rgba(148, 163, 184, 0.35);
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.98), #020617);
    padding: 26px 20px 26px;
  }

  .cta-section h3 {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 10px;
  }

  .cta-section p {
    max-width: 560px;
    margin: 0 auto 14px;
    font-size: 14px;
    color: #9ca3af;
  }

  .cta-overline {
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #6b7280;
    margin-top: 4px;
    margin-bottom: 16px;
  }

  .cta-actions {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }

  .cta-primary {
    box-shadow: 0 22px 60px rgba(15, 23, 42, 1), 0 0 26px rgba(56, 189, 248, 0.7);
  }

  .cta-secondary {
    border-radius: 999px;
    padding-inline: 18px;
  }

  .cta-secondary-arrow {
    font-size: 12px;
    transition: transform 0.16s ease;
  }

  .cta-secondary:hover .cta-secondary-arrow {
    transform: translateX(2px);
  }

  .cta-note {
    font-size: 11px;
    color: #6b7280;
  }

  /* RESPONSIVE */

  @media (max-width: 900px) {
    main {
      padding-inline: 16px;
      padding-top: 88px;
    }

    .hero {
      grid-template-columns: minmax(0, 1fr);
      gap: 28px;
    }

    .hero-stats {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .pillars-strip {
      grid-template-columns: minmax(0, 1fr);
    }

    .audience-section {
      grid-template-columns: minmax(0, 1fr);
    }

    .roadmap-section {
      grid-template-columns: minmax(0, 1fr);
      gap: 20px;
    }

    .roadmap-right {
      grid-template-columns: auto minmax(0, 1fr);
    }
  }

  @media (max-width: 640px) {
    .hero-title {
      font-size: 26px;
    }

    .hero-stats {
      grid-template-columns: minmax(0, 1fr);
    }

    .roadmap-section {
      padding: 18px 16px 20px;
    }
  }
</style>
