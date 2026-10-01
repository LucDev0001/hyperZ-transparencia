<!-- Conteúdo: Análise de Risco (Corruption Watch) -->
<div id="content-risco" class="hidden animate-fade-in">
    <div class="bg-red-900/10 border border-red-500/20 p-6 rounded-2xl mb-8 backdrop-blur-sm">
        <div class="flex items-start gap-4">
            <div class="text-4xl">🕵️‍♂️</div>
            <div>
                <h2 class="text-2xl font-bold text-red-500 mb-2">Monitor de Gastos Atípicos</h2>
                <p class="text-zinc-300 text-sm">
                    Esta ferramenta utiliza algoritmos para analisar milhares de notas fiscais e identificar padrões que 
                    <strong>podem</strong> indicar uso indevido da Cota Parlamentar (CEAP). 
                    <span class="block mt-1 text-xs text-zinc-500">*Atenção: Um alerta não confirma crime, apenas indica necessidade de fiscalização humana.</span>
                </p>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Painel de Controle -->
        <div class="glass-panel p-6 rounded-2xl h-fit">
            <h3 class="font-bold text-white mb-4">Configurar Análise</h3>
            <div class="space-y-4">
                <div>
                    <label class="text-xs text-zinc-400 uppercase font-bold">Alvo da Análise</label>
                    <select id="riskTargetSelect" class="w-full bg-zinc-900/50 border border-white/10 rounded-lg p-3 mt-1 text-white outline-none">
                        <option value="random">🎲 Amostra Aleatória (10 Deputados)</option>
                        <option value="leaders">👑 Líderes de Partido</option>
                        <option value="top_spenders">💸 Maiores Gastadores (Mês Atual)</option>
                    </select>
                </div>
                <button onclick="runRiskAnalysis()" class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition shadow-lg shadow-red-900/20 flex items-center justify-center gap-2">
                    INICIAR VARREDURA
                </button>
            </div>
            
            <div id="riskStats" class="mt-6 pt-6 border-t border-white/10 hidden">
                <div class="text-center">
                    <div class="text-3xl font-black text-white" id="riskTotalAnalyzed">0</div>
                    <div class="text-xs text-zinc-500 uppercase">Notas Analisadas</div>
                </div>
                <div class="grid grid-cols-2 gap-4 mt-4">
                    <div class="text-center">
                        <div class="text-xl font-bold text-yellow-500" id="riskMediumFlags">0</div>
                        <div class="text-[10px] text-zinc-500">Alertas Médios</div>
                    </div>
                    <div class="text-center">
                        <div class="text-xl font-bold text-red-500" id="riskHighFlags">0</div>
                        <div class="text-[10px] text-zinc-500">Alertas Altos</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Resultados -->
        <div class="lg:col-span-2">
            <div id="riskResults" class="space-y-4">
                <div class="text-center py-12 text-zinc-500 glass-panel rounded-2xl border-dashed">
                    Selecione um alvo e inicie a varredura para ver os resultados.
                </div>
            </div>
        </div>
    </div>

    <!-- Nova Ferramenta: Raio-X de Fornecedores (Baseado na API Pessoa Jurídica) -->
    <div class="glass-panel p-6 rounded-2xl mt-6">
        <div class="flex items-center gap-3 mb-4">
            <div class="text-3xl">🏢</div>
            <div>
                <h3 class="font-bold text-white text-xl">Raio-X de Fornecedores Federais</h3>
                <p class="text-zinc-400 text-sm">Investigue empresas que recebem verba pública. Verifique sanções (CEIS/CNEP) e histórico de recebimentos.</p>
            </div>
        </div>
        
        <div class="flex flex-col md:flex-row gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
            <input type="text" id="supplierCnpj" placeholder="Digite o CNPJ (apenas números)..." class="flex-1 bg-zinc-900/50 border border-white/10 rounded-lg p-3 text-white focus:border-violet-500 outline-none font-mono">
            <button onclick="analyzeSupplier()" class="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-violet-900/20">
                🕵️ Investigar CNPJ
            </button>
        </div>
        <div id="supplierResult" class="mt-6 hidden animate-fade-in"></div>
    </div>
</div>
