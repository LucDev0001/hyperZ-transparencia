<!-- Conteúdo: Orçamento -->
<div id="content-orcamento" class="hidden animate-fade-in pb-16">

    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                    <?php echo function_exists('getSaaSIcon') ? getSaaSIcon('coins', 'w-4 h-4') : '💰'; ?>
                </div>
                <h2 class="text-2xl font-black text-white tracking-tight">Orçamento & Dívida Pública</h2>
                <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
                    SADIPEM / TESOURO
                </span>
            </div>
            <p class="text-zinc-400 text-sm">Operações de crédito de Estados e Municípios com garantia da União e histórico de endividamento.</p>
        </div>
        <div class="flex gap-2 w-full md:w-auto">
            <select id="orcFilterUf" onchange="filterOrcamento()" class="bg-zinc-900 border border-white/10 text-white rounded-xl px-4 py-2.5 outline-none focus:border-violet-500 text-xs font-mono font-bold flex-1 md:w-36 shadow-sm">
                <option value="">Todas as UFs</option>
                <option value="AC">AC</option><option value="AL">AL</option><option value="AP">AP</option><option value="AM">AM</option>
                <option value="BA">BA</option><option value="CE">CE</option><option value="DF">DF</option><option value="ES">ES</option>
                <option value="GO">GO</option><option value="MA">MA</option><option value="MT">MT</option><option value="MS">MS</option>
                <option value="MG">MG</option><option value="PA">PA</option><option value="PB">PB</option><option value="PR">PR</option>
                <option value="PE">PE</option><option value="PI">PI</option><option value="RJ">RJ</option><option value="RN">RN</option>
                <option value="RS">RS</option><option value="RO">RO</option><option value="RR">RR</option><option value="SC">SC</option>
                <option value="SP">SP</option><option value="SE">SE</option><option value="TO">TO</option>
            </select>
            <select id="orcFilterTipo" onchange="filterOrcamento()" class="bg-zinc-900 border border-white/10 text-white rounded-xl px-4 py-2.5 outline-none focus:border-violet-500 text-xs font-mono font-bold flex-1 md:w-44 shadow-sm">
                <option value="">Esfera (Todas)</option>
                <option value="Estado">Estadual</option>
                <option value="Município">Municipal</option>
            </select>
        </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="glass-card p-5 rounded-2xl border-l-4 border-l-violet-500">
            <div class="flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2 font-mono">
                <span>Volume Total</span>
                <span class="w-2 h-2 rounded-full bg-violet-400"></span>
            </div>
            <div class="text-xl sm:text-2xl font-black text-white truncate" id="orcStatTotal">R$ 0</div>
            <div class="text-[11px] text-zinc-500 mt-1">Garantido pela União</div>
        </div>
        <div class="glass-card p-5 rounded-2xl border-l-4 border-l-emerald-500">
            <div class="flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2 font-mono">
                <span>Pedidos Deferidos</span>
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
            <div class="text-xl sm:text-2xl font-black text-emerald-400 truncate" id="orcStatDeferidos">0</div>
            <div class="text-[11px] text-zinc-500 mt-1">Aprovados com aval</div>
        </div>
        <div class="glass-card p-5 rounded-2xl border-l-4 border-l-amber-500">
            <div class="flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2 font-mono">
                <span>Em Tramitação</span>
                <span class="w-2 h-2 rounded-full bg-amber-400"></span>
            </div>
            <div class="text-xl sm:text-2xl font-black text-amber-400 truncate" id="orcStatAnalise">0</div>
            <div class="text-[11px] text-zinc-500 mt-1">Análise do Tesouro</div>
        </div>
        <div class="glass-card p-5 rounded-2xl border-l-4 border-l-blue-500">
            <div class="flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2 font-mono">
                <span>Total de Pedidos</span>
                <span class="w-2 h-2 rounded-full bg-blue-400"></span>
            </div>
            <div class="text-xl sm:text-2xl font-black text-blue-400 truncate" id="orcStatQtd">0</div>
            <div class="text-[11px] text-zinc-500 mt-1">Operações indexadas</div>
        </div>
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="glass-card p-6 rounded-2xl border border-white/5">
            <h3 class="text-xs font-bold text-zinc-400 mb-4 uppercase tracking-wider text-center font-mono">Volume por Esfera Governamental</h3>
            <div class="relative h-60 w-full"><canvas id="orcEsferaChart"></canvas></div>
        </div>
        <div class="glass-card p-6 rounded-2xl border border-white/5">
            <h3 class="text-xs font-bold text-zinc-400 mb-4 uppercase tracking-wider text-center font-mono">Top 5 Estados Solicitantes</h3>
            <div class="relative h-60 w-full"><canvas id="orcUfChart"></canvas></div>
        </div>
        <div class="glass-card p-6 rounded-2xl border border-white/5">
            <h3 class="text-xs font-bold text-zinc-400 mb-4 uppercase tracking-wider text-center font-mono">Principais Finalidades (Motivos)</h3>
            <div class="relative h-60 w-full"><canvas id="orcFinalidadeChart"></canvas></div>
        </div>
        <div class="glass-card p-6 rounded-2xl border border-white/5">
            <h3 class="text-xs font-bold text-zinc-400 mb-4 uppercase tracking-wider text-center font-mono">Principais Credores (Bancos/Instituições)</h3>
            <div class="relative h-60 w-full"><canvas id="orcCredorChart"></canvas></div>
        </div>
    </div>

    <!-- Radar Investigativo (Tabela de Operações) -->
    <div class="glass-card rounded-2xl border border-white/10 overflow-hidden flex flex-col shadow-xl">
        <div class="p-5 border-b border-white/10 bg-zinc-900/60 flex justify-between items-center">
            <div class="flex items-center gap-2.5">
                <div class="w-6 h-6 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                    <?php echo function_exists('getSaaSIcon') ? getSaaSIcon('search', 'w-3.5 h-3.5') : '🔍'; ?>
                </div>
                <h3 class="text-base font-bold text-white">Radar de Operações de Crédito</h3>
            </div>
            <span class="text-xs text-zinc-400 font-mono" id="orcTableCount">Carregando...</span>
        </div>
        
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm whitespace-nowrap">
                <thead class="bg-zinc-900/90 text-zinc-400 text-xs uppercase tracking-wider font-mono">
                    <tr>
                        <th class="px-5 py-3.5 font-semibold">Interessado / Ente</th>
                        <th class="px-5 py-3.5 font-semibold">Finalidade</th>
                        <th class="px-5 py-3.5 font-semibold">Credor</th>
                        <th class="px-5 py-3.5 font-semibold text-right">Valor (R$)</th>
                        <th class="px-5 py-3.5 font-semibold text-center">Status</th>
                    </tr>
                </thead>
                <tbody id="orcTableBody" class="divide-y divide-white/5 text-zinc-300">
                    <tr><td colspan="5" class="px-5 py-10 text-center text-zinc-500 animate-pulse">Buscando dados no Tesouro Nacional...</td></tr>
                </tbody>
            </table>
        </div>
    </div>
    
    <div id="budget-status" class="mt-4 text-center text-xs text-zinc-500 font-mono">
        Conectando à API do Tesouro Nacional Transparente (SADIPEM)...
    </div>
</div>
