<!-- Scripts Modularizados -->
<script src="<?php echo BASE_PATH; ?>/transparency/js/api.js?v=<?php echo time(); ?>"></script>
<script src="<?php echo BASE_PATH; ?>/transparency/js/utils.js?v=<?php echo time(); ?>"></script>
<script src="<?php echo BASE_PATH; ?>/transparency/js/company.js?v=<?php echo time(); ?>"></script>
<script src="<?php echo BASE_PATH; ?>/transparency/js/deputy.js?v=<?php echo time(); ?>"></script>
<script src="<?php echo BASE_PATH; ?>/transparency/js/transparency.js?v=<?php echo time(); ?>"></script>
<script src="<?php echo BASE_PATH; ?>/transparency/js/parties.js?v=<?php echo time(); ?>"></script>
<script src="<?php echo BASE_PATH; ?>/transparency/js/risk.js?v=<?php echo time(); ?>"></script>
<script src="<?php echo BASE_PATH; ?>/transparency/js/elections.js?v=<?php echo time(); ?>"></script>
<script src="<?php echo BASE_PATH; ?>/transparency/js/presidents.js?v=<?php echo time(); ?>"></script>
<script src="<?php echo BASE_PATH; ?>/transparency/js/tabs.js?v=<?php echo time(); ?>"></script>
<script src="<?php echo BASE_PATH; ?>/transparency/js/map.js?v=<?php echo time(); ?>"></script>
<script src="<?php echo BASE_PATH; ?>/transparency/js/comparison.js?v=<?php echo time(); ?>"></script>
<script src="<?php echo BASE_PATH; ?>/transparency/js/corruption.js?v=<?php echo time(); ?>"></script>
<script src="<?php echo BASE_PATH; ?>/transparency/js/network_graph.js?v=<?php echo time(); ?>"></script>
<script src="<?php echo BASE_PATH; ?>/transparency/js/municipio.js?v=<?php echo time(); ?>"></script>
<script src="<?php echo BASE_PATH; ?>/transparency/js/hyperbot.js?v=<?php echo time(); ?>"></script>

<!-- ── Módulos de usabilidade (Etapas 6, 7, 9) ──────────────────────────── -->
<script src="<?php echo BASE_PATH; ?>/transparency/js/toast.js?v=<?php echo filemtime(__DIR__.'/../../js/toast.js'); ?>"></script>
<script src="<?php echo BASE_PATH; ?>/transparency/js/glossario.js?v=<?php echo filemtime(__DIR__.'/../../js/glossario.js'); ?>"></script>
<script src="<?php echo BASE_PATH; ?>/transparency/js/help_inline.js?v=<?php echo filemtime(__DIR__.'/../../js/help_inline.js'); ?>"></script>

<!-- ── HyperBot — módulos de extensão (ordem: guia → osint → brain → chat → senate → superpoderes) -->
<script src="<?php echo BASE_PATH; ?>/transparency/js/hyperbot_guia.js?v=<?php echo filemtime(__DIR__.'/../../js/hyperbot_guia.js'); ?>"></script>
<script src="<?php echo BASE_PATH; ?>/transparency/js/hyperbot_osint.js?v=<?php echo filemtime(__DIR__.'/../../js/hyperbot_osint.js'); ?>"></script>
<script src="<?php echo BASE_PATH; ?>/transparency/js/hyperbot_brain.js?v=<?php echo filemtime(__DIR__.'/../../js/hyperbot_brain.js'); ?>"></script>
<script src="<?php echo BASE_PATH; ?>/transparency/js/hyperbot_chat.js?v=<?php echo filemtime(__DIR__.'/../../js/hyperbot_chat.js'); ?>"></script>
<script src="<?php echo BASE_PATH; ?>/transparency/js/hyperbot_senate.js?v=<?php echo filemtime(__DIR__.'/../../js/hyperbot_senate.js'); ?>"></script>
<script src="<?php echo BASE_PATH; ?>/transparency/js/hyperbot_investigador.js?v=<?php echo filemtime(__DIR__.'/../../js/hyperbot_investigador.js'); ?>"></script>
<script src="<?php echo BASE_PATH; ?>/transparency/js/hyperbot_monitor.js?v=<?php echo filemtime(__DIR__.'/../../js/hyperbot_monitor.js'); ?>"></script>
<script src="<?php echo BASE_PATH; ?>/transparency/js/hyperbot_cruzador.js?v=<?php echo filemtime(__DIR__.'/../../js/hyperbot_cruzador.js'); ?>"></script>
<script src="<?php echo BASE_PATH; ?>/transparency/js/hyperbot_denuncia.js?v=<?php echo filemtime(__DIR__.'/../../js/hyperbot_denuncia.js'); ?>"></script>
<script src="<?php echo BASE_PATH; ?>/transparency/js/hyperbot_calculadora.js?v=<?php echo filemtime(__DIR__.'/../../js/hyperbot_calculadora.js'); ?>"></script>
<script src="<?php echo BASE_PATH; ?>/transparency/js/hyperbot_exportar.js?v=<?php echo filemtime(__DIR__.'/../../js/hyperbot_exportar.js'); ?>"></script>

