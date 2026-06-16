<!-- src/routes/ai-intake/+page.svelte -->

<svelte:head>
  <title>AI RFQ Check ▢ NovaNexus</title>
</svelte:head>

<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly, scale } from 'svelte/transition';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  // ✅ 트라이얼 기간: 한 곳에서만 관리
  const TRIAL_DAYS = 7;

  // ─────────────────────────────────────────────
  // Pro-grade upload policy (San Jose-level UX/guardrails)
  // ─────────────────────────────────────────────
  const MAX_FILES = 10;
  const MAX_FILE_MB = 80; // per file
  const MAX_TOTAL_MB = 300; // total
  const MAX_FILE_SIZE = MAX_FILE_MB * 1024 * 1024;
  const MAX_TOTAL_SIZE = MAX_TOTAL_MB * 1024 * 1024;

  // CAD/도면/문서 실무에서 흔한 포맷 범위 (필요 시 축소/확대)
  const ALLOWED_EXT = new Set([
    'pdf',
    'png',
    'jpg',
    'jpeg',
    'webp',
    'tif',
    'tiff',
    'dwg',
    'dxf',
    'step',
    'stp',
    'iges',
    'igs',
    'stl',
    'obj',
    'zip',
    '7z',
    'rar'
  ]);

  const ACCEPT_ATTR =
    '.pdf,.png,.jpg,.jpeg,.webp,.tif,.tiff,.dwg,.dxf,.step,.stp,.iges,.igs,.stl,.obj,.zip,.7z,.rar';

  const extOf = (name: string) => (name.split('.').pop() || '').toLowerCase();
  const fileKey = (f: File) => `${f.name}__${f.size}__${f.lastModified}`;

  // ApexCharts (client-side only)
  let ApexCharts: any = null;
  let chartsReady = false;

  type Analysis = {
    certMapping: {
      input: string;
      normalized: string;
      relevantProcesses: string[];
      regionNotes: string;
    }[];
    matchScore: {
      overall: number;
      processFit: number;
      regionFit: number;
      certificationFit: number;
    };
    quoteEstimate: {
      currency: 'USD' | 'EUR' | 'KRW';
      low: number;
      high: number;
      confidence: number; // 0–1
    };
    risks: {
      level: 'low' | 'medium' | 'high';
      label: string;
      detail: string;
    }[];
    notes: string[];
  };

  // ───── Form state ─────
  let projectName = '';
  let description = '';
  let targetRegion: 'US' | 'EU' | 'KR_APAC' = 'US';
  let annualVolumeBand: 'low' | 'mid' | 'high' = 'low';
  let complexityBand: 'simple' | 'medium' | 'complex' = 'simple';
  let certifications = '';

  // ✅ 기존 FileList 기반 -> Pro-grade File[] 기반
  let drawingsFiles: File[] = [];
  let drawingsError = '';
  let isDragging = false;
  let fileInputEl: HTMLInputElement | null = null;

  let loading = false;
  let errorMsg = '';
  let analysis: Analysis | null = null;

  // Upload progress (XHR)
  let uploadPct = 0;

  // monetisation tier
  let accessTier: 'free' | 'trial' | 'pro' = 'free';

  // ───── Match score tweens ─────
  const overallTween = tweened(0, { duration: 650, easing: cubicOut });
  const processTween = tweened(0, { duration: 650, easing: cubicOut });
  const regionTween = tweened(0, { duration: 650, easing: cubicOut });
  const certTween = tweened(0, { duration: 650, easing: cubicOut });

  $: if (analysis) {
    overallTween.set(analysis.matchScore.overall);
    processTween.set(analysis.matchScore.processFit);
    regionTween.set(analysis.matchScore.regionFit);
    certTween.set(analysis.matchScore.certificationFit);
  } else {
    overallTween.set(0);
    processTween.set(0);
    regionTween.set(0);
    certTween.set(0);
  }

  // ───── Hero stats tweens ─────
  const rfqsTween = tweened(0, { duration: 900, easing: cubicOut });
  const suppliersTween = tweened(0, { duration: 900, easing: cubicOut });
  const regionsTween = tweened(0, { duration: 900, easing: cubicOut });

  onMount(async () => {
    const mod = await import('svelte-apexcharts');
    ApexCharts = mod.default;
    chartsReady = true;

    rfqsTween.set(420);
    suppliersTween.set(160);
    regionsTween.set(4);
  });

  // ─────────────────────────────────────────────
  // Pro-grade file handling helpers
  // ─────────────────────────────────────────────
  function formatMB(bytes: number) {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  function totalBytes() {
    return drawingsFiles.reduce((acc, f) => acc + f.size, 0);
  }

  function validateFile(f: File): string | null {
    const ext = extOf(f.name);
    if (!ALLOWED_EXT.has(ext)) return `Unsupported file type: .${ext} (${f.name})`;
    if (f.size > MAX_FILE_SIZE) return `File too large (>${MAX_FILE_MB}MB): ${f.name}`;
    return null;
  }

  function addFiles(list: FileList | File[]) {
    drawingsError = '';
    const incoming = Array.from(list);
    if (incoming.length === 0) return;

    // 1) per-file validation
    for (const f of incoming) {
      const err = validateFile(f);
      if (err) {
        drawingsError = err;
        return;
      }
    }

    // 2) dedupe
    const existing = new Set(drawingsFiles.map(fileKey));
    const deduped = incoming.filter((f) => !existing.has(fileKey(f)));

    // 3) count cap
    const next = [...drawingsFiles, ...deduped];
    if (next.length > MAX_FILES) {
      drawingsError = `You can attach up to ${MAX_FILES} files. (Selected: ${next.length})`;
      return;
    }

    // 4) total size cap
    const nextTotal = next.reduce((acc, f) => acc + f.size, 0);
    if (nextTotal > MAX_TOTAL_SIZE) {
      drawingsError = `Total attachments exceed ${MAX_TOTAL_MB}MB. (Current: ${(
        nextTotal /
        1024 /
        1024
      ).toFixed(1)}MB)`;
      return;
    }

    drawingsFiles = next;

    // reset input so selecting the same file again triggers change
    if (fileInputEl) fileInputEl.value = '';
  }

  function removeFileAt(idx: number) {
    drawingsFiles = drawingsFiles.filter((_, i) => i !== idx);
  }

  function clearFiles() {
    drawingsFiles = [];
    drawingsError = '';
    if (fileInputEl) fileInputEl.value = '';
  }

  // XHR upload with progress (pro UX)
  const postFormWithProgress = (url: string, formData: FormData) =>
    new Promise<any>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);

      xhr.upload.onprogress = (e) => {
        if (!e.lengthComputable) return;
        uploadPct = Math.round((e.loaded / e.total) * 100);
      };

      xhr.onload = () => {
        try {
          const json = JSON.parse(xhr.responseText || '{}');
          if (xhr.status >= 200 && xhr.status < 300) resolve(json);
          else reject(new Error(json.error || `Request failed (${xhr.status})`));
        } catch {
          reject(new Error(`Request failed (${xhr.status})`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error while uploading files.'));
      xhr.send(formData);
    });

  // ───── Submit handler ─────
  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    errorMsg = '';
    drawingsError = '';
    analysis = null;
    uploadPct = 0;

    if (!projectName.trim() || !description.trim()) {
      errorMsg = 'Project name and a short description are required.';
      return;
    }

    // ✅ 실제 제품 기준: 첨부 파일 최소 1개 강제 (원하면 완화 가능)
    if (drawingsFiles.length === 0) {
      drawingsError = 'Attach at least 1 drawing / layout / P&ID file.';
      return;
    }

    loading = true;
    try {
      const formData = new FormData();
      formData.append('projectName', projectName);
      formData.append('description', description);
      formData.append('targetRegion', targetRegion);
      formData.append('annualVolumeBand', annualVolumeBand);
      formData.append('complexityBand', complexityBand);
      formData.append('certifications', certifications);

      // ✅ multiple files
      drawingsFiles.forEach((file) => formData.append('drawings', file));

      const data = await postFormWithProgress('/api/ai-intake', formData);

      analysis = data.analysis as Analysis;
      accessTier = 'free'; // 항상 free 뷰에서 시작
    } catch (err: any) {
      errorMsg = err?.message ?? 'Unexpected error while analysing this RFQ.';
    } finally {
      loading = false;
      uploadPct = 0;
    }
  };

  const riskColor = (level: string) =>
    level === 'high'
      ? 'risk-dot-high'
      : level === 'medium'
      ? 'risk-dot-medium'
      : 'risk-dot-low';

  // ───── Bench score 해석 로직 ─────
  const scoreTag = (score: number): string => {
    if (score >= 85) return 'Excellent fit';
    if (score >= 70) return 'Strong fit';
    if (score >= 55) return 'Workable with clarifications';
    return 'Low fit · scope likely misaligned';
  };

  const confidenceTag = (c: number): string => {
    if (c >= 0.8) return 'high';
    if (c >= 0.5) return 'medium';
    return 'low';
  };

  const regionLabelMap: Record<'US' | 'EU' | 'KR_APAC', string> = {
    US: 'USA / North America',
    EU: 'EU / UK',
    KR_APAC: 'Korea · APAC'
  };

  $: regionLabel = regionLabelMap[targetRegion];

  $: overallTag = analysis ? scoreTag(analysis.matchScore.overall) : '';
  $: processTag = analysis ? scoreTag(analysis.matchScore.processFit) : '';
  $: regionTag = analysis ? scoreTag(analysis.matchScore.regionFit) : '';
  $: certTag = analysis ? scoreTag(analysis.matchScore.certificationFit) : '';

  $: confidencePct = analysis ? Math.round(analysis.quoteEstimate.confidence * 100) : 0;
  $: confidenceText = analysis ? confidenceTag(analysis.quoteEstimate.confidence) : '';

  // ───── Charts ─────
  const gaugeOptions = {
    chart: { type: 'radialBar', toolbar: { show: false } },
    plotOptions: {
      radialBar: {
        hollow: { size: '56%' },
        track: { background: '#020617' },
        dataLabels: {
          name: { fontSize: '11px' },
          value: {
            fontSize: '20px',
            formatter: (v: number) => `${Math.round(v)}%`
          }
        }
      }
    },
    labels: ['Bench match']
  };
  let gaugeSeries: number[] = [0];
  $: gaugeSeries = [$overallTween];

  const barOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: {
      bar: { borderRadius: 8, columnWidth: '45%' }
    },
    xaxis: { categories: ['Process', 'Region', 'Cert'] },
    yaxis: { max: 100, labels: { show: false } },
    dataLabels: { enabled: false },
    grid: { borderColor: '#1e293b' },
    legend: { show: false }
  };
  let barSeries: any[] = [];
  $: barSeries = [
    {
      name: 'fit',
      data: [$processTween, $regionTween, $certTween]
    }
  ];

  // ───── Timeline helper text ─────
  $: intakeSummary = description
    ? description.slice(0, 120) + (description.length > 120 ? '…' : '')
    : 'Drawings, throughput and standards consolidated into one clean brief.';

  $: benchSummary = analysis
    ? `Matched against factories by process window, region and certification fit.`
    : 'AI matches the RFQ against our manufacturing bench by process, region and envelope.';

  $: decisionSummary = analysis
    ? `Overall fit ${Math.round(
        analysis.matchScore.overall
      )}% with ${analysis.risks.length} key risk flag(s).`
    : 'Decision layer shows how quotable the project is before you go to market.';
