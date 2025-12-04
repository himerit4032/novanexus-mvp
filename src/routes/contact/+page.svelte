<!-- src/routes/contact/+page.svelte -->
<svelte:head>
  <title>NovaNexus ▢ Contact</title>
</svelte:head>

<main class="contact-page">
  <section class="contact-hero">
    <div>
      <p class="contact-kicker">FOR BUYERS · SUPPLIERS</p>
      <h1 class="contact-title">Start with one project or one factory.</h1>
      <p class="contact-sub">
        Share a quick outline of what you’re working on. We’ll follow up with
        a short list of next steps – whether that’s an RFQ intake, a supplier
        intro, or a sanity check on scope and budget.
      </p>
    </div>
  </section>

  <section class="contact-grid">
    <article class="contact-card">
      <h2>For buyers</h2>
      <p>
        Planning a new line, retrofit, or warehouse project and want to know if
        NovaNexus is a fit?
      </p>
      <ul>
        <li>▢ Quick project outline (product, volume, timeline)</li>
        <li>▢ Region / preferred installation window</li>
        <li>▢ Any constraints we should know up front</li>
      </ul>
      <a href="/rfqs/new" class="contact-link">Create RFQ →</a>
    </article>

    <article class="contact-card">
      <h2>For suppliers</h2>
      <p>
        Factory, integrator, or automation shop interested in being considered
        for matched projects?
      </p>
      <ul>
        <li>▢ Core processes & machines</li>
        <li>▢ Target project size / ticket</li>
        <li>▢ Certifications & reference installations</li>
      </ul>
      <a href="/dashboard/supplier" class="contact-link">Go to supplier portal →</a>
    </article>

    <article class="contact-card contact-card-wide">
      <h2>Direct email</h2>
      <p>
        Prefer email? Send a short note with your role and what you’re trying to
        solve. Attach layouts, photos, or existing RFQs if helpful.
      </p>
      <p class="contact-email">
        contact@novanexus.app
      </p>
      <p class="contact-note">
        We typically respond within 1–2 business days for active projects.
      </p>
    </article>
  </section>
</main>

<style>
  .contact-page {
    max-width: 1120px;
    margin: 0 auto;
    padding: 88px 24px 72px;
    color: #e5e7eb;
  }

  .contact-hero {
    margin-bottom: 32px;
  }

  .contact-kicker {
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #6b7280;
    margin-bottom: 6px;
  }

  .contact-title {
    font-size: 26px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .contact-sub {
    font-size: 13px;
    color: #9ca3af;
    max-width: 640px;
  }

  .contact-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }

  .contact-card {
    border-radius: 18px;
    border: 1px solid rgba(31, 41, 55, 1);
    background: radial-gradient(circle at top, rgba(15, 23, 42, 0.98), rgba(2, 6, 23, 1));
    padding: 16px 18px;
    font-size: 12px;
    box-shadow: 0 18px 42px rgba(15, 23, 42, 1);
  }

  .contact-card h2 {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .contact-card p {
    color: #d1d5db;
    margin-bottom: 8px;
  }

  .contact-card ul {
    color: #9ca3af;
    margin-bottom: 10px;
  }

  .contact-card ul li + li {
    margin-top: 3px;
  }

  .contact-card-wide {
    grid-column: span 1;
  }

  .contact-email {
    font-size: 13px;
    font-weight: 500;
    color: #e5e7eb;
    margin-bottom: 4px;
  }

  .contact-note {
    font-size: 11px;
    color: #9ca3af;
  }

  .contact-link {
    font-size: 12px;
    color: #60a5fa;
    text-decoration: none;
  }

  .contact-link:hover {
    text-decoration: underline;
  }

  @media (max-width: 900px) {
    .contact-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .contact-card-wide {
      grid-column: span 1;
    }
  }
</style>
