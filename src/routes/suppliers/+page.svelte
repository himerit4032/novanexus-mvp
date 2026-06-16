<!-- src/routes/suppliers/+page.svelte -->
<svelte:head>
  <title>NovaNexus ▢ {$t('nav.forSuppliers')}</title>
  <meta
    name="description"
    content="NovaNexus supplier onboarding. Submit your capabilities, preview placement logic, and see how fit-first routing works across regions, processes, and industries."
  />
</svelte:head>

<script lang="ts">
  import { fade, fly, scale } from "svelte/transition";
  import { onMount, onDestroy, tick } from "svelte";
  import { browser } from "$app/environment";
  import { t } from "svelte-i18n";
  import { get } from "svelte/store";

  // ─────────────────────────────────────────────────────────────
  // i18n helper (prevents raw keys from showing when missing)
  // ─────────────────────────────────────────────────────────────
  const tr = (key: string, fallback: string) => {
    if (!key) return fallback;
    const translate = get(t);
    const value = translate(key);
    return value === key ? fallback : (value as string);
  };

  // ─────────────────────────────────────────────────────────────
  // Motion / accessibility controls
  // ─────────────────────────────────────────────────────────────
  let reduceMotion = false;
  const ms = (n: number) => (reduceMotion ? 0 : n);

  let showWhy = false;
  let whyPayload:
    | {
        supplierName: string;
        plan: Plan;
        fit: number;
        score: number;
        notes: string[];
        breakdown: { label: string; value: number; hint?: string }[];
      }
    | null = null;

  let lastFocusedEl: HTMLElement | null = null;

  function lockScroll() {
    if (!browser) return;
    document.body.style.overflow = "hidden";
  }
  function unlockScroll() {
    if (!browser) return;
    document.body.style.overflow = "";
  }

  function closeWhy() {
    showWhy = false;
    whyPayload = null;
    unlockScroll();
    // restore focus
    if (browser && lastFocusedEl) {
      lastFocusedEl.focus?.();
      lastFocusedEl = null;
    }
  }

  function onKeydown(e: KeyboardEvent) {
    if (!showWhy) return;
    if (e.key === "Escape") closeWhy();
  }

  // basic focus trap (lightweight)
  function trapFocus(node: HTMLElement) {
    const focusable = () =>
      Array.from(
        node.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden"));

    function handle(e: KeyboardEvent) {
      if (!showWhy) return;
      if (e.key !== "Tab") return;

      const items = focusable();
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
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
    }

    node.addEventListener("keydown", handle);
    return {
      destroy() {
        node.removeEventListener("keydown", handle);
      }
    };
  }

  onMount(() => {
    if (!browser) return;
    reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    window.addEventListener("keydown", onKeydown, { passive: true });
  });

  onDestroy(() => {
    if (!browser) return;
    window.removeEventListener("keydown", onKeydown as any);
  });

  // ============================================================
  // REGIONS (expanded, still practical)
  // ============================================================
  const REGIONS = [
    // North America
    { code: "USA", label: "USA", group: "North America" },
    { code: "CAN", label: "Canada", group: "North America" },
    { code: "MEX", label: "Mexico", group: "North America" },

    // East Asia
    { code: "KOR", label: "South Korea", group: "East Asia" },
    { code: "JPN", label: "Japan", group: "East Asia" },
    { code: "TWN", label: "Taiwan", group: "East Asia" },
    { code: "CHN", label: "China", group: "East Asia" },
    { code: "HKG", label: "Hong Kong", group: "East Asia" },

    // Southeast Asia
    { code: "SGP", label: "Singapore", group: "Southeast Asia" },
    { code: "VNM", label: "Vietnam", group: "Southeast Asia" },
    { code: "THA", label: "Thailand", group: "Southeast Asia" },
    { code: "MYS", label: "Malaysia", group: "Southeast Asia" },
    { code: "IDN", label: "Indonesia", group: "Southeast Asia" },
    { code: "PHL", label: "Philippines", group: "Southeast Asia" },

    // South Asia
    { code: "IND", label: "India", group: "South Asia" },

    // Europe
    { code: "EU", label: "EU (General)", group: "Europe" },
    { code: "DEU", label: "Germany (DACH)", group: "Europe" },
    { code: "FRA", label: "France", group: "Europe" },
    { code: "ITA", label: "Italy", group: "Europe" },
    { code: "ESP", label: "Spain", group: "Europe" },
    { code: "NLD", label: "Benelux (NL/BE/LU)", group: "Europe" },
    { code: "NOR", label: "Nordics", group: "Europe" },
    { code: "GBR", label: "UK / Ireland", group: "Europe" },

    // Middle East & Africa
    { code: "MENA", label: "Middle East / North Africa (MENA)", group: "Middle East & Africa" },
    { code: "UAE", label: "UAE", group: "Middle East & Africa" },
    { code: "SAU", label: "Saudi Arabia", group: "Middle East & Africa" },
    { code: "ZAF", label: "South Africa", group: "Middle East & Africa" },

    // Oceania
    { code: "AUS", label: "Australia / New Zealand", group: "Oceania" },

    // South America
    { code: "BRA", label: "Brazil", group: "South America" },
    { code: "LATAM", label: "LATAM (Other)", group: "South America" },

    // Catch-all
    { code: "GLOBAL", label: "Global / Multi-site", group: "Other" },
    { code: "OTHER", label: "Other", group: "Other" }
  ] as const;

  type RegionCode = (typeof REGIONS)[number]["code"];
  const REGION_BY_CODE = new Map(REGIONS.map((r) => [r.code, r] as const));
  const REGION_GROUP = (code: RegionCode) => REGION_BY_CODE.get(code)?.group ?? "Other";

  // Chips (fast selection) + full dropdown for precision
  const REGION_CHIPS: RegionCode[] = ["USA", "KOR", "JPN", "EU", "VNM", "SGP", "MENA", "OTHER"];

  // ============================================================
  // PROCESSES (expanded, optgroup-ready)
  // ============================================================
  type Plan = "basic" | "verified" | "prime";

  const PROCESS_GROUPS = [
    {
      label: "Industrial Lines & Automation",
      items: [
        "Automation integration",
        "Robotics integration",
        "Conveyors & material handling",
        "AS/RS & shuttle systems",
        "Racking & storage systems",
        "Packaging lines",
        "Palletizing & depalletizing",
        "Vision inspection & metrology",
        "PLC/HMI & controls",
        "Industrial IoT / data integration",
        "SCADA / MES integration",
        "Safety systems (PL d / SIL)",
        "Commissioning & onsite installation"
      ]
    },
    {
      label: "Metals: Fabrication & Machining",
      items: [
        "CNC machining (milling/turning)",
        "5-axis machining",
        "Swiss turning / micro machining",
        "Sheet metal fabrication",
        "Laser cutting",
        "Waterjet cutting",
        "Press brake forming",
        "Stamping / progressive die",
        "Welding (MIG/TIG/robotic)",
        "Grinding & polishing",
        "Tooling / jigs & fixtures",
        "CMM inspection & GD&T"
      ]
    },
    {
      label: "Metals: Process & Surface",
      items: [
        "Casting (aluminum/steel)",
        "Forging",
        "Heat treatment",
        "Surface finishing (anodize)",
        "Surface finishing (plating)",
        "Powder coating",
        "Painting & coating",
        "NDT (UT/RT/PT/MT)",
        "Clean & passivation",
        "Electropolishing",
        "Shot blasting / peening"
      ]
    },
    {
      label: "Aluminum Extrusion Ecosystem",
      items: [
        "Aluminum extrusion line",
        "Puller & runout",
        "Cooling table",
        "Hot saw / cold saw",
        "Aging furnace",
        "Billet heating & handling",
        "Die management & nitriding",
        "Stretching / straightening",
        "Profile handling & stacking",
        "Chip collection & filtration"
      ]
    },
    {
      label: "Plastics & Composites",
      items: [
        "Injection molding",
        "Extrusion (plastic)",
        "Blow molding",
        "Thermoforming",
        "Composite layup",
        "CNC routing (plastics)",
        "Ultrasonic welding",
        "Assembly & kitting",
        "Insert molding"
      ]
    },
    {
      label: "Electronics & Precision Assembly",
      items: [
        "SMT / PCB assembly",
        "PCB fabrication",
        "Cable harnessing",
        "Precision assembly",
        "Optics / alignment",
        "Cleanroom assembly",
        "ESD-safe manufacturing",
        "Functional test / burn-in",
        "Conformal coating"
      ]
    },
    {
      label: "Medical Devices & Life Science",
      items: [
        "Medical device assembly",
        "Sterilization support (ETO/Gamma)",
        "Cleanroom packaging",
        "Bioprocess skids",
        "Single-use systems",
        "Validation documentation (IQ/OQ/PQ)",
        "Regulated traceability / DHR support",
        "ISO 13485 QMS support"
      ]
    },
    {
      label: "Energy & High-Tech Lines",
      items: [
        "Battery cell/pack line",
        "EV powertrain assembly",
        "Semiconductor equipment subsystems",
        "Vacuum/ultra-high vacuum assemblies",
        "Hydrogen systems (BOP)",
        "Solar module line",
        "Wind components manufacturing",
        "Thermal management subsystems"
      ]
    }
  ] as const;

  const PROCESS_OPTIONS = PROCESS_GROUPS.flatMap((g) => g.items);

  // Relatedness families (prevents “exact-only collapse”)
  const PROCESS_FAMILY: Record<string, string> = Object.fromEntries(
    [
      // automation
      ["Automation integration", "automation"],
      ["Robotics integration", "automation"],
      ["Conveyors & material handling", "automation"],
      ["AS/RS & shuttle systems", "automation"],
      ["Racking & storage systems", "automation"],
      ["Packaging lines", "automation"],
      ["Palletizing & depalletizing", "automation"],
      ["Vision inspection & metrology", "quality"],
      ["PLC/HMI & controls", "automation"],
      ["Industrial IoT / data integration", "automation"],
      ["SCADA / MES integration", "automation"],
      ["Safety systems (PL d / SIL)", "quality"],
      ["Commissioning & onsite installation", "automation"],

      // machining & fab
      ["CNC machining (milling/turning)", "machining"],
      ["5-axis machining", "machining"],
      ["Swiss turning / micro machining", "machining"],
      ["Sheet metal fabrication", "fabrication"],
      ["Laser cutting", "fabrication"],
      ["Waterjet cutting", "fabrication"],
      ["Press brake forming", "fabrication"],
      ["Stamping / progressive die", "fabrication"],
      ["Welding (MIG/TIG/robotic)", "fabrication"],
      ["Grinding & polishing", "fabrication"],
      ["Tooling / jigs & fixtures", "machining"],
      ["CMM inspection & GD&T", "quality"],

      // metals process & surface
      ["Casting (aluminum/steel)", "metal-process"],
      ["Forging", "metal-process"],
      ["Heat treatment", "metal-process"],
      ["Surface finishing (anodize)", "finishing"],
      ["Surface finishing (plating)", "finishing"],
      ["Powder coating", "finishing"],
      ["Painting & coating", "finishing"],
      ["NDT (UT/RT/PT/MT)", "quality"],
      ["Clean & passivation", "finishing"],
      ["Electropolishing", "finishing"],
      ["Shot blasting / peening", "finishing"],

      // aluminum extrusion
      ["Aluminum extrusion line", "al-extrusion"],
      ["Puller & runout", "al-extrusion"],
      ["Cooling table", "al-extrusion"],
      ["Hot saw / cold saw", "al-extrusion"],
      ["Aging furnace", "al-extrusion"],
      ["Billet heating & handling", "al-extrusion"],
      ["Die management & nitriding", "al-extrusion"],
      ["Stretching / straightening", "al-extrusion"],
      ["Profile handling & stacking", "al-extrusion"],
      ["Chip collection & filtration", "al-extrusion"],

      // plastics/composites
      ["Injection molding", "plastics"],
      ["Extrusion (plastic)", "plastics"],
      ["Blow molding", "plastics"],
      ["Thermoforming", "plastics"],
      ["Composite layup", "composites"],
      ["CNC routing (plastics)", "plastics"],
      ["Ultrasonic welding", "plastics"],
      ["Assembly & kitting", "assembly"],
      ["Insert molding", "plastics"],

      // electronics/precision
      ["SMT / PCB assembly", "electronics"],
      ["PCB fabrication", "electronics"],
      ["Cable harnessing", "electronics"],
      ["Precision assembly", "assembly"],
      ["Optics / alignment", "precision"],
      ["Cleanroom assembly", "regulated"],
      ["ESD-safe manufacturing", "electronics"],
      ["Functional test / burn-in", "quality"],
      ["Conformal coating", "electronics"],

      // medical/regulatory
      ["Medical device assembly", "regulated"],
      ["Sterilization support (ETO/Gamma)", "regulated"],
      ["Cleanroom packaging", "regulated"],
      ["Bioprocess skids", "life-science"],
      ["Single-use systems", "life-science"],
      ["Validation documentation (IQ/OQ/PQ)", "regulated"],
      ["Regulated traceability / DHR support", "regulated"],
      ["ISO 13485 QMS support", "regulated"],

      // energy/high-tech
      ["Battery cell/pack line", "ev-energy"],
      ["EV powertrain assembly", "ev-energy"],
      ["Semiconductor equipment subsystems", "semicon"],
      ["Vacuum/ultra-high vacuum assemblies", "semicon"],
      ["Hydrogen systems (BOP)", "energy"],
      ["Solar module line", "energy"],
      ["Wind components manufacturing", "energy"],
      ["Thermal management subsystems", "energy"]
    ].map(([k, v]) => [k, v] as const)
  );

  // ============================================================
  // INDUSTRIES (expanded)
  // ============================================================
  const INDUSTRY_GROUPS = [
    { label: "Transportation", items: ["EV / Automotive", "Aerospace", "Rail", "Marine"] },
    { label: "Healthcare & Life Science", items: ["Medical Devices", "Pharma / Biotech", "Lab & Diagnostics"] },
    { label: "High-Tech", items: ["Semiconductor", "Electronics", "Data Centers"] },
    { label: "Industrial & Logistics", items: ["Industrial", "Warehouse / 3PL", "E-commerce Fulfillment"] },
    { label: "Materials & Heavy Industry", items: ["Aluminum", "Steel", "Oil & Gas", "Mining"] },
    { label: "Built Environment", items: ["Construction", "HVAC & Building Systems", "Packaging"] },
    { label: "Energy", items: ["Renewables", "Battery & Storage", "Hydrogen"] },
    { label: "Consumer & Food", items: ["Food & Beverage", "Consumer Products"] },
    { label: "Other", items: ["Other"] }
  ] as const;

  const INDUSTRY_FAMILY: Record<string, string> = {
    "EV / Automotive": "transport",
    Aerospace: "transport",
    Rail: "transport",
    Marine: "transport",

    "Medical Devices": "regulated",
    "Pharma / Biotech": "regulated",
    "Lab & Diagnostics": "regulated",

    Semiconductor: "high-tech",
    Electronics: "high-tech",
    "Data Centers": "high-tech",

    Industrial: "industrial",
    "Warehouse / 3PL": "industrial",
    "E-commerce Fulfillment": "industrial",

    Aluminum: "materials",
    Steel: "materials",
    "Oil & Gas": "materials",
    Mining: "materials",

    Construction: "built",
    "HVAC & Building Systems": "built",
    Packaging: "built",

    Renewables: "energy",
    "Battery & Storage": "energy",
    Hydrogen: "energy",

    "Food & Beverage": "consumer",
    "Consumer Products": "consumer",

    Other: "other"
  };

  // ============================================================
  // FORM
  // ============================================================
  interface SupplierForm {
    company: string;
    contact: string;
    email: string;
    capabilities: string;
    website: string;
    region: RegionCode;
    notes: string;
  }

  interface SupplierErrors {
    company: string;
    contact: string;
    email: string;
    capabilities: string;
  }

  let form: SupplierForm = {
    company: "",
    contact: "",
    email: "",
    capabilities: "",
    website: "",
    region: "USA",
    notes: ""
  };

  let errors: SupplierErrors = { company: "", contact: "", email: "", capabilities: "" };

  let submitted = false;
  let loading = false;
  let backendError = "";
  let backendWarning = "";

  // PocketBase dynamic (optional)
  let pbClient: any = null;

  // ============================================================
  // DIRECTORY / SIMULATOR
  // ============================================================
  type SupplierCard = {
    id: string;
    name: string;
    plan: Plan;
    region: RegionCode;
    processes: string[];
    industries: string[];
    qualityScore: number;
    avgResponseHours?: number;
    completionScore?: number; // profile completeness (signal)
  };

  type RFQContext = {
    region: RegionCode;
    process: string;
    industry: string;
    ticket: number; // USD budget context
  };

  // Example RFQ (feels like a real buyer ticket)
  let ctx: RFQContext = {
    region: "USA",
    process: "Automation integration",
    industry: "Medical Devices",
    ticket: 650000
  };

  let ctxRegionSelect: RegionCode = ctx.region;

  let directory: SupplierCard[] = [];

  let mySimName = "Your Company";
  let mySimPlan: Plan = "basic";
  let mySimQuality = 68;
  let mySimResponseHrs = 10;
  let mySimCompletion = 74;

  let inferred = {
    processes: [] as string[],
    familyPills: [] as string[]
  };

  let topPlacements: (SupplierCard & { rank: number; fit: number; score: number; reason: string })[] = [];
  let restPlacements: (SupplierCard & { rank: number; fit: number; score: number; reason: string })[] = [];

  let simPulse = 0;
  function bumpSimPulse() {
    simPulse += 1;
  }

  function resetForm() {
    form = { company: "", contact: "", email: "", capabilities: "", website: "", region: "USA", notes: "" };
    errors = { company: "", contact: "", email: "", capabilities: "" };
  }

  function validate(): boolean {
    const next: SupplierErrors = { company: "", contact: "", email: "", capabilities: "" };

    if (!form.company.trim()) next.company = tr("suppliers.form.errors.company", "회사명을 입력해 주세요.");
    if (!form.contact.trim()) next.contact = tr("suppliers.form.errors.contact", "담당자 이름/직함을 입력해 주세요.");

    if (!form.email.trim()) next.email = tr("suppliers.form.errors.emailRequired", "업무용 이메일을 입력해 주세요.");
    else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(form.email.trim()))
        next.email = tr("suppliers.form.errors.emailInvalid", "유효한 이메일 형식을 입력해 주세요.");
    }

    if (!form.capabilities.trim())
      next.capabilities = tr("suppliers.form.errors.capabilities", "가능한 설비 / 공정을 간단히 적어 주세요.");

    errors = next;
    return !errors.company && !errors.contact && !errors.email && !errors.capabilities;
  }

  // ============================================================
  // Inference: capabilities text -> processes (stronger & safer)
  // - Adds synonym coverage, prevents false positives via word-ish checks
  // ============================================================
  function inferProcessesFromText(txt: string): string[] {
    const raw = (txt || "").toLowerCase().replace(/[^\w\s/+.-]/g, " ");
    const has = (needle: string) => raw.includes(needle);

    const rules: Array<[string[], string[]]> = [
      // aluminum extrusion ecosystem
      [["aluminum extrusion", "extrusion line (al)", "al extrusion", "extrusion press"], ["Aluminum extrusion line"]],
      [["runout", "puller"], ["Puller & runout"]],
      [["cooling table", "run-out table", "runout table"], ["Cooling table"]],
      [["hot saw", "cold saw", "flying saw"], ["Hot saw / cold saw"]],
      [["aging furnace", "ageing furnace"], ["Aging furnace"]],
      [["billet", "billet heater", "billet heating"], ["Billet heating & handling"]],
      [["die", "nitriding", "die management"], ["Die management & nitriding"]],
      [["stretch", "stretcher", "straighten", "straightening"], ["Stretching / straightening"]],
      [["chip", "filtration", "coolant filtration", "chip collector"], ["Chip collection & filtration"]],

      // automation
      [["automation", "system integrator", "integration"], ["Automation integration"]],
      [["robot", "robotics"], ["Robotics integration"]],
      [["conveyor", "material handling"], ["Conveyors & material handling"]],
      [["as/rs", "asrs", "shuttle"], ["AS/RS & shuttle systems"]],
      [["rack", "racking", "storage system"], ["Racking & storage systems"]],
      [["packaging line", "pack line", "case pack", "cartoner"], ["Packaging lines"]],
      [["palletizing", "depalletizing"], ["Palletizing & depalletizing"]],
      [["vision", "metrology", "measurement system"], ["Vision inspection & metrology"]],
      [["plc", "hmi", "controls"], ["PLC/HMI & controls"]],
      [["iot", "opc ua", "data integration"], ["Industrial IoT / data integration"]],
      [["scada", "mes"], ["SCADA / MES integration"]],
      [["commission", "install", "onsite"], ["Commissioning & onsite installation"]],
      [["safety", "sil", "pl d", "pld"], ["Safety systems (PL d / SIL)"]],

      // machining & fab
      [["cnc", "milling", "turning", "lathe"], ["CNC machining (milling/turning)"]],
      [["5-axis", "five axis"], ["5-axis machining"]],
      [["swiss", "micro machining", "micromachining"], ["Swiss turning / micro machining"]],
      [["sheet metal"], ["Sheet metal fabrication"]],
      [["laser"], ["Laser cutting"]],
      [["waterjet"], ["Waterjet cutting"]],
      [["press brake", "bending"], ["Press brake forming"]],
      [["stamping", "progressive die"], ["Stamping / progressive die"]],
      [["weld", "tig", "mig"], ["Welding (MIG/TIG/robotic)"]],
      [["grind", "polish", "polishing"], ["Grinding & polishing"]],
      [["fixture", "jig", "tooling"], ["Tooling / jigs & fixtures"]],
      [["cmm", "gd&t", "gdt"], ["CMM inspection & GD&T"]],

      // metals process & surface
      [["cast", "casting"], ["Casting (aluminum/steel)"]],
      [["forg", "forging"], ["Forging"]],
      [["heat treat", "heat-treat"], ["Heat treatment"]],
      [["anod", "anodize", "anodizing"], ["Surface finishing (anodize)"]],
      [["plating"], ["Surface finishing (plating)"]],
      [["powder coat", "powder-coat"], ["Powder coating"]],
      [["paint", "coating"], ["Painting & coating"]],
      [["ndt", "ut", "rt", "pt", "mt"], ["NDT (UT/RT/PT/MT)"]],
      [["passivation", "passivate"], ["Clean & passivation"]],
      [["electropolish"], ["Electropolishing"]],
      [["shot blast", "peen", "peening"], ["Shot blasting / peening"]],

      // plastics/composites
      [["injection"], ["Injection molding"]],
      [["plastic extrusion"], ["Extrusion (plastic)"]],
      [["blow mold"], ["Blow molding"]],
      [["thermoform"], ["Thermoforming"]],
      [["composite", "layup"], ["Composite layup"]],
      [["cnc routing", "router"], ["CNC routing (plastics)"]],
      [["ultrasonic welding"], ["Ultrasonic welding"]],
      [["assembly", "kitting"], ["Assembly & kitting"]],
      [["insert molding"], ["Insert molding"]],

      // electronics
      [["smt", "pcba"], ["SMT / PCB assembly"]],
      [["pcb fabrication"], ["PCB fabrication"]],
      [["harness", "cable"], ["Cable harnessing"]],
      [["precision assembly"], ["Precision assembly"]],
      [["optics", "alignment"], ["Optics / alignment"]],
      [["cleanroom"], ["Cleanroom assembly", "Cleanroom packaging"]],
      [["esd"], ["ESD-safe manufacturing"]],
      [["burn-in", "functional test"], ["Functional test / burn-in"]],
      [["conformal"], ["Conformal coating"]],

      // regulated / medical
      [["medical device"], ["Medical device assembly"]],
      [["steril", "eto", "gamma"], ["Sterilization support (ETO/Gamma)"]],
      [["iq/oq/pq"], ["Validation documentation (IQ/OQ/PQ)"]],
      [["dhr", "traceability"], ["Regulated traceability / DHR support"]],
      [["13485", "iso 13485"], ["ISO 13485 QMS support"]],

      // high-tech / energy
      [["battery", "cell line", "pack line"], ["Battery cell/pack line"]],
      [["powertrain"], ["EV powertrain assembly"]],
      [["semicon", "semiconductor"], ["Semiconductor equipment subsystems"]],
      [["vacuum", "uhv"], ["Vacuum/ultra-high vacuum assemblies"]],
      [["hydrogen"], ["Hydrogen systems (BOP)"]],
      [["solar"], ["Solar module line"]],
      [["wind"], ["Wind components manufacturing"]],
      [["thermal"], ["Thermal management subsystems"]]
    ];

    const hits: string[] = [];
    for (const [needles, procs] of rules) {
      if (needles.some((n) => has(n))) hits.push(...procs);
    }

    const uniq = Array.from(new Set(hits));
    if (uniq.length === 0) uniq.push("Automation integration");

    // cap for UI sanity
    return uniq.slice(0, 8);
  }

  function planBoost(plan: Plan) {
    if (plan === "prime") return 1.22;
    if (plan === "verified") return 1.1;
    return 1.0;
  }

  function processFamily(p: string) {
    return PROCESS_FAMILY[p] ?? "other";
  }

  function industryFamily(i: string) {
    return INDUSTRY_FAMILY[i] ?? "other";
  }

  function calcFitBreakdown(s: SupplierCard, c: RFQContext) {
    let regionPts = 0;
    let procPts = 0;
    let indPts = 0;

    // region
    if (s.region === c.region) regionPts = 35;
    else if (REGION_GROUP(s.region) === REGION_GROUP(c.region)) regionPts = 20;

    // process
    const sProcs = s.processes ?? [];
    const exactProc = sProcs.includes(c.process);
    const famProc = sProcs.some((sp) => processFamily(sp) === processFamily(c.process));
    if (exactProc) procPts = 45;
    else if (famProc) procPts = 28;

    // industry
    const sInd = s.industries ?? [];
    const exactInd = sInd.includes(c.industry);
    const famInd = sInd.some((si) => industryFamily(si) === industryFamily(c.industry));
    if (exactInd) indPts = 20;
    else if (famInd) indPts = 12;
    else indPts = 6; // baseline to avoid “broken looking” lists

    const fit = Math.max(0, Math.min(100, regionPts + procPts + indPts));
    return { fit, regionPts, procPts, indPts };
  }

  function calcScore(s: SupplierCard, c: RFQContext) {
    const { fit, regionPts, procPts, indPts } = calcFitBreakdown(s, c);

    const qual = Math.max(0, Math.min(100, s.qualityScore ?? 60));
    const hrs = s.avgResponseHours ?? 24;
    const completion = Math.max(0, Math.min(100, s.completionScore ?? 70));

    // Budget context: increase importance of quality+response for large tickets
    const ticket = Math.max(10000, Math.min(1500000, c.ticket || 0));
    const tNorm = Math.min(
      1,
      Math.max(0, (Math.log10(ticket) - Math.log10(50000)) / (Math.log10(1000000) - Math.log10(50000)))
    );

    const fitW = 0.62 - 0.08 * tNorm; // 0.62 -> 0.54
    const qualW = 0.28 + 0.07 * tNorm; // 0.28 -> 0.35
    const compW = 0.1 + 0.01 * tNorm; // 0.10 -> 0.11

    const base = fit * fitW + qual * qualW + completion * compW;

    // gated tier boost
    const boost = planBoost(s.plan);
    const fitGate = Math.max(0.35, Math.min(1, fit / 70));
    const boosted = base * (1 + (boost - 1) * fitGate);

    // response bonus (more important for large tickets)
    const respWeight = 1 + 0.6 * tNorm;
    const respBonus = hrs <= 6 ? 3.5 * respWeight : hrs <= 12 ? 1.8 * respWeight : 0;

    const final = Math.max(0, Math.min(100, boosted + respBonus));

    return {
      fit,
      score: final,
      breakdown: { regionPts, procPts, indPts, qual, completion, hrs, ticket, tNorm }
    };
  }

  function reasonText(s: SupplierCard, fit: number) {
    const bits: string[] = [];

    if (s.plan === "prime") bits.push("Priority placement (Prime)");
    if (s.plan === "verified") bits.push("Verified tier boost");

    if (s.region === ctx.region) bits.push("Exact region match");
    else if (REGION_GROUP(s.region) === REGION_GROUP(ctx.region)) bits.push("Region group match");

    const hasExact = (s.processes ?? []).includes(ctx.process);
    const hasFamily = (s.processes ?? []).some((p) => processFamily(p) === processFamily(ctx.process));
    if (hasExact) bits.push("Exact process fit");
    else if (hasFamily) bits.push("Related process capability");

    const hrs = s.avgResponseHours ?? 999;
    if (hrs <= 8) bits.push("Fast response signal");

    if (fit >= 82) bits.push("Strong routing fit");
    else if (fit >= 58) bits.push("Good routing fit");
    else bits.push("Shown lower due to fit");

    return bits.join(" · ");
  }

  // ============================================================
  // Recompute: scheduled (prevents over-render while typing)
  // ============================================================
  let rafId: number | null = null;
  function scheduleRecompute() {
    if (!browser) return;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      rafId = null;
      recomputePlacements();
    });
  }

  function recomputePlacements() {
    const myId = "my_sim";

    const inferredProcs = inferProcessesFromText(form.capabilities || "automation integration");
    inferred.processes = inferredProcs;
    inferred.familyPills = Array.from(new Set(inferredProcs.map(processFamily))).filter((x) => x && x !== "other").slice(0, 4);

    const myCard: SupplierCard = {
      id: myId,
      name: mySimName,
      plan: mySimPlan,
      region: form.region || ctx.region,
      processes: inferredProcs,
      industries: [ctx.industry],
      qualityScore: mySimQuality,
      avgResponseHours: mySimResponseHrs,
      completionScore: mySimCompletion
    };

    const merged = (() => {
      const filtered = directory.filter((d) => d.id !== myId);
      return [...filtered, myCard];
    })();

    const ranked = merged
      .map((s) => {
        const { fit, score } = calcScore(s, ctx);
        return { ...s, fit, score, rank: 0, reason: reasonText(s, fit) };
      })
      .sort((a, b) => b.score - a.score);

    ranked.forEach((r, idx) => (r.rank = idx + 1));

    topPlacements = ranked.slice(0, 6);
    restPlacements = ranked.slice(6);
  }

  async function setSimPlan(p: Plan) {
    mySimPlan = p;
    scheduleRecompute();
    await tick();
    bumpSimPulse();
  }

  function injectMyCompanyIntoDirectory(name: string) {
    mySimName = name.trim() ? name.trim() : "Your Company";
    scheduleRecompute();
  }

  function setCtxRegion(r: RegionCode) {
    ctx = { ...ctx, region: r };
    ctxRegionSelect = r;
    scheduleRecompute();
    bumpSimPulse();
  }

  function setCtxProcess(p: string) {
    ctx = { ...ctx, process: p };
    scheduleRecompute();
    bumpSimPulse();
  }

  function setCtxIndustry(i: string) {
    ctx = { ...ctx, industry: i };
    scheduleRecompute();
    bumpSimPulse();
  }

  function setCtxTicket(v: number) {
    ctx = { ...ctx, ticket: v };
    scheduleRecompute();
    bumpSimPulse();
  }

  // ============================================================
  // Demo directory (fictional companies only)
  // ============================================================
  function hydrateDemoDirectory() {
    directory = [
      {
        id: "s1",
        name: "AuroraFlux Automation",
        plan: "prime",
        region: "USA",
        processes: ["Automation integration", "PLC/HMI & controls", "Vision inspection & metrology", "Commissioning & onsite installation"],
        industries: ["Medical Devices", "Industrial"],
        qualityScore: 86,
        avgResponseHours: 4,
        completionScore: 92
      },
      {
        id: "s2",
        name: "HelioRack Dynamics",
        plan: "verified",
        region: "KOR",
        processes: ["AS/RS & shuttle systems", "Racking & storage systems", "Conveyors & material handling", "SCADA / MES integration"],
        industries: ["Warehouse / 3PL", "E-commerce Fulfillment"],
        qualityScore: 79,
        avgResponseHours: 8,
        completionScore: 84
      },
      {
        id: "s3",
        name: "NordGrid Systems",
        plan: "prime",
        region: "EU",
        processes: ["Racking & storage systems", "Conveyors & material handling", "Automation integration", "Safety systems (PL d / SIL)"],
        industries: ["Warehouse / 3PL", "Industrial"],
        qualityScore: 83,
        avgResponseHours: 6,
        completionScore: 88
      },
      {
        id: "s4",
        name: "CleanSphere MedTech Works",
        plan: "verified",
        region: "USA",
        processes: ["Medical device assembly", "Cleanroom packaging", "Validation documentation (IQ/OQ/PQ)", "ISO 13485 QMS support"],
        industries: ["Medical Devices", "Lab & Diagnostics"],
        qualityScore: 82,
        avgResponseHours: 7,
        completionScore: 90
      },
      {
        id: "s5",
        name: "ZenithVac Precision",
        plan: "verified",
        region: "JPN",
        processes: ["Precision assembly", "Vacuum/ultra-high vacuum assemblies", "Functional test / burn-in", "Cleanroom assembly"],
        industries: ["Semiconductor", "Electronics"],
        qualityScore: 84,
        avgResponseHours: 9,
        completionScore: 86
      },
      {
        id: "s6",
        name: "VertexForge Machining",
        plan: "basic",
        region: "DEU",
        processes: ["CNC machining (milling/turning)", "Sheet metal fabrication", "Welding (MIG/TIG/robotic)", "CMM inspection & GD&T"],
        industries: ["Industrial", "Construction"],
        qualityScore: 73,
        avgResponseHours: 14,
        completionScore: 70
      },
      {
        id: "s7",
        name: "IonCell Line Partners",
        plan: "prime",
        region: "KOR",
        processes: ["Battery cell/pack line", "Robotics integration", "Vision inspection & metrology", "PLC/HMI & controls"],
        industries: ["Battery & Storage", "EV / Automotive"],
        qualityScore: 86,
        avgResponseHours: 6,
        completionScore: 89
      },
      {
        id: "s8",
        name: "AtlasNDT Metals",
        plan: "basic",
        region: "MENA",
        processes: ["Casting (aluminum/steel)", "Heat treatment", "NDT (UT/RT/PT/MT)", "Shot blasting / peening"],
        industries: ["Steel", "Oil & Gas"],
        qualityScore: 67,
        avgResponseHours: 16,
        completionScore: 64
      },
      {
        id: "s9",
        name: "PacificCircuit Manufacturing",
        plan: "basic",
        region: "VNM",
        processes: ["SMT / PCB assembly", "Cable harnessing", "Functional test / burn-in", "Conformal coating"],
        industries: ["Electronics", "Consumer Products"],
        qualityScore: 71,
        avgResponseHours: 15,
        completionScore: 69
      }
    ];

    scheduleRecompute();
  }

  // ============================================================
  // PB loading (optional)
  // ============================================================
  async function tryLoadSuppliersFromPB() {
    if (!pbClient) return;

    try {
      const list = await pbClient.collection("suppliers").getList(1, 50, { sort: "-created" });

      const mapped: SupplierCard[] = (list?.items ?? []).map((s: any, idx: number) => {
        const name = s.company_name || s.company || s.name || `Supplier ${idx + 1}`;
        const plan: Plan = s.plan === "prime" || s.plan === "verified" || s.plan === "basic" ? s.plan : "basic";
        const region: RegionCode = REGION_BY_CODE.has(s.region) ? (s.region as RegionCode) : "OTHER";

        const processes = Array.isArray(s.processes)
          ? s.processes
          : typeof s.capabilities === "string"
            ? inferProcessesFromText(s.capabilities)
            : ["Automation integration"];

        const industries = Array.isArray(s.industries) ? s.industries : ["Industrial"];

        return {
          id: s.id || `pb_${idx}`,
          name,
          plan,
          region,
          processes: Array.from(new Set(processes)).slice(0, 8),
          industries: Array.from(new Set(industries)).slice(0, 4),
          qualityScore: Number(s.qualityScore ?? 64),
          avgResponseHours: Number(s.avgResponseHours ?? 14),
          completionScore: Number(s.completionScore ?? 70)
        };
      });

      if (mapped.length >= 3) {
        directory = mapped;
        scheduleRecompute();
      }
    } catch (err) {
      console.warn("[suppliers] PB list read failed. Staying in demo directory mode.", err);
    }
  }

  // ============================================================
  // Submission
  // ============================================================
  async function handleSubmit() {
    if (loading) return;

    backendError = "";
    submitted = false;

    if (!validate()) return;

    loading = true;

    const payload = {
      company_name: form.company,
      contact_name: form.contact,
      work_email: form.email,
      capabilities: form.capabilities,
      website: form.website,
      region: form.region,
      region_group: REGION_GROUP(form.region),
      notes: form.notes,
      source: "supplier_web_form",

      plan: "basic",
      qualityScore: 62,
      avgResponseHours: 10,
      completionScore: 72
    };

    try {
      console.log("NovaNexus supplier submission:", payload);

      if (pbClient) {
        try {
          await pbClient.collection("suppliers").create(payload);
        } catch (err) {
          console.warn('[suppliers] PocketBase create("suppliers") failed. Check collection & rules.', err);
          backendError = tr(
            "suppliers.backend.error",
            'Backend collection is not reachable yet. Please verify PocketBase "suppliers" collection and API rules.'
          );
        }
      }

      injectMyCompanyIntoDirectory(form.company || "Your Company");
      submitted = true;
      resetForm();
      bumpSimPulse();
    } finally {
      loading = false;
    }
  }

  function submitAnother() {
    submitted = false;
    backendError = "";
    backendWarning = "";
    resetForm();
    scheduleRecompute();
  }

  // ============================================================
  // Why modal payload (adds breakdown for transparency)
  // ============================================================
  function openWhy(s: any, e?: Event) {
    if (browser) lastFocusedEl = (e?.currentTarget as HTMLElement) ?? (document.activeElement as HTMLElement);

    const computed = calcScore(s, ctx);
    const bd = computed.breakdown;

    const breakdown = [
      {
        label: "Region fit",
        value: bd.regionPts,
        hint: bd.regionPts >= 30 ? "Exact region match" : bd.regionPts >= 20 ? "Group match" : "No region match"
      },
      {
        label: "Process fit",
        value: bd.procPts,
        hint: bd.procPts >= 40 ? "Exact process" : bd.procPts >= 28 ? "Family match" : "No close match"
      },
      {
        label: "Industry fit",
        value: bd.indPts,
        hint: bd.indPts >= 18 ? "Exact industry" : bd.indPts >= 12 ? "Family match" : "Baseline inclusion"
      },
      { label: "Quality signals", value: Math.round(bd.qual * 0.35), hint: `Quality score ${Math.round(bd.qual)}/100` },
      { label: "Profile completeness", value: Math.round(bd.completion * 0.11), hint: `Completion ${Math.round(bd.completion)}/100` }
    ];

    whyPayload = {
      supplierName: s.name,
      plan: s.plan,
      fit: Math.round(computed.fit),
      score: Math.round(computed.score),
      notes: [
        "Ranking = routing fit (region + process + industry) reinforced by quality signals (response speed, completeness).",
        "Verified/Prime adds a boost ONLY when fit is strong (gated boost prevents irrelevant pay-to-win).",
        "Larger RFQ budgets weigh quality and response more to protect buyer outcomes."
      ],
      breakdown
    };

    showWhy = true;
    lockScroll();

    // focus first control inside modal next tick
    tick().then(() => {
      const el = document.querySelector(".why-modal button, .why-modal a") as HTMLElement | null;
      el?.focus?.();
    });
  }

  // ============================================================
  // Mount: PB (optional) + demo directory
  // ============================================================
  onMount(async () => {
    if (!browser) return;

    try {
      const mod = await import("$lib/pocketbase");
      pbClient = mod.pb;
    } catch (err) {
      console.warn("[suppliers] PocketBase client load failed. Running in demo mode (console only).", err);
      backendWarning = tr(
        "suppliers.backend.warning",
        "Backend is not fully wired yet. Profiles are stored for this session and will be connected to PocketBase in production."
      );
    }

    hydrateDemoDirectory();
    await tryLoadSuppliersFromPB();
  });

  // Reactive: schedule recompute when key inputs change
  $: if (browser) {
    // dependencies (do not remove): makes the simulator feel “live”
    form.region;
    form.capabilities;
    mySimPlan;
    mySimQuality;
    mySimResponseHrs;
    mySimCompletion;
    ctx.region;
    ctx.process;
    ctx.industry;
    ctx.ticket;
    directory.length;

    scheduleRecompute();
  }

  // Utility: formatting
  const money = (n: number) => {
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
    } catch {
      return `$${Math.round(n).toLocaleString()}`;
    }
  };

  const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

  function ringDash(percent: number) {
    const p = clamp(percent, 0, 100);
    const c = 2 * Math.PI * 18;
    const dash = (p / 100) * c;
    return `${dash} ${c - dash}`;
  }

  function familyLabel(f: string) {
    const map: Record<string, string> = {
      automation: "Automation",
      quality: "Quality",
      machining: "Machining",
      fabrication: "Fabrication",
      "metal-process": "Metal process",
      finishing: "Finishing",
      "al-extrusion": "Al extrusion",
      plastics: "Plastics",
      composites: "Composites",
      assembly: "Assembly",
      electronics: "Electronics",
      precision: "Precision",
      regulated: "Regulated",
      "life-science": "Life science",
      "ev-energy": "EV / Battery",
      semicon: "Semiconductor",
      energy: "Energy"
    };
    return map[f] ?? f;
  }
