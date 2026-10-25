<body class="text-zinc-200 antialiased h-screen overflow-hidden flex flex-col">
  <!-- Background Ambient -->
  <div class="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
      <div class="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-violet-600/10 rounded-full blur-[120px]"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[120px]"></div>
  </div>

  <!-- Top Bar -->
  <header id="topbar" class="flex-shrink-0 h-14 flex items-center px-4 gap-3 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
<?php if ($is_logged_in): ?>
    <button onclick="window.location.href='<?php echo BASE_PATH; ?>/feed'"
      class="flex items-center gap-1.5 text-zinc-400 hover:text-white transition text-xs font-semibold flex-shrink-0 px-2.5 py-1.5 rounded-lg hover:bg-white/5">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
      <span class="hidden sm:inline">Feed</span>
    </button>
    <div class="w-px h-5 bg-white/10 flex-shrink-0"></div>
    <?php else: ?>
    <button onclick="window.location.href='<?php echo BASE_PATH; ?>/entrar'"
      class="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-3.5 py-1.5 rounded-lg font-semibold text-xs transition flex-shrink-0 shadow-sm shadow-violet-900/30">
      Entrar
    </button>
    <div class="w-px h-5 bg-white/10 flex-shrink-0"></div>
    <?php endif; ?>

    <div id="topbar-home-button-container" class="hidden animate-fade-in mr-1">
        <button onclick="window.customSwitchTab('home')" class="flex items-center gap-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white transition text-xs font-medium flex-shrink-0 px-2.5 py-1.5 rounded-lg">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-7-4h10"></path></svg>
            <span>Início</span>
        </button>
    </div>

    <div id="topbar-default-content" class="flex items-center gap-2.5 min-w-0 cursor-pointer" onclick="window.customSwitchTab('home')">
      <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-violet-900/30 border border-white/10">
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
      </div>
      <div class="flex items-baseline gap-1.5 truncate">
        <span class="font-black text-white text-sm sm:text-base tracking-tight">Transparência</span>
        <button type="button" onclick="event.stopPropagation(); if(window.HzOnboarding) window.HzOnboarding.abrir();" title="Ver novidades do Portal 2.0" class="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/30 hidden lg:inline-flex items-center gap-1.5 transition cursor-pointer">
          <span class="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></span>
          <span>v2.0 Novidades</span>
        </button>
      </div>
    </div>

    <!-- Barra de Busca Global / Command Palette Trigger (Centro / Flex) -->
    <div class="flex-1 max-w-md mx-auto hidden sm:block">
      <button onclick="window.openCommandPalette()"
              class="w-full flex items-center justify-between px-3 py-1.5 text-xs text-zinc-400 bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/10 hover:border-violet-500/40 rounded-xl transition shadow-inner group">
        <div class="flex items-center gap-2 truncate">
          <svg class="w-3.5 h-3.5 text-zinc-500 group-hover:text-violet-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
          </svg>
          <span class="truncate">Buscar ferramenta, político ou órgão...</span>
        </div>
        <kbd class="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700/80 rounded shadow-xs">
          Ctrl K
        </kbd>
      </button>
    </div>

    <div class="flex-1 sm:hidden"></div>

    <!-- Status APIs Federais -->
    <div class="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold" title="APIs da Câmara, Senado e CGU sincronizadas">
      <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
      <span>Sistemas Online</span>
    </div>

    <!-- Contador de online -->
    <div class="flex-shrink-0 flex items-center gap-1.5 text-xs text-zinc-400 px-2 py-1 rounded-lg bg-zinc-900/60 border border-white/5" title="Cidadãos auditando agora">
      <span class="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block"></span>
      <span id="transparency-online" class="font-semibold text-zinc-300">...</span>
      <span class="hidden md:inline text-[11px] text-zinc-500">ao vivo</span>
    </div>

    <!-- Botão mobile de busca -->
    <button id="topbar-search-btn"
            onclick="window.openCommandPalette()"
            class="sm:hidden flex-shrink-0 p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition"
            title="Abrir busca (Ctrl+K)">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
      </svg>
    </button>

    <a href="guide.php" class="flex-shrink-0 text-zinc-400 hover:text-white transition text-xs font-semibold flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/5">
      <svg class="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
      <span class="hidden sm:inline">Guia</span>
    </a>
  </header>
