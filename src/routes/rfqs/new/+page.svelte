<!-- src/routes/rfqs/new/+page.svelte -->

<svelte:head>
  <title>NovaNexus ▢ Create RFQ</title>
</svelte:head>

<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { browser } from '$app/environment';

  // ----- 옵션 상수들 -----
  const regions = ['Korea', 'USA', 'Europe', 'Japan', 'Vietnam', 'Middle East', 'Other'];

  const industries = [
    'Aluminum extrusion & finishing',
    'CNC machining & fabrication',
    'Press lines & forming',
    'Industrial robotics & cells',
    'Material handling & conveyors',
    'Warehouse systems & AS/RS',
    'Packaging & end-of-line',
    'Injection molding & plastics',
    'Steel processing & coil lines',
    'Food & beverage automation',
    'Pharma & medical devices',
    'EV & battery production lines',
    'Other'
  ];

  const budgets = ['<$200k', '$200k–$500k', '$500k–$1M', '$1M–$3M', '$3M+'];
  const timelines = ['<3 months', '3–6 months', '6–12 months', '12+ months'];

  // ----- 상태 -----
  let mounted = false;

  let companyName = '';
  let projectName = '';
  let role: 'buyer' | 'supplier' | 'other' = 'buyer';
  let region = 'Korea';
  let industry = 'Aluminum extrusion & finishing';
  let process = '';
  let annualVolume = '';
  let budget = '$200k–$500k';
  let timeline = '3–6 months';
  let description = '';
  let constraints = '';
  let contactName = '';
  let contactEmail = '';

  let loading = false;
  let submitted = false;
  let errorMsg = '';
  let createdId = '';

  // PocketBase 클라이언트 (동적 import로 SSR 안전)
  let pbClient: any = null;

  onMount(async () => {
    mounted = true;

    if (!browser) return;

    try {
      const mod = await import('$lib/pocketbase');
      pbClient = mod.pb;
    } catch (err) {
      console.warn('PocketBase client load failed in RFQ new page', err);
    }
  });

  // ----- 헬퍼: 필수 필드 검증 -----
  const validateRequired = () => {
    if (!projectName.trim()) return 'Project name is required.';
    if (!process.trim()) return 'Core process / line focus is required.';
    if (!description.trim()) return 'Please describe what you are trying to build or upgrade.';
    if (!contactName.trim()) return 'Contact name is required.';
    if (!contactEmail.trim()) return 'Work email is required.';
    return '';
  };

  // ----- 제출 핸들러 -----
  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    if (loading) return;

    const form = event.currentTarget as HTMLFormElement;
    // 브라우저 기본 검증도 같이 사용
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const requiredError = validateRequired();
    if (requiredError) {
      errorMsg = requiredError;
      submitted = false;
      return;
    }

    loading = true;
    submitted = false;
    errorMsg = '';
    createdId = '';

    if (!pbClient) {
      errorMsg =
        'RFQ backend is not reachable from this environment. Please check PocketBase URL and client config.';
      loading = false;
      return;
    }

    const payload = {
      company_name: companyName.trim() || null,
      project_name: projectName.trim(),
      role,
      region,
      industry,
      process_focus: process.trim(),
      annual_volume: annualVolume.trim() || null,
      budget_range: budget,
      timeline,
      description: description.trim(),
      constraints: constraints.trim() || null,
      contact_name: contactName.trim(),
      contact_email: contactEmail.trim(),
      source: 'web_app'
    };

    try {
      const record = await pbClient.collection('rfqs').create(payload);
      createdId = record?.id ?? '';
      submitted = true;

      // 핵심 필드만 초기화 (회사/연락처는 그대로 유지)
      projectName = '';
      process = '';
      annualVolume = '';
      description = '';
      constraints = '';
    } catch (err) {
      console.warn('RFQ create failed', err);
      errorMsg =
        'There was an issue saving this RFQ. Please check the RFQ collection, API rules and PocketBase URL.';
    } finally {
      loading = false;
    }
  };
</script>

