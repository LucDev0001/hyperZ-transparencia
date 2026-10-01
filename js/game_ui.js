// transparency/js/game_ui.js

function updateXPDisplay() {
    const xp    = window.DepuMon.xp;
    const level = Math.floor(xp / 1000) + 1;
    const coins = window.DepuMon.profile?.coins || 0;
    const xpInLevel    = xp % 1000;          // XP dentro do nível atual
    const xpPct        = (xpInLevel / 1000) * 100;

    const elXP    = document.getElementById('userXP');
    const elLevel = document.getElementById('userLevel');
    const elXPBar = document.getElementById('xpBarFill');
    const elCoins = document.getElementById('userCoins');
    const elName  = document.getElementById('playerNameDisplay');

    if (elXP)    elXP.innerText    = xp;
    if (elLevel) elLevel.innerText = level;
    if (elXPBar) elXPBar.style.width = xpPct + '%';
    if (elCoins) elCoins.innerText = coins;

    // Atualiza nome no HUD se disponível
    if (elName && window.DepuMon.profile?.name) {
        elName.textContent = window.DepuMon.profile.name;
    }
}

function renderPokedex() {
    const grid = document.getElementById('pokedexGrid');
    const sortMode = document.getElementById('pokedexSort').value;
    let list = [...window.DepuMon.pokedex];

    // Sorting Logic
    if (sortMode === 'cp_desc') list.sort((a, b) => (b.stats_cp || 0) - (a.stats_cp || 0));
    if (sortMode === 'cp_asc') list.sort((a, b) => (a.stats_cp || 0) - (b.stats_cp || 0));
    if (sortMode === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    if (sortMode === 'recent') list.sort((a, b) => new Date(b.captured_at) - new Date(a.captured_at));

    document.getElementById('pokedexCount').innerText = list.length;

    if(list.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center text-zinc-500 mt-10">Sua Pokédex está vazia. Vá caçar!</div>';
        return;
    }

    grid.innerHTML = list.map(d => `
        <div class="bg-zinc-800 p-3 rounded-xl border border-zinc-700 flex flex-col items-center relative group hover:border-violet-500 transition">
            <div class="absolute top-2 right-2 text-[10px] bg-zinc-900 px-1 rounded text-zinc-500 font-mono">CP ${d.stats_cp || '?'}</div>
            
            <div class="w-20 h-20 rounded-full p-1 border-2 border-zinc-600 mb-2 relative">
                <img src="${window.BASE_PATH || ""}/api.php?action=proxy_image&url=${encodeURIComponent(d.photo_url || d.urlFoto)}" class="w-full h-full rounded-full object-cover">
                <div class="absolute bottom-0 right-0 bg-zinc-900 text-[8px] px-1 rounded border border-zinc-700">${d.state}</div>
            </div>

            <div class="text-xs font-bold text-white text-center truncate w-full">${d.name}</div>
            <div class="text-[10px] text-zinc-500">${d.party}</div>
            
            <!-- Stats Bars Mini -->
            <div class="flex gap-1 mt-2 w-full justify-center opacity-50 group-hover:opacity-100 transition">
                <div class="h-1 w-1/3 bg-red-500 rounded-full" title="ATK: ${d.stats_atk}"></div>
                <div class="h-1 w-1/3 bg-blue-500 rounded-full" title="DEF: ${d.stats_def}"></div>
                <div class="h-1 w-1/3 bg-yellow-500 rounded-full" title="SPD: ${d.stats_spd}"></div>
            </div>

            <!-- Actions Overlay -->
            <div class="absolute inset-0 bg-black/80 rounded-xl flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition backdrop-blur-sm">
                <button onclick="evolveDeputy(${d.id})" class="bg-green-600 hover:bg-green-500 text-white text-xs px-3 py-1.5 rounded-full font-bold w-24">
                    Evoluir
                    <span class="block text-[9px] font-normal">500 XP</span>
                </button>
                <button onclick="transferDeputy(${d.id})" class="bg-zinc-600 hover:bg-zinc-500 text-white text-xs px-3 py-1.5 rounded-full font-bold w-24">
                    Transferir
                    <span class="block text-[9px] font-normal">+100 🪙</span>
                </button>
            </div>
        </div>
    `).join('');
}

function openPokedex() {
    const modal = document.getElementById('pokedexModal');
    // Show skeleton while rendering
    const grid = modal.querySelector('[id*="grid"], .grid, [class*="grid"]');
    if (grid && window.DepuMon.pokedex.length === 0) {
        grid.innerHTML = Array(6).fill(`
            <div style="background:#27272a;border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:8px;animation:pulse 1.5s infinite;">
                <div style="width:56px;height:56px;border-radius:50%;background:#3f3f46;margin:0 auto;"></div>
                <div style="height:10px;background:#3f3f46;border-radius:4px;width:80%;margin:0 auto;"></div>
                <div style="height:8px;background:#3f3f46;border-radius:4px;width:60%;margin:0 auto;"></div>
            </div>`).join('');
    }
    renderPokedex();
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('translate-y-full'), 10);
}

