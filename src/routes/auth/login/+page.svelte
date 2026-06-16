<!-- src/routes/auth/login/+page.svelte -->
<script lang="ts">
  import { pb } from '$lib/pocketbase';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  let email = '';
  let password = '';
  let loading = false;
  let errorMsg = '';

  const getReturnTo = () => {
    const rt = $page.url.searchParams.get('returnTo');
    // returnTo가 외부 URL이면 오픈리다이렉트 위험 → 내부 경로만 허용
    if (!rt) return '';
    if (!rt.startsWith('/')) return '';
    return rt;
  };

  onMount(() => {
    if (pb.authStore.isValid) {
      const rt = getReturnTo();
      goto(rt || '/dashboard/buyer');
    }
  });

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    if (loading) return;

    loading = true;
    errorMsg = '';

    try {
      await pb.collection('users').authWithPassword(email.trim(), password);
      const rt = getReturnTo();
      await goto(rt || '/dashboard/buyer');
    } catch (err: any) {
      console.error(err);
      errorMsg =
        err?.data?.message ||
        err?.message ||
        'Login failed. Check your email and password and try again.';
    } finally {
      loading = false;
    }
  };

  const goJoin = () => goto('/auth/join');
</script>

<svelte:head>
  <title>NovaNexus ▢ Log in</title>
</svelte:head>

<main class="auth-page">
  <section class="auth-card" aria-labelledby="login-heading">
    <header class="auth-header">
      <div class="chip" aria-hidden="true">
        <span class="dot"></span>
        PORTAL LOGIN
      </div>

      <h1 class="auth-title" id="login-heading">Log in</h1>
      <p class="auth-sub">
        Access your NovaNexus portal to track RFQs, supplier conversations, and project status.
      </p>
    </header>

    {#if errorMsg}
      <div class="auth-error" role="alert" aria-live="assertive">{errorMsg}</div>
    {/if}

    <form class="auth-form" on:submit={handleSubmit} novalidate>
      <div class="auth-field">
        <label for="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          bind:value={email}
          autocomplete="email"
          placeholder="you@company.com"
          required
        />
      </div>

      <div class="auth-field">
        <label for="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          bind:value={password}
          autocomplete="current-password"
          placeholder="••••••••"
          minlength="8"
          required
        />
      </div>

      <div class="auth-actions">
        <button type="submit" class="btn-primary" disabled={loading}>
          {#if loading} Logging in… {:else} Log in {/if}
        </button>

        <button type="button" class="btn-secondary" on:click={goJoin}>
          Create account
        </button>
      </div>
    </form>

    <p class="auth-hint">
      Need access? Use <strong>Create account</strong> to set up a buyer/supplier portal.
    </p>
  </section>
</main>

<style>
  .auth-page{
    min-height: calc(100vh - 96px);
    display:flex; align-items:center; justify-content:center;
    padding:64px 16px;
    color:#e5e7eb;
    background: radial-gradient(circle at top, rgba(56,189,248,.14), #020617);
  }
  .auth-card{
    width:100%; max-width:480px;
    border-radius:28px;
    border:1px solid rgba(30,64,175,.7);
    background:
      radial-gradient(circle at top left, rgba(59,130,246,.25), transparent 60%),
      radial-gradient(circle at bottom right, rgba(147,51,234,.18), rgba(15,23,42,.98));
    box-shadow: 0 28px 80px rgba(15,23,42,1), 0 0 0 1px rgba(15,23,42,.9);
    padding:26px 24px 22px;
  }
  .chip{
    display:inline-flex; align-items:center; gap:8px;
    padding:6px 12px; border-radius:999px;
    border:1px solid rgba(148,163,184,.55);
    background: rgba(15,23,42,.9);
    font-size:11px; letter-spacing:.22em; text-transform:uppercase;
    color:#e5e7eb;
  }
  .dot{
    width:8px; height:8px; border-radius:999px;
    background: radial-gradient(circle at 30% 30%, #38bdf8, #1d4ed8);
    box-shadow:0 0 18px rgba(56,189,248,.9);
  }
  .auth-title{ font-size:24px; font-weight:650; margin:10px 0 6px; letter-spacing:-.02em; }
  .auth-sub{ font-size:13px; color:#9ca3af; line-height:1.4; margin:0; }
  .auth-error{
    margin:12px 0;
    padding:8px 10px;
    font-size:12px;
    border-radius:12px;
    border:1px solid rgba(248,113,113,.85);
    background: radial-gradient(circle at top left, rgba(248,113,113,.18), rgba(127,29,29,.8));
    color:#fee2e2;
  }
  .auth-form{ display:flex; flex-direction:column; gap:12px; margin-top:12px; }
  .auth-field{ display:flex; flex-direction:column; gap:6px; }
  label{ font-size:12px; color:#d1d5db; }
  input{
    border-radius:999px;
    border:1px solid rgba(55,65,81,.95);
    background: rgba(15,23,42,.96);
    padding:10px 13px;
    font-size:13px;
    color:#e5e7eb;
    outline:none;
    transition: border-color .16s ease, box-shadow .16s ease, background-color .16s ease;
  }
  input::placeholder{ color:#6b7280; }
  input:focus-visible{
    border-color: rgba(129,140,248,1);
    box-shadow: 0 0 0 1px rgba(129,140,248,.7);
    background: rgba(15,23,42,.98);
  }
  .auth-actions{ display:flex; flex-direction:column; gap:8px; margin-top:6px; }
  @media (min-width:640px){ .auth-actions{ flex-direction:row; } }
  .btn-primary,.btn-secondary{
    width:100%;
    display:inline-flex; align-items:center; justify-content:center;
    padding:10px 20px; border-radius:999px;
    font-size:13px; font-weight:650;
    border:none; cursor:pointer;
    transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease, background .15s ease, border-color .15s ease;
  }
  .btn-primary{
    background: linear-gradient(135deg, #3b82f6, #a855f7);
    color:#e5e7eb;
    box-shadow:0 16px 38px rgba(15,23,42,1);
  }
  .btn-primary[disabled]{ opacity:.65; cursor:wait; }
  .btn-primary:hover:enabled{ transform:translateY(-1px); box-shadow:0 20px 48px rgba(15,23,42,1); }
  .btn-secondary{
    background: rgba(15,23,42,.96);
    color:#e5e7eb;
    border:1px solid rgba(55,65,81,.9);
    box-shadow:0 12px 30px rgba(15,23,42,.9);
  }
  .btn-secondary:hover{ border-color: rgba(129,140,248,.9); background: rgba(15,23,42,.98); transform:translateY(-1px); box-shadow:0 16px 40px rgba(15,23,42,1); }
  .auth-hint{ margin-top:12px; font-size:11px; color:#6b7280; }
  .auth-hint strong{ color:#e5e7eb; font-weight:650; }
</style>
