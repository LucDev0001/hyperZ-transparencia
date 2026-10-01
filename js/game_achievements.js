// transparency/js/game_achievements.js

const ACHIEVEMENTS = [
    { id: 'first_capture', title: 'Primeira Captura', desc: 'Capture seu primeiro deputado.', condition: (dm) => dm.pokedex.length >= 1, reward: 50 },
    { id: 'collector_5', title: 'Colecionador Iniciante', desc: 'Tenha 5 deputados na Pokedex.', condition: (dm) => dm.pokedex.length >= 5, reward: 200 },
    { id: 'rich_100', title: 'Poupador', desc: 'Acumule 100 moedas.', condition: (dm) => dm.profile.coins >= 100, reward: 50 },
    { id: 'level_2', title: 'Subindo de Nível', desc: 'Alcance o nível 2.', condition: (dm) => dm.profile.level >= 2, reward: 100 },
    { id: 'party_member', title: 'Filiado', desc: 'Junte-se a um partido.', condition: (dm) => !!dm.profile.party, reward: 150 }
];

function initAchievements() {
    // Load unlocked from local storage (Simple persistence for MVP)
    if (!window.DepuMon) return;
    window.DepuMon.unlockedAchievements = JSON.parse(localStorage.getItem('depumon_achievements') || '[]');
    
    // Check periodically
    setInterval(checkAchievements, 15000);
    checkAchievements();
}

function checkAchievements() {
    const dm = window.DepuMon;
    if (!dm || !dm.profile) return;

    ACHIEVEMENTS.forEach(ach => {
        if (!dm.unlockedAchievements.includes(ach.id)) {
            if (ach.condition(dm)) {
                unlockAchievement(ach);
            }
        }
    });

    // Check all tiered achievements
    ALL_TIERED_ACHIEVEMENTS.forEach(ach => {
        const key = `ach_${ach.id}`;
        if (localStorage.getItem(key)) return; // already unlocked
        if (ach.check()) {
            localStorage.setItem(key, '1');
            // Award XP and coins
            if (ach.xp > 0) window.DepuMon.xp = (window.DepuMon.xp || 0) + ach.xp;
            if (ach.coins > 0) window.DepuMon.profile.coins = (window.DepuMon.profile.coins || 0) + ach.coins;
            if (typeof updateXPDisplay === 'function') updateXPDisplay();
            showGameAlert(`🏆 ${ach.label}\n${ach.desc}${ach.xp ? ` +${ach.xp}XP` : ''}${ach.coins ? ` +${ach.coins}🪙` : ''}`, 'success');
            if (navigator.vibrate) navigator.vibrate([100, 50, 150]);
        }
    });
}

function unlockAchievement(ach) {
    window.DepuMon.unlockedAchievements.push(ach.id);
    localStorage.setItem('depumon_achievements', JSON.stringify(window.DepuMon.unlockedAchievements));
    
    if (typeof showGameAlert === 'function') {
        showGameAlert(`🏆 Conquista: ${ach.title} (+${ach.reward} XP)`, 'success');
    }
    // Note: XP reward logic would ideally be server-side, this is visual for now
}

// ── Tiered Achievement System ─────────────────────────────────────────────────
const ACHIEVEMENT_TIERS = {
    collector: [
        { id: 'col_1',  label: '🥉 Colecionador',    desc: 'Capture 5 deputados',    target: 5,   xp: 50,  coins: 20,  check: () => (window.DepuMon?.pokedex?.length || 0) >= 5  },
        { id: 'col_2',  label: '🥈 Grande Coleção',   desc: 'Capture 15 deputados',   target: 15,  xp: 100, coins: 50,  check: () => (window.DepuMon?.pokedex?.length || 0) >= 15 },
        { id: 'col_3',  label: '🥇 Mestre Coletor',   desc: 'Capture 30 deputados',   target: 30,  xp: 200, coins: 100, check: () => (window.DepuMon?.pokedex?.length || 0) >= 30 },
    ],
    wealth: [
        { id: 'rich_1', label: '🥉 Poupador',         desc: 'Acumule 100 moedas',     target: 100,  xp: 30,  coins: 0,  check: () => (window.DepuMon?.profile?.coins || 0) >= 100  },
        { id: 'rich_2', label: '🥈 Investidor',        desc: 'Acumule 500 moedas',     target: 500,  xp: 80,  coins: 0,  check: () => (window.DepuMon?.profile?.coins || 0) >= 500  },
        { id: 'rich_3', label: '🥇 Magnata',           desc: 'Acumule 2000 moedas',    target: 2000, xp: 200, coins: 0,  check: () => (window.DepuMon?.profile?.coins || 0) >= 2000 },
    ],
    level: [
        { id: 'lvl_5',  label: '🥉 Aprendiz',         desc: 'Alcance o nível 5',      target: 5,   xp: 0,   coins: 50,  check: () => Math.floor((window.DepuMon?.xp || 0) / 1000) + 1 >= 5  },
        { id: 'lvl_10', label: '🥈 Investigador',      desc: 'Alcance o nível 10',     target: 10,  xp: 0,   coins: 100, check: () => Math.floor((window.DepuMon?.xp || 0) / 1000) + 1 >= 10 },
        { id: 'lvl_20', label: '🥇 Fiscal da Nação',   desc: 'Alcance o nível 20',     target: 20,  xp: 0,   coins: 300, check: () => Math.floor((window.DepuMon?.xp || 0) / 1000) + 1 >= 20 },
    ],
    battle: [
        { id: 'bat_1',  label: '🥉 Guerreiro',         desc: 'Vença 3 batalhas',       target: 3,   xp: 60,  coins: 30,  check: () => parseInt(localStorage.getItem('wins') || '0') >= 3  },
        { id: 'bat_2',  label: '🥈 Campeão',           desc: 'Vença 10 batalhas',      target: 10,  xp: 150, coins: 80,  check: () => parseInt(localStorage.getItem('wins') || '0') >= 10 },
        { id: 'bat_3',  label: '🥇 Lenda da Arena',    desc: 'Vença 25 batalhas',      target: 25,  xp: 400, coins: 200, check: () => parseInt(localStorage.getItem('wins') || '0') >= 25 },
    ],
};

// Flatten all tiers into one list for checking
const ALL_TIERED_ACHIEVEMENTS = Object.values(ACHIEVEMENT_TIERS).flat();

// Auto-init
document.addEventListener('DOMContentLoaded', () => setTimeout(initAchievements, 3000));