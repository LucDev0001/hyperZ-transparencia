<!-- Conteúdo: Políticos (Deputados Federais) -->
<div id="content-politicos" class="hidden animate-fade-in pb-16">
  <!-- SaaS Filter Bar -->
  <div class="glass-panel p-5 rounded-2xl border border-white/10 mb-6 shadow-xl">
    <div class="flex items-center justify-between pb-3 mb-4 border-b border-white/5 flex-wrap gap-2">
      <div class="flex items-center gap-2.5">
        <div class="w-7 h-7 rounded-lg bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center">
          <?= getSaaSIcon('user', 'w-4 h-4') ?>
        </div>
        <div>
          <h2 class="text-sm font-bold text-white">Câmara dos Deputados</h2>
          <p class="text-[11px] text-zinc-500">Audite cotas, presença, gastos com assessoria e despesas de gabinete</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-[11px] font-mono text-zinc-500 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/5">513 Titulares</span>
        <span class="text-[10px] font-bold text-violet-400 bg-violet-950/40 px-2 py-1 rounded-lg border border-violet-500/30">API Câmara v2</span>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
      <!-- Estado -->
      <div class="lg:col-span-3">
        <label class="block text-[11px] text-zinc-400 mb-1 font-semibold uppercase tracking-wider">Estado (UF)</label>
        <select
          id="stateSelect"
          onchange="loadDeputies()"
          class="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-violet-500 outline-none transition">
          <option value="">Todos os Estados</option>
          <option value="SP">São Paulo (SP)</option>
          <option value="RJ">Rio de Janeiro (RJ)</option>
          <option value="MG">Minas Gerais (MG)</option>
          <option value="BA">Bahia (BA)</option>
          <option value="RS">Rio Grande do Sul (RS)</option>
          <option value="PR">Paraná (PR)</option>
          <option value="PE">Pernambuco (PE)</option>
          <option value="CE">Ceará (CE)</option>
          <option value="PA">Pará (PA)</option>
          <option value="SC">Santa Catarina (SC)</option>
          <option value="MA">Maranhão (MA)</option>
          <option value="GO">Goiás (GO)</option>
          <option value="AM">Amazonas (AM)</option>
          <option value="ES">Espírito Santo (ES)</option>
          <option value="PB">Paraíba (PB)</option>
          <option value="RN">Rio Grande do Norte (RN)</option>
          <option value="MT">Mato Grosso (MT)</option>
          <option value="AL">Alagoas (AL)</option>
          <option value="PI">Piauí (PI)</option>
          <option value="DF">Distrito Federal (DF)</option>
          <option value="MS">Mato Grosso do Sul (MS)</option>
          <option value="SE">Sergipe (SE)</option>
          <option value="RO">Rondônia (RO)</option>
          <option value="TO">Tocantins (TO)</option>
          <option value="AC">Acre (AC)</option>
          <option value="AP">Amapá (AP)</option>
          <option value="RR">Roraima (RR)</option>
        </select>
      </div>

      <!-- Partido -->
      <div class="lg:col-span-3">
        <label class="block text-[11px] text-zinc-400 mb-1 font-semibold uppercase tracking-wider">Partido</label>
        <select
          id="partySelect"
          onchange="loadDeputies()"
          class="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-violet-500 outline-none transition">
          <option value="">Todos os Partidos</option>
        </select>
      </div>

      <!-- Nome -->
      <div class="lg:col-span-6">
        <label class="block text-[11px] text-zinc-400 mb-1 font-semibold uppercase tracking-wider">Buscar por Nome</label>
        <div class="flex gap-2">
          <div class="relative flex-1">
            <input
              type="text"
              id="nameSearch"
              placeholder="Digite o nome do parlamentar..."
              class="w-full bg-zinc-900/80 border border-white/10 rounded-xl pl-3 pr-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-violet-500 outline-none transition"
              onkeydown="if (event.key === 'Enter') loadDeputies();" />
          </div>
          <button
            onclick="loadDeputies()"
            class="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl font-semibold text-xs transition flex items-center gap-1.5 shadow-md shadow-violet-900/30 flex-shrink-0">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/></svg>
            <span>Filtrar</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <div
    id="deputiesGrid"
    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
    <!-- Initial Skeleton Placeholders -->
    <div class="glass-card p-4 rounded-2xl border border-white/5 bg-zinc-900/40 flex flex-col gap-3">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-full skeleton-box flex-shrink-0"></div>
        <div class="flex-1 space-y-2"><div class="h-4 w-3/4 skeleton-box"></div><div class="h-3 w-1/2 skeleton-box"></div></div>
      </div>
      <div class="h-3 w-full skeleton-box mt-2"></div>
    </div>
    <div class="glass-card p-4 rounded-2xl border border-white/5 bg-zinc-900/40 flex flex-col gap-3">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-full skeleton-box flex-shrink-0"></div>
        <div class="flex-1 space-y-2"><div class="h-4 w-3/4 skeleton-box"></div><div class="h-3 w-1/2 skeleton-box"></div></div>
      </div>
      <div class="h-3 w-full skeleton-box mt-2"></div>
    </div>
    <div class="glass-card p-4 rounded-2xl border border-white/5 bg-zinc-900/40 flex flex-col gap-3">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-full skeleton-box flex-shrink-0"></div>
        <div class="flex-1 space-y-2"><div class="h-4 w-3/4 skeleton-box"></div><div class="h-3 w-1/2 skeleton-box"></div></div>
      </div>
      <div class="h-3 w-full skeleton-box mt-2"></div>
    </div>
    <div class="glass-card p-4 rounded-2xl border border-white/5 bg-zinc-900/40 flex flex-col gap-3">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-full skeleton-box flex-shrink-0"></div>
        <div class="flex-1 space-y-2"><div class="h-4 w-3/4 skeleton-box"></div><div class="h-3 w-1/2 skeleton-box"></div></div>
      </div>
      <div class="h-3 w-full skeleton-box mt-2"></div>
    </div>
  </div>
</div>
