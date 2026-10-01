// transparency/js/map.js
let globalMap = null;
let flowInterval = null;
let flowLayerGroup = null;
let heatmapLayer = null;
let interactionLayer = null;
let cachedMapData = []; // Armazena dados brutos para filtragem

const stateCoordinates = {
    "AC": [-9.97, -67.81], "AL": [-9.66, -35.73], "AP": [0.03, -51.07],
    "AM": [-3.10, -60.02], "BA": [-12.97, -38.51], "CE": [-3.71, -38.54],
    "DF": [-15.78, -47.93], "ES": [-20.31, -40.31], "GO": [-16.68, -49.25],
    "MA": [-2.53, -44.30], "MT": [-15.60, -56.09], "MS": [-20.44, -54.64],
    "MG": [-19.92, -43.93], "PA": [-1.45, -48.49], "PB": [-7.11, -34.86],
    "PR": [-25.42, -49.27], "PE": [-8.05, -34.88], "PI": [-5.09, -42.80],
    "RJ": [-22.90, -43.17], "RN": [-5.79, -35.20], "RS": [-30.03, -51.23],
    "RO": [-8.76, -63.90], "RR": [2.82, -60.67], "SC": [-27.59, -48.54],
    "SP": [-23.55, -46.63], "SE": [-10.94, -37.07], "TO": [-10.17, -48.33]
};

async function initSpendingMap() {
    if (globalMap) {
        // Already initialized — fix size in case container was hidden
        setTimeout(() => globalMap.invalidateSize(), 150);
        return;
    }
    const container = document.getElementById('spendingMap');
    if (!container) return;

    // Initialize Map
    globalMap = L.map('spendingMap', {
        tap: false,
        dragging: !L.Browser.mobile || L.Browser.pointer
    }).setView([-14.2350, -51.9253], 4);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(globalMap);

    // Load Data (Federal Transfers by State for current year)
    const year = new Date().getFullYear();
    const statusDiv = document.createElement('div');
    statusDiv.className = "absolute bottom-4 left-4 bg-zinc-900/80 text-zinc-300 text-xs px-3 py-2 rounded z-[1000]";
    statusDiv.innerHTML = `<span class="animate-pulse">Carregando dados de transferências (${year})...</span>`;
    document.getElementById('spendingMap').appendChild(statusDiv);

    try {
        // Add markers for each state
        Object.keys(stateCoordinates).forEach(uf => {
            const [lat, lon] = stateCoordinates[uf];
            
            const circle = L.circleMarker([lat, lon], {
                radius: 8,
                fillColor: "#8b5cf6",
                color: "#fff",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.6
            }).addTo(globalMap);

            circle.bindPopup(`
                <div class="text-center">
                    <strong class="text-lg">${uf}</strong><br>
                    <button onclick="loadStateDetails('${uf}')" class="mt-2 bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-1 rounded text-xs w-full mb-1">
                        Ver Resumo
                    </button>
                    <button onclick="filterStateTransfers('${uf}')" class="bg-violet-600 hover:bg-violet-700 text-white px-3 py-1 rounded text-xs w-full">
                        Filtrar Lista
                    </button>
                </div>
            `);
        });

        statusDiv.innerHTML = "Selecione um estado para ver detalhes.";
        
        // Carregar mapa de calor inicial
        updateMapFilter("");

    } catch (e) {
        console.error(e);
        statusDiv.innerHTML = "Erro ao carregar mapa.";
    }
}

