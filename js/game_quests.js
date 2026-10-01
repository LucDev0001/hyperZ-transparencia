// transparency/js/game_quests.js

// ── Streak tracking ────────────────────────────────────────────────────────────
function _getQuestStreak() {
    const data = JSON.parse(localStorage.getItem('questStreak') || '{"count":0,"lastDate":""}');
    const today = new Date().toDateString();
    if (data.lastDate === today) return data.count;
    // Check if yesterday was completed
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (data.lastDate === yesterday) return data.count; // streak alive, not yet incremented today
    return 0; // streak broken
}

function _incrementStreak() {
    const today = new Date().toDateString();
    const data = JSON.parse(localStorage.getItem('questStreak') || '{"count":0,"lastDate":""}');
    if (data.lastDate === today) return data.count; // already incremented today
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const newCount = data.lastDate === yesterday ? data.count + 1 : 1;
    localStorage.setItem('questStreak', JSON.stringify({ count: newCount, lastDate: today }));
    return newCount;
}

// ── Dynamic quests based on player level ──────────────────────────────────────
function _getDynamicQuests() {
    const xp = window.DepuMon?.xp || 0;
    const level = Math.floor(xp / 1000) + 1;
    // Scale targets with level
    const catchTarget = Math.min(2 + Math.floor(level / 3), 8);
    const battleTarget = level >= 5 ? 2 : 1;
    const walkTarget = Math.min(200 + level * 50, 800);
    return [
        { id: 'daily_capture', title: 'Caçador de Corruptos', desc: `Capture ${catchTarget} deputado${catchTarget > 1 ? 's' : ''}.`, target: catchTarget, current: 0, completed: false, type: 'capture', icon: '🎯', reward: 20 + level * 5 },
        { id: 'daily_arena',   title: 'Fiscal do Povo',       desc: `Batalhe ${battleTarget} vez${battleTarget > 1 ? 'es' : ''} na arena.`, target: battleTarget, current: 0, completed: false, type: 'battle', icon: '⚔️', reward: 30 + level * 8 },
        { id: 'daily_walk',    title: 'Patrulha Cidadã',      desc: `Ande ${walkTarget}m pelo mapa.`, target: walkTarget, current: 0, completed: false, type: 'walk', icon: '👟', reward: 15 + level * 3 },
    ];
}

const DAILY_QUESTS = _getDynamicQuests();

function initQuests() {
    // Load progress from local storage (Reset daily)
    const today = new Date().toDateString();
    const saved = JSON.parse(localStorage.getItem('depumon_quests_' + today) || '[]');
    
    if (saved.length > 0) {
        saved.forEach(s => {
            const q = DAILY_QUESTS.find(q => q.id === s.id);
            if (q) {
                q.current = s.current;
                q.completed = s.completed;
            }
        });
    }
}

function updateQuestProgress(type, amount = 1) {
    let updated = false;
    DAILY_QUESTS.forEach(q => {
        if (q.type === type && !q.completed) {
            q.current += amount;
            if (q.current >= q.target) {
                q.current = q.target;
                completeQuest(q);
            }
            updated = true;
        }
    });
    
    if (updated) {
        saveQuests();
    }
}

function completeQuest(quest) {
    quest.completed = true;
    saveQuests();
    
    // Claim Reward
    fetch(`${window.BASE_PATH || ""}/api.php?action=game_quest_claim`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-CSRF-Token': window.DepuMon.csrf_token },
        body: JSON.stringify({ quest_id: quest.id })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            showGameAlert(`Missão "${quest.title}" Concluída! +${data.reward} Moedas`, 'success');
            window.DepuMon.profile.coins += data.reward;
            if (typeof updateXPDisplay === 'function') updateXPDisplay();

            // Check if ALL quests are now completed → award streak bonus
            if (DAILY_QUESTS.every(q => q.completed)) {
                // Streak bonus
                const streak = _incrementStreak();
                const streakBonus = Math.min(streak * 10, 100); // +10 coins per streak day, max 100
                if (streak >= 2) {
                    window.DepuMon.profile.coins = (window.DepuMon.profile.coins || 0) + streakBonus;
                    if (typeof updateXPDisplay === 'function') updateXPDisplay();
                    showGameAlert(`🔥 Sequência de ${streak} dias! +${streakBonus} 🪙 bônus!`, 'success');
                    if (navigator.vibrate) navigator.vibrate([50, 30, 100, 30, 200]);
                }
            }
        }
    });
}

function saveQuests() {
    localStorage.setItem('depumon_quests_' + new Date().toDateString(), JSON.stringify(DAILY_QUESTS));
}

function getQuestsHTML() {
    return DAILY_QUESTS.map(q => `
        <div class="bg-zinc-800 p-3 rounded-xl border ${q.completed ? 'border-green-500' : 'border-zinc-700'} mb-2">
            <div class="flex justify-between items-center">
                <h4 class="font-bold text-white text-sm">${q.title}</h4>
                <span class="text-xs ${q.completed ? 'text-green-400' : 'text-zinc-400'}">${Math.floor(q.current)}/${q.target}</span>
            </div>
            <p class="text-xs text-zinc-500">${q.desc}</p>
            <div class="w-full bg-zinc-900 h-1.5 rounded-full mt-2 overflow-hidden">
                <div class="bg-violet-600 h-full transition-all" style="width: ${(q.current/q.target)*100}%"></div>
            </div>
        </div>
    `).join('');
}

// ── Quests Panel ──────────────────────────────────────────────────────────────
function openQuestsPanel() {
    let modal = document.getElementById('questsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'questsModal';
        modal.className = 'fixed inset-0 z-50 flex flex-col bg-zinc-900 translate-y-full transition-transform duration-300';
        modal.innerHTML = `
            <div class="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900 z-10 shrink-0">
                <h2 class="text-2xl font-black text-white flex items-center gap-2">📋 Missões Diárias</h2>
                <button onclick="closeQuestsPanel()" class="text-zinc-400 hover:text-white text-2xl w-10 h-10 flex items-center justify-center">&times;</button>
            </div>
            <div class="px-4 py-2 bg-zinc-800/60 text-xs text-zinc-500 text-center shrink-0">
                Missões reiniciam à meia-noite. Complete todas para ganhar bônus!
            </div>
            <div class="flex-1 overflow-y-auto p-4" id="questsPanelContent"></div>
            <div class="p-4 border-t border-zinc-800 bg-zinc-900 shrink-0">
                <div class="bg-zinc-800 rounded-xl p-3 text-xs text-zinc-400 text-center">
                    💡 <strong class="text-white">Dica:</strong> Capture deputados com alto CP para ganhar mais XP nas batalhas.
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    document.getElementById('questsPanelContent').innerHTML = getQuestsHTML();
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('translate-y-full'), 10);
}

function closeQuestsPanel() {
    const modal = document.getElementById('questsModal');
    if (!modal) return;
    modal.classList.add('translate-y-full');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

// Auto init
document.addEventListener('DOMContentLoaded', initQuests);