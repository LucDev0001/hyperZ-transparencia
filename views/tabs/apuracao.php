<!-- Conteúdo: Apuração Ao Vivo (TSE) -->
<<<<<<< HEAD
<div id="content-apuracao" class="hidden animate-fade-in space-y-8 relative">

    <!-- Efeito de Fundo Animado -->
    <div class="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full animate-pulse"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" style="animation-delay: 2s;"></div>
    </div>

    <!-- Cabeçalho Principal -->
    <div class="glass-panel p-8 rounded-[2.5rem] border-t-4 border-t-emerald-500 shadow-2xl relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-900/50 z-10">
        <div class="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none"></div>
        
        <div class="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
            <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                    <span class="relative flex h-4 w-4">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                    </span>
                    <h2 class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 tracking-tighter uppercase">Central de Apuração TSE</h2>
                </div>
                <p class="text-zinc-400 text-sm font-medium max-w-2xl leading-relaxed">
                    Acompanhamento em tempo real do <strong>2º Turno das Eleições 2026</strong>. Dados oficiais com projeções matemáticas e análises estatísticas em tempo real.
                </p>
            </div>
            
            <div class="flex flex-wrap gap-3">
                <!-- Contador de Viewers -->
                <div class="bg-black/50 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3">
                    <svg class="w-5 h-5 text-red-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    <div class="flex flex-col">
                        <span class="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Pessoas assistindo</span>
                        <span id="live-viewers-count" class="text-sm font-black text-white">0</span>
                    </div>
                </div>

                <div class="bg-black/50 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3">
                    <div class="flex flex-col">
                        <span class="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Status da Conexão</span>
                        <span id="apuracao-status" class="text-xs font-black text-green-400">CONECTADO</span>
                    </div>
                </div>
                <div class="bg-black/50 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3">
                    <div class="flex flex-col">
                        <span class="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Última Atualização</span>
                        <span id="apuracao-time" class="text-xs font-black text-white font-mono">--:--:--</span>
                    </div>
=======
<div id="content-apuracao" class="hidden animate-fade-in space-y-6">

    <!-- Cabeçalho -->
    <div class="glass-panel p-8 rounded-[2.5rem] border-t-4 border-t-red-500 shadow-2xl relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-red-950/20">
        <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
                <div class="flex items-center gap-3 mb-2">
                    <span class="relative flex h-4 w-4">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                    </span>
                    <h2 class="text-3xl font-black text-white tracking-tighter italic uppercase">Apuração Oficial TSE</h2>
                </div>
                <p class="text-zinc-400 text-sm font-medium max-w-xl">Acompanhe em tempo real os resultados das Eleições 2026, com dados diretos do Tribunal Superior Eleitoral.</p>
            </div>
            
            <div class="flex gap-2">
                <div class="bg-zinc-900/80 px-4 py-2 rounded-xl border border-white/10 shadow-2xl flex items-center gap-2">
                    <span class="text-[10px] text-zinc-500 font-bold uppercase">Status:</span>
                    <span id="apuracao-status" class="text-xs font-black text-green-400">AGUARDANDO DADOS</span>
                </div>
                <div class="bg-zinc-900/80 px-4 py-2 rounded-xl border border-white/10 shadow-2xl flex items-center gap-2">
                    <span class="text-[10px] text-zinc-500 font-bold uppercase">Última Atualização:</span>
                    <span id="apuracao-time" class="text-xs font-black text-white">--:--:--</span>
>>>>>>> 82a4ad26265e16bed46541c79c86c12fcac0d450
                </div>
            </div>
        </div>
    </div>

<<<<<<< HEAD
    <!-- Filtros Inteligentes -->
    <div class="glass-panel p-6 rounded-[2rem] border border-white/5 shadow-2xl relative z-10 bg-zinc-950/80 backdrop-blur-xl">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
            <!-- Cargo (Fixado para 2º Turno 2026) -->
            <div class="space-y-2">
                <label class="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 flex items-center gap-2">
                    <svg class="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    Cargo em Disputa
                </label>
                <div class="relative">
                    <select id="apuracao-cargo" class="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none appearance-none cursor-pointer font-bold transition-all" onchange="Apuracao.onFilterChange()">
                        <optgroup label="2º TURNO - ELEIÇÕES 2026">
                            <option value="1|6258" selected>Presidente da República</option>
                        </optgroup>
                    </select>
                    <div class="absolute right-3 top-[14px] text-zinc-500 pointer-events-none">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
=======
    <!-- Filtros de Busca -->
    <div class="glass-panel p-6 rounded-[2rem] border border-white/5 shadow-2xl relative">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <!-- Tipo de Eleição / Cargo -->
            <div class="space-y-2">
                <label class="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">Cargo Desejado</label>
                <select id="apuracao-cargo" class="w-full bg-zinc-950 border border-red-500/20 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none appearance-none cursor-pointer font-bold shadow-inner transition-all" onchange="Apuracao.onFilterChange()">
                    <optgroup label="ELEIÇÃO GERAL FEDERAL (6257)">
                        <option value="1|6257" selected>Presidente da República</option>
                    </optgroup>
                </select>
>>>>>>> 82a4ad26265e16bed46541c79c86c12fcac0d450
            </div>

            <!-- UF -->
            <div class="space-y-2">
