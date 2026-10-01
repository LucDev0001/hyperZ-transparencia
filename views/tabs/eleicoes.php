<!-- Conteúdo: Eleições & TSE -->
<div id="content-eleicoes" class="hidden animate-fade-in space-y-6">

    <!-- Cabeçalho e Tutorial Moderno -->
    <div class="glass-panel p-8 rounded-[2.5rem] border-t-4 border-t-violet-500 shadow-2xl relative overflow-hidden">
        <div class="relative z-10">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h2 class="text-3xl font-black text-white tracking-tighter mb-2 italic">CENTRAL DE INTELIGÊNCIA ELEITORAL</h2>
                    <p class="text-zinc-400 text-sm font-medium max-w-xl">Investigação profunda de candidatos, bens e propostas com dados brutos do TSE.</p>
                </div>
                
                <!-- Seletor de Ano -->
                <div class="bg-zinc-900/80 p-1.5 rounded-2xl border border-white/10 flex w-full md:w-auto shadow-2xl">
                    <button onclick="setElectionYear(2022)" id="tseYearBtn2022" class="flex-1 md:flex-none px-10 py-3 rounded-xl text-xs font-black transition-all bg-violet-600 text-white">2022 GERAL</button>
                    <button onclick="setElectionYear(2024)" id="tseYearBtn2024" class="flex-1 md:flex-none px-10 py-3 rounded-xl text-xs font-black transition-all text-zinc-500 hover:text-white">2024 MUNICIPAL</button>
                </div>
            </div>

            <!-- GUIA VISUAL -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                    <span class="w-10 h-10 rounded-full bg-violet-600/20 text-violet-400 flex items-center justify-center font-black">1</span>
                    <p class="text-zinc-400 text-[10px] font-bold uppercase leading-tight">Escolha o ano da eleição acima.</p>
                </div>
                <div class="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                    <span class="w-10 h-10 rounded-full bg-violet-600/20 text-violet-400 flex items-center justify-center font-black">2</span>
                    <p class="text-zinc-400 text-[10px] font-bold uppercase leading-tight">Clique no seu estado no mapa interativo.</p>
                </div>
                <div class="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                    <span class="w-10 h-10 rounded-full bg-violet-600/20 text-violet-400 flex items-center justify-center font-black">3</span>
                    <p class="text-zinc-400 text-[10px] font-bold uppercase leading-tight">Abra o dossiê para ver bens e fotos.</p>
                </div>
            </div>
        </div>
    </div>

    <!-- AREA DO MAPA E FILTROS -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- MAPA LEAFLET -->
        <div class="lg:col-span-7 space-y-4">
            <div class="glass-panel p-4 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
                <div id="tseMap" class="w-full h-[500px] rounded-[2rem] z-10"></div>
                <div class="absolute top-8 left-8 z-20 pointer-events-none">
                    <div id="selected-state-info" class="hidden px-6 py-3 rounded-2xl bg-black/80 backdrop-blur-xl border border-violet-500/30 shadow-2xl animate-fade-in">
                        <span class="text-[9px] font-black text-zinc-500 uppercase block mb-1">Estado Focado</span>
                        <span id="active-uf-display" class="text-white font-black text-xl tracking-tighter">--</span>
                    </div>
                </div>
            </div>
            <p class="text-center text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em]">Use o mouse ou toque para navegar e selecione o estado</p>
        </div>

        <!-- REFINAMENTO DA BUSCA -->
        <div class="lg:col-span-5 space-y-6">
            <div class="glass-panel p-8 rounded-[2.5rem] border border-white/5 shadow-2xl h-full flex flex-col">
                <h3 class="text-white font-black text-sm uppercase tracking-widest mb-8 flex items-center gap-3">
                    <span class="w-8 h-8 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center text-xs">🛠️</span>
                    Configurar Investigação
                </h3>
                
                <div class="space-y-8 flex-1">
                    <!-- Cargo -->
                    <div class="space-y-3">
                        <label class="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">Selecione o Cargo</label>
                        <select id="tseRole" class="w-full bg-zinc-950 border border-white/10 text-white rounded-2xl px-6 py-5 text-sm focus:border-violet-500 outline-none appearance-none cursor-pointer font-bold shadow-2xl transition-all" onchange="searchCandidates()">
                            <optgroup label="ELEIÇÃO GERAL 2022" id="tseRoleGeral">
                                <option value="1">Presidente da República</option>
                                <option value="3">Governador</option>
                                <option value="5">Senador</option>
                                <option value="6" selected>Deputado Federal</option>
                                <option value="7">Deputado Estadual</option>
                            </optgroup>
                            <optgroup label="ELEIÇÃO MUNICIPAL 2024" id="tseRoleMun" class="hidden">
                                <option value="1">Prefeito</option>
                                <option value="11">Vereador</option>
                                <option value="13">Vice-Prefeito</option>
                            </optgroup>
                        </select>
                    </div>

                    <!-- Município (Dinâmico) -->
                    <div id="tseCityContainer" class="hidden space-y-3 animate-slide-up">
                        <label class="text-[9px] font-black text-violet-400 uppercase tracking-widest px-1">Escolha a Cidade</label>
                        <select id="tseCityCode" class="w-full bg-zinc-950 border border-violet-500/20 text-white rounded-2xl px-6 py-5 text-sm focus:border-violet-500 outline-none appearance-none cursor-pointer font-black shadow-2xl" onchange="searchCandidates()">
                            <option value="">Clique no mapa primeiro...</option>
                        </select>
                    </div>

                    <!-- Nome -->
                    <div class="space-y-3">
                        <label class="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">Refinar por Nome/Número</label>
                        <input id="tseSearch" type="text" placeholder="Digite para filtrar instantaneamente..."
                               class="w-full bg-zinc-950 border border-white/5 text-white rounded-2xl px-6 py-5 text-sm focus:border-violet-500 outline-none placeholder-zinc-800 shadow-inner font-medium uppercase tracking-tighter"
                               onkeyup="searchCandidates()">
                    </div>
                </div>

                <div class="mt-8 pt-8 border-t border-white/5">
                    <div class="flex items-center gap-4 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                        <span class="text-xl">ℹ️</span>
                        <p class="text-[10px] text-zinc-500 font-bold leading-relaxed uppercase">
                            Para **Presidente (2022)**, o mapa é ignorado pois a consulta é Nacional.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- RESULTADOS DA BUSCA -->
    <div id="tseResults" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 min-h-[400px]">
        <div class="col-span-full flex flex-col items-center justify-center py-40 bg-zinc-900/10 rounded-[3rem] border-2 border-dashed border-white/5">
            <div class="text-6xl mb-6 opacity-10">🕵️‍♂️</div>
            <h3 class="text-zinc-600 font-black text-sm uppercase tracking-[0.4em]">Aguardando Alvo de Investigação</h3>
            <p class="text-zinc-700 text-[10px] mt-3 font-bold uppercase">Utilize o mapa para listar os políticos desta região</p>
        </div>
    </div>
