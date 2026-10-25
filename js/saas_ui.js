// transparency/js/saas_ui.js — Modern SaaS UI Utilities (Skeletons & Slide-Over Inspector)
(function() {
  'use strict';

  // ── SKELETON LOADER TEMPLATES ─────────────────────────────────────────────
  window.createSkeleton = function(type, count = 4) {
    let html = '';

    if (type === 'cards') {
      html = '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">';
      for (let i = 0; i < count; i++) {
        html += `
          <div class="glass-card p-4 rounded-2xl border border-white/5 bg-zinc-900/40 flex flex-col gap-3">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full skeleton-box flex-shrink-0"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 w-3/4 skeleton-box"></div>
                <div class="h-3 w-1/2 skeleton-box"></div>
              </div>
            </div>
            <div class="space-y-1.5 pt-2 border-t border-white/5">
              <div class="h-3 w-full skeleton-box"></div>
              <div class="h-3 w-5/6 skeleton-box"></div>
            </div>
            <div class="flex items-center justify-between pt-2">
              <div class="h-6 w-20 rounded-full skeleton-box"></div>
              <div class="h-6 w-16 rounded-full skeleton-box"></div>
            </div>
          </div>
        `;
      }
      html += '</div>';
    } else if (type === 'table') {
      html = '<div class="space-y-2.5">';
      for (let i = 0; i < count; i++) {
        html += `
          <div class="glass-card p-3 rounded-xl border border-white/5 bg-zinc-900/30 flex items-center justify-between gap-4">
            <div class="flex items-center gap-3 flex-1">
              <div class="w-8 h-8 rounded-lg skeleton-box flex-shrink-0"></div>
              <div class="flex-1 space-y-1.5">
                <div class="h-3.5 w-1/3 skeleton-box"></div>
                <div class="h-2.5 w-2/3 skeleton-box"></div>
              </div>
            </div>
            <div class="h-4 w-24 skeleton-box flex-shrink-0"></div>
            <div class="h-7 w-20 rounded-lg skeleton-box flex-shrink-0"></div>
          </div>
        `;
      }
      html += '</div>';
    } else if (type === 'stats') {
      html = '<div class="grid grid-cols-2 md:grid-cols-4 gap-3">';
      for (let i = 0; i < count; i++) {
        html += `
          <div class="glass-card p-4 rounded-2xl border border-white/5 bg-zinc-900/40 space-y-2">
            <div class="flex items-center justify-between">
              <div class="h-3 w-20 skeleton-box"></div>
              <div class="w-7 h-7 rounded-lg skeleton-box"></div>
            </div>
            <div class="h-7 w-28 skeleton-box"></div>
            <div class="h-2.5 w-16 skeleton-box"></div>
          </div>
        `;
      }
      html += '</div>';
    } else if (type === 'list') {
      html = '<div class="space-y-2">';
      for (let i = 0; i < count; i++) {
        html += `
          <div class="p-3 rounded-xl border border-white/5 bg-zinc-900/25 flex items-center gap-3">
            <div class="w-9 h-9 rounded-full skeleton-box flex-shrink-0"></div>
            <div class="flex-1 space-y-1.5">
              <div class="h-3.5 w-1/2 skeleton-box"></div>
              <div class="h-2.5 w-3/4 skeleton-box"></div>
            </div>
          </div>
        `;
      }
      html += '</div>';
    }

    return html;
  };

  window.showSkeleton = function(containerId, type = 'cards', count = 4) {
    const el = (typeof containerId === 'string') ? document.getElementById(containerId) : containerId;
    if (el) {
      el.innerHTML = window.createSkeleton(type, count);
    }
  };

  // ── SLIDE-OVER INSPECTOR DRAWER ───────────────────────────────────────────
  window.openInspector = function(options = {}) {
    const backdrop = document.getElementById('slideover-inspector-backdrop');
    const panel = document.getElementById('slideover-inspector');
    const titleEl = document.getElementById('inspector-title');
    const subtitleEl = document.getElementById('inspector-subtitle');
    const badgeEl = document.getElementById('inspector-badge');
    const bodyEl = document.getElementById('inspector-body');
    const avatarEl = document.getElementById('inspector-avatar');

    if (!panel || !backdrop) return;

    if (titleEl) titleEl.textContent = options.title || 'Detalhes do Registro';
    if (subtitleEl) subtitleEl.textContent = options.subtitle || '';
    if (badgeEl) {
      if (options.badge) {
        badgeEl.textContent = options.badge;
        badgeEl.className = 'text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ' + (options.badgeClass || 'bg-violet-500/20 text-violet-300 border border-violet-500/30');
        badgeEl.classList.remove('hidden');
      } else {
        badgeEl.classList.add('hidden');
      }
    }
    if (avatarEl) {
      if (options.avatar) {
        avatarEl.src = options.avatar;
        avatarEl.classList.remove('hidden');
      } else {
        avatarEl.classList.add('hidden');
      }
    }

    if (bodyEl) {
      if (options.html) {
        bodyEl.innerHTML = options.html;
      } else if (options.loading) {
        bodyEl.innerHTML = window.createSkeleton('table', 5);
      }
    }

    backdrop.classList.remove('hidden');
    panel.classList.remove('hidden');
    requestAnimationFrame(() => {
      backdrop.classList.remove('opacity-0');
      backdrop.classList.add('opacity-100');
      panel.classList.remove('translate-x-full');
      panel.classList.add('translate-x-0');
    });
  };

  window.closeInspector = function() {
    const backdrop = document.getElementById('slideover-inspector-backdrop');
    const panel = document.getElementById('slideover-inspector');
    if (!panel || !backdrop) return;

    panel.classList.remove('translate-x-0');
    panel.classList.add('translate-x-full');
    backdrop.classList.remove('opacity-100');
    backdrop.classList.add('opacity-0');

    setTimeout(() => {
      panel.classList.add('hidden');
      backdrop.classList.add('hidden');
    }, 280);
  };

  // ── PRE-BUILT INSPECTOR CONNECTORS ─────────────────────────────────────────
  window.inspectDeputy = async function(id) {
    window.openInspector({
      title: 'Carregando dossiê...',
      subtitle: 'Deputado Federal',
      loading: true
    });

    try {
      const res = await window.api.camara(`deputados/${id}`);
      const d = res?.dados;
      if (!d) throw new Error('Dados não encontrados');
      const st = d.ultimoStatus || {};
      const foto = st.urlFoto || '';
      const nome = st.nomeEleitoral || d.nomeCivil || 'Deputado';
      const partido = st.siglaPartido || 'S/P';
      const uf = st.siglaUf || 'BR';
      const email = st.email || d.email || 'Não informado';
      const tel = st.gabinete?.telefone ? `(${st.gabinete.telefone})` : (d.telefone || 'Não informado');
      const sala = st.gabinete?.sala ? `Gabinete ${st.gabinete.sala}, Prédio ${st.gabinete.predio || ''}` : 'Brasília - DF';

      const formatBRL = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

      const renderContent = (despList = []) => {
        let despHtml = '';
        if (despList && despList.length > 0) {
          despHtml = `
            <div class="space-y-2 mt-2">
              ${despList.slice(0, 5).map(item => `
                <div class="p-2.5 rounded-xl bg-zinc-900/60 border border-white/5 flex items-center justify-between text-xs">
                  <div class="min-w-0 pr-2">
                    <p class="text-zinc-200 font-semibold truncate">${item.tipoDespesa || 'Despesa'}</p>
                    <p class="text-[10px] text-zinc-500 truncate">${item.nomeFornecedor || 'Fornecedor'}</p>
                  </div>
                  <span class="font-mono font-bold text-amber-400 flex-shrink-0">${formatBRL(item.valorLiquido || item.valorDocumento)}</span>
                </div>
              `).join('')}
            </div>
          `;
        } else {
          despHtml = '<p class="text-xs text-zinc-500 py-1">Nenhuma despesa recente registrada neste exercício.</p>';
        }

        return `
          <div class="space-y-5 text-sm">
            <!-- Mini Card Resumo -->
            <div class="glass-card p-4 rounded-2xl border border-white/10 bg-gradient-to-br from-violet-950/20 to-zinc-900/40">
              <div class="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span class="text-zinc-500 uppercase tracking-wider text-[10px] block font-mono">Nome Civil</span>
                  <span class="text-zinc-300 font-medium truncate block">${d.nomeCivil || nome}</span>
                </div>
                <div>
                  <span class="text-zinc-500 uppercase tracking-wider text-[10px] block font-mono">Condição</span>
                  <span class="text-emerald-400 font-medium">${st.condicaoEleitoral || 'Titular'}</span>
                </div>
                <div>
                  <span class="text-zinc-500 uppercase tracking-wider text-[10px] block font-mono">Contato Gabinete</span>
                  <span class="text-zinc-300 font-mono text-[11px] truncate block">${tel}</span>
                </div>
                <div>
                  <span class="text-zinc-500 uppercase tracking-wider text-[10px] block font-mono">Localização</span>
                  <span class="text-zinc-300 text-[11px] truncate block">${sala}</span>
                </div>
              </div>
              <div class="mt-3 pt-3 border-t border-white/5">
                <span class="text-zinc-500 uppercase tracking-wider text-[10px] block font-mono mb-1">Email Oficial</span>
                <a href="mailto:${email}" class="text-violet-400 hover:text-violet-300 text-xs font-mono break-all">${email}</a>
              </div>
            </div>

            <!-- Despesas Recentes -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <h4 class="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">Últimas Notas (CEAP)</h4>
                <span class="text-[10px] text-zinc-500">Câmara dos Deputados</span>
              </div>
              ${despHtml}
            </div>

            <!-- Ações Rápidas -->
            <div class="pt-2 space-y-2">
              <button onclick="window.closeInspector(); if(typeof window.openDeputyDetails === 'function') window.openDeputyDetails(${id});"
                      class="w-full py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-violet-600/30 transition flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                Abrir Raio-X & Dossiê Completo
              </button>

              <button onclick="window.closeInspector(); if(window.HyperBot) window.HyperBot.analyzePolitico('Deputado ${nome}');"
                      class="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2">
                <span>🧠</span>
                Auditoria Profunda via IA
              </button>
            </div>
          </div>
        `;
      };

      // Atualiza inspector com os dados básicos
      window.openInspector({
        title: nome,
        subtitle: `${partido} • ${uf} — Deputado Federal`,
        badge: 'Câmara',
        badgeClass: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
        avatar: foto,
        html: renderContent([])
      });

      // Busca despesas em segundo plano para preencher a lista
      const currentYear = new Date().getFullYear();
      window.api.camara(`deputados/${id}/despesas?ano=${currentYear}&itens=5&ordem=DESC&ordenarPor=dataDocumento`)
        .then(resDesp => {
          const despList = resDesp?.dados || [];
          const bodyEl = document.getElementById('inspector-body');
          if (bodyEl) {
            bodyEl.innerHTML = renderContent(despList);
          }
        })
        .catch(err => {
          console.warn('[HyperZ Inspector] Erro ao buscar despesas:', err);
        });

    } catch (e) {
      console.error('[HyperZ Inspector] Erro:', e);
      window.openInspector({
        title: 'Erro ao carregar',
        subtitle: 'Deputado Federal',
        html: '<div class="text-center py-10 text-red-400 text-xs">Não foi possível carregar os dados deste parlamentar.</div>'
      });
    }
  };

  window.inspectSenator = async function(codigo) {
    window.openInspector({
      title: 'Carregando dossiê...',
      subtitle: 'Senador da República',
      loading: true
    });

    try {
      const data = await window.api.get('get_senator_details', { id: codigo });
      const i = data?.detalhes?.IdentificacaoParlamentar;
      if (!i) throw new Error('Dados do senador não encontrados');
      const nome = i.NomeParlamentar || 'Senador';
      const partido = i.SiglaPartidoParlamentar || 'S/P';
      const uf = i.UfParlamentar || 'BR';
      const foto = (i.UrlFotoParlamentar || '').replace('http://', 'https://');
      const email = i.EmailParlamentar || 'Não informado';

      const html = `
        <div class="space-y-5 text-sm">
          <div class="glass-card p-4 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-950/20 to-zinc-900/40">
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span class="text-zinc-500 uppercase tracking-wider text-[10px] block font-mono">Nome Completo</span>
                <span class="text-zinc-300 font-medium truncate block">${i.NomeCompletoParlamentar || nome}</span>
              </div>
              <div>
                <span class="text-zinc-500 uppercase tracking-wider text-[10px] block font-mono">Mandato</span>
                <span class="text-blue-400 font-medium">Senado Federal</span>
              </div>
              <div>
                <span class="text-zinc-500 uppercase tracking-wider text-[10px] block font-mono">UF / Estado</span>
                <span class="text-zinc-300 font-medium">${uf}</span>
              </div>
              <div>
                <span class="text-zinc-500 uppercase tracking-wider text-[10px] block font-mono">Partido</span>
                <span class="text-zinc-300 font-medium">${partido}</span>
              </div>
            </div>
            <div class="mt-3 pt-3 border-t border-white/5">
              <span class="text-zinc-500 uppercase tracking-wider text-[10px] block font-mono mb-1">Email Institucional</span>
              <a href="mailto:${email}" class="text-blue-400 hover:text-blue-300 text-xs font-mono break-all">${email}</a>
            </div>
          </div>

          <div class="pt-2 space-y-2">
            <button onclick="window.closeInspector(); if(typeof window._openSenadorDossie === 'function') window._openSenadorDossie('${codigo}');"
                    class="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              Abrir Dossiê Completo
            </button>

            <button onclick="window.closeInspector(); if(window.HyperBot) window.HyperBot.analyzePolitico('Senador ${nome}');"
                    class="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2">
              <span>🧠</span>
              Auditoria de Gastos com IA
            </button>
          </div>
        </div>
      `;

      window.openInspector({
        title: nome,
        subtitle: `${partido} • ${uf} — Senado Federal`,
        badge: 'Senado',
        badgeClass: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
        avatar: foto,
        html: html
      });
    } catch (e) {
      console.error('[HyperZ Inspector] Erro Senador:', e);
      window.openInspector({
        title: 'Erro ao carregar',
        subtitle: 'Senado Federal',
        html: '<div class="text-center py-10 text-red-400 text-xs">Não foi possível carregar os dados deste senador.</div>'
      });
    }
  };

  // Close inspector on ESC key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      window.closeInspector();
    }
  });

  // Attach global keyboard helper for SaaS shortcuts
  console.log('[HyperZ] SaaS UI Engine v2.5 initialized (Skeletons & Slide-Over)');
})();