async function loadStateDetails(uf) {
    // Load transfers for this state
    const modal = document.getElementById('stateModal');
    const content = document.getElementById('stateModalContent');
    modal.classList.remove('hidden');
    
    content.innerHTML = `<div class="text-center py-10"><span class="animate-pulse text-violet-500">Carregando dados de ${uf}...</span></div>`;

    try {
        const year = new Date().getFullYear();
        
        // 1. Transferências (Convênios)
        const transfersPromise = api.portal(`convenios?uf=${uf}&dataVigenciaInicial=01/01/${year}&dataVigenciaFinal=31/12/${year}&pagina=1&tamanhoPagina=100`);
        
        // 2. Deputados do Estado
        const deputiesPromise = api.camara(`deputados?siglaUf=${uf}&itens=100`);
        
        const [transfers, deputies] = await Promise.all([transfersPromise, deputiesPromise]);
        
        // Process Transfers — API retorna números, não strings PT-BR
        let totalTransfers = 0;
        if(Array.isArray(transfers)) {
            transfers.forEach(t => totalTransfers += Number(t.valorGlobal || t.valor) || 0);
        }

        // Process Politicians
        const deputyCount = Array.isArray(deputies?.dados) ? deputies.dados.length : 0;
        const senatorCount = 3; // Fixed per state
        
        // Estimativa de Custo Mensal (Salário + Cota + Gabinete)
        // Deputado: ~44k (Salário) + ~45k (Cota) + ~111k (Gabinete) ~= 200k/mês
        // Senador: ~44k (Salário) + ~35k (Cota) + ~150k (Gabinete) ~= 230k/mês
        const estDeputyCost = deputyCount * 200000; 
        const estSenatorCost = senatorCount * 230000;
        const totalPolCost = estDeputyCost + estSenatorCost;

        content.innerHTML = `
            <div class="text-center mb-8">
                <h2 class="text-3xl font-bold text-white mb-2">Estado: ${uf}</h2>
                <p class="text-zinc-400">Panorama de Gastos e Recursos (${year})</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div class="bg-zinc-800/50 p-6 rounded-2xl border border-zinc-700">
                    <h3 class="text-xl font-bold text-green-400 mb-4">💰 Recursos Recebidos (União)</h3>
                    <div class="text-3xl font-black text-white mb-2">${window.formatCurrency(totalTransfers)}</div>
                    <p class="text-sm text-zinc-400">Total em convênios e transferências voluntárias celebrados este ano.</p>
                    <button onclick="filterStateTransfers('${uf}')" class="mt-4 text-violet-400 hover:text-violet-300 text-sm font-bold flex items-center gap-2">
                        Ver Lista Detalhada ↗
                    </button>
                </div>

                <div class="bg-zinc-800/50 p-6 rounded-2xl border border-zinc-700">
                    <h3 class="text-xl font-bold text-violet-400 mb-4">👔 Custo Político (Estimado/Mês)</h3>
                    <div class="text-3xl font-black text-white mb-2">~${window.formatCurrency(totalPolCost)}</div>
                    <div class="grid grid-cols-2 gap-4 mt-4">
                        <div class="bg-zinc-900 p-3 rounded-lg">
                            <span class="block text-xs text-zinc-500 uppercase">Deputados Federais</span>
                            <span class="text-lg font-bold text-white">${deputyCount}</span>
                        </div>
                        <div class="bg-zinc-900 p-3 rounded-lg">
                            <span class="block text-xs text-zinc-500 uppercase">Senadores</span>
                            <span class="text-lg font-bold text-white">${senatorCount}</span>
                        </div>
                    </div>
                    <p class="text-[10px] text-zinc-500 mt-3">* Estimativa baseada em subsídios, cota parlamentar média e verba de gabinete.</p>
                </div>
            </div>

            <h3 class="text-xl font-bold text-white mb-4">Deputados de ${uf}</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-60 overflow-y-auto pr-2">
                ${(deputies?.dados || []).map(d => `
                    <div onclick="document.getElementById('stateModal').classList.add('hidden'); openDeputyDetails(${d.id})" class="bg-zinc-900 p-3 rounded-xl border border-zinc-800 hover:border-violet-500 cursor-pointer transition flex flex-col items-center text-center group">
                        <img src="${d.urlFoto}" class="w-12 h-12 rounded-full object-cover mb-2 border border-zinc-700 group-hover:border-violet-500">
                        <div class="text-xs font-bold text-white truncate w-full">${d.nome}</div>
                        <div class="text-[10px] text-zinc-500">${d.siglaPartido}</div>
                    </div>
                `).join('')}
            </div>
        `;

    } catch(e) {
        console.error(e);
        content.innerHTML = `<div class="text-center text-red-500 py-10">Erro ao carregar detalhes do estado.</div>`;
    }
}

function filterStateTransfers(uf) {
    // Fechar modal e popup
    document.getElementById('stateModal').classList.add('hidden');
    if(globalMap) globalMap.closePopup();

    // Mudar para a aba de transferências
    if(typeof window.switchTab === 'function') window.switchTab('outros');

    // Aplicar filtro
    setTimeout(() => {
        const sel = document.getElementById('sel-transf-uf');
        if(sel) {
            sel.value = uf;
            if(typeof window.loadMunicipalities === 'function') window.loadMunicipalities(uf);
            if(typeof window.loadFederalTransfers === 'function') window.loadFederalTransfers(1);
        }
    }, 300);
}

