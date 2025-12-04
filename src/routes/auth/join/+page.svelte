<script lang="ts">
  import { fade, fly } from "svelte/transition";

  let name = "";
  let email = "";
  let role = "buyer";
  let notes = "";
  let submitted = false;

  const handleSubmit = async () => {
    // 나중에 PocketBase collection 연결하면 여기서 POST
    submitted = false;
    await new Promise((r) => setTimeout(r, 600));
    submitted = true;
  };
</script>

<svelte:head>
  <title>Join beta ▢ NovaNexus</title>
</svelte:head>

<div class="min-h-[calc(100vh-160px)] flex items-center justify-center px-6 py-12 bg-slate-950">
  <div
    class="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.9)]"
    in:fade={{ duration: 250 }}
    in:fly={{ y: 16 }}
  >
    <h1 class="text-2xl font-semibold mb-2">Join the private beta</h1>
    <p class="text-sm text-slate-300 mb-6">
      Early access for buyers and suppliers working on real production
      projects. Tell us who you are and what you’re building.
    </p>

    <form
      class="space-y-4"
      on:submit|preventDefault={handleSubmit}
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1">
          <label class="text-xs text-slate-300">Name</label>
          <input
            bind:value={name}
            required
            class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div class="space-y-1">
          <label class="text-xs text-slate-300">Work email</label>
          <input
            type="email"
            bind:value={email}
            required
            class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div class="space-y-1">
        <label class="text-xs text-slate-300">I’m primarily a…</label>
        <select
          bind:value={role}
          class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-blue-500"
        >
          <option value="buyer">Buyer (operations / engineering)</option>
          <option value="supplier">Supplier / manufacturer</option>
          <option value="both">Both sides</option>
        </select>
      </div>

      <div class="space-y-1">
        <label class="text-xs text-slate-300">
          What kind of projects or lines are you working on?
        </label>
        <textarea
          rows="4"
          bind:value={notes}
          class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-blue-500"
          placeholder="Example: aluminum extrusion lines for construction, racking systems in the U.S., warehouse robotics in SE Asia…"
        ></textarea>
      </div>

      <button
        type="submit"
        class="w-full mt-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 py-2.5 text-sm font-semibold hover:from-blue-400 hover:to-purple-400 transition"
      >
        Request access
      </button>
    </form>

    {#if submitted}
      <p class="mt-4 text-xs text-emerald-300">
        Request received. In the current MVP, submissions are reviewed manually.
        You’ll get a follow-up by email once an account is created.
      </p>
    {/if}
  </div>
</div>
