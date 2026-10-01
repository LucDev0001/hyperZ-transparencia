<!-- Conteúdo: Executivo & Municipal -->
<div id="content-outros" class="hidden animate-fade-in">
  <div class="space-y-6">
    <!-- Header do Dashboard -->
    <div class="glass-panel p-6 rounded-2xl">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div class="flex items-center gap-3">
          <div class="text-3xl">💰</div>
          <div>
            <h3 class="text-xl font-bold text-white">Transferências Federais</h3>
            <p class="text-zinc-400 text-sm">Monitoramento de recursos repassados pela União.</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button onclick="exportTransferCSV()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition">
            📥 Exportar CSV
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
        <div class="md:col-span-2">
          <label class="block text-xs text-zinc-400 mb-1 font-bold uppercase">Estado (UF)</label>
          <select id="sel-transf-uf" onchange="loadMunicipalities(this.value)" class="w-full bg-zinc-900/50 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-violet-500">
            <option value="">UF</option>
            <option value="SP">SP</option>
            <option value="RJ">RJ</option>
            <option value="MG">MG</option>
            <option value="BA">BA</option>
            <option value="RS">RS</option>
            <option value="PR">PR</option>
            <option value="PE">PE</option>
            <option value="CE">CE</option>
            <option value="PA">PA</option>
            <option value="SC">SC</option>
            <option value="MA">MA</option>
            <option value="GO">GO</option>
            <option value="AM">AM</option>
            <option value="ES">ES</option>
            <option value="PB">PB</option>
            <option value="RN">RN</option>
            <option value="MT">MT</option>
            <option value="AL">AL</option>
            <option value="PI">PI</option>
            <option value="DF">DF</option>
            <option value="MS">MS</option>
            <option value="SE">SE</option>
            <option value="RO">RO</option>
            <option value="TO">TO</option>
            <option value="AC">AC</option>
            <option value="AP">AP</option>
            <option value="RR">RR</option>
          </select>
        </div>
        <div class="md:col-span-4">
          <label class="block text-xs text-zinc-400 mb-1 font-bold uppercase">Município</label>
          <select id="sel-transf-city" class="w-full bg-zinc-900/50 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-violet-500 disabled:opacity-50" disabled>
            <option value="">Selecione o Estado...</option>
          </select>
        </div>
        <div class="md:col-span-2">
          <label class="block text-xs text-zinc-400 mb-1 font-bold uppercase">Ano</label>
          <select id="sel-transf-year" class="w-full bg-zinc-900/50 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-violet-500">
            <!-- JS populates -->
          </select>
        </div>
        <div class="md:col-span-2">
          <label class="block text-xs text-zinc-400 mb-1 font-bold uppercase">Tipo</label>
          <select id="sel-transf-type" class="w-full bg-zinc-900/50 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-violet-500">
            <option value="">Todos</option>
            <option value="1">Legais/Constitucionais</option>
            <option value="2">Voluntárias (Convênios)</option>
          </select>
        </div>
        <div class="md:col-span-2 flex items-end">
          <button onclick="loadFederalTransfers(1)" class="w-full bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-lg font-bold transition flex items-center justify-center gap-2">
            🔍 Consultar
          </button>
        </div>
      </div>
    </div>

    <!-- Cards de Resumo -->
    <div id="transf-summary" class="grid grid-cols-1 md:grid-cols-3 gap-4 hidden animate-fade-in">
      <div class="glass-panel p-4 rounded-xl">
        <h4 class="text-zinc-500 text-xs uppercase font-bold">Total Recebido (Período)</h4>
        <div id="summary-total" class="text-2xl font-bold text-green-400 mt-1">R$ 0,00</div>
      </div>
      <div class="glass-panel p-4 rounded-xl">
        <h4 class="text-zinc-500 text-xs uppercase font-bold">Transferências Legais</h4>
        <div id="summary-legal" class="text-xl font-bold text-white mt-1">R$ 0,00</div>
      </div>
      <div class="glass-panel p-4 rounded-xl">
        <h4 class="text-zinc-500 text-xs uppercase font-bold">Convênios/Voluntárias</h4>
        <div id="summary-voluntaria" class="text-xl font-bold text-white mt-1">R$ 0,00</div>
      </div>
    </div>

    <!-- Gráficos e Rankings -->
    <div id="transf-charts-area" class="grid grid-cols-1 lg:grid-cols-2 gap-6 hidden animate-fade-in">
      <div class="glass-panel p-4 rounded-xl">
        <h3 class="text-white font-bold mb-4">📅 Evolução Mensal</h3>
        <div class="relative h-64 w-full">
          <canvas id="transfEvolutionChart"></canvas>
        </div>
      </div>
      <div class="glass-panel p-4 rounded-xl">
        <h3 class="text-white font-bold mb-4">🏆 Top Municípios (Ranking)</h3>
        <div class="relative h-64 w-full">
          <canvas id="transfRankingChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Lista Detalhada -->
    <div id="transf-list-container" class="glass-panel rounded-2xl overflow-hidden hidden animate-fade-in">
      <div class="p-4 border-b border-white/10 flex justify-between items-center">
        <h3 class="font-bold text-white">Detalhamento das Transferências</h3>
        <span id="transf-page-info" class="text-xs text-zinc-500">Página 1</span>
      </div>
      <div id="transfers-results" class="divide-y divide-white/10">
        <!-- Lista injetada via JS -->
      </div>
      <div class="p-4 bg-zinc-800/50 flex justify-center gap-2">
        <button onclick="changeTransfPage(-1)" class="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-xs text-white">Anterior</button>
        <button onclick="changeTransfPage(1)" class="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-xs text-white">Próxima</button>
      </div>
    </div>
  </div>

  <!-- Consulta Emendas -->
  <div class="glass-panel p-6 rounded-2xl">
    <div class="flex items-center gap-3 mb-6">
      <div class="text-3xl">📜</div>
      <div>
        <h3 class="text-xl font-bold text-white">
          Emendas Parlamentares
        </h3>
        <p class="text-zinc-400 text-sm">
          Detalhes de execução de emendas individuais, de bancada e
          comissão.
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
      <div class="md:col-span-2">
        <label class="block text-xs text-zinc-400 mb-1 font-bold uppercase">Tipo</label>
        <select id="sel-emenda-type" class="w-full bg-zinc-900/50 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-violet-500">
            <option value="">Todos</option>
            <option value="Individual">Individual</option>
            <option value="Bancada">Bancada</option>
            <option value="Comissao">Comissão</option>
            <option value="Relator">Relator</option>
        </select>
      </div>
      <div class="md:col-span-3">
        <label class="block text-xs text-zinc-400 mb-1 font-bold uppercase">Área de Atuação (Função)</label>
        <select id="sel-emenda-funcao" class="w-full bg-zinc-900/50 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-violet-500">
            <option value="">Todas as Áreas</option>
            <option value="10">10 — Saúde</option>
            <option value="12">12 — Educação</option>
            <option value="08">08 — Assistência Social</option>
            <option value="09">09 — Previdência Social</option>
            <option value="15">15 — Urbanismo</option>
            <option value="20">20 — Agricultura</option>
            <option value="26">26 — Transporte</option>
            <option value="06">06 — Segurança Pública</option>
            <option value="04">04 — Administração</option>
            <option value="22">22 — Indústria</option>
            <option value="28">28 — Encargos Especiais</option>
        </select>
      </div>
      <div class="md:col-span-2">
        <label
          class="block text-xs text-zinc-400 mb-1 font-bold uppercase">Ano</label>
        <select
          id="sel-emenda-year"
          class="w-full bg-zinc-900/50 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-violet-500">
          <!-- JS populates -->
        </select>
      </div>
      <div class="md:col-span-5">
        <label
          class="block text-xs text-zinc-400 mb-1 font-bold uppercase">Autor (Opcional)</label>
        <input
          type="text"
          id="inp-emenda-author"
          placeholder="Ex: Nome do Deputado ou Senador"
          class="w-full bg-zinc-900/50 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-violet-500" />
      </div>
      <div class="md:col-span-3 flex items-end">
        <button
          onclick="searchGeneralAmendments()"
          class="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-bold transition flex items-center justify-center gap-2">
          🔍 Buscar Emendas
        </button>
      </div>
    </div>

    <div
      id="amendments-results"
      class="hidden space-y-2 max-h-[500px] overflow-y-auto pr-2">
      <!-- Results injected here -->
    </div>
  </div>
</div>
