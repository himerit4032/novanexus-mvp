<script lang="ts">
  import { pb } from '$lib/pocketbase';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  type User = {
    email: string;
    name?: string;
    company?: string;
  };

  let user: User | null = null;
  let loading = true;

  // 페이지 들어올 때 로그인 여부 확인
  onMount(() => {
    if (!pb.authStore.isValid) {
      // 로그인 안 돼 있으면 로그인 페이지로 튕김
      goto('/login');
      return;
    }

    const model = pb.authStore.model as any;
    user = {
      email: model?.email,
      name: model?.name,
      company: model?.company
    };

    loading = false;
  });

  const logout = () => {
    pb.authStore.clear();
    goto('/login');
  };
</script>

<svelte:head>
  <title>NovaNexus ▢ Buyer portal</title>
</svelte:head>

<main class="portal-page">
  {#if loading}
    <div class="portal-loading">Loading portal…</div>
  {:else if user}
    <!-- 상단 헤더 -->
    <section class="portal-head">
      <div>
        <p class="portal-kicker">Buyer portal</p>
        <h1 class="portal-title">
          {user.name ?? user.email}
        </h1>
        {#if user.company}
          <p class="portal-sub">{user.company}</p>
        {/if}
      </div>

      <button class="btn-ghost" on:click={logout}>
        Log out
      </button>
    </section>

    <!-- 포털 카드들 -->
    <section class="portal-grid">
      <article class="portal-card">
        <h2>Open RFQs</h2>
        <p>
          Track live RFQs routed to matched suppliers. (지금은 UI만, 나중에 PocketBase 컬렉션이랑 연결)
        </p>
        <a href="/rfqs/new" class="portal-link">Create new RFQ →</a>
      </article>

      <article class="portal-card">
        <h2>Supplier conversations</h2>
        <p>
          Notes, attachments, and follow-ups with suppliers in one place.
        </p>
        <span class="portal-pill">Coming soon</span>
      </article>

      <article class="portal-card">
        <h2>Project archive</h2>
        <p>
          Previous lines, quotes, and decisions so you don’t start from zero.
        </p>
        <span class="portal-pill">Coming soon</span>
      </article>
    </section>
  {:else}
    <div class="portal-loading">
      Session expired. Redirecting to login…
    </div>
  {/if}
</main>

<style>
  .portal-page {
    max-width: 1120px;
    margin: 0 auto;
    padding: 88px 24px 72px;
    color: #e5e7eb;
  }

  .portal-loading {
    min-height: 40vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #9ca3af;
  }

  .portal-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 32px;
  }

  .portal-kicker {
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #6b7280;
    margin-bottom: 6px;
  }

  .portal-title {
    font-size: 26px;
    font-weight: 600;
  }

  .portal-sub {
    font-size: 13px;
    color: #9ca3af;
  }

  .portal-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }

  .portal-card {
    border-radius: 18px;
    border: 1px solid rgba(31, 41, 55, 1);
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.98), rgba(2, 6, 23, 1));
    padding: 16px 18px;
    font-size: 12px;
    box-shadow: 0 18px 42px rgba(15, 23, 42, 1);
  }

  .portal-card h2 {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .portal-card p {
    color: #d1d5db;
    margin-bottom: 10px;
  }

  .portal-link {
    font-size: 12px;
    color: #60a5fa;
    text-decoration: none;
  }

  .portal-link:hover {
    text-decoration: underline;
  }

  .portal-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 3px 10px;
    border-radius: 999px;
    border: 1px solid rgba(55, 65, 81, 1);
    font-size: 11px;
    color: #9ca3af;
  }

  .btn-ghost {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.9);
    background: rgba(15, 23, 42, 0.9);
    color: #e5e7eb;
    font-size: 12px;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
  }

  .btn-ghost:hover {
    background: rgba(15, 23, 42, 0.98);
    border-color: rgba(209, 213, 219, 1);
  }

  @media (max-width: 900px) {
    .portal-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .portal-head {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
