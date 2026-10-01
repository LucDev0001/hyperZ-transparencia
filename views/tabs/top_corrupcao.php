<!-- Conteúdo: Top Corrupção -->
<div id="content-top_corrupcao" class="hidden animate-fade-in pb-12">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h2 class="text-2xl font-black text-white">🏆 Top Corrupção</h2>
            <p class="text-zinc-400 text-sm mt-1">Ranking de deputados com maiores indícios de irregularidades, baseado em análise de dados públicos.</p>
        </div>
        <button onclick="HyperBot.runCorruptionRanking()" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-xl transition shadow-lg shadow-red-900/30 flex items-center gap-2">
            🤖 Gerar Ranking do Dia
        </button>
    </div>

    <div id="corruption-ranking-status" class="mb-4 text-center text-zinc-500"></div>
    <div id="corruption-ranking-results" class="space-y-3">
        <div class="text-center text-zinc-500 py-10">Clique em "Gerar Ranking" para que o HyperBot inicie a análise. <br>Ele irá varrer uma amostra de deputados e seus gastos em busca de anomalias.</div>
    </div>
</div>