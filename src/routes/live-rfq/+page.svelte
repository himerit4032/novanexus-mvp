<!-- src/routes/live-rfq/+page.svelte -->

<svelte:head>
  <title>{$t('nav.liveRFQs')} ▢ NovaNexus</title>
  <meta name="description" content="A real-time, anonymized window into production-grade RFQs moving through NovaNexus." />
</svelte:head>

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { fade, fly, scale } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { t } from 'svelte-i18n';

  // ─────────────────────────────────────────────
  // TYPES
  // ─────────────────────────────────────────────
  type RFQStatus = 'open' | 'inReview' | 'closed';
  type StatusFilter = 'all' | RFQStatus;

  type RegionFilter = 'all' | 'usa' | 'eu' | 'apac';
  type RegionKey = 'americas' | 'europe' | 'apac';

  type SortKey =
    | 'due_asc'
    | 'due_desc'
    | 'budget_desc'
    | 'budget_asc'
    | 'status'
    | 'newest';

  type RFQ = {
    id: string;
    title: string;
    buyer: string;
    process: string;
    region: string;
    budget: string;
    status: RFQStatus;
    due: string;
    dueTs?: number;
    budgetMid?: number;
  };

  type RegionStat = { rfqs: number; suppliers: number };

  type LiveEventType = 'rfq_created' | 'rfq_updated' | 'rfq_closed' | 'supplier_joined' | 'heartbeat';
  type LiveEvent = {
    ts: number;
    type: LiveEventType;
    title: string;
    meta?: string;
    regionKey?: RegionKey;
    rfqId?: string;
  };

  // ─────────────────────────────────────────────
  // DEMO DATA (fallback)
  // ─────────────────────────────────────────────
  const baseSupplierCounts: Record<RegionKey, number> = {
    americas: 132,
    europe: 96,
    apac: 118
  };

  const demoRfqs: RFQ[] = [
    { id: 'NN-24027', title: 'Aluminum cutting line for automotive profiles', buyer: 'Tier-1 EV supplier (US South)', process: 'Aluminum line · Hot saw + cooling table', region: 'USA / Alabama', budget: '$600k–$1.2M', status: 'open', due: '2026-03-10' },
    { id: 'NN-24018', title: 'Robotic packing cell for extrusion downstream', buyer: 'Extrusion plant (US West)', process: 'Automation · Robot + vision', region: 'USA / California', budget: '$400k–$800k', status: 'open', due: '2026-03-22' },
    { id: 'NN-24041', title: 'CNC machining cell for EV motor housings', buyer: 'EV components supplier (Germany)', process: 'CNC line · 5-axis machining + deburr', region: 'Germany', budget: '$900k–$1.6M', status: 'open', due: '2026-04-05' },
    { id: 'NN-24052', title: 'Press line upgrade for chassis stamping', buyer: 'Global automotive OEM (US Midwest)', process: 'Press line · 800–1,000T + coil feed', region: 'USA / Michigan', budget: '$1.4M–$2.3M', status: 'open', due: '2026-04-18' },
    { id: 'NN-24063', title: 'AS/RS warehouse for steel coils', buyer: 'Steel service center (Korea)', process: 'Warehouse · AS/RS + crane + WMS', region: 'Korea / Busan', budget: '$3.0M–$4.8M', status: 'open', due: '2026-05-02' },
    { id: 'NN-24075', title: 'Robotic palletizing for beverage line', buyer: 'Beverage bottling plant (Vietnam)', process: 'Robotics · Palletizer + conveyors', region: 'Vietnam / Ho Chi Minh City', budget: '$350k–$650k', status: 'inReview', due: '2025-04-29' },
    { id: 'NN-24092', title: 'Battery module assembly & end-of-line testing', buyer: 'EV battery OEM (US)', process: 'EV · Assembly + EOL test', region: 'USA / Texas', budget: '$4.0M–$6.5M', status: 'closed', due: '2025-05-30' },
    { id: 'NN-24103', title: 'Injection molding cell for medical disposables', buyer: 'Medical device supplier (Korea)', process: 'Plastics · IMM + robot take-out', region: 'Korea / Incheon', budget: '$700k–$1.1M', status: 'inReview', due: '2025-06-08' },
    { id: 'NN-24114', title: 'Clean-room assembly line for diagnostic kits', buyer: 'IVD manufacturer (Japan)', process: 'Clean-room · Assembly + packaging', region: 'Japan / Osaka', budget: '$1.2M–$2.0M', status: 'inReview', due: '2025-05-28' },
    { id: 'NN-24124', title: 'End-of-line case packing & stretch wrapping', buyer: 'Food & beverage plant (US East)', process: 'Packaging · Case packer + wrapper', region: 'USA / Georgia', budget: '$220k–$420k', status: 'inReview', due: '2025-05-03' },
    { id: 'NN-24136', title: 'Steel tube cutting & chamfering cell', buyer: 'Steel tube mill (Italy)', process: 'CNC · Saw + chamfer + deburr', region: 'Italy / Milan', budget: '$480k–$900k', status: 'closed', due: '2024-12-18' },
    { id: 'NN-23988', title: 'Legacy pallet racking retrofit', buyer: 'Regional 3PL operator (UK)', process: 'Racking · Selective + retrofit', region: 'United Kingdom', budget: '$180k–$320k', status: 'closed', due: '2024-11-30' }
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

  let statusFilter: StatusFilter = 'open';
  let regionFilter: RegionFilter = 'all';

  let query = '';
  let debouncedQuery = '';
  let sortKey: SortKey = 'due_asc';

  // select bind:value => string
  let pageSizeStr = '10';
  $: pageSize = Math.max(1, Number(pageSizeStr) || 10);
  let pageSize = 10;

  let pageIndex = 1;

  let filteredRfqs: RFQ[] = [];
  let pagedRfqs: RFQ[] = [];
  let totalPages = 1;
  let totalResults = 0;

  const baseRegionStats: Record<RegionKey, RegionStat> = {
    americas: { rfqs: 0, suppliers: baseSupplierCounts.americas },
    europe: { rfqs: 0, suppliers: baseSupplierCounts.europe },
    apac: { rfqs: 0, suppliers: baseSupplierCounts.apac }
  };
  let regionStats: Record<RegionKey, RegionStat> = { ...baseRegionStats };

  let loading = true;
  let loadError = '';
  let pbReady = false;

  let unsubRfqs: null | (() => void) = null;
  let unsubSuppliers: null | (() => void) = null;

  // Live feel (ticker + network)
  let livePulse = 0; // increments on events
  let liveEvents: LiveEvent[] = [];
  let tickerPaused = false;
  let lastUpdateTs = 0;
  let sampleMode = false;

  // raf for subtle scan shimmer / time-driven CSS vars
  let rafId: number | null = null;
  let nowMs = Date.now();

  // ─────────────────────────────────────────────
  // HELPERS
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
    const title = safeText(rec?.title ?? rec?.project_name, '');
    const buyerMasked = safeText(rec?.buyer_masked ?? rec?.buyer ?? rec?.company_name, 'Confidential buyer');
    const process = safeText(rec?.process ?? rec?.primary_process ?? rec?.process_focus, '');
    const region = safeText(rec?.region ?? rec?.region_preference, '');
    const budget =
      safeText(rec?.budget_label) ||
      safeText(rec?.budget_range) ||
      safeText(rec?.budget_range_label) ||
      safeText(rec?.budget) ||
      '';
    const status = normalizeStatus(rec?.status);
    const due = safeText(rec?.due ?? rec?.due_date ?? rec?.decision_date, '');

    const dueTs = parseDueTs(due);
    const budgetMid = parseBudgetMid(rec);

    return { id: code, title, buyer: buyerMasked, process, region, budget, status, due, dueTs, budgetMid };
  }

  function formatBudget(value: number): string {
    if (!value) return '$220k';
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    return `$${Math.round(value / 1_000)}k`;
  }

  function classifyRegion(label: string): RegionKey {
    const l = String(label || '').toLowerCase();
    if (
      l.includes('korea') || l.includes('japan') || l.includes('vietnam') || l.includes('thailand') ||
      l.includes('china') || l.includes('taiwan') || l.includes('singapore') || l.includes('malaysia') ||
      l.includes('indonesia') || l.includes('philippines') || l.includes('apac')
    ) return 'apac';

    if (
      l.includes('germany') || l.includes('france') || l.includes('italy') || l.includes('denmark') ||
      l.includes('netherlands') || l.includes('united kingdom') || l.includes('uk') || l.includes('spain') ||
      l.includes('poland') || l.includes('sweden') || l.includes('norway') || l.includes('europe') || l.includes('eu ')
    ) return 'europe';

    return 'americas';
  }

  function isUSARegion(region: string): boolean {
    const l = String(region || '').toLowerCase();
    if (l.includes('usa') || l.includes('united states')) return true;
    if (/\bus\b/.test(l)) return true;

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

  function statusOrder(s: RFQStatus): number {
    const order: Record<RFQStatus, number> = { open: 0, inReview: 1, closed: 2 };
    return order[s] ?? 9;
  }

  function clearSearch() {
    query = '';
  }
  function nextPage() {
    if (pageIndex < totalPages) pageIndex += 1;
  }
  function prevPage() {
    if (pageIndex > 1) pageIndex -= 1;
  }

  function relativeTime(ts: number): string {
    const diff = Math.max(0, nowMs - ts);
    if (diff < 1000) return 'just now';
    const s = Math.floor(diff / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    return `${h}h ago`;
  }

  function pushEvent(ev: LiveEvent) {
    lastUpdateTs = ev.ts;
    livePulse += 1;

    // Keep short + impactful list
    const next = [ev, ...liveEvents].slice(0, 14);
    liveEvents = next;

    // small animated "heartbeat"
    // (CSS reads livePulse via class toggle and also uses --pulse for glow)
  }

  function synthEventFromRFQ(r: RFQ, type: LiveEventType): LiveEvent {
    const regionKey = classifyRegion(r.region);
    if (type === 'rfq_created') {
      return { ts: Date.now(), type, title: `New RFQ: ${r.title}`, meta: `${r.region} · ${r.process}`, regionKey, rfqId: r.id };
    }
    if (type === 'rfq_closed') {
      return { ts: Date.now(), type, title: `RFQ closed: ${r.id}`, meta: `${r.region} · ${r.budget}`, regionKey, rfqId: r.id };
    }
    return { ts: Date.now(), type: 'rfq_updated', title: `RFQ updated: ${r.id}`, meta: `${r.region} · ${r.process}`, regionKey, rfqId: r.id };
  }

  /**
   * ✅ 공개 페이지에서 “Submit RFQ”는 로그인 필요
   * - 로그인 안 되어 있으면 /auth/login?next=/rfqs/new
   */
  async function handlePrimaryCtaClick(e: MouseEvent) {
    e.preventDefault();
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
      const next = encodeURIComponent('/rfqs/new');
      await goto(`/auth/login?next=${next}`);
    }
  }

  // ─────────────────────────────────────────────
  // Debounce search
  // ─────────────────────────────────────────────
  let qTimer: any = null;
  $: {
    clearTimeout(qTimer);
    qTimer = setTimeout(() => {
      debouncedQuery = query.trim().toLowerCase();
    }, 120);
  }

  // ─────────────────────────────────────────────
  // COMPUTE
  // ─────────────────────────────────────────────
  function recomputeView() {
    // source RFQs
    if (!rfqRecords || rfqRecords.length === 0) {
      hasLiveData = false;
      sampleMode = true;
      rfqs = demoRfqs.map((r) => ({ ...r, dueTs: parseDueTs(r.due), budgetMid: 0 }));
      liveCount = rfqs.filter((r) => r.status === 'open' || r.status === 'inReview').length;
      avgBudgetLabel = '$220k';
    } else {
      hasLiveData = true;
      sampleMode = false;
      rfqs = rfqRecords
        .slice()
        .map(mapRecordToRFQ)
        .sort((a, b) => (a.dueTs ?? 0) - (b.dueTs ?? 0));

      liveCount = rfqs.filter((r) => r.status === 'open' || r.status === 'inReview').length;

      const mids = rfqRecords.map((rec) => parseBudgetMid(rec)).filter((n) => Number.isFinite(n) && n > 0);
      if (mids.length) {
        const avg = mids.reduce((s, v) => s + v, 0) / mids.length;
        avgBudgetLabel = formatBudget(avg);
      } else {
        avgBudgetLabel = '$220k';
      }
    }

    vettedFactoriesLabel = supplierCount ? `${supplierCount}+` : '160+';

    // region stats
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

    // filter
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
        !debouncedQuery
          ? true
          : [r.id, r.title, r.buyer, r.process, r.region, r.budget, r.status].join(' ').toLowerCase().includes(debouncedQuery);

      return byStatus && byRegion && byQuery;
    });

    // sort
    filteredRfqs = filteredRfqs.slice().sort((a, b) => {
      if (sortKey === 'newest') return (b.dueTs ?? 0) - (a.dueTs ?? 0);
      if (sortKey === 'due_asc') return (a.dueTs ?? 0) - (b.dueTs ?? 0);
      if (sortKey === 'due_desc') return (b.dueTs ?? 0) - (a.dueTs ?? 0);
      if (sortKey === 'budget_desc') return (b.budgetMid ?? 0) - (a.budgetMid ?? 0);
      if (sortKey === 'budget_asc') return (a.budgetMid ?? 0) - (b.budgetMid ?? 0);
      if (sortKey === 'status') return statusOrder(a.status) - statusOrder(b.status);
      return 0;
    });

    // paging
    totalResults = filteredRfqs.length;
    totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
    if (pageIndex > totalPages) pageIndex = totalPages;
    if (pageIndex < 1) pageIndex = 1;

    const start = (pageIndex - 1) * pageSize;
    pagedRfqs = filteredRfqs.slice(start, start + pageSize);
  }

  $: recomputeView();

  // reset page on filter changes
  $: {
    const _ = `${statusFilter}|${regionFilter}|${sortKey}|${pageSize}|${debouncedQuery}`;
    if (pageIndex !== 1) pageIndex = 1;
  }

  // ─────────────────────────────────────────────
  // NETWORK MAP (simple deterministic positions)
  // ─────────────────────────────────────────────
  const nodes = [
    { key: 'americas' as RegionKey, x: 18, y: 58, labelKey: 'rfqs.regions.americas.label', shortKey: 'rfqs.regions.americas.short' },
    { key: 'europe' as RegionKey, x: 50, y: 34, labelKey: 'rfqs.regions.europe.label', shortKey: 'rfqs.regions.europe.short' },
    { key: 'apac' as RegionKey, x: 82, y: 58, labelKey: 'rfqs.regions.apac.label', shortKey: 'rfqs.regions.apac.short' }
  ];

  function trafficIntensity(key: RegionKey): number {
    // makes nodes "feel" alive based on rfqs volume + livePulse
    const base = regionStats?.[key]?.rfqs ?? 0;
    const p = (livePulse % 7) + 1;
    return Math.min(1, (base / 10) + (p / 30));
  }

  // ─────────────────────────────────────────────
  // INIT / REALTIME
  // ─────────────────────────────────────────────
  rfqRecords = [];
  supplierCount = 0;
  loading = true;
  loadError = '';

  let demoTickerTimer: any = null;

  function startDemoTicker() {
    // sample mode should still look alive
    clearInterval(demoTickerTimer);
    demoTickerTimer = setInterval(() => {
      if (tickerPaused) return;
      const r = rfqs[Math.floor(Math.random() * Math.max(1, rfqs.length))] ?? demoRfqs[0];
      const pick: LiveEventType[] = ['rfq_created','rfq_updated','supplier_joined','heartbeat'];
      const type = pick[Math.floor(Math.random() * pick.length)];
      if (type === 'supplier_joined') {
        const rk = classifyRegion(r.region);
        pushEvent({ ts: Date.now(), type, title: `Supplier joined network`, meta: `${rk.toUpperCase()} · vetted`, regionKey: rk });
        return;
      }
      if (type === 'heartbeat') {
        pushEvent({ ts: Date.now(), type, title: `Streaming RFQs`, meta: `anonymized · rotating`, regionKey: classifyRegion(r.region) });
        return;
      }
      pushEvent(synthEventFromRFQ(r, type));
    }, 1800);
  }

  onMount(async () => {
    if (!browser) return;

    // time-driven UI
    const loop = () => {
      nowMs = Date.now();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    loading = true;
    loadError = '';

    try {
      const mod = await import('$lib/pocketbase');
      const pb = mod.pb;
      pbReady = true;

      const [rfqList, supplierList] = await Promise.all([
        pb.collection('rfqs').getFullList({ sort: '-created', requestKey: 'rfqs-init-live' }),
        pb.collection('suppliers_factory').getFullList({ fields: 'id', requestKey: 'suppliers-init-live' })
      ]);

      rfqRecords = rfqList ?? [];
      supplierCount = (supplierList ?? []).length;

      // initial “boot” event
      pushEvent({
        ts: Date.now(),
        type: 'heartbeat',
        title: 'Live stream connected',
        meta: 'updates enabled · latency optimized',
        regionKey: 'americas'
      });

      await pb.collection('rfqs').subscribe('*', (e) => {
        try {
          if (e.action === 'create') {
            const exists = rfqRecords.some((r) => r.id === e.record.id);
            rfqRecords = exists ? rfqRecords : [e.record, ...rfqRecords];

            const mapped = mapRecordToRFQ(e.record);
            if (!tickerPaused) pushEvent(synthEventFromRFQ(mapped, 'rfq_created'));
          } else if (e.action === 'update') {
            rfqRecords = rfqRecords.map((r) => (r.id === e.record.id ? e.record : r));

            const mapped = mapRecordToRFQ(e.record);
            if (!tickerPaused) {
              const st = normalizeStatus(e.record?.status);
              if (st === 'closed') pushEvent(synthEventFromRFQ(mapped, 'rfq_closed'));
              else pushEvent(synthEventFromRFQ(mapped, 'rfq_updated'));
            }
          } else if (e.action === 'delete') {
            rfqRecords = rfqRecords.filter((r) => r.id !== e.record.id);
            if (!tickerPaused) {
              pushEvent({ ts: Date.now(), type: 'rfq_closed', title: `RFQ removed`, meta: `record deleted`, regionKey: 'europe' });
            }
          }
        } catch (err) {
          console.error('RFQ subscribe handler error:', err);
        }
      });

      unsubRfqs = () => {
        try { pb.collection('rfqs').unsubscribe('*'); } catch {}
      };

      await pb.collection('suppliers_factory').subscribe('*', (e) => {
        try {
          if (e.action === 'create') {
            supplierCount += 1;
            if (!tickerPaused) pushEvent({ ts: Date.now(), type: 'supplier_joined', title: `Supplier joined network`, meta: `verified · onboarded`, regionKey: 'apac' });
          } else if (e.action === 'delete') {
            supplierCount = Math.max(0, supplierCount - 1);
          }
        } catch (err) {
          console.error('Supplier subscribe handler error:', err);
        }
      });

      unsubSuppliers = () => {
        try { pb.collection('suppliers_factory').unsubscribe('*'); } catch {}
      };
    } catch (err: any) {
      console.error('PocketBase load failed, using demo RFQs instead.', err);
      pbReady = false;
      rfqRecords = [];
      supplierCount = 160;
      loadError = 'Live data temporarily unavailable. Showing sample RFQs.';
      pushEvent({ ts: Date.now(), type: 'heartbeat', title: 'Sample stream active', meta: 'visualization running · demo mode', regionKey: 'americas' });
      startDemoTicker();
    } finally {
      loading = false;
      if (!pbReady) startDemoTicker();
      if (pbReady) {
        // keep heartbeat alive lightly
        clearInterval(demoTickerTimer);
        demoTickerTimer = setInterval(() => {
          if (tickerPaused) return;
          pushEvent({ ts: Date.now(), type: 'heartbeat', title: 'Stream healthy', meta: 'rolling window · anonymized', regionKey: 'europe' });
        }, 9000);
      }
    }
  });

  onDestroy(() => {
    try {
      unsubRfqs?.();
      unsubSuppliers?.();
      clearTimeout(qTimer);
      clearInterval(demoTickerTimer);
      if (rafId) cancelAnimationFrame(rafId);
    } catch {}
  });

  function eventIcon(type: LiveEventType): string {
    if (type === 'rfq_created') return '◆';
    if (type === 'rfq_updated') return '◇';
    if (type === 'rfq_closed') return '■';
    if (type === 'supplier_joined') return '＋';
    return '●';
  }

  function eventTone(type: LiveEventType): string {
    if (type === 'rfq_created') return 'ev-new';
    if (type === 'rfq_updated') return 'ev-up';
    if (type === 'rfq_closed') return 'ev-close';
    if (type === 'supplier_joined') return 'ev-sup';
    return 'ev-hb';
  }

  function toggleTickerPause() {
    tickerPaused = !tickerPaused;
    pushEvent({
      ts: Date.now(),
      type: 'heartbeat',
      title: tickerPaused ? 'Ticker paused' : 'Ticker resumed',
      meta: tickerPaused ? 'visual freeze · data still updates' : 'visual live · event stream on',
      regionKey: 'americas'
    });
  }
</script>

<main class="rfqs-page" style={`--now:${nowMs}; --pulse:${livePulse}`}>
  <!-- TOP: Live Ops Header -->
  <section class="ops-header" in:fly={{ y: 10, duration: 360 }}>
    <div class="ops-bg"></div>

    <div class="ops-left">
      <div class="ops-badge" aria-label="Live stream status">
        <span class="ops-dot" class:ops-dot-live={pbReady}></span>
        <span class="ops-badge-text">{pbReady ? 'LIVE STREAM' : 'SAMPLE STREAM'}</span>
        <span class="ops-badge-sub">{pbReady ? 'real-time updates' : 'demo mode'}</span>
      </div>

      <h1 class="ops-title">
        Live RFQs
        <span class="ops-title-sub">
          a rotating, anonymized window into projects moving through NovaNexus
        </span>
      </h1>

      <div class="ops-explain">
        <div class="ex-chip">
          <span class="ex-chip-k">Why you see this</span>
          <span class="ex-chip-v">
            to prove throughput, quality, and decision timing — not just claims
          </span>
        </div>
        <div class="ex-chip">
          <span class="ex-chip-k">Privacy model</span>
          <span class="ex-chip-v">
            identifiers masked · details reduced to scope + region + range
          </span>
        </div>
      </div>
    </div>

    <div class="ops-right" in:fade={{ duration: 240, delay: 90 }}>
      <div class="ops-metrics">
        <div class="m-card">
          <div class="m-top">
            <div class="m-value">{liveCount}</div>
            <div class="m-label">active / in-review</div>
          </div>
          <div class="m-foot">live pipeline load</div>
        </div>

        <div class="m-card">
          <div class="m-top">
            <div class="m-value">{avgBudgetLabel}</div>
            <div class="m-label">typical value band</div>
          </div>
          <div class="m-foot">midpoint estimate</div>
        </div>

        <div class="m-card">
          <div class="m-top">
            <div class="m-value">{vettedFactoriesLabel}</div>
            <div class="m-label">vetted factories</div>
          </div>
          <div class="m-foot">network capacity</div>
        </div>
      </div>

      <div class="ops-meta">
        <div class="meta-row">
          <span class="meta-k">Last update</span>
          <span class="meta-v">{lastUpdateTs ? relativeTime(lastUpdateTs) : '—'}</span>
        </div>
        <div class="meta-row">
          <span class="meta-k">Mode</span>
          <span class="meta-v">{pbReady ? 'Realtime subscriptions' : 'Sample simulation'}</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Middle: Visualization Grid -->
  <section class="viz-grid" in:fade={{ duration: 260, delay: 120 }}>
    <!-- Activity Ticker -->
    <article class="card ticker" aria-label="Live activity ticker">
      <div class="card-head">
        <div class="card-title">
          <span class="card-title-dot"></span>
          Activity stream
          <span class="card-sub">what changed, in human language</span>
        </div>

        <div class="card-actions">
          <button class="btn-mini" type="button" on:click={toggleTickerPause} aria-pressed={tickerPaused}>
            {tickerPaused ? 'Resume' : 'Pause'}
          </button>
        </div>
      </div>

      <div class="ticker-body" on:mouseenter={() => (tickerPaused = true)} on:mouseleave={() => (tickerPaused = false)}>
        {#if liveEvents.length === 0}
          <div class="ticker-empty">Booting stream…</div>
        {:else}
          <div class="ticker-list" style={`--run:${tickerPaused ? 'paused' : 'running'}`}>
            {#each liveEvents as ev (ev.ts)}
              <div class={`tick ev ${eventTone(ev.type)}`}>
                <div class="tick-left">
                  <span class="tick-ic">{eventIcon(ev.type)}</span>
                  <span class="tick-title">{ev.title}</span>
                </div>
                <div class="tick-right">
                  <span class="tick-meta">{ev.meta}</span>
                  <span class="tick-time">{relativeTime(ev.ts)}</span>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <div class="ticker-foot">
        <span class="hint">Hover to freeze</span>
        <span class="sep">·</span>
        <span class="hint">Shows anonymized, high-signal deltas only</span>
      </div>
    </article>

    <!-- Region Network Map -->
    <article class="card network" aria-label="Global network map">
      <div class="card-head">
        <div class="card-title">
          <span class="card-title-dot"></span>
          Network topology
          <span class="card-sub">regions, capacity, throughput</span>
        </div>
      </div>

      <div class="network-body">
        <div class="map">
          <!-- links -->
          <div class="link l1"></div>
          <div class="link l2"></div>

          <!-- pulse beam -->
          <div class="beam"></div>

          {#each nodes as n (n.key)}
            <div
              class="node"
              style={`left:${n.x}%; top:${n.y}%; --int:${trafficIntensity(n.key)}`}
            >
              <div class="node-ring"></div>
              <div class="node-core"></div>
              <div class="node-label">
                <div class="nl-top">
                  <span class="nl-name">{$t(n.shortKey)}</span>
                  <span class="nl-badge">{regionStats[n.key].rfqs} RFQs</span>
                </div>
                <div class="nl-sub">{regionStats[n.key].suppliers} suppliers</div>
              </div>
            </div>
          {/each}

          <div class="grid-overlay"></div>
          <div class="noise-overlay"></div>
          <div class="scan-overlay"></div>
        </div>

        <div class="network-strip">
          {#each ['americas','europe','apac'] as key, i}
            <div class="strip-pill" style={`--d:${i}`}>
              <div class="sp-top">
                <span class="sp-k">{$t(`rfqs.regions.${key}.label`)}</span>
                <span class="sp-dot"></span>
              </div>
              <div class="sp-main">
                <span class="sp-n">{regionStats[key as any].suppliers}</span>
                <span class="sp-s">suppliers</span>
              </div>
              <div class="sp-sub">{regionStats[key as any].rfqs} sample RFQs</div>
            </div>
          {/each}
        </div>
      </div>
    </article>
  </section>

  <!-- Filters + Table -->
  <section class="rfqs-filters" in:fade={{ duration: 220, delay: 160 }}>
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
          <button type="button" class="search-clear" on:click={clearSearch} aria-label="Clear search">✕</button>
        {/if}
      </div>
    </div>

    <div class="filter-note">
      {$t('rfqs.filters.note')}
    </div>
  </section>

  <section class="rfqs-list" in:scale={{ duration: 260, delay: 180 }}>
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
      <div class="rfqs-table" role="table" aria-label="RFQs">
        <div class="rfqs-row rfqs-row-head" role="row">
          <div role="columnheader">{$t('rfqs.table.headers.id')}</div>
          <div role="columnheader">{$t('rfqs.table.headers.title')}</div>
          <div role="columnheader">{$t('rfqs.table.headers.process')}</div>
          <div role="columnheader">{$t('rfqs.table.headers.region')}</div>
          <div role="columnheader">{$t('rfqs.table.headers.budget')}</div>
          <div role="columnheader">{$t('rfqs.table.headers.status')}</div>
          <div role="columnheader">{$t('rfqs.table.headers.decisionDate')}</div>
        </div>

        {#each pagedRfqs as r, i (r.id)}
          <div class="rfqs-row" role="row" in:fade={{ duration: 180, delay: 20 + i * 14 }} animate:flip={{ duration: 220 }}>
            <div class="rfqs-cell-id" role="cell">{r.id}</div>

            <div class="rfqs-cell-title" role="cell">
              <div class="rfqs-title-main">{r.title}</div>
              <div class="rfqs-title-sub">{r.buyer}</div>
            </div>

            <div class="rfqs-cell-process" role="cell">{r.process}</div>
            <div role="cell" class="rfqs-cell-region">{r.region}</div>
            <div role="cell" class="rfqs-cell-budget">{r.budget}</div>

            <div role="cell">
              <span class={`badge ${statusClass(r.status)}`}>
                {$t(`rfqs.status.${r.status}`)}
              </span>
            </div>

            <div role="cell" class="rfqs-cell-due">{r.due}</div>
          </div>
        {/each}
      </div>

      <div class="rfqs-pager">
        <div class="rfqs-pager-left">
          <span class="pager-meta">{totalResults} results · Page {pageIndex} / {totalPages}</span>
        </div>

        <div class="rfqs-pager-mid">
          <label for="page-size" class="pager-label">Rows</label>
          <select id="page-size" class="pager-select" bind:value={pageSizeStr} aria-label="Page size">
            <option value="8">8</option>
            <option value="10">10</option>
            <option value="12">12</option>
            <option value="20">20</option>
          </select>
        </div>

        <div class="rfqs-pager-right">
          <button type="button" class="pager-btn" on:click={prevPage} disabled={pageIndex <= 1}>← Prev</button>
          <button type="button" class="pager-btn pager-btn-primary" on:click={nextPage} disabled={pageIndex >= totalPages}>Next →</button>
        </div>
      </div>
    {/if}
  </section>

  <!-- Bottom CTA -->
  <section class="rfqs-final" in:fly={{ y: 8, duration: 240, delay: 200 }}>
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

    <div class={`rfqs-footnote ${pbReady ? '' : 'rfqs-footnote-muted'}`}>
      <span class="rfqs-footnote-dot"></span>
      <span>{pbReady ? 'Live updates enabled.' : 'Sample mode.'}</span>
    </div>
  </section>
</main>

<style>
  :global(:root) {
    --bg0: #040611;
    --bg1: #050817;
    --bg2: rgba(255,255,255,0.06);
    --bg3: rgba(255,255,255,0.085);
    --stroke: rgba(255,255,255,0.10);
    --stroke2: rgba(255,255,255,0.14);
    --txt: rgba(255,255,255,0.92);
    --muted: rgba(255,255,255,0.62);
    --muted2: rgba(255,255,255,0.46);
    --shadow: 0 18px 60px rgba(0,0,0,0.60);
    --shadow2: 0 10px 30px rgba(0,0,0,0.40);
    --r16: 16px;
    --r20: 20px;
    --r24: 24px;
    --max: 1220px;
    --pad: clamp(16px, 3vw, 28px);
  }

  /* PAGE BACKDROP: grid + glow + noise */
  .rfqs-page {
    min-height: 100vh;
    color: var(--txt);
    padding: calc(var(--pad) + 14px) var(--pad) 80px;
    background:
      radial-gradient(1100px 720px at 8% 0%, rgba(90, 255, 255, 0.14), transparent 58%),
      radial-gradient(900px 620px at 92% 8%, rgba(167, 139, 250, 0.15), transparent 55%),
      radial-gradient(900px 620px at 55% 120%, rgba(90, 255, 255, 0.07), transparent 60%),
      linear-gradient(180deg, var(--bg0), var(--bg1));
    position: relative;
    overflow-x: clip;
  }

  .rfqs-page::before {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    opacity: 0.35;
    background:
      linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
    background-size: 64px 64px;
    mask-image: radial-gradient(circle at 40% 20%, black 0%, transparent 65%);
  }

  .rfqs-page::after {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    opacity: 0.12;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='.45'/%3E%3C/svg%3E");
    mix-blend-mode: overlay;
  }

  /* OPS HEADER */
  .ops-header {
    max-width: var(--max);
    margin: 0 auto 14px;
    border-radius: var(--r24);
    border: 1px solid var(--stroke);
    background: linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03));
    box-shadow: var(--shadow);
    overflow: hidden;
    position: relative;
    display: grid;
    grid-template-columns: 1.35fr 0.65fr;
    gap: 16px;
    padding: clamp(18px, 3vw, 26px);
  }

  .ops-bg {
    position: absolute;
    inset: -45%;
    background:
      radial-gradient(circle at 18% 20%, rgba(90, 255, 255, 0.18), transparent 42%),
      radial-gradient(circle at 70% 35%, rgba(167, 139, 250, 0.16), transparent 45%),
      radial-gradient(circle at 42% 80%, rgba(90, 255, 255, 0.10), transparent 52%);
    filter: blur(14px);
    opacity: 0.9;
    pointer-events: none;
    transform: translateZ(0);
    animation: drift 14s ease-in-out infinite alternate;
  }

  .ops-left, .ops-right { position: relative; z-index: 1; }

  .ops-badge {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    border-radius: 999px;
    border: 1px solid var(--stroke);
    background: rgba(0,0,0,0.32);
    color: rgba(255,255,255,0.82);
    width: fit-content;
  }

  .ops-dot {
    width: 9px;
    height: 9px;
    border-radius: 999px;
    background: rgba(255,255,255,0.30);
  }
  .ops-dot-live {
    background: rgba(46, 204, 113, 1);
    box-shadow:
      0 0 18px rgba(46, 204, 113, 0.75),
      0 0 42px rgba(46, 204, 113, 0.25);
    animation: pulse 1.35s ease-in-out infinite;
  }

  .ops-badge-text {
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 700;
  }
  .ops-badge-sub {
    font-size: 12px;
    color: var(--muted);
  }

  .ops-title {
    margin: 10px 0 10px;
    font-size: clamp(32px, 4.6vw, 56px);
    line-height: 1.02;
    letter-spacing: -0.03em;
  }

  .ops-title-sub {
    display: block;
    margin-top: 10px;
    font-size: 14px;
    color: var(--muted);
    letter-spacing: 0;
    line-height: 1.6;
    max-width: 70ch;
  }

  .ops-explain {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 14px;
  }

  .ex-chip {
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(0,0,0,0.18);
    padding: 10px 12px;
  }

  .ex-chip-k {
    display: block;
    font-size: 12px;
    color: rgba(255,255,255,0.80);
    font-weight: 650;
    margin-bottom: 4px;
  }

  .ex-chip-v {
    display: block;
    font-size: 12.5px;
    color: var(--muted);
    line-height: 1.55;
  }

  .ops-metrics {
    display: grid;
    gap: 10px;
  }

  .m-card {
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.10);
    background: rgba(0,0,0,0.22);
    box-shadow: var(--shadow2);
    padding: 12px 12px;
    position: relative;
    overflow: hidden;
  }

  .m-card::before {
    content: "";
    position: absolute;
    inset: -30%;
    background:
      radial-gradient(circle at 20% 30%, rgba(90, 255, 255, 0.12), transparent 55%),
      radial-gradient(circle at 70% 70%, rgba(167, 139, 250, 0.12), transparent 58%);
    filter: blur(16px);
    opacity: 0.85;
    pointer-events: none;
    transform: translateZ(0);
  }

  .m-top { position: relative; z-index: 1; display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
  .m-value { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; }
  .m-label { font-size: 12px; color: var(--muted); }
  .m-foot { position: relative; z-index: 1; margin-top: 6px; font-size: 12px; color: var(--muted2); }

  .ops-meta {
    margin-top: 10px;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.10);
    background: rgba(0,0,0,0.18);
    padding: 10px 12px;
  }

  .meta-row { display: flex; justify-content: space-between; gap: 10px; font-size: 12px; padding: 4px 0; }
  .meta-k { color: var(--muted2); }
  .meta-v { color: rgba(255,255,255,0.78); }

  /* VIZ GRID */
  .viz-grid {
    max-width: var(--max);
    margin: 0 auto 12px;
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 12px;
  }

  .card {
    border-radius: var(--r24);
    border: 1px solid var(--stroke);
    background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.025));
    box-shadow: var(--shadow);
    overflow: hidden;
    position: relative;
  }

  .card-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: rgba(0,0,0,0.18);
  }

  .card-title {
    display: flex;
    align-items: baseline;
    gap: 10px;
    font-weight: 750;
    letter-spacing: -0.01em;
  }

  .card-title-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: rgba(90, 255, 255, 0.85);
    box-shadow: 0 0 18px rgba(90, 255, 255, 0.35);
  }

  .card-sub {
    font-size: 12px;
    color: var(--muted);
    font-weight: 500;
  }

  .card-actions { display: inline-flex; align-items: center; gap: 8px; }

  .btn-mini {
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.82);
    padding: 7px 10px;
    font-size: 12px;
    cursor: pointer;
    transition: transform .14s ease, background .14s ease, border-color .14s ease, opacity .14s ease;
  }
  .btn-mini:hover { transform: translateY(-1px); background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.18); }

  /* TICKER */
  .ticker-body {
    padding: 10px 12px 12px;
    min-height: 210px;
  }

  .ticker-empty {
    color: var(--muted);
    font-size: 13px;
    padding: 14px 4px;
  }

  .ticker-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .tick {
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(0,0,0,0.18);
    padding: 10px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    position: relative;
    overflow: hidden;
  }

  .tick::before {
    content: "";
    position: absolute;
    inset: -60% -20% auto auto;
    width: 220px;
    height: 220px;
    background:
      radial-gradient(circle at 20% 30%, rgba(90, 255, 255, 0.10), transparent 55%),
      radial-gradient(circle at 70% 70%, rgba(167, 139, 250, 0.10), transparent 58%);
    filter: blur(16px);
    opacity: 0.9;
    pointer-events: none;
  }

  .tick-left, .tick-right { position: relative; z-index: 1; display: inline-flex; align-items: center; gap: 10px; }
  .tick-right { gap: 12px; justify-content: end; text-align: right; }

  .tick-ic {
    width: 22px;
    height: 22px;
    border-radius: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255,255,255,0.10);
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.80);
    font-size: 12px;
    flex: 0 0 auto;
  }

  .tick-title {
    font-size: 13px;
    font-weight: 650;
    color: rgba(255,255,255,0.86);
    line-height: 1.25;
  }

  .tick-meta {
    font-size: 12px;
    color: var(--muted);
    max-width: 38ch;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tick-time {
    font-size: 12px;
    color: var(--muted2);
    white-space: nowrap;
  }

  .ev-new { border-color: rgba(46, 204, 113, 0.22); }
  .ev-up { border-color: rgba(90, 255, 255, 0.18); }
  .ev-close { border-color: rgba(231, 76, 60, 0.22); }
  .ev-sup { border-color: rgba(167, 139, 250, 0.22); }
  .ev-hb { border-color: rgba(255,255,255,0.10); }

  .ticker-foot {
    padding: 10px 14px 12px;
    border-top: 1px solid rgba(255,255,255,0.06);
    background: rgba(0,0,0,0.14);
    color: var(--muted2);
    font-size: 12px;
    display: inline-flex;
    gap: 8px;
    align-items: center;
  }
  .sep { opacity: 0.55; }

  /* NETWORK MAP */
  .network-body { padding: 12px; }

  .map {
    position: relative;
    height: 260px;
    border-radius: 22px;
    border: 1px solid rgba(255,255,255,0.08);
    background:
      radial-gradient(circle at 20% 30%, rgba(90, 255, 255, 0.08), transparent 55%),
      radial-gradient(circle at 70% 70%, rgba(167, 139, 250, 0.08), transparent 58%),
      rgba(0,0,0,0.22);
    overflow: hidden;
    box-shadow: var(--shadow2);
  }

  .grid-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.22;
    background:
      linear-gradient(rgba(255,255,255,0.10) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.10) 1px, transparent 1px);
    background-size: 52px 52px;
    mask-image: radial-gradient(circle at 50% 50%, black 0%, transparent 70%);
  }

  .noise-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.14;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='.45'/%3E%3C/svg%3E");
    mix-blend-mode: overlay;
  }

  .scan-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.22;
    background: linear-gradient(transparent, rgba(255,255,255,0.08), transparent);
    height: 140%;
    transform: translateY(calc((var(--now) * 0.02px) % 240px - 120px));
    filter: blur(0.2px);
  }

  .link {
    position: absolute;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(90, 255, 255, 0.40), transparent);
    opacity: 0.85;
    transform-origin: left center;
  }
  .l1 { left: 18%; top: 58%; width: 38%; transform: rotate(-18deg); }
  .l2 { left: 50%; top: 34%; width: 38%; transform: rotate(18deg); }

  .beam {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(circle at 50% 50%, rgba(90, 255, 255, 0.08), transparent 60%);
    opacity: calc(0.35 + (var(--pulse) % 3) * 0.07);
    filter: blur(10px);
    transition: opacity .2s ease;
  }

  .node {
    position: absolute;
    transform: translate(-50%, -50%);
  }

  .node-ring {
    width: 22px;
    height: 22px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.16);
    background: rgba(255,255,255,0.05);
    box-shadow: 0 0 0 0 rgba(90, 255, 255, 0.0);
    animation: nodePulse 1.9s ease-in-out infinite;
    opacity: calc(0.65 + var(--int) * 0.35);
  }

  .node-core {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 9px;
    height: 9px;
    transform: translate(-50%, -50%);
    border-radius: 999px;
    background: rgba(90, 255, 255, 0.95);
    box-shadow:
      0 0 22px rgba(90, 255, 255, 0.55),
      0 0 44px rgba(167, 139, 250, 0.20);
    opacity: calc(0.75 + var(--int) * 0.25);
  }

  .node-label {
    margin-top: 10px;
    min-width: 160px;
    transform: translateX(-50%);
    position: absolute;
    left: 50%;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(0,0,0,0.22);
    padding: 8px 10px;
    box-shadow: var(--shadow2);
  }

  .nl-top { display: flex; justify-content: space-between; gap: 10px; align-items: center; }
  .nl-name { font-size: 12px; color: rgba(255,255,255,0.82); font-weight: 700; }
  .nl-badge {
    font-size: 11px;
    color: rgba(255,255,255,0.72);
    border: 1px solid rgba(255,255,255,0.10);
    padding: 4px 8px;
    border-radius: 999px;
    background: rgba(255,255,255,0.05);
  }
  .nl-sub { margin-top: 6px; font-size: 12px; color: var(--muted); }

  .network-strip {
    margin-top: 12px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .strip-pill {
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(0,0,0,0.18);
    padding: 10px 10px;
    position: relative;
    overflow: hidden;
  }
  .strip-pill::before {
    content: "";
    position: absolute;
    inset: -60% -20% auto auto;
    width: 220px;
    height: 220px;
    background:
      radial-gradient(circle at 20% 30%, rgba(90, 255, 255, 0.10), transparent 55%),
      radial-gradient(circle at 70% 70%, rgba(167, 139, 250, 0.10), transparent 58%);
    filter: blur(16px);
    opacity: 0.9;
    pointer-events: none;
  }

  .sp-top { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: center; }
  .sp-k { font-size: 12px; color: rgba(255,255,255,0.82); font-weight: 700; }
  .sp-dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: rgba(90, 255, 255, 0.9);
    box-shadow: 0 0 16px rgba(90, 255, 255, 0.35);
    opacity: 0.85;
  }
  .sp-main { position: relative; z-index: 1; margin-top: 8px; display: flex; gap: 8px; align-items: baseline; }
  .sp-n { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; }
  .sp-s { font-size: 12px; color: var(--muted2); }
  .sp-sub { position: relative; z-index: 1; margin-top: 6px; font-size: 12px; color: var(--muted); }

  /* FILTERS (sticky) */
  .rfqs-filters {
    max-width: var(--max);
    margin: 12px auto 10px;
    border-radius: var(--r20);
    border: 1px solid var(--stroke);
    background: rgba(0,0,0,0.22);
    box-shadow: var(--shadow2);
    padding: 12px 12px;
    display: grid;
    grid-template-columns: 160px 160px 220px 1fr;
    gap: 12px;
    align-items: end;
    position: sticky;
    top: 12px;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    z-index: 20;
  }

  .filter-group { display: flex; flex-direction: column; gap: 6px; }
  .filter-group-wide { min-width: 260px; }

  .filter-group label { font-size: 12px; color: var(--muted); }

  .filter-group select, .search-input, .pager-select {
    border-radius: 12px;
    border: 1px solid var(--stroke);
    background: rgba(15, 23, 42, 0.70);
    color: var(--txt);
    padding: 10px 10px;
    font-size: 13px;
    outline: none;
    transition: border-color .14s ease, box-shadow .14s ease, background .14s ease;
  }

  .filter-group select:focus-visible, .search-input:focus-visible, .pager-select:focus-visible {
    border-color: rgba(90, 255, 255, 0.52);
    box-shadow: 0 0 0 1px rgba(90, 255, 255, 0.52);
    background: rgba(15, 23, 42, 0.84);
  }

  .search-wrap { position: relative; display: flex; align-items: center; }
  .search-input { width: 100%; padding-right: 36px; }

  .search-clear {
    position: absolute;
    right: 8px;
    height: 26px;
    width: 26px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.75);
    cursor: pointer;
    transition: transform .14s ease, background .14s ease, border-color .14s ease;
  }

  .search-clear:hover { transform: translateY(-1px); background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.18); }

  .filter-note {
    grid-column: 1 / -1;
    margin-top: -2px;
    font-size: 12px;
    color: var(--muted2);
    padding-left: 2px;
  }

  /* LIST */
  .rfqs-list {
    max-width: var(--max);
    margin: 12px auto 0;
    border-radius: var(--r24);
    border: 1px solid var(--stroke);
    background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
    box-shadow: var(--shadow);
    overflow: hidden;
  }

  .rfqs-row {
    display: grid;
    grid-template-columns: 120px 2.3fr 1.6fr 1.2fr 1fr 0.9fr 0.9fr;
    gap: 12px;
    padding: 14px 16px;
    align-items: center;
    border-top: 1px solid rgba(255,255,255,0.06);
  }

  .rfqs-row-head {
    border-top: none;
    background: rgba(0,0,0,0.20);
    color: var(--muted);
    font-size: 12px;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    padding-top: 12px;
    padding-bottom: 12px;
  }

  .rfqs-row:not(.rfqs-row-head):hover { background: rgba(255,255,255,0.03); }

  .rfqs-cell-id {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono','Courier New', monospace;
    font-size: 12px;
    color: rgba(255,255,255,0.78);
  }

  .rfqs-cell-title { display: flex; flex-direction: column; gap: 4px; }
  .rfqs-title-main { font-weight: 700; letter-spacing: -0.01em; line-height: 1.25; }
  .rfqs-title-sub { font-size: 12px; color: var(--muted); }

  .rfqs-cell-process, .rfqs-cell-region, .rfqs-cell-budget, .rfqs-cell-due {
    font-size: 13px;
    color: rgba(255,255,255,0.78);
    line-height: 1.35;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    border: 1px solid rgba(255,255,255,0.10);
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.82);
    width: fit-content;
  }
  .badge-open { border-color: rgba(46, 204, 113, 0.40); background: rgba(46, 204, 113, 0.12); }
  .badge-in-review { border-color: rgba(241, 196, 15, 0.40); background: rgba(241, 196, 15, 0.12); }
  .badge-closed { border-color: rgba(231, 76, 60, 0.40); background: rgba(231, 76, 60, 0.12); color: rgba(255,255,255,0.72); }

  /* SKELETON */
  .rfqs-skeleton { padding: 14px 16px 16px; }
  .sk-head {
    height: 34px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.06);
    background: linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.10), rgba(255,255,255,0.05));
    background-size: 220% 100%;
    animation: shimmer 1.2s linear infinite;
    margin-bottom: 10px;
  }
  .sk-row {
    display: grid;
    grid-template-columns: 120px 2.3fr 1.6fr 1.2fr 1fr 0.9fr 0.9fr;
    gap: 12px;
    padding: 14px 0;
    border-top: 1px solid rgba(255,255,255,0.05);
  }
  .sk-cell {
    height: 12px;
    border-radius: 10px;
    background: linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.10), rgba(255,255,255,0.04));
    background-size: 220% 100%;
    animation: shimmer 1.2s linear infinite;
  }
  .sk-id { width: 88px; }
  .sk-title { width: 100%; height: 14px; }
  .sk-proc { width: 95%; }
  .sk-region { width: 80%; }
  .sk-budget { width: 70%; }
  .sk-status { width: 72px; height: 18px; border-radius: 999px; }
  .sk-due { width: 86px; }

  .rfqs-empty { padding: 28px 16px; text-align: center; color: var(--muted); font-size: 14px; }

  /* PAGER */
  .rfqs-pager {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 12px;
    align-items: center;
    padding: 14px 16px;
    border-top: 1px solid rgba(255,255,255,0.07);
    background: rgba(0,0,0,0.18);
  }
  .pager-meta { font-size: 12px; color: var(--muted); }
  .rfqs-pager-mid { display: inline-flex; align-items: center; gap: 8px; }
  .pager-label { font-size: 12px; color: var(--muted); }

  .rfqs-pager-right { display: inline-flex; justify-content: end; gap: 10px; }
  .pager-btn {
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.85);
    padding: 9px 14px;
    font-size: 13px;
    cursor: pointer;
    transition: transform .14s ease, background .14s ease, border-color .14s ease, opacity .14s ease;
  }
  .pager-btn:hover:enabled { transform: translateY(-1px); background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.18); }
  .pager-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .pager-btn-primary { border-color: rgba(90, 255, 255, 0.30); background: rgba(90, 255, 255, 0.10); }

  /* FINAL CTA */
  .rfqs-final {
    max-width: var(--max);
    margin: 14px auto 0;
    border-radius: var(--r24);
    border: 1px solid rgba(255,255,255,0.10);
    background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03));
    box-shadow: var(--shadow);
    padding: 18px 18px;
    position: relative;
    overflow: hidden;
  }

  .rfqs-final h3 { margin: 0 0 6px; font-size: 18px; letter-spacing: -0.01em; }
  .rfqs-final p { margin: 0 0 14px; color: var(--muted); line-height: 1.6; font-size: 13.5px; max-width: 72ch; }

  .rfqs-final-cta-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 999px;
    text-decoration: none;
    color: rgba(255,255,255,0.92);
    border: 1px solid rgba(90, 255, 255, 0.30);
    background: linear-gradient(135deg, rgba(90, 255, 255, 0.18), rgba(167, 139, 250, 0.16));
    box-shadow: 0 16px 50px rgba(0,0,0,0.45);
    transition: transform .14s ease, box-shadow .14s ease, border-color .14s ease;
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 22px 64px rgba(0,0,0,0.55); border-color: rgba(90, 255, 255, 0.48); }
  .btn-arrow { opacity: 0.85; }

  .btn-ghost {
    display: inline-flex;
    align-items: center;
    padding: 10px 14px;
    border-radius: 999px;
    text-decoration: none;
    color: var(--muted);
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.05);
    transition: transform .14s ease, background .14s ease, border-color .14s ease, color .14s ease;
  }
  .btn-ghost:hover { transform: translateY(-1px); background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.18); color: rgba(255,255,255,0.82); }

  .rfqs-footnote {
    margin-top: 12px;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: rgba(255,255,255,0.78);
    font-size: 12px;
  }
  .rfqs-footnote-muted { color: var(--muted2); }
  .rfqs-footnote-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: rgba(46, 204, 113, 1);
    box-shadow: 0 0 16px rgba(46, 204, 113, 0.6);
  }
  .rfqs-footnote-muted .rfqs-footnote-dot { background: rgba(255,255,255,0.26); box-shadow: none; }

  /* RESPONSIVE */
  @media (max-width: 1040px) {
    .ops-header { grid-template-columns: 1fr; }
    .ops-explain { grid-template-columns: 1fr; }
    .viz-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 980px) {
    .rfqs-filters { grid-template-columns: 1fr 1fr; }
    .filter-group-wide { grid-column: 1 / -1; }
    .network-strip { grid-template-columns: 1fr; }
  }

  @media (max-width: 860px) {
    .rfqs-row, .sk-row { grid-template-columns: 1fr; gap: 10px; }
    .rfqs-row-head { display: none; }
    .rfqs-row:not(.rfqs-row-head) {
      margin: 12px 12px;
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(0,0,0,0.18);
    }
    .rfqs-row:not(.rfqs-row-head):hover { background: rgba(0,0,0,0.22); }
    .rfqs-pager { grid-template-columns: 1fr; gap: 10px; }
    .rfqs-pager-right { justify-content: start; }
    .ticker-body { min-height: 240px; }
    .tick { flex-direction: column; align-items: flex-start; }
    .tick-right { width: 100%; justify-content: space-between; }
    .tick-meta { max-width: 100%; white-space: normal; }
  }

  /* KEYFRAMES */
  @keyframes shimmer { 0% { background-position: 0% 0; } 100% { background-position: 220% 0; } }
  @keyframes drift { 0% { transform: translate3d(0,0,0); } 100% { transform: translate3d(-18px, 10px, 0); } }
  @keyframes pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.22); opacity: 0.75; } }

  @keyframes nodePulse {
    0% { box-shadow: 0 0 0 0 rgba(90,255,255,0.0); transform: scale(1); }
    55% { box-shadow: 0 0 0 14px rgba(90,255,255,0.08); transform: scale(1.06); }
    100% { box-shadow: 0 0 0 0 rgba(90,255,255,0.0); transform: scale(1); }
  }

  /* Motion preference */
  @media (prefers-reduced-motion: reduce) {
    .ops-bg, .ops-dot-live, .node-ring { animation: none !important; }
    .scan-overlay { display: none; }
  }
</style>