<<<<<<< HEAD
                <label class="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 flex items-center gap-2">
                    <svg class="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Filtro Regional
                </label>
                <div class="relative">
                    <select id="apuracao-uf" class="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none appearance-none cursor-pointer font-bold transition-all" onchange="Apuracao.onFilterChange()">
                        <option value="br" selected>Brasil (Visão Nacional)</option>
                        <option value="ac">Acre</option>
                        <option value="al">Alagoas</option>
                        <option value="ap">Amapá</option>
                        <option value="am">Amazonas</option>
                        <option value="ba">Bahia</option>
                        <option value="ce">Ceará</option>
                        <option value="df">Distrito Federal</option>
                        <option value="es">Espírito Santo</option>
                        <option value="go">Goiás</option>
                        <option value="ma">Maranhão</option>
                        <option value="mt">Mato Grosso</option>
                        <option value="ms">Mato Grosso do Sul</option>
                        <option value="mg">Minas Gerais</option>
                        <option value="pa">Pará</option>
                        <option value="pb">Paraíba</option>
                        <option value="pr">Paraná</option>
                        <option value="pe">Pernambuco</option>
                        <option value="pi">Piauí</option>
                        <option value="rj">Rio de Janeiro</option>
                        <option value="rn">Rio Grande do Norte</option>
                        <option value="rs">Rio Grande do Sul</option>
                        <option value="ro">Rondônia</option>
                        <option value="rr">Roraima</option>
                        <option value="sc">Santa Catarina</option>
                        <option value="sp">São Paulo</option>
                        <option value="se">Sergipe</option>
                        <option value="to">Tocantins</option>
                        <option value="zz">Exterior</option>
                    </select>
                    <div class="absolute right-3 top-[14px] text-zinc-500 pointer-events-none">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>

            <div class="space-y-2 relative" id="apuracao-mun-container">
                <label class="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Município (Em breve)</label>
                <div class="relative">
                    <input id="apuracao-municipio" type="text" placeholder="Busca Indisponível" disabled class="w-full bg-black/20 border border-white/5 text-zinc-600 rounded-xl px-4 py-3 text-sm outline-none font-bold cursor-not-allowed">
                    <div class="absolute right-3 top-[14px] text-zinc-600">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
=======
                <label class="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">Estado (UF)</label>
                <select id="apuracao-uf" class="w-full bg-zinc-950 border border-white/5 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none appearance-none cursor-pointer font-bold shadow-inner transition-all" onchange="Apuracao.onFilterChange()">
                    <option value="br" selected>Brasil (Nacional)</option>
                    <option value="ac">Acre</option>
                    <option value="al">Alagoas</option>
                    <option value="ap">Amapá</option>
                    <option value="am">Amazonas</option>
                    <option value="ba">Bahia</option>
                    <option value="ce">Ceará</option>
                    <option value="df">Distrito Federal</option>
                    <option value="es">Espírito Santo</option>
                    <option value="go">Goiás</option>
                    <option value="ma">Maranhão</option>
                    <option value="mt">Mato Grosso</option>
                    <option value="ms">Mato Grosso do Sul</option>
                    <option value="mg">Minas Gerais</option>
                    <option value="pa">Pará</option>
                    <option value="pb">Paraíba</option>
                    <option value="pr">Paraná</option>
                    <option value="pe">Pernambuco</option>
                    <option value="pi">Piauí</option>
                    <option value="rj">Rio de Janeiro</option>
                    <option value="rn">Rio Grande do Norte</option>
                    <option value="rs">Rio Grande do Sul</option>
                    <option value="ro">Rondônia</option>
                    <option value="rr">Roraima</option>
                    <option value="sc">Santa Catarina</option>
                    <option value="sp">São Paulo</option>
                    <option value="se">Sergipe</option>
                    <option value="to">Tocantins</option>
                    <option value="zz">Exterior</option>
                </select>
            </div>

            <!-- Pesquisa de Município (Para Prefeitos - se aplicável no futuro, mas TSE manda BR/UF para gerais) -->
            <div class="space-y-2 relative" id="apuracao-mun-container">
                <label class="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">Município (Em breve)</label>
                <input id="apuracao-municipio" type="text" placeholder="Ex: São Paulo" class="w-full bg-zinc-950 border border-white/5 text-white rounded-xl px-4 py-3 text-sm outline-none font-bold focus:border-red-500 transition-all shadow-inner" onclick="typeof showToast === 'function' && showToast('A busca por município será ativada com os códigos do TSE na véspera da eleição.', 'info')">
                <div class="absolute right-3 top-[34px] text-zinc-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
>>>>>>> 82a4ad26265e16bed46541c79c86c12fcac0d450
                </div>
            </div>

            <!-- Auto-Refresh -->
            <div class="space-y-2 flex flex-col justify-end">
<<<<<<< HEAD
                <button onclick="Apuracao.fetchResults()" id="apuracao-btn-update" class="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black uppercase text-xs py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                    Sincronizar Dados
=======
                <button onclick="Apuracao.fetchResults()" id="apuracao-btn-update" class="w-full bg-red-600 hover:bg-red-500 text-white font-black uppercase text-xs py-3 rounded-xl transition-all shadow-lg shadow-red-900/50 flex items-center justify-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                    Atualizar Agora
>>>>>>> 82a4ad26265e16bed46541c79c86c12fcac0d450
                </button>
            </div>
        </div>
    </div>

