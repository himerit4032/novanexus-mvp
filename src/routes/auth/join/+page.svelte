<!-- src/routes/auth/join/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { pb } from '$lib/pocketbase';
  import { goto } from '$app/navigation';

  let mounted = false;

  let name = '';
  let email = '';
  let role: 'buyer' | 'supplier' | 'both' = 'buyer';
  let notes = '';

  let password = '';
  let passwordConfirm = '';

  let submitting = false;
  let error = '';
  let success = '';

  onMount(() => {
    mounted = true;
  });

  const validate = () => {
    if (!name.trim()) return 'Name is required.';
    if (!email.trim()) return 'Work email is required.';
    if (!password.trim() || !passwordConfirm.trim())
      return 'Password is required.';
    if (password.length < 8)
      return 'Password must be at least 8 characters.';
    if (password !== passwordConfirm) return 'Passwords do not match.';
    return '';
  };

  const handleSubmit = async () => {
    if (submitting) return;

    error = '';
    success = '';

    const v = validate();
    if (v) {
      error = v;
      return;
    }

    submitting = true;

    try {
      const payload = {
        email,
        password,
        passwordConfirm,
        name,
        role,
        notes
      };

      // users 컬렉션에 계정 생성
      await pb.collection('users').create(payload);

      // 자동 로그인
      await pb.collection('users').authWithPassword(email, password);

      success = 'Account created. Redirecting to your NovaNexus portal…';

      setTimeout(() => {
        goto('/dashboard/buyer');
      }, 700);
    } catch (err: any) {
      console.error(err);
      error =
        err?.message ??
        'Could not create your account. Please check your details and try again.';
    } finally {
      submitting = false;
    }
  };

  const buyerSignals = [
    'Plant / OEM teams planning real capex (lines, cells, warehouses, automation).',
    'RFQs where drawings, throughput and budget bands are already roughly defined.',
    'Projects where Korea · APAC factories are a realistic option, not an afterthought.'
  ];

  const supplierSignals = [
    'Factories with proven export track record or installation partners in-region.',
    'Shops that can own both fabrication and on-site commissioning, not just machine sales.',
    'Teams comfortable working from structured RFQs, drawings and target standards.'
  ];
</script>

<svelte:head>
  <title>Create account ▢ NovaNexus</title>
</svelte:head>