<script>
// ─── Radar Sub-Tab switcher ───────────────────────────────────────────────────
function showRadarSubTab(name) {
    ['sancoes', 'pessoafisica', 'pessoajuridica', 'nepotismo', 'despesas', 'cruzamento'].forEach(t => {
        document.getElementById('rsub-' + t)?.classList.add('hidden');
        const btn = document.getElementById('rtab-' + t);
        if (btn) btn.className = 'px-4 py-2 text-sm font-bold rounded-t-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition whitespace-nowrap';
    });
    document.getElementById('rsub-' + name)?.classList.remove('hidden');
    const active = document.getElementById('rtab-' + name);
    if (active) active.className = 'px-4 py-2 text-sm font-bold rounded-t-lg bg-red-600 text-white whitespace-nowrap';
}

// ─── Online visitor counter ───────────────────────────────────────────────────
(async function trackTransparencyView() {
    const API = (window.BASE_PATH || '') + '/api.php';
    const onlineEl = document.getElementById('transparency-online');

    async function ping() {
        try {
            const fd = new FormData();
            fd.append('page', 'transparency');
            const r = await fetch(`${API}?action=track_page_view`, { method: 'POST', body: fd });
            const d = await r.json();
            if (onlineEl && d.online !== undefined) onlineEl.textContent = d.online;
        } catch(e) {}
    }

    ping();
    setInterval(ping, 60000);
})();


// ─── ESC closes any open modal ────────────────────────────────────────────────
document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape') return;
    ['deputyModal','companyModal','documentsModal','senatorModal','presidentModal','stateModal','ng-modal'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el && !el.classList.contains('hidden')) el.classList.add('hidden');
    });
    var share = document.getElementById('shareDeputyModal');
    if (share) share.remove();
    closeMoreDrawer();
});

// ─── Mobile "Mais" Drawer ─────────────────────────────────────────────────────
window.toggleMoreDrawer = function() {
    const drawer = document.getElementById('more-drawer');
    const backdrop = document.getElementById('more-drawer-backdrop');
    if (!drawer) return;
    const isOpen = drawer.style.transform === 'translateY(0%)';
    if (isOpen) {
        closeMoreDrawer();
    } else {
        drawer.style.transform = 'translateY(0%)';
        if (backdrop) {
            backdrop.style.display = 'block';
            backdrop.style.pointerEvents = 'auto';
        }
    }
};

window.closeMoreDrawer = function() {
    const drawer = document.getElementById('more-drawer');
    const backdrop = document.getElementById('more-drawer-backdrop');
    if (drawer) drawer.style.transform = 'translateY(110%)';
    if (backdrop) {
        backdrop.style.display = 'none';
        backdrop.style.pointerEvents = 'none';
    }
};

// ─── Home Screen & customSwitchTab ────────────────────────────────────────────
// Definir globalmente e imediatamente para evitar falha no clique mobile
window.customSwitchTab = function(tab) {
    const homeContent = document.getElementById('content-home');
    const allContent  = document.querySelectorAll('[id^="content-"]');
    const topbarHomeBtn      = document.getElementById('topbar-home-button-container');
    const topbarDefaultContent = document.getElementById('topbar-default-content');
    const originalSwitchTab  = window.switchTab;

    // 1. Oculta todas as abas
    allContent.forEach(el => el.classList.add('hidden'));
    
    // 2. Exibe a aba solicitada
    const targetContent = document.getElementById('content-' + tab);
    if (targetContent) targetContent.classList.remove('hidden');
    
    // 3. Gerencia o comportamento da barra superior
    if (tab === 'home') {
        if (topbarHomeBtn) topbarHomeBtn.classList.add('hidden');
        if (topbarDefaultContent) topbarDefaultContent.classList.remove('hidden');
        const mainEl = document.getElementById('main-content');
        if (mainEl) mainEl.scrollTop = 0;
    } else {
        if (topbarHomeBtn) topbarHomeBtn.classList.remove('hidden');
        if (topbarDefaultContent) topbarDefaultContent.classList.add('hidden');
        
        // 4. Executa o carregamento de dados de API atrelados à aba (tabs.js)
        if (typeof originalSwitchTab === 'function') {
            originalSwitchTab(tab);
        } else {
            console.warn('tabs.js not loaded yet, deferring API calls...');
            setTimeout(() => { if (typeof window.switchTab === 'function') window.switchTab(tab); }, 200);
        }
    }

    if (typeof window.updateDesktopSidebar === 'function') window.updateDesktopSidebar(tab);
    if (typeof window.updateBottomNav === 'function') window.updateBottomNav(tab);
};

