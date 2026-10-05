/**
 * Apuração de Eleições (TSE) - Hyper Z
 * Regras:
 * url: https://resultados.tse.jus.br
 * ambiente: oficial
 * eleições: 6257 (Federal), 6259 (Estadual), 6261 (Distrital)
 * pleito: 3220 (1º Turno)
 */

const Apuracao = {
    intervalId: null,
    isFetching: false,
    chart: null,
    map: null,
    geoLayer: null,
    stateDataCache: {},

    init() {
        this.initMap();
        this.initChart();
        this.onFilterChange();
    },

    initMap() {
        const mapDiv = document.getElementById('apuracaoMap');
        if (!mapDiv || this.map) return;

        this.map = L.map('apuracaoMap', {
            center: [-15.78, -47.93],
            zoom: 3.5,
            zoomControl: true,
            attributionControl: false,
            scrollWheelZoom: true,
            dragging: true
        });

        // Dark minimal basemap
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png').addTo(this.map);

        // Fetch GeoJSON for Brazil States locally
        fetch('js/brazil-states.geojson')
            .then(res => res.json())
            .then(data => {
                this.geoLayer = L.geoJson(data, {
                    style: {
                        fillColor: '#18181b',
                        weight: 1,
                        opacity: 1,
                        color: '#3f3f46',
                        fillOpacity: 0.8,
                        className: 'state-feature-apuracao'
                    },
                    onEachFeature: (feature, layer) => {
                        const uf = feature.properties.sigla.toLowerCase();
                        layer.on({
                            click: () => {
                                const ufSelect = document.getElementById('apuracao-uf');
                                if (ufSelect) {
                                    ufSelect.value = uf;
                                    this.onFilterChange();
                                }
                            }
                        });
                    }
                }).addTo(this.map);

                this.updateMapColors();
                
                // Forçar renderização do mapa em tabs
                setTimeout(() => { if (this.map) this.map.invalidateSize(); }, 200);
            })
            .catch(e => console.error("Erro ao carregar GeoJSON do mapa: ", e));
    },

    initChart() {
        const ctx = document.getElementById('apuracao-votos-chart');
        if (!ctx) return;

        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Válidos', 'Brancos', 'Nulos'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: ['#22c55e', '#e4e4e7', '#ef4444'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#18181b',
                        padding: 10,
                        callbacks: {
                            label: function (context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += new Intl.NumberFormat('pt-BR').format(context.parsed);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    },

    onFilterChange() {
        const cargoCombo = document.getElementById('apuracao-cargo').value.split('|');
        const cargo = cargoCombo[0];
        const ufSelect = document.getElementById('apuracao-uf');

        // Se for presidente (cargo 1), o UF principal é BR, mas pode filtrar por estado.
        // Se for outro cargo, UF não pode ser BR.
        if (cargo !== '1' && ufSelect.value === 'br') {
            ufSelect.value = 'sp'; // Fallback para SP
            if (typeof showToast === 'function') showToast('O cargo selecionado não é de âmbito nacional.', 'warning');
        }

        this.fetchResults();
    },

    async fetchResults() {
        if (this.isFetching) return;
        this.isFetching = true;

        const btn = document.getElementById('apuracao-btn-update');
        const statusEl = document.getElementById('apuracao-status');
        const timeEl = document.getElementById('apuracao-time');

        btn.innerHTML = `<span class="animate-spin text-lg">⏳</span> Atualizando...`;
        statusEl.className = 'text-xs font-black text-amber-400 animate-pulse';
        statusEl.textContent = 'BUSCANDO DADOS...';

        const cargoCombo = document.getElementById('apuracao-cargo').value.split('|');
        const cargo = cargoCombo[0].padStart(4, '0'); // Ex: 0001
        const eleicao = cargoCombo[1]; // Ex: 6257
        const uf = document.getElementById('apuracao-uf').value.toLowerCase();

        const presDashboard = document.getElementById('president-super-dashboard');
        if (presDashboard) {
            if (cargo === '0001') {
                presDashboard.classList.remove('hidden');
            } else {
                presDashboard.classList.add('hidden');
            }
        }

        // Construção da URL Oficial
        // Formato: https://resultados.tse.jus.br/oficial/ele2026/[codigo_eleicao]/dados/[uf]/[uf]-c[codigo_cargo]-e0[codigo_eleicao]-u.json
        const officialUrl = `https://resultados.tse.jus.br/oficial/ele2026/${eleicao}/dados/${uf}/${uf}-c${cargo}-e00${eleicao}-u.json`;
        const proxyUrl = `api/proxy_tse.php?url=${encodeURIComponent(officialUrl)}`;

        try {
            const response = await fetch(proxyUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const data = await response.json();

            // Lidar com o 404 tratado pelo proxy_tse.php (retorna 200 OK com json content error)
            if (data.error || data.http_code >= 400) {
                throw new Error(data.error || "Dados não encontrados ou eleição não iniciada.");
            }

            const formattedData = this.parseTseJson(data);
            this.renderData(formattedData);

            statusEl.className = 'text-xs font-black text-green-400';
            statusEl.textContent = 'AO VIVO';

            const now = new Date();
            timeEl.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

        } catch (error) {
            // Oculta log sujo se for apenas eleição não iniciada (erro esperado)
            if (error.message.includes('não iniciada') || error.message.includes('HTTP 404')) {
                console.log("Aguardando dados oficiais do TSE... (Eleição não iniciada)");
            } else {
                console.error("Erro ao buscar dados do TSE:", error);
            }

            statusEl.className = 'text-xs font-black text-red-500';
            statusEl.textContent = 'AGUARDANDO DADOS...';

            this.renderError();
            // Evitar spam de toast se for um erro de 404 rotineiro de polling
        } finally {
            this.isFetching = false;
            btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg> Atualizar Agora`;
        }
    },

    renderData(data) {
        const elSecoes = document.getElementById('apuracao-tot-secoes');
        const elValidos = document.getElementById('apuracao-tot-validos');
        const elBrancos = document.getElementById('apuracao-tot-brancos');
        const elNulos = document.getElementById('apuracao-tot-nulos');

        if (elSecoes) elSecoes.textContent = `${data.pst || '0,00'}%`;
        if (elValidos) elValidos.textContent = this.formatNumber(data.vv || 0);
        if (elBrancos) elBrancos.textContent = this.formatNumber(data.vb || 0);
        if (elNulos) elNulos.textContent = this.formatNumber(data.tvn || 0);

        // Atualizar Gráfico de Votos
        if (this.chart) {
            const vv = parseInt(data.vv) || 0;
            const vb = parseInt(data.vb) || 0;
            const tvn = parseInt(data.tvn) || 0;
            this.chart.data.datasets[0].data = [vv, vb, tvn];
            this.chart.update();
        }

        // Atualizar Mapa
        this.updateMapColors(data);

        const cargoCombo = document.getElementById('apuracao-cargo').value.split('|');
        const cargo = cargoCombo[0];
        const presDashboard = document.getElementById('president-super-dashboard');

        if (cargo === '1' && presDashboard) {
            presDashboard.classList.remove('hidden');
        } else if (presDashboard) {
            presDashboard.classList.add('hidden');
        }

        const listContainer = document.getElementById('apuracao-lista');
        listContainer.innerHTML = '';

        if (!data.cand || data.cand.length === 0) {
            listContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center py-20 opacity-50">
                    <div class="text-4xl mb-4">📭</div>
                    <p class="text-white font-bold">Nenhum candidato apurado ainda.</p>
                </div>
            `;
            return;
        }

        // Ordenar candidatos por número de votos descrescente (o TSE já manda ordenado geralmente, mas por segurança)
        const candidatos = data.cand.sort((a, b) => parseInt(b.vap) - parseInt(a.vap));

        // Pegar cores para os top 2 candidatos (para usar no mapa opcionalmente)
        const colors = ['#dc2626', '#4f46e5', '#ca8a04', '#16a34a']; // Cores base para os partidos

        // Atualizar Super Dashboard do Presidente se aplicável
        if (cargo === '1' && presDashboard) {
            document.getElementById('pres-urnas-pct').textContent = `${data.pst || '0,00'}%`;

            // Lidar com badge de eleito / 2o turno
            const badgeEl = document.getElementById('pres-status-badge');
            if (candidatos.length > 0) {
                const c1E = candidatos[0].e;
                if (c1E === 's') {
                    badgeEl.innerHTML = `<span class="bg-green-600/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-[0_0_15px_rgba(34,197,94,0.4)] animate-pulse inline-block">✅ Matematicamente Eleito</span>`;
                    badgeEl.classList.remove('hidden');
                } else if (c1E === '2') {
                    badgeEl.innerHTML = `<span class="bg-amber-600/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse inline-block">🔥 2º Turno Matemático</span>`;
                    badgeEl.classList.remove('hidden');
                } else {
                    badgeEl.classList.add('hidden');
                }
            }

            if (candidatos.length >= 2) {
                const c1 = candidatos[0];
                const c2 = candidatos[1];

                document.getElementById('pres-cand1-name').textContent = c1.nm;
                document.getElementById('pres-cand1-partido').textContent = c1.cc;
                document.getElementById('pres-cand1-pct').textContent = (c1.pvap || '0,00') + '%';
                document.getElementById('pres-cand1-votos').textContent = this.formatNumber(c1.vap || 0) + ' votos';

                document.getElementById('pres-cand1-initial').textContent = c1.nm.charAt(0);
                // Foto oficial do TSE (usando a constante de 2026/2022 ou mock, o sqcand define a foto se existir)
                const img1 = document.getElementById('pres-cand1-img');
                if (c1.sqcand) {
                    img1.src = `https://resultados.tse.jus.br/oficial/ele2026/${document.getElementById('apuracao-cargo').value.split('|')[1]}/fotos/br/${c1.sqcand}.jpeg`;
                    img1.classList.remove('hidden');
                    document.getElementById('pres-cand1-initial').classList.add('hidden');
                }

                document.getElementById('pres-cand2-name').textContent = c2.nm;
                document.getElementById('pres-cand2-partido').textContent = c2.cc;
                document.getElementById('pres-cand2-pct').textContent = (c2.pvap || '0,00') + '%';
                document.getElementById('pres-cand2-votos').textContent = this.formatNumber(c2.vap || 0) + ' votos';

                document.getElementById('pres-cand2-initial').textContent = c2.nm.charAt(0);
                const img2 = document.getElementById('pres-cand2-img');
                if (c2.sqcand) {
                    img2.src = `https://resultados.tse.jus.br/oficial/ele2026/${document.getElementById('apuracao-cargo').value.split('|')[1]}/fotos/br/${c2.sqcand}.jpeg`;
                    img2.classList.remove('hidden');
                    document.getElementById('pres-cand2-initial').classList.add('hidden');
                }

                let p1 = parseFloat((c1.pvap || '0').replace(',', '.'));
                let p2 = parseFloat((c2.pvap || '0').replace(',', '.'));

                // Normalize for visual progress bar (if both 0, set 50/50)
                if (p1 === 0 && p2 === 0) {
                    p1 = 50; p2 = 50;
                } else {
                    const total = p1 + p2;
                    p1 = (p1 / total) * 100;
                    p2 = (p2 / total) * 100;
                }

                document.getElementById('pres-bar1').style.width = p1 + '%';
                document.getElementById('pres-bar2').style.width = p2 + '%';

                document.getElementById('pres-total-votos').textContent = this.formatNumber(data.vv || 0);

                const diff = parseInt(c1.vap || 0) - parseInt(c2.vap || 0);
                document.getElementById('pres-diff-votos').textContent = this.formatNumber(diff) + ' votos';
            }
        }

        candidatos.forEach((cand, index) => {
                const isElected = cand.e === 's'; // 's' para eleito, 'n' para não
                const isSecondRound = cand.e === '2'; // '2' para 2º turno

                let statusBadge = '';
                let borderClass = 'border-white/5';
                const candColor = colors[index % colors.length];

                if (isElected) {
                    statusBadge = `<span class="bg-green-600/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded text-[9px] font-black uppercase shadow-[0_0_10px_rgba(34,197,94,0.3)]">Matematicamente Eleito</span>`;
                    borderClass = 'border-green-500/30 bg-green-950/20';
                } else if (isSecondRound) {
                    statusBadge = `<span class="bg-amber-600/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[9px] font-black uppercase">2º Turno</span>`;
                    borderClass = 'border-amber-500/30 bg-amber-950/20';
                }

                // Barra de progresso
                const pvap = cand.pvap || '0,00';
                const width = parseFloat(pvap.replace(',', '.'));

                const card = document.createElement('div');
                card.className = `p-4 rounded-2xl bg-zinc-900/40 border ${borderClass} flex flex-col md:flex-row gap-4 items-center animate-slide-up hover:bg-zinc-800/80 transition-all`;

                card.innerHTML = `
                <div class="flex items-center gap-4 w-full md:w-[45%]">
                    <div class="text-3xl font-black text-zinc-700/50 w-10 text-center italic">${index + 1}º</div>
                    <div class="w-14 h-14 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-center text-xl font-bold text-white shadow-inner shrink-0 relative overflow-hidden">
                        <div class="absolute bottom-0 w-full h-1" style="background-color: ${candColor}"></div>
                        ${cand.n}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            <h4 class="text-white font-black truncate text-lg uppercase tracking-tighter">${cand.nm}</h4>
                        </div>
                        <div class="text-[10px] text-zinc-400 uppercase font-bold tracking-wider flex items-center gap-2 flex-wrap">
                            <span class="px-2 py-0.5 rounded bg-white/5 border border-white/10">${cand.cc.split('-')[0] || cand.sgp}</span>
                            ${statusBadge}
                        </div>
                    </div>
                </div>

                <div class="w-full md:w-[55%] flex flex-col justify-center pl-0 md:pl-4 md:border-l border-white/5">
                    <div class="flex justify-between items-end mb-2">
                        <span class="text-2xl font-black text-white leading-none">${pvap}%</span>
                        <span class="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">${this.formatNumber(cand.vap)} votos</span>
                    </div>
                    <div class="w-full bg-zinc-950 rounded-full h-4 border border-white/5 overflow-hidden shadow-inner">
                        <div class="h-full rounded-full transition-all duration-1000 relative overflow-hidden" style="width: ${width}%; background-color: ${candColor}">
                            <div class="absolute inset-0 bg-white/20" style="animation: shimmer 2s infinite linear;"></div>
                        </div>
                    </div>
                </div>
            `;
                listContainer.appendChild(card);
            });
        },

        updateMapColors(data) {
            if (!this.geoLayer || !this.map) return;

            const ufSelect = document.getElementById('apuracao-uf');
            const selectedUf = ufSelect.value.toLowerCase();
            const isNational = selectedUf === 'br';

            this.geoLayer.eachLayer(layer => {
                const featureUf = layer.feature.properties.sigla.toLowerCase();

                // Se for visão nacional, no futuro podemos carregar as cores do líder de cada estado
                // Aqui fazemos um highlight simples do estado selecionado
                if (!isNational && featureUf === selectedUf) {
                    layer.setStyle({
                        fillColor: '#dc2626', // Vermelho destaque
                        fillOpacity: 0.6,
                        weight: 2,
                        color: '#fff'
                    });
                    // Tenta centralizar
                    try { this.map.fitBounds(layer.getBounds(), { padding: [20, 20], maxZoom: 6 }); } catch (e) { }
                } else if (!isNational) {
                    layer.setStyle({
                        fillColor: '#18181b',
                        fillOpacity: 0.8,
                        weight: 1,
                        color: '#3f3f46'
                    });
                }
            });

            if (isNational) {
                this.map.setView([-15.78, -47.93], 3.5);

                // Lógica G1: Colorir o mapa por estado para Presidente
                const cargoCombo = document.getElementById('apuracao-cargo').value.split('|');
                const cargo = cargoCombo[0];
                const eleicao = cargoCombo[1];

                if (cargo === '1') {
                    this.fetchStateWinners(eleicao);
                }
            }
        },

    async fetchStateWinners(eleicao) {
            if (this.isFetchingStates) return;
            this.isFetchingStates = true;

            // Cores dos candidatos (simulando top 4, você pode mapear por numero de partido)
            const partyColors = {
                '13': '#dc2626', // PT vermelho
                '22': '#1e3a8a', // PL azul
                '15': '#16a34a', // MDB verde
                '12': '#c2410c', // PDT laranja
                '45': '#2563eb'  // PSDB azul claro
            };
            const defaultColors = ['#dc2626', '#4f46e5', '#ca8a04', '#16a34a', '#8b5cf6'];
            let colorMap = {}; // CandID or Numero -> Color

            const ufs = ['ac', 'al', 'ap', 'am', 'ba', 'ce', 'df', 'es', 'go', 'ma', 'mt', 'ms', 'mg', 'pa', 'pb', 'pr', 'pe', 'pi', 'rj', 'rn', 'rs', 'ro', 'rr', 'sc', 'sp', 'se', 'to'];

            // Vamos buscar todos em paralelo
            const fetchPromises = ufs.map(uf => {
                const officialUrl = `https://resultados.tse.jus.br/oficial/ele2026/${eleicao}/dados/${uf}/${uf}-c0001-e00${eleicao}-u.json`;
                const proxyUrl = `api/proxy_tse.php?url=${encodeURIComponent(officialUrl)}`;
                return fetch(proxyUrl, { method: 'GET', headers: { 'Accept': 'application/json' } })
                    .then(r => r.ok ? r.json() : null)
                    .then(data => {
                        if (data && (data.error || data.http_code >= 400)) return { uf, data: null };
                        return { uf, data: this.parseTseJson(data) };
                    })
                    .catch(() => ({ uf, data: null }));
            });

            const results = await Promise.all(fetchPromises);
            let ufWinners = {};

            results.forEach(res => {
                if (res.data && res.data.cand && res.data.cand.length > 0) {
                    // Candidato com mais votos
                    const cand = res.data.cand.sort((a, b) => parseInt(b.vap) - parseInt(a.vap))[0];
                    const n = cand.n; // Numero do partido/candidato

                    let color = partyColors[n] || colorMap[n];
                    if (!color) {
                        color = defaultColors[Object.keys(colorMap).length % defaultColors.length];
                        colorMap[n] = color;
                    }
                    ufWinners[res.uf] = color;
                }
            });

            // Pintar o mapa
            if (this.geoLayer) {
                this.geoLayer.eachLayer(layer => {
                    const featureUf = layer.feature.properties.sigla.toLowerCase();
                    if (ufWinners[featureUf]) {
                        layer.setStyle({
                            fillColor: ufWinners[featureUf],
                            fillOpacity: 0.8,
                            weight: 1,
                            color: '#ffffff30'
                        });
                    }
                });
            }
            this.isFetchingStates = false;
        },

        renderError() {
            const elSecoes = document.getElementById('apuracao-tot-secoes');
            const elValidos = document.getElementById('apuracao-tot-validos');
            const elBrancos = document.getElementById('apuracao-tot-brancos');
            const elNulos = document.getElementById('apuracao-tot-nulos');

            if (elSecoes) elSecoes.textContent = `--`;
            if (elValidos) elValidos.textContent = `--`;
            if (elBrancos) elBrancos.textContent = `--`;
            if (elNulos) elNulos.textContent = `--`;

            if (this.chart) {
                this.chart.data.datasets[0].data = [0, 0, 0];
                this.chart.update();
            }

            this.updateMapColors();

            const listContainer = document.getElementById('apuracao-lista');
            listContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center py-20 opacity-70">
                <div class="text-4xl mb-4">⚠️</div>
                <h4 class="text-white font-black text-lg">Dados Indisponíveis</h4>
                <p class="text-zinc-400 text-sm mt-2 max-w-md text-center">
                    A eleição selecionada ainda não iniciou sua apuração ou os servidores oficiais do TSE estão limitando o acesso.
                </p>
                <p class="text-zinc-500 text-[10px] mt-4 uppercase font-bold text-center">
                    Tente novamente mais tarde.<br>Códigos Oficiais (Pleito 3220) sendo respeitados.
                </p>
            </div>
        `;
        },

        formatNumber(num) {
            return parseInt(num).toLocaleString('pt-BR');
        },

        parseTseJson(data) {
            if (!data) return data;
            // Se já for o formato simplificado antigo (ou o parser falhar)
            if (data.cand) return data;
            
            // Adaptador para o novo formato de Resultado Unificado (TSE 2026 -u.json)
            if (data.carg && data.s) {
                let candidatesList = [];
                data.carg.forEach(c => {
                    if (c.agr) {
                        c.agr.forEach(a => {
                            if (a.par) {
                                a.par.forEach(p => {
                                    if (p.cand) {
                                        p.cand.forEach(cand => {
                                            cand.partido = p.sg || p.nm;
                                            candidatesList.push(cand);
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
                
                return {
                    pst: data.s.pst || '0,00',
                    snt: data.s.snt,
                    tv: data.v ? data.v.tv : '0',
                    vv: data.v ? data.v.vv : '0',
                    vb: data.v ? data.v.vb : '0',
                    vn: data.v ? data.v.vn : '0',
                    tvn: data.v ? (data.v.tvn || data.v.vn) : '0',
                    cand: candidatesList.map(c => ({
                        seq: c.seq,
                        n: c.n,
                        nm: c.nmu || c.nm,
                        vap: c.vap,
                        pvap: c.pvap,
                        st: (c.e === 's' ? 'Eleito' : (c.e === 'n' ? '' : c.st)),
                        sqcand: c.sqcand,
                        cc: c.partido
                    }))
                };
            }
            return data;
        },

        shareWhatsApp() {
            const pctUrnas = document.getElementById('pres-urnas-pct').textContent;
            const cand1Name = document.getElementById('pres-cand1-name').textContent;
            const cand1Pct = document.getElementById('pres-cand1-pct').textContent;
            const cand2Name = document.getElementById('pres-cand2-name').textContent;
            const cand2Pct = document.getElementById('pres-cand2-pct').textContent;

            if (cand1Name === 'Aguardando...') {
                if (typeof showToast === 'function') showToast('A eleição ainda não começou para compartilhar resultados!', 'warning');
                return;
            }

            const text = `🔥 *Apuração Presidente 2026*\n\n🥇 ${cand1Name} (${cand1Pct})\n🥈 ${cand2Name} (${cand2Pct})\n\n📊 *${pctUrnas} das urnas apuradas!*\n\nAcompanhe os resultados ao vivo, interaja no chat e veja o mapa oficial no *HyperZ*:\n👉 https://hyperzcommunity.com/transparency/?tab=apuracao`;
            const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
            window.open(url, '_blank');
        }
    }

// CSS de Animação adicional e mapa
const style = document.createElement('style');
    style.textContent = `
    @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
    }
    .state-feature-apuracao { transition: all 0.3s ease; outline: none; cursor: pointer; }
    .state-feature-apuracao:hover { fill-opacity: 0.8 !important; stroke: #fff !important; stroke-width: 2px !important; }
`;
    document.head.appendChild(style);

    // Initialize when tab is shown
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('content-apuracao')) {
            const originalSwitchTabApuracao = window.customSwitchTab;
            
            // Verifica se a tab já está ativa no load
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('tab') === 'apuracao' || (!urlParams.has('tab') && document.getElementById('content-apuracao').classList.contains('active'))) {
                setTimeout(() => {
                    if (!Apuracao.map) Apuracao.init();
                    if (!Apuracao.intervalId) {
                        Apuracao.fetchResults();
                        Apuracao.intervalId = setInterval(() => Apuracao.fetchResults(), 30000);
                    }
                    setTimeout(() => { if (Apuracao.map) Apuracao.map.invalidateSize(); }, 300);
                    ApuracaoChat.checkState();
                }, 100);
            }

            window.customSwitchTab = function (tab) {
                if (typeof originalSwitchTabApuracao === 'function') {
                    originalSwitchTabApuracao(tab);
                }
                if (tab === 'apuracao') {
                    if (!Apuracao.map) Apuracao.init();
                    if (!Apuracao.intervalId) {
                        Apuracao.fetchResults();
                        Apuracao.intervalId = setInterval(() => Apuracao.fetchResults(), 30000);
                    }
                    setTimeout(() => { if (Apuracao.map) Apuracao.map.invalidateSize(); }, 300);
                    ApuracaoChat.checkState();
                } else if (tab !== 'apuracao') {
                    if (Apuracao.intervalId) {
                        clearInterval(Apuracao.intervalId);
                        Apuracao.intervalId = null;
                    }
                    ApuracaoChat.stopPolling();
                }
            };
        }
    });

    // Lógica do Chat Ao Vivo Integrado
    const ApuracaoChat = {
        hasAcceptedTerms: false,
        nickname: '',
        pollInterval: null,
        lastMessageId: null,

        checkState() {
            const terms = document.getElementById('apuracao-chat-terms');
            const login = document.getElementById('apuracao-chat-login');
            const area = document.getElementById('apuracao-chat-area');

            if (!this.hasAcceptedTerms) {
                terms.classList.remove('hidden');
                terms.classList.add('flex');
                login.classList.add('hidden');
                area.classList.add('hidden');
                area.classList.remove('flex');
            } else if (!this.nickname) {
                terms.classList.add('hidden');
                terms.classList.remove('flex');
                login.classList.remove('hidden');
                login.classList.add('flex');
                area.classList.add('hidden');
                area.classList.remove('flex');
                document.getElementById('apuracao-chat-nickname').focus();
            } else {
                terms.classList.add('hidden');
                terms.classList.remove('flex');
                login.classList.add('hidden');
                login.classList.remove('flex');
                area.classList.remove('hidden');
                area.classList.add('flex');
                this.startPolling();
                document.getElementById('apuracao-chat-input').focus();
            }
        },

        acceptTerms() {
            this.hasAcceptedTerms = true;
            this.checkState();
        },

        joinChat() {
            const input = document.getElementById('apuracao-chat-nickname');
            const name = input.value.trim();
            if (name.length < 3) {
                if (typeof showToast === 'function') showToast('O apelido deve ter pelo menos 3 letras.', 'warning');
                return;
            }
            this.nickname = name;
            this.checkState();
        },

        startPolling() {
            if (!this.pollInterval) {
                this.fetchMessages();
                this.pollInterval = setInterval(() => this.fetchMessages(), 2000);
            }
        },

        stopPolling() {
            if (this.pollInterval) {
                clearInterval(this.pollInterval);
                this.pollInterval = null;
            }
        },

        async fetchMessages() {
            try {
                const response = await fetch('api/chat.php?action=read');
                if (!response.ok) return;
                const data = await response.json();
                this.renderMessages(data.messages || []);
            } catch (e) {
                console.error('Chat poll error:', e);
            }
        },

        renderMessages(messages) {
            const container = document.getElementById('apuracao-chat-messages');
            if (!container) return;

            let shouldScroll = false;
            // Verifica se usuário está no final da div para dar auto-scroll
            if (container.scrollTop + container.clientHeight >= container.scrollHeight - 50) {
                shouldScroll = true;
            }

            container.innerHTML = '<div class="text-center text-[10px] text-zinc-500 uppercase font-bold my-4">Chat criptografado e temporário</div>';

            if (messages.length === 0) {
                container.innerHTML += '<p class="text-zinc-600 text-xs text-center">Seja o primeiro a mandar mensagem!</p>';
                return;
            }

            messages.forEach(msg => {
                const isMe = msg.username === this.nickname;
                const div = document.createElement('div');
                div.className = `flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in`;

                div.innerHTML = `
                <div class="text-[9px] text-zinc-500 font-bold uppercase mb-0.5 px-1">${isMe ? 'Você' : msg.username} • ${msg.time}</div>
                <div class="px-3 py-2 rounded-2xl max-w-[85%] text-sm break-words ${isMe ? 'bg-red-600 text-white rounded-tr-sm' : 'bg-zinc-800 text-zinc-200 border border-white/5 rounded-tl-sm'}">
                    ${msg.message}
                </div>
            `;
                container.appendChild(div);
            });

            if (shouldScroll) {
                container.scrollTop = container.scrollHeight;
            }
        },

        async sendMessage() {
            const input = document.getElementById('apuracao-chat-input');
            const text = input.value.trim();
            if (!text) return;

            input.value = '';

            try {
                await fetch('api/chat.php?action=post', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: this.nickname,
                        message: text
                    })
                });
                this.fetchMessages();
                // scroll imediato local
                setTimeout(() => {
                    const c = document.getElementById('apuracao-chat-messages');
                    if (c) c.scrollTop = c.scrollHeight;
                }, 100);
            } catch (e) {
                if (typeof showToast === 'function') showToast('Erro ao enviar mensagem.', 'error');
            }
        }
    };
