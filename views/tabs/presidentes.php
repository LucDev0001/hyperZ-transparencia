<?php
$presidents = [
    [
        'name' => 'Luiz Inácio Lula da Silva', 'period' => '2023 - 2026', 'party' => 'PT', 'vice' => 'Geraldo Alckmin', 
        'status' => 'Ativo', 'assets' => 'R$ 7,4 Milhões', 'salary' => 'R$ 39.293,32', 
        'history' => '3º Mandato (Eleito em 2002, 2006 e 2022). Fundador do PT.',
        'pautas' => 'Fome Zero, PAC, Proteção da Amazônia, Política Externa Ativa.'
    ],
    [
        'name' => 'Jair Messias Bolsonaro', 'period' => '2019 - 2022', 'party' => 'PL', 'vice' => 'Hamilton Mourão', 
        'status' => 'Ex-Presidente', 'assets' => 'R$ 2,3 Milhões', 'salary' => 'R$ 30.934,70 (Aposentadoria)', 
        'history' => 'Ex-Capitão do Exército. Deputado Federal por 7 mandatos (1991-2018).',
        'pautas' => 'Liberdade Econômica, Pautas Conservadoras, Armamento, Privatizações.'
    ],
    [
        'name' => 'Michel Miguel Elias Temer', 'period' => '2016 - 2018', 'party' => 'MDB', 'vice' => 'N/A (Assumiu via Impeachment)', 
        'status' => 'Ex-Presidente', 'assets' => 'R$ 32,9 Milhões (2014)', 'salary' => 'R$ 35.000+ (Aposentadoria)', 
        'history' => 'Assumiu após impeachment de Dilma Rousseff. Ex-Presidente da Câmara.',
        'pautas' => 'Teto de Gastos, Reforma Trabalhista, Ponte para o Futuro.'
    ],
    [
        'name' => 'Dilma Vana Rousseff', 'period' => '2011 - 2016', 'party' => 'PT', 'vice' => 'Michel Temer', 
        'status' => 'Ex-Presidente', 'assets' => 'R$ 1,7 Milhão', 'salary' => 'U$ 190.000/ano (Banco do BRICS)', 
        'history' => 'Primeira mulher Presidente do Brasil. Ex-Ministra da Casa Civil.',
        'pautas' => 'PAC 2, Minha Casa Minha Vida, Comissão da Verdade.'
    ],
    [
        'name' => 'Fernando Henrique Cardoso', 'period' => '1995 - 2002', 'party' => 'PSDB', 'vice' => 'Marco Maciel', 
        'status' => 'Ex-Presidente', 'assets' => 'N/A', 'salary' => 'Aposentadoria Vitalícia', 
        'history' => 'Sociólogo. Mentor do Plano Real como Ministro da Fazenda.',
        'pautas' => 'Estabilidade Econômica, Privatizações, Lei de Responsabilidade Fiscal.'
    ]
];
?>
<div id="content-presidentes" class="hidden animate-fade-in space-y-6">
    <div class="glass-panel p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-black border border-white/5">
        <h2 class="text-2xl font-black text-white mb-1">Dossiê: Presidentes da República</h2>
        <p class="text-zinc-500 text-sm">Dados consolidados de mandatos, finanças e trajetória política.</p>
    </div>

    <div id="presidentsGrid" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <?php foreach ($presidents as $p): ?>
        <div class="glass-panel p-6 rounded-3xl border border-white/5 hover:border-violet-500/40 transition-all duration-500 group">
            <div class="flex justify-between items-start mb-6">
                <div class="flex flex-col">
                    <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter <?= $p['status'] === 'Ativo' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-zinc-800 text-zinc-500 border border-zinc-700' ?> w-fit mb-2"><?= $p['status'] ?></span>
                    <h3 class="text-xl font-black text-white group-hover:text-violet-300 transition-colors"><?= $p['name'] ?></h3>
                    <p class="text-sm text-violet-500 font-bold uppercase tracking-widest"><?= $p['party'] ?></p>
                </div>
                <div class="text-right">
                    <div class="text-[10px] text-zinc-600 font-bold uppercase">Período</div>
                    <div class="text-xs text-zinc-300 font-mono"><?= $p['period'] ?></div>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <div class="text-[9px] text-zinc-500 uppercase font-bold mb-1">Patrimônio Declarado</div>
                    <div class="text-sm font-bold text-emerald-400"><?= $p['assets'] ?></div>
                </div>
                <div class="bg-white/5 p-3 rounded-2xl border border-white/5">
                    <div class="text-[9px] text-zinc-500 uppercase font-bold mb-1">Subsídio/Remuneração</div>
                    <div class="text-sm font-bold text-blue-400"><?= $p['salary'] ?></div>
                </div>
            </div>

            <div class="space-y-4">
                <div>
                    <div class="text-[10px] text-zinc-600 uppercase font-bold mb-1 flex items-center gap-2">
                        <span class="w-1.5 h-1.5 bg-violet-500 rounded-full"></span> Trajetória & História
                    </div>
                    <p class="text-xs text-zinc-400 leading-relaxed"><?= $p['history'] ?></p>
                </div>
                <div>
                    <div class="text-[10px] text-zinc-600 uppercase font-bold mb-1 flex items-center gap-2">
                        <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Pautas de Governo
                    </div>
                    <p class="text-xs text-zinc-400 leading-relaxed"><?= $p['pautas'] ?></p>
                </div>
            </div>
            
            <div class="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                <span class="text-[10px] text-zinc-600 font-bold uppercase">Vice: <span class="text-zinc-400"><?= $p['vice'] ?></span></span>
                <button class="text-[10px] bg-violet-600/20 text-violet-400 px-3 py-1 rounded-lg font-bold border border-violet-600/30 hover:bg-violet-600 hover:text-white transition-all">Ver Detalhes ↗</button>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
</div>
