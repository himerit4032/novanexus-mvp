<!-- src/routes/rfqs/new/+page.svelte -->

<svelte:head>
  <title>NovaNexus ▢ Create RFQ</title>
</svelte:head>

<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import PocketBase from 'pocketbase';

  // PocketBase 엔드포인트 (원하면 .env 로 뺄 수 있게)
  const pb = new PocketBase(import.meta.env.VITE_PB_URL || 'http://127.0.0.1:8090');

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

  const handleSubmit = async () => {
    loading = true;
    submitted = false;
    errorMsg = '';
    createdId = '';

    // RFQ payload – PocketBase collection 필드로 사용
    const payload = {
      company_name: companyName,
      project_name: projectName,
      role,
      region,
      industry,
      process_focus: process,
      annual_volume: annualVolume,
      budget_range: budget,
      timeline,
      description,
      constraints,
      contact_name: contactName,
      contact_email: contactEmail,
      source: 'web_app'
    };

    try {
      // PocketBase 에 'rfqs' 콜렉션이 있다고 가정
      // (컬렉션 이름/필드는 필요에 따라 맞춰서 수정하면 됨)
      const record = await pb.collection('rfqs').create(payload);
      createdId = record?.id || '';
      submitted = true;

      // 폼 리셋 (원하면 유지하도록 바꿔도 됨)
      projectName = '';
      process = '';
      annualVolume = '';
      description = '';
      constraints = '';
    } catch (err: any) {
      console.error(err);
      errorMsg =
        'RFQ 저장 중 오류가 발생했습니다. PocketBase 주소, 컬렉션 이름, 권한 설정을 확인해주세요.';
    } finally {
      loading = false;
    }
  };
</script>