function closePokedex() {
    const modal = document.getElementById('pokedexModal');
    modal.classList.add('translate-y-full');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

// --- Market System ---
let currentMarketTab = 'buy';

function openMarket() {
    const modal = document.getElementById('marketModal');
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('translate-y-full'), 10);
    
    // Atualiza saldo
    document.getElementById('marketUserCoins').innerText = window.DepuMon.profile.coins;
    switchMarketTab('buy');
}

function closeMarket() {
    const modal = document.getElementById('marketModal');
    modal.classList.add('translate-y-full');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

function switchMarketTab(tab) {
    currentMarketTab = tab;
    const btnBuy = document.getElementById('tab-buy');
    const btnSell = document.getElementById('tab-sell');
    
    if(tab === 'buy') {
        btnBuy.className = "flex-1 py-3 text-center font-bold text-green-400 border-b-2 border-green-400 transition-colors";
        btnSell.className = "flex-1 py-3 text-center font-bold text-zinc-500 hover:text-white transition-colors";
        loadMarketItems();
    } else {
        btnSell.className = "flex-1 py-3 text-center font-bold text-red-400 border-b-2 border-red-400 transition-colors";
        btnBuy.className = "flex-1 py-3 text-center font-bold text-zinc-500 hover:text-white transition-colors";
        renderSellItems();
    }
}

function loadMarketItems() {
    const container = document.getElementById('marketContent');
    container.innerHTML = '<div class="text-center text-zinc-500 py-10">Carregando ofertas...</div>';

    fetch(`${window.BASE_PATH || ""}/api.php?action=game_market_items`)
        .then(res => res.json())
        .then(data => {
            container.innerHTML = data.items.map(item => `
                <div class="bg-zinc-800 p-3 rounded-xl border border-zinc-700 flex justify-between items-center">
                    <div class="flex items-center gap-3">
                        <div class="text-3xl">${item.icon}</div>
                        <div>
                            <div class="font-bold text-white">${item.name}</div>
                            <div class="text-xs text-zinc-400">${item.description}</div>
                        </div>
                    </div>
                    <button onclick="buyItem(${item.id})" class="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm">
                        ${item.price} 🪙
                    </button>
                </div>
            `).join('');
        });
}

function renderSellItems() {
    const container = document.getElementById('marketContent');
    const inventory = window.DepuMon.inventory;

    if(inventory.length === 0) {
        container.innerHTML = '<div class="text-center text-zinc-500 py-10">Seu inventário está vazio.</div>';
        return;
    }

    // Preços de venda fixos (metade da compra)
    const sellPrices = {1: 100, 2: 25, 3: 250};

    container.innerHTML = inventory.map(item => {
        if(item.quantity <= 0) return ''; // Não mostra itens zerados
        const price = sellPrices[item.item_id] || 0;
        return `
            <div class="bg-zinc-800 p-3 rounded-xl border border-zinc-700 flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <div class="text-3xl">📦</div>
                    <div>
                        <div class="font-bold text-white">${item.name} <span class="text-xs text-zinc-500">x${item.quantity}</span></div>
                        <div class="text-xs text-zinc-400">${item.description}</div>
                    </div>
                </div>
                <button onclick="sellItem(${item.item_id})" class="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm">
                    Vender (+${price})
                </button>
            </div>
        `;
    }).join('');
}

function buyItem(id) {
    fetch(`${window.BASE_PATH || ""}/api.php?action=game_market_buy`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-CSRF-Token': window.DepuMon.csrf_token },
        body: JSON.stringify({ item_id: id, quantity: 1 })
    }).then(res => res.json()).then(data => {
        if(data.status === 'success') {
            showGameAlert("Item comprado!", "success");
            window.DepuMon.profile.coins = data.new_coins;
            document.getElementById('marketUserCoins').innerText = data.new_coins;
            // Atualiza inventário localmente (idealmente faria sync, mas para rapidez:)
            fetch(`${window.BASE_PATH || ""}/api.php?action=game_sync`).then(r=>r.json()).then(d => {
                window.DepuMon.inventory = d.inventory;
            });
        } else {
            showGameAlert(data.message, "error");
        }
    });
}

