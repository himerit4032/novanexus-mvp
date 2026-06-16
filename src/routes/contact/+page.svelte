<!-- src/routes/contact/+page.svelte -->

<svelte:head>
  <title>NovaNexus ▢ Contact</title>
</svelte:head>

<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { t } from 'svelte-i18n';
</script>

<main class="contact-page">
  <!-- HERO -->
  <section
    class="contact-hero"
    in:fly={{ y: 18, duration: 320 }}
  >
    <div class="contact-hero-orbit"></div>

    <header class="contact-hero-text" in:fade={{ duration: 260, delay: 40 }}>
      <p class="contact-kicker">{ $t('contact.hero.badge') }</p>
      <h1 class="contact-title">
        { $t('contact.hero.title') }
      </h1>
      <p class="contact-sub">
        { $t('contact.hero.body') }
      </p>
    </header>
  </section>

  <!-- CARDS -->
  <section
    class="contact-grid"
    in:fade={{ duration: 260, delay: 120 }}
  >
    <!-- For buyers -->
    <article class="contact-card" in:fade={{ duration: 260, delay: 140 }}>
      <h2 class="card-title">{ $t('contact.buyers.title') }</h2>
      <p class="card-body">
        { $t('contact.buyers.body') }
      </p>
      <ul class="card-list">
        {#each $t('contact.buyers.bullets') as item}
          <li>{item}</li>
        {/each}
      </ul>
      <a href="/rfqs/new" class="card-link">
        { $t('contact.buyers.cta') }
      </a>
    </article>

    <!-- For suppliers -->
    <article class="contact-card" in:fade={{ duration: 260, delay: 170 }}>
      <h2 class="card-title">{ $t('contact.suppliers.title') }</h2>
      <p class="card-body">
        { $t('contact.suppliers.body') }
      </p>
      <ul class="card-list">
        {#each $t('contact.suppliers.bullets') as item}
          <li>{item}</li>
        {/each}
      </ul>
      <!-- 지금은 간단히 Join 폼으로 연결 -->
      <a href="/auth/join" class="card-link">
        { $t('contact.suppliers.cta') }
      </a>
    </article>

    <!-- Direct email -->
    <article class="contact-card contact-card-email" in:fade={{ duration: 260, delay: 200 }}>
      <h2 class="card-title">{ $t('contact.email.title') }</h2>
      <p class="card-body">
        { $t('contact.email.body') }
      </p>

      <a
        class="email-address"
        href={`mailto:${$t('contact.email.address')}`}
      >
        { $t('contact.email.address') }
      </a>

      <p class="email-footnote">
        { $t('contact.email.footnote') }
      </p>
    </article>
  </section>
</main>

<style>
  .contact-page {
    max-width: 1120px;
    margin: 0 auto;
    padding: 96px 24px 72px;
    color: #e5e7eb;
    position: relative;
  }

  /* HERO --------------------------------------------------------- */

  .contact-hero {
    position: relative;
    margin-bottom: 32px;
    overflow: hidden;
  }

  .contact-hero-orbit {
    position: absolute;
    inset: -160px -120px auto auto;
    background:
      radial-gradient(circle at 20% 0%, rgba(56, 189, 248, 0.35), transparent 55%),
      radial-gradient(circle at 80% 65%, rgba(129, 140, 248, 0.28), transparent 55%);
    opacity: 0.6;
    filter: blur(18px);
    pointer-events: none;
    animation: orbitDrift 18s ease-in-out infinite alternate;
  }

  .contact-hero-text {
    max-width: 640px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: relative;
    z-index: 1;
  }

  .contact-kicker {
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #38bdf8;
  }

  .contact-title {
    font-size: 30px;
    line-height: 1.2;
    font-weight: 600;
  }

  .contact-sub {
    font-size: 14px;
    color: #9ca3af;
    max-width: 640px;
  }

  /* GRID / CARDS ------------------------------------------------- */

  .contact-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
  }

  @media (max-width: 900px) {
    .contact-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  .contact-card {
    position: relative;
    border-radius: 18px;
    border: 1px solid rgba(31, 41, 55, 1);
    background: radial-gradient(
      circle at top,
      rgba(15, 23, 42, 0.98),
      rgba(2, 6, 23, 1)
    );
    padding: 18px 20px;
    font-size: 13px;
    box-shadow: 0 18px 42px rgba(15, 23, 42, 1);
    overflow: hidden;
    transition:
      transform 0.18s ease,
      box-shadow 0.18s ease,
      background 0.18s ease;
  }

  .contact-card::before {
    content: '';
    position: absolute;
    inset: -40% -40% auto auto;
    background: radial-gradient(
      circle at top right,
      rgba(56, 189, 248, 0.22),
      transparent 60%
    );
    opacity: 0.6;
    filter: blur(18px);
    pointer-events: none;
  }

  .contact-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 22px 52px rgba(15, 23, 42, 1);
    background: radial-gradient(
      circle at top left,
      rgba(37, 99, 235, 0.3),
      rgba(15, 23, 42, 0.98)
    );
  }

  .card-title {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .card-body {
    color: #d1d5db;
    margin-bottom: 8px;
  }

  .card-list {
    list-style: none;
    padding: 0;
    margin: 0 0 10px 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
    color: #cbd5f5;
  }

  .card-list li {
    position: relative;
    padding-left: 18px;
  }

  .card-list li::before {
    content: '▢';
    position: absolute;
    left: 0;
    top: 0;
    font-size: 11px;
    color: #60a5fa;
  }

  .card-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #bfdbfe;
    text-decoration: none;
  }

  .card-link::after {
    content: '→';
    font-size: 13px;
    transition: transform 0.18s ease;
  }

  .card-link:hover::after {
    transform: translateX(2px);
  }

  /* EMAIL CARD --------------------------------------------------- */

  .contact-card-email {
    /* same grid span on desktop, full width on mobile */
  }

  .email-address {
    display: inline-flex;
    margin: 6px 0 4px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
      'Liberation Mono', 'Courier New', monospace;
    font-size: 13px;
    color: #e5e7eb;
    text-decoration: none;
  }

  .email-address:hover {
    text-decoration: underline;
  }

  .email-footnote {
    font-size: 12px;
    color: #9ca3af;
  }

  /* KEYFRAMES ---------------------------------------------------- */

  @keyframes orbitDrift {
    0% {
      transform: translate3d(0, 0, 0);
    }
    100% {
      transform: translate3d(-18px, 10px, 0);
    }
  }
</style>