{#if true}
<main class="rfq-page" in:fade={{ duration: 220 }}>
  <section class="rfq-hero" in:fly={{ y: 16, duration: 240 }}>
    <div>
      <p class="rfq-kicker">CREATE RFQ</p>
      <h1 class="rfq-title">Start with one project.</h1>
      <p class="rfq-sub">
        Use this form for real work: new lines, expansions, retrofits, or automation.
        Keep it high-signal and concrete. You can always follow up with more detail later.
      </p>
    </div>
    <div class="rfq-hero-note">
      <div class="rfq-dot"></div>
      <div class="rfq-hero-note-text">
        <div class="rfq-hero-note-title">What happens next?</div>
        <p>
          RFQs are reviewed, structured, and matched to suitable suppliers. The directory
          is curated – there is no open self-serve blast.
        </p>
      </div>
    </div>
  </section>

  <section class="rfq-card" in:fade={{ duration: 240, delay: 60 }}>
    <form class="rfq-form" on:submit|preventDefault={handleSubmit}>
      <!-- 프로젝트 & 회사 정보 -->
      <div class="rfq-section">
        <h2>Project basics</h2>
        <p class="rfq-section-sub">
          Enough context so a technical salesperson or engineer immediately understands
          what kind of line or cell you’re talking about.
        </p>

        <div class="rfq-grid">
          <div class="field">
            <label>Company / organization (optional)</label>
            <input
              type="text"
              bind:value={companyName}
              placeholder="Example: tier-1 automotive supplier, 3PL warehouse, etc."
            />
          </div>

          <div class="field">
            <label>Project name *</label>
            <input
              type="text"
              bind:value={projectName}
              required
              placeholder="Example: new aluminum extrusion line for building profiles"
            />
          </div>

          <div class="field">
            <label>Your role *</label>
            <div class="radio-row">
              <label>
                <input type="radio" value="buyer" bind:group={role} />
                <span>Buyer / operations / engineering</span>
              </label>
              <label>
                <input type="radio" value="supplier" bind:group={role} />
                <span>Supplier exploring partnership</span>
              </label>
              <label>
                <input type="radio" value="other" bind:group={role} />
                <span>Other</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- 범위 & 지역 -->
      <div class="rfq-section">
        <h2>Scope & location</h2>
        <p class="rfq-section-sub">
          Region and industry help narrow the bench. If you are flexible, mention it in
          the notes below.
        </p>

        <div class="rfq-grid">
          <div class="field">
            <label>Preferred region *</label>
            <select bind:value={region}>
              {#each regions as r}
                <option value={r}>{r}</option>
              {/each}
            </select>
          </div>

          <div class="field">
            <label>Primary industry *</label>
            <select bind:value={industry}>
              {#each industries as ind}
                <option value={ind}>{ind}</option>
              {/each}
            </select>
          </div>

          <div class="field">
            <label>Core process or line focus *</label>
            <input
              bind:value={process}
              required
              placeholder="Example: extrusion & hot saws, shuttle racking, palletizing cells…"
            />
          </div>

          <div class="field">
            <label>Annual volume or throughput target (rough)</label>
            <input
              bind:value={annualVolume}
              placeholder="Example: 15,000 tons/year, 500 pallets/day, 40 modules/hour…"
            />
          </div>

          <div class="field">
            <label>Budget range *</label>
            <select bind:value={budget}>
              {#each budgets as b}
                <option value={b}>{b}</option>
              {/each}
            </select>
          </div>

          <div class="field">
            <label>Target timeline *</label>
            <select bind:value={timeline}>
              {#each timelines as t}
                <option value={t}>{t}</option>
              {/each}
            </select>
          </div>
        </div>
      </div>

      <!-- 상세 설명 -->
      <div class="rfq-section">
        <h2>Technical description</h2>
        <p class="rfq-section-sub">
          Bullet points are fine. Focus on what must be true (layout constraints, safety
          requirements, interfaces with existing lines, etc.).
        </p>

        <div class="field">
          <label>What are you trying to build or upgrade? *</label>
          <textarea
            rows="5"
            bind:value={description}
            required
            placeholder="- New extrusion line to replace existing equipment
- Integrate shuttle racking with existing WMS
- Upgrade press line with robotics & safety guarding…"
          ></textarea>
        </div>

        <div class="field">
          <label>Key constraints or must-haves</label>
          <textarea
            rows="3"
            bind:value={constraints}
            placeholder="- Existing building layout / ceiling height
- Local service coverage in specific country
- Cleanroom / validation / certification requirements…"
          ></textarea>
        </div>
      </div>

      <!-- 연락처 -->
      <div class="rfq-section">
        <h2>Contact</h2>
        <p class="rfq-section-sub">
          Used only to follow up on this RFQ. In the MVP, there is no public profile tied
          to this form.
        </p>

        <div class="rfq-grid">
          <div class="field">
            <label>Your name *</label>
            <input
              bind:value={contactName}
              required
              placeholder="Example: operations manager, project engineer…"
            />
          </div>

          <div class="field">
            <label>Work email *</label>
            <input
              type="email"
              bind:value={contactEmail}
              required
              placeholder="name@company.com"
            />
          </div>
        </div>
      </div>

      <!-- 버튼 & 상태 -->
      <div class="rfq-actions">
        <button class="btn-primary" type="submit" disabled={loading}>
          {#if loading}
            Submitting…
          {:else}
            Create RFQ
          {/if}
        </button>
        <a href="/rfqs" class="btn-ghost-sm">Back to live RFQs</a>
      </div>

      {#if errorMsg}
        <div class="rfq-error">{errorMsg}</div>
      {/if}

      {#if submitted}
        <div class="rfq-success">
          RFQ has been created in the system.
          {#if createdId}
            <span class="rfq-id">ID: {createdId}</span>
          {/if}
          You’ll be contacted after review.
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
  }

  .rfq-hero {
    display: flex;
    justify-content: space-between;
    gap: 32px;
    align-items: flex-start;
    margin-bottom: 32px;
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
    max-width: 520px;
  }

  .rfq-hero-note {
    display: flex;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 18px;
    border: 1px solid rgba(148, 163, 184, 0.8);
    background: radial-gradient(circle at top, rgba(56, 189, 248, 0.18), rgba(15, 23, 42, 0.98));
    box-shadow: 0 18px 40px rgba(15, 23, 42, 1);
    font-size: 11px;
    max-width: 320px;
  }

  .rfq-dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: #22c55e;
    box-shadow: 0 0 18px rgba(34, 197, 94, 0.9);
    margin-top: 4px;
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

  @media (max-width: 900px) {
    .rfq-hero {
      flex-direction: column;
    }
    .rfq-hero-note {
      max-width: none;
    }
  }

  .rfq-card {
    border-radius: 18px;
    border: 1px solid rgba(31, 41, 55, 1);
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.98), rgba(2, 6, 23, 1));
    box-shadow: 0 24px 60px rgba(15, 23, 42, 1);
    padding: 20px 22px 22px;
    font-size: 12px;
  }

  .rfq-form {
    display: flex;
    flex-direction: column;
    gap: 22px;
  }

  .rfq-section h2 {
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

  @media (max-width: 800px) {
    .rfq-grid {
      grid-template-columns: minmax(0, 1fr);
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
    transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
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

  .rfq-id {
    margin-left: 6px;
    font-family: monospace;
    font-weight: 600;
  }
</style>
