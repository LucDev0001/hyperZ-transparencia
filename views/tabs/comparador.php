<!-- Conteúdo: Comparador (Novo) -->
<div id="content-comparador" class="hidden animate-fade-in">
    <div class="glass-panel p-6 rounded-2xl mb-6">
        <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-white mb-2">Comparador Parlamentar</h2>
            <p class="text-zinc-400">Coloque dois deputados lado a lado para analisar gastos e desempenho.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
            <!-- VS Badge -->
            <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-12 h-12 bg-zinc-900 rounded-full border-2 border-zinc-700 text-zinc-500 font-black text-xl shadow-xl">
                VS
            </div>

            <!-- Slot 1 -->
            <div class="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div class="relative mb-4">
                    <input type="text" id="comp-search-1" onkeyup="searchDeputyForComparison(1)" placeholder="Buscar Deputado 1..." class="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none">
                    <div id="comp-results-1" class="absolute top-full left-0 right-0 bg-zinc-800 border border-zinc-700 rounded-b-lg shadow-xl z-20 hidden max-h-60 overflow-y-auto"></div>
                </div>
                <div id="comp-card-1">
                    <div class="flex flex-col items-center justify-center h-64 text-zinc-500 border-2 border-dashed border-zinc-700 rounded-xl">
                        <div class="text-4xl mb-2">👤</div>
                        <p class="text-sm">Selecione um deputado</p>
                    </div>
                </div>
            </div>

            <!-- Slot 2 -->
            <div class="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div class="relative mb-4">
                    <input type="text" id="comp-search-2" onkeyup="searchDeputyForComparison(2)" placeholder="Buscar Deputado 2..." class="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:border-red-500 outline-none">
                    <div id="comp-results-2" class="absolute top-full left-0 right-0 bg-zinc-800 border border-zinc-700 rounded-b-lg shadow-xl z-20 hidden max-h-60 overflow-y-auto"></div>
                </div>
                <div id="comp-card-2">
                    <div class="flex flex-col items-center justify-center h-64 text-zinc-500 border-2 border-dashed border-zinc-700 rounded-xl">
                        <div class="text-4xl mb-2">👤</div>
                        <p class="text-sm">Selecione um deputado</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
