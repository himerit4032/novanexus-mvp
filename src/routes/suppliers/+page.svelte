<!-- src/routes/suppliers/+page.svelte -->

<svelte:head>
  <title>NovaNexus ▢ {$t('nav.forSuppliers')}</title>
</svelte:head>

<script lang="ts">
  import { fade, fly, scale } from 'svelte/transition';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { t } from 'svelte-i18n';

  type Region = 'USA' | 'Korea' | 'EU' | 'MENA' | 'Other';

  interface SupplierForm {
    company: string;
    contact: string;
    email: string;
    capabilities: string;
    website: string;
    region: Region;
    notes: string;
  }

  interface SupplierErrors {
    company: string;
    contact: string;
    email: string;
    capabilities: string;
  }

  let form: SupplierForm = {
    company: '',
    contact: '',
    email: '',
    capabilities: '',
    website: '',
    region: 'USA',
    notes: ''
  };

  let errors: SupplierErrors = {
    company: '',
    contact: '',
    email: '',
    capabilities: ''
  };

  let submitted = false;
  let loading = false;
  let backendError = '';
  let backendWarning = '';

  // PocketBase 동적 로드 (있으면 사용, 없으면 데모 모드)
  let pbClient: any = null;

  onMount(async () => {
    if (!browser) return;

    try {
      const mod = await import('$lib/pocketbase');
      pbClient = mod.pb;
    } catch (err) {
      console.warn(
        '[suppliers] PocketBase client load failed. Running in demo mode (console only).',
        err
      );
      backendWarning =
        'Backend is not fully wired yet. Profile is stored for this session and will be connected to PocketBase in production.';
    }
  });

  function resetForm() {
    form = {
      company: '',
      contact: '',
      email: '',
      capabilities: '',
      website: '',
      region: 'USA',
      notes: ''
    };
    errors = {
      company: '',
      contact: '',
      email: '',
      capabilities: ''
    };
  }

  function validate(): boolean {
    const nextErrors: SupplierErrors = {
      company: '',
      contact: '',
      email: '',
      capabilities: ''
    };

    if (!form.company.trim()) {
      nextErrors.company = '회사명을 입력해 주세요.';
    }

    if (!form.contact.trim()) {
      nextErrors.contact = '담당자 이름/직함을 입력해 주세요.';
    }

    if (!form.email.trim()) {
      nextErrors.email = '업무용 이메일을 입력해 주세요.';
    } else {
      // 매우 느슨한 이메일 형식 체크
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(form.email.trim())) {
        nextErrors.email = '유효한 이메일 형식을 입력해 주세요.';
      }
    }

    if (!form.capabilities.trim()) {
      nextErrors.capabilities = '가능한 설비 / 공정을 간단히 적어 주세요.';
    }

    errors = nextErrors;

    return (
      !errors.company &&
      !errors.contact &&
      !errors.email &&
      !errors.capabilities
    );
  }

  async function handleSubmit() {
    if (loading) return;

    backendError = '';
    submitted = false;

    if (!validate()) return;

    loading = true;

    const payload = {
      company_name: form.company,
      contact_name: form.contact,
      work_email: form.email,
      capabilities: form.capabilities,
      website: form.website,
      region: form.region,
      notes: form.notes,
      source: 'supplier_web_form'
    };

    try {
      // 항상 콘솔에는 남겨두기 (MVP 디버깅용)
      console.log('NovaNexus supplier submission:', payload);

      if (pbClient) {
        try {
          await pbClient.collection('suppliers').create(payload);
        } catch (err) {
          console.warn(
            '[suppliers] PocketBase create("suppliers") failed. Check collection & rules.',
            err
          );
          backendError =
            'Backend collection for suppliers is not reachable yet. Your profile was not persisted on the server. Please verify the PocketBase "suppliers" collection and API rules.';
        }
      }

      submitted = true;
      resetForm();
    } finally {
      loading = false;
    }
  }

  function submitAnother() {
    submitted = false;
    backendError = '';
    backendWarning = '';
    resetForm();
  }
</script>

