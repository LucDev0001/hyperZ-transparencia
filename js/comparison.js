// transparency/js/comparison.js

let comparisonData = {
    deputy1: null,
    deputy2: null
};

async function searchDeputyForComparison(slot) {
    const query = document.getElementById(`comp-search-${slot}`).value;
    const resultsDiv = document.getElementById(`comp-results-${slot}`);
    
    if (query.length < 3) {
        resultsDiv.classList.add('hidden');
        return;
    }

    resultsDiv.classList.remove('hidden');
    resultsDiv.innerHTML = '<div class="p-2 text-zinc-500 text-xs text-center">Buscando...</div>';

    try {
        const json = await api.camara(`deputados?nome=${query}&ordem=ASC&ordenarPor=nome&itens=5`);
        
        if (json.dados.length === 0) {
            resultsDiv.innerHTML = '<div class="p-2 text-zinc-500 text-xs text-center">Nenhum deputado encontrado.</div>';
            return;
        }

        resultsDiv.innerHTML = json.dados.map(d => `
            <div onclick="selectDeputyForComparison(${slot}, ${d.id}, '${d.nome}', '${d.urlFoto}', '${d.siglaPartido}', '${d.siglaUf}')" 
                 class="p-2 hover:bg-zinc-700 cursor-pointer flex items-center gap-2 border-b border-zinc-700 last:border-0">
                <img src="${d.urlFoto}" class="w-8 h-8 rounded-full object-cover">
                <div>
                    <div class="text-sm font-bold text-white">${d.nome}</div>
                    <div class="text-xs text-zinc-400">${d.siglaPartido} - ${d.siglaUf}</div>
                </div>
            </div>
        `).join('');

    } catch (e) {
        console.error(e);
        resultsDiv.innerHTML = '<div class="p-2 text-red-500 text-xs text-center">Erro na busca.</div>';
    }
}

async function selectDeputyForComparison(slot, id, nome, foto, partido, uf) {
    // Hide results
    document.getElementById(`comp-results-${slot}`).classList.add('hidden');
    document.getElementById(`comp-search-${slot}`).value = '';

    // Set Data
    comparisonData[`deputy${slot}`] = { id, nome, foto, partido, uf };

    // Update UI Card
    const card = document.getElementById(`comp-card-${slot}`);
    card.innerHTML = `
        <div class="relative">
            <button onclick="removeDeputyFromComparison(${slot})" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition shadow-lg">×</button>
            <div class="flex flex-col items-center p-4">
                <img src="${foto}" class="w-24 h-24 rounded-full object-cover border-4 border-zinc-700 shadow-lg mb-3">
                <h3 class="text-xl font-bold text-white text-center">${nome}</h3>
                <span class="bg-zinc-700 text-zinc-300 px-3 py-1 rounded-full text-sm font-bold mt-1">${partido} - ${uf}</span>
            </div>
            <div id="comp-stats-${slot}" class="mt-4 space-y-3">
                <div class="text-center text-zinc-500 text-sm animate-pulse">Carregando dados...</div>
            </div>
        </div>
    `;

    // Load Stats
    await loadComparisonStats(slot, id);
}

function removeDeputyFromComparison(slot) {
    comparisonData[`deputy${slot}`] = null;
    const card = document.getElementById(`comp-card-${slot}`);
    card.innerHTML = `
        <div class="flex flex-col items-center justify-center h-64 text-zinc-500 border-2 border-dashed border-zinc-700 rounded-xl">
            <div class="text-4xl mb-2">👤</div>
            <p class="text-sm">Selecione um deputado</p>
        </div>
    `;
}

async function loadComparisonStats(slot, id) {
    const container = document.getElementById(`comp-stats-${slot}`);
    const year = new Date().getFullYear();

    try {
        // 1. Expenses
        const expensesJson = await api.camara(`deputados/${id}/despesas?ano=${year}&itens=100`);
        const totalExpenses = expensesJson.dados.reduce((acc, curr) => acc + (parseFloat(curr.valorLiquido) || 0), 0);

        // 2. Speeches (Activity)
        const speechesJson = await api.camara(`deputados/${id}/discursos?itens=1`);
        const lastSpeech = speechesJson.dados.length > 0 ? window.formatDate(speechesJson.dados[0].dataHoraInicio) : "Sem registro recente";

        container.innerHTML = `
            <div class="bg-zinc-900/50 p-3 rounded-lg border border-zinc-700/50">
                <div class="text-xs text-zinc-400 uppercase font-bold">Gastos (${year})</div>
                <div class="text-lg font-bold text-green-400">${window.formatCurrency(totalExpenses)}</div>
            </div>
            <div class="bg-zinc-900/50 p-3 rounded-lg border border-zinc-700/50">
                <div class="text-xs text-zinc-400 uppercase font-bold">Último Discurso</div>
                <div class="text-sm font-bold text-white">${lastSpeech}</div>
            </div>
            <button onclick="openDeputyDetails(${id})" class="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg text-sm font-bold transition mt-2">
                Ver Perfil Completo
            </button>
        `;

    } catch (e) {
        console.error(e);
        container.innerHTML = '<div class="text-red-500 text-xs text-center">Erro ao carregar dados.</div>';
    }
}

// Expose
window.searchDeputyForComparison = searchDeputyForComparison;
window.selectDeputyForComparison = selectDeputyForComparison;
window.removeDeputyFromComparison = removeDeputyFromComparison;