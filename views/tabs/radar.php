<!-- ══ Radar Anti-Corrupção ══════════════════════════════════════════════ -->
<div id="content-radar" class="hidden animate-fade-in">

<!-- Header -->
<div class="glass-panel rounded-2xl p-6 mb-6 border border-red-900/30 bg-red-950/10">
  <div class="flex items-start gap-4">
    <span class="text-4xl">🔍</span>
    <div>
      <h2 class="text-2xl font-black text-white">Radar Anti-Corrupção</h2>
      <p class="text-zinc-400 text-sm mt-1 max-w-2xl">
        Varredura em <strong class="text-white">5 bases de dados oficiais</strong> do Governo Federal simultaneamente: CNEP, CEIS, CEAF, CEPIM e PEP.
        Consultas são feitas em tempo real via <em>Portal da Transparência</em> (Lei nº 12.527/2011 — LAI).
      </p>
      <div class="flex flex-wrap gap-2 mt-3">
        <span class="text-[10px] px-2 py-1 rounded bg-red-950 text-red-300 border border-red-800 font-bold">CNEP — Empresas Punidas</span>
        <span class="text-[10px] px-2 py-1 rounded bg-orange-950 text-orange-300 border border-orange-800 font-bold">CEIS — Empresas Inidôneas</span>
        <span class="text-[10px] px-2 py-1 rounded bg-red-950 text-red-300 border border-red-800 font-bold">CEAF — Expulsões Federais</span>
        <span class="text-[10px] px-2 py-1 rounded bg-orange-950 text-orange-300 border border-orange-800 font-bold">CEPIM — ONGs Impedidas</span>
        <span class="text-[10px] px-2 py-1 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold">PEP — Pessoas Expostas Politicamente</span>
      </div>
    </div>
  </div>
</div>

<!-- Histórico de consultas da sessão -->
<div id="radarHistoryPanel" class="hidden mb-4 bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
  <div class="flex items-center gap-2 mb-2">
    <span class="text-xs font-bold text-zinc-400 uppercase">🕓 Histórico da Sessão</span>
    <button onclick="sessionStorage.removeItem('radar_history'); _renderHistory();" class="ml-auto text-[10px] text-zinc-600 hover:text-red-400 transition">Limpar</button>
  </div>
  <div id="radarHistoryList" class="text-xs text-zinc-600">Nenhuma consulta ainda.</div>
</div>

<!-- Tabs internas -->
<div class="flex gap-2 mb-6 border-b border-zinc-800 pb-2 overflow-x-auto">
  <button onclick="showRadarSubTab('sancoes')" id="rtab-sancoes" class="px-4 py-2 text-sm font-bold rounded-t-lg bg-red-600 text-white whitespace-nowrap">🚨 Varredura de Sanções</button>
  <button onclick="showRadarSubTab('pessoafisica')" id="rtab-pessoafisica" class="px-4 py-2 text-sm font-bold rounded-t-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition whitespace-nowrap">👤 Raio-X Pessoa Física</button>
  <button onclick="showRadarSubTab('pessoajuridica')" id="rtab-pessoajuridica" class="px-4 py-2 text-sm font-bold rounded-t-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition whitespace-nowrap">🏢 Raio-X Empresa</button>
  <button onclick="showRadarSubTab('nepotismo')" id="rtab-nepotismo" class="px-4 py-2 text-sm font-bold rounded-t-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition whitespace-nowrap">👥 Detector de Nepotismo</button>
  <button onclick="showRadarSubTab('despesas')" id="rtab-despesas" class="px-4 py-2 text-sm font-bold rounded-t-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition whitespace-nowrap">💸 Análise de Despesas</button>
  <button onclick="showRadarSubTab('cruzamento')" id="rtab-cruzamento" class="px-4 py-2 text-sm font-bold rounded-t-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition whitespace-nowrap">🔗 Cruzamento PF×PJ</button>
</div>

