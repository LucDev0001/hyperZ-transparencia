<!-- Conteúdo: Análise de Risco (Corruption Watch) -->
<div id="content-risco" class="hidden animate-fade-in pb-16">
    
    <!-- Banner de Risco -->
    <div class="bg-gradient-to-r from-red-950/40 via-zinc-900/60 to-zinc-950/80 border border-red-500/20 p-6 rounded-2xl mb-8 backdrop-blur-md shadow-xl">
        <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 flex-shrink-0">
                <?php echo function_exists('getSaaSIcon') ? getSaaSIcon('alert', 'w-6 h-6') : '⚠️'; ?>
            </div>
            <div>
                <div class="flex items-center gap-2 mb-1">
                    <h2 class="text-2xl font-black text-white tracking-tight">Monitor de Gastos Atípicos</h2>
                    <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 uppercase">
                        Algoritmo Antifraude
                    </span>
                </div>
                <p class="text-zinc-300 text-sm leading-relaxed">
                    Algoritmos de inteligência que cruzam notas fiscais para detectar discrepâncias estatísticas e potenciais inconformidades na Cota Parlamentar (CEAP).
                    <span class="block mt-1.5 text-xs text-zinc-500 font-mono">*Alerta técnico informativo: indica anomalia estatística para fiscalização humana, sem julgamento de mérito.</span>
                </p>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Painel de Controle -->
        <div class="glass-card p-6 rounded-2xl h-fit border border-white/10">
            <div class="flex items-center gap-2 mb-4">
                <div class="w-6 h-6 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                    <?php echo function_exists('getSaaSIcon') ? getSaaSIcon('radar', 'w-3.5 h-3.5') : '🎯'; ?>
                </div>
                <h3 class="font-bold text-white text-base">Configurar Varredura</h3>
            </div>
            
            <div class="space-y-4">
                <div>
                    <label class="text-[11px] text-zinc-400 uppercase font-mono font-bold block mb-1.5">Alvo da Amostragem</label>
                    <select id="riskTargetSelect" class="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-red-500 font-medium">
                        <option value="random">Amostra Aleatória (10 Deputados)</option>
                        <option value="leaders">Líderes de Bancadas Partidárias</option>
                        <option value="top_spenders">Maiores Gastadores (Mês Atual)</option>
                    </select>
                </div>
                <button onclick="runRiskAnalysis()" class="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-mono">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Iniciar Varredura IA
                </button>
            </div>
            
            <div id="riskStats" class="mt-6 pt-6 border-t border-white/10 hidden">
                <div class="text-center">
                    <div class="text-3xl font-black text-white font-mono" id="riskTotalAnalyzed">0</div>
                    <div class="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Notas Auditadas</div>
                </div>
                <div class="grid grid-cols-2 gap-4 mt-4">
                    <div class="glass-card p-3 rounded-xl text-center border-amber-500/20">
                        <div class="text-xl font-bold text-amber-400 font-mono" id="riskMediumFlags">0</div>
                        <div class="text-[10px] text-zinc-400 uppercase font-mono">Alertas Médios</div>
                    </div>
                    <div class="glass-card p-3 rounded-xl text-center border-red-500/20">
                        <div class="text-xl font-bold text-red-400 font-mono" id="riskHighFlags">0</div>
                        <div class="text-[10px] text-zinc-400 uppercase font-mono">Alertas Críticos</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Resultados -->
        <div class="lg:col-span-2">
            <div id="riskResults" class="space-y-4">
                <div class="text-center py-16 text-zinc-500 glass-card rounded-2xl border-dashed border-white/10 flex flex-col items-center justify-center gap-3">
                    <div class="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-zinc-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    </div>
                    <p class="text-sm">Selecione uma amostragem ao lado e acione a varredura para visualizar anomalias.</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Nova Ferramenta: Raio-X de Fornecedores (Baseado na API Pessoa Jurídica) -->
    <div class="glass-card p-6 rounded-2xl mt-8 border border-white/10 shadow-xl">
        <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <?php echo function_exists('getSaaSIcon') ? getSaaSIcon('supplier', 'w-5 h-5') : '🏢'; ?>
            </div>
            <div>
                <h3 class="font-bold text-white text-lg">Raio-X de Fornecedores Federais</h3>
                <p class="text-zinc-400 text-sm">Pesquise empresas que recebem recursos da União. Cruza com os cadastros de sanções e inidoneidade (CEIS / CNEP / CEPIM).</p>
            </div>
        </div>
        
        <div class="flex flex-col md:flex-row gap-3 bg-zinc-900/60 p-3 rounded-2xl border border-white/10">
            <input type="text" id="supplierCnpj" placeholder="Digite o CNPJ da empresa (somente números)..." class="flex-1 bg-transparent px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none font-mono text-sm">
            <button onclick="analyzeSupplier()" class="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase font-mono tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                Auditar CNPJ
            </button>
        </div>
        <div id="supplierResult" class="mt-6 hidden animate-fade-in"></div>
    </div>
</div>
