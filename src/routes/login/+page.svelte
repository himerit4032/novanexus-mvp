<script lang="ts">
  import { pb } from '$lib/pocketbase';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let email = '';
  let password = '';
  let loading = false;
  let errorMsg = '';

  // 이미 로그인돼 있으면 바로 포털로
  onMount(() => {
    if (pb.authStore.isValid) {
      goto('/dashboard/buyer');
    }
  });

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    if (loading) return;

    loading = true;
    errorMsg = '';

    try {
      await pb.collection('users').authWithPassword(email, password);
      await goto('/dashboard/buyer'); // 로그인 성공 → 바이어 대시보드
    } catch (err: any) {
      console.error(err);
      errorMsg =
        err?.message ??
        'Login failed. Check your email and password and try again.';
    } finally {
      loading = false;
    }
  };

  const goToCreateAccount = () => {
    goto('/auth/join');
  };
</script>

<svelte:head>
  <title>NovaNexus ▢ Log in</title>
</svelte:head>

<main class="auth-page">
  <section class="auth-card">
    <header class="auth-header">
      <h1 class="auth-title">Log in</h1>
      <p class="auth-sub">
        Access your NovaNexus portal to track RFQs, supplier conversations and
        project status.
      </p>
    </header>

    {#if errorMsg}
      <div class="auth-error">
        {errorMsg}
      </div>
    {/if}

    <form class="auth-form" on:submit={handleSubmit}>
      <label>
        <span>Email</span>
        <input
          type="email"
          bind:value={email}
          placeholder="you@company.com"
          autocomplete="email"
          required
        />
      </label>

      <label>
        <span>Password</span>
        <input
          type="password"
          bind:value={password}
          placeholder="••••••••"
          autocomplete="current-password"
          minlength="6"
          required
        />
      </label>

      <div class="auth-actions">
        <button
          type="submit"
          class="btn-primary auth-submit"
          disabled={loading}
        >
          {#if loading}
            Logging in…
          {:else}
            Log in
          {/if}
        </button>

        <button
          type="button"
          class="btn-secondary auth-create"
          on:click={goToCreateAccount}
        >
          Create account
        </button>
      </div>
    </form>

    <p class="auth-hint">
      Don’t have portal access yet? Use <strong>Create account</strong> to set up a
      buyer / supplier login for your company.
    </p>
  </section>
</main>

<style>
  .auth-page {
    min-height: calc(100vh - 96px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 64px 16px;
    color: #e5e7eb;
    background: radial-gradient(circle at top, rgba(56, 189, 248, 0.14), #020617);
  }

  .auth-card {
    width: 100%;
    max-width: 460px;
    border-radius: 28px;
    border: 1px solid rgba(30, 64, 175, 0.7);
    background:
      radial-gradient(circle at top left, rgba(59, 130, 246, 0.25), transparent 60%),
      radial-gradient(circle at bottom right, rgba(147, 51, 234, 0.18), rgba(15, 23, 42, 0.98));
    box-shadow:
      0 28px 80px rgba(15, 23, 42, 1),
      0 0 0 1px rgba(15, 23, 42, 0.9);
    padding: 26px 24px 22px;
  }

  .auth-header {
    margin-bottom: 12px;
  }

  .auth-title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 6px;
    letter-spacing: -0.02em;
  }

  .auth-sub {
    font-size: 13px;
    color: #9ca3af;
    line-height: 1.4;
  }

  .auth-error {
    margin-bottom: 12px;
    padding: 8px 10px;
    font-size: 12px;
    border-radius: 12px;
    border: 1px solid rgba(248, 113, 113, 0.85);
    background: radial-gradient(circle at top left, rgba(248, 113, 113, 0.18), rgba(127, 29, 29, 0.8));
    color: #fee2e2;
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 8px;
  }

  .auth-form label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    color: #d1d5db;
  }

  .auth-form span {
    text-transform: none;
    letter-spacing: 0.01em;
  }

  .auth-form input {
    border-radius: 999px;
    border: 1px solid rgba(55, 65, 81, 0.95);
    background: rgba(15, 23, 42, 0.96);
    padding: 9px 13px;
    font-size: 13px;
    color: #e5e7eb;
    outline: none;
    transition: border-color 0.16s ease, box-shadow 0.16s ease, background-color 0.16s ease;
  }

  .auth-form input::placeholder {
    color: #6b7280;
  }

  .auth-form input:focus {
    border-color: rgba(129, 140, 248, 1);
    box-shadow: 0 0 0 1px rgba(129, 140, 248, 0.7);
    background: rgba(15, 23, 42, 0.98);
  }

  .auth-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 6px;
  }

  @media (min-width: 640px) {
    .auth-actions {
      flex-direction: row;
    }
  }

  .auth-submit,
  .auth-create {
    width: 100%;
  }

  .btn-primary,
  .btn-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 9px 20px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease,
      opacity 0.15s ease,
      background 0.15s ease,
      border-color 0.15s ease;
  }

  .btn-primary {
    background: linear-gradient(135deg, #3b82f6, #a855f7);
    color: #e5e7eb;
    box-shadow: 0 16px 38px rgba(15, 23, 42, 1);
  }

  .btn-primary[disabled] {
    opacity: 0.65;
    cursor: wait;
  }

  .btn-primary:hover:enabled {
    transform: translateY(-1px);
    box-shadow: 0 20px 48px rgba(15, 23, 42, 1);
    opacity: 0.98;
  }

  .btn-secondary {
    background: rgba(15, 23, 42, 0.96);
    color: #e5e7eb;
    border: 1px solid rgba(55, 65, 81, 0.9);
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.9);
  }

  .btn-secondary:hover {
    border-color: rgba(129, 140, 248, 0.9);
    background: rgba(15, 23, 42, 0.98);
    transform: translateY(-1px);
    box-shadow: 0 16px 40px rgba(15, 23, 42, 1);
  }

  .auth-hint {
    margin-top: 12px;
    font-size: 11px;
    color: #6b7280;
  }

  .auth-hint strong {
    color: #e5e7eb;
    font-weight: 600;
  }
</style>
