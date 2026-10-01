<!-- Conteúdo: Servidores -->
<div id="content-servidores" class="hidden animate-fade-in">
  <div class="glass-panel p-6 rounded-xl mb-6">
    <div class="flex items-center gap-3 mb-4">
      <div class="text-3xl">👤</div>
      <div>
        <h3 class="text-xl font-bold text-white">
          Consulta de Servidores Públicos Federais
        </h3>
        <p class="text-zinc-400 text-sm">
          Busque por nome para ver informações de cadastro e remuneração
          (Poder Executivo).
        </p>
      </div>
    </div>
    <div class="flex gap-2">
      <input
        type="text"
        id="inp-server-name"
        placeholder="Digite o nome completo ou parcial do servidor..."
        class="w-full bg-zinc-900/50 border border-white/10 rounded-lg p-3 text-white focus:border-violet-500 outline-none"
        onkeydown="if (event.key === 'Enter') searchServers();" />
      <button
        onclick="searchServers()"
        class="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2">
        🔍 Buscar
      </button>
    </div>
  </div>
  <div id="servers-results" class="space-y-3">
    <!-- Results injected here -->
  </div>
</div>
