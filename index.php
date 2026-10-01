<?php require_once 'views/partials/header.php'; ?>

<?php require_once 'views/partials/topbar.php'; ?>

<?php
// Navigation array — used by sidebar, bottom nav, home grid, and tabs.js
$nav = [
  ['politicos',     '👔', 'Deputados',          'normal', ''],
  ['senadores',     '🏛️', 'Senadores',           'normal', ''],
  ['radar',         '🔍', 'Radar A-C',           'red',    "if(typeof window.initRadarTab==='function')window.initRadarTab();"],
  ['risco',         '🚨', 'Análise de Risco',    'red',    ''],
  ['top_corrupcao', '🏆', 'Top Corrupção',       'red',    ''],
  ['comparador',    '⚖️', 'Comparador',          'blue',   ''],
  ['mapa',          '🗺️', 'Mapa de Gastos',      'amber',  ''],
  ['partidos',      '🚩', 'Partidos',            'normal', ''],
  ['servidores',    '👥', 'Servidores',          'normal', ''],
  ['eleicoes',      '🗳️', 'Eleições (TSE)',      'normal', ''],
  ['presidentes',   '🇧🇷', 'Presidentes',        'normal', ''],
  ['orcamento',     '💰', 'Orçamento',           'normal', ''],
  ['gestao',        '📊', 'Gestão & Finanças',   'normal', ''],
  ['outros',        '🏙️', 'Executivo & Mun.',    'normal', ''],
  ['receitas',      '📊', 'Exec. Orçamentária',  'normal', ''],
  ['viagens',       '✈️', 'Viagens a Serviço',   'normal', ''],
  ['licitacoes',    '📝', 'Licitações',          'normal', ''],
  ['imoveis',       '🏢', 'Imóveis Func.',       'normal', ''],
  ['noticias',      '📰', 'Notícias',            'normal', ''],
  ['rede',          '🕸️', 'Radar Conexões',      'violet', ''],
  ['municipio',     '🏘️', 'Minha Cidade',        'normal', ''],
  ['pautas_gz',     '🤝', 'Pautas GZ',           'green',  ''],
];
?>

<!-- App Shell -->
<div class="flex-1 flex flex-col overflow-hidden">

  <!-- Main Content Area -->
  <main class="flex-1 min-w-0 min-h-0 overflow-y-auto p-3 lg:p-8 pb-20 relative" id="main-content">

    <?php
      // Include all tab content panels
      foreach ($nav as [$id, $icon, $label, $color, $extra]) {
          if (file_exists("views/tabs/{$id}.php")) {
              require_once "views/tabs/{$id}.php";
          }
      }
      // Include the home/landing screen last
      require_once 'views/tabs/home.php';
    ?>

  </main>
</div>

<!-- ══════════════════════════════════════════════════════
     MOBILE BOTTOM NAVIGATION BAR (hidden on lg+)
══════════════════════════════════════════════════════ -->
<nav id="bottom-nav"
     class="fixed bottom-0 left-0 right-0 z-[60] lg:hidden flex items-stretch h-16
            bg-zinc-900/97 backdrop-blur-md border-t border-white/10"
     style="padding-bottom:env(safe-area-inset-bottom)">

  <!-- Início -->
  <button onclick="window.customSwitchTab('home')"
          data-bnav="home"
          class="bnav-btn flex-1 flex flex-col items-center justify-center gap-0.5 text-zinc-400 transition active:scale-95">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-7-4h10"/>
    </svg>
    <span class="text-[10px] font-semibold leading-none">Início</span>
  </button>

  <!-- Políticos -->
  <button onclick="window.customSwitchTab('politicos')"
          data-bnav="politicos"
          class="bnav-btn flex-1 flex flex-col items-center justify-center gap-0.5 text-zinc-400 transition active:scale-95">
    <span class="text-xl leading-none">👔</span>
    <span class="text-[10px] font-semibold leading-none">Políticos</span>
  </button>

  <!-- Investigar (Radar) -->
  <button onclick="window.customSwitchTab('radar');if(typeof window.initRadarTab==='function')window.initRadarTab();"
          data-bnav="radar"
          class="bnav-btn flex-1 flex flex-col items-center justify-center gap-0.5 text-red-400 transition active:scale-95">
    <span class="text-xl leading-none">🔍</span>
    <span class="text-[10px] font-semibold leading-none">Investigar</span>
  </button>

  <!-- Dados (Gestão) -->
  <button onclick="window.customSwitchTab('gestao')"
          data-bnav="gestao"
          class="bnav-btn flex-1 flex flex-col items-center justify-center gap-0.5 text-zinc-400 transition active:scale-95">
    <span class="text-xl leading-none">📊</span>
    <span class="text-[10px] font-semibold leading-none">Dados</span>
  </button>

  <!-- Mais (opens drawer) -->
  <button onclick="toggleMoreDrawer()"
          id="bnav-mais-btn"
          class="bnav-btn flex-1 flex flex-col items-center justify-center gap-0.5 text-zinc-400 transition active:scale-95">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
    </svg>
    <span class="text-[10px] font-semibold leading-none">Mais</span>
  </button>
</nav>

<!-- More Drawer Backdrop -->
<div id="more-drawer-backdrop"
     onclick="closeMoreDrawer()"
     style="display:none;position:fixed;inset:0;z-index:190;background:rgba(0,0,0,0.65);pointer-events:none;"></div>

