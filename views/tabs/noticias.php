<!-- Conteúdo: Notícias (Feed de Inteligência Política em Tempo Real) -->
<div id="content-noticias" class="hidden animate-fade-in pb-16">
  
  <!-- SaaS Header -->
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
    <div>
      <div class="flex items-center gap-2 mb-2">
        <div class="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <?php echo function_exists('getSaaSIcon') ? getSaaSIcon('newspaper', 'w-4 h-4') : '📰'; ?>
        </div>
        <h2 class="text-2xl font-black text-white tracking-tight">Radar de Notícias Políticas</h2>
        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          FEED AO VIVO
        </span>
      </div>
      <p class="text-zinc-400 text-sm">Monitoramento contínuo de fontes oficiais: Agência Câmara, Senado Notícias, G1 Política e TSE.</p>
    </div>

    <!-- Quick Actions Toolbar -->
    <div class="flex items-center gap-2 self-start md:self-auto">
      <button onclick="if(typeof window.loadPoliticalNews === 'function') window.loadPoliticalNews();"
              class="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white text-xs font-bold transition flex items-center gap-2 shadow-sm">
        <svg class="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
        Atualizar Feed
      </button>
    </div>
  </div>

  <!-- News Grid -->
  <div id="newsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    <div class="col-span-full text-center py-12 text-zinc-500">
      <span class="animate-pulse">Sintonizando canais de notícias de Brasília...</span>
    </div>
  </div>
</div>
