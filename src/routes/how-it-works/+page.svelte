<!-- src/routes/how-it-works/+page.svelte -->

<svelte:head>
  <title>How it works ▢ NovaNexus flow</title>
</svelte:head>

<script lang="ts">
  import { fade, fly, scale } from 'svelte/transition';

  const steps = [
    {
      step: '01',
      title: 'Describe the line or project',
      body:
        'Share a concise brief: process, materials, annual volume, region, target budget and timeline. Upload layouts, drawings or photos if you have them.'
    },
    {
      step: '02',
      title: 'RFQ is cleaned up & structured',
      body:
        'Missing details are flagged, scope is clarified and the RFQ is turned into a structured package that suppliers can actually quote from.'
    },
    {
      step: '03',
      title: 'Bench & matching',
      body:
        'The project is routed only to suppliers whose capabilities, region and minimum project size line up with the work – not just whoever is nearby.'
    },
    {
      step: '04',
      title: 'Focused conversations',
      body:
        'Suppliers see the same structured brief, so questions are about trade-offs and options, not “what exactly are you asking for?”.'
    },
    {
      step: '05',
      title: 'Decision support',
      body:
        'You get context on cost drivers, lead-time bands and risk points so you can choose a path that fits your plant, not just the cheapest quote.'
    }
  ];

  const roles = [
    {
      title: 'For buyers & operations',
      points: [
        'Cleaner RFQs and fewer back-and-forth emails.',
        'A short-list of realistic suppliers per project.',
        'Better feel for cost / lead-time bands before you commit.'
      ]
    },
    {
      title: 'For suppliers & integrators',
      points: [
        'Requests that fit your processes and minimum project size.',
        'Structured information upfront instead of vague one-liners.',
        'A place to showcase capability depth, not just a logo.'
      ]
    }
  ];
</script>