<!-- More Drawer (slide-up panel) -->
<div id="more-drawer"
     class="bg-zinc-900 border-t border-white/10 rounded-t-2xl overflow-y-auto"
     style="display:block;position:fixed;bottom:64px;left:0;right:0;z-index:200;max-height:72vh;transform:translateY(110%);transition:transform 300ms cubic-bezier(0.32,0.72,0,1);padding-bottom:env(safe-area-inset-bottom);">

  <!-- Drawer Handle -->
  <div class="sticky top-0 bg-zinc-900 pt-3 pb-2 px-4 flex items-center justify-between border-b border-white/5 z-10">
    <div class="w-10 h-1 bg-zinc-600 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2"></div>
    <span class="text-sm font-bold text-zinc-300 mt-2">Todas as Ferramentas</span>
    <button onclick="closeMoreDrawer()" class="text-zinc-500 hover:text-white transition mt-1">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>
  </div>

  <!-- Tool Grid -->
  <div class="grid grid-cols-3 gap-2 p-4">
    <?php foreach ($nav as [$id, $icon, $label, $color, $extra]):
      $drawerColor = match($color) {
        'red'    => 'border-red-500/20 text-red-400',
        'blue'   => 'border-blue-500/20 text-blue-400',
        'amber'  => 'border-amber-500/20 text-amber-400',
        'violet' => 'border-violet-500/20 text-violet-400',
        default  => 'border-zinc-700 text-zinc-300',
      };
    ?>
    <button onclick="closeMoreDrawer();window.customSwitchTab('<?= $id ?>');<?= $extra ?>"
            class="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-zinc-800/60 border <?= $drawerColor ?> active:scale-95 transition">
      <span class="text-2xl leading-none"><?= $icon ?></span>
      <span class="text-[10px] font-semibold text-center leading-tight"><?= $label ?></span>
    </button>
    <?php endforeach; ?>
    <!-- Wiki & Game -->
    <a href="/transparencia/wiki/"
       class="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-amber-900/20 border border-amber-500/20 active:scale-95 transition">
      <span class="text-2xl leading-none">📖</span>
      <span class="text-[10px] font-semibold text-amber-300 text-center leading-tight">Wiki Política</span>
    </a>
    <a href="/transparencia/jogo/"
       class="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-violet-900/20 border border-violet-500/20 active:scale-95 transition">
      <span class="text-2xl leading-none">🎮</span>
      <span class="text-[10px] font-semibold text-violet-300 text-center leading-tight">DepuMon GO</span>
    </a>
    <a href="/transparencia/ranking/"
       class="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/40 active:scale-95 transition">
      <span class="text-2xl leading-none">🏆</span>
      <span class="text-[10px] font-semibold text-zinc-300 text-center leading-tight">Ranking</span>
    </a>
  </div>
</div>

<!-- Back to Top Button -->
<button id="backToTopBtn" onclick="scrollToTop()"
        class="fixed bottom-[128px] right-4 lg:bottom-24 lg:right-6 z-[95] flex h-11 w-11 items-center justify-center
               rounded-full bg-violet-600/80 text-white shadow-lg backdrop-blur-sm
               transition-all duration-300 opacity-0 pointer-events-none
               hover:bg-violet-500 hover:scale-110 focus:outline-none">
  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
  </svg>
</button>

<?php require_once 'views/partials/modals.php'; ?>

<?php if (!$is_logged_in): ?>
<!-- ── Banner Sticky Cross-promo (não logado) ──────────────────────────── -->
<div id="hz-promo-banner"
     class="fixed bottom-16 lg:bottom-0 left-0 right-0 z-[55] transition-transform duration-500"
     style="display:none;">
  <div class="bg-zinc-950/95 backdrop-blur border-t border-violet-500/20 px-4 py-2.5 flex items-center gap-3">
    <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-sm flex-shrink-0">🗣️</div>
    <p class="text-xs text-zinc-400 flex-1 leading-tight hidden sm:block">
      <strong class="text-white">Hyper Z</strong> — Debata as pautas deste portal com outros brasileiros. Rede social brasileira, gratuita e sem algoritmos.
    </p>
    <p class="text-xs text-zinc-400 flex-1 leading-tight sm:hidden">
      Debata essas pautas na <strong class="text-white">rede Hyper Z</strong> — grátis.
    </p>
    <div class="flex items-center gap-2 flex-shrink-0">
      <a href="/cadastrar"
         class="bg-violet-600 hover:bg-violet-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition whitespace-nowrap">
        Criar conta
      </a>
      <button onclick="dismissPromoBanner()"
              class="text-zinc-600 hover:text-zinc-400 transition p-1 flex-shrink-0" aria-label="Fechar">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  </div>
</div>
<script>
  (function() {
    if (localStorage.getItem('hz_promo_dismissed')) return;
    setTimeout(function() {
      var b = document.getElementById('hz-promo-banner');
      if (b) b.style.display = 'block';
    }, 8000);
  })();
  function dismissPromoBanner() {
    var b = document.getElementById('hz-promo-banner');
    if (b) { b.style.transform = 'translateY(100%)'; setTimeout(function(){ b.style.display='none'; }, 500); }
    localStorage.setItem('hz_promo_dismissed', '1');
  }
</script>
<?php endif; ?>
<!-- ── /Banner Sticky ───────────────────────────────────────────────────── -->

<!-- Modal de boas-vindas para novos usuários (Etapa 4) -->
<?php require_once 'views/partials/onboarding_modal.php'; ?>

<?php require_once 'views/partials/scripts.php'; ?>
