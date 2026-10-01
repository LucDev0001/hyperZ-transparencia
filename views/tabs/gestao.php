<!-- Conteúdo: Gestão -->
<div id="content-gestao" class="hidden animate-fade-in">
<div
  class="glass-panel p-8 rounded-2xl text-center">
  <div class="text-6xl mb-4">📊</div>
  <h2 class="text-2xl font-bold text-white mb-2">
    Gestão Administrativa e Financeira
  </h2>
  <p class="text-zinc-400 max-w-2xl mx-auto">
    Acesse os dados detalhados do SIAFI (Sistema Integrado de
    Administração Financeira) e SICONFI.
  </p>
  <div class="flex justify-center gap-4 mt-6">
    <a
      href="https://www.tesourotransparente.gov.br/"
      target="_blank"
      class="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded-lg font-bold transition">Tesouro Transparente</a>
    <a
      href="https://portaldatransparencia.gov.br/"
      target="_blank"
      class="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg font-bold transition">Portal da Transparência</a>
  </div>

  <div class="mt-8 text-left">
    <div class="flex flex-col md:flex-row justify-between items-center mb-4 border-b border-white/10 pb-2 gap-4">
        <h3 class="text-xl font-bold text-white">Execução da Despesa</h3>
        <div class="flex bg-white/5 rounded-lg p-1">
            <button onclick="toggleGestaoMode('orcamento')" id="btn-gestao-orcamento" class="px-4 py-1.5 text-sm font-bold rounded-md bg-violet-600 text-white shadow transition">Orçamento</button>
            <button onclick="toggleGestaoMode('cartoes')" id="btn-gestao-cartoes" class="px-4 py-1.5 text-sm font-bold rounded-md text-zinc-400 hover:text-white transition">Cartões Corporativos</button>
            <button onclick="toggleGestaoMode('contratos')" id="btn-gestao-contratos" class="px-4 py-1.5 text-sm font-bold rounded-md text-zinc-400 hover:text-white transition">Contratos Federais</button>
        </div>
    </div>

    <!-- View: Orçamento (Default) -->
    <div id="view-gestao-orcamento" class="animate-fade-in">
    <div class="bg-white/5 p-4 rounded-xl mb-4">
      <div class="flex gap-2 items-center">
        <div class="w-1/3 md:w-1/4">
                      <select
                      onchange="setFilterMode(this.value)"
                      class="w-full bg-zinc-900/50 border border-white/10 rounded-lg p-2 text-white outline-none font-bold cursor-pointer hover:border-violet-500 transition">
                      <option value="mes">📅 Por Mês</option>
                      <option value="semana">📅 Por Semana</option>
                      <option value="dia">📅 Por Dia</option>
                    </select>        </div>
        <div id="filter-input-container" class="flex-1">
          <!-- Injetado via JS -->
        </div>
        <button
          onclick="loadFederalExpenses(true)"
          class="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-bold">
          Filtrar
        </button>
      </div>
    </div>

    <!-- Gráfico de Gestão (Novo) -->
    <div class="glass-panel p-4 rounded-xl mb-4 hidden" id="gestaoChartContainer">
        <h4 class="text-zinc-400 text-xs font-bold uppercase mb-4" id="gestaoChartTitle">Visualização de Dados</h4>
        <div class="relative h-64 w-full">
            <canvas id="gestaoChart"></canvas>
        </div>
    </div>

    <div id="federal-expenses-status" class="text-center text-zinc-500 py-4"></div>

    <div
      id="federal-expenses-list"
      class="space-y-2 max-h-[600px] overflow-y-auto pr-2">
      <div class="text-center text-zinc-500 py-4">
        Carregando dados...
      </div>
    </div>
    </div>

    <!-- View: Cartões Corporativos (New) -->
    <div id="view-gestao-cartoes" class="hidden animate-fade-in">
        <div class="bg-white/5 p-4 rounded-xl mb-4 border border-white/10">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                    <label class="block text-xs text-zinc-400 mb-1 font-bold uppercase">Mês Início</label>
                    <input type="month" id="card-month-start" class="w-full bg-zinc-900/50 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-violet-500">
                </div>
                <div>
                    <label class="block text-xs text-zinc-400 mb-1 font-bold uppercase">Mês Fim</label>
                    <input type="month" id="card-month-end" class="w-full bg-zinc-900/50 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-violet-500">
                </div>
                <button onclick="loadPaymentCards(1)" class="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-lg font-bold transition flex items-center justify-center gap-2">
                    🔍 Consultar Gastos
                </button>
            </div>
            <p class="text-[10px] text-zinc-500 mt-2">* Consulta limitada a um período máximo de 12 meses.</p>
        </div>

        <div id="cards-results-list" class="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            <div class="text-center text-zinc-500 py-10">Selecione o período e clique em consultar.</div>
        </div>
        
        <div class="flex justify-center gap-2 mt-4 hidden" id="cards-pagination">
            <button onclick="changeCardPage(-1)" class="px-3 py-1 bg-zinc-800 rounded text-white hover:bg-zinc-700 text-xs font-bold">Anterior</button>
            <span id="card-page-num" class="px-3 py-1 text-zinc-500 text-xs font-mono">Página 1</span>
            <button onclick="changeCardPage(1)" class="px-3 py-1 bg-zinc-800 rounded text-white hover:bg-zinc-700 text-xs font-bold">Próxima</button>
        </div>
    </div>

    <!-- View: Contratos Federais -->
    <div id="view-gestao-contratos" class="hidden animate-fade-in">
        <div class="bg-white/5 p-4 rounded-xl mb-4 border border-white/10">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                <div>
                    <label class="block text-xs text-zinc-400 mb-1 font-bold uppercase">Termo / Objeto</label>
                    <input type="text" id="contratos-search" placeholder="Ex: construção, TI, serviços..." class="w-full bg-zinc-900/50 border border-white/10 rounded-lg p-2.5 text-white text-sm outline-none focus:border-violet-500 placeholder-zinc-600">
                </div>
                <div>
                    <label class="block text-xs text-zinc-400 mb-1 font-bold uppercase">CNPJ do Fornecedor</label>
                    <input type="text" id="contratos-cnpj" placeholder="00.000.000/0001-00" maxlength="18" class="w-full bg-zinc-900/50 border border-white/10 rounded-lg p-2.5 text-white text-sm outline-none focus:border-violet-500 placeholder-zinc-600">
                </div>
                <div>
                    <label class="block text-xs text-zinc-400 mb-1 font-bold uppercase">Data Inicial</label>
                    <input type="date" id="contratos-data-ini" class="w-full bg-zinc-900/50 border border-white/10 rounded-lg p-2.5 text-white text-sm outline-none focus:border-violet-500">
                </div>
                <div>
                    <label class="block text-xs text-zinc-400 mb-1 font-bold uppercase">Data Final</label>
                    <input type="date" id="contratos-data-fim" class="w-full bg-zinc-900/50 border border-white/10 rounded-lg p-2.5 text-white text-sm outline-none focus:border-violet-500">
                </div>
            </div>
            <button onclick="searchContratos()" class="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2.5 rounded-lg font-bold transition flex items-center gap-2">
                🔍 Buscar Contratos
            </button>
            <p class="text-[10px] text-zinc-500 mt-2">Consulta o Portal da Transparência (COMPRASNET). Ao menos um filtro é recomendado.</p>
        </div>

        <div id="contratos-stats" class="hidden bg-zinc-800/60 border border-zinc-700 p-3 rounded-xl mb-3"></div>

        <div id="contratos-results" class="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            <div class="text-center text-zinc-500 py-10">Preencha os filtros e clique em Buscar Contratos.</div>
        </div>
    </div>

  </div>
</div>
</div>
