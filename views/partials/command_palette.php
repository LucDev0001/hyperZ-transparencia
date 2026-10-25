<!-- ═══════════════════════════════════════════════════════════════════════════
     UNIVERSAL COMMAND PALETTE (Ctrl+K / ⌘K) — Modern SaaS Search
═══════════════════════════════════════════════════════════════════════════ -->
<style>
  #cmd-palette-backdrop {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: rgba(0, 0, 0, 0.8) !important;
    backdrop-filter: blur(8px) !important;
    -webkit-backdrop-filter: blur(8px) !important;
    z-index: 9998 !important;
    transition: opacity 0.2s ease !important;
    opacity: 0;
    pointer-events: auto;
  }
  #cmd-palette-backdrop.active {
    opacity: 1 !important;
  }

  #cmd-palette-modal {
    position: fixed !important;
    top: 72px !important;
    left: 50% !important;
    transform: translateX(-50%) scale(0.96) !important;
    width: min(94vw, 680px) !important;
    background-color: #0c0c10 !important;
    border: 1px solid rgba(255, 255, 255, 0.16) !important;
    border-radius: 1.25rem !important;
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(139, 92, 246, 0.35) !important;
    z-index: 9999 !important;
    overflow: hidden !important;
    display: none;
    flex-direction: column !important;
    max-height: calc(88vh - 72px) !important;
    opacity: 0;
    transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
  }
  #cmd-palette-modal.active {
    display: flex !important;
    opacity: 1 !important;
    transform: translateX(-50%) scale(1) !important;
  }

  .cmd-header {
    background-color: #15151c !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
    padding: 0.875rem 1.125rem !important;
  }

  .cmd-categories {
    background-color: #101016 !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
    padding: 0.5rem 0.875rem !important;
  }

  .cmd-results {
    background-color: #0c0c10 !important;
    padding: 0.5rem !important;
    overflow-y: auto !important;
    flex: 1 1 auto !important;
    min-height: 180px !important;
  }

  .cmd-results::-webkit-scrollbar {
    width: 6px;
  }
  .cmd-results::-webkit-scrollbar-track {
    background: transparent;
  }
  .cmd-results::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 9999px;
  }
  .cmd-results::-webkit-scrollbar-thumb:hover {
    background: rgba(139, 92, 246, 0.5);
  }

  .cmd-footer {
    background-color: #101016 !important;
    border-top: 1px solid rgba(255, 255, 255, 0.06) !important;
    padding: 0.625rem 1rem !important;
  }
</style>

<div id="cmd-palette-backdrop"
     onclick="window.closeCommandPalette()"
     style="display:none;"></div>

<div id="cmd-palette-modal"
     style="display:none;">

  <!-- Search Header -->
  <div class="cmd-header flex items-center">
    <div class="text-zinc-400 mr-3 flex-shrink-0">
      <svg class="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
      </svg>
    </div>
    <input id="cmd-palette-input"
           type="text"
           autocomplete="off"
           spellcheck="false"
           placeholder="Buscar ferramenta, deputado, senador, empresa, gastos..."
           class="w-full bg-transparent text-white placeholder-zinc-500 text-sm sm:text-base font-semibold focus:outline-none" />
    <div class="flex items-center gap-1.5 flex-shrink-0 ml-2">
      <kbd class="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-md shadow-xs">ESC</kbd>
      <button onclick="window.closeCommandPalette()" class="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition sm:hidden">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
  </div>

  <!-- Filter Category Tags -->
  <div class="cmd-categories flex items-center gap-1.5 overflow-x-auto scrollbar-hide text-xs">
    <button onclick="window.setCmdFilter('all')" data-cmd-filter="all" class="cmd-filter-pill px-3 py-1 rounded-lg font-bold bg-violet-600 text-white transition whitespace-nowrap shadow-sm">Todas (24)</button>
    <button onclick="window.setCmdFilter('parlamento')" data-cmd-filter="parlamento" class="cmd-filter-pill px-3 py-1 rounded-lg font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition whitespace-nowrap">Parlamento</button>
    <button onclick="window.setCmdFilter('investigacao')" data-cmd-filter="investigacao" class="cmd-filter-pill px-3 py-1 rounded-lg font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition whitespace-nowrap">Investigação</button>
    <button onclick="window.setCmdFilter('cofres')" data-cmd-filter="cofres" class="cmd-filter-pill px-3 py-1 rounded-lg font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition whitespace-nowrap">Cofres Públicos</button>
    <button onclick="window.setCmdFilter('comunidade')" data-cmd-filter="comunidade" class="cmd-filter-pill px-3 py-1 rounded-lg font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition whitespace-nowrap">Cidadão</button>
  </div>

  <!-- Results List -->
  <div id="cmd-palette-results" class="cmd-results space-y-1">
    <!-- Items dynamically populated by JS -->
  </div>

  <!-- Footer Help -->
  <div class="cmd-footer flex items-center justify-between text-[11px] text-zinc-500 select-none">
    <div class="flex items-center gap-3">
      <span><kbd class="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px] border border-white/5">↑</kbd> <kbd class="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px] border border-white/5">↓</kbd> Navegar</span>
      <span><kbd class="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px] border border-white/5">↵</kbd> Acessar</span>
    </div>
    <span class="text-violet-400/90 font-mono font-bold text-[10px] uppercase tracking-wider">Hyper Z SaaS</span>
  </div>