</script>

<main class="ai-page">
  <!-- HERO -->
  <section class="ai-hero" in:fade={{ duration: 260 }}>
    <div class="ai-hero-left" in:fly={{ y: 16, duration: 260 }}>
      <div class="ai-hero-badges">
        <div class="ai-badge-main">
          <span class="ai-badge-dot"></span>
          <span>AI RFQ CHECK · BETA</span>
          <span class="ai-badge-sub">Internal demo · read-only</span>
        </div>
        <div class="ai-badge-secondary">
          <span class="ai-badge-ping"></span>
          <span>Pre-screen RFQs before you wake up suppliers</span>
        </div>
      </div>

      <h1 class="ai-title">
        A clean AI pass on drawings,<br />
        certifications and RFQs — <span class="ai-title-accent">before you go to market.</span>
      </h1>
      <p class="ai-sub">
        Upload a short brief, target region, key certifications and drawings. NovaNexus runs an
        AI pre-check against our vetted supplier bench and shows how quotable the project really
        is — match score, budget band and risk layer — in minutes.
      </p>

      <div class="ai-hero-meta">
        <span class="ai-hero-chip">Buyer workflow</span>
        <span class="ai-hero-chip">Same spine as production RFQs</span>
      </div>
    </div>

    <!-- 오른쪽: 작은 미니 파이프라인 카드 -->
    <div class="ai-hero-orbit" in:scale={{ duration: 260, start: 0.9 }}>
      <div class="ai-orbit-glow"></div>

      <div class="ai-orbit-core">
        <div class="ai-orbit-header">
          <span class="ai-orbit-label">RFQ pipeline · intake → bench → decision</span>
          <span class="ai-orbit-chip">NovaNexus Spine</span>
        </div>

        <div class="ai-orbit-stats">
          <div class="ai-orbit-stat">
            <div class="ai-orbit-stat-value">{Math.round($rfqsTween)}+</div>
            <div class="ai-orbit-stat-label">RFQs pre-screened</div>
          </div>
          <div class="ai-orbit-stat">
            <div class="ai-orbit-stat-value">{Math.round($suppliersTween)}+</div>
            <div class="ai-orbit-stat-label">Qualified suppliers</div>
          </div>
          <div class="ai-orbit-stat">
            <div class="ai-orbit-stat-value">{Math.round($regionsTween)}</div>
            <div class="ai-orbit-stat-label">Active regions</div>
          </div>
        </div>

        <div class="ai-orbit-timeline">
          <div class="ai-orbit-step">
            <span class="ai-orbit-step-index">01</span>
            <div class="ai-orbit-step-body">
              <div class="ai-orbit-step-title">RFQ intake</div>
              <div class="ai-orbit-step-bar">
                <span class="ai-orbit-step-fill" style="--i:0"></span>
              </div>
            </div>
          </div>
          <div class="ai-orbit-step">
            <span class="ai-orbit-step-index">02</span>
            <div class="ai-orbit-step-body">
              <div class="ai-orbit-step-title">Bench &amp; matching</div>
              <div class="ai-orbit-step-bar">
                <span class="ai-orbit-step-fill" style="--i:1"></span>
              </div>
            </div>
          </div>
          <div class="ai-orbit-step">
            <span class="ai-orbit-step-index">03</span>
            <div class="ai-orbit-step-body">
              <div class="ai-orbit-step-title">Decision layer</div>
              <div class="ai-orbit-step-bar">
                <span class="ai-orbit-step-fill" style="--i:2"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="ai-orbit-ring ai-orbit-ring-outer"></div>
      <div class="ai-orbit-ring ai-orbit-ring-inner"></div>

      <div class="ai-orbit-node ai-orbit-node-1">
        <span class="ai-orbit-node-dot"></span>
        <span class="ai-orbit-node-label">Intake</span>
      </div>
      <div class="ai-orbit-node ai-orbit-node-2">
        <span class="ai-orbit-node-dot"></span>
        <span class="ai-orbit-node-label">Bench</span>
      </div>
      <div class="ai-orbit-node ai-orbit-node-3">
        <span class="ai-orbit-node-dot"></span>
        <span class="ai-orbit-node-label">Award</span>
      </div>
    </div>
  </section>

  <!-- 작은 메트릭 카드 3개 -->
  <section class="ai-metrics" in:fade={{ duration: 260, delay: 40 }}>
    <article class="ai-metric-card">
      <div class="ai-metric-kicker">Access model</div>
      <h2 class="ai-metric-title">Free AI check, gated details.</h2>
      <p class="ai-metric-body">
        High-level match score &amp; reference budget band stay free. Full RFQ pipeline, risk
        map and supplier-fit breakdown unlock with trial / paid access.
      </p>
    </article>

    <article class="ai-metric-card">
      <div class="ai-metric-kicker">Why run the check?</div>
      <p class="ai-metric-body">
        Catch scope gaps, missing certifications and region conflicts before you wake up
        suppliers — so every RFQ you send is quotable.
      </p>
    </article>

    <article class="ai-metric-card">
      <div class="ai-metric-kicker">Who uses it?</div>
      <p class="ai-metric-body">
        Plant teams, project owners and SIs running real capex lines and cells across USA,
        Europe, Korea &amp; APAC.
      </p>
    </article>
  </section>

  <!-- 메인 2열: 왼쪽 폼 / 오른쪽 결과 -->
  <section class="ai-main-grid" in:fade={{ duration: 260, delay: 80 }}>
    <!-- FORM -->
    <form class="ai-form-card" on:submit={handleSubmit} in:fly={{ y: 18, duration: 260 }}>
      <header class="ai-form-header">
        <div>
          <p class="ai-form-kicker">Project intake</p>
          <h2 class="ai-form-title">Same intake real buyers use.</h2>
          <p class="ai-form-sub">
            Keep it crisp — line architecture, annual throughput, risk constraints. The AI
            structures everything into a clean RFQ package.
          </p>
        </div>
      </header>

      <div class="ai-form-grid ai-form-grid-two">
        <div class="ai-field">
          <label for="project-name">Project name</label>
          <input
            id="project-name"
            bind:value={projectName}
            required
            placeholder="EV battery module assembly line"
          />
        </div>

        <div class="ai-field">
          <label for="target-region">Target region</label>
          <select id="target-region" bind:value={targetRegion}>
            <option value="US">USA / North America</option>
            <option value="EU">EU / UK</option>
            <option value="KR_APAC">Korea · APAC</option>
          </select>
        </div>
      </div>

      <div class="ai-field">
        <label for="project-desc">Short project description</label>
        <textarea
          id="project-desc"
          bind:value={description}
          required
          rows="4"
          placeholder="Line architecture, key processes, annual throughput, main risks or constraints."
        ></textarea>
      </div>

      <div class="ai-form-grid ai-form-grid-three">
        <div class="ai-field">
          <label for="annual-volume">Annual volume</label>
          <select id="annual-volume" bind:value={annualVolumeBand}>
            <option value="low">Prototype / low</option>
            <option value="mid">Mid</option>
            <option value="high">High / series</option>
          </select>
        </div>

        <div class="ai-field">
          <label for="complexity">Complexity</label>
          <select id="complexity" bind:value={complexityBand}>
            <option value="simple">Single process / machine</option>
            <option value="medium">2–3 linked processes</option>
            <option value="complex">Full line / multi-cell</option>
          </select>
        </div>

        <div class="ai-field">
          <label for="certs">Certifications (comma-separated)</label>
          <input
            id="certs"
            bind:value={certifications}
            placeholder="ISO 9001, ISO 14001, CE, UL, AWS D1.1…"
          />
        </div>
      </div>

      <!-- ✅ PRO-GRADE MULTI-FILE UPLOADER (Dropzone + list + remove + caps + progress) -->
      <div class="ai-field">
        <label for="drawings">Drawings / layout / P&amp;ID (PDF, images, CAD)</label>

        <div
          class={`ai-dropzone ${isDragging ? 'ai-dropzone-drag' : ''}`}
          on:dragenter|preventDefault={() => (isDragging = true)}
          on:dragover|preventDefault={() => (isDragging = true)}
          on:dragleave|preventDefault={() => (isDragging = false)}
          on:drop|preventDefault={(e) => {
            isDragging = false;
            const dt = (e as DragEvent).dataTransfer;
            if (dt?.files) addFiles(dt.files);
          }}
        >
          <div class="ai-dropzone-top">
            <div class="ai-dropzone-title">Drop files here</div>
            <div class="ai-dropzone-sub">
              Up to {MAX_FILES} files · {MAX_FILE_MB}MB each · {MAX_TOTAL_MB}MB total
            </div>
          </div>

          <div class="ai-dropzone-actions">
            <input
              bind:this={fileInputEl}
              id="drawings"
              type="file"
              multiple
              accept={ACCEPT_ATTR}
              class="ai-file-hidden"
              on:change={(e: Event) => {
                const t = e.currentTarget as HTMLInputElement;
                if (t.files) addFiles(t.files);
              }}
            />

            <button type="button" class="ai-secondary-btn" on:click={() => fileInputEl?.click()}>
              Choose files
            </button>

            {#if drawingsFiles.length > 0}
              <button type="button" class="ai-secondary-btn" on:click={clearFiles}>
                Clear
              </button>
            {/if}
          </div>

          <div class="ai-dropzone-foot">
            <span class="ai-dropzone-meta">
              Attached: <b>{drawingsFiles.length}</b> / {MAX_FILES} · Total:
              <b>{formatMB(totalBytes())}</b>
            </span>
            <span class="ai-dropzone-meta">Tip: If you have many CADs, upload a ZIP.</span>
          </div>
        </div>

        {#if drawingsError}
          <p class="ai-error">{drawingsError}</p>
        {/if}

        {#if drawingsFiles.length > 0}
          <div class="ai-filelist">
            {#each drawingsFiles as f, idx (fileKey(f))}
              <div class="ai-file-row">
                <div class="ai-file-left">
                  <div class="ai-file-name">{f.name}</div>
                  <div class="ai-file-meta">{formatMB(f.size)} · .{extOf(f.name)}</div>
                </div>

                <button
                  type="button"
                  class="ai-file-remove"
                  on:click={() => removeFileAt(idx)}
                  aria-label="Remove file"
                >
                  Remove
                </button>
              </div>
            {/each}
          </div>
        {/if}

        {#if loading && uploadPct > 0}
          <div class="ai-upload-progress" aria-label="Upload progress">
            <div class="ai-upload-bar" style={`width:${uploadPct}%`}></div>
          </div>
          <div class="ai-upload-text">Uploading… {uploadPct}%</div>
        {/if}

        <p class="ai-field-hint">
          Files are used only for analysis. Nothing is shared with suppliers until you confirm an RFQ.
        </p>
      </div>

      {#if errorMsg}
        <p class="ai-error">{errorMsg}</p>
      {/if}

      <footer class="ai-form-footer">
        <button type="submit" class="ai-primary-btn" disabled={loading}>
          {#if loading}
            <span class="ai-spinner"></span>
            <span>Running AI check…</span>
          {:else}
            <span>Run AI RFQ check</span>
          {/if}
        </button>
        <p class="ai-form-note">
          Uses the same logic as production RFQs. Typical intake takes under 2 minutes.
        </p>
      </footer>
    </form>

    <!-- RESULT / PIPELINE -->
    <div class="ai-result-column" in:fly={{ y: 18, duration: 260, delay: 60 }}>
      {#if analysis}
        <!-- Score + charts -->
        <section class="ai-score-card" in:fade={{ duration: 260 }}>
          <div class="ai-score-header">
            <div>
              <p class="ai-score-kicker">Bench match score</p>
              <div class="ai-score-main">
                <span class="ai-score-value">
                  {Math.round($overallTween)}<span class="ai-score-percent">%</span>
                </span>
              </div>
              <p class="ai-score-sub">
                Weighted blend of process fit, region fit, certifications, volume and complexity
                against the live supplier bench.
              </p>
            </div>

            <div class="ai-score-charts">
              <div class="ai-score-gauge">
                {#if chartsReady && ApexCharts}
                  <svelte:component
                    this={ApexCharts}
                    type="radialBar"
                    {gaugeOptions}
                    series={gaugeSeries}
                    width="100%"
                    height="100%"
                  />
                {/if}
              </div>
              <div class="ai-score-bars">
                {#if chartsReady && ApexCharts}
                  <svelte:component
                    this={ApexCharts}
                    type="bar"
                    options={barOptions}
                    series={barSeries}
                    width="100%"
                    height="100%"
                  />
                {/if}
              </div>
            </div>
          </div>

          <!-- ✅ Dimension별 벤치 해석 -->
          <div class="ai-score-dimensions">
            <div class="ai-dim-chip">
              <p class="ai-dim-label">Process fit</p>
              <p class="ai-dim-score">{Math.round($processTween)}%</p>
              <p class="ai-dim-tag">{processTag}</p>
            </div>
            <div class="ai-dim-chip">
              <p class="ai-dim-label">Region fit</p>
              <p class="ai-dim-score">{Math.round($regionTween)}%</p>
              <p class="ai-dim-tag">{regionTag}</p>
            </div>
            <div class="ai-dim-chip">
              <p class="ai-dim-label">Certification fit</p>
              <p class="ai-dim-score">{Math.round($certTween)}%</p>
              <p class="ai-dim-tag">{certTag}</p>
            </div>
          </div>

          <div class="ai-budget-row">
            <p class="ai-budget-label">Reference budget band (core equipment)</p>
            <p class="ai-budget-value">
              {analysis.quoteEstimate.currency === 'USD' ? '$' : ''}
              {analysis.quoteEstimate.low.toLocaleString()}
              &nbsp;–&nbsp;
              {analysis.quoteEstimate.currency === 'USD' ? '$' : ''}
              {analysis.quoteEstimate.high.toLocaleString()}
            </p>
            <p class="ai-budget-note">
              Model confidence {confidencePct}% ({confidenceText}). Band is derived from comparable
              {regionLabel ? ` ${regionLabel}` : ''} projects in the bench and covers core line
              equipment on an ex-works basis. Land, buildings, upstream/downstream equipment,
              commissioning, freight and duty are out of scope.
            </p>
          </div>
        </section>

        <!-- Pipeline snapshot + gating -->
        <section class="ai-pipeline-card" in:fade={{ duration: 260, delay: 40 }}>
          <header class="ai-pipeline-header">
            <div class="ai-pipeline-chip">RFQ pipeline snapshot</div>
            <span class="ai-pipeline-meta">Live demo · read-only</span>
          </header>

          <div class="ai-timeline">
            <div class="ai-timeline-line"></div>

            <div class="ai-timeline-items">
              <div class="ai-timeline-item">
                <div class="ai-timeline-dot ai-timeline-dot-active"></div>
                <div class="ai-timeline-body">
                  <p class="ai-timeline-step">01 · RFQ intake</p>
                  <p class="ai-timeline-title">
                    Drawings, throughput and standards in one clean brief.
                  </p>
                  <p class="ai-timeline-text">{intakeSummary}</p>
                </div>
              </div>

              <div class="ai-timeline-item">
                <div class="ai-timeline-dot ai-timeline-dot-mid"></div>
                <div class="ai-timeline-body">
                  <p class="ai-timeline-step">02 · Bench &amp; matching</p>
                  <p class="ai-timeline-title">
                    Curated bench filtered by process window, region and envelope.
                  </p>
                  <p class="ai-timeline-text">{benchSummary}</p>
                </div>
              </div>

              <div class="ai-timeline-item">
                <div class="ai-timeline-dot ai-timeline-dot-green"></div>
                <div class="ai-timeline-body">
                  <p class="ai-timeline-step">03 · Decision layer</p>
                  <p class="ai-timeline-title">
                    One view of quotable range, duty impact and risk layer.
                  </p>
                  <p class="ai-timeline-text">{decisionSummary}</p>
                </div>
              </div>
            </div>
          </div>

          <p class="ai-pipeline-footer">
            Typical cycle: 5–12 working days from RFQ to award once the AI check is clean.
          </p>

          {#if accessTier === 'free'}
            <div class="ai-gate-overlay">
              <p class="ai-gate-kicker">Pipeline details locked</p>
              <p class="ai-gate-body">
                You’re seeing the high-level match score and reference band for free. Full RFQ
                pipeline view, supplier shortlist logic and risk breakdown unlock with a free trial.
              </p>
              <div class="ai-gate-actions">
                <button
                  type="button"
                  class="ai-primary-btn ai-gate-btn"
                  on:click={() => (accessTier = 'trial')}
                >
                  Start {TRIAL_DAYS}-day free trial
                </button>
                <a href="/auth/join" class="ai-secondary-btn ai-gate-btn">Talk to NovaNexus</a>
              </div>
              <p class="ai-gate-note">
                No card required for trial. Perfect for one-off checks before you launch a full RFQ.
              </p>
            </div>
          {/if}
        </section>

        <!-- Certification map + risk layer -->
        <section class="ai-cert-card" in:fade={{ duration: 260, delay: 80 }}>
          <header class="ai-cert-header">
            <p class="ai-cert-kicker">Certification map &amp; risk layer</p>
            {#if accessTier === 'free'}
              <span class="ai-cert-status">Preview only</span>
            {:else}
              <span class="ai-cert-status ai-cert-status-open">Full detail unlocked</span>
            {/if}
          </header>

          <div class="ai-cert-mappings">
            {#if analysis.certMapping.length === 0}
              <p class="ai-cert-empty">No certifications detected for this project.</p>
            {:else}
              {#each analysis.certMapping as c, i}
                {#if accessTier !== 'free' || i === 0}
                  <article class="ai-cert-row">
                    <p class="ai-cert-input">Input: {c.input}</p>
                    <p class="ai-cert-normalized">{c.normalized}</p>
                    {#if c.relevantProcesses.length}
                      <p class="ai-cert-processes">
                        Linked processes: {c.relevantProcesses.join(', ')}
                      </p>
                    {/if}
                    <p class="ai-cert-notes">{c.regionNotes}</p>
                  </article>
                {/if}
              {/each}

              {#if accessTier === 'free' && analysis.certMapping.length > 1}
                <p class="ai-cert-more">
                  + {analysis.certMapping.length - 1} more certification mappings in the full view.
                </p>
              {/if}
            {/if}
          </div>

          <div class="ai-risk-block">
            <p class="ai-risk-kicker">Key risk flags</p>
            {#if analysis.risks.length === 0}
              <p class="ai-cert-empty">No major risk flags surfaced in the AI pre-check.</p>
            {:else}
              <div class="ai-risk-list">
                {#each analysis.risks as r, i}
                  {#if accessTier !== 'free' || i === 0}
                    <div class="ai-risk-row">
                      <span class={`ai-risk-dot ${riskColor(r.level)}`}></span>
                      <div>
                        <p class="ai-risk-label">{r.label}</p>
                        <p class="ai-risk-detail">{r.detail}</p>
                      </div>
                    </div>
                  {/if}
                {/each}

                {#if accessTier === 'free' && analysis.risks.length > 1}
                  <p class="ai-cert-more">
                    + {analysis.risks.length - 1} more risk items in the full layer.
                  </p>
                {/if}
              </div>
            {/if}
          </div>

          {#if analysis.notes.length}
            <div class="ai-notes-block">
              {#each analysis.notes as n, i}
                {#if accessTier !== 'free' || i < 1}
                  <p class="ai-note-line">• {n}</p>
                {/if}
              {/each}

              {#if accessTier === 'free' && analysis.notes.length > 1}
                <p class="ai-cert-more">Additional implementation notes are included in the paid view.</p>
              {/if}
            </div>
          {/if}
        </section>
      {:else}
        <!-- 아직 분석 전 · idle 상태 -->
        <section class="ai-idle-card" in:fade={{ duration: 260 }}>
          <p class="ai-idle-kicker">Live demo · no data yet</p>
          <h2 class="ai-idle-title">Run one RFQ through the spine.</h2>
          <p class="ai-idle-body">
            Once you run the AI RFQ check, this panel turns into a live pipeline view: match score,
            budget band, certification map and risk layer.
          </p>
          <p class="ai-idle-body">
            In the paid tier, buyers also see a structured RFQ package and a supplier shortlist they
            can send to with one click.
          </p>
        </section>
      {/if}
    </div>
  </section>
</main>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }

  .ai-page {
    max-width: 1120px;
    margin: 0 auto;
    padding: 88px 24px 72px;
    color: #e5e7eb;
  }

  /* HERO */

  .ai-hero {
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(0, 1.1fr);
    gap: 40px;
    align-items: center;
    margin-bottom: 40px;
  }

  .ai-hero-left {
    display: flex;
    flex-direction: column;
    gap: 10px;
    position: relative;
    z-index: 2;
  }

  .ai-hero-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 4px;
  }

  .ai-badge-main {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 999px;
    border: 1px solid rgba(56, 189, 248, 0.6);
    background: rgba(15, 23, 42, 0.96);
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    box-shadow: 0 0 32px rgba(56, 189, 248, 0.5);
  }

  .ai-badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: #22c55e;
    box-shadow: 0 0 12px rgba(34, 197, 94, 0.95);
  }

  .ai-badge-sub {
    font-size: 10px;
    color: #9ca3af;
    text-transform: none;
    letter-spacing: 0.02em;
  }

  .ai-badge-secondary {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid rgba(251, 191, 36, 0.6);
    background: rgba(24, 16, 6, 0.94);
    font-size: 11px;
    color: #fed7aa;
  }

  .ai-badge-ping {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: #fbbf24;
    box-shadow: 0 0 12px rgba(251, 191, 36, 0.9);
    animation: ai-ping 1.4s infinite;
  }

  @keyframes ai-ping {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(2);
      opacity: 0;
    }
  }

  .ai-title {
    font-size: 32px;
    line-height: 1.2;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .ai-title-accent {
    color: #38bdf8;
  }

  .ai-sub {
    font-size: 14px;
    color: #9ca3af;
    max-width: 560px;
  }

  .ai-hero-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
  }

  .ai-hero-chip {
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.7);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    background: rgba(15, 23, 42, 0.96);
  }

  /* HERO ORBIT CARD */

  .ai-hero-orbit {
    position: relative;
    border-radius: 24px;
    border: 1px solid rgba(148, 163, 184, 0.7);
    background: radial-gradient(
      circle at top,
      rgba(56, 189, 248, 0.2),
      rgba(15, 23, 42, 0.98)
    );
    padding: 18px 18px 20px;
    overflow: hidden;
    box-shadow: 0 22px 52px rgba(15, 23, 42, 1);
    font-size: 11px;
  }

  .ai-orbit-glow {
    position: absolute;
    inset: -40px -40px auto auto;
    background: radial-gradient(circle at top, rgba(56, 189, 248, 0.75), transparent 55%),
      radial-gradient(circle at bottom, rgba(15, 23, 42, 1), rgba(15, 23, 42, 1));
    opacity: 0.7;
    filter: blur(22px);
    pointer-events: none;
  }

  .ai-orbit-core {
    position: relative;
    border-radius: 18px;
    border: 1px solid rgba(148, 163, 184, 0.9);
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.98), rgba(2, 6, 23, 1));
    padding: 14px 14px 12px;
    z-index: 2;
  }

  .ai-orbit-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  .ai-orbit-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: #bfdbfe;
  }

  .ai-orbit-chip {
    font-size: 10px;
    padding: 3px 8px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.7);
    color: #e5e7eb;
    background: rgba(15, 23, 42, 0.96);
  }

  .ai-orbit-stats {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }

  .ai-orbit-stat {
    flex: 1;
    min-width: 110px;
  }

  .ai-orbit-stat-value {
    font-size: 16px;
    font-weight: 600;
    color: #e5e7eb;
  }

  .ai-orbit-stat-label {
    color: #9ca3af;
    font-size: 11px;
  }

  .ai-orbit-timeline {
    margin-top: 4px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .ai-orbit-step {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 8px;
    align-items: center;
  }

  .ai-orbit-step-index {
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #6b7280;
  }

  .ai-orbit-step-title {
    font-size: 11px;
    color: #e5e7eb;
  }

  .ai-orbit-step-bar {
    position: relative;
    width: 100%;
    height: 3px;
    border-radius: 999px;
    background: rgba(30, 64, 175, 0.7);
    overflow: hidden;
    margin-top: 3px;
  }

  .ai-orbit-step-fill {
    position: absolute;
    inset: 0;
    transform: translateX(-100%);
    background: linear-gradient(90deg, #38bdf8, #22c55e, #a855f7);
    animation: ai-orbit-fill 5s ease-in-out infinite;
    animation-delay: calc(var(--i) * 0.4s);
  }

  @keyframes ai-orbit-fill {
    0% {
      transform: translateX(-100%);
    }
    40% {
      transform: translateX(0);
    }
    80% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(100%);
    }
  }

  .ai-orbit-ring {
    position: absolute;
    inset: 26px 18px 18px 18px;
    border-radius: 999px;
    border: 1px dashed rgba(148, 163, 184, 0.45);
    z-index: 1;
    pointer-events: none;
    animation: ai-orbit-spin 26s linear infinite;
  }

  .ai-orbit-ring-inner {
    inset: 36px 30px 30px 30px;
    opacity: 0.6;
    border-style: solid;
    animation-duration: 36s;
    animation-direction: reverse;
  }

  @keyframes ai-orbit-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .ai-orbit-node {
    position: absolute;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #e5e7eb;
    animation: ai-node-float 6s ease-in-out infinite;
  }

  .ai-orbit-node-dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: #22c55e;
    box-shadow: 0 0 12px rgba(34, 197, 94, 0.9);
  }

  .ai-orbit-node-1 {
    top: 16px;
    left: 22px;
    animation-delay: 0.2s;
  }

  .ai-orbit-node-2 {
    bottom: 20px;
    left: 26px;
    animation-delay: 0.8s;
  }

  .ai-orbit-node-3 {
    top: 32px;
    right: 24px;
    animation-delay: 1.4s;
  }

  .ai-orbit-node-label {
    background: rgba(15, 23, 42, 0.92);
    border-radius: 999px;
    padding: 3px 8px;
    border: 1px solid rgba(148, 163, 184, 0.6);
  }

  @keyframes ai-node-float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-4px);
    }
  }

  /* METRICS */

  .ai-metrics {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
    margin-bottom: 40px;
  }

  .ai-metric-card {
    border-radius: 18px;
    border: 1px solid rgba(31, 41, 55, 1);
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.98), rgba(2, 6, 23, 1));
    padding: 14px 16px 16px;
    font-size: 12px;
    box-shadow: 0 18px 42px rgba(15, 23, 42, 1);
  }

  .ai-metric-kicker {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: #6b7280;
    margin-bottom: 6px;
  }

  .ai-metric-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .ai-metric-body {
    color: #9ca3af;
  }

  /* MAIN GRID */

  .ai-main-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.1fr);
    gap: 24px;
  }

  .ai-form-card {
    border-radius: 22px;
    border: 1px solid rgba(31, 41, 55, 1);
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.98), rgba(2, 6, 23, 1));
    padding: 18px 18px 20px;
    font-size: 13px;
    box-shadow: 0 24px 70px rgba(15, 23, 42, 0.98);
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .ai-form-header {
    margin-bottom: 4px;
  }

  .ai-form-kicker {
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #38bdf8;
    margin-bottom: 4px;
  }

  .ai-form-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .ai-form-sub {
    font-size: 12px;
    color: #9ca3af;
  }

  .ai-form-grid {
    display: grid;
    gap: 12px;
  }

  .ai-form-grid-two {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ai-form-grid-three {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .ai-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .ai-field label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: #cbd5f5;
  }

  .ai-field input,
  .ai-field select,
  .ai-field textarea {
    border-radius: 14px;
    border: 1px solid rgba(51, 65, 85, 1);
    background: rgba(15, 23, 42, 1);
    padding: 7px 10px;
    font-size: 13px;
    color: #e5e7eb;
    outline: none;
  }

  .ai-field textarea {
    resize: vertical;
    min-height: 96px;
  }

  .ai-field input::placeholder,
  .ai-field textarea::placeholder {
    color: #6b7280;
  }

  .ai-field input:focus,
  .ai-field select:focus,
  .ai-field textarea:focus {
    border-color: rgba(56, 189, 248, 0.7);
    box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.4);
  }

  .ai-field-hint {
    font-size: 11px;
    color: #9ca3af;
  }

  .ai-error {
    font-size: 12px;
    color: #fca5a5;
  }

  .ai-form-footer {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 4px;
    flex-wrap: wrap;
  }

  .ai-primary-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 18px;
    border-radius: 999px;
    border: none;
    background: linear-gradient(135deg, #38bdf8, #a855f7);
    color: #0f172a;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 18px 45px rgba(56, 189, 248, 0.6);
    transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease, opacity 0.15s ease;
  }

  .ai-primary-btn:hover:enabled {
    transform: translateY(-1px);
    box-shadow: 0 22px 60px rgba(56, 189, 248, 0.75);
    filter: saturate(1.1);
  }

  .ai-primary-btn:disabled {
    opacity: 0.6;
    cursor: default;
    transform: none;
    box-shadow: none;
  }

  .ai-spinner {
    width: 12px;
    height: 12px;
    border-radius: 999px;
    border: 2px solid #0f172a;
    border-top-color: transparent;
    animation: ai-spin 0.7s linear infinite;
  }

  @keyframes ai-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .ai-form-note {
    font-size: 11px;
    color: #9ca3af;
  }

  .ai-result-column {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .ai-score-card {
    position: relative;
    border-radius: 22px;
    border: 1px solid rgba(30, 64, 175, 0.9);
    background: radial-gradient(circle at top, rgba(37, 99, 235, 0.4), rgba(15, 23, 42, 0.98));
    padding: 16px 16px 14px;
    box-shadow: 0 24px 80px rgba(15, 23, 42, 1);
  }

  .ai-score-header {
    display: flex;
    justify-content: space-between;
    gap: 16px;
  }

  .ai-score-kicker {
    font-size: 11px;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: #bfdbfe;
    margin-bottom: 4px;
  }

  .ai-score-main {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  .ai-score-value {
    font-size: 32px;
    font-weight: 600;
    color: #e0f2fe;
  }

  .ai-score-percent {
    font-size: 16px;
    color: #cbd5f5;
    margin-left: 2px;
  }

  .ai-score-sub {
    font-size: 12px;
    color: #c4d3f5;
    max-width: 260px;
  }

  .ai-score-charts {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .ai-score-gauge {
    width: 104px;
    height: 104px;
  }

  .ai-score-bars {
    width: 140px;
    height: 90px;
    display: none;
  }

  @media (min-width: 960px) {
    .ai-score-bars {
      display: block;
    }
  }

  /* ✅ Dimension tag chips */
  .ai-score-dimensions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
  }

  .ai-dim-chip {
    flex: 1;
    min-width: 120px;
    border-radius: 12px;
    border: 1px solid rgba(30, 64, 175, 0.7);
    background: rgba(15, 23, 42, 0.85);
    padding: 6px 8px;
    font-size: 11px;
  }

  .ai-dim-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: #9ca3af;
    margin-bottom: 2px;
  }

  .ai-dim-score {
    font-size: 12px;
    font-weight: 500;
    color: #e5e7eb;
  }

  .ai-dim-tag {
    font-size: 11px;
    color: #cbd5f5;
    margin-top: 1px;
  }

  .ai-budget-row {
    margin-top: 10px;
    border-top: 1px solid rgba(30, 64, 175, 0.6);
    padding-top: 8px;
  }

  .ai-budget-label {
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #bfdbfe;
    margin-bottom: 2px;
  }

  .ai-budget-value {
    font-size: 16px;
    font-weight: 600;
  }

  .ai-budget-note {
    font-size: 11px;
    color: #cbd5f5;
    margin-top: 2px;
  }

  .ai-pipeline-card {
    position: relative;
    border-radius: 22px;
    border: 1px solid rgba(31, 41, 55, 1);
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.98), rgba(2, 6, 23, 1));
    padding: 16px 16px 14px;
    box-shadow: 0 24px 80px rgba(15, 23, 42, 1);
    overflow: hidden;
  }

  .ai-pipeline-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .ai-pipeline-chip {
    padding: 3px 10px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.7);
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .ai-pipeline-meta {
    font-size: 11px;
    color: #9ca3af;
  }

  .ai-timeline {
    position: relative;
    padding-left: 16px;
    margin-bottom: 6px;
  }

  .ai-timeline-line {
    position: absolute;
    left: 6px;
    top: 4px;
    bottom: 8px;
    width: 1px;
    background: rgba(55, 65, 81, 0.9);
  }

  .ai-timeline-items {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .ai-timeline-item {
    position: relative;
    display: flex;
    gap: 8px;
  }

  .ai-timeline-dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    margin-top: 2px;
    box-shadow: 0 0 14px rgba(56, 189, 248, 0.6);
  }

  .ai-timeline-dot-active {
    background: #38bdf8;
  }

  .ai-timeline-dot-mid {
    background: #a855f7;
  }

  .ai-timeline-dot-green {
    background: #22c55e;
  }

  .ai-timeline-body {
    flex: 1;
  }

  .ai-timeline-step {
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #6b7280;
    margin-bottom: 2px;
  }

  .ai-timeline-title {
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 2px;
  }

  .ai-timeline-text {
    font-size: 11px;
    color: #9ca3af;
  }

  .ai-pipeline-footer {
    font-size: 11px;
    color: #6b7280;
    margin-top: 4px;
  }

  .ai-gate-overlay {
    position: absolute;
    inset: 0;
    background: rgba(15, 23, 42, 0.9);
    backdrop-filter: blur(6px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    text-align: center;
    padding: 16px;
  }

  .ai-gate-kicker {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    color: #9ca3af;
  }

  .ai-gate-body {
    font-size: 12px;
    max-width: 340px;
    color: #e5e7eb;
  }

  .ai-gate-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .ai-gate-btn {
    font-size: 12px;
  }

  .ai-secondary-btn {
    padding: 8px 16px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.9);
    background: rgba(15, 23, 42, 0.96);
    color: #e5e7eb;
    font-size: 12px;
    text-decoration: none;
    cursor: pointer;
  }

  .ai-gate-note {
    font-size: 10px;
    color: #9ca3af;
  }

  .ai-cert-card {
    border-radius: 20px;
    border: 1px solid rgba(31, 41, 55, 1);
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.98), rgba(2, 6, 23, 1));
    padding: 14px 16px 16px;
    box-shadow: 0 24px 70px rgba(15, 23, 42, 1);
    font-size: 12px;
  }

  .ai-cert-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .ai-cert-kicker {
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #38bdf8;
  }

  .ai-cert-status {
    font-size: 11px;
    color: #9ca3af;
  }

  .ai-cert-status-open {
    color: #22c55e;
  }

  .ai-cert-mappings {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 8px;
  }

  .ai-cert-row {
    border-radius: 14px;
    border: 1px solid rgba(31, 41, 55, 1);
    padding: 8px 10px;
    background: rgba(15, 23, 42, 1);
  }

  .ai-cert-input {
    font-size: 11px;
    color: #9ca3af;
    margin-bottom: 2px;
  }

  .ai-cert-normalized {
    font-weight: 500;
  }

  .ai-cert-processes {
    font-size: 11px;
    color: #e5e7eb;
    margin-top: 2px;
  }

  .ai-cert-notes {
    font-size: 11px;
    color: #9ca3af;
    margin-top: 2px;
  }

  .ai-cert-empty {
    font-size: 11px;
    color: #9ca3af;
  }

  .ai-cert-more {
    font-size: 11px;
    color: #6b7280;
  }

  .ai-risk-block {
    border-top: 1px solid rgba(31, 41, 55, 1);
    padding-top: 8px;
    margin-top: 4px;
  }

  .ai-risk-kicker {
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #6b7280;
    margin-bottom: 4px;
  }

  .ai-risk-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .ai-risk-row {
    display: flex;
    gap: 8px;
  }

  .ai-risk-dot {
    margin-top: 4px;
    width: 8px;
    height: 8px;
    border-radius: 999px;
  }

  .risk-dot-high {
    background: #f97373;
  }

  .risk-dot-medium {
    background: #facc15;
  }

  .risk-dot-low {
    background: #22c55e;
  }

  .ai-risk-label {
    font-weight: 500;
  }

  .ai-risk-detail {
    font-size: 11px;
    color: #9ca3af;
  }

  .ai-notes-block {
    border-top: 1px solid rgba(31, 41, 55, 1);
    padding-top: 8px;
    margin-top: 6px;
    font-size: 11px;
    color: #cbd5f5;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .ai-note-line {
    line-height: 1.4;
  }

  .ai-idle-card {
    border-radius: 22px;
    border: 1px dashed rgba(55, 65, 81, 1);
    background: rgba(15, 23, 42, 0.9);
    padding: 18px 18px 20px;
    box-shadow: 0 24px 80px rgba(15, 23, 42, 1);
    font-size: 13px;
  }

  .ai-idle-kicker {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    color: #6b7280;
    margin-bottom: 6px;
  }

  .ai-idle-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .ai-idle-body {
    font-size: 12px;
    color: #9ca3af;
    margin-bottom: 4px;
  }

  /* ─────────────────────────────────────────────
     Pro-grade uploader styles (integrated with existing theme)
     ───────────────────────────────────────────── */
  .ai-file-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  .ai-dropzone {
    border-radius: 18px;
    border: 1px dashed rgba(148, 163, 184, 0.55);
    background: rgba(2, 6, 23, 0.55);
    padding: 12px 12px 10px;
    box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.35);
    transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
  }

  .ai-dropzone-drag {
    border-color: rgba(56, 189, 248, 0.85);
    box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.35), 0 22px 60px rgba(56, 189, 248, 0.12);
    transform: translateY(-1px);
  }

  .ai-dropzone-top {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-bottom: 10px;
  }

  .ai-dropzone-title {
    font-size: 12px;
    font-weight: 600;
    color: #e5e7eb;
    letter-spacing: 0.02em;
  }

  .ai-dropzone-sub {
    font-size: 11px;
    color: #9ca3af;
  }

  .ai-dropzone-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 10px;
  }

  .ai-dropzone-foot {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
  }

  .ai-dropzone-meta {
    font-size: 11px;
    color: #6b7280;
  }

  .ai-filelist {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .ai-file-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    border-radius: 14px;
    border: 1px solid rgba(31, 41, 55, 1);
    background: rgba(15, 23, 42, 1);
    padding: 8px 10px;
  }

  .ai-file-left {
    min-width: 0;
    flex: 1;
  }

  .ai-file-name {
    font-size: 12px;
    color: #e5e7eb;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ai-file-meta {
    font-size: 11px;
    color: #9ca3af;
    margin-top: 2px;
  }

  .ai-file-remove {
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.65);
    background: rgba(15, 23, 42, 0.95);
    color: #e5e7eb;
    font-size: 11px;
    padding: 6px 10px;
    cursor: pointer;
    transition: transform 0.12s ease, box-shadow 0.12s ease;
  }

  .ai-file-remove:hover {
    transform: translateY(-1px);
    box-shadow: 0 14px 30px rgba(15, 23, 42, 0.75);
  }

  .ai-upload-progress {
    margin-top: 10px;
    height: 10px;
    border-radius: 999px;
    border: 1px solid rgba(30, 64, 175, 0.6);
    background: rgba(15, 23, 42, 0.8);
    overflow: hidden;
  }

  .ai-upload-bar {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #38bdf8, #22c55e, #a855f7);
    transition: width 0.12s ease;
  }

  .ai-upload-text {
    margin-top: 6px;
    font-size: 11px;
    color: #9ca3af;
  }

  /* RESPONSIVE */

  @media (max-width: 960px) {
    .ai-hero {
      grid-template-columns: minmax(0, 1fr);
      align-items: flex-start;
    }

    .ai-hero-orbit {
      order: -1;
    }

    .ai-metrics {
      grid-template-columns: minmax(0, 1fr);
    }

    .ai-main-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .ai-form-grid-two,
    .ai-form-grid-three {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
