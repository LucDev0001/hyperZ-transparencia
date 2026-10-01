// transparency/js/game_battle.js

// ── Som de ataque via Web Audio API (sem depender de MP3 externo) ─────────────
function _playAttackSound(isCrit = false) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (isCrit) {
            // Crítico: sweep descendente + impacto
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.25);
            gain.gain.setValueAtTime(0.4, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.4);
        } else {
            // Ataque normal: punch curto
            osc.type = 'square';
            osc.frequency.setValueAtTime(300, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.12);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.15);
        }
    } catch (_) {}
}

// ── Tocar som de vitória ──────────────────────────────────────────────────────
function _playVictorySound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
        notes.forEach((freq, i) => {
            const osc  = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.type = 'triangle';
            const t = ctx.currentTime + i * 0.18;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
            osc.start(t); osc.stop(t + 0.3);
        });
    } catch (_) {}
}

let battleF1 = null;
let battleF2 = null;
let battleState = { p1Hp: 100, p2Hp: 100, round: 0, maxRounds: 3, active: false, p1Combo: 0, p2Combo: 0 };

// ── Fighter Picker ────────────────────────────────────────────────────────────

function openArena(isLegendary = false) {
    const dm = window.DepuMon;
    if (dm.pokedex.length < 1) {
        return showGameAlert("Capture pelo menos 1 deputado para batalhar!", "error");
    }
    showFighterPicker(isLegendary);
}

function showFighterPicker(isLegendary) {
    let modal = document.getElementById('fighterPickerModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'fighterPickerModal';
        modal.className = 'fixed inset-0 flex flex-col bg-zinc-900/98 backdrop-blur-sm';
        modal.style.zIndex = '9999';
        document.body.appendChild(modal);
    }
    // Close any open modals that might sit on top
    if (typeof closePokedex === 'function') closePokedex();
    if (typeof closeMarket === 'function') closeMarket();

    const dm = window.DepuMon;
    modal.innerHTML = `
        <div class="p-4 border-b border-zinc-800 flex justify-between items-center shrink-0">
            <div>
                <h2 class="text-xl font-black text-white">⚔️ Escolha seu Lutador</h2>
                <p class="text-zinc-500 text-xs mt-0.5">Selecione qual deputado enviará para a batalha</p>
            </div>
            <button onclick="document.getElementById('fighterPickerModal').classList.add('hidden')" class="text-zinc-400 hover:text-white text-3xl leading-none w-10 h-10 flex items-center justify-center">&times;</button>
        </div>
        <div class="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            ${dm.pokedex.map(dep => {
                const cp = dep.stats_cp || ((dep.stats_atk || 0) + (dep.stats_def || 0) + (dep.stats_spd || 0));
                const img = `${window.BASE_PATH || ""}/api.php?action=proxy_image&url=${encodeURIComponent(dep.photo_url || '')}`;
                const atkW = Math.min(100, dep.stats_atk || 0);
                const defW = Math.min(100, dep.stats_def || 0);
                return `
                    <button onclick="confirmFighter(${dep.id}, ${isLegendary ? 'true' : 'false'})"
                        class="bg-zinc-800 hover:bg-violet-900/40 border border-zinc-700 hover:border-violet-500 rounded-xl p-3 flex flex-col items-center gap-2 transition w-full">
                        <img src="${img}" class="w-16 h-16 rounded-full object-cover border-2 border-zinc-600 bg-zinc-700" onerror="this.src='../src/img/avatar_default.png'">
                        <span class="text-white font-bold text-xs text-center leading-tight line-clamp-2">${dep.name}</span>
                        <div class="w-full space-y-1">
                            <div class="flex items-center gap-1">
                                <span class="text-red-400 text-[9px] w-6">ATK</span>
                                <div class="flex-1 h-1 bg-zinc-700 rounded-full overflow-hidden"><div class="h-full bg-red-500 rounded-full" style="width:${atkW}%"></div></div>
                            </div>
                            <div class="flex items-center gap-1">
                                <span class="text-blue-400 text-[9px] w-6">DEF</span>
                                <div class="flex-1 h-1 bg-zinc-700 rounded-full overflow-hidden"><div class="h-full bg-blue-500 rounded-full" style="width:${defW}%"></div></div>
                            </div>
                        </div>
                        <span class="text-violet-400 text-xs font-mono font-bold">CP ${cp}</span>
                    </button>`;
            }).join('')}
        </div>
    `;
    modal.classList.remove('hidden');
}

