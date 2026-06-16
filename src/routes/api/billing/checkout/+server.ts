<script lang="ts">
  import { onMount, onDestroy, tick } from "svelte";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";

  type Tab = "scan" | "results";

  // ─────────────────────────────────────────────
  // Storage keys
  // ─────────────────────────────────────────────
  const STORAGE_KEY = "nx_industry_scanner_dismissed_at"; // default cooldown marker
  const HIDE_UNTIL_KEY = "nx_industry_scanner_hide_until_ms"; // explicit choice override

  // ─────────────────────────────────────────────
  // Policies
  // ─────────────────────────────────────────────
  const COOLDOWN_DAYS = 7;
  const OPEN_DELAY_MS = 1800;

  // hide-until (24h / 7d)
  const DAY_MS = 24 * 60 * 60 * 1000;
  const DAYS7_MS = 7 * DAY_MS;

  // dev util only
  const DEV_ALWAYS_SHOW = import.meta.env.DEV;

  // ─────────────────────────────────────────────
  // UI state
  // ─────────────────────────────────────────────
  let open = false;
  let tab: Tab = "scan";
  let liveLine = 0;

  // snooze options
  let hide24h = false;
  let hide7d = false;

  // reduce motion
  let reduceMotion = false;

  const scanLines = [
    "Indexing demand signals across regions and sectors…",
    "Matching your capabilities to live RFQ patterns…",
    "Preparing a share-ready supplier visibility snapshot…"
  ];

  const proof = [
    { k: "Coverage", v: "14+ industries" },
    { k: "Regions", v: "US · EU · Korea · APAC" },
    { k: "Trial", v: "Free to start" }
  ];

  // timers
  let openTimer: ReturnType<typeof setTimeout> | null = null;
  let liveTimer: ReturnType<typeof setInterval> | null = null;

  // DOM refs
  let dialogEl: HTMLDivElement | null = null;
  let shellEl: HTMLDivElement | null = null;
  let lastActive: HTMLElement | null = null;

  // scroll restore
  let prevHtmlOverflow = "";
  let prevBodyOverflow = "";
  let prevBodyPaddingRight = "";

  // ids for aria wiring
  const dialogLabelId = "nx-industry-scanner-title";
  const dialogDescId = "nx-industry-scanner-desc";
  const tabPanelScanId = "nx-tabpanel-scan";
  const tabPanelResultsId = "nx-tabpanel-results";
  const tabScanId = "nx-tab-scan";
  const tabResultsId = "nx-tab-results";

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────
  const safeNumber = (raw: string | null) => {
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  };

  const now = () => Date.now();

  const hiddenByChoice = () => {
    if (!browser) return false;
    const until = safeNumber(localStorage.getItem(HIDE_UNTIL_KEY));
    if (!until) return false;
    return now() < until;
  };

  const withinCooldown = () => {
    if (!browser) return false;

    // 1) explicit choice override (HIDE_UNTIL)
    if (hiddenByChoice()) return true;

    // 2) default cooldown marker
    const last = safeNumber(localStorage.getItem(STORAGE_KEY));
    if (!last) return false;

    const diffMs = now() - last;
    const diffDays = diffMs / DAY_MS;
    return diffDays < COOLDOWN_DAYS;
  };

  const startLive = () => {
    stopLive();
    liveTimer = setInterval(() => {
      liveLine = (liveLine + 1) % scanLines.length;
    }, 900);
  };

  const stopLive = () => {
    if (liveTimer) {
      clearInterval(liveTimer);
      liveTimer = null;
    }
  };

  // robust scroll lock (restores prior state and avoids layout shift)
  const lockScroll = () => {
    if (!browser) return;

    const html = document.documentElement;
    const body = document.body;

    // save previous styles (restore exactly)
    prevHtmlOverflow = html.style.overflow;
    prevBodyOverflow = body.style.overflow;
    prevBodyPaddingRight = body.style.paddingRight;

    // prevent layout shift from scrollbar disappearance
    const scrollbarW = window.innerWidth - html.clientWidth;
    if (scrollbarW > 0) {
      body.style.paddingRight = `${scrollbarW}px`;
    }

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    html.classList.add("nx-modal-lock");
    body.classList.add("nx-modal-lock");
  };

  const unlockScroll = () => {
    if (!browser) return;

    const html = document.documentElement;
    const body = document.body;

    html.classList.remove("nx-modal-lock");
    body.classList.remove("nx-modal-lock");

    html.style.overflow = prevHtmlOverflow || "";
    body.style.overflow = prevBodyOverflow || "";
    body.style.paddingRight = prevBodyPaddingRight || "";
  };

  const getFocusable = () => {
    if (!dialogEl) return [] as HTMLElement[];
    return Array.from(
      dialogEl.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden"));
  };

  const focusFirst = async () => {
    await tick();
    const focusable = getFocusable();
    if (focusable.length) focusable[0].focus();
    else dialogEl?.focus?.();
  };

  const focusTabButton = async (target: Tab) => {
    await tick();
    const id = target === "scan" ? tabScanId : tabResultsId;
    const el = document.getElementById(id) as HTMLButtonElement | null;
    el?.focus?.();
  };

  // priority order:
  // - hide24h => set HIDE_UNTIL
  // - hide7d  => set HIDE_UNTIL
  // - else    => default 7d behavior via STORAGE_KEY
  const applyDismissPolicy = () => {
    if (!browser) return;

    if (hide24h) {
      localStorage.setItem(HIDE_UNTIL_KEY, String(now() + DAY_MS));
      return;
    }
    if (hide7d) {
      localStorage.setItem(HIDE_UNTIL_KEY, String(now() + DAYS7_MS));
      return;
    }

    // default: hide by cooldown days
    localStorage.setItem(STORAGE_KEY, String(now()));
  };

  const clearOpenTimer = () => {
    if (openTimer) {
      clearTimeout(openTimer);
      openTimer = null;
    }
  };

  const openModal = async () => {
    if (!browser) return;
    if (open) return; // ✅ 중복 오픈 방지

    clearOpenTimer();

    lastActive = (document.activeElement as HTMLElement) ?? null;

    open = true;
    tab = "scan";
    liveLine = 0;

    hide24h = false;
    hide7d = false;

    startLive();
    lockScroll();

    // focus shell first, then first focusable (screen reader 안정)
    await tick();
    shellEl?.focus?.();
    await focusFirst();
  };

  const closeModal = () => {
    if (!open) return;

    open = false;
    stopLive();
    unlockScroll();

    if (browser) applyDismissPolicy();

    lastActive?.focus?.();
  };

  const runCheck = () => {
    closeModal();
    goto("/ai-intake");
  };

  const setTab = (next: Tab) => {
    if (tab === next) return;
    tab = next;
    if (tab === "scan") startLive();
    else stopLive();
  };

  const toggleHide24h = () => {
    hide24h = !hide24h;
    if (hide24h) hide7d = false;
  };

  const toggleHide7d = () => {
    hide7d = !hide7d;
    if (hide7d) hide24h = false;
  };

  // focus trap + ESC + tab keyboard support
  const onKeydown = (e: KeyboardEvent) => {
    if (!open) return;

    // ESC close
    if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
      return;
    }

    // Tab trap
    if (e.key === "Tab") {
      const focusable = getFocusable();
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (!active || active === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (!active || active === last) {
          e.preventDefault();
          first.focus();
        }
      }
      return;
    }

    // Tabs: Left/Right to switch when focus is on tab buttons
    const activeId = (document.activeElement as HTMLElement | null)?.id;
    const onTabButtons = activeId === tabScanId || activeId === tabResultsId;

    if (onTabButtons && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
      e.preventDefault();
      const next: Tab =
        e.key === "ArrowLeft"
          ? (tab === "scan" ? "results" : "scan")
          : (tab === "scan" ? "results" : "scan");

      setTab(next);
      void focusTabButton(next);
    }
  };

  // outside click close: only when clicking the shell itself
  const onShellPointerDown = (e: PointerEvent) => {
    if (e.target === e.currentTarget) closeModal();
  };

  // stop inside clicks from closing
  const onCardPointerDown = (e: PointerEvent) => {
    e.stopPropagation();
  };

  onMount(() => {
    if (!browser) return;

    // prefers-reduced-motion
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    reduceMotion = !!mq?.matches;
    const onMqChange = () => (reduceMotion = !!mq?.matches);
    mq?.addEventListener?.("change", onMqChange);

    // cooldown
    if (!DEV_ALWAYS_SHOW && withinCooldown()) return;

    openTimer = setTimeout(() => {
      openModal();
    }, OPEN_DELAY_MS);

    // dev reset helper
    if (DEV_ALWAYS_SHOW) {
      (window as any).__nxResetIndustryScanner = () => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(HIDE_UNTIL_KEY);
        console.info("[NovaNexus] Industry scanner cooldown reset");
      };
    }

    // stable listener ref (remove works reliably)
    window.addEventListener("keydown", onKeydown, { passive: false });

    return () => {
      mq?.removeEventListener?.("change", onMqChange);
    };
  });

  onDestroy(() => {
    clearOpenTimer();
    stopLive();
    unlockScroll();
    if (browser) window.removeEventListener("keydown", onKeydown as any);
  });