</div>

<!-- MODAL DE DOSSIÊ HACKER -->
<div id="tseCandidateModal" class="fixed inset-0 z-[100] hidden flex items-center justify-center bg-black/90 backdrop-blur-3xl p-4">
    <div class="w-full max-w-5xl h-full max-h-[90vh] bg-zinc-950 border border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,1)] overflow-hidden relative flex flex-col animate-fade-in">
        <!-- Botão fechar fixo no topo do modal -->
        <div class="flex justify-end p-4 flex-shrink-0 z-20 border-b border-white/5">
            <button onclick="closeTseModal()" class="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-zinc-900/80 backdrop-blur-md hover:bg-red-500/20 hover:text-red-500 text-white flex items-center justify-center transition-all border border-white/5 active:scale-90">
                <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
        </div>
        <!-- Área interna com scroll -->
        <div id="tseCandidateContent" class="overflow-y-auto flex-1 custom-scrollbar"></div>
    </div>
</div>

<style>
    /* Estilo customizado para o Leaflet no tema Dark Hacker */
    .leaflet-container { background: #09090b !important; }
    .leaflet-vignette { box-shadow: inset 0 0 100px rgba(0,0,0,0.8); }
    .state-feature { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); outline: none; }
    .state-feature:hover { fill-opacity: 0.8 !important; stroke: #fff !important; stroke-width: 2px !important; cursor: crosshair; }
    .state-active { fill: #7c3aed !important; fill-opacity: 0.9 !important; stroke: #fff !important; stroke-width: 2.5px !important; }
    
    /* Remove as marcas d'água do Leaflet */
    .leaflet-control-attribution { display: none !important; }
</style>