<main class="join-page" class:join-page--hidden={!mounted}>
  <section class="join-card">
    <!-- TOP HEADER -->
    <header class="join-card__header">
      <div>
        <div class="join-chip">
          <span class="join-chip__dot"></span>
          <span class="join-chip__label">BETA ACCESS · PORTAL ACCOUNT</span>
        </div>
        <h1 class="join-title">
          Create your NovaNexus
          <span class="join-title__gradient">buyer / supplier account</span>.
        </h1>
        <p class="join-sub">
          One secure login for RFQs, proposals and project status. Join as a buyer,
          supplier or both – and connect live projects with the right factories.
        </p>
      </div>

      <div class="join-meta">
        <div>
          <p class="join-meta__label">TYPICAL RESPONSE</p>
          <p class="join-meta__value">3–5 business days</p>
        </div>
        <div class="join-meta__divider"></div>
        <div>
          <p class="join-meta__label">REGION FOCUS</p>
          <p class="join-meta__value">
            Cross-border projects across North America, Europe and Korea · APAC hubs.
          </p>
        </div>
      </div>
    </header>

    <!-- BODY: LEFT FORM + RIGHT PANEL -->
    <div class="join-body">
      <!-- LEFT: FORM -->
      <div class="join-form">
        {#if error}
          <div class="join-alert join-alert--error">
            {error}
          </div>
        {/if}

        {#if success}
          <div class="join-alert join-alert--success">
            {success}
          </div>
        {/if}

        <div class="join-form__intro">
          <h2>Set up your creator account for NovaNexus.</h2>
          <p>
            This login will own RFQs, proposals and project threads. You can add plant,
            engineering or sourcing teammates later inside the portal.
          </p>
        </div>

        <form class="join-form__grid" on:submit|preventDefault={handleSubmit}>
          <div class="join-field join-field--half">
            <label>Name</label>
            <input
              class="join-input"
              bind:value={name}
              required
              placeholder="Your full name"
            />
          </div>

          <div class="join-field join-field--half">
            <label>Work email</label>
            <input
              class="join-input"
              type="email"
              bind:value={email}
              required
              placeholder="name@company.com"
            />
          </div>

          <div class="join-field join-field--half">
            <label>Password</label>
            <input
              class="join-input"
              type="password"
              bind:value={password}
              required
              placeholder="At least 8 characters"
            />
          </div>

          <div class="join-field join-field--half">
            <label>Confirm password</label>
            <input
              class="join-input"
              type="password"
              bind:value={passwordConfirm}
              required
              placeholder="Re-enter password"
            />
          </div>

          <div class="join-field">
            <label>Your main role today</label>
            <div class="join-role-row">
              <button
                type="button"
                class={`join-role ${role === 'buyer' ? 'join-role--active' : ''}`}
                on:click={() => (role = 'buyer')}
              >
                Buyer / operator
              </button>
              <button
                type="button"
                class={`join-role ${role === 'supplier' ? 'join-role--active' : ''}`}
                on:click={() => (role = 'supplier')}
              >
                Supplier / manufacturer
              </button>
              <button
                type="button"
                class={`join-role ${role === 'both' ? 'join-role--active' : ''}`}
                on:click={() => (role = 'both')}
              >
                Buyer &amp; supplier
              </button>
            </div>
            <p class="join-helper">
              This just guides onboarding. You can still use NovaNexus on both sides of a
              project.
            </p>
          </div>

          <div class="join-field">
            <label>What lines / projects are you thinking about?</label>
            <textarea
              class="join-textarea"
              rows="4"
              bind:value={notes}
              placeholder="Examples: EV battery module line in US, AS/RS warehouse in EU, extrusion + machining for building profiles in APAC…"
            />
          </div>

          <div class="join-actions">
            <button
              type="submit"
              class="join-btn-primary"
              disabled={submitting}
            >
              {#if submitting}
                Creating your account…
              {:else}
                Create NovaNexus account
              {/if}
            </button>
            <p class="join-small">
              This is your primary creator account. You can invite teammates or
              integrators later from inside the portal.
            </p>
            <p class="join-small">
              Already have an account?
              <a href="/login" class="join-link">Log in instead</a>
            </p>
          </div>
        </form>
      </div>

      <!-- RIGHT: CONTEXT -->
      <aside class="join-side">
        <div class="join-side__block">
          <p class="join-side__label">Strong fits on the buyer side</p>
          <ul>
            {#each buyerSignals as item}
              <li>
                <span class="join-dot"></span>
                <span>{item}</span>
              </li>
            {/each}
          </ul>
        </div>

        <div class="join-side__divider"></div>

        <div class="join-side__block">
          <p class="join-side__label">What we look for on the supplier side</p>
          <ul>
            {#each supplierSignals as item}
              <li>
                <span class="join-square">▢</span>
                <span>{item}</span>
              </li>
            {/each}
          </ul>
        </div>

        <div class="join-side__bottom">
          <div>
            <p class="join-side__meta-label">What this login controls</p>
            <p class="join-side__meta-body">
              RFQs, proposals, project history and key files across your lines and
              warehouses.
            </p>
          </div>
          <div>
            <p class="join-side__meta-label">Access &amp; safety</p>
            <p class="join-side__meta-body">
              Each teammate gets their own login. You can revoke or rotate access any time.
            </p>
          </div>
        </div>
      </aside>
    </div>
  </section>
</main>

<style>
  .join-page {
    min-height: calc(100vh - 72px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 64px 16px;
    background: radial-gradient(circle at top, #020617, #000814 70%);
    color: #e5e7eb;
  }

  .join-page--hidden {
    opacity: 0;
  }

  .join-card {
    width: 100%;
    max-width: 1080px;
    border-radius: 32px;
    border: 1px solid rgba(15, 23, 42, 0.95);
    background:
      radial-gradient(circle at top left, rgba(56, 189, 248, 0.16), transparent 60%),
      radial-gradient(circle at bottom right, rgba(129, 140, 248, 0.18), rgba(15, 23, 42, 0.98));
    box-shadow:
      0 32px 90px rgba(15, 23, 42, 1),
      0 0 0 1px rgba(15, 23, 42, 0.95);
    padding: 22px 20px 22px;
  }

  .join-card__header {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 18px;
  }

  .join-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.65);
    background: rgba(15, 23, 42, 0.96);
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }

  .join-chip__dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: radial-gradient(circle at 30% 30%, #38bdf8, #1d4ed8);
    box-shadow: 0 0 18px rgba(56, 189, 248, 0.9);
  }

  .join-chip__label {
    color: #e5e7eb;
  }

  .join-title {
    font-size: 26px;
    line-height: 1.25;
    font-weight: 600;
  }

  .join-title__gradient {
    background: linear-gradient(120deg, #38bdf8, #22c1c3, #a855f7);
    -webkit-background-clip: text;
    color: transparent;
  }

  .join-sub {
    font-size: 13px;
    color: #9ca3af;
    max-width: 580px;
  }

  .join-meta {
    display: flex;
    gap: 12px;
    margin-top: 4px;
    font-size: 11px;
    color: #9ca3af;
  }

  .join-meta__label {
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #94a3b8;
  }

  .join-meta__value {
    font-size: 13px;
    color: #e5e7eb;
  }

  .join-meta__divider {
    width: 1px;
    background: linear-gradient(
      to bottom,
      rgba(148, 163, 184, 0.1),
      rgba(148, 163, 184, 0.8),
      rgba(148, 163, 184, 0.1)
    );
  }

  .join-body {
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(0, 1.1fr);
    gap: 22px;
  }

  .join-form {
    padding: 14px 14px 4px;
    border-radius: 22px;
    border: 1px solid rgba(30, 64, 175, 0.85);
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.98), #020617);
    box-shadow: 0 24px 70px rgba(15, 23, 42, 1);
  }

  .join-form__intro h2 {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .join-form__intro p {
    font-size: 13px;
    color: #9ca3af;
  }

  .join-form__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-top: 12px;
  }

  .join-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
  }

  .join-field--half {
    grid-column: span 1;
  }

  .join-field label {
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #9ca3af;
    font-size: 11px;
  }

  .join-input,
  .join-textarea {
    width: 100%;
    border-radius: 16px;
    border: 1px solid rgba(55, 65, 81, 0.95);
    background: rgba(15, 23, 42, 0.98);
    padding: 9px 12px;
    font-size: 13px;
    color: #e5e7eb;
    outline: none;
    box-sizing: border-box;
  }

  .join-input::placeholder,
  .join-textarea::placeholder {
    color: #6b7280;
  }

  .join-input:focus,
  .join-textarea:focus {
    border-color: rgba(96, 165, 250, 1);
    box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.8);
  }

  .join-textarea {
    min-height: 112px;
    resize: vertical;
  }

  .join-role-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .join-role {
    flex: 1 1 0;
    padding: 8px 10px;
    border-radius: 999px;
    border: 1px solid rgba(55, 65, 81, 0.95);
    background: rgba(15, 23, 42, 0.98);
    font-size: 11px;
    font-weight: 500;
    color: #e5e7eb;
    cursor: pointer;
    transition:
      border-color 0.15s ease,
      background 0.15s ease,
      box-shadow 0.15s ease,
      transform 0.15s ease;
  }

  .join-role--active {
    border-color: rgba(56, 189, 248, 1);
    background: radial-gradient(circle at top, rgba(56, 189, 248, 0.2), #020617);
    box-shadow: 0 0 18px rgba(56, 189, 248, 0.8);
    transform: translateY(-1px);
  }

  .join-helper {
    margin-top: 2px;
    font-size: 11px;
    color: #94a3b8;
  }

  .join-actions {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 4px;
  }

  .join-btn-primary {
    width: 100%;
    padding: 10px 18px;
    border-radius: 999px;
    border: none;
    background: linear-gradient(135deg, #3b82f6, #22c1c3, #a855f7);
    color: #e5e7eb;
    font-size: 13px;
    font-weight: 600;
    box-shadow: 0 20px 55px rgba(15, 23, 42, 1);
    cursor: pointer;
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease,
      opacity 0.15s ease;
  }

  .join-btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 26px 70px rgba(15, 23, 42, 1);
  }

  .join-btn-primary:disabled {
    opacity: 0.65;
    cursor: wait;
  }

  .join-small {
    font-size: 11px;
    color: #9ca3af;
  }

  .join-link {
    color: #a5b4fc;
    text-decoration: underline;
  }

  .join-link:hover {
    color: #c7d2fe;
  }

  .join-alert {
    margin-bottom: 8px;
    padding: 8px 10px;
    border-radius: 14px;
    font-size: 12px;
  }

  .join-alert--error {
    border: 1px solid rgba(248, 113, 113, 0.85);
    background: rgba(127, 29, 29, 0.85);
    color: #fee2e2;
  }

  .join-alert--success {
    border: 1px solid rgba(52, 211, 153, 0.85);
    background: rgba(6, 95, 70, 0.85);
    color: #bbf7d0;
  }

  .join-side {
    border-radius: 22px;
    border: 1px solid rgba(30, 64, 175, 0.7);
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.98), #020617);
    padding: 16px 15px 14px;
    box-shadow: 0 24px 70px rgba(15, 23, 42, 1);
    font-size: 13px;
  }

  .join-side__block + .join-side__block {
    margin-top: 14px;
  }

  .join-side__label {
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 8px;
  }

  .join-side ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .join-side li {
    display: flex;
    gap: 6px;
    margin-top: 4px;
    color: #e5e7eb;
  }

  .join-dot {
    margin-top: 5px;
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: #22c55e;
    box-shadow: 0 0 14px rgba(34, 197, 94, 0.9);
  }

  .join-square {
    margin-top: 3px;
    color: #38bdf8;
    font-size: 12px;
  }

  .join-side__divider {
    height: 1px;
    margin: 14px 0;
    background: linear-gradient(
      to right,
      rgba(51, 65, 85, 0.1),
      rgba(51, 65, 85, 0.9),
      rgba(51, 65, 85, 0.1)
    );
  }

  .join-side__bottom {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-top: 4px;
  }

  .join-side__meta-label {
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #9ca3af;
    margin-bottom: 4px;
  }

  .join-side__meta-body {
    font-size: 12px;
    color: #e5e7eb;
  }

  @media (max-width: 900px) {
    .join-card {
      padding: 20px 16px 20px;
    }

    .join-body {
      grid-template-columns: minmax(0, 1fr);
    }

    .join-side__bottom {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (max-width: 640px) {
    .join-title {
      font-size: 22px;
    }

    .join-form__grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .join-field--half {
      grid-column: 1 / -1;
    }

    .join-meta {
      flex-direction: column;
      align-items: flex-start;
    }

    .join-meta__divider {
      display: none;
    }
  }
</style>
