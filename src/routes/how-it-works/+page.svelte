<!-- src/routes/how-it-works/+page.svelte -->

<svelte:head>
  <title>How it works ▢ NovaNexus flow</title>
</svelte:head>

<script lang="ts">
  const steps = [
    {
      step: '01',
      title: 'Describe the line or project',
      body: 'Share a concise brief: process, materials, annual volume, region, target budget and timeline. Upload layouts, drawings or photos if you have them.'
    },
    {
      step: '02',
      title: 'RFQ is cleaned up & structured',
      body: 'Missing details are flagged, scope is clarified and the RFQ is turned into a structured package that suppliers can actually quote from.'
    },
    {
      step: '03',
      title: 'Bench & matching',
      body: 'The project is routed only to suppliers whose capabilities, region and minimum project size line up with the work – not just whoever is nearby.'
    },
    {
      step: '04',
      title: 'Focused conversations',
      body: 'Suppliers see the same structured brief, so questions are about trade-offs and options, not “what exactly are you asking for?”.'
    },
    {
      step: '05',
      title: 'Decision support',
      body: 'You get context on cost drivers, lead-time bands and risk points so you can choose a path that fits your plant, not just the cheapest quote.'
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
  <section class="how-hero">
    <div>
      <p class="how-kicker">FLOW ▢ FROM BRIEF TO DECISION</p>
      <h1 class="how-title">
        How NovaNexus works<br />
        from first idea to live project.
      </h1>
      <p class="how-sub">
        The platform is intentionally simple: one clear RFQ, a curated supplier
        bench and a loop that keeps both sides focused on real production work –
        not endless inbox noise.
      </p>

      <div class="how-cta-row">
        <a href="/rfqs/new" class="btn-primary">Create RFQ</a>
        <a href="/buyers" class="btn-ghost">Open buyer overview</a>
      </div>
    </div>

    <div class="how-hero-card">
      <p class="how-hero-label">AT A GLANCE</p>
      <ul>
        <li>▢ Built for aluminum lines, racking systems and automation.</li>
        <li>▢ Curated suppliers across Korea · APAC · U.S. · Europe.</li>
        <li>▢ Focused on throughput and uptime, not hobby-grade builds.</li>
      </ul>
    </div>
  </section>

  <!-- STEP FLOW -->
  <section class="how-steps">
    <div class="section-head">
      <div>
        <p class="section-kicker">STEP-BY-STEP</p>
        <h2 class="section-title">What actually happens after you click “Create RFQ”.</h2>
        <p class="section-sub">
          Under the hood there’s more nuance, but at a high level every project
          passes through the same backbone so that expectations stay aligned.
        </p>
      </div>
    </div>

    <div class="steps-grid">
      {#each steps as s}
        <article class="step-card">
          <div class="step-header">
            <span class="step-number">{s.step}</span>
          </div>
          <h3 class="step-title">{s.title}</h3>
          <p class="step-body">{s.body}</p>
        </article>
      {/each}
    </div>
  </section>

  <!-- ROLES -->
  <section class="how-roles">
    <div class="section-head">
      <div>
        <p class="section-kicker">WHO IT SERVES</p>
        <h2 class="section-title">Two sides of the same production line.</h2>
      </div>
    </div>

    <div class="roles-grid">
      {#each roles as r}
        <article class="role-card">
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

  <!-- FINAL CTA -->
  <section class="how-final">
    <h2 class="how-final-title">Start with one project.</h2>
    <p class="how-final-sub">
      Submit an RFQ, browse the supplier bench or just use the content to clarify
      your options. You should leave with a clearer picture than when you arrived.
    </p>
    <div class="how-final-cta-row">
      <a href="/rfqs/new" class="btn-primary">Create RFQ</a>
      <a href="/buyers" class="btn-ghost">Open buyer overview</a>
    </div>
  </section>
</main>

<style>
  .how-page {
    max-width: 1120px;
    margin: 0 auto;
    padding: 88px 24px 72px;
    color: #e5e7eb;
  }

  .how-hero {
    display: flex;
    gap: 40px;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 48px;
  }

  .how-kicker {
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #38bdf8;
    margin-bottom: 8px;
  }

  .how-title {
    font-size: 32px;
    line-height: 1.2;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .how-sub {
    font-size: 14px;
    color: #9ca3af;
    max-width: 560px;
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
    transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
  }

  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 18px 46px rgba(15, 23, 42, 1);
    opacity: 0.96;
  }

  .btn-ghost {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 9px 18px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.9);
    background: rgba(15, 23, 42, 0.85);
    color: #e5e7eb;
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
  }

  .btn-ghost:hover {
    background: rgba(15, 23, 42, 0.98);
    border-color: rgba(209, 213, 219, 1);
    transform: translateY(-1px);
  }

  .how-hero-card {
    flex: 1;
    border-radius: 18px;
    border: 1px solid rgba(148, 163, 184, 0.6);
    background: radial-gradient(circle at top, rgba(56, 189, 248, 0.2), rgba(15, 23, 42, 0.98));
    padding: 16px 18px 18px;
    font-size: 12px;
    box-shadow: 0 20px 44px rgba(15, 23, 42, 0.98);
  }

  .how-hero-label {
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #9ca3af;
    margin-bottom: 6px;
  }

  .how-hero-card ul {
    list-style: none;
    padding-left: 0;
    color: #e5e7eb;
  }

  .how-hero-card li + li {
    margin-top: 4px;
  }

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
    margin-bottom: 40px;
  }

  .steps-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }

  .step-card {
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

  .step-number {
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #64748b;
  }

  .step-title {
    font-size: 14px;
    font-weight: 600;
  }

  .step-body {
    color: #9ca3af;
  }

  .how-roles {
    margin-bottom: 40px;
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
      flex-direction: column;
    }

    .steps-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .roles-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