<!-- Sub-tab: Sanções -->
<div id="rsub-sancoes">
  <div class="glass-panel rounded-2xl p-6 mb-6">
    <h3 class="font-bold text-white mb-4">🔎 Buscar nas bases de sanções</h3>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
      <div>
        <label class="text-xs text-zinc-400 font-bold uppercase block mb-1">Nome / Razão Social <span class="text-red-400">*</span></label>
        <input id="radarNome" type="text" placeholder="Ex: João da Silva" class="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-white placeholder-zinc-600 focus:border-red-500 outline-none text-sm" />
      </div>
      <div>
        <label class="text-xs text-zinc-400 font-bold uppercase block mb-1">CPF (opcional)</label>
        <input id="radarCpf" type="text" placeholder="000.000.000-00" class="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-white placeholder-zinc-600 focus:border-red-500 outline-none text-sm" />
      </div>
      <div>
        <label class="text-xs text-zinc-400 font-bold uppercase block mb-1">CNPJ (opcional)</label>
        <input id="radarCnpj" type="text" placeholder="00.000.000/0001-00" class="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-white placeholder-zinc-600 focus:border-red-500 outline-none text-sm" />
      </div>
    </div>
    <button onclick="runRadarScan()" class="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl transition flex items-center gap-2 shadow-lg shadow-red-900/30">
      <span class="text-xl">🔍</span> Varrer Bases Governamentais
    </button>
  </div>
  <div id="radarResults" class="text-zinc-500 text-sm text-center py-12">
    Digite um nome e clique em <strong>Varrer Bases</strong> para iniciar a consulta.
  </div>
</div>

<!-- Sub-tab: Raio-X Pessoa Física -->
<div id="rsub-pessoafisica" class="hidden">
  <div class="glass-panel rounded-2xl p-6 mb-6">
    <h3 class="font-bold text-white mb-2">👤 Raio-X de Pessoa Física</h3>
    <p class="text-zinc-400 text-xs mb-4">Consulta o perfil completo de uma pessoa física no Portal da Transparência: sanções, benefícios sociais, vínculo com servidores, contratos e muito mais. Requer CPF (apenas números).</p>
    <div class="flex gap-3">
      <input id="pfCpf" type="text" placeholder="CPF (somente números, ex: 12345678901)"
        class="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-white placeholder-zinc-600 focus:border-blue-500 outline-none text-sm" />
      <button onclick="runPessoaFisicaScan()"
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl transition whitespace-nowrap">
        🔬 Consultar
      </button>
    </div>
    <p class="text-zinc-600 text-[10px] mt-2">⚠️ O CPF é usado apenas para consulta de dados públicos. Nenhum dado é armazenado.</p>
  </div>
  <div id="pfResult" class="text-zinc-500 text-sm text-center py-12">
    Informe um CPF para consultar o perfil completo na base de dados do Governo Federal.
  </div>
</div>

<!-- Sub-tab: Raio-X Empresa -->
<div id="rsub-pessoajuridica" class="hidden">
  <div class="glass-panel rounded-2xl p-6 mb-6">
    <h3 class="font-bold text-white mb-2">🏢 Raio-X de Empresa (CNPJ)</h3>
    <p class="text-zinc-400 text-xs mb-4">Consulta o perfil completo de uma empresa: sanções (CEIS, CNEP, CEAF, CEPIM), contratos, convênios, pagamentos e benefícios fiscais. Funciona igual ao <strong class="text-white">Analisador de Fornecedor</strong>, mas integrado ao Radar.</p>
    <div class="flex gap-3">
      <input id="pjCnpj" type="text" placeholder="CNPJ (somente números, ex: 12345678000199)"
        class="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-white placeholder-zinc-600 focus:border-violet-500 outline-none text-sm" />
      <button onclick="runPessoaJuridicaScan()"
        class="bg-violet-600 hover:bg-violet-700 text-white font-bold px-6 py-2.5 rounded-xl transition whitespace-nowrap">
        🔬 Consultar
      </button>
    </div>
  </div>
  <div id="pjResult" class="text-zinc-500 text-sm text-center py-12">
    Informe um CNPJ para consultar o perfil completo da empresa.
  </div>
</div>

<!-- Sub-tab: Nepotismo -->
<div id="rsub-nepotismo" class="hidden">
  <div class="glass-panel rounded-2xl p-6 mb-6">
    <h3 class="font-bold text-white mb-2">👥 Detector de Nepotismo</h3>
    <p class="text-zinc-400 text-xs mb-4">Busca servidores públicos federais pelo sobrenome para identificar possíveis vínculos familiares com políticos. Usa a base de <strong class="text-white">Servidores Civis do Poder Executivo Federal</strong>.</p>
    <div class="flex gap-3">
      <input id="nepotismoNome" type="text" placeholder="Sobrenome do político (ex: Silva, Bolsonaro, Lula...)" class="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-white placeholder-zinc-600 focus:border-yellow-500 outline-none text-sm" />
      <button onclick="runNepotismoSearch()" class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold px-6 py-2.5 rounded-xl transition whitespace-nowrap">
        🔎 Buscar
      </button>
    </div>
    <p class="text-zinc-600 text-[10px] mt-2">⚠️ Uma correspondência de sobrenome <strong>não prova</strong> nepotismo. Serve como ponto de partida para investigação com fontes primárias.</p>
  </div>
  <div id="nepotismoResults" class="text-zinc-500 text-sm text-center py-12">
    Digite um sobrenome para buscar servidores federais com esse nome.
  </div>
