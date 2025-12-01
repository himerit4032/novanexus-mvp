<!-- src/routes/+page.svelte -->

<svelte:head>
  <title>NovaNexus ▢ RFQs for real manufacturing</title>

  <style>
    /* ─────────────────────────────
       전체 기본 세팅
    ───────────────────────────── */
    :global(body) {
      margin: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #020617;
      color: #e5e7eb;
    }

    /* 페이지 공통 래퍼 (밑 섹션용) */
    .nn-page {
      max-width: 1120px;
      margin: 0 auto;
      padding: 80px 24px 96px;
    }

    /* ─────────────────────────────
       HERO + 배경 영상
    ───────────────────────────── */
    .hero {
      position: relative;
      min-height: 100vh;
      overflow: hidden;
    }

    .hero video {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: brightness(0.38); /* 영상 어둡게 */
    }

    .hero-overlay {
      position: relative;
      z-index: 1;
      min-height: 100vh;
      display: flex;
      align-items: center;
      padding: 120px 24px 72px;
      /* 왼쪽은 진하게, 오른쪽으로 갈수록 투명해지는 그라디언트 */
      background: linear-gradient(
        90deg,
        rgba(2, 6, 23, 0.96) 0%,
        rgba(2, 6, 23, 0.82) 45%,
        rgba(2, 6, 23, 0.30) 70%,
        transparent 100%
      );
    }

    .hero-inner {
      max-width: 1120px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
      gap: 56px;
      align-items: center;
    }

    @media (max-width: 900px) {
      .hero-overlay {
        padding-top: 96px;
        padding-bottom: 64px;
      }

      .hero-inner {
        grid-template-columns: minmax(0, 1fr);
        gap: 32px;
      }
    }

    /* ─────────────────────────────
       왼쪽 텍스트
    ───────────────────────────── */
    .kicker {
      font-size: 11px;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #22d3ee;
      margin-bottom: 10px;
      text-shadow: 0 0 14px rgba(0, 0, 0, 1);
    }

    .title {
      font-size: 40px;
      line-height: 1.1;
      font-weight: 600;
      margin-bottom: 12px;
      color: #f9fafb;
      text-shadow: 0 0 18px rgba(0, 0, 0, 1);
    }

    @media (min-width: 1024px) {
      .title {
        font-size: 46px;
      }
    }

    .title span {
      color: #22d3ee;
    }

    .sub {
      font-size: 14px;
      color: #e5e7eb;
      max-width: 520px;
      margin-bottom: 20px;
      text-shadow: 0 0 14px rgba(0, 0, 0, 1);
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin: 18px 0 6px;
    }

    .btn {
      border-radius: 999px;
      padding: 10px 22px;
      font-size: 13px;
      border: 1px solid rgba(148, 163, 184, 0.7);
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition:
        background 0.18s ease,
        color 0.18s ease,
        border-color 0.18s ease,
        transform 0.18s ease;
      white-space: nowrap;
    }

    .btn.primary {
      background: linear-gradient(135deg, #6366f1, #22d3ee);
      border-color: rgba(129, 140, 248, 0.8);
      color: #020617;
      font-weight: 600;
    }

    .btn.primary:hover {
      filter: brightness(1.05);
      transform: translateY(-1px);
    }

    .btn.ghost {
      background: transparent;
      color: #e5e7eb;
    }

    .btn.ghost:hover {
      background: rgba(15, 23, 42, 0.7);
    }

    .meta {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 6px;
      text-shadow: 0 0 12px rgba(0, 0, 0, 1);
    }

    .metrics {
      display: flex;
      flex-wrap: wrap;
      gap: 18px;
      margin-top: 24px;
      font-size: 11px;
    }

    .metric-label {
      color: #9ca3af;
    }

    .metric-value {
      font-size: 16px;
      font-weight: 600;
      color: #f9fafb;
    }

    /* ─────────────────────────────
       오른쪽 매칭 카드
    ───────────────────────────── */
    .match-card {
      border-radius: 28px;
      border: 1px solid rgba(148, 163, 184, 0.4);
      background: radial-gradient(
        circle at top,
        rgba(37, 99, 235, 0.6),
        rgba(15, 23, 42, 0.97)
      );
      box-shadow: 0 28px 80px rgba(15, 23, 42, 0.9);
      padding: 18px 18px 20px;
      font-size: 11px;
      position: relative;
      overflow: hidden;
      max-width: 380px;
      margin-left: auto;
      color: #e5e7eb;
    }

    .match-title {
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .match-sub {
      color: #cbd5f5;
      margin-bottom: 10px;
    }

    .chip-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      gap: 10px;
      flex-wrap: wrap;
    }

    .chip-node {
      padding: 6px 10px;
      border-radius: 999px;
      background: rgba(15, 23, 42, 0.92);
      border: 1px solid rgba(148, 163, 184, 0.7);
      font-size: 11px;
      color: #e5e7eb;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }

    .chip-node span {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      color: #a5b4fc;
    }

    .arrow {
      font-size: 16px;
      color: #a5b4fc;
      opacity: 0.75;
    }

    .steps {
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .step {
      display: flex;
      gap: 8px;
      padding: 7px 9px;
      border-radius: 999px;
      background: rgba(15, 23, 42, 0.86);
      border: 1px solid rgba(148, 163, 184, 0.4);
      align-items: flex-start;
      color: #cbd5f5;
    }

    .step-dot {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      margin-top: 3px;
      background: rgba(148, 163, 184, 0.9);
      flex-shrink: 0;
    }

    .step-title {
      font-weight: 500;
      color: #e5e7eb;
      margin-bottom: 2px;
    }

    .step-desc {
      color: #cbd5f5;
      opacity: 0.9;
    }

    /* ─────────────────────────────
       아래 섹션 공통 스타일 (How it works / About 등)
    ───────────────────────────── */
    .nn-section {
      padding: 72px 24px 32px;
    }

    .nn-section-inner {
      max-width: 1120px;
      margin: 0 auto;
    }

    .nn-section-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 18px;
    }

    .nn-section-sub {
      font-size: 14px;
      color: #9ca3af;
      margin-bottom: 24px;
    }
  </style>
</svelte:head>


<section class="hero">
  <!-- 🔥 여기서 네 영상이 배경으로 사용됨 -->
  <video
    src="/media/matching-loop.mp4"
    autoplay
    muted
    loop
    playsinline
  ></video>

  <div class="hero-overlay">
    <div class="hero-inner">
      <!-- 왼쪽 텍스트 -->
      <div>
        <div class="kicker">
          ALUMINUM · RACKING · AUTOMATION
        </div>
        <h1 class="title">
          RFQs for <span>real</span> manufacturing,<br />
          not hobby projects.
        </h1>
        <p class="sub">
          NovaNexus connects serious buyers in the U.S. and Europe with vetted Korean &amp; APAC factories
          for aluminum lines, racking systems, and automation projects. One RFQ in — qualified quotes out.
        </p>

        <div class="actions">
          <a href="#live-rfqs" class="btn primary">
            See RFQ examples
          </a>
          <a href="#for-suppliers" class="btn ghost">
            Become a supplier
          </a>
        </div>

        <div class="meta">
          Built for plant managers, project engineers, and owners tired of endless email chains.
        </div>

        <div class="metrics">
          <div>
            <div class="metric-value">27</div>
            <div class="metric-label">Live RFQs</div>
          </div>
          <div>
            <div class="metric-value">$180k</div>
            <div class="metric-label">Avg. project value</div>
          </div>
          <div>
            <div class="metric-value">140+</div>
            <div class="metric-label">Vetted suppliers</div>
          </div>
        </div>
      </div>

      <!-- 오른쪽: Buyer ↔ NovaNexus ↔ Supplier 카드 -->
      <aside class="match-card">
        <div class="match-title">How buyers &amp; suppliers match on NovaNexus</div>
        <div class="match-sub">
          A simple pipeline from RFQ to vetted factories ready to quote.
        </div>

        <div class="chip-row">
          <div class="chip-node">
            <span>BUYER</span>
            Plant / OEM
          </div>
          <div class="arrow">➜</div>
          <div class="chip-node">
            <span>CORE</span>
            NovaNexus
          </div>
          <div class="arrow">➜</div>
          <div class="chip-node">
            <span>SUPPLIER</span>
            Factory / SI
          </div>
        </div>

        <div class="steps">
          <div class="step">
            <div class="step-dot"></div>
            <div>
              <div class="step-title">RFQ received</div>
              <div class="step-desc">
                Drawings, throughput, INCOTERMS, target dates and standards uploaded in one structured form.
              </div>
            </div>
          </div>
          <div class="step">
            <div class="step-dot"></div>
            <div>
              <div class="step-title">Matched to factories</div>
              <div class="step-desc">
                Filtered by machines, envelope, certifications and installation capability — not a random blast.
              </div>
            </div>
          </div>
          <div class="step">
            <div class="step-dot"></div>
            <div>
              <div class="step-title">Quotes &amp; execution</div>
              <div class="step-desc">
                Clarifications, quotes and PO kept in one clean thread, ready for fabrication and installation.
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</section>