</script>

<section class="nn-page" in:fade={{ duration: ms(260) }}>
  <!-- Ambient background ornaments -->
  <div class="bg-grid" aria-hidden="true"></div>
  <div class="bg-glow bg-glow-a" aria-hidden="true"></div>
  <div class="bg-glow bg-glow-b" aria-hidden="true"></div>

  <!-- Header -->
  <header class="sup-header" in:fly={{ y: 18, duration: ms(340) }}>
    <div class="sup-header-kicker">SUPPLIER ONBOARDING</div>

    <h1 class="sup-title">
      <span class="sup-title-gradient">
        {tr("suppliers.heroTitle", "Apply as a supplier. Get routed to high-fit RFQs—without spam.")}
      </span>
    </h1>

    <p class="sup-sub">
      {tr(
        "suppliers.heroSubtitle",
        "Submit your capabilities once. NovaNexus routes you to RFQs only when region + process + industry match—then upgrades help you win visibility when the fit is real."
      )}
    </p>

    <div class="sup-metrics" aria-label="Network metrics">
      <div class="sup-metric-pill">
        <div class="sup-metric-label">Qualified suppliers</div>
        <div class="sup-metric-value">160+</div>
      </div>
      <div class="sup-metric-pill">
        <div class="sup-metric-label">Core verticals</div>
        <div class="sup-metric-value">18</div>
      </div>
      <div class="sup-metric-pill">
        <div class="sup-metric-label">Active regions</div>
        <div class="sup-metric-value">12+</div>
      </div>
    </div>

    <div class="sup-mini-nav" aria-label="Quick navigation">
      <a class="mini-link" href="#engine">Visibility Engine</a>
      <a class="mini-link" href="#simulator">Placement Simulator</a>
      <a class="mini-link" href="#apply">Apply</a>
    </div>

    <h2 class="sup-benefits-title">{tr("suppliers.benefitsTitle", "Why suppliers join")}</h2>

    <div class="sup-benefits-grid">
      <article class="sup-benefit-card">
        <h3 class="sup-benefit-heading">{tr("suppliers.benefits.fitTitle", "Fit-first routing")}</h3>
        <p class="sup-benefit-body">
          {tr("suppliers.benefits.fitBody", "You’re matched by region, process, and industry—not mass-blasted. Buyers see fewer, better suppliers.")}
        </p>
      </article>

      <article class="sup-benefit-card">
        <h3 class="sup-benefit-heading">{tr("suppliers.benefits.contextTitle", "RFQ context included")}</h3>
        <p class="sup-benefit-body">
          {tr("suppliers.benefits.contextBody", "Drawings, budget band, and decision drivers are attached so you quote faster with fewer rounds.")}
        </p>
      </article>

      <article class="sup-benefit-card">
        <h3 class="sup-benefit-heading">{tr("suppliers.benefits.supportTitle", "Upgrade without pay-to-win")}</h3>
        <p class="sup-benefit-body">
          {tr("suppliers.benefits.supportBody", "Verified/Prime improves placement only when you’re already a strong match—so visibility stays credible.")}
        </p>
      </article>
    </div>
  </header>

  <!-- Visibility Engine -->
  <section id="engine" class="vis-wrap" in:fade={{ duration: ms(260) }}>
    <div class="vis-head">
      <div class="vis-copy">
        <div class="vis-kicker">VISIBILITY ENGINE</div>
        <h2 class="vis-title">{tr("suppliers.engine.title", "Transparent ranking: fit first, then signals.")}</h2>
        <p class="vis-sub">
          {tr(
            "suppliers.engine.body",
            "Prime & Verified add a priority boost only when routing fit is strong. Region matching includes group logic (e.g., East Asia / Europe). Larger RFQ budgets weight quality and response more."
          )}
        </p>

        <div class="vis-pill-row" aria-label="Engine highlights">
          <div class="vis-pill">Gated boost</div>
          <div class="vis-pill">Group regions</div>
          <div class="vis-pill">Process families</div>
          <div class="vis-pill">Budget-aware weighting</div>
        </div>
      </div>

      <div class="vis-ctx" aria-label="RFQ context controls">
        <div class="vis-ctx-title">{tr("suppliers.engine.ctxTitle", "Example RFQ context")}</div>

        <div class="vis-ctx-grid">
          <div>
            <div class="vis-ctx-label">{tr("suppliers.engine.regionQuick", "Region (quick)")}</div>
            <div class="vis-chip-row">
              {#each REGION_CHIPS as r}
                <button
                  type="button"
                  class="vis-chip {ctx.region === r ? 'is-active' : ''}"
                  on:click={() => setCtxRegion(r)}
                  title={REGION_BY_CODE.get(r)?.label}
                  aria-pressed={ctx.region === r}
                >
                  {REGION_BY_CODE.get(r)?.label ?? r}
                </button>
              {/each}
            </div>

            <div style="margin-top:10px">
              <div class="vis-ctx-label">{tr("suppliers.engine.regionFull", "Region (full list)")}</div>
              <select class="vis-select" bind:value={ctxRegionSelect} on:change={() => setCtxRegion(ctxRegionSelect)}>
                {#each Array.from(new Set(REGIONS.map((r) => r.group))) as grp}
                  <optgroup label={grp}>
                    {#each REGIONS.filter((r) => r.group === grp) as rr}
                      <option value={rr.code}>{rr.label}</option>
                    {/each}
                  </optgroup>
                {/each}
              </select>
            </div>
          </div>

          <div>
            <div class="vis-ctx-label">{tr("suppliers.engine.process", "Process")}</div>
            <select class="vis-select" bind:value={ctx.process} on:change={() => setCtxProcess(ctx.process)}>
              {#each PROCESS_GROUPS as g}
                <optgroup label={g.label}>
                  {#each g.items as p}
                    <option value={p}>{p}</option>
                  {/each}
                </optgroup>
              {/each}
            </select>
          </div>

          <div>
            <div class="vis-ctx-label">{tr("suppliers.engine.industry", "Industry")}</div>
            <select class="vis-select" bind:value={ctx.industry} on:change={() => setCtxIndustry(ctx.industry)}>
              {#each INDUSTRY_GROUPS as g}
                <optgroup label={g.label}>
                  {#each g.items as i}
                    <option value={i}>{i}</option>
                  {/each}
                </optgroup>
              {/each}
            </select>
          </div>

          <div>
            <div class="vis-ctx-label">{tr("suppliers.engine.budget", "Budget (RFQ ticket)")}</div>
            <div class="range-wrap">
              <input
                class="range"
                type="range"
                min="50000"
                max="1500000"
                step="25000"
                value={ctx.ticket}
                on:input={(e) => setCtxTicket(Number((e.currentTarget as HTMLInputElement).value))}
                aria-label="RFQ budget"
              />
              <div class="range-meta">
                <span class="range-pill">{money(ctx.ticket)}</span>
                <span class="range-note">
                  {ctx.ticket >= 600000
                    ? tr("suppliers.engine.budget.noteHigh", "High-ticket RFQ: quality + response weigh more.")
                    : ctx.ticket >= 250000
                      ? tr("suppliers.engine.budget.noteMid", "Mid-ticket RFQ: balanced fit + signals.")
                      : tr("suppliers.engine.budget.noteLow", "Lower-ticket RFQ: fit is dominant.")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="vis-ctx-foot">
          <span class="dot"></span>
          {tr("suppliers.engine.live", "Ranking updates instantly for this RFQ context.")}
        </div>
      </div>
    </div>

    <div class="vis-grid">
      <!-- Simulator -->
      <div id="simulator" class="sim-card" data-pulse={simPulse} aria-label="Placement simulator">
        <div class="sim-top">
          <div>
            <div class="sim-kicker">PLACEMENT SIMULATOR</div>
            <div class="sim-title">{tr("suppliers.sim.title", "See your company move up—only when fit is real.")}</div>
          </div>

          <div class="sim-plan" role="tablist" aria-label="Plan selection">
            <button
              type="button"
              class="sim-pill {mySimPlan === 'basic' ? 'on' : ''}"
              on:click={() => setSimPlan("basic")}
              role="tab"
              aria-selected={mySimPlan === "basic"}
            >
              Basic
            </button>
            <button
              type="button"
              class="sim-pill {mySimPlan === 'verified' ? 'on' : ''}"
              on:click={() => setSimPlan("verified")}
              role="tab"
              aria-selected={mySimPlan === "verified"}
            >
              Verified
            </button>
            <button
              type="button"
              class="sim-pill {mySimPlan === 'prime' ? 'on' : ''}"
              on:click={() => setSimPlan("prime")}
              role="tab"
              aria-selected={mySimPlan === "prime"}
            >
              Prime
            </button>
          </div>
        </div>

        <div class="sim-hint">
          {tr(
            "suppliers.sim.hint",
            "Your listing is highlighted. Upgrades help you enter top slots only when routing fit is strong—boost is gated to protect buyer outcomes."
          )}
        </div>

        <div class="sim-intel" aria-label="Inferred capabilities preview">
          <div class="intel-row">
            <div class="intel-label">Inferred processes</div>
            <div class="intel-pills">
              {#each inferred.processes.slice(0, 6) as p}
                <span class="intel-pill">{p}</span>
              {/each}
              {#if inferred.processes.length > 6}
                <span class="intel-pill dim">+{inferred.processes.length - 6}</span>
              {/if}
            </div>
          </div>
          <div class="intel-row">
            <div class="intel-label">Families</div>
            <div class="intel-pills">
              {#each inferred.familyPills as f}
                <span class="intel-pill dim">{familyLabel(f)}</span>
              {/each}
              {#if inferred.familyPills.length === 0}
                <span class="intel-pill dim">—</span>
              {/if}
            </div>
          </div>
        </div>

        <div class="sim-quick-tune" aria-label="Your signals tuning">
          <div class="qt">
            <div class="qt-lbl">Quality</div>
            <input class="qt-range" type="range" min="40" max="95" step="1" bind:value={mySimQuality} on:input={() => bumpSimPulse()} />
            <div class="qt-val">{mySimQuality}</div>
          </div>
          <div class="qt">
            <div class="qt-lbl">Response hrs</div>
            <input class="qt-range" type="range" min="2" max="36" step="1" bind:value={mySimResponseHrs} on:input={() => bumpSimPulse()} />
            <div class="qt-val">{mySimResponseHrs}h</div>
          </div>
          <div class="qt">
            <div class="qt-lbl">Completion</div>
            <input class="qt-range" type="range" min="40" max="98" step="1" bind:value={mySimCompletion} on:input={() => bumpSimPulse()} />
            <div class="qt-val">{mySimCompletion}%</div>
          </div>
        </div>

        <div class="sim-list">
          {#each [...topPlacements, ...restPlacements].slice(0, 10) as s (s.id)}
            <div class="sim-row {s.id === 'my_sim' ? 'is-mine' : ''}">
              <div class="sim-left">
                <div class="sim-rank">#{s.rank}</div>

                <div class="sim-name">
                  {s.name}
                  {#if s.plan === "prime"}
                    <span class="badge prime">PRIORITY</span>
                  {:else if s.plan === "verified"}
                    <span class="badge verified">VERIFIED</span>
                  {/if}
                </div>

                <div class="sim-meta">
                  <span class="meta-pill">{REGION_BY_CODE.get(s.region)?.label ?? s.region}</span>
                  <span class="meta-pill">{s.processes?.[0] ?? "Automation integration"}</span>
                  <span class="meta-pill dim">Fit {Math.round(s.fit)}</span>
                </div>

                <div class="sim-bars" aria-hidden="true">
                  <div class="bar">
                    <span style="width:{Math.round(s.fit)}%"></span>
                  </div>
                  <div class="bar dim">
                    <span style="width:{Math.round(s.qualityScore ?? 0)}%"></span>
                  </div>
                </div>
              </div>

              <div class="sim-right">
                <div class="sim-score">{Math.round(s.score)}</div>
                <button type="button" class="sim-why" on:click={(e) => openWhy(s, e)} aria-label={`Why placement for ${s.name}`}>
                  Why here?
                </button>
              </div>
            </div>
          {/each}
        </div>

        <div class="sim-foot">
          <div class="sim-foot-left">
            <span class="spark"></span>
            {tr("suppliers.sim.rotate", "Top slots rotate among high-fit suppliers to keep visibility fair.")}
          </div>
          <a class="sim-link" href="/pricing">{tr("suppliers.sim.pricing", "Compare plans →")}</a>
        </div>
      </div>

      <!-- Top placements -->
      <div class="place-card" aria-label="Top placements list">
        <div class="place-head">
          <div>
            <div class="place-kicker">TOP PLACEMENTS</div>
            <div class="place-title">{tr("suppliers.top.title", "Visible top slots (not hidden sorting).")}</div>
          </div>
          <div class="place-legend" aria-label="Plan legend">
            <span class="lg prime"></span> Prime
            <span class="lg verified"></span> Verified
            <span class="lg basic"></span> Basic
          </div>
        </div>

        <div class="place-top">
          {#each topPlacements as s (s.id)}
            <div class="place-item {s.id === 'my_sim' ? 'is-mine' : ''}">
              <div class="pi-left">
                <div class="pi-rank">#{s.rank}</div>
                <div class="pi-main">
                  <div class="pi-name">
                    {s.name}
                    {#if s.plan === "prime"}
                      <span class="badge prime">Priority placement</span>
                    {:else if s.plan === "verified"}
                      <span class="badge verified">Verified</span>
                    {:else}
                      <span class="badge basic">Basic</span>
                    {/if}
                  </div>
                  <div class="pi-sub">{s.reason}</div>

                  <div class="pi-chips">
                    <span class="chip">{REGION_BY_CODE.get(s.region)?.label ?? s.region}</span>
                    <span class="chip">{s.industries?.[0] ?? "Industrial"}</span>
                    <span class="chip dim">{s.avgResponseHours ?? 24}h avg</span>
                  </div>
                </div>
              </div>

              <div class="pi-right">
                <div class="pi-metric">
                  <div class="lbl">Fit</div>
                  <div class="val">{Math.round(s.fit)}</div>
                </div>
                <div class="pi-metric">
                  <div class="lbl">Rank</div>
                  <div class="val">{Math.round(s.score)}</div>
                </div>

                <div class="ring" title="Quality score">
                  <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
                    <circle class="ring-bg" cx="22" cy="22" r="18" />
                    <circle class="ring-fg" cx="22" cy="22" r="18" stroke-dasharray={ringDash(s.qualityScore ?? 0)} />
                  </svg>
                  <div class="ring-txt">{Math.round(s.qualityScore ?? 0)}</div>
                </div>
              </div>
            </div>
          {/each}
        </div>

        <div class="place-divider"></div>

        <div class="place-subhead">
          <div class="place-subtitle">{tr("suppliers.top.all", "All suppliers")}</div>
          <div class="place-subnote">{tr("suppliers.top.note", "Sorted by NovaNexus Rank (fit + signals + gated boost).")}</div>
        </div>

        <div class="place-rest">
          {#each restPlacements.slice(0, 8) as s (s.id)}
            <div class="rest-row {s.id === 'my_sim' ? 'is-mine' : ''}">
              <div class="rr-left">
                <span class="rr-rank">#{s.rank}</span>
                <span class="rr-name">{s.name}</span>
                {#if s.plan !== "basic"}
                  <span class="rr-tag {s.plan}">{s.plan}</span>
                {/if}
              </div>
              <div class="rr-right">
                <span class="rr-pill">Fit {Math.round(s.fit)}</span>
                <span class="rr-pill dim">Score {Math.round(s.score)}</span>
              </div>
            </div>
          {/each}
        </div>

        <div class="place-foot">
          <div class="place-foot-note">
            {tr(
              "suppliers.top.footer",
              "Buyers never see spam lists. Placement is earned by fit, reinforced by credible signals, and protected with rotation."
            )}
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Form card -->
  <div id="apply" class="sup-card" in:scale={{ duration: ms(320), start: 0.96 }}>
    <div class="sup-orbit sup-orbit-outer"></div>
    <div class="sup-orbit sup-orbit-inner"></div>
    <div class="sup-orbit-dot sup-orbit-dot-1"></div>
    <div class="sup-orbit-dot sup-orbit-dot-2"></div>
    <div class="sup-orbit-dot sup-orbit-dot-3"></div>

    <div class="apply-head">
      <div class="apply-kicker">APPLICATION</div>
      <div class="apply-title">{tr("suppliers.form.title", "Submit your factory / integration profile")}</div>
      <div class="apply-sub">
        {tr(
          "suppliers.form.sub",
          "This creates your supplier profile and enables fit-first routing. Keep it concise but specific—machines, line types, certifications, and typical lead times."
        )}
      </div>
    </div>

    {#if !submitted}
      <form class="sup-form-grid" on:submit|preventDefault={handleSubmit} aria-label="Supplier application form">
        <div in:fade={{ duration: ms(220), delay: ms(40) }}>
          <label class="sup-label" for="sup-company">
            {tr("suppliers.form.company", "Company name")} <span>*</span>
          </label>
          <input
            id="sup-company"
            class="sup-input"
            type="text"
            placeholder="AuroraFlux, HelioRack, VertexForge, ..."
            bind:value={form.company}
            on:input={() => injectMyCompanyIntoDirectory(form.company)}
            autocomplete="organization"
          />
          {#if errors.company}
            <div class="sup-error" role="alert">{errors.company}</div>
          {/if}
        </div>

        <div in:fade={{ duration: ms(220), delay: ms(80) }}>
          <label class="sup-label" for="sup-contact">
            {tr("suppliers.form.contact", "Main contact person")} <span>*</span>
          </label>
          <input id="sup-contact" class="sup-input" type="text" placeholder="Name / role" bind:value={form.contact} autocomplete="name" />
          {#if errors.contact}
            <div class="sup-error" role="alert">{errors.contact}</div>
          {/if}
        </div>

        <div in:fade={{ duration: ms(220), delay: ms(120) }}>
          <label class="sup-label" for="sup-email">
            {tr("suppliers.form.email", "Work email")} <span>*</span>
          </label>
          <input id="sup-email" class="sup-input" type="email" placeholder="name@company.com" bind:value={form.email} autocomplete="email" />
          {#if errors.email}
            <div class="sup-error" role="alert">{errors.email}</div>
          {/if}
        </div>

        <div in:fade={{ duration: ms(220), delay: ms(160) }}>
          <label class="sup-label" for="sup-capabilities">
            {tr("suppliers.form.capabilities", "Capabilities / machines")} <span>*</span>
          </label>
          <textarea
            id="sup-capabilities"
            class="sup-textarea"
            placeholder="Example: cleanroom packaging, ISO 13485, CNC machining, automation integration, conveyor lines, aluminum extrusion runout, hot saw..."
            bind:value={form.capabilities}
            on:input={() => bumpSimPulse()}
          />
          <div class="hint-row">
            <span class="hint-dot"></span>
            <span class="hint-text">{tr("suppliers.form.capHint", "Tip: include certifications (ISO/IATF/AS), typical lead time, and line scope.")}</span>
          </div>

          <div class="cap-preview" aria-label="Inferred processes preview">
            <div class="cap-title">Detected capabilities</div>
            <div class="cap-pills">
              {#each inferred.processes.slice(0, 8) as p}
                <span class="cap-pill">{p}</span>
              {/each}
              {#if inferred.processes.length === 0}
                <span class="cap-pill dim">—</span>
              {/if}
            </div>
          </div>

          {#if errors.capabilities}
            <div class="sup-error" role="alert">{errors.capabilities}</div>
          {/if}
        </div>

        <div in:fade={{ duration: ms(220), delay: ms(200) }}>
          <label class="sup-label" for="sup-website">{tr("suppliers.form.website", "Website or catalog URL")}</label>
          <input id="sup-website" class="sup-input" type="text" placeholder="https://..." bind:value={form.website} />
        </div>

        <div class="sup-two-col" in:fade={{ duration: ms(240), delay: ms(220) }}>
          <div>
            <label class="sup-label" for="sup-region">{tr("suppliers.form.region", "Region")}</label>
            <select id="sup-region" class="sup-select" bind:value={form.region} on:change={() => bumpSimPulse()}>
              {#each Array.from(new Set(REGIONS.map((r) => r.group))) as grp}
                <optgroup label={grp}>
                  {#each REGIONS.filter((r) => r.group === grp) as rr}
                    <option value={rr.code}>{rr.label}</option>
                  {/each}
                </optgroup>
              {/each}
            </select>
            <div class="sup-region-hint">{tr("suppliers.form.regionHint", "Where your main plant or installation team is based.")}</div>
          </div>

          <div>
            <label class="sup-label" for="sup-notes">{tr("suppliers.form.notes", "Anything else we should know?")}</label>
            <textarea
              id="sup-notes"
              class="sup-textarea sup-textarea-notes"
              placeholder="Export experience, certifications (ISO 13485, IATF 16949, AS9100), cleanroom class, typical lead times, install coverage, etc."
              bind:value={form.notes}
            />
          </div>
        </div>

        <div class="sup-actions" in:fade={{ duration: ms(260), delay: ms(260) }}>
          <button class="sup-submit" type="submit" disabled={loading} aria-busy={loading}>
            <span>{loading ? tr("suppliers.form.submitting", "Submitting…") : tr("suppliers.ctaApply", "Apply now")}</span>
          </button>

          <div class="sup-footer-note">
            {tr("suppliers.form.mvp", "MVP only: data is logged in the browser console.")}
            {#if !backendError && !backendWarning}
              {tr("suppliers.form.prodNote", " In production this will store to PocketBase and trigger an internal review workflow.")}
            {/if}
            {#if backendWarning}
              <br />{backendWarning}
            {/if}
          </div>

          {#if backendError}
            <div class="sup-error" style="margin-top:4px" role="alert">{backendError}</div>
          {/if}
        </div>
      </form>
    {:else}
      <div class="sup-thankyou" in:fade={{ duration: ms(260) }}>
        <div class="sup-thankyou-title">{tr("suppliers.thanks.title", "Thank you — we’ve received your info.")}</div>
        <p class="sup-thankyou-text">
          {tr(
            "suppliers.thanks.body",
            "We’ll review your capabilities and follow up with drawings and RFQs that match. If you have a product catalog or certifications, you can share them when we reply."
          )}
        </p>
        <p class="sup-note">
          {tr("suppliers.thanks.note", "Routing is fit-first: region + process + industry. No mass RFQ spam—only targeted opportunities.")}
        </p>

        <button class="sup-submit" type="button" style="margin-top:14px" on:click={submitAnother}>
          <span>{tr("suppliers.thanks.another", "Submit another factory")}</span>
        </button>
      </div>
    {/if}
  </div>

  <!-- WHY MODAL -->
  {#if showWhy && whyPayload}
    <div class="why-backdrop" on:click={closeWhy} role="presentation">
      <div class="why-modal" use:trapFocus on:click|stopPropagation role="dialog" aria-modal="true" aria-label="Why this placement modal">
        <div class="why-top">
          <div class="why-title">{tr("suppliers.why.title", "Why this placement?")}</div>
          <button class="why-x" type="button" on:click={closeWhy} aria-label="Close">×</button>
        </div>

        <div class="why-card">
          <div class="why-name">{whyPayload.supplierName}</div>
          <div class="why-metas">
            <span class="why-pill">{whyPayload.plan.toUpperCase()}</span>
            <span class="why-pill dim">Fit {whyPayload.fit}</span>
            <span class="why-pill dim">Score {whyPayload.score}</span>
          </div>
        </div>

        <div class="why-break">
          <div class="wb-title">{tr("suppliers.why.breakdown", "Score breakdown")}</div>
          <div class="wb-grid">
            {#each whyPayload.breakdown as b}
              <div class="wb-item">
                <div class="wb-top">
                  <span class="wb-label">{b.label}</span>
                  <span class="wb-val">{b.value}</span>
                </div>
                <div class="wb-bar" aria-hidden="true">
                  <span style="width:{clamp(b.value, 0, 45) * 2.2}%"></span>
                </div>
                {#if b.hint}
                  <div class="wb-hint">{b.hint}</div>
                {/if}
              </div>
            {/each}
          </div>
        </div>

        <div class="why-list">
          {#each whyPayload.notes as n}
            <div class="why-item">
              <span class="why-dot"></span>
              <span>{n}</span>
            </div>
          {/each}
        </div>

        <div class="why-foot">
          <a class="why-link" href="/pricing">{tr("suppliers.why.pricing", "See plan details →")}</a>
          <button class="why-btn" type="button" on:click={closeWhy}>{tr("common.close", "Close")}</button>
        </div>
      </div>
    </div>
  {/if}
</section>

<style>
  :global(:root) {
    --bg: #020617;
    --panel: rgba(2, 6, 23, 0.55);
    --panel2: rgba(2, 6, 23, 0.35);
    --stroke: rgba(148, 163, 184, 0.45);
    --stroke2: rgba(148, 163, 184, 0.28);
    --text: #e5e7eb;
    --muted: rgba(156, 163, 175, 0.95);
    --muted2: rgba(148, 163, 184, 0.95);
    --cyan: #22d3ee;
    --green: #22c55e;
    --violet: #a855f7;
    --blue: #3b82f6;
    --shadow: 0 26px 70px rgba(15, 23, 42, 0.75);
  }

  :global(body) {
    margin: 0;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background: radial-gradient(circle at top left, #020617 0, #020617 55%, #020617 100%);
    color: var(--text);
  }

  :global(a) {
    color: inherit;
  }

  .nn-page {
    max-width: 1120px;
    margin: 0 auto;
    padding: 96px 24px 120px;
    position: relative;
    overflow: hidden;
  }

  /* Ambient background */
  .bg-grid {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(to right, rgba(148, 163, 184, 0.08) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(148, 163, 184, 0.08) 1px, transparent 1px);
    background-size: 46px 46px;
    mask-image: radial-gradient(circle at 25% 10%, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0) 60%);
    opacity: 0.22;
    pointer-events: none;
  }

  .bg-glow {
    position: absolute;
    width: 520px;
    height: 520px;
    border-radius: 999px;
    filter: blur(30px);
    opacity: 0.22;
    pointer-events: none;
  }
  .bg-glow-a {
    top: -240px;
    left: -180px;
    background: radial-gradient(circle at 30% 30%, rgba(34, 211, 238, 0.55), transparent 65%);
  }
  .bg-glow-b {
    bottom: -280px;
    right: -220px;
    background: radial-gradient(circle at 30% 30%, rgba(168, 85, 247, 0.55), transparent 65%);
  }

  /* Header */
  .sup-header {
    max-width: 820px;
    margin-bottom: 26px;
    position: relative;
    z-index: 1;
  }

  .sup-header-kicker {
    font-size: 11px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--cyan);
    margin-bottom: 8px;
  }

  .sup-title {
    font-size: 30px;
    font-weight: 650;
    margin-bottom: 10px;
    color: #f9fafb;
    line-height: 1.15;
  }

  .sup-title-gradient {
    background: linear-gradient(135deg, #38bdf8, var(--violet), var(--green));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: titleShift 16s ease-in-out infinite;
  }

  .sup-sub {
    font-size: 14px;
    color: var(--muted);
    max-width: 740px;
    line-height: 1.6;
  }

  .sup-metrics {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 20px;
  }

  .sup-metric-pill {
    flex: 1;
    min-width: 160px;
    padding: 10px 14px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.55);
    background: radial-gradient(circle at top left, rgba(56, 189, 248, 0.18), rgba(15, 23, 42, 0.98));
    font-size: 11px;
    position: relative;
    overflow: hidden;
  }

  .sup-metric-pill::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(120deg, transparent, rgba(248, 250, 252, 0.2), transparent);
    transform: translateX(-100%);
    animation: shimmer 8s linear infinite;
    opacity: 0.9;
  }

  .sup-metric-label {
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #bfdbfe;
    margin-bottom: 2px;
  }

  .sup-metric-value {
    font-size: 16px;
    font-weight: 700;
    color: #e5e7eb;
  }

  .sup-mini-nav {
    display: flex;
    gap: 10px;
    margin-top: 16px;
    flex-wrap: wrap;
  }
  .mini-link {
    font-size: 12px;
    color: rgba(224, 231, 255, 0.95);
    text-decoration: none;
    padding: 8px 10px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.35);
    background: rgba(2, 6, 23, 0.35);
    transition: transform 0.14s ease, border-color 0.14s ease;
    white-space: nowrap;
  }
  .mini-link:hover {
    transform: translateY(-1px);
    border-color: rgba(34, 211, 238, 0.55);
  }

  .sup-benefits-title {
    margin-top: 26px;
    margin-bottom: 12px;
    font-size: 18px;
    font-weight: 650;
    color: #f9fafb;
  }

  .sup-benefits-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 10px;
  }

  .sup-benefit-card {
    border-radius: 18px;
    border: 1px solid rgba(148, 163, 184, 0.55);
    background: radial-gradient(circle at top left, rgba(56, 189, 248, 0.14), rgba(15, 23, 42, 0.98));
    padding: 12px 14px;
    position: relative;
    overflow: hidden;
  }
  .sup-benefit-card::after {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 0% 0%, rgba(34, 211, 238, 0.18), transparent 55%);
    opacity: 0.75;
    pointer-events: none;
  }

  .sup-benefit-heading {
    font-size: 13px;
    font-weight: 650;
    color: #e5e7eb;
    margin-bottom: 4px;
    position: relative;
    z-index: 1;
  }

  .sup-benefit-body {
    font-size: 12px;
    color: var(--muted);
    position: relative;
    z-index: 1;
    line-height: 1.55;
  }

  /* VISIBILITY ENGINE */
  .vis-wrap {
    margin-top: 14px;
    margin-bottom: 20px;
    position: relative;
    z-index: 1;
  }

  .vis-head {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.95fr);
    gap: 14px;
    align-items: stretch;
    margin-bottom: 12px;
  }

  .vis-kicker {
    font-size: 11px;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: rgba(56, 189, 248, 0.95);
    margin-bottom: 8px;
  }

  .vis-title {
    font-size: 20px;
    font-weight: 750;
    color: #f8fafc;
    margin: 0 0 6px;
    letter-spacing: 0.01em;
  }

  .vis-sub {
    font-size: 13px;
    color: var(--muted);
    margin: 0;
    line-height: 1.6;
    max-width: 720px;
  }

  .vis-pill-row {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    flex-wrap: wrap;
  }
  .vis-pill {
    font-size: 11px;
    padding: 6px 9px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.35);
    background: rgba(2, 6, 23, 0.35);
    color: rgba(226, 232, 240, 0.92);
  }

  .vis-ctx {
    border-radius: 18px;
    border: 1px solid rgba(148, 163, 184, 0.55);
    background: radial-gradient(circle at top left, rgba(99, 102, 241, 0.14), rgba(15, 23, 42, 0.98));
    padding: 12px 12px 10px;
    position: relative;
    overflow: hidden;
  }

  .vis-ctx::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 10% 10%, rgba(34, 211, 238, 0.25), transparent 55%);
    opacity: 0.6;
    pointer-events: none;
  }

  .vis-ctx-title {
    font-size: 12px;
    font-weight: 750;
    color: #e5e7eb;
    margin-bottom: 10px;
    position: relative;
    z-index: 1;
  }

  .vis-ctx-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
    position: relative;
    z-index: 1;
  }

  .vis-ctx-label {
    font-size: 11px;
    color: #93c5fd;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    margin-bottom: 6px;
  }

  .vis-chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .vis-chip {
    border-radius: 999px;
    padding: 7px 10px;
    border: 1px solid rgba(148, 163, 184, 0.55);
    background: rgba(15, 23, 42, 0.75);
    color: rgba(226, 232, 240, 0.9);
    font-size: 12px;
    cursor: pointer;
    transition: transform 0.14s ease, border-color 0.14s ease, background 0.14s ease;
  }

  .vis-chip:hover {
    transform: translateY(-1px);
    border-color: rgba(34, 211, 238, 0.65);
  }

  .vis-chip.is-active {
    border-color: rgba(34, 211, 238, 0.85);
    background: rgba(34, 211, 238, 0.12);
    color: #e5e7eb;
  }

  .vis-select {
    width: 100%;
    border-radius: 14px;
    border: 1px solid rgba(148, 163, 184, 0.6);
    background: rgba(15, 23, 42, 0.86);
    padding: 10px 12px;
    font-size: 13px;
    color: #e5e7eb;
    outline: none;
  }

  .range-wrap {
    border-radius: 16px;
    border: 1px solid rgba(148, 163, 184, 0.35);
    background: rgba(2, 6, 23, 0.35);
    padding: 10px 10px 9px;
  }
  .range {
    width: 100%;
    margin: 2px 0 10px;
  }
  .range-meta {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }
  .range-pill {
    font-size: 11px;
    padding: 6px 9px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.28);
    background: rgba(2, 6, 23, 0.25);
    color: rgba(226, 232, 240, 0.92);
  }
  .range-note {
    font-size: 11px;
    color: rgba(148, 163, 184, 0.95);
  }

  .vis-ctx-foot {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 10px;
    font-size: 11px;
    color: rgba(148, 163, 184, 0.9);
  }

  .vis-ctx-foot .dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: var(--green);
    box-shadow: 0 0 16px rgba(34, 197, 94, 0.85);
  }

  .vis-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
    gap: 12px;
    align-items: stretch;
  }

  .sim-card,
  .place-card {
    border-radius: 22px;
    border: 1px solid rgba(148, 163, 184, 0.55);
    background: radial-gradient(circle at top left, rgba(56, 189, 248, 0.14), rgba(15, 23, 42, 0.98));
    box-shadow: var(--shadow);
    overflow: hidden;
    position: relative;
  }

  .sim-card::before,
  .place-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 10% 10%, rgba(34, 211, 238, 0.22), transparent 55%);
    opacity: 0.65;
    pointer-events: none;
  }

  /* subtle pulse when sliders move */
  .sim-card[data-pulse] {
    animation: simPulse 420ms ease-out;
  }

  .sim-top {
    position: relative;
    z-index: 1;
    padding: 14px 14px 10px;
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-start;
  }

  .sim-kicker {
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(191, 219, 254, 0.95);
    margin-bottom: 6px;
  }

  .sim-title {
    font-size: 14px;
    font-weight: 750;
    color: #f8fafc;
    line-height: 1.3;
  }

  .sim-plan {
    display: inline-flex;
    gap: 8px;
    background: rgba(2, 6, 23, 0.55);
    border: 1px solid rgba(148, 163, 184, 0.45);
    border-radius: 999px;
    padding: 6px;
  }

  .sim-pill {
    border: 1px solid transparent;
    background: transparent;
    color: rgba(226, 232, 240, 0.9);
    border-radius: 999px;
    padding: 7px 10px;
    font-size: 12px;
    cursor: pointer;
    transition: transform 0.14s ease, background 0.14s ease, border-color 0.14s ease;
  }

  .sim-pill:hover {
    transform: translateY(-1px);
    border-color: rgba(148, 163, 184, 0.55);
  }

  .sim-pill.on {
    background: linear-gradient(135deg, rgba(56, 189, 248, 0.22), rgba(168, 85, 247, 0.18));
    border-color: rgba(34, 211, 238, 0.55);
    color: #e5e7eb;
  }

  .sim-hint {
    position: relative;
    z-index: 1;
    padding: 0 14px 10px;
    font-size: 12px;
    color: rgba(156, 163, 175, 0.95);
    line-height: 1.5;
  }

  .sim-intel {
    position: relative;
    z-index: 1;
    padding: 0 14px 12px;
    display: grid;
    gap: 8px;
  }
  .intel-row {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 10px;
    align-items: start;
  }
  .intel-label {
    font-size: 10px;
    color: rgba(148, 163, 184, 0.95);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    padding-top: 6px;
  }
  .intel-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .intel-pill {
    font-size: 11px;
    padding: 5px 9px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.26);
    background: rgba(2, 6, 23, 0.25);
    color: rgba(226, 232, 240, 0.92);
  }
  .intel-pill.dim {
    color: rgba(148, 163, 184, 0.95);
  }

  .sim-quick-tune {
    position: relative;
    z-index: 1;
    padding: 0 14px 12px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .qt {
    border-radius: 16px;
    border: 1px solid rgba(148, 163, 184, 0.3);
    background: rgba(2, 6, 23, 0.35);
    padding: 10px 10px 9px;
  }
  .qt-lbl {
    font-size: 10px;
    color: rgba(148, 163, 184, 0.95);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    margin-bottom: 6px;
  }
  .qt-range {
    width: 100%;
  }
  .qt-val {
    margin-top: 6px;
    font-size: 12px;
    color: rgba(226, 232, 240, 0.92);
    font-weight: 650;
  }

  .sim-list {
    position: relative;
    z-index: 1;
    padding: 0 12px 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .sim-row {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    border-radius: 16px;
    border: 1px solid rgba(148, 163, 184, 0.4);
    background: rgba(2, 6, 23, 0.45);
    padding: 10px 12px;
    transition: transform 0.16s ease, border-color 0.16s ease, background 0.16s ease;
  }

  .sim-row:hover {
    transform: translateY(-1px);
    border-color: rgba(34, 211, 238, 0.55);
    background: rgba(2, 6, 23, 0.55);
  }

  .sim-row.is-mine {
    border-color: rgba(34, 197, 94, 0.65);
    background: radial-gradient(circle at 10% 10%, rgba(34, 197, 94, 0.18), rgba(2, 6, 23, 0.52));
    box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.18);
  }

  .sim-left {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .sim-rank {
    font-size: 11px;
    color: rgba(191, 219, 254, 0.92);
    letter-spacing: 0.08em;
  }

  .sim-name {
    font-size: 13px;
    font-weight: 750;
    color: #e5e7eb;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .badge {
    font-size: 10px;
    padding: 4px 8px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.45);
    color: rgba(226, 232, 240, 0.92);
    background: rgba(2, 6, 23, 0.4);
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .badge.prime {
    border-color: rgba(34, 211, 238, 0.55);
    background: linear-gradient(135deg, rgba(34, 211, 238, 0.18), rgba(168, 85, 247, 0.14));
    color: rgba(224, 231, 255, 0.95);
  }

  .badge.verified {
    border-color: rgba(34, 197, 94, 0.45);
    background: rgba(34, 197, 94, 0.12);
    color: rgba(220, 252, 231, 0.95);
  }

  .badge.basic {
    border-color: rgba(148, 163, 184, 0.35);
    background: rgba(148, 163, 184, 0.1);
    color: rgba(226, 232, 240, 0.88);
  }

  .sim-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .meta-pill {
    font-size: 11px;
    padding: 4px 8px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.35);
    background: rgba(2, 6, 23, 0.35);
    color: rgba(226, 232, 240, 0.88);
    max-width: 100%;
  }

  .meta-pill.dim {
    color: rgba(148, 163, 184, 0.95);
  }

  .sim-bars {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 2px;
    max-width: 360px;
  }
  .bar {
    height: 7px;
    border-radius: 999px;
    background: rgba(148, 163, 184, 0.16);
    overflow: hidden;
  }
  .bar span {
    display: block;
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, rgba(34, 211, 238, 0.9), rgba(168, 85, 247, 0.75));
  }
  .bar.dim span {
    background: linear-gradient(90deg, rgba(34, 197, 94, 0.75), rgba(56, 189, 248, 0.6));
    opacity: 0.85;
  }

  .sim-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
    min-width: 92px;
  }

  .sim-score {
    font-size: 16px;
    font-weight: 800;
    color: #f8fafc;
  }

  .sim-why {
    font-size: 11px;
    color: rgba(191, 219, 254, 0.95);
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    text-decoration: underline;
    text-underline-offset: 3px;
    opacity: 0.9;
  }
  .sim-why:hover {
    opacity: 1;
  }

  .sim-foot {
    position: relative;
    z-index: 1;
    border-top: 1px solid rgba(148, 163, 184, 0.28);
    padding: 10px 14px 12px;
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: center;
  }

  .sim-foot-left {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 11px;
    color: rgba(156, 163, 175, 0.95);
    line-height: 1.35;
  }

  .spark {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: var(--cyan);
    box-shadow: 0 0 18px rgba(34, 211, 238, 0.85);
  }

  .sim-link {
    font-size: 12px;
    color: rgba(224, 231, 255, 0.95);
    text-decoration: none;
    padding: 8px 10px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.35);
    background: rgba(2, 6, 23, 0.35);
    transition: transform 0.14s ease, border-color 0.14s ease;
    white-space: nowrap;
  }

  .sim-link:hover {
    transform: translateY(-1px);
    border-color: rgba(34, 211, 238, 0.55);
  }

  /* Right card */
  .place-head {
    position: relative;
    z-index: 1;
    padding: 14px 14px 10px;
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
  }

  .place-kicker {
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(191, 219, 254, 0.95);
    margin-bottom: 6px;
  }

  .place-title {
    font-size: 14px;
    font-weight: 750;
    color: #f8fafc;
    line-height: 1.3;
  }

  .place-legend {
    font-size: 11px;
    color: rgba(148, 163, 184, 0.95);
    display: inline-flex;
    align-items: center;
    gap: 10px;
    white-space: nowrap;
  }

  .lg {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    display: inline-block;
    margin-left: 10px;
    margin-right: 6px;
  }
  .lg.prime {
    background: var(--cyan);
    box-shadow: 0 0 12px rgba(34, 211, 238, 0.7);
  }
  .lg.verified {
    background: var(--green);
    box-shadow: 0 0 12px rgba(34, 197, 94, 0.6);
  }
  .lg.basic {
    background: rgba(148, 163, 184, 0.9);
    box-shadow: 0 0 12px rgba(148, 163, 184, 0.35);
  }

  .place-top {
    position: relative;
    z-index: 1;
    padding: 0 12px 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .place-item {
    border-radius: 16px;
    border: 1px solid rgba(148, 163, 184, 0.4);
    background: rgba(2, 6, 23, 0.45);
    padding: 10px 12px;
    display: flex;
    justify-content: space-between;
    gap: 12px;
    transition: transform 0.16s ease, border-color 0.16s ease, background 0.16s ease;
  }

  .place-item:hover {
    transform: translateY(-1px);
    border-color: rgba(34, 211, 238, 0.55);
  }

  .place-item.is-mine {
    border-color: rgba(34, 197, 94, 0.65);
    background: radial-gradient(circle at 10% 10%, rgba(34, 197, 94, 0.18), rgba(2, 6, 23, 0.52));
  }

  .pi-left {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    min-width: 0;
  }

  .pi-rank {
    width: 36px;
    height: 36px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(148, 163, 184, 0.35);
    background: rgba(2, 6, 23, 0.35);
    font-size: 12px;
    color: rgba(191, 219, 254, 0.95);
    flex: 0 0 auto;
  }

  .pi-main {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .pi-name {
    font-size: 13px;
    font-weight: 750;
    color: #e5e7eb;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .pi-sub {
    font-size: 11px;
    color: rgba(156, 163, 175, 0.95);
    line-height: 1.35;
    max-width: 420px;
  }

  .pi-chips {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .chip {
    font-size: 11px;
    padding: 4px 8px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.28);
    background: rgba(2, 6, 23, 0.25);
    color: rgba(226, 232, 240, 0.92);
  }
  .chip.dim {
    color: rgba(148, 163, 184, 0.95);
  }

  .pi-right {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .pi-metric {
    border-radius: 14px;
    border: 1px solid rgba(148, 163, 184, 0.3);
    background: rgba(2, 6, 23, 0.35);
    padding: 8px 10px;
    min-width: 72px;
    text-align: right;
  }

  .pi-metric .lbl {
    font-size: 10px;
    color: rgba(148, 163, 184, 0.95);
    text-transform: uppercase;
    letter-spacing: 0.14em;
  }

  .pi-metric .val {
    font-size: 14px;
    font-weight: 800;
    color: #f8fafc;
  }

  .ring {
    width: 44px;
    height: 44px;
    position: relative;
  }
  .ring svg {
    display: block;
  }
  .ring-bg {
    fill: none;
    stroke: rgba(148, 163, 184, 0.18);
    stroke-width: 6;
  }
  .ring-fg {
    fill: none;
    stroke: rgba(34, 211, 238, 0.92);
    stroke-width: 6;
    stroke-linecap: round;
    transform: rotate(-90deg);
    transform-origin: 22px 22px;
  }
  .ring-txt {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-size: 11px;
    font-weight: 750;
    color: rgba(226, 232, 240, 0.92);
  }

  .place-divider {
    position: relative;
    z-index: 1;
    height: 1px;
    background: rgba(148, 163, 184, 0.22);
    margin: 2px 14px 10px;
  }

  .place-subhead {
    position: relative;
    z-index: 1;
    padding: 0 14px 10px;
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: baseline;
  }

  .place-subtitle {
    font-size: 13px;
    font-weight: 750;
    color: #e5e7eb;
  }

  .place-subnote {
    font-size: 11px;
    color: rgba(148, 163, 184, 0.95);
  }

  .place-rest {
    position: relative;
    z-index: 1;
    padding: 0 12px 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .rest-row {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: center;
    border-radius: 14px;
    border: 1px solid rgba(148, 163, 184, 0.28);
    background: rgba(2, 6, 23, 0.35);
    padding: 8px 10px;
  }

  .rest-row.is-mine {
    border-color: rgba(34, 197, 94, 0.55);
    background: rgba(34, 197, 94, 0.08);
  }

  .rr-left {
    display: flex;
    gap: 8px;
    align-items: center;
    min-width: 0;
  }

  .rr-rank {
    font-size: 11px;
    color: rgba(191, 219, 254, 0.95);
    min-width: 38px;
  }

  .rr-name {
    font-size: 12px;
    color: #e5e7eb;
    font-weight: 650;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 260px;
  }

  .rr-tag {
    font-size: 10px;
    padding: 3px 7px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.3);
    color: rgba(226, 232, 240, 0.9);
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }
  .rr-tag.verified {
    border-color: rgba(34, 197, 94, 0.45);
    background: rgba(34, 197, 94, 0.1);
  }
  .rr-tag.prime {
    border-color: rgba(34, 211, 238, 0.55);
    background: rgba(34, 211, 238, 0.12);
  }

  .rr-right {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: flex-end;
  }

  .rr-pill {
    font-size: 11px;
    padding: 4px 8px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.26);
    background: rgba(2, 6, 23, 0.25);
    color: rgba(226, 232, 240, 0.9);
  }

  .rr-pill.dim {
    color: rgba(148, 163, 184, 0.95);
  }

  .place-foot {
    position: relative;
    z-index: 1;
    border-top: 1px solid rgba(148, 163, 184, 0.22);
    padding: 10px 14px 12px;
  }

  .place-foot-note {
    font-size: 12px;
    color: rgba(156, 163, 175, 0.95);
    line-height: 1.45;
  }

  /* FORM CARD */
  .sup-card {
    position: relative;
    margin-top: 14px;
    background: radial-gradient(circle at top left, rgba(34, 211, 238, 0.16), rgba(15, 23, 42, 0.98));
    border-radius: 24px;
    padding: 30px 26px 32px;
    border: 1px solid rgba(148, 163, 184, 0.4);
    box-shadow: 0 26px 70px rgba(15, 23, 42, 0.95);
    overflow: hidden;
    animation: floatCard 10s ease-in-out infinite alternate;
  }

  .apply-head {
    position: relative;
    z-index: 1;
    margin-bottom: 14px;
    max-width: 760px;
  }

  .apply-kicker {
    font-size: 11px;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: rgba(191, 219, 254, 0.95);
    margin-bottom: 8px;
  }

  .apply-title {
    font-size: 18px;
    font-weight: 800;
    color: #f8fafc;
    margin-bottom: 6px;
  }

  .apply-sub {
    font-size: 12px;
    color: rgba(156, 163, 175, 0.95);
    line-height: 1.6;
  }

  .sup-form-grid {
    display: flex;
    flex-direction: column;
    gap: 18px;
    position: relative;
    z-index: 1;
  }

  .sup-orbit {
    position: absolute;
    right: -80px;
    top: 0;
    width: 320px;
    height: 320px;
    border-radius: 50%;
    border: 1px solid rgba(148, 163, 184, 0.35);
    background: radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.35), transparent 60%);
    filter: blur(1px);
    opacity: 0.7;
    pointer-events: none;
  }

  .sup-orbit-outer {
    animation: orbitDrift 26s ease-in-out infinite alternate;
  }

  .sup-orbit-inner {
    width: 220px;
    height: 220px;
    top: 60px;
    right: -30px;
    border-color: rgba(56, 189, 248, 0.5);
    animation: orbitSpin 22s linear infinite;
  }

  .sup-orbit-dot {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: var(--green);
    box-shadow: 0 0 14px rgba(34, 197, 94, 0.9);
    pointer-events: none;
  }

  .sup-orbit-dot-1 {
    top: 40px;
    right: 48px;
    animation: dotPulse 2.4s ease-in-out infinite;
  }
  .sup-orbit-dot-2 {
    top: 170px;
    right: 12px;
    animation: dotPulse 2.8s ease-in-out infinite 0.6s;
  }
  .sup-orbit-dot-3 {
    top: 250px;
    right: 120px;
    animation: dotPulse 3.1s ease-in-out infinite 1s;
  }

  .sup-label {
    font-size: 12px;
    color: #e5e7eb;
    margin-bottom: 4px;
    display: inline-block;
  }

  .sup-label span {
    color: #f97373;
  }

  .sup-input,
  .sup-textarea,
  .sup-select {
    width: 100%;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.7);
    background: rgba(15, 23, 42, 0.95);
    padding: 10px 14px;
    font-size: 13px;
    color: #e5e7eb;
    outline: none;
    transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, transform 0.12s ease;
  }

  .sup-textarea {
    border-radius: 16px;
    min-height: 86px;
    resize: vertical;
  }

  .sup-textarea-notes {
    min-height: 104px;
  }

  .sup-input::placeholder,
  .sup-textarea::placeholder {
    color: #6b7280;
  }

  .sup-input:focus,
  .sup-textarea:focus,
  .sup-select:focus {
    border-color: var(--cyan);
    box-shadow: 0 0 0 1px rgba(34, 211, 238, 0.7), 0 14px 32px rgba(15, 23, 42, 0.95);
    background: rgba(15, 23, 42, 0.98);
    transform: translateY(-1px);
  }

  :global(button:focus-visible),
  :global(a:focus-visible),
  :global(input:focus-visible),
  :global(select:focus-visible),
  :global(textarea:focus-visible) {
    outline: 2px solid rgba(34, 211, 238, 0.8);
    outline-offset: 2px;
  }

  .hint-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
    color: rgba(148, 163, 184, 0.95);
    font-size: 11px;
  }
  .hint-dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: rgba(34, 211, 238, 0.85);
    box-shadow: 0 0 14px rgba(34, 211, 238, 0.55);
  }

  .cap-preview {
    margin-top: 10px;
    border-radius: 16px;
    border: 1px solid rgba(148, 163, 184, 0.25);
    background: rgba(2, 6, 23, 0.32);
    padding: 10px 10px 9px;
  }
  .cap-title {
    font-size: 10px;
    color: rgba(148, 163, 184, 0.95);
    text-transform: uppercase;
    letter-spacing: 0.14em;
    margin-bottom: 8px;
  }
  .cap-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .cap-pill {
    font-size: 11px;
    padding: 5px 9px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.26);
    background: rgba(2, 6, 23, 0.25);
    color: rgba(226, 232, 240, 0.92);
  }
  .cap-pill.dim {
    color: rgba(148, 163, 184, 0.95);
  }

  .sup-error {
    font-size: 11px;
    color: #f97373;
    margin-top: 4px;
  }

  .sup-two-col {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.9fr);
    gap: 18px;
  }

  .sup-region-hint {
    font-size: 11px;
    color: #6b7280;
    margin-top: 4px;
  }

  .sup-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 6px;
  }

  .sup-footer-note {
    font-size: 11px;
    color: #6b7280;
    line-height: 1.5;
  }

  .sup-submit {
    align-self: flex-start;
    padding: 10px 22px;
    border-radius: 999px;
    border: none;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    background: conic-gradient(from 140deg, var(--blue), #22c1c3, var(--violet), var(--blue));
    color: #020617;
    box-shadow: 0 18px 46px rgba(15, 23, 42, 1), 0 0 0 1px rgba(148, 163, 184, 0.5);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    position: relative;
    overflow: hidden;
    transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease, opacity 0.18s ease;
  }

  .sup-submit[disabled] {
    opacity: 0.7;
    cursor: wait;
  }

  .sup-submit span {
    position: relative;
    z-index: 1;
  }

  .sup-submit::after {
    content: "→";
    font-size: 13px;
    margin-left: 4px;
    transition: transform 0.18s ease;
  }

  .sup-submit::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 0% 0%, rgba(248, 250, 252, 0.4), transparent 55%);
    mix-blend-mode: screen;
    opacity: 0;
    transition: opacity 0.18s ease;
  }

  .sup-submit:hover:not([disabled]) {
    transform: translateY(-1px);
    box-shadow: 0 24px 60px rgba(15, 23, 42, 1), 0 0 0 1px rgba(248, 250, 252, 0.7);
    filter: saturate(1.15);
  }

  .sup-submit:hover:not([disabled])::after {
    transform: translateX(2px);
  }
  .sup-submit:hover:not([disabled])::before {
    opacity: 1;
  }

  .sup-thankyou {
    position: relative;
    z-index: 1;
  }

  .sup-thankyou-title {
    font-size: 20px;
    font-weight: 750;
    margin-bottom: 8px;
    color: #f9fafb;
  }

  .sup-thankyou-text {
    font-size: 14px;
    color: #9ca3af;
    margin-bottom: 10px;
    line-height: 1.6;
  }
  .sup-note {
    font-size: 12px;
    color: #9ca3af;
    line-height: 1.55;
  }

  /* WHY MODAL */
  .why-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(2, 6, 23, 0.62);
    backdrop-filter: blur(6px);
    display: grid;
    place-items: center;
    padding: 20px;
    z-index: 60;
  }

  .why-modal {
    width: 100%;
    max-width: 680px;
    border-radius: 22px;
    border: 1px solid rgba(148, 163, 184, 0.55);
    background: radial-gradient(circle at top left, rgba(56, 189, 248, 0.16), rgba(2, 6, 23, 0.92));
    box-shadow: 0 30px 90px rgba(0, 0, 0, 0.65);
    padding: 14px 14px 12px;
    position: relative;
    overflow: hidden;
  }

  .why-modal::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 15% 12%, rgba(34, 211, 238, 0.25), transparent 60%);
    opacity: 0.65;
    pointer-events: none;
  }

  .why-top {
    position: relative;
    z-index: 1;
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: center;
    margin-bottom: 10px;
  }

  .why-title {
    font-size: 14px;
    font-weight: 850;
    color: #f8fafc;
    letter-spacing: 0.02em;
  }

  .why-x {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    border: 1px solid rgba(148, 163, 184, 0.35);
    background: rgba(2, 6, 23, 0.35);
    color: rgba(226, 232, 240, 0.95);
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
  }

  .why-card {
    position: relative;
    z-index: 1;
    border-radius: 18px;
    border: 1px solid rgba(148, 163, 184, 0.35);
    background: rgba(2, 6, 23, 0.35);
    padding: 12px 12px 10px;
    margin-bottom: 12px;
  }

  .why-name {
    font-size: 14px;
    font-weight: 850;
    color: #e5e7eb;
    margin-bottom: 8px;
  }

  .why-metas {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .why-pill {
    font-size: 11px;
    padding: 5px 9px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.28);
    background: rgba(2, 6, 23, 0.25);
    color: rgba(226, 232, 240, 0.92);
  }
  .why-pill.dim {
    color: rgba(148, 163, 184, 0.95);
  }

  .why-break {
    position: relative;
    z-index: 1;
    border-radius: 18px;
    border: 1px solid rgba(148, 163, 184, 0.25);
    background: rgba(2, 6, 23, 0.28);
    padding: 12px;
    margin-bottom: 12px;
  }

  .wb-title {
    font-size: 12px;
    font-weight: 800;
    color: rgba(226, 232, 240, 0.95);
    margin-bottom: 10px;
  }

  .wb-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .wb-item {
    border-radius: 14px;
    border: 1px solid rgba(148, 163, 184, 0.22);
    background: rgba(2, 6, 23, 0.28);
    padding: 10px;
  }

  .wb-top {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: baseline;
    margin-bottom: 8px;
  }

  .wb-label {
    font-size: 11px;
    color: rgba(148, 163, 184, 0.95);
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  .wb-val {
    font-size: 12px;
    font-weight: 850;
    color: rgba(226, 232, 240, 0.95);
  }

  .wb-bar {
    height: 8px;
    border-radius: 999px;
    background: rgba(148, 163, 184, 0.14);
    overflow: hidden;
  }

  .wb-bar span {
    display: block;
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, rgba(34, 211, 238, 0.9), rgba(168, 85, 247, 0.75));
  }

  .wb-hint {
    margin-top: 8px;
    font-size: 11px;
    color: rgba(156, 163, 175, 0.95);
    line-height: 1.35;
  }

  .why-list {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 10px;
    padding: 0 2px;
    margin-bottom: 12px;
  }

  .why-item {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    font-size: 12px;
    color: rgba(226, 232, 240, 0.92);
    line-height: 1.5;
  }

  .why-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: rgba(34, 211, 238, 0.85);
    box-shadow: 0 0 16px rgba(34, 211, 238, 0.55);
    margin-top: 5px;
    flex: 0 0 auto;
  }

  .why-foot {
    position: relative;
    z-index: 1;
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: center;
    border-top: 1px solid rgba(148, 163, 184, 0.2);
    padding-top: 10px;
  }

  .why-link {
    font-size: 12px;
    text-decoration: none;
    padding: 8px 10px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.35);
    background: rgba(2, 6, 23, 0.35);
    transition: transform 0.14s ease, border-color 0.14s ease;
    white-space: nowrap;
  }
  .why-link:hover {
    transform: translateY(-1px);
    border-color: rgba(34, 211, 238, 0.55);
  }

  .why-btn {
    padding: 8px 12px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.35);
    background: rgba(2, 6, 23, 0.35);
    color: rgba(226, 232, 240, 0.95);
    cursor: pointer;
  }

  /* Animations */
  @keyframes shimmer {
    0% { transform: translateX(-120%); }
    55% { transform: translateX(120%); }
    100% { transform: translateX(120%); }
  }

  @keyframes titleShift {
    0%, 100% { filter: hue-rotate(0deg); }
    50% { filter: hue-rotate(35deg); }
  }

  @keyframes floatCard {
    0% { transform: translateY(0px); }
    100% { transform: translateY(-6px); }
  }

  @keyframes orbitDrift {
    0% { transform: translate(0px, 0px) rotate(0deg); }
    100% { transform: translate(-10px, 8px) rotate(8deg); }
  }

  @keyframes orbitSpin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes dotPulse {
    0%, 100% { transform: scale(1); opacity: 0.95; }
    50% { transform: scale(1.35); opacity: 0.65; }
  }

  @keyframes simPulse {
    0% { box-shadow: var(--shadow); }
    40% { box-shadow: 0 26px 70px rgba(15, 23, 42, 0.75), 0 0 0 1px rgba(34, 211, 238, 0.35); }
    100% { box-shadow: var(--shadow); }
  }

  /* Responsive */
  @media (max-width: 980px) {
    .vis-head { grid-template-columns: 1fr; }
    .vis-grid { grid-template-columns: 1fr; }
    .sup-benefits-grid { grid-template-columns: 1fr; }
    .sup-two-col { grid-template-columns: 1fr; }
    .wb-grid { grid-template-columns: 1fr; }
    .intel-row { grid-template-columns: 1fr; }
  }

  /* Reduce motion */
  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; scroll-behavior: auto !important; }
  }
</style>
