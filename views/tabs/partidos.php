<!-- Conteúdo: Partidos -->
<div id="content-partidos" class="hidden animate-fade-in">
  <div class="glass-panel p-6 rounded-xl mb-6">
    <div class="flex flex-col md:flex-row gap-4 items-end">
      <div class="w-full md:w-1/3">
        <label
          class="block text-xs text-zinc-400 mb-1 font-bold uppercase">Selecione o Partido</label>
        <select
          id="partyAnalyticsSelect"
          class="w-full bg-zinc-900/50 border border-white/10 rounded-lg p-3 text-white focus:border-violet-500 outline-none">
          <option value="">Carregando partidos...</option>
        </select>
      </div>
      <button
        onclick="analyzeParty()"
        class="w-full md:w-auto bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2">
        📊 Analisar Gastos
      </button>
    </div>
    <p class="text-xs text-zinc-500 mt-2">
      * A análise processa uma amostragem de membros do partido para gerar
      estatísticas de fornecedores e maiores gastos.
    </p>
  </div>

  <div id="party-dashboard" class="hidden space-y-6">
    <!-- Resumo -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="glass-panel p-4 rounded-xl">
        <h4 class="text-zinc-500 text-xs uppercase font-bold">
          Total Analisado (Ano Atual)
        </h4>
        <div
          id="party-total-spent"
          class="text-2xl font-bold text-green-400 mt-1">
          R$ 0,00
        </div>
      </div>
      <div class="glass-panel p-4 rounded-xl">
        <h4 class="text-zinc-500 text-xs uppercase font-bold">
          Membros na Amostra
        </h4>
        <div
          id="party-member-count"
          class="text-2xl font-bold text-white mt-1">
          0
        </div>
      </div>
      <div class="glass-panel p-4 rounded-xl">
        <h4 class="text-zinc-500 text-xs uppercase font-bold">
          Maior Fornecedor
        </h4>
        <div
          id="party-top-supplier"
          class="text-lg font-bold text-violet-400 mt-1 truncate">
          -
        </div>
      </div>
    </div>

    <!-- Gráficos -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="glass-panel p-4 rounded-xl">
        <h3 class="text-white font-bold mb-4">
          🏆 Top 5 Políticos (Gastos)
        </h3>
        <div class="relative h-64 w-full">
          <canvas id="partyTopPoliticiansChart"></canvas>
        </div>
      </div>
      <div class="glass-panel p-4 rounded-xl">
        <h3 class="text-white font-bold mb-4">
          🏢 Top 5 Empresas Contratadas
        </h3>
        <div class="relative h-64 w-full">
          <canvas id="partyTopCompaniesChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Status de Carregamento -->
    <div
      id="party-loading-bar"
      class="hidden w-full bg-zinc-800 rounded-full h-2.5 mb-4">
      <div
        class="bg-violet-600 h-2.5 rounded-full transition-all duration-300"
        style="width: 0%"></div>
    </div>
    <div
      id="party-loading-text"
      class="text-center text-zinc-500 text-sm animate-pulse hidden">
      Processando dados...
    </div>
  </div>
</div>
