// /var/www/html/hyperz/transparency/js/risk.js
async function runRiskAnalysis() {
    const target = document.getElementById('riskTargetSelect').value;
    const resultsDiv = document.getElementById('riskResults');
    const statsDiv = document.getElementById('riskStats');
    
    resultsDiv.innerHTML = '<div class="text-center py-12"><div class="inline-block w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div><p class="text-red-400 font-bold animate-pulse">Analisando notas fiscais e cruzando dados...</p><p class="text-zinc-500 text-xs mt-2">Isso pode levar alguns segundos.</p></div>';
    statsDiv.classList.add('hidden');

    // 1. Obter lista de deputados para analisar
    let deputiesToAnalyze = [];
    try {
        const data = await api.camara('deputados?ordem=ASC&ordenarPor=nome');
        const allDeputies = data.dados;
        
        // Selecionar amostra baseada no target
        if (target === 'random') {
            deputiesToAnalyze = allDeputies.sort(() => 0.5 - Math.random()).slice(0, 15);
        } else {
            deputiesToAnalyze = allDeputies.slice(0, 15);
        }

        let totalAnalyzed = 0;
        let mediumFlags = 0;
        let highFlags = 0;
        let html = '';

        // 2. Analisar cada um
        for (const dep of deputiesToAnalyze) {
            const analysis = await api.analyzeExpenses(dep.id);
            
            totalAnalyzed += analysis.total_analyzed || 0;

            if (analysis.flags && analysis.flags.length > 0) {
                analysis.flags.forEach(flag => {
                    if(flag.risk === 'high') highFlags++;
                    else mediumFlags++;

                    const color = flag.risk === 'high' ? 'red' : 'yellow';
                    const icon = flag.risk === 'high' ? '🔥' : '⚠️';
                    
                    html += `
                        <div class="bg-zinc-900 border border-${color}-900/50 rounded-xl p-4 flex gap-4 items-start hover:bg-zinc-800 transition">
                            <img src="${dep.urlFoto}" class="w-12 h-12 rounded-full object-cover border-2 border-${color}-600">
                            <div class="flex-1">
                                <div class="flex justify-between items-start">
                                    <h4 class="font-bold text-white">${dep.nome} <span class="text-xs text-zinc-500">(${dep.siglaPartido}/${dep.siglaUf})</span></h4>
                                    <span class="bg-${color}-900/30 text-${color}-500 text-[10px] px-2 py-1 rounded border border-${color}-900 uppercase font-bold">${icon} Risco ${flag.risk === 'high' ? 'Alto' : 'Médio'}</span>
                                </div>
                                <p class="text-zinc-300 text-sm mt-1">${flag.desc}</p>
                                <div class="mt-2 text-xs text-zinc-500">
                                    Empresa: ${flag.data?.nomeFornecedor || '—'} (CNPJ: ${flag.data?.cnpjCpfFornecedor || '—'})
                                </div>
                            </div>
                        </div>
                    `;
                });
            }
        }

        if (html === '') {
            html = '<div class="p-6 bg-green-900/10 border border-green-900/30 rounded-xl text-center text-green-400">✅ Nenhuma anomalia detectada nesta amostra.</div>';
        }

        resultsDiv.innerHTML = html;
        
        // Atualizar Stats
        document.getElementById('riskTotalAnalyzed').textContent = totalAnalyzed;
        document.getElementById('riskMediumFlags').textContent = mediumFlags;
        document.getElementById('riskHighFlags').textContent = highFlags;
        statsDiv.classList.remove('hidden');

    } catch (e) {
        resultsDiv.innerHTML = '<div class="text-red-500 text-center">Erro na análise: ' + e.message + '</div>';
    }
}
