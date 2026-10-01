let currentElectionYear = 2022;
let selectedUF = "";
let selectedCityCode = "";
let map = null;
let geoJsonLayer = null;
let currentCandidateData = null;
let candidatePatrimonioChart = null;

const TSE_CONFIG = {
    2022: { id: '2040602022', type: 'geral' },
    2024: { id: '2045202024', type: 'municipal' }
};

document.addEventListener('DOMContentLoaded', () => {
    initLeafletMap();
    if (document.getElementById('tseDatasetsList')) window.loadTseDatasets();
});

async function initLeafletMap() {
    if (map) return;
    const mapDiv = document.getElementById('tseMap');
    if (!mapDiv) return;
    map = L.map('tseMap', { 
        center: [-15.78, -47.93], 
        zoom: 4, 
        zoomControl: false, 
        attributionControl: false, 
        scrollWheelZoom: false,
        tap: false, // Desativa tap handler interno do Leaflet que causa problemas em PWAs/Mobile
        dragging: !L.Browser.mobile || L.Browser.pointer // Otimiza arraste
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);
    try {
        const response = await fetch('https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson');
        const data = await response.json();
        geoJsonLayer = L.geoJson(data, {
            style: { 
                fillColor: '#18181b', 
                weight: 1, 
                opacity: 1, 
                color: '#3f3f46', 
                fillOpacity: 0.8,
                className: 'state-feature' 
            },
            onEachFeature: (feature, layer) => {
                const uf = feature.properties.sigla;
                const nome = feature.properties.name;
                layer.on({
                    mouseover: (e) => { if (selectedUF !== uf) e.target.setStyle({ fillColor: '#7c3aed', fillOpacity: 0.4 }); },
                    mouseout: (e) => { if (selectedUF !== uf) geoJsonLayer.resetStyle(e.target); },
                    click: () => selectStateFromMap(uf, nome),
                    // Suporte a touch para feedback imediato
                    touchstart: () => {
                        if (selectedUF !== uf) {
                            layer.setStyle({ fillColor: '#7c3aed', fillOpacity: 0.6 });
                        }
                    }
                });
            }
        }).addTo(map);
        geoJsonLayer.setStyle({ color: '#7c3aed', weight: 0.5, opacity: 0.5 });
    } catch (e) { console.error("Erro mapa."); }
}

window.selectStateFromMap = function(uf, nome) {
    selectedUF = uf;
    geoJsonLayer.eachLayer(layer => {
        if (layer.feature.properties.sigla === uf) layer.setStyle({ fillColor: '#7c3aed', fillOpacity: 1, weight: 2, color: '#fff' });
        else layer.setStyle({ fillColor: '#18181b', fillOpacity: 0.8, weight: 1, color: '#3f3f46' });
    });
    const info = document.getElementById('selected-state-info');
    if (info) {
        info.classList.remove('hidden');
        document.getElementById('active-uf-display').textContent = `${uf} - ${nome.toUpperCase()}`;
    }
    if (currentElectionYear === 2024) loadTseCitiesAndSearch(uf);
    else searchCandidates();
};

window.setElectionYear = function(year) {
    currentElectionYear = year;
    document.querySelectorAll('[id^="tseYearBtn"]').forEach(btn => {
        const active = btn.id.includes(year);
        btn.className = active ? "flex-1 md:flex-none px-10 py-3 rounded-xl text-xs font-black transition-all bg-violet-600 text-white shadow-xl" : "flex-1 md:flex-none px-10 py-3 rounded-xl text-xs font-black transition-all text-zinc-500 hover:text-white";
    });
    selectedUF = "";
    const cityContainer = document.getElementById('tseCityContainer');
    if (cityContainer) cityContainer.classList.add('hidden');
    
    document.getElementById('tseRoleGeral').classList.toggle('hidden', year === 2024);
    document.getElementById('tseRoleMun').classList.toggle('hidden', year !== 2024);
    document.getElementById('selected-state-info')?.classList.add('hidden');
    if (geoJsonLayer) geoJsonLayer.setStyle({ fillColor: '#18181b', fillOpacity: 0.8, weight: 1, color: '#3f3f46' });
    
    document.getElementById('tseResults').innerHTML = `<div class="col-span-full flex flex-col items-center justify-center py-40 bg-zinc-900/10 rounded-[3rem] border-2 border-dashed border-white/5"><div class="text-6xl mb-6 opacity-20 animate-pulse">🗺️</div><h3 class="text-zinc-600 font-black text-sm uppercase tracking-[0.4em]">Base ${year} Ativada</h3><p class="text-zinc-700 text-[10px] mt-3 font-bold uppercase">Toque em qualquer estado no mapa para investigar</p></div>`;
    document.getElementById('tseRole').value = (year === 2024) ? "1" : "6";
};

async function loadTseCitiesAndSearch(uf) {
    try {
        const res = await api.tse(`eleicao/buscar/${uf}/2045202024/municipios`);
        if (res && res.municipios) {
            const sorted = res.municipios.sort((a,b) => a.nome.localeCompare(b.nome));
            const select = document.getElementById('tseCityCode');
            select.innerHTML = sorted.map(m => `<option value="${m.codigo}">${m.nome.toUpperCase()}</option>`).join('');
            const capitals = {"AC":"RIO BRANCO","AL":"MACEIÓ","AP":"MACAPÁ","AM":"MANAUS","BA":"SALVADOR","CE":"FORTALEZA","DF":"BRASÍLIA","ES":"VITÓRIA","GO":"GOIÂNIA","MA":"SÃO LUÍS","MT":"CUIABÁ","MS":"CAMPO GRANDE","MG":"BELO HORIZONTE","PA":"BELÉM","PB":"JOÃO PESSOA","PR":"CURITIBA","PE":"RECIFE","PI":"TERESINA","RJ":"RIO DE JANEIRO","RN":"NATAL","RS":"PORTO ALEGRE","RO":"PORTO VELHO","RR":"BOA VISTA","SC":"FLORIANÓPOLIS","SP":"SÃO PAULO","SE":"ARACAJU","TO":"PALMAS"};
            const cap = sorted.find(m => m.nome.toUpperCase() === capitals[uf]);
            if(cap) select.value = cap.codigo; else select.value = sorted[0].codigo;
            document.getElementById('tseCityContainer').classList.remove('hidden');
            searchCandidates();
        }
    } catch (e) { console.error("Erro cidades."); }
}

window.searchCandidates = async function() {
    const role = document.getElementById('tseRole').value;
    const query = document.getElementById('tseSearch').value.trim().toLowerCase();
    const resultsDiv = document.getElementById('tseResults');
    let ue = (currentElectionYear === 2022 && role === "1") ? "BR" : selectedUF;
    if (currentElectionYear === 2024) ue = document.getElementById('tseCityCode')?.value;
    if (!ue && role !== "1") return;
    resultsDiv.innerHTML = `<div class="col-span-full text-center py-40"><div class="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-8 shadow-[0_0_20px_#7c3aed]"></div><p class="text-white font-black uppercase text-[10px] tracking-[0.8em]">Extraindo Dossiês Oficiais...</p></div>`;
    try {
        const config = TSE_CONFIG[currentElectionYear];
        const endpoint = `candidatura/listar/${currentElectionYear}/${ue}/${config.id}/${role}/candidatos`;
        const res = await api.tse(endpoint);
        if (res && res.candidatos) {
            let list = res.candidatos;
            if (query) list = list.filter(c => c.nomeUrna.toLowerCase().includes(query) || c.nomeCompleto.toLowerCase().includes(query) || c.numero.toString().includes(query));
            renderTseResults(list.slice(0, 100), config.id, ue);
        } else resultsDiv.innerHTML = '<div class="col-span-full text-center py-20 text-zinc-600 font-black uppercase text-xs tracking-widest">Nenhum dado encontrado para esta zona.</div>';
    } catch (e) { resultsDiv.innerHTML = '<div class="col-span-full text-center py-20 text-red-500 font-black uppercase text-xs tracking-widest">BASE DO TSE INSTÁVEL PARA ESTA REGIÃO.</div>'; }
};

function renderTseResults(records, eleicaoId, ue) {
    const resultsDiv = document.getElementById('tseResults');
    resultsDiv.innerHTML = records.map(c => {
        const imgUrl = `${window.BASE_PATH || ''}/api.php?action=proxy_tse&endpoint=arquivo/img/${eleicaoId}/${c.id}/${ue}`;
        const escapedUrlName = encodeURIComponent(c.nomeUrna).replace(/'/g, "%27");
        return `<div onclick="openCandidateDetails('${eleicaoId}', '${ue}', '${c.id}')" class="glass-panel p-4 rounded-[2.5rem] border border-white/5 hover:border-violet-500/50 transition-all group cursor-pointer hover:-translate-y-2 flex flex-col h-full bg-zinc-900/20"><div class="relative w-full aspect-square rounded-[2rem] bg-zinc-900 overflow-hidden border border-white/5 mb-4 shadow-2xl flex-shrink-0"><img src="${imgUrl}" loading="lazy" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" onerror="this.src='https://ui-avatars.com/api/?name=${escapedUrlName}&background=27272a&color=fff'"><div class="absolute top-4 left-4"><span class="px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[8px] font-black text-white border border-white/10 uppercase tracking-widest">${c.partido?.sigla || 'LEG'}</span></div></div><div class="px-2 text-center pb-2 flex flex-col flex-1 justify-between"><div class="text-white font-black text-sm line-clamp-2 leading-tight mb-3 uppercase tracking-tighter">${c.nomeUrna}</div><div class="inline-block px-4 py-1.5 rounded-xl bg-violet-600/20 text-violet-400 font-black text-xs border border-violet-500/20 mx-auto mt-auto">${c.numero}</div></div></div>`;
    }).join('');
}

window.openCandidateDetails = async function(eleicaoId, ue, candId) {
    const modal = document.getElementById('tseCandidateModal');
    const content = document.getElementById('tseCandidateContent');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    content.innerHTML = '<div class="flex flex-col items-center justify-center py-60"><div class="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-6"></div><p class="text-zinc-500 font-black text-[10px] uppercase tracking-[1em]">HACKEANDO DOSSIÊ...</p></div>';
    try {
        const detailPath = `candidatura/buscar/${currentElectionYear}/${ue}/${eleicaoId}/candidato/${candId}`;
        const c = await api.tse(detailPath);
        currentCandidateData = c;
        const bensList = (c.bens || c.listaBens || []).sort((a,b) => (parseFloat(b.valor)||0) - (parseFloat(a.valor)||0));
        const totalBens = bensList.reduce((acc, b) => acc + (parseFloat(b.valor) || 0), 0);
        const imgUrl = `${window.BASE_PATH || ''}/api.php?action=proxy_tse&endpoint=arquivo/img/${eleicaoId}/${candId}/${ue}`;
        
        // Evolução Patrimonial
        const historyData = [{ ano: currentElectionYear, total: totalBens }];
        if (c.eleicoesAnteriores && c.eleicoesAnteriores.length > 0) {
            const previous = c.eleicoesAnteriores.filter(h => h.nrAno < currentElectionYear).slice(0, 5);
            for (const h of previous) {
                try {
                    const hDetail = await api.tse(`candidatura/buscar/${h.nrAno}/${h.sgUe}/${h.idEleicao}/candidato/${h.id}`);
                    const hTotal = (hDetail.bens || hDetail.listaBens || []).reduce((acc, b) => acc + (parseFloat(b.valor) || 0), 0);
                    historyData.push({ ano: h.nrAno, total: hTotal });
                } catch(e) {}
            }
        }
        historyData.sort((a,b) => a.ano - b.ano);
        window._tseHistoryData = historyData;

        content.innerHTML = `
            <div class="relative min-h-full bg-zinc-950 text-zinc-300 font-sans selection:bg-violet-500/30">
                <!-- Premium Background -->
                <div class="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-violet-600/10 via-zinc-950/60 to-zinc-950 pointer-events-none"></div>

                <div class="relative z-10">
                    <!-- HERO HEADER -->
                    <div class="p-6 md:p-8 lg:p-10 flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-12">
                        <div class="relative flex-shrink-0">
                            <div class="absolute -inset-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-[2rem] blur opacity-20 transition duration-1000"></div>
                            <div class="relative">
                                <img src="${imgUrl}" class="w-40 md:w-56 lg:w-64 aspect-[3/4] object-cover rounded-[1.8rem] border border-white/10 shadow-2xl transition-transform duration-700">
                                <div class="absolute -bottom-3 -right-3 bg-violet-600 text-white px-5 py-2 rounded-xl shadow-2xl border-4 border-zinc-950 font-black text-2xl md:text-3xl tracking-tighter">
                                    ${c.numero}
                                </div>
                            </div>
                        </div>

                        <div class="flex-1 text-center md:text-left pt-2">
                            <div class="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                                <span class="px-3 py-1 rounded-lg bg-violet-600 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-violet-900/40">${c.cargo?.nome || 'ALVO'}</span>
                                <span class="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-400 text-[9px] font-black uppercase tracking-widest backdrop-blur-md">${c.partido?.sigla || 'LEG'}</span>
                                <span class="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-400 text-[9px] font-black uppercase tracking-widest backdrop-blur-md hidden sm:inline-block">${c.grauInstrucao || 'N/A'}</span>
                            </div>
                            <h1 class="text-3xl md:text-4xl lg:text-6xl font-black text-white leading-tight tracking-tighter uppercase mb-2 italic">${c.nomeUrna}</h1>
                            <div class="flex items-center justify-center md:justify-start gap-2.5 text-zinc-500 font-black text-sm md:text-base tracking-tighter uppercase mb-6">
                                <span class="w-2.5 h-2.5 rounded-full ${c.descricaoSituacao?.includes('Deferido') ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-yellow-500 shadow-[0_0_10px_#eab308]'}"></span>
                                ${c.nomeCompleto}
                            </div>
                        </div>
                    </div>

                    <!-- TABS NAVIGATION -->
                    <div class="px-6 md:px-8 lg:px-10 mb-6">
                        <div class="flex border-b border-white/5 overflow-x-auto no-scrollbar gap-1 bg-zinc-900/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/5">
                            <button onclick="switchTseTab('sobre')" id="tsetab-sobre" class="flex-1 py-3 text-center font-black text-[9px] uppercase tracking-widest text-violet-500 border-b-2 border-violet-500 whitespace-nowrap px-4 transition-all bg-violet-600/10 rounded-lg">Resumo</button>
                            <button onclick="switchTseTab('patrimonio')" id="tsetab-patrimonio" class="flex-1 py-3 text-center font-black text-[9px] uppercase tracking-widest text-zinc-500 hover:text-white whitespace-nowrap px-4 transition-all hover:bg-white/5 rounded-lg">Bens</button>
                            <button onclick="switchTseTab('trajetoria')" id="tsetab-trajetoria" class="flex-1 py-3 text-center font-black text-[9px] uppercase tracking-widest text-zinc-500 hover:text-white whitespace-nowrap px-4 transition-all hover:bg-white/5 rounded-lg">Trajetória</button>
                            <button onclick="switchTseTab('chapa')" id="tsetab-chapa" class="flex-1 py-3 text-center font-black text-[9px] uppercase tracking-widest text-zinc-500 hover:text-white whitespace-nowrap px-4 transition-all hover:bg-white/5 rounded-lg">Chapa</button>
                            <button onclick="switchTseTab('redes')" id="tsetab-redes" class="flex-1 py-3 text-center font-black text-[9px] uppercase tracking-widest text-zinc-500 hover:text-white whitespace-nowrap px-4 transition-all hover:bg-white/5 rounded-lg">Redes</button>
                        </div>
                    </div>

                    <!-- CONTENT AREA -->
                    <div class="px-6 md:px-8 lg:px-10 pb-10">
                        
                        <!-- Tab: Sobre -->
                        <div id="tsecontent-sobre" class="space-y-6 animate-fade-in">
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div class="glass-panel p-6 md:p-8 rounded-[2rem] border border-white/5 bg-zinc-900/30 flex flex-col justify-between">
                                    <span class="text-zinc-600 font-black text-[9px] uppercase tracking-[0.4em] mb-3">Patrimônio Declarado</span>
                                    <div class="text-3xl lg:text-4xl font-black text-green-400 tracking-tighter">R$ ${totalBens.toLocaleString('pt-BR', {minimumFractionDigits:2})}</div>
                                </div>
                                <div class="glass-panel p-6 md:p-8 rounded-[2rem] border border-white/5 bg-zinc-900/30">
                                    <span class="text-zinc-600 font-black text-[9px] uppercase tracking-[0.4em] mb-3">Ocupação / Atividade</span>
                                    <div class="text-lg lg:text-xl font-black text-white uppercase truncate">${c.ocupacao || 'N/A'}</div>
                                </div>
                                <div class="glass-panel p-6 md:p-8 rounded-[2rem] border border-white/5 bg-zinc-900/30">
                                    <span class="text-zinc-600 font-black text-[9px] uppercase tracking-[0.4em] mb-3">Nascimento / Origem</span>
                                    <div class="text-lg lg:text-xl font-black text-white uppercase">${c.dataDeNascimento ? new Date(c.dataDeNascimento).toLocaleDateString('pt-BR') : 'N/A'}</div>
                                </div>
                            </div>
                            <div class="glass-panel p-6 md:p-8 rounded-[2rem] border border-white/5 bg-zinc-900/30">
                                <h3 class="text-zinc-600 font-black text-[9px] uppercase tracking-[0.4em] mb-6 italic">Dados Técnicos da Candidatura</h3>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div class="space-y-3">
                                        <div><span class="text-zinc-500 text-[9px] font-black uppercase block mb-1">Coligação</span><div class="text-white font-bold text-xs uppercase">${c.nomeColigacao || 'PARTIDO ISOLADO'}</div></div>
                                        <div><span class="text-zinc-500 text-[9px] font-black uppercase block mb-1">Gênero / Raça</span><div class="text-white font-bold text-xs uppercase">${c.descricaoGenero} • ${c.descricaoCorRaca}</div></div>
                                    </div>
                                    <div class="space-y-3">
                                        <div><span class="text-zinc-500 text-[9px] font-black uppercase block mb-1">Situação</span><div class="text-white font-bold text-xs uppercase">${c.descricaoSituacao}</div></div>
                                        <div><span class="text-zinc-500 text-[9px] font-black uppercase block mb-1">Naturalidade</span><div class="text-white font-bold text-xs uppercase">${c.nomeMunicipioNascimento} (${c.siglaUfNascimento})</div></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Tab: Patrimônio -->
                        <div id="tsecontent-patrimonio" class="hidden space-y-8 animate-fade-in">
                            <div class="glass-panel p-6 md:p-10 rounded-[2.5rem] border border-violet-500/10 bg-zinc-900/40 relative overflow-hidden">
                                <h3 class="text-white font-black text-lg md:text-xl uppercase tracking-tighter mb-8 italic flex items-center gap-4">
                                    <span class="w-2 h-8 bg-violet-600 rounded-full"></span>
                                    Análise Visual de Evolução
                                </h3>
                                <div class="w-full h-[300px] md:h-[400px]"><canvas id="tsePatrimonioChart"></canvas></div>
                            </div>

                            <section>
                                <h4 class="text-white font-black text-[10px] uppercase tracking-[0.5em] mb-6 flex items-center gap-3 opacity-40 italic">Inventário de Ativos Oficiais</h4>
                                <div class="glass-panel rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl bg-zinc-900/20">
                                    <div class="max-h-[500px] overflow-y-auto scrollbar-hide">
                                        <table class="w-full text-left border-collapse">
                                            <thead class="bg-white/5 sticky top-0 backdrop-blur-3xl z-30">
                                                <tr><th class="px-6 py-4 md:px-8 md:py-6 text-zinc-500 font-black text-[9px] uppercase tracking-widest">Descrição do Ativo</th><th class="px-6 py-4 md:px-8 md:py-6 text-zinc-500 font-black text-[9px] uppercase tracking-widest text-right">Avaliação</th></tr>
                                            </thead>
                                            <tbody class="divide-y divide-white/5">
                                                ${bensList.length > 0 ? bensList.map(b => `
                                                    <tr class="hover:bg-white/[0.03] transition-colors group">
                                                        <td class="px-10 py-6 text-zinc-400 text-xs font-bold uppercase italic leading-relaxed group-hover:text-white">${b.descricao || b.descricaoDeTipoDeBem}</td>
                                                        <td class="px-10 py-6 text-right font-black text-white text-xs whitespace-nowrap">R$ ${(parseFloat(b.valor)||0).toLocaleString('pt-BR', {minimumFractionDigits:2})}</td>
                                                    </tr>
                                                `).join('') : '<tr><td colspan="2" class="py-40 text-center text-zinc-700 font-black uppercase tracking-[1em] opacity-30 italic text-[10px]">Nada Declarado</td></tr>'}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <!-- Tab: Trajetória -->
                        <div id="tsecontent-trajetoria" class="hidden space-y-6 animate-fade-in">
                            <h4 class="text-white font-black text-[9px] uppercase tracking-[0.4em] mb-6 flex items-center gap-3 opacity-40 italic">Histórico de Disputas</h4>
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                ${c.eleicoesAnteriores && c.eleicoesAnteriores.length > 0 ? c.eleicoesAnteriores.map(h => `
                                    <div class="glass-panel p-6 rounded-2xl border border-white/5 bg-zinc-900/20 hover:border-violet-500/20 transition-all shadow-xl group">
                                        <div class="flex justify-between items-start mb-4">
                                            <span class="text-violet-500 font-black text-xs tracking-widest">${h.nrAno}</span>
                                            <span class="text-zinc-600 text-[8px] font-black uppercase tracking-widest bg-black/40 px-2.5 py-1 rounded-full">${h.situacaoTotalizacao}</span>
                                        </div>
                                        <div class="text-white font-black text-lg mb-2 uppercase italic leading-tight group-hover:text-violet-400 transition-colors">${h.cargo}</div>
                                        <div class="text-zinc-500 text-[9px] font-bold uppercase">${h.partido} • ${h.sgUe}</div>
                                    </div>
                                `).join('') : '<div class="col-span-full text-center py-20 opacity-30 font-black uppercase tracking-widest text-[9px]">Sem registros anteriores.</div>'}
                            </div>
                        </div>

                        <!-- Tab: Chapa -->
                        <div id="tsecontent-chapa" class="hidden space-y-6 animate-fade-in">
                            <h4 class="text-white font-black text-[9px] uppercase tracking-[0.4em] mb-6 flex items-center gap-3 opacity-40 italic">Suplentes / Vice</h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                ${c.vices && c.vices.length ? c.vices.map(v => `
                                    <div class="flex items-center gap-6 p-6 rounded-[2rem] bg-zinc-900/40 border border-white/5 hover:bg-zinc-900 transition-all shadow-xl">
                                        <div class="w-20 h-20 rounded-2xl bg-zinc-800 overflow-hidden border border-white/10 flex-shrink-0">
                                            <img src="${window.BASE_PATH || ''}/api.php?action=proxy_tse&endpoint=arquivo/img/${eleicaoId}/${v.sq_CANDIDATO}/${ue}" class="w-full h-full object-cover" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(v.nm_URNA).replace(/'/g, '%27')}&background=27272a&color=fff'">
                                        </div>
                                        <div class="min-w-0">
                                            <div class="text-[9px] text-violet-500 font-black uppercase tracking-widest mb-1 italic">${v.ds_CARGO}</div>
                                            <div class="text-white font-black text-lg truncate uppercase italic tracking-tighter">${v.nm_URNA}</div>
                                            <div class="text-zinc-600 text-[9px] font-bold uppercase mt-1">SITUÇÃO: ${v.st_CANDIDATO || 'N/A'}</div>
                                        </div>
                                    </div>
                                `).join('') : '<div class="col-span-full text-center py-20 opacity-30 font-black uppercase tracking-widest text-[9px]">Nenhum vice registrado.</div>'}
                            </div>
                        </div>

                        <!-- Tab: Redes -->
                        <div id="tsecontent-redes" class="hidden space-y-8 animate-fade-in">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div class="space-y-6">
                                    <h4 class="text-white font-black text-[9px] uppercase tracking-[0.4em] italic opacity-40 px-2">Fontes Oficiais</h4>
                                    <div class="space-y-3">
                                        <a href="https://divulgacandcontas.tse.jus.br/divulga/#/candidato/${currentElectionYear}/${eleicaoId}/${ue}/${candId}" target="_blank" class="block p-5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-black text-center text-[10px] uppercase tracking-widest transition shadow-xl active:scale-95">PORTAL DIVULGACAND ↗</a>
                                        ${c.arquivos && c.arquivos.some(a => a.codTipo === 5) ? `
                                            <a href="${c.arquivos.find(a => a.codTipo === 5).url}" target="_blank" class="block p-5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-black text-center text-[10px] uppercase tracking-widest transition active:scale-95 border border-white/5">PLANO DE GOVERNO 📄</a>
                                        ` : ''}
                                    </div>
                                </div>
                                <div class="space-y-6">
                                    <h4 class="text-white font-black text-[9px] uppercase tracking-[0.4em] italic opacity-40 px-2">Canais Digitais</h4>
                                    <div class="grid grid-cols-1 gap-2">
                                        ${(c.redesSociais || []).map(r => `
                                            <a href="${r.url}" target="_blank" class="p-4 rounded-xl bg-zinc-900 border border-white/5 hover:border-violet-500/40 text-[9px] font-black text-white flex items-center justify-between uppercase italic tracking-widest transition-all group shadow-md">
                                                <span>🌐 ${r.redeSocial || 'Link'}</span>
                                                <span class="opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                                            </a>
                                        `).join('') || '<p class="text-zinc-800 text-[9px] font-black italic px-2 uppercase">Sem canais oficiais.</p>'}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        `;

        // Ativa a primeira tab
        switchTseTab('sobre');

    } catch (e) {
        console.error(e);
        content.innerHTML = '<div class="text-center py-80"><div class="text-8xl mb-10 opacity-20">📡</div><h2 class="text-red-500 font-black text-3xl uppercase tracking-widest mb-4 italic">Interface Interrompida</h2><p class="text-zinc-600 font-bold uppercase text-xs max-w-md mx-auto">O terminal do TSE recusou a conexão. Verifique se a base está ativa.</p><button onclick="closeTseModal()" class="mt-12 px-12 py-5 bg-zinc-800 text-white rounded-full font-black text-[10px] uppercase tracking-[0.3em] hover:bg-zinc-700 transition-all">Encerrar Sessão</button></div>';
    }
}

window.switchTseTab = function(tab) {
    const tabs = ['sobre', 'patrimonio', 'trajetoria', 'chapa', 'redes'];
    tabs.forEach(t => {
        const c = document.getElementById(`tsecontent-${t}`);
        const b = document.getElementById(`tsetab-${t}`);
        if (c) c.classList.add('hidden');
        if (b) b.className = "flex-1 py-3 text-center font-black text-[9px] uppercase tracking-widest text-zinc-500 hover:text-white whitespace-nowrap px-4 transition-all hover:bg-white/5 rounded-lg";
    });
    const ac = document.getElementById(`tsecontent-${tab}`);
    const ab = document.getElementById(`tsetab-${tab}`);
    if (ac) ac.classList.remove('hidden');
    if (ab) ab.className = "flex-1 py-3 text-center font-black text-[9px] uppercase tracking-widest text-violet-500 border-b-2 border-violet-500 whitespace-nowrap px-4 transition-all bg-violet-600/10 rounded-lg";

    if (tab === 'patrimonio') {
        setTimeout(renderTsePatrimonioChart, 300);
    }
}

function renderTsePatrimonioChart() {
    const ctx = document.getElementById('tsePatrimonioChart');
    if (!ctx || !window._tseHistoryData || window._tseHistoryData.length < 1) return;
    if (candidatePatrimonioChart) candidatePatrimonioChart.destroy();
    candidatePatrimonioChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: window._tseHistoryData.map(h => h.ano),
            datasets: [{
                label: 'Evolução Patrimonial (R$)',
                data: window._tseHistoryData.map(h => h.total),
                borderColor: '#7c3aed',
                backgroundColor: 'rgba(124, 58, 237, 0.15)',
                borderWidth: 6,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#7c3aed',
                pointRadius: 6,
                pointHoverRadius: 10,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#18181b',
                    padding: 20,
                    callbacks: {
                        label: (ctx) => 'R$ ' + ctx.parsed.y.toLocaleString('pt-BR', {minimumFractionDigits: 2})
                    }
                }
            },
            scales: {
                y: {
                    grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
                    ticks: { color: '#52525b', font: { weight: 'bold', size: 10 }, callback: v => v >= 1000000 ? (v/1000000).toFixed(1) + 'M' : (v >= 1000 ? (v/1000).toFixed(0) + 'k' : v) }
                },
                x: { grid: { display: false }, ticks: { color: '#fff', font: { weight: 'black', size: 12 } } }
            }
        }
    });
}

window.closeTseModal = function() { document.getElementById('tseCandidateModal').classList.add('hidden'); document.body.style.overflow = ''; }

window.loadTseDatasets = async function() {
    const list = document.getElementById('tseDatasetsList');
    if (!list) return;
    try {
        const res = await api.tseDados('package_list');
        if (res.success && res.result) {
            const filtered = res.result.filter(name => name.includes('candidato') || name.includes('contas')).slice(0, 8);
            list.innerHTML = filtered.map(name => `<div class="glass-panel p-6 rounded-[2.5rem] border border-white/5 hover:border-violet-500/20 transition-all text-center"><div class="text-white font-black text-[9px] mb-4 uppercase tracking-tighter opacity-40">${name.replace(/-/g, ' ')}</div><a href="https://dadosabertos.tse.jus.br/dataset/${name}" target="_blank" class="inline-block px-6 py-2 bg-zinc-800 hover:bg-violet-600 text-white text-[8px] font-black rounded-xl transition uppercase tracking-widest block text-center shadow-xl">CSV</a></div>`).join('');
        }
    } catch(e) {}
}
