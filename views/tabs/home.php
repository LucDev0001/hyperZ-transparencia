<!-- Tela Inicial (Dashboard) -->
<div id="content-home" class="hidden animate-fade-in">
    
    <!-- Hero Section -->
    <div class="relative mb-10 rounded-3xl border border-white/10 bg-zinc-900/50 p-6 sm:p-10 lg:p-12 text-center lg:text-left flex flex-col lg:flex-row items-center gap-8 shadow-2xl">
        <div class="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-indigo-600/10 pointer-events-none rounded-3xl overflow-hidden"></div>
        <div class="absolute -top-24 -right-24 w-64 h-64 bg-violet-600/30 blur-[80px] rounded-full pointer-events-none"></div>
        
        <div class="relative z-10 flex-1 w-full">
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
                Investigue.<br class="hidden lg:block"/><span class="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Exponha o Poder.</span>
            </h1>
            <p class="text-zinc-400 text-sm sm:text-base lg:text-lg max-w-xl mx-auto lg:mx-0 mb-8">
                O banco de dados hacker da <a href="https://hyperzcommunity.com" target="_blank" class="text-violet-400 hover:text-violet-300 font-semibold transition">Geração Z</a>. Cruze dados governamentais com Inteligência Artificial e descubra o que tentam esconder. 100% civic tech.
            </p>
            
            <!-- Barra de Busca Global (Funcional) -->
            <div class="relative max-w-2xl mx-auto lg:mx-0 group z-50">
                <div class="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur opacity-25 group-focus-within:opacity-60 transition duration-500"></div>
                <div class="relative flex items-center bg-zinc-900 border border-white/10 rounded-2xl p-1.5 sm:p-2 focus-within:border-violet-500/50 transition-colors">
                    <span class="pl-3 sm:pl-4 text-zinc-500">🔍</span>
                    <input type="text" id="globalSearchInput" placeholder="Nome, CNPJ, empresa ou investigação pública..."
                           class="w-full bg-transparent py-2.5 sm:py-3 pl-3 pr-4 text-white text-sm sm:text-base outline-none placeholder-zinc-600" autocomplete="off" />
                    <button class="bg-violet-600 hover:bg-violet-500 text-white font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm transition-colors hidden sm:block">
                        Pesquisar
                    </button>
                </div>
                <!-- Dropdown de Sugestões -->
                <div id="globalSearchSuggestions" class="absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl hidden overflow-hidden overflow-y-auto text-left z-[200]" style="max-height:min(60vh,420px)">
                    <!-- Injetado via JS -->
                </div>
            </div>
            <div class="flex flex-wrap gap-2 mt-3">
                <span class="text-[11px] text-zinc-500 font-medium">💡 Tente hackear:</span>
                <button onclick="document.getElementById('globalSearchInput').value='Bolsonaro';document.getElementById('globalSearchInput').dispatchEvent(new Event('input'))" class="text-[11px] text-violet-400 hover:text-violet-300 transition font-medium">"Bolsonaro"</button>
                <span class="text-zinc-700">·</span>
                <button onclick="document.getElementById('globalSearchInput').value='14123456000178';document.getElementById('globalSearchInput').dispatchEvent(new Event('input'))" class="text-[11px] text-violet-400 hover:text-violet-300 transition font-medium">"CNPJ"</button>
                <span class="text-zinc-700">·</span>
                <button onclick="document.getElementById('globalSearchInput').value='Lula';document.getElementById('globalSearchInput').dispatchEvent(new Event('input'))" class="text-[11px] text-violet-400 hover:text-violet-300 transition font-medium">"Lula"</button>
            </div>
        </div>

        <!-- Investigação Rápida (desktop) -->
        <div class="relative z-10 hidden lg:flex flex-col gap-3 w-72 flex-shrink-0">
            <div class="glass-panel p-5 rounded-2xl border border-violet-500/20 bg-violet-900/10">
                <div class="flex items-center gap-2 mb-3">
                    <span class="text-xl">🔎</span>
                    <span class="text-sm font-bold text-white">Investigação Pública</span>
                    <span class="ml-auto text-[9px] bg-violet-500/30 text-violet-200 px-1.5 py-0.5 rounded-full border border-violet-500/40 font-bold">INTEL</span>
                </div>
                <input id="osintQuickInput" type="text" placeholder="CNPJ ou nome da empresa..."
                       class="w-full bg-zinc-900/80 border border-zinc-700 text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-violet-500 mb-2"
                       onkeydown="if(event.key==='Enter') runOsintQuick()" />
                <button onclick="runOsintQuick()"
                        class="w-full bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold py-2 rounded-lg transition">
                    🔍 Analisar Entidade
                </button>
                <div class="mt-2 text-[10px] text-zinc-500 leading-tight">Score de Risco · Sanções · Contratos · Sócios</div>
            </div>
            <div class="glass-panel p-4 rounded-2xl flex items-center gap-3 cursor-pointer hover:border-red-500/30 transition" onclick="window.customSwitchTab('radar')">
                <div class="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center text-xl border border-red-500/20">🔍</div>
                <div>
                    <div class="text-xs font-bold text-white">Radar Anti-Corrupção</div>
                    <div class="text-[10px] text-zinc-500">CNEP · CEIS · CEAF · PEP</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Investigação Pública — acesso rápido mobile (oculto no desktop) -->
    <div class="lg:hidden mb-6 glass-panel rounded-2xl p-4 border border-violet-500/20 bg-violet-900/10">
        <div class="flex items-center gap-2 mb-3">
            <span class="text-lg">🔎</span>
            <span class="text-sm font-bold text-white">Investigação Pública</span>
            <span class="ml-auto text-[9px] bg-violet-500/30 text-violet-200 px-1.5 py-0.5 rounded-full border border-violet-500/40 font-bold">INTEL</span>
        </div>
        <div class="flex gap-2">
            <input id="osintQuickInputMobile" type="text" placeholder="CNPJ ou nome da empresa..."
                   class="flex-1 bg-zinc-900/80 border border-zinc-700 text-white text-sm px-3 py-2.5 rounded-xl outline-none focus:border-violet-500"
                   onkeydown="if(event.key==='Enter') runOsintQuickMobile()" />
            <button onclick="runOsintQuickMobile()"
                    class="bg-violet-600 hover:bg-violet-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition flex-shrink-0">
                🔍
            </button>
        </div>
        <p class="text-[10px] text-zinc-500 mt-2">Score de Risco · Sanções · Contratos · Sócios · Alertas</p>
    </div>

    <!-- ══ Etapa 5: Acesso Rápido — visível em todos os tamanhos de tela ══ -->
    <div class="mb-10">
      <h2 class="text-base font-bold text-zinc-400 uppercase tracking-wider mb-4">O que você quer fazer?</h2>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">

        <button onclick="window.customSwitchTab('politicos')"
                class="group glass-panel rounded-2xl p-4 text-left border border-white/5 hover:border-violet-500/40 hover:bg-violet-500/5 transition-all duration-200 flex flex-col gap-3">
          <span class="text-3xl leading-none">👔</span>
          <div>
            <div class="font-bold text-white text-sm group-hover:text-violet-300 transition-colors">Ver meu Deputado</div>
            <div class="text-zinc-500 text-xs mt-1 leading-tight">Gastos, votos e presença</div>
          </div>
        </button>

        <button onclick="window.customSwitchTab('radar');if(typeof window.initRadarTab==='function')window.initRadarTab();"
                class="group glass-panel rounded-2xl p-4 text-left border border-white/5 hover:border-red-500/40 hover:bg-red-500/5 transition-all duration-200 flex flex-col gap-3">
          <span class="text-3xl leading-none">🔍</span>
          <div>
            <div class="font-bold text-white text-sm group-hover:text-red-300 transition-colors">Investigar alguém</div>
            <div class="text-zinc-500 text-xs mt-1 leading-tight">Checar sanções e irregularidades</div>
          </div>
        </button>

        <button onclick="window.customSwitchTab('orcamento')"
                class="group glass-panel rounded-2xl p-4 text-left border border-white/5 hover:border-green-500/40 hover:bg-green-500/5 transition-all duration-200 flex flex-col gap-3">
          <span class="text-3xl leading-none">💰</span>
          <div>
            <div class="font-bold text-white text-sm group-hover:text-green-300 transition-colors">Ver Gastos Públicos</div>
            <div class="text-zinc-500 text-xs mt-1 leading-tight">Orçamento e contratos federais</div>
          </div>
        </button>

        <button onclick="window.customSwitchTab('municipio')"
                class="group glass-panel rounded-2xl p-4 text-left border border-white/5 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all duration-200 flex flex-col gap-3">
          <span class="text-3xl leading-none">🏘️</span>
          <div>
            <div class="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">Minha Cidade</div>
            <div class="text-zinc-500 text-xs mt-1 leading-tight">Repasses e representantes locais</div>
          </div>
        </button>

      </div>
    </div>
    <!-- ══ fim Acesso Rápido ══ -->

    <!-- Cenário Político Local -->
    <div class="mb-12">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">📍 Raio-X Local</h2>
            <button onclick="openLocalConfig()" class="text-xs text-violet-400 hover:text-violet-300 font-bold transition">⚙️ Configurar</button>
        </div>
        
        <div id="localScenarioConfig" class="glass-panel p-6 rounded-2xl border border-dashed border-violet-500/30">
            <p class="text-zinc-400 text-sm mb-4">Selecione seu estado e município para um resumo rápido dos repasses federais e representantes locais.</p>
            <div class="flex flex-col sm:flex-row gap-3">
                <select id="homeLocalUf" onchange="loadHomeLocalCities(this.value)" class="bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-500 w-full sm:w-1/3">
                    <option value="">Selecione o Estado...</option>
                    <option value="AC">AC</option><option value="AL">AL</option><option value="AP">AP</option>
                    <option value="AM">AM</option><option value="BA">BA</option><option value="CE">CE</option>
                    <option value="DF">DF</option><option value="ES">ES</option><option value="GO">GO</option>
                    <option value="MA">MA</option><option value="MT">MT</option><option value="MS">MS</option>
                    <option value="MG">MG</option><option value="PA">PA</option><option value="PB">PB</option>
                    <option value="PR">PR</option><option value="PE">PE</option><option value="PI">PI</option>
                    <option value="RJ">RJ</option><option value="RN">RN</option><option value="RS">RS</option>
                    <option value="RO">RO</option><option value="RR">RR</option><option value="SC">SC</option>
                    <option value="SP">SP</option><option value="SE">SE</option><option value="TO">TO</option>
                </select>
                <select id="homeLocalCity" class="bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-500 w-full sm:w-2/3 disabled:opacity-50" disabled>
                    <option value="">Aguardando Estado...</option>
                </select>
                <button onclick="saveAndLoadLocalScenario()" class="bg-violet-600 hover:bg-violet-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-lg shadow-violet-900/20">Salvar</button>
            </div>
        </div>
        
        <div id="localScenarioData" class="hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Preenchido via JS -->
        </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 sm:mb-6">
        <div class="glass-panel p-5 rounded-2xl flex flex-col justify-center items-center relative overflow-hidden group border border-white/5 hover:border-blue-500/30 transition-colors">
            <div class="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="text-3xl sm:text-4xl font-black text-white group-hover:text-blue-400 transition-colors mb-1">513</div>
            <div class="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-wider">Deputados</div>
        </div>
        <div class="glass-panel p-5 rounded-2xl flex flex-col justify-center items-center relative overflow-hidden group border border-white/5 hover:border-amber-500/30 transition-colors">
            <div class="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="text-3xl sm:text-4xl font-black text-white group-hover:text-amber-400 transition-colors mb-1">81</div>
            <div class="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-wider">Senadores</div>
        </div>
        <div class="glass-panel p-5 rounded-2xl flex flex-col justify-center items-center relative overflow-hidden group border border-white/5 hover:border-emerald-500/30 transition-colors">
            <div class="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="text-3xl sm:text-4xl font-black text-white group-hover:text-emerald-400 transition-colors mb-1">+40k</div>
            <div class="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-wider">Empresas</div>
        </div>
        <div class="glass-panel p-5 rounded-2xl flex flex-col justify-center items-center relative overflow-hidden group border border-white/5 hover:border-violet-500/30 transition-colors">
            <div class="absolute inset-0 bg-gradient-to-b from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="text-3xl sm:text-4xl font-black text-white group-hover:text-violet-400 transition-colors mb-1">+2M</div>
            <div class="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-wider">Notas Fiscais</div>
        </div>
    </div>

    <!-- ── Cross-promo Hyper Z ─────────────────────────────────────────────── -->
    <?php if (!$is_logged_in): ?>
    <div class="relative overflow-hidden rounded-2xl border border-violet-500/25 mb-8 group">
      <!-- Background -->
      <div class="absolute inset-0 bg-gradient-to-r from-violet-950/80 via-zinc-900/90 to-indigo-950/80 pointer-events-none"></div>
      <div class="absolute -top-12 -right-12 w-48 h-48 bg-violet-600/20 rounded-full blur-[60px] pointer-events-none group-hover:bg-violet-600/30 transition"></div>
      <div class="absolute -bottom-8 left-8 w-32 h-32 bg-indigo-600/15 rounded-full blur-[40px] pointer-events-none"></div>
      <!-- Shimmer top border -->
      <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent"></div>

      <div class="relative z-10 flex flex-col sm:flex-row items-center gap-5 p-5 sm:p-6">
        <!-- Icon -->
        <div class="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-900/40 text-2xl">
          🗣️
        </div>
        <!-- Text -->
        <div class="flex-1 text-center sm:text-left">
          <div class="flex items-center justify-center sm:justify-start gap-2 mb-1">
            <span class="text-white font-black text-base sm:text-lg leading-tight">Encontrou um escândalo?</span>
            <span class="text-[10px] bg-violet-500/25 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full font-bold hidden sm:inline">EXPONHA</span>
          </div>
          <p class="text-zinc-400 text-xs sm:text-sm leading-relaxed">
            Vaze os dados deste portal para milhares de jovens na <strong class="text-violet-400">plataforma hacker Hyper Z</strong> — sem algoritmos, sem censura.
          </p>
          <div class="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2.5">
            <span class="text-zinc-600 text-xs flex items-center gap-1">🛡️ <span>100% Anônimo</span></span>
            <span class="text-zinc-600 text-xs flex items-center gap-1">🔒 <span>Anti-censura</span></span>
            <span class="text-zinc-600 text-xs flex items-center gap-1">🇧🇷 <span>Hacker BR</span></span>
          </div>
        </div>
        <!-- CTAs -->
        <div class="flex flex-col gap-2 flex-shrink-0 w-full sm:w-auto">
          <a href="/cadastrar"
            class="inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-lg shadow-violet-900/30 whitespace-nowrap">
            Entrar na Rede
          </a>
          <a href="/entrar"
            class="inline-flex items-center justify-center gap-2 bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-600/50 text-zinc-300 font-semibold px-5 py-2 rounded-xl text-xs transition whitespace-nowrap">
            Já tenho conta →
          </a>
        </div>
      </div>
    </div>
    <?php else: ?>
    <div class="relative overflow-hidden rounded-2xl border border-white/8 mb-8 group">
      <div class="absolute inset-0 bg-gradient-to-r from-zinc-900/90 to-indigo-950/60 pointer-events-none"></div>
      <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent"></div>
      <div class="relative z-10 flex items-center gap-4 px-5 py-4">
        <span class="text-xl flex-shrink-0">💬</span>
        <p class="text-zinc-400 text-sm flex-1">
          Debata essas pautas com outros usuários na sua <strong class="text-white">linha do tempo</strong>.
        </p>
        <a href="'/feed'"
          class="flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition whitespace-nowrap">
          Ir para o Feed →
        </a>
      </div>
    </div>
    <?php endif; ?>
    <!-- ── /Cross-promo ──────────────────────────────────────────────────── -->

    <!-- ── Slot de anúncio nativo (home) ── -->
    <div id="home-ad-wrap" class="mb-8" style="display:none">
      <div class="text-[9px] text-zinc-700 uppercase tracking-widest mb-1.5">Patrocinado</div>
      <div id="home-ad-slot"></div>
    </div>

    <!-- Grid de Ferramentas (Oculto no Mobile) -->
    <div class="hidden sm:block pb-16">
        <div class="flex items-center justify-between mb-6 mt-4">
            <h2 class="text-xl sm:text-2xl font-bold text-white">Ferramentas de Investigação</h2>
            <div class="h-px bg-white/10 flex-1 ml-6"></div>
        </div>
        
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        <?php
        global $nav;
        if(isset($nav)) {
            foreach ($nav as [$id, $icon, $label, $color, $extra]):
                $colorClass = match($color) {
                    'red'    => 'hover:border-red-500/50 hover:bg-red-500/5 group-hover:text-red-400',
                    'blue'   => 'hover:border-blue-500/50 hover:bg-blue-500/5 group-hover:text-blue-400',
                    'amber'  => 'hover:border-amber-500/50 hover:bg-amber-500/5 group-hover:text-amber-400',
                    'violet' => 'hover:border-violet-500/50 hover:bg-violet-500/5 group-hover:text-violet-400',
                    default  => 'hover:border-zinc-400/50 hover:bg-zinc-500/5 group-hover:text-zinc-200',
                };
                $iconBg = match($color) {
                    'red'    => 'bg-red-500/10 text-red-400 border-red-500/20',
                    'blue'   => 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                    'amber'  => 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                    'violet' => 'bg-violet-500/10 text-violet-400 border-violet-500/20',
                    default  => 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
                };
        ?>
        <button onclick="window.customSwitchTab('<?= $id ?>');<?= $extra ?>" 
                class="glass-panel p-4 sm:p-5 rounded-2xl transition-all duration-300 text-left h-32 sm:h-36 flex flex-col justify-between group <?= $colorClass ?> relative overflow-hidden border border-white/5">
            <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl mb-3 <?= $iconBg ?> border transition-colors duration-300">
                <?= $icon ?>
            </div>
            <div class="flex items-center justify-between w-full">
                <span class="font-bold text-white text-xs sm:text-sm truncate transition-colors duration-300"><?= $label ?></span>
                <svg class="w-3 h-3 sm:w-4 sm:h-4 text-zinc-600 group-hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </div>
        </button>
        <?php endforeach; } ?>
        
        <!-- Manual special buttons -->
        <a href="/transparencia/wiki" class="glass-panel p-4 sm:p-5 rounded-2xl transition-all duration-300 text-left h-32 sm:h-36 flex flex-col justify-between group hover:border-amber-500/50 hover:bg-amber-500/5 border border-white/5 relative overflow-hidden">
            <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl mb-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 transition-colors duration-300">📖</div>
            <div class="flex items-center justify-between w-full">
                <span class="font-bold text-white text-xs sm:text-sm truncate group-hover:text-amber-400 transition-colors duration-300">Wiki Política</span>
                <svg class="w-3 h-3 sm:w-4 sm:h-4 text-zinc-600 group-hover:text-amber-400 transition-all duration-300 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </div>
        </a>
        <a href="/transparencia/jogo" class="glass-panel p-4 sm:p-5 rounded-2xl transition-all duration-300 text-left h-32 sm:h-36 flex flex-col justify-between group hover:border-fuchsia-500/50 hover:bg-fuchsia-500/5 border border-white/5 relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-fuchsia-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl mb-3 bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 transition-colors duration-300 group-hover:animate-bounce">🎮</div>
            <div class="flex items-center justify-between w-full relative z-10">
                <span class="font-bold text-white text-xs sm:text-sm truncate group-hover:text-fuchsia-400 transition-colors duration-300">DepuMon GO</span>
                <svg class="w-3 h-3 sm:w-4 sm:h-4 text-zinc-600 group-hover:text-fuchsia-400 transition-all duration-300 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </div>
        </a>
        <a href="/transparencia/ranking" class="glass-panel p-4 sm:p-5 rounded-2xl transition-all duration-300 text-left h-32 sm:h-36 flex flex-col justify-between group hover:border-yellow-500/50 hover:bg-yellow-500/5 border border-white/5 relative overflow-hidden">
            <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl mb-3 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 transition-colors duration-300">🏆</div>
            <div class="flex items-center justify-between w-full">
                <span class="font-bold text-white text-xs sm:text-sm truncate group-hover:text-yellow-400 transition-colors duration-300">Ranking</span>
                <svg class="w-3 h-3 sm:w-4 sm:h-4 text-zinc-600 group-hover:text-yellow-400 transition-all duration-300 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </div>
        </a>
        </div>
    </div>

    <!-- Footer alinhado ao Home -->
    <?php require_once 'views/partials/creator_block.php'; ?>