function confirmFighter(depId, isLegendary) {
    battleF1 = window.DepuMon.pokedex.find(d => d.id === depId);
    if (!battleF1) return;
    document.getElementById('fighterPickerModal').classList.add('hidden');
    showGameAlert("Carregando oponente...", "info");
    loadEnemyAndStartBattle(isLegendary);
}

// ── Enemy Loading ─────────────────────────────────────────────────────────────

async function loadEnemyAndStartBattle(isLegendary) {
    if (isLegendary) {
        battleF2 = {
            id: 9999,
            name: "Ulysses Guimarães",
            photo_url: `${window.BASE_PATH || ""}/api.php?action=proxy_image&url=${encodeURIComponent('https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Ulysses_Guimar%C3%A3es.jpg/220px-Ulysses_Guimar%C3%A3es.jpg')}`,
            stats_atk: 95, stats_def: 92, stats_spd: 88,
            stats_cp: 2750,
            legendary: true
        };
        startBattle();
        return;
    }

    try {
        const res = await api.camara('deputados?ordem=ASC&ordenarPor=nome&itens=50');
        const candidates = res.dados.filter(d => d.id !== (battleF1.deputy_id || 0));
        const enemy = candidates[Math.floor(Math.random() * candidates.length)];
        const year = new Date().getFullYear();

        const [expRes, projRes, discRes] = await Promise.all([
            api.camara(`deputados/${enemy.id}/despesas?ano=${year}&itens=50`),
            api.camara(`proposicoes?idDeputadoAutor=${enemy.id}&ano=${year}&itens=10`),
            api.camara(`deputados/${enemy.id}/discursos?itens=10`)
        ]);

        const totalExp = expRes.dados.reduce((acc, c) => acc + (parseFloat(c.valorLiquido) || 0), 0);
        const atk = Math.min(100, Math.floor(totalExp / 5000));
        const def = Math.min(100, projRes.dados.length * 10);
        const spd = Math.min(100, discRes.dados.length * 10);

        battleF2 = {
            id: enemy.id,
            name: enemy.nome,
            photo_url: `${window.BASE_PATH || ""}/api.php?action=proxy_image&url=${encodeURIComponent(enemy.urlFoto)}`,
            stats_atk: atk, stats_def: def, stats_spd: spd,
            stats_cp: Math.floor((atk + def + spd) * 10),
            party: enemy.siglaPartido
        };
    } catch (e) {
        console.warn("Falha ao buscar inimigo da API, usando fallback", e);
        const atk = Math.floor(Math.random() * 60) + 20;
        const def = Math.floor(Math.random() * 50) + 15;
        const spd = Math.floor(Math.random() * 50) + 15;
        battleF2 = {
            id: 0, name: "Deputado Rival",
            photo_url: "",
            stats_atk: atk, stats_def: def, stats_spd: spd,
            stats_cp: (atk + def + spd) * 10
        };
    }

    startBattle();
}

// ── Battle Core ───────────────────────────────────────────────────────────────

function startBattle() {
    battleState = { p1Hp: 100, p2Hp: 100, round: 0, maxRounds: 3, active: true, p1Combo: 0, p2Combo: 0 };
    setupBattleUI(battleF1, battleF2);
    if (typeof updateQuestProgress === 'function') updateQuestProgress('battle', 1);
}

