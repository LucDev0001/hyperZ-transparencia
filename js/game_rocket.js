// transparency/js/game_rocket.js

function spawnRocketMember() {
    const dm = window.DepuMon;
    // Spawn perto do usuário
    const lat = dm.userLocation[0] + (Math.random() - 0.5) * 0.004;
    const lng = dm.userLocation[1] + (Math.random() - 0.5) * 0.004;

    const icon = L.divIcon({
        className: 'rocket-icon',
        html: `
            <div class="relative w-12 h-12 group cursor-pointer transition-transform hover:scale-110">
                <div class="absolute inset-0 bg-red-600 rounded-full opacity-50 pulse-marker"></div>
                <div class="absolute inset-0 flex items-center justify-center text-2xl">🦹‍♂️</div>
                <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/80 text-red-500 text-[8px] px-1 rounded font-bold whitespace-nowrap border border-red-500">
                    BANCADA DA CORRUPÇÃO
                </div>
            </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24]
    });

    const marker = L.marker([lat, lng], { icon: icon }).addTo(dm.layers.markers);
    marker.on('click', () => triggerRocketEncounter());
}

function triggerRocketEncounter() {
    const confirmBattle = confirm("⚠️ ALERTA! Um membro da Bancada da Corrupção quer desviar seus recursos!\nSe perder, você perde XP. Deseja enfrentar?");
    
    if (confirmBattle) {
        // Rocket battle: player wins if their best CP deputy beats a threshold
        const bestCp = Math.max(0, ...window.DepuMon.pokedex.map(d => d.stats_cp || 0));
        const rocketPower = 800 + Math.floor(Math.random() * 400); // 800-1200 CP
        const playerWins = bestCp > rocketPower * (0.6 + Math.random() * 0.4);

        if (playerWins) {
            const xpGain = 80;
            const coinGain = 30;
            window.DepuMon.xp = (window.DepuMon.xp || 0) + xpGain;
            window.DepuMon.profile.coins = (window.DepuMon.profile.coins || 0) + coinGain;
            if (typeof updateXPDisplay === 'function') updateXPDisplay();
            showGameAlert(`🏆 Rocket derrotado! +${xpGain} XP +${coinGain} 🪙`, 'success');
            if (navigator.vibrate) navigator.vibrate([100, 50, 200]);
            fetch(`${window.BASE_PATH || ""}/api.php?action=game_battle_result`, {
                method: 'POST', credentials: 'include',
                headers: { 'X-CSRF-Token': window.DepuMon.csrf_token, 'Content-Type': 'application/json' },
                body: JSON.stringify({ won: true, xp: xpGain, coins: coinGain, legendary: false })
            }).catch(() => {});
        } else {
            const xpLoss = 20;
            window.DepuMon.xp = Math.max(0, (window.DepuMon.xp || 0) - xpLoss);
            if (typeof updateXPDisplay === 'function') updateXPDisplay();
            showGameAlert(`💀 Membro Rocket escapou! -${xpLoss} XP (CP necessário: ${rocketPower})`, 'error');
            if (navigator.vibrate) navigator.vibrate([300]);
        }

        // Remover marcador (re-scan)
        scanArea();
    }
}