document.addEventListener('DOMContentLoaded', function() {
    const homeContent = document.getElementById('content-home');
    const allContent  = document.querySelectorAll('[id^="content-"]');
    const topbarHomeBtn      = document.getElementById('topbar-home-button-container');
    const topbarDefaultContent = document.getElementById('topbar-default-content');

    // Bottom-nav active-state map
    const bnavMap = {
        home: 'home', politicos: 'politicos', senadores: 'politicos',
        presidentes: 'politicos', partidos: 'politicos',
        radar: 'radar', risco: 'radar', top_corrupcao: 'radar', rede: 'radar',
        gestao: 'gestao', orcamento: 'gestao', receitas: 'gestao',
        viagens: 'gestao', licitacoes: 'gestao', imoveis: 'gestao',
        municipio: 'gestao',
    };

    window.updateBottomNav = function(activeTab) {
        const activeGroup = bnavMap[activeTab] || null;
        document.querySelectorAll('.bnav-btn').forEach(btn => {
            const key = btn.getAttribute('data-bnav');
            const isActive = key && key === activeGroup;
            btn.classList.toggle('text-violet-400', isActive && key !== 'radar');
            btn.classList.toggle('text-red-400',    isActive && key === 'radar');
            btn.classList.toggle('text-zinc-400',   !isActive || key === 'mais');
        });
    }

    window.updateDesktopSidebar = function(tab) {
        document.querySelectorAll('button[id^="tab-"]').forEach(btn => {
            const id = btn.id.replace('tab-', '');
            let base = 'w-full text-left px-3 py-2 rounded-xl transition flex items-center gap-2 text-sm font-medium whitespace-nowrap border ';
            let cls;
            if (id === tab) {
                if (id === 'risco' || id === 'radar' || id === 'top_corrupcao')
                    cls = base + 'text-red-300 bg-red-900/40 border-red-500/30';
                else if (id === 'mapa')
                    cls = base + 'text-amber-300 bg-amber-900/40 border-amber-500/30';
                else if (id === 'comparador')
                    cls = base + 'text-blue-300 bg-blue-900/40 border-blue-500/30';
                else if (id === 'rede')
                    cls = base + 'text-violet-300 bg-violet-900/40 border-violet-500/30';
                else
                    cls = base + 'text-white bg-white/10 border-white/20';
            } else {
                if (id === 'risco' || id === 'radar' || id === 'top_corrupcao')
                    cls = base + 'text-red-400 hover:bg-red-900/20 hover:text-red-300 border-transparent';
                else if (id === 'mapa')
                    cls = base + 'text-amber-400 hover:bg-amber-900/20 hover:text-amber-300 border-transparent';
                else if (id === 'comparador')
                    cls = base + 'text-blue-400 hover:bg-blue-900/20 hover:text-blue-300 border-transparent';
                else if (id === 'rede')
                    cls = base + 'text-violet-400 hover:bg-violet-900/20 hover:text-violet-300 border-transparent';
                else
                    cls = base + 'text-zinc-400 hover:bg-white/5 hover:text-white border-transparent';
            }
            btn.className = cls;
        });
    }

    // Inicializa tela home
    if (!document.querySelector('[id^="content-"]:not(.hidden)')) {
        window.customSwitchTab('home');
    }
});

// ─── Back to Top ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const main = document.getElementById('main-content');
    const btn  = document.getElementById('backToTopBtn');
    if (main && btn) {
        main.addEventListener('scroll', () => {
            btn.classList.toggle('opacity-0',        main.scrollTop <= 400);
            btn.classList.toggle('pointer-events-none', main.scrollTop <= 400);
        });
    }
});