function sellItem(id) {
    fetch(`${window.BASE_PATH || ""}/api.php?action=game_market_sell`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-CSRF-Token': window.DepuMon.csrf_token },
        body: JSON.stringify({ item_id: id, quantity: 1 })
    }).then(res => res.json()).then(data => {
        if(data.status === 'success') {
            showGameAlert(`Vendido! +${data.coins_gained} moedas`, "success");
            window.DepuMon.profile.coins += data.coins_gained; // Atualização otimista
            document.getElementById('marketUserCoins').innerText = window.DepuMon.profile.coins;
            
            // Atualiza inventário
            fetch(`${window.BASE_PATH || ""}/api.php?action=game_sync`).then(r=>r.json()).then(d => {
                window.DepuMon.inventory = d.inventory;
                if(currentMarketTab === 'sell') renderSellItems(); // Re-renderiza lista de venda se estiver na aba
            });
            showGameAlert(data.message, "error");
        }
    });
}

function transferDeputy(id) {
    if(!confirm("Tem certeza? Você perderá este deputado para sempre em troca de moedas.")) return;

    fetch(`${window.BASE_PATH || ""}/api.php?action=game_release`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-CSRF-Token': window.DepuMon.csrf_token },
        body: JSON.stringify({ pokedex_id: id })
    })
    .then(res => res.json())
    .then(data => {
        if(data.status === 'success') {
            let alertMsg = `Transferido! +${data.coins_gained} Moedas`;
            if (data.item_gained) {
                alertMsg += ` e você encontrou um item: ${data.item_gained.name}!`;
                window.DepuMon.inventory.push(data.item_gained);
            }
            showGameAlert(alertMsg, "success");
            // Remove from local array
            window.DepuMon.pokedex = window.DepuMon.pokedex.filter(d => d.id !== id);
            window.DepuMon.profile.coins += data.coins_gained;
            renderPokedex();
            updateXPDisplay();
        }
    });
}

function showGameAlert(msg, type = 'info') {
    const container = document.getElementById('gameAlertContainer');
    if (!container) return; // Previne erro se o container não existir

    const div = document.createElement('div');
    const colors = type === 'success' ? 'bg-green-600' : (type === 'error' ? 'bg-red-600' : 'bg-blue-600');
    
    div.className = `game-alert ${colors} text-white px-6 py-3 rounded-full shadow-lg font-bold text-sm flex items-center gap-2`;
    div.innerHTML = `<span>${type === 'success' ? '✅' : (type === 'error' ? '❌' : 'ℹ️')}</span> ${msg}`;
    
    container.appendChild(div);
    
    setTimeout(() => {
        div.style.opacity = '0';
        setTimeout(() => div.remove(), 500);
    }, 3000);
}

function evolveDeputy(pokedexId) {
    if(window.DepuMon.xp < 500) {
        showGameAlert("XP Insuficiente! Precisa de 500 XP.", "error");
        return;
    }
    
    fetch(`${window.BASE_PATH || ""}/api.php?action=game_evolve`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-CSRF-Token': window.DepuMon.csrf_token },
        body: JSON.stringify({ pokedex_id: pokedexId })
    }).then(res => res.json()).then(data => {
        if(data.status === 'success') {
            showGameAlert("Evolução realizada com sucesso!", "success");
            location.reload(); // Reload to sync new stats
        }
    });
}

