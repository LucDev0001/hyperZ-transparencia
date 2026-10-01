// transparency/js/municipal.js

const stateList = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

async function loadMunicipalitiesList(uf) {
    const citySelect = document.getElementById('munCitySelect');
    citySelect.innerHTML = '<option value="">Carregando...</option>';
    citySelect.disabled = true;

    if (!uf) {
        citySelect.innerHTML = '<option value="">Aguardando Estado...</option>';
        return;
    }

    try {
        // Usar BrasilAPI via proxy para pegar municípios
        const cities = await api.brasilApi(`ibge/municipios/v1/${uf}`);

        citySelect.innerHTML = '<option value="">Selecione o Município</option>';
        cities.forEach(city => {
            // Normalizar nome para busca no TSE (remover acentos pode ser necessário dependendo da API, mas TSE geralmente usa nomes oficiais)
            citySelect.innerHTML += `<option value="${city.nome}">${city.nome}</option>`;
        });
        citySelect.disabled = false;
    } catch (e) {
        console.error(e);
        citySelect.innerHTML = '<option value="">Erro ao carregar</option>';
    }
}

async function searchElectedOfficials() {
    const uf = document.getElementById('munStateSelect').value;
    const city = document.getElementById('munCitySelect').value;
    const container = document.getElementById('municipalResults');

    if (!uf || !city) {
        alert("Selecione estado e município.");
        return;
    }

    container.innerHTML = '<div class="col-span-full text-center py-10 text-zinc-500 animate-pulse">Consultando base de dados do TSE...</div>';

    try {
        // 1. Buscar código do município no TSE (Necessário para a API de resultados)
        // Endpoint auxiliar para buscar locais de votação ou usar uma lista estática seria ideal, 
        // mas vamos tentar buscar na API de eleições do TSE.
        // Como não temos o código TSE do município fácil, vamos simular uma busca ou usar um proxy inteligente.
        // Para este exemplo, vamos usar uma busca simulada que redireciona para o DivulgaCand se não conseguirmos os dados diretos,
        // ou tentar listar candidatos se tivermos o ID da eleição.
        
        // ID da Eleição Municipal 2024 (Exemplo, muda a cada pleito)
        const electionId = "2045202024"; 
        
        // Hack: Buscar código do município via API do TSE (se possível) ou BrasilAPI não retorna código TSE.
        // Vamos exibir um link direto para o TSE como fallback robusto.
        
        const tseLink = `https://divulgacandcontas.tse.jus.br/divulga/#/municipios/2024/${electionId}/${uf}`;
        
        container.innerHTML = `
            <div class="col-span-full bg-zinc-900 border border-zinc-800 p-6 rounded-xl text-center">
                <h3 class="text-xl font-bold text-white mb-2">Resultados para ${city} - ${uf}</h3>
                <p class="text-zinc-400 mb-4">Devido à complexidade dos códigos municipais do TSE, o acesso direto aos dados brutos está sendo implementado.</p>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <a href="https://resultados.tse.jus.br/oficial/app/index.html#/eleicao;e=e619;uf=${uf.toLowerCase()};mu=null/resultados" target="_blank" class="bg-violet-600 hover:bg-violet-700 text-white p-4 rounded-xl font-bold flex flex-col items-center gap-2 transition">
                        <span class="text-2xl">🗳️</span>
                        <span>Ver Prefeito Eleito</span>
                        <span class="text-xs font-normal opacity-70">Via Resultados TSE</span>
                    </a>
                    <a href="https://divulgacandcontas.tse.jus.br/divulga/#/candidatos/2024/${electionId}/${uf}" target="_blank" class="bg-zinc-800 hover:bg-zinc-700 text-white p-4 rounded-xl font-bold flex flex-col items-center gap-2 transition">
                        <span class="text-2xl">👥</span>
                        <span>Lista de Vereadores</span>
                        <span class="text-xs font-normal opacity-70">Via DivulgaCand</span>
                    </a>
                </div>

                <div class="mt-6 text-left border-t border-zinc-800 pt-4">
                    <h4 class="font-bold text-white mb-2">Dicas de Fiscalização:</h4>
                    <ul class="list-disc pl-5 text-sm text-zinc-400 space-y-1">
                        <li>Verifique as <strong>Contas Eleitorais</strong> no DivulgaCand.</li>
                        <li>Consulte o <strong>Portal da Transparência Municipal</strong> da cidade (obrigatório por lei).</li>
                        <li>Acompanhe as sessões da <strong>Câmara Municipal</strong> (muitas transmitem no YouTube).</li>
                    </ul>
                </div>
            </div>
        `;

        // Nota: Implementar uma busca real de candidatos requereria uma base de dados local 
        // mapeando Nome Cidade -> Código TSE, o que é pesado para o frontend apenas.
        // A solução de link direto é a mais honesta e funcional sem backend pesado.

    } catch (e) {
        console.error(e);
        container.innerHTML = '<div class="col-span-full text-center text-red-500">Erro ao buscar dados. Tente novamente.</div>';
    }
}

// Expose
window.loadMunicipalitiesList = loadMunicipalitiesList;
window.searchElectedOfficials = searchElectedOfficials;