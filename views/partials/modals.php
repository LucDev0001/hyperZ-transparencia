  <!-- President Details Modal -->
  <div id="presidentModal" class="fixed inset-0 bg-black/90 z-[100] hidden flex items-center justify-center p-4 backdrop-blur-md transition-opacity duration-300">
    <div class="glass-panel rounded-2xl w-full max-w-2xl p-6 relative shadow-2xl transform transition-all scale-100">
        <button onclick="document.getElementById('presidentModal').classList.add('hidden')" class="absolute top-4 right-4 text-zinc-400 hover:text-white z-10">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <div id="presidentContent" class="animate-fade-in"></div>
    </div>
  </div>

  <!-- Senator Details Modal -->
  <div id="senatorModal" class="fixed inset-0 bg-black/80 z-[75] hidden flex items-center justify-center p-4 backdrop-blur-sm">
    <div class="glass-panel rounded-3xl w-full max-w-4xl relative h-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
      <!-- Cabeçalho fixo -->
      <div class="flex items-center justify-end px-4 py-2 flex-shrink-0 border-b border-white/5">
        <button onclick="document.getElementById('senatorModal').classList.add('hidden')" class="text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700 rounded-full p-2 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      <!-- Área scrollável -->
      <div class="overflow-y-auto flex-1 p-6 md:p-8 custom-scrollbar">
        <div id="senatorContent" class="animate-fade-in"><!-- JS injected --></div>
      </div>
    </div>
  </div>

  <style>
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.02);
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(59, 130, 246, 0.5); /* blue-500 com opacidade */
    }
  </style>

  <!-- Deputy Details Modal -->
  <div
    id="deputyModal"
    onclick="if(event.target===this)this.classList.add('hidden')"
    class="fixed inset-0 bg-black/80 z-[70] hidden flex items-center justify-center p-4 backdrop-blur-sm">
    <div class="glass-panel rounded-2xl w-full max-w-4xl relative max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
      <!-- Cabeçalho fixo com botão fechar — nunca sai da tela ao rolar -->
      <div class="flex items-center justify-end px-4 pt-3 pb-2 flex-shrink-0 border-b border-zinc-800/60">
        <button
          onclick="document.getElementById('deputyModal').classList.add('hidden')"
          class="text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-full p-1.5 transition"
          title="Fechar">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <!-- Área scrollável -->
      <div class="overflow-y-auto flex-1 p-6">
        <div id="deputyContent" class="animate-fade-in">
          <!-- Content injected via JS -->
        </div>
      </div>
    </div>
  </div>

  <!-- Company Details Modal -->
  <div
    id="companyModal"
    class="fixed inset-0 bg-black/80 z-[80] hidden flex items-center justify-center p-4 backdrop-blur-sm">
    <div
      class="glass-panel rounded-2xl w-full max-w-3xl p-6 relative shadow-2xl">
      <button
        onclick="
            document.getElementById('companyModal').classList.add('hidden')
          "
        class="absolute top-4 right-4 text-zinc-400 hover:text-white z-10">
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
      <div id="companyContent" class="animate-fade-in"></div>
    </div>
  </div>

  <!-- Documents Modal -->
  <div
    id="documentsModal"
    class="fixed inset-0 bg-black/80 z-[90] hidden flex items-center justify-center sm:p-4 backdrop-blur-sm">
    <div
      class="glass-panel w-full h-full sm:h-auto sm:max-h-[85vh] sm:rounded-2xl sm:max-w-3xl p-4 sm:p-6 relative shadow-2xl flex flex-col">
      
      <div class="flex justify-between items-center mb-4 flex-shrink-0">
          <h3 class="text-xl font-bold text-white">Documentos da Emenda</h3>
          <button onclick="document.getElementById('documentsModal').classList.add('hidden')" class="text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-full p-1.5 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
      </div>
      
      <div id="documentsContent" class="space-y-2 overflow-y-auto flex-1 pr-2"></div>
    </div>
  </div>

  <!-- State Details Modal -->
  <div id="stateModal" class="fixed inset-0 bg-black/90 z-[100] hidden flex items-center justify-center p-4 backdrop-blur-md transition-opacity duration-300">
    <div class="glass-panel rounded-2xl w-full max-w-4xl p-6 relative shadow-2xl transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
        <button onclick="document.getElementById('stateModal').classList.add('hidden')" class="absolute top-4 right-4 text-zinc-400 hover:text-white z-10">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <div id="stateModalContent" class="animate-fade-in"></div>
    </div>
  </div>

  <!-- PVL Details Modal -->
  <div id="pvlModal" class="fixed inset-0 bg-black/90 z-[100] hidden flex items-center justify-center p-4 backdrop-blur-md transition-opacity duration-300">
      <div class="glass-panel rounded-2xl w-full max-w-3xl p-6 relative shadow-2xl transform transition-all scale-100 max-h-[90vh] flex flex-col">
          <div class="flex justify-between items-center mb-4 flex-shrink-0">
              <h3 class="text-xl font-bold text-white flex items-center gap-2">📄 Detalhes da Operação (PVL)</h3>
              <button onclick="document.getElementById('pvlModal').classList.add('hidden')" class="text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-full p-1.5 transition">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
          </div>
          <div id="pvlModalContent" class="overflow-y-auto pr-2 space-y-4">
              <!-- JS Injected -->
          </div>
      </div>
  </div>

  <!-- ══ Modal Mapa Mental (desktop) ════════════════════════════════════════ -->
  <div id="ng-modal" class="fixed inset-0 z-50 hidden" style="background:rgba(0,0,0,0.85);">
    <div class="absolute inset-4 lg:inset-8 bg-zinc-900 border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
      <!-- Modal header -->
      <div class="flex items-center gap-3 px-4 py-3 border-b border-white/10 flex-shrink-0">
        <span class="text-xl">🕸️</span>
        <span class="font-bold text-white flex-1">Radar de Conexões</span>
        <span id="ng-modal-status" class="text-xs text-zinc-500 flex-1 text-center"></span>
        <div class="flex gap-2">
          <button onclick="ngClear()" class="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-1.5 rounded-lg text-xs transition" title="Limpar grafo">🗑️ Limpar</button>
          <button onclick="ngExport()" class="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-1.5 rounded-lg text-xs transition" title="Exportar PNG">📷 Exportar</button>
          <button onclick="ngCloseModal()" class="bg-red-900/50 hover:bg-red-800 text-red-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition">✕ Fechar</button>
        </div>
      </div>
      <!-- Modal body: canvas + painel lateral -->
      <div class="flex flex-1 min-h-0 gap-0">
        <!-- Canvas vis-network -->
        <div id="ng-modal-canvas" class="flex-1 relative" style="min-width:0;"></div>
        <!-- Painel lateral -->
        <div id="ng-modal-panel" class="w-72 border-l border-white/10 p-4 overflow-y-auto flex-col gap-3 hidden">
          <div id="ng-modal-panel-content" class="text-sm text-zinc-400">Selecione um nó para ver detalhes.</div>
        </div>
      </div>
    </div>
  </div>
