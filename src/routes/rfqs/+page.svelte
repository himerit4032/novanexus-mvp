<!-- src/routes/rfqs/+page.svelte -->

<svelte:head>
  <title>NovaNexus ▢ Live RFQs</title>
</svelte:head>

<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { fade, fly, scale } from 'svelte/transition';
  import { flip } from 'svelte/animate';

  type RFQStatus = 'Open' | 'In review' | 'Closed';

  type RFQ = {
    id: string;
    title: string;
    buyer: string;
    process: string;
    region: string;
    budget: string;
    status: RFQStatus;
    due: string;
  };

  type RegionKey = 'americas' | 'europe' | 'apac';

  type RegionStat = {
    label: string;
    rfqs: number;
    suppliers: number;
  };

  const baseSupplierCounts: Record<RegionKey, number> = {
    americas: 132,
    europe: 96,
    apac: 118
  };

  const demoRfqs: RFQ[] = [
    {
      id: 'NN-24027',
      title: 'Aluminum cutting line for automotive profiles',
      buyer: 'Tier-1 EV supplier (US South)',
      process: 'Aluminum line · Hot saw + cooling table',
      region: 'USA / Alabama',
      budget: '$600k–$1.2M',
      status: 'Open',
      due: '2026-03-10'
    },
    {
      id: 'NN-24018',
      title: 'Robotic packing cell for extrusion downstream',
      buyer: 'Extrusion plant (US West)',
      process: 'Automation · Robot + vision',
      region: 'USA / California',
      budget: '$400k–$800k',
      status: 'Open',
      due: '2026-03-22'
    },
    {
      id: 'NN-24041',
      title: 'CNC machining cell for EV motor housings',
      buyer: 'EV components supplier (Germany)',
      process: 'CNC line · 5-axis machining + deburr',
      region: 'Germany',
      budget: '$900k–$1.6M',
      status: 'Open',
      due: '2026-04-05'
    },
    {
      id: 'NN-24052',
      title: 'Press line upgrade for chassis stamping',
      buyer: 'Global automotive OEM (US Midwest)',
      process: 'Press line · 800–1,000T + coil feed',
      region: 'USA / Michigan',
      budget: '$1.4M–$2.3M',
      status: 'Open',
      due: '2026-04-18'
    },
    {
      id: 'NN-24063',
      title: 'AS/RS warehouse for steel coils',
      buyer: 'Steel service center (Korea)',
      process: 'Warehouse · AS/RS + crane + WMS',
      region: 'Korea / Busan',
      budget: '$3.0M–$4.8M',
      status: 'Open',
      due: '2026-05-02'
    },
    {
      id: 'NN-24075',
      title: 'Robotic palletizing for beverage line',
      buyer: 'Beverage bottling plant (Vietnam)',
      process: 'Robotics · Palletizer + conveyors',
      region: 'Vietnam / Ho Chi Minh City',
      budget: '$350k–$650k',
      status: 'In review',
      due: '2025-04-29'
    },
    {
      id: 'NN-24092',
      title: 'Battery module assembly & end-of-line testing',
      buyer: 'EV battery OEM (US)',
      process: 'EV · Assembly + EOL test',
      region: 'USA / Texas',
      budget: '$4.0M–$6.5M',
      status: 'Closed',
      due: '2025-05-30'
    },
    {
      id: 'NN-24103',
      title: 'Injection molding cell for medical disposables',
      buyer: 'Medical device supplier (Korea)',
      process: 'Plastics · IMM + robot take-out',
      region: 'Korea / Incheon',
      budget: '$700k–$1.1M',
      status: 'In review',
      due: '2025-06-08'
    },
    {
      id: 'NN-24114',
      title: 'Clean-room assembly line for diagnostic kits',
      buyer: 'IVD manufacturer (Japan)',
      process: 'Clean-room · Assembly + packaging',
      region: 'Japan / Osaka',
      budget: '$1.2M–$2.0M',
      status: 'In review',
      due: '2025-05-28'
    },
    {
      id: 'NN-24124',
      title: 'End-of-line case packing & stretch wrapping',
      buyer: 'Food & beverage plant (US East)',
      process: 'Packaging · Case packer + wrapper',
      region: 'USA / Georgia',
      budget: '$220k–$420k',
      status: 'In review',
      due: '2025-05-03'
    },
    {
      id: 'NN-24136',
      title: 'Steel tube cutting & chamfering cell',
      buyer: 'Steel tube mill (Italy)',
      process: 'CNC · Saw + chamfer + deburr',
      region: 'Italy / Milan',
      budget: '$480k–$900k',
      status: 'Closed',
      due: '2024-12-18'
    },
    {
      id: 'NN-23988',
      title: 'Legacy pallet racking retrofit',
      buyer: 'Regional 3PL operator (UK)',
      process: 'Racking · Selective + retrofit',
      region: 'United Kingdom',
      budget: '$180k–$320k',
      status: 'Closed',
      due: '2024-11-30'
    }
  ];

  let rfqs: RFQ[] = [];
  let rfqRecords: any[] = [];
  let hasLiveData = false;

  let supplierCount = 0;
  let liveCount = 0;
  let avgBudgetLabel = '$220k';
  let vettedFactoriesLabel = '160+';

  const statusOptions = ['All', 'Open', 'In review', 'Closed'] as const;
  const regionOptions = ['All', 'USA', 'EU', 'APAC'] as const;

  let statusFilter: (typeof statusOptions)[number] = 'Open';
  let regionFilter: (typeof regionOptions)[number] = 'All';

  let filteredRfqs: RFQ[] = [];

  let regionStats: Record<RegionKey, RegionStat> = {
    americas: { label: 'US & Americas', rfqs: 0, suppliers: baseSupplierCounts.americas },
    europe: { label: 'Europe', rfqs: 0, suppliers: baseSupplierCounts.europe },
    apac: { label: 'Asia–Pacific', rfqs: 0, suppliers: baseSupplierCounts.apac }
  };

  function mapRecordToRFQ(rec: any): RFQ {
    return {
      id: rec.code ?? rec.id,
      title: rec.title,
      buyer: rec.buyer_masked ?? rec.buyer ?? 'Confidential buyer',
      process: rec.process ?? '',
      region: rec.region ?? '',
      budget: rec.budget_label ?? rec.budget ?? '',
      status: (rec.status as RFQStatus) ?? 'Open',
      due: rec.due ?? rec.due_date ?? ''
    };
  }

  function formatBudget(value: number): string {
    if (!value) return '$220k';
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    }
    return `$${Math.round(value / 1_000)}k`;
  }

  function classifyRegion(label: string): RegionKey {
    const l = label.toLowerCase();
    if (
      l.includes('korea') ||
      l.includes('japan') ||
      l.includes('vietnam') ||
      l.includes('thailand') ||
      l.includes('china') ||
      l.includes('apac')
    ) {
      return 'apac';
    }
    if (
      l.includes('germany') ||
      l.includes('france') ||
      l.includes('italy') ||
      l.includes('denmark') ||
      l.includes('netherlands') ||
      l.includes('united kingdom') ||
      l.includes('uk') ||
      l.includes('europe')
    ) {
      return 'europe';
    }
    return 'americas';
  }

  function recomputeView() {
    if (rfqRecords.length === 0) {
      hasLiveData = false;
      rfqs = demoRfqs;
      liveCount = demoRfqs.filter(
        (r) => r.status === 'Open' || r.status === 'In review'
      ).length;
      avgBudgetLabel = '$220k';
    } else {
      hasLiveData = true;
      rfqs = rfqRecords
        .slice()
        .sort((a, b) =>
          (a.due ?? a.due_date ?? '') > (b.due ?? b.due_date ?? '') ? 1 : -1
        )
        .map(mapRecordToRFQ);

      liveCount = rfqs.filter(
        (r) => r.status === 'Open' || r.status === 'In review'
      ).length;

      const budgets: number[] = [];
      for (const rec of rfqRecords) {
        const min = rec.budget_min ?? 0;
        const max = rec.budget_max ?? 0;
        if (min || max) {
          const mid = (min + (max || min)) / 2;
          budgets.push(mid);
        }
      }
      if (budgets.length > 0) {
        const avg = budgets.reduce((s, v) => s + v, 0) / budgets.length;
        avgBudgetLabel = formatBudget(avg);
      } else {
        avgBudgetLabel = '$220k';
      }
    }

    vettedFactoriesLabel = supplierCount ? `${supplierCount}+` : '160+';

    const baseStats: Record<RegionKey, RegionStat> = {
      americas: { label: 'US & Americas', rfqs: 0, suppliers: baseSupplierCounts.americas },
      europe: { label: 'Europe', rfqs: 0, suppliers: baseSupplierCounts.europe },
      apac: { label: 'Asia–Pacific', rfqs: 0, suppliers: baseSupplierCounts.apac }
    };

    for (const r of rfqs) {
      const key = classifyRegion(r.region);
      baseStats[key].rfqs += 1;
    }

    regionStats = {
      americas: {
        label: 'US & Americas',
        rfqs: baseStats.americas.rfqs,
        suppliers: baseSupplierCounts.americas
      },
      europe: {
        label: 'Europe',
        rfqs: baseStats.europe.rfqs,
        suppliers: baseSupplierCounts.europe
      },
      apac: {
        label: 'Asia–Pacific',
        rfqs: baseStats.apac.rfqs,
        suppliers: baseSupplierCounts.apac
      }
    };
  }

  $: filteredRfqs = rfqs.filter((r) => {
    const byStatus = statusFilter === 'All' ? true : r.status === statusFilter;

    const byRegion =
      regionFilter === 'All'
        ? true
        : regionFilter === 'USA'
        ? r.region.startsWith('USA') || r.region.includes('US')
        : regionFilter === 'EU'
        ? ['Germany', 'United Kingdom', 'France', 'Italy', 'Denmark', 'Netherlands'].some(
            (c) => r.region.includes(c)
          )
        : r.region.includes('Korea') ||
          r.region.includes('Vietnam') ||
          r.region.includes('Japan') ||
          r.region.includes('China') ||
          r.region.includes('Thailand') ||
          r.region.includes('APAC');

    return byStatus && byRegion;
  });

  // 초기에는 데모 기준으로 렌더
  recomputeView();

  onMount(async () => {
    if (!browser) return;

    try {
      const { pb } = await import('$lib/pocketbase');

      const [rfqList, supplierList] = await Promise.all([
        pb.collection('rfqs').getFullList({
          sort: '-created',
          requestKey: 'rfqs-init'
        }),
        pb.collection('suppliers').getFullList({
          fields: 'id',
          requestKey: 'suppliers-init'
        })
      ]);

      rfqRecords = rfqList;
      supplierCount = supplierList.length;
      recomputeView();

      pb.collection('rfqs').subscribe('*', (e) => {
        if (e.action === 'create') {
          rfqRecords = [e.record, ...rfqRecords];
        } else if (e.action === 'update') {
          rfqRecords = rfqRecords.map((r) =>
            r.id === e.record.id ? e.record : r
          );
        } else if (e.action === 'delete') {
          rfqRecords = rfqRecords.filter((r) => r.id !== e.record.id);
        }
        recomputeView();
      });

      pb.collection('suppliers').subscribe('*', (e) => {
        if (e.action === 'create') supplierCount += 1;
        else if (e.action === 'delete')
          supplierCount = Math.max(0, supplierCount - 1);
        recomputeView();
      });
    } catch (err) {
      console.error('PocketBase load failed, using demo RFQs instead.', err);
      rfqRecords = [];
      supplierCount = 160;
      recomputeView();
    }
  });
