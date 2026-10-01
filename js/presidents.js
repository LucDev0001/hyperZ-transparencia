window.renderPresidents = function() {
    const grid = document.getElementById('presidentsGrid');
    if (!grid) {
        console.error("Container #presidentsGrid não encontrado!");
        return;
    }
    
    const data = [
        { name: "Luiz Inácio Lula da Silva", period: "2023 - Atual", party: "PT", vice: "Geraldo Alckmin", status: "Ativo", assets: "R$ 7,4M" },
        { name: "Jair Bolsonaro", period: "2019 - 2022", party: "PL", vice: "Hamilton Mourão", status: "Ex-Presidente", assets: "R$ 2,3M" },
        { name: "Michel Temer", period: "2016 - 2018", party: "MDB", vice: "N/A", status: "Ex-Presidente", assets: "Não declarado" },
        { name: "Dilma Rousseff", period: "2011 - 2016", party: "PT", vice: "Michel Temer", status: "Ex-Presidente", assets: "R$ 1,7M" }
    ];

    grid.innerHTML = data.map(p => `
        <div class="glass-panel p-5 rounded-2xl border border-white/5 hover:border-violet-500/30 transition fade-in">
            <div class="flex justify-between items-start mb-4">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${p.status === 'Ativo' ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-500'}">${p.status}</span>
                <span class="text-xs text-zinc-500 font-mono">${p.period}</span>
            </div>
            <h3 class="text-lg font-bold text-white mb-1">${p.name}</h3>
            <p class="text-sm text-violet-400 font-semibold mb-2">${p.party}</p>
            <div class="flex flex-col gap-1">
                <div class="text-[10px] text-zinc-500 uppercase flex justify-between"><span>Vice:</span> <span class="text-zinc-300">${p.vice}</span></div>
                <div class="text-[10px] text-zinc-500 uppercase flex justify-between"><span>Patrimônio:</span> <span class="text-zinc-300">${p.assets}</span></div>
            </div>
        </div>
    `).join('');
};

// Executa ao carregar e define como global para chamadas manuais
document.addEventListener('DOMContentLoaded', window.renderPresidents);