// --- Trading System ---
function openTrading() {
    // Create modal if not exists
    if (!document.getElementById('tradeModal')) {
        const modal = document.createElement('div');
        modal.id = 'tradeModal';
        modal.className = 'fixed inset-0 z-[2000] hidden';
        modal.innerHTML = `
            <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" onclick="closeTrading()"></div>
            <div class="absolute bottom-0 left-0 right-0 bg-zinc-900 rounded-t-3xl p-6 border-t border-zinc-700 max-h-[80vh] overflow-y-auto transition-transform duration-300 translate-y-full" id="tradeModalContent">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-black text-white italic">🤝 TROCAS</h2>
                    <button onclick="closeTrading()" class="w-8 h-8 bg-zinc-800 rounded-full text-zinc-400">✕</button>
                </div>
                
                <div class="flex gap-2 mb-4">
                    <button onclick="switchTradeTab('active')" id="tab-trade-active" class="flex-1 bg-violet-600 text-white py-2 rounded-lg font-bold text-sm">Ofertas</button>
                    <button onclick="switchTradeTab('create')" id="tab-trade-create" class="flex-1 bg-zinc-800 text-zinc-400 py-2 rounded-lg font-bold text-sm">Criar</button>
                </div>

                <div id="trade-active-content" class="space-y-3">
                    <div class="text-center text-zinc-500 py-10">Carregando trocas...</div>
                </div>

                <div id="trade-create-content" class="hidden space-y-4">
                    <div>
                        <label class="text-xs text-zinc-400 font-bold uppercase">Seu Deputado para Troca</label>
                        <select id="trade-offer-select" class="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white mt-1 outline-none"></select>
                    </div>
                    <div>
                        <label class="text-xs text-zinc-400 font-bold uppercase">Usuário Destino (Opcional)</label>
                        <input type="text" id="trade-target-user" placeholder="Deixe vazio para público..." class="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white mt-1 outline-none">
                    </div>
                    <button onclick="submitTradeOffer()" class="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold">Criar Oferta</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    const modal = document.getElementById('tradeModal');
    const content = document.getElementById('tradeModalContent');
    modal.classList.remove('hidden');
    setTimeout(() => content.classList.remove('translate-y-full'), 10);
    
    switchTradeTab('active');
}

function closeTrading() {
    const modal = document.getElementById('tradeModal');
    const content = document.getElementById('tradeModalContent');
    if(content) content.classList.add('translate-y-full');
    setTimeout(() => modal && modal.classList.add('hidden'), 300);
}

function switchTradeTab(tab) {
    document.getElementById('trade-active-content').classList.toggle('hidden', tab !== 'active');
    document.getElementById('trade-create-content').classList.toggle('hidden', tab !== 'create');
    
    document.getElementById('tab-trade-active').className = tab === 'active' ? "flex-1 bg-violet-600 text-white py-2 rounded-lg font-bold text-sm" : "flex-1 bg-zinc-800 text-zinc-400 py-2 rounded-lg font-bold text-sm";
    document.getElementById('tab-trade-create').className = tab === 'create' ? "flex-1 bg-violet-600 text-white py-2 rounded-lg font-bold text-sm" : "flex-1 bg-zinc-800 text-zinc-400 py-2 rounded-lg font-bold text-sm";

    if (tab === 'create') {
        const select = document.getElementById('trade-offer-select');
        select.innerHTML = window.DepuMon.pokedex.map(d => `<option value="${d.id}">${d.name} (CP ${d.stats_cp})</option>`).join('');
    }
    if (tab === 'active') loadActiveTrades();
}

function loadActiveTrades() {
    const container = document.getElementById('trade-active-content');
    fetch(`${window.BASE_PATH || ""}/api.php?action=game_trade_list`)
        .then(res => res.json())
        .then(data => {
            if(data.trades.length === 0) {
                container.innerHTML = '<div class="text-center text-zinc-500 py-10">Nenhuma oferta disponível.</div>';
                return;
            }
            container.innerHTML = data.trades.map(t => `
                <div class="bg-zinc-800 p-3 rounded-xl border border-zinc-700 flex justify-between items-center">
                    <div class="flex items-center gap-3">
                        <img src="${t.photo_url}" class="w-10 h-10 rounded-full object-cover border border-zinc-600">
                        <div>
                            <div class="font-bold text-white text-sm">${t.deputy_name}</div>
                            <div class="text-xs text-zinc-400">De: ${t.sender_name}</div>
                        </div>
                    </div>
                    ${t.sender_id == window.DepuMon.profile.user_id 
                        ? '<span class="text-xs text-zinc-500 italic">Sua oferta</span>' 
                        : `<button onclick="acceptTrade(${t.id})" class="bg-violet-600 hover:bg-violet-500 text-white px-3 py-1 rounded text-xs font-bold">Trocar</button>`}
                </div>
            `).join('');
        });
}

function submitTradeOffer() {
    const deputyId = document.getElementById('trade-offer-select').value;
    const targetUser = document.getElementById('trade-target-user').value;

    fetch(`${window.BASE_PATH || ""}/api.php?action=game_trade_create`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-CSRF-Token': window.DepuMon.csrf_token },
        body: JSON.stringify({ deputy_id: deputyId, target_username: targetUser })
    }).then(res => res.json()).then(data => {
        if(data.status === 'success') {
            showGameAlert("Oferta criada!", "success");
            switchTradeTab('active');
        } else {
            showGameAlert(data.message, "error");
        }
    });
}

function acceptTrade(tradeId) {
    const myDeputyId = prompt("Digite o ID do seu deputado para dar em troca (Consulte na Pokedex):"); // Simplified for MVP
    if(!myDeputyId) return;

    fetch(`${window.BASE_PATH || ""}/api.php?action=game_trade_accept`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-CSRF-Token': window.DepuMon.csrf_token },
        body: JSON.stringify({ trade_id: tradeId, payment_deputy_id: myDeputyId })
    }).then(res => res.json()).then(data => {
        if(data.status === 'success') {
            showGameAlert("Troca realizada com sucesso!", "success");
            closeTrading();
            // Reload data
            fetch(`${window.BASE_PATH || ""}/api.php?action=game_sync`).then(r=>r.json()).then(d => window.DepuMon.pokedex = d.pokedex);
        } else {
            showGameAlert(data.message, "error");
        }
    });
}

function openLeaderboard() {
    const modal = document.getElementById('leaderboardModal');
    const list = document.getElementById('leaderboardList');
    
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('translate-y-full'), 10);

    fetch(`${window.BASE_PATH || ""}/api.php?action=game_leaderboard`)
        .then(res => res.json())
        .then(data => {
            list.innerHTML = data.map((u, index) => {
                let avatarUrl = u.avatar;
                if (!avatarUrl.startsWith('http') && !avatarUrl.startsWith('../')) {
                    avatarUrl = '../' + avatarUrl;
                }
                return `
                <div class="flex items-center gap-4 bg-zinc-800 p-3 rounded-xl border border-zinc-700">
                    <div class="text-2xl font-black text-zinc-500 w-8 text-center">#${index + 1}</div>
                    <img src="${avatarUrl}" class="w-10 h-10 rounded-full object-cover border border-zinc-600">
                    <div class="flex-1">
                        <div class="font-bold text-white">${u.username}</div>
                        <div class="text-xs text-zinc-400">Nível ${u.level}</div>
                    </div>
                    <div class="text-violet-400 font-bold">${u.xp} XP</div>
                </div>
            `}).join('');
        });
}

function closeLeaderboard() {
    const modal = document.getElementById('leaderboardModal');
    modal.classList.add('translate-y-full');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

// --- Party System ---
function openPartySelection() {
    const modal = document.getElementById('partyModal');
    const list = document.getElementById('partyList');
    modal.classList.remove('hidden');

    fetch(`${window.BASE_PATH || ""}/api.php?action=game_parties`)
        .then(res => res.json())
        .then(data => {
            list.innerHTML = data.parties.map(p => `
                <button onclick="joinParty('${p.sigla}')" class="bg-zinc-800 hover:bg-${p.color} border border-zinc-700 hover:border-white p-4 rounded-xl transition group text-left relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-0"></div>
                    <div class="relative z-10">
                        <h3 class="text-2xl font-black text-white mb-1">${p.sigla}</h3>
                        <p class="text-sm text-zinc-300 mb-2">${p.name}</p>
                        <div class="bg-black/40 inline-block px-3 py-1 rounded-lg text-xs font-bold text-yellow-400 border border-white/10">
                            ${p.bonus}
                        </div>
                    </div>
                </button>
            `).join('');
        });
}

function joinParty(sigla) {
    if(!confirm(`Tem certeza que deseja se filiar ao ${sigla}? Esta escolha é permanente.`)) return;

    fetch(`${window.BASE_PATH || ""}/api.php?action=game_join_party`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-CSRF-Token': window.DepuMon.csrf_token },
        body: JSON.stringify({ party: sigla })
    }).then(() => {
        document.getElementById('partyModal').classList.add('hidden');
        showGameAlert(`Bem-vindo ao ${sigla}!`, 'success');
        // Reload profile
        fetch(`${window.BASE_PATH || ""}/api.php?action=game_sync`).then(r=>r.json()).then(d => window.DepuMon.profile = d.profile);
    });
}

// --- Raid Inventory ---
function renderRaidInventory() {
    const container = document.getElementById('raidInventory');
    const inventory = window.DepuMon.inventory;

    if (!container) return;

    if (inventory.length === 0) {
        container.innerHTML = '<div class="text-xs text-zinc-600">Sem itens no inventário.</div>';
        return;
    }

    container.innerHTML = inventory.map(item => {
        if (item.quantity <= 0) return ''; // Não renderiza itens com quantidade zero
        return `
        <button onclick="attackRaid(${item.item_id})" title="${item.description}" class="relative bg-zinc-800 border border-zinc-700 rounded-lg p-2 flex flex-col items-center hover:bg-zinc-700 transition w-20">
            <span class="text-2xl">${item.item_id === 1 ? '💸' : '❓'}</span>
            <span class="text-[10px] text-white font-bold truncate w-full text-center">${item.name}</span>
            <span class="text-[10px] bg-violet-600 text-white font-bold rounded-full w-4 h-4 flex items-center justify-center absolute -top-1 -right-1">${item.quantity}</span>
        </button>
    `}).join('');

    if (container.innerHTML.trim() === '') {
         container.innerHTML = '<div class="text-xs text-zinc-600">Sem itens no inventário.</div>';
    }
}

// --- Events System ---
function openEvents() {
    const modal = document.getElementById('eventsModal');
    const list = document.getElementById('eventsList');
    
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('translate-y-full'), 10);

    fetch(`${window.BASE_PATH || ""}/api.php?action=game_events`)
        .then(res => res.json())
        .then(data => {
            let html = '';
            
            // Add Quests Section
            if (typeof getQuestsHTML === 'function') {
                html += '<h3 class="text-white font-bold mb-2">📜 Missões Diárias</h3>' + getQuestsHTML() + '<hr class="border-zinc-700 my-4">';
            }

            if(data.events.length === 0) {
                html += '<div class="text-center text-zinc-500 py-10">Nenhum evento ativo no momento.</div>';
            }

            html += data.events.map(e => `
                <div class="bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700 relative">
                    <div class="h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500"></div>
                    <div class="p-4">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="font-bold text-white text-lg">${e.title}</h3>
                            ${e.active ? '<span class="bg-green-500/20 text-green-400 text-[10px] px-2 py-1 rounded uppercase font-bold animate-pulse">Ativo</span>' : ''}
                        </div>
                        <p class="text-zinc-400 text-sm">${e.description}</p>
                        <div class="mt-3 text-xs text-zinc-500 font-mono uppercase tracking-wider">${e.type} EVENT</div>
                        <button onclick="registerEvent(${e.id})" class="mt-3 w-full bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded-lg text-xs font-bold transition">
                            Inscrever-se
                        </button>
                    </div>
                </div>
            `).join('');
            
            list.innerHTML = html;
        });
}

function registerEvent(eventId) {
    fetch(`${window.BASE_PATH || ""}/api.php?action=game_event_register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-CSRF-Token': window.DepuMon.csrf_token },
        body: JSON.stringify({ event_id: eventId })
    })
    .then(res => res.json())
    .then(data => {
        showGameAlert(data.message, "success");
    });
}