async function updateMapFilter(type) {
    if (!globalMap) return;
    
    const statusDiv = document.querySelector('#spendingMap div.absolute');
    if(statusDiv) statusDiv.innerHTML = '<span class="animate-pulse text-violet-400">Atualizando mapa de calor...</span>';

    try {
        // Remover camada anterior
        if (heatmapLayer) {
            globalMap.removeLayer(heatmapLayer);
            heatmapLayer = null;
        }
        
        // Remover camada de interação anterior
        if (interactionLayer) {
            globalMap.removeLayer(interactionLayer);
            interactionLayer = null;
        }

        const year = new Date().getFullYear();
        // Busca convênios recentes para gerar a densidade
        let endpoint = `convenios?dataVigenciaInicial=01/01/${year}&dataVigenciaFinal=31/12/${year}&pagina=1&tamanhoPagina=100`;
        
        const data = await api.portal(endpoint);
        
        if (Array.isArray(data)) {
            cachedMapData = data; // Salvar para uso no slider
            renderMapData(data, type);
            if(statusDiv) statusDiv.innerHTML = `Mapa atualizado (${data.length} registros).`;
        } else {
             if(statusDiv) statusDiv.innerHTML = "Sem dados para o filtro.";
        }

    } catch (e) {
        console.error(e);
        if(statusDiv) statusDiv.innerHTML = "Erro ao atualizar mapa.";
    }
}

function renderMapData(data, typeFilter = null, monthFilter = 0) {
    if (!globalMap) return;

    // Limpar camadas
    if (heatmapLayer) globalMap.removeLayer(heatmapLayer);
    if (interactionLayer) globalMap.removeLayer(interactionLayer);

    const heatPoints = [];
    interactionLayer = L.featureGroup().addTo(globalMap);

    data.forEach(item => {
        // Segurança: item deve ter UF válida
        if (!item.uf || !item.uf.sigla || !stateCoordinates[item.uf.sigla]) return;

        // Filtro por Tipo
        if (typeFilter && item.funcao && item.funcao.codigo != typeFilter && item.funcao.id != typeFilter) {
            return;
        }

        // Filtro por Mês (Timeline)
        if (monthFilter > 0) {
            const dateStr = item.dataInicioVigencia || item.dataReferencia || '';
            if (dateStr) {
                const parts = dateStr.split('/');
                if (parts.length === 3) {
                    const month = parseInt(parts[1]);
                    if (month !== parseInt(monthFilter)) return;
                }
            }
        }

        const coords = stateCoordinates[item.uf.sigla];
        // Jitter para espalhar pontos
        const lat = coords[0] + (Math.random() - 0.5) * 2;
        const lng = coords[1] + (Math.random() - 0.5) * 2;

        // API retorna números (não strings PT-BR), usar Number() diretamente
        const val = Number(item.valorGlobal || item.valor) || 0;
        const intensity = Math.min(val / 1000000, 1.0);

        heatPoints.push([lat, lng, intensity]);

        // Adicionar ponto interativo (invisível mas clicável)
        const circle = L.circleMarker([lat, lng], {
            radius: 10,
            color: 'transparent',
            fillColor: '#fff',
            fillOpacity: 0,
            interactive: true
        }).addTo(interactionLayer);

        const cidade = item.municipio ? item.municipio.nome : item.uf.sigla;
        const data_str = item.dataInicioVigencia || item.dataReferencia || '';

        const tooltipContent = `
            <div class="text-xs">
                <strong class="text-violet-400">${item.orgaoSuperior ? item.orgaoSuperior.nome : 'Órgão Federal'}</strong><br>
                <span class="text-white">${item.objeto || 'Transferência de Recursos'}</span><br>
                <span class="text-green-400 font-bold">${window.formatCurrency(val)}</span><br>
                <span class="text-zinc-500">${cidade}${data_str ? ' — ' + data_str : ''}</span>
            </div>
        `;

        circle.bindTooltip(tooltipContent, {
            direction: 'top',
            className: 'bg-zinc-900 border border-zinc-700 text-white rounded shadow-xl'
        });

        // Destaque ao passar o mouse
        circle.on('mouseover', function() {
            this.setStyle({ fillOpacity: 0.3, color: '#8b5cf6' });
        });
        circle.on('mouseout', function() {
            this.setStyle({ fillOpacity: 0, color: 'transparent' });
        });
    });

    if (heatPoints.length > 0 && typeof L.heatLayer === 'function') {
        heatmapLayer = L.heatLayer(heatPoints, {
            radius: 25,
            blur: 15,
            maxZoom: 10,
            gradient: {0.4: 'blue', 0.65: 'lime', 1: 'red'}
        }).addTo(globalMap);
    }
}

