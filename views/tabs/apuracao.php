<!-- Conteúdo: Apuração Ao Vivo (TSE) -->
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
                </div>
            </div>
        </div>
    </div>

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
            </div>

            <!-- UF -->
            <div class="space-y-2">
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
                </div>
            </div>

            <!-- Auto-Refresh -->
            <div class="space-y-2 flex flex-col justify-end">
                <button onclick="Apuracao.fetchResults()" id="apuracao-btn-update" class="w-full bg-red-600 hover:bg-red-500 text-white font-black uppercase text-xs py-3 rounded-xl transition-all shadow-lg shadow-red-900/50 flex items-center justify-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                    Atualizar Agora
                </button>
            </div>
        </div>
    </div>

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
                    </button>
                </div>
            </div>
        </div>
    </div>

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
