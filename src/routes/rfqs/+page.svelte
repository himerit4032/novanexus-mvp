<!-- src/routes/rfqs/+page.svelte -->

<svelte:head>
  <title>NovaNexus ▢ Live RFQs</title>
</svelte:head>

<script lang="ts">
  type RFQ = {
    id: string;
    title: string;
    buyer: string;
    process: string;
    region: string;
    budget: string;
    status: 'Open' | 'In review' | 'Closed';
    due: string;
  };

  const rfqs: RFQ[] = [
    {
      id: 'NN-24027',
      title: 'Aluminum cutting line for automotive profiles',
      buyer: 'Tier-1 auto supplier (US)',
      process: 'Aluminum line · Hot saw + cooling table',
      region: 'USA / Alabama',
      budget: '$600k–$1.2M',
      status: 'Open',
      due: '2025-03-10'
    },
    {
      id: 'NN-24031',
      title: 'High-bay shuttle racking system',
      buyer: '3PL warehouse operator (EU)',
      process: 'Racking · Shuttle rack + conveyors',
      region: 'Germany',
      budget: '$900k–$1.8M',
      status: 'In review',
      due: '2025-02-28'
    },
    {
      id: 'NN-24018',
      title: 'Robotic packing cell for extrusion downstream',
      buyer: 'Extrusion plant (US West)',
      process: 'Automation · Robot + vision',
      region: 'USA / California',
      budget: '$400k–$800k',
      status: 'Open',
      due: '2025-03-22'
    },
    {
      id: 'NN-24004',
      title: 'Pallet racking and mezzanine system',
      buyer: 'E-commerce fulfillment center (UK)',
      process: 'Racking · Selective + mezzanine',
      region: 'United Kingdom',
      budget: '$250k–$500k',
      status: 'Closed',
      due: '2025-01-31'
    }
  ];

  const statusOptions = ['All', 'Open', 'In review', 'Closed'] as const;
  const regionOptions = ['All', 'USA', 'EU', 'APAC'] as const;

  let statusFilter: (typeof statusOptions)[number] = 'Open';
  let regionFilter: (typeof regionOptions)[number] = 'All';

  $: filteredRfqs = rfqs.filter((r) => {
    const byStatus =
      statusFilter === 'All'
        ? true
        : r.status === statusFilter;

    const byRegion =
      regionFilter === 'All'
        ? true
        : regionFilter === 'USA'
        ? r.region.startsWith('USA')
        : regionFilter === 'EU'
        ? ['Germany', 'United Kingdom', 'France', 'Italy', 'Denmark'].some((c) =>
            r.region.includes(c)
          )
        : r.region.includes('Korea') || r.region.includes('Vietnam') || r.region.includes('Japan');

    return byStatus && byRegion;
  });
</script>