function filterMapByMonth(month) {
    const label = document.getElementById('mapTimelineLabel');
    const months = ["Ano Completo", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    
    if (label) label.textContent = months[month];
    
    const typeFilter = document.getElementById('mapFilter').value;
    renderMapData(cachedMapData, typeFilter, month);
}

async function searchMap(query) {
    if (!query) {
        // Clear search filter
        renderMapData(cachedMapData, document.getElementById('mapFilter').value);
        return;
    }

    // 1. Filter existing data (Projects/Municipalities in current dataset)
    const filteredData = cachedMapData.filter(item => {
        const text = (item.objeto || '') + ' ' + (item.municipio ? item.municipio.nome : '') + ' ' + (item.uf ? item.uf.sigla : '');
        return text.toLowerCase().includes(query.toLowerCase());
    });

    renderMapData(filteredData, document.getElementById('mapFilter').value);
    
    // 2. Try Geocoding (Nominatim) to move map
    try {
        const geo = await api.nominatim(query + ', Brazil');
        if (Array.isArray(geo) && geo.length > 0) {
            const lat = parseFloat(geo[0].lat);
            const lon = parseFloat(geo[0].lon);
            if (globalMap) globalMap.setView([lat, lon], 10);
        }
    } catch(e) { console.error(e); }
}

function toggleMoneyFlow() {
    const checkbox = document.getElementById('toggleFlow');
    if (checkbox.checked) {
        startMoneyFlow();
    } else {
        stopMoneyFlow();
    }
}

function startMoneyFlow() {
    if (!globalMap) return;
    if (!flowLayerGroup) {
        flowLayerGroup = L.layerGroup().addTo(globalMap);
    }
    
    // Brasília Coords
    const bsb = [-15.7942, -47.8822];

    // Create particles
    flowInterval = setInterval(() => {
        // Pick random state
        const ufs = Object.keys(stateCoordinates);
        const randomUf = ufs[Math.floor(Math.random() * ufs.length)];
        const target = stateCoordinates[randomUf];
        
        if (randomUf === 'DF') return;

        // Create marker
        const icon = L.divIcon({
            className: 'flow-particle',
            html: '<div style="width: 6px; height: 6px; background: #4ade80; border-radius: 50%; box-shadow: 0 0 8px #4ade80;"></div>',
            iconSize: [6, 6]
        });

        const marker = L.marker(bsb, { icon: icon, zIndexOffset: 1000 }).addTo(flowLayerGroup);
        
        // Animate
        let pos = 0;
        const duration = 1000 + Math.random() * 1000; // 1-2s
        const startTime = Date.now();
        
        const animate = () => {
            const now = Date.now();
            const progress = (now - startTime) / duration;
            
            if (progress >= 1) {
                flowLayerGroup.removeLayer(marker);
                return;
            }
            
            const lat = bsb[0] + (target[0] - bsb[0]) * progress;
            const lng = bsb[1] + (target[1] - bsb[1]) * progress;
            
            marker.setLatLng([lat, lng]);
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);

    }, 100); // New particle every 100ms
}

function stopMoneyFlow() {
    if (flowInterval) clearInterval(flowInterval);
    if (flowLayerGroup) flowLayerGroup.clearLayers();
}

// Expose to window
window.initSpendingMap = initSpendingMap;
window.loadStateDetails = loadStateDetails;
window.toggleMoneyFlow = toggleMoneyFlow;
window.updateMapFilter = updateMapFilter;
window.filterMapByMonth = filterMapByMonth;
window.searchMap = searchMap;
window.filterStateTransfers = filterStateTransfers;