function setupBattleUI(f1, f2) {
    const modal = document.getElementById('arenaModal');

    // Names (first word only to fit)
    const shortName = n => (n || 'Lutador').split(' ')[0];
    const p1n = document.getElementById('p1Name') || document.querySelector('#p1Stats h3');
    const p2n = document.getElementById('p2Name') || document.querySelector('#p2Stats h3');
    if (p1n) p1n.innerText = shortName(f1.name || f1.nome);
    if (p2n) p2n.innerText = shortName(f2.name || f2.nome);

    const p1Bar = document.getElementById('p1Hp');
    const p2Bar = document.getElementById('p2Hp');
    p1Bar.style.width = '100%';
    p1Bar.className = 'bg-green-500 h-full transition-all duration-500';
    p2Bar.style.width = '100%';
    p2Bar.className = 'bg-green-500 h-full transition-all duration-500';

    const log = document.getElementById('battleLog');
    log.className = 'absolute bottom-20 left-1/2 -translate-x-1/2 w-3/4 text-center text-yellow-400 font-bold text-xl drop-shadow-md';
    log.innerText = `⚔️ Batalha iniciada! Round 1/${battleState.maxRounds}`;

    const btn = document.getElementById('attackBtn');
    btn.disabled = false;
    btn.innerText = `⚔️ ATACAR — Round 1/${battleState.maxRounds}`;
    btn.onclick = startBattleRound;

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    setTimeout(() => {
        if (typeof init3DArena === 'function') init3DArena();
        if (typeof setupFighters3D === 'function') setupFighters3D(f1.photo_url, f2.photo_url);
    }, 100);
}

function startBattleRound() {
    if (!battleState.active) return;
    const btn = document.getElementById('attackBtn');
    const log = document.getElementById('battleLog');
    btn.disabled = true;
    battleState.round++;

    const atk1 = battleF1.stats_atk || 0;
    const def1 = battleF1.stats_def || 0;
    const atk2 = battleF2.stats_atk || 0;
    const def2 = battleF2.stats_def || 0;

    // Party special moves
    const party = window.DepuMon.profile?.party;
    let atkMult = 1.0, defMult = 1.0, specialMsg = '';
    switch(party) {
        case 'PL':  atkMult = 1.15; specialMsg = '⚡ Veto Supremo ativo!'; break;
        case 'PT':  defMult = 1.15; specialMsg = '🛡️ Defesa Popular ativa!'; break;
        case 'MDB': atkMult = 1.05; defMult = 1.05; specialMsg = '⚖️ Equilíbrio do MDB!'; break;
        case 'UNIÃO': atkMult = 1.1; specialMsg = '🤝 Força Unida!'; break;
        case 'PP':  if (Math.random() < 0.25) { atkMult = 1.5; specialMsg = '💥 GOLPE PROGRESSISTA CRÍTICO!'; } break;
        case 'PSOL': defMult = 1.2; specialMsg = '✊ Resistência PSOL!'; break;
        default: if (Math.random() < 0.1) { atkMult = 1.3; specialMsg = '🎲 Manobra Surpresa!'; } break;
    }
    if (specialMsg && battleState.round === 1) showGameAlert(specialMsg, 'info');

    // Combo multiplier: each consecutive hit that deals more than 20 dmg adds to combo
    const comboMult1 = 1 + Math.min(battleState.p1Combo * 0.15, 0.6); // max 60% bonus at 4x combo
    const comboMult2 = 1 + Math.min(battleState.p2Combo * 0.15, 0.6);
    const dmgToP2 = Math.max(5, Math.floor((atk1 * atkMult - def2 * 0.4 + Math.random() * 15) * comboMult1));
    const dmgToP1 = Math.max(5, Math.floor((atk2 - def1 * defMult * 0.4 + Math.random() * 15) * comboMult2));
    // Update combos
    if (dmgToP2 > 20) battleState.p1Combo++; else battleState.p1Combo = 0;
    if (dmgToP1 > 20) battleState.p2Combo++; else battleState.p2Combo = 0;

    battleState.p2Hp = Math.max(0, battleState.p2Hp - dmgToP2);
    battleState.p1Hp = Math.max(0, battleState.p1Hp - dmgToP1);

    // Update HP bars
    const hpColor = hp => hp > 50 ? 'bg-green-500' : hp > 25 ? 'bg-yellow-500' : 'bg-red-500';
    const p1Bar = document.getElementById('p1Hp');
    const p2Bar = document.getElementById('p2Hp');
    p1Bar.style.width = battleState.p1Hp + '%';
    p1Bar.className = `${hpColor(battleState.p1Hp)} h-full transition-all duration-500`;
    p2Bar.style.width = battleState.p2Hp + '%';
    p2Bar.className = `${hpColor(battleState.p2Hp)} h-full transition-all duration-500`;

    const comboTxt = battleState.p1Combo >= 2 ? ` 🔥 COMBO x${battleState.p1Combo}!` : '';
    log.innerText = `Round ${battleState.round}: Você causou ${dmgToP2}💥 | Levou ${dmgToP1}💥${comboTxt}`;

    // Som de ataque via Web Audio API (sem depender de arquivo externo)
    _playAttackSound(dmgToP2 >= 25);

    // Animação 3D: atacante avança → impacto (com dano floating) → recoil
    if (typeof attackAnimation3D === 'function') attackAnimation3D(true, dmgToP2, dmgToP1);

    const finished = battleState.p1Hp <= 0 || battleState.p2Hp <= 0 || battleState.round >= battleState.maxRounds;
    if (finished) {
        battleState.active = false;
        setTimeout(endBattle, 1000);
    } else {
        setTimeout(() => {
            btn.disabled = false;
            btn.innerText = `⚔️ ATACAR — Round ${battleState.round + 1}/${battleState.maxRounds}`;
        }, 900);
    }
}

