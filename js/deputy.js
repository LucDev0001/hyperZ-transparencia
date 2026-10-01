//transparency/js/deputy.js

let currentExpensesData = [];
let expensesChartInstance = null;
let expensesTypeChartInstance = null;
let votesChartInstance = null;
let mapInstance = null;
let mapMarkers = [];
let mapLastDeputyId = null;
let analysisChartInstance = null;
let currentDeputy = null;

async function openDeputyDetails(id) {
  if (typeof toggleSpinner === "function") toggleSpinner(true);
  try {
    const json = await api.camara(`deputados/${id}`);
    const d = json.dados;
    currentDeputy = d;
    window._currentDeputy = d;
    const lastStatus = d.ultimoStatus;

    // Processar Redes Sociais
    let socialHtml = '';
    const socials = [];
    
    const icons = {
        facebook: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.962.925-1.962 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
        twitter: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>',
        instagram: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
        youtube: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
        website: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>'
    };

    if(d.urlWebsite) socials.push({url: d.urlWebsite, icon: icons.website, title: 'Website', color: 'hover:text-violet-400'});
    if(d.redeSocial && Array.isArray(d.redeSocial)) {
        d.redeSocial.forEach(url => {
            let icon = icons.website;
            let title = 'Rede Social';
            let color = 'hover:text-white';

            if(url.includes('facebook')) { icon = icons.facebook; title = 'Facebook'; color = 'hover:text-blue-500'; }
            else if(url.includes('twitter') || url.includes('x.com')) { icon = icons.twitter; title = 'Twitter/X'; color = 'hover:text-sky-400'; }
            else if(url.includes('instagram')) { icon = icons.instagram; title = 'Instagram'; color = 'hover:text-pink-500'; }
            else if(url.includes('youtube')) { icon = icons.youtube; title = 'YouTube'; color = 'hover:text-red-500'; }
            
            socials.push({url, icon, title, color});
        });
    }
    if(socials.length > 0) {
        socialHtml = `<div class="flex gap-3 mt-4 flex-wrap justify-center">` + 
            socials.map(s => `<a href="${s.url}" target="_blank" title="${s.title}" class="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center text-zinc-400 ${s.color} transition shadow-lg border border-zinc-700">${s.icon}</a>`).join('') +
            `</div>`;
    }

    const currentYear = new Date().getFullYear();
    let yearOptions = "";
    for (let i = currentYear; i >= 2015; i--) {
      yearOptions += `<option value="${i}">${i}</option>`;
    }
    let dayOptions = '<option value="">Todos</option>';
    for (let i = 1; i <= 31; i++) {
      dayOptions += `<option value="${i}">${i}</option>`;
    }

    // Reset map state — the #map div is about to be destroyed by innerHTML replacement
    if (mapInstance) {
      try { mapInstance.remove(); } catch(e) {}
      mapInstance = null;
    }
    mapMarkers = [];
    mapLastDeputyId = null;

    const content = document.getElementById("deputyContent");
    content.innerHTML = `
            <div class="flex flex-col items-center mb-6 px-4">
                <div class="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-zinc-800 shadow-lg mb-3">
                    <img src="${lastStatus.urlFoto || ''}" onerror="this.src=''" class="w-full h-full object-cover">
                </div>
                <h2 class="text-xl md:text-2xl font-bold text-white text-center leading-tight">${lastStatus.nomeEleitoral}</h2>
                <div class="bg-violet-600 text-white px-4 py-1 rounded-full text-[10px] font-bold mt-2 uppercase tracking-wide">
                    ${lastStatus.siglaPartido} - ${lastStatus.siglaUf}
                </div>
                ${socialHtml}
                <!-- Botão Compartilhar -->
                <button onclick="openShareDeputyModal(${id})" class="mt-4 flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 hover:border-violet-500 text-zinc-300 hover:text-white text-[10px] font-black px-5 py-2 rounded-full transition uppercase tracking-wider">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                    Compartilhar raio-x
                </button>
            </div>

            <!-- GAVETA DE FERRAMENTAS (Grid de Botões) -->
            <div id="deputyToolGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-8 px-1">
                <button onclick="switchDeputyTab('sobre', ${id})" id="dtab-sobre" class="flex flex-col items-center justify-center p-3 rounded-xl bg-violet-600 text-white transition-all shadow-lg active:scale-95 border border-white/10 group">
                    <span class="text-xl mb-1 group-hover:scale-110 transition-transform">👤</span>
                    <span class="text-[9px] font-black uppercase tracking-widest text-center">Sobre</span>
                </button>
                <button onclick="switchDeputyTab('carreira', ${id})" id="dtab-carreira" class="flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all shadow-lg active:scale-95 border border-white/5 group">
                    <span class="text-xl mb-1 group-hover:scale-110 transition-transform">💼</span>
                    <span class="text-[9px] font-black uppercase tracking-widest text-center">Carreira</span>
                </button>
                <button onclick="switchDeputyTab('despesas', ${id})" id="dtab-despesas" class="flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all shadow-lg active:scale-95 border border-white/5 group">
                    <span class="text-xl mb-1 group-hover:scale-110 transition-transform">💰</span>
                    <span class="text-[9px] font-black uppercase tracking-widest text-center">Gastos</span>
                </button>
                <button onclick="switchDeputyTab('analise', ${id})" id="dtab-analise" class="flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all shadow-lg active:scale-95 border border-white/5 group">
                    <span class="text-xl mb-1 group-hover:scale-110 transition-transform">🔍</span>
                    <span class="text-[9px] font-black uppercase tracking-widest text-center">Análise</span>
                </button>
                <button onclick="switchDeputyTab('mapa', ${id})" id="dtab-mapa" class="flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all shadow-lg active:scale-95 border border-white/5 group">
                    <span class="text-xl mb-1 group-hover:scale-110 transition-transform">🗺️</span>
                    <span class="text-[9px] font-black uppercase tracking-widest text-center">Mapa</span>
                </button>
                <button onclick="switchDeputyTab('emendas', ${id})" id="dtab-emendas" class="flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all shadow-lg active:scale-95 border border-white/5 group">
                    <span class="text-xl mb-1 group-hover:scale-110 transition-transform">🏗️</span>
                    <span class="text-[9px] font-black uppercase tracking-widest text-center">Emendas</span>
                </button>
                <button onclick="switchDeputyTab('projetos', ${id})" id="dtab-projetos" class="flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all shadow-lg active:scale-95 border border-white/5 group">
                    <span class="text-xl mb-1 group-hover:scale-110 transition-transform">📜</span>
                    <span class="text-[9px] font-black uppercase tracking-widest text-center">Projetos</span>
                </button>
                <button onclick="switchDeputyTab('discursos', ${id})" id="dtab-discursos" class="flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all shadow-lg active:scale-95 border border-white/5 group">
                    <span class="text-xl mb-1 group-hover:scale-110 transition-transform">🎤</span>
                    <span class="text-[9px] font-black uppercase tracking-widest text-center">Discursos</span>
                </button>
                <button onclick="switchDeputyTab('votacoes', ${id})" id="dtab-votacoes" class="flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all shadow-lg active:scale-95 border border-white/5 group">
                    <span class="text-xl mb-1 group-hover:scale-110 transition-transform">🗳️</span>
                    <span class="text-[9px] font-black uppercase tracking-widest text-center">Votações</span>
                </button>
                <button onclick="switchDeputyTab('noticias', ${id})" id="dtab-noticias" class="flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all shadow-lg active:scale-95 border border-white/5 group">
                    <span class="text-xl mb-1 group-hover:scale-110 transition-transform">📰</span>
                    <span class="text-[9px] font-black uppercase tracking-widest text-center">Notícias</span>
                </button>
            </div>

            <div id="deputyShowToolsBtn" class="hidden mb-6 px-1">
                <button onclick="toggleDeputyTools(true)" class="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-zinc-800/50 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all border border-white/5 shadow-lg group">
                    <span class="text-xl group-hover:rotate-12 transition-transform">🛠️</span>
                    <span class="text-[10px] font-black uppercase tracking-[0.3em]">Exibir Gaveta de Ferramentas</span>
                </button>
            </div>

            <!-- Conteúdo das Abas -->
            <div id="dcontent-sobre" class="space-y-4 animate-fade-in px-1">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-zinc-800/50 p-6 rounded-2xl border border-white/5 shadow-xl">
                        <h3 class="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] mb-4">Dados Pessoais</h3>
                        <div class="space-y-3">
                            <p class="text-white text-sm flex justify-between border-b border-white/5 pb-2"><strong>Nome Civil:</strong> <span class="text-zinc-400">${d.nomeCivil}</span></p>
                            <p class="text-white text-sm flex justify-between border-b border-white/5 pb-2"><strong>Nascimento:</strong> <span class="text-zinc-400">${window.formatDate(d.dataNascimento)}</span></p>
                            <p class="text-white text-sm flex justify-between border-b border-white/5 pb-2"><strong>Naturalidade:</strong> <span class="text-zinc-400">${d.municipioNascimento} - ${d.ufNascimento}</span></p>
                            <p class="text-white text-sm flex justify-between"><strong>Escolaridade:</strong> <span class="text-zinc-400">${d.escolaridade || "Não informada"}</span></p>
                        </div>
                    </div>
                    <div class="bg-zinc-800/50 p-6 rounded-2xl border border-white/5 shadow-xl">
                        <h3 class="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] mb-4">Gabinete Oficial</h3>
                        <div class="space-y-3">
                            <p class="text-white text-sm flex justify-between border-b border-white/5 pb-2"><strong>Localização:</strong> <span class="text-zinc-400">Sala ${lastStatus.gabinete.sala || "-"} (Prédio ${lastStatus.gabinete.predio || "-"})</span></p>
                            <p class="text-white text-sm flex justify-between border-b border-white/5 pb-2"><strong>Telefone:</strong> <span class="text-zinc-400">${lastStatus.gabinete.telefone || "-"}</span></p>
                            <p class="text-white text-sm flex justify-between"><strong>E-mail:</strong> <a href="mailto:${lastStatus.gabinete.email}" class="text-violet-400 hover:underline font-bold">${lastStatus.gabinete.email || "-"}</a></p>
                        </div>
                    </div>
                </div>
            </div>

            <div id="dcontent-carreira" class="hidden space-y-4 animate-fade-in px-1" data-loaded="false">
                <div class="text-center text-zinc-500 py-4">Carregando dados de carreira...</div>
            </div>

            <div id="dcontent-despesas" class="hidden space-y-4 animate-fade-in px-1">
                <div class="flex flex-col md:flex-row gap-4 justify-between items-center bg-zinc-900/50 p-5 rounded-2xl border border-white/5 shadow-xl">
                    <span class="text-zinc-400 text-[10px] font-black uppercase tracking-widest hidden md:block">Filtros de Despesa</span>
                    <div class="flex flex-wrap gap-3 justify-center md:justify-end w-full md:w-auto">
                        <div class="flex items-center gap-2">
                            <label class="text-[9px] font-black text-zinc-500 uppercase">Ano</label>
                            <select id="sel-year-despesas" onchange="loadDeputyExpenses(${id}, true)" class="bg-zinc-950 text-white text-xs px-3 py-2 rounded-xl border border-white/10 outline-none focus:border-violet-500 transition-all">
                                ${yearOptions}
                            </select>
                        </div>
                        <div class="flex items-center gap-2">
                            <label class="text-[9px] font-black text-zinc-500 uppercase">Mês</label>
                            <select id="sel-month-despesas" onchange="loadDeputyExpenses(${id}, true)" class="bg-zinc-950 text-white text-xs px-3 py-2 rounded-xl border border-white/10 outline-none focus:border-violet-500 transition-all">
                                <option value="">Todos</option>
                                <option value="1">Janeiro</option>
                                <option value="2">Fevereiro</option>
                                <option value="3">Março</option>
                                <option value="4">Abril</option>
                                <option value="5">Maio</option>
                                <option value="6">Junho</option>
                                <option value="7">Julho</option>
                                <option value="8">Agosto</option>
                                <option value="9">Setembro</option>
                                <option value="10">Outubro</option>
                                <option value="11">Novembro</option>
                                <option value="12">Dezembro</option>
                            </select>
                        </div>
                        <button onclick="downloadExpensesCSV()" class="bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border border-green-500/20 flex items-center gap-2">
                            <span>📥</span> Exportar CSV
                        </button>
                    </div>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 shadow-2xl">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-white font-black text-xs uppercase tracking-widest">Evolução Mensal</h3>
                            <div class="flex flex-col items-end">
                                <span class="text-[9px] text-zinc-500 font-black uppercase">Total no Período</span>
                                <span id="totalExpenses" class="text-green-400 font-black text-xl tracking-tighter italic">R$ 0,00</span>
                            </div>
                        </div>
                        <div class="h-64 w-full relative">
                            <canvas id="expensesChart"></canvas>
                        </div>
                    </div>
                    <div class="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 shadow-2xl">
                        <h3 class="text-white font-black text-xs uppercase tracking-widest mb-6">Distribuição por Categoria</h3>
                        <div class="h-64 w-full relative">
                            <canvas id="expensesTypeChart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="mt-8">
                    <h3 class="text-white font-black text-xs uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></span>
                        Top Fornecedores Investitados
                    </h3>
                    <div id="suppliersRankTable" class="mb-6"></div>
                    <h3 class="text-white font-black text-xs uppercase tracking-[0.3em] mb-4">Extrato Detalhado</h3>
                    <div id="suppliersList" class="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        <div class="text-center text-zinc-500 py-4 italic uppercase text-[10px] tracking-widest">Iniciando varredura de recibos...</div>
                    </div>
                </div>
            </div>

            <div id="dcontent-analise" class="hidden space-y-6 animate-fade-in px-1">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 shadow-2xl">
                        <h3 class="text-white font-black text-xs uppercase tracking-widest mb-6 italic">🏢 Destinos de Capital (Top 5)</h3>
                        <div class="h-64 w-full relative">
                            <canvas id="analysisChart"></canvas>
                        </div>
                    </div>
                    <div class="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 shadow-2xl">
                        <h3 class="text-white font-black text-xs uppercase tracking-widest mb-6 italic">⚠️ Alertas de Integridade</h3>
                        <div id="analysisAlerts" class="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                            <div class="text-zinc-600 text-[10px] font-black uppercase tracking-widest text-center py-10">Processando heurística...</div>
                        </div>
                    </div>
                </div>
                
                <div class="bg-zinc-900/50 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                    <div class="mb-6">
                        <h3 class="text-white font-black text-xs uppercase tracking-[0.3em] mb-1">🔄 Recorrência de Pagamentos</h3>
                        <p class="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Identificação de padrões sistemáticos de repasse.</p>
                    </div>
                    <div id="recurrenceList" class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar"></div>
                </div>
            </div>

            <div id="dcontent-mapa" class="hidden space-y-4 animate-fade-in px-1">
                <div class="bg-zinc-900/50 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                    <h3 class="text-white font-black text-xs uppercase tracking-widest mb-2 italic">Rota do Dinheiro Público</h3>
                    <p class="text-[10px] text-zinc-500 font-bold mb-6">Visualização geográfica dos repasses (Sedes dos CNPJs).</p>
                    <div id="mapContainer" style="height:500px" class="w-full rounded-[2rem] overflow-hidden relative z-0 border border-white/10 shadow-inner">
                        <div id="map" style="height:100%;width:100%" class="bg-zinc-950"></div>
                    </div>
                    <div id="mapStatus" class="mt-4 text-[9px] text-zinc-600 font-black uppercase tracking-[0.5em] text-center">Aguardando coordenadas oficiais...</div>
                </div>
            </div>

            <div id="dcontent-emendas" class="hidden space-y-6 animate-fade-in px-1">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-white font-black text-xs uppercase tracking-widest italic">Recursos Enviados (Emendas)</h3>
                    <div class="flex items-center gap-3 bg-zinc-900/50 px-4 py-2 rounded-2xl border border-white/5">
                        <label class="text-[9px] font-black text-zinc-500 uppercase">Ciclo:</label>
                        <select id="sel-year-emendas" onchange="loadDeputyAmendments(${id}, true)" class="bg-transparent text-white text-xs font-bold outline-none">
                            ${yearOptions}
                        </select>
                    </div>
                </div>
                <div id="amendmentsList" class="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    <div class="text-center text-zinc-600 py-10 font-black uppercase text-[10px] tracking-widest">Acessando base do Tesouro...</div>
                </div>
            </div>

            <div id="dcontent-projetos" class="hidden space-y-6 animate-fade-in px-1">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-white font-black text-xs uppercase tracking-widest italic">Produção Legislativa</h3>
                    <div class="flex items-center gap-3 bg-zinc-900/50 px-4 py-2 rounded-2xl border border-white/5">
                        <label class="text-[9px] font-black text-zinc-500 uppercase">Ano:</label>
                        <select id="sel-year-projetos" onchange="loadDeputyBills(${id}, true)" class="bg-transparent text-white text-xs font-bold outline-none">
                            ${yearOptions}
                        </select>
                    </div>
                </div>
                <div id="billsList" class="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    <div class="text-center text-zinc-600 py-10 font-black uppercase text-[10px] tracking-widest">Buscando arquivos da câmara...</div>
                </div>
            </div>

            <div id="dcontent-discursos" class="hidden space-y-4 animate-fade-in px-1" data-loaded="false">
                 <div class="text-center text-zinc-600 py-20 font-black uppercase text-[10px] tracking-widest animate-pulse">Recuperando transcrições de plenário...</div>
            </div>

            <div id="dcontent-votacoes" class="hidden space-y-4 animate-fade-in px-1" data-loaded="false">
                <div class="h-48 w-full relative mb-8 hidden" id="chartContainer">
                    <canvas id="votesChart"></canvas>
                </div>
                <div id="votesList" class="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    <div class="text-center text-zinc-600 py-20 font-black uppercase text-[10px] tracking-widest">Auditando votos nominais...</div>
                </div>
            </div>

            <div id="dcontent-noticias" class="hidden space-y-6 animate-fade-in px-1" data-loaded="false">
                <div class="text-center text-zinc-600 py-20 animate-pulse font-black text-xs uppercase tracking-widest">Rastreando menções na mídia...</div>
            </div>
        `;
    document.getElementById("deputyModal").classList.remove("hidden");
  } catch (e) {
    alert("Erro ao carregar detalhes do deputado.");
  } finally {
    if (typeof toggleSpinner === "function") toggleSpinner(false);
  }
}

