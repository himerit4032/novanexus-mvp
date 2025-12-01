<!-- src/routes/suppliers/+page.svelte -->

<svelte:head>
  <title>NovaNexus ▢ Supplier onboarding</title>

  <style>
    :global(body) {
      margin: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
        sans-serif;
      background: #020617;
      color: #e5e7eb;
    }

    .nn-page {
      max-width: 960px;
      margin: 0 auto;
      padding: 96px 24px 120px;
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

    .sup-sub {
      font-size: 14px;
      color: #9ca3af;
      margin-bottom: 32px;
      max-width: 640px;
    }

    .sup-card {
      background: rgba(15, 23, 42, 0.98);
      border-radius: 24px;
      padding: 28px 26px 30px;
      border: 1px solid rgba(148, 163, 184, 0.4);
      box-shadow: 0 24px 60px rgba(15, 23, 42, 0.9);
    }

    .sup-form-grid {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .sup-label {
      font-size: 12px;
      color: #e5e7eb;
      margin-bottom: 4px;
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
      background: rgba(15, 23, 42, 0.9);
      padding: 10px 14px;
      font-size: 13px;
      color: #e5e7eb;
      outline: none;
    }

    .sup-textarea {
      border-radius: 16px;
      min-height: 80px;
      resize: vertical;
    }

    .sup-input:focus,
    .sup-textarea:focus,
    .sup-select:focus {
      border-color: #22d3ee;
      box-shadow: 0 0 0 1px rgba(34, 211, 238, 0.6);
    }

    .sup-error {
      font-size: 11px;
      color: #f97373;
      margin-top: 2px;
    }

    .sup-footer-note {
      margin-top: 16px;
      font-size: 11px;
      color: #6b7280;
    }

    .sup-submit {
      margin-top: 8px;
      padding: 10px 20px;
      border-radius: 999px;
      border: none;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      background: linear-gradient(135deg, #6366f1, #22d3ee);
      color: #020617;
    }

    .sup-submit:hover {
      filter: brightness(1.05);
      transform: translateY(-1px);
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
  </style>
</svelte:head>

<script lang="ts">
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

  let form: SupplierForm = {
    company: '',
    contact: '',
    email: '',
    capabilities: '',
    website: '',
    region: 'USA',
    notes: ''
  };

  let errors = {
    company: '',
    contact: '',
    email: '',
    capabilities: ''
  };

  let submitted = false;

  function validate() {
    errors = { company: '', contact: '', email: '', capabilities: '' };

    if (!form.company.trim()) errors.company = '회사명을 입력해 주세요.';
    if (!form.contact.trim()) errors.contact = '담당자 이름/직함을 입력해 주세요.';
    if (!form.email.trim()) errors.email = '업무용 이메일을 입력해 주세요.';
    if (!form.capabilities.trim())
      errors.capabilities = '가능한 설비 / 공정을 간단히 적어 주세요.';

    return (
      !errors.company &&
      !errors.contact &&
      !errors.email &&
      !errors.capabilities
    );
  }

  function handleSubmit() {
    if (!validate()) return;

    console.log('NovaNexus supplier submission:', form);

    submitted = true;
  }
</script>

<section class="nn-page">
  <div class="sup-header-kicker">Supplier onboarding</div>
  <h1 class="sup-title">Become a vetted NovaNexus supplier</h1>
  <p class="sup-sub">
    We onboard a small number of serious factories in aluminum, racking and
    automation. Tell us who you are and what you build – we’ll follow up with
    drawings and RFQs that fit.
  </p>

  <div class="sup-card">
    {#if !submitted}
      <!-- 입력 폼 상태 -->
      <form class="sup-form-grid" on:submit|preventDefault={handleSubmit}>
        <!-- 회사명 -->
        <div>
          <div class="sup-label">Company name <span>*</span></div>
          <input
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
        <div>
          <div class="sup-label">Main contact person <span>*</span></div>
          <input
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
        <div>
          <div class="sup-label">Work email <span>*</span></div>
          <input
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
        <div>
          <div class="sup-label">Capabilities / machines <span>*</span></div>
          <textarea
            class="sup-textarea"
            placeholder="Aluminum cutting lines, shuttle racks, conveyors, automation, etc."
            bind:value={form.capabilities}
          />
          {#if errors.capabilities}
            <div class="sup-error">{errors.capabilities}</div>
          {/if}
        </div>

        <!-- 웹사이트 -->
        <div>
          <div class="sup-label">Website or catalog URL</div>
          <input
            class="sup-input"
            type="text"
            placeholder="https://..."
            bind:value={form.website}
          />
        </div>

        <!-- Region -->
        <div>
          <div class="sup-label">Region</div>
          <select class="sup-select" bind:value={form.region}>
            <option value="USA">USA</option>
            <option value="Korea">Korea</option>
            <option value="EU">EU</option>
            <option value="MENA">MENA</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <!-- 기타 메모 -->
        <div>
          <div class="sup-label">Anything else we should know?</div>
          <textarea
            class="sup-textarea"
            placeholder="Existing export experience, certifications, target customers, etc."
            bind:value={form.notes}
          />
        </div>

        <button class="sup-submit" type="submit">
          Submit supplier info
        </button>

        <div class="sup-footer-note">
          MVP only: data is logged in the browser console. In production this
          would store to a DB (PocketBase) and trigger an internal review
          workflow.
        </div>
      </form>
    {:else}
      <!-- 제출 완료 상태 -->
      <div>
        <div class="sup-thankyou-title">Thank you – we’ve received your info.</div>
        <p class="sup-thankyou-text">
          We’ll review your capabilities and follow up with drawings and RFQs
          that match. For urgent projects you can also reply directly to Jun’s
          email with PDFs / layouts attached.
        </p>
        <p class="sup-note">
  Our team will follow up with drawings, layouts, and RFQs that match your machines.
  For urgent projects, you can also reply directly to the email in our introduction message.
</p>

      </div>
    {/if}
  </div>
</section>
