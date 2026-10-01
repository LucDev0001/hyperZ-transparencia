<!-- Conteúdo: Minha Cidade — Fiscal Municipal Fiorilli -->
<div id="content-municipio" class="hidden animate-fade-in pb-12">

    <!-- Cabeçalho -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h2 class="text-2xl font-black text-white">🏘️ Minha Cidade</h2>
            <p class="text-zinc-400 text-sm mt-1">Hackeie as contas da sua prefeitura em tempo real — exponha gastos, contratos secretos e licitações.</p>
        </div>
    </div>

    <!-- Aviso de Disponibilidade -->
    <div class="mb-6 p-4 bg-amber-900/20 border border-amber-500/30 rounded-2xl flex gap-4 items-start animate-pulse">
        <div class="text-amber-500 mt-1">
            <i class="fa-solid fa-triangle-exclamation text-xl"></i>
        </div>
        <div class="text-sm">
            <h4 class="text-amber-400 font-bold mb-1">Nota sobre a disponibilidade dos dados:</h4>
            <p class="text-amber-200/80 leading-relaxed">
                Os dados são capturados em tempo real dos portais oficiais. Se a busca falhar ou demorar, pode ser por: 
                <span class="font-bold text-amber-300">(1)</span> O servidor da prefeitura está instável; 
                <span class="font-bold text-amber-300">(2)</span> O município utiliza um sistema não compatível; 
                <span class="font-bold text-amber-300">(3)</span> Bloqueios temporários do portal governamental.
            </p>
        </div>
    </div>

    <!-- Documentação da ferramenta -->
    <div class="mb-6">
        <button onclick="(function(btn){var d=document.getElementById('mun-doc-body');var open=d.classList.toggle('hidden');btn.querySelector('svg').style.transform=open?'':'rotate(180deg)';})(this)"
                class="w-full flex items-center justify-between px-5 py-3 glass-panel rounded-2xl text-left hover:border-zinc-600 transition border border-zinc-700">
            <span class="flex items-center gap-2 text-sm font-bold text-zinc-300">
                <span class="text-lg">ℹ️</span> Como funciona esta ferramenta? — Clique para expandir
            </span>
            <svg style="transform:rotate(180deg);transition:transform 0.2s" class="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </button>
        <div id="mun-doc-body" class="hidden mt-2 glass-panel rounded-2xl p-6 border border-zinc-700 text-sm text-zinc-400 leading-relaxed">

            <h3 class="text-white font-black text-base mb-3">🏘️ Minha Cidade — Fiscal Municipal</h3>
            <p class="mb-4">Esta ferramenta acessa diretamente os <strong class="text-white">portais oficiais de transparência das prefeituras</strong> brasileiras que utilizam o sistema <strong class="text-green-400">Fiorilli / MS Gestão Pública</strong>. Os dados são lidos em tempo real do portal do município — não são armazenados ou alterados por este sistema.</p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                    <h4 class="text-white font-bold mb-2">📊 O que você pode ver</h4>
                    <ul class="space-y-1.5 text-zinc-400">
                        <li class="flex gap-2"><span class="text-violet-400 shrink-0">🏛️</span><span><strong class="text-zinc-300">Secretarias:</strong> quanto cada órgão gastou vs. o que foi orçado</span></li>
                        <li class="flex gap-2"><span class="text-violet-400 shrink-0">🏭</span><span><strong class="text-zinc-300">Fornecedores:</strong> empresas e pessoas que receberam dinheiro público — com CNPJ, valor empenhado, liquidado e pago</span></li>
                        <li class="flex gap-2"><span class="text-violet-400 shrink-0">📄</span><span><strong class="text-zinc-300">Contratos:</strong> todos os contratos firmados, objeto completo, vigência, responsáveis e aditamentos</span></li>
                        <li class="flex gap-2"><span class="text-violet-400 shrink-0">📋</span><span><strong class="text-zinc-300">Licitações:</strong> processos de compra — modalidade, vencedor, base legal de dispensas</span></li>
                        <li class="flex gap-2"><span class="text-violet-400 shrink-0">📈</span><span><strong class="text-zinc-300">Receitas:</strong> arrecadação prevista vs. realizada por fonte de renda</span></li>
                        <li class="flex gap-2"><span class="text-violet-400 shrink-0">👥</span><span><strong class="text-zinc-300">Servidores:</strong> servidores públicos municipais, cargos e salários</span></li>
                        <li class="flex gap-2"><span class="text-violet-400 shrink-0">📦</span><span><strong class="text-zinc-300">O que foi contratado:</strong> pesquise contratos por fornecedor ou objeto</span></li>
                        <li class="flex gap-2"><span class="text-violet-400 shrink-0">🛒</span><span><strong class="text-zinc-300">Itens Comprados:</strong> busca item a item nos empenhos — ex: "cadeira", "computador", "combustível"</span></li>
                    </ul>
                </div>
                <div>
                    <h4 class="text-white font-bold mb-2">⚙️ Como a busca funciona</h4>
                    <ol class="space-y-2 text-zinc-400">
                        <li class="flex gap-2"><span class="bg-zinc-700 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shrink-0">1</span><span>Você informa o nome do município, UF e ano desejado</span></li>
                        <li class="flex gap-2"><span class="bg-zinc-700 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shrink-0">2</span><span>O sistema tenta localizar automaticamente o portal Fiorilli do município (vários domínios são testados)</span></li>
                        <li class="flex gap-2"><span class="bg-zinc-700 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shrink-0">3</span><span>Os dados são buscados via proxy seguro — o portal municipal nunca é exposto diretamente ao navegador</span></li>
                        <li class="flex gap-2"><span class="bg-zinc-700 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shrink-0">4</span><span>Se o ano selecionado não tiver dados (ex: 2026 com apenas 3 meses), o sistema busca automaticamente o ano anterior e avisa</span></li>
                    </ol>

                    <h4 class="text-white font-bold mt-4 mb-2">⚠️ Limitações importantes</h4>
                    <ul class="space-y-1.5 text-zinc-500 text-xs">
                        <li>• Cobertura apenas para municípios que usam o sistema Fiorilli/MS Gestão Pública</li>
                        <li>• O filtro de "Ano" reflete o <strong class="text-zinc-400">exercício de registro</strong>, não necessariamente a vigência do contrato</li>
                        <li>• Alguns portais municipais retornam erro 500 em determinados endpoints — o sistema informa quando isso ocorre</li>
                        <li>• Dados em cache por até 12h para evitar sobrecarga nos portais municipais</li>
                        <li>• CPFs de servidores são protegidos por Lei Geral de Proteção de Dados (LGPD)</li>
                    </ul>
                </div>
            </div>

            <div class="bg-zinc-800/40 rounded-xl p-4 text-xs border border-zinc-700">
                <div class="text-zinc-300 font-bold mb-1">📡 Fonte dos dados</div>
                <p class="text-zinc-500">Todos os dados são provenientes diretamente dos portais de transparência municipais, conforme exigido pela <strong class="text-zinc-400">Lei de Acesso à Informação (Lei nº 12.527/2011)</strong> e pela <strong class="text-zinc-400">Lei de Responsabilidade Fiscal (LC 101/2000)</strong>. Cada prefeitura é responsável pela exatidão e atualização das informações em seu portal.</p>
            </div>
        </div>
    </div>

    <!-- Formulário de busca -->
    <div class="glass-panel p-6 rounded-2xl mb-6 border-t-4 border-t-green-500">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
                <label class="text-xs font-bold text-zinc-500 uppercase">Estado (UF)</label>
                <select id="mun-uf" onchange="window._atualizarCidades(this.value)" class="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-3 py-2 mt-1 outline-none focus:border-green-500 text-sm">
                    <option value="" disabled selected>Escolha...</option>
                    <option value="ac">AC</option><option value="al">AL</option><option value="ap">AP</option>
                    <option value="am">AM</option><option value="ba">BA</option><option value="ce">CE</option>
                    <option value="df">DF</option><option value="es">ES</option><option value="go">GO</option>
                    <option value="ma">MA</option><option value="mt">MT</option><option value="ms">MS</option>
                    <option value="mg">MG</option><option value="pa">PA</option><option value="pb">PB</option>
                    <option value="pr">PR</option><option value="pe">PE</option><option value="pi">PI</option>
                    <option value="rj">RJ</option><option value="rn">RN</option><option value="rs">RS</option>
                    <option value="ro">RO</option><option value="rr">RR</option><option value="sc">SC</option>
                    <option value="sp">SP</option><option value="se">SE</option><option value="to">TO</option>
                </select>
            </div>
            <div class="md:col-span-2">
                <label class="text-xs font-bold text-zinc-500 uppercase">Nome do Município</label>
                <div class="relative">
                    <input type="text" id="mun-cidade" list="mun-cidades-sugestoes" placeholder="Selecione o estado primeiro..."
                           class="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-2 mt-1 outline-none focus:border-green-500"
                           onkeydown="if(event.key==='Enter') buscarMunicipio()">
                    <datalist id="mun-cidades-sugestoes"></datalist>
                </div>
                <p id="mun-cidades-status" class="text-[10px] text-zinc-500 mt-1 ml-1"></p>
            </div>
            <div>
                <label class="text-xs font-bold text-zinc-500 uppercase">Ano</label>
                <select id="mun-ano" class="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-3 py-2 mt-1 outline-none focus:border-green-500 text-sm">
                    <?php for ($y = date('Y'); $y >= 2018; $y--): ?>
                    <option value="<?= $y ?>" <?= $y == date('Y') ? 'selected' : '' ?>><?= $y ?></option>
                    <?php endfor; ?>
                </select>
            </div>
        </div>
        <div class="flex gap-3 mt-4">
            <button onclick="buscarMunicipio()"
                    class="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-xl transition shadow-lg shadow-green-900/30 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                Buscar Portal
            </button>
        </div>
        <!-- Histórico de buscas recentes -->
        <div id="mun-historico" class="mt-3 hidden">
            <p class="text-zinc-600 text-[10px] uppercase font-bold mb-1.5">Buscas recentes:</p>
            <div id="mun-historico-chips" class="flex flex-wrap gap-2"></div>
        </div>
        <p class="text-zinc-600 text-[11px] mt-3">Fonte: Portais municipais de transparência (sistema Fiorilli / MS Gestão Pública). Cobertura em todo o Brasil.</p>
    </div>

    <!-- Progresso de carregamento -->
    <div id="mun-progresso" class="hidden mb-4 glass-panel rounded-xl px-4 py-3 border border-zinc-700">
        <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-zinc-400" id="mun-prog-label">Carregando dados...</span>
            <span class="text-xs font-mono text-zinc-500" id="mun-prog-count">0 / 6</span>
        </div>
        <div class="w-full bg-zinc-800 rounded-full h-1.5">
            <div id="mun-prog-bar" class="h-1.5 rounded-full bg-green-500 transition-all duration-300" style="width:0%"></div>
        </div>
    </div>

    <!-- Modal CNPJ -->
    <div id="mun-cnpj-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4" style="background:rgba(0,0,0,0.75)">
        <div class="glass-panel rounded-2xl p-6 border border-zinc-700 w-full max-w-md relative">
            <button onclick="document.getElementById('mun-cnpj-modal').classList.add('hidden')"
                    class="absolute top-3 right-3 text-zinc-500 hover:text-white text-xl leading-none">&times;</button>
            <div id="mun-cnpj-body">Carregando...</div>
        </div>
    </div>

    <!-- Status da busca -->
    <div id="mun-status" class="hidden mb-4 p-4 rounded-xl border text-sm font-medium"></div>

    <!-- Dashboard (oculto até encontrar portal) -->
    <div id="mun-dashboard" class="hidden">

        <!-- Cabeçalho da cidade encontrada -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-2">
            <div>
                <h3 id="mun-titulo" class="text-xl font-black text-white"></h3>
                <p id="mun-fonte" class="text-xs text-zinc-500 mt-0.5"></p>
            </div>
            <span class="text-xs bg-green-900/40 text-green-400 border border-green-500/30 px-3 py-1 rounded-full font-bold">Portal Ativo</span>
        </div>

        <!-- Sub-tabs de navegação -->
        <div class="flex gap-1 overflow-x-auto pb-1 mb-5 scrollbar-hide">
            <button id="mun-btn-secretarias"  onclick="munAba('secretarias')"
                    class="px-3 py-1.5 text-xs font-bold rounded-lg bg-violet-600 text-white whitespace-nowrap">
                🏛️ Secretarias
            </button>
            <button id="mun-btn-fornecedores" onclick="munAba('fornecedores')"
                    class="px-3 py-1.5 text-xs font-bold rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition whitespace-nowrap">
                🏭 Fornecedores
            </button>
            <button id="mun-btn-contratos"    onclick="munAba('contratos')"
                    class="px-3 py-1.5 text-xs font-bold rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition whitespace-nowrap">
                📄 Contratos
            </button>
            <button id="mun-btn-licitacoes"   onclick="munAba('licitacoes')"
                    class="px-3 py-1.5 text-xs font-bold rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition whitespace-nowrap">
                📋 Licitações
            </button>
            <button id="mun-btn-receitas"     onclick="munAba('receitas')"
                    class="px-3 py-1.5 text-xs font-bold rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition whitespace-nowrap">
                📈 Receitas
            </button>
            <button id="mun-btn-servidores"   onclick="munAba('servidores')"
                    class="px-3 py-1.5 text-xs font-bold rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition whitespace-nowrap">
                👥 Servidores
            </button>
            <button id="mun-btn-empenhos"     onclick="munAba('empenhos'); window._carregarEmpenhos('')"
                    class="px-3 py-1.5 text-xs font-bold rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition whitespace-nowrap">
                📦 O que foi contratado
            </button>
            <button id="mun-btn-itens"        onclick="munAba('itens'); window._iniciarItens()"
                    class="px-3 py-1.5 text-xs font-bold rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition whitespace-nowrap">
                🛒 Itens Comprados
            </button>
        </div>

        <!-- Sub-tab: Secretarias / Gastos por Órgão -->
        <div id="mun-sec-secretarias">
            <div class="glass-panel p-5 rounded-2xl">
                <h4 class="text-base font-black text-white mb-1">💸 Onde o dinheiro vai — por Secretaria</h4>
                <p class="text-zinc-500 text-xs mb-4">Total gasto confirmado por secretaria. Clique em "Ver contratos" para investigar.</p>
                <div class="space-y-3">
                    <div class="text-center text-zinc-600 py-8 text-sm animate-pulse">Carregando gastos...</div>
                </div>
            </div>
        </div>

        <!-- Sub-tab: Fornecedores -->
        <div id="mun-sec-fornecedores" class="hidden">
            <div class="glass-panel p-5 rounded-2xl">
                <h4 class="text-base font-black text-white mb-1">🏭 Quem recebe o dinheiro público</h4>
                <p class="text-zinc-500 text-xs mb-4">Empresas e pessoas que mais receberam da prefeitura. Clique em "Investigar" para cruzar com registros de corrupção.</p>
                <div class="space-y-2">
                    <div class="text-center text-zinc-600 py-8 text-sm animate-pulse">Carregando fornecedores...</div>
                </div>
            </div>
        </div>

        <!-- Sub-tab: Contratos -->
        <div id="mun-sec-contratos" class="hidden">
            <div class="glass-panel p-5 rounded-2xl">
                <h4 class="text-base font-black text-white mb-1">📄 Contratos firmados pela Prefeitura</h4>
                <p class="text-zinc-500 text-xs mb-4">Contratos em vigor. Contratos sem licitação (dispensa/inexigibilidade) aparecem destacados em amarelo.</p>
                <div class="space-y-3">
                    <div class="text-center text-zinc-600 py-8 text-sm animate-pulse">Carregando contratos...</div>
                </div>
            </div>
        </div>

        <!-- Sub-tab: Licitações -->
        <div id="mun-sec-licitacoes" class="hidden">
            <div class="glass-panel p-5 rounded-2xl">
                <h4 class="text-base font-black text-white mb-1">📋 Processos de Licitação</h4>
                <p class="text-zinc-500 text-xs mb-4">Licitações abertas e encerradas. Processos por dispensa ou inexigibilidade merecem atenção extra.</p>
                <div class="space-y-3">
                    <div class="text-center text-zinc-600 py-8 text-sm animate-pulse">Carregando licitações...</div>
                </div>
            </div>
        </div>

        <!-- Sub-tab: Receitas -->
        <div id="mun-sec-receitas" class="hidden">
            <div class="glass-panel p-5 rounded-2xl">
                <h4 class="text-base font-black text-white mb-1">📈 Receitas do Município</h4>
                <p class="text-zinc-500 text-xs mb-4">Quanto a prefeitura previu arrecadar versus o que efetivamente entrou no caixa.</p>
                <div class="space-y-3">
                    <div class="text-center text-zinc-600 py-8 text-sm animate-pulse">Carregando receitas...</div>
                </div>
            </div>
        </div>

        <!-- Sub-tab: Servidores -->
        <div id="mun-sec-servidores" class="hidden">
            <div class="glass-panel p-5 rounded-2xl">
                <h4 class="text-base font-black text-white mb-1">👥 Servidores Públicos Municipais</h4>
                <p class="text-zinc-500 text-xs mb-4">Funcionários da prefeitura, cargos e salários. Ordenado do maior para o menor.</p>
                <div class="space-y-2">
                    <div class="text-center text-zinc-600 py-8 text-sm animate-pulse">Carregando servidores...</div>
                </div>
            </div>
        </div>

        <!-- Sub-tab: Empenhos / O que foi comprado -->
        <div id="mun-sec-empenhos" class="hidden">
            <div class="glass-panel p-5 rounded-2xl">
                <h4 class="text-base font-black text-white mb-1">📦 O que foi contratado / comprado</h4>
                <p class="text-zinc-500 text-xs mb-4">Contratos com descrição completa do objeto — filtre por fornecedor ou pelo que foi comprado.</p>
                <div class="space-y-2">
                    <div class="text-center text-zinc-600 py-8 text-sm">Clique na aba para carregar.</div>
                </div>
            </div>
        </div>

        <!-- Sub-tab: Itens Comprados -->
        <div id="mun-sec-itens" class="hidden">
            <div class="glass-panel p-5 rounded-2xl">
                <h4 class="text-base font-black text-white mb-1">🛒 Itens Comprados pela Prefeitura</h4>
                <p class="text-zinc-500 text-xs mb-4">Pesquise o que foi comprado — equipamentos, materiais, medicamentos, combustível etc. O sistema varre os empenhos e extrai cada item com quantidade, preço unitário e valor total.</p>
                <div id="mun-itens-conteudo" class="text-center text-zinc-500 text-sm py-8">
                    Clique na aba para carregar o formulário de pesquisa.
                </div>
            </div>
        </div>

    </div><!-- /mun-dashboard -->

</div>
