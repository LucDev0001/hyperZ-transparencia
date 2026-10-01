<?php
require_once __DIR__ . '/../public_init.php';
if (!isset($_SESSION['user_id'])) {
    header("Location: /entrar");
    exit;
}
?>
<!doctype html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>DepuMon - Caçada Fiscal</title>
    
    <script>
        window.BASE_PATH = "<?php echo BASE_PATH; ?>";
    </script>

    <link rel="stylesheet" href="<?php echo BASE_PATH; ?>/src/css/output.css?v=1.1">
    <link rel="icon" type="image/png" href="<?php echo BASE_PATH; ?>/img/favicon.png" />
    <!-- PWA & Mobile Support -->
    <link rel="manifest" href="<?php echo BASE_PATH; ?>/manifest.json" />
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Hyper Z">
    <link rel="apple-touch-icon" href="<?php echo BASE_PATH; ?>/img/apple-touch-icon.png">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"></script>
    <script src="https://unpkg.com/three@0.134.0/examples/js/loaders/GLTFLoader.js"></script>
    <style>
        /* ── Base ─────────────────────────────────────────────── */
        * { box-sizing: border-box; }
        body { background: #09090b; color: #e4e4e7; overflow: hidden; touch-action: none; user-select: none; -webkit-user-select: none; }

        /* ── Cards e modais ──────────────────────────────────── */
        .depumon-card { background: linear-gradient(135deg, #18181b 0%, #27272a 100%); border: 2px solid #3f3f46; box-shadow: 0 0 20px rgba(0,0,0,0.5); }
        .type-badge { text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
        .legendary-glow { box-shadow: 0 0 30px #fbbf24, 0 0 10px #f59e0b inset; border-color: #fbbf24 !important; }
        .rocket-glow    { box-shadow: 0 0 30px #ef4444, 0 0 10px #7f1d1d inset; border-color: #ef4444 !important; }

        /* ── Stat bars (encounter) ───────────────────────────── */
        .stat-bar-bg   { background: rgba(255,255,255,0.1); }
        .stat-bar-fill { height: 100%; border-radius: 99px; transition: width 1s ease-out; }

        /* ── Alert ───────────────────────────────────────────── */
        .game-alert { animation: alert-in .4s cubic-bezier(.34,1.56,.64,1) forwards; }
        @keyframes alert-in { from { opacity:0; transform:translateY(-16px) scale(.9); } to { opacity:1; transform:translateY(0) scale(1); } }

        /* ── Urna Bola ───────────────────────────────────────── */
        @keyframes urna-shake { 0%,100%{ transform:rotate(0); } 25%{ transform:rotate(-10deg); } 75%{ transform:rotate(10deg); } }
        .urna-anim { animation: urna-shake .5s ease-in-out infinite; }
        @keyframes urna-flash { 0%,100%{ background:#fff; } 50%{ background:#10b981; } }
        .urna-flash { animation: urna-flash .2s ease-in-out 3; }

        /* ── Minimap ─────────────────────────────────────────── */
        #minimap {
            width: 88px; height: 88px;
            border-radius: 50%;
            background: rgba(0,0,0,0.7);
            border: 2px solid rgba(255,255,255,0.12);
            position: relative; overflow: hidden;
            backdrop-filter: blur(8px);
            box-shadow: 0 0 0 1px rgba(139,92,246,0.35), 0 6px 24px rgba(0,0,0,0.6);
            flex-shrink: 0;
        }
        @media (min-width: 480px) { #minimap { width: 108px; height: 108px; } }
        .mm-dot { position: absolute; width: 5px; height: 5px; border-radius: 50%; transform: translate(-50%,-50%); }
        .mm-player { width: 8px; height: 8px; background: #a78bfa; top: 50%; left: 50%; border: 1.5px solid #fff; z-index: 10; box-shadow: 0 0 8px rgba(167,139,250,.9); }
        .mm-deputy { background: #fbbf24; }
        .mm-enemy  { background: #ef4444; }

        /* ── HUD Buttons (Pokémon GO style: dark circles) ────── */
        .hud-btn {
            width: 52px; height: 52px;
            border-radius: 50%;
            background: rgba(0,0,0,0.58);
            backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
            border: 1.5px solid rgba(255,255,255,0.12);
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; color: #fff; font-size: 1.5rem;
            transition: transform .1s, background .15s;
            flex-shrink: 0; position: relative;
            -webkit-tap-highlight-color: transparent;
        }
        .hud-btn:active { transform: scale(.88); background: rgba(255,255,255,.18); }
        .hud-btn svg { pointer-events: none; }

        /* ── Camera label badge ───────────────────────────────── */
        .cam-label {
            position: absolute; bottom: -1px; left: 50%; transform: translateX(-50%);
            background: rgba(139,92,246,.85); border-radius: 4px;
            font-size: 8px; font-weight: 700; padding: 1px 4px;
            color: #fff; letter-spacing: .04em; pointer-events: none;
            white-space: nowrap;
        }

        /* ── Dock items (pill labels from right) ─────────────── */
        .hud-dock-btn {
            display: flex; align-items: center; gap: 8px;
            background: rgba(0,0,0,0.78);
            backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 28px; padding: 9px 18px 9px 13px;
            color: #fff; font-size: .8rem; font-weight: 600;
            cursor: pointer; white-space: nowrap;
            transition: transform .1s, background .15s;
            -webkit-tap-highlight-color: transparent;
        }
        .hud-dock-btn:active { transform: scale(.95); background: rgba(255,255,255,.12); }
        #dockMenu { transition: opacity .18s, transform .18s; }
        #dockMenu.hidden { opacity: 0; pointer-events: none; transform: translateY(8px); }
        #dockMenu:not(.hidden) { opacity: 1; pointer-events: auto; transform: translateY(0); }

        /* ── Player profile card (top-left) ──────────────────── */
        .player-card {
            background: rgba(0,0,0,0.62);
            backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 20px; padding: 8px 12px 8px 8px;
            display: flex; align-items: center; gap: 10px;
        }
        .player-avatar {
            width: 46px; height: 46px; border-radius: 13px;
            background: linear-gradient(135deg, #4c1d95, #1e1b4b);
            border: 2px solid rgba(139,92,246,.65);
            display: flex; align-items: center; justify-content: center;
            font-size: 1.6rem; flex-shrink: 0; overflow: hidden;
        }
        .xp-track {
            height: 4px; width: 88px;
            background: rgba(255,255,255,.1); border-radius: 99px; overflow: hidden; margin-top: 4px;
        }
        .xp-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg,#7c3aed,#d946ef); transition: width .8s ease; }

        /* ── Scan button (PokéBall style) ────────────────────── */
        #scanBtn { background: none; border: none; padding: 0; cursor: pointer; -webkit-tap-highlight-color: transparent; }
        .scan-wrap { position: relative; }
        .scan-glow {
            position: absolute; inset: -8px; border-radius: 50%;
            background: radial-gradient(circle, rgba(139,92,246,.55) 0%, transparent 68%);
            animation: scan-pulse 2.2s ease-in-out infinite; pointer-events: none;
        }
        @keyframes scan-pulse { 0%,100%{ opacity:.5; transform:scale(1); } 50%{ opacity:1; transform:scale(1.1); } }
        .scan-body {
            width: 80px; height: 80px; border-radius: 50%; position: relative;
            background: linear-gradient(180deg, #3b0764 0%, #1c0a2e 50%, #1c1917 50%, #0c0c0c 100%);
            border: 4px solid rgba(255,255,255,0.18);
            box-shadow: 0 8px 32px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.1);
            display: flex; align-items: center; justify-content: center;
            overflow: hidden; transition: transform .1s;
        }
        #scanBtn:active .scan-body { transform: scale(.88); }
        .scan-body::after {
            content: ''; position: absolute; top: 50%; left: 0; right: 0;
            height: 3px; margin-top: -1.5px; background: rgba(255,255,255,.2); z-index: 1;
        }
        .scan-center {
            position: relative; z-index: 2;
            width: 30px; height: 30px; border-radius: 50%;
            background: #18181b; border: 3px solid rgba(255,255,255,.28);
            display: flex; align-items: center; justify-content: center; font-size: .95rem;
        }
        .scan-label {
            color: rgba(255,255,255,.55); font-size: 9px; font-weight: 700;
            letter-spacing: .14em; text-transform: uppercase; margin-top: 4px; text-align: center;
        }

        /* ── Joystick ─────────────────────────────────────────── */
        #joystickBase {
            background: rgba(0,0,0,.45);
            border: 2px solid rgba(255,255,255,.14);
            backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        }
        #joystickKnob {
            background: rgba(255,255,255,.28);
            border: 2px solid rgba(255,255,255,.52);
            backdrop-filter: blur(4px);
            box-shadow: 0 0 14px rgba(139,92,246,.65), 0 2px 6px rgba(0,0,0,.5);
        }
        .joy-arrow { position: absolute; color: rgba(255,255,255,.18); font-size: 10px; pointer-events: none; }

        /* ── Encounter modal compact ──────────────────────────── */
        @media (max-height: 680px) {
            #encounterModal .depumon-card { max-height: 93vh; overflow-y: auto; }
            #encounterModal .depumon-card .h-24  { height: 3rem; }
            #encounterModal .depumon-card .-mt-16 { margin-top: -2.5rem; }
            #encounterModal .depumon-card .w-32  { width: 5.5rem; height: 5.5rem; }
            #encounterModal .depumon-card .p-6   { padding: .75rem 1rem; }
        }

        /* ── Safe area ───────────────────────────────────────── */
        #bottomHud { padding-bottom: max(env(safe-area-inset-bottom, 0px), 10px); }
    </style>
</head>
<body class="relative h-screen w-screen overflow-hidden">

    <!-- ── 3D World ──────────────────────────────────────────── -->
    <div id="gameMap" class="absolute inset-0 z-0 bg-zinc-900"></div>

    <!-- ── Alerts ────────────────────────────────────────────── -->
    <div id="gameAlertContainer" class="fixed top-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-xs px-4 pointer-events-none"></div>

    <!-- ══════════════════════════════════════════════════════════
         HUD OVERLAY  —  inspirado no Pokémon GO
    ═══════════════════════════════════════════════════════════ -->
    <div class="absolute inset-0 z-10 pointer-events-none">

        <!-- ── TOP BAR ─────────────────────────────────────────── -->
        <div class="absolute top-0 left-0 right-0 flex items-start justify-between p-3 pointer-events-auto" style="gap:8px;">

            <!-- Player profile (esquerda) -->
            <div style="display:flex;flex-direction:column;gap:6px;">
                <div class="player-card">
                    <div class="player-avatar">
                        <span id="playerAvatarEmoji">🧑‍💻</span>
                    </div>
                    <div>
                        <div style="color:#fff;font-weight:700;font-size:.85rem;line-height:1;max-width:100px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;" id="playerNameDisplay">Treinador</div>
                        <div style="font-size:.7rem;margin-top:2px;display:flex;align-items:center;gap:4px;">
                            <span style="color:#a78bfa;font-weight:700;">LV<span id="userLevel" style="color:#fff;">1</span></span>
                            <span style="color:#52525b;">•</span>
                            <span style="color:#71717a;"><span id="userXP">0</span> XP</span>
                        </div>
                        <div class="xp-track"><div class="xp-fill" id="xpBarFill" style="width:0%"></div></div>
                    </div>
                </div>
                <!-- Online pill -->
                <div style="display:flex;align-items:center;gap:5px;background:rgba(0,0,0,.52);backdrop-filter:blur(10px);border-radius:20px;padding:4px 10px;width:fit-content;">
                    <span style="width:6px;height:6px;background:#4ade80;border-radius:50%;flex-shrink:0;animation:pulse 2s infinite;"></span>
                    <span style="color:#4ade80;font-size:.68rem;font-weight:700;"><span id="onlineCount">1</span> online</span>
                </div>
            </div>

            <!-- Controles + minimap (direita) -->
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;">
                <div style="display:flex;align-items:center;gap:6px;">
                    <!-- Voltar -->
                    <a href="<?= BASE_PATH ?>/transparencia" class="hud-btn" title="Sair do jogo" style="text-decoration:none;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    </a>
                    <!-- Camera toggle -->
                    <button onclick="toggleCamera()" id="camBtn" class="hud-btn" title="Alternar câmera">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="15" height="12" rx="2"/><path d="M17 9l4-2v9l-4-2"/></svg>
                        <span class="cam-label" id="camModeLabel">3ª</span>
                    </button>
                    <!-- Tutorial -->
                    <button onclick="openTutorial()" class="hud-btn" style="color:#a78bfa;font-weight:700;font-size:.95rem;" title="Tutorial">?</button>
                </div>
                <!-- Minimap -->
                <div id="minimap"><div class="mm-dot mm-player"></div></div>
            </div>
        </div>

        <!-- ── BOTTOM HUD ───────────────────────────────────────── -->
        <div id="bottomHud" class="absolute bottom-0 left-0 right-0 pointer-events-auto">

            <!-- Dock (sobe quando ☰ é acionado) -->
            <div id="dockMenu" class="hidden absolute right-3 flex-col items-end gap-2" style="bottom:calc(100% + 4px);">
                <button onclick="openQuestsPanel()" class="hud-dock-btn">📋 <span>Missões</span></button>
                <button onclick="openLeaderboard()" class="hud-dock-btn">🏆 <span>Ranking</span></button>
                <button onclick="openMarket()" class="hud-dock-btn">🏪 <span>Mercado</span></button>
                <button onclick="openRaid()" class="hud-dock-btn" style="border-color:rgba(239,68,68,.4);color:#fca5a5;">👹 <span>Raid Boss</span></button>
                <button onclick="openEvents()" class="hud-dock-btn">📅 <span>Eventos</span></button>
            </div>

            <!-- Linha de ação principal -->
            <div style="display:flex;align-items:flex-end;justify-content:space-between;padding:0 12px 12px;">

                <!-- ESQUERDA: Joystick + Bag -->
                <div style="display:flex;flex-direction:column;align-items:center;gap:10px;">
                    <div id="joystickZone" style="width:112px;height:112px;position:relative;" class="select-none touch-none">
                        <div id="joystickBase" class="rounded-full" style="width:112px;height:112px;display:flex;align-items:center;justify-content:center;position:relative;transition:opacity .2s;opacity:.6;">
                            <div id="joystickKnob" class="rounded-full absolute pointer-events-none" style="width:40px;height:40px;top:50%;left:50%;transform:translate(-50%,-50%);transition:top .04s,left .04s;"></div>
                            <span class="joy-arrow" style="top:7px;left:50%;transform:translateX(-50%);">▲</span>
                            <span class="joy-arrow" style="bottom:7px;left:50%;transform:translateX(-50%);">▼</span>
                            <span class="joy-arrow" style="left:7px;top:50%;transform:translateY(-50%);">◀</span>
                            <span class="joy-arrow" style="right:7px;top:50%;transform:translateY(-50%);">▶</span>
                        </div>
                    </div>
                    <button onclick="openPokedex()" class="hud-btn" style="border-color:rgba(167,139,250,.3);" title="Minha Coleção">🎒</button>
                </div>

                <!-- CENTRO: Botão UrnaBola (estilo PokéBall) -->
                <div style="display:flex;flex-direction:column;align-items:center;gap:4px;margin-bottom:4px;">
                    <button onclick="scanArea()" id="scanBtn" title="Escanear deputados na área">
                        <div class="scan-wrap">
                            <div class="scan-glow"></div>
                            <div class="scan-body">
                                <div class="scan-center">🗳️</div>
                            </div>
                        </div>
                    </button>
                    <div class="scan-label">Escanear</div>
                </div>

                <!-- DIREITA: Nearby + Menu -->
                <div style="display:flex;flex-direction:column;align-items:center;gap:10px;">
                    <button onclick="scanArea()" class="hud-btn" style="border-color:rgba(251,191,36,.3);" title="Buscar deputados próximos">📡</button>
                    <button onclick="toggleDock()" id="dockToggle" class="hud-btn" title="Menu">
                        <span id="dockIcon" style="font-size:1.15rem;">☰</span>
                    </button>
                </div>

            </div>
        </div>

    </div><!-- /HUD -->

    <!-- Encounter Modal (Card) -->
    <div id="encounterModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm hidden transition-opacity duration-300">
        <div class="depumon-card w-full max-w-sm rounded-3xl overflow-hidden transform transition-all scale-95 opacity-0" id="cardInner">
            <!-- Header / Type -->
            <div class="h-24 bg-zinc-800 relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-b from-violet-900/50 to-transparent"></div>
                <div class="absolute top-4 right-4">
                    <span id="cardType" class="type-badge bg-zinc-900 text-white px-3 py-1 rounded-full text-xs font-bold border border-zinc-700">PARTIDO</span>
                </div>
                <div class="absolute top-4 left-4 text-zinc-400 text-xs font-mono">CP <span id="cardCp" class="text-white text-lg font-bold">000</span></div>
            </div>
            
            <!-- Image -->
            <div class="relative -mt-16 flex justify-center">
                <div class="w-32 h-32 rounded-full border-4 border-zinc-800 bg-zinc-700 overflow-hidden shadow-2xl relative z-10">
                    <img id="cardImage" src="" class="w-full h-full object-cover">
                </div>
            </div>

            <!-- Info -->
            <div class="p-6 text-center">
                <h2 id="cardName" class="text-2xl font-black text-white mb-1">Nome do Deputado</h2>
                <p id="cardState" class="text-zinc-400 text-sm mb-6">Estado - BR</p>

                <!-- Stats -->
                <div class="space-y-3 mb-6">
                    <div class="bg-zinc-900/50 p-2 rounded-xl border border-white/5">
                        <div class="flex justify-between text-[10px] text-zinc-500 uppercase font-bold mb-1">
                            <span>ATK (Gastos)</span>
                            <span id="statAttackVal" class="text-red-400">0</span>
                        </div>
                        <div class="h-2 stat-bar-bg rounded-full overflow-hidden"><div id="barAttack" class="stat-bar-fill bg-red-500" style="width: 0%"></div></div>
                    </div>
                    <div class="bg-zinc-900/50 p-2 rounded-xl border border-white/5">
                        <div class="flex justify-between text-[10px] text-zinc-500 uppercase font-bold mb-1">
                            <span>DEF (Projetos)</span>
                            <span id="statDefenseVal" class="text-blue-400">0</span>
                        </div>
                        <div class="h-2 stat-bar-bg rounded-full overflow-hidden"><div id="barDefense" class="stat-bar-fill bg-blue-500" style="width: 0%"></div></div>
                    </div>
                    <div class="bg-zinc-900/50 p-2 rounded-xl border border-white/5">
                        <div class="flex justify-between text-[10px] text-zinc-500 uppercase font-bold mb-1">
                            <span>SPD (Discursos)</span>
                            <span id="statSpeedVal" class="text-yellow-400">0</span>
                        </div>
                        <div class="h-2 stat-bar-bg rounded-full overflow-hidden"><div id="barSpeed" class="stat-bar-fill bg-yellow-500" style="width: 0%"></div></div>
                    </div>
                </div>

                <div class="flex gap-3">
                    <button onclick="closeEncounter()" class="flex-1 py-3 rounded-xl font-bold text-zinc-400 hover:bg-white/5 transition">Fugir</button>
                    <button onclick="throwUrnaBola()" class="flex-1 py-3 rounded-xl font-bold bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20 transition flex items-center justify-center gap-2">
                        <div class="w-4 h-4 bg-white border-2 border-zinc-800 rounded-sm flex items-center justify-center"><div class="w-2 h-1 bg-green-500"></div></div>
                        CONFIRMA
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Pokedex Modal -->
    <div id="pokedexModal" class="fixed inset-0 z-50 flex flex-col bg-zinc-900 hidden transition-transform duration-300 translate-y-full">
        <div class="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900 z-10">
            <h2 class="text-2xl font-black text-white">Minha Coleção</h2>
            <div class="flex gap-2">
                <select id="pokedexSort" onchange="renderPokedex()" class="bg-zinc-800 text-white text-xs rounded p-1 border border-zinc-700 outline-none">
                    <option value="cp_desc">Maior CP</option>
                    <option value="cp_asc">Menor CP</option>
                    <option value="recent">Recentes</option>
                    <option value="name">Nome</option>
                </select>
            <button onclick="closePokedex()" class="text-zinc-400 hover:text-white text-2xl">&times;</button>
            </div>
        </div>
        <div class="px-4 py-2 bg-zinc-800/50 text-xs text-zinc-400 flex justify-between">
            <span>Capacidade: <span id="pokedexCount">0</span>/100</span>
            <span>Moedas: <span id="userCoins" class="text-yellow-400 font-bold">0</span> 🪙</span>
        </div>
        <div id="pokedexGrid" class="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <!-- Items injected via JS -->
        </div>
        
        <div class="p-4 border-t border-zinc-800 bg-zinc-900">
            <button onclick="openArena()" class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition">
                ⚔️ Ir para Arena
            </button>
        </div>
    </div>

    <!-- Leaderboard Modal -->
    <div id="leaderboardModal" class="fixed inset-0 z-50 flex flex-col bg-zinc-900 hidden transition-transform duration-300 translate-y-full">
        <div class="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900 z-10">
            <h2 class="text-2xl font-black text-white flex items-center gap-2">🏆 Ranking Global</h2>
            <button onclick="closeLeaderboard()" class="text-zinc-400 hover:text-white text-2xl">&times;</button>
        </div>
        <div class="flex-1 overflow-y-auto p-4">
            <div id="leaderboardList" class="space-y-2">
                <!-- Injected via JS -->
                <div class="text-center text-zinc-500 py-10">Carregando ranking...</div>
            </div>
        </div>
    </div>

    <!-- Events Modal -->
    <div id="eventsModal" class="fixed inset-0 z-50 flex flex-col bg-zinc-900 hidden transition-transform duration-300 translate-y-full">
        <div class="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900 z-10">
            <h2 class="text-2xl font-black text-white flex items-center gap-2">📅 Eventos Ativos</h2>
            <button onclick="closeEvents()" class="text-zinc-400 hover:text-white text-2xl">&times;</button>
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-4" id="eventsList">
            <!-- Injected via JS -->
            <div class="text-center text-zinc-500 py-10">Buscando eventos...</div>
        </div>
    </div>

    <!-- Market Modal -->
    <div id="marketModal" class="fixed inset-0 z-50 flex flex-col bg-zinc-900 hidden transition-transform duration-300 translate-y-full">
        <div class="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900 z-10">
            <h2 class="text-2xl font-black text-white flex items-center gap-2">🏪 Mercado Negro</h2>
            <button onclick="closeMarket()" class="text-zinc-400 hover:text-white text-2xl">&times;</button>
        </div>
        <div class="px-4 py-2 bg-zinc-800/50 text-xs text-zinc-400 flex justify-between">
            <span>Seu Saldo:</span>
            <span class="text-yellow-400 font-bold"><span id="marketUserCoins">0</span> 🪙</span>
        </div>
        
        <!-- Tabs -->
        <div class="flex border-b border-zinc-800">
            <button onclick="switchMarketTab('buy')" id="tab-buy" class="flex-1 py-3 text-center font-bold text-green-400 border-b-2 border-green-400 transition-colors">Comprar</button>
            <button onclick="switchMarketTab('sell')" id="tab-sell" class="flex-1 py-3 text-center font-bold text-zinc-500 hover:text-white transition-colors">Vender</button>
        </div>

        <div id="marketContent" class="flex-1 overflow-y-auto p-4 space-y-2">
            <!-- Items injected via JS -->
        </div>
    </div>

    <!-- Party Selection Modal -->
    <div id="partyModal" class="fixed inset-0 z-[90] flex items-center justify-center bg-black/95 hidden">
        <div class="w-full max-w-2xl bg-zinc-900 rounded-2xl border-2 border-violet-600 overflow-hidden relative p-6">
            <h2 class="text-3xl font-black text-white text-center mb-2">Escolha seu Partido</h2>
            <p class="text-zinc-400 text-center mb-8">Sua filiação define seus bônus passivos no jogo. Escolha com sabedoria!</p>
            
            <div id="partyList" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Injected via JS -->
            </div>
        </div>
    </div>

    <!-- Gym Modal -->
    <div id="gymModal" class="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 hidden">
        <div class="w-full max-w-md bg-zinc-900 rounded-2xl border-2 border-yellow-600 overflow-hidden relative">
            <button onclick="closeGym()" class="absolute top-2 right-2 text-zinc-400 hover:text-white z-10">&times;</button>
            <div class="h-32 bg-yellow-600/20 flex items-center justify-center relative">
                <div class="text-6xl">🏛️</div>
                <div class="absolute bottom-2 left-4 font-bold text-yellow-500 text-xl" id="gymTitle">Ginásio</div>
            </div>
            <div id="gymContent" class="p-6 text-center"></div>
        </div>
    </div>

    <!-- Raid Modal -->
    <div id="raidModal" class="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 hidden">
        <div class="w-full max-w-lg bg-zinc-900 rounded-2xl border-2 border-red-600 overflow-hidden relative shadow-[0_0_50px_rgba(220,38,38,0.5)]">
            <button onclick="closeRaid()" class="absolute top-2 right-2 text-zinc-400 hover:text-white">&times;</button>
            <div class="p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-black text-red-500 animate-pulse">RAID BOSS</h2>
                    <span class="bg-red-900/50 text-red-200 text-xs px-2 py-1 rounded border border-red-500">EVENTO GLOBAL</span>
                </div>
                <div id="raidContent" class="text-center">
                    <!-- Raid content injected by JS -->
                </div>
            </div>

        </div>
    </div>

    <!-- Battle Arena Modal -->
    <div id="arenaModal" class="fixed inset-0 bg-black/95 hidden" style="z-index:9000;display:none;">
        <div style="width:100%;height:100%;display:flex;flex-direction:column;position:relative;overflow:hidden;">
            <!-- Close -->
            <button onclick="closeArena()" style="position:absolute;top:10px;right:10px;z-index:20;background:rgba(0,0,0,.6);color:#fff;border:none;border-radius:50%;width:36px;height:36px;font-size:1.2rem;cursor:pointer;display:flex;align-items:center;justify-content:center;">&times;</button>

            <!-- HP bars row -->
            <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:10px 14px 0;gap:8px;flex-shrink:0;z-index:10;position:relative;">
                <div id="p1Stats" style="background:rgba(0,0,0,.7);padding:8px 10px;border-radius:8px;border:1px solid rgba(59,130,246,.5);color:#fff;min-width:0;flex:1;">
                    <div style="font-weight:700;font-size:.78rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" id="p1Name">Player</div>
                    <div style="width:100%;height:7px;background:#3f3f46;border-radius:99px;margin-top:5px;overflow:hidden;"><div id="p1Hp" class="bg-green-500" style="width:100%;height:100%;border-radius:99px;transition:width .5s;"></div></div>
                </div>
                <div style="color:#fbbf24;font-weight:900;font-size:1rem;padding-top:6px;flex-shrink:0;">⚔️</div>
                <div id="p2Stats" style="background:rgba(0,0,0,.7);padding:8px 10px;border-radius:8px;border:1px solid rgba(239,68,68,.5);color:#fff;text-align:right;min-width:0;flex:1;">
                    <div style="font-weight:700;font-size:.78rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" id="p2Name">Oponente</div>
                    <div style="width:100%;height:7px;background:#3f3f46;border-radius:99px;margin-top:5px;overflow:hidden;"><div id="p2Hp" class="bg-green-500" style="width:100%;height:100%;border-radius:99px;transition:width .5s;margin-left:auto;"></div></div>
                </div>
            </div>

            <!-- 3D Stage (flex-1) -->
            <div style="flex:1;position:relative;overflow:hidden;min-height:0;">
                <div id="arena3d" style="position:absolute;inset:0;"></div>
                <!-- Battle Log overlay -->
                <div id="battleLog" style="position:absolute;bottom:12px;left:50%;transform:translateX(-50%);width:90%;text-align:center;color:#fbbf24;font-weight:700;font-size:clamp(.8rem,3vw,1.15rem);text-shadow:0 2px 8px #000;z-index:10;pointer-events:none;min-height:1.4em;"></div>
            </div>

            <!-- Attack button -->
            <div style="padding:12px 16px;background:#18181b;border-top:1px solid #27272a;flex-shrink:0;display:flex;justify-content:center;">
                <button onclick="startBattleRound()" id="attackBtn" style="background:#dc2626;color:#fff;font-weight:700;padding:12px 32px;border-radius:12px;border:none;font-size:clamp(.85rem,3.5vw,1rem);cursor:pointer;width:100%;max-width:320px;transition:opacity .15s;" onmouseover="this.style.background='#b91c1c'" onmouseout="this.style.background='#dc2626'">
                    ⚔️ ATACAR
                </button>
            </div>
        </div>
    </div>

    <!-- UrnaBola Animation Overlay -->
    <div id="urnaBolaOverlay" class="fixed inset-0 z-[100] flex items-center justify-center hidden pointer-events-none">
        <div id="urnaBolaObject" class="relative transition-all duration-500">
            <!-- Visual da Urna Simplificada -->
            <div class="w-32 h-24 bg-zinc-200 border-4 border-zinc-800 rounded-lg shadow-2xl flex flex-col overflow-hidden">
                <div class="flex-1 bg-white border-b-2 border-zinc-300 flex items-center justify-center">
                    <div class="w-12 h-12 rounded-full overflow-hidden border-2 border-zinc-200">
                        <img id="urnaTargetImg" src="" class="w-full h-full object-cover opacity-50">
                    </div>
                </div>
                <div class="h-8 bg-zinc-800 flex items-center justify-center gap-2">
                    <div class="w-4 h-3 bg-white rounded-sm"></div>
                    <div class="w-4 h-3 bg-orange-500 rounded-sm"></div>
                    <div class="w-8 h-3 bg-green-500 rounded-sm animate-pulse"></div>
                </div>
            </div>
        </div>
    </div>

    <script src="<?= BASE_PATH ?>/transparency/js/api.js?v=<?= time(); ?>"></script>
    <script src="<?= BASE_PATH ?>/transparency/js/utils.js?v=<?= time(); ?>"></script>
    
    <!-- Game Modules -->
    <script src="<?= BASE_PATH ?>/transparency/js/game.js?v=<?= time(); ?>"></script>
    <script src="<?= BASE_PATH ?>/transparency/js/game_chat.js?v=<?= time(); ?>"></script>
    <script src="<?= BASE_PATH ?>/transparency/js/game_ui.js?v=<?= time(); ?>"></script>
    <script src="<?= BASE_PATH ?>/transparency/js/game_encounter.js?v=<?=              time(); ?>"></script>
    <script src="<?= BASE_PATH ?>/transparency/js/game_3d.js?v=<?= time(); ?>"></script>
    <script src="<?= BASE_PATH ?>/transparency/js/game_battle.js?v=<?= time(); ?>"></script>
    <script src="<?= BASE_PATH ?>/transparency/js/game_rocket.js?v=<?= time(); ?>"></script>
    <script src="<?= BASE_PATH ?>/transparency/js/game_tutorial.js?v=<?= time(); ?>"></script>
    <script src="<?= BASE_PATH ?>/transparency/js/game_quests.js?v=<?= time(); ?>"></script>
    <script src="<?= BASE_PATH ?>/transparency/js/game_achievements.js?v=<?= time(); ?>"></script>

    <!-- ── Virtual Joystick ──────────────────────────────────────────────────── -->
    <script>
    (function () {
        const zone  = document.getElementById('joystickZone');
        const base  = document.getElementById('joystickBase');
        const knob  = document.getElementById('joystickKnob');
        if (!zone) return;

        const MAX_R     = 44;   // raio máximo do knob em px
        const DEADZONE  = 10;   // raio morto
        const MOVE_MS   = 280;  // intervalo de movimento em ms

        let active = false, center = null, moveDir = null, moveTimer = null;

        function getCenter() {
            const r = base.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }

        function setKnob(dx, dy) {
            knob.style.left = `calc(50% + ${dx}px)`;
            knob.style.top  = `calc(50% + ${dy}px)`;
        }

        function resetKnob() {
            knob.style.left = '50%';
            knob.style.top  = '50%';
            base.style.opacity = '.55';
        }

        function startMove(dir) {
            if (moveTimer) clearInterval(moveTimer);
            moveDir = dir;
            if (dir && typeof moveUser === 'function') {
                moveUser(dir);
                moveTimer = setInterval(() => { if (moveDir) moveUser(moveDir); }, MOVE_MS);
            }
        }

        function stopMove() {
            if (moveTimer) { clearInterval(moveTimer); moveTimer = null; }
            moveDir = null;
        }

        function onStart(e) {
            e.preventDefault();
            active = true;
            center = getCenter();
            base.style.opacity = '1';
        }

        function onMove(e) {
            if (!active || !center) return;
            e.preventDefault();
            const touch = e.touches ? e.touches[0] : e;
            const dx = touch.clientX - center.x;
            const dy = touch.clientY - center.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const clamped = Math.min(dist, MAX_R);
            const angle   = Math.atan2(dy, dx);
            const kx = Math.cos(angle) * clamped;
            const ky = Math.sin(angle) * clamped;
            setKnob(kx, ky);

            if (dist < DEADZONE) { stopMove(); return; }

            const deg = angle * 180 / Math.PI;
            let dir;
            if      (deg > -45  && deg <= 45)  dir = 'right';
            else if (deg > 45   && deg <= 135)  dir = 'down';
            else if (deg > 135  || deg <= -135) dir = 'left';
            else                                dir = 'up';

            if (dir !== moveDir) startMove(dir);
        }

        function onEnd(e) {
            if (e && e.preventDefault) e.preventDefault();
            active = false;
            stopMove();
            resetKnob();
        }

        // Touch events
        zone.addEventListener('touchstart',  onStart, { passive: false });
        zone.addEventListener('touchmove',   onMove,  { passive: false });
        zone.addEventListener('touchend',    onEnd,   { passive: false });
        zone.addEventListener('touchcancel', onEnd,   { passive: false });

        // Fallback mouse (para testar no desktop)
        zone.addEventListener('mousedown', (e) => { onStart(e); center = getCenter(); });
        document.addEventListener('mousemove', (e) => { if (active) { const fe = { clientX: e.clientX, clientY: e.clientY }; onMove({ touches: [fe], preventDefault: () => {} }); } });
        document.addEventListener('mouseup', onEnd);
    })();

    // ── Dock colapsável ────────────────────────────────────────────────────────
    let dockOpen = false;
    function toggleDock() {
        dockOpen = !dockOpen;
        const menu = document.getElementById('dockMenu');
        const icon = document.getElementById('dockIcon');
        if (dockOpen) {
            menu.classList.remove('hidden');
            menu.classList.add('flex');
            icon.textContent = '✕';
        } else {
            menu.classList.add('hidden');
            menu.classList.remove('flex');
            icon.textContent = '☰';
        }
    }
    // Em telas >= 640px, expande o dock automaticamente
    if (window.innerWidth >= 640) {
        toggleDock();
    }
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 640 && !dockOpen) toggleDock();
        if (window.innerWidth < 640 && dockOpen)  toggleDock();
    });

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register((window.BASE_PATH || '') + '/sw.js')
                .then(reg => console.log('SW registrado!', reg))
                .catch(err => console.log('SW falhou:', err));
        });
    }
    </script>
</body>
</html>