<!-- src/lib/components/LanguageSwitcher.svelte -->
<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { browser } from '$app/environment';
  import { SUPPORTED_LOCALES, changeLocale, locale } from '$lib/i18n/config';
  import { get } from 'svelte/store';

  let open = false;

  // 현재 locale 표시 값 (store와 동기화)
  let current: string = (get(locale) as string) || 'en';

  // DOM refs
  let rootEl: HTMLDivElement | null = null;
  let buttonEl: HTMLButtonElement | null = null;
  let menuEl: HTMLDivElement | null = null;

  // accessibility ids
  const menuId = 'nx-locale-menu';
  const buttonId = 'nx-locale-button';

  // store subscription
  let unsub: (() => void) | null = null;

  const normalizeLocale = (code: string) => {
    const exists = SUPPORTED_LOCALES.some((x) => x.code === code);
    return exists ? code : 'en';
  };

  const handleChange = async (code: string) => {
    const next = normalizeLocale(code);
    if (next === current) {
      open = false;
      await tick();
      buttonEl?.focus?.();
      return;
    }

    current = next;
    changeLocale(next); // 여기서 setupI18n + locale.set 처리

    open = false;
    await tick();
    buttonEl?.focus?.();
  };

  const toggle = async () => {
    open = !open;
    if (open) {
      await tick();
      // 메뉴가 열리면 현재 선택된 항목 또는 첫 항목에 포커스
      const active = menuEl?.querySelector<HTMLButtonElement>(
        `button[data-locale="${current}"]`
      );
      (active ?? menuEl?.querySelector<HTMLButtonElement>('button'))?.focus?.();
    }
  };

  const close = async () => {
    if (!open) return;
    open = false;
    await tick();
    buttonEl?.focus?.();
  };

  const onDocumentPointerDown = (e: PointerEvent) => {
    if (!open) return;
    const t = e.target as Node | null;
    if (!t) return;
    if (rootEl && !rootEl.contains(t)) {
      void close();
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    // 버튼 포커스 상태에서 처리
    const active = document.activeElement as HTMLElement | null;
    const isOnButton = active === buttonEl;

    // 메뉴가 닫힌 상태에서: Enter/Space/ArrowDown으로 열기
    if (!open && isOnButton) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        void toggle();
      }
      return;
    }

    if (!open) return;

    // 메뉴 열린 상태
    if (e.key === 'Escape') {
      e.preventDefault();
      void close();
      return;
    }

    // 메뉴 내 키보드 이동
    const items = Array.from(menuEl?.querySelectorAll<HTMLButtonElement>('button') ?? []);
    if (!items.length) return;

    const idx = items.findIndex((el) => el === document.activeElement);
    const nextIndex = (i: number) => (i + items.length) % items.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const ni = idx >= 0 ? nextIndex(idx + 1) : 0;
      items[ni].focus();
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const ni = idx >= 0 ? nextIndex(idx - 1) : items.length - 1;
      items[ni].focus();
      return;
    }

    if (e.key === 'Home') {
      e.preventDefault();
      items[0].focus();
      return;
    }

    if (e.key === 'End') {
      e.preventDefault();
      items[items.length - 1].focus();
      return;
    }
  };

  onMount(() => {
    // locale store 변화에 UI 표시 자동 동기화
    unsub = locale.subscribe((v) => {
      current = normalizeLocale(String(v || 'en'));
    });

    if (browser) {
      document.addEventListener('pointerdown', onDocumentPointerDown, { passive: true });
      window.addEventListener('keydown', onKeyDown, { passive: false });
    }
  });

  onDestroy(() => {
    unsub?.();
    unsub = null;

    if (browser) {
      document.removeEventListener('pointerdown', onDocumentPointerDown as any);
      window.removeEventListener('keydown', onKeyDown as any);
    }
  });
</script>

<div class="relative" bind:this={rootEl}>
  <button
    id={buttonId}
    bind:this={buttonEl}
    type="button"
    class="flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-1.5 text-xs md:text-sm text-slate-100 border border-slate-700/70 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
    aria-haspopup="menu"
    aria-controls={menuId}
    aria-expanded={open}
    on:click={toggle}
  >
    <span class="uppercase tracking-wide text-[10px] md:text-xs">{current}</span>
    <span class="text-[10px] md:text-xs" aria-hidden="true">▾</span>
  </button>

  {#if open}
    <div
      id={menuId}
      bind:this={menuEl}
      role="menu"
      aria-labelledby={buttonId}
      class="absolute right-0 mt-2 w-40 rounded-xl bg-slate-900/95 border border-slate-700/70 shadow-xl backdrop-blur z-30 overflow-hidden"
    >
      {#each SUPPORTED_LOCALES as item (item.code)}
        <button
          type="button"
          role="menuitemradio"
          aria-checked={item.code === current}
          data-locale={item.code}
          class="flex w-full items-center justify-between px-3 py-2 text-[11px] text-slate-100 hover:bg-slate-800/80 focus:bg-slate-800/80 focus:outline-none"
          on:click={() => handleChange(item.code)}
        >
          <span>{item.label}</span>
          {#if item.code === current}
            <span aria-hidden="true">•</span>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>
