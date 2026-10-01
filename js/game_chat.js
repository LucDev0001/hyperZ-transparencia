// transparency/js/game_chat.js

let lastChatId = 0;
let chatInterval = null;
let chatErrorCount = 0;

function initGameChat() {
    if (document.getElementById('gameChatContainer')) return;
    
    console.log('Iniciando Chat do Jogo...');

    const chatContainer = document.createElement('div');
    chatContainer.id = 'gameChatContainer';
    chatContainer.className = 'hidden fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 max-w-[90%] h-80 bg-black/95 backdrop-blur-md rounded-xl border border-zinc-700 flex flex-col z-[300] shadow-2xl';
    chatContainer.innerHTML = `
        <div class="flex justify-between items-center p-3 border-b border-zinc-700 bg-zinc-900/50 rounded-t-xl cursor-pointer" onclick="toggleChat()">
            <span class="text-sm font-bold text-white">💬 Chat Global</span>
            <button class="text-zinc-400 hover:text-white font-bold">✕</button>
        </div>
        <div id="gameChatMessages" class="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
            <div class="text-zinc-500 text-center italic">Conectando ao chat...</div>
        </div>
        <div class="p-3 border-t border-zinc-700 flex gap-2 bg-zinc-900/30 rounded-b-xl">
            <input type="text" id="gameChatInput" class="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-violet-500" placeholder="Digite...">
            <button onclick="sendChatMessage()" class="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition">Enviar</button>
        </div>
    `;
    document.body.appendChild(chatContainer);

    // Toggle Button (Floating)
    if (document.getElementById('gameChatToggleBtn')) document.getElementById('gameChatToggleBtn').remove();

    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'gameChatToggleBtn';
    // Ajuste: bottom-24 (mobile) para não cobrir navbar, z-index 5000, mais à direita
    // Posicionado no lado esquerdo, acima do joystick — não conflita com scan button central
    toggleBtn.className = 'fixed w-12 h-12 bg-violet-600 border-2 border-zinc-900 rounded-full flex items-center justify-center text-white shadow-lg z-[5000] hover:bg-violet-500 transition active:scale-95';
    toggleBtn.style.cssText = 'position:fixed;left:12px;bottom:220px;width:48px;height:48px;border-radius:50%;background:#7c3aed;border:2px solid #09090b;display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 4px 16px rgba(0,0,0,.5);z-index:200;cursor:pointer;transition:transform .1s,background .15s;-webkit-tap-highlight-color:transparent;';
    toggleBtn.innerHTML = '<span class="text-xl">💬</span>';
    toggleBtn.onclick = toggleChat;
    document.body.appendChild(toggleBtn);

    // Enter key
    document.getElementById('gameChatInput').addEventListener('keypress', (e) => {
        if(e.key === 'Enter') sendChatMessage();
    });

    // Start Polling
    if (chatInterval) clearInterval(chatInterval);
    chatInterval = setInterval(fetchChatMessages, 7000);
    fetchChatMessages();
}

function toggleChat() {
    const c = document.getElementById('gameChatContainer');
    if(c) c.classList.toggle('hidden');
}

function fetchChatMessages() {
    const apiChatUrl = (window.BASE_PATH || '') + `/api.php?action=game_chat_get&last_id=${lastChatId}`;
    fetch(apiChatUrl)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        })
        .then(data => {
            chatErrorCount = 0; // Resetar contador de erros ao ter sucesso
            if(data.length > 0) {
                const container = document.getElementById('gameChatMessages');
                if(lastChatId === 0) container.innerHTML = ''; // Clear loading
                
                data.forEach(msg => {
                    lastChatId = msg.id;
                    const div = document.createElement('div');
                    div.className = 'flex gap-2 items-start animate-fade-in';
                    div.innerHTML = `
                        <img src="" class="w-6 h-6 rounded-full border border-zinc-600 flex-shrink-0">
                        <div class="min-w-0">
                            <div class="flex items-center gap-1">
                                <span class="font-bold text-violet-400 username-span"></span>
                                ${msg.party ? `<span class="text-[8px] bg-zinc-800 px-1 rounded text-zinc-400 party-span"></span>` : ''}
                            </div>
                            <div class="text-white break-all msg-span"></div>
                        </div>
                    `;
                    // Use textContent to prevent XSS
                    div.querySelector('img').src = msg.avatar || '';
                    div.querySelector('.username-span').textContent = msg.username || '';
                    if (msg.party) div.querySelector('.party-span').textContent = msg.party;
                    div.querySelector('.msg-span').textContent = msg.message || '';
                    container.appendChild(div);
                });
                container.scrollTop = container.scrollHeight;
            }
        })
        .catch(err => {
            console.error("Chat polling error:", err);
            chatErrorCount++;
            if (chatErrorCount > 5) {
                clearInterval(chatInterval);
                const container = document.getElementById('gameChatMessages');
                if(container) container.innerHTML += '<div class="text-red-500 text-center text-xs mt-2 italic">Desconectado do servidor (Muitos erros).</div>';
            }
        });
}

function sendChatMessage() {
    const input = document.getElementById('gameChatInput');
    const msg = input.value.trim().slice(0, 200); // max 200 chars
    if(!msg) return;

    fetch(`${window.BASE_PATH || ""}/api.php?action=game_chat_send`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-CSRF-Token': window.DepuMon.csrf_token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: msg })
    }).then(() => {
        input.value = '';
        fetchChatMessages();
    });
}

// Auto-init if game is loaded
if(document.getElementById('gameMap')) {
    initGameChat();
} else {
    document.addEventListener('DOMContentLoaded', () => setTimeout(initGameChat, 2000));
}