<main class="rfqs-page">
  <!-- 상단 헤더 / 카피 -->
  <section class="rfqs-hero">
    <div>
      <p class="rfqs-kicker">LIVE RFQs · PRE-QUALIFIED PROJECTS</p>
      <h1 class="rfqs-title">Live RFQs currently running through NovaNexus.</h1>
      <p class="rfqs-sub">
        These are examples of real-world RFQs flowing through the platform — aluminum lines,
        racking systems, and automation projects where engineering matters more than lowest quote.
      </p>
    </div>

    <div class="rfqs-summary">
      <div>
        <div class="rfqs-summary-value">27</div>
        <div class="rfqs-summary-label">Live RFQs</div>
      </div>
      <div>
        <div class="rfqs-summary-value">$180k</div>
        <div class="rfqs-summary-label">Avg. project value</div>
      </div>
      <div>
        <div class="rfqs-summary-value">140+</div>
        <div class="rfqs-summary-label">Vetted factories</div>
      </div>
    </div>
  </section>

  <!-- 필터 바 -->
  <section class="rfqs-filters">
    <div class="filter-group">
      <label>Status</label>
      <select bind:value={statusFilter}>
        {#each statusOptions as s}
          <option value={s}>{s}</option>
        {/each}
      </select>
    </div>

    <div class="filter-group">
      <label>Region</label>
      <select bind:value={regionFilter}>
        {#each regionOptions as r}
          <option value={r}>{r}</option>
        {/each}
      </select>
    </div>

    <div class="filter-note">
      MVP only — data is static in the frontend. Later, this will be hydrated from PocketBase.
    </div>
  </section>

  <!-- RFQ 리스트 -->
  <section class="rfqs-list">
    {#if filteredRfqs.length === 0}
      <div class="rfqs-empty">
        No RFQs found for the current filter. Try switching status or region.
      </div>
    {:else}
      <div class="rfqs-table">
        <div class="rfqs-row rfqs-row-head">
          <div>ID</div>
          <div>Title</div>
          <div>Process</div>
          <div>Region</div>
          <div>Budget</div>
          <div>Status</div>
          <div>Due</div>
        </div>

        {#each filteredRfqs as r}
          <div class="rfqs-row">
            <div class="rfqs-cell-id">{r.id}</div>
            <div class="rfqs-cell-title">
              <div class="rfqs-title-main">{r.title}</div>
              <div class="rfqs-title-sub">{r.buyer}</div>
            </div>
            <div class="rfqs-cell-process">{r.process}</div>
            <div>{r.region}</div>
            <div>{r.budget}</div>
            <div>
              <span class={`badge badge-${r.status.replace(' ', '-').toLowerCase()}`}>
                {r.status}
              </span>
            </div>
            <div>{r.due}</div>
          </div>
        {/each}
      </div>
    {/if}
  </section>
</main>

<style>
  .rfqs-page {
    max-width: 1120px;
    margin: 0 auto;
    padding: 96px 24px 72px;
    color: #e5e7eb;
  }

  .rfqs-hero {
    display: flex;
    justify-content: space-between;
    gap: 40px;
    align-items: flex-start;
    margin-bottom: 40px;
  }

  .rfqs-kicker {
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #38bdf8;
    margin-bottom: 8px;
  }

  .rfqs-title {
    font-size: 32px;
    line-height: 1.2;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .rfqs-sub {
    font-size: 14px;
    color: #9ca3af;
    max-width: 540px;
  }

  .rfqs-summary {
    display: flex;
    gap: 24px;
    padding: 16px 22px;
    border-radius: 18px;
    background: radial-gradient(circle at top, rgba(56, 189, 248, 0.22), rgba(15, 23, 42, 0.98));
    border: 1px solid rgba(148, 163, 184, 0.5);
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.9);
    font-size: 11px;
    min-width: 260px;
  }

  .rfqs-summary-value {
    font-size: 20px;
    font-weight: 600;
    color: #e5e7eb;
  }

  .rfqs-summary-label {
    color: #9ca3af;
  }

  @media (max-width: 900px) {
    .rfqs-hero {
      flex-direction: column;
      align-items: flex-start;
    }

    .rfqs-summary {
      width: 100%;
      justify-content: space-between;
    }
  }

  .rfqs-filters {
    display: flex;
    align-items: center;
    gap: 18px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
  }

  .filter-group label {
    color: #9ca3af;
  }

  .filter-group select {
    background: rgba(15, 23, 42, 0.95);
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.8);
    padding: 6px 10px;
    font-size: 12px;
    color: #e5e7eb;
    outline: none;
  }

  .filter-note {
    font-size: 11px;
    color: #6b7280;
    margin-left: auto;
  }

  .rfqs-list {
    border-radius: 18px;
    border: 1px solid rgba(31, 41, 55, 1);
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.98), rgba(2, 6, 23, 1));
    box-shadow: 0 24px 60px rgba(15, 23, 42, 1);
    overflow: hidden;
  }

  .rfqs-table {
    width: 100%;
    font-size: 12px;
  }

  .rfqs-row {
    display: grid;
    grid-template-columns: 0.9fr 2.4fr 2fr 1.4fr 1.3fr 1.1fr 1.1fr;
    gap: 14px;
    padding: 12px 18px;
    align-items: flex-start;
    border-top: 1px solid rgba(31, 41, 55, 1);
  }

  .rfqs-row-head {
    background: rgba(15, 23, 42, 0.98);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #9ca3af;
    border-top: none;
  }

  .rfqs-row:not(.rfqs-row-head):hover {
    background: rgba(15, 23, 42, 0.85);
  }

  .rfqs-cell-id {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
      "Courier New", monospace;
    color: #9ca3af;
  }

  .rfqs-cell-title .rfqs-title-main {
    font-weight: 500;
    margin-bottom: 2px;
  }

  .rfqs-cell-title .rfqs-title-sub {
    font-size: 11px;
    color: #9ca3af;
  }

  .rfqs-cell-process {
    color: #cbd5f5;
  }

  .badge {
    display: inline-flex;
    padding: 3px 9px;
    border-radius: 999px;
    font-size: 11px;
    border: 1px solid transparent;
  }

  .badge-open {
    background: rgba(34, 197, 94, 0.18);
    border-color: rgba(34, 197, 94, 0.7);
    color: #bbf7d0;
  }

  .badge-in-review {
    background: rgba(59, 130, 246, 0.18);
    border-color: rgba(59, 130, 246, 0.7);
    color: #bfdbfe;
  }

  .badge-closed {
    background: rgba(107, 114, 128, 0.16);
    border-color: rgba(107, 114, 128, 0.7);
    color: #e5e7eb;
  }

  .rfqs-empty {
    padding: 32px 24px;
    text-align: center;
    font-size: 13px;
    color: #9ca3af;
  }

  @media (max-width: 900px) {
    .rfqs-row,
    .rfqs-row-head {
      grid-template-columns: 1.1fr 2.2fr 1.8fr 1.6fr;
      grid-auto-rows: auto;
    }

    .rfqs-row-head div:nth-child(n + 5),
    .rfqs-row div:nth-child(n + 5) {
      display: none;
    }
  }
</style>
