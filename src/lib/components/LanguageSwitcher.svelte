<!-- src/lib/components/LanguageSwitcher.svelte -->
<script lang="ts">
  import { locale } from 'svelte-i18n';
  import { SUPPORTED_LOCALES } from '$lib/i18n/config';
</script>

<div class="relative">
  <select
    aria-label="Select language"
    title="Select language"
    class="bg-slate-900/70 border border-slate-600/70 rounded-full px-3 py-1 text-xs md:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
    bind:value={$locale}
  >
    {#each SUPPORTED_LOCALES as l}
      <option value={l.code}>{l.label}</option>
    {/each}
  </select>
</div>
