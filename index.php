<?php 
require_once 'views/partials/icons.php';
require_once 'views/partials/header.php'; 
require_once 'views/partials/topbar.php'; 

<<<<<<< HEAD
// 4 Modular SaaS Navigation Groups
$navGroups = [
  'parlamento' => [
    'title' => 'PARLAMENTO & VOTOS',
    'badge' => 'Congresso',
    'items' => [
      ['politicos',     'Deputados',         'user',        'violet', ''],
      ['senadores',     'Senadores',         'landmark',    'indigo', ''],
      ['apuracao',      'Eleições 2026',     'vote',        'red',    ''],
      ['presidentes',   'Presidentes',       'shield',      'amber',  ''],
      ['partidos',      'Partidos',          'flag',        'zinc',   ''],
      ['eleicoes',      'Dados TSE',         'archive',     'zinc',   ''],
    ]
  ],
  'investigacao' => [
    'title' => 'INVESTIGAÇÃO & IA',
    'badge' => 'Auditoria',
    'items' => [
      ['radar',         'Radar A-C',         'radar',       'red',    "if(typeof window.initRadarTab==='function')window.initRadarTab();"],
      ['risco',         'Análise de Risco',  'alert',       'red',    ''],
      ['top_corrupcao', 'Top Corrupção',     'trophy',      'red',    ''],
      ['rede',          'Radar Conexões',    'network',     'violet', ''],
      ['comparador',    'Comparador',        'scale',       'blue',   ''],
    ]
  ],
  'cofres' => [
    'title' => 'COFRES PÚBLICOS',
    'badge' => 'CGU/SIAFI',
    'items' => [
      ['orcamento',     'Orçamento Federal', 'coins',       'amber',  ''],
      ['gestao',        'Gestão & Finanças', 'chart-bar',   'emerald',''],
      ['licitacoes',    'Licitações',        'file-text',   'cyan',   ''],
      ['viagens',       'Viagens Oficiais',  'plane',       'sky',    ''],
      ['receitas',      'Exec. Orçamentária','receipt',     'zinc',   ''],
      ['imoveis',       'Imóveis Func.',     'building',    'zinc',   ''],
      ['servidores',    'Servidores',        'users',       'zinc',   ''],
      ['outros',        'Executivo & Mun.',  'layers',      'zinc',   ''],
    ]
  ],
  'comunidade' => [
    'title' => 'COMUNIDADE & CIDADÃO',
    'badge' => 'Civic Tech',
    'items' => [
      ['pautas_gz',     'Pautas GZ',         'handshake',   'emerald',''],
      ['noticias',      'Feed Notícias',     'newspaper',   'blue',   ''],
      ['mapa',          'Mapa de Gastos',    'map',         'amber',  ''],
    ]
  ]
=======
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
  ['apuracao',      '📊', 'Eleições 2026',       'red',    ''],
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
>>>>>>> 82a4ad26265e16bed46541c79c86c12fcac0d450
];

// Flat array for tabs loading & backward compatibility
$nav = [];
foreach ($navGroups as $grp) {
  foreach ($grp['items'] as $item) {
    // [id, iconKey, label, color, extra]
    $nav[] = [$item[0], $item[2], $item[1], $item[3], $item[4]];
  }
}
?>

