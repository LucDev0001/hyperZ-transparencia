<div id="content-pautas_gz" class="content-panel hidden p-4 sm:p-6 max-w-4xl mx-auto">

  <!-- Header -->
  <div class="flex items-start justify-between gap-4 mb-6">
    <div>
      <div class="flex items-center gap-2 mb-2">
        <div class="w-8 h-8 rounded-xl bg-green-900/30 border border-green-700/40 flex items-center justify-center text-base">🤝</div>
        <h2 class="text-xl font-black text-white">Pautas GZ</h2>
        <span class="text-[10px] font-bold bg-green-900/40 text-green-400 border border-green-700/40 px-2 py-0.5 rounded-full uppercase tracking-wide">Parceria</span>
      </div>
      <p class="text-zinc-400 text-sm">Políticos e votações monitorados pelo <strong class="text-green-400">Movimento Geração Z BR</strong> — com dados reais do Portal de Transparência.</p>
    </div>
    <a href="https://t.me/ograndedia" target="_blank" rel="noopener"
       class="flex-shrink-0 flex items-center gap-1.5 text-xs bg-green-900/30 hover:bg-green-900/50 border border-green-700/40 text-green-400 px-3 py-1.5 rounded-lg transition">
      <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
      Telegram
    </a>
  </div>

  <!-- Stats bar -->
  <div id="gz-stats-bar" class="grid grid-cols-3 gap-3 mb-6">
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
      <div class="text-xl font-black text-green-400" id="gz-stat-pautas">—</div>
      <div class="text-zinc-500 text-xs mt-0.5">Pautas ativas</div>
    </div>
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
      <div class="text-xl font-black text-violet-400" id="gz-stat-politicos">—</div>
      <div class="text-zinc-500 text-xs mt-0.5">Políticos monitorados</div>
    </div>
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
      <div class="text-xl font-black text-white" id="gz-stat-aliados">—</div>
      <div class="text-zinc-500 text-xs mt-0.5">Aliados na plataforma</div>
    </div>
  </div>

  <!-- Loading skeleton -->
  <div id="gz-skeleton" class="space-y-3">
    <?php for ($i = 0; $i < 4; $i++): ?>
    <div class="animate-pulse bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex gap-3">
      <div class="w-10 h-10 bg-zinc-800 rounded-xl flex-shrink-0"></div>
      <div class="flex-1 space-y-2">
        <div class="h-3 bg-zinc-800 rounded w-1/2"></div>
        <div class="h-2 bg-zinc-800 rounded w-3/4"></div>
      </div>
    </div>
    <?php endfor; ?>
  </div>

  <!-- Lista de pautas -->
  <div id="gz-pautas-list" class="space-y-3 hidden"></div>

  <!-- Empty state -->
  <div id="gz-empty" class="hidden text-center py-16">
    <div class="text-5xl mb-4">📋</div>
    <h3 class="font-bold text-white mb-2">Nenhuma pauta cadastrada ainda</h3>
    <p class="text-zinc-500 text-sm">As pautas prioritárias do Movimento Geração Z BR aparecerão aqui em breve.</p>
    <a href="https://t.me/ograndedia" target="_blank" class="inline-block mt-4 text-xs bg-green-900/30 hover:bg-green-900/50 border border-green-700/40 text-green-400 px-4 py-2 rounded-lg transition">
      Acompanhar no Telegram →
    </a>
  </div>

  <!-- CTA cadastro -->
  <div class="mt-8 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-5">
    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div class="flex-1">
        <p class="font-bold text-white text-sm mb-1">Faça parte do movimento</p>
        <p class="text-zinc-500 text-xs">Crie sua conta no Hyper Z com o link do movimento e ganhe o badge <span class="text-green-400">🤝 Aliado GZ BR</span> no seu perfil.</p>
      </div>
      <a href="/aliado_gz.php"
         class="flex-shrink-0 bg-green-700 hover:bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl transition text-sm whitespace-nowrap">
        Ser um Aliado →
      </a>
    </div>
  </div>

</div>