<<<<<<< HEAD
    <!-- MAIN DASHBOARD PARA PRESIDENTE 2º TURNO -->
    <div id="president-super-dashboard" class="hidden animate-slide-up z-10 relative">
        <div class="glass-panel p-1 rounded-[3rem] bg-gradient-to-br from-white/10 to-transparent shadow-[0_0_50px_rgba(255,255,255,0.05)]">
            <div class="bg-zinc-950/90 rounded-[2.8rem] p-6 md:p-10 relative overflow-hidden backdrop-blur-3xl">
                <!-- Efeito Glimmer -->
                <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20"></div>
                <div class="absolute -right-40 -top-40 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>
                
                <!-- HEADER SUPER DASHBOARD -->
                <div class="flex flex-col lg:flex-row justify-between items-center border-b border-white/5 pb-8 mb-8 relative z-10 gap-6">
                    <div class="text-center lg:text-left">
                        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.2em] mb-3">
                            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Análise Estatística Avançada
                        </div>
                        <h3 class="text-3xl md:text-5xl font-black text-white tracking-tighter">
                            Confronto Direto
                        </h3>
                        <div id="pres-status-badge" class="hidden mt-4"></div>
                    </div>
                    
                    <div class="flex gap-8 items-center bg-black/40 p-5 rounded-3xl border border-white/5">
                        <div class="text-center">
                            <div class="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Seções Apuradas</div>
                            <div id="pres-urnas-pct" class="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200 drop-shadow-lg">0,00%</div>
                        </div>
                        <div class="w-px h-16 bg-white/10"></div>
                        <div class="text-center">
                            <div class="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Diferença</div>
                            <div id="pres-diff-votos" class="text-xl md:text-2xl font-black text-white">0</div>
                            <div class="text-[10px] text-zinc-500 uppercase font-bold mt-1">votos</div>
                        </div>
                    </div>
                </div>

                <!-- CANDIDATOS HEAD TO HEAD -->
                <div class="flex flex-col relative z-10">
                    
                    <!-- Candidato 1 -->
                    <div class="flex flex-col md:flex-row justify-between items-center md:items-end mb-6 gap-6">
                        <div class="flex items-center gap-5 w-full md:w-auto justify-center md:justify-start">
                            <div class="relative group">
                                <div class="w-24 h-24 md:w-28 md:h-28 bg-zinc-900 rounded-3xl border-4 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)] overflow-hidden flex items-center justify-center relative z-10 transform transition-transform group-hover:scale-105">
                                    <span id="pres-cand1-initial" class="text-5xl font-black text-zinc-700">?</span>
                                    <img id="pres-cand1-img" src="" class="hidden w-full h-full object-cover" alt="Candidato 1">
                                </div>
                                <div class="absolute -bottom-3 -right-3 w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl border-2 border-zinc-900 flex items-center justify-center text-lg shadow-xl z-20">🥇</div>
                            </div>
                            <div class="text-center md:text-left">
                                <div id="pres-cand1-name" class="text-white font-black text-3xl md:text-4xl tracking-tight">Aguardando</div>
                                <div class="flex items-center justify-center md:justify-start gap-2 mt-2">
                                    <span id="pres-cand1-partido" class="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-zinc-300 font-bold uppercase tracking-widest">---</span>
                                </div>
                            </div>
                        </div>
                        <div class="text-center md:text-right w-full md:w-auto bg-black/30 p-4 rounded-2xl border border-white/5 md:border-none md:bg-transparent md:p-0">
                            <div class="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-1">Votação Computada</div>
                            <div id="pres-cand1-pct" class="text-5xl md:text-6xl font-black text-white tracking-tighter drop-shadow-md">0,00%</div>
                            <div id="pres-cand1-votos" class="text-sm text-zinc-400 font-medium mt-1 font-mono">0 votos válidos</div>
                        </div>
                    </div>
                    
                    <!-- PROGRESS BAR DUPLA -->
                    <div class="relative py-8">
                        <div class="w-full h-8 bg-zinc-950 border border-white/10 rounded-full overflow-hidden flex relative shadow-inner">
                            <div id="pres-bar1" class="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-1000 ease-out relative" style="width: 50%">
                                <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xNSIvPjwvc3ZnPg==')] opacity-30"></div>
                            </div>
                            <div class="absolute left-1/2 top-0 bottom-0 w-2 bg-zinc-900 z-10 skew-x-12 transform -translate-x-1/2 flex items-center justify-center">
                                <div class="w-0.5 h-full bg-white/20"></div>
                            </div>
                            <div id="pres-bar2" class="h-full bg-gradient-to-l from-rose-600 to-rose-400 transition-all duration-1000 ease-out relative" style="width: 50%">
                                <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xNSIvPjwvc3ZnPg==')] opacity-30"></div>
                            </div>
                        </div>
                        <div class="absolute left-1/2 -top-2 transform -translate-x-1/2 bg-zinc-800 text-white text-[9px] font-black uppercase px-2 py-1 rounded border border-white/10">Marco 50%</div>
                    </div>

                    <!-- Candidato 2 -->
                    <div class="flex flex-col md:flex-row-reverse justify-between items-center md:items-start mt-2 gap-6">
                        <div class="flex items-center gap-5 w-full md:w-auto flex-row-reverse justify-center md:justify-start text-center md:text-right">
                            <div class="relative group">
                                <div class="w-20 h-20 md:w-24 md:h-24 bg-zinc-900 rounded-3xl border-4 border-rose-500 shadow-[0_0_30px_rgba(225,29,72,0.2)] overflow-hidden flex items-center justify-center relative z-10 transform transition-transform group-hover:scale-105">
                                    <span id="pres-cand2-initial" class="text-4xl font-black text-zinc-700">?</span>
                                    <img id="pres-cand2-img" src="" class="hidden w-full h-full object-cover" alt="Candidato 2">
                                </div>
                                <div class="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-rose-400 to-rose-600 rounded-xl border-2 border-zinc-900 flex items-center justify-center text-sm shadow-xl z-20">🥈</div>
                            </div>
                            <div>
                                <div id="pres-cand2-name" class="text-white font-black text-2xl md:text-3xl tracking-tight">Aguardando</div>
                                <div class="flex items-center justify-center md:justify-end gap-2 mt-2">
                                    <span id="pres-cand2-partido" class="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-zinc-300 font-bold uppercase tracking-widest">---</span>
                                </div>
                            </div>
                        </div>
                        <div class="text-center md:text-left w-full md:w-auto bg-black/30 p-4 rounded-2xl border border-white/5 md:border-none md:bg-transparent md:p-0">
                            <div id="pres-cand2-pct" class="text-4xl md:text-5xl font-black text-white/80 tracking-tighter">0,00%</div>
                            <div id="pres-cand2-votos" class="text-sm text-zinc-500 font-medium mt-1 font-mono">0 votos válidos</div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>

    <!-- PAINÉIS DE ANÁLISE ESTATÍSTICA MATEMÁTICA -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <!-- Votos Válidos / Total -->
        <div class="glass-panel p-6 rounded-[2rem] border border-white/5 bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors">
            <div class="flex items-center gap-3 mb-4">
                <div class="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                </div>
                <h4 class="text-xs font-black text-zinc-400 uppercase tracking-widest">Total de Votos</h4>
            </div>
            <div id="pres-total-votos" class="text-3xl font-black text-white font-mono mb-2">0</div>
            <div class="w-full bg-black/50 rounded-full h-1.5 mt-4">
                <div class="bg-blue-500 h-1.5 rounded-full" style="width: 100%"></div>
            </div>
            <p class="text-[9px] text-zinc-500 uppercase mt-2 text-right">Votos Válidos Computados</p>
        </div>

        <!-- Brancos e Nulos -->
        <div class="glass-panel p-6 rounded-[2rem] border border-white/5 bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors">
            <div class="flex items-center gap-3 mb-4">
                <div class="w-8 h-8 rounded-full bg-zinc-500/20 text-zinc-400 flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h4 class="text-xs font-black text-zinc-400 uppercase tracking-widest">Brancos e Nulos</h4>
            </div>
            <div class="flex justify-between items-end">
                <div>
                    <div class="text-[9px] text-zinc-500 uppercase font-bold mb-1">Brancos</div>
                    <div id="apuracao-tot-brancos" class="text-xl font-black text-white font-mono">0</div>
                </div>
                <div class="text-right">
                    <div class="text-[9px] text-zinc-500 uppercase font-bold mb-1">Nulos</div>
                    <div id="apuracao-tot-nulos" class="text-xl font-black text-white font-mono">0</div>
                </div>
            </div>
            <div class="w-full flex h-1.5 mt-4 gap-1">
                <div class="bg-zinc-400 h-1.5 rounded-full flex-1 opacity-50"></div>
                <div class="bg-red-400 h-1.5 rounded-full flex-1 opacity-50"></div>
            </div>
        </div>

        <!-- Estatísticas Avançadas (Matemática) -->
        <div class="glass-panel p-6 rounded-[2rem] border border-white/5 bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors flex flex-col justify-between">
            <div>
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                    </div>
                    <h4 class="text-xs font-black text-zinc-400 uppercase tracking-widest">Projeções</h4>
                </div>
                <div class="space-y-3">
                    <div class="flex justify-between items-center bg-black/30 p-2 rounded-lg">
                        <span class="text-[10px] text-zinc-500 font-bold uppercase">Tendência de Virada</span>
                        <span class="text-xs font-black text-purple-400">BAIXA</span>
                    </div>
                    <div class="flex justify-between items-center bg-black/30 p-2 rounded-lg">
                        <span class="text-[10px] text-zinc-500 font-bold uppercase">Abstenção Estimada</span>
                        <span class="text-xs font-black text-zinc-300">~20%</span>
                    </div>
                </div>
            </div>
            <button onclick="Apuracao.shareWhatsApp()" class="mt-4 w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] font-black uppercase text-[10px] tracking-widest py-2 rounded-xl transition-all flex items-center justify-center gap-2">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                Compartilhar Relatório
            </button>
        </div>
    </div>

    <!-- SEGUNDA LINHA: MAPA E CHAT -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        <!-- Painel Central: Mapa, Gráficos e Lista -->
        <div class="lg:col-span-8 space-y-6">
            <div class="glass-panel p-6 rounded-[2.5rem] border border-white/5 shadow-2xl relative bg-zinc-950/80">
                
                <!-- Tab Buttons -->
                <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h3 class="text-white font-black text-sm uppercase tracking-widest flex items-center gap-3">
                        <span id="view-icon-title" class="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs">🗺️</span>
                        <span id="view-text-title">Visão Regional</span>
                    </h3>
                    
                    <div class="flex bg-black/40 p-1.5 rounded-xl border border-white/5">
                        <button onclick="ApuracaoUI.switchView('map')" id="btn-view-map" class="px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg bg-emerald-600 text-white transition-all shadow-lg">Mapa</button>
                        <button onclick="ApuracaoUI.switchView('chart')" id="btn-view-chart" class="px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg text-zinc-500 hover:text-white transition-all">Gráfico</button>
                        <button onclick="ApuracaoUI.switchView('list')" id="btn-view-list" class="px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg text-zinc-500 hover:text-white transition-all">Porcentagem</button>
                    </div>
                </div>
                
                <!-- View: Map -->
                <div id="apuracao-view-map" class="relative rounded-[2rem] overflow-hidden border border-white/10 bg-black" style="min-height: 500px; display: block;">
                    <div id="apuracaoMap" class="w-full h-full absolute inset-0 z-10 bg-[#0a0a0a]"></div>
                    <div class="absolute bottom-6 right-6 z-20 bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
                        <div class="text-[9px] font-black text-white uppercase mb-2">Legenda de Domínio</div>
                        <div class="space-y-2">
                            <div class="flex items-center gap-2">
                                <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                                <span class="text-xs text-zinc-300">Candidato 1</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <div class="w-3 h-3 rounded-full bg-rose-500"></div>
                                <span class="text-xs text-zinc-300">Candidato 2</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- View: Chart -->
                <div id="apuracao-view-chart" class="hidden relative rounded-[2rem] overflow-hidden bg-black/20 p-8 flex flex-col justify-center items-center" style="min-height: 500px;">
                    <div class="w-full h-64 flex justify-center items-center mb-8 relative z-20">
                        <canvas id="apuracao-votos-chart"></canvas>
                    </div>
                    <div class="text-center mt-4">
                        <p class="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Distribuição de Votos Válidos, Brancos e Nulos</p>
                    </div>
                </div>

                <!-- View: Lista -->
                <div id="apuracao-view-list" class="hidden relative rounded-[2rem] overflow-hidden bg-black/20 p-6" style="min-height: 500px;">
                    <div class="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                        <h4 class="text-white font-black text-xs uppercase tracking-widest">Ranking Estadual / Nacional</h4>
                        <div class="text-[10px] text-emerald-400 font-black bg-emerald-900/30 px-3 py-1 rounded-lg border border-emerald-500/20">Atualizado ao vivo</div>
                    </div>
                    <div id="apuracao-lista" class="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        <!-- O conteúdo será injetado pelo apuracao.js aqui -->
                    </div>
                </div>

            </div>
        </div>

        <!-- Coluna de Chat Integrada -->
        <div class="lg:col-span-4 glass-panel flex flex-col rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden bg-zinc-950/90 h-[600px]">
            <!-- Header Chat -->
            <div class="bg-black/50 p-5 border-b border-white/5 flex justify-between items-center shrink-0">
                <h4 class="text-white font-black text-sm uppercase flex items-center gap-2">
                    <span class="text-red-500 animate-pulse">🔴</span> Chat Ao Vivo
                </h4>
                <div class="text-[9px] text-zinc-500 font-bold uppercase px-2 py-1 bg-zinc-900 rounded-md">Público</div>
            </div>

            <!-- Termos e Condições -->
            <div id="apuracao-chat-terms" class="p-8 flex-1 flex flex-col justify-center items-center text-center bg-zinc-900/20">
                <div class="w-20 h-20 rounded-full bg-zinc-900 text-zinc-400 flex items-center justify-center text-4xl mb-6 border border-white/5 shadow-inner">📜</div>
                <h5 class="text-white font-black uppercase mb-3 text-lg">Regras do Chat</h5>
                <p class="text-xs text-zinc-400 mb-8 leading-relaxed text-left bg-black/40 p-5 rounded-2xl border border-white/5 w-full">
                    <b class="text-emerald-400">1.</b> Mantenha o respeito. Discursos de ódio ou ofensas causarão bloqueio imediato.<br><br>
                    <b class="text-emerald-400">2.</b> Chat temporário e criptografado.<br><br>
                    <b class="text-emerald-400">3.</b> IPs poderão ser registrados em caso de crime eleitoral ou ameaça.
                </p>
                <button onclick="ApuracaoChat.acceptTerms()" class="w-full bg-white text-black hover:bg-zinc-200 text-xs font-black uppercase py-4 rounded-xl transition-colors shadow-lg">
                    Concordar e Continuar
                </button>
            </div>

            <!-- Escolha de Nickname -->
            <div id="apuracao-chat-login" class="hidden p-8 flex-1 flex flex-col justify-center bg-zinc-900/20">
                <div class="w-16 h-16 mx-auto rounded-full bg-zinc-900 text-zinc-400 flex items-center justify-center text-3xl mb-6 border border-white/5">👤</div>
                <h5 class="text-white font-black uppercase mb-2 text-center text-lg">Identificação</h5>
                <p class="text-zinc-500 text-xs text-center mb-6 uppercase tracking-wider">Como deseja ser chamado?</p>
                <input type="text" id="apuracao-chat-nickname" maxlength="15" placeholder="Ex: Brasil2026..." class="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-4 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none mb-6 text-center font-bold transition-all">
                <button onclick="ApuracaoChat.joinChat()" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    Entrar na Discussão
                </button>
            </div>

            <!-- Área de Mensagens -->
            <div id="apuracao-chat-area" class="hidden flex-col h-full overflow-hidden flex-1">
                <div id="apuracao-chat-messages" class="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-black/20">
                    <div class="text-center text-[10px] text-zinc-600 uppercase font-bold my-4 bg-black/40 py-2 rounded-lg mx-8 border border-white/5">Conexão Segura Estabelecida</div>
                </div>
                <div class="p-4 bg-black/60 border-t border-white/5 flex gap-3 shrink-0 backdrop-blur-md">
                    <input type="text" id="apuracao-chat-input" maxlength="200" placeholder="Digite sua mensagem..." class="flex-1 bg-zinc-900/80 border border-white/10 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-colors" onkeydown="if(event.key==='Enter') ApuracaoChat.sendMessage()">
                    <button onclick="ApuracaoChat.sendMessage()" class="bg-emerald-600 hover:bg-emerald-500 text-white w-12 h-12 shrink-0 rounded-xl flex items-center justify-center transition-all shadow-lg hover:shadow-emerald-500/30">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