{#if mounted}
<main class="rfq-page" in:fade={{ duration: 220 }}>
  <!-- HERO -->
  <section class="rfq-hero" in:fly={{ y: 16, duration: 260 }}>
    <div class="rfq-hero-glow"></div>

    <div class="rfq-hero-left" in:fade={{ duration: 260, delay: 40 }}>
      <p class="rfq-kicker">CREATE RFQ ▢ PRODUCTION-GRADE ONLY</p>
      <h1 class="rfq-title">Start with one real project.</h1>
      <p class="rfq-sub">
        Use this form for lines, cells, retrofits and automation where a wrong supplier
        actually hurts. Keep it concrete: what you’re running today, what needs to be
        different and where the line will live.
      </p>

      <div class="rfq-steps">
        <div class="step-pill">
          <span class="step-index">1</span>
          <span>Basics</span>
        </div>
        <div class="step-pill">
          <span class="step-index">2</span>
          <span>Scope & region</span>
        </div>
        <div class="step-pill">
          <span class="step-index">3</span>
          <span>Technical description</span>
        </div>
        <div class="step-pill">
          <span class="step-index">4</span>
          <span>Contact</span>
        </div>
      </div>
    </div>

    <aside class="rfq-hero-note" in:fade={{ duration: 260, delay: 120 }}>
      <div class="rfq-dot-wrapper">
        <div class="rfq-dot-ping"></div>
        <div class="rfq-dot"></div>
      </div>
      <div class="rfq-hero-note-text">
        <div class="rfq-hero-note-title">What happens after you submit?</div>
        <p>
          RFQs are reviewed, cleaned up and matched against a curated bench of factories
          and integrators. There is no bulk “blast all suppliers” button – every project
          is routed intentionally.
        </p>
        <p class="rfq-hero-note-foot">
          If something is confidential, you can keep names generic here and share drawings
          under NDA later.
        </p>
      </div>
    </aside>
  </section>

  <!-- FORM CARD -->
  <section class="rfq-card" in:fade={{ duration: 260, delay: 80 }}>
    <div class="rfq-card-glow"></div>

    <form
      class="rfq-form"
      on:submit={handleSubmit}
      novalidate
      aria-describedby={errorMsg ? 'rfq-error' : submitted ? 'rfq-success' : undefined}
    >
      <!-- Project basics -->
      <div class="rfq-section">
        <div class="rfq-section-head">
          <h2>Project basics</h2>
          <p class="rfq-section-sub">
            Enough context so a technical salesperson or engineer immediately understands
            what kind of line or cell we’re talking about.
          </p>
        </div>

        <div class="rfq-grid">
          <div class="field">
            <label for="rfq-company">Company / organization (optional)</label>
            <input
              id="rfq-company"
              name="company_name"
              type="text"
              bind:value={companyName}
              placeholder="Example: tier-1 automotive supplier, 3PL warehouse, medtech OEM…"
              autocomplete="organization"
            />
          </div>

          <div class="field">
            <label for="rfq-project">Project name *</label>
            <input
              id="rfq-project"
              name="project_name"
              type="text"
              bind:value={projectName}
              required
              autocomplete="off"
              placeholder="Example: new aluminum extrusion line for building profiles"
            />
          </div>

          <div class="field field-role">
            <div class="field-label">Your role *</div>
            <div class="radio-row" aria-label="Your role">
              <label>
                <input
                  type="radio"
                  name="role"
                  value="buyer"
                  bind:group={role}
                />
                <span>Buyer / plant / engineering</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="supplier"
                  bind:group={role}
                />
                <span>Supplier exploring partnership</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="other"
                  bind:group={role}
                />
                <span>Other</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Scope & region -->
      <div class="rfq-section">
        <div class="rfq-section-head">
          <h2>Scope & location</h2>
          <p class="rfq-section-sub">
            Region and industry help narrow the bench. If you’re flexible, mention it in
            the constraints section below.
          </p>
        </div>

        <div class="rfq-grid">
          <div class="field">
            <label for="rfq-region">Preferred region *</label>
            <select id="rfq-region" name="region" bind:value={region} required>
              {#each regions as r}
                <option value={r}>{r}</option>
              {/each}
            </select>
          </div>

          <div class="field">
            <label for="rfq-industry">Primary industry *</label>
            <select id="rfq-industry" name="industry" bind:value={industry} required>
              {#each industries as ind}
                <option value={ind}>{ind}</option>
              {/each}
            </select>
          </div>

          <div class="field">
            <label for="rfq-process">Core process or line focus *</label>
            <input
              id="rfq-process"
              name="process_focus"
              bind:value={process}
              required
              placeholder="Example: extrusion & hot saws, shuttle racking, palletizing cells…"
            />
          </div>

          <div class="field">
            <label for="rfq-volume">Annual volume / throughput (rough)</label>
            <input
              id="rfq-volume"
              name="annual_volume"
              bind:value={annualVolume}
              placeholder="Example: 15,000 tons/year, 500 pallets/day, 40 modules/hour…"
            />
          </div>

          <div class="field">
            <label for="rfq-budget">Budget range *</label>
            <select id="rfq-budget" name="budget_range" bind:value={budget} required>
              {#each budgets as b}
                <option value={b}>{b}</option>
              {/each}
            </select>
          </div>

          <div class="field">
            <label for="rfq-timeline">Target timeline *</label>
            <select id="rfq-timeline" name="timeline" bind:value={timeline} required>
              {#each timelines as t}
                <option value={t}>{t}</option>
              {/each}
            </select>
          </div>
        </div>
      </div>

      <!-- Technical description -->
      <div class="rfq-section">
        <div class="rfq-section-head">
          <h2>Technical description</h2>
          <p class="rfq-section-sub">
            Bullet points are perfect. Focus on what must be true – layout, interfaces
            with existing equipment, safety, clean-room, local service, certifications.
          </p>
        </div>

        <div class="field">
          <label for="rfq-description">What are you trying to build or upgrade? *</label>
          <textarea
            id="rfq-description"
            name="description"
            rows="5"
            bind:value={description}
            required
            placeholder="- New extrusion line to replace aging equipment
- Integrate shuttle racking with existing WMS
- Add robotic palletizing cell after existing case packer…"
          ></textarea>
        </div>

        <div class="field">
          <label for="rfq-constraints">Key constraints or must-haves</label>
          <textarea
            id="rfq-constraints"
            name="constraints"
            rows="3"
            bind:value={constraints}
            placeholder="- Existing building layout / ceiling height
- Local service needed in specific country
- Cleanroom / validation / certification requirements…"
          ></textarea>
        </div>
      </div>

      <!-- Contact -->
      <div class="rfq-section">
        <div class="rfq-section-head">
          <h2>Contact</h2>
          <p class="rfq-section-sub">
            Used only to follow up on this RFQ. In the MVP there is no public profile tied
            to this form.
          </p>
        </div>

        <div class="rfq-grid">
          <div class="field">
            <label for="rfq-contact-name">Your name *</label>
            <input
              id="rfq-contact-name"
              name="contact_name"
              bind:value={contactName}
              required
              autocomplete="name"
              placeholder="Example: operations manager, project engineer…"
            />
          </div>

          <div class="field">
            <label for="rfq-contact-email">Work email *</label>
            <input
              id="rfq-contact-email"
              name="contact_email"
              type="email"
              bind:value={contactEmail}
              required
              autocomplete="email"
              placeholder="name@company.com"
            />
          </div>
        </div>
      </div>

      <!-- Actions / status -->
      <div class="rfq-actions">
        <button
          class="btn-primary"
          type="submit"
          disabled={loading}
          aria-busy={loading}
        >
          {#if loading}
            Submitting…
          {:else}
            Create RFQ
          {/if}
        </button>

        <a href="/rfqs" class="btn-ghost-sm">Back to live RFQs</a>
      </div>

      {#if errorMsg}
        <div id="rfq-error" class="rfq-error">
          {errorMsg}
        </div>
      {/if}

      {#if submitted}
        <div id="rfq-success" class="rfq-success">
          <div class="rfq-success-title">Your RFQ has been created.</div>
          <p>
            It’s now in the review queue. You’ll hear back once it’s been structured and
            matched to a realistic bench of factories.
            {#if createdId}
              <span class="rfq-id">Internal ID: {createdId}</span>
            {/if}
          </p>
        </div>
      {/if}
    </form>
  </section>
</main>
{/if}

<style>
  .rfq-page {
    max-width: 1120px;
    margin: 0 auto;
    padding: 88px 24px 72px;
    color: #e5e7eb;
    position: relative;
  }

  /* HERO */

  .rfq-hero {
    display: flex;
    justify-content: space-between;
    gap: 32px;
    align-items: flex-start;
    margin-bottom: 32px;
    position: relative;
    overflow: hidden;
  }

  .rfq-hero-glow {
    position: absolute;
    inset: -140px -80px auto auto;
    background:
      radial-gradient(circle at 10% 0%, rgba(56, 189, 248, 0.35), transparent 55%),
      radial-gradient(circle at 80% 70%, rgba(129, 140, 248, 0.3), transparent 55%);
    opacity: 0.7;
    filter: blur(18px);
    pointer-events: none;
    animation: orbitDrift 18s ease-in-out infinite alternate;
  }

  .rfq-hero-left {
    flex: 1.5;
    position: relative;
    z-index: 1;
  }

  .rfq-kicker {
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #38bdf8;
    margin-bottom: 6px;
  }

  .rfq-title {
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .rfq-sub {
    font-size: 13px;
    color: #9ca3af;
    max-width: 540px;
  }

  .rfq-steps {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 12px;
    font-size: 11px;
  }

  .step-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 9px;
    border-radius: 999px;
    border: 1px solid rgba(55, 65, 81, 1);
    background: rgba(15, 23, 42, 0.96);
    color: #cbd5f5;
  }

  .step-index {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    border-radius: 999px;
    font-size: 9px;
    background: linear-gradient(135deg, #3b82f6, #a855f7);
    color: #f9fafb;
  }

  .rfq-hero-note {
    flex: 1;
    display: flex;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 18px;
    border: 1px solid rgba(148, 163, 184, 0.8);
    background: radial-gradient(circle at top, rgba(56, 189, 248, 0.18), rgba(15, 23, 42, 0.98));
    box-shadow: 0 18px 40px rgba(15, 23, 42, 1);
    font-size: 11px;
    position: relative;
    z-index: 1;
    overflow: hidden;
  }

  .rfq-dot-wrapper {
    position: relative;
    width: 14px;
    margin-top: 2px;
  }

  .rfq-dot-ping {
    position: absolute;
    inset: 1px;
    border-radius: 999px;
    background: rgba(34, 197, 94, 0.2);
    animation: pingDot 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
  }

  .rfq-dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: #22c55e;
    box-shadow: 0 0 18px rgba(34, 197, 94, 0.9);
    position: relative;
    z-index: 1;
  }

  .rfq-hero-note-title {
    font-weight: 600;
    margin-bottom: 2px;
    color: #e5e7eb;
  }

  .rfq-hero-note-text p {
    color: #cbd5f5;
    line-height: 1.5;
  }

  .rfq-hero-note-foot {
    margin-top: 6px;
    color: #9ca3af;
  }

  @media (max-width: 900px) {
    .rfq-hero {
      flex-direction: column;
    }

    .rfq-hero-note {
      max-width: none;
    }
  }

  /* FORM CARD */

  .rfq-card {
    border-radius: 18px;
    border: 1px solid rgba(31, 41, 55, 1);
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.98), rgba(2, 6, 23, 1));
    box-shadow: 0 24px 60px rgba(15, 23, 42, 1);
    padding: 20px 22px 22px;
    font-size: 12px;
    position: relative;
    overflow: hidden;
  }

  .rfq-card-glow {
    position: absolute;
    inset: -40px 40% auto -40px;
    background:
      radial-gradient(circle at 10% 0%, rgba(56, 189, 248, 0.26), transparent 55%),
      radial-gradient(circle at 90% 60%, rgba(79, 70, 229, 0.22), transparent 55%);
    opacity: 0.7;
    filter: blur(22px);
    pointer-events: none;
  }

  .rfq-form {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 22px;
  }

  .rfq-section {
    border-top: 1px solid rgba(31, 41, 55, 1);
    padding-top: 16px;
  }

  .rfq-section:first-of-type {
    border-top: none;
    padding-top: 0;
  }

  .rfq-section-head h2 {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .rfq-section-sub {
    font-size: 12px;
    color: #9ca3af;
    margin-bottom: 10px;
    max-width: 680px;
  }

  .rfq-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px 18px;
  }

  .field-role {
    grid-column: 1 / -1;
  }

  @media (max-width: 800px) {
    .rfq-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .field-role {
      grid-column: auto;
    }
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .field label {
    font-size: 11px;
    color: #9ca3af;
  }

  .field-label {
    font-size: 11px;
    color: #9ca3af;
  }

  .field input,
  .field select,
  .field textarea {
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.8);
    background: rgba(15, 23, 42, 0.96);
    padding: 7px 11px;
    font-size: 12px;
    color: #e5e7eb;
    outline: none;
    transition:
      border-color 0.16s ease,
      box-shadow 0.16s ease,
      background 0.16s ease;
  }

  .field textarea {
    border-radius: 14px;
    resize: vertical;
    min-height: 96px;
  }

  .field input::placeholder,
  .field textarea::placeholder {
    color: #6b7280;
  }

  .field input:focus-visible,
  .field select:focus-visible,
  .field textarea:focus-visible {
    border-color: rgba(59, 130, 246, 0.9);
    box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.9);
    background: rgba(15, 23, 42, 0.98);
  }

  .radio-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 12px;
    padding: 6px 8px;
    border-radius: 999px;
    border: 1px solid rgba(31, 41, 55, 1);
    background: rgba(15, 23, 42, 0.9);
  }

  .radio-row label {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: #e5e7eb;
  }

  .radio-row input {
    accent-color: #3b82f6;
  }

  /* Actions / status */

  .rfq-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 6px;
  }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 18px;
    border-radius: 999px;
    border: none;
    background: linear-gradient(135deg, #3b82f6, #a855f7);
    font-size: 13px;
    font-weight: 600;
    color: #e5e7eb;
    box-shadow: 0 14px 36px rgba(15, 23, 42, 0.95);
    cursor: pointer;
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease,
      opacity 0.15s ease;
  }

  .btn-primary:hover:enabled {
    transform: translateY(-1px);
    box-shadow: 0 18px 46px rgba(15, 23, 42, 1);
    opacity: 0.96;
  }

  .btn-primary:disabled {
    opacity: 0.7;
    cursor: wait;
  }

  .btn-ghost-sm {
    font-size: 11px;
    text-decoration: none;
    color: #9ca3af;
    border-radius: 999px;
    border: 1px solid rgba(55, 65, 81, 1);
    padding: 6px 12px;
    background: rgba(15, 23, 42, 0.96);
  }

  .btn-ghost-sm:hover {
    color: #e5e7eb;
    border-color: rgba(148, 163, 184, 1);
  }

  .rfq-error {
    margin-top: 10px;
    font-size: 11px;
    color: #fecaca;
    background: rgba(127, 29, 29, 0.7);
    border-radius: 12px;
    padding: 8px 10px;
  }

  .rfq-success {
    margin-top: 10px;
    font-size: 11px;
    color: #bbf7d0;
    background: rgba(22, 101, 52, 0.7);
    border-radius: 12px;
    padding: 8px 10px;
  }

  .rfq-success-title {
    font-weight: 600;
    margin-bottom: 2px;
  }

  .rfq-id {
    margin-left: 4px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
      'Liberation Mono', 'Courier New', monospace;
    font-weight: 600;
  }

  /* KEYFRAMES */

  @keyframes orbitDrift {
    0% {
      transform: translate3d(0, 0, 0);
    }
    100% {
      transform: translate3d(-18px, 10px, 0);
    }
  }

  @keyframes pingDot {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    70% {
      transform: scale(1.6);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 0;
    }
  }
</style>
