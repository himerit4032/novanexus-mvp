<!-- src/routes/pricing/+page.svelte -->

<svelte:head>
  <title>Pricing ▢ Supplier plans | NovaNexus</title>
</svelte:head>

<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { goto } from '$app/navigation';

  type Billing = 'monthly' | 'annual';
  const TRIAL_DAYS = 7;

  let billing: Billing = 'monthly';

  type PlanId = 'basic' | 'verified' | 'prime' | 'enterprise';

  interface Plan {
    id: PlanId;
    name: string;
    badge: string;
    highlight: boolean;

    // Enterprise는 커스텀이므로 null 허용
    monthlyPrice: number | null;
    yearlyPrice: number | null;

    shortTagline: string;
    description: string;
    bestFor: string;
    roiNote: string;

    core: string[];
    ai: string[];
    support: string[];

    cta: string;
    ctaSub: string;
  }

  const plans: Plan[] = [
    {
      id: 'basic',
      name: 'Basic (Free)',
      badge: 'Entry',
      highlight: false,
      monthlyPrice: 0,
      yearlyPrice: 0,
      shortTagline: 'Get listed, watch the RFQ flow.',
      description:
        'For factories that want to see what kinds of projects move through NovaNexus before committing budget.',
      bestFor: 'Shops testing a new region/vertical, or teams still validating platform fit.',
      roiNote: 'Acts as a live radar on upcoming lines and upgrades — no card needed.',
      core: [
        'Supplier profile published in the NovaNexus directory',
        'Capability + process tags for relevant search visibility',
        'Limited RFQ previews with high-level scope summaries'
      ],
      ai: [
        'Single AI RFQ Check demo (limited)',
        'Basic signal on fit before spending engineering time'
      ],
      support: [
        'Email support for onboarding questions',
        'Occasional snapshot of RFQ trends by vertical'
      ],
      cta: 'Continue with free plan',
      ctaSub: 'Good for early exploration and light usage.'
    },
    {
      id: 'verified',
      name: 'Verified Supplier',
      badge: 'Most popular',
      highlight: true,
      monthlyPrice: 195,
      yearlyPrice: 1950,
      shortTagline: 'Full RFQ detail + verified badge.',
      description:
        'Designed for OEMs, integrators and fabricators who quote actively and want a clean, qualified RFQ pipeline.',
      bestFor:
        'Teams that quote weekly, value engineering time, and want predictable opportunities instead of inbox noise.',
      roiNote: 'Closing a single mid-tier RFQ often covers a full year of fees in most regions.',
      core: [
        'Verified badge across RFQs, search results and profiles',
        'Full RFQ visibility — drawings, budgets, specs and deadlines',
        'Precision matching by region, capabilities and project size',
        'Priority placement in supplier search and RFQ recommendations'
      ],
      ai: [
        'AI RFQ Check — up to 20 detailed analyses / month',
        'Risk, scope gap and manufacturability flags before quoting',
        'Smart prompts on what to clarify before committing engineering hours'
      ],
      support: [
        'Priority email support and onboarding sessions',
        'Quarterly performance review with win-rate signals',
        'Option to join closed pilots and beta features'
      ],
      cta: `Start ${TRIAL_DAYS}-day free trial`,
      ctaSub: 'Card required; cancel anytime during the trial to avoid charges.'
    },
    {
      id: 'prime',
      name: 'Prime Supplier',
      badge: 'Elite access',
      highlight: false,
      monthlyPrice: 395,
      yearlyPrice: 3950,
      shortTagline: 'Top-of-list exposure and deeper insight.',
      description:
        'For strategic suppliers that want first look at large CAPEX programs, plus analytics and white-glove support.',
      bestFor: 'Multi-site groups and global players with dedicated BD / quoting teams.',
      roiNote: 'A single multi-line or multi-plant program can return many times the annual fee.',
      core: [
        'Featured placement at the very top of key categories',
        'First access to select large and multi-site RFQs',
        'Ability to signal appetite by project size, process and region'
      ],
      ai: [
        'Unlimited AI RFQ Checks with risk and scope breakdowns',
        'Side-by-side similarity views against past platform RFQs',
        'Nudges when RFQs match under-utilised lines/cells'
      ],
      support: [
        'Dedicated account manager with fast SLAs',
        'Monthly performance and insight reports',
        'Co-branded success stories and case studies'
      ],
      cta: `Start ${TRIAL_DAYS}-day free trial`,
      ctaSub: 'Upgrade or downgrade online at any time.'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      badge: 'Custom terms',
      highlight: false,
      monthlyPrice: null,
      yearlyPrice: null,
      shortTagline: 'Multi-entity, SLA, and custom routing.',
      description:
        'For supplier groups that need consolidated billing, multi-entity access control, SLAs, and tailored RFQ routing.',
      bestFor:
        'Holdings / multi-site suppliers, global integrators, or teams needing compliance + internal approvals.',
      roiNote: 'Built for scale: governance, reporting, and optional procurement integrations.',
      core: [
        'Consolidated billing + multi-entity permissions',
        'Advanced visibility controls per site / division',
        'Custom routing rules by process, region and project thresholds'
      ],
      ai: [
        'Custom AI quota policies per entity/team',
        'Team-level RFQ triage workflow + internal notes',
        'Optional private benchmarking reports'
      ],
      support: [
        'SLA-backed support options',
        'Dedicated onboarding + enablement sessions',
        'Optional co-marketing and strategic account review'
      ],
      cta: 'Talk to sales',
      ctaSub: 'Get a custom proposal within 24–48h.'
    }
  ];

  const stats = [
    {
      label: 'Typical RFQ ticket size',
      value: '$180k–$4.8M',
      note: 'Most projects are capital equipment or multi-cell upgrades.'
    },
    {
      label: 'Payback from one win',
      value: '1×–5×',
      note: 'Closing a single mid-tier project often returns the yearly fee.'
    },
    {
      label: 'Live / in-review RFQs',
      value: '20–40',
      note: 'Volume flexes by region and vertical; quality stays high.'
    }
  ];

  const comparisonRows = [
    {
      label: 'Visibility in search and categories',
      basic: 'Listed in relevant categories',
      verified: 'Highlighted with verified badge',
      prime: 'Featured at the very top',
      enterprise: 'Custom placements per vertical'
    },
    {
      label: 'RFQ details you see',
      basic: 'High-level summaries only',
      verified: 'Full scope, drawings and budget ranges',
      prime: 'Full details + early access on select RFQs',
      enterprise: 'Custom access controls by entity/team'
    },
    {
      label: 'AI RFQ checks',
      basic: 'Single demo',
      verified: 'Up to 20 / month',
      prime: 'Unlimited',
      enterprise: 'Custom quotas + workflows'
    },
    {
      label: 'Support and reporting',
      basic: 'Standard email support',
      verified: 'Priority support + quarterly review',
      prime: 'Dedicated manager + monthly reporting',
      enterprise: 'SLA options + strategic reviews'
    }
  ];

  const faqs = [
    {
      q: 'What happens after the free trial?',
      a:
        `If you stay on a paid plan past the ${TRIAL_DAYS}-day trial, billing starts automatically and renews each period. You can downgrade to Basic or cancel any time; access remains until the end of the current cycle.`
    },
    {
      q: 'How do we cancel or change plans?',
      a:
        'From your account you will have a “Manage billing” link that opens a secure billing portal. There you can cancel, downgrade to Basic (free), or switch between Verified and Prime.'
    },
    {
      q: 'Do you charge onboarding or setup fees?',
      a:
        'No setup fees and no long-term contracts on standard plans. Enterprise can include custom terms, SLAs and consolidated billing.'
    }
  ];

  function formattedPrice(plan: Plan): string {
    if (plan.monthlyPrice === null || plan.yearlyPrice === null) return 'Custom';

    if (billing === 'monthly') return `$${plan.monthlyPrice.toLocaleString()}`;
    return `$${plan.yearlyPrice.toLocaleString()}`;
  }

  function billingSuffix(plan: Plan): string {
    if (plan.monthlyPrice === null || plan.yearlyPrice === null) return '';
    return billing === 'monthly' ? '/month' : '/year';
  }

  function billingDetail(): string {
    return billing === 'monthly'
      ? '/month, billed monthly'
      : '/year, billed annually (roughly 2 months free).';
  }

  let openFaqIndex: number | null = 0;

  // ✅ 실제 존재하는 가입 라우트로 보내기 (너의 프로젝트에 /auth/join 있음)
  const SIGNUP_PATH = '/auth/join';
  const SALES_PATH = '/contact'; // 없으면 만들어도 되고, 임시로 /about#contact 같은 것도 가능
  const BILLING_PORTAL_PATH = '/account/billing'; // "Manage billing" 전용 페이지(권장)

  function selectPlan(plan: Plan) {
    if (plan.id === 'enterprise') {
      const params = new URLSearchParams({
        intent: 'enterprise',
        source: 'pricing-page'
      });
      goto(`${SALES_PATH}?${params.toString()}`);
      return;
    }

    const params = new URLSearchParams({
      plan: plan.id,
      billing,
      trial_days: String(TRIAL_DAYS),
      source: 'pricing-page'
    });

    goto(`${SIGNUP_PATH}?${params.toString()}`);
  }

  function openBillingPortal() {
    goto(BILLING_PORTAL_PATH);
  }
