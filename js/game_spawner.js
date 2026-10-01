// transparency/js/game_spawner.js

async function scanArea() {
    const btn = document.querySelector('.joystick-btn span.animate-pulse');
    if(btn) btn.classList.add('animate-spin');

    const dm = window.DepuMon;
    if (dm.layers.markers) dm.layers.markers.clearLayers();
    if (dm.layers.arenas) dm.layers.arenas.clearLayers();

    try {
        // 1. Spawn Deputies (Random sample from API)
        const json = await api.camara('deputados?ordem=ASC&ordenarPor=nome&itens=100');
        const allDeputies = json.dados;
        const randomDeputies = allDeputies.sort(() => 0.5 - Math.random()).slice(0, 8);

        randomDeputies.forEach(dep => spawnDeputy(dep));

        // 2. Spawn Arenas (Public Buildings)
        spawnArenas();

        // 3. Chance de Spawnar Equipe Rocket (20%)
        if (Math.random() < 0.2) {
            spawnRocketMember();
        }

    } catch (e) {
        console.error("Erro ao escanear:", e);
        showGameAlert("O radar falhou. Tente novamente.", "error");
    } finally {
        if(btn) btn.classList.remove('animate-spin');
    }
}

function spawnDeputy(dep) {
    const dm = window.DepuMon;
    // Spawn random offset from user (approx 100m - 500m)
    const lat = dm.userLocation[0] + (Math.random() - 0.5) * 0.006;
    const lng = dm.userLocation[1] + (Math.random() - 0.5) * 0.006;

    const icon = L.divIcon({
        className: 'custom-game-icon',
        html: `
            <div class="relative w-12 h-12 group cursor-pointer transition-transform hover:scale-110">
                <div class="absolute inset-0 bg-violet-600 rounded-full opacity-50 pulse-marker"></div>
                <img src="${dep.urlFoto}" class="absolute inset-0 w-full h-full rounded-full object-cover border-2 border-white shadow-lg">
                <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[8px] px-1 rounded font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition">
                    ${dep.nome}
                </div>
            </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24]
    });

    const marker = L.marker([lat, lng], { icon: icon }).addTo(dm.layers.markers);
    marker.on('click', () => triggerEncounter(dep));
}

function spawnArenas() {
    const dm = window.DepuMon;
    const arenaTypes = [
        { name: "Câmara Municipal", icon: "🏛️", boss: true },
        { name: "Prefeitura", icon: "🏢", boss: false },
        { name: "Fórum", icon: "⚖️", boss: false },
        { name: "Ministério Público", icon: "📜", boss: true }
    ];

    // Spawn 3 random arenas nearby
    for(let i=0; i<3; i++) {
        const type = arenaTypes[Math.floor(Math.random() * arenaTypes.length)];
        const lat = dm.userLocation[0] + (Math.random() - 0.5) * 0.008;
        const lng = dm.userLocation[1] + (Math.random() - 0.5) * 0.008;

        const glowClass = type.boss ? 'legendary-glow' : '';

        const icon = L.divIcon({
            className: 'arena-icon',
            html: `
                <div class="flex flex-col items-center cursor-pointer hover:scale-110 transition">
                    <div class="w-12 h-12 bg-red-600 rounded-lg border-2 border-white shadow-lg flex items-center justify-center text-2xl ${glowClass}">
                        ${type.icon}
                    </div>
                    <div class="bg-black/80 text-white text-[10px] px-2 rounded mt-1 font-bold border border-white/20">${type.name}</div>
                </div>
            `,
            iconSize: [40, 60],
            iconAnchor: [20, 30]
        });

        const marker = L.marker([lat, lng], { icon: icon }).addTo(dm.layers.arenas);
        marker.on('click', () => openArena(type.boss));
    }
}