function closeEvents() {
    const modal = document.getElementById('eventsModal');
    modal.classList.add('translate-y-full');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

// --- Friend System ---
function openFriends() {
    if (!document.getElementById('friendsModal')) {
        const modal = document.createElement('div');
        modal.id = 'friendsModal';
        modal.className = 'fixed inset-0 z-[2000] hidden';
        modal.innerHTML = `
            <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" onclick="closeFriends()"></div>
            <div class="absolute bottom-0 left-0 right-0 bg-zinc-900 rounded-t-3xl p-6 border-t border-zinc-700 max-h-[80vh] overflow-y-auto transition-transform duration-300 translate-y-full" id="friendsModalContent">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-black text-white italic">👥 AMIGOS</h2>
                    <button onclick="closeFriends()" class="w-8 h-8 bg-zinc-800 rounded-full text-zinc-400">✕</button>
                </div>
                
                <div class="flex gap-2 mb-4">
                    <input type="text" id="friendUsernameInput" placeholder="Nome do usuário..." class="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white outline-none">
                    <button onclick="sendFriendRequest()" class="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg font-bold text-sm">Adicionar</button>
                </div>

                <div id="friendsList" class="space-y-3">
                    <div class="text-center text-zinc-500 py-10">Carregando amigos...</div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    const modal = document.getElementById('friendsModal');
    const content = document.getElementById('friendsModalContent');
    modal.classList.remove('hidden');
    setTimeout(() => content.classList.remove('translate-y-full'), 10);
    loadFriendsList();
}

function closeFriends() {
    const modal = document.getElementById('friendsModal');
    const content = document.getElementById('friendsModalContent');
    if(content) content.classList.add('translate-y-full');
    setTimeout(() => modal && modal.classList.add('hidden'), 300);
}

function loadFriendsList() {
    const list = document.getElementById('friendsList');
    fetch(`${window.BASE_PATH || ""}/api.php?action=game_friend_list`, { method: 'POST', credentials: 'include', headers: { 'X-CSRF-Token': window.DepuMon.csrf_token } })
        .then(res => res.json())
        .then(data => {
            if(data.friends.length === 0) {
                list.innerHTML = '<div class="text-center text-zinc-500 py-10">Você ainda não tem amigos adicionados.</div>';
                return;
            }
            list.innerHTML = data.friends.map(f => `
                <div class="bg-zinc-800 p-3 rounded-xl border border-zinc-700 flex justify-between items-center">
                    <div class="flex items-center gap-3">
                        <img src="${f.avatar}" class="w-10 h-10 rounded-full object-cover border border-zinc-600">
                        <div>
                            <div class="font-bold text-white text-sm">${f.username}</div>
                            <div class="text-xs text-zinc-400">Nível ${f.level || 1} • ${f.party || 'Sem Partido'}</div>
                        </div>
                    </div>
                    ${f.status === 'pending' && f.user_id_1 != window.DepuMon.profile.user_id 
                        ? `<button onclick="acceptFriendRequest(${f.id})" class="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-xs font-bold">Aceitar</button>` 
                        : (f.status === 'pending' ? '<span class="text-xs text-zinc-500 italic">Pendente</span>' : '<span class="text-xs text-green-400 font-bold">Amigo</span>')}
                </div>
            `).join('');
        });
}

function sendFriendRequest() {
    const username = document.getElementById('friendUsernameInput').value;
    if(!username) return;
    fetch(`${window.BASE_PATH || ""}/api.php?action=game_friend_request`, {
        method: 'POST', credentials: 'include', headers: { 'X-CSRF-Token': window.DepuMon.csrf_token },
        body: JSON.stringify({ username })
    }).then(res => res.json()).then(data => {
        if(data.status === 'success') { showGameAlert("Solicitação enviada!", "success"); loadFriendsList(); }
        else showGameAlert(data.message, "error");
    });
}

function acceptFriendRequest(friendId) {
    fetch(`${window.BASE_PATH || ""}/api.php?action=game_friend_accept`, {
        method: 'POST', credentials: 'include', headers: { 'X-CSRF-Token': window.DepuMon.csrf_token },
        body: JSON.stringify({ friend_id: friendId })
    }).then(res => res.json()).then(data => {
        if(data.status === 'success') { showGameAlert("Agora vocês são amigos!", "success"); loadFriendsList(); }
    });
}

// --- Gym System ---
function openGym(uf = 'DF') {
    const modal = document.getElementById('gymModal');
    const content = document.getElementById('gymContent');
    const title = document.getElementById('gymTitle');
    
    title.innerText = `Ginásio ${uf}`;
    content.innerHTML = '<div class="animate-pulse text-zinc-500">Carregando dados do ginásio...</div>';
    modal.classList.remove('hidden');

    fetch(`${window.BASE_PATH || ""}/api.php?action=game_gym_info&uf=${uf}`)
        .then(res => res.json())
        .then(data => {
            if(data.status === 'empty') {
                content.innerHTML = `
                    <p class="text-zinc-400 mb-4">Este ginásio está vazio! Seja o primeiro a defender o estado.</p>
                    <button onclick="claimGym('${uf}')" class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-xl w-full">
                        🛡️ Colocar Defensor
                    </button>
                `;
            } else {
                const g = data.gym;
                const hpPercent = Math.min(100, (g.current_hp / g.max_hp) * 100);
                content.innerHTML = `
                    <div class="flex flex-col items-center mb-4">
                        <img src="${g.photo_url}" class="w-24 h-24 rounded-full border-4 border-yellow-600 object-cover mb-2">
                        <h3 class="text-xl font-bold text-white">${g.deputy_name}</h3>
                        <p class="text-sm text-zinc-400">Defendido por: ${g.username}</p>
                    </div>
                    <div class="w-full bg-zinc-800 h-4 rounded-full overflow-hidden mb-6 border border-zinc-700">
                        <div class="bg-green-500 h-full transition-all duration-500" style="width: ${hpPercent}%"></div>
                    </div>
                    <button onclick="attackGym('${uf}')" class="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl w-full">
                        ⚔️ Atacar Ginásio
                    </button>
                `;
            }
        });
}

function closeGym() {
    document.getElementById('gymModal').classList.add('hidden');
}

// --- Raid System ---
function openRaid() {
    const modal = document.getElementById('raidModal');
    const content = document.getElementById('raidContent');
    
    modal.classList.remove('hidden');
    content.innerHTML = '<div class="animate-pulse text-zinc-500">Carregando dados da Raid...</div>';
    
    fetch(`${window.BASE_PATH || ""}/api.php?action=game_raid_info`)
        .then(res => res.json())
        .then(data => {
            const r = data.raid;
            window.DepuMon.currentRaid = r;
            const hpPercent = (r.current_hp / r.total_hp) * 100;
            content.innerHTML = `
                <h3 class="text-xl font-bold text-white mb-2">${r.title}</h3>
                <p class="text-zinc-400 mb-4">${r.description}</p>
                <div class="text-4xl mb-4">👹 ${r.boss_name}</div>
                <div id="raidHpWrapper" class="w-full bg-zinc-800 h-6 rounded-full overflow-hidden mb-2 border border-zinc-700 relative">
                    <div id="raidHpLabel" class="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white z-10">${r.current_hp} / ${r.total_hp}</div>
                    <div id="raidHpBar" class="bg-red-600 h-full transition-all duration-500" style="width: ${hpPercent}%"></div>
                </div>
                <div id="raidInventory" class="mt-4 p-2 bg-zinc-950/50 rounded-lg border border-zinc-800 flex gap-2 justify-center h-20 items-center">
                    <!-- Itens injetados aqui -->
                </div>
                <button onclick="attackRaid()" class="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl w-full animate-pulse">
                    👊 ATACAR BOSS
                </button>
            `;
            if(typeof renderRaidInventory === 'function') renderRaidInventory();
        });
}

function closeRaid() {
    document.getElementById('raidModal').classList.add('hidden');
}

function attackRaid(itemId) {
    const raid = window.DepuMon?.currentRaid;
    if (!raid) return showGameAlert('Nenhuma Raid ativa!', 'error');

    const btn = document.querySelector('#raidContent button');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Atacando...'; }

    fetch(`${window.BASE_PATH || ""}/api.php?action=game_raid_attack`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-CSRF-Token': window.DepuMon.csrf_token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId || null })
    })
    .then(r => r.json())
    .then(data => {
        if (data.damage) {
            const newHp = Math.max(0, (raid.current_hp || 0) - data.damage);
            raid.current_hp = newHp;
            const pct = Math.max(0, (newHp / raid.total_hp) * 100);
            const bar = document.getElementById('raidHpBar');
            const lbl = document.getElementById('raidHpLabel');
            if (bar) bar.style.width = pct + '%';
            if (lbl) lbl.textContent = `${newHp} / ${raid.total_hp}`;
            showGameAlert(`💥 Causou ${data.damage} de dano!${data.xp ? ` +${data.xp} XP` : ''}`, 'success');
            if (navigator.vibrate) navigator.vibrate([80, 40, 150]);
            if (data.xp) { window.DepuMon.xp = (window.DepuMon.xp || 0) + data.xp; if (typeof updateXPDisplay === 'function') updateXPDisplay(); }
            if (newHp <= 0) { showGameAlert('🏆 Raid Boss derrotado!', 'success'); setTimeout(closeRaid, 1500); }
        } else {
            // Fallback: server might not support this action yet — simulate locally
            const dmg = 10 + Math.floor(Math.random() * 20);
            raid.current_hp = Math.max(0, (raid.current_hp || 100) - dmg);
            const pct = Math.max(0, (raid.current_hp / raid.total_hp) * 100);
            const bar = document.getElementById('raidHpBar');
            if (bar) bar.style.width = pct + '%';
            showGameAlert(`💥 Atacou o Boss! ${dmg} de dano`, 'success');
            if (navigator.vibrate) navigator.vibrate([80, 40, 150]);
        }
    })
    .catch(() => {
        // Offline fallback
        const dmg = 10 + Math.floor(Math.random() * 20);
        showGameAlert(`💥 ${dmg} de dano (modo offline)`, 'info');
    })
    .finally(() => {
        if (btn) { btn.disabled = false; btn.textContent = '👊 ATACAR BOSS'; }
    });
}