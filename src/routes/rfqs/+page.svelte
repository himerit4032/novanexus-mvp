<!-- src/routes/rfqs/+page.svelte -->

<svelte:head>
  <title>{$t('nav.liveRFQs')} ▢ NovaNexus</title>
</svelte:head>

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { fade, fly, scale } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { t } from 'svelte-i18n';
  import { get } from 'svelte/store';

  // ─────────────────────────────────────────────
  // TYPES
  // ─────────────────────────────────────────────
  type RFQStatus = 'open' | 'inReview' | 'closed';
  type StatusFilter = 'all' | RFQStatus;

  type RegionFilter = 'all' | 'usa' | 'eu' | 'apac';
  type RegionKey = 'americas' | 'europe' | 'apac';

  type SortKey = 'due_asc' | 'due_desc' | 'budget_desc' | 'budget_asc' | 'status' | 'newest';

  type RFQ = {
    id: string;
    title: string;
    buyer: string;
    process: string;
    region: string;
    budget: string;
    status: RFQStatus;
    due: string;

    // 계산/정렬 보조용 (optional)
    dueTs?: number; // Date.parse(due)
    budgetMid?: number; // min/max로 추정한 mid
  };

  type RegionStat = {
    rfqs: number;
    suppliers: number;
  };

  // ─────────────────────────────────────────────
  // DEMO DATA
  // ─────────────────────────────────────────────
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
      status: 'open',
      due: '2026-03-10'
    },
    {
      id: 'NN-24018',
      title: 'Robotic packing cell for extrusion downstream',
      buyer: 'Extrusion plant (US West)',
      process: 'Automation · Robot + vision',
      region: 'USA / California',
      budget: '$400k–$800k',
      status: 'open',
      due: '2026-03-22'
    },
    {
      id: 'NN-24041',
      title: 'CNC machining cell for EV motor housings',
      buyer: 'EV components supplier (Germany)',
      process: 'CNC line · 5-axis machining + deburr',
      region: 'Germany',
      budget: '$900k–$1.6M',
      status: 'open',
      due: '2026-04-05'
    },
    {
      id: 'NN-24052',
      title: 'Press line upgrade for chassis stamping',
      buyer: 'Global automotive OEM (US Midwest)',
      process: 'Press line · 800–1,000T + coil feed',
      region: 'USA / Michigan',
      budget: '$1.4M–$2.3M',
      status: 'open',
      due: '2026-04-18'
    },
    {
      id: 'NN-24063',
      title: 'AS/RS warehouse for steel coils',
      buyer: 'Steel service center (Korea)',
      process: 'Warehouse · AS/RS + crane + WMS',
      region: 'Korea / Busan',
      budget: '$3.0M–$4.8M',
      status: 'open',
      due: '2026-05-02'
    },
    {
      id: 'NN-24075',
      title: 'Robotic palletizing for beverage line',
      buyer: 'Beverage bottling plant (Vietnam)',
      process: 'Robotics · Palletizer + conveyors',
      region: 'Vietnam / Ho Chi Minh City',
      budget: '$350k–$650k',
      status: 'inReview',
      due: '2025-04-29'
    },
    {
      id: 'NN-24092',
      title: 'Battery module assembly & end-of-line testing',
      buyer: 'EV battery OEM (US)',
      process: 'EV · Assembly + EOL test',
      region: 'USA / Texas',
      budget: '$4.0M–$6.5M',
      status: 'closed',
      due: '2025-05-30'
    },
    {
      id: 'NN-24103',
      title: 'Injection molding cell for medical disposables',
      buyer: 'Medical device supplier (Korea)',
      process: 'Plastics · IMM + robot take-out',
      region: 'Korea / Incheon',
      budget: '$700k–$1.1M',
      status: 'inReview',
      due: '2025-06-08'
    },
    {
      id: 'NN-24114',
      title: 'Clean-room assembly line for diagnostic kits',
      buyer: 'IVD manufacturer (Japan)',
      process: 'Clean-room · Assembly + packaging',
      region: 'Japan / Osaka',
      budget: '$1.2M–$2.0M',
      status: 'inReview',
      due: '2025-05-28'
    },
    {
      id: 'NN-24124',
      title: 'End-of-line case packing & stretch wrapping',
      buyer: 'Food & beverage plant (US East)',
      process: 'Packaging · Case packer + wrapper',
      region: 'USA / Georgia',
      budget: '$220k–$420k',
      status: 'inReview',
      due: '2025-05-03'
    },
    {
      id: 'NN-24136',
      title: 'Steel tube cutting & chamfering cell',
      buyer: 'Steel tube mill (Italy)',
      process: 'CNC · Saw + chamfer + deburr',
      region: 'Italy / Milan',
      budget: '$480k–$900k',
      status: 'closed',
      due: '2024-12-18'
    },
    {
      id: 'NN-23988',
      title: 'Legacy pallet racking retrofit',
      buyer: 'Regional 3PL operator (UK)',
      process: 'Racking · Selective + retrofit',
      region: 'United Kingdom',
      budget: '$180k–$320k',
      status: 'closed',
      due: '2024-11-30'
    }
  ];

  // ─────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────
  let rfqs: RFQ[] = [];
  let rfqRecords: any[] = [];
  let hasLiveData = false;

  let supplierCount = 0;
  let liveCount = 0;
  let avgBudgetLabel = '$220k';
  let vettedFactoriesLabel = '160+';

  const statusFilterOptions: StatusFilter[] = ['all', 'open', 'inReview', 'closed'];
  const regionFilterOptions: RegionFilter[] = ['all', 'usa', 'eu', 'apac'];

  let statusFilter: StatusFilter = 'open';
  let regionFilter: RegionFilter = 'all';

  // 추가: 검색/정렬/페이지네이션
  let query = '';
  let sortKey: SortKey = 'due_asc';

  let pageSize = 10;
  let pageIndex = 1; // 1-based

  let filteredRfqs: RFQ[] = [];
  let pagedRfqs: RFQ[] = [];
  let totalPages = 1;
  let totalResults = 0;

  // region strip
  const regionOrder: RegionKey[] = ['americas', 'europe', 'apac'];

  const baseRegionStats: Record<RegionKey, RegionStat> = {
    americas: { rfqs: 0, suppliers: baseSupplierCounts.americas },
    europe: { rfqs: 0, suppliers: baseSupplierCounts.europe },
    apac: { rfqs: 0, suppliers: baseSupplierCounts.apac }
  };

  let regionStats: Record<RegionKey, RegionStat> = { ...baseRegionStats };

  // 로딩/에러/구독 관리
  let loading = true;
  let loadError = '';
  let pbReady = false;

  let unsubRfqs: null | (() => void) = null;
  let unsubSuppliers: null | (() => void) = null;

  // ─────────────────────────────────────────────
  // HELPERS (Normalization / Mapping)
  // ─────────────────────────────────────────────
  function normalizeStatus(value: any): RFQStatus {
    const v = String(value ?? '').toLowerCase().trim();
    if (v === 'in review' || v === 'in_review' || v === 'inreview') return 'inReview';
    if (v === 'closed') return 'closed';
    return 'open';
  }

  function safeText(v: any, fallback = ''): string {
    const s = String(v ?? '').trim();
    return s || fallback;
  }

  function parseDueTs(due: string): number {
    const ts = Date.parse(due);
    return Number.isFinite(ts) ? ts : 0;
  }

  function parseBudgetMid(rec: any): number {
    const min = Number(rec?.budget_min ?? rec?.budgetMin ?? 0) || 0;
    const max = Number(rec?.budget_max ?? rec?.budgetMax ?? 0) || 0;
    if (min || max) return (min + (max || min)) / 2;
    return 0;
  }

  function mapRecordToRFQ(rec: any): RFQ {
    const code = safeText(rec?.code ?? rec?.id ?? '', 'NN-XXXX');
    const title = safeText(rec?.title, '');
    const buyerMasked = safeText(rec?.buyer_masked ?? rec?.buyer, 'Confidential buyer');
    const process = safeText(rec?.process ?? rec?.primary_process, '');
    const region = safeText(rec?.region ?? rec?.region_preference, '');
    const budget =
      safeText(rec?.budget_label) ||
      safeText(rec?.budget_range) ||
      safeText(rec?.budget) ||
      '';
    const status = normalizeStatus(rec?.status);
    const due = safeText(rec?.due ?? rec?.due_date, '');

    const dueTs = parseDueTs(due);
    const budgetMid = parseBudgetMid(rec);

    return {
      id: code,
      title,
      buyer: buyerMasked,
      process,
      region,
      budget,
      status,
      due,
      dueTs,
      budgetMid
    };
  }

  function formatBudget(value: number): string {
    if (!value) return '$220k';
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    return `$${Math.round(value / 1_000)}k`;
  }

  function classifyRegion(label: string): RegionKey {
    const l = String(label || '').toLowerCase();

    // APAC
    if (
      l.includes('korea') ||
      l.includes('japan') ||
      l.includes('vietnam') ||
      l.includes('thailand') ||
      l.includes('china') ||
      l.includes('taiwan') ||
      l.includes('singapore') ||
      l.includes('malaysia') ||
      l.includes('indonesia') ||
      l.includes('philippines') ||
      l.includes('apac')
    ) return 'apac';

    // Europe
    if (
      l.includes('germany') ||
      l.includes('france') ||
      l.includes('italy') ||
      l.includes('denmark') ||
      l.includes('netherlands') ||
      l.includes('united kingdom') ||
      l.includes('uk') ||
      l.includes('spain') ||
      l.includes('poland') ||
      l.includes('sweden') ||
      l.includes('norway') ||
      l.includes('europe') ||
      l.includes('eu ')
    ) return 'europe';

    // Default Americas
    return 'americas';
  }

  function isUSARegion(region: string): boolean {
    const r = String(region || '');
    const l = r.toLowerCase();

    // "USA /", "US", "United States"
    if (l.includes('usa') || l.includes('united states')) return true;

    // "US West", "US East", etc.
    if (/\bus\b/.test(l)) return true;

    // states 흔한 패턴 (필요 시 확장)
    const states = [
      'alabama','alaska','arizona','arkansas','california','colorado','connecticut','delaware',
      'florida','georgia','hawaii','idaho','illinois','indiana','iowa','kansas','kentucky',
      'louisiana','maine','maryland','massachusetts','michigan','minnesota','mississippi',
      'missouri','montana','nebraska','nevada','new hampshire','new jersey','new mexico',
      'new york','north carolina','north dakota','ohio','oklahoma','oregon','pennsylvania',
      'rhode island','south carolina','south dakota','tennessee','texas','utah','vermont',
      'virginia','washington','west virginia','wisconsin','wyoming'
    ];
    return states.some((s) => l.includes(s));
  }

  function isEURegion(region: string): boolean {
    const l = String(region || '').toLowerCase();
    const countries = [
      'germany','france','italy','denmark','netherlands','belgium','austria','switzerland',
      'united kingdom','uk','ireland','spain','portugal','poland','czech','slovakia','hungary',
      'romania','bulgaria','sweden','norway','finland','greece'
    ];
    return l.includes('europe') || l.includes('eu') || countries.some((c) => l.includes(c));
  }

  function isAPACRegion(region: string): boolean {
    const l = String(region || '').toLowerCase();
    const countries = [
      'korea','japan','vietnam','thailand','china','taiwan','singapore','malaysia',
      'indonesia','philippines','hong kong','macau','india'
    ];
    return l.includes('apac') || countries.some((c) => l.includes(c));
  }

  function statusClass(s: RFQStatus): string {
    if (s === 'open') return 'badge-open';
    if (s === 'inReview') return 'badge-in-review';
    return 'badge-closed';
  }

  // ─────────────────────────────────────────────
  // COMPUTE (single source of truth)
  // ─────────────────────────────────────────────
  function recomputeView() {
    // 1) 데이터 소스 결정 (Live vs Demo)
    if (!rfqRecords || rfqRecords.length === 0) {
      hasLiveData = false;
      rfqs = demoRfqs.map((r) => ({
        ...r,
        dueTs: parseDueTs(r.due),
        budgetMid: 0
      }));

      liveCount = rfqs.filter((r) => r.status === 'open' || r.status === 'inReview').length;
      avgBudgetLabel = '$220k';
    } else {
      hasLiveData = true;

      // 레코드 → RFQ 정규화
      rfqs = rfqRecords
        .slice()
        .map(mapRecordToRFQ)
        .sort((a, b) => (a.dueTs ?? 0) - (b.dueTs ?? 0));

      liveCount = rfqs.filter((r) => r.status === 'open' || r.status === 'inReview').length;

      // budget avg
      const mids = rfqRecords
        .map((rec) => parseBudgetMid(rec))
        .filter((n) => Number.isFinite(n) && n > 0);

      if (mids.length) {
        const avg = mids.reduce((s, v) => s + v, 0) / mids.length;
        avgBudgetLabel = formatBudget(avg);
      } else {
        avgBudgetLabel = '$220k';
      }
    }

    vettedFactoriesLabel = supplierCount ? `${supplierCount}+` : '160+';

    // 2) region stats
    const stats: Record<RegionKey, RegionStat> = {
      americas: { rfqs: 0, suppliers: baseSupplierCounts.americas },
      europe: { rfqs: 0, suppliers: baseSupplierCounts.europe },
      apac: { rfqs: 0, suppliers: baseSupplierCounts.apac }
    };

    for (const r of rfqs) {
      const key = classifyRegion(r.region);
      stats[key].rfqs += 1;
    }
    regionStats = stats;

    // 3) 필터 + 검색
    const q = query.trim().toLowerCase();

    filteredRfqs = rfqs.filter((r) => {
      const byStatus = statusFilter === 'all' ? true : r.status === statusFilter;

      const byRegion =
        regionFilter === 'all'
          ? true
          : regionFilter === 'usa'
          ? isUSARegion(r.region)
          : regionFilter === 'eu'
          ? isEURegion(r.region)
          : isAPACRegion(r.region);

      const byQuery =
        !q
          ? true
          : [
              r.id,
              r.title,
              r.buyer,
              r.process,
              r.region,
              r.budget,
              r.status
            ]
              .join(' ')
              .toLowerCase()
              .includes(q);

      return byStatus && byRegion && byQuery;
    });

    // 4) 정렬
    filteredRfqs = filteredRfqs.slice().sort((a, b) => {
      if (sortKey === 'newest') {
        // dueTs가 없을 수 있으니 rec created 기반이 필요하면 PB 필드를 추가해야 함.
        // 여기선 dueTs 역순을 “신규성”에 가까운 대체값으로 사용.
        return (b.dueTs ?? 0) - (a.dueTs ?? 0);
      }
      if (sortKey === 'due_asc') return (a.dueTs ?? 0) - (b.dueTs ?? 0);
      if (sortKey === 'due_desc') return (b.dueTs ?? 0) - (a.dueTs ?? 0);

      if (sortKey === 'budget_desc') return (b.budgetMid ?? 0) - (a.budgetMid ?? 0);
      if (sortKey === 'budget_asc') return (a.budgetMid ?? 0) - (b.budgetMid ?? 0);

      if (sortKey === 'status') {
        const order: Record<RFQStatus, number> = { open: 0, inReview: 1, closed: 2 };
        return order[a.status] - order[b.status];
      }

      return 0;
    });

    // 5) 페이지네이션
    totalResults = filteredRfqs.length;
    totalPages = Math.max(1, Math.ceil(totalResults / pageSize));

    // 페이지 인덱스 안전 보정
    if (pageIndex > totalPages) pageIndex = totalPages;
    if (pageIndex < 1) pageIndex = 1;

    const start = (pageIndex - 1) * pageSize;
    const end = start + pageSize;
    pagedRfqs = filteredRfqs.slice(start, end);
  }

  // reactive: 입력이 바뀌면 recompute
  $: recomputeView();

  // 필터/검색/정렬 바뀌면 페이지 1로 (UX)
  $: if (query || statusFilter || regionFilter || sortKey || pageSize) {
    // 단, 무한루프 방지: 값이 바뀔 때마다 1로 넣는 건 괜찮지만
    // 이미 1이면 변경 없음.
    if (pageIndex !== 1) pageIndex = 1;
  }

  // ─────────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────────
  function clearSearch() {
    query = '';
  }

  function nextPage() {
    if (pageIndex < totalPages) pageIndex += 1;
  }

  function prevPage() {
    if (pageIndex > 1) pageIndex -= 1;
  }

  async function handlePrimaryCtaClick(e: MouseEvent) {
    e.preventDefault();

    // /rfqs/new는 보호 라우트라고 가정 → 로그인 여부 체크 후 이동
    // (서버 hooks에서도 보호해야 완벽하지만, 여기서 UX 가드도 같이)
    if (!browser) return;

    try {
      const { pb } = await import('$lib/pocketbase');
      const isAuthed = pb?.authStore?.isValid;

      if (!isAuthed) {
        const next = encodeURIComponent('/rfqs/new');
        await goto(`/auth/login?next=${next}`);
        return;
      }
      await goto('/rfqs/new');
    } catch {
      // pb 로드 실패면 안전하게 로그인으로
      const next = encodeURIComponent('/rfqs/new');
      await goto(`/auth/login?next=${next}`);
    }
  }

  // ─────────────────────────────────────────────
  // INIT (Demo first render → then live)
  // ─────────────────────────────────────────────
  // 초기 데모 렌더: rfqRecords empty → demo로 보여줌
  rfqRecords = [];
  supplierCount = 0;
  loading = true;
  loadError = '';

  // PocketBase 연동 (client-only)
  onMount(async () => {
    if (!browser) return;

    loading = true;
    loadError = '';

    try {
      const mod = await import('$lib/pocketbase');
      const pb = mod.pb;
      pbReady = true;

      // 초기 load
      const [rfqList, supplierList] = await Promise.all([
        pb.collection('rfqs').getFullList({
          sort: '-created',
          requestKey: 'rfqs-init'
        }),
        pb.collection('suppliers_factory').getFullList({
          fields: 'id',
          requestKey: 'suppliers-init'
        })
      ]);

      rfqRecords = rfqList ?? [];
      supplierCount = (supplierList ?? []).length;

      // RFQ live subscribe
      await pb.collection('rfqs').subscribe('*', (e) => {
        try {
          if (e.action === 'create') {
            // 중복 방지
            const exists = rfqRecords.some((r) => r.id === e.record.id);
            rfqRecords = exists ? rfqRecords : [e.record, ...rfqRecords];
          } else if (e.action === 'update') {
            rfqRecords = rfqRecords.map((r) => (r.id === e.record.id ? e.record : r));
          } else if (e.action === 'delete') {
            rfqRecords = rfqRecords.filter((r) => r.id !== e.record.id);
          }
        } catch (err) {
          console.error('RFQ subscribe handler error:', err);
        }
      });

      // PB subscribe는 “unsubscribe 함수” 형태로 제공되는 케이스가 많아서,
      // 공식/버전별로 다를 수 있음. 안전하게 onDestroy에서 unsubscribe 호출을 시도함.
      unsubRfqs = () => {
        try {
          pb.collection('rfqs').unsubscribe('*');
        } catch {}
      };

      // Supplier live subscribe (count only)
      await pb.collection('suppliers_factory').subscribe('*', (e) => {
        try {
          if (e.action === 'create') supplierCount += 1;
          else if (e.action === 'delete') supplierCount = Math.max(0, supplierCount - 1);
        } catch (err) {
          console.error('Supplier subscribe handler error:', err);
        }
      });

      unsubSuppliers = () => {
        try {
          pb.collection('suppliers_factory').unsubscribe('*');
        } catch {}
      };
    } catch (err: any) {
      console.error('PocketBase load failed, using demo RFQs instead.', err);
      pbReady = false;
      rfqRecords = [];
      supplierCount = 160;
      loadError = 'Live data temporarily unavailable. Showing sample RFQs.';
    } finally {
      loading = false;
    }
  });

  onDestroy(() => {
    try {
      unsubRfqs?.();
      unsubSuppliers?.();
    } catch {}
  });
