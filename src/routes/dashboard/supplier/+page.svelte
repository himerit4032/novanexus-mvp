<script lang="ts">
  import { pb } from '$lib/pocketbase';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  type SupplierUser = {
    email: string;
    name?: string;
    factory?: string;
  };

  let user: SupplierUser | null = null;
  let loading = true;

  onMount(() => {
    // 로그인 안돼 있으면 로그인 페이지로 보냄
    if (!pb.authStore.isValid) {
      goto('/login');
      return;
    }

    const model = pb.authStore.model as any;
    user = {
      email: model?.email,
      name: model?.name,
      factory: model?.factory ?? model?.company
    };

    loading = false;
  });

  const logout = () => {
    pb.authStore.clear();
    goto('/login');
  };
</script>

<svelte:head>
  <title>NovaNexus ▢ Supplier dashboard</title>
</svelte:head>

<main class="supplier-page">
  {#if loading}
    <div class="supplier-loading">Loading supplier dashboard…</div>
  {:else if user}
    <!-- HEADER -->
    <section class="supplier-head">
      <div>
        <p class="supplier-kicker">Supplier dashboard</p>
        <h1 class="supplier-title">
          {user.factory ?? user.name ?? user.email}
        </h1>
        <p class="supplier-sub">
          See which RFQs are matched to your factory, what’s waiting for your
          response, and how to keep your profile sharp so the right projects reach you.
        </p>
      </div>

      <button class="btn-ghost" on:click={logout}>
        Log out
      </button>
    </section>

    <!-- GRID -->
    <section class="supplier-grid">
      <!-- Assigned RFQs -->
      <article class="supplier-card supplier-card-wide">
        <header class="card-header">
          <div>
            <h2>Assigned RFQs</h2>
            <p>Projects that currently fit your machines, certifications, and installation scope.</p>
          </div>
          <a href="/rfqs" class="card-link">View all RFQs →</a>
        </header>

        <ul class="rfq-list">
          <li class="rfq-row">
            <div>
              <div class="rfq-title">Cut-to-length aluminum line</div>
              <div class="rfq-meta">Reply requested within 3 days · Korea → U.S. installation</div>
            </div>
            <div class="rfq-right">
              <span class="rfq-pill rfq-pill-warning">Needs reply</span>
            </div>
          </li>

          <li class="rfq-row">
            <div>
              <div class="rfq-title">Shuttle rack for cold warehouse</div>
              <div class="rfq-meta">Scope: design + install · -25°C environment</div>
            </div>
            <div class="rfq-right">
              <span class="rfq-pill rfq-pill-info">In discussion</span>
            </div>
          </li>

          <li class="rfq-row">
            <div>
              <div class="rfq-title">Robotic palletizing cell</div>
              <div class="rfq-meta">Quote submitted · Waiting for buyer feedback</div>
            </div>
            <div class="rfq-right">
              <span class="rfq-pill rfq-pill-muted">Quote submitted</span>
            </div>
          </li>
        </ul>
      </article>

      <!-- Factory profile -->
      <article class="supplier-card">
        <h2>Factory profile</h2>
        <p>
          Keep your capabilities and certifications up to date so we can route the
          right projects to you and avoid noise.
        </p>

        <div class="profile-block">
          <h3>Machines & scope</h3>
          <ul>
            <li>▢ CNC saws, welding cells, assembly lines</li>
            <li>▢ Racking, shuttle systems, conveyor integration</li>
            <li>▢ On-site installation & commissioning</li>
          </ul>
        </div>

        <div class="profile-block">
          <h3>Certifications</h3>
          <ul>
            <li>▢ ISO 9001, ISO 14001</li>
            <li>▢ Local safety / electrical approvals by region</li>
          </ul>
        </div>

        <a href="#" class="card-link subtle">Update supplier profile →</a>
      </article>

      <!-- Improve match rate -->
      <article class="supplier-card">
        <h2>Improve your match rate</h2>
        <p>
          Share recent projects and your preferred project size. This helps us filter
          out RFQs that are too small, too large, or off-scope.
        </p>

        <ul class="tips-list">
          <li>▢ Upload 3–5 recent installations with photos and basic specs.</li>
          <li>▢ Set a clear “sweet-spot” range for project value.</li>
          <li>▢ Mark regions where you can realistically install and service.</li>
          <li>▢ Flag any industries you <em>don’t</em> want to see.</li>
        </ul>

        <a href="#" class="card-link subtle">Share recent projects →</a>
      </article>
    </section>
  {:else}
    <div class="supplier-loading">
      Session expired. Redirecting to login…
    </div>
  {/if}
</main>

<style>
  .supplier-page {
    max-width: 1120px;
    margin: 0 auto;
    padding: 88px 24px 72px;
    color: #e5e7eb;
  }

  .supplier-loading {
    min-height: 40vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #9ca3af;
  }

  .supplier-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 32px;
  }

  .supplier-kicker {
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #6b7280;
    margin-bottom: 6px;
  }

  .supplier-title {
    font-size: 26px;
    font-weight: 600;
  }

  .supplier-sub {
    font-size: 13px;
    color: #9ca3af;
    max-width: 640px;
  }

  .supplier-grid {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr);
    gap: 18px;
  }

  .supplier-card {
    border-radius: 18px;
    border: 1px solid rgba(31, 41, 55, 1);
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.98), rgba(2, 6, 23, 1));
    padding: 16px 18px;
    font-size: 12px;
    box-shadow: 0 18px 42px rgba(15, 23, 42, 1);
  }

  .supplier-card h2 {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .supplier-card p {
    color: #d1d5db;
    margin-bottom: 8px;
  }

  .supplier-card-wide {
    grid-column: span 3;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 12px;
    margin-bottom: 12px;
  }

  .card-header p {
    margin-top: 2px;
    font-size: 12px;
    color: #9ca3af;
  }

  .card-link {
    font-size: 12px;
    color: #60a5fa;
    text-decoration: none;
    white-space: nowrap;
  }

  .card-link.subtle {
    color: #9ca3af;
  }

  .card-link:hover {
    text-decoration: underline;
  }

  /* RFQ 리스트 */

  .rfq-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .rfq-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    padding: 10px 0;
    border-top: 1px solid rgba(31, 41, 55, 1);
  }

  .rfq-row:first-child {
    border-top: none;
  }

  .rfq-title {
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 2px;
  }

  .rfq-meta {
    font-size: 11px;
    color: #9ca3af;
  }

  .rfq-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .rfq-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 11px;
    border: 1px solid rgba(55, 65, 81, 1);
  }

  .rfq-pill-warning {
    background: rgba(248, 113, 113, 0.2);
    border-color: rgba(248, 113, 113, 0.8);
    color: #fecaca;
  }

  .rfq-pill-info {
    background: rgba(59, 130, 246, 0.18);
    border-color: rgba(59, 130, 246, 0.9);
    color: #bfdbfe;
  }

  .rfq-pill-muted {
    background: rgba(31, 41, 55, 0.9);
    color: #9ca3af;
  }

  /* Profile / tips */

  .profile-block {
    margin-bottom: 10px;
  }

  .profile-block h3 {
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .profile-block ul {
    color: #9ca3af;
  }

  .profile-block ul li + li {
    margin-top: 3px;
  }

  .tips-list {
    color: #9ca3af;
  }

  .tips-list li + li {
    margin-top: 4px;
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
    .supplier-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .supplier-card-wide {
      grid-column: span 1;
    }

    .supplier-head {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
