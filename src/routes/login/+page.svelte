<script lang="ts">
  import { pb } from '$lib/pocketbase';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let email = '';
  let password = '';
  let loading = false;
  let errorMsg = '';

  // 이미 로그인 돼 있으면 바로 포털로 보냄
  onMount(() => {
    if (pb.authStore.isValid) {
      goto('/dashboard/buyer');
    }
  });

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    loading = true;
    errorMsg = '';

    try {
      // users 컬렉션에 이메일/패스워드로 로그인
      await pb.collection('users').authWithPassword(email, password);
      await goto('/dashboard/buyer'); // 로그인 성공 → 포털로
    } catch (err: any) {
      console.error(err);
      errorMsg = err?.message ?? '로그인에 실패했습니다. 이메일/비밀번호를 확인해주세요.';
    } finally {
      loading = false;
    }
  };
</script>

<svelte:head>
  <title>NovaNexus ▢ Log in</title>
</svelte:head>

<main class="auth-page">
  <section class="auth-card">
    <h1 class="auth-title">Log in</h1>
    <p class="auth-sub">
      Access your NovaNexus portal to track RFQs and supplier conversations.
    </p>

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
          required
        />
      </label>

      <label>
        <span>Password</span>
        <input
          type="password"
          bind:value={password}
          placeholder="••••••••"
          minlength="6"
          required
        />
      </label>

      <button type="submit" class="btn-primary auth-submit" disabled={loading}>
        {#if loading}
          Logging in…
        {:else}
          Log in
        {/if}
      </button>
    </form>

    <p class="auth-hint">
      Need access? Contact the NovaNexus team to create an account.
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
  }

  .auth-card {
    width: 100%;
    max-width: 420px;
    border-radius: 24px;
    border: 1px solid rgba(31, 41, 55, 1);
    background: radial-gradient(circle at top, rgba(56, 189, 248, 0.18), rgba(15, 23, 42, 0.98));
    box-shadow: 0 22px 48px rgba(15, 23, 42, 1);
    padding: 24px 22px;
  }

  .auth-title {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .auth-sub {
    font-size: 13px;
    color: #9ca3af;
    margin-bottom: 14px;
  }

  .auth-error {
    margin-bottom: 10px;
    padding: 8px 10px;
    font-size: 12px;
    border-radius: 10px;
    border: 1px solid rgba(248, 113, 113, 0.8);
    background: rgba(185, 28, 28, 0.18);
    color: #fecaca;
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 8px;
  }

  .auth-form label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    color: #d1d5db;
  }

  .auth-form input {
    border-radius: 999px;
    border: 1px solid rgba(55, 65, 81, 1);
    background: rgba(15, 23, 42, 0.95);
    padding: 8px 12px;
    font-size: 13px;
    color: #e5e7eb;
    outline: none;
  }

  .auth-form input:focus {
    border-color: rgba(96, 165, 250, 1);
  }

  .auth-submit {
    width: 100%;
    margin-top: 4px;
  }

  .auth-hint {
    margin-top: 10px;
    font-size: 11px;
    color: #6b7280;
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
    box-shadow: 0 14px 36px rgba(15, 23, 42, 0.95);
    transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
    cursor: pointer;
  }

  .btn-primary[disabled] {
    opacity: 0.65;
    cursor: wait;
  }

  .btn-primary:hover:enabled {
    transform: translateY(-1px);
    box-shadow: 0 18px 46px rgba(15, 23, 42, 1);
    opacity: 0.96;
  }
</style>