</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
    // Configuração Busca Global
    const input = document.getElementById('globalSearchInput');
    let globalSearchTimeout = null;
    
    if (input) {
        input.addEventListener('input', (e) => {
            clearTimeout(globalSearchTimeout);
            const val = e.target.value.trim();
            if (val.length < 3) {
                document.getElementById('globalSearchSuggestions').classList.add('hidden');
                return;
            }
            globalSearchTimeout = setTimeout(() => fetchGlobalSuggestions(val), 600);
        });
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.group.z-50')) {
                document.getElementById('globalSearchSuggestions')?.classList.add('hidden');
            }
        });
    }

    // Carregar Cenário Local se salvo
    const savedLocal = localStorage.getItem('hyperz_local_scenario');
    if (savedLocal) {
        try {
            const parsed = JSON.parse(savedLocal);
            if (parsed.uf && parsed.cityIbge) {
                renderLocalScenario(parsed.uf, parsed.cityIbge, parsed.cityName);
            }
        } catch(e){}
    }
});

async function fetchGlobalSuggestions(query) {
    const suggBox = document.getElementById('globalSearchSuggestions');
    suggBox.innerHTML = '<div style="padding:10px 14px;text-align:center;color:#71717a;font-size:12px;">🔍 Buscando...</div>';
    suggBox.classList.remove('hidden');

    // Helpers de inline style para itens do dropdown
    const S = {
        header: 'display:block;padding:5px 12px;font-size:10px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:.05em;background:rgba(9,9,11,.9);border-bottom:1px solid rgba(63,63,70,.5);position:sticky;top:0;z-index:1;',
        btn: 'display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:9px 12px;background:transparent;cursor:pointer;border:none;border-bottom:1px solid rgba(63,63,70,.35);',
        btnLast: 'display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:9px 12px;background:transparent;cursor:pointer;border:none;',
        icon: 'font-size:18px;flex-shrink:0;width:22px;',
        title: 'color:#fff;font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.3;',
        sub: 'color:#a1a1aa;font-size:11px;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;',
        text: 'flex:1;min-width:0;',
        arrow: 'color:#52525b;font-size:14px;flex-shrink:0;',
    };
    const hover = `onmouseover="this.style.background='rgba(63,63,70,.45)'" onmouseout="this.style.background='transparent'"`;

    let html = '';

    try {
        const res = await window.api.osintSearch(query);

        if (res.erro) {
            suggBox.innerHTML = `<div style="padding:12px;text-align:center;color:#f87171;font-size:13px;">${res.erro}</div>`;
            return;
        }

        // ── CNPJ detected ──
        if (res.tipo === 'cnpj') {
            const cnpj = res.cnpj;
            html += `<div style="${S.header}">🏢 Empresa — CNPJ</div>`;

            const emp = res.entidades?.[0];
            if (emp) {
                const sitColor = emp.situacao?.toLowerCase().includes('ativa') ? '#4ade80' : '#f87171';
                const badge = res.sancoes?.length > 0
                    ? `<span style="font-size:10px;background:rgba(127,29,29,.5);color:#fca5a5;border:1px solid rgba(239,68,68,.3);padding:2px 7px;border-radius:9999px;white-space:nowrap;flex-shrink:0;">⚠️ SANÇÕES</span>`
                    : `<span style="font-size:10px;background:rgba(20,83,45,.4);color:#86efac;border:1px solid rgba(34,197,94,.25);padding:2px 7px;border-radius:9999px;white-space:nowrap;flex-shrink:0;">✅ OK</span>`;
                html += `<button onclick="openOsintIntelligence('${cnpj}');hideGlobalSearch();" style="${S.btn}" ${hover}>
                    <span style="${S.icon}">🏢</span>
                    <div style="${S.text}">
                        <div style="${S.title}">${emp.razao_social}</div>
                        <div style="${S.sub}">${emp.municipio}${emp.atividade ? ' · '+emp.atividade.substring(0,28) : ''}</div>
                        <div style="font-size:11px;font-weight:600;color:${sitColor}">${emp.situacao}</div>
                    </div>
                    ${badge}
                </button>`;
            }

            html += `<div style="${S.header}">Ações</div>`;
            html += `<button onclick="openOsintIntelligence('${cnpj}');hideGlobalSearch();" style="${S.btn}" ${hover}>
                <span style="${S.icon}">🔎</span>
                <div style="${S.text}">
                    <div style="${S.title}">Inteligência Pública — Relatório Completo</div>
                    <div style="${S.sub}">Score de Risco · Sanções · Contratos · Sócios</div>
                </div><span style="${S.arrow}">›</span>
            </button>`;
            html += `<button onclick="openSupplierRadar('${cnpj}');hideGlobalSearch();" style="${S.btnLast}" ${hover}>
                <span style="${S.icon}">📡</span>
                <div style="${S.text}">
                    <div style="${S.title}">Radar Anti-Corrupção</div>
                    <div style="${S.sub}">CNEP · CEIS · CEAF · CEPIM</div>
                </div><span style="${S.arrow}">›</span>
            </button>`;

        // ── CPF detected ──
        } else if (res.tipo === 'cpf') {
            html += `<div style="${S.header}">🔐 CPF detectado</div>`;
            html += `<button onclick="window.customSwitchTab('radar');hideGlobalSearch();" style="${S.btn}" ${hover}>
                <span style="${S.icon}">🕵️</span>
                <div style="${S.text}">
                    <div style="${S.title}">Verificar Antecedentes</div>
                    <div style="${S.sub}">CNEP · CEIS · PEP — Radar Anti-Corrupção</div>
                </div><span style="${S.arrow}">›</span>
            </button>`;
            html += `<button onclick="window.customSwitchTab('radar');hideGlobalSearch();" style="${S.btnLast}" ${hover}>
                <span style="${S.icon}">💸</span>
                <div style="${S.text}">
                    <div style="${S.title}">Verificar Benefícios Sociais</div>
                    <div style="${S.sub}">BPC · Bolsa Família · Auxílio</div>
                </div><span style="${S.arrow}">›</span>
            </button>`;

        // ── Text search ──
        } else {
            const entidades = res.entidades || [];
            const contratos = res.contratos || [];

            if (entidades.length > 0) {
                html += `<div style="${S.header}">👔 Parlamentares</div>`;
                entidades.forEach((d, i) => {
                    if (d.tipo !== 'deputado') return;
                    const isLast = i === entidades.length - 1 && contratos.length === 0;
                    html += `<button onclick="window.customSwitchTab('politicos');setTimeout(()=>window.openDeputyDetails(${d.id}),300);hideGlobalSearch();"
                        style="${isLast ? S.btnLast : S.btn}" ${hover}>
                        <div style="width:30px;height:30px;border-radius:50%;overflow:hidden;background:#3f3f46;flex-shrink:0;border:1px solid #52525b;">
                            <img src="${d.foto}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'">
                        </div>
                        <div style="${S.text}">
                            <div style="${S.title}">${d.nome}</div>
                            <div style="${S.sub}">${d.partido} · ${d.uf}</div>
                        </div>
                        <span style="${S.arrow}">›</span>
                    </button>`;
                });
            }

            if (contratos.length > 0) {
                html += `<div style="${S.header}">📄 Contratos</div>`;
                contratos.slice(0, 3).forEach((c, i) => {
                    const valor = c.valorInicialCompra || c.valorContrato;
                    const valFmt = valor ? 'R$\u00a0' + parseFloat(valor).toLocaleString('pt-BR', {minimumFractionDigits:2}) : '';
                    const forn = c.nomeRazaoSocialFornecedor || c.fornecedor?.razaoSocial || 'Fornecedor não identificado';
                    const isLast = i === Math.min(contratos.length,3) - 1;
                    html += `<button onclick="window.customSwitchTab('gestao');hideGlobalSearch();" style="${isLast ? S.btnLast : S.btn}" ${hover}>
                        <span style="${S.icon}">📄</span>
                        <div style="${S.text}">
                            <div style="${S.title}">${forn}</div>
                            <div style="${S.sub}">${valFmt}</div>
                        </div>
                        <span style="${S.arrow}">›</span>
                    </button>`;
                });
            }

            if (entidades.length === 0 && contratos.length === 0) {
                html += `<div style="${S.header}">⚡ Ações Rápidas</div>`;
            }
            const q = query.replace(/'/g,"\\'");
            html += `<button onclick="searchGeneralAmendmentsGlobal('${q}')" style="${S.btn}" ${hover}>
                <span style="${S.icon}">📜</span>
                <div style="${S.text}">
                    <div style="${S.title}">Emendas de <strong>"${query}"</strong></div>
                    <div style="${S.sub}">Executivo & Municipal</div>
                </div><span style="${S.arrow}">›</span>
            </button>`;
            html += `<button onclick="searchContratosGlobal('${q}')" style="${S.btn}" ${hover}>
                <span style="${S.icon}">📄</span>
                <div style="${S.text}">
                    <div style="${S.title}">Contratos com <strong>"${query}"</strong></div>
                    <div style="${S.sub}">Gestão & Finanças</div>
                </div><span style="${S.arrow}">›</span>
            </button>`;
            html += `<button onclick="openOsintIntelligenceByNome('${q}');hideGlobalSearch();" style="${S.btnLast}" ${hover}>
                <span style="${S.icon}">🔎</span>
                <div style="${S.text}">
                    <div style="${S.title}">Investigar: <strong>"${query}"</strong></div>
                    <div style="${S.sub}">Score de Risco · Sanções · Contratos</div>
                </div><span style="${S.arrow}">›</span>
            </button>`;
        }

    } catch (e) {
        html = `<div style="padding:12px;text-align:center;color:#f87171;font-size:13px;">Erro: ${e.message}</div>`;
    }

    suggBox.innerHTML = html || '<div style="padding:12px;text-align:center;color:#71717a;font-size:12px;">Nenhum resultado encontrado.</div>';
}

function hideGlobalSearch() {
    document.getElementById('globalSearchSuggestions')?.classList.add('hidden');
}

function runOsintQuick() {
    const v = document.getElementById('osintQuickInput')?.value?.trim();
    if (!v) return;
    const isCnpj = /^\d{14}$/.test(v.replace(/\D/g, ''));
    if (isCnpj) openOsintIntelligence(v.replace(/\D/g, ''));
    else openOsintIntelligenceByNome(v);
}

function runOsintQuickMobile() {
    const v = document.getElementById('osintQuickInputMobile')?.value?.trim();
    if (!v) return;
    const isCnpj = /^\d{14}$/.test(v.replace(/\D/g, ''));
    if (isCnpj) openOsintIntelligence(v.replace(/\D/g, ''));
    else openOsintIntelligenceByNome(v);
}

function openSupplierRadar(cnpj) {
    hideGlobalSearch();
    window.customSwitchTab('risco');
    setTimeout(() => {
        const input = document.getElementById('supplierCnpj');
        if (input) {
            input.value = cnpj;
            if(typeof analyzeSupplier === 'function') analyzeSupplier();
        }
    }, 400);
}

function searchGeneralAmendmentsGlobal(query) {
    hideGlobalSearch();
    window.customSwitchTab('outros');
    setTimeout(() => {
        const inp = document.getElementById('inp-emenda-author');
        if (inp) {
            inp.value = query;
            if(typeof searchGeneralAmendments === 'function') searchGeneralAmendments();
            inp.scrollIntoView({behavior: 'smooth', block: 'center'});
        }
    }, 400);
}

function searchContratosGlobal(query) {
    hideGlobalSearch();
    window.customSwitchTab('gestao');
    setTimeout(() => {
        if(typeof toggleGestaoMode === 'function') toggleGestaoMode('contratos');
        setTimeout(() => {
            const inp = document.getElementById('contratos-search');
            if (inp) {
                inp.value = query;
                if(typeof searchContratos === 'function') searchContratos();
                inp.scrollIntoView({behavior: 'smooth', block: 'center'});
            }
        }, 200);
    }, 400);
}

// ── Cenário Local ──
async function loadHomeLocalCities(uf) {
    const citySelect = document.getElementById("homeLocalCity");
    citySelect.innerHTML = '<option value="">Carregando...</option>';
    citySelect.disabled = true;

    if (!uf) {
        citySelect.innerHTML = '<option value="">Aguardando Estado...</option>';
        return;
    }

    try {
        const cities = await window.api.brasilApi(`ibge/municipios/v1/${uf}`);
        citySelect.innerHTML = '<option value="">Selecione o Município</option>';
        cities.forEach((c) => {
            const opt = document.createElement("option");
            opt.value = c.codigo_ibge;
            opt.textContent = c.nome;
            citySelect.appendChild(opt);
        });
        citySelect.disabled = false;
    } catch (e) {
        citySelect.innerHTML = '<option value="">Erro ao carregar</option>';
        citySelect.disabled = false;
    }
}

function openLocalConfig() {
    document.getElementById('localScenarioConfig').classList.remove('hidden');
    document.getElementById('localScenarioData').classList.add('hidden');
}

async function saveAndLoadLocalScenario() {
    const uf = document.getElementById('homeLocalUf').value;
    const citySelect = document.getElementById('homeLocalCity');
    const cityIbge = citySelect.value;
    const cityName = citySelect.options[citySelect.selectedIndex]?.text;

    if (!uf || !cityIbge) {
        alert('Selecione estado e município.');
        return;
    }

    localStorage.setItem('hyperz_local_scenario', JSON.stringify({ uf, cityIbge, cityName }));
    renderLocalScenario(uf, cityIbge, cityName);
}

async function renderLocalScenario(uf, cityIbge, cityName) {
    document.getElementById('localScenarioConfig').classList.add('hidden');
    const dataContainer = document.getElementById('localScenarioData');
    dataContainer.innerHTML = `
        <div class="col-span-full">
            <div class="flex items-center gap-3 py-8 justify-center">
                <div class="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                <span class="text-zinc-400 text-sm animate-pulse">Carregando dados de ${cityName}...</span>
            </div>
        </div>`;
    dataContainer.classList.remove('hidden');

    const ano = new Date().getFullYear();

    // Convênios: busca diretamente pelo código do município (IBGE) para dados precisos
    // Deputados: até 100 por UF (câmara federal é sempre nível estadual)
    const [resConvenios, resDeputados] = await Promise.allSettled([
        window.api.portal(`convenios?codigoIBGE=${cityIbge}&pagina=1&tamanhoPagina=100`),
        window.api.camara(`deputados?siglaUf=${uf}&ordem=ASC&ordenarPor=nome&itens=100`),
    ]);

    // ── Convênios do município ──
    const dataConv = resConvenios.status === 'fulfilled' ? (resConvenios.value ?? []) : [];
    let conveniosCidade = 0, valorConvenios = 0;
    if (Array.isArray(dataConv)) {
        conveniosCidade = dataConv.length;
        dataConv.forEach(c => {
            const v = window.parsePtBrFloat(c.valorGlobal || c.valor || '0');
            valorConvenios += v;
        });
    }

    // ── Deputados da UF ──
    const deps = resDeputados.status === 'fulfilled' ? (resDeputados.value?.dados ?? []) : [];
    const depsCount = deps.length;
    const depsPreview = deps.slice(0, 4);
    const partidos = {};
    deps.forEach(d => { partidos[d.siglaPartido] = (partidos[d.siglaPartido] || 0) + 1; });
    const topPartidos = Object.entries(partidos).sort((a,b)=>b[1]-a[1]).slice(0,3)
        .map(([p,n]) => `<span class="bg-zinc-800 border border-zinc-700 text-zinc-300 text-[9px] px-1.5 py-0.5 rounded-full">${p} ${n}</span>`).join('');
    const depsAvatares = depsPreview.map(d =>
        `<div title="${d.nome}" class="w-8 h-8 rounded-full overflow-hidden border-2 border-zinc-800 bg-zinc-700 flex-shrink-0 -ml-2 first:ml-0 cursor-pointer" onclick="window.customSwitchTab('politicos');setTimeout(()=>window.openDeputyDetails(${d.id}),300)">
            <img src="${d.urlFoto}" class="w-full h-full object-cover" onerror="this.style.display='none'">
         </div>`
    ).join('');

    dataContainer.innerHTML = `
        <!-- Card 1: Convênios do município -->
        <div class="glass-panel p-5 rounded-2xl flex flex-col border-t-4 border-t-green-500 group cursor-pointer hover:bg-white/5 transition-all"
             onclick="window.customSwitchTab('gestao')">
            <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] text-zinc-400 font-bold uppercase">Convênios Federais</span>
                <span class="text-green-400 text-[10px] opacity-0 group-hover:opacity-100 transition font-bold">Ver ↗</span>
            </div>
            <div class="text-2xl sm:text-3xl font-black text-green-400 leading-tight">${conveniosCidade}</div>
            <div class="text-[10px] text-zinc-500 mb-2">
                ${conveniosCidade === 0
                    ? `nenhum convênio ativo encontrado em ${cityName}`
                    : `convênios federais em ${cityName}`}
            </div>
            <div class="text-[10px] text-zinc-400 border-t border-zinc-800 pt-1 mt-1">
                Valor total: <strong class="text-white">${window.formatCurrency(valorConvenios)}</strong>
            </div>
        </div>

        <!-- Card 2: Convênios por tipo (placeholder dinâmico) -->
        <div class="glass-panel p-5 rounded-2xl flex flex-col border-t-4 border-t-amber-500 group cursor-pointer hover:bg-white/5 transition-all"
             onclick="window.customSwitchTab('licitacoes')">
            <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] text-zinc-400 font-bold uppercase">Contratos Federais</span>
                <span class="text-amber-400 text-[10px] opacity-0 group-hover:opacity-100 transition font-bold">Ver ↗</span>
            </div>
            <div class="text-2xl sm:text-3xl font-black text-amber-400 leading-tight">📝</div>
            <div class="text-[10px] text-zinc-500 mb-1">Consulte contratos por órgão</div>
            <div class="text-[10px] text-zinc-400 border-t border-zinc-800 pt-1 mt-1">
                Licitações · Dispensas · Pregões
            </div>
        </div>

        <!-- Card 3: Bancada -->
        <div class="glass-panel p-5 rounded-2xl flex flex-col border-t-4 border-t-violet-500 group cursor-pointer hover:bg-white/5 transition-all"
             onclick="openLocalDeputies('${uf}')">
            <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] text-zinc-400 font-bold uppercase">Bancada Federal</span>
                <span class="text-violet-400 text-[10px] opacity-0 group-hover:opacity-100 transition font-bold">Ver ↗</span>
            </div>
            <div class="text-2xl sm:text-3xl font-black text-white leading-tight">${depsCount}</div>
            <div class="text-[10px] text-zinc-500 mb-2">deputados pelo estado de ${uf}</div>
            ${depsCount > 0 ? `
            <div class="flex items-center gap-1 mb-2">${depsAvatares}${depsCount > 4 ? `<span class="text-[9px] text-zinc-500 ml-1">+${depsCount-4} mais</span>` : ''}</div>
            <div class="flex flex-wrap gap-1">${topPartidos}</div>` : '<div class="text-[10px] text-zinc-600">Dados indisponíveis</div>'}
        </div>

        <!-- Card 4: Investigação rápida -->
        <div class="glass-panel p-5 rounded-2xl flex flex-col border-t-4 border-t-red-500 group cursor-pointer hover:bg-white/5 transition-all"
             onclick="window.customSwitchTab('radar')">
            <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] text-zinc-400 font-bold uppercase">Investigar Sanções</span>
                <span class="text-red-400 text-[10px] opacity-0 group-hover:opacity-100 transition font-bold">Ver ↗</span>
            </div>
            <div class="text-2xl sm:text-3xl font-black text-red-400 leading-tight">CNEP</div>
            <div class="text-[10px] text-zinc-500 mb-2">Radar Anti-Corrupção ativo</div>
            <div class="flex flex-col gap-1 mt-auto">
                <div class="text-[10px] text-zinc-400 border-t border-zinc-800 pt-1">
                    🔍 CEIS · CNEP · CEAF · CEPIM · PEP
                </div>
                <div class="text-[10px] text-zinc-500">Verifique empresas e pessoas no radar federal</div>
            </div>
        </div>
    `;
}

// ── Inteligência Pública Modal ────────────────────────────────────────────────
async function openOsintIntelligence(cnpj) {
    showIntelModal(cnpj, null);
    try {
        // _nc bypasses the 30-second JS cache so each query goes to the PHP server
        const r = await window.api.osintIntelligence({ cnpj, _nc: Date.now() });
        renderIntelModal(r);
    } catch(e) {
        const body = document.getElementById('osintModalBody');
        if (body) body.innerHTML = `<div class="p-6 text-center"><p class="text-red-400 text-sm">❌ Erro: ${e.message}</p></div>`;
    }
}

async function openOsintIntelligenceByNome(nome) {
    showIntelModal(null, nome);
    try {
        const r = await window.api.osintIntelligence({ nome, _nc: Date.now() });
        renderIntelModal(r);
    } catch(e) {
        const body = document.getElementById('osintModalBody');
        if (body) body.innerHTML = `<div class="p-6 text-center"><p class="text-red-400 text-sm">❌ Erro: ${e.message}</p></div>`;
    }
}

function showIntelModal(cnpj, nome) {
    // Remove existing modal to ensure a clean state
    document.getElementById('osintModal')?.remove();

    const label = cnpj
        ? cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
        : (nome ?? '...');

    const modal = document.createElement('div');
    modal.id = 'osintModal';
    // Inline styles ensure z-index and positioning are never overridden by CSS stacking contexts
    modal.style.cssText = [
        'position:fixed',
        'top:0','left:0','right:0','bottom:0',
        'width:100%','height:100%',
        'z-index:2147483647',
        'background:rgba(0,0,0,0.88)',
        'backdrop-filter:blur(6px)',
        '-webkit-backdrop-filter:blur(6px)',
        'display:flex',
        'align-items:flex-start',
        'justify-content:center',
        'padding:12px',
        'overflow-y:auto',
        'isolation:isolate',
    ].join(';');
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    modal.innerHTML = `
        <div class="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-2xl my-4 sm:my-8 flex flex-col shadow-2xl" style="min-height:0;position:relative;z-index:1;">
            <div class="flex items-center justify-between px-4 py-3 border-b border-zinc-800 flex-shrink-0">
                <div class="flex items-center gap-2 min-w-0">
                    <span class="text-lg flex-shrink-0">🔎</span>
                    <div class="min-w-0">
                        <div class="text-xs font-bold text-violet-400 uppercase tracking-wider">Inteligência Pública</div>
                        <div class="text-white font-bold text-sm truncate">${label}</div>
                    </div>
                </div>
                <button onclick="document.getElementById('osintModal').remove()"
                        class="text-zinc-500 hover:text-white transition flex-shrink-0 ml-3 p-1 rounded-lg hover:bg-zinc-800">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>
            <div id="osintModalBody" class="p-4">
                <div class="flex flex-col items-center gap-3 py-12">
                    <div class="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                    <p class="text-zinc-400 text-sm animate-pulse">Consultando bases governamentais…</p>
                    <p class="text-zinc-600 text-xs">Portal da Transparência · BrasilAPI · CEIS · CNEP · CEAF</p>
                </div>
            </div>
        </div>`;
    // Append to <html> root to escape any flex/overflow stacking context from <body> or <main>
    (document.fullscreenElement || document.documentElement).appendChild(modal);
}

// Keep alias for backward compatibility (global search dropdown uses it)
function showOsintModal(msg, loading) { showIntelModal(null, msg); }

function renderIntelModal(r) {
    const body = document.getElementById('osintModalBody');
    if (!body) return;

    if (r.erro) {
        body.innerHTML = `
            <div class="p-6 text-center">
                <div class="text-3xl mb-3">⚠️</div>
                <p class="text-red-400 text-sm font-bold mb-1">Erro na consulta</p>
                <p class="text-zinc-500 text-xs">${r.erro}</p>
            </div>`;
        return;
    }

    const score = r.score_suspeicao ?? 0;
    const nivel = r.nivel_risco ?? {};
    const scoreColor = score >= 61 ? '#ef4444' : score >= 41 ? '#f97316' : score >= 21 ? '#eab308' : '#22c55e';
    const scoreBg   = score >= 61 ? 'rgba(239,68,68,.12)' : score >= 41 ? 'rgba(249,115,22,.12)' : score >= 21 ? 'rgba(234,179,8,.12)' : 'rgba(34,197,94,.12)';
    const circunf = 2 * Math.PI * 40;
    const dash = circunf - (score / 100) * circunf;

    const emp     = r.dados?.empresa;
    const sancoes = r.dados?.sancoes ?? {};
    const alertas = r.alertas ?? [];

    const sancoesCount = Object.values(sancoes).reduce((a, arr) => a + (arr?.length ?? 0), 0);
    const totalContratos = r.dados?.total_contratos_federal ?? 0;
    const totalLic       = r.dados?.total_licitacoes ?? 0;

    // ── Situação cadastral ──
    const sitColor = emp?.situacao?.toLowerCase().includes('ativa') ? '#4ade80'
                   : emp?.situacao ? '#f87171' : '#a1a1aa';

    body.innerHTML = `
        <!-- Score + Entidade ── lado a lado no desktop, empilhado no mobile -->
        <div class="flex flex-col sm:flex-row gap-3 mb-4">

            <!-- Entidade -->
            <div class="flex-1 rounded-xl p-4 border border-zinc-700/60 bg-zinc-800/40 min-w-0">
                <div class="text-[10px] text-zinc-500 uppercase font-bold mb-0.5">${r.entidade?.tipo ?? 'Entidade'}</div>
                <div class="text-white font-black text-base sm:text-lg leading-tight break-words">${r.entidade?.nome ?? r.entidade?.identificador ?? '—'}</div>
                <div class="text-zinc-500 text-xs font-mono mt-0.5">${r.entidade?.identificador ?? ''}</div>
                ${emp ? `
                <div class="mt-2 flex flex-wrap gap-x-3 gap-y-0.5">
                    <span class="text-[10px] text-zinc-400">${emp.municipio ?? ''}</span>
                    ${emp.atividade ? `<span class="text-[10px] text-zinc-500">${emp.atividade.substring(0,40)}</span>` : ''}
                </div>
                <div class="mt-1.5 text-[11px] font-bold" style="color:${sitColor}">${emp.situacao ?? ''}</div>` : `
                <div class="mt-2 text-[11px] text-zinc-600 italic">Dados cadastrais não encontrados na BrasilAPI</div>`}
            </div>

            <!-- Score -->
            <div class="flex sm:flex-col items-center justify-between sm:justify-center rounded-xl p-4 border border-zinc-700/60 sm:min-w-[130px] gap-4 sm:gap-2" style="background:${scoreBg}">
                <div class="flex flex-col items-center">
                    <div class="text-[10px] text-zinc-500 uppercase font-bold mb-1 hidden sm:block">Score de Risco</div>
                    <svg class="w-16 h-16 sm:w-20 sm:h-20 -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#27272a" stroke-width="10"/>
                        <circle cx="50" cy="50" r="40" fill="none" stroke="${scoreColor}" stroke-width="10"
                                stroke-dasharray="${circunf.toFixed(1)}" stroke-dashoffset="${dash.toFixed(1)}"
                                stroke-linecap="round"/>
                    </svg>
                    <div style="margin-top:-46px;margin-bottom:28px;font-size:1.4rem;font-weight:900;color:${scoreColor}">${score}</div>
                </div>
                <div class="text-center">
                    <div class="text-sm sm:text-base font-bold" style="color:${scoreColor}">${nivel.emoji ?? ''} ${nivel.label ?? 'N/D'}</div>
                    <div class="text-[10px] text-zinc-500 mt-0.5 block sm:hidden">Score de Risco</div>
                </div>
            </div>
        </div>

        <!-- Stats Rápidos -->
        <div class="grid grid-cols-3 gap-2 mb-4">
            <div class="bg-zinc-800/40 rounded-xl p-2.5 sm:p-3 border border-zinc-700/50 text-center">
                <div class="text-lg sm:text-xl font-black text-white">${totalContratos}</div>
                <div class="text-[9px] text-zinc-500 uppercase mt-0.5">Contratos</div>
            </div>
            <div class="bg-zinc-800/40 rounded-xl p-2.5 sm:p-3 border border-zinc-700/50 text-center" style="${sancoesCount > 0 ? 'border-color:rgba(239,68,68,.35)' : ''}">
                <div class="text-lg sm:text-xl font-black" style="color:${sancoesCount > 0 ? '#f87171' : '#4ade80'}">${sancoesCount}</div>
                <div class="text-[9px] text-zinc-500 uppercase mt-0.5">Sanções</div>
            </div>
            <div class="bg-zinc-800/40 rounded-xl p-2.5 sm:p-3 border border-zinc-700/50 text-center">
                <div class="text-lg sm:text-xl font-black text-white">${totalLic}</div>
                <div class="text-[9px] text-zinc-500 uppercase mt-0.5">Licitações</div>
            </div>
        </div>

        <!-- Alertas ── ou badge verde -->
        ${alertas.length > 0 ? `
        <div class="mb-4 rounded-xl border border-red-500/30 bg-red-900/10 overflow-hidden">
            <div class="px-3 py-2 border-b border-red-500/20 flex items-center gap-2">
                <span class="text-xs font-bold text-red-400 uppercase">⚠️ Alertas Detectados</span>
                <span class="text-[9px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded-full font-bold ml-auto">${alertas.length}</span>
            </div>
            <div class="p-3 space-y-1.5">
                ${alertas.map(a => `<div class="text-xs sm:text-sm text-zinc-200 leading-snug">${a}</div>`).join('')}
            </div>
        </div>` : `
        <div class="mb-4 flex items-center gap-2 bg-green-900/20 border border-green-500/30 rounded-xl px-4 py-3">
            <span class="text-base">✅</span>
            <span class="text-green-400 text-sm font-bold">Nenhuma irregularidade identificada nas bases consultadas</span>
        </div>`}

        <!-- Dados da Empresa -->
        ${emp ? `
        <div class="mb-4">
            <div class="text-[10px] text-zinc-500 uppercase font-bold mb-2">🏢 Dados da Empresa</div>
            <div class="grid grid-cols-2 gap-2">
                ${[
                    ['Razão Social', emp.razao_social],
                    ['Situação',     emp.situacao],
                    ['Abertura',     emp.abertura],
                    ['Capital',      emp.capital_social ? 'R$\u00a0' + parseFloat(emp.capital_social).toLocaleString('pt-BR') : null],
                    ['Município',    emp.municipio],
                    ['Atividade',    emp.atividade ? emp.atividade.substring(0,50) : null],
                ].filter(([,v]) => v).map(([l,v]) => `
                    <div class="bg-zinc-800/40 rounded-lg p-2 border border-zinc-700/50">
                        <div class="text-[9px] text-zinc-500 uppercase font-bold">${l}</div>
                        <div class="text-xs text-white mt-0.5 leading-tight">${v}</div>
                    </div>`).join('')}
            </div>
            ${emp.socios?.length > 0 ? `
            <div class="mt-3">
                <div class="text-[10px] text-zinc-500 uppercase font-bold mb-1.5">Quadro Societário</div>
                <div class="flex flex-wrap gap-1.5">
                    ${emp.socios.map(s => `<span class="text-[10px] bg-zinc-800 border border-zinc-700 rounded-full px-2 py-0.5 text-zinc-300">${s.nome_socio ?? s.nome ?? ''}</span>`).join('')}
                </div>
            </div>` : ''}
        </div>` : ''}

        <!-- Parlamentares (Deputados + Senadores) -->
        ${(() => {
            const deps = r.dados?.deputados ?? [];
            if (!deps.length) return '';
            const fmtBRL = v => v > 0 ? 'R$\u00a0' + (+v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}) : null;
            return `<div class="mb-4">
                <div class="text-[10px] text-zinc-500 uppercase font-bold mb-2">👔 Mandato Parlamentar</div>
                <div class="space-y-2">
                ${deps.map(d => {
                    const tipo    = d.tipo ?? 'Parlamentar';
                    const isSen   = tipo.toLowerCase().includes('senador');
                    const foto    = d.urlFoto ? `<img src="${d.urlFoto}" class="w-12 h-14 object-cover rounded-lg border border-zinc-700 flex-shrink-0" onerror="this.style.display='none'">` : `<div class="w-12 h-14 bg-zinc-700 rounded-lg flex-shrink-0 flex items-center justify-center text-2xl">${isSen ? '🏛️' : '👔'}</div>`;
                    const partido = d.siglaPartido ?? '';
                    const uf      = d.siglaUf ?? '';
                    const status  = d.situacao ?? d.condicaoEleitoral ?? '';
                    const salario = fmtBRL(d.salarioConstitucional);
                    const ceap    = d.ceapTotalAno > 0 ? fmtBRL(d.ceapTotalAno) : null;
                    const ceapAno = d.ceapAno ?? '';
                    const nasc    = d.dataNascimento ?? '';
                    const nat     = d.municipioNascimento ? ` - ${d.municipioNascimento}/${d.ufNascimento ?? ''}` : '';
                    const escol   = d.escolaridade ?? '';
                    const fmtDate = s => s ? s.substring(0,7).split('-').reverse().join('/') : '';
                    const mandato = (d.mandatoInicio || d.mandatoFim) ? ` · 📅 ${fmtDate(d.mandatoInicio)}→${fmtDate(d.mandatoFim)}` : '';
                    const partic  = d.participacao && d.participacao !== 'Titular' ? ` · ${d.participacao}` : '';
                    const ceapTipos = d.ceapPorTipo ? Object.entries(d.ceapPorTipo).slice(0,3) : [];
                    return `<div class="bg-zinc-800/40 rounded-xl border border-zinc-700/50 hover:border-violet-500/40 transition overflow-hidden">
                        <div class="flex gap-3 p-3">
                            ${foto}
                            <div class="flex-1 min-w-0">
                                <div class="font-bold text-white text-sm leading-tight">${d.nome ?? '—'}</div>
                                <div class="flex flex-wrap gap-1.5 mt-1">
                                    <span class="text-[9px] bg-zinc-700/80 text-zinc-400 px-2 py-0.5 rounded-full">${tipo}</span>
                                    ${partido ? `<span class="text-[10px] bg-violet-900/40 text-violet-300 border border-violet-800/50 px-2 py-0.5 rounded-full font-bold">${partido}</span>` : ''}
                                    ${uf ? `<span class="text-[10px] bg-zinc-700/60 text-zinc-300 px-2 py-0.5 rounded-full font-bold">${uf}</span>` : ''}
                                    ${status ? `<span class="text-[10px] bg-zinc-700/60 text-zinc-400 px-2 py-0.5 rounded-full">${status}</span>` : ''}
                                </div>
                                ${d.email ? `<div class="text-[10px] text-zinc-500 mt-1 truncate">📧 ${d.email}</div>` : ''}
                                ${nasc || escol || mandato ? `<div class="text-[10px] text-zinc-600 mt-0.5">${nasc ? '🎂 ' + nasc : ''}${nat}${escol ? ' · 🎓 ' + escol : ''}${mandato}${partic}</div>` : ''}
                            </div>
                            <button onclick="window.customSwitchTab('${isSen ? 'senadores' : 'politicos'}');document.getElementById('osintModal')?.remove();" class="text-[10px] bg-zinc-700 hover:bg-violet-700 text-zinc-300 hover:text-white px-2 py-1 rounded-lg transition flex-shrink-0 self-start">Ver ↗</button>
                        </div>
                        ${salario || ceap ? `
                        <div class="border-t border-zinc-700/50 px-3 py-2 flex flex-wrap gap-3">
                            ${salario ? `<div>
                                <div class="text-[9px] text-zinc-500 uppercase font-bold">Subsídio Constitucional</div>
                                <div class="text-emerald-400 font-black text-sm">${salario}<span class="text-[9px] text-zinc-600 font-normal">/mês</span></div>
                            </div>` : ''}
                            ${ceap ? `<div>
                                <div class="text-[9px] text-zinc-500 uppercase font-bold">CEAP Gasto em ${ceapAno}</div>
                                <div class="text-amber-400 font-black text-sm">${ceap}</div>
                            </div>` : ''}
                        </div>` : ''}
                        ${ceapTipos.length ? `
                        <div class="border-t border-zinc-700/30 px-3 py-2">
                            <div class="text-[9px] text-zinc-500 uppercase font-bold mb-1">Principais Categorias de Gasto (CEAP)</div>
                            <div class="space-y-1">
                            ${ceapTipos.map(([tipo, val]) => `
                                <div class="flex justify-between items-center gap-2">
                                    <span class="text-[10px] text-zinc-400 truncate flex-1">${tipo}</span>
                                    <span class="text-[10px] text-amber-400 font-bold flex-shrink-0">${fmtBRL(val)}</span>
                                </div>`).join('')}
                            </div>
                        </div>` : ''}
                    </div>`;
                }).join('')}
                </div>
            </div>`;
        })()}

        <!-- Servidores Públicos Federais -->
        ${(() => {
            const servs = r.dados?.servidores ?? [];
            if (!servs.length) return '';
            return `<div class="mb-4">
                <div class="text-[10px] text-zinc-500 uppercase font-bold mb-2">🏛️ Servidor Público Federal</div>
                <div class="space-y-2">
                ${servs.map(s => {
                    const servData = s.servidor || s;
                    const pessoa   = servData.pessoa || servData;
                    
                    const cargo    = servData.servidorInativoPensionista?.descricaoCargo ?? servData.descricaoCargo ?? s.cargo ?? 'Cargo não informado';
                    const orgao    = servData.orgaoExercicio?.nome ?? servData.orgaoLotacao?.nome ?? s.uorg_lotacao ?? 'Órgão não informado';
                    const admissao = s.dataIngressoCargofuncao ?? s.dataIngressoOrgao ?? s.data_ingresso_cargofuncao ?? '';
                    
                    const rawBruto = s.remuneracaoBasicaBruta ?? s.remuneracao_basica_bruta_rs ?? 0;
                    const rawLiq   = s.remuneracaoAposDeducoes ?? s.remuneracao_liquida ?? 0;
                    
                    const parseVal = (v) => {
                        if (typeof v === 'number') return v;
                        if (typeof v === 'string') return parseFloat(v.replace(/\./g, '').replace(',', '.')) || 0;
                        return 0;
                    };
                    
                    const salBruto = parseVal(rawBruto);
                    const salLiq = parseVal(rawLiq);
                    
                    const fmt = (v) => v > 0 ? 'R$\u00a0' + v.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}) : '—';
                    return `<div class="bg-zinc-800/40 rounded-xl p-3 border border-zinc-700/50">
                        <div class="flex flex-col sm:flex-row justify-between gap-2">
                            <div class="flex-1 min-w-0">
                                <div class="font-bold text-white text-sm leading-tight mb-1">${pessoa.nome ?? '—'}</div>
                                <div class="text-[10px] text-violet-300 font-bold uppercase mb-0.5">${cargo}</div>
                                <div class="text-[10px] text-zinc-400">🏛️ ${orgao}</div>
                                ${pessoa.cpfFormatado ? `<div class="text-[10px] text-zinc-500 mt-0.5">CPF: ${pessoa.cpfFormatado}</div>` : ''}
                                ${admissao ? `<div class="text-[10px] text-zinc-500 mt-0.5">📅 Admissão: ${admissao}</div>` : ''}
                            </div>
                            ${salBruto > 0 ? `<div class="text-right flex-shrink-0">
                                <div class="text-[9px] text-zinc-500 uppercase">Salário Bruto</div>
                                <div class="text-emerald-400 font-black text-base">${fmt(salBruto)}</div>
                                ${salLiq > 0 ? `<div class="text-[10px] text-zinc-400 mt-0.5">Líquido: ${fmt(salLiq)}</div>` : ''}
                            </div>` : ''}
                        </div>
                    </div>`;
                }).join('')}
                </div>
            </div>`;
        })()}

        <!-- Contratos Recentes (se houver) -->
        ${(() => {
            const cts = r.dados?.contratos ?? [];
            if (!cts.length) return '';
            const fmt = (v) => {
                const n = window.parsePtBrFloat ? window.parsePtBrFloat(v ?? 0) : parseFloat(v ?? 0);
                return n > 0 ? 'R$\u00a0' + n.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}) : '—';
            };
            return `<div class="mb-4">
                <div class="text-[10px] text-zinc-500 uppercase font-bold mb-2">📄 Contratos Federais</div>
                <div class="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                ${cts.slice(0,5).map(c => {
                    const obj    = (c.objeto ?? c.compra?.objeto ?? 'Sem descrição').substring(0,80);
                    const orgao  = c.unidadeGestora?.orgaoSuperior?.nome ?? c.unidadeGestora?.nome ?? 'Órgão não informado';
                    const val    = fmt(c.valorInicialCompra ?? c.valorFinalCompra);
                    const dt     = c.dataAssinatura ?? c.dataInicioVigencia ?? '';
                    return `<div class="flex justify-between gap-2 bg-zinc-800/30 rounded-lg px-3 py-2 border border-zinc-700/40 text-xs">
                        <div class="flex-1 min-w-0">
                            <div class="text-white leading-tight truncate">${obj}</div>
                            <div class="text-zinc-500 text-[10px] mt-0.5">${orgao}${dt ? ' · ' + dt : ''}</div>
                        </div>
                        <div class="text-emerald-400 font-bold flex-shrink-0">${val}</div>
                    </div>`;
                }).join('')}
                </div>
            </div>`;
        })()}

        <!-- Notícias Recentes -->
        ${(() => {
            const news = r.dados?.noticias ?? [];
            if (!news.length) return '';
            return `<div class="mb-4">
                <div class="text-[10px] text-zinc-500 uppercase font-bold mb-2">📰 Notícias Recentes</div>
                <div class="space-y-1.5">
                ${news.map(n => `
                    <a href="${n.link}" target="_blank" rel="noopener" class="flex items-start gap-2 bg-zinc-800/30 rounded-lg px-3 py-2 border border-zinc-700/40 hover:border-violet-500/40 transition group cursor-pointer block">
                        <div class="flex-1 min-w-0">
                            <div class="text-zinc-200 text-xs leading-snug group-hover:text-white transition line-clamp-2">${n.titulo}</div>
                            <div class="flex gap-2 mt-0.5">
                                ${n.fonte ? `<span class="text-[10px] text-violet-400 font-bold">${n.fonte}</span>` : ''}
                                ${n.data  ? `<span class="text-[10px] text-zinc-600">${n.data}</span>`  : ''}
                            </div>
                        </div>
                        <span class="text-zinc-600 group-hover:text-zinc-400 text-xs flex-shrink-0 mt-0.5">↗</span>
                    </a>`).join('')}
                </div>
            </div>`;
        })()}

        <!-- Disclaimer -->
        <div class="text-[10px] text-zinc-600 border-t border-zinc-800/80 pt-3 leading-relaxed flex flex-wrap gap-x-2">
            <span>${r.meta?.disclaimer ?? 'Dados de bases públicas governamentais.'}</span>
            <span class="text-zinc-700">Consultado em ${r.meta?.data_consulta ?? '—'}</span>
        </div>
    `;
}

// Alias para compatibilidade com chamadas legadas do dropdown global
function renderOsintModal(r) { renderIntelModal(r); }

function openLocalTransfers(uf, cityIbge) {
    window.customSwitchTab('outros');
    setTimeout(() => {
        const selUf = document.getElementById('sel-transf-uf');
        if (selUf) {
            selUf.value = uf;
            selUf.dispatchEvent(new Event('change'));
            setTimeout(() => {
                const selCity = document.getElementById('sel-transf-city');
                if (selCity) selCity.value = cityIbge;
                if(typeof loadFederalTransfers === 'function') loadFederalTransfers(1);
            }, 800);
        }
    }, 400);
}

function openLocalDeputies(uf) {
    window.customSwitchTab('politicos');
    setTimeout(() => {
        const sel = document.getElementById('stateSelect');
        if (sel) {
            sel.value = uf;
            if(typeof loadDeputies === 'function') loadDeputies();
        }
    }, 400);
}

function openLocalElections(uf) {
    window.customSwitchTab('eleicoes');
    setTimeout(() => {
        const sel = document.getElementById('tseState');
        if (sel) {
            sel.value = uf;
            if(typeof searchCandidates === 'function') searchCandidates();
        }
    }, 400);
}
</script>