</script>

<main class="rfqs-page">
  <!-- 상단 헤더 / 카피 -->
  <section
    class="rfqs-hero"
    in:fly={{ y: 18, duration: 380 }}
  >
    <div class="rfqs-hero-orbit"></div>

    <div class="rfqs-hero-left" in:fade={{ duration: 320, delay: 40 }}>
      <p class="rfqs-kicker">
        LIVE RFQS ▢ PRODUCTION-GRADE PROJECTS
      </p>

      <h1 class="title">
        Live RFQs across lines, robotics and industrial automation.
      </h1>

      <p class="sub">
        A rotating, anonymised snapshot of RFQs running through NovaNexus –
        CNC and press lines, warehouse systems, EV cells, medical and clean-room projects
        where engineering quality matters more than the lowest quote.
      </p>

      <div
        class:mode-live={hasLiveData}
        class="mode-pill"
        in:scale={{ duration: 260, delay: 140 }}
      >
        {#if hasLiveData}
          Live data from the NovaNexus network – updating in real time.
        {:else}
          Representative sample projects by region. Live RFQs will appear here automatically as
          they go live.
        {/if}
      </div>
    </div>

    <!-- 상단 메트릭 카드 -->
    <div
      class="rfqs-hero-right"
      in:fly={{ y: 10, duration: 320, delay: 80 }}
    >
      <div class="metrics-glow"></div>
      <div class="metrics-card">
        <div>
          <div class="metric-value">{liveCount}</div>
          <div class="metric-label">Live / in-review RFQs</div>
        </div>
        <div>
          <div class="metric-value">{avgBudgetLabel}</div>
          <div class="metric-label">Typical project value</div>
        </div>
        <div>
          <div class="metric-value">{vettedFactoriesLabel}</div>
          <div class="metric-label">Vetted factories</div>
        </div>
      </div>
    </div>
  </section>

  <!-- 지역별 네트워크 스냅샷 -->
  <section
    class="network-strip"
    in:fade={{ duration: 320, delay: 220 }}
  >
    {#each Object.values(regionStats) as stat, i}
      <div
        class="network-pill"
        style={`animation-delay: ${i * 120}ms`}
      >
        <div class="np-label">{stat.label}</div>
        <div class="np-main">
          <span class="np-number">{stat.suppliers}</span>
          <span class="np-caption">suppliers</span>
        </div>
        <div class="np-sub">
          {stat.rfqs} active / sample RFQs in scope
        </div>
      </div>
    {/each}
  </section>

  <!-- 필터 바 -->
  <section
    class="rfqs-filters"
    in:fade={{ duration: 260, delay: 260 }}
  >
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
      Filters change the view only. Under the hood every row is a fully-scoped RFQ with drawings,
      throughput and standards filled in.
    </div>
  </section>

  <!-- RFQ 리스트 -->
  <section
    class="rfqs-list"
    in:scale={{ duration: 300, delay: 300 }}
  >
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
          <div>Decision date</div>
        </div>

        {#each filteredRfqs as r, i (r.id)}
          <div
            class="rfqs-row"
            in:fade={{ duration: 220, delay: 40 + i * 18 }}
            animate:flip={{ duration: 220 }}
          >
            <div class="rfqs-cell-id">{r.id}</div>
            <div class="rfqs-cell-title">
              <div class="rfqs-title-main">{r.title}</div>
              <div class="rfqs-title-sub">{r.buyer}</div>
            </div>
            <div class="rfqs-cell-process">{r.process}</div>
            <div>{r.region}</div>
            <div>{r.budget}</div>
            <div>
              <span
                class={`badge badge-${r.status
                  .replace(' ', '-')
                  .toLowerCase()}`}
              >
                {r.status}
              </span>
            </div>
            <div>{r.due}</div>
          </div>
        {/each}
      </div>
    {/if}
  </section>

  <!-- 하단 CTA -->
  <section
    class="rfqs-final"
    in:fly={{ y: 8, duration: 260, delay: 260 }}
  >
    <h3>Want your next RFQ to live here instead of in an email chain?</h3>
    <p>
      Start with one production-grade project. We’ll help you translate drawings, throughput and
      constraints into a clean RFQ and route it to a realistic bench of factories.
    </p>
    <div class="rfqs-final-cta-row">
      <a href="/rfqs/new" class="btn-primary">
        <span>Submit an RFQ</span>
        <span class="btn-arrow">→</span>
      </a>
      <a href="/how-it-works" class="btn-ghost">See how the pipeline works</a>
    </div>
  </section>
</main>

<style>
  .rfqs-page {
    max-width: 1120px;
    margin: 0 auto;
    padding: 96px 24px 72px;
    color: #e5e7eb;
    position: relative;
  }

  .rfqs-hero {
    display: grid;
    grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr);
    gap: 40px;
    align-items: center;
    margin-bottom: 32px;
    position: relative;
    overflow: hidden;
  }

  .rfqs-hero-orbit {
    position: absolute;
    inset: -160px -120px auto auto;
    background:
      radial-gradient(circle at 20% 0%, rgba(56, 189, 248, 0.35), transparent 55%),
      radial-gradient(circle at 80% 60%, rgba(129, 140, 248, 0.28), transparent 55%);
    opacity: 0.6;
    filter: blur(16px);
    pointer-events: none;
    animation: orbitDrift 18s ease-in-out infinite alternate;
  }

  .rfqs-hero-left {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .rfqs-kicker {
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #38bdf8;
  }

  .title {
    font-size: 30px;
    line-height: 1.2;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .sub {
    font-size: 14px;
    color: #9ca3af;
    max-width: 560px;
  }

  .mode-pill {
    margin-top: 6px;
    font-size: 11px;
    padding: 6px 12px 6px 10px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.6);
    color: #e5e7eb;
    background: radial-gradient(
      circle at top left,
      rgba(56, 189, 248, 0.22),
      rgba(15, 23, 42, 0.98)
    );
    display: inline-flex;
    align-items: center;
    gap: 6px;
    position: relative;
    overflow: hidden;
  }

  .mode-pill::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: rgba(148, 163, 184, 0.8);
  }

  .mode-live {
    border-color: rgba(34, 197, 94, 0.7);
    box-shadow: 0 0 18px rgba(34, 197, 94, 0.45);
  }

  .mode-live::before {
    background: #22c55e;
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.9);
    animation: pingDot 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
  }

  .rfqs-hero-right {
    position: relative;
    display: flex;
    justify-content: flex-end;
  }

  .metrics-glow {
    position: absolute;
    inset: -40px -40px 0 0;
    background:
      radial-gradient(circle at top, rgba(56, 189, 248, 0.4), transparent 55%),
      radial-gradient(circle at bottom, rgba(15, 23, 42, 1), rgba(15, 23, 42, 1));
    filter: blur(20px);
    opacity: 0.9;
    border-radius: 999px;
    z-index: -1;
    animation: pulseGlow 5s ease-in-out infinite;
  }

  .metrics-card {
    display: flex;
    gap: 24px;
    padding: 16px 22px;
    border-radius: 18px;
    background: radial-gradient(
      circle at top,
      rgba(56, 189, 248, 0.22),
      rgba(15, 23, 42, 0.98)
    );
    border: 1px solid rgba(148, 163, 184, 0.5);
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.9);
    font-size: 11px;
    min-width: 260px;
    animation: floatCard 6s ease-in-out infinite alternate;
    backdrop-filter: blur(8px);
  }

  .metric-value {
    font-size: 20px;
    font-weight: 600;
    color: #e5e7eb;
  }

  .metric-label {
    color: #9ca3af;
  }

  @media (max-width: 900px) {
    .rfqs-hero {
      grid-template-columns: minmax(0, 1fr);
      gap: 28px;
      align-items: flex-start;
    }

    .rfqs-hero-orbit {
      inset: -120px -40px auto auto;
    }

    .metrics-card {
      width: 100%;
      justify-content: space-between;
      margin-top: 4px;
    }
  }

  /* 지역별 네트워크 스트립 */

  .network-strip {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  .network-pill {
    flex: 1;
    min-width: 200px;
    border-radius: 16px;
    border: 1px solid rgba(30, 64, 175, 0.8);
    background: radial-gradient(
      circle at top left,
      rgba(59, 130, 246, 0.28),
      rgba(15, 23, 42, 0.98)
    );
    padding: 12px 16px;
    font-size: 11px;
    position: relative;
    overflow: hidden;
  }

  .network-pill::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      120deg,
      transparent,
      rgba(248, 250, 252, 0.18),
      transparent
    );
    transform: translateX(-100%);
    animation: shimmer 8s linear infinite;
    opacity: 0.7;
    pointer-events: none;
  }

  .np-label {
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: #bfdbfe;
    margin-bottom: 6px;
  }

  .np-main {
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin-bottom: 2px;
  }

  .np-number {
    font-size: 18px;
    font-weight: 600;
  }

  .np-caption {
    color: #9ca3af;
  }

  .np-sub {
    color: #9ca3af;
  }

  /* 필터 바 */

  .rfqs-filters {
    display: flex;
    align-items: center;
    gap: 18px;
    margin-bottom: 16px;
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
    transition:
      box-shadow 0.18s ease,
      border-color 0.18s ease,
      background 0.18s ease;
  }

  .filter-group select:focus-visible {
    border-color: rgba(59, 130, 246, 0.9);
    box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.9);
    background: rgba(15, 23, 42, 0.98);
  }

  .filter-note {
    font-size: 11px;
    color: #6b7280;
    margin-left: auto;
    max-width: 320px;
  }

  /* RFQ 리스트 */

  .rfqs-list {
    border-radius: 18px;
    border: 1px solid rgba(31, 41, 55, 1);
    background: radial-gradient(
      circle at top,
      rgba(15, 23, 42, 0.98),
      rgba(2, 6, 23, 1)
    );
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
    transition:
      background 0.18s ease,
      transform 0.18s ease,
      box-shadow 0.18s ease;
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
    background: radial-gradient(
      circle at top left,
      rgba(59, 130, 246, 0.28),
      rgba(15, 23, 42, 0.98)
    );
    transform: translateY(-1px);
    box-shadow: 0 16px 32px rgba(15, 23, 42, 0.85);
  }

  .rfqs-cell-id {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
      'Liberation Mono', 'Courier New', monospace;
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

  /* 하단 CTA */

  .rfqs-final {
    margin-top: 32px;
    text-align: center;
    border-top: 1px solid rgba(31, 41, 55, 1);
    padding-top: 22px;
  }

  .rfqs-final h3 {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 6px;
    color: #f9fafb;
  }

  .rfqs-final p {
    font-size: 13px;
    color: #9ca3af;
    max-width: 520px;
    margin: 0 auto 14px;
  }

  .rfqs-final-cta-row {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
  }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 9px 20px;
    border-radius: 999px;
    background: linear-gradient(135deg, #3b82f6, #22c1c3, #a855f7);
    color: #e5e7eb;
    font-size: 13px;
    font-weight: 600;
    border: none;
    text-decoration: none;
    box-shadow:
      0 14px 36px rgba(15, 23, 42, 0.9),
      0 0 0 1px rgba(148, 163, 184, 0.25);
    transition:
      transform 0.18s ease,
      box-shadow 0.18s ease,
      opacity 0.18s ease,
      filter 0.18s ease;
  }

  .btn-arrow {
    margin-left: 4px;
    font-size: 13px;
    transition: transform 0.18s ease;
  }

  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow:
      0 20px 56px rgba(15, 23, 42, 1),
      0 0 0 1px rgba(248, 250, 252, 0.7);
    opacity: 0.97;
    filter: saturate(1.15);
  }

  .btn-primary:hover .btn-arrow {
    transform: translateX(2px);
  }

  .btn-ghost {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 9px 18px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.9);
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.98));
    color: #e5e7eb;
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    transition:
      background 0.18s ease,
      border-color 0.18s ease,
      transform 0.18s ease,
      box-shadow 0.18s ease;
  }

  .btn-ghost:hover {
    background: radial-gradient(circle at top, rgba(30, 64, 175, 0.6), rgba(15, 23, 42, 0.98));
    border-color: rgba(209, 213, 219, 1);
    transform: translateY(-1px);
    box-shadow: 0 18px 42px rgba(15, 23, 42, 1);
  }

  @media (max-width: 900px) {
    .rfqs-row,
    .rfqs-row-head {
      grid-template-columns: 1.1fr 2.4fr 1.8fr 1.6fr;
    }

    .rfqs-row-head div:nth-child(n + 5),
    .rfqs-row div:nth-child(n + 5) {
      display: none;
    }
  }

  @media (max-width: 640px) {
    .rfqs-page {
      padding-inline: 16px;
    }

    .title {
      font-size: 24px;
    }

    .rfqs-row,
    .rfqs-row-head {
      grid-template-columns: 1.2fr 2.6fr 1.6fr;
    }

    .rfqs-row-head div:nth-child(3),
    .rfqs-row div:nth-child(3) {
      display: none;
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

  @keyframes pulseGlow {
    0% {
      opacity: 0.55;
    }
    50% {
      opacity: 0.95;
    }
    100% {
      opacity: 0.55;
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
      transform: scale(1.4);
      opacity: 0.1;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
</style>