function endBattle() {
    const won = battleState.p1Hp > battleState.p2Hp;
    const log = document.getElementById('battleLog');
    const btn = document.getElementById('attackBtn');

    if (won) {
        // Track wins for achievements
        localStorage.setItem('wins', String(parseInt(localStorage.getItem('wins') || '0') + 1));
        if (navigator.vibrate) navigator.vibrate([100, 50, 200, 50, 300]);
        const xpGain  = battleF2.legendary ? 200 : 50;
        const coinGain = battleF2.legendary ? 100 : 20;
        log.innerText = `🏆 VITÓRIA! +${xpGain} XP • +${coinGain} 🪙`;
        log.className = 'absolute bottom-20 left-1/2 -translate-x-1/2 w-3/4 text-center text-green-400 font-black text-xl drop-shadow-md animate-pulse';
        _playVictorySound();
        window.DepuMon.xp = (window.DepuMon.xp || 0) + xpGain;
        window.DepuMon.profile.coins = (window.DepuMon.profile.coins || 0) + coinGain;
        if (typeof updateXPDisplay === 'function') updateXPDisplay();
        showGameAlert(`🏆 Vitória! +${xpGain} XP e +${coinGain} moedas!`, 'success');

        fetch(`${window.BASE_PATH || ""}/api.php?action=game_battle_result`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'X-CSRF-Token': window.DepuMon.csrf_token, 'Content-Type': 'application/json' },
            body: JSON.stringify({ won: true, xp: xpGain, coins: coinGain, legendary: !!battleF2.legendary })
        }).catch(() => {});
    } else {
        log.innerText = `💀 DERROTA! O rival dominou a tribuna...`;
        log.className = 'absolute bottom-20 left-1/2 -translate-x-1/2 w-3/4 text-center text-red-400 font-black text-xl drop-shadow-md';
        showGameAlert('Derrota! Fortaleça seus deputados.', 'error');
    }

    btn.disabled = false;
    btn.innerText = 'Fechar Batalha';
    btn.onclick = closeArena;
}

function closeArena() {
    const am = document.getElementById('arenaModal');
    am.classList.add('hidden');
    am.style.display = 'none';
    const log = document.getElementById('battleLog');
    log.className = 'absolute bottom-20 left-1/2 -translate-x-1/2 w-3/4 text-center text-yellow-400 font-bold text-xl drop-shadow-md h-8';
    log.innerText = '';
    document.getElementById('attackBtn').onclick = startBattleRound;
    if (typeof stop3DArena === 'function') stop3DArena();
}