function toggleDeputyTools(show) {
  const grid = document.getElementById('deputyToolGrid');
  const showBtn = document.getElementById('deputyShowToolsBtn');
  if (show) {
    grid.classList.remove('hidden');
    showBtn.classList.add('hidden');
  } else {
    grid.classList.add('hidden');
    showBtn.classList.remove('hidden');
  }
}

async function switchDeputyTab(tab, id) {
  const tabs = [
    "sobre",
    "carreira",
    "despesas",
    "analise",
    "mapa",
    "emendas",
    "projetos",
    "discursos",
    "votacoes",
    "noticias",
  ];

  tabs.forEach((t) => {
    const content = document.getElementById(`dcontent-${t}`);
    const btn = document.getElementById(`dtab-${t}`);
    if (content) content.classList.add("hidden");
    if (btn) {
      btn.className = "flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all shadow-lg active:scale-95 border border-white/5 group";
    }
  });

  const activeContent = document.getElementById(`dcontent-${tab}`);
  const activeBtn = document.getElementById(`dtab-${tab}`);

  if (activeContent) activeContent.classList.remove("hidden");
  if (activeBtn) {
    activeBtn.className = "flex flex-col items-center justify-center p-4 rounded-2xl bg-violet-600 text-white transition-all shadow-lg active:scale-95 border border-white/10 group";
  }

  // Recolhe a grade se não for a aba 'sobre' (opcional, ou sempre que mudar)
  if (tab !== 'sobre') {
    toggleDeputyTools(false);
  }

  if (tab === "carreira") loadDeputyCareer(id);
  if (tab === "despesas") loadDeputyExpenses(id);
  if (tab === "emendas") loadDeputyAmendments(id);
  if (tab === "analise") loadDeputyAnalysis(id);
  if (tab === "mapa") loadDeputyMap(id);
  if (tab === "projetos") loadDeputyBills(id);
  if (tab === "discursos") loadDeputySpeeches(id);
  if (tab === "votacoes") loadDeputyVotes(id);
  if (tab === "noticias")      loadDeputyNoticias(id);
}

async function loadDeputyCareer(id) {
    const container = document.getElementById("dcontent-carreira");
    if (container.getAttribute("data-loaded") === "true") return;

    try {
        const [profissoesRes, ocupacoesRes, mandatosRes, orgaosRes] = await Promise.all([
            api.camara(`deputados/${id}/profissoes`),
            api.camara(`deputados/${id}/ocupacoes`),
            api.camara(`deputados/${id}/mandatosExternos`),
            api.camara(`deputados/${id}/orgaos?ordem=DESC&ordenarPor=dataInicio`)
        ]);
        
        const [profissoes, ocupacoes, mandatos, orgaos] = [profissoesRes, ocupacoesRes, mandatosRes, orgaosRes];

        let html = '';

        if (profissoes.dados && profissoes.dados.length > 0) {
            html += `<div class="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 shadow-xl mb-6">
                <h3 class="text-white font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">🎓 Profissões Registradas</h3>
                <div class="flex flex-wrap gap-2">
                    ${profissoes.dados.map(p => `<span class="bg-violet-600/20 text-violet-300 border border-violet-500/30 px-4 py-1.5 rounded-full text-xs font-bold">${p.titulo}</span>`).join('')}
                </div>
            </div>`;
        }

        if (ocupacoes.dados && ocupacoes.dados.length > 0) {
             html += `<div class="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 shadow-xl mb-6">
                <h3 class="text-white font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">💼 Ocupações Anteriores</h3>
                <div class="space-y-3">
                    ${ocupacoes.dados.map(o => `
                        <div class="bg-zinc-950 p-4 rounded-2xl border border-white/5">
                            <div class="font-black text-white text-sm uppercase italic">${o.titulo}</div>
                            <div class="text-zinc-500 text-xs mt-1 font-bold">${o.entidade || ''} <span class="text-zinc-700 ml-2">${o.anoInicio || '?'} a ${o.anoFim || 'Atual'}</span></div>
                        </div>
                    `).join('')}
                </div>
            </div>`;
        }

        if (mandatos.dados && mandatos.dados.length > 0) {
            html += `<div class="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 shadow-xl mb-6">
                <h3 class="text-white font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">🗳️ Mandatos Eletivos</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    ${mandatos.dados.map(m => `
                        <div class="bg-zinc-950 p-4 rounded-2xl border border-white/5 hover:border-violet-500/30 transition-all group">
                            <div class="font-black text-violet-400 text-xs uppercase tracking-tighter italic group-hover:text-violet-300">${m.cargo}</div>
                            <div class="text-white font-bold text-sm mt-1 uppercase">${m.municipio ? m.municipio + ' - ' : ''}${m.siglaUf}</div>
                            <div class="text-zinc-600 text-[10px] font-black uppercase mt-2">${m.anoInicio} → ${m.anoFim || 'Atual'}</div>
                        </div>
                    `).join('')}
                </div>
            </div>`;
        }

        if (orgaos.dados && orgaos.dados.length > 0) {
             const recentOrgaos = orgaos.dados.slice(0, 10);
             html += `<div class="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 shadow-xl">
                <h3 class="text-white font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">🏛️ Comissões e Órgãos (Recentes)</h3>
                <div class="space-y-3">
                    ${recentOrgaos.map(o => `
                        <div class="bg-zinc-950 p-4 rounded-2xl border border-white/5">
                            <div class="flex justify-between items-start mb-1">
                                <span class="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded text-[9px] font-black uppercase">${o.siglaOrgao}</span>
                                <span class="text-zinc-600 text-[9px] font-black uppercase italic">${window.formatDate(o.dataInicio)} — ${o.dataFim ? window.formatDate(o.dataFim) : 'Atual'}</span>
                            </div>
                            <div class="font-black text-zinc-100 text-xs uppercase">${o.nomeOrgao}</div>
                            <div class="text-violet-500 text-[10px] font-black uppercase mt-1 italic">${o.titulo}</div>
                        </div>
                    `).join('')}
                </div>
            </div>`;
        }

        if (html === '') {
            html = '<div class="text-center text-zinc-600 py-10 font-black uppercase text-[10px] tracking-widest">Nenhuma informação de carreira localizada nos arquivos.</div>';
        }

        container.innerHTML = html;
        container.setAttribute("data-loaded", "true");

    } catch (e) {
        console.error(e);
        container.innerHTML = '<div class="text-center text-red-500 py-4 font-black uppercase text-[10px]">Erro na interceptação de dados de carreira.</div>';
    }
}


