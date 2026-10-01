// transparency/js/game_encounter.js

function _getDepumonRarity(cp) {
    if (cp >= 2500) return { label: '✨ LENDÁRIO', color: '#fbbf24', glow: '0 0 20px #fbbf24, 0 0 40px #f59e0b', stars: 5 };
    if (cp >= 1800) return { label: '💜 ÉPICO',    color: '#a855f7', glow: '0 0 16px #a855f7', stars: 4 };
    if (cp >= 1000) return { label: '💙 RARO',     color: '#3b82f6', glow: '0 0 12px #3b82f6', stars: 3 };
    if (cp >= 500)  return { label: '💚 INCOMUM',  color: '#22c55e', glow: '0 0 8px #22c55e',  stars: 2 };
    return            { label: '⬜ COMUM',          color: '#a1a1aa', glow: 'none',             stars: 1 };
}

async function triggerEncounter(dep) {
    window.DepuMon.currentEncounter = dep;
    const modal = document.getElementById('encounterModal');
    const card = document.getElementById('cardInner');
    
    // Reset UI
    modal.classList.remove('hidden');
    setTimeout(() => {
        card.classList.remove('scale-95', 'opacity-0');
        card.classList.add('scale-100', 'opacity-100');
    }, 10);

    // Fill Basic Info
    document.getElementById('cardName').textContent = dep.nome;
    document.getElementById('cardState').textContent = `${dep.siglaPartido} • ${dep.siglaUf}`;
    document.getElementById('cardImage').src = dep.urlFoto;
    document.getElementById('cardType').textContent = dep.siglaPartido;
    
    // Reset Bars
    document.getElementById('barAttack').style.width = '0%';
    document.getElementById('barDefense').style.width = '0%';
    document.getElementById('barSpeed').style.width = '0%';
    document.getElementById('statAttackVal').textContent = '...';

    try {
        const year = new Date().getFullYear();
        
        // Fetch Attributes in Parallel
        const [expensesRes, projectsRes, speechesRes] = await Promise.all([
            api.camara(`deputados/${dep.id}/despesas?ano=${year}&itens=100`),
            api.camara(`proposicoes?idDeputadoAutor=${dep.id}&ano=${year}&itens=10`),
            api.camara(`deputados/${dep.id}/discursos?itens=10`)
        ]);

        // Calculate Stats
        const totalExpenses = expensesRes.dados.reduce((acc, curr) => acc + (parseFloat(curr.valorLiquido) || 0), 0);
        const projectCount = projectsRes.dados.length; // Approximation based on page size
        const speechCount = speechesRes.dados.length;

        // Normalize Stats for Game (0-100 scale logic)
        // ATK: Expenses (Max ~50k/month -> 600k/year)
        const atk = Math.min(100, Math.floor(totalExpenses / 5000)); 
        // DEF: Projects (Max ~20)
        const def = Math.min(100, projectCount * 10);
        // SPD: Speeches (Max ~20)
        const spd = Math.min(100, speechCount * 10);
        const cp = Math.floor((atk + def + spd) * 10);

        // Store stats in deputy object
        window.DepuMon.currentEncounter.stats = { atk, def, spd, cp, totalExpenses };

        // Rarity
        const rarity = _getDepumonRarity(cp);
        const stars = '★'.repeat(rarity.stars) + '☆'.repeat(5 - rarity.stars);

        // Update UI
        document.getElementById('statAttackVal').textContent = window.formatCurrency(totalExpenses);
        document.getElementById('statDefenseVal').textContent = projectCount;
        document.getElementById('statSpeedVal').textContent = speechCount;
        document.getElementById('cardCp').textContent = cp;

        // Rarity badge next to CP
        const cardCpEl = document.getElementById('cardCp');
        let rarityBadge = document.getElementById('cardRarityBadge');
        if (!rarityBadge) {
            rarityBadge = document.createElement('span');
            rarityBadge.id = 'cardRarityBadge';
            rarityBadge.style.cssText = 'margin-left:8px;font-size:0.85em;font-weight:bold;';
            if (cardCpEl && cardCpEl.parentNode) cardCpEl.parentNode.appendChild(rarityBadge);
        }
        rarityBadge.textContent = `${rarity.label} ${stars}`;
        rarityBadge.style.color = rarity.color;

        // Glow on deputy avatar
        const cardImg = document.getElementById('cardImage');
        if (cardImg) cardImg.style.boxShadow = rarity.glow;

        document.getElementById('barAttack').style.width = `${atk}%`;
        document.getElementById('barDefense').style.width = `${def}%`;
        document.getElementById('barSpeed').style.width = `${spd}%`;

    } catch (e) {
        console.error(e);
    }
}

