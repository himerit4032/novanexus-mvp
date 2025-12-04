<!-- src/routes/rfqs/+page.svelte -->

<svelte:head>
  <title>NovaNexus ▢ Live RFQs</title>
</svelte:head>

<script lang="ts">
  import { onMount } from 'svelte';
  import { pb } from '$lib/pocketbase';

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

  // ░░ 고퀄 샘플 RFQ 데이터 (국가, 산업 다 섞어서) ░░
  const demoRfqs: RFQ[] = [
    {
      id: 'NN-24027',
      title: 'Aluminum cutting line for automotive profiles',
      buyer: 'Tier-1 EV supplier (US South)',
      process: 'Aluminum line · Hot saw + cooling table',
      region: 'USA / Alabama',
      budget: '$600k–$1.2M',
      status: 'Open',
      due: '2025-03-10'
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
      id: 'NN-24041',
      title: 'CNC machining cell for EV motor housings',
      buyer: 'EV components supplier (Germany)',
      process: 'CNC line · 5-axis machining + deburr',
      region: 'Germany',
      budget: '$900k–$1.6M',
      status: 'Open',
      due: '2025-04-05'
    },
    {
      id: 'NN-24052',
      title: 'Press line upgrade for chassis stamping',
      buyer: 'Global automotive OEM (US Midwest)',
      process: 'Press line · 800–1,000T + coil feed',
      region: 'USA / Michigan',
      budget: '$1.4M–$2.3M',
      status: 'Open',
      due: '2025-04-18'
    },
    {
      id: 'NN-24063',
      title: 'AS/RS warehouse for steel coils',
      buyer: 'Steel service center (Korea)',
      process: 'Warehouse · AS/RS + crane + WMS',
      region: 'Korea / Busan',
      budget: '$3.0M–$4.8M',
      status: 'Open',
      due: '2025-05-02'
    },
    {
      id: 'NN-24075',
      title: 'Robotic palletizing for beverage line',
      buyer: 'Beverage bottling plant (Vietnam)',
      process: 'Robotics · Palletizer + conveyors',
      region: 'Vietnam / Ho Chi Minh City',
      budget: '$350k–$650k',
      status: 'Open',
      due: '2025-04-29'
    },
    {
      id: 'NN-24092',
      title: 'Battery module assembly & end-of-line testing',
      buyer: 'EV battery OEM (US)',
      process: 'EV · Assembly + EOL test',
      region: 'USA / Texas',
      budget: '$4.0M–$6.5M',
      status: 'Open',
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

  // ░░ 공통 상태값 ░░
  let rfqs: RFQ[] = []; // 화면에 실제로 보여줄 RFQs (라이브 or 데모)
  let rfqRecords: any[] = []; // PocketBase 원본
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
    americas: { label: 'US & Americas', rfqs: 0, suppliers: 0 },
    europe: { label: 'Europe', rfqs: 0, suppliers: 0 },
    apac: { label: 'Asia–Pacific', rfqs: 0, suppliers: 0 }
  };

  // ░░ PocketBase record → RFQ 매핑 ░░
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

  // ░░ RFQ / 메트릭 / 지역 통계 재계산 ░░
  function recomputeView() {
    if (rfqRecords.length === 0) {
      // PocketBase 에 아직 RFQ 없음 → 데모 모드
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

    // vetted factories 라벨
    vettedFactoriesLabel = supplierCount ? `${supplierCount}+` : '160+';

    // 지역별 통계 (RFQ 개수 기준으로 supplier 분배)
    const baseStats: Record<RegionKey, RegionStat> = {
      americas: { label: 'US & Americas', rfqs: 0, suppliers: 0 },
      europe: { label: 'Europe', rfqs: 0, suppliers: 0 },
      apac: { label: 'Asia–Pacific', rfqs: 0, suppliers: 0 }
    };

    for (const r of rfqs) {
      const key = classifyRegion(r.region);
      baseStats[key].rfqs += 1;
    }

    const totalRfqs = rfqs.length || 1;
    const totalSuppliers = supplierCount || 160;

    (['americas', 'europe', 'apac'] as RegionKey[]).forEach((key) => {
      baseStats[key].suppliers = Math.max(
        1,
        Math.round((totalSuppliers * baseStats[key].rfqs) / totalRfqs)
      );
    });

    regionStats = baseStats;
  }

  // ░░ 필터링은 Svelte 반응식으로 분리 ░░
  $: filteredRfqs = rfqs.filter((r) => {
    const byStatus =
      statusFilter === 'All' ? true : r.status === statusFilter;

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

  // ░░ 최초 진입 시: PocketBase → 실데이터, 없으면 데모로 자동 fallback ░░
  onMount(async () => {
    try {
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

      // RFQ 실시간 구독
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

      // Supplier 개수 실시간 업데이트 (메트릭용)
      pb.collection('suppliers').subscribe('*', (e) => {
        if (e.action === 'create') supplierCount += 1;
        else if (e.action === 'delete')
          supplierCount = Math.max(0, supplierCount - 1);
        recomputeView();
      });
    } catch (err) {
      console.error(
        'PocketBase load failed, using demo RFQs instead.',
        err
      );
      rfqRecords = [];
      supplierCount = 160;
      recomputeView();
    }
  });

  // 초기에는 데모 데이터 기준으로 바로 그려지게
  recomputeView();
</script>

<main class="rfqs-page">
  <!-- 상단 헤더 / 카피 -->
  <section class="rfqs-hero">
    <div>
      <p class="rfqs-kicker">LIVE RFQs · PRE-QUALIFIED PROJECTS</p>

      <h1 class="title">
        Live RFQs across production lines, robotics, and automation.
      </h1>

      <p class="sub">
        Examples of real-world RFQs flowing through NovaNexus — CNC &amp; press
        lines, industrial robotics, warehouse systems, clean-room and medical
        devices, and large-scale automation where engineering quality matters
        more than the lowest quote.
      </p>

      <div class="mode-pill" class:mode-live={hasLiveData}>
        {#if hasLiveData}
          Live data from the NovaNexus network — updating in real time.
        {:else}
          Representative sample projects by region — live RFQs will appear
          here automatically as they go live.
        {/if}
      </div>
    </div>

    <!-- 상단 메트릭 카드 -->
    <div class="metrics-card">
      <div>
        <div class="metric-value">{liveCount}</div>
        <div class="metric-label">Live / in-review RFQs</div>
      </div>
      <div>
        <div class="metric-value">{avgBudgetLabel}</div>
        <div class="metric-label">Avg. project value</div>
      </div>
      <div>
        <div class="metric-value">{vettedFactoriesLabel}</div>
        <div class="metric-label">Vetted factories</div>
      </div>
    </div>
  </section>

  <!-- 지역별 네트워크 스냅샷 -->
  <section class="network-strip">
    {#each Object.values(regionStats) as stat}
      <div class="network-pill">
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
      Filter view only. Under the hood, all projects are fully scoped RFQs
      with masked buyers and realistic budgets.
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
    margin-bottom: 32px;
  }

  .rfqs-kicker {
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #38bdf8;
    margin-bottom: 8px;
  }

  .title {
    font-size: 32px;
    line-height: 1.2;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .sub {
    font-size: 14px;
    color: #9ca3af;
    max-width: 540px;
    margin-bottom: 10px;
  }

  .mode-pill {
    margin-top: 6px;
    font-size: 11px;
    padding: 5px 12px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.6);
    color: #e5e7eb;
    background: radial-gradient(
      circle at top left,
      rgba(56, 189, 248, 0.25),
      rgba(15, 23, 42, 0.96)
    );
  }

  .mode-pill.mode-live {
    border-color: rgba(34, 197, 94, 0.7);
    box-shadow: 0 0 18px rgba(34, 197, 94, 0.45);
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
      flex-direction: column;
      align-items: flex-start;
    }

    .metrics-card {
      width: 100%;
      justify-content: space-between;
      margin-top: 18px;
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
  }

  .filter-note {
    font-size: 11px;
    color: #6b7280;
    margin-left: auto;
  }

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