</script>

{#if open}
  <!-- Backdrop -->
  <div
    class="nx-backdrop"
    aria-hidden="true"
    style={reduceMotion ? "animation: none;" : undefined}
  ></div>

  <!-- Shell -->
  <div
    class="nx-shell"
    bind:this={shellEl}
    role="dialog"
    aria-modal="true"
    aria-labelledby={dialogLabelId}
    aria-describedby={dialogDescId}
    tabindex="-1"
    on:pointerdown={onShellPointerDown}
  >
    <div
      bind:this={dialogEl}
      class="nx-card"
      tabindex="-1"
      on:pointerdown={onCardPointerDown}
      style={reduceMotion ? "animation: none;" : undefined}
    >
      <!-- Top chrome -->
      <div class="nx-top">
        <div class="nx-badges">
          <span class="nx-pill nx-pill--live">
            <span class="nx-dot" aria-hidden="true"></span>
            AI RFQ CHECK
          </span>
          <span class="nx-pill nx-pill--trial">FREE TRIAL</span>
        </div>

        <button class="nx-close" type="button" on:click={closeModal} aria-label="Close">
          ✕
        </button>
      </div>

      <!-- Main content -->
      <div class="nx-body">
        <!-- Left -->
        <div class="nx-left">
          <h2 class="nx-title" id={dialogLabelId}>
            Put your factory on the global sourcing map —
            <span class="nx-accent">in minutes, not months.</span>
          </h2>

          <p class="nx-sub" id={dialogDescId}>
            Start a free trial and let NovaNexus present your capabilities where
            real buyer demand is active — across regions and industries.
          </p>

          <div class="nx-trust">
            <span>Cancel anytime</span>
            <span class="nx-sep" aria-hidden="true">•</span>
            <span>No outreach unless you opt in</span>
            <span class="nx-sep" aria-hidden="true">•</span>
            <span>Read-only preview first</span>
          </div>

          <!-- Snooze -->
          <div class="nx-snooze" aria-label="Hide options">
            <label class="nx-checkRow">
              <input type="checkbox" bind:checked={hide24h} on:change={toggleHide24h} />
              <span class="nx-checkText">Don’t show again today (24h)</span>
            </label>

            <label class="nx-checkRow">
              <input type="checkbox" bind:checked={hide7d} on:change={toggleHide7d} />
              <span class="nx-checkText">Don’t show for 7 days</span>
            </label>

            <div class="nx-snoozeHint">
              Tip: If you don’t select an option, closing hides this for <b>7 days</b> by default.
            </div>
          </div>

          <!-- Tabs -->
          <div class="nx-tabs" role="tablist" aria-label="AI RFQ tabs">
            <button
              id={tabScanId}
              type="button"
              class:active={tab === "scan"}
              role="tab"
              aria-selected={tab === "scan"}
              aria-controls={tabPanelScanId}
              tabindex={tab === "scan" ? 0 : -1}
              on:click={() => setTab("scan")}
            >
              Scan
            </button>
            <button
              id={tabResultsId}
              type="button"
              class:active={tab === "results"}
              role="tab"
              aria-selected={tab === "results"}
              aria-controls={tabPanelResultsId}
              tabindex={tab === "results" ? 0 : -1}
              on:click={() => setTab("results")}
            >
              Results
            </button>
          </div>

          <!-- Panel -->
          {#if tab === "scan"}
            <div
              class="nx-panel"
              role="tabpanel"
              id={tabPanelScanId}
              aria-labelledby={tabScanId}
            >
              <div class="nx-panelTop">
                <div class="nx-label">Live scan</div>
                <div class="nx-status">
                  <span class="nx-pulse" aria-hidden="true"></span>
                  Running
                </div>
              </div>

              <div class="nx-liveLine" aria-live="polite">
                <span class="nx-sweep" aria-hidden="true"></span>

                <!-- ✅ keyed: 라인 변경 시 애니메이션/스크린리더 안정 -->
                {#key liveLine}
                  <span class="nx-mono">{scanLines[liveLine]}</span>
                {/key}
              </div>

              <div class="nx-meter" aria-hidden="true">
                <div class="nx-meterFill"></div>
              </div>

              <div class="nx-ctaRow">
                <button type="button" class="nx-cta" on:click={runCheck}>
                  Run AI RFQ Check
                </button>
                <button type="button" class="nx-ghost" on:click={() => setTab("results")}>
                  See what you’ll get →
                </button>
              </div>
            </div>
          {:else}
            <div
              class="nx-panel"
              role="tabpanel"
              id={tabPanelResultsId}
              aria-labelledby={tabResultsId}
            >
              <div class="nx-panelTop">
                <div class="nx-label">What you unlock</div>
                <div class="nx-status">
                  <span class="nx-check" aria-hidden="true">✓</span>
                  Preview-ready
                </div>
              </div>

              <ul class="nx-bullets">
                <li><span class="nx-bulletDot"></span> A clean, quote-ready RFQ preview (drawings + scope).</li>
                <li><span class="nx-bulletDot"></span> Region + process fit signals buyers actually use.</li>
                <li><span class="nx-bulletDot"></span> A shareable supplier profile built for trust.</li>
              </ul>

              <div class="nx-ctaRow">
                <button type="button" class="nx-cta" on:click={runCheck}>
                  Start free trial
                </button>
                <button type="button" class="nx-ghost" on:click={() => setTab("scan")}>
                  Back to scan →
                </button>
              </div>
            </div>
          {/if}
        </div>

        <!-- Right -->
        <div class="nx-right" aria-hidden="true">
          <div class="nx-orb">
            <div class="nx-grid"></div>
            <div class="nx-spot"></div>
            <div class="nx-ring"></div>
            <div class="nx-ring nx-ring--2"></div>
            <div class="nx-ring nx-ring--3"></div>

            <div class="nx-proof">
              {#each proof as p}
                <div class="nx-proofCard">
                  <div class="nx-proofK">{p.k}</div>
                  <div class="nx-proofV">{p.v}</div>
                </div>
              {/each}
            </div>
          </div>

          <div class="nx-sideNote">
            Your profile is shown only after you approve it.
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Scroll lock */
  :global(html.nx-modal-lock),
  :global(body.nx-modal-lock) {
    overflow: hidden;
  }

  /* Backdrop */
  .nx-backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
    background: rgba(2, 6, 23, 0.9);
    backdrop-filter: blur(14px);
    animation: nxFadeIn 180ms ease-out both;
  }

  /* Shell */
  .nx-shell {
    position: fixed;
    inset: 0;
    z-index: 110;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 18px;
    outline: none;
  }

  /* Card */
  .nx-card {
    width: 100%;
    max-width: 860px;
    border-radius: 22px;
    background: rgba(2, 6, 23, 0.985);
    border: 1px solid rgba(255, 255, 255, 0.10);
    box-shadow: 0 60px 160px rgba(0, 0, 0, 0.72);
    overflow: hidden;
    transform-origin: center;
    animation: nxEnter 260ms cubic-bezier(.2, .9, .2, 1) both;
    position: relative;
    outline: none;
  }

  .nx-card::before {
    content: "";
    position: absolute;
    inset: -120px;
    background:
      radial-gradient(circle at 18% 20%, rgba(34, 211, 238, 0.28), transparent 55%),
      radial-gradient(circle at 82% 18%, rgba(244, 114, 182, 0.22), transparent 52%),
      radial-gradient(circle at 55% 88%, rgba(16, 185, 129, 0.18), transparent 55%);
    filter: blur(26px);
    opacity: 0.92;
    animation: nxAurora 6.5s ease-in-out infinite;
    pointer-events: none;
  }

  .nx-card::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 30%);
    pointer-events: none;
  }

  /* Top */
  .nx-top {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .nx-badges {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .nx-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    white-space: nowrap;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(15, 23, 42, 0.55);
    color: rgba(226, 232, 240, 0.92);
  }

  .nx-pill--live {
    border-color: rgba(34, 211, 238, 0.25);
    box-shadow: 0 0 18px rgba(34, 211, 238, 0.12);
  }

  .nx-pill--trial {
    border-color: rgba(244, 114, 182, 0.22);
    color: rgba(255, 255, 255, 0.90);
  }

  .nx-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: rgba(34, 211, 238, 0.95);
    box-shadow: 0 0 14px rgba(34, 211, 238, 0.55);
    animation: nxPulse 1.2s ease-in-out infinite;
  }

  .nx-close {
    height: 34px;
    width: 34px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(15, 23, 42, 0.50);
    color: rgba(226, 232, 240, 0.90);
    cursor: pointer;
    transition: transform 120ms ease, background 120ms ease, border-color 120ms ease;
    position: relative;
    z-index: 3;
  }
  .nx-close:hover {
    transform: translateY(-1px);
    background: rgba(15, 23, 42, 0.68);
    border-color: rgba(255, 255, 255, 0.18);
  }
  .nx-close:active { transform: translateY(0px) scale(0.98); }

  /* Body grid */
  .nx-body {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: 1.18fr 0.82fr;
    gap: 18px;
    padding: 18px;
  }

  @media (max-width: 900px) {
    .nx-body { grid-template-columns: 1fr; }
    .nx-right { display: none; }
  }

  /* Left */
  .nx-left { padding: 6px 8px; }

  .nx-title {
    font-size: 28px;
    line-height: 1.12;
    font-weight: 650;
    color: rgba(248, 250, 252, 0.98);
    margin: 6px 0 10px;
    animation: nxTextIn 420ms ease-out both;
  }

  .nx-accent {
    background: linear-gradient(90deg, rgba(34, 211, 238, 0.95), rgba(16, 185, 129, 0.90));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .nx-sub {
    color: rgba(226, 232, 240, 0.80);
    line-height: 1.55;
    font-size: 14px;
    max-width: 54ch;
    animation: nxTextIn 520ms ease-out both;
  }

  .nx-trust {
    margin-top: 10px;
    font-size: 12px;
    color: rgba(148, 163, 184, 0.86);
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .nx-sep { opacity: 0.65; }

  /* Snooze */
  .nx-snooze {
    margin-top: 10px;
    padding: 10px 12px;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.09);
    background: rgba(15, 23, 42, 0.40);
    display: grid;
    gap: 8px;
  }

  .nx-checkRow {
    display: flex;
    align-items: center;
    gap: 10px;
    color: rgba(226, 232, 240, 0.85);
    font-size: 12px;
    cursor: pointer;
    user-select: none;
  }

  .nx-checkRow input {
    width: 14px;
    height: 14px;
    accent-color: rgba(34, 211, 238, 0.95);
  }

  .nx-checkText { line-height: 1.2; }

  .nx-snoozeHint {
    margin-top: 2px;
    font-size: 11px;
    color: rgba(148, 163, 184, 0.82);
  }
  .nx-snoozeHint b {
    color: rgba(226, 232, 240, 0.92);
    font-weight: 650;
  }

  /* Tabs */
  .nx-tabs {
    margin-top: 14px;
    display: inline-flex;
    padding: 4px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.10);
    background: rgba(15, 23, 42, 0.55);
    gap: 6px;
  }
  .nx-tabs button {
    border: 0;
    background: transparent;
    color: rgba(226, 232, 240, 0.76);
    padding: 8px 12px;
    border-radius: 999px;
    font-size: 12px;
    cursor: pointer;
    transition: background 120ms ease, color 120ms ease, transform 120ms ease;
  }
  .nx-tabs button:hover { transform: translateY(-1px); }
  .nx-tabs button.active {
    background: rgba(2, 6, 23, 0.9);
    color: rgba(248, 250, 252, 0.95);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08) inset;
  }

  /* Panel */
  .nx-panel {
    margin-top: 12px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.10);
    background: rgba(15, 23, 42, 0.42);
    padding: 14px;
    position: relative;
    overflow: hidden;
  }

  .nx-panel::before {
    content: "";
    position: absolute;
    inset: -1px;
    background: linear-gradient(120deg,
      rgba(34, 211, 238, 0.18),
      rgba(244, 114, 182, 0.12),
      rgba(16, 185, 129, 0.14));
    opacity: 0.55;
    filter: blur(18px);
    pointer-events: none;
  }

  .nx-panelTop {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .nx-label {
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(148, 163, 184, 0.95);
  }

  .nx-status {
    font-size: 12px;
    color: rgba(226, 232, 240, 0.85);
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .nx-pulse {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: rgba(16, 185, 129, 0.95);
    box-shadow: 0 0 16px rgba(16, 185, 129, 0.45);
    animation: nxPulse 1.2s ease-in-out infinite;
  }

  .nx-check {
    display: inline-flex;
    width: 16px;
    height: 16px;
    border-radius: 999px;
    align-items: center;
    justify-content: center;
    background: rgba(16, 185, 129, 0.18);
    border: 1px solid rgba(16, 185, 129, 0.30);
    color: rgba(167, 243, 208, 0.95);
    font-size: 11px;
  }

  .nx-liveLine {
    position: relative;
    z-index: 2;
    border-radius: 12px;
    padding: 12px 12px;
    border: 1px solid rgba(34, 211, 238, 0.20);
    background: rgba(2, 6, 23, 0.78);
    overflow: hidden;
  }

  .nx-mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 12px;
    color: rgba(224, 242, 254, 0.92);
  }

  .nx-sweep {
    position: absolute;
    inset: 0;
    background: linear-gradient(110deg,
      transparent 0%,
      rgba(34, 211, 238, 0.16) 40%,
      transparent 70%);
    transform: translateX(-60%);
    animation: nxSweep 1.6s ease-in-out infinite;
    pointer-events: none;
  }

  .nx-meter {
    position: relative;
    z-index: 2;
    margin-top: 10px;
    height: 10px;
    border-radius: 999px;
    background: rgba(148, 163, 184, 0.18);
    overflow: hidden;
  }
  .nx-meterFill {
    height: 100%;
    width: 60%;
    border-radius: 999px;
    background: linear-gradient(90deg, rgba(34, 211, 238, 0.92), rgba(16, 185, 129, 0.88));
    animation: nxMeter 1.8s ease-in-out infinite;
  }

  .nx-bullets {
    position: relative;
    z-index: 2;
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 10px;
    color: rgba(226, 232, 240, 0.86);
    font-size: 13px;
    line-height: 1.45;
  }
  .nx-bulletDot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: rgba(34, 211, 238, 0.85);
    margin-right: 10px;
    box-shadow: 0 0 14px rgba(34, 211, 238, 0.24);
    transform: translateY(-1px);
  }

  .nx-ctaRow {
    position: relative;
    z-index: 2;
    margin-top: 12px;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
  }

  .nx-cta {
    border: 0;
    cursor: pointer;
    padding: 11px 14px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 650;
    color: rgba(2, 6, 23, 0.98);
    background: linear-gradient(90deg, rgba(34, 211, 238, 0.95), rgba(16, 185, 129, 0.92));
    box-shadow: 0 18px 40px rgba(34, 211, 238, 0.14);
    transition: transform 120ms ease, filter 120ms ease, box-shadow 120ms ease;
  }
  .nx-cta:hover { filter: brightness(1.06); transform: translateY(-1px); }
  .nx-cta:active { transform: translateY(0px) scale(0.985); box-shadow: 0 10px 24px rgba(34, 211, 238, 0.12); }

  .nx-ghost {
    border: 0;
    cursor: pointer;
    padding: 10px 10px;
    border-radius: 12px;
    font-size: 13px;
    background: transparent;
    color: rgba(226, 232, 240, 0.78);
    transition: color 120ms ease, transform 120ms ease;
  }
  .nx-ghost:hover { color: rgba(248, 250, 252, 0.95); transform: translateY(-1px); }
  .nx-ghost:active { transform: translateY(0px); }

  /* Right visual */
  .nx-right {
    padding: 10px 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    justify-content: center;
  }

  .nx-orb {
    position: relative;
    height: 320px;
    border-radius: 18px;
    border: 1px solid rgba(255, 255, 255, 0.10);
    background: rgba(15, 23, 42, 0.38);
    overflow: hidden;
  }

  .nx-grid {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
    background-size: 42px 42px;
    mask-image: radial-gradient(circle at 55% 45%, black 0%, transparent 70%);
    opacity: 0.9;
    animation: nxGrid 10s linear infinite;
  }

  .nx-spot {
    position: absolute;
    inset: -40%;
    background:
      radial-gradient(circle at 30% 20%, rgba(34, 211, 238, 0.22), transparent 45%),
      radial-gradient(circle at 70% 60%, rgba(244, 114, 182, 0.18), transparent 48%),
      radial-gradient(circle at 50% 90%, rgba(16, 185, 129, 0.16), transparent 50%);
    filter: blur(22px);
    animation: nxAurora 7.5s ease-in-out infinite;
  }

  .nx-ring {
    position: absolute;
    inset: 22px;
    border-radius: 999px;
    border: 1px solid rgba(34, 211, 238, 0.18);
    box-shadow: 0 0 30px rgba(34, 211, 238, 0.10);
    animation: nxSpin 26s linear infinite;
  }
  .nx-ring--2 { inset: 52px; border-color: rgba(16, 185, 129, 0.14); animation-duration: 34s; }
  .nx-ring--3 { inset: 82px; border-color: rgba(244, 114, 182, 0.12); animation-duration: 42s; }

  .nx-proof {
    position: absolute;
    inset: 0;
    display: grid;
    place-content: center;
    gap: 10px;
    padding: 16px;
    z-index: 2;
  }

  .nx-proofCard {
    width: 250px;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.10);
    background: rgba(2, 6, 23, 0.76);
    padding: 10px 12px;
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.28);
    transform: translateY(0);
    animation: nxFloat 4.6s ease-in-out infinite;
  }
  .nx-proofCard:nth-child(2) { animation-delay: 0.25s; }
  .nx-proofCard:nth-child(3) { animation-delay: 0.5s; }

  .nx-proofK {
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(148, 163, 184, 0.90);
  }
  .nx-proofV {
    margin-top: 4px;
    font-size: 14px;
    font-weight: 650;
    color: rgba(248, 250, 252, 0.94);
  }

  .nx-sideNote {
    font-size: 12px;
    color: rgba(148, 163, 184, 0.85);
    padding-left: 6px;
  }

  /* Animations */
  @keyframes nxEnter {
    from { opacity: 0; transform: translateY(14px) scale(0.99); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes nxFadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes nxPulse {
    0%, 100% { transform: scale(1); opacity: 0.95; }
    50% { transform: scale(1.2); opacity: 0.70; }
  }
  @keyframes nxSweep {
    0%   { transform: translateX(-70%); opacity: 0.3; }
    50%  { opacity: 0.9; }
    100% { transform: translateX(70%); opacity: 0.25; }
  }
  @keyframes nxMeter {
    0% { transform: translateX(-20%); width: 52%; }
    50% { transform: translateX(20%); width: 72%; }
    100% { transform: translateX(-20%); width: 52%; }
  }
  @keyframes nxSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes nxFloat {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
  }
  @keyframes nxGrid { from { transform: translateY(0px); } to { transform: translateY(42px); } }
  @keyframes nxAurora {
    0%, 100% { transform: translateY(0px); opacity: 0.85; }
    50% { transform: translateY(10px); opacity: 1; }
  }
  @keyframes nxTextIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0px); }
  }

  /* Reduce motion: (CSS 레벨에서도 최대한 억제) */
  @media (prefers-reduced-motion: reduce) {
    .nx-backdrop,
    .nx-card,
    .nx-dot,
    .nx-sweep,
    .nx-meterFill,
    .nx-ring,
    .nx-grid,
    .nx-spot,
    .nx-proofCard,
    .nx-title,
    .nx-sub {
      animation: none !important;
      transition: none !important;
    }
  }
</style>