=======
    <!-- SUPER PORTAL PRESIDENTE -->
    <div id="president-super-dashboard" class="hidden animate-fade-in mb-6">
        <div class="glass-panel p-6 md:p-8 rounded-[2.5rem] border border-violet-500/30 shadow-[0_0_40px_rgba(139,92,246,0.15)] bg-gradient-to-br from-zinc-900/80 to-violet-950/20 relative overflow-hidden">
            <div class="absolute -right-20 -top-20 w-64 h-64 bg-violet-600/10 blur-[100px] rounded-full pointer-events-none"></div>
            
            <!-- Top Header do Dashboard: Urnas e Status -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 mb-6 relative z-10 gap-4">
                <div>
                    <h3 class="text-white font-black text-sm uppercase tracking-[0.2em] flex items-center gap-2 mb-1">
                        <span class="text-violet-400">🔥</span> Projeção de 2º Turno
                    </h3>
                    <div id="pres-status-badge" class="hidden mt-2">
                        <!-- Badge animado inserido via JS -->
                    </div>
                </div>
                
                <div class="text-right">
                    <div class="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Seções Apuradas</div>
                    <div id="pres-urnas-pct" class="text-4xl md:text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">0,00%</div>
                </div>
            </div>

            <div class="flex flex-col lg:flex-row gap-8 items-center relative z-10">
                <!-- 1º e 2º Colocado Head to Head -->
                <div class="flex-1 w-full">
                    
                    <!-- 1º Colocado -->
                    <div class="flex justify-between items-end mb-3">
                        <div class="flex items-center gap-4">
                            <div class="relative">
                                <div class="w-16 h-16 md:w-20 md:h-20 bg-zinc-800 rounded-2xl border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] overflow-hidden flex items-center justify-center">
                                    <span id="pres-cand1-initial" class="text-3xl font-black text-zinc-600">?</span>
                                    <img id="pres-cand1-img" src="" class="hidden w-full h-full object-cover" alt="Candidato 1">
                                </div>
                                <div class="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-2 border-zinc-900 flex items-center justify-center text-sm shadow-lg">🥇</div>
                            </div>
                            <div>
                                <div id="pres-cand1-name" class="text-white font-black text-xl md:text-2xl">Aguardando...</div>
                                <div id="pres-cand1-partido" class="text-sm text-zinc-400 font-bold uppercase tracking-wider">---</div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div id="pres-cand1-pct" class="text-4xl md:text-5xl font-black text-emerald-400 tracking-tighter">0,00%</div>
                            <div id="pres-cand1-votos" class="text-xs text-zinc-500 font-bold mt-1">0 votos</div>
                        </div>
                    </div>
                    
                    <!-- Progress Bar -->
                    <div class="w-full h-6 bg-black/60 border border-white/10 rounded-full overflow-hidden flex relative mb-4 shadow-inner">
                        <div id="pres-bar1" class="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-1000 relative" style="width: 50%">
                            <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                        <div class="absolute left-1/2 top-0 bottom-0 w-1 bg-white/30 z-10 shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                        <div id="pres-bar2" class="h-full bg-gradient-to-l from-blue-600 to-blue-400 transition-all duration-1000 relative" style="width: 50%"></div>
                    </div>

                    <!-- 2º Colocado -->
                    <div class="flex justify-between items-start mt-3 flex-row-reverse">
                        <div class="flex items-center gap-4 flex-row-reverse text-right">
                            <div class="relative">
                                <div class="w-14 h-14 md:w-16 md:h-16 bg-zinc-800 rounded-2xl border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] overflow-hidden flex items-center justify-center">
                                    <span id="pres-cand2-initial" class="text-2xl font-black text-zinc-600">?</span>
                                    <img id="pres-cand2-img" src="" class="hidden w-full h-full object-cover" alt="Candidato 2">
                                </div>
                                <div class="absolute -top-2 -left-2 w-6 h-6 bg-blue-500 rounded-full border-2 border-zinc-900 flex items-center justify-center text-xs shadow-lg">🥈</div>
                            </div>
                            <div>
                                <div id="pres-cand2-name" class="text-white font-black text-lg md:text-xl">Aguardando...</div>
                                <div id="pres-cand2-partido" class="text-xs text-zinc-400 font-bold uppercase tracking-wider">---</div>
                            </div>
                        </div>
                        <div class="text-left">
                            <div id="pres-cand2-pct" class="text-3xl md:text-4xl font-black text-blue-400 tracking-tighter">0,00%</div>
                            <div id="pres-cand2-votos" class="text-xs text-zinc-500 font-bold mt-1">0 votos</div>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Stats e Ações -->
                <div class="w-full lg:w-72 flex flex-col gap-3">
                    <div class="bg-black/40 border border-white/5 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
                        <div class="text-[9px] text-zinc-500 font-bold uppercase mb-1 tracking-widest">Votos Válidos Totais</div>
                        <div id="pres-total-votos" class="text-2xl font-black text-white">0</div>
                    </div>
                    <div class="bg-black/40 border border-white/5 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
                        <div class="text-[9px] text-zinc-500 font-bold uppercase mb-1 tracking-widest">Diferença Provisória</div>
                        <div id="pres-diff-votos" class="text-2xl font-black text-amber-400">0 votos</div>
                    </div>
                    <!-- Botão Compartilhar -->
                    <button onclick="Apuracao.shareWhatsApp()" class="mt-2 w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-black uppercase text-[10px] tracking-widest py-3 rounded-2xl transition-all shadow-[0_0_20px_rgba(37,211,102,0.3)] flex items-center justify-center gap-2">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                        Compartilhar no WhatsApp