function scrollToTop() {
    const main = document.getElementById('main-content');
    if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
}

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register((window.BASE_PATH || '') + '/sw.js')
            .then(reg => console.log('SW registrado no Portal!', reg))
            .catch(err => console.log('SW falhou no Portal:', err));
    });
}
</script>

<!-- ══════════════════════════════════════════════════════
     HYPER Z ADS — Portal de Transparência
══════════════════════════════════════════════════════ -->
<script>
(function () {
  const API = (window.BASE_PATH || '') + '/api.php';

  function escAd(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  function trackAdClick(id) {
    navigator.sendBeacon(API + '?action=track_ad_click', new URLSearchParams({ ad_id: id }));
  }

  // ── Render sidebar (compacto) ────────────────────────────────────────────
  function renderSidebar(slot, ad) {
    slot.innerHTML = `
      <a href="${escAd(ad.click_url)}" target="_blank" rel="noopener sponsored"
         onclick="trackAdClick(${ad.id})"
         class="block rounded-xl border border-white/8 overflow-hidden hover:border-violet-500/30 transition group">
        ${ad.image_url
          ? `<img src="${escAd(ad.image_url)}" alt="${escAd(ad.title)}"
                  class="w-full aspect-video object-cover opacity-80 group-hover:opacity-100 transition"/>`
          : `<div class="w-full h-14 bg-gradient-to-br from-violet-900/40 to-indigo-900/40 flex items-center justify-center text-xl">📢</div>`}
        <div class="p-2.5">
          <div class="text-xs font-bold text-white leading-tight mb-0.5 truncate">${escAd(ad.title)}</div>
          ${ad.description ? `<div class="text-[10px] text-zinc-500 leading-tight line-clamp-2 mb-1.5">${escAd(ad.description)}</div>` : ''}
          <span class="text-[10px] font-bold text-violet-400 group-hover:text-violet-300 transition">${escAd(ad.cta_text || 'Saiba Mais')} →</span>
        </div>
      </a>`;
  }

  // ── Render card horizontal (home) ────────────────────────────────────────
  function renderCard(slot, ad) {
    slot.innerHTML = `
      <a href="${escAd(ad.click_url)}" target="_blank" rel="noopener sponsored"
         onclick="trackAdClick(${ad.id})"
         class="flex gap-4 items-center bg-zinc-900/60 border border-white/8 rounded-2xl p-4 hover:border-violet-500/25 transition group">
        ${ad.image_url
          ? `<img src="${escAd(ad.image_url)}" alt="${escAd(ad.title)}"
                  class="w-20 h-20 rounded-xl object-cover flex-shrink-0 opacity-85 group-hover:opacity-100 transition"/>`
          : `<div class="w-20 h-20 rounded-xl bg-gradient-to-br from-violet-900/50 to-indigo-900/50 flex items-center justify-center text-3xl flex-shrink-0">📢</div>`}
        <div class="flex-1 min-w-0">
          <div class="text-sm font-bold text-white mb-1 truncate">${escAd(ad.title)}</div>
          ${ad.description ? `<div class="text-xs text-zinc-400 leading-relaxed line-clamp-2">${escAd(ad.description)}</div>` : ''}
        </div>
        <div class="flex-shrink-0 hidden sm:block">
          <span class="inline-flex items-center bg-violet-600/20 hover:bg-violet-600/40 border border-violet-500/30 text-violet-300 text-xs font-bold px-4 py-2 rounded-xl transition whitespace-nowrap">
            ${escAd(ad.cta_text || 'Saiba Mais')} →
          </span>
        </div>
      </a>`;
  }

  // ── Carrega e distribui nos slots ────────────────────────────────────────
  async function loadPortalAds() {
    try {
      const res  = await fetch(API + '?action=get_active_ad&type=portal');
      const data = await res.json();
      if (!data.ad) return;
      const ad = data.ad;

      const sidebarWrap = document.getElementById('sidebar-ad-wrap');
      const sidebarSlot = document.getElementById('sidebar-ad-slot');
      if (sidebarSlot) {
        renderSidebar(sidebarSlot, ad);
        if (sidebarWrap) sidebarWrap.style.display = 'block';
      }

      const homeWrap = document.getElementById('home-ad-wrap');
      const homeSlot = document.getElementById('home-ad-slot');
      if (homeSlot) {
        renderCard(homeSlot, ad);
        if (homeWrap) homeWrap.style.display = 'block';
      }
    } catch (e) { /* falha silenciosa */ }
  }

  document.addEventListener('DOMContentLoaded', loadPortalAds);
  window.trackAdClick = trackAdClick;
})();
</script>
