<!-- Conteúdo: Radar de Conexões -->
<div id="content-rede" class="hidden animate-fade-in flex flex-col gap-3">
<!-- Header + Search -->
<div class="glass-panel p-3 sm:p-4 rounded-2xl flex flex-col gap-3">
  <div class="flex items-center gap-3">
    <div class="text-2xl sm:text-3xl">🕸️</div>
    <div class="flex-1 min-w-0">
      <h3 class="text-base sm:text-xl font-bold text-white leading-tight">Radar de Conexões</h3>
      <p class="text-zinc-500 text-xs hidden sm:block">Cruze deputados, empresas, servidores, sanções e notícias.</p>
    </div>
    <div class="flex gap-2 flex-shrink-0">
      <button onclick="ngOpenModal()" class="hidden sm:flex items-center gap-1.5 bg-violet-700 hover:bg-violet-600 text-white px-3 py-2 rounded-xl text-sm font-bold transition">🗺️ Ver Mapa</button>
      <button onclick="ngClear()" class="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-2 rounded-xl text-sm transition" title="Limpar">🗑️</button>
      <button onclick="ngExport()" class="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-2 rounded-xl text-sm transition" title="Exportar PNG">📷</button>
    </div>
  </div>
  <!-- Barra de busca -->
  <div class="flex gap-2">
    <input id="ng-search-input" type="text" placeholder="Nome do deputado ou CNPJ…"
      class="flex-1 bg-zinc-800 border border-white/10 text-white text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-violet-500 min-w-0"
      onkeydown="if(event.key==='Enter') ngSearch()" />
    <button onclick="ngSearch()" class="bg-violet-600 hover:bg-violet-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition flex-shrink-0">
      🔍 <span class="hidden sm:inline">Buscar</span>
    </button>
  </div>
  <p id="ng-status" class="text-xs text-zinc-500">Busque um deputado ou CNPJ para começar.</p>
  <div id="ng-search-results" class="hidden bg-zinc-800 border border-white/10 rounded-xl overflow-hidden max-h-48 overflow-y-auto text-sm"></div>
</div>

<!-- Placeholder: clique para abrir modal (funciona em qualquer tela) -->
<div id="ng-desktop-placeholder" class="flex glass-panel rounded-2xl items-center justify-center flex-col gap-4 py-16 cursor-pointer hover:bg-white/5 transition" onclick="ngOpenModal()">
  <div class="text-6xl opacity-40">🕸️</div>
  <p class="text-zinc-400 text-sm">Clique para abrir o mapa mental interativo</p>
  <button class="bg-violet-600 hover:bg-violet-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition">🗺️ Abrir Mapa Mental</button>
</div>

<!-- Legend compacta -->
<div class="glass-panel rounded-2xl p-2 sm:p-3 flex flex-wrap gap-2 sm:gap-3 text-xs text-zinc-400">
  <span class="font-bold text-zinc-300">Legenda:</span>
  <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full inline-block" style="background:#8b5cf6"></span> Deputado</span>
  <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full inline-block" style="background:#f97316"></span> Empresa</span>
  <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full inline-block" style="background:#22c55e"></span> Servidor</span>
  <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full inline-block" style="background:#ef4444"></span> Sanção</span>
  <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full inline-block" style="background:#eab308"></span> PEP</span>
  <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full inline-block" style="background:#6366f1"></span> Notícia</span>
  <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full inline-block" style="background:#10b981"></span> Proposta</span>
  <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full inline-block" style="background:#71717a"></span> Partido</span>
</div>
</div>