</script>

<main class="rfqs-page">
  <!-- HERO -->
  <section class="rfqs-hero" in:fly={{ y: 18, duration: 380 }}>
    <div class="rfqs-hero-orbit"></div>

    <div class="rfqs-hero-left" in:fade={{ duration: 320, delay: 40 }}>
      <p class="rfqs-kicker">
        {$t('rfqs.hero.badge')}
      </p>

      <h1 class="title">
        {$t('rfqs.hero.title')}
      </h1>

      <p class="sub">
        {$t('rfqs.hero.subtitle')}
      </p>

      <div
        class="mode-pill"
        class:mode-live={hasLiveData}
        in:scale={{ duration: 260, delay: 140 }}
      >
        {#if hasLiveData}
          {$t('rfqs.hero.liveNote')}
        {:else}
          {$t('rfqs.hero.note')}
        {/if}
      </div>

      {#if loadError}
        <div class="rfqs-inline-alert" role="status" aria-live="polite">
          <span class="rfqs-inline-alert-dot"></span>
          <span>{loadError}</span>
        </div>
      {/if}
    </div>

    <!-- METRICS CARD -->
    <div class="rfqs-hero-right" in:fly={{ y: 10, duration: 320, delay: 80 }}>
      <div class="metrics-glow"></div>
      <div class="metrics-card">
        <div>
          <div class="metric-value">{liveCount}</div>
          <div class="metric-label">{$t('rfqs.hero.stats.liveLabel')}</div>
        </div>
        <div>
          <div class="metric-value">{avgBudgetLabel}</div>
          <div class="metric-label">{$t('rfqs.hero.stats.valueBandsLabel')}</div>
        </div>
        <div>
          <div class="metric-value">{vettedFactoriesLabel}</div>
          <div class="metric-label">{$t('rfqs.hero.stats.factoriesLabel')}</div>
        </div>
      </div>
    </div>
  </section>

  <!-- REGION STRIP -->
  <section class="network-strip" in:fade={{ duration: 320, delay: 220 }}>
    {#each regionOrder as key, i}
      <div class="network-pill" style={`animation-delay: ${i * 120}ms`}>
        <div class="np-label">
          {$t(`rfqs.regions.${key}.label`)}
        </div>
        <div class="np-main">
          <span class="np-number">{regionStats[key].suppliers}</span>
          <span class="np-caption">{$t('rfqs.regions.suppliersLabel')}</span>
        </div>
        <div class="np-sub">
          {regionStats[key].rfqs} {$t('rfqs.regions.sampleRfqsLabel')}
        </div>
      </div>
    {/each}
  </section>

  <!-- FILTER BAR (Upgraded) -->
  <section class="rfqs-filters" in:fade={{ duration: 260, delay: 260 }}>
    <div class="filter-group">
      <label for="rfq-status-filter">{$t('rfqs.filters.statusLabel')}</label>
      <select id="rfq-status-filter" bind:value={statusFilter} aria-label="Status filter">
        <option value="all">{$t('rfqs.filters.statusAll')}</option>
        <option value="open">{$t('rfqs.status.open')}</option>
        <option value="inReview">{$t('rfqs.status.inReview')}</option>
        <option value="closed">{$t('rfqs.status.closed')}</option>
      </select>
    </div>

    <div class="filter-group">
      <label for="rfq-region-filter">{$t('rfqs.filters.regionLabel')}</label>
      <select id="rfq-region-filter" bind:value={regionFilter} aria-label="Region filter">
        <option value="all">{$t('rfqs.filters.regionAll')}</option>
        <option value="usa">{$t('rfqs.regions.americas.short')}</option>
        <option value="eu">{$t('rfqs.regions.europe.short')}</option>
        <option value="apac">{$t('rfqs.regions.apac.short')}</option>
      </select>
    </div>

    <div class="filter-group">
      <label for="rfq-sort">Sort</label>
      <select id="rfq-sort" bind:value={sortKey} aria-label="Sort RFQs">
        <option value="due_asc">Decision date · Soonest</option>
        <option value="due_desc">Decision date · Latest</option>
        <option value="budget_desc">Budget · High → Low</option>
        <option value="budget_asc">Budget · Low → High</option>
        <option value="status">Status</option>
        <option value="newest">Newest (approx.)</option>
      </select>
    </div>

    <div class="filter-group filter-group-wide">
      <label for="rfq-search">Search</label>
      <div class="search-wrap">
        <input
          id="rfq-search"
          class="search-input"
          placeholder="ID, title, process, region…"
          bind:value={query}
          aria-label="Search RFQs"
        />
        {#if query.trim()}
          <button type="button" class="search-clear" on:click={clearSearch} aria-label="Clear search">
            ✕
          </button>
        {/if}
      </div>
    </div>

    <div class="filter-note">
      {$t('rfqs.filters.note')}
    </div>
  </section>

  <!-- RFQ LIST -->
  <section class="rfqs-list" in:scale={{ duration: 300, delay: 300 }}>
    {#if loading}
      <div class="rfqs-skeleton">
        <div class="sk-head"></div>
        {#each Array(8) as _, i}
          <div class="sk-row" style={`animation-delay:${i * 90}ms`}>
            <div class="sk-cell sk-id"></div>
            <div class="sk-cell sk-title"></div>
            <div class="sk-cell sk-proc"></div>
            <div class="sk-cell sk-region"></div>
            <div class="sk-cell sk-budget"></div>
            <div class="sk-cell sk-status"></div>
            <div class="sk-cell sk-due"></div>
          </div>
        {/each}
      </div>
    {:else if totalResults === 0}
      <div class="rfqs-empty">
        {$t('rfqs.table.empty')}
      </div>
    {:else}
      <div class="rfqs-table">
        <div class="rfqs-row rfqs-row-head">
          <div>{$t('rfqs.table.headers.id')}</div>
          <div>{$t('rfqs.table.headers.title')}</div>
          <div>{$t('rfqs.table.headers.process')}</div>
          <div>{$t('rfqs.table.headers.region')}</div>
          <div>{$t('rfqs.table.headers.budget')}</div>
          <div>{$t('rfqs.table.headers.status')}</div>
          <div>{$t('rfqs.table.headers.decisionDate')}</div>
        </div>

        {#each pagedRfqs as r, i (r.id)}
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
              <span class={`badge ${statusClass(r.status)}`}>
                {$t(`rfqs.status.${r.status}`)}
              </span>
            </div>
            <div>{r.due}</div>
          </div>
        {/each}
      </div>

      <!-- Pagination Bar -->
      <div class="rfqs-pager">
        <div class="rfqs-pager-left">
          <span class="pager-meta">
            {totalResults} results · Page {pageIndex} / {totalPages}
          </span>
        </div>

        <div class="rfqs-pager-mid">
          <label for="page-size" class="pager-label">Rows</label>
          <select id="page-size" class="pager-select" bind:value={pageSize} aria-label="Page size">
            <option value={8}>8</option>
            <option value={10}>10</option>
            <option value={12}>12</option>
            <option value={20}>20</option>
          </select>
        </div>

        <div class="rfqs-pager-right">
          <button type="button" class="pager-btn" on:click={prevPage} disabled={pageIndex <= 1}>
            ← Prev
          </button>
          <button type="button" class="pager-btn pager-btn-primary" on:click={nextPage} disabled={pageIndex >= totalPages}>
            Next →
          </button>
        </div>
      </div>
    {/if}
  </section>

  <!-- BOTTOM CTA -->
  <section class="rfqs-final" in:fly={{ y: 8, duration: 260, delay: 260 }}>
    <h3>{$t('rfqs.final.title')}</h3>
    <p>{$t('rfqs.final.body')}</p>
    <div class="rfqs-final-cta-row">
      <a href="/rfqs/new" class="btn-primary" on:click={handlePrimaryCtaClick}>
        <span>{$t('rfqs.final.ctaPrimary')}</span>
        <span class="btn-arrow">→</span>
      </a>
      <a href="/how-it-works" class="btn-ghost">
        {$t('rfqs.final.ctaSecondary')}
      </a>
    </div>

    {#if pbReady}
      <div class="rfqs-footnote">
        <span class="rfqs-footnote-dot"></span>
        <span>Live updates enabled.</span>
      </div>
    {:else}
      <div class="rfqs-footnote rfqs-footnote-muted">
        <span class="rfqs-footnote-dot"></span>
        <span>Sample mode.</span>
      </div>
    {/if}
  </section>
</main>

<style>
  /* ─────────────────────────────────────────────
     기존 스타일 그대로 유지 + 아래에 “추가” 스타일만 더함
     (요청대로: 기존 스타일은 건드리지 않고 확장)
  ───────────────────────────────────────────── */

  /* 기존 스타일 그대로 유지 (생략 없이 전체) */
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

  /* REGION STRIP */

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

  /* FILTER BAR */

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

  /* RFQ LIST */

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

  /* BOTTOM CTA */

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

  /* ─────────────────────────────────────────────
     추가 스타일 (새 기능용) — 기존 스타일 “확장”
  ───────────────────────────────────────────── */
  .filter-group-wide {
    min-width: 240px;
    flex: 1.2;
  }

  .search-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-input {
    width: 100%;
    background: rgba(15, 23, 42, 0.95);
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.8);
    padding: 7px 34px 7px 12px;
    font-size: 12px;
    color: #e5e7eb;
    outline: none;
    transition: box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease;
  }

  .search-input:focus-visible {
    border-color: rgba(59, 130, 246, 0.9);
    box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.9);
    background: rgba(15, 23, 42, 0.98);
  }

  .search-clear {
    position: absolute;
    right: 10px;
    border: none;
    background: rgba(148, 163, 184, 0.14);
    color: #e5e7eb;
    width: 22px;
    height: 22px;
    border-radius: 999px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.15s ease, background 0.15s ease;
  }

  .search-clear:hover {
    background: rgba(148, 163, 184, 0.22);
    transform: translateY(-1px);
  }

  .rfqs-pager {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-top: 1px solid rgba(31, 41, 55, 1);
    background: rgba(15, 23, 42, 0.94);
    flex-wrap: wrap;
  }

  .pager-meta {
    font-size: 11px;
    color: #9ca3af;
  }

  .rfqs-pager-mid {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .pager-label {
    font-size: 11px;
    color: #9ca3af;
  }

  .pager-select {
    background: rgba(15, 23, 42, 0.95);
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.8);
    padding: 6px 10px;
    font-size: 12px;
    color: #e5e7eb;
    outline: none;
  }

  .rfqs-pager-right {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .pager-btn {
    border-radius: 999px;
    padding: 7px 12px;
    font-size: 12px;
    border: 1px solid rgba(148, 163, 184, 0.7);
    background: rgba(15, 23, 42, 0.96);
    color: #e5e7eb;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease, border-color 0.15s ease;
  }

  .pager-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    border-color: rgba(248, 250, 252, 0.75);
    box-shadow: 0 14px 28px rgba(15, 23, 42, 0.9);
  }

  .pager-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .pager-btn-primary {
    background: radial-gradient(circle at top, rgba(59, 130, 246, 0.22), rgba(15, 23, 42, 0.98));
    border-color: rgba(59, 130, 246, 0.75);
  }

  .rfqs-skeleton {
    padding: 14px 14px 18px;
  }

  .sk-head {
    height: 34px;
    border-radius: 12px;
    background: rgba(148, 163, 184, 0.10);
    border: 1px solid rgba(148, 163, 184, 0.14);
    margin-bottom: 10px;
    overflow: hidden;
    position: relative;
  }

  .sk-row {
    display: grid;
    grid-template-columns: 0.9fr 2.4fr 2fr 1.4fr 1.3fr 1.1fr 1.1fr;
    gap: 14px;
    padding: 12px 18px;
    border-top: 1px solid rgba(31, 41, 55, 1);
  }

  .sk-cell {
    height: 12px;
    border-radius: 999px;
    background: rgba(148, 163, 184, 0.10);
    border: 1px solid rgba(148, 163, 184, 0.12);
    position: relative;
    overflow: hidden;
    animation: skPulse 1.6s ease-in-out infinite;
  }

  .sk-cell::before,
  .sk-head::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(120deg, transparent, rgba(248, 250, 252, 0.18), transparent);
    transform: translateX(-100%);
    animation: shimmer 2.2s linear infinite;
    opacity: 0.9;
  }

  @keyframes skPulse {
    0% { opacity: 0.55; }
    50% { opacity: 0.95; }
    100% { opacity: 0.55; }
  }

  .rfqs-inline-alert {
    margin-top: 10px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: #cbd5f5;
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid rgba(59, 130, 246, 0.4);
    background: rgba(15, 23, 42, 0.92);
  }

  .rfqs-inline-alert-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: rgba(59, 130, 246, 0.9);
    box-shadow: 0 0 14px rgba(59, 130, 246, 0.8);
  }

  .rfqs-footnote {
    margin-top: 12px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: #9ca3af;
  }

  .rfqs-footnote-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: #22c55e;
    box-shadow: 0 0 12px rgba(34, 197, 94, 0.8);
  }

  .rfqs-footnote-muted .rfqs-footnote-dot {
    background: rgba(148, 163, 184, 0.65);
    box-shadow: none;
  }

  @media (max-width: 900px) {
    .sk-row { grid-template-columns: 1.1fr 2.4fr 1.8fr 1.6fr; }
    .sk-row .sk-cell:nth-child(n + 5) { display: none; }
  }

  @media (max-width: 640px) {
    .sk-row { grid-template-columns: 1.2fr 2.6fr 1.6fr; }
    .sk-row .sk-cell:nth-child(3) { display: none; }
  }
</style>
