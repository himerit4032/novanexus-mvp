<!-- src/lib/components/LanguageSwitcher.svelte -->
<script lang="ts">
  import { browser } from '$app/environment';
  import { SUPPORTED_LOCALES, changeLocale, locale } from '$lib/i18n/config';
  import { get } from 'svelte/store';

  let open = false;
  let current = (get(locale) as string) || 'en';

  const handleChange = (code: string) => {
    current = code;
    changeLocale(code); // 여기서 알아서 setupI18n + locale.set 처리
    open = false;

    if (browser) {
      // 굳이 안 해도 되지만, 혹시 몰라서 한 번 더 저장
      localStorage.setItem('locale', code);
    }
  };
</script>

<div class="relative">
  <button
    type="button"
    class="flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-1.5 text-xs md:text-sm text-slate-100 border border-slate-700/70"
    on:click={() => (open = !open)}
  >
    <span class="uppercase tracking-wide text-[10px] md:text-xs">{current}</span>
    <span class="text-[10px] md:text-xs">▾</span>
  </button>

  {#if open}
    <div
      class="absolute right-0 mt-2 w-40 rounded-xl bg-slate-900/95 border border-slate-700/70 shadow-xl backdrop-blur z-30"
    >
      {#each SUPPORTED_LOCALES as item}
        <button
          type="button"
          class="flex w-full items-center justify-between px-3 py-2 text-[11px] text-slate-100 hover:bg-slate-800/80"
          on:click={() => handleChange(item.code)}
        >
          <span>{item.label}</span>
          {#if item.code === current}
            <span>•</span>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>
