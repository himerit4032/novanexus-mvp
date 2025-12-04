<!-- src/routes/about/+page.svelte -->
<script lang="ts">
  import { fade, fly, scale } from 'svelte/transition';
  import { onMount } from 'svelte';

  let mounted = false;
  onMount(() => (mounted = true));

  const stats = [
    { label: 'Qualified suppliers in bench', value: '160+' },
    { label: 'Core manufacturing verticals', value: '12' },
    { label: 'Active regions', value: '4' }
  ];

  const threePillars = [
    {
      tag: '01 · Capability map',
      title: 'See processes, not just company names',
      body: 'Every supplier is anchored on processes, materials, tolerances and certifications – so you can search the way engineers actually think.',
      bullets: [
        'Process tags: machining, extrusion, casting, automation, clean-room and more.',
        'Material coverage and typical tolerances surfaced up-front.',
        'Certifications and industry focus at a glance.'
      ]
    },
    {
      tag: '02 · Structured RFQs',
      title: 'RFQs that quote cleanly on the first pass',
      body: 'Guided RFQ intake removes guesswork so suppliers reply with real numbers, not “call us to discuss”.',
      bullets: [
        'Required technical fields for drawings, volumes and quality expectations.',
        'File upload for drawings, BOMs and photos.',
        'Automatic hints when a critical detail is missing.'
      ]
    },
    {
      tag: '03 · Decision layer',
      title: 'Playbooks layered on top of listings',
      body: 'Lightweight guides live right next to suppliers, so teams make faster, less political decisions.',
      bullets: [
        '“Compare routes” notes for make-vs-buy, automation vs manual, extrusion vs machining.',
        'Checklists for first-time sourcing and new geographies.',
        'Signals on where capacity and lead-times are shifting.'
      ]
    }
  ];

  const buyerPoints = [
    'A shortlist of realistic manufacturing options by process and region.',
    'Cleaner RFQs that get real quotes back, faster.',
    'Early warnings on risk, lead time and rough cost bands.'
  ];

  const supplierPoints = [
    'A way to show depth without building a full marketing site.',
    'Context on what global buyers are actually asking for this year.',
    'Signals on where to invest capacity and automation next.'
  ];

  const roadmap = [
    {
      phase: 'Now · MVP',
      body: 'Curated supplier bench, structured RFQ intake and starter guides for buyers and suppliers.'
    },
    {
      phase: 'Next',
      body: 'Deeper discovery filters, more automation coverage and clearer cost / lead-time bands for common cases.'
    },
    {
      phase: 'Later',
      body: 'Lightweight analytics for suppliers, region heat-maps for buyers and richer “how to scope it” playbooks.'
    }
  ];
</script>

<svelte:head>
  <title>About ▢ NovaNexus</title>
</svelte:head>