function closeEncounter() {
    const modal = document.getElementById('encounterModal');
    const card = document.getElementById('cardInner');
    card.classList.add('scale-95', 'opacity-0');
    card.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

function throwUrnaBola() {
    const overlay = document.getElementById('urnaBolaOverlay');
    const urnaObj = document.getElementById('urnaBolaObject');
    const targetImg = document.getElementById('urnaTargetImg');
    
    // Setup Animation
    targetImg.src = window.DepuMon.currentEncounter.urlFoto;
    overlay.classList.remove('hidden');
    overlay.classList.add('pointer-events-auto');
    
    // Play Capture Sound
    const audio = new Audio('/transparency/audio/urna.mp3');
    audio.play().catch(e => console.warn("Audio play failed", e));

    // 1. Throw Animation (Scale down)
    urnaObj.classList.add('scale-0');
    setTimeout(() => urnaObj.classList.remove('scale-0'), 10);

    // 2. Shake Animation
    setTimeout(() => {
        urnaObj.classList.add('urna-anim');
    }, 500);

    // 3. Success Flash
    setTimeout(() => {
        urnaObj.classList.remove('urna-anim');
        urnaObj.classList.add('urna-flash');
    }, 2000);

    // 4. Complete
    setTimeout(() => {
        overlay.classList.add('hidden');
        overlay.classList.remove('pointer-events-auto');
        urnaObj.classList.remove('urna-flash');
        captureSuccess();
    }, 3000);
}

function captureSuccess() {
    const dm = window.DepuMon;
    const dep = dm.currentEncounter;

    // Evasion based on SPD stat
    const evasionChance = Math.min(0.45, (dep.stats_spd || dep.stats?.spd || 0) / 220);
    if (Math.random() < evasionChance) {
        showGameAlert(`${dep.name || dep.nome} fugiu! 💨`, 'error');
        // Shake the urna/ball to indicate failure
        const urnaEl = document.getElementById('urnaBolaObject') || document.querySelector('.urna');
        if (urnaEl) {
            urnaEl.style.animation = 'none';
            urnaEl.style.transform = 'translateX(-15px)';
            setTimeout(() => urnaEl.style.transform = 'translateX(15px)', 150);
            setTimeout(() => urnaEl.style.transform = '', 300);
        }
        return;
    }

    // Save to Server
    fetch(`${window.BASE_PATH || ""}/api.php?action=game_capture`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-CSRF-Token': dm.csrf_token },
        body: JSON.stringify({ deputy: dm.currentEncounter })
    })
    .then(res => res.json())
    .then(data => {
        if(data.status === 'success') {
            dm.pokedex.push(dm.currentEncounter);
            dm.xp += data.xp_gain;
            updateXPDisplay();
            showGameAlert(`CONFIRMADO! ${dm.currentEncounter.nome} registrado!\n+${data.xp_gain} XP`, 'success');
            // Haptic feedback on capture
            if (navigator.vibrate) navigator.vibrate([100, 50, 200]);
            
            // Update Quest
            if (typeof updateQuestProgress === 'function') updateQuestProgress('capture', 1);
            
            closeEncounter();
        } else {
            showGameAlert("Erro ao salvar captura: " + data.message, "error");
        }
    })
    .catch(err => {
        console.error(err);
        showGameAlert("Erro de conexão ao salvar.", "error");
    });
}