</div>

<script>
(function() {
  const svgIcons = {
    user: '<path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>',
    landmark: '<path stroke-linecap="round" stroke-linejoin="round" d="M8 14v5m4-5v5m4-5v5M3 21h18M3 10h18M4 10l8-6 8 6M6 10v11m12-11v11"/>',
    vote: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>',
    shield: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>',
    flag: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/>',
    archive: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>',
    radar: '<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>',
    alert: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>',
    trophy: '<path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>',
    network: '<path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>',
    scale: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/>',
    coins: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>',
    'chart-bar': '<path stroke-linecap="round" stroke-linejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>',
    'file-text': '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>',
    plane: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>',
    receipt: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"/>',
    building: '<path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>',
    users: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>',
    layers: '<path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>',
    handshake: '<path stroke-linecap="round" stroke-linejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>',
    newspaper: '<path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>',
    map: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>',
    book: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>',
    game: '<path stroke-linecap="round" stroke-linejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>',
    award: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>',
    sparkles: '<path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.286L13 21l-2.286-6.857L5 12l5.714-2.286L13 3z"/>'
  };

  function getCmdIconHtml(iconKey, color) {
    const p = svgIcons[iconKey] || '<circle cx="12" cy="12" r="9"/>';
    const colorStyles = {
      violet: 'background:rgba(139,92,246,0.18);color:#a78bfa;border:1px solid rgba(139,92,246,0.35);',
      indigo: 'background:rgba(99,102,241,0.18);color:#818cf8;border:1px solid rgba(99,102,241,0.35);',
      red: 'background:rgba(239,68,68,0.18);color:#f87171;border:1px solid rgba(239,68,68,0.35);',
      rose: 'background:rgba(244,63,94,0.18);color:#fb7185;border:1px solid rgba(244,63,94,0.35);',
      amber: 'background:rgba(245,158,11,0.18);color:#fbbf24;border:1px solid rgba(245,158,11,0.35);',
      yellow: 'background:rgba(234,179,8,0.18);color:#facc15;border:1px solid rgba(234,179,8,0.35);',
      purple: 'background:rgba(168,85,247,0.18);color:#c084fc;border:1px solid rgba(168,85,247,0.35);',
      blue: 'background:rgba(59,130,246,0.18);color:#60a5fa;border:1px solid rgba(59,130,246,0.35);',
      cyan: 'background:rgba(6,182,212,0.18);color:#22d3ee;border:1px solid rgba(6,182,212,0.35);',
      sky: 'background:rgba(14,165,233,0.18);color:#38bdf8;border:1px solid rgba(14,165,233,0.35);',
      emerald: 'background:rgba(16,185,129,0.18);color:#34d399;border:1px solid rgba(16,185,129,0.35);',
      teal: 'background:rgba(20,184,166,0.18);color:#2dd4bf;border:1px solid rgba(20,184,166,0.35);',
      fuchsia: 'background:rgba(217,70,239,0.18);color:#e879f9;border:1px solid rgba(217,70,239,0.35);',
      zinc: 'background:rgba(255,255,255,0.06);color:#d4d4d8;border:1px solid rgba(255,255,255,0.12);'
    };
    const s = colorStyles[color] || colorStyles.violet;
    return `
      <div style="width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;${s}">
        <svg style="width:18px;height:18px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          ${p}
        </svg>
      </div>
    `;
  }

  const tools = [
    // Parlamento
    { id: 'politicos', title: 'Deputados Federais', cat: 'parlamento', desc: 'Gastos de cota parlamentar (CEAP), discursos, presenças e votações.', iconKey: 'user', color: 'violet', keywords: 'deputado camara cota gabinete gastos brasilia parlamentar' },
    { id: 'senadores', title: 'Senadores da República', cat: 'parlamento', desc: 'CEAPS, mandatos, autorias de leis, cargos e votações do Senado Federal.', iconKey: 'landmark', color: 'indigo', keywords: 'senado senador ceaps legis mandatos relatorias' },
    { id: 'apuracao', title: 'Eleições 2026 (Apuração)', cat: 'parlamento', desc: 'Contagem de votos em tempo real, placar e histórico eleitoral.', iconKey: 'vote', color: 'red', keywords: 'eleicoes 2026 apuracao votos tse urna candidatos' },
    { id: 'presidentes', title: 'Presidentes do Brasil', cat: 'parlamento', desc: 'Linha do tempo histórica, biografias, períodos de mandato e dados.', iconKey: 'shield', color: 'amber', keywords: 'presidente republica lula bolsonaro vargas historia' },
    { id: 'partidos', title: 'Bancadas Partidárias', cat: 'parlamento', desc: 'Fundo partidário, lideranças e composição da Câmara e Senado.', iconKey: 'flag', color: 'purple', keywords: 'partidos pl pt uniao pp psd bancadas siglas' },
    { id: 'eleicoes', title: 'Dados Abertos TSE', cat: 'parlamento', desc: 'Bens de candidatos, doações de campanha e receitas declaradas.', iconKey: 'archive', color: 'blue', keywords: 'tse divulgacand contas doacoes patrimônio bens' },

    // Investigação
    { id: 'radar', title: 'Radar Anticorrupção & PEPs', cat: 'investigacao', desc: 'Cruzamento de sanções CEIS/CNEP, pessoas politicamente expostas e alertas.', iconKey: 'radar', color: 'red', keywords: 'radar corrupcao ceis cnep peps laranjas nepotismo sancoes cgu' },
    { id: 'risco', title: 'Análise de Risco & Anomalias', cat: 'investigacao', desc: 'Detecção algorítmica de notas fiscais suspeitas e empresas recém-abertas.', iconKey: 'alert', color: 'rose', keywords: 'risco anomalias algoritmos suspeitas notas fiscais' },
    { id: 'top_corrupcao', title: 'Top Maiores Gastos & Fornecedores', cat: 'investigacao', desc: 'Ranking de empresas que mais faturam com dinheiro público.', iconKey: 'trophy', color: 'red', keywords: 'top gastos maiores fornecedores contratos milhoes' },
    { id: 'rede', title: 'Radar Conexões (Grafo)', cat: 'investigacao', desc: 'Visualização interativa de rede de influência entre políticos e empresas.', iconKey: 'network', color: 'violet', keywords: 'grafo rede conexoes influencia socios empresas vis' },
    { id: 'comparador', title: 'Comparador de Parlamentares', cat: 'investigacao', desc: 'Compare lado a lado gastos, assiduidade e votações de dois políticos.', iconKey: 'scale', color: 'blue', keywords: 'comparador comparar duelo gastos assiduidade' },

    // Cofres Públicos
    { id: 'orcamento', title: 'Orçamento Geral da União', cat: 'cofres', desc: 'Gráficos interativos da LOA, saúde, educação, previdência e defesa.', iconKey: 'coins', color: 'amber', keywords: 'orcamento uniao loa gastos federais saude educacao' },
    { id: 'gestao', title: 'Gestão & Execução Financeira', cat: 'cofres', desc: 'Painel detalhado de empenhos, liquidações e pagamentos federais.', iconKey: 'chart-bar', color: 'emerald', keywords: 'gestao financas empenho liquidacao siafi execucao' },
    { id: 'licitacoes', title: 'Licitações & Contratos', cat: 'cofres', desc: 'Pesquise editais, pregões e compras de todos os ministérios.', iconKey: 'file-text', color: 'cyan', keywords: 'licitacoes pregao contratos compras comprasnet cgu' },
    { id: 'viagens', title: 'Viagens & Diárias Oficiais', cat: 'cofres', desc: 'Passagens aéreas, diárias e custos de servidores e autoridades.', iconKey: 'plane', color: 'sky', keywords: 'viagens diarias passagens hotel missao oficial' },
    { id: 'receitas', title: 'Execução Orçamentária', cat: 'cofres', desc: 'Arrecadação de tributos, impostos e receitas da União.', iconKey: 'receipt', color: 'teal', keywords: 'receitas impostos arrecadacao tributos uniao' },
    { id: 'imoveis', title: 'Imóveis Funcionais', cat: 'cofres', desc: 'Apartamentos e residências oficiais concedidas a servidores e autoridades.', iconKey: 'building', color: 'zinc', keywords: 'imoveis funcionais apartamentos brasilia patrimonio' },
    { id: 'servidores', title: 'Servidores Públicos', cat: 'cofres', desc: 'Remunerações, cargos comissionados e folha de pagamento federal.', iconKey: 'users', color: 'zinc', keywords: 'servidores folha salarios cargos comissao siape' },
    { id: 'outros', title: 'Executivo Federal & Ministérios', cat: 'cofres', desc: 'Estrutura administrativa dos ministérios e órgãos federais.', iconKey: 'layers', color: 'zinc', keywords: 'executivo ministerios orgaos governo federal' },

    // Comunidade / Cidadão
    { id: 'pautas_gz', title: 'Pautas Comunitárias GZ', cat: 'comunidade', desc: 'Propostas de fiscalização cidadã organizadas pela comunidade Hyper Z.', iconKey: 'handshake', color: 'emerald', keywords: 'pautas gz comunidade solidariedade cidadania propostas' },
    { id: 'noticias', title: 'Feed de Notícias Políticas', cat: 'comunidade', desc: 'Agregador ao vivo da Câmara, Senado e agências oficiais.', iconKey: 'newspaper', color: 'blue', keywords: 'noticias feeds rss camara senado politica atualidades' },
    { id: 'mapa', title: 'Mapa Geográfico de Gastos', cat: 'comunidade', desc: 'Distribuição espacial de recursos públicos pelos 26 estados e DF.', iconKey: 'map', color: 'amber', keywords: 'mapa estados brasil uf gastos heatmap geolocalizacao' },

    // Extras
    { id: 'wiki', title: 'Wiki Política IA', cat: 'comunidade', desc: 'Enciclopédia política interativa alimentada por assistente de IA.', iconKey: 'book', color: 'amber', isLink: 'wiki.php', keywords: 'wiki enciclopedia inteligencia artificial termos leis' },
    { id: 'game', title: 'DepuMon GO (Gamificação)', cat: 'comunidade', desc: 'Game cívico para auditar gastos e colecionar cards investigativos.', iconKey: 'game', color: 'fuchsia', isLink: 'game.php', keywords: 'game jogo depumon cartas batalha cacada fiscal' },
    { id: 'ranking', title: 'Ranking de Auditores Cidadãos', cat: 'comunidade', desc: 'Tabela de líderes dos usuários mais ativos na plataforma.', iconKey: 'award', color: 'yellow', isLink: 'ranking.php', keywords: 'ranking leaderboard pontos pontuacao auditores' },
    { id: 'novidades', title: 'Novidades do Portal 2.0', cat: 'comunidade', desc: 'Resumo das atualizações, novos motores de apuração, partidos e busca rápida.', iconKey: 'sparkles', color: 'violet', action: 'welcome', keywords: 'novidades 2.0 bem vindo atualizacoes versao changelog onboarding guia' }
  ];

  let activeFilter = 'all';
  let selectedIndex = 0;
  let currentResults = [];

  window.openCommandPalette = function() {
    const modal = document.getElementById('cmd-palette-modal');
    const backdrop = document.getElementById('cmd-palette-backdrop');
    const input = document.getElementById('cmd-palette-input');
    if (!modal || !backdrop) return;

    backdrop.style.display = 'block';
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      backdrop.classList.add('active');
      modal.classList.add('active');
      if (input) {
        input.value = '';
        input.focus();
        renderResults('');
      }
    });
  };

  window.closeCommandPalette = function() {
    const modal = document.getElementById('cmd-palette-modal');
    const backdrop = document.getElementById('cmd-palette-backdrop');
    if (!modal || !backdrop) return;

    backdrop.classList.remove('active');
    modal.classList.remove('active');
    document.body.style.overflow = '';

    setTimeout(() => {
      modal.style.display = 'none';
      backdrop.style.display = 'none';
    }, 200);
  };

  window.setCmdFilter = function(filter) {
    activeFilter = filter;
    document.querySelectorAll('.cmd-filter-pill').forEach(btn => {
      const isAct = btn.getAttribute('data-cmd-filter') === filter;
      btn.className = isAct 
        ? 'cmd-filter-pill px-3 py-1 rounded-lg font-bold bg-violet-600 text-white transition whitespace-nowrap shadow-sm'
        : 'cmd-filter-pill px-3 py-1 rounded-lg font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition whitespace-nowrap';
    });
    const input = document.getElementById('cmd-palette-input');
    renderResults(input ? input.value : '');
  };

  function renderResults(query) {
    const q = query.toLowerCase().trim();
    const container = document.getElementById('cmd-palette-results');
    if (!container) return;

    currentResults = tools.filter(t => {
      if (activeFilter !== 'all' && t.cat !== activeFilter) return false;
      if (!q) return true;
      const haystack = (t.title + ' ' + t.desc + ' ' + t.keywords + ' ' + t.id).toLowerCase();
      return haystack.includes(q);
    });

    selectedIndex = 0;

    if (currentResults.length === 0) {
      container.innerHTML = `
        <div class="py-12 text-center text-zinc-500">
          <p class="text-sm font-semibold text-zinc-400">Nenhum resultado encontrado para "<span class="text-white">${query}</span>"</p>
          <p class="text-xs text-zinc-600 mt-1.5">Dica: tente pesquisar por "deputado", "contratos", "viagens" ou "radar".</p>
        </div>
      `;
      return;
    }

    container.innerHTML = currentResults.map((t, idx) => {
      const isSelected = idx === selectedIndex;
      const selectClass = isSelected 
        ? 'bg-violet-600/20 border-violet-500/50 text-white shadow-sm' 
        : 'border-white/5 text-zinc-300 hover:bg-white/5 hover:text-white hover:border-white/10';
      return `
        <div onclick="window.selectCmdItem(${idx})"
             id="cmd-item-${idx}"
             class="group flex items-center justify-between p-3 rounded-xl border ${selectClass} cursor-pointer transition">
          <div class="flex items-center gap-3.5 min-w-0">
            ${getCmdIconHtml(t.iconKey || t.id, t.color || 'violet')}
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold truncate ${isSelected ? 'text-violet-300' : 'text-zinc-100'}">${t.title}</span>
                <span class="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/5 uppercase">${t.cat}</span>
              </div>
              <p class="text-[11px] text-zinc-400 truncate mt-0.5 leading-relaxed">${t.desc}</p>
            </div>
          </div>
          <span class="text-[10px] text-zinc-400 font-mono flex-shrink-0 group-hover:text-violet-300 transition hidden sm:inline ml-3">↵ Acessar</span>
        </div>
      `;
    }).join('');
  }

  window.selectCmdItem = function(idx) {
    const item = currentResults[idx];
    if (!item) return;
    window.closeCommandPalette();
    if (item.action === 'welcome') {
      setTimeout(() => {
        if (window.HzOnboarding) window.HzOnboarding.abrir();
      }, 150);
    } else if (item.isLink) {
      window.location.href = item.isLink;
    } else {
      window.customSwitchTab(item.id);
    }
  };

  function updateSelectionVisual() {
    currentResults.forEach((_, idx) => {
      const el = document.getElementById('cmd-item-' + idx);
      if (!el) return;
      if (idx === selectedIndex) {
        el.className = 'group flex items-center justify-between p-3 rounded-xl border border-violet-500/50 bg-violet-600/20 text-white shadow-sm cursor-pointer transition';
        el.scrollIntoView({ block: 'nearest' });
      } else {
        el.className = 'group flex items-center justify-between p-3 rounded-xl border border-white/5 text-zinc-300 hover:bg-white/5 hover:text-white hover:border-white/10 cursor-pointer transition';
      }
    });
  }

  // Keyboard navigation & global shortcuts
  document.addEventListener('keydown', function(e) {
    // Ctrl+K / Cmd+K opens palette
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const modal = document.getElementById('cmd-palette-modal');
      if (modal && modal.style.display !== 'none' && modal.classList.contains('active')) {
        window.closeCommandPalette();
      } else {
        window.openCommandPalette();
      }
      return;
    }

    const modal = document.getElementById('cmd-palette-modal');
    if (!modal || modal.style.display === 'none' || !modal.classList.contains('active')) return;

    if (e.key === 'Escape') {
      window.closeCommandPalette();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (selectedIndex < currentResults.length - 1) {
        selectedIndex++;
        updateSelectionVisual();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (selectedIndex > 0) {
        selectedIndex--;
        updateSelectionVisual();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      window.selectCmdItem(selectedIndex);
    }
  });

  const inputEl = document.getElementById('cmd-palette-input');
  if (inputEl) {
    inputEl.addEventListener('input', function() {
      renderResults(this.value);
    });
  }
})();
</script>