<div class="bg-slate-950 text-slate-50">
  {#if mounted}
    <main
      class="mx-auto flex min-h-screen max-w-6xl flex-col gap-16 px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pt-16"
      in:fade={{ duration: 220 }}
    >
      <!-- ================= HERO ================= -->
      <section
        class="grid gap-10 rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-[0_32px_90px_rgba(15,23,42,0.95)] sm:p-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:p-10"
        in:fly={{ y: 20, duration: 260 }}
      >
        <!-- Text side -->
        <div class="space-y-6">
          <div class="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
            <span class="h-2 w-2 rounded-full bg-sky-400 animate-pulse-soft" />
            <span>About this platform</span>
          </div>

          <h1 class="text-4xl font-semibold tracking-tight sm:text-[2.7rem]">
            Global manufacturing,
            <span class="bg-gradient-to-r from-sky-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
              without the fog.
            </span>
          </h1>

          <p class="max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            NovaNexus sits as a neutral layer between buyers and suppliers in precision
            manufacturing and industrial automation. The goal is simple:
            <span class="font-semibold text-slate-100"> fewer surprises before a PO is ever signed.</span>
          </p>

          <div class="flex flex-wrap gap-4">
            <a
              href="/rfqs/new"
              class="rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-semibold shadow-[0_18px_45px_rgba(37,99,235,0.6)] transition hover:-translate-y-0.5 hover:bg-blue-600"
            >
              Submit an RFQ
            </a>
            <a
              href="/suppliers"
              class="rounded-xl border border-slate-600 px-6 py-2.5 text-sm font-semibold text-slate-50 transition hover:-translate-y-0.5 hover:border-slate-200 hover:bg-slate-900/80"
            >
              Become a supplier
            </a>
          </div>

          <div class="grid gap-3 text-xs text-slate-300 sm:grid-cols-3 sm:text-sm">
            {#each stats as s, i}
              <div
                class="flex flex-col gap-1 rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3"
                in:fade={{ duration: 260, delay: 120 + i * 80 }}
              >
                <span class="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                  {s.label}
                </span>
                <span class="text-xl font-semibold text-slate-50">{s.value}</span>
              </div>
            {/each}
          </div>
        </div>

        <!-- Animated visual side -->
        <div
          class="relative flex items-center justify-center"
          in:scale={{ duration: 260, delay: 80, start: 0.9 }}
        >
          <div class="relative h-64 w-64 rounded-[2rem] bg-slate-900/70 p-4 backdrop-blur-md sm:h-72 sm:w-72">
            <!-- glow background -->
            <div class="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-br from-sky-500/20 via-transparent to-fuchsia-500/20 blur-3xl" />

            <!-- radar rings -->
            <div class="relative flex h-full w-full items-center justify-center rounded-[1.5rem] border border-slate-700/80 bg-slate-950/80">
              <div class="absolute h-40 w-40 rounded-full border border-slate-700/70" />
              <div class="absolute h-28 w-28 rounded-full border border-slate-700/60" />
              <div class="absolute h-16 w-16 rounded-full border border-slate-700/50" />

              <!-- orbiting dots -->
              <div class="about-orbit about-orbit-1">
                <span class="about-orbit-dot bg-sky-400" />
              </div>
              <div class="about-orbit about-orbit-2">
                <span class="about-orbit-dot bg-emerald-400" />
              </div>
              <div class="about-orbit about-orbit-3">
                <span class="about-orbit-dot bg-violet-400" />
              </div>

              <!-- center chip -->
              <div class="relative flex flex-col items-center gap-1 rounded-xl border border-sky-500/60 bg-slate-900/90 px-4 py-3 text-center shadow-[0_0_35px_rgba(56,189,248,0.6)]">
                <span class="text-[11px] uppercase tracking-[0.22em] text-sky-300">
                  Signal over noise
                </span>
                <p class="text-xs text-slate-100">
                  Processes, capacity and risk – translated into
                  <span class="font-semibold"> a map both sides can share.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ================= THREE PILLARS ================= -->
      <section
        class="space-y-6"
        in:fade={{ duration: 260, delay: 40 }}
      >
        <div class="space-y-2">
          <h2 class="text-2xl font-semibold sm:text-[1.6rem]">
            What actually lives behind the listings.
          </h2>
          <p class="max-w-2xl text-sm text-slate-300">
            Most industrial directories maximise raw listing count.
            NovaNexus is deliberately narrow – centred on capability depth, realistic capacity
            and the actual effort to run a line, not just contact info.
          </p>
        </div>

        <div class="grid gap-6 md:grid-cols-3">
          {#each threePillars as pillar, i}
            <article
              class="group flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-950/90 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.9)] transition hover:-translate-y-1 hover:border-sky-400/80 hover:shadow-[0_28px_80px_rgba(56,189,248,0.55)]"
              in:fly={{ y: 24, duration: 260, delay: 60 + i * 90 }}
            >
              <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 group-hover:text-sky-300">
                {pillar.tag}
              </p>
              <h3 class="text-lg font-semibold group-hover:text-sky-200">
                {pillar.title}
              </h3>
              <p class="text-sm text-slate-300">
                {pillar.body}
              </p>
              <ul class="mt-2 space-y-2 text-xs text-slate-300">
                {#each pillar.bullets as b}
                  <li class="flex gap-2">
                    <span class="mt-[3px] text-sky-400">▢</span>
                    <span>{b}</span>
                  </li>
                {/each}
              </ul>
            </article>
          {/each}
        </div>
      </section>

      <!-- ================= BUYERS & SUPPLIERS ================= -->
      <section
        class="grid gap-8 rounded-3xl border border-slate-800 bg-slate-950/90 p-6 sm:p-8 lg:grid-cols-2 lg:p-10"
        in:fade={{ duration: 260, delay: 60 }}
      >
        <!-- Buyers -->
        <div in:fly={{ x: -18, duration: 260, delay: 60 }}>
          <h2 class="text-xl font-semibold sm:text-2xl">If you’re a buyer</h2>
          <p class="mt-2 text-sm text-slate-300">
            The platform is built for operations, engineering and sourcing teams who need
            a shared, realistic map before they ever issue a PO.
          </p>
          <div class="mt-5 rounded-2xl border border-slate-700 bg-slate-950/90 p-5">
            <p class="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              You’ll walk away with
            </p>
            <ul class="space-y-2 text-sm text-slate-100">
              {#each buyerPoints as item}
                <li class="flex gap-2">
                  <span class="mt-[3px] text-emerald-400">✔</span>
                  <span>{item}</span>
                </li>
              {/each}
            </ul>
          </div>
        </div>

        <!-- Suppliers -->
        <div in:fly={{ x: 18, duration: 260, delay: 100 }}>
          <h2 class="text-xl font-semibold sm:text-2xl">If you’re a supplier</h2>
          <p class="mt-2 text-sm text-slate-300">
            Listing here is designed to feel lighter than building a full corporate site,
            but far more meaningful than dropping a logo and phone number into a directory.
          </p>
          <div class="mt-5 rounded-2xl border border-slate-700 bg-slate-950/90 p-5">
            <p class="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              You’ll understand better
            </p>
            <ul class="space-y-2 text-sm text-slate-100">
              {#each supplierPoints as item}
                <li class="flex gap-2">
                  <span class="mt-[3px] text-sky-400">●</span>
                  <span>{item}</span>
                </li>
              {/each}
            </ul>
          </div>
        </div>
      </section>

      <!-- ================= ROADMAP ================= -->
      <section
        class="grid gap-8 rounded-3xl border border-slate-800 bg-slate-950/95 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:p-10"
        in:fade={{ duration: 260, delay: 80 }}
      >
        <div>
          <h2 class="text-2xl font-semibold sm:text-[1.6rem]">Where this is going.</h2>
          <p class="mt-3 max-w-2xl text-sm text-slate-300">
            The roadmap is deliberately biased toward how real buyers and suppliers use the
            platform – not a shiny feature checklist. The more projects flow through the
            system, the more precise the guidance and signals become.
          </p>
        </div>

        <div class="space-y-4 text-sm text-slate-100">
          {#each roadmap as item, idx}
            <div class="flex gap-3">
              <div class="flex flex-col items-center pt-1">
                <div class="h-2.5 w-2.5 rounded-full bg-sky-400 shadow-[0_0_16px_rgba(56,189,248,0.9)]" />
                {#if idx < roadmap.length - 1}
                  <div class="mt-1 h-8 w-px bg-slate-700" />
                {/if}
              </div>
              <div>
                <p class="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                  {item.phase}
                </p>
                <p class="text-sm text-slate-100">
                  {item.body}
                </p>
              </div>
            </div>
          {/each}
        </div>
      </section>

      <!-- ================= CTA ================= -->
      <section
        class="rounded-3xl border border-white/10 bg-slate-950/95 px-6 py-10 text-center sm:px-8 lg:px-10"
        in:fade={{ duration: 260, delay: 100 }}
      >
        <h3 class="mb-4 text-2xl font-semibold sm:text-3xl">
          Explore the ecosystem.
        </h3>
        <p class="mx-auto mb-7 max-w-2xl text-sm text-slate-300 sm:text-base">
          Browse suppliers, read through the guides and send a trial RFQ. Even if you’re
          just mapping options, you should leave with a clearer view of what’s possible
          for your next line or automation project.
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <a
            href="/suppliers"
            class="rounded-xl bg-blue-500 px-7 py-2.5 text-sm font-semibold shadow-[0_18px_45px_rgba(37,99,235,0.6)] transition hover:-translate-y-0.5 hover:bg-blue-600"
          >
            Browse suppliers
          </a>
          <a
            href="/how-it-works"
            class="rounded-xl border border-slate-600 px-7 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-slate-200 hover:bg-slate-900/80"
          >
            See how it works
          </a>
        </div>
      </section>
    </main>
  {/if}
</div>

<style>
  /* 부드러운 점 깜빡임 */
  @keyframes pulse-soft {
    0% {
      transform: scale(1);
      opacity: 0.9;
    }
    50% {
      transform: scale(1.4);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 0.9;
    }
  }

  :global(.animate-pulse-soft) {
    animation: pulse-soft 2.8s ease-in-out infinite;
  }

  /* ORBIT 애니메이션 */
  @keyframes orbit-ring {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .about-orbit {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    transform-origin: center;
  }

  .about-orbit-1 {
    animation: orbit-ring 32s linear infinite;
  }

  .about-orbit-2 {
    animation: orbit-ring 40s linear infinite reverse;
  }

  .about-orbit-3 {
    animation: orbit-ring 52s linear infinite;
  }

  .about-orbit-dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    box-shadow: 0 0 18px rgba(56, 189, 248, 0.9);
  }
</style>