>>>>>>> 82a4ad26265e16bed46541c79c86c12fcac0d450
                    </button>
                </div>
            </div>
        </div>
    </div>

<<<<<<< HEAD
    <!-- Nota: A lista e o gráfico foram movidos para o painel com as abas -->

    <!-- NOTA LEGAL (RODAPÉ) -->
    <div class="mt-12 bg-zinc-950/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 text-[11px] text-zinc-500 leading-relaxed space-y-4 shadow-2xl relative z-10 text-center max-w-4xl mx-auto">
        <p><strong class="text-zinc-300 uppercase tracking-widest text-xs block mb-2">Fonte Oficial: Tribunal Superior Eleitoral (TSE)</strong></p>
        <p>Este painel utiliza dados fornecidos diretamente pela API pública do TSE para as Eleições de 2026 (2º Turno).</p>
        <p>Projeções matemáticas apresentadas são cálculos estatísticos baseados no volume de abstenção e votos já apurados, não representando o resultado oficial até que o TSE declare a eleição matematicamente definida.</p>
    </div>

</div>

<!-- Script para Live Viewers Real -->
<script>
    document.addEventListener('DOMContentLoaded', () => {
        const viewerCountEl = document.getElementById('live-viewers-count');
        
        function updateViewers() {
            // Apenas pinga se a tab de apuração estiver ativa para não sobrecarregar
            const apuracaoContent = document.getElementById('content-apuracao');
            if (viewerCountEl && apuracaoContent && !apuracaoContent.classList.contains('hidden')) {
                fetch('api/viewers.php', { method: 'POST' })
                    .then(res => res.json())
                    .then(data => {
                        if (data && typeof data.viewers !== 'undefined') {
                            viewerCountEl.textContent = data.viewers.toLocaleString('pt-BR');
                        }
                    })
                    .catch(e => console.error('Erro ao buscar visualizadores', e));
            }
        }

        if (viewerCountEl) {
            updateViewers();
            // Ping a cada 10 segundos para manter a sessão ativa no backend
            setInterval(updateViewers, 10000);
        }
    });

    const ApuracaoUI = {
        switchView(type) {
            // Views
            const viewMap = document.getElementById('apuracao-view-map');
            const viewChart = document.getElementById('apuracao-view-chart');
            const viewList = document.getElementById('apuracao-view-list');
            
            // Buttons
            const btnMap = document.getElementById('btn-view-map');
            const btnChart = document.getElementById('btn-view-chart');
            const btnList = document.getElementById('btn-view-list');
            
            // Text Header
            const iconTitle = document.getElementById('view-icon-title');
            const textTitle = document.getElementById('view-text-title');

            // Reset all
            viewMap.style.display = 'none';
            viewChart.classList.add('hidden');
            viewList.classList.add('hidden');
            
            [btnMap, btnChart, btnList].forEach(b => {
                b.classList.remove('bg-emerald-600', 'text-white', 'shadow-lg');
                b.classList.add('text-zinc-500');
            });

            if (type === 'map') {
                viewMap.style.display = 'block';
                btnMap.classList.add('bg-emerald-600', 'text-white', 'shadow-lg');
                btnMap.classList.remove('text-zinc-500');
                iconTitle.textContent = '🗺️';
                iconTitle.className = 'w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs';
                textTitle.textContent = 'Mapa Geopolítico';
                if(window.Apuracao && Apuracao.map) Apuracao.map.invalidateSize();
            } else if (type === 'chart') {
                viewChart.classList.remove('hidden');
                btnChart.classList.add('bg-emerald-600', 'text-white', 'shadow-lg');
                btnChart.classList.remove('text-zinc-500');
                iconTitle.textContent = '📊';
                iconTitle.className = 'w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center text-xs';
                textTitle.textContent = 'Gráficos Estatísticos';
            } else if (type === 'list') {
                viewList.classList.remove('hidden');
                btnList.classList.add('bg-emerald-600', 'text-white', 'shadow-lg');
                btnList.classList.remove('text-zinc-500');
                iconTitle.textContent = '📋';
                iconTitle.className = 'w-8 h-8 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center text-xs';
                textTitle.textContent = 'Ranking por Porcentagem';
            }
        }
    };