async function loadDeputyExpenses(id, force = false) {
  const list = document.getElementById("suppliersList");
  const yearSelect = document.getElementById("sel-year-despesas");
  const monthSelect = document.getElementById("sel-month-despesas");
  const daySelect = document.getElementById("sel-day-despesas");

  const selectedYear = yearSelect ? yearSelect.value : new Date().getFullYear();
  const selectedMonth = monthSelect ? monthSelect.value : "";
  const selectedDay = daySelect ? daySelect.value : "";
  const cacheKey = `${selectedYear}-${selectedMonth}-${selectedDay}`;

  if (!force && list.getAttribute("data-loaded") === cacheKey) return;

  list.innerHTML =
    '<div class="text-center text-zinc-500 py-4"><span class="animate-pulse">Carregando despesas...</span></div>';
  document.getElementById("totalExpenses").textContent = "R$ ...";

  try {
    let query = `deputados/${id}/despesas?ano=${selectedYear}&ordem=DESC&ordenarPor=dataDocumento&itens=100`;
    if (selectedMonth) query += `&mes=${selectedMonth}`;

    let json = await api.camara(query);
    
    // Auto-fallback: Se não houver dados no ano atual (ex: início de ano, ou lag da API), tenta os 2 anos anteriores
    if ((!json.dados || json.dados.length === 0) && selectedYear == new Date().getFullYear() && !selectedMonth && !selectedDay) {
        for (let i = 1; i <= 3; i++) {
            const fallbackYear = selectedYear - i;
            if (yearSelect) yearSelect.value = fallbackYear;
            query = `deputados/${id}/despesas?ano=${fallbackYear}&ordem=DESC&ordenarPor=dataDocumento&itens=100`;
            json = await api.camara(query);
            if (json.dados && json.dados.length > 0) break;
        }
    }
    
    currentExpensesData = json.dados || [];

    // Filtragem por dia no cliente (API retorna o mês todo)
    if (selectedDay) {
      currentExpensesData = currentExpensesData.filter((d) => {
        const dayFromDoc = parseInt(d.dataDocumento.split("-")[2]); // YYYY-MM-DD
        return dayFromDoc === parseInt(selectedDay);
      });
    }

    if (currentExpensesData.length === 0) {
      list.innerHTML =
        '<div class="text-center text-zinc-500 py-4">Nenhuma despesa encontrada para o período selecionado.</div>';
      document.getElementById("totalExpenses").textContent = "R$ 0,00";
      if (expensesChartInstance) {
        expensesChartInstance.destroy();
        expensesChartInstance = null;
      }
      if (expensesTypeChartInstance) {
        expensesTypeChartInstance.destroy();
        expensesTypeChartInstance = null;
      }
      return;
    }

    const total = currentExpensesData.reduce(
      (acc, curr) => acc + (parseFloat(curr.valorLiquido) || 0),
      0,
    );
    document.getElementById("totalExpenses").textContent = window.formatCurrency(total);

    const suppliers = {};
    currentExpensesData.forEach((d) => {
      const key = d.cnpjCpfFornecedor || "Sem CNPJ";
      if (!suppliers[key])
        suppliers[key] = {
          name: d.nomeFornecedor,
          total: 0,
          count: 0,
          cnpj: d.cnpjCpfFornecedor,
        };
      suppliers[key].total += parseFloat(d.valorLiquido) || 0;
      suppliers[key].count += 1;
    });

    // Ordenar despesas por data (mais recente primeiro)
    const sortedExpenses = [...currentExpensesData].sort(
      (a, b) => new Date(b.dataDocumento) - new Date(a.dataDocumento),
    );

    list.innerHTML = sortedExpenses
      .map((d) => {
        // Verifica se é um CNPJ válido (14 dígitos) para habilitar o clique
        const isCnpj =
          d.cnpjCpfFornecedor &&
          d.cnpjCpfFornecedor.replace(/[^\d]/g, "").length === 14;
        const clickAction = isCnpj
          ? `onclick="openCompanyDetails('${d.cnpjCpfFornecedor}')"`
          : "";
        const cursorClass = isCnpj
          ? "cursor-pointer hover:border-violet-500 group"
          : "cursor-default border-zinc-700 opacity-80";

        const dateStr = window.formatDate(d.dataDocumento);
        const receiptLink = d.urlDocumento
          ? `<a href="${d.urlDocumento}" target="_blank" onclick="event.stopPropagation()" class="text-[10px] bg-zinc-700 hover:bg-violet-600 text-white px-2 py-1 rounded transition ml-2">📄 Ver Nota</a>`
          : "";

        return `
            <div ${clickAction} class="bg-zinc-800 p-3 rounded-lg flex flex-col gap-2 border ${cursorClass} transition sm:flex-row sm:justify-between sm:items-center">
                <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-1 mb-1">
                        <span class="text-xs font-mono text-zinc-400 bg-zinc-900 px-1 rounded">${dateStr}</span>
                        <span class="text-[10px] text-violet-300 uppercase tracking-wider border border-violet-500/30 px-1 rounded">${d.tipoDespesa}</span>
                    </div>
                    <div class="text-white text-sm font-bold break-words ${isCnpj ? "group-hover:text-violet-400" : ""} transition">${d.nomeFornecedor}</div>
                    <div class="text-zinc-500 text-xs mt-0.5">
                        <span>CNPJ: ${d.cnpjCpfFornecedor || "N/A"}</span>
                    </div>
                </div>
                <div class="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 shrink-0">
                    <div class="text-red-400 font-bold text-sm">${window.formatCurrency(d.valorLiquido)}</div>
                    <div class="flex items-center gap-1 flex-wrap">${receiptLink}${isCnpj ? `<button onclick="event.stopPropagation();if(window.HyperBot){HyperBot.investigarFornecedorProfundo('${d.cnpjCpfFornecedor.replace(/\D/g,'')}','${(d.nomeFornecedor||'').replace(/'/g,'').substring(0,40)}');}" class="text-[10px] bg-violet-900/60 hover:bg-violet-700 text-violet-300 hover:text-white px-2 py-1 rounded transition border border-violet-700/40" title="Investigar fornecedor com HyperBot">🤖 Investigar</button>` : ''}</div>
                </div>
            </div>
        `;
      })
      .join("");

    // Render Top Suppliers Ranking Table
    const rankTable = document.getElementById("suppliersRankTable");
    if (rankTable) {
      const ranked = Object.values(suppliers).sort((a, b) => b.total - a.total).slice(0, 10);
      rankTable.innerHTML = `
        <div class="overflow-x-auto rounded-xl border border-zinc-700">
          <table class="w-full text-sm" style="min-width:380px">
            <thead class="bg-zinc-900 text-zinc-400 text-xs uppercase">
              <tr>
                <th class="px-3 py-2 text-left w-8">#</th>
                <th class="px-3 py-2 text-left">Empresa</th>
                <th class="px-3 py-2 text-right whitespace-nowrap">Total</th>
                <th class="px-3 py-2 text-right hidden md:table-cell whitespace-nowrap">Nº Trans.</th>
                <th class="px-3 py-2 text-center">Ação</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-800">
              ${ranked.map((c, i) => {
                const isCnpj = c.cnpj && c.cnpj.replace(/[^\d]/g, '').length === 14;
                const pct = total > 0 ? Math.round((c.total / total) * 100) : 0;
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}`;
                return `
                <tr class="bg-zinc-800/50 hover:bg-zinc-700/50 transition">
                  <td class="px-3 py-2 text-zinc-400 font-mono text-center">${medal}</td>
                  <td class="px-3 py-2 max-w-[180px]">
                    <div class="font-bold text-white text-xs break-words">${c.name}</div>
                    <div class="text-[10px] text-zinc-500 font-mono">${c.cnpj || 'Sem CNPJ'}</div>
                    <div class="mt-1 h-1 rounded-full bg-zinc-700 overflow-hidden">
                      <div class="h-full bg-violet-500 rounded-full" style="width:${pct}%"></div>
                    </div>
                  </td>
                  <td class="px-3 py-2 text-right text-red-400 font-bold text-xs whitespace-nowrap">${window.formatCurrency(c.total)}<br><span class="text-zinc-500 font-normal">${pct}%</span></td>
                  <td class="px-3 py-2 text-right text-zinc-400 hidden md:table-cell">${c.count}</td>
                  <td class="px-3 py-2 text-center">
                    ${isCnpj ? `<button onclick="openCompanyDetails('${c.cnpj}')" class="text-[10px] bg-violet-700 hover:bg-violet-600 text-white px-2 py-1 rounded transition whitespace-nowrap">🔍 Investigar</button>` : '<span class="text-zinc-600 text-[10px]">N/A</span>'}
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    list.setAttribute("data-loaded", cacheKey);
    renderExpensesChart(selectedMonth ? "day" : "month");
    renderExpensesTypeChart();
  } catch (e) {
    console.error(e);
    list.innerHTML =
      '<div class="text-center text-red-500 py-4">Erro ao carregar despesas.</div>';
  }
}

async function loadDeputyAnalysis(id) {
  // Garante que temos dados
  if (currentExpensesData.length === 0) {
    await loadDeputyExpenses(id);
  }

  const alertsContainer = document.getElementById("analysisAlerts");
  const recurrenceContainer = document.getElementById("recurrenceList");
  const ctx = document.getElementById("analysisChart").getContext("2d");

  // 1. Processar Dados
  const companies = {};
  const noCnpj = [];
  let totalSpent = 0;

  currentExpensesData.forEach((d) => {
    const val = parseFloat(d.valorLiquido) || 0;
    totalSpent += val;

    // Sem CNPJ
    if (!d.cnpjCpfFornecedor) {
      noCnpj.push(d);
    } else {
      // Agrupar Empresas
      if (!companies[d.cnpjCpfFornecedor]) {
        companies[d.cnpjCpfFornecedor] = {
          name: d.nomeFornecedor,
          total: 0,
          count: 0,
          cnpj: d.cnpjCpfFornecedor,
        };
      }
      companies[d.cnpjCpfFornecedor].total += val;
      companies[d.cnpjCpfFornecedor].count += 1;
    }
  });

  // 2. Gerar Alertas
  let alertsHtml = "";

  if (noCnpj.length > 0) {
    const totalNoCnpj = noCnpj.reduce(
      (acc, curr) => acc + (parseFloat(curr.valorLiquido) || 0),
      0,
    );
    alertsHtml += `
            <div class="bg-red-500/10 border border-red-500/30 p-2 rounded text-red-200 mb-2">
                <strong>⚠️ Gastos sem CNPJ/CPF:</strong> ${noCnpj.length} registros somando ${window.formatCurrency(totalNoCnpj)}.
            </div>
        `;
  } else {
    alertsHtml += `<div class="text-green-400 text-sm">✅ Todos os gastos possuem identificação de fornecedor.</div>`;
  }

  alertsContainer.innerHTML = alertsHtml;

  // 3. Lista de Recorrência
  const sortedByCount = Object.values(companies)
    .sort((a, b) => b.count - a.count)
    .filter((c) => c.count > 1);

  if (sortedByCount.length === 0) {
    recurrenceContainer.innerHTML =
      '<div class="col-span-2 text-zinc-500">Nenhuma recorrência encontrada no período.</div>';
  } else {
    recurrenceContainer.innerHTML = sortedByCount
      .slice(0, 10)
      .map(
        (c) => `
            <div class="bg-zinc-900 p-2 rounded border border-zinc-800 flex justify-between items-center">
                <div class="truncate pr-2">
                    <div class="text-white text-xs font-bold truncate">${c.name}</div>
                    <div class="text-[10px] text-zinc-500">${c.cnpj}</div>
                </div>
                <div class="text-right">
                    <div class="text-violet-400 font-bold text-xs">${c.count}x</div>
                    <div class="text-[10px] text-zinc-400">${window.formatCurrency(c.total)}</div>
                </div>
            </div>
        `,
      )
      .join("");
  }

  // 4. Gráfico Top Empresas
  const top5 = Object.values(companies)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  if (analysisChartInstance) analysisChartInstance.destroy();

  analysisChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: top5.map((c) => c.name.substring(0, 15) + "..."),
      datasets: [
        {
          label: "Total Recebido (R$)",
          data: top5.map((c) => c.total),
          backgroundColor: "#8b5cf6",
          borderRadius: 4,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          grid: { color: "#27272a" },
          ticks: {
            color: "#a1a1aa",
            callback: function (value) {
              return "R$ " + value / 1000 + "k";
            },
          },
        },
        y: {
          grid: { display: false },
          ticks: { color: "#fff", font: { size: 10 } },
        },
      },
    },
  });
}

async function loadDeputyMap(id) {
  // Se não tiver dados de despesas carregados, carrega primeiro (padrão ano atual)
  if (currentExpensesData.length === 0) {
    await loadDeputyExpenses(id, true);
  }

  const status = document.getElementById("mapStatus");

  // Se já carregou esse deputado, apenas garante tamanho correto
  if (mapInstance && mapLastDeputyId === id) {
    setTimeout(() => mapInstance.invalidateSize(), 200);
    return;
  }

  // Limpar marcadores anteriores
  mapMarkers.forEach(m => m.remove());
  mapMarkers = [];
  mapLastDeputyId = id;

  // Inicializar Mapa se necessário
  if (!mapInstance) {
    if (typeof L === 'undefined') {
        status.textContent = "Erro: Biblioteca de mapas indisponível.";
        return;
    }
    // Pequeno delay para garantir que o container está visível
    await new Promise(resolve => setTimeout(() => {
      mapInstance = L.map("map").setView([-15.7801, -47.9292], 4);
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution: "&copy; OpenStreetMap &copy; CARTO",
          subdomains: "abcd",
          maxZoom: 19,
        },
      ).addTo(mapInstance);
      resolve();
    }, 100));
  } else {
    setTimeout(() => mapInstance.invalidateSize(), 150);
  }

  status.textContent = "> Analisando fornecedores...";

  // Agrupar por CNPJ
  const companies = {};
  currentExpensesData.forEach((e) => {
    if (e.cnpjCpfFornecedor && e.cnpjCpfFornecedor.length === 14) {
      if (!companies[e.cnpjCpfFornecedor]) {
        companies[e.cnpjCpfFornecedor] = {
          name: e.nomeFornecedor,
          total: 0,
          cnpj: e.cnpjCpfFornecedor,
          type: e.tipoDespesa,
        };
      }
      companies[e.cnpjCpfFornecedor].total += parseFloat(e.valorLiquido) || 0;
    }
  });

  // Pegar Top 10 para não estourar limite de API
  const topCompanies = Object.values(companies)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  // Ícone Personalizado (Prédio)
  const buildingIcon = L.divIcon({
    className: "custom-map-marker",
    html: '<div style="background-color: #8b5cf6; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); font-size: 18px;">🏢</div>',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const moneyIcon = L.divIcon({
    className: "custom-map-marker-money",
    html: '<div style="background-color: #10b981; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); font-size: 14px;">💲</div>',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });

  for (const comp of topCompanies) {
    try {
      status.textContent = `> Localizando: ${comp.name}...`;

      // 1. BrasilAPI para endereço
      const dataCnpj = await api.brasilApi(`cnpj/v1/${comp.cnpj}`);
      if (dataCnpj.error || !dataCnpj.logradouro) continue;

      const address = `${dataCnpj.logradouro}, ${dataCnpj.numero}, ${dataCnpj.municipio}, ${dataCnpj.uf}, Brazil`;

      // 2. Nominatim (OSM) para Lat/Lon
      let dataGeo = [];
      try {
          dataGeo = await api.nominatim(address);
      } catch (geoErr) {
          console.warn("Falha na geolocalização:", geoErr);
      }

      if (Array.isArray(dataGeo) && dataGeo.length > 0) {
        // Escolhe ícone baseado no tipo (se tiver "Combustível" usa um, senão outro, aqui simplificado)
        const iconToUse = comp.type.toLowerCase().includes("combustível")
          ? moneyIcon
          : buildingIcon;

        if (!mapInstance) continue;
        const marker = L.marker([dataGeo[0].lat, dataGeo[0].lon], {
          icon: iconToUse,
        }).addTo(mapInstance).bindPopup(`
                        <div style="color: #333">
                            <strong>${comp.name}</strong><br>
                            ${window.formatCurrency(comp.total)}<br>
                            <span style="font-size:10px">${dataCnpj.municipio}/${dataCnpj.uf}</span>
                        </div>
                    `);
        mapMarkers.push(marker);
      }
      await new Promise((r) => setTimeout(r, 800)); // Delay respeitoso
    } catch (e) {
      console.error(e);
    }
  }
  status.textContent = "> Mapeamento concluído.";
}

async function loadDeputyAmendments(id, force = false) {
  const container = document.getElementById("amendmentsList");
  const yearSelect = document.getElementById("sel-year-emendas");
  const selectedYear = String(yearSelect ? yearSelect.value : new Date().getFullYear());
  // Cache key inclui ID do deputado para evitar reusar cache de outro deputado
  const cacheKey = `${id}_${selectedYear}`;

  if (!force && container.getAttribute("data-loaded") === cacheKey) return;

  container.innerHTML =
    '<div class="text-center text-zinc-500 py-4"><span class="animate-pulse">Buscando emendas de ' +
    selectedYear +
    "...</span></div>";

  // Portal da Transparência: campo nomeAutor é o parâmetro correto para filtrar por autor
  // Normalizar nome (sem acentos, maiúsculo) para bater com o formato SIAFI
  const rawName = currentDeputy
    ? (currentDeputy.ultimoStatus.nomeEleitoral || currentDeputy.ultimoStatus.nome)
    : "";
  const authorName = rawName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();

  try {
    const data = await api.portal(`emendas?ano=${selectedYear}&nomeAutor=${encodeURIComponent(authorName)}&pagina=1`);

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = `<div class="text-center text-zinc-500 py-4">Nenhuma emenda encontrada em ${selectedYear}.</div>`;
      container.setAttribute("data-loaded", cacheKey);
      return;
    }

    container.innerHTML = data
      .map((e) => {
        const vEmpenhado = window.parsePtBrFloat(e.valorEmpenhado);
        const vLiquidado = window.parsePtBrFloat(e.valorLiquidado);
        const vPago = window.parsePtBrFloat(e.valorPago);
        
        // Progress bars
        const pLiquidado = vEmpenhado > 0 ? (vLiquidado / vEmpenhado) * 100 : 0;
        const pPago = vEmpenhado > 0 ? (vPago / vEmpenhado) * 100 : 0;

        const localidade = e.localidadeDoGasto || 'Localidade não especificada';
        const funcaoLabel = (e.funcao && e.subfuncao) ? `${e.funcao} — ${e.subfuncao}` : (e.funcao || e.subfuncao || 'Função não informada');
        return `
            <div class="bg-zinc-800 p-4 rounded-xl border border-zinc-700 hover:border-violet-500 transition">
                <div class="flex justify-between items-start mb-2">
                    <span class="bg-violet-600/20 text-violet-400 text-xs font-bold px-2 py-1 rounded uppercase">Emenda ${e.codigoEmenda || e.numeroEmenda || '—'}</span>
                    <span class="text-white font-bold">${window.formatCurrency(vEmpenhado)}</span>
                </div>
                ${e.tipoEmenda ? `<span class="text-[10px] text-zinc-500 font-bold uppercase">${e.tipoEmenda}</span>` : ''}
                <h4 class="text-white font-bold text-sm mb-1 mt-1">${funcaoLabel}</h4>
                <p class="text-zinc-400 text-xs mb-3">${localidade}</p>
                
                <div class="space-y-2">
                    <div>
                        <div class="flex justify-between text-[10px] text-zinc-400 mb-1">
                            <span>Liquidado (${Math.round(pLiquidado)}%)</span>
                            <span class="text-white">${window.formatCurrency(vLiquidado)}</span>
                        </div>
                        <div class="w-full bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                            <div class="bg-blue-500 h-full" style="width: ${Math.min(100, pLiquidado)}%"></div>
                        </div>
                    </div>
                    <div>
                        <div class="flex justify-between text-[10px] text-zinc-400 mb-1">
                            <span>Pago (${Math.round(pPago)}%)</span>
                            <span class="text-green-400">${window.formatCurrency(vPago)}</span>
                        </div>
                        <div class="w-full bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                            <div class="bg-green-500 h-full" style="width: ${Math.min(100, pPago)}%"></div>
                        </div>
                    </div>
                </div>
                
                ${(e.codigoEmenda || e.numeroEmenda) ? `<button onclick="loadAmendmentDocuments('${e.codigoEmenda || e.numeroEmenda}')" class="mt-3 w-full bg-zinc-700 hover:bg-zinc-600 text-white text-xs py-2 rounded transition flex items-center justify-center gap-2">📄 Ver Documentos de Execução</button>` : ''}
            </div>
        `;
      })
      .join("");

    container.setAttribute("data-loaded", cacheKey);
  } catch (e) {
    console.error(e);
    container.innerHTML =
      '<div class="text-center text-red-500 py-4">Erro ao carregar emendas.</div>';
  }
}

function renderExpensesChart(period) {
  if (!currentExpensesData.length) return;
  const ctx = document.getElementById("expensesChart").getContext("2d");
  if (expensesChartInstance) expensesChartInstance.destroy();

  const aggregated = {};
  currentExpensesData.forEach((d) => {
    const date = new Date(d.dataDocumento);
    let key, sortKey;

    if (period === "day") {
      key = date.toLocaleDateString("pt-BR");
      sortKey = date.getTime();
    } else if (period === "month") {
      key = date.toLocaleString("pt-BR", { month: "short", year: "2-digit" });
      sortKey = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
    } else if (period === "year") {
      key = date.getFullYear().toString();
      sortKey = new Date(date.getFullYear(), 0, 1).getTime();
    } else if (period === "week") {
      const dObj = new Date(d.dataDocumento);
      const day = dObj.getDay();
      const diff = dObj.getDate() - day;
      const weekStart = new Date(dObj);
      weekStart.setDate(diff);
      key = weekStart.toLocaleDateString("pt-BR");
      sortKey = weekStart.getTime();
    }

    if (!aggregated[key]) aggregated[key] = { value: 0, sort: sortKey };
    aggregated[key].value += parseFloat(d.valorLiquido) || 0;
  });

  const sortedData = Object.keys(aggregated)
    .map((k) => ({
      label: k,
      value: aggregated[k].value,
      sort: aggregated[k].sort,
    }))
    .sort((a, b) => a.sort - b.sort);

  expensesChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: sortedData.map((d) => d.label),
      datasets: [
        {
          label: "Gastos (R$)",
          data: sortedData.map((d) => d.value),
          borderColor: "#8b5cf6",
          backgroundColor: "rgba(139, 92, 246, 0.2)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: "#27272a" }, ticks: { color: "#a1a1aa" } },
        x: { grid: { display: false }, ticks: { color: "#a1a1aa" } },
      },
    },
  });
}

function renderExpensesTypeChart() {
  if (!currentExpensesData.length) return;
  const ctx = document.getElementById("expensesTypeChart").getContext("2d");
  if (expensesTypeChartInstance) expensesTypeChartInstance.destroy();

  const aggregated = {};
  currentExpensesData.forEach((d) => {
    const type = d.tipoDespesa;
    if (!aggregated[type]) aggregated[type] = 0;
    aggregated[type] += parseFloat(d.valorLiquido) || 0;
  });

  const sorted = Object.entries(aggregated).sort(([, a], [, b]) => b - a);
  
  let labels = [];
  let data = [];
  
  // Top 6 + Outros
  if (sorted.length > 6) {
      const top = sorted.slice(0, 6);
      const others = sorted.slice(6);
      labels = top.map(x => x[0]);
      data = top.map(x => x[1]);
      labels.push("Outros");
      data.push(others.reduce((acc, curr) => acc + curr[1], 0));
  } else {
      labels = sorted.map(x => x[0]);
      data = sorted.map(x => x[1]);
  }

  expensesTypeChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: ["#8b5cf6", "#10b981", "#ef4444", "#f59e0b", "#3b82f6", "#ec4899", "#6366f1"],
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "right", labels: { color: "#a1a1aa", font: { size: 10 }, boxWidth: 10 } } },
    },
  });
}

async function loadDeputyBills(id, force = false) {
  const container = document.getElementById("billsList");
  const yearSelect = document.getElementById("sel-year-projetos");
  const selectedYear = yearSelect ? yearSelect.value : new Date().getFullYear();

  if (!force && container.getAttribute("data-loaded") === selectedYear) return;

  container.innerHTML =
    '<div class="text-center text-zinc-500 py-4"><span class="animate-pulse">Buscando projetos de ' +
    selectedYear +
    "...</span></div>";

  try {
    const json = await api.camara(`proposicoes?idDeputadoAutor=${id}&ano=${selectedYear}&ordem=DESC&ordenarPor=id&itens=50`);
    if (json.dados.length === 0) {
      container.innerHTML = `<div class="text-center text-zinc-500 py-4">Nenhum projeto encontrado em ${selectedYear}.</div>`;
      container.setAttribute("data-loaded", selectedYear);
      return;
    }
    container.innerHTML = json.dados
      .map(
        (p) => `
            <div class="bg-zinc-800 p-3 rounded-lg border border-zinc-700 hover:border-violet-500 transition">
                <div class="flex justify-between mb-1">
                    <span class="text-violet-400 font-bold text-xs">${p.siglaTipo} ${p.numero}/${p.ano}</span>
                    <span class="text-zinc-500 text-xs">Apresentado em ${window.formatDate(p.dataApresentacao)}</span>
                </div>
                <div class="text-white text-sm line-clamp-2 mb-2">${p.ementa}</div>
                <div class="flex justify-end">
                    <a href="https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${p.id}" target="_blank" class="text-[10px] bg-zinc-700 hover:bg-violet-600 text-white px-3 py-1 rounded transition flex items-center gap-1">📄 Ver Inteiro Teor ↗</a>
                </div>
            </div>
        `,
      )
      .join("");
    container.setAttribute("data-loaded", selectedYear);
  } catch (e) {
    container.innerHTML =
      '<div class="text-center text-red-500 py-4">Erro ao carregar projetos.</div>';
  }
}

async function loadDeputySpeeches(id) {
  const container = document.getElementById("dcontent-discursos");
  if (container && container.getAttribute("data-loaded") === "true") return;

  try {
    const json = await api.camara(`deputados/${id}/discursos?ordem=DESC&ordenarPor=dataHoraInicio&itens=20`);

    if (json.dados.length === 0) {
      container.innerHTML =
        '<div class="text-center text-zinc-500 py-4">Nenhum discurso recente.</div>';
      return;
    }

    container.innerHTML = json.dados
      .map(
        (d) => `
            <div class="bg-zinc-800 p-3 rounded-lg">
                <div class="text-white text-sm font-bold mb-1">${d.tipoDiscurso}</div>
                <div class="text-zinc-400 text-xs mb-2">${new Date(d.dataHoraInicio).toLocaleString()}</div>
                <div class="text-zinc-300 text-sm italic">"${d.sumario || (d.transcricao ? d.transcricao.substring(0, 100) + "..." : "Sem transcrição")}"</div>
            </div>
        `,
      )
      .join("");
    if(container) container.setAttribute("data-loaded", "true");
  } catch (e) {
    container.innerHTML =
      '<div class="text-center text-red-500 py-4">Erro ao carregar discursos.</div>';
  }
}

async function loadDeputyVotes(id) {
  const wrapper = document.getElementById("dcontent-votacoes");
  if (wrapper.getAttribute("data-loaded") === "true") return;

  wrapper.innerHTML = '<div class="text-center text-zinc-500 py-6 animate-pulse">Carregando votações (últimos 24 meses)...</div>';

  try {
    const json = await window.api.get('get_deputy_votes', { id });
    const dados = json.dados || [];

    window._lastVotesData = dados;

    if (dados.length === 0) {
      wrapper.innerHTML = '<div class="text-center text-zinc-500 py-4">Nenhuma votação nominal registrada para este deputado nos últimos 24 meses.</div>';
      wrapper.setAttribute("data-loaded", "true");
      return;
    }

    // ── Helpers ────────────────────────────────────────────────────────────
    function parseVoto(v) {
      const raw = (v.tipoVoto || v.voto || '').trim();
      const up  = raw.toUpperCase();
      if (up === 'SIM')                                   return { raw, cat: 'sim' };
      if (up === 'NÃO' || up === 'NAO')                  return { raw, cat: 'nao' };
      if (up.startsWith('ABST') || up === 'ABSTENÇÃO')   return { raw, cat: 'abst' };
      if (up === 'OBSTRUÇÃO' || up === 'OBSTRUCAO')      return { raw, cat: 'obst' };
      if (up === 'ART. 17' || up.startsWith('ART'))      return { raw, cat: 'outros' };
      return { raw: raw || 'N/D', cat: 'outros' };
    }

    // Voto alinhado com a maioria?
    function comMaioria(v, cat) {
      if (v.aprovacao === null || v.aprovacao === undefined) return null;
      const aprov = Number(v.aprovacao);
      if (cat === 'sim'  && aprov === 1) return true;
      if (cat === 'nao'  && aprov === 0) return true;
      if (cat === 'sim'  && aprov === 0) return false;
      if (cat === 'nao'  && aprov === 1) return false;
      return null; // abstenção / outros: neutro
    }

    // ── Contagem ───────────────────────────────────────────────────────────
    let sim = 0, nao = 0, abstencao = 0, obstrucao = 0, outros = 0;
    let alinhado = 0, oposicao = 0;
    dados.forEach(v => {
      const { cat } = parseVoto(v);
      if (cat === 'sim')   sim++;
      else if (cat === 'nao')   nao++;
      else if (cat === 'abst')  abstencao++;
      else if (cat === 'obst')  obstrucao++;
      else outros++;
      const ali = comMaioria(v, cat);
      if (ali === true)  alinhado++;
      if (ali === false) oposicao++;
    });

    const total      = dados.length;
    const simPct     = total ? Math.round((sim        / total) * 100) : 0;
    const naoPct     = total ? Math.round((nao        / total) * 100) : 0;
    const abstPct    = total ? Math.round((abstencao  / total) * 100) : 0;
    const obstrPct   = total ? Math.round((obstrucao  / total) * 100) : 0;
    const comBase    = alinhado + oposicao;
    const alinhPct   = comBase ? Math.round((alinhado / comBase) * 100) : null;

    // Alinhamento com maioria — cor
    const alinhColor = alinhPct === null ? 'text-zinc-400'
                     : alinhPct >= 70    ? 'text-green-400'
                     : alinhPct >= 40    ? 'text-yellow-400'
                     : 'text-red-400';

    // ── Badge de resultado da pauta ────────────────────────────────────────
    function aprovacaoBadge(v) {
      const a = Number(v.aprovacao);
      if (a === 1) return '<span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-900/50 text-emerald-400 border border-emerald-700/40">✓ Aprovada</span>';
      if (a === 0) return '<span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-900/50 text-red-400 border border-red-700/40">✗ Rejeitada</span>';
      return '';
    }

    // ── Badge de alinhamento individual ───────────────────────────────────
    function alinhamentoBadge(v, cat) {
      const ali = comMaioria(v, cat);
      if (ali === true)  return '<span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700/40" title="Votou com a maioria">≡ Com maioria</span>';
      if (ali === false) return '<span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-900/40 text-orange-300 border border-orange-700/40" title="Votou contra a maioria">≠ Contra maioria</span>';
      return '';
    }

    // ── Placar da votação ─────────────────────────────────────────────────
    function placarHtml(v) {
      if (v.placarSim == null) return '';
      return `<span class="text-[10px] text-zinc-500 font-mono">
        <span class="text-green-500">${v.placarSim}S</span>
        <span class="text-zinc-600"> / </span>
        <span class="text-red-500">${v.placarNao}N</span>
        ${v.placarAbstencao ? `<span class="text-zinc-600"> / </span><span class="text-yellow-500">${v.placarAbstencao}A</span>` : ''}
      </span>`;
    }

    // ── Tipo de votação (Nominal/Simbólica) ───────────────────────────────
    function tipoBadge(v) {
      if (!v.siglaTipoVotacao) return '';
      const tipo = v.siglaTipoVotacao.toUpperCase();
      if (tipo === 'MV' || tipo.includes('NOM'))
        return '<span class="text-[10px] px-1.5 py-0.5 rounded bg-violet-900/40 text-violet-400 border border-violet-700/40 font-bold">Nominal</span>';
      if (tipo.includes('SIMB'))
        return '<span class="text-[10px] px-1.5 py-0.5 rounded bg-zinc-700/60 text-zinc-400 border border-zinc-600/40 font-bold">Simbólica</span>';
      return `<span class="text-[10px] px-1.5 py-0.5 rounded bg-zinc-700/60 text-zinc-400 border border-zinc-600/40 font-bold">${v.siglaTipoVotacao}</span>`;
    }

    // ── Link para o portal da Câmara ──────────────────────────────────────
    function linkCamara(v) {
      if (!v.id) return '';
      return `<a href="https://www.camara.leg.br/internet/votacao/mostraVotacao.asp?ideVotacao=${v.id}" target="_blank" rel="noopener"
               class="text-[10px] text-violet-400 hover:text-violet-300 transition hover:underline underline-offset-2">Ver na Câmara ↗</a>`;
    }

    wrapper.innerHTML = `
      <!-- Guia rápido (colapsável) -->
      <details class="mb-4 bg-zinc-900/60 border border-zinc-700/60 rounded-xl overflow-hidden group">
        <summary class="flex items-center justify-between px-4 py-3 cursor-pointer select-none list-none text-zinc-400 hover:text-white transition text-xs font-bold uppercase tracking-wide">
          <span>📖 Como ler esta aba?</span>
          <svg class="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </summary>
        <div class="px-4 pb-4 pt-1 space-y-4 text-xs text-zinc-400 border-t border-zinc-700/60">

          <!-- O que são votações nominais -->
          <div>
            <h4 class="text-white font-bold mb-1">🗳️ O que são estas votações?</h4>
            <p class="leading-relaxed">São as <strong class="text-zinc-200">votações nominais do Plenário</strong> — aquelas em que cada deputado registra individualmente seu voto (SIM, NÃO ou ABSTENÇÃO). Não aparecem aqui votações simbólicas em que não há registro individual. Os dados cobrem os <strong class="text-zinc-200">últimos 24 meses</strong>.</p>
          </div>

          <!-- Cards de resumo -->
          <div>
            <h4 class="text-white font-bold mb-2">📊 Cards de resumo</h4>
            <div class="space-y-1.5">
              <div class="flex gap-2"><span class="text-white font-bold w-28 flex-shrink-0">Votações</span><span>Total de votações nominais onde o deputado registrou voto no período.</span></div>
              <div class="flex gap-2"><span class="text-green-400 font-bold w-28 flex-shrink-0">% SIM</span><span>Percentual de vezes que votou <strong class="text-zinc-200">a favor</strong> das pautas.</span></div>
              <div class="flex gap-2"><span class="text-red-400 font-bold w-28 flex-shrink-0">% NÃO</span><span>Percentual de vezes que votou <strong class="text-zinc-200">contra</strong> as pautas.</span></div>
              <div class="flex gap-2"><span class="text-zinc-200 font-bold w-28 flex-shrink-0">% Com maioria</span><span>Frequência com que o deputado votou <strong class="text-zinc-200">do mesmo lado que a maioria</strong> da Câmara. Alto (verde) = alinhado ao bloco dominante. Baixo (vermelho) = postura mais independente ou de oposição.</span></div>
            </div>
          </div>

          <!-- Badges de cada voto -->
          <div>
            <h4 class="text-white font-bold mb-2">🏷️ Badges em cada votação</h4>
            <div class="space-y-1.5">
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-black px-2 py-1 rounded-lg border bg-green-800 text-green-100 border-green-700 flex-shrink-0">SIM</span>
                <span>Voto do deputado <strong class="text-zinc-200">a favor</strong> da matéria.</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-black px-2 py-1 rounded-lg border bg-red-800 text-red-100 border-red-700 flex-shrink-0">NÃO</span>
                <span>Voto do deputado <strong class="text-zinc-200">contra</strong> a matéria.</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-black px-2 py-1 rounded-lg border bg-yellow-800 text-yellow-100 border-yellow-700 flex-shrink-0">ABST</span>
                <span><strong class="text-zinc-200">Abstenção</strong> — presente na sessão mas optou por não votar. Não conta como SIM nem NÃO.</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-black px-2 py-1 rounded-lg border bg-orange-800 text-orange-100 border-orange-700 flex-shrink-0">OBST</span>
                <span><strong class="text-zinc-200">Obstrução</strong> — tática parlamentar onde o deputado se recusa a votar para prejudicar o quórum mínimo e impedir a aprovação.</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-900/50 text-emerald-400 border border-emerald-700/40 flex-shrink-0">✓ Aprovada</span>
                <span>A pauta foi <strong class="text-zinc-200">aprovada</strong> pela maioria do Plenário nesta votação.</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-900/50 text-red-400 border border-red-700/40 flex-shrink-0">✗ Rejeitada</span>
                <span>A pauta foi <strong class="text-zinc-200">rejeitada</strong> pela maioria do Plenário.</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700/40 flex-shrink-0">≡ Com maioria</span>
                <span>O deputado votou <strong class="text-zinc-200">do mesmo lado que ganhou</strong> — ex: votou SIM e a pauta foi aprovada.</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-900/40 text-orange-300 border border-orange-700/40 flex-shrink-0">≠ Contra maioria</span>
                <span>O deputado votou <strong class="text-zinc-200">do lado que perdeu</strong> — ex: votou NÃO mas a pauta foi aprovada.</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-violet-900/40 text-violet-400 border border-violet-700/40 font-bold flex-shrink-0">Nominal</span>
                <span>Votação <strong class="text-zinc-200">nominal</strong> — cada deputado vota individualmente e o voto fica registrado e público.</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-mono text-green-500 flex-shrink-0">300S / 150N / 12A</span>
                <span><strong class="text-zinc-200">Placar completo</strong> da votação — quantos deputados votaram SIM, NÃO e se abstiveram no total do Plenário.</span>
              </div>
            </div>
          </div>

          <!-- Filtros -->
          <div>
            <h4 class="text-white font-bold mb-1">🔎 Filtros</h4>
            <p class="leading-relaxed">Use os botões acima da lista para filtrar por tipo de voto. O campo de busca filtra por nome da proposição ou descrição da matéria em tempo real.</p>
          </div>

          <p class="text-zinc-600 text-[10px] border-t border-zinc-800 pt-2 mt-2">Fonte: Câmara dos Deputados — dadosabertos.camara.leg.br · Apenas votações nominais do Plenário (Órgão 180)</p>
        </div>
      </details>

      <!-- Resumo Estatístico -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <div class="bg-zinc-800/60 border border-zinc-700 rounded-xl p-3 text-center">
          <div class="text-xl font-black text-white">${total}</div>
          <div class="text-[10px] text-zinc-500 uppercase font-bold mt-0.5">Votações</div>
        </div>
        <div class="bg-zinc-800/60 border border-zinc-700 rounded-xl p-3 text-center">
          <div class="text-xl font-black text-green-400">${simPct}%</div>
          <div class="text-[10px] text-zinc-500 uppercase font-bold mt-0.5">SIM (${sim})</div>
        </div>
        <div class="bg-zinc-800/60 border border-zinc-700 rounded-xl p-3 text-center">
          <div class="text-xl font-black text-red-400">${naoPct}%</div>
          <div class="text-[10px] text-zinc-500 uppercase font-bold mt-0.5">NÃO (${nao})</div>
        </div>
        <div class="bg-zinc-800/60 border border-zinc-700 rounded-xl p-3 text-center">
          <div class="text-xl font-black ${alinhColor}">${alinhPct !== null ? alinhPct + '%' : '—'}</div>
          <div class="text-[10px] text-zinc-500 uppercase font-bold mt-0.5" title="% de votos alinhados com o resultado da pauta">Com maioria</div>
        </div>
      </div>

      <!-- Barra visual SIM / NÃO / ABST / obstrução / outros -->
      <div class="bg-zinc-800 rounded-full h-2 mb-1 overflow-hidden flex">
        <div class="bg-green-500 h-full" style="width:${simPct}%" title="SIM ${simPct}%"></div>
        <div class="bg-red-500 h-full" style="width:${naoPct}%" title="NÃO ${naoPct}%"></div>
        <div class="bg-yellow-500 h-full" style="width:${abstPct}%" title="ABST ${abstPct}%"></div>
        ${obstrucao > 0 ? `<div class="bg-orange-700 h-full" style="width:${obstrPct}%" title="Obstrução ${obstrPct}%"></div>` : ''}
        <div class="bg-zinc-700 h-full flex-1"></div>
      </div>
      <div class="flex gap-3 text-[10px] text-zinc-500 mb-4 flex-wrap">
        <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-green-500 inline-block"></span>SIM ${sim}</span>
        <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-red-500 inline-block"></span>NÃO ${nao}</span>
        ${abstencao > 0 ? `<span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-yellow-500 inline-block"></span>ABST ${abstencao}</span>` : ''}
        ${obstrucao > 0 ? `<span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-orange-700 inline-block"></span>Obstrução ${obstrucao}</span>` : ''}
        ${alinhPct !== null ? `<span class="ml-auto text-zinc-400 font-bold">↔ ${alinhado} com maioria · ${oposicao} contra</span>` : ''}
      </div>

      <!-- Busca textual -->
      <div class="mb-3">
        <input id="votesSearch" type="text" placeholder="🔍 Buscar por proposição ou descrição..."
          oninput="filterDeputyVotes()"
          class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-violet-500 transition">
      </div>

      <!-- Filtros por tipo de voto -->
      <div class="flex gap-2 mb-4 flex-wrap">
        <button onclick="filterDeputyVotes('todos')" id="vfilter-todos"
          class="px-3 py-1 text-xs font-bold rounded-full bg-violet-600 text-white">Todos (${total})</button>
        <button onclick="filterDeputyVotes('sim')" id="vfilter-sim"
          class="px-3 py-1 text-xs font-bold rounded-full bg-zinc-700 text-zinc-300 hover:bg-green-900 transition">✅ SIM (${sim})</button>
        <button onclick="filterDeputyVotes('nao')" id="vfilter-nao"
          class="px-3 py-1 text-xs font-bold rounded-full bg-zinc-700 text-zinc-300 hover:bg-red-900 transition">❌ NÃO (${nao})</button>
        ${abstencao > 0 ? `<button onclick="filterDeputyVotes('abst')" id="vfilter-abst"
          class="px-3 py-1 text-xs font-bold rounded-full bg-zinc-700 text-zinc-300 hover:bg-yellow-900 transition">⚪ ABST (${abstencao})</button>` : ''}
        ${obstrucao > 0 ? `<button onclick="filterDeputyVotes('obst')" id="vfilter-obst"
          class="px-3 py-1 text-xs font-bold rounded-full bg-zinc-700 text-zinc-300 hover:bg-orange-900 transition">🚧 Obstru. (${obstrucao})</button>` : ''}
        <button onclick="filterDeputyVotes('comMaioria')" id="vfilter-comMaioria"
          class="px-3 py-1 text-xs font-bold rounded-full bg-zinc-700 text-zinc-300 hover:bg-blue-900 transition">≡ Com maioria (${alinhado})</button>
        <button onclick="filterDeputyVotes('contraMaioria')" id="vfilter-contraMaioria"
          class="px-3 py-1 text-xs font-bold rounded-full bg-zinc-700 text-zinc-300 hover:bg-orange-900 transition">≠ Contra maioria (${oposicao})</button>
      </div>

      <!-- Lista de Votações -->
      <div id="votesListFiltered" class="space-y-2">
        ${dados.map(v => {
          const { raw: votoRaw, cat } = parseVoto(v);
          const ali = comMaioria(v, cat);

          const badgeStyle = cat === 'sim'  ? 'bg-green-800 text-green-100 border-green-700'
                           : cat === 'nao'  ? 'bg-red-800 text-red-100 border-red-700'
                           : cat === 'abst' ? 'bg-yellow-800 text-yellow-100 border-yellow-700'
                           : cat === 'obst' ? 'bg-orange-800 text-orange-100 border-orange-700'
                           : 'bg-zinc-700 text-zinc-300 border-zinc-600';

          const titulo = v.proposicaoObjeto || (v.descricao ? v.descricao.substring(0, 140) : 'Votação em Plenário');
          const sub    = (v.proposicaoObjeto && v.descricao)
            ? `<div class="text-zinc-500 text-xs mt-1 leading-relaxed line-clamp-2">${v.descricao}</div>` : '';

          const dataStr = window.formatDate(v.dataRegistroVoto || v.data || v.dataHoraRegistro || '');
          const alinhData = ali === true ? 'com' : ali === false ? 'contra' : 'neutro';

          return `
            <div class="bg-zinc-800/80 rounded-xl border border-zinc-700 hover:border-violet-600/50 transition p-3 flex gap-3 items-start"
                 data-vote="${cat}" data-alinhamento="${alinhData}"
                 data-texto="${(titulo + ' ' + (v.descricao||'')).toLowerCase()}">
              <!-- Badge voto -->
              <div class="flex-shrink-0 pt-0.5">
                <span class="inline-flex items-center justify-center text-xs font-black px-2 py-1 rounded-lg border ${badgeStyle} min-w-[44px] text-center leading-tight">
                  ${votoRaw}
                </span>
              </div>
              <!-- Conteúdo -->
              <div class="flex-1 min-w-0">
                <div class="text-white text-sm font-semibold leading-snug">${titulo}</div>
                ${sub}
                <!-- Meta row -->
                <div class="flex items-center gap-2 mt-2 flex-wrap">
                  <span class="text-zinc-600 text-xs">${dataStr}</span>
                  ${aprovacaoBadge(v)}
                  ${alinhamentoBadge(v, cat)}
                  ${tipoBadge(v)}
                  ${placarHtml(v)}
                  ${linkCamara(v)}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    wrapper.setAttribute("data-loaded", "true");
  } catch (e) {
    console.error('[Votes]', e);
    wrapper.innerHTML = '<div class="text-center text-red-500 py-4">Erro ao carregar votações.</div>';
  }
}

function filterDeputyVotes(filter) {
  // Se chamado sem argumento (input de busca), preservar filtro ativo
  if (filter === undefined) {
    const active = document.querySelector('#dcontent-votacoes button[id^="vfilter-"].bg-violet-600');
    filter = active ? active.id.replace('vfilter-', '') : 'todos';
  }

  // Atualizar botões
  document.querySelectorAll('#dcontent-votacoes button[id^="vfilter-"]').forEach(btn => {
    btn.className = btn.id === `vfilter-${filter}`
      ? 'px-3 py-1 text-xs font-bold rounded-full bg-violet-600 text-white'
      : 'px-3 py-1 text-xs font-bold rounded-full bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition';
  });

  const query = (document.getElementById('votesSearch')?.value || '').toLowerCase().trim();

  document.querySelectorAll('#votesListFiltered [data-vote]').forEach(el => {
    const cat     = el.getAttribute('data-vote');
    const alinha  = el.getAttribute('data-alinhamento');
    const texto   = el.getAttribute('data-texto') || '';

    const passFilter = filter === 'todos'         ? true
                     : filter === 'comMaioria'    ? alinha === 'com'
                     : filter === 'contraMaioria' ? alinha === 'contra'
                     : cat === filter;

    const passSearch = !query || texto.includes(query);

    if (passFilter && passSearch) el.classList.remove('hidden');
    else                          el.classList.add('hidden');
  });
}

function downloadExpensesCSV() {
  if (!currentExpensesData || currentExpensesData.length === 0) {
    alert(
      "Não há dados para exportar. Aguarde o carregamento ou altere os filtros.",
    );
    return;
  }

  // Cabeçalho do CSV
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent +=
    "Data,Fornecedor,CNPJ/CPF,Tipo Despesa,Valor Liquido,Link Nota\n";

  // Linhas
  currentExpensesData.forEach((d) => {
    const data = new Date(d.dataDocumento).toLocaleDateString("pt-BR");
    const fornecedor = d.nomeFornecedor.replace(/,/g, " "); // Remove vírgulas para não quebrar o CSV
    const cnpj = d.cnpjCpfFornecedor || "";
    const tipo = d.tipoDespesa.replace(/,/g, " ");
    const valor = parseFloat(d.valorLiquido).toFixed(2).replace(".", ",");
    const link = d.urlDocumento || "";

    csvContent += `${data},${fornecedor},${cnpj},${tipo},"${valor}",${link}\n`;
  });

  // Download
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  const fileName = `despesas_deputado_${new Date().getTime()}.csv`;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ── PROCESSOS JUDICIAIS — DataJud/CNJ ─────────────────────────────────────────
async function loadDeputyProcessos(id) {
  const container = document.getElementById('dcontent-processos');
  if (!container || container.getAttribute('data-loaded') === 'true') return;

  const d = currentDeputy;
  if (!d) return;

  const nomeCivil     = d.nomeCivil || d.ultimoStatus.nome || '';
  const nomeEleitoral = d.ultimoStatus.nomeEleitoral || '';
  const uf            = (d.ultimoStatus.siglaUf || '').toUpperCase();
  const ufLower       = uf.toLowerCase();

  // Links externos pré-preenchidos
  const nomeQ     = encodeURIComponent(nomeEleitoral || nomeCivil);
  const nomeCNJ   = encodeURIComponent(nomeCivil);
  const linkCNJ   = `https://www.cnj.jus.br/busca-de-jurisprudencia/`;
  const linkTRE   = `https://www.tre-${ufLower}.jus.br`;
  const linkTSE   = `https://www.tse.jus.br/jurisprudencia/pesquisa-de-jurisprudencia`;
  const linkSTJ   = `https://processo.stj.jus.br/processo/pesquisa/?tipo=tipoProcedimento&termo=${nomeQ}`;
  const linkConsulta = `https://cnj.jus.br/`;

  const GRAU_LABEL = { G1: '1° Grau', G2: '2° Grau', JE: 'Juizado Especial', STJ: 'STJ', STF: 'STF', TST: 'TST', TSE: 'TSE', SUP: 'Superior' };

  // Render da aba: formulário + links externos
  container.innerHTML = `
    <!-- Aviso LGPD -->
    <div class="bg-blue-950/40 border border-blue-800/50 rounded-xl p-4 mb-4 text-xs text-blue-200 leading-relaxed">
      <div class="font-bold text-blue-300 mb-1">ℹ️ Sobre a consulta processual</div>
      A API pública do DataJud (CNJ) não expõe nomes das partes por força da LGPD. Para busca por nome, use os portais oficiais abaixo. Para consultar um processo específico, informe o número CNJ.
    </div>

    <!-- Portais externos -->
    <div class="mb-5">
      <h4 class="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-3">🔍 Buscar por nome nos portais oficiais</h4>
      <div class="grid grid-cols-2 gap-2">
        <a href="${linkCNJ}" target="_blank" rel="noopener"
           class="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-violet-600 rounded-xl p-3 transition group">
          <span class="text-xl">⚖️</span>
          <div>
            <div class="text-white text-xs font-bold group-hover:text-violet-300">CNJ Consulta Pública</div>
            <div class="text-zinc-500 text-[10px]">Todos os tribunais</div>
          </div>
        </a>
        <a href="${linkTRE}" target="_blank" rel="noopener"
           class="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-violet-600 rounded-xl p-3 transition group">
          <span class="text-xl">🗳️</span>
          <div>
            <div class="text-white text-xs font-bold group-hover:text-violet-300">TRE-${uf}</div>
            <div class="text-zinc-500 text-[10px]">Tribunal Regional Eleitoral</div>
          </div>
        </a>
        <a href="${linkTSE}" target="_blank" rel="noopener"
           class="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-violet-600 rounded-xl p-3 transition group">
          <span class="text-xl">🏛️</span>
          <div>
            <div class="text-white text-xs font-bold group-hover:text-violet-300">TSE</div>
            <div class="text-zinc-500 text-[10px]">Tribunal Superior Eleitoral</div>
          </div>
        </a>
        <a href="${linkSTJ}" target="_blank" rel="noopener"
           class="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-violet-600 rounded-xl p-3 transition group">
          <span class="text-xl">📋</span>
          <div>
            <div class="text-white text-xs font-bold group-hover:text-violet-300">STJ</div>
            <div class="text-zinc-500 text-[10px]">Superior Tribunal de Justiça</div>
          </div>
        </a>
      </div>
    </div>

    <!-- Busca por número CNJ -->
    <div class="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 mb-4">
      <h4 class="text-zinc-300 text-xs font-bold uppercase tracking-wider mb-3">🔢 Consultar processo por número CNJ</h4>
      <div class="flex gap-2">
        <input id="input-numero-processo" type="text" placeholder="Ex: 1234567-89.2023.8.26.0001"
          class="flex-1 bg-zinc-900 border border-zinc-600 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-violet-500 placeholder-zinc-600 font-mono"
          onkeydown="if(event.key==='Enter') buscarProcessoCNJ()">
        <button onclick="buscarProcessoCNJ()"
          class="bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm px-4 py-2 rounded-lg transition flex-shrink-0">
          Buscar
        </button>
      </div>
      <p class="text-zinc-600 text-[10px] mt-1.5">Formato: NNNNNNN-DD.AAAA.J.TT.OOOO — número completo com 20 dígitos</p>
    </div>

    <!-- Resultado da busca -->
    <div id="resultado-processo" class="hidden"></div>

    <p class="text-zinc-600 text-xs mt-2 text-center">Dados via DataJud · api-publica.datajud.cnj.jus.br · CNJ</p>
  `;

  container.setAttribute('data-loaded', 'true');
}

async function buscarProcessoCNJ() {
  const input  = document.getElementById('input-numero-processo');
  const result = document.getElementById('resultado-processo');
  if (!input || !result) return;

  const numero = input.value.trim();
  if (!numero) {
    input.focus();
    return;
  }

  result.className = 'block';
  result.innerHTML = `
    <div class="flex items-center gap-2 text-zinc-400 text-sm py-4">
      <div class="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      Consultando DataJud em todos os tribunais...
    </div>`;

  const uf = currentDeputy?.ultimoStatus?.siglaUf?.toLowerCase() || '';

  try {
    const data = await fetchApi('datajud_processos', { numero, uf });

    if (data.erro) {
      result.innerHTML = `<div class="bg-yellow-950/30 border border-yellow-800/50 rounded-xl p-4 text-yellow-300 text-sm">⚠️ ${data.erro}</div>`;
      return;
    }

    const { total, processos } = data;
    const GRAU_LABEL = { G1: '1° Grau', G2: '2° Grau', JE: 'Juizado Especial', STJ: 'STJ', STF: 'STF', TST: 'TST', TSE: 'TSE' };

    if (total === 0 || processos.length === 0) {
      result.innerHTML = `
        <div class="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 text-center">
          <div class="text-zinc-400 text-sm mb-1">Processo não encontrado</div>
          <div class="text-zinc-600 text-xs">Verifique o número e tente novamente. Processos em segredo de justiça não são exibidos.</div>
        </div>`;
      return;
    }

    let html = `<div class="space-y-3">`;
    processos.forEach(proc => {
      const dataFmt = proc.dataAjuizamento
        ? new Date(proc.dataAjuizamento + 'T12:00:00').toLocaleDateString('pt-BR')
        : '–';
      const grauLabel = GRAU_LABEL[proc.grau] || proc.grau || '';
      const assuntosHtml = (proc.assuntos || []).map(a => `<span class="text-[10px] bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full">${a}</span>`).join('');
      const movHtml = proc.movimentos?.length > 0
        ? `<div class="mt-3 pt-3 border-t border-zinc-700/50">
             <div class="text-zinc-500 text-[10px] font-bold uppercase mb-1.5">Movimentações (${proc.movimentos.length})</div>
             <div class="space-y-1">
               ${proc.movimentos.slice(0, 5).map(m => {
                 const dt = m.data ? new Date(m.data + 'T12:00:00').toLocaleDateString('pt-BR') : '–';
                 return `<div class="flex gap-2 text-[11px]"><span class="text-zinc-600 flex-shrink-0">${dt}</span><span class="text-zinc-300">${m.nome}</span></div>`;
               }).join('')}
             </div>
           </div>`
        : '';

      html += `
        <div class="bg-zinc-800 border border-violet-700/40 rounded-xl p-4">
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex-1">
              <div class="flex items-center gap-2 flex-wrap mb-1.5">
                <span class="text-xs bg-violet-900/60 text-violet-300 border border-violet-700/50 px-2 py-0.5 rounded-full font-bold">${proc.tribunal || '–'}</span>
                ${grauLabel ? `<span class="text-[10px] bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full">${grauLabel}</span>` : ''}
                ${proc.nivelSigilo > 0 ? `<span class="text-[10px] bg-red-900/50 text-red-300 border border-red-700/50 px-2 py-0.5 rounded-full">🔒 Sigilo ${proc.nivelSigilo}</span>` : ''}
              </div>
              <div class="text-white font-bold text-sm font-mono">${proc.numero || '–'}</div>
              <div class="text-zinc-300 text-xs font-bold mt-0.5">${proc.classe || '–'}</div>
            </div>
            <div class="text-right flex-shrink-0">
              <div class="text-zinc-600 text-[10px]">Ajuizamento</div>
              <div class="text-zinc-300 text-xs font-bold">${dataFmt}</div>
            </div>
          </div>
          ${assuntosHtml ? `<div class="flex flex-wrap gap-1 mb-2">${assuntosHtml}</div>` : ''}
          <div class="text-zinc-500 text-xs">🏛️ ${proc.orgao || '–'} ${proc.sistema ? '· ' + proc.sistema : ''}</div>
          ${movHtml}
        </div>`;
    });
    html += `</div>`;

    result.innerHTML = html;

  } catch (e) {
    console.error(e);
    result.innerHTML = `<div class="text-red-400 text-sm p-4">Erro ao consultar DataJud. Tente novamente.</div>`;
  }
}

// ── NOTÍCIAS DO DEPUTADO ───────────────────────────────────────────────────────
async function loadDeputyNoticias(id) {
  const container = document.getElementById('dcontent-noticias');
  if (!container || container.getAttribute('data-loaded') === 'true') return;

  const d = currentDeputy;
  if (!d) return;

  const nome = d.ultimoStatus.nomeEleitoral || d.nomeCivil || '';

  container.innerHTML = `
    <div class="flex items-center justify-center gap-3 py-12 text-zinc-400">
      <div class="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      Buscando notícias na web...
    </div>`;

  try {
    const data = await fetchApi('noticias_deputado', { nome });

    if (data.erro) {
      container.innerHTML = `<div class="text-yellow-400 text-center py-8">⚠️ ${data.erro}</div>`;
      return;
    }

    const { noticias, total } = data;

    // Agrupa por data (hoje, esta semana, este mês, anterior)
    function categoriaData(dataISO) {
      if (!dataISO) return 'anterior';
      const hoje = new Date(); hoje.setHours(0,0,0,0);
      const d = new Date(dataISO + 'T00:00:00');
      const diff = Math.floor((hoje - d) / (24*3600*1000));
      if (diff === 0) return 'hoje';
      if (diff <= 7) return 'semana';
      if (diff <= 30) return 'mes';
      return 'anterior';
    }

    const CATEGORIA_LABEL = { hoje: '🔴 Hoje', semana: '📅 Esta semana', mes: '📆 Este mês', anterior: '📂 Anterior' };
    const grupos = {};
    noticias.forEach(n => {
      const cat = categoriaData(n.dataISO);
      if (!grupos[cat]) grupos[cat] = [];
      grupos[cat].push(n);
    });

    let html = `
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-white font-bold">Notícias sobre ${nome}</h3>
        <span class="text-zinc-500 text-xs">${total} resultado(s) · Google News</span>
      </div>`;

    if (noticias.length === 0) {
      html += `<div class="text-center text-zinc-500 py-8">Nenhuma notícia encontrada.</div>`;
    } else {
      for (const cat of ['hoje', 'semana', 'mes', 'anterior']) {
        if (!grupos[cat] || grupos[cat].length === 0) continue;
        html += `
          <div class="mb-1 mt-4">
            <span class="text-xs font-bold uppercase tracking-wider text-zinc-500">${CATEGORIA_LABEL[cat]}</span>
          </div>
          <div class="space-y-2">`;
        grupos[cat].forEach(n => {
          const fonteHtml = n.fonte ? `<span class="text-violet-400 font-bold">${n.fonte}</span> · ` : '';
          html += `
            <a href="${n.link}" target="_blank" rel="noopener noreferrer"
               class="block bg-zinc-800/70 border border-zinc-700 hover:border-violet-600 rounded-xl p-4 transition group">
              <div class="text-white text-sm font-bold group-hover:text-violet-300 transition leading-snug mb-1">${n.titulo}</div>
              <div class="flex items-center gap-2 text-[11px] text-zinc-500">
                ${fonteHtml}<span>${n.data}</span>
              </div>
              ${n.descricao ? `<div class="text-zinc-400 text-xs mt-1.5 leading-relaxed line-clamp-2">${n.descricao}</div>` : ''}
            </a>`;
        });
        html += `</div>`;
      }
    }

    html += `
      <div class="mt-4 pt-3 border-t border-zinc-800 text-center">
        <a href="https://news.google.com/search?q=${encodeURIComponent('"' + nome + '" deputado')}&hl=pt-BR&gl=BR&ceid=BR:pt"
           target="_blank" rel="noopener noreferrer"
           class="text-violet-400 text-sm hover:underline">Ver mais no Google News →</a>
        <p class="text-zinc-600 text-xs mt-1">Fonte: Google News RSS · Atualizado a cada 30 min</p>
      </div>`;

    container.innerHTML = html;
    container.setAttribute('data-loaded', 'true');

  } catch (e) {
    console.error(e);
    container.innerHTML = `<div class="text-red-400 text-center py-8">Erro ao buscar notícias.</div>`;
  }
}

// ── SHARE DEPUTY CARD ─────────────────────────────────────────────────────────

async function openShareDeputyModal(id) {
  const d = currentDeputy;
  if (!d) return;

  // Cria modal de compartilhamento
  const existingModal = document.getElementById('shareDeputyModal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.id = 'shareDeputyModal';
  modal.className = 'fixed inset-0 flex items-center justify-center p-4';
  modal.style.zIndex = '9999';
  modal.innerHTML = `
    <div class="absolute inset-0 bg-black/85" onclick="document.getElementById('shareDeputyModal').remove()"></div>
    <div class="relative bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl" style="z-index:1">
      <button onclick="document.getElementById('shareDeputyModal').remove()" class="absolute top-3 right-3 text-zinc-500 hover:text-white transition">✕</button>
      <h3 class="text-white font-bold text-lg mb-1">Compartilhar Raio-X</h3>
      <p class="text-zinc-500 text-xs mb-4">Gerando card com dados oficiais da Câmara...</p>
      <div id="shareCardPreview" class="flex justify-center mb-4">
        <div class="w-full h-48 bg-zinc-800 rounded-xl animate-pulse flex items-center justify-center text-zinc-600 text-sm">Gerando card...</div>
      </div>
      <div id="shareButtons" class="hidden space-y-3">
        <button onclick="downloadDeputyCard()" class="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold py-2.5 rounded-xl transition text-sm">
          📥 Salvar imagem
        </button>
        <div class="grid grid-cols-3 gap-2">
          <button onclick="shareToTwitter()" class="flex flex-col items-center gap-1 bg-[#0f1419] hover:bg-[#1a2332] border border-zinc-700 text-white font-bold py-3 rounded-xl transition text-xs">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.259 5.631L18.244 2.25zM17.083 20.75h1.833L6.917 4.083H4.958L17.083 20.75z"/></svg>
            X / Twitter
          </button>
          <button onclick="shareToWhatsApp()" class="flex flex-col items-center gap-1 bg-[#0a1f0a] hover:bg-[#0d2b0d] border border-zinc-700 text-white font-bold py-3 rounded-xl transition text-xs">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            WhatsApp
          </button>
          <button onclick="shareToTelegram()" class="flex flex-col items-center gap-1 bg-[#0a1929] hover:bg-[#0d2240] border border-zinc-700 text-white font-bold py-3 rounded-xl transition text-xs">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            Telegram
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Garante que há dados de despesas para o card
  if (currentExpensesData.length === 0 && d.id) {
    try {
      let year = new Date().getFullYear();
      let json = await api.camara(`deputados/${d.id}/despesas?ano=${year}&ordem=DESC&ordenarPor=dataDocumento&itens=100`);
      
      if (!json?.dados || json.dados.length === 0) {
        for (let i = 1; i <= 3; i++) {
            json = await api.camara(`deputados/${d.id}/despesas?ano=${year - i}&ordem=DESC&ordenarPor=dataDocumento&itens=100`);
            if (json?.dados?.length > 0) break;
        }
      }
      
      if (json?.dados?.length > 0) currentExpensesData = json.dados;
    } catch(e) {}
  }

  // Gera o card assíncrono
  const canvas = await generateDeputyCard(d);
  window._shareDeputyCanvas = canvas;

  const preview = document.getElementById('shareCardPreview');
  if (preview && canvas) {
    canvas.style.cssText = 'width:100%;border-radius:12px;display:block;';
    preview.innerHTML = '';
    preview.appendChild(canvas);
    const btns = document.getElementById('shareButtons');
    if (btns) btns.classList.remove('hidden');
  }
}

async function generateDeputyCard(d) {
  // Polyfill roundRect para Chrome < 99 / Safari < 15.4
  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
      const radius = typeof r === 'number' ? r : (Array.isArray(r) ? r[0] : 0);
      this.beginPath();
      this.moveTo(x + radius, y);
      this.lineTo(x + w - radius, y);
      this.quadraticCurveTo(x + w, y, x + w, y + radius);
      this.lineTo(x + w, y + h - radius);
      this.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      this.lineTo(x + radius, y + h);
      this.quadraticCurveTo(x, y + h, x, y + h - radius);
      this.lineTo(x, y + radius);
      this.quadraticCurveTo(x, y, x + radius, y);
      this.closePath();
    };
  }

  const ls = d.ultimoStatus;
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 520;
  const ctx = canvas.getContext('2d');

  // Fundo degradê escuro
  const bg = ctx.createLinearGradient(0, 0, 800, 520);
  bg.addColorStop(0, '#09090b');
  bg.addColorStop(1, '#18181b');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 800, 520);

  // Borda sutil
  ctx.strokeStyle = '#3f3f46';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(2, 2, 796, 516, 16);
  ctx.stroke();

  // Faixa roxa no topo
  const topBar = ctx.createLinearGradient(0, 0, 800, 0);
  topBar.addColorStop(0, '#7c3aed');
  topBar.addColorStop(1, '#4f46e5');
  ctx.fillStyle = topBar;
  ctx.beginPath();
  ctx.roundRect(2, 2, 796, 6, [14, 14, 0, 0]);
  ctx.fill();

  // Foto do deputado em círculo
  const photoX = 80, photoY = 80, photoR = 60;
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise((res) => {
      img.onload = res;
      img.onerror = res;
      img.src = ls.urlFoto || '';
      setTimeout(res, 3000);
    });
    if (img.complete && img.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(photoX, photoY, photoR, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, photoX - photoR, photoY - photoR, photoR * 2, photoR * 2);
      ctx.restore();
      ctx.strokeStyle = '#7c3aed';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(photoX, photoY, photoR + 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  } catch(e) {}

  // Nome
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
  ctx.fillText(ls.nomeEleitoral || d.nomeCivil, 168, 62);

  // Badge partido/UF
  const badgeText = `${ls.siglaPartido} · ${ls.siglaUf}`;
  ctx.fillStyle = '#7c3aed';
  ctx.beginPath();
  ctx.roundRect(168, 74, ctx.measureText(badgeText).width + 20, 24, 12);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.fillText(badgeText, 178, 90);

  // Situação + cargo
  ctx.fillStyle = '#a1a1aa';
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText(`${ls.situacao || 'Em exercício'} · ${ls.descricaoStatus || '57ª Legislatura'}`, 168, 116);

  // Email (se disponível)
  if (d.ultimoStatus?.email) {
    ctx.fillStyle = '#52525b';
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText(`✉ ${d.ultimoStatus.email}`, 168, 134);
  }

  // ── Linha 1 ─────────────────────────────────────────────────────────────────
  ctx.strokeStyle = '#27272a';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(32, 158); ctx.lineTo(768, 158); ctx.stroke();

  // ── 4 Métricas principais ────────────────────────────────────────────────────
  const totalGastos = currentExpensesData.length > 0
    ? currentExpensesData.reduce((a, c) => a + (parseFloat(c.valorLiquido) || 0), 0)
    : null;
  const numDespesas = currentExpensesData.length;

  const metrics = [
    { label: 'Gastos ' + new Date().getFullYear(), value: totalGastos ? 'R$ ' + totalGastos.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}) : '— sem dados —', color: '#f87171' },
    { label: 'Nº de despesas', value: numDespesas > 0 ? String(numDespesas) : '—', color: '#fb923c' },
    { label: 'Partido', value: ls.siglaPartido || '—', color: '#a78bfa' },
    { label: 'Estado', value: ls.siglaUf || '—', color: '#60a5fa' },
  ];

  metrics.forEach((m, i) => {
    const x = 32 + (i * 185);
    const y = 172;
    ctx.fillStyle = '#18181b';
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(x, y, 174, 72, 10); ctx.fill(); ctx.stroke();
    ctx.fillStyle = m.color;
    ctx.font = 'bold 15px system-ui, sans-serif';
    const vw = ctx.measureText(m.value).width;
    // Se o texto for longo, usa font menor
    if (vw > 160) {
      ctx.font = 'bold 11px system-ui, sans-serif';
    }
    ctx.fillText(m.value.length > 20 ? m.value.slice(0, 19) + '…' : m.value, x + (174 - Math.min(vw, 160)) / 2, y + 30);
    ctx.fillStyle = '#71717a';
    ctx.font = '11px system-ui, sans-serif';
    const lw = ctx.measureText(m.label).width;
    ctx.fillText(m.label, x + (174 - lw) / 2, y + 52);
  });

  // ── Linha 2 ─────────────────────────────────────────────────────────────────
  ctx.strokeStyle = '#27272a';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(32, 260); ctx.lineTo(768, 260); ctx.stroke();

  // ── Top categorias de gasto ──────────────────────────────────────────────────
  ctx.fillStyle = '#71717a';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillText('PRINCIPAIS CATEGORIAS DE DESPESA', 32, 278);

  if (currentExpensesData.length > 0) {
    // Agrupar por tipo de despesa
    const byTipo = {};
    currentExpensesData.forEach(e => {
      const t = e.tipoDespesa || 'Outros';
      byTipo[t] = (byTipo[t] || 0) + (parseFloat(e.valorLiquido) || 0);
    });
    const sorted = Object.entries(byTipo).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const maxVal = sorted[0]?.[1] || 1;
    const barColors = ['#a78bfa', '#60a5fa', '#34d399', '#fb923c'];
    const barAreaWidth = 736; // 768 - 32

    sorted.forEach(([tipo, val], i) => {
      const y = 292 + i * 38;
      const labelMaxW = 260;
      const barStartX = 32 + labelMaxW + 10;
      const barMaxW = barAreaWidth - labelMaxW - 100; // deixa espaço pro valor
      const barW = Math.max(4, (val / maxVal) * barMaxW);
      const barH = 16;
      const barY = y + 2;

      // Label (truncado)
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '11px system-ui, sans-serif';
      let label = tipo.length > 32 ? tipo.slice(0, 31) + '…' : tipo;
      ctx.fillText(label, 32, y + 14);

      // Barra de fundo
      ctx.fillStyle = '#27272a';
      ctx.beginPath(); ctx.roundRect(barStartX, barY, barMaxW, barH, 4); ctx.fill();

      // Barra de valor
      ctx.fillStyle = barColors[i % barColors.length];
      ctx.beginPath(); ctx.roundRect(barStartX, barY, barW, barH, 4); ctx.fill();

      // Valor
      ctx.fillStyle = barColors[i % barColors.length];
      ctx.font = 'bold 11px system-ui, sans-serif';
      const valStr = 'R$ ' + val.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});
      ctx.fillText(valStr, barStartX + barMaxW + 8, y + 14);
    });
  } else {
    ctx.fillStyle = '#3f3f46';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText('Abra a aba "Despesas" no modal para carregar os dados de gastos.', 32, 300);
  }

  // ── Linha 3 ─────────────────────────────────────────────────────────────────
  ctx.strokeStyle = '#27272a';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(32, 450); ctx.lineTo(768, 450); ctx.stroke();

  // Nota de fonte
  ctx.fillStyle = '#3f3f46';
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillText('Dados oficiais via API pública da Câmara dos Deputados · dados.camara.leg.br', 32, 442);

  // ── Rodapé ───────────────────────────────────────────────────────────────────
  const logoGrad = ctx.createLinearGradient(32, 0, 200, 0);
  logoGrad.addColorStop(0, '#a78bfa');
  logoGrad.addColorStop(1, '#818cf8');
  ctx.fillStyle = logoGrad;
  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.fillText('Hyper Z', 32, 482);

  ctx.fillStyle = '#52525b';
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText('Portal de Transparência Política', 104, 482);

  ctx.fillStyle = '#7c3aed';
  ctx.font = 'bold 12px system-ui, sans-serif';
  const url = 'hyperzcommunity.com/transparencia';
  ctx.fillText(url, 800 - ctx.measureText(url).width - 32, 482);

  // Selo "dados oficiais"
  ctx.fillStyle = '#052e16';
  ctx.strokeStyle = '#166534';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(32, 494, 126, 20, 10); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#86efac';
  ctx.font = 'bold 10px system-ui, sans-serif';
  ctx.fillText('✓ Fonte: Câmara Oficial', 42, 508);

  // Selo HyperZ
  ctx.fillStyle = '#1e1b4b';
  ctx.strokeStyle = '#4338ca';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(168, 494, 100, 20, 10); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#a5b4fc';
  ctx.font = 'bold 10px system-ui, sans-serif';
  ctx.fillText('HyperZ Community', 176, 508);

  return canvas;
}

function downloadDeputyCard() {
  const canvas = window._shareDeputyCanvas;
  if (!canvas) return;
  const d = currentDeputy;
  const name = (d?.ultimoStatus?.nomeEleitoral || 'deputado').replace(/\s+/g, '-').toLowerCase();
  const link = document.createElement('a');
  link.download = `raio-x-${name}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function _buildShareText() {
  const d = currentDeputy;
  if (!d) return '';
  const ls = d.ultimoStatus;
  const totalGastos = currentExpensesData.length > 0
    ? currentExpensesData.reduce((a, c) => a + (parseFloat(c.valorLiquido) || 0), 0)
    : null;
  const gastosStr = totalGastos
    ? `Gastos ${new Date().getFullYear()}: R$ ${totalGastos.toLocaleString('pt-BR', {minimumFractionDigits:2})}`
    : '';
  return `🏛️ Raio-X: ${ls.nomeEleitoral} (${ls.siglaPartido}-${ls.siglaUf})\n${gastosStr}\n\nDados oficiais da Câmara dos Deputados.\nConsulte qualquer deputado:\nhttps://hyperzcommunity.com/transparencia`;
}

function shareToTwitter() {
  const text = encodeURIComponent(_buildShareText());
  window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
}

function shareToWhatsApp() {
  const text = encodeURIComponent(_buildShareText());
  window.open(`https://wa.me/?text=${text}`, '_blank');
}

function shareToTelegram() {
  const text = encodeURIComponent(_buildShareText());
  window.open(`https://t.me/share/url?url=https://hyperzcommunity.com/transparencia&text=${text}`, '_blank');
}
