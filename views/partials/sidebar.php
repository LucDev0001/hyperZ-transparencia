<!-- Desktop Sidebar (visible lg+) — agrupada por categoria (Etapa 3) -->
<aside id="sidebar" class="hidden lg:flex flex-col w-44 xl:w-52 min-h-0 overflow-y-auto flex-shrink-0 p-2 border-r border-white/10"
       style="scrollbar-width:thin;scrollbar-color:#3f3f46 transparent;">
  <nav class="flex flex-col gap-0.5">
<?php
// Mapa de grupos: cada chave é o tabId que INICIA o grupo
$sidebarGroups = [
  'politicos'  => 'POLÍTICOS',
  'radar'      => 'INVESTIGAÇÃO',
  'orcamento'  => 'DINHEIRO PÚBLICO',
  'mapa'       => 'TERRITÓRIO',
  'servidores' => 'PESSOAS',
  'eleicoes'   => 'MAIS',
];

foreach ($nav as [$id, $icon, $label, $color, $extra]):
  // Inserir separador e título de grupo quando necessário
  if (isset($sidebarGroups[$id])):
    $isFirst = ($id === 'politicos');
?>
    <?php if (!$isFirst): ?>
    <div class="mt-1.5 mb-0.5 border-t border-white/5"></div>
    <?php endif; ?>
    <div class="px-2 pt-1 pb-0.5 text-[9px] font-bold text-zinc-600 uppercase tracking-widest select-none">
      <?= $sidebarGroups[$id] ?>
    </div>
<?php
  endif;

  $colorClass = match($color) {
    'red'    => 'text-red-400 hover:bg-red-900/20 hover:text-red-300',
    'blue'   => 'text-blue-400 hover:bg-blue-900/20 hover:text-blue-300',
    'amber'  => 'text-amber-400 hover:bg-amber-900/20 hover:text-amber-300',
    'violet' => 'text-violet-400 hover:bg-violet-900/20 hover:text-violet-300',
    default  => 'text-zinc-400 hover:bg-white/5 hover:text-white',
  };
?>
    <button onclick="window.customSwitchTab('<?= $id ?>');<?= $extra ?>" id="tab-<?= $id ?>"
      class="w-full text-left px-3 py-2 rounded-xl <?= $colorClass ?> transition flex items-center gap-2 text-sm font-medium whitespace-nowrap border border-transparent">
      <span class="text-base leading-none flex-shrink-0"><?= $icon ?></span>
      <span class="truncate"><?= $label ?></span>
    </button>
<?php endforeach; ?>

    <div class="mt-1.5 mb-0.5 border-t border-white/5"></div>
    <div class="px-2 pt-1 pb-0.5 text-[9px] font-bold text-zinc-600 uppercase tracking-widest select-none">EXTRAS</div>
    <a href="wiki.php"
      class="w-full text-left px-3 py-2 rounded-xl text-amber-300 border flex items-center gap-2 text-sm font-bold whitespace-nowrap transition"
      style="background:linear-gradient(135deg,rgba(245,158,11,.18),rgba(234,179,8,.08));border-color:rgba(245,158,11,.4);">
      <span class="text-base leading-none">📖</span>
      <span class="truncate">Wiki Política</span>
      <span class="ml-auto text-[9px] bg-amber-500/30 text-amber-200 px-1.5 py-0.5 rounded-full font-semibold border border-amber-500/40 flex-shrink-0">NOVO</span>
    </a>
    <a href="game.php"
      class="w-full text-left px-3 py-2 rounded-xl bg-gradient-to-r from-violet-900/40 to-fuchsia-900/40 text-violet-300 border border-violet-500/20 flex items-center gap-2 text-sm font-bold whitespace-nowrap hover:border-violet-500/50 transition group">
      <span class="group-hover:animate-bounce text-base leading-none">🎮</span>
      <span class="truncate">DepuMon GO</span>
    </a>
    <a href="ranking.php"
      class="w-full text-left px-3 py-2 rounded-xl text-zinc-400 hover:bg-white/5 flex items-center gap-2 text-sm font-medium whitespace-nowrap transition">
      <span class="text-base leading-none">🏆</span>
      <span class="truncate">Ranking</span>
    </a>

    <!-- ── Slot de anúncio sidebar ── -->
    <div class="mt-3 border-t border-white/5 pt-3" id="sidebar-ad-wrap" style="display:none">
      <div class="text-[8px] text-zinc-700 uppercase tracking-widest mb-1.5 px-1">Patrocinado</div>
      <div id="sidebar-ad-slot"></div>
    </div>

  </nav>
</aside>