<!-- App Shell -->
<div class="flex-1 flex flex-row overflow-hidden">

  <?php require_once 'views/partials/sidebar.php'; ?>

  <!-- Main Content Area -->
  <main class="flex-1 min-w-0 min-h-0 overflow-y-auto p-3 lg:p-8 pb-20 relative" id="main-content">

    <?php
      // Include all tab content panels
      foreach ($nav as [$id, $iconKey, $label, $color, $extra]) {
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
            bg-zinc-950/95 backdrop-blur-xl border-t border-white/10 shadow-2xl"
     style="padding-bottom:env(safe-area-inset-bottom)">

  <!-- Início -->
  <button onclick="window.customSwitchTab('home')"
          data-bnav="home"
          class="bnav-btn flex-1 flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-white transition active:scale-95">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-7-4h10"/>
    </svg>
    <span class="text-[10px] font-semibold leading-none">Início</span>
  </button>

  <!-- Políticos -->
  <button onclick="window.customSwitchTab('politicos')"
          data-bnav="politicos"
          class="bnav-btn flex-1 flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-violet-400 transition active:scale-95">
    <?= getSaaSIcon('user', 'w-5 h-5') ?>
    <span class="text-[10px] font-semibold leading-none">Políticos</span>
  </button>

  <!-- Investigar (Radar) -->
  <button onclick="window.customSwitchTab('radar');if(typeof window.initRadarTab==='function')window.initRadarTab();"
          data-bnav="radar"
          class="bnav-btn flex-1 flex flex-col items-center justify-center gap-1 text-red-400 hover:text-red-300 transition active:scale-95">
    <div class="relative">
      <?= getSaaSIcon('radar', 'w-5 h-5') ?>
      <span class="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
    </div>
    <span class="text-[10px] font-semibold leading-none">Investigar</span>
  </button>

  <!-- Dados (Gestão) -->
  <button onclick="window.customSwitchTab('gestao')"
          data-bnav="gestao"
          class="bnav-btn flex-1 flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-emerald-400 transition active:scale-95">
    <?= getSaaSIcon('chart-bar', 'w-5 h-5') ?>
    <span class="text-[10px] font-semibold leading-none">Dados</span>
  </button>

  <!-- Mais (opens drawer) -->
  <button onclick="toggleMoreDrawer()"
          id="bnav-mais-btn"
          class="bnav-btn flex-1 flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-white transition active:scale-95">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
    </svg>
    <span class="text-[10px] font-semibold leading-none">Mais</span>
  </button>
</nav>

<!-- More Drawer Backdrop -->
<div id="more-drawer-backdrop"
     onclick="closeMoreDrawer()"
     style="display:none;position:fixed;inset:0;z-index:190;background:rgba(0,0,0,0.75);backdrop-filter:blur(4px);pointer-events:none;"></div>

<!-- More Drawer (slide-up panel) -->
<div id="more-drawer"
     class="bg-zinc-950/95 border-t border-white/10 rounded-t-3xl overflow-y-auto shadow-2xl backdrop-blur-2xl"
     style="display:block;position:fixed;bottom:64px;left:0;right:0;z-index:200;max-height:82vh;transform:translateY(110%);transition:transform 300ms cubic-bezier(0.32,0.72,0,1);padding-bottom:calc(env(safe-area-inset-bottom) + 20px);">

  <!-- Drawer Handle & Header -->
  <div class="sticky top-0 bg-zinc-950/95 backdrop-blur-md pt-3 pb-3 px-5 flex items-center justify-between border-b border-white/10 z-10">
    <div class="w-12 h-1 bg-zinc-600 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2"></div>
    <div class="flex items-center gap-2 mt-2">
      <span class="text-sm font-bold text-white">Hub de Ferramentas</span>
      <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">23 Módulos</span>
    </div>
    <button onclick="closeMoreDrawer()" class="text-zinc-400 hover:text-white transition mt-2 p-1.5 rounded-xl hover:bg-white/10" title="Fechar">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>
  </div>

  <!-- Quick Search Bar inside Drawer -->
  <div class="px-4 pt-3 pb-1">
    <button onclick="closeMoreDrawer(); window.openCommandPalette();"
            class="w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-zinc-400 bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 hover:border-violet-500/40 rounded-xl transition shadow-inner">
      <span class="flex items-center gap-2 truncate">
        <svg class="w-3.5 h-3.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/></svg>
        <span class="truncate">Buscar ferramenta ou parlamentar...</span>
      </span>
      <kbd class="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[9px] border border-white/10 flex-shrink-0">Ctrl K</kbd>
    </button>
  </div>

  <!-- Categorized Tool Drawer -->
  <div class="p-4 space-y-6">
    <?php foreach ($navGroups as $grpKey => $grp): ?>
      <div>
        <div class="flex items-center justify-between mb-2 px-1">
          <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider"><?= $grp['title'] ?></span>
          <span class="text-[9px] font-mono text-zinc-600"><?= $grp['badge'] ?></span>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <?php foreach ($grp['items'] as [$id, $label, $iconKey, $color, $extra]): 
            $cardBorder = match($color) {
              'red'    => 'border-red-500/20 text-red-400 bg-red-950/20 hover:border-red-500/40',
              'blue'   => 'border-blue-500/20 text-blue-400 bg-blue-950/20 hover:border-blue-500/40',
              'amber'  => 'border-amber-500/20 text-amber-400 bg-amber-950/20 hover:border-amber-500/40',
              'violet' => 'border-violet-500/20 text-violet-400 bg-violet-950/20 hover:border-violet-500/40',
              'emerald'=> 'border-emerald-500/20 text-emerald-400 bg-emerald-950/20 hover:border-emerald-500/40',
              'cyan'   => 'border-cyan-500/20 text-cyan-400 bg-cyan-950/20 hover:border-cyan-500/40',
              'sky'    => 'border-sky-500/20 text-sky-400 bg-sky-950/20 hover:border-sky-500/40',
              default  => 'border-zinc-800 text-zinc-300 bg-zinc-800/40 hover:border-zinc-700',
            };
          ?>
          <button onclick="closeMoreDrawer();window.customSwitchTab('<?= $id ?>');<?= $extra ?>"
                  class="flex items-center gap-2.5 p-2.5 rounded-xl border <?= $cardBorder ?> active:scale-95 transition text-left">
            <div class="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 flex-shrink-0">
              <?= getSaaSIcon($iconKey, 'w-4 h-4') ?>
            </div>
            <span class="text-xs font-semibold truncate"><?= $label ?></span>
          </button>
          <?php endforeach; ?>
        </div>
      </div>
    <?php endforeach; ?>

    <!-- Extras Section -->
    <div class="pt-2 border-t border-white/5">
      <div class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 px-1">APLICATIVOS CIVIC TECH</div>
      <div class="grid grid-cols-3 gap-2">
        <a href="wiki.php"
           class="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-amber-300 active:scale-95 transition">
          <?= getSaaSIcon('book', 'w-5 h-5') ?>
          <span class="text-[10px] font-bold text-center leading-tight">Wiki Política</span>
        </a>
        <a href="game.php"
           class="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-violet-950/20 border border-violet-500/20 text-violet-300 active:scale-95 transition">
          <?= getSaaSIcon('game', 'w-5 h-5') ?>
          <span class="text-[10px] font-bold text-center leading-tight">DepuMon GO</span>
        </a>
        <a href="ranking.php"
           class="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-zinc-800/60 border border-zinc-700 text-zinc-300 active:scale-95 transition">
          <?= getSaaSIcon('award', 'w-5 h-5') ?>
          <span class="text-[10px] font-bold text-center leading-tight">Ranking</span>
        </a>
      </div>
    </div>
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
<?php require_once 'views/partials/command_palette.php'; ?>

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
      <a href="<?php echo BASE_PATH; ?>/cadastrar"
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
