// /transparency/js/presidents.js — Dossiê de Presidentes
window.openPresidentDetails = function(p) {
    const modal = document.getElementById('presidentModal');
    const content = document.getElementById('presidentContent');
    if (!modal || !content) return;

    content.innerHTML = `
        <div class="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-3xl shadow-lg shadow-violet-900/30">
                🇧🇷
            </div>
            <div>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${p.status === 'Ativo' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}">${p.status}</span>
                <h3 class="text-2xl font-black text-white mt-1">${p.name}</h3>
                <p class="text-xs text-violet-400 font-bold uppercase tracking-widest">${p.party} · Mandato: ${p.period}</p>
            </div>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div class="bg-zinc-900/80 p-4 rounded-xl border border-white/5">
                <span class="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Patrimônio Declarado</span>
                <span class="text-lg font-black text-emerald-400">${p.assets}</span>
            </div>
            <div class="bg-zinc-900/80 p-4 rounded-xl border border-white/5">
                <span class="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Subsídio / Vencimentos</span>
                <span class="text-lg font-black text-blue-400">${p.salary}</span>
            </div>
        </div>

        <div class="space-y-4">
            <div class="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-violet-500"></span> Trajetória Política
                </h4>
                <p class="text-sm text-zinc-300 leading-relaxed">${p.history}</p>
            </div>
            <div class="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Principais Pautas e Legado
                </h4>
                <p class="text-sm text-zinc-300 leading-relaxed">${p.pautas}</p>
            </div>
            <div class="text-xs text-zinc-500 flex justify-between items-center px-1">
                <span>Vice-Presidente: <strong class="text-zinc-300">${p.vice}</strong></span>
                <span>Fonte: TSE / Dados Consolidados</span>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
};

window.loadPresidents = function() {
    // Mantém a renderização PHP já presente no DOM sem sobrescrever
};