<section class="nn-page" in:fade={{ duration: 260 }}>
  <!-- 헤더 영역 -->
  <header class="sup-header" in:fly={{ y: 18, duration: 340 }}>
    <div class="sup-header-kicker">SUPPLIER ONBOARDING</div>

    <h1 class="sup-title">
      <span class="sup-title-gradient">{$t('suppliers.heroTitle')}</span>
    </h1>

    <p class="sup-sub">
      {$t('suppliers.heroSubtitle')}
    </p>

    <div class="sup-metrics">
      <div class="sup-metric-pill">
        <div class="sup-metric-label">Qualified suppliers</div>
        <div class="sup-metric-value">160+</div>
      </div>
      <div class="sup-metric-pill">
        <div class="sup-metric-label">Core manufacturing verticals</div>
        <div class="sup-metric-value">12</div>
      </div>
      <div class="sup-metric-pill">
        <div class="sup-metric-label">Active regions</div>
        <div class="sup-metric-value">4</div>
      </div>
    </div>

    <h2 class="sup-benefits-title">
      {$t('suppliers.benefitsTitle')}
    </h2>

    <div class="sup-benefits-grid">
      <article class="sup-benefit-card">
        <h3 class="sup-benefit-heading">
          {$t('suppliers.benefits.fitTitle')}
        </h3>
        <p class="sup-benefit-body">
          {$t('suppliers.benefits.fitBody')}
        </p>
      </article>

      <article class="sup-benefit-card">
        <h3 class="sup-benefit-heading">
          {$t('suppliers.benefits.contextTitle')}
        </h3>
        <p class="sup-benefit-body">
          {$t('suppliers.benefits.contextBody')}
        </p>
      </article>

      <article class="sup-benefit-card">
        <h3 class="sup-benefit-heading">
          {$t('suppliers.benefits.supportTitle')}
        </h3>
        <p class="sup-benefit-body">
          {$t('suppliers.benefits.supportBody')}
        </p>
      </article>
    </div>
  </header>

  <!-- 입력 카드 -->
  <div class="sup-card" in:scale={{ duration: 320, start: 0.96 }}>
    <!-- 시각적 오비트 / 글로우 -->
    <div class="sup-orbit sup-orbit-outer"></div>
    <div class="sup-orbit sup-orbit-inner"></div>
    <div class="sup-orbit-dot sup-orbit-dot-1"></div>
    <div class="sup-orbit-dot sup-orbit-dot-2"></div>
    <div class="sup-orbit-dot sup-orbit-dot-3"></div>

    {#if !submitted}
      <!-- 입력 폼 상태 -->
      <form class="sup-form-grid" on:submit|preventDefault={handleSubmit}>
        <!-- 회사명 -->
        <div in:fade={{ duration: 220, delay: 40 }}>
          <label class="sup-label" for="sup-company">
            Company name <span>*</span>
          </label>
          <input
            id="sup-company"
            class="sup-input"
            type="text"
            placeholder="Youngshin, Nexlogitech, Speedrack, ..."
            bind:value={form.company}
          />
          {#if errors.company}
            <div class="sup-error">{errors.company}</div>
          {/if}
        </div>

        <!-- 담당자 -->
        <div in:fade={{ duration: 220, delay: 80 }}>
          <label class="sup-label" for="sup-contact">
            Main contact person <span>*</span>
          </label>
          <input
            id="sup-contact"
            class="sup-input"
            type="text"
            placeholder="Name / role"
            bind:value={form.contact}
          />
          {#if errors.contact}
            <div class="sup-error">{errors.contact}</div>
          {/if}
        </div>

        <!-- 이메일 -->
        <div in:fade={{ duration: 220, delay: 120 }}>
          <label class="sup-label" for="sup-email">
            Work email <span>*</span>
          </label>
          <input
            id="sup-email"
            class="sup-input"
            type="email"
            placeholder="name@company.com"
            bind:value={form.email}
          />
          {#if errors.email}
            <div class="sup-error">{errors.email}</div>
          {/if}
        </div>

        <!-- Capabilities -->
        <div in:fade={{ duration: 220, delay: 160 }}>
          <label class="sup-label" for="sup-capabilities">
            Capabilities / machines <span>*</span>
          </label>
          <textarea
            id="sup-capabilities"
            class="sup-textarea"
            placeholder="Aluminum cutting lines, shuttle racks, conveyors, automation, etc."
            bind:value={form.capabilities}
          />
          {#if errors.capabilities}
            <div class="sup-error">{errors.capabilities}</div>
          {/if}
        </div>

        <!-- 웹사이트 -->
        <div in:fade={{ duration: 220, delay: 200 }}>
          <label class="sup-label" for="sup-website">Website or catalog URL</label>
          <input
            id="sup-website"
            class="sup-input"
            type="text"
            placeholder="https://..."
            bind:value={form.website}
          />
        </div>

        <!-- Region + notes 2열 -->
        <div class="sup-two-col" in:fade={{ duration: 240, delay: 220 }}>
          <div>
            <label class="sup-label" for="sup-region">Region</label>
            <select
              id="sup-region"
              class="sup-select"
              bind:value={form.region}
            >
              <option value="USA">USA</option>
              <option value="Korea">Korea</option>
              <option value="EU">EU</option>
              <option value="MENA">MENA</option>
              <option value="Other">Other</option>
            </select>
            <div class="sup-region-hint">
              Where your main plant or installation team is based.
            </div>
          </div>

          <div>
            <label class="sup-label" for="sup-notes">
              Anything else we should know?
            </label>
            <textarea
              id="sup-notes"
              class="sup-textarea sup-textarea-notes"
              placeholder="Existing export experience, certifications, target customers, etc."
              bind:value={form.notes}
            />
          </div>
        </div>

        <div class="sup-actions" in:fade={{ duration: 260, delay: 260 }}>
          <button class="sup-submit" type="submit" disabled={loading}>
            <span>{loading ? 'Submitting…' : $t('suppliers.ctaApply')}</span>
          </button>
          <div class="sup-footer-note">
            MVP only: data is logged in the browser console.
            {#if !backendError && !backendWarning}
              In production this will store to PocketBase and trigger an internal review workflow.
            {/if}
            {#if backendWarning}
              <br />{backendWarning}
            {/if}
          </div>
          {#if backendError}
            <div class="sup-error" style="margin-top:4px">{backendError}</div>
          {/if}
        </div>
      </form>
    {:else}
      <!-- 제출 완료 상태 -->
      <div class="sup-thankyou" in:fade={{ duration: 260 }}>
        <div class="sup-thankyou-title">
          Thank you – we’ve received your info.
        </div>
        <p class="sup-thankyou-text">
          We’ll review your capabilities and follow up with drawings and RFQs that match.
          For urgent projects you can also reply directly to Jun’s email with PDFs / layouts attached.
        </p>
        <p class="sup-note">
          Our team filters for projects where your machines and region actually make sense –
          no mass RFQ spam, just targeted opportunities.
        </p>

        <button
          class="sup-submit"
          type="button"
          style="margin-top:14px"
          on:click={submitAnother}
        >
          <span>Submit another factory</span>
        </button>
      </div>
    {/if}
  </div>
</section>

<style>
  :global(body) {
    margin: 0;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background:
      radial-gradient(circle at top left, #020617 0, #020617 55%, #020617 100%);
    color: #e5e7eb;
  }

  .nn-page {
    max-width: 1120px;
    margin: 0 auto;
    padding: 96px 24px 120px;
    position: relative;
    overflow: hidden;
  }

  .sup-header {
    max-width: 720px;
    margin-bottom: 32px;
  }

  .sup-header-kicker {
    font-size: 11px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #22d3ee;
    margin-bottom: 8px;
  }

  .sup-title {
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 10px;
    color: #f9fafb;
  }

  .sup-title-gradient {
    background: linear-gradient(135deg, #38bdf8, #a855f7, #22c55e);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: titleShift 16s ease-in-out infinite;
  }

  .sup-sub {
    font-size: 14px;
    color: #9ca3af;
    max-width: 640px;
  }

  .sup-metrics {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 20px;
  }

  .sup-metric-pill {
    flex: 1;
    min-width: 160px;
    padding: 10px 14px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.6);
    background: radial-gradient(
      circle at top left,
      rgba(56, 189, 248, 0.18),
      rgba(15, 23, 42, 0.98)
    );
    font-size: 11px;
    position: relative;
    overflow: hidden;
  }

  .sup-metric-pill::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      120deg,
      transparent,
      rgba(248, 250, 252, 0.2),
      transparent
    );
    transform: translateX(-100%);
    animation: shimmer 8s linear infinite;
    opacity: 0.9;
  }

  .sup-metric-label {
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #bfdbfe;
    margin-bottom: 2px;
  }

  .sup-metric-value {
    font-size: 16px;
    font-weight: 600;
    color: #e5e7eb;
  }

  .sup-benefits-title {
    margin-top: 28px;
    margin-bottom: 12px;
    font-size: 18px;
    font-weight: 600;
    color: #f9fafb;
  }

  .sup-benefits-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 8px;
  }

  .sup-benefit-card {
    border-radius: 18px;
    border: 1px solid rgba(148, 163, 184, 0.55);
    background: radial-gradient(
      circle at top left,
      rgba(56, 189, 248, 0.14),
      rgba(15, 23, 42, 0.98)
    );
    padding: 12px 14px;
  }

  .sup-benefit-heading {
    font-size: 13px;
    font-weight: 600;
    color: #e5e7eb;
    margin-bottom: 4px;
  }

  .sup-benefit-body {
    font-size: 12px;
    color: #9ca3af;
  }

  .sup-card {
    position: relative;
    margin-top: 12px;
    background: radial-gradient(
      circle at top left,
      rgba(34, 211, 238, 0.16),
      rgba(15, 23, 42, 0.98)
    );
    border-radius: 24px;
    padding: 30px 26px 32px;
    border: 1px solid rgba(148, 163, 184, 0.4);
    box-shadow: 0 26px 70px rgba(15, 23, 42, 0.95);
    overflow: hidden; /* 오른쪽 삐져나오는 문제 방지 */
    animation: floatCard 10s ease-in-out infinite alternate;
  }

  .sup-form-grid {
    display: flex;
    flex-direction: column;
    gap: 18px;
    position: relative;
    z-index: 1;
  }

  /* 오른쪽 시각적 오비트 */

  .sup-orbit {
    position: absolute;
    right: -80px;
    top: 0;
    width: 320px;
    height: 320px;
    border-radius: 50%;
    border: 1px solid rgba(148, 163, 184, 0.35);
    background: radial-gradient(
      circle at 30% 20%,
      rgba(59, 130, 246, 0.35),
      transparent 60%
    );
    filter: blur(1px);
    opacity: 0.7;
    pointer-events: none;
  }

  .sup-orbit-outer {
    animation: orbitDrift 26s ease-in-out infinite alternate;
  }

  .sup-orbit-inner {
    width: 220px;
    height: 220px;
    top: 60px;
    right: -30px;
    border-color: rgba(56, 189, 248, 0.5);
    animation: orbitSpin 22s linear infinite;
  }

  .sup-orbit-dot {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: #22c55e;
    box-shadow: 0 0 14px rgba(34, 197, 94, 0.9);
    pointer-events: none;
  }

  .sup-orbit-dot-1 {
    top: 40px;
    right: 48px;
    animation: dotPulse 2.4s ease-in-out infinite;
  }

  .sup-orbit-dot-2 {
    top: 170px;
    right: 12px;
    animation: dotPulse 2.8s ease-in-out infinite 0.6s;
  }

  .sup-orbit-dot-3 {
    top: 250px;
    right: 120px;
    animation: dotPulse 3.1s ease-in-out infinite 1s;
  }

  .sup-label {
    font-size: 12px;
    color: #e5e7eb;
    margin-bottom: 4px;
    display: inline-block;
  }

  .sup-label span {
    color: #f97373;
  }

  .sup-input,
  .sup-textarea,
  .sup-select {
    width: 100%;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.7);
    background: rgba(15, 23, 42, 0.95);
    padding: 10px 14px;
    font-size: 13px;
    color: #e5e7eb;
    outline: none;
    transition:
      border-color 0.18s ease,
      box-shadow 0.18s ease,
      background 0.18s ease,
      transform 0.12s ease;
  }

  .sup-textarea {
    border-radius: 16px;
    min-height: 80px;
    resize: vertical;
  }

  .sup-textarea-notes {
    min-height: 96px;
  }

  .sup-input::placeholder,
  .sup-textarea::placeholder {
    color: #6b7280;
  }

  .sup-input:focus,
  .sup-textarea:focus,
  .sup-select:focus {
    border-color: #22d3ee;
    box-shadow:
      0 0 0 1px rgba(34, 211, 238, 0.7),
      0 14px 32px rgba(15, 23, 42, 0.95);
    background: rgba(15, 23, 42, 0.98);
    transform: translateY(-1px);
  }

  .sup-error {
    font-size: 11px;
    color: #f97373;
    margin-top: 4px;
  }

  .sup-two-col {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.9fr);
    gap: 18px;
  }

  .sup-region-hint {
    font-size: 11px;
    color: #6b7280;
    margin-top: 4px;
  }

  .sup-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 6px;
  }

  .sup-footer-note {
    font-size: 11px;
    color: #6b7280;
  }

  .sup-submit {
    align-self: flex-start;
    padding: 10px 22px;
    border-radius: 999px;
    border: none;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    background: conic-gradient(
      from 140deg,
      #3b82f6,
      #22c1c3,
      #a855f7,
      #3b82f6
    );
    color: #020617;
    box-shadow:
      0 18px 46px rgba(15, 23, 42, 1),
      0 0 0 1px rgba(148, 163, 184, 0.5);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    position: relative;
    overflow: hidden;
    transition:
      transform 0.18s ease,
      box-shadow 0.18s ease,
      filter 0.18s ease,
      opacity 0.18s ease;
  }

  .sup-submit[disabled] {
    opacity: 0.7;
    cursor: wait;
  }

  .sup-submit span {
    position: relative;
    z-index: 1;
  }

  .sup-submit::after {
    content: "→";
    font-size: 13px;
    margin-left: 4px;
    transition: transform 0.18s ease;
  }

  .sup-submit::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at 0% 0%,
      rgba(248, 250, 252, 0.4),
      transparent 55%
    );
    mix-blend-mode: screen;
    opacity: 0;
    transition: opacity 0.18s ease;
  }

  .sup-submit:hover:not([disabled]) {
    transform: translateY(-1px);
    box-shadow:
      0 24px 60px rgba(15, 23, 42, 1),
      0 0 0 1px rgba(248, 250, 252, 0.7);
    filter: saturate(1.15);
  }

  .sup-submit:hover:not([disabled])::after {
    transform: translateX(2px);
  }

  .sup-submit:hover:not([disabled])::before {
    opacity: 1;
  }

  .sup-thankyou {
    position: relative;
    z-index: 1;
  }

  .sup-thankyou-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #f9fafb;
  }

  .sup-thankyou-text {
    font-size: 14px;
    color: #9ca3af;
    margin-bottom: 10px;
  }

  .sup-note {
    font-size: 12px;
    color: #9ca3af;
  }

  @media (max-width: 900px) {
    .nn-page {
      padding-inline: 16px;
    }

    .sup-two-col {
      grid-template-columns: minmax(0, 1fr);
    }

    .sup-orbit,
    .sup-orbit-dot {
      opacity: 0.55;
      right: -120px;
    }

    .sup-benefits-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (max-width: 640px) {
    .sup-title {
      font-size: 24px;
    }

    .sup-card {
      padding: 24px 18px 26px;
      border-radius: 20px;
    }

    .sup-metrics {
      gap: 8px;
    }
  }

  /* KEYFRAMES */

  @keyframes floatCard {
    0% {
      transform: translate3d(0, 0, 0);
    }
    100% {
      transform: translate3d(0, -6px, 0);
    }
  }

  @keyframes orbitDrift {
    0% {
      transform: translate3d(0, 0, 0);
    }
    100% {
      transform: translate3d(-18px, 10px, 0);
    }
  }

  @keyframes orbitSpin {
    0% {
      transform: translate3d(0, 0, 0) rotate(0deg);
    }
    100% {
      transform: translate3d(0, 0, 0) rotate(360deg);
    }
  }

  @keyframes dotPulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    70% {
      transform: scale(1.5);
      opacity: 0.2;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  @keyframes titleShift {
    0%,
    100% {
      filter: brightness(1);
    }
    50% {
      filter: brightness(1.15);
    }
  }
</style>