<script>
(function() {
  const TYPE_ICONS = { deputado: '👔', senador: '🏛️', presidente: '🇧🇷', outro: '🏙️' };
  const CAT_COLORS = {
    'corrupção':       'text-red-400 bg-red-900/20 border-red-800/30',
    'gastos':          'text-amber-400 bg-amber-900/20 border-amber-800/30',
    'votações':        'text-blue-400 bg-blue-900/20 border-blue-800/30',
    'transparência':   'text-violet-400 bg-violet-900/20 border-violet-800/30',
    'default':         'text-zinc-400 bg-zinc-800/50 border-zinc-700/30',
  };

  function catClass(cat) {
    const k = (cat||'').toLowerCase();
    return CAT_COLORS[k] || CAT_COLORS['default'];
  }

  async function loadPautasGZ() {
    try {
      const res = await fetch('/api.php?action=list_pautas_gz_public');
      const data = await res.json();

      document.getElementById('gz-skeleton').classList.add('hidden');

      const pautas = Array.isArray(data.pautas) ? data.pautas : [];
      document.getElementById('gz-stat-pautas').textContent = pautas.length;
      document.getElementById('gz-stat-politicos').textContent = [...new Set(pautas.map(p => p.politician_name).filter(Boolean))].length;
      document.getElementById('gz-stat-aliados').textContent = data.aliados ?? '—';

      if (pautas.length === 0) {
        document.getElementById('gz-empty').classList.remove('hidden');
        return;
      }

      const list = document.getElementById('gz-pautas-list');
      list.classList.remove('hidden');
      list.innerHTML = pautas.map(p => {
        const icon = TYPE_ICONS[p.politician_type] || '🏙️';
        const cc   = catClass(p.category);
        const highlightBorder = p.highlight == 1 ? 'border-green-700/50 bg-green-900/5' : 'border-zinc-800';
        const badge = p.highlight == 1 ? `<span class="text-[10px] font-bold bg-green-900/40 text-green-400 border border-green-700/40 px-1.5 py-0.5 rounded-full">Em destaque</span>` : '';

        let linkBtn = '';
        if (p.politician_name) {
          const colorClass = p.politician_type === 'senador' ? 'text-blue-400 hover:text-blue-300' : 'text-violet-400 hover:text-violet-300';
          const label = p.politician_type === 'senador' ? 'Ver no portal → Senadores' : 'Ver no portal → Deputados';
          linkBtn = `<button
              data-polname="${escHtml(p.politician_name)}"
              data-poltype="${escHtml(p.politician_type)}"
              onclick="openGZPolitician(this)"
              class="inline-flex items-center gap-1 text-xs font-semibold ${colorClass} hover:underline">
              <svg style="width:11px;height:11px;flex-shrink:0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              ${label}</button>`;
        }

        return `
          <div class="bg-zinc-900 border ${highlightBorder} rounded-xl p-4 transition hover:border-green-700/30">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xl flex-shrink-0">${icon}</div>
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-1.5 mb-1">
                  <span class="font-bold text-white text-sm">${escHtml(p.title)}</span>
                  ${badge}
                  ${p.category ? `<span class="text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cc}">${escHtml(p.category)}</span>` : ''}
                </div>
                ${p.politician_name ? `<p class="text-zinc-400 text-xs mb-1">🎯 ${escHtml(p.politician_name)}</p>` : ''}
                ${p.description ? `<p class="text-zinc-500 text-xs leading-relaxed mb-2">${escHtml(p.description)}</p>` : ''}
                ${linkBtn}
              </div>
            </div>
          </div>`;
      }).join('');

    } catch(e) {
      document.getElementById('gz-skeleton').classList.add('hidden');
      document.getElementById('gz-empty').classList.remove('hidden');
    }
  }

  function escHtml(s) {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  window.openGZPolitician = function(el) {
    const name = el.dataset.polname || '';
    const type = el.dataset.poltype || '';
    if (type === 'senador') {
      window.customSwitchTab('senadores');
      setTimeout(() => {
        const input = document.getElementById('senado-nome');
        if (input) { input.value = name; input.dispatchEvent(new Event('keyup')); }
      }, 350);
    } else {
      // deputado, presidente, outro → aba Deputados
      window.customSwitchTab('politicos');
      setTimeout(() => {
        const input = document.getElementById('nameSearch');
        if (input) { input.value = name; if (typeof window.loadDeputies === 'function') window.loadDeputies(); }
      }, 350);
    }
  };

  // Carrega quando a aba fica visível
  const observer = new MutationObserver(() => {
    const panel = document.getElementById('content-pautas_gz');
    if (panel && !panel.classList.contains('hidden')) {
      observer.disconnect();
      loadPautasGZ();
    }
  });
  const panel = document.getElementById('content-pautas_gz');
  if (panel) observer.observe(panel, { attributes: true, attributeFilter: ['class'] });
})();
</script>
