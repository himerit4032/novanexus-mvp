<!-- src/routes/rfqs/new/+page.svelte -->

<svelte:head>
  <title>{$t('rfqNew.metaTitle')}</title>
</svelte:head>

<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { browser } from '$app/environment';
  import { t } from 'svelte-i18n';
  import { get } from 'svelte/store';

  const translate = (key: string) => get(t)(key) as string;

  // ----- 옵션 상수들 (값 = 백엔드에 저장, labelKey = 번역 키) -----
  type Option = { value: string; labelKey: string };

  const regionOptions: Option[] = [
    { value: 'Korea', labelKey: 'rfqNew.fields.region.options.korea' },
    { value: 'USA', labelKey: 'rfqNew.fields.region.options.usa' },
    { value: 'Europe', labelKey: 'rfqNew.fields.region.options.europe' },
    { value: 'Japan', labelKey: 'rfqNew.fields.region.options.japan' },
    { value: 'Vietnam', labelKey: 'rfqNew.fields.region.options.vietnam' },
    { value: 'Middle East', labelKey: 'rfqNew.fields.region.options.middleEast' },
    { value: 'Other', labelKey: 'rfqNew.fields.region.options.other' }
  ];

  const industryOptions: Option[] = [
    { value: 'Aluminum extrusion & finishing', labelKey: 'rfqNew.fields.industry.options.aluminum' },
    { value: 'CNC machining & fabrication', labelKey: 'rfqNew.fields.industry.options.cnc' },
    { value: 'Press lines & forming', labelKey: 'rfqNew.fields.industry.options.press' },
    { value: 'Industrial robotics & cells', labelKey: 'rfqNew.fields.industry.options.robotics' },
    { value: 'Material handling & conveyors', labelKey: 'rfqNew.fields.industry.options.conveyors' },
    { value: 'Warehouse systems & AS/RS', labelKey: 'rfqNew.fields.industry.options.warehouse' },
    { value: 'Packaging & end-of-line', labelKey: 'rfqNew.fields.industry.options.packaging' },
    { value: 'Injection molding & plastics', labelKey: 'rfqNew.fields.industry.options.plastics' },
    { value: 'Steel processing & coil lines', labelKey: 'rfqNew.fields.industry.options.steel' },
    { value: 'Food & beverage automation', labelKey: 'rfqNew.fields.industry.options.food' },
    { value: 'Pharma & medical devices', labelKey: 'rfqNew.fields.industry.options.pharma' },
    { value: 'EV & battery production lines', labelKey: 'rfqNew.fields.industry.options.ev' },
    { value: 'Other', labelKey: 'rfqNew.fields.industry.options.other' }
  ];

  const budgetOptions: Option[] = [
    { value: '<$200k', labelKey: 'rfqNew.fields.budget.options.lt200' },
    { value: '$200k–$500k', labelKey: 'rfqNew.fields.budget.options.200to500' },
    { value: '$500k–$1M', labelKey: 'rfqNew.fields.budget.options.500to1m' },
    { value: '$1M–$3M', labelKey: 'rfqNew.fields.budget.options.1to3m' },
    { value: '$3M+', labelKey: 'rfqNew.fields.budget.options.gt3m' }
  ];

  const timelineOptions: Option[] = [
    { value: '<3 months', labelKey: 'rfqNew.fields.timeline.options.lt3' },
    { value: '3–6 months', labelKey: 'rfqNew.fields.timeline.options.3to6' },
    { value: '6–12 months', labelKey: 'rfqNew.fields.timeline.options.6to12' },
    { value: '12+ months', labelKey: 'rfqNew.fields.timeline.options.gt12' }
  ];

  // ----- 상태 -----
  let mounted = false;

  let companyName = '';
  let projectName = '';
  let role: 'buyer' | 'supplier' | 'other' = 'buyer';
  let region = regionOptions[0].value;
  let industry = industryOptions[0].value;
  let process = '';
  let annualVolume = '';
  let budget = budgetOptions[1].value;
  let timeline = timelineOptions[1].value;
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
    if (!projectName.trim()) return translate('rfqNew.validation.projectName');
    if (!process.trim()) return translate('rfqNew.validation.process');
    if (!description.trim()) return translate('rfqNew.validation.description');
    if (!contactName.trim()) return translate('rfqNew.validation.contactName');
    if (!contactEmail.trim()) return translate('rfqNew.validation.contactEmail');
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
      errorMsg = translate('rfqNew.errors.noBackend');
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
      errorMsg = translate('rfqNew.errors.saveFailed');
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
      <p class="rfq-kicker">{$t('rfqNew.hero.kicker')}</p>
      <h1 class="rfq-title">{$t('rfqNew.hero.title')}</h1>
      <p class="rfq-sub">
        {$t('rfqNew.hero.subtitle')}
      </p>

      <div class="rfq-steps">
        <div class="step-pill">
          <span class="step-index">1</span>
          <span>{$t('rfqNew.hero.steps.basics')}</span>
        </div>
        <div class="step-pill">
          <span class="step-index">2</span>
          <span>{$t('rfqNew.hero.steps.scope')}</span>
        </div>
        <div class="step-pill">
          <span class="step-index">3</span>
          <span>{$t('rfqNew.hero.steps.tech')}</span>
        </div>
        <div class="step-pill">
          <span class="step-index">4</span>
          <span>{$t('rfqNew.hero.steps.contact')}</span>
        </div>
      </div>
    </div>

    <aside class="rfq-hero-note" in:fade={{ duration: 260, delay: 120 }}>
      <div class="rfq-dot-wrapper">
        <div class="rfq-dot-ping"></div>
        <div class="rfq-dot"></div>
      </div>
      <div class="rfq-hero-note-text">
        <div class="rfq-hero-note-title">
          {$t('rfqNew.hero.noteTitle')}
        </div>
        <p>
          {$t('rfqNew.hero.noteBody')}
        </p>
        <p class="rfq-hero-note-foot">
          {$t('rfqNew.hero.noteFoot')}
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
          <h2>{$t('rfqNew.sections.basics.title')}</h2>
          <p class="rfq-section-sub">
            {$t('rfqNew.sections.basics.subtitle')}
          </p>
        </div>

        <div class="rfq-grid">
          <div class="field">
            <label for="rfq-company">
              {$t('rfqNew.fields.company.label')}
            </label>
            <input
              id="rfq-company"
              name="company_name"
              type="text"
              bind:value={companyName}
              placeholder={$t('rfqNew.fields.company.placeholder')}
              autocomplete="organization"
            />
          </div>

          <div class="field">
            <label for="rfq-project">
              {$t('rfqNew.fields.projectName.label')}
            </label>
            <input
              id="rfq-project"
              name="project_name"
              type="text"
              bind:value={projectName}
              required
              autocomplete="off"
              placeholder={$t('rfqNew.fields.projectName.placeholder')}
            />
          </div>

          <div class="field field-role">
            <div class="field-label">
              {$t('rfqNew.fields.role.label')}
            </div>
            <div class="radio-row" aria-label={$t('rfqNew.fields.role.label')}>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="buyer"
                  bind:group={role}
                />
                <span>{$t('rfqNew.fields.role.options.buyer')}</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="supplier"
                  bind:group={role}
                />
                <span>{$t('rfqNew.fields.role.options.supplier')}</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="other"
                  bind:group={role}
                />
                <span>{$t('rfqNew.fields.role.options.other')}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Scope & region -->
      <div class="rfq-section">
        <div class="rfq-section-head">
          <h2>{$t('rfqNew.sections.scope.title')}</h2>
          <p class="rfq-section-sub">
            {$t('rfqNew.sections.scope.subtitle')}
          </p>
        </div>

        <div class="rfq-grid">
          <div class="field">
            <label for="rfq-region">
              {$t('rfqNew.fields.region.label')}
            </label>
            <select id="rfq-region" name="region" bind:value={region} required>
              {#each regionOptions as r}
                <option value={r.value}>{$t(r.labelKey)}</option>
              {/each}
            </select>
          </div>

          <div class="field">
            <label for="rfq-industry">
              {$t('rfqNew.fields.industry.label')}
            </label>
            <select id="rfq-industry" name="industry" bind:value={industry} required>
              {#each industryOptions as ind}
                <option value={ind.value}>{$t(ind.labelKey)}</option>
              {/each}
            </select>
          </div>

          <div class="field">
            <label for="rfq-process">
              {$t('rfqNew.fields.process.label')}
            </label>
            <input
              id="rfq-process"
              name="process_focus"
              bind:value={process}
              required
              placeholder={$t('rfqNew.fields.process.placeholder')}
            />
          </div>

          <div class="field">
            <label for="rfq-volume">
              {$t('rfqNew.fields.annualVolume.label')}
            </label>
            <input
              id="rfq-volume"
              name="annual_volume"
              bind:value={annualVolume}
              placeholder={$t('rfqNew.fields.annualVolume.placeholder')}
            />
          </div>

          <div class="field">
            <label for="rfq-budget">
              {$t('rfqNew.fields.budget.label')}
            </label>
            <select id="rfq-budget" name="budget_range" bind:value={budget} required>
              {#each budgetOptions as b}
                <option value={b.value}>{$t(b.labelKey)}</option>
              {/each}
            </select>
          </div>

          <div class="field">
            <label for="rfq-timeline">
              {$t('rfqNew.fields.timeline.label')}
            </label>
            <select id="rfq-timeline" name="timeline" bind:value={timeline} required>
              {#each timelineOptions as tOpt}
                <option value={tOpt.value}>{$t(tOpt.labelKey)}</option>
              {/each}
            </select>
          </div>
        </div>
      </div>

      <!-- Technical description -->
      <div class="rfq-section">
        <div class="rfq-section-head">
          <h2>{$t('rfqNew.sections.tech.title')}</h2>
          <p class="rfq-section-sub">
            {$t('rfqNew.sections.tech.subtitle')}
          </p>
        </div>

        <div class="field">
          <label for="rfq-description">
            {$t('rfqNew.fields.description.label')}
          </label>
          <textarea
            id="rfq-description"
            name="description"
            rows="5"
            bind:value={description}
            required
            placeholder={$t('rfqNew.fields.description.placeholder')}
          ></textarea>
        </div>

        <div class="field">
          <label for="rfq-constraints">
            {$t('rfqNew.fields.constraints.label')}
          </label>
          <textarea
            id="rfq-constraints"
            name="constraints"
            rows="3"
            bind:value={constraints}
            placeholder={$t('rfqNew.fields.constraints.placeholder')}
          ></textarea>
        </div>
      </div>

      <!-- Contact -->
      <div class="rfq-section">
        <div class="rfq-section-head">
          <h2>{$t('rfqNew.sections.contact.title')}</h2>
          <p class="rfq-section-sub">
            {$t('rfqNew.sections.contact.subtitle')}
          </p>
        </div>

        <div class="rfq-grid">
          <div class="field">
            <label for="rfq-contact-name">
              {$t('rfqNew.fields.contactName.label')}
            </label>
            <input
              id="rfq-contact-name"
              name="contact_name"
              bind:value={contactName}
              required
              autocomplete="name"
              placeholder={$t('rfqNew.fields.contactName.placeholder')}
            />
          </div>

          <div class="field">
            <label for="rfq-contact-email">
              {$t('rfqNew.fields.contactEmail.label')}
            </label>
            <input
              id="rfq-contact-email"
              name="contact_email"
              type="email"
              bind:value={contactEmail}
              required
              autocomplete="email"
              placeholder={$t('rfqNew.fields.contactEmail.placeholder')}
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
            {$t('rfqNew.actions.submitting')}
          {:else}
            {$t('rfqNew.actions.submit')}
          {/if}
        </button>

        <a href="/rfqs" class="btn-ghost-sm">
          {$t('rfqNew.actions.backToRfqs')}
        </a>
      </div>

      {#if errorMsg}
        <div id="rfq-error" class="rfq-error">
          {errorMsg}
        </div>
      {/if}

      {#if submitted}
        <div id="rfq-success" class="rfq-success">
          <div class="rfq-success-title">
            {$t('rfqNew.success.title')}
          </div>
          <p>
            {$t('rfqNew.success.body')}
            {#if createdId}
              <span class="rfq-id">
                {$t('rfqNew.success.internalIdPrefix')} {createdId}
              </span>
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
