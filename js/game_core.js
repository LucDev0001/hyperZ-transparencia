// transparency/js/game_core.js

window.DepuMon = {
    map: null,
    userLocation: [-15.7801, -47.9292], // Default BSB
    userMarker: null,
    xp: 0,
    pokedex: [],
    layers: {
        markers: null,
        arenas: null
    },
    currentEncounter: null
};

document.addEventListener('DOMContentLoaded', initGame);

function initGame() {
    // Sync with DB
    fetch(`${window.BASE_PATH || ""}/api.php?action=game_sync`)
        .then(res => res.json())
        .then(data => {
            if(data.status === 'success') {
                window.DepuMon.xp = parseInt(data.profile.xp);
                window.DepuMon.pokedex = data.pokedex;
                if(typeof updateXPDisplay === 'function') updateXPDisplay();
            }
        });

    // Init Map
    window.DepuMon.map = L.map('gameMap', {
        zoomControl: false,
        attributionControl: false
    }).setView(window.DepuMon.userLocation, 16);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
    }).addTo(window.DepuMon.map);

    window.DepuMon.layers.markers = L.layerGroup().addTo(window.DepuMon.map);
    window.DepuMon.layers.arenas = L.layerGroup().addTo(window.DepuMon.map);

    // Geolocation
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(pos => {
            window.DepuMon.userLocation = [pos.coords.latitude, pos.coords.longitude];
            updateUserMarker();
        }, err => console.warn(err), { enableHighAccuracy: true });
    }

    // Initial Scan
    setTimeout(() => {
        if(typeof scanArea === 'function') scanArea();
    }, 1000);
}

function updateUserMarker() {
    const dm = window.DepuMon;
    if (!dm.userMarker) {
        const icon = L.divIcon({
            className: 'user-marker',
            html: '<div class="w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-[0_0_20px_rgba(59,130,246,1)] pulse-marker relative"><div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white"></div></div>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
        dm.userMarker = L.marker(dm.userLocation, { icon: icon, zIndexOffset: 1000 }).addTo(dm.map);
        dm.map.setView(dm.userLocation, 17);
    } else {
        dm.userMarker.setLatLng(dm.userLocation);
        dm.map.panTo(dm.userLocation);
    }
}

function moveUser(direction) {
    const dm = window.DepuMon;
    const step = 0.002; // Approx 200m
    
    if (direction === 'up') dm.userLocation[0] += step;
    if (direction === 'down') dm.userLocation[0] -= step;
    if (direction === 'left') dm.userLocation[1] -= step;
    if (direction === 'right') dm.userLocation[1] += step;
    
    updateUserMarker();
    
    // Auto scan when moving (simulating walking)
    // Debounce this in production, but for now simple call
    if(Math.random() > 0.7) scanArea(); // 30% chance to spawn on move
}