</div>

<!-- Sub-tab: Cruzamento PF×PJ -->
<div id="rsub-cruzamento" class="hidden">
  <div class="glass-panel rounded-2xl p-6 mb-6">
    <h3 class="font-bold text-white mb-2">🔗 Cruzamento Pessoa Física × Pessoa Jurídica</h3>
    <p class="text-zinc-400 text-xs mb-4">Verifica se uma pessoa física é sócia de empresa que recebeu dinheiro público, e se ela ocupou/ocupa cargos em gabinetes de deputados federais. Informe o nome (obrigatório) e CPF e/ou CNPJ para ampliar o cruzamento.</p>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
      <div>
        <label class="text-xs text-zinc-400 font-bold uppercase block mb-1">Nome Completo <span class="text-red-400">*</span></label>
        <input id="cruzNome" type="text" placeholder="Ex: João da Silva" class="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-white placeholder-zinc-600 focus:border-cyan-500 outline-none text-sm" />
      </div>
      <div>
        <label class="text-xs text-zinc-400 font-bold uppercase block mb-1">CPF (opcional)</label>
        <input id="cruzCpf" type="text" placeholder="000.000.000-00" class="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-white placeholder-zinc-600 focus:border-cyan-500 outline-none text-sm" />
      </div>
      <div>
        <label class="text-xs text-zinc-400 font-bold uppercase block mb-1">CNPJ da Empresa (opcional)</label>
        <input id="cruzCnpj" type="text" placeholder="00.000.000/0001-00" class="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-white placeholder-zinc-600 focus:border-cyan-500 outline-none text-sm" />
      </div>
    </div>
    <button onclick="runCruzamentoPFPJ()" class="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-8 py-3 rounded-xl transition flex items-center gap-2 shadow-lg shadow-cyan-900/30">
      <span class="text-xl">🔗</span> Cruzar Dados
    </button>
    <p class="text-zinc-600 text-[10px] mt-2">⚠️ Dados consultados em bases públicas do governo federal. Nenhuma informação é armazenada.</p>
  </div>
  <div id="cruzamentoResult" class="text-zinc-500 text-sm text-center py-12">
    Preencha os campos acima e clique em <strong>Cruzar Dados</strong> para iniciar a investigação.
  </div>
</div>

<!-- Sub-tab: Despesas Avançadas -->
<div id="rsub-despesas" class="hidden">
  <div class="glass-panel rounded-2xl p-6 mb-6">
    <h3 class="font-bold text-white mb-2">💸 Análise Avançada de Despesas (CEAP)</h3>
    <p class="text-zinc-400 text-xs mb-4">Aplica <strong class="text-white">11 regras de detecção</strong> sobre as despesas de um deputado federal: refeições caras, combustível, fretamentos, hospedagem, despesas em fim de semana, duplicatas e muito mais.</p>
    <!-- Busca por nome -->
    <div class="flex gap-3 mb-3">
      <input id="riskDeputyName" type="text" placeholder="Buscar deputado por nome (ex: Bolsonaro, Lula...)" class="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-white placeholder-zinc-600 focus:border-orange-500 outline-none text-sm" />
      <button onclick="searchDeputyForRisk()" class="bg-zinc-700 hover:bg-zinc-600 text-white font-bold px-4 py-2.5 rounded-xl transition whitespace-nowrap text-sm">
        🔎 Buscar
      </button>
    </div>
    <div id="deputySearchResults" class="mb-3 hidden"></div>
    <!-- ID direto -->
    <div class="flex gap-3">
      <input id="riskDeputyId" type="text" placeholder="Ou informe o ID diretamente (ex: 160511)" class="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-white placeholder-zinc-600 focus:border-orange-500 outline-none text-sm" />
      <button onclick="runExpandedRisk()" class="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-2.5 rounded-xl transition whitespace-nowrap">
        🔬 Analisar
      </button>
    </div>
  </div>
  <div id="expandedRiskResult" class="text-zinc-500 text-sm text-center py-12">
    Insira o ID do deputado e clique em Analisar.
  </div>
</div>
</div>
