<!-- src/routes/how-it-works/+page.svelte -->

<svelte:head>
  <title>{$t('nav.howItWorks')} ▢ NovaNexus flow</title>
</svelte:head>

<script lang="ts">
  import { fade, fly, scale } from 'svelte/transition';
  import { t } from 'svelte-i18n';

  // ▸ steps.* : howItWorks.steps.01.title / body … 05까지
  const steps = [
    {
      step: '01',
      titleKey: 'howItWorks.steps.01.title',
      bodyKey: 'howItWorks.steps.01.body'
    },
    {
      step: '02',
      titleKey: 'howItWorks.steps.02.title',
      bodyKey: 'howItWorks.steps.02.body'
    },
    {
      step: '03',
      titleKey: 'howItWorks.steps.03.title',
      bodyKey: 'howItWorks.steps.03.body'
    },
    {
      step: '04',
      titleKey: 'howItWorks.steps.04.title',
      bodyKey: 'howItWorks.steps.04.body'
    },
    {
      step: '05',
      titleKey: 'howItWorks.steps.05.title',
      bodyKey: 'howItWorks.steps.05.body'
    }
  ];

  // ▸ roles.* : howItWorks.roles.buyers / suppliers.*
  const roles = [
    {
      titleKey: 'howItWorks.roles.buyers.title',
      pointKeys: [
        'howItWorks.roles.buyers.point1',
        'howItWorks.roles.buyers.point2',
        'howItWorks.roles.buyers.point3'
      ]
    },
    {
      titleKey: 'howItWorks.roles.suppliers.title',
      pointKeys: [
        'howItWorks.roles.suppliers.point1',
        'howItWorks.roles.suppliers.point2',
        'howItWorks.roles.suppliers.point3'
      ]
    }
  ];
</script>

