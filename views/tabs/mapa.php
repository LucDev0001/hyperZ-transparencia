<!-- Conteúdo: Mapa de Gastos (Novo) -->
<div id="content-mapa" class="hidden animate-fade-in">
    <div class="glass-panel p-6 rounded-2xl">
        <div class="flex justify-between items-center mb-4">
            <div>
                <h3 class="text-xl font-bold text-white">Distribuição Geográfica de Recursos</h3>
                <p class="text-xs text-zinc-400">Visualize o fluxo de verbas federais e custos políticos por estado.</p>
            </div>
            <div class="flex items-center gap-4">
                <div class="relative hidden md:block">
                    <input type="text" id="mapSearch" placeholder="Buscar cidade ou projeto..." class="bg-zinc-900/50 border border-white/10 rounded-lg p-2 pl-8 text-white text-xs outline-none focus:border-violet-500 w-64" onkeyup="if(event.key === 'Enter') searchMap(this.value)">
                    <svg class="w-4 h-4 text-zinc-500 absolute left-2 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <select id="mapFilter" onchange="updateMapFilter(this.value)" class="bg-zinc-900/50 border border-white/10 rounded-lg p-2 text-white text-xs outline-none focus:border-violet-500">
                    <option value="">Todas as Áreas</option>
                    <option value="10">Saúde</option>
                    <option value="12">Educação</option>
                    <option value="06">Segurança Pública</option>
                    <option value="08">Assistência Social</option>
                </select>
                <label class="inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="toggleFlow" class="sr-only peer" onchange="toggleMoneyFlow()">
                    <div class="relative w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                    <span class="ms-3 text-sm font-medium text-zinc-300 hidden sm:block">Fluxo</span>
                </label>
            </div>
        </div>
        <div id="spendingMap" style="height:clamp(280px,45vh,500px)" class="w-full rounded-xl z-0 bg-zinc-900/50 border border-white/10"></div>
        <p class="text-center text-zinc-500 text-sm mt-4">Visualização interativa dos gastos por estado. Clique em uma região para ver detalhes.</p>
        
        <!-- Timeline Slider -->
        <div class="mt-6 px-4 bg-zinc-900/30 p-4 rounded-xl border border-white/5">
            <label class="flex justify-between text-xs text-zinc-400 font-bold uppercase mb-2">
                <span>Evolução Temporal (Meses)</span>
                <span id="mapTimelineLabel" class="text-violet-400">Ano Completo</span>
            </label>
            <input type="range" id="mapTimeline" min="0" max="12" value="0" step="1" class="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-violet-600 hover:accent-violet-500 transition-all" oninput="filterMapByMonth(this.value)">
        </div>
    </div>
</div>
