<!-- Conteúdo: Imóveis Funcionais -->
<div id="content-imoveis" class="hidden animate-fade-in pb-12">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h2 class="text-2xl font-black text-white">🏢 Imóveis Funcionais</h2>
            <p class="text-zinc-400 text-sm mt-1">Consulte ocupantes e a situação dos apartamentos residenciais pertencentes à União em Brasília.</p>
        </div>
    </div>

    <div class="glass-panel p-6 rounded-2xl mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label class="text-xs font-bold text-zinc-500 uppercase">CPF do Ocupante</label>
                <input type="text" id="imoveis-cpf" placeholder="Apenas números..." class="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-2 mt-1 outline-none focus:border-violet-500">
            </div>
            <div>
                <label class="text-xs font-bold text-zinc-500 uppercase">Data Início Ocupação</label>
                <input type="date" id="imoveis-data-ini" class="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-2 mt-1 outline-none focus:border-violet-500">
            </div>
            <div class="flex items-end">
                <button onclick="searchPermissionarios()" class="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 rounded-xl transition">Buscar Ocupantes</button>
            </div>
        </div>
    </div>

    <div id="imoveis-stats" class="hidden mb-4"></div>
    <div id="imoveis-results" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
</div>