<main class="how-page">
  <!-- HERO -->
  <section class="how-hero" in:fade={{ duration: 260 }}>
    <div class="how-hero-left" in:fly={{ y: 16, duration: 260 }}>
      <p class="how-kicker">FLOW ▢ FROM BRIEF TO DECISION</p>
      <h1 class="how-title">
        How NovaNexus works<br />
        from first idea to live project.
      </h1>
      <p class="how-sub">
        One RFQ in, one clear pipeline out. The goal is simple: fewer email chains,
        fewer “what are we actually doing?” calls, and more production lines that
        start up on time.
      </p>

      <div class="how-anchor-nav">
        <a href="#buyer-workflows">
          <span class="anchor-dot"></span>
          <span>Buyer workflows</span>
        </a>
        <a href="#supplier-playbook">
          <span class="anchor-dot"></span>
          <span>Supplier playbook</span>
        </a>
        <a href="#full-pipeline">
          <span class="anchor-dot"></span>
          <span>Full pipeline</span>
        </a>
      </div>

      <div class="how-cta-row">
        <a href="/rfqs/new" class="btn-primary">
          <span>Create RFQ</span>
          <span class="btn-arrow">→</span>
        </a>
        <a href="/buyers" class="btn-ghost">Open buyer overview</a>
      </div>
    </div>

    <!-- ORBIT / TIMELINE 카드 -->
    <div class="how-hero-orbit" in:scale={{ duration: 260, start: 0.9 }}>
      <div class="orbit-glow"></div>

      <div class="orbit-core">
        <div class="orbit-label-row">
          <span class="orbit-label">RFQ pipeline</span>
          <span class="orbit-chip">NovaNexus spine</span>
        </div>

        <div class="orbit-stat-row">
          <div class="orbit-stat">
            <div class="orbit-stat-value">1 → 3–7</div>
            <div class="orbit-stat-label">curated factories per project</div>
          </div>
          <div class="orbit-stat">
            <div class="orbit-stat-value">3 stages</div>
            <div class="orbit-stat-label">intake · matching · award</div>
          </div>
        </div>

        <div class="orbit-timeline">
          {#each steps as s, i}
            <div class="orbit-step">
              <div class="orbit-step-index">{s.step}</div>
              <div class="orbit-step-body">
                <div class="orbit-step-title">{s.title}</div>
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
        <span class="orbit-node-label">RFQ intake</span>
      </div>
      <div class="orbit-node orbit-node-2">
        <span class="orbit-node-dot"></span>
        <span class="orbit-node-label">Bench & matching</span>
      </div>
      <div class="orbit-node orbit-node-3">
        <span class="orbit-node-dot"></span>
        <span class="orbit-node-label">Award & rollout</span>
      </div>
    </div>
  </section>

  <!-- STEP FLOW (상단 요약) -->
  <section class="how-steps" in:fade={{ duration: 260, delay: 60 }}>
    <div class="section-head">
      <div>
        <p class="section-kicker">STEP-BY-STEP</p>
        <h2 class="section-title">What actually happens after you click “Create RFQ”.</h2>
        <p class="section-sub">
          Under the hood there’s nuance, but every project passes through the same backbone
          so expectations stay aligned across plants, regions and suppliers.
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
            <span class="step-pill">Flow</span>
          </div>
          <h3 class="step-title">{s.title}</h3>
          <p class="step-body">{s.body}</p>
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
        <p class="section-kicker">WHO IT SERVES</p>
        <h2 class="section-title">Two sides of the same production line.</h2>
      </div>
    </div>

    <div class="roles-grid">
      {#each roles as r, i}
        <article
          class="role-card"
          in:fly={{ y: 14, duration: 260, delay: 60 + i * 90 }}
        >
          <h3 class="role-title">{r.title}</h3>
          <ul>
            {#each r.points as p}
              <li>▢ {p}</li>
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
        <p class="detail-kicker">BUYER WORKFLOWS</p>
        <h2 class="detail-title">How NovaNexus fits into a buyer’s week.</h2>
        <p class="section-sub">
          NovaNexus is not another system you have to “roll out”. It’s a structured
          workspace your team can drop projects into when you need a clean RFQ and a
          realistic bench of factories.
        </p>
      </div>
    </div>

    <div class="detail-grid">
      <article class="detail-card" in:fly={{ y: 14, duration: 260 }}>
        <div class="detail-pill-row">
          <span class="detail-pill">Step 1 · Scoping</span>
        </div>
        <h3 class="detail-card-title">Capture the real requirement once, cleanly.</h3>
        <ul class="detail-list">
          <li>▢ Upload layouts, drawings, photos and existing line data you already have.</li>
          <li>▢ Tag the RFQ by plant, line, process, safety standard and target go-live.</li>
          <li>▢ Add throughput targets, budget bands and duty / FTA constraints up front.</li>
          <li>▢ Share the workspace with operations, maintenance and finance in one link.</li>
        </ul>
      </article>

      <article class="detail-card" in:fly={{ y: 14, duration: 260, delay: 60 }}>
        <div class="detail-pill-row">
          <span class="detail-pill">Step 2 · Shortlisting</span>
        </div>
        <h3 class="detail-card-title">Get a bench of factories that can actually ship.</h3>
        <ul class="detail-list">
          <li>▢ NovaNexus filters suppliers by process capability, certification and region.</li>
          <li>▢ You see a short list of 3–7 realistic options, not a directory of hundreds.</li>
          <li>▢ Each candidate shows reference projects, typical lead times and cost bands.</li>
          <li>▢ Internal comments stay inside your team; suppliers only see what they need.</li>
        </ul>
      </article>

      <article class="detail-card" in:fly={{ y: 14, duration: 260, delay: 110 }}>
        <div class="detail-pill-row">
          <span class="detail-pill">Step 3 · Decision</span>
        </div>
        <h3 class="detail-card-title">Make a call with less noise and more context.</h3>
        <ul class="detail-list">
          <li>▢ Quotes arrive in the same structure, so comparisons take minutes, not days.</li>
          <li>▢ See how duty, freight and local installation change the true landed cost.</li>
          <li>▢ Record why a supplier was selected or rejected for future audits and repeats.</li>
          <li>▢ Export a clean summary for capex reviews and leadership approval.</li>
        </ul>
      </article>
    </div>
  </section>

  <!-- SUPPLIER PLAYBOOK -->
  <section id="supplier-playbook" class="detail-section" in:fade={{ duration: 260 }}>
    <div class="section-head">
      <div>
        <p class="detail-kicker">SUPPLIER PLAYBOOK</p>
        <h2 class="detail-title">What “good” looks like for factories on NovaNexus.</h2>
        <p class="section-sub">
          The best suppliers behave like engineering partners, not quote machines.
          This is how high-performing factories use NovaNexus to protect capacity and
          win the right work.
        </p>
      </div>
    </div>

    <div class="detail-grid">
      <article class="detail-card" in:fly={{ y: 14, duration: 260 }}>
        <div class="detail-pill-row">
          <span class="detail-pill">Before RFQs</span>
        </div>
        <h3 class="detail-card-title">Tune your profile so the right jobs find you.</h3>
        <ul class="detail-list">
          <li>▢ Define your “sweet spot”: processes, tonnage, materials and minimum order size.</li>
          <li>▢ Upload reference lines with photos, videos and real throughput numbers.</li>
          <li>▢ Keep certifications, safety standards and country-of-origin details current.</li>
          <li>▢ Block out capacity windows so buyers only see realistic lead times.</li>
        </ul>
      </article>

      <article class="detail-card" in:fly={{ y: 14, duration: 260, delay: 60 }}>
        <div class="detail-pill-row">
          <span class="detail-pill">When RFQs land</span>
        </div>
        <h3 class="detail-card-title">Qualify quickly and quote without chaos.</h3>
        <ul class="detail-list">
          <li>▢ Score each RFQ on fit: process match, volume, timeline and strategic value.</li>
          <li>▢ Use structured questions to clarify drawings instead of long email chains.</li>
          <li>▢ Quote with a clear breakdown: equipment, options, installation and training.</li>
          <li>▢ Call out technical risks early so there are no surprises at FAT or SAT.</li>
        </ul>
      </article>

      <article class="detail-card" in:fly={{ y: 14, duration: 260, delay: 110 }}>
        <div class="detail-pill-row">
          <span class="detail-pill">After you win</span>
        </div>
        <h3 class="detail-card-title">Deliver cleanly and earn the next project.</h3>
        <ul class="detail-list">
          <li>▢ Lock in milestones: design freeze, FAT, shipment, installation, commissioning.</li>
          <li>▢ Share on-site requirements, checklists and drawings in the project workspace.</li>
          <li>▢ Log change orders with reasons so buyer finance and leadership stay aligned.</li>
          <li>▢ Capture lessons learned to improve hit rate on similar future RFQs.</li>
        </ul>
      </article>
    </div>

    <div class="detail-summary-grid">
      <div class="detail-summary-card">
        <p class="detail-summary-label">Signal</p>
        <p class="detail-summary-body">
          See which industries and regions are heating up based on live RFQ volume, not hearsay.
        </p>
      </div>
      <div class="detail-summary-card">
        <p class="detail-summary-label">Focus</p>
        <p class="detail-summary-body">
          Spend time on fewer, better-qualified RFQs that match your lines and margin targets.
        </p>
      </div>
      <div class="detail-summary-card">
        <p class="detail-summary-label">Partnership</p>
        <p class="detail-summary-body">
          Show buyers you can own fabrication, installation and long-term support –
          not just the first shipment.
        </p>
      </div>
    </div>
  </section>

  <!-- FULL PIPELINE -->
  <section id="full-pipeline" class="detail-section" in:fade={{ duration: 260 }}>
    <div class="section-head">
      <div>
        <p class="detail-kicker">END-TO-END PIPELINE</p>
        <h2 class="detail-title">From RFQ upload to awarded PO in three clean stages.</h2>
        <p class="section-sub">
          Every project follows the same backbone, whether you are speccing a single saw
          or a full shuttle rack system. That consistency is what keeps programs on track.
        </p>
      </div>
    </div>

    <div class="detail-grid">
      <article class="detail-card" in:fly={{ y: 14, duration: 260 }}>
        <div class="detail-pill-row">
          <span class="detail-pill">Stage 1 · RFQ intake</span>
        </div>
        <h3 class="detail-card-title">Upload once, structure automatically.</h3>
        <ul class="detail-list">
          <li>▢ Upload drawings, BOMs, photos and existing line data in common formats.</li>
          <li>▢ Tag safety standards, certifications, region and target start-up date.</li>
          <li>▢ Auto-generate a clean RFQ summary that suppliers can quote from immediately.</li>
          <li>▢ Invite internal stakeholders to comment before anything goes out to vendors.</li>
        </ul>
      </article>

      <article class="detail-card" in:fly={{ y: 14, duration: 260, delay: 60 }}>
        <div class="detail-pill-row">
          <span class="detail-pill">Stage 2 · Matching & quotes</span>
        </div>
        <h3 class="detail-card-title">Match with the right factories and align on scope.</h3>
        <ul class="detail-list">
          <li>▢ NovaNexus proposes a curated bench that fits your process, scale and region.</li>
          <li>▢ Suppliers confirm feasibility and highlight trade-offs instead of guessing.</li>
          <li>▢ Quotes arrive in a comparable format with options and lead-time scenarios.</li>
          <li>▢ All clarifications and revisions stay tied to the project, not buried in inboxes.</li>
        </ul>
      </article>

      <article class="detail-card" in:fly={{ y: 14, duration: 260, delay: 110 }}>
        <div class="detail-pill-row">
          <span class="detail-pill">Stage 3 · Award & rollout</span>
        </div>
        <h3 class="detail-card-title">Make the decision and keep execution visible.</h3>
        <ul class="detail-list">
          <li>▢ Select a supplier and capture the decision logic for future audits and repeats.</li>
          <li>▢ Track key milestones against the agreed schedule and responsibilities.</li>
          <li>▢ Store FAT reports, installation photos and SAT sign-offs in one workspace.</li>
          <li>▢ Use post-project reviews to refine your preferred supplier bench over time.</li>
        </ul>
      </article>
    </div>

    <div class="detail-summary-grid">
      <div class="detail-summary-card">
        <p class="detail-summary-label">One spine</p>
        <p class="detail-summary-body">
          Every RFQ follows the same structure, whether it’s a pilot line or a full plant expansion.
        </p>
      </div>
      <div class="detail-summary-card">
        <p class="detail-summary-label">Shared context</p>
        <p class="detail-summary-body">
          Engineering, operations, finance and leadership all see the same live picture.
        </p>
      </div>
      <div class="detail-summary-card">
        <p class="detail-summary-label">Reusable knowledge</p>
        <p class="detail-summary-body">
          Past projects become templates instead of disappearing into inbox archives.
        </p>
      </div>
    </div>
  </section>

  <!-- FINAL CTA -->
  <section class="how-final" in:fade={{ duration: 260 }}>
    <h2 class="how-final-title">Start with one project.</h2>
    <p class="how-final-sub">
      Submit an RFQ, browse the supplier bench or just use the content to clarify your options.
      You should leave with a clearer picture than when you arrived.
    </p>
    <div class="how-final-cta-row">
      <a href="/rfqs/new" class="btn-primary">
        <span>Create RFQ</span>
        <span class="btn-arrow">→</span>
      </a>
      <a href="/auth/join" class="btn-ghost">Join the private beta</a>
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
      border-color 0.15s.ease,
      transform 0.15s.ease;
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
    background: radial-gradient(circle at top, rgba(56, 189, 248, 0.24), rgba(15, 23, 42, 0.98));
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
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.98), rgba(2, 6, 23, 1));
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
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.98), rgba(2, 6, 23, 1));
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
    background: radial-gradient(circle at top, rgba(56, 189, 248, 0.16), transparent 60%);
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
    background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.6), transparent);
    opacity: 0.5;
  }

  .steps-track-glow {
    height: 14px;
    margin-inline: 32px;
    background: radial-gradient(circle, rgba(56, 189, 248, 0.45), transparent 65%);
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
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.98), rgba(2, 6, 23, 1));
    padding: 16px 18px 18px;
    font-size: 12px;
    box-shadow: 0 18px 42px rgba(15, 23, 42, 1);
    transition:
      transform 0.18s.ease,
      box-shadow 0.18s.ease,
      border-color 0.18s.ease;
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
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.98), rgba(2, 6, 23, 1));
    padding: 16px 18px 18px;
    font-size: 12px;
    box-shadow: 0 18px 42px rgba(15, 23, 42, 1);
    position: relative;
    overflow: hidden;
    transition:
      transform 0.18s.ease,
      box-shadow 0.18s.ease,
      border-color 0.18s.ease;
  }

  .detail-card::after {
    content: '';
    position: absolute;
    inset: -20%;
    background: radial-gradient(circle at top, rgba(56, 189, 248, 0.16), transparent 60%);
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
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.98), rgba(2, 6, 23, 1));
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
