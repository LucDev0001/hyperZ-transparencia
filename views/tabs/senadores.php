<!-- Conteúdo: Senadores (SISTEMA DE DOSSIÊS FINAL - V7) -->
<div id="content-senadores" class="hidden animate-fade-in pb-20 px-4 lg:px-0">
  
  <style>
    .sen-card-v6 {
        background: rgba(24, 24, 27, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 2.5rem;
        padding: 1.25rem;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        text-align: center;
    }
    .sen-card-v6:hover {
        border-color: #3b82f6;
        background: rgba(24, 24, 27, 0.6);
        transform: translateY(-8px);
        box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5);
    }
    .sen-v6-photo {
        width: 100%;
        aspect-ratio: 3/4;
        object-fit: cover;
        border-radius: 2rem;
        margin-bottom: 1.25rem;
        background: #000;
        filter: grayscale(100%);
        transition: 0.5s;
    }
    .sen-card-v6:hover .sen-v6-photo { filter: grayscale(0%); transform: scale(1.03); }
    .sen-v6-name { color: #fff; font-weight: 900; font-size: 15px; text-transform: uppercase; letter-spacing: -0.02em; }
    .sen-v6-party { color: #3b82f6; font-size: 10px; font-weight: 800; text-transform: uppercase; margin-top: 4px; opacity: 0.8; }

    /* Modal Styles */
    .sen-tab-btn {
        padding: 1rem 0.5rem;
        border-radius: 1.25rem;
        background: rgba(39, 39, 42, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.05);
        color: #71717a;
        font-weight: 900;
        font-size: 9px;
        letter-spacing: 0.1em;
        transition: all 0.3s;
        text-transform: uppercase;
    }
    .sen-tab-btn.active {
        background: #2563eb;
        color: white !important;
        border-color: #3b82f6;
        box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.4);
    }
    .data-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    }
    .data-label { color: #71717a; font-size: 10px; font-weight: 900; text-transform: uppercase; }
    .data-value { color: #fff; font-size: 13px; font-weight: 700; text-align: right; }
  </style>

  <!-- Cabeçalho -->
  <div class="mb-12 relative">
    <div class="absolute -left-4 top-0 w-1 h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
    <h1 class="text-5xl font-black italic text-white uppercase tracking-tighter leading-none mb-2">
      DOSSIÊ <span class="text-blue-500">SENADO</span>
    </h1>
    <div class="flex items-center gap-3">
        <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <span class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Scanner Digital v7.0</span>
    </div>
  </div>

  <!-- Filtros -->
  <div class="glass-panel p-2 rounded-[2.5rem] border border-white/5 bg-zinc-900/20 mb-16 shadow-2xl">
      <div class="flex flex-col md:flex-row gap-2">
          <input type="text" id="senInputSearch" placeholder="LOCALIZAR ALVO..." onkeyup="window.renderSenatorsV7()"
                 class="flex-1 h-16 px-8 bg-transparent border-none text-white font-black placeholder:text-zinc-800 outline-none uppercase text-xs tracking-widest" />
          
          <select id="senUFSelect" onchange="window.renderSenatorsV7()"
                  class="md:w-48 h-16 px-6 bg-transparent border-none text-zinc-500 font-black focus:text-blue-400 outline-none appearance-none cursor-pointer uppercase text-[10px]">
                <option value="">TODOS ESTADOS</option>
                <?php foreach(['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'] as $uf) echo "<option value='$uf'>$uf</option>"; ?>
          </select>

          <button onclick="window.loadSenatorsV7()" class="w-16 h-16 flex items-center justify-center bg-blue-600/10 hover:bg-blue-600 border border-blue-500/20 text-blue-500 hover:text-white rounded-[1.5rem] transition-all">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          </button>
      </div>
  </div>

  <!-- Grid Principal -->
  <div id="GRID_SENADO_FINAL" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 min-h-[600px]">
      <div class="col-span-full text-center py-40">
          <div class="inline-block w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
  </div>

  <!-- MOTOR V7 (INTEGRADO) -->
  <script>
    (function() {
        window._cacheSenadores = [];
        window._senAtivo = null;

        // 1. CARREGAR DADOS
        window.loadSenatorsV7 = async function() {
            try {
                if (!window.api || !window.api.senado) { setTimeout(loadSenatorsV7, 1000); return; }
                const res = await window.api.senado('senador/lista/atual.json');
                const list = res?.ListaParlamentarEmExercicio?.Parlamentares?.Parlamentar || res?.dados || [];
                window._cacheSenadores = Array.isArray(list) ? list : [list];
                window.renderSenatorsV7();
            } catch (e) { console.error("[H3-V7] Erro de carga:", e); }
        };

        // 2. MOSTRAR LISTA
        window.renderSenatorsV7 = function() {
            const grid = document.getElementById('GRID_SENADO_FINAL');
            if (!grid) return;

            const busca = document.getElementById('senInputSearch').value.toLowerCase();
            const uf = document.getElementById('senUFSelect').value;

            const filtrados = window._cacheSenadores.filter(s => {
                const nome = (s.IdentificacaoParlamentar.NomeParlamentar || "").toLowerCase();
                const estado = s.IdentificacaoParlamentar.UfParlamentar || "";
                return (!busca || nome.includes(busca)) && (!uf || estado === uf);
            });

            if (filtrados.length === 0) {
                grid.innerHTML = '<p class="col-span-full text-center py-20 text-zinc-700 font-black uppercase text-xs">Radar Vazio.</p>';
                return;
            }

            grid.innerHTML = filtrados.map(s => {
                const i = s.IdentificacaoParlamentar;
                const foto = i.UrlFotoParlamentar.replace('http://', 'https://');
                return `
                <div class="sen-card-v6" onclick="window._openSenadorDossie('${i.CodigoParlamentar}')">
                    <img src="${foto}" class="sen-v6-photo" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(i.NomeParlamentar)}&background=18181b&color=fff'">
                    <div class="sen-v6-name">${i.NomeParlamentar}</div>
                    <div class="sen-v6-party">${i.SiglaPartidoParlamentar} / ${i.UfParlamentar}</div>
                </div>`;
            }).join('');
        };

        // 3. ABRIR DOSSIÊ (MODAL)
        window._openSenadorDossie = async function(id) {
            const modal = document.getElementById('senatorModal');
            const content = document.getElementById('senatorContent');
            if (!modal || !content) return;

            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            content.innerHTML = '<div class="py-60 text-center"><div class="inline-block w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div><p class="text-zinc-600 font-black uppercase text-[10px] mt-6 tracking-widest">Infiltrando base de dados...</p></div>';

            try {
                const data = await window.api.get('get_senator_details', { id });
                window._senAtivo = data;
                const i = data.detalhes.IdentificacaoParlamentar;
                const foto = i.UrlFotoParlamentar.replace('http://','https://');

                content.innerHTML = `
                    <div class="flex flex-col items-center mb-8 text-center px-4">
                        <div class="relative group">
                            <div class="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-zinc-800 shadow-2xl mb-4 group-hover:border-blue-600 transition-all duration-500">
                                <img src="${foto}" class="w-full h-full object-cover">
                            </div>
                            <div class="absolute -bottom-0.5 -right-0.5 w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-600 border-[3px] border-zinc-900 flex items-center justify-center">
                                <span class="text-[8px] md:text-[9px] font-black text-white uppercase">H3</span>
                            </div>
                        </div>
                        <h2 class="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter mt-2 leading-tight">${i.NomeParlamentar}</h2>
                        <div class="flex gap-2 mt-3 flex-wrap justify-center">
                            <span class="bg-blue-600 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase border border-white/10">${i.SiglaPartidoParlamentar}</span>
                            <span class="bg-zinc-800 text-zinc-400 px-4 py-1 rounded-full text-[9px] font-black uppercase border border-white/5">${i.UfParlamentar} / FEDERAL</span>
                        </div>
                        <button onclick="window.HyperBot.analyzePolitico('Senador ${i.NomeParlamentar}')" class="mt-6 bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:text-white text-[9px] font-black px-6 py-2.5 rounded-full transition-all uppercase tracking-widest shadow-2xl active:scale-95 group">🧠 Investigação IA Profunda</button>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-10 px-1">
                        <button onclick="window.switchSenadoTabV7('sobre')" id="tsen-sobre" class="sen-tab-btn active">👤 Perfil</button>
                        <button onclick="window.switchSenadoTabV7('votos')" id="tsen-votos" class="sen-tab-btn">🗳️ Votos</button>
                        <button onclick="window.switchSenadoTabV7('gastos')" id="tsen-gastos" class="sen-tab-btn">💰 Gastos</button>
                        <button onclick="window.switchSenadoTabV7('midia')" id="tsen-midia" class="sen-tab-btn">📰 Mídia</button>
                    </div>

                    <div id="senViewFinal" class="animate-fade-in min-h-[300px] px-1 pb-10"></div>
                `;
                window.switchSenadoTabV7('sobre');
            } catch (e) { 
                content.innerHTML = '<p class="text-red-500 text-center py-20 font-black">FALHA NA INTERCEPTAÇÃO.</p>'; 
            }
        };

        // 4. NAVEGAÇÃO DO MODAL
        window.switchSenadoTabV7 = function(tab) {
            document.querySelectorAll('.sen-tab-btn').forEach(b => b.classList.toggle('active', b.id === 'tsen-'+tab));
            const view = document.getElementById('senViewFinal');
            const d = window._senAtivo;
            if (!view || !d) return;

            if (tab === 'sobre') {
                const i = d.detalhes.IdentificacaoParlamentar;
                const b = d.detalhes.DadosBasicosParlamentar || {};
                view.innerHTML = `
                    <div class="bg-zinc-900/60 p-8 rounded-[2.5rem] border border-white/5 space-y-2 shadow-2xl">
                        <div class="data-row"><span class="data-label">Nome Completo</span><span class="data-value uppercase">${i.NomeCompletoParlamentar}</span></div>
                        <div class="data-row"><span class="data-label">Nascimento</span><span class="data-value">${b.DataNascimento ? b.DataNascimento.split('-').reverse().join('/') : '—'}</span></div>
                        <div class="data-row"><span class="data-label">E-mail Oficial</span><span class="data-value text-blue-400 lowercase">${i.EmailParlamentar || '—'}</span></div>
                        <div class="data-row"><span class="data-label">Local de Trabalho</span><span class="data-value uppercase text-[10px]">${b.EnderecoParlamentar || '—'}</span></div>
                    </div>
                `;
            }
            if (tab === 'votos') {
                const list = Array.isArray(d.votacoes) ? d.votacoes : [d.votacoes];
                view.innerHTML = list.length === 0 ? '<p class="text-center py-20 text-zinc-700 font-black uppercase text-xs">Nenhum registro de voto nominal.</p>' : 
                    `<div class="space-y-3">` + list.slice(0, 15).map(x => `
                    <div class="bg-zinc-900/40 p-6 rounded-3xl border border-white/5 flex justify-between items-center gap-6">
                        <div class="flex-1">
                            <div class="text-zinc-600 text-[8px] font-black uppercase mb-1">${x.SessaoPlenaria?.DataSessao || ''}</div>
                            <div class="text-white font-bold text-xs italic uppercase leading-tight">${x.Materia?.EmentaMateria || 'Sessão Plenária'}</div>
                        </div>
                        <div class="px-5 py-2 rounded-xl font-black text-[10px] ${x.Voto === 'Sim' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}">${(x.Voto || 'PRESENTE').toUpperCase()}</div>
                    </div>`).join('') + `</div>`;
            }
            if (tab === 'gastos') {
                view.innerHTML = '<p class="text-center py-20 animate-pulse text-zinc-600 font-black text-xs uppercase tracking-widest">Infiltrando extrato financeiro...</p>';
                fetchApi('get_senator_ceaps', { id: d.detalhes.IdentificacaoParlamentar.CodigoParlamentar }).then(g => {
                    view.innerHTML = `
                        <div class="bg-zinc-900/50 p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
                            <div class="flex justify-between items-center mb-10">
                                <h3 class="text-white font-black text-[10px] uppercase border-l-4 border-blue-600 pl-6 italic">CEAPS ${g.ano}</h3>
                                <div class="text-right">
                                    <div class="text-[9px] text-zinc-600 font-black uppercase mb-1">Total Consumido</div>
                                    <div class="text-blue-400 font-black text-3xl tracking-tighter shadow-blue-500/20 shadow-xl px-2">R$ ${parseFloat(g.totalGasto || 0).toLocaleString('pt-BR')}</div>
                                </div>
                            </div>
                            <div class="space-y-2 max-h-[400px] overflow-y-auto pr-3 custom-scrollbar">
                                ${g.despesas.slice(0, 40).map(x => `
                                    <div class="bg-zinc-950/80 p-5 rounded-2xl border border-white/5 flex justify-between items-center group">
                                        <div class="min-w-0 flex-1 pr-6">
                                            <div class="text-zinc-600 text-[8px] font-black uppercase">${x.data}</div>
                                            <div class="text-zinc-200 text-[10px] font-black uppercase truncate">${x.fornecedor}</div>
                                            <div class="text-zinc-500 text-[8px] uppercase font-bold mt-1 italic">${x.tipoDespesa}</div>
                                        </div>
                                        <div class="text-white font-black text-xs whitespace-nowrap">R$ ${parseFloat(x.valor).toLocaleString('pt-BR')}</div>
                                    </div>`).join('')}
                            </div>
                        </div>`;
                }).catch(() => view.innerHTML = '<p class="text-center text-red-500">Erro nos gastos.</p>');
            }
            if (tab === 'midia') {
                view.innerHTML = '<p class="text-center py-20 animate-pulse text-zinc-600 font-black text-xs uppercase tracking-widest">Rastreando mídias digitais...</p>';
                fetchApi('noticias_deputado', { nome: d.detalhes.IdentificacaoParlamentar.NomeParlamentar }).then(n => {
                    if (!n.noticias || n.noticias.length === 0) { view.innerHTML = '<p class="text-center py-20 text-zinc-700 font-black uppercase text-xs">Nada no radar OSINT.</p>'; return; }
                    view.innerHTML = `<div class="space-y-4">` + n.noticias.slice(0,10).map(x => `
                        <a href="${x.link}" target="_blank" class="block bg-zinc-900/60 p-8 rounded-[2.5rem] border border-white/5 hover:border-blue-500/30 transition-all group shadow-xl">
                            <div class="flex justify-between mb-4 items-center relative z-10">
                                <span class="text-blue-500 font-black text-[10px] uppercase tracking-widest bg-blue-600/10 px-4 py-1.5 rounded-full border border-blue-500/20">${x.fonte}</span>
                                <span class="text-zinc-600 text-[9px] font-black uppercase">${x.data}</span>
                            </div>
                            <div class="text-white font-black text-lg uppercase leading-tight italic group-hover:text-blue-400 transition-colors tracking-tighter">${x.titulo}</div>
                        </a>`).join('') + `</div>`;
                }).catch(() => view.innerHTML = '<p class="text-center text-red-500 uppercase font-black text-xs">Erro no scanner.</p>');
            }
        };

        // 5. AUTO-IGNIÇÃO
        const el = document.getElementById('content-senadores');
        if (el) {
            new MutationObserver(() => { if (!el.classList.contains('hidden') && window._cacheSenadores.length === 0) window.loadSenatorsV7(); }).observe(el, { attributes: true, attributeFilter: ['class'] });
            if (!el.classList.contains('hidden')) window.loadSenatorsV7();
        }
        setTimeout(() => { if (window._cacheSenadores.length === 0) window.loadSenatorsV7(); }, 2000);

        // Alias para compatibilidade global
        window.loadSenators = window.loadSenatorsV7;
        window.renderSenators = window.renderSenatorsV7;

    })();
  </script>
</div>
