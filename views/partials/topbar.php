<body class="text-zinc-200 antialiased h-screen overflow-hidden flex flex-col">
  <!-- Background Ambient -->
  <div class="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
      <div class="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-violet-600/10 rounded-full blur-[120px]"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[120px]"></div>
  </div>

  <!-- Top Bar -->
  <header id="topbar" class="flex-shrink-0 h-14 flex items-center px-4 gap-3 z-50">
<?php if ($is_logged_in): ?>
    <button onclick="window.location.href='/feed'"
      class="flex items-center gap-1.5 text-zinc-400 hover:text-white transition text-sm font-semibold flex-shrink-0">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
      <span class="hidden sm:inline">Feed</span>
    </button>
    <div class="w-px h-5 bg-white/10 flex-shrink-0"></div>
    <?php else: ?>
    <button onclick="window.location.href='/entrar'"
      class="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-1.5 rounded-full font-bold text-sm transition flex-shrink-0">
      Acessar
    </button>
    <div class="w-px h-5 bg-white/10 flex-shrink-0"></div>
    <?php endif; ?>
    <div id="topbar-home-button-container" class="hidden animate-fade-in mr-2">
        <button onclick="window.customSwitchTab('home')" class="flex items-center gap-2 bg-zinc-800/60 hover:bg-zinc-700/80 border border-zinc-700 text-zinc-300 hover:text-white transition text-sm font-semibold flex-shrink-0 px-3 py-1.5 rounded-full">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-7-4h10"></path></svg>
            <span>Início</span>
        </button>
    </div>
    <div id="topbar-default-content" class="flex items-center gap-2 min-w-0">
      <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-violet-900/40">
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </div>
      <span class="font-bold text-white text-sm sm:text-base truncate">Portal da Transparência</span>
      <span class="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 font-bold text-sm sm:text-base hidden sm:inline">Hyper Z</span>
    </div>
    <div class="flex-1"></div>
    <!-- Contador de online -->
    <div class="flex-shrink-0 flex items-center gap-1.5 text-xs text-zinc-500 mr-1" title="Pessoas vendo esta página agora">
      <span class="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block"></span>
      <span id="transparency-online">...</span>
      <span class="hidden sm:inline">online</span>
    </div>
    <!-- Botão busca rápida: leva para a home e foca o campo de pesquisa -->
    <button id="topbar-search-btn"
            onclick="if(typeof window.customSwitchTab==='function'){window.customSwitchTab('home');}setTimeout(function(){var i=document.getElementById('globalSearchInput');if(i){i.focus();i.scrollIntoView({behavior:'smooth',block:'center'});}},200);"
            class="flex-shrink-0 text-zinc-400 hover:text-white transition flex items-center gap-1.5"
            title="Pesquisar no portal">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
      </svg>
      <span class="hidden sm:inline text-sm font-semibold">Buscar</span>
    </button>
    <a href="/transparencia/guia/" class="flex-shrink-0 text-zinc-400 hover:text-white transition text-sm font-semibold flex items-center gap-1.5">
      📘 <span class="hidden sm:inline">Guia</span>
    </a>
  </header>
