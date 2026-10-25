<!-- Conteúdo: Gestão e Finanças -->
<div id="content-gestao" class="hidden animate-fade-in">
  <div class="glass-panel p-6 md:p-8 rounded-2xl text-center">
    <div class="text-5xl mb-3">📊</div>
    <h2 class="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight">
      Gestão Administrativa e Finanças Públicas
    </h2>
    <p class="text-zinc-400 max-w-2xl mx-auto text-xs md:text-sm">
      Auditoria oficial de execução orçamentária do SIAFI, gastos com cartões corporativos (CPGF) e contratos federais do COMPRASNET.
    </p>

    <div class="flex justify-center gap-3 mt-5 flex-wrap">
      <a href="https://www.tesourotransparente.gov.br/" target="_blank"
         class="bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition border border-white/5 flex items-center gap-2">
        🏛️ Tesouro Transparente
      </a>
      <a href="https://portaldatransparencia.gov.br/" target="_blank"
         class="bg-violet-600/30 hover:bg-violet-600 text-violet-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition border border-violet-500/30 flex items-center gap-2">
        🔍 Portal da Transparência
      </a>
    </div>

    <div class="mt-8 text-left">
      <!-- Navegação de Abas Internas -->
      <div class="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-white/10 pb-3 gap-4">
        <div>
          <h3 id="gestao-section-title" class="text-lg font-black text-white uppercase tracking-wider">
            Execução Orçamentária por Ministério
          </h3>
          <p class="text-xs text-zinc-500">Dados consolidados do SIAFI por órgão superior e unidades vinculadas</p>
        </div>
        <div class="flex bg-zinc-900/90 border border-white/10 rounded-xl p-1 gap-1">
          <button onclick="toggleGestaoMode('orcamento')" id="btn-gestao-orcamento"
                  class="px-4 py-2 text-xs font-black rounded-lg bg-violet-600 text-white shadow-lg transition">
            🏛️ Orçamento
          </button>
          <button onclick="toggleGestaoMode('cartoes')" id="btn-gestao-cartoes"
                  class="px-4 py-2 text-xs font-black rounded-lg text-zinc-400 hover:text-white transition">
            💳 Cartões Corporativos
          </button>
          <button onclick="toggleGestaoMode('contratos')" id="btn-gestao-contratos"
                  class="px-4 py-2 text-xs font-black rounded-lg text-zinc-400 hover:text-white transition">
            📝 Contratos Federais
          </button>
        </div>
      </div>

      <!-- VIEW 1: Orçamento (Execução da Despesa por Órgão) -->
      <div id="view-gestao-orcamento" class="animate-fade-in space-y-4">
        <div class="bg-zinc-900/60 p-4 md:p-5 rounded-2xl border border-white/10">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <!-- Órgão Superior / Ministério -->
            <div class="md:col-span-6">
              <label class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 px-1">
                Ministério / Órgão Superior
              </label>
              <select id="gestao-orgao" class="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white text-xs font-bold outline-none focus:border-violet-500 transition cursor-pointer">
                <option value="36000" selected>Ministério da Saúde (MS)</option>
                <option value="26000">Ministério da Educação (MEC)</option>
                <option value="25000">Ministério da Fazenda</option>
                <option value="52000">Ministério da Defesa</option>
                <option value="30000">Ministério da Justiça e Segurança Pública</option>
                <option value="39000">Ministério dos Transportes</option>
                <option value="55000">Ministério do Desenvolvimento e Assistência Social (MDS)</option>
                <option value="22000">Ministério da Agricultura e Pecuária</option>
                <option value="44000">Ministério do Meio Ambiente e Mudança do Clima</option>
                <option value="24000">Ministério da Ciência, Tecnologia e Inovação</option>
                <option value="56000">Ministério das Cidades</option>
                <option value="20000">Presidência da República</option>
              </select>
            </div>

            <!-- Ano -->
            <div class="md:col-span-3">
              <label class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 px-1">
                Ano de Exercício
              </label>
              <select id="gestao-ano" class="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white text-xs font-bold outline-none focus:border-violet-500 transition cursor-pointer">
                <option value="2024" selected>2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
              </select>
            </div>

            <!-- Botão Filtrar -->
            <div class="md:col-span-3">
              <button onclick="loadFederalExpenses(true)"
                      class="w-full bg-violet-600 hover:bg-violet-700 text-white p-3 rounded-xl font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2">
                🔍 Consultar Orçamento
              </button>
            </div>
          </div>
        </div>

        <!-- KPIs de Resumo do Orçamento -->
        <div id="gestao-orcamento-kpis" class="hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-in">
          <div class="bg-zinc-900/60 p-4 rounded-xl border border-white/10">
            <span class="text-[10px] text-zinc-500 uppercase font-black tracking-wider block mb-1">Total Empenhado</span>
            <div id="kpi-empenhado" class="text-lg md:text-xl font-black text-white font-mono">R$ 0,00</div>
          </div>
          <div class="bg-zinc-900/60 p-4 rounded-xl border border-white/10">
            <span class="text-[10px] text-zinc-500 uppercase font-black tracking-wider block mb-1">Total Liquidado</span>
            <div id="kpi-liquidado" class="text-lg md:text-xl font-black text-blue-400 font-mono">R$ 0,00</div>
          </div>
          <div class="bg-zinc-900/60 p-4 rounded-xl border border-white/10">
            <span class="text-[10px] text-zinc-500 uppercase font-black tracking-wider block mb-1">Total Pago</span>
            <div id="kpi-pago" class="text-lg md:text-xl font-black text-green-400 font-mono">R$ 0,00</div>
          </div>
          <div class="bg-zinc-900/60 p-4 rounded-xl border border-white/10">
            <span class="text-[10px] text-zinc-500 uppercase font-black tracking-wider block mb-1">Taxa de Execução</span>
            <div id="kpi-taxa" class="text-lg md:text-xl font-black text-violet-400 font-mono">0%</div>
          </div>
        </div>

        <!-- Gráfico de Gestão -->
        <div class="glass-panel p-5 rounded-2xl border border-white/10 hidden" id="gestaoChartContainer">
          <h4 class="text-zinc-400 text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2" id="gestaoChartTitle">
            🏆 Maiores Orçamentos Executados por Unidade
          </h4>
          <div class="relative h-72 w-full">
            <canvas id="gestaoChart"></canvas>
          </div>
        </div>

        <div id="federal-expenses-status" class="text-center text-zinc-500 py-2"></div>

        <!-- Listagem de Unidades Orçamentárias -->
        <div id="federal-expenses-list" class="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          <div class="text-center text-zinc-500 py-10">Carregando dados do orçamento federal...</div>
        </div>
      </div>

      <!-- VIEW 2: Cartões Corporativos (CPGF) -->
      <div id="view-gestao-cartoes" class="hidden animate-fade-in space-y-4">
        <div class="bg-zinc-900/60 p-4 md:p-5 rounded-2xl border border-white/10">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 px-1">Mês Início</label>
              <input type="month" id="card-month-start" value="2024-07"
                     class="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white text-xs font-bold outline-none focus:border-violet-500">
            </div>
            <div>
              <label class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 px-1">Mês Fim</label>
              <input type="month" id="card-month-end" value="2024-10"
                     class="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white text-xs font-bold outline-none focus:border-violet-500">
            </div>
            <div>
              <label class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 px-1">Órgão (Opcional)</label>
              <select id="card-orgao" class="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white text-xs font-bold outline-none focus:border-violet-500 cursor-pointer">
                <option value="">Todos os Órgãos Federais</option>
                <option value="20000">Presidência da República</option>
                <option value="36000">Ministério da Saúde</option>
                <option value="26000">Ministério da Educação</option>
                <option value="52000">Ministério da Defesa</option>
                <option value="30000">Ministério da Justiça</option>
                <option value="25000">Ministério da Fazenda</option>
              </select>
            </div>
            <div>
              <button onclick="loadPaymentCards(1)"
                      class="w-full bg-violet-600 hover:bg-violet-700 text-white p-3 rounded-xl font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2">
                🔍 Consultar Gastos
              </button>
            </div>
          </div>
          <p class="text-[10px] text-zinc-500 mt-2 px-1">* Consulta aos extratos de Cartão de Pagamento do Governo Federal (CPGF) no Portal da Transparência.</p>
        </div>

        <div id="cards-stats-bar" class="hidden bg-zinc-900/60 p-4 rounded-xl border border-white/10 flex justify-between items-center flex-wrap gap-3"></div>

        <div id="cards-results-list" class="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          <div class="text-center text-zinc-500 py-10">Clique em Consultar Gastos para visualizar transações com cartões corporativos.</div>
        </div>

        <div class="flex justify-center items-center gap-3 mt-4 hidden" id="cards-pagination">
          <button onclick="changeCardPage(-1)" class="px-4 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white hover:bg-zinc-800 text-xs font-bold transition">← Anterior</button>
          <span id="card-page-num" class="px-4 py-2 text-zinc-400 text-xs font-mono font-bold bg-zinc-950 rounded-xl border border-white/5">Página 1</span>
          <button onclick="changeCardPage(1)" class="px-4 py-2 bg-zinc-900 border border-white/10 rounded-xl text-white hover:bg-zinc-800 text-xs font-bold transition">Próxima →</button>
        </div>
      </div>

      <!-- VIEW 3: Contratos Federais -->
      <div id="view-gestao-contratos" class="hidden animate-fade-in space-y-4">
        <div class="bg-zinc-900/60 p-4 md:p-5 rounded-2xl border border-white/10">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <div>
              <label class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 px-1">Órgão Contratante (SIAFI)</label>
              <select id="contratos-orgao" class="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white text-xs font-bold outline-none focus:border-violet-500 cursor-pointer">
                <option value="36000" selected>Ministério da Saúde</option>
                <option value="26000">Ministério da Educação</option>
                <option value="52000">Ministério da Defesa</option>
                <option value="25000">Ministério da Fazenda</option>
                <option value="30000">Ministério da Justiça</option>
                <option value="39000">Ministério dos Transportes</option>
                <option value="20000">Presidência da República</option>
                <option value="24000">Ministério da Ciência e Tecnologia</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 px-1">Termo / Objeto (Opcional)</label>
              <input type="text" id="contratos-search" placeholder="Ex: vacinas, TI, vigilância..."
                     class="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:border-violet-500 placeholder-zinc-700">
            </div>
            <div>
              <label class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 px-1">CNPJ do Fornecedor (Opcional)</label>
              <input type="text" id="contratos-cnpj" placeholder="00.000.000/0001-00" maxlength="18"
                     class="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:border-violet-500 placeholder-zinc-700 font-mono">
            </div>
            <div>
              <label class="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 px-1">Ação</label>
              <button onclick="searchContratos()"
                      class="w-full bg-violet-600 hover:bg-violet-700 text-white p-3 rounded-xl font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2">
                🔍 Buscar Contratos
              </button>
            </div>
          </div>
          <p class="text-[10px] text-zinc-500 px-1">* Consulta contratos oficiais registrados no COMPRASNET e Portal da Transparência.</p>
        </div>

        <div id="contratos-stats" class="hidden bg-zinc-900/60 border border-white/10 p-4 rounded-xl"></div>

        <div id="contratos-results" class="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          <div class="text-center text-zinc-500 py-10">Selecione o órgão e clique em Buscar Contratos.</div>
        </div>
      </div>
    </div>
  </div>
</div>
