<!-- Desktop Sidebar (visible lg+) — 4 Módulos SaaS Modernos -->
<aside id="sidebar" class="hidden lg:flex flex-col w-52 xl:w-60 min-h-0 overflow-y-auto flex-shrink-0 p-2.5 border-r border-white/5 bg-zinc-950/60 backdrop-blur-xl"
       style="scrollbar-width:thin;scrollbar-color:#27272a transparent;">
  <nav class="flex flex-col gap-3">

<?php foreach ($navGroups as $grpKey => $grp): ?>
    <div>
      <div class="px-2.5 pt-2 pb-1 flex items-center justify-between select-none">
        <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider"><?= $grp['title'] ?></span>
        <span class="text-[9px] font-mono text-zinc-600 px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/5"><?= $grp['badge'] ?></span>
      </div>
      <div class="flex flex-col gap-0.5 mt-0.5">
        <?php foreach ($grp['items'] as [$id, $label, $iconKey, $color, $extra]): 
          $activeAccent = match($color) {
            'red'    => 'hover:border-red-500/20 hover:text-red-300',
            'blue'   => 'hover:border-blue-500/20 hover:text-blue-300',
            'amber'  => 'hover:border-amber-500/20 hover:text-amber-300',
            'violet' => 'hover:border-violet-500/20 hover:text-violet-300',
            'emerald'=> 'hover:border-emerald-500/20 hover:text-emerald-300',
            default  => 'hover:border-white/10 hover:text-white',
          };
        ?>
        <button onclick="window.customSwitchTab('<?= $id ?>');<?= $extra ?>" id="tab-<?= $id ?>"
          class="group w-full text-left px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-2.5 text-xs font-medium text-zinc-400 hover:bg-white/[0.04] border border-transparent <?= $activeAccent ?>">
          <div class="sidebar-icon-box w-6 h-6 rounded-lg flex items-center justify-center bg-white/[0.04] text-zinc-400 group-hover:text-white transition flex-shrink-0 border border-white/5">
            <?= getSaaSIcon($iconKey, 'w-3.5 h-3.5') ?>
          </div>
          <span class="truncate"><?= $label ?></span>
          <?php if ($id === 'radar'): ?>
            <span class="ml-auto w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" title="Auditoria Ativa"></span>
          <?php elseif ($id === 'apuracao'): ?>
            <span class="ml-auto text-[9px] font-mono text-red-400 bg-red-950/50 px-1.5 py-0.2 rounded border border-red-500/30 flex-shrink-0">2026</span>
          <?php endif; ?>
        </button>
        <?php endforeach; ?>
      </div>
    </div>
<?php endforeach; ?>

    <!-- ── EXTRAS & CIVIC APPS ── -->
    <div class="pt-2 border-t border-white/5">
      <div class="px-2.5 pb-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider select-none">
        EXTRAS CIVIC TECH
      </div>
      <div class="flex flex-col gap-1 mt-0.5">
        <a href="wiki.php"
          class="w-full text-left px-2.5 py-1.5 rounded-xl text-amber-300 border flex items-center gap-2.5 text-xs font-semibold whitespace-nowrap transition hover:scale-[1.01]"
          style="background:linear-gradient(135deg,rgba(245,158,11,.12),rgba(234,179,8,.04));border-color:rgba(245,158,11,.3);">
          <div class="w-6 h-6 rounded-lg flex items-center justify-center bg-amber-500/20 text-amber-300 flex-shrink-0">
            <?= getSaaSIcon('book', 'w-3.5 h-3.5') ?>
          </div>
          <span class="truncate">Wiki Política</span>
          <span class="ml-auto text-[9px] bg-amber-500/30 text-amber-200 px-1.5 py-0.2 rounded-full font-bold border border-amber-500/40 flex-shrink-0">IA</span>
        </a>
        <a href="game.php"
          class="w-full text-left px-2.5 py-1.5 rounded-xl text-violet-300 border border-violet-500/20 flex items-center gap-2.5 text-xs font-semibold whitespace-nowrap hover:border-violet-500/40 transition hover:scale-[1.01]"
          style="background:linear-gradient(135deg,rgba(139,92,246,.12),rgba(168,85,247,.04));">
          <div class="w-6 h-6 rounded-lg flex items-center justify-center bg-violet-500/20 text-violet-300 flex-shrink-0">
            <?= getSaaSIcon('game', 'w-3.5 h-3.5') ?>
          </div>
          <span class="truncate">DepuMon GO</span>
          <span class="ml-auto text-[9px] bg-violet-500/30 text-violet-200 px-1.5 py-0.2 rounded-full font-bold border border-violet-500/40 flex-shrink-0">GAME</span>
        </a>
        <a href="ranking.php"
          class="w-full text-left px-2.5 py-1.5 rounded-xl text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10 flex items-center gap-2.5 text-xs font-medium whitespace-nowrap transition">
          <div class="w-6 h-6 rounded-lg flex items-center justify-center bg-white/5 text-zinc-400 flex-shrink-0 border border-white/5">
            <?= getSaaSIcon('award', 'w-3.5 h-3.5') ?>
          </div>
          <span class="truncate">Ranking Cidadão</span>
        </a>
      </div>
    </div>

    <!-- ── Slot de anúncio sidebar ── -->
    <div class="mt-2 border-t border-white/5 pt-2" id="sidebar-ad-wrap" style="display:none">
      <div class="text-[8px] text-zinc-700 uppercase tracking-widest mb-1 px-1">Patrocinado</div>
      <div id="sidebar-ad-slot"></div>
    </div>

  </nav>
</aside>
