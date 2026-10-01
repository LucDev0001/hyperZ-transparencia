<?php
require_once __DIR__ . '/../public_init.php';
$is_logged_in = isset($_SESSION['user_id']);
?>
<!doctype html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ranking DepuMon GO — Hyper Z</title>
  
  <script>
    window.BASE_PATH = "<?php echo BASE_PATH; ?>";
  </script>

  <meta name="description" content="Veja quem são os maiores fiscalizadores do Brasil no DepuMon GO. Ranking público de XP, nível e partido." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://hyperzcommunity.com/transparency/ranking.php" />
  <meta property="og:title" content="Ranking DepuMon GO — Hyper Z" />
  <meta property="og:description" content="Os maiores fiscalizadores do Brasil. Veja o ranking de XP do DepuMon GO, o game de transparência pública." />
  <meta property="og:image" content="https://hyperzcommunity.com/img/og-depumon.png" />
  <meta property="og:site_name" content="Hyper Z" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Ranking DepuMon GO — Hyper Z" />
  <meta name="twitter:description" content="Quem são os maiores fiscalizadores do Brasil? Veja o ranking de XP." />
  <meta name="twitter:image" content="https://hyperzcommunity.com/img/og-depumon.png" />
  <meta name="theme-color" content="#09090b" />
  <link rel="icon" type="image/png" href="<?php echo BASE_PATH; ?>/img/favicon.png" />
  <link rel="stylesheet" href="<?php echo BASE_PATH; ?>/src/css/output.css?v=<?php echo time(); ?>">
  <!-- PWA & Mobile Support -->
  <link rel="manifest" href="<?php echo BASE_PATH; ?>/manifest.json" />
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Hyper Z">
  <link rel="apple-touch-icon" href="/img/apple-touch-icon.png">
  <style>
    body { background: #09090b; color: #e4e4e7; min-height: 100vh; }
    body::before {
      content: '';
      position: fixed; inset: 0; pointer-events: none; z-index: 0;
      background: radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.18) 0%, transparent 60%);
    }
    .party-badge {
      font-size: 0.65rem; font-weight: 700; padding: 2px 7px;
      border-radius: 999px; letter-spacing: 0.05em; border: 1px solid currentColor;
    }
    .rank-1 { background: linear-gradient(135deg,#fbbf2422,#f59e0b22); border-color: #fbbf24 !important; }
    .rank-2 { background: linear-gradient(135deg,#a1a1aa22,#71717a22); border-color: #a1a1aa !important; }
    .rank-3 { background: linear-gradient(135deg,#92400e22,#b45309 22%); border-color: #b45309 !important; }
    .xp-bar { height: 4px; border-radius: 2px; background: #27272a; overflow: hidden; }
    .xp-bar-fill { height: 100%; background: linear-gradient(to right, #7c3aed, #a855f7); border-radius: 2px; transition: width 1s ease; }
    .party-PT  { color: #ef4444; }
    .party-PL  { color: #3b82f6; }
    .party-PSOL{ color: #f59e0b; }
    .party-MDB { color: #10b981; }
    .party-PP  { color: #8b5cf6; }
    .party-UNION{ color: #06b6d4; }
  </style>
</head>
<body class="relative">

  <!-- Topbar -->
  <header class="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/90 backdrop-blur-lg">
    <div class="max-w-3xl mx-auto flex items-center justify-between px-4 h-14">
      <a href="/transparency/" class="flex items-center gap-2 text-zinc-400 hover:text-white transition text-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Portal
      </a>
      <span class="font-bold text-white flex items-center gap-2">
        <span class="text-lg">🎮</span> Ranking DepuMon GO
      </span>
      <?php if ($is_logged_in): ?>
        <a href="game.php" class="text-xs bg-violet-600 hover:bg-violet-500 text-white font-semibold px-3 py-1.5 rounded-lg transition">Jogar</a>
      <?php else: ?>
        <a href="/cadastrar" class="text-xs bg-violet-600 hover:bg-violet-500 text-white font-semibold px-3 py-1.5 rounded-lg transition">Criar conta</a>
      <?php endif; ?>
    </div>
  </header>

  <main class="relative z-10 max-w-3xl mx-auto px-4 py-8">

    <!-- Header -->
    <div class="text-center mb-8">
      <div class="inline-flex items-center gap-2 bg-violet-950/50 border border-violet-800/40 text-violet-300 text-xs px-3 py-1.5 rounded-full mb-4">
        🏆 Atualizado a cada 2 minutos
      </div>
      <h1 class="text-3xl font-black text-white mb-2">Maiores Fiscalizadores</h1>
      <p class="text-zinc-400 text-sm max-w-md mx-auto">
        Capture DepuMons, ganhe XP fiscalizando parlamentares e suba no ranking nacional.
      </p>
    </div>

    <!-- Pódio top 3 -->
    <div id="podium" class="grid grid-cols-3 gap-3 mb-6">
      <div class="flex items-end justify-center">
        <div id="rank2" class="text-center w-full">
          <div class="text-3xl mb-1">🥈</div>
          <div class="rank-card-sm bg-zinc-900 border border-zinc-700 rounded-xl p-3">
            <img id="avatar2" src="" class="w-12 h-12 rounded-full mx-auto mb-2 object-cover border-2 border-zinc-600" />
            <p id="name2" class="font-bold text-white text-xs truncate"></p>
            <p id="xp2" class="text-zinc-400 text-xs"></p>
          </div>
        </div>
      </div>
      <div class="flex items-end justify-center -mt-4">
        <div id="rank1" class="text-center w-full">
          <div class="text-4xl mb-1">🥇</div>
          <div class="rank-card-sm bg-zinc-900 border border-yellow-600/50 rounded-xl p-3 shadow-lg shadow-yellow-900/20">
            <img id="avatar1" src="" class="w-14 h-14 rounded-full mx-auto mb-2 object-cover border-2 border-yellow-500" />
            <p id="name1" class="font-bold text-white text-sm truncate"></p>
            <p id="xp1" class="text-yellow-400 text-xs font-semibold"></p>
          </div>
        </div>
      </div>
      <div class="flex items-end justify-center">
        <div id="rank3" class="text-center w-full">
          <div class="text-3xl mb-1">🥉</div>
          <div class="rank-card-sm bg-zinc-900 border border-zinc-700 rounded-xl p-3">
            <img id="avatar3" src="" class="w-12 h-12 rounded-full mx-auto mb-2 object-cover border-2 border-amber-700" />
            <p id="name3" class="font-bold text-white text-xs truncate"></p>
            <p id="xp3" class="text-zinc-400 text-xs"></p>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista completa -->
    <div id="leaderboard-list" class="space-y-2">
      <!-- Skeleton -->
      <?php for ($i = 0; $i < 7; $i++): ?>
      <div class="animate-pulse bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
        <div class="w-8 h-8 bg-zinc-800 rounded-full"></div>
        <div class="w-10 h-10 bg-zinc-800 rounded-full"></div>
        <div class="flex-1 space-y-2">
          <div class="h-3 bg-zinc-800 rounded w-1/3"></div>
          <div class="h-2 bg-zinc-800 rounded w-1/4"></div>
        </div>
        <div class="h-3 bg-zinc-800 rounded w-16"></div>
      </div>
      <?php endfor; ?>
    </div>

    <!-- CTA jogar -->
    <div class="mt-8 bg-gradient-to-br from-violet-950/60 to-zinc-900 border border-violet-800/30 rounded-2xl p-6 text-center">
      <p class="text-2xl mb-2">🎮</p>
      <h3 class="font-bold text-white mb-2">Entre no ranking!</h3>
      <p class="text-zinc-400 text-sm mb-4">Crie sua conta, capture DepuMons e fiscalize os 513 deputados do Brasil.</p>
      <?php if ($is_logged_in): ?>
        <a href="game.php" class="inline-block bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-3 rounded-xl transition">
          Jogar agora →
        </a>
      <?php else: ?>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="/cadastrar" class="bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-3 rounded-xl transition">
            Criar conta grátis →
          </a>
          <a href="/transparency/" class="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium px-6 py-3 rounded-xl transition border border-zinc-700">
            Ver portal primeiro
          </a>
        </div>
      <?php endif; ?>
    </div>

  </main>

  <script>
    const PARTY_COLORS = {
      PT:'#ef4444', PL:'#3b82f6', PSOL:'#f59e0b', MDB:'#10b981',
      PP:'#8b5cf6', UNIÃO:'#06b6d4', UNIAO:'#06b6d4', REPUBLICANOS:'#f97316',
      PDT:'#dc2626', PSDB:'#3b82f6', SOLIDARIEDADE:'#22c55e'
    };

    function getAvatar(avatar, name) {
      if (avatar && !avatar.includes('null')) return avatar.startsWith('http') ? avatar : '/' + avatar;
      const c = encodeURIComponent((name||'?')[0].toUpperCase());
      return `https://ui-avatars.com/api/?name=${c}&background=7c3aed&color=fff&size=80`;
    }

    function fmtXP(xp) {
      if (xp >= 1000) return (xp/1000).toFixed(1) + 'k XP';
      return xp + ' XP';
    }

    function levelColor(level) {
      if (level >= 40) return '#fbbf24';
      if (level >= 25) return '#a855f7';
      if (level >= 15) return '#3b82f6';
      if (level >= 5)  return '#10b981';
      return '#71717a';
    }

    async function loadRanking() {
      try {
        const r = await fetch('/api.php?action=game_leaderboard');
        const data = await r.json();
        if (!Array.isArray(data) || data.length === 0) {
          document.getElementById('leaderboard-list').innerHTML =
            '<p class="text-center text-zinc-500 py-8">Nenhum jogador ainda. Seja o primeiro!</p>';
          return;
        }

        // Pódio (top 3)
        [1,2,3].forEach(pos => {
          const u = data[pos-1];
          if (!u) return;
          document.getElementById('avatar'+pos).src = getAvatar(u.avatar, u.name);
          document.getElementById('name'+pos).textContent = u.name || u.username;
          document.getElementById('xp'+pos).textContent = `Nv.${u.level} · ${fmtXP(u.xp)}`;
        });

        // Lista a partir do 4º
        const rest = data.slice(3);
        const maxXP = data[0].xp || 1;
        const listHtml = rest.map((u, i) => {
          const pos = i + 4;
          const pct = Math.round((u.xp / maxXP) * 100);
          const pColor = PARTY_COLORS[u.party?.toUpperCase()] || '#71717a';
          return `
            <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center gap-3 hover:border-zinc-700 transition">
              <span class="text-zinc-500 font-bold text-sm w-6 text-center">${pos}</span>
              <img src="${getAvatar(u.avatar, u.name)}" class="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-zinc-700" onerror="this.src='https://ui-avatars.com/api/?name=?&background=3f3f46&color=fff'"/>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <p class="font-semibold text-white text-sm truncate">${u.name || u.username}</p>
                  ${u.party ? `<span class="party-badge" style="color:${pColor};border-color:${pColor}40">${u.party}</span>` : ''}
                </div>
                <div class="xp-bar"><div class="xp-bar-fill" style="width:${pct}%"></div></div>
              </div>
              <div class="text-right flex-shrink-0">
                <p class="font-bold text-sm" style="color:${levelColor(u.level)}">Nv.${u.level}</p>
                <p class="text-zinc-500 text-xs">${fmtXP(u.xp)}</p>
              </div>
            </div>`;
        }).join('');

        document.getElementById('leaderboard-list').innerHTML = listHtml || '<p class="text-center text-zinc-500 py-4 text-sm">Apenas 3 jogadores no ranking ainda.</p>';

        // Anima barras
        setTimeout(() => {
          document.querySelectorAll('.xp-bar-fill').forEach(el => {
            const w = el.style.width;
            el.style.width = '0%';
            setTimeout(() => el.style.width = w, 50);
          });
        }, 100);

      } catch(e) {
        console.error('Erro ao carregar ranking:', e);
      }
    }

    loadRanking();
    setInterval(loadRanking, 120000); // refresh a cada 2 min

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