</script>

<section class="nn-page pr-page" in:fade={{ duration: 260 }}>
  <!-- HEADER / HERO -->
  <header class="pr-header" in:fly={{ y: 18, duration: 340 }}>
    <div class="pr-kicker">SUPPLIER PLANS</div>

    <h1 class="pr-title">
      <span class="pr-title-gradient">
        Free to join. Verified &amp; Prime unlock the RFQ pipeline that actually closes.
      </span>
    </h1>

    <p class="pr-sub">
      NovaNexus filters out weak leads so factories and integrators only see projects they can realistically
      build, ship and install. Basic puts your company on the map. Verified and Prime unlock full RFQ detail,
      AI checks and priority placement where you are truly competitive. Enterprise adds multi-entity governance
      and custom routing.
    </p>

    <div class="pr-metrics">
      {#each stats as s}
        <div class="pr-metric-pill">
          <div class="pr-metric-label">{s.label}</div>
          <div class="pr-metric-value">{s.value}</div>
          <div class="pr-metric-note">{s.note}</div>
        </div>
      {/each}
    </div>
  </header>

  <!-- BILLING TOGGLE + CONTEXT -->
  <section class="pr-billing-row" in:fade={{ duration: 260, delay: 60 }}>
    <div class="pr-billing-card">
      <p class="pr-billing-label">Billing preference</p>

      <div class="pr-billing-toggle" role="tablist" aria-label="Billing preference">
        <button
          type="button"
          class={`pr-toggle-btn ${billing === 'monthly' ? 'pr-toggle-btn--active' : ''}`}
          on:click={() => (billing = 'monthly')}
          aria-pressed={billing === 'monthly'}
        >
          Monthly
        </button>
        <button
          type="button"
          class={`pr-toggle-btn ${billing === 'annual' ? 'pr-toggle-btn--active' : ''}`}
          on:click={() => (billing = 'annual')}
          aria-pressed={billing === 'annual'}
        >
          Annual <span class="pr-toggle-save">(Save ~2 months)</span>
        </button>
      </div>

      <p class="pr-billing-detail">{billingDetail()}</p>

      <div class="pr-billing-actions">
        <button type="button" class="pr-mini-link" on:click={openBillingPortal}>
          Manage billing / cancel
        </button>
        <span class="pr-mini-hint">Opens a secure billing portal (recommended via Stripe Customer Portal).</span>
      </div>
    </div>

    <div class="pr-context-card">
      <p class="pr-context-title">Most teams start on Verified.</p>
      <p class="pr-context-copy">
        Basic lets you watch the pipeline. Verified is where quoting teams live day-to-day. Prime is for groups
        that care about first look on large multi-site RFQs and want deeper analytics on how they win.
        Enterprise is for multi-site governance + consolidated billing.
      </p>
    </div>
  </section>

  <!-- DECORATION (must never block clicks) -->
  <div class="pr-orbit pr-orbit-outer" aria-hidden="true"></div>
  <div class="pr-orbit pr-orbit-inner" aria-hidden="true"></div>
  <div class="pr-orbit-dot pr-orbit-dot-1" aria-hidden="true"></div>
  <div class="pr-orbit-dot pr-orbit-dot-2" aria-hidden="true"></div>
  <div class="pr-orbit-dot pr-orbit-dot-3" aria-hidden="true"></div>

  <!-- PLAN CARDS -->
  <section class="pr-plan-grid" aria-label="Plans">
    {#each plans as plan, index}
      <article
        class={`pr-plan-card ${plan.highlight ? 'pr-plan-card--highlight' : ''}`}
        in:fly={{ y: 22, duration: 360, delay: 80 * index }}
      >
        <div class="pr-plan-badge-wrap">
          <h2 class="pr-plan-name">{plan.name}</h2>
          <div class={`pr-plan-pill ${plan.highlight ? 'pr-plan-pill--solid' : ''}`}>{plan.badge}</div>
        </div>

        <p class="pr-plan-tagline">{plan.shortTagline}</p>

        <div class="pr-plan-price-row">
          <div class="pr-plan-price">{formattedPrice(plan)}</div>
          <div class="pr-plan-price-suffix">{billingSuffix(plan)}</div>
        </div>

        <p class="pr-plan-desc">{plan.description}</p>

        <p class="pr-plan-meta">
          <span class="pr-plan-meta-label">Best fit:</span>
          {plan.bestFor}
        </p>

        <p class="pr-plan-roi">{plan.roiNote}</p>

        <div class="pr-plan-features">
          <div class="pr-feature-block">
            <p class="pr-feature-heading">Core access</p>
            <ul class="pr-feature-list">
              {#each plan.core as item}
                <li class="pr-feature-item">
                  <span class="pr-feature-dot pr-feature-dot--core"></span>
                  <span class="pr-feature-text">{item}</span>
                </li>
              {/each}
            </ul>
          </div>

          <div class="pr-feature-block">
            <p class="pr-feature-heading">AI &amp; insight</p>
            <ul class="pr-feature-list">
              {#each plan.ai as item}
                <li class="pr-feature-item">
                  <span class="pr-feature-dot pr-feature-dot--ai"></span>
                  <span class="pr-feature-text">{item}</span>
                </li>
              {/each}
            </ul>
          </div>

          <div class="pr-feature-block">
            <p class="pr-feature-heading">Support</p>
            <ul class="pr-feature-list">
              {#each plan.support as item}
                <li class="pr-feature-item">
                  <span class="pr-feature-dot pr-feature-dot--support"></span>
                  <span class="pr-feature-text">{item}</span>
                </li>
              {/each}
            </ul>
          </div>
        </div>

        <div class="pr-plan-cta-wrap">
          <button
            type="button"
            class={`pr-plan-cta ${plan.highlight ? 'pr-plan-cta--primary' : 'pr-plan-cta--secondary'}`}
            on:click={() => selectPlan(plan)}
          >
            {plan.cta}
          </button>
          <p class="pr-plan-cta-sub">{plan.ctaSub}</p>
        </div>
      </article>
    {/each}
  </section>

  <!-- COMPARISON -->
  <section class="pr-compare-section" in:fade={{ duration: 260, delay: 120 }}>
    <div class="pr-compare-header">
      <h2 class="pr-compare-title">Quick comparison</h2>
      <p class="pr-compare-sub">At a glance: how visibility, RFQ detail and AI checks shift between plans.</p>
    </div>

    <div class="pr-compare-table" role="table" aria-label="Plan comparison">
      <div class="pr-compare-row pr-compare-row--head" role="row">
        <div class="pr-compare-cell pr-compare-cell--label" role="columnheader">Feature</div>
        <div class="pr-compare-cell" role="columnheader">Basic</div>
        <div class="pr-compare-cell" role="columnheader">Verified</div>
        <div class="pr-compare-cell" role="columnheader">Prime</div>
        <div class="pr-compare-cell" role="columnheader">Enterprise</div>
      </div>

      {#each comparisonRows as row, rowIndex}
        <div class={`pr-compare-row ${rowIndex % 2 === 0 ? 'pr-compare-row--alt' : ''}`} role="row">
          <div class="pr-compare-cell pr-compare-cell--label" role="cell">{row.label}</div>
          <div class="pr-compare-cell" role="cell">{row.basic}</div>
          <div class="pr-compare-cell" role="cell">{row.verified}</div>
          <div class="pr-compare-cell" role="cell">{row.prime}</div>
          <div class="pr-compare-cell" role="cell">{row.enterprise}</div>
        </div>
      {/each}
    </div>
  </section>

  <!-- BILLING & FAQ -->
  <section class="pr-bottom-row">
    <div class="pr-billing-copy">
      <p class="pr-billing-copy-title">How billing and cancellation work</p>
      <p class="pr-billing-copy-body">
        Paid plans include a {TRIAL_DAYS}-day trial. Cancel anytime during the trial to avoid charges.
      </p>
      <p class="pr-billing-copy-body">
        After a paid period begins, access remains until the end of the current billing cycle.
        We typically don’t issue pro-rated refunds; switching back to Basic keeps your profile live while premium
        access is paused.
      </p>
      <p class="pr-billing-copy-footnote">
        For Enterprise: custom billing terms, SLAs, and consolidated invoicing are available.
      </p>
    </div>

    <div class="pr-faq-card">
      <p class="pr-faq-title">Common questions</p>

      <div class="pr-faq-list">
        {#each faqs as faq, faqIndex}
          <button
            type="button"
            class="pr-faq-item"
            on:click={() => (openFaqIndex = openFaqIndex === faqIndex ? null : faqIndex)}
          >
            <div class="pr-faq-item-head">
              <span class="pr-faq-question">{faq.q}</span>
              <span class="pr-faq-toggle">{openFaqIndex === faqIndex ? '−' : '+'}</span>
            </div>

            {#if openFaqIndex === faqIndex}
              <p class="pr-faq-answer" in:fade={{ duration: 160 }}>{faq.a}</p>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  </section>
</section>

<style>
  .pr-page {
    max-width: 1180px;
    margin: 0 auto;
    padding: 96px 24px 120px;
    position: relative;
    overflow: hidden;
  }

  /* ✅ 핵심: 장식 레이어는 무조건 클릭 막지 않게 */
  .pr-orbit,
  .pr-orbit-dot {
    pointer-events: none !important;
    z-index: 0 !important;
  }

  /* ✅ 핵심: 실제 인터랙션 요소는 위로 */
  .pr-header,
  .pr-billing-row,
  .pr-plan-grid,
  .pr-compare-section,
  .pr-bottom-row {
    position: relative;
    z-index: 2;
  }

  .pr-plan-card {
    position: relative;
    z-index: 3;
  }

  .pr-plan-cta {
    position: relative;
    z-index: 4;
  }

  .pr-header {
    max-width: 780px;
    margin-bottom: 32px;
  }

  .pr-kicker {
    font-size: 11px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #22d3ee;
    margin-bottom: 8px;
  }

  .pr-title {
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 10px;
  }

  .pr-title-gradient {
    background: linear-gradient(135deg, #38bdf8, #a855f7, #22c55e);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: prTitleShift 16s ease-in-out infinite;
  }

  .pr-sub {
    font-size: 14px;
    color: #9ca3af;
    max-width: 680px;
  }

  .pr-metrics {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin-top: 20px;
  }

  .pr-metric-pill {
    padding: 12px 14px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.6);
    background: radial-gradient(circle at top left, rgba(56, 189, 248, 0.16), rgba(15, 23, 42, 0.98));
    font-size: 11px;
    position: relative;
    overflow: hidden;
  }

  .pr-metric-pill::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(120deg, transparent, rgba(248, 250, 252, 0.2), transparent);
    transform: translateX(-100%);
    animation: prShimmer 9s linear infinite;
    opacity: 0.9;
  }

  .pr-metric-label {
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #bfdbfe;
    margin-bottom: 2px;
  }

  .pr-metric-value {
    font-size: 15px;
    font-weight: 600;
    color: #e5e7eb;
  }

  .pr-metric-note {
    margin-top: 2px;
    color: #9ca3af;
  }

  .pr-billing-row {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
    gap: 14px;
    margin-top: 26px;
    margin-bottom: 10px;
  }

  .pr-billing-card {
    border-radius: 24px;
    border: 1px solid rgba(148, 163, 184, 0.55);
    background: radial-gradient(circle at top left, rgba(56, 189, 248, 0.16), rgba(15, 23, 42, 0.98));
    padding: 16px 18px 18px;
    box-shadow: 0 22px 60px rgba(15, 23, 42, 0.95);
  }

  .pr-billing-label {
    font-size: 12px;
    color: #e5e7eb;
    margin-bottom: 8px;
  }

  .pr-billing-toggle {
    display: flex;
    gap: 6px;
    padding: 3px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.7);
    background: rgba(15, 23, 42, 0.98);
  }

  .pr-toggle-btn {
    flex: 1;
    border: none;
    border-radius: 999px;
    padding: 6px 10px;
    font-size: 12px;
    cursor: pointer;
    background: transparent;
    color: #e5e7eb;
    transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease, transform 0.12s ease;
  }

  .pr-toggle-btn--active {
    background: #f9fafb;
    color: #020617;
    box-shadow: 0 14px 28px rgba(15, 23, 42, 1), 0 0 0 1px rgba(248, 250, 252, 0.8);
    transform: translateY(-1px);
  }

  .pr-toggle-save {
    font-size: 10px;
    color: #22c55e;
    margin-left: 4px;
  }

  .pr-billing-detail {
    font-size: 11px;
    color: #9ca3af;
    margin-top: 6px;
  }

  .pr-billing-actions {
    margin-top: 10px;
    display: grid;
    gap: 6px;
  }

  .pr-mini-link {
    width: fit-content;
    border: none;
    background: transparent;
    color: #93c5fd;
    cursor: pointer;
    padding: 0;
    font-size: 12px;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .pr-mini-hint {
    font-size: 11px;
    color: #9ca3af;
  }

  .pr-context-card {
    border-radius: 24px;
    border: 1px solid rgba(148, 163, 184, 0.5);
    background: radial-gradient(circle at top right, rgba(59, 130, 246, 0.22), rgba(15, 23, 42, 0.98));
    padding: 16px 18px 18px;
    box-shadow: 0 22px 60px rgba(15, 23, 42, 0.95);
  }

  .pr-context-title {
    font-size: 13px;
    font-weight: 600;
    color: #e5e7eb;
    margin-bottom: 6px;
  }

  .pr-context-copy {
    font-size: 12px;
    color: #9ca3af;
  }

  .pr-orbit {
    position: absolute;
    right: -120px;
    top: 260px;
    width: 340px;
    height: 340px;
    border-radius: 50%;
    border: 1px solid rgba(148, 163, 184, 0.35);
    background: radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.4), transparent 60%);
    filter: blur(1px);
    opacity: 0.7;
  }

  .pr-orbit-outer {
    animation: prOrbitDrift 26s ease-in-out infinite alternate;
  }

  .pr-orbit-inner {
    width: 240px;
    height: 240px;
    top: 310px;
    right: -30px;
    border-color: rgba(56, 189, 248, 0.55);
    animation: prOrbitSpin 22s linear infinite;
  }

  .pr-orbit-dot {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: #22c55e;
    box-shadow: 0 0 14px rgba(34, 197, 94, 0.9);
  }

  .pr-orbit-dot-1 { top: 290px; right: 40px; animation: prDotPulse 2.4s ease-in-out infinite; }
  .pr-orbit-dot-2 { top: 420px; right: 10px; animation: prDotPulse 2.8s ease-in-out infinite 0.6s; }
  .pr-orbit-dot-3 { top: 470px; right: 150px; animation: prDotPulse 3.1s ease-in-out infinite 1s; }

  .pr-plan-grid {
    margin-top: 26px;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
  }

  .pr-plan-card {
    border-radius: 24px;
    border: 1px solid rgba(148, 163, 184, 0.55);
    background: radial-gradient(circle at top left, rgba(56, 189, 248, 0.16), rgba(15, 23, 42, 0.98));
    padding: 18px 18px 20px;
    box-shadow: 0 26px 70px rgba(15, 23, 42, 1);
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease;
    animation: prFloatCard 11s ease-in-out infinite alternate;
  }

  .pr-plan-card::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(circle at 20% 10%, rgba(168, 85, 247, 0.10), transparent 55%);
    opacity: 0.9;
  }

  .pr-plan-card:hover {
    transform: translateY(-4px);
    border-color: rgba(56, 189, 248, 0.9);
    box-shadow: 0 32px 90px rgba(15, 23, 42, 1), 0 0 0 1px rgba(56, 189, 248, 0.6);
    background: radial-gradient(circle at top left, rgba(56, 189, 248, 0.22), rgba(15, 23, 42, 0.98));
  }

  .pr-plan-card--highlight {
    border-color: rgba(34, 211, 238, 0.9);
    background: radial-gradient(circle at top left, rgba(34, 211, 238, 0.28), rgba(15, 23, 42, 0.98));
  }

  .pr-plan-badge-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .pr-plan-name {
    font-size: 18px;
    font-weight: 600;
    color: #f9fafb;
  }

  .pr-plan-pill {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid rgba(56, 189, 248, 0.6);
    color: #38bdf8;
    background: rgba(15, 23, 42, 0.95);
  }

  .pr-plan-pill--solid {
    background: #22d3ee;
    color: #020617;
    box-shadow: 0 0 0 1px rgba(248, 250, 252, 0.7);
  }

  .pr-plan-tagline {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: #a5b4fc;
    margin-top: 4px;
  }

  .pr-plan-price-row {
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin-top: 6px;
  }

  .pr-plan-price {
    font-size: 26px;
    font-weight: 600;
    color: #f9fafb;
  }

  .pr-plan-price-suffix {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: #9ca3af;
  }

  .pr-plan-desc {
    font-size: 12px;
    color: #d1d5db;
    margin-top: 4px;
  }

  .pr-plan-meta {
    font-size: 11px;
    color: #9ca3af;
  }

  .pr-plan-meta-label {
    font-weight: 600;
    color: #e5e7eb;
    margin-right: 4px;
  }

  .pr-plan-roi {
    font-size: 11px;
    color: #4ade80;
    margin-top: 2px;
  }

  .pr-plan-features {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 12px;
  }

  .pr-feature-block {
    padding-top: 4px;
    border-top: 1px solid rgba(148, 163, 184, 0.5);
  }

  .pr-feature-heading {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: #a5b4fc;
    margin-bottom: 4px;
  }

  .pr-feature-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .pr-feature-item {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin-bottom: 4px;
  }

  .pr-feature-dot {
    margin-top: 6px;
    width: 6px;
    height: 6px;
    border-radius: 999px;
  }

  .pr-feature-dot--core { background: #22d3ee; }
  .pr-feature-dot--ai { background: #6366f1; }
  .pr-feature-dot--support { background: #a855f7; }

  .pr-feature-text { color: #e5e7eb; }

  .pr-plan-cta-wrap {
    margin-top: auto;
    padding-top: 10px;
  }

  .pr-plan-cta {
    width: 100%;
    border-radius: 999px;
    border: none;
    padding: 9px 14px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    overflow: hidden;
    transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
  }

  .pr-plan-cta::after {
    content: "→";
    font-size: 13px;
    transition: transform 0.18s ease;
  }

  .pr-plan-cta--primary {
    background: conic-gradient(from 140deg, #22c1c3, #3b82f6, #a855f7, #22c1c3);
    color: #020617;
    box-shadow: 0 20px 46px rgba(15, 23, 42, 1), 0 0 0 1px rgba(248, 250, 252, 0.7);
  }

  .pr-plan-cta--secondary {
    background: linear-gradient(90deg, #38bdf8, #6366f1);
    color: #020617;
    box-shadow: 0 18px 42px rgba(15, 23, 42, 1), 0 0 0 1px rgba(148, 163, 184, 0.65);
  }

  .pr-plan-cta:hover {
    transform: translateY(-1px);
    filter: saturate(1.1);
  }
  .pr-plan-cta:hover::after {
    transform: translateX(2px);
  }

  .pr-plan-cta-sub {
    margin-top: 4px;
    font-size: 10px;
    color: #9ca3af;
  }

  .pr-compare-section { margin-top: 32px; }
  .pr-compare-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }

  .pr-compare-title { font-size: 18px; font-weight: 600; color: #f9fafb; }
  .pr-compare-sub { font-size: 12px; color: #9ca3af; max-width: 420px; }

  .pr-compare-table {
    border-radius: 24px;
    border: 1px solid rgba(148, 163, 184, 0.6);
    background: rgba(15, 23, 42, 0.98);
    overflow: hidden;
    box-shadow: 0 24px 70px rgba(15, 23, 42, 1);
  }

  .pr-compare-row {
    display: grid;
    grid-template-columns: 1.4fr 1fr 1fr 1fr 1fr;
    font-size: 11px;
  }

  .pr-compare-row--head {
    background: rgba(15, 23, 42, 0.98);
    border-bottom: 1px solid rgba(148, 163, 184, 0.7);
  }

  .pr-compare-row--alt { background: rgba(15, 23, 42, 0.96); }

  .pr-compare-cell { padding: 10px 12px; color: #e5e7eb; }
  .pr-compare-cell--label { font-weight: 500; color: #cbd5f5; }

  .pr-bottom-row {
    margin-top: 30px;
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
    gap: 16px;
  }

  .pr-billing-copy-title { font-size: 14px; font-weight: 600; color: #f9fafb; margin-bottom: 6px; }
  .pr-billing-copy-body { font-size: 12px; color: #9ca3af; margin-bottom: 6px; }
  .pr-billing-copy-footnote { font-size: 11px; color: #6b7280; }

  .pr-faq-card {
    border-radius: 24px;
    border: 1px solid rgba(148, 163, 184, 0.6);
    background: radial-gradient(circle at top right, rgba(79, 70, 229, 0.22), rgba(15, 23, 42, 0.98));
    padding: 16px 18px 18px;
    box-shadow: 0 24px 70px rgba(15, 23, 42, 1);
  }

  .pr-faq-title { font-size: 14px; font-weight: 600; color: #f9fafb; margin-bottom: 8px; }
  .pr-faq-list { display: flex; flex-direction: column; gap: 4px; }

  .pr-faq-item {
    width: 100%;
    padding: 8px 10px;
    border-radius: 16px;
    border: none;
    background: rgba(15, 23, 42, 0.92);
    cursor: pointer;
    text-align: left;
    transition: background 0.18s ease;
  }
  .pr-faq-item:hover { background: rgba(15, 23, 42, 0.98); }
  .pr-faq-item-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .pr-faq-question { font-size: 12px; color: #e5e7eb; }
  .pr-faq-toggle { font-size: 12px; color: #9ca3af; }
  .pr-faq-answer { margin-top: 4px; font-size: 11px; color: #9ca3af; }

  @media (max-width: 1100px) {
    .pr-plan-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .pr-metrics { grid-template-columns: minmax(0, 1fr); }
    .pr-billing-row { grid-template-columns: minmax(0, 1fr); }
    .pr-bottom-row { grid-template-columns: minmax(0, 1fr); }
  }

  @media (max-width: 720px) {
    .pr-page { padding-inline: 16px; }
    .pr-title { font-size: 24px; }
    .pr-plan-grid { grid-template-columns: minmax(0, 1fr); }
    .pr-compare-row { grid-template-columns: 1.3fr 1fr; }
    .pr-compare-row .pr-compare-cell:nth-child(n + 3) { border-top: 1px solid rgba(31, 41, 55, 0.9); }
  }

  @keyframes prFloatCard {
    0% { transform: translate3d(0, 0, 0); }
    100% { transform: translate3d(0, -6px, 0); }
  }

  @keyframes prOrbitDrift {
    0% { transform: translate3d(0, 0, 0); }
    100% { transform: translate3d(-18px, 10px, 0); }
  }

  @keyframes prOrbitSpin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes prDotPulse {
    0% { transform: scale(1); opacity: 1; }
    70% { transform: scale(1.5); opacity: 0.2; }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes prShimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  @keyframes prTitleShift {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.15); }
  }
</style>