</script>
=======
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- MAPA e GRAFICO -->
        <div class="lg:col-span-4 space-y-6">
            <!-- Estatísticas (Donut Chart) -->
            <div class="glass-panel p-6 rounded-[2.5rem] border border-white/5 shadow-2xl relative bg-zinc-900/30">
                <h3 class="text-white font-black text-[10px] uppercase tracking-[0.3em] mb-4 flex items-center gap-2 opacity-50">
                    📊 Distribuição de Votos
                </h3>
                <div class="w-full h-48 flex justify-center items-center">
                    <canvas id="apuracao-votos-chart"></canvas>
                </div>
                <div class="grid grid-cols-2 gap-4 mt-4">
                    <div class="p-3 rounded-2xl border border-white/5 bg-black/20 flex flex-col items-center">
                        <span class="text-[9px] text-zinc-500 font-bold uppercase mb-1">Brancos</span>
                        <span id="apuracao-tot-brancos" class="text-sm font-black text-white">0</span>
                    </div>
                    <div class="p-3 rounded-2xl border border-white/5 bg-black/20 flex flex-col items-center">
                        <span class="text-[9px] text-zinc-500 font-bold uppercase mb-1">Nulos</span>
                        <span id="apuracao-tot-nulos" class="text-sm font-black text-white">0</span>
                    </div>
                </div>
            </div>

            <!-- Mapa Interativo -->
            <div class="glass-panel p-4 rounded-[2.5rem] border border-white/5 shadow-2xl relative bg-zinc-900/30" style="min-height: 400px;">
                <div class="absolute top-6 left-6 z-20 pointer-events-none">
                    <span class="px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[8px] font-black text-white border border-white/10 uppercase tracking-widest">MAPA</span>
                </div>
                <div id="apuracaoMap" class="w-full rounded-[2rem] z-10 bg-zinc-950 relative" style="height: 350px; min-height: 350px; display: block;"></div>
                <p class="text-center text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em] mt-3">Para Nacionais, exibe o líder do estado.</p>
            </div>
        </div>

        <!-- Lista de Candidatos (Ranking) -->
        <div class="lg:col-span-5 glass-panel p-6 md:p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative min-h-[400px]">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-white font-black text-sm uppercase tracking-widest flex items-center gap-3">
                    <span class="w-8 h-8 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center text-xs">🏆</span>
                    Ranking de Candidatos
                </h3>
                <div class="text-right">
                    <span class="text-[9px] text-zinc-500 font-bold uppercase block">Seções Apuradas</span>
                    <span id="apuracao-tot-secoes" class="text-xl font-black text-white">0,00%</span>
                </div>
            </div>
            
            <div id="apuracao-lista" class="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                <!-- Skeleton Loader Inicial -->
                <div class="animate-pulse flex flex-col items-center justify-center py-20 opacity-50">
                    <div class="text-4xl mb-4">🗳️</div>
                    <div class="h-4 w-48 bg-white/10 rounded-full mb-2"></div>
                    <div class="h-3 w-32 bg-white/5 rounded-full"></div>
                </div>
            </div>
        </div>

        <!-- Coluna de Chat Integrada -->
        <div class="lg:col-span-3 glass-panel flex flex-col rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden bg-zinc-900/30 max-h-[800px]">
            <!-- Header Chat -->
            <div class="bg-zinc-950 p-4 border-b border-white/5 flex justify-center items-center shrink-0">
                <h4 class="text-white font-black text-sm uppercase flex items-center gap-2">
                    <span class="text-red-500 animate-pulse">🔴</span> Chat Ao Vivo
                </h4>
            </div>

            <!-- Termos e Condições -->
            <div id="apuracao-chat-terms" class="p-6 flex-1 flex flex-col justify-center items-center text-center bg-zinc-900/50">
                <div class="w-16 h-16 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center text-3xl mb-4 border border-white/10">📜</div>
                <h5 class="text-white font-black uppercase mb-2">Termos de Uso</h5>
                <p class="text-[10px] text-zinc-400 mb-6 leading-relaxed text-left bg-black/30 p-3 rounded-xl border border-white/5">
                    <b class="text-zinc-300">1.</b> Mantenha o respeito. Discursos de ódio ou ofensas causarão bloqueio.<br><br>
                    <b class="text-zinc-300">2.</b> Chat temporário. Mensagens não ficam salvas.<br><br>
                    <b class="text-zinc-300">3.</b> Nomes falsos permitidos, mas IPs poderão ser registrados em caso de crime.
                </p>
                <button onclick="ApuracaoChat.acceptTerms()" class="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase py-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                    Eu Aceito os Termos
                </button>
            </div>

            <!-- Escolha de Nickname -->
            <div id="apuracao-chat-login" class="hidden p-6 flex-1 flex flex-col justify-center bg-zinc-900/50">
                <h5 class="text-white font-black uppercase mb-2 text-center text-sm">Identifique-se</h5>
                <p class="text-zinc-500 text-[10px] text-center mb-4 uppercase">Escolha um apelido para participar</p>
                <input type="text" id="apuracao-chat-nickname" maxlength="15" placeholder="Ex: Cidadão2026..." class="w-full bg-zinc-950 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none mb-4 text-center font-bold">
                <button onclick="ApuracaoChat.joinChat()" class="w-full bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase py-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                    Entrar no Chat
                </button>
            </div>

            <!-- Área de Mensagens -->
            <div id="apuracao-chat-area" class="hidden flex-col h-full overflow-hidden flex-1">
                <div id="apuracao-chat-messages" class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-zinc-900/30">
                    <div class="text-center text-[10px] text-zinc-500 uppercase font-bold my-4">Bem-vindo ao Chat Ao Vivo!</div>
                </div>
                <div class="p-3 bg-zinc-950 border-t border-white/5 flex gap-2 shrink-0">
                    <input type="text" id="apuracao-chat-input" maxlength="200" placeholder="Sua mensagem..." class="flex-1 bg-zinc-900 border border-white/5 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-red-500 transition-colors" onkeydown="if(event.key==='Enter') ApuracaoChat.sendMessage()">
                    <button onclick="ApuracaoChat.sendMessage()" class="bg-red-600 hover:bg-red-500 text-white w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </button>
                </div>
            </div>

        </div>
    </div>

    <!-- NOTA LEGAL (RODAPÉ) -->
    <div class="mt-12 bg-zinc-900/50 border border-white/5 rounded-2xl p-6 md:p-8 text-[10px] sm:text-xs text-zinc-500 leading-relaxed space-y-4 shadow-xl">
        <p><strong class="text-zinc-300">A fonte das informações desta página é o Tribunal Superior Eleitoral (TSE).</strong></p>
        <p><strong class="text-zinc-400">Obs 1:</strong> Desde 2018, o TSE passou a divulgar o voto de todos os candidatos concorrentes, independentemente da situação do seu registro e da destinação dada a seus votos: se válidos, anulados "sub judice" (que ainda aguardam a confirmação de sua validade) ou anulados definitivamente.</p>
        <p><strong class="text-zinc-400">Obs 2:</strong> Se um candidato "sub judice" tiver votos suficientes para vencer, o resultado da eleição será considerado indefinido até decisão da Justiça. No caso de o candidato "sub judice" obter votos suficientes para ir ao 2º turno, ele seguirá na disputa até que a situação seja definida. Para consultar a situação do candidato, acesse <a href="https://divulgacandcontas.tse.jus.br" target="_blank" class="text-blue-400 hover:underline">divulgacandcontas.tse.jus.br</a>.</p>
        <p><strong class="text-zinc-400">Obs 3:</strong> O percentual de cada candidato leva em conta os votos de todos os candidatos concorrentes, independentemente da situação jurídica.</p>
    </div>

</div>
>>>>>>> 82a4ad26265e16bed46541c79c86c12fcac0d450
