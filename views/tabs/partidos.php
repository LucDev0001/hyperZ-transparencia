<!-- Conteúdo: Partidos -->
<div id="content-partidos" class="hidden animate-fade-in pb-16">
  <!-- Cabeçalho SaaS -->
  <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
    <div>
      <div class="flex items-center gap-2 mb-2">
        <div class="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
          <?php echo function_exists('getSaaSIcon') ? getSaaSIcon('shield', 'w-4 h-4') : '🏛️'; ?>
        </div>
        <h2 class="text-2xl font-black text-white tracking-tight">Raio-X dos Partidos</h2>
        <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20 uppercase">
          Análise Partidária
        </span>
      </div>
      <p class="text-zinc-400 text-sm">Audite despesas de bancadas, amostragem de parlamentares e maiores fornecedores por sigla.</p>
    </div>
  </div>

  <div class="glass-card p-6 rounded-2xl mb-6 border border-white/10 border-t-4 border-t-violet-500 shadow-xl">
    <div class="flex flex-col md:flex-row gap-4 items-end">
      <div class="w-full md:w-2/3">
        <label class="block text-[11px] font-mono font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">Selecione o Partido</label>
        <select
          id="partyAnalyticsSelect"
          onchange="window.analyzeParty()"
          class="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium focus:border-violet-500 outline-none transition">
          <option value="">Carregando partidos...</option>
        </select>
      </div>
      <button
        id="btn-analyze-party"
        onclick="window.analyzeParty()"
        class="w-full md:w-auto bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-bold font-mono text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-violet-900/30">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
        Analisar Gastos
      </button>
    </div>
    <div class="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-white/5">
      <span class="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Bancadas Principais:</span>
      <button type="button" onclick="const s = document.getElementById('partyAnalyticsSelect'); if(s) { s.value='PL'; window.analyzeParty(); }" class="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-bold border border-white/10 transition">
        PL
      </button>
      <button type="button" onclick="const s = document.getElementById('partyAnalyticsSelect'); if(s) { s.value='PT'; window.analyzeParty(); }" class="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-bold border border-white/10 transition">
        PT
      </button>
      <button type="button" onclick="const s = document.getElementById('partyAnalyticsSelect'); if(s) { s.value='UNIÃO'; window.analyzeParty(); }" class="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-bold border border-white/10 transition">
        UNIÃO
      </button>
      <button type="button" onclick="const s = document.getElementById('partyAnalyticsSelect'); if(s) { s.value='PP'; window.analyzeParty(); }" class="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-bold border border-white/10 transition">
        PP
      </button>
      <button type="button" onclick="const s = document.getElementById('partyAnalyticsSelect'); if(s) { s.value='PSD'; window.analyzeParty(); }" class="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-bold border border-white/10 transition">
        PSD
      </button>
      <button type="button" onclick="const s = document.getElementById('partyAnalyticsSelect'); if(s) { s.value='MDB'; window.analyzeParty(); }" class="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-bold border border-white/10 transition">
        MDB
      </button>
      <button type="button" onclick="const s = document.getElementById('partyAnalyticsSelect'); if(s) { s.value='AVANTE'; window.analyzeParty(); }" class="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-bold border border-white/10 transition">
        AVANTE
      </button>
      <button type="button" onclick="const s = document.getElementById('partyAnalyticsSelect'); if(s) { s.value='NOVO'; window.analyzeParty(); }" class="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-bold border border-white/10 transition">
        NOVO
      </button>
    </div>
    <p class="text-[11px] text-zinc-500 mt-2 font-mono">
      * A análise processa os parlamentares em exercício do partido na Câmara dos Deputados para mapear fornecedores e concentração de despesas.
    </p>
  </div>

  <!-- Status / Mensagem de Erro / Aviso -->
  <div id="party-status-box" class="hidden mb-6 p-4 rounded-xl border text-sm font-medium"></div>

  <!-- Progresso de Carregamento SaaS -->
  <div id="party-loading-container" class="hidden mb-6 glass-card p-5 rounded-2xl border border-white/10 shadow-lg">
    <div class="flex items-center justify-between mb-2">
      <span id="party-loading-text" class="text-xs font-bold text-violet-300 font-mono">Processando dados...</span>
      <span id="party-loading-pct" class="text-xs font-mono font-bold text-zinc-400">0%</span>
    </div>
    <div class="w-full bg-zinc-800/80 rounded-full h-2 overflow-hidden">
      <div
        id="party-loading-bar-inner"
        class="bg-gradient-to-r from-violet-600 to-fuchsia-500 h-2 rounded-full transition-all duration-300"
        style="width: 0%"></div>
    </div>
  </div>

  <div id="party-dashboard" class="hidden space-y-6">
    <!-- Resumo -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card p-5 rounded-2xl border border-white/10">
        <h4 class="text-zinc-400 text-[11px] uppercase font-mono font-bold">
          Total Analisado
        </h4>
        <div
          id="party-total-spent"
          class="text-2xl font-black text-emerald-400 mt-1 font-mono">
          R$ 0,00
        </div>
      </div>
      <div class="glass-card p-5 rounded-2xl border border-white/10">
        <h4 class="text-zinc-400 text-[11px] uppercase font-mono font-bold">
          Membros na Amostra
        </h4>
        <div
          id="party-member-count"
          class="text-2xl font-black text-white mt-1 font-mono">
          0
        </div>
      </div>
      <div class="glass-card p-5 rounded-2xl border border-white/10">
        <h4 class="text-zinc-400 text-[11px] uppercase font-mono font-bold">
          Média por Parlamentar
        </h4>
        <div
          id="party-avg-spent"
          class="text-2xl font-black text-cyan-400 mt-1 font-mono">
          R$ 0,00
        </div>
      </div>
      <div class="glass-card p-5 rounded-2xl border border-white/10">
        <h4 class="text-zinc-400 text-[11px] uppercase font-mono font-bold">
          Maior Fornecedor
        </h4>
        <div
          id="party-top-supplier"
          class="text-base font-bold text-violet-300 mt-1 truncate"
          title="-">
          -
        </div>
      </div>
    </div>

    <!-- Gráficos -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="glass-card p-6 rounded-2xl border border-white/10 shadow-lg">
        <h3 class="text-white font-bold text-sm mb-4 flex items-center gap-2">
          <span>🏆</span> Top Políticos por Gastos na Amostra
        </h3>
        <div class="relative h-64 w-full">
          <canvas id="partyTopPoliticiansChart"></canvas>
        </div>
      </div>
      <div class="glass-card p-6 rounded-2xl border border-white/10 shadow-lg">
        <h3 class="text-white font-bold text-sm mb-4 flex items-center gap-2">
          <span>🏢</span> Top Empresas Contratadas
        </h3>
        <div class="relative h-64 w-full">
          <canvas id="partyTopCompaniesChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Lista de Parlamentares da Bancada -->
    <div class="glass-card p-6 rounded-2xl border border-white/10 shadow-lg">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-2 border-b border-white/5 pb-4">
        <div>
          <h3 class="text-white font-bold text-sm flex items-center gap-2">
            <span>👥</span> Parlamentares Auditados na Bancada
          </h3>
          <p class="text-xs text-zinc-400 mt-0.5">Detalhamento individual dos deputados analisados na amostra do partido.</p>
        </div>
        <span id="party-badge-count" class="text-[10px] font-mono px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20 font-bold uppercase">
          Amostra da Bancada
        </span>
      </div>
      <div id="party-deputies-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Injetado dinamicamente via JS -->
      </div>
    </div>

    <!-- Maiores Fornecedores Detalhados -->
    <div class="glass-card p-6 rounded-2xl border border-white/10 shadow-lg">
      <div class="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
        <h3 class="text-white font-bold text-sm flex items-center gap-2">
          <span>💼</span> Fornecedores e Empresas Mais Contratadas
        </h3>
        <span class="text-[10px] font-mono text-zinc-500 uppercase">Concentração de Verba</span>
      </div>
      <div id="party-suppliers-list" class="space-y-3">
        <!-- Injetado via JS -->
      </div>
    </div>
  </div>
</div>
