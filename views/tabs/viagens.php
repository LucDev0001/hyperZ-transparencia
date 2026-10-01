<!-- Conteúdo: Viagens a Serviço -->
<div id="content-viagens" class="hidden animate-fade-in pb-12">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h2 class="text-2xl font-black text-white">✈️ Viagens a Serviço</h2>
            <p class="text-zinc-400 text-sm mt-1">Diárias, passagens e despesas de autoridades federais — dados em tempo real do Portal da Transparência.</p>
        </div>
    </div>

    <div class="glass-panel p-6 rounded-2xl mb-6">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
                <label class="text-xs font-bold text-zinc-500 uppercase">Órgão Federal</label>
                <select id="viagem-orgao" class="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-3 py-2 mt-1 outline-none focus:border-violet-500 text-sm">
                    <option value="20000">Presidência da República</option>
                    <option value="22000">Min. Relações Exteriores</option>
                    <option value="25000">Min. da Educação</option>
                    <option value="30000">Min. da Justiça</option>
                    <option value="36000">Min. da Saúde</option>
                    <option value="39000">Min. do Planejamento</option>
                    <option value="52000">Min. da Defesa</option>
                    <option value="55000">Min. da Fazenda</option>
                    <option value="44000">Min. do Meio Ambiente</option>
                    <option value="26000">Min. da Ciência e Tecnologia</option>
                    <option value="54000">Min. da Infraestrutura</option>
                    <option value="33000">Min. da Economia / RFB</option>
                </select>
            </div>
            <div>
                <label class="text-xs font-bold text-zinc-500 uppercase">Saída De</label>
                <input type="date" id="viagem-data-ini" class="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-2 mt-1 outline-none focus:border-violet-500">
            </div>
            <div>
                <label class="text-xs font-bold text-zinc-500 uppercase">Saída Até</label>
                <input type="date" id="viagem-data-fim" class="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-2 mt-1 outline-none focus:border-violet-500">
            </div>
            <div>
                <label class="text-xs font-bold text-zinc-500 uppercase">Nome do Servidor</label>
                <input type="text" id="viagem-termo" placeholder="Ex: Silva" class="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-2 mt-1 outline-none focus:border-violet-500">
            </div>
            <div class="flex items-end">
                <button onclick="searchViagens()" class="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 rounded-xl transition flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    Pesquisar
                </button>
            </div>
        </div>
        <p class="text-zinc-600 text-[11px] mt-3">Fonte: Portal da Transparência — viagens por data de saída</p>
    </div>

    <div id="viagens-stats" class="hidden mb-4"></div>
    <div id="viagens-results" class="space-y-3">
        <div class="text-center text-zinc-600 py-10 text-sm">Selecione um órgão e período para buscar viagens.</div>
    </div>
</div>
