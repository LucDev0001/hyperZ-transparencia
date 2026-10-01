<!-- Conteúdo: Orçamento -->
<div id="content-orcamento" class="hidden animate-fade-in pb-12">

    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h2 class="text-2xl font-black text-white">💰 Orçamento & Dívida Pública</h2>
            <p class="text-zinc-400 text-sm mt-1">Dados oficiais de Operações de Crédito (Empréstimos) de Estados e Municípios com garantia da União.</p>
        </div>
        <div class="flex gap-2 w-full md:w-auto">
            <select id="orcFilterUf" onchange="filterOrcamento()" class="bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-2 outline-none focus:border-violet-500 text-sm flex-1 md:w-32">
                <option value="">Todas UFs</option>
                <option value="AC">AC</option><option value="AL">AL</option><option value="AP">AP</option><option value="AM">AM</option>
                <option value="BA">BA</option><option value="CE">CE</option><option value="DF">DF</option><option value="ES">ES</option>
                <option value="GO">GO</option><option value="MA">MA</option><option value="MT">MT</option><option value="MS">MS</option>
                <option value="MG">MG</option><option value="PA">PA</option><option value="PB">PB</option><option value="PR">PR</option>
                <option value="PE">PE</option><option value="PI">PI</option><option value="RJ">RJ</option><option value="RN">RN</option>
                <option value="RS">RS</option><option value="RO">RO</option><option value="RR">RR</option><option value="SC">SC</option>
                <option value="SP">SP</option><option value="SE">SE</option><option value="TO">TO</option>
            </select>
            <select id="orcFilterTipo" onchange="filterOrcamento()" class="bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-2 outline-none focus:border-violet-500 text-sm flex-1 md:w-40">
                <option value="">Esfera (Todas)</option>
                <option value="Estado">Estadual</option>
                <option value="Município">Municipal</option>
            </select>
        </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="glass-panel p-4 rounded-2xl border-l-4 border-violet-500">
            <div class="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Volume Total</div>
            <div class="text-xl sm:text-2xl font-black text-white truncate" id="orcStatTotal">R$ 0</div>
        </div>
        <div class="glass-panel p-4 rounded-2xl border-l-4 border-green-500">
            <div class="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Pedidos Deferidos</div>
            <div class="text-xl sm:text-2xl font-black text-green-400 truncate" id="orcStatDeferidos">0</div>
        </div>
        <div class="glass-panel p-4 rounded-2xl border-l-4 border-amber-500">
            <div class="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Em Análise / Tramitação</div>
            <div class="text-xl sm:text-2xl font-black text-amber-400 truncate" id="orcStatAnalise">0</div>
        </div>
        <div class="glass-panel p-4 rounded-2xl border-l-4 border-blue-500">
            <div class="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Total de Pedidos</div>
            <div class="text-xl sm:text-2xl font-black text-blue-400 truncate" id="orcStatQtd">0</div>
        </div>
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="glass-panel p-5 rounded-2xl border border-white/5">
            <h3 class="text-sm font-bold text-white mb-4 uppercase tracking-wider text-center">Volume por Esfera</h3>
            <div class="relative h-56 w-full"><canvas id="orcEsferaChart"></canvas></div>
        </div>
        <div class="glass-panel p-5 rounded-2xl border border-white/5">
            <h3 class="text-sm font-bold text-white mb-4 uppercase tracking-wider text-center">Top 5 Estados Solicitantes</h3>
            <div class="relative h-56 w-full"><canvas id="orcUfChart"></canvas></div>
        </div>
        <div class="glass-panel p-5 rounded-2xl border border-white/5">
            <h3 class="text-sm font-bold text-white mb-4 uppercase tracking-wider text-center">Principais Finalidades (Motivos)</h3>
            <div class="relative h-56 w-full"><canvas id="orcFinalidadeChart"></canvas></div>
        </div>
        <div class="glass-panel p-5 rounded-2xl border border-white/5">
            <h3 class="text-sm font-bold text-white mb-4 uppercase tracking-wider text-center">Principais Credores (Bancos/Instituições)</h3>
            <div class="relative h-56 w-full"><canvas id="orcCredorChart"></canvas></div>
        </div>
    </div>

    <!-- Radar Investigativo (Tabela de Operações) -->
    <div class="glass-panel rounded-2xl border border-white/5 overflow-hidden flex flex-col">
        <div class="p-5 border-b border-white/5 bg-zinc-900/50 flex justify-between items-center">
            <h3 class="text-lg font-bold text-white flex items-center gap-2">🔍 Radar de Operações de Crédito</h3>
            <span class="text-xs text-zinc-500 font-mono" id="orcTableCount">Carregando...</span>
        </div>
        
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm whitespace-nowrap">
                <thead class="bg-zinc-900/80 text-zinc-400 text-xs uppercase tracking-wider">
                    <tr>
                        <th class="px-5 py-3 font-medium">Interessado / Ente</th>
                        <th class="px-5 py-3 font-medium">Finalidade</th>
                        <th class="px-5 py-3 font-medium">Credor</th>
                        <th class="px-5 py-3 font-medium text-right">Valor (R$)</th>
                        <th class="px-5 py-3 font-medium text-center">Status</th>
                    </tr>
                </thead>
                <tbody id="orcTableBody" class="divide-y divide-white/5 text-zinc-300">
                    <tr><td colspan="5" class="px-5 py-8 text-center text-zinc-500 animate-pulse">Buscando dados no Tesouro Nacional...</td></tr>
                </tbody>
            </table>
        </div>
    </div>
    
    <div id="budget-status" class="mt-4 text-center text-xs text-zinc-500">
        Conectando à API do Tesouro Nacional Transparente (SADIPEM)...
    </div>
</div>
