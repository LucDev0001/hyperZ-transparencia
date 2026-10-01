<!-- Conteúdo: Execução Orçamentária por Órgão -->
<div id="content-receitas" class="hidden animate-fade-in pb-12">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h2 class="text-2xl font-black text-white">📊 Execução Orçamentária</h2>
            <p class="text-zinc-400 text-sm mt-1">Despesas federais por órgão — dotação autorizada versus valor liquidado no exercício.</p>
        </div>
    </div>

    <div class="glass-panel p-6 rounded-2xl mb-6 border-t-4 border-t-emerald-500">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
                <label class="text-xs font-bold text-zinc-500 uppercase">Órgão Federal</label>
                <select id="receitas-orgao-select" class="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-3 py-2 mt-1 outline-none focus:border-emerald-500 text-sm">
                    <option value="36000" selected>Min. da Saúde</option>
                    <option value="20000">Presidência da República</option>
                    <option value="22000">Min. Relações Exteriores</option>
                    <option value="25000">Min. da Educação</option>
                    <option value="30000">Min. da Justiça</option>
                    <option value="39000">Min. do Planejamento</option>
                    <option value="52000">Min. da Defesa</option>
                    <option value="55000">Min. da Fazenda</option>
                    <option value="44000">Min. do Meio Ambiente</option>
                    <option value="26000">Min. da Ciência e Tecnologia</option>
                    <option value="33000">Min. da Economia / RFB</option>
                </select>
            </div>
            <div>
                <label class="text-xs font-bold text-zinc-500 uppercase">Ano de Referência</label>
                <input type="month" id="receitas-data-ini"
                       value="<?php echo date('Y-m'); ?>"
                       class="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-2 mt-1 outline-none focus:border-emerald-500">
            </div>
            <div>
                <label class="text-xs font-bold text-zinc-500 uppercase">Filtrar por Órgão</label>
                <input type="text" id="receitas-filtro-nome" placeholder="Ex: Educação, Saúde..." class="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-2 mt-1 outline-none focus:border-emerald-500">
            </div>
            <div class="flex items-end">
                <button onclick="searchReceitas()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl transition shadow-lg shadow-emerald-900/30">Buscar</button>
            </div>
        </div>
        <p class="text-zinc-600 text-[11px] mt-3">Fonte: Portal da Transparência — execução orçamentária federal por órgão (SIAFI)</p>
    </div>

    <div id="receitas-stats" class="hidden mb-4 p-3 bg-zinc-900/60 rounded-xl border border-zinc-700"></div>
    <div id="receitas-results" class="space-y-3">
        <div class="text-center text-zinc-600 py-10 text-sm">Selecione um órgão e clique em Buscar para ver a execução orçamentária.</div>
    </div>
</div>