<main class="how-page">
  <!-- HERO -->
  <section class="how-hero" in:fade={{ duration: 260 }}>
    <div class="how-hero-left" in:fly={{ y: 16, duration: 260 }}>
      <p class="how-kicker">
        {$t('howItWorks.hero.flowBadge')}
      </p>
      <h1 class="how-title">
        {$t('howItWorks.hero.titleLine1')}<br />
        {$t('howItWorks.hero.titleLine2')}
      </h1>
      <p class="how-sub">
        {$t('howItWorks.hero.subtitle')}
      </p>

      <div class="how-anchor-nav">
        <a href="#buyer-workflows">
          <span class="anchor-dot"></span>
          <span>{$t('howItWorks.hero.anchorBuyer')}</span>
        </a>
        <a href="#supplier-playbook">
          <span class="anchor-dot"></span>
          <span>{$t('howItWorks.hero.anchorSupplier')}</span>
        </a>
        <a href="#full-pipeline">
          <span class="anchor-dot"></span>
          <span>{$t('howItWorks.hero.anchorPipeline')}</span>
        </a>
      </div>

      <div class="how-cta-row">
        <a href="/rfqs/new" class="btn-primary">
          <span>{$t('howItWorks.hero.ctaPrimary')}</span>
          <span class="btn-arrow">→</span>
        </a>
        <a href="/buyers" class="btn-ghost">
          {$t('howItWorks.hero.ctaSecondary')}
        </a>
      </div>
    </div>

    <!-- ORBIT / TIMELINE 카드 -->
    <div class="how-hero-orbit" in:scale={{ duration: 260, start: 0.9 }}>
      <div class="orbit-glow"></div>

      <div class="orbit-core">
        <div class="orbit-label-row">
          <span class="orbit-label">
            {$t('howItWorks.orbit.pipelineLabel')}
          </span>
          <span class="orbit-chip">
            {$t('howItWorks.orbit.spineLabel')}
          </span>
        </div>

        <div class="orbit-stat-row">
          <div class="orbit-stat">
            <div class="orbit-stat-value">
              {$t('howItWorks.orbit.factoriesStatValue')}
            </div>
            <div class="orbit-stat-label">
              {$t('howItWorks.orbit.factoriesStatLabel')}
            </div>
          </div>
          <div class="orbit-stat">
            <div class="orbit-stat-value">
              {$t('howItWorks.orbit.stagesStatValue')}
            </div>
            <div class="orbit-stat-label">
              {$t('howItWorks.orbit.stagesStatLabel')}
            </div>
          </div>
        </div>

        <div class="orbit-timeline">
          {#each steps as s, i}
            <div class="orbit-step">
              <div class="orbit-step-index">{s.step}</div>
              <div class="orbit-step-body">
                <div class="orbit-step-title">{$t(s.titleKey)}</div>
                <div class="orbit-step-bar">
                  <span class="orbit-step-fill" style={`--i:${i}`}></span>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <div class="orbit-ring orbit-ring-outer"></div>
      <div class="orbit-ring orbit-ring-inner"></div>

      <div class="orbit-node orbit-node-1">
        <span class="orbit-node-dot"></span>
        <span class="orbit-node-label">
          {$t('howItWorks.orbit.nodeIntake')}
        </span>
      </div>
      <div class="orbit-node orbit-node-2">
        <span class="orbit-node-dot"></span>
        <span class="orbit-node-label">
          {$t('howItWorks.orbit.nodeBench')}
        </span>
      </div>
      <div class="orbit-node orbit-node-3">
        <span class="orbit-node-dot"></span>
        <span class="orbit-node-label">
          {$t('howItWorks.orbit.nodeAward')}
        </span>
      </div>
    </div>
  </section>

  <!-- STEP FLOW (상단 요약) -->
  <section class="how-steps" in:fade={{ duration: 260, delay: 60 }}>
    <div class="section-head">
      <div>
        <p class="section-kicker">
          {$t('howItWorks.stepsSection.kicker')}
        </p>
        <h2 class="section-title">
          {$t('howItWorks.stepsSection.title')}
        </h2>
        <p class="section-sub">
          {$t('howItWorks.stepsSection.subtitle')}
        </p>
      </div>
    </div>

    <div class="steps-grid">
      {#each steps as s, i}
        <article
          class="step-card"
          in:fly={{ y: 12, duration: 260, delay: 60 + i * 70 }}
        >
          <div class="step-header">
            <span class="step-number">{s.step}</span>
            <span class="step-pill">
              {$t('howItWorks.stepsSection.flowPill')}
            </span>
          </div>
          <h3 class="step-title">{$t(s.titleKey)}</h3>
          <p class="step-body">{$t(s.bodyKey)}</p>
        </article>
      {/each}
    </div>

    <div class="steps-track">
      <div class="steps-track-line"></div>
      <div class="steps-track-glow"></div>
    </div>
  </section>

  <!-- ROLES 요약 -->
  <section class="how-roles" in:fade={{ duration: 260, delay: 60 }}>
    <div class="section-head">
      <div>
        <p class="section-kicker">
          {$t('howItWorks.rolesSection.kicker')}
        </p>
        <h2 class="section-title">
          {$t('howItWorks.rolesSection.title')}
        </h2>
      </div>
    </div>

    <div class="roles-grid">
      {#each roles as r, i}
        <article
          class="role-card"
          in:fly={{ y: 14, duration: 260, delay: 60 + i * 90 }}
        >
          <h3 class="role-title">
            {$t(r.titleKey)}
          </h3>
          <ul>
            {#each r.pointKeys as key}
              <li>▢ {$t(key)}</li>
            {/each}
          </ul>
        </article>
      {/each}
    </div>
  </section>

  <!-- BUYER WORKFLOWS -->
  <section id="buyer-workflows" class="detail-section" in:fade={{ duration: 260 }}>
    <div class="section-head">
      <div>
        <p class="detail-kicker">
          {$t('howItWorks.buyerSection.kicker')}
        </p>
        <h2 class="detail-title">
          {$t('howItWorks.buyerSection.title')}
        </h2>
        <p class="section-sub">
          {$t('howItWorks.buyerSection.subtitle')}
        </p>
      </div>
    </div>

    <div class="detail-grid">
      <!-- Buyer · Step 1 -->
      <article class="detail-card" in:fly={{ y: 14, duration: 260 }}>
        <div class="detail-pill-row">
          <span class="detail-pill">
            {$t('howItWorks.buyerSection.step1.pill')}
          </span>
        </div>
        <h3 class="detail-card-title">
          {$t('howItWorks.buyerSection.step1.title')}
        </h3>
        <ul class="detail-list">
          <li>▢ {$t('howItWorks.buyerSection.step1.point1')}</li>
          <li>▢ {$t('howItWorks.buyerSection.step1.point2')}</li>
          <li>▢ {$t('howItWorks.buyerSection.step1.point3')}</li>
          <li>▢ {$t('howItWorks.buyerSection.step1.point4')}</li>
        </ul>
      </article>

      <!-- Buyer · Step 2 -->
      <article class="detail-card" in:fly={{ y: 14, duration: 260, delay: 60 }}>
        <div class="detail-pill-row">
          <span class="detail-pill">
            {$t('howItWorks.buyerSection.step2.pill')}
          </span>
        </div>
        <h3 class="detail-card-title">
          {$t('howItWorks.buyerSection.step2.title')}
        </h3>
        <ul class="detail-list">
          <li>▢ {$t('howItWorks.buyerSection.step2.point1')}</li>
          <li>▢ {$t('howItWorks.buyerSection.step2.point2')}</li>
          <li>▢ {$t('howItWorks.buyerSection.step2.point3')}</li>
          <li>▢ {$t('howItWorks.buyerSection.step2.point4')}</li>
        </ul>
      </article>

      <!-- Buyer · Step 3 -->
      <article class="detail-card" in:fly={{ y: 14, duration: 260, delay: 110 }}>
        <div class="detail-pill-row">
          <span class="detail-pill">
            {$t('howItWorks.buyerSection.step3.pill')}
          </span>
        </div>
        <h3 class="detail-card-title">
          {$t('howItWorks.buyerSection.step3.title')}
        </h3>
        <ul class="detail-list">
          <li>▢ {$t('howItWorks.buyerSection.step3.point1')}</li>
          <li>▢ {$t('howItWorks.buyerSection.step3.point2')}</li>
          <li>▢ {$t('howItWorks.buyerSection.step3.point3')}</li>
          <li>▢ {$t('howItWorks.buyerSection.step3.point4')}</li>
        </ul>
      </article>
    </div>
  </section>

  <!-- SUPPLIER PLAYBOOK -->
  <section id="supplier-playbook" class="detail-section" in:fade={{ duration: 260 }}>
    <div class="section-head">
      <div>
        <p class="detail-kicker">
          {$t('howItWorks.supplierSection.kicker')}
        </p>
        <h2 class="detail-title">
          {$t('howItWorks.supplierSection.title')}
        </h2>
        <p class="section-sub">
          {$t('howItWorks.supplierSection.subtitle')}
        </p>
      </div>
    </div>

    <div class="detail-grid">
      <!-- Supplier · Before RFQs -->
      <article class="detail-card" in:fly={{ y: 14, duration: 260 }}>
        <div class="detail-pill-row">
          <span class="detail-pill">
            {$t('howItWorks.supplierSection.before.pill')}
          </span>
        </div>
        <h3 class="detail-card-title">
          {$t('howItWorks.supplierSection.before.title')}
        </h3>
        <ul class="detail-list">
          <li>▢ {$t('howItWorks.supplierSection.before.point1')}</li>
          <li>▢ {$t('howItWorks.supplierSection.before.point2')}</li>
          <li>▢ {$t('howItWorks.supplierSection.before.point3')}</li>
          <li>▢ {$t('howItWorks.supplierSection.before.point4')}</li>
        </ul>
      </article>

      <!-- Supplier · When RFQs land -->
      <article class="detail-card" in:fly={{ y: 14, duration: 260, delay: 60 }}>
        <div class="detail-pill-row">
          <span class="detail-pill">
            {$t('howItWorks.supplierSection.during.pill')}
          </span>
        </div>
        <h3 class="detail-card-title">
          {$t('howItWorks.supplierSection.during.title')}
        </h3>
        <ul class="detail-list">
          <li>▢ {$t('howItWorks.supplierSection.during.point1')}</li>
          <li>▢ {$t('howItWorks.supplierSection.during.point2')}</li>
          <li>▢ {$t('howItWorks.supplierSection.during.point3')}</li>
          <li>▢ {$t('howItWorks.supplierSection.during.point4')}</li>
        </ul>
      </article>

      <!-- Supplier · After you win -->
      <article class="detail-card" in:fly={{ y: 14, duration: 260, delay: 110 }}>
        <div class="detail-pill-row">
          <span class="detail-pill">
            {$t('howItWorks.supplierSection.after.pill')}
          </span>
        </div>
        <h3 class="detail-card-title">
          {$t('howItWorks.supplierSection.after.title')}
        </h3>
        <ul class="detail-list">
          <li>▢ {$t('howItWorks.supplierSection.after.point1')}</li>
          <li>▢ {$t('howItWorks.supplierSection.after.point2')}</li>
          <li>▢ {$t('howItWorks.supplierSection.after.point3')}</li>
          <li>▢ {$t('howItWorks.supplierSection.after.point4')}</li>
        </ul>
      </article>
    </div>

    <div class="detail-summary-grid">
      <div class="detail-summary-card">
        <p class="detail-summary-label">
          {$t('howItWorks.supplierSection.summary.signalLabel')}
        </p>
        <p class="detail-summary-body">
          {$t('howItWorks.supplierSection.summary.signalBody')}
        </p>
      </div>
      <div class="detail-summary-card">
        <p class="detail-summary-label">
          {$t('howItWorks.supplierSection.summary.focusLabel')}
        </p>
        <p class="detail-summary-body">
          {$t('howItWorks.supplierSection.summary.focusBody')}
        </p>
      </div>
      <div class="detail-summary-card">
        <p class="detail-summary-label">
          {$t('howItWorks.supplierSection.summary.partnershipLabel')}
        </p>
        <p class="detail-summary-body">
          {$t('howItWorks.supplierSection.summary.partnershipBody')}
        </p>
      </div>
    </div>
  </section>

  <!-- FULL PIPELINE -->
  <section id="full-pipeline" class="detail-section" in:fade={{ duration: 260 }}>
    <div class="section-head">
      <div>
        <p class="detail-kicker">
          {$t('howItWorks.pipeline.kicker')}
        </p>
        <h2 class="detail-title">
          {$t('howItWorks.pipeline.title')}
        </h2>
        <p class="section-sub">
          {$t('howItWorks.pipeline.subtitle')}
        </p>
      </div>
    </div>

    <div class="detail-grid">
      <!-- Stage 1 -->
      <article class="detail-card" in:fly={{ y: 14, duration: 260 }}>
        <div class="detail-pill-row">
          <span class="detail-pill">
            {$t('howItWorks.pipeline.stage1.pill')}
          </span>
        </div>
        <h3 class="detail-card-title">
          {$t('howItWorks.pipeline.stage1.title')}
        </h3>
        <ul class="detail-list">
          <li>▢ {$t('howItWorks.pipeline.stage1.point1')}</li>
          <li>▢ {$t('howItWorks.pipeline.stage1.point2')}</li>
          <li>▢ {$t('howItWorks.pipeline.stage1.point3')}</li>
          <li>▢ {$t('howItWorks.pipeline.stage1.point4')}</li>
        </ul>
      </article>

      <!-- Stage 2 -->
      <article class="detail-card" in:fly={{ y: 14, duration: 260, delay: 60 }}>
        <div class="detail-pill-row">
          <span class="detail-pill">
            {$t('howItWorks.pipeline.stage2.pill')}
          </span>
        </div>
        <h3 class="detail-card-title">
          {$t('howItWorks.pipeline.stage2.title')}
        </h3>
        <ul class="detail-list">
          <li>▢ {$t('howItWorks.pipeline.stage2.point1')}</li>
          <li>▢ {$t('howItWorks.pipeline.stage2.point2')}</li>
          <li>▢ {$t('howItWorks.pipeline.stage2.point3')}</li>
          <li>▢ {$t('howItWorks.pipeline.stage2.point4')}</li>
        </ul>
      </article>

      <!-- Stage 3 -->
      <article class="detail-card" in:fly={{ y: 14, duration: 260, delay: 110 }}>
        <div class="detail-pill-row">
          <span class="detail-pill">
            {$t('howItWorks.pipeline.stage3.pill')}
          </span>
        </div>
        <h3 class="detail-card-title">
          {$t('howItWorks.pipeline.stage3.title')}
        </h3>
        <ul class="detail-list">
          <li>▢ {$t('howItWorks.pipeline.stage3.point1')}</li>
          <li>▢ {$t('howItWorks.pipeline.stage3.point2')}</li>
          <li>▢ {$t('howItWorks.pipeline.stage3.point3')}</li>
          <li>▢ {$t('howItWorks.pipeline.stage3.point4')}</li>
        </ul>
      </article>
    </div>

    <div class="detail-summary-grid">
      <div class="detail-summary-card">
        <p class="detail-summary-label">
          {$t('howItWorks.pipeline.summary.oneSpineLabel')}
        </p>
        <p class="detail-summary-body">
          {$t('howItWorks.pipeline.summary.oneSpineBody')}
        </p>
      </div>
      <div class="detail-summary-card">
        <p class="detail-summary-label">
          {$t('howItWorks.pipeline.summary.contextLabel')}
        </p>
        <p class="detail-summary-body">
          {$t('howItWorks.pipeline.summary.contextBody')}
        </p>
      </div>
      <div class="detail-summary-card">
        <p class="detail-summary-label">
          {$t('howItWorks.pipeline.summary.knowledgeLabel')}
        </p>
        <p class="detail-summary-body">
          {$t('howItWorks.pipeline.summary.knowledgeBody')}
        </p>
      </div>
    </div>
  </section>

  <!-- FINAL CTA -->
  <section class="how-final" in:fade={{ duration: 260 }}>
    <h2 class="how-final-title">
      {$t('howItWorks.finalCta.title')}
    </h2>
    <p class="how-final-sub">
      {$t('howItWorks.finalCta.subtitle')}
    </p>
    <div class="how-final-cta-row">
      <a href="/rfqs/new" class="btn-primary">
        <span>{$t('howItWorks.finalCta.ctaPrimary')}</span>
        <span class="btn-arrow">→</span>
      </a>
      <a href="/auth/join" class="btn-ghost">
        {$t('howItWorks.finalCta.ctaSecondary')}
      </a>
    </div>
  </section>
</main>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }

  .how-page {
    max-width: 1120px;
    margin: 0 auto;
    padding: 88px 24px 72px;
    color: #e5e7eb;
  }

  /* HERO */

  .how-hero {
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(0, 1.1fr);
    gap: 40px;
    align-items: center;
    margin-bottom: 56px;
  }

  .how-hero-left {
    display: flex;
    flex-direction: column;
    gap: 10px;
    position: relative;
    z-index: 2;
  }

  .how-kicker {
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #38bdf8;
    margin-bottom: 4px;
  }

  .how-title {
    font-size: 32px;
    line-height: 1.2;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .how-sub {
    font-size: 14px;
    color: #9ca3af;
    max-width: 560px;
  }

  .how-anchor-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 12px;
    font-size: 11px;
  }

  .how-anchor-nav a {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.7);
    background: rgba(15, 23, 42, 0.94);
    color: #cbd5f5;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    position: relative;
    overflow: hidden;
  }

  .how-anchor-nav a::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      120deg,
      transparent,
      rgba(56, 189, 248, 0.35),
      transparent
    );
    transform: translateX(-120%);
    opacity: 0;
    transition:
      transform 0.4s ease,
      opacity 0.4s ease;
  }

  .how-anchor-nav a:hover::after {
    transform: translateX(120%);
    opacity: 1;
  }

  .anchor-dot {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: #22c55e;
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.9);
  }

  .how-cta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 18px;
  }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 9px 20px;
    border-radius: 999px;
    background: linear-gradient(135deg, #3b82f6, #a855f7);
    color: #e5e7eb;
    font-size: 13px;
    font-weight: 600;
    border: none;
    text-decoration: none;
    box-shadow: 0 14px 36px rgba(15, 23, 42, 0.9);
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease,
      opacity 0.15s ease,
      filter 0.15s ease;
  }

  .btn-arrow {
    margin-left: 4px;
    font-size: 13px;
    transition: transform 0.15s ease;
  }

  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 18px 46px rgba(15, 23, 42, 1);
    opacity: 0.96;
    filter: saturate(1.1);
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
    background: rgba(15, 23, 42, 0.92);
    color: #e5e7eb;
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    transition:
      background 0.15s ease,
      border-color 0.15s ease,
      transform 0.15s ease;
  }

  .btn-ghost:hover {
    background: rgba(15, 23, 42, 0.98);
    border-color: rgba(209, 213, 219, 1);
    transform: translateY(-1px);
  }

  /* HERO ORBIT CARD */

  .how-hero-orbit {
    position: relative;
    border-radius: 24px;
    border: 1px solid rgba(148, 163, 184, 0.7);
    background: radial-gradient(
      circle at top,
      rgba(56, 189, 248, 0.24),
      rgba(15, 23, 42, 0.98)
    );
    padding: 18px 18px 20px;
    overflow: hidden;
    box-shadow: 0 22px 52px rgba(15, 23, 42, 1);
    font-size: 11px;
  }

  .orbit-glow {
    position: absolute;
    inset: -40px -40px auto auto;
    background:
      radial-gradient(circle at top, rgba(56, 189, 248, 0.75), transparent 55%),
      radial-gradient(circle at bottom, rgba(15, 23, 42, 1), rgba(15, 23, 42, 1));
    opacity: 0.7;
    filter: blur(22px);
    pointer-events: none;
  }

  .orbit-core {
    position: relative;
    border-radius: 18px;
    border: 1px solid rgba(148, 163, 184, 0.9);
    background: radial-gradient(
      circle at top,
      rgba(15, 23, 42, 0.98),
      rgba(2, 6, 23, 1)
    );
    padding: 14px 14px 12px;
    z-index: 2;
  }

  .orbit-label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  .orbit-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: #bfdbfe;
  }

  .orbit-chip {
    font-size: 10px;
    padding: 3px 8px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.7);
    color: #e5e7eb;
    background: rgba(15, 23, 42, 0.96);
  }

  .orbit-stat-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }

  .orbit-stat {
    flex: 1;
    min-width: 140px;
  }

  .orbit-stat-value {
    font-size: 16px;
    font-weight: 600;
    color: #e5e7eb;
  }

  .orbit-stat-label {
    color: #9ca3af;
    font-size: 11px;
  }

  .orbit-timeline {
    margin-top: 4px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .orbit-step {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 8px;
    align-items: center;
  }

  .orbit-step-index {
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #6b7280;
  }

  .orbit-step-title {
    font-size: 11px;
    color: #e5e7eb;
  }

  .orbit-step-bar {
    position: relative;
    width: 100%;
    height: 3px;
    border-radius: 999px;
    background: rgba(30, 64, 175, 0.7);
    overflow: hidden;
    margin-top: 3px;
  }

  .orbit-step-fill {
    position: absolute;
    inset: 0;
    transform: translateX(-100%);
    background: linear-gradient(90deg, #38bdf8, #22c55e, #a855f7);
    animation: orbit-fill 5s ease-in-out infinite;
    animation-delay: calc(var(--i) * 0.4s);
  }

  @keyframes orbit-fill {
    0% {
      transform: translateX(-100%);
    }
    40% {
      transform: translateX(0);
    }
    80% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(100%);
    }
  }

  .orbit-ring {
    position: absolute;
    inset: 26px 18px 18px 18px;
    border-radius: 999px;
    border: 1px dashed rgba(148, 163, 184, 0.45);
    z-index: 1;
    pointer-events: none;
    animation: orbit-ring-spin 26s linear infinite;
  }

  .orbit-ring-inner {
    inset: 36px 32px 32px 32px;
    opacity: 0.6;
    border-style: solid;
    animation-duration: 36s;
    animation-direction: reverse;
  }

  @keyframes orbit-ring-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .orbit-node {
    position: absolute;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #e5e7eb;
    animation: orbit-node-float 6s ease-in-out infinite;
  }

  .orbit-node-dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: #22c55e;
    box-shadow: 0 0 12px rgba(34, 197, 94, 0.9);
  }

  .orbit-node-1 {
    top: 16px;
    left: 22px;
    animation-delay: 0.2s;
  }

  .orbit-node-2 {
    bottom: 20px;
    left: 26px;
    animation-delay: 0.8s;
  }

  .orbit-node-3 {
    top: 32px;
    right: 24px;
    animation-delay: 1.4s;
  }

  .orbit-node-label {
    background: rgba(15, 23, 42, 0.92);
    border-radius: 999px;
    padding: 3px 8px;
    border: 1px solid rgba(148, 163, 184, 0.6);
  }

  @keyframes orbit-node-float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-4px);
    }
  }

  /* 상단 STEP 요약 */

  .section-head {
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
  }

  .section-sub {
    font-size: 13px;
    color: #9ca3af;
    max-width: 560px;
  }

  .how-steps {
    margin-bottom: 44px;
    position: relative;
  }

  .steps-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }

  .step-card {
    position: relative;
    border-radius: 18px;
    border: 1px solid rgba(31, 41, 55, 1);
    background: radial-gradient(
      circle at top,
      rgba(15, 23, 42, 0.98),
      rgba(2, 6, 23, 1)
    );
    padding: 16px 18px 18px;
    font-size: 12px;
    box-shadow: 0 18px 42px rgba(15, 23, 42, 1);
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
    transition:
      transform 0.18s ease,
      box-shadow 0.18s ease,
      border-color 0.18s ease;
  }

  .step-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at top,
      rgba(56, 189, 248, 0.16),
      transparent 60%
    );
    opacity: 0;
    transition: opacity 0.18s ease;
  }

  .step-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 22px 52px rgba(15, 23, 42, 1);
    border-color: rgba(56, 189, 248, 0.6);
  }

  .step-card:hover::before {
    opacity: 1;
  }

  .step-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .step-number {
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #64748b;
  }

  .step-pill {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    border-radius: 999px;
    padding: 3px 9px;
    border: 1px solid rgba(148, 163, 184, 0.7);
    color: #cbd5f5;
  }

  .step-title {
    font-size: 14px;
    font-weight: 600;
  }

  .step-body {
    color: #9ca3af;
  }

  .steps-track {
    position: absolute;
    inset: auto 0 -18px 0;
    pointer-events: none;
  }

  .steps-track-line {
    height: 1px;
    margin-inline: 8px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(56, 189, 248, 0.6),
      transparent
    );
    opacity: 0.5;
  }

  .steps-track-glow {
    height: 14px;
    margin-inline: 32px;
    background: radial-gradient(
      circle,
      rgba(56, 189, 248, 0.45),
      transparent 65%
    );
    filter: blur(10px);
    opacity: 0.7;
    animation: steps-pulse 4s ease-in-out infinite;
  }

  @keyframes steps-pulse {
    0%,
    100% {
      opacity: 0.5;
    }
    50% {
      opacity: 0.95;
    }
  }

  /* ROLES */

  .how-roles {
    margin-bottom: 44px;
  }

  .roles-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .role-card {
    border-radius: 18px;
    border: 1px solid rgba(31, 41, 55, 1);
    background: radial-gradient(
      circle at top,
      rgba(15, 23, 42, 0.98),
      rgba(2, 6, 23, 1)
    );
    padding: 16px 18px 18px;
    font-size: 12px;
    box-shadow: 0 18px 42px rgba(15, 23, 42, 1);
    transition:
      transform 0.18s ease,
      box-shadow 0.18s ease,
      border-color 0.18s ease;
  }

  .role-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 22px 52px rgba(15, 23, 42, 1);
    border-color: rgba(129, 140, 248, 0.7);
  }

  .role-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .role-card ul {
    list-style: none;
    padding-left: 0;
    color: #9ca3af;
  }

  .role-card li + li {
    margin-top: 4px;
  }

  /* 공통 디테일 섹션 */

  .detail-section {
    margin-bottom: 44px;
    padding-top: 24px;
    border-top: 1px solid rgba(31, 41, 55, 1);
    scroll-margin-top: 96px;
  }

  .detail-kicker {
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #4b5563;
    margin-bottom: 6px;
  }

  .detail-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .detail-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }

  .detail-card {
    border-radius: 18px;
    border: 1px solid rgba(31, 41, 55, 1);
    background: radial-gradient(
      circle at top,
      rgba(15, 23, 42, 0.98),
      rgba(2, 6, 23, 1)
    );
    padding: 16px 18px 18px;
    font-size: 12px;
    box-shadow: 0 18px 42px rgba(15, 23, 42, 1);
    position: relative;
    overflow: hidden;
    transition:
      transform 0.18s ease,
      box-shadow 0.18s ease,
      border-color 0.18s ease;
  }

  .detail-card::after {
    content: '';
    position: absolute;
    inset: -20%;
    background: radial-gradient(
      circle at top,
      rgba(56, 189, 248, 0.16),
      transparent 60%
    );
    opacity: 0;
    transition: opacity 0.18s ease;
  }

  .detail-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 22px 52px rgba(15, 23, 42, 1);
    border-color: rgba(56, 189, 248, 0.6);
  }

  .detail-card:hover::after {
    opacity: 1;
  }

  .detail-pill-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .detail-pill {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 4px 10px;
    border: 1px solid rgba(148, 163, 184, 0.7);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #9ca3af;
  }

  .detail-card-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .detail-list {
    list-style: none;
    padding-left: 0;
    color: #9ca3af;
  }

  .detail-list li + li {
    margin-top: 4px;
  }

  .detail-summary-grid {
    margin-top: 18px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    font-size: 12px;
  }

  .detail-summary-card {
    border-radius: 14px;
    border: 1px solid rgba(31, 41, 55, 1);
    padding: 10px 12px;
    background: radial-gradient(
      circle at top,
      rgba(15, 23, 42, 0.98),
      rgba(2, 6, 23, 1)
    );
  }

  .detail-summary-label {
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #6b7280;
    margin-bottom: 4px;
  }

  .detail-summary-body {
    color: #9ca3af;
  }

  /* FINAL CTA */

  .how-final {
    margin-top: 8px;
    padding-top: 24px;
    border-top: 1px solid rgba(31, 41, 55, 1);
    text-align: center;
  }

  .how-final-title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .how-final-sub {
    font-size: 13px;
    color: #9ca3af;
    max-width: 560px;
    margin: 0 auto 16px;
  }

  .how-final-cta-row {
    display: flex;
    justify-content: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  @media (max-width: 900px) {
    .how-hero {
      grid-template-columns: minmax(0, 1fr);
      align-items: flex-start;
    }

    .how-hero-orbit {
      order: -1;
    }

    .steps-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .roles-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .detail-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .detail-summary-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
