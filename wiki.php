<?php
require_once __DIR__ . '/../public_init.php';
$is_logged_in = isset($_SESSION['user_id']);
?>
<!doctype html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Wiki da Política Brasileira · HYPER Z</title>
  <meta name="description" content="Guia completo e gamificado sobre o sistema político brasileiro."/>
  <meta name="theme-color" content="#09090b"/>

  <script>
    window.BASE_PATH = "<?php echo BASE_PATH; ?>";
  </script>

  <link rel="icon" type="image/png" href="<?php echo BASE_PATH; ?>/img/favicon.png"/>
  <link rel="stylesheet" href="<?php echo BASE_PATH; ?>/src/css/output.css?v=1.1">
  <!-- PWA & Mobile Support -->
  <link rel="manifest" href="<?php echo BASE_PATH; ?>/manifest.json" />
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Hyper Z">
  <link rel="apple-touch-icon" href="<?php echo BASE_PATH; ?>/img/apple-touch-icon.png">
  <style>
    :root {
      --accent: #7c3aed;
      --accent2: #a855f7;
      --gold: #f59e0b;
    }
    body { background:#09090b; color:#e4e4e7; font-family:'Inter',sans-serif; }
    /* ── Hero gradient ── */
    .wiki-hero {
      background: linear-gradient(135deg, #0f0a1e 0%, #1a0a2e 40%, #09090b 100%);
      border-bottom: 1px solid rgba(124,58,237,.3);
    }
    /* ── Glass card ── */
    .glass {
      background: rgba(24,24,27,.7);
      backdrop-filter: blur(14px);
      border: 1px solid rgba(255,255,255,.07);
    }
    /* ── Chapter card ── */
    .chapter-card {
      background: rgba(24,24,27,.8);
      border: 1px solid rgba(255,255,255,.06);
      border-radius:1.25rem;
      transition: border-color .2s, box-shadow .2s;
    }
    .chapter-card:hover { border-color:rgba(124,58,237,.4); box-shadow:0 0 24px rgba(124,58,237,.12); }
    .chapter-card.done { border-color:rgba(34,197,94,.35); box-shadow:0 0 16px rgba(34,197,94,.08); }
    /* ── Salary table ── */
    .salary-table th { background:rgba(124,58,237,.2); color:#c4b5fd; font-size:.75rem; text-transform:uppercase; letter-spacing:.04em; }
    .salary-table tr:nth-child(even) { background:rgba(255,255,255,.025); }
    .salary-table td,th { padding:.6rem .85rem; text-align:left; }
    /* ── Quiz ── */
    .quiz-opt {
      background:rgba(39,39,42,.8);
      border:1px solid rgba(255,255,255,.08);
      border-radius:.75rem;
      padding:.65rem 1rem;
      cursor:pointer;
      transition:all .15s;
      text-align:left;
    }
    .quiz-opt:hover { border-color:#7c3aed; background:rgba(124,58,237,.15); }
    .quiz-opt.correct { background:rgba(34,197,94,.2); border-color:#22c55e; color:#86efac; }
    .quiz-opt.wrong   { background:rgba(239,68,68,.2);  border-color:#ef4444; color:#fca5a5; }
    /* ── Progress bar ── */
    #progressBar { transition: width .6s cubic-bezier(.4,0,.2,1); }
    /* ── HyperBot ── */
    #hyperbot-btn {
      position:fixed; bottom:24px; right:24px; z-index:9999;
      width:60px; height:60px; border-radius:50%;
      background:linear-gradient(135deg,#7c3aed,#a855f7);
      border:2px solid rgba(255,255,255,.2);
      box-shadow:0 0 24px rgba(124,58,237,.5);
      cursor:pointer;
      display:flex; align-items:center; justify-content:center;
      font-size:1.6rem;
      animation: botPulse 3s infinite;
    }
    @keyframes botPulse { 0%,100%{box-shadow:0 0 24px rgba(124,58,237,.5)} 50%{box-shadow:0 0 40px rgba(168,85,247,.8)} }
    #hyperbot-window {
      position:fixed; bottom:96px; right:24px; z-index:9999;
      width:min(96vw, 380px); height:480px;
      border-radius:1.25rem; overflow:hidden;
      background:#18181b; border:1px solid rgba(124,58,237,.4);
      box-shadow:0 20px 60px rgba(0,0,0,.6);
      display:flex; flex-direction:column;
      transition: opacity .25s, transform .25s;
    }
    #hyperbot-window.hidden { opacity:0; pointer-events:none; transform:translateY(20px) scale(.97); }
    #bot-messages { flex:1; overflow-y:auto; padding:1rem; display:flex; flex-direction:column; gap:.75rem; }
    .bot-msg { background:rgba(124,58,237,.2); border:1px solid rgba(124,58,237,.3); border-radius:.75rem; padding:.65rem .9rem; font-size:.875rem; color:#ddd6fe; max-width:90%; align-self:flex-start; line-height:1.5; }
    .user-msg { background:rgba(39,39,42,.9); border:1px solid rgba(255,255,255,.08); border-radius:.75rem; padding:.65rem .9rem; font-size:.875rem; color:#e4e4e7; max-width:90%; align-self:flex-end; }
    .bot-typing { color:#71717a; font-size:.8rem; padding:.5rem 1rem; }
    /* ── Tag badges ── */
    .tag { display:inline-block; padding:.2rem .55rem; border-radius:999px; font-size:.7rem; font-weight:600; }
    /* ── Sticky nav ── */
    #chapterNav { scrollbar-width:none; }
    #chapterNav::-webkit-scrollbar { display:none; }
    /* ── Badge ── */
    .badge-card { border:1px solid rgba(255,255,255,.06); border-radius:1rem; padding:1rem; text-align:center; background:rgba(24,24,27,.7); }
    .badge-card.earned { border-color:var(--gold); background:rgba(245,158,11,.08); }
    /* ── Fade in animation ── */
    @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
    .fade-up { animation:fadeUp .4s ease forwards; }
    /* ── Tooltip ── */
    [data-tip] { position:relative; cursor:help; border-bottom:1px dashed rgba(124,58,237,.6); }
    [data-tip]:hover::after {
      content:attr(data-tip);
      position:absolute; bottom:calc(100% + 6px); left:50%; transform:translateX(-50%);
      background:#27272a; border:1px solid rgba(124,58,237,.4); color:#e4e4e7;
      font-size:.75rem; padding:.4rem .7rem; border-radius:.5rem; white-space:normal;
      max-width:220px; z-index:100; pointer-events:none; line-height:1.4;
    }
  </style>
</head>
<body class="min-h-screen flex flex-col">

  <!-- ═══════════════════════ HEADER ═══════════════════════ -->
  <header class="wiki-hero sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
      <a href="/transparencia/" class="text-zinc-500 hover:text-white transition text-sm flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Portal
      </a>
      <div class="flex items-center gap-2 flex-1">
        <span class="text-2xl">📖</span>
        <div>
          <h1 class="font-black text-white text-lg leading-tight">Wiki da Política Brasileira</h1>
          <p class="text-violet-400 text-xs">Do voto ao Planalto — tudo explicado de verdade</p>
        </div>
      </div>
      <!-- XP + Progress -->
      <div class="hidden sm:flex items-center gap-3">
        <div class="text-right">
          <div class="text-xs text-zinc-500">Progresso</div>
          <div class="text-violet-300 font-bold text-sm" id="headerXP">0 XP</div>
        </div>
        <div class="w-28 h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div id="progressBar" class="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full" style="width:0%"></div>
        </div>
      </div>
    </div>
    <!-- Chapter nav strip -->
    <div id="chapterNav" class="border-t border-white/5 overflow-x-auto">
      <div class="flex gap-1 px-4 py-1.5 min-w-max">
        <?php
        $chapters = [
          ['sistema','🏛️','O Sistema'],
          ['poderes','⚡','Os Poderes'],
          ['cargos','👔','Cargos'],
          ['salarios','💰','Salários'],
          ['eleicoes','🗳️','Eleições'],
          ['deveres','⚖️','Deveres'],
          ['leis','📋','Como as Leis Nascem'],
          ['recursos','💳','Divisão de Recursos'],
          ['fiscalizacao','🔭','Fiscalização'],
          ['glossario','📚','Glossário'],
          ['quiz','🎯','Quiz Final'],
        ];
        foreach($chapters as [$id,$icon,$label]):
        ?>
        <a href="#ch-<?=$id?>" class="flex items-center gap-1 px-3 py-1 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition whitespace-nowrap chapter-nav-item" data-chapter="<?=$id?>">
          <?=$icon?> <?=$label?>
        </a>
        <?php endforeach; ?>
      </div>
    </div>
  </header>

  <div class="max-w-5xl mx-auto px-4 py-8 w-full space-y-10 pb-32">

    <!-- ═══════════════════════ HERO BANNER ═══════════════════════ -->
    <div class="glass rounded-2xl p-6 sm:p-8 text-center fade-up" style="background:linear-gradient(135deg,rgba(124,58,237,.15),rgba(168,85,247,.08));">
      <div class="text-5xl mb-3">🇧🇷</div>
      <h2 class="text-2xl sm:text-3xl font-black text-white mb-2">Entenda a Política de Uma Vez Por Todas</h2>
      <p class="text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base">
        Do vereador ao presidente, da câmara ao senado — tudo explicado de forma simples, honesta e gamificada.
        Leia cada capítulo, responda os quizzes e ganhe XP.
      </p>
      <div class="flex flex-wrap justify-center gap-3 mt-5">
        <div class="tag bg-violet-900/50 text-violet-300 border border-violet-500/30">8 capítulos</div>
        <div class="tag bg-green-900/50 text-green-300 border border-green-500/30">Quizzes interativos</div>
        <div class="tag bg-amber-900/50 text-amber-300 border border-amber-500/30">🤖 HyperBot integrado</div>
        <div class="tag bg-blue-900/50 text-blue-300 border border-blue-500/30">Dados reais</div>
      </div>
      <!-- Progress overview -->
      <div class="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="bg-zinc-900/60 rounded-xl p-3">
          <div class="text-2xl font-black text-violet-400" id="statsChapters">0/8</div>
          <div class="text-xs text-zinc-500">Capítulos lidos</div>
        </div>
        <div class="bg-zinc-900/60 rounded-xl p-3">
          <div class="text-2xl font-black text-amber-400" id="statsXP">0</div>
          <div class="text-xs text-zinc-500">XP ganho</div>
        </div>
        <div class="bg-zinc-900/60 rounded-xl p-3">
          <div class="text-2xl font-black text-green-400" id="statsQuizzes">0/8</div>
          <div class="text-xs text-zinc-500">Quizzes feitos</div>
        </div>
        <div class="bg-zinc-900/60 rounded-xl p-3">
          <div class="text-2xl font-black text-fuchsia-400" id="statsBadges">0</div>
          <div class="text-xs text-zinc-500">Badges</div>
        </div>
      </div>
    </div>

    <!-- ══════════════════ CAPÍTULO 1 — O SISTEMA ══════════════════ -->
    <section id="ch-sistema" class="chapter-card p-6 sm:p-8 fade-up">
      <div class="flex items-start gap-3 mb-5">
        <div class="text-4xl">🏛️</div>
        <div>
          <span class="tag bg-violet-900/50 text-violet-300 text-[10px] mb-1">Capítulo 1</span>
          <h2 class="text-xl font-black text-white">O Sistema Político Brasileiro</h2>
          <p class="text-zinc-500 text-sm">Como o Brasil é organizado politicamente</p>
        </div>
        <div class="ml-auto flex-shrink-0">
          <span class="tag bg-amber-900/40 text-amber-300 border border-amber-500/30">+50 XP</span>
        </div>
      </div>

      <div class="space-y-4 text-zinc-300 text-sm sm:text-base leading-relaxed">
        <div class="bg-violet-950/30 border border-violet-500/20 rounded-xl p-4">
          <h3 class="text-white font-bold mb-2">🔑 O Brasil é uma República Federativa Presidencialista</h3>
          <p>Isso significa três coisas importantes:</p>
          <ul class="mt-2 space-y-1 ml-4 list-disc">
            <li><strong class="text-violet-300">República</strong> — o chefe de Estado é eleito pelo povo (não é um rei ou rainha)</li>
            <li><strong class="text-violet-300">Federativa</strong> — o país é dividido em <span data-tip="26 estados + Distrito Federal, cada um com autonomia para criar suas próprias leis dentro dos limites da Constituição">27 unidades federativas</span> com autonomia própria</li>
            <li><strong class="text-violet-300">Presidencialista</strong> — o Presidente da República exerce o papel de chefe de governo E chefe de Estado ao mesmo tempo</li>
          </ul>
        </div>

        <h3 class="text-white font-bold text-base mt-5">🗺️ As 3 Esferas de Governo</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="bg-zinc-900/60 rounded-xl p-4 border border-white/5">
            <div class="text-2xl mb-1">🏛️</div>
            <h4 class="font-bold text-white mb-1">Federal</h4>
            <p class="text-zinc-400 text-xs">Governa o país inteiro. Presidente + Congresso Nacional (Senado + Câmara dos Deputados).</p>
          </div>
          <div class="bg-zinc-900/60 rounded-xl p-4 border border-white/5">
            <div class="text-2xl mb-1">🏘️</div>
            <h4 class="font-bold text-white mb-1">Estadual</h4>
            <p class="text-zinc-400 text-xs">Governa cada estado. Governador + Assembleia Legislativa. Cuida de saúde estadual, polícia militar, escolas estaduais.</p>
          </div>
          <div class="bg-zinc-900/60 rounded-xl p-4 border border-white/5">
            <div class="text-2xl mb-1">🏙️</div>
            <h4 class="font-bold text-white mb-1">Municipal</h4>
            <p class="text-zinc-400 text-xs">Governa cada cidade. Prefeito + Câmara Municipal (vereadores). Cuida de limpeza, transporte e saúde básica.</p>
          </div>
        </div>

        <div class="bg-zinc-900/50 rounded-xl p-4 mt-2 border-l-4 border-yellow-500">
          <p class="text-sm text-zinc-300">💡 <strong class="text-white">Curiosidade:</strong> O Brasil tem <strong>5.568 municípios</strong> e é o 5º maior país do mundo. Isso torna a gestão política muito complexa — cada cidade tem seu próprio prefeito, seus próprios vereadores e seu próprio orçamento.</p>
        </div>

        <h3 class="text-white font-bold text-base mt-4">📜 A Constituição de 1988</h3>
        <p>A Constituição Federal é a lei máxima do Brasil — todas as outras leis precisam respeitá-la. Foi promulgada em <strong class="text-violet-300">5 de outubro de 1988</strong>, após o fim da ditadura militar (1964–1985), e é chamada de <em>"Constituição Cidadã"</em> por garantir direitos fundamentais a todos os brasileiros.</p>
        <p>Nenhuma lei, decreto ou portaria pode contrariar a Constituição. O <span data-tip="Supremo Tribunal Federal — o tribunal mais alto do Brasil, guardião da Constituição">STF</span> é responsável por garantir que isso seja cumprido.</p>
      </div>

      <button onclick="markDone('sistema', this)" class="mark-done-btn mt-6 w-full py-2.5 rounded-xl bg-violet-700 hover:bg-violet-600 text-white font-bold transition flex items-center justify-center gap-2">
        ✅ Marcar como lido • +50 XP
      </button>
    </section>

    <!-- ══════════════════ CAPÍTULO 2 — OS PODERES ══════════════════ -->
    <section id="ch-poderes" class="chapter-card p-6 sm:p-8 fade-up">
      <div class="flex items-start gap-3 mb-5">
        <div class="text-4xl">⚡</div>
        <div>
          <span class="tag bg-blue-900/50 text-blue-300 text-[10px] mb-1">Capítulo 2</span>
          <h2 class="text-xl font-black text-white">Os 3 Poderes</h2>
          <p class="text-zinc-500 text-sm">Como o poder é dividido para evitar abusos</p>
        </div>
        <div class="ml-auto flex-shrink-0">
          <span class="tag bg-amber-900/40 text-amber-300 border border-amber-500/30">+50 XP</span>
        </div>
      </div>

      <div class="space-y-4 text-sm sm:text-base text-zinc-300 leading-relaxed">
        <p>Para evitar que uma só pessoa ou grupo concentre todo o poder, a Constituição divide o Estado em <strong class="text-white">3 Poderes independentes e harmônicos entre si:</strong></p>

        <div class="grid gap-4 sm:grid-cols-3 mt-2">
          <div class="rounded-xl p-5" style="background:linear-gradient(135deg,rgba(59,130,246,.15),rgba(37,99,235,.08));border:1px solid rgba(59,130,246,.25);">
            <div class="text-3xl mb-2">📋</div>
            <h3 class="font-bold text-blue-300 text-base mb-1">Legislativo</h3>
            <p class="text-zinc-400 text-xs mb-3">Cria as leis</p>
            <ul class="text-xs space-y-1 text-zinc-300">
              <li>• Senado Federal (81 senadores)</li>
              <li>• Câmara dos Deputados (513 deputados)</li>
              <li>• Assembleias Legislativas estaduais</li>
              <li>• Câmaras Municipais (vereadores)</li>
            </ul>
          </div>
          <div class="rounded-xl p-5" style="background:linear-gradient(135deg,rgba(124,58,237,.15),rgba(109,40,217,.08));border:1px solid rgba(124,58,237,.25);">
            <div class="text-3xl mb-2">⚙️</div>
            <h3 class="font-bold text-violet-300 text-base mb-1">Executivo</h3>
            <p class="text-zinc-400 text-xs mb-3">Executa as leis</p>
            <ul class="text-xs space-y-1 text-zinc-300">
              <li>• Presidente da República</li>
              <li>• Governadores estaduais</li>
              <li>• Prefeitos municipais</li>
              <li>• Ministros e secretários</li>
            </ul>
          </div>
          <div class="rounded-xl p-5" style="background:linear-gradient(135deg,rgba(239,68,68,.15),rgba(220,38,38,.08));border:1px solid rgba(239,68,68,.25);">
            <div class="text-3xl mb-2">⚖️</div>
            <h3 class="font-bold text-red-300 text-base mb-1">Judiciário</h3>
            <p class="text-zinc-400 text-xs mb-3">Aplica as leis e resolve conflitos</p>
            <ul class="text-xs space-y-1 text-zinc-300">
              <li>• STF (Supremo Tribunal Federal)</li>
              <li>• STJ (Superior Tribunal de Justiça)</li>
              <li>• TSE (Tribunal Superior Eleitoral)</li>
              <li>• TJ, TRF, juízes federais/estaduais</li>
            </ul>
          </div>
        </div>

        <div class="bg-zinc-900/50 rounded-xl p-4 border-l-4 border-green-500 mt-4">
          <h4 class="font-bold text-white mb-1">🔄 Sistema de Freios e Contrapesos</h4>
          <p class="text-zinc-300 text-sm">Cada poder fiscaliza os outros. Exemplo: o Presidente assina (ou veta) leis feitas pelo Congresso. O STF pode derrubar uma lei que contrarie a Constituição. O Congresso pode destituir o Presidente via <span data-tip="Processo que remove o presidente do cargo por crime de responsabilidade. No Brasil aconteceu com Collor (1992) e Dilma (2016).">impeachment</span>.</p>
        </div>

        <h3 class="text-white font-bold mt-4">🏦 Órgãos de Controle (independentes)</h3>
        <div class="grid sm:grid-cols-2 gap-3">
          <div class="bg-zinc-900/50 rounded-xl p-3 text-xs border border-white/5">
            <strong class="text-amber-300">TCU — Tribunal de Contas da União</strong><br/>
            <span class="text-zinc-400">Fiscaliza os gastos do governo federal. É quem aprova ou reprova as contas do Presidente.</span>
          </div>
          <div class="bg-zinc-900/50 rounded-xl p-3 text-xs border border-white/5">
            <strong class="text-amber-300">MPF — Ministério Público Federal</strong><br/>
            <span class="text-zinc-400">Defende os interesses da sociedade. Pode investigar e denunciar autoridades. Independe do governo.</span>
          </div>
          <div class="bg-zinc-900/50 rounded-xl p-3 text-xs border border-white/5">
            <strong class="text-amber-300">CGU — Controladoria-Geral da União</strong><br/>
            <span class="text-zinc-400">Controla a transparência e combate à corrupção no poder executivo federal.</span>
          </div>
          <div class="bg-zinc-900/50 rounded-xl p-3 text-xs border border-white/5">
            <strong class="text-amber-300">PGR — Procurador-Geral da República</strong><br/>
            <span class="text-zinc-400">Chefe do MPF. Único com poder de denunciar o Presidente ao STF.</span>
          </div>
        </div>
      </div>

      <button onclick="markDone('poderes', this)" class="mark-done-btn mt-6 w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold transition flex items-center justify-center gap-2">
        ✅ Marcar como lido • +50 XP
      </button>
    </section>

    <!-- ══════════════════ CAPÍTULO 3 — CARGOS ══════════════════ -->
    <section id="ch-cargos" class="chapter-card p-6 sm:p-8 fade-up">
      <div class="flex items-start gap-3 mb-5">
        <div class="text-4xl">👔</div>
        <div>
          <span class="tag bg-green-900/50 text-green-300 text-[10px] mb-1">Capítulo 3</span>
          <h2 class="text-xl font-black text-white">Cargos Políticos</h2>
          <p class="text-zinc-500 text-sm">Do vereador ao Presidente — quem faz o quê</p>
        </div>
        <div class="ml-auto flex-shrink-0">
          <span class="tag bg-amber-900/40 text-amber-300 border border-amber-500/30">+60 XP</span>
        </div>
      </div>

      <div class="space-y-5 text-sm sm:text-base text-zinc-300 leading-relaxed">
        <!-- Cards de cargo -->
        <?php
        $cargos = [
          ['🗳️','Vereador','Municipal','4 anos','Cria leis municipais, fiscaliza o prefeito, aprova o orçamento da cidade. É o político mais próximo do cidadão.','Min. 9 (cidades pequenas) até 55 (São Paulo)','Maioria simples (proporcional)'],
          ['🏙️','Prefeito','Municipal','4 anos','Chefe do Executivo municipal. Administra saúde básica, transporte, obras, limpeza urbana.','1 por cidade','Maioria absoluta (2 turnos se necessário)'],
          ['📜','Deputado Estadual','Estadual','4 anos','Faz leis estaduais, fiscaliza o governador, aprova o orçamento do estado.','Varia por estado (24 a 94)','Proporcional'],
          ['🏛️','Deputado Federal','Federal','4 anos','Faz leis nacionais, aprova o orçamento federal, fiscaliza o governo. Compõe a Câmara dos Deputados (513 membros).','513 no total','Proporcional por estado'],
          ['🎖️','Senador','Federal','8 anos','Representa os estados no Congresso. Revisa as leis feitas pela Câmara, aprova tratados internacionais e nomeações.','81 (3 por estado + DF)','Majoritário (mais votado ganha)'],
          ['🏛️','Governador','Estadual','4 anos','Chefe do Executivo estadual. Comanda a polícia militar, saúde e educação estadual, obras estaduais.','1 por estado','Maioria absoluta (2 turnos)'],
          ['🇧🇷','Presidente','Federal','4 anos','Chefe de Estado e de Governo. Comanda as Forças Armadas, assina/veta leis, nomeia ministros e embaixadores.','1','Maioria absoluta (2 turnos)'],
        ];
        foreach($cargos as [$icon,$nome,$esfera,$mandato,$funcao,$qtd,$voto]):
        ?>
        <details class="bg-zinc-900/50 rounded-xl border border-white/6 group">
          <summary class="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/3 rounded-xl transition list-none">
            <span class="text-2xl"><?=$icon?></span>
            <div class="flex-1">
              <span class="text-white font-bold"><?=$nome?></span>
              <span class="ml-2 tag <?=$esfera==='Federal'?'bg-violet-900/50 text-violet-300':''; echo $esfera==='Estadual'?'bg-blue-900/50 text-blue-300':''; echo $esfera==='Municipal'?'bg-green-900/50 text-green-300':''?> text-[10px]"><?=$esfera?></span>
            </div>
            <div class="text-xs text-zinc-500">Mandato: <?=$mandato?></div>
            <svg class="w-4 h-4 text-zinc-500 group-open:rotate-180 transition-transform ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </summary>
          <div class="px-4 pb-4 pt-1 grid sm:grid-cols-2 gap-3 text-xs text-zinc-400">
            <div><span class="text-zinc-500 block mb-0.5">Função</span><?=$funcao?></div>
            <div>
              <span class="text-zinc-500 block mb-0.5">Quantidade</span><?=$qtd?>
              <span class="text-zinc-500 block mt-2 mb-0.5">Sistema de voto</span><?=$voto?>
            </div>
          </div>
        </details>
        <?php endforeach; ?>

        <div class="bg-zinc-900/50 rounded-xl p-4 border-l-4 border-violet-500 mt-2">
          <h4 class="font-bold text-white mb-2">🔢 Quantos políticos o Brasil tem?</h4>
          <p class="text-sm text-zinc-300">São aproximadamente <strong class="text-white">59.000 vereadores</strong>, <strong class="text-white">5.568 prefeitos</strong>, <strong class="text-white">1.059 deputados estaduais</strong>, <strong class="text-white">513 deputados federais</strong>, <strong class="text-white">81 senadores</strong> e <strong class="text-white">27 governadores</strong>. No total, mais de <span class="text-violet-300 font-bold">66.000 cargos políticos eletivos</span> no Brasil.</p>
        </div>
      </div>

      <button onclick="markDone('cargos', this)" class="mark-done-btn mt-6 w-full py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white font-bold transition flex items-center justify-center gap-2">
        ✅ Marcar como lido • +60 XP
      </button>
    </section>

    <!-- ══════════════════ CAPÍTULO 4 — SALÁRIOS ══════════════════ -->
    <section id="ch-salarios" class="chapter-card p-6 sm:p-8 fade-up">
      <div class="flex items-start gap-3 mb-5">
        <div class="text-4xl">💰</div>
        <div>
          <span class="tag bg-amber-900/50 text-amber-300 text-[10px] mb-1">Capítulo 4</span>
          <h2 class="text-xl font-black text-white">Salários, Subsídios e Benefícios</h2>
          <p class="text-zinc-500 text-sm">Quanto os políticos ganham de verdade</p>
        </div>
        <div class="ml-auto flex-shrink-0">
          <span class="tag bg-amber-900/40 text-amber-300 border border-amber-500/30">+70 XP</span>
        </div>
      </div>

      <div class="space-y-5 text-sm text-zinc-300 leading-relaxed">
        <div class="bg-amber-950/30 border border-amber-500/20 rounded-xl p-4 text-sm">
          <h3 class="font-bold text-amber-300 mb-1">⚠️ O que é "subsídio"?</h3>
          <p>Políticos não recebem "salário" como trabalhadores CLT. Recebem <strong class="text-white">subsídio</strong> — uma verba fixa definida em lei, sem adicionais de hora extra ou gratificações. O teto do funcionalismo público (e dos políticos federais) é o subsídio dos Ministros do STF.</p>
        </div>

        <!-- Tabela de remuneração -->
        <div class="overflow-x-auto rounded-xl border border-white/6">
          <table class="salary-table w-full text-xs">
            <thead>
              <tr>
                <th>Cargo</th>
                <th>Subsídio (2024)</th>
                <th>Verba de Gabinete</th>
                <th>Outros benefícios</th>
              </tr>
            </thead>
            <tbody class="text-zinc-300">
              <tr><td>🇧🇷 Presidente</td><td class="text-amber-300 font-bold">R$ 30.934</td><td>Não se aplica</td><td>Residência oficial, aeronave, segurança</td></tr>
              <tr><td>🇧🇷 Vice-Presidente</td><td class="text-amber-300 font-bold">R$ 29.387</td><td>—</td><td>Residência oficial</td></tr>
              <tr><td>🏛️ Ministro de Estado</td><td class="text-amber-300 font-bold">R$ 46.366</td><td>—</td><td>Carro oficial, equipe</td></tr>
              <tr><td>🎖️ Senador</td><td class="text-amber-300 font-bold">R$ 46.366</td><td>Até R$ 100.000/mês</td><td>CEAP, passagens, cota postal</td></tr>
              <tr><td>🏛️ Deputado Federal</td><td class="text-amber-300 font-bold">R$ 46.366</td><td>Até R$ 100.000/mês</td><td>CEAP, passagens aéreas</td></tr>
              <tr><td>📜 Dep. Estadual (média)</td><td class="text-amber-300 font-bold">R$ 15.000–35.000</td><td>Varia por estado</td><td>Varia</td></tr>
              <tr><td>🏙️ Prefeito (capital)</td><td class="text-amber-300 font-bold">R$ 20.000–35.000</td><td>—</td><td>Carro oficial, motorista</td></tr>
              <tr><td>🏙️ Prefeito (interior)</td><td class="text-amber-300 font-bold">R$ 3.000–12.000</td><td>—</td><td>Varia muito</td></tr>
              <tr><td>🗳️ Vereador (capital)</td><td class="text-amber-300 font-bold">R$ 15.000–25.000</td><td>Verba de gabinete</td><td>Varia</td></tr>
              <tr><td>🗳️ Vereador (interior)</td><td class="text-amber-300 font-bold">R$ 500–5.000</td><td>Mínimo/nenhum</td><td>Mínimo</td></tr>
            </tbody>
          </table>
        </div>

        <h3 class="text-white font-bold mt-4">📋 O que é a CEAP?</h3>
        <p>A <strong class="text-white">Cota para o Exercício da Atividade Parlamentar</strong> permite que deputados federais gastem até <strong class="text-amber-300">R$ 45.613 por mês</strong> com despesas "de trabalho": passagens aéreas, hospedagem, alimentação, combustível, telefone, materiais de escritório, consultoria... O problema é que há pouquíssima fiscalização — e esse é um dos temas mais polêmicos da política brasileira.</p>

        <div class="grid sm:grid-cols-3 gap-3 mt-3">
          <div class="bg-zinc-900/60 rounded-xl p-3 text-xs text-center">
            <div class="text-xl font-black text-red-400">R$ 1.8 bi</div>
            <div class="text-zinc-500 mt-1">Gasto anual estimado com CEAP (Câmara + Senado)</div>
          </div>
          <div class="bg-zinc-900/60 rounded-xl p-3 text-xs text-center">
            <div class="text-xl font-black text-amber-400">R$ 100k</div>
            <div class="text-zinc-500 mt-1">Verba de gabinete mensal (limite por parlamentar)</div>
          </div>
          <div class="bg-zinc-900/60 rounded-xl p-3 text-xs text-center">
            <div class="text-xl font-black text-violet-400">~R$ 400k</div>
            <div class="text-zinc-500 mt-1">Custo mensal real estimado por parlamentar federal (todos os benefícios)</div>
          </div>
        </div>

        <div class="bg-zinc-900/50 rounded-xl p-4 border-l-4 border-red-500 mt-2">
          <h4 class="font-bold text-white mb-1">🏖️ Benefícios polêmicos</h4>
          <ul class="text-xs text-zinc-300 space-y-1 ml-3 list-disc">
            <li>Parlamentares federais têm direito a <strong class="text-white">passagens aéreas gratuitas</strong> em voos domésticos, inclusive para familiares em alguns casos</li>
            <li><strong class="text-white">Seguro de vida</strong> pago pelo contribuinte</li>
            <li>Plano de saúde <strong class="text-white">Parlamentar</strong> (subsidado)</li>
            <li>Verba de comunicação (para contratar assessoria de imprensa)</li>
            <li>Auxílio-moradia de <strong class="text-white">R$ 4.253</strong> para parlamentares que não moram em Brasília</li>
          </ul>
        </div>
      </div>

      <button onclick="markDone('salarios', this)" class="mark-done-btn mt-6 w-full py-2.5 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-bold transition flex items-center justify-center gap-2">
        ✅ Marcar como lido • +70 XP
      </button>
    </section>

    <!-- ══════════════════ CAPÍTULO 5 — ELEIÇÕES ══════════════════ -->
    <section id="ch-eleicoes" class="chapter-card p-6 sm:p-8 fade-up">
      <div class="flex items-start gap-3 mb-5">
        <div class="text-4xl">🗳️</div>
        <div>
          <span class="tag bg-red-900/50 text-red-300 text-[10px] mb-1">Capítulo 5</span>
          <h2 class="text-xl font-black text-white">Como Funcionam as Eleições</h2>
          <p class="text-zinc-500 text-sm">Do TSE à urna eletrônica</p>
        </div>
        <div class="ml-auto flex-shrink-0">
          <span class="tag bg-amber-900/40 text-amber-300 border border-amber-500/30">+60 XP</span>
        </div>
      </div>

      <div class="space-y-5 text-sm text-zinc-300 leading-relaxed">
        <div class="grid sm:grid-cols-2 gap-4">
          <div class="bg-zinc-900/60 rounded-xl p-4 border border-white/5">
            <h3 class="font-bold text-white mb-2">📊 Sistema Majoritário</h3>
            <p class="text-xs">Ganha quem tem <strong>mais votos absolutos</strong>. Usado para Presidente, Governadores, Prefeitos e Senadores. Pode ter 2º turno se ninguém atingir 50%+1 votos no 1º turno.</p>
            <div class="mt-2 text-xs bg-zinc-800 rounded-lg p-2 text-zinc-400">Ex: Lula teve 50,9% × Bolsonaro 49,1% no 2º turno de 2022</div>
          </div>
          <div class="bg-zinc-900/60 rounded-xl p-4 border border-white/5">
            <h3 class="font-bold text-white mb-2">📊 Sistema Proporcional</h3>
            <p class="text-xs">Usado para Deputados Federais, Estaduais e Vereadores. A quantidade de vagas para cada partido depende dos votos que ele recebeu. Um candidato com poucos votos pode ser eleito se o partido tiver muitos votos.</p>
            <div class="mt-2 text-xs bg-zinc-800 rounded-lg p-2 text-zinc-400">Ex: Deputado pouco votado "pega carona" nos votos de um candidato famoso do mesmo partido</div>
          </div>
        </div>

        <h3 class="text-white font-bold mt-3">⏱️ Calendário Eleitoral</h3>
        <div class="relative mt-3">
          <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-violet-800/50"></div>
          <div class="space-y-4 ml-10">
            <div class="relative"><div class="absolute -left-7 w-4 h-4 rounded-full bg-violet-600 border-2 border-violet-400 top-0.5"></div><div class="text-xs"><span class="text-violet-300 font-bold">Outubro (anos pares) — Eleições Municipais OU Gerais</span><br/>Alternadas: municipais a cada 4 anos (2020, 2024...) e gerais a cada 4 anos (2018, 2022, 2026...)</div></div>
            <div class="relative"><div class="absolute -left-7 w-4 h-4 rounded-full bg-blue-600 border-2 border-blue-400 top-0.5"></div><div class="text-xs"><span class="text-blue-300 font-bold">Voto é obrigatório</span> para cidadãos entre 18 e 70 anos com título eleitoral.<br/><span class="text-zinc-400">Opcional: maiores de 70, menores de 18, analfabetos</span></div></div>
            <div class="relative"><div class="absolute -left-7 w-4 h-4 rounded-full bg-green-600 border-2 border-green-400 top-0.5"></div><div class="text-xs"><span class="text-green-300 font-bold">Urna Eletrônica</span> — criada em 1996. O Brasil foi um dos primeiros países a adotar votação 100% eletrônica. O resultado é apurado em poucas horas.</div></div>
          </div>
        </div>

        <h3 class="text-white font-bold mt-4">💸 Fundo Eleitoral — Como os partidos são financiados</h3>
        <p>Campanhas eleitorais no Brasil são financiadas por:</p>
        <ul class="ml-4 list-disc text-xs space-y-1 mt-2">
          <li><strong class="text-white">Fundo Especial de Financiamento de Campanha (FEFC)</strong> — verba pública. Em 2022 foram <strong class="text-red-300">R$ 4,9 bilhões</strong> distribuídos entre os partidos</li>
          <li><strong class="text-white">Fundo Partidário</strong> — R$ 1+ bilhão/ano para manutenção dos partidos, pago pelos contribuintes</li>
          <li><strong class="text-white">Doações de pessoas físicas</strong> — limitado por lei</li>
          <li><span class="line-through text-zinc-500">Doações de empresas</span> — proibidas desde 2015 após o escândalo do Mensalão e Lava Jato</li>
        </ul>

        <div class="bg-red-950/30 border border-red-500/20 rounded-xl p-4 text-xs mt-2">
          <strong class="text-red-300">🚨 Caixa 2:</strong> É ilegal usar dinheiro não declarado para financiar campanhas. O "caixa dois" eleitoral é crime, investigado pelo TSE e Ministério Público.
        </div>
      </div>

      <button onclick="markDone('eleicoes', this)" class="mark-done-btn mt-6 w-full py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold transition flex items-center justify-center gap-2">
        ✅ Marcar como lido • +60 XP
      </button>
    </section>

    <!-- ══════════════════ CAPÍTULO 6 — DEVERES ══════════════════ -->
    <section id="ch-deveres" class="chapter-card p-6 sm:p-8 fade-up">
      <div class="flex items-start gap-3 mb-5">
        <div class="text-4xl">⚖️</div>
        <div>
          <span class="tag bg-purple-900/50 text-purple-300 text-[10px] mb-1">Capítulo 6</span>
          <h2 class="text-xl font-black text-white">Deveres e Direitos dos Políticos</h2>
          <p class="text-zinc-500 text-sm">O que podem, o que não podem e o que devem fazer</p>
        </div>
        <div class="ml-auto flex-shrink-0">
          <span class="tag bg-amber-900/40 text-amber-300 border border-amber-500/30">+60 XP</span>
        </div>
      </div>

      <div class="space-y-5 text-sm text-zinc-300 leading-relaxed">
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <h3 class="text-green-300 font-bold mb-3">✅ Direitos Parlamentares</h3>
            <ul class="space-y-2">
              <li class="flex gap-2"><span class="text-green-400 mt-0.5">▸</span><div><strong class="text-white">Imunidade material</strong> — não podem ser presos ou processados por opiniões, votos ou palavras ditas no exercício do mandato</div></li>
              <li class="flex gap-2"><span class="text-green-400 mt-0.5">▸</span><div><strong class="text-white">Imunidade formal</strong> — têm <span data-tip="Foro privilegiado significa que um parlamentar federal só pode ser julgado pelo STF, não por um juiz de 1ª instância. Em 2018 o STF limitou isso a crimes durante o mandato e no exercício das funções.">foro privilegiado</span> no STF para crimes durante o mandato</div></li>
              <li class="flex gap-2"><span class="text-green-400 mt-0.5">▸</span><div><strong class="text-white">Licença remunerada</strong> — podem se licenciar para assumir cargos no Executivo</div></li>
              <li class="flex gap-2"><span class="text-green-400 mt-0.5">▸</span><div><strong class="text-white">Aposentadoria especial</strong> — após certos anos de mandato</div></li>
            </ul>
          </div>
          <div>
            <h3 class="text-red-300 font-bold mb-3">❌ Vedações (o que é proibido)</h3>
            <ul class="space-y-2">
              <li class="flex gap-2"><span class="text-red-400 mt-0.5">▸</span><div>Firmar contrato com o governo ou empresa pública</div></li>
              <li class="flex gap-2"><span class="text-red-400 mt-0.5">▸</span><div>Ser titular de mais de um cargo eletivo</div></li>
              <li class="flex gap-2"><span class="text-red-400 mt-0.5">▸</span><div>Ser sócio de empresa que contrata com o poder público</div></li>
              <li class="flex gap-2"><span class="text-red-400 mt-0.5">▸</span><div>Usar o cargo para benefício pessoal ou de familiares (<span data-tip="Ato de aparelhar o governo com parentes. O STF proibiu o nepotismo na Súmula Vinculante nº 13.">nepotismo</span>)</div></li>
              <li class="flex gap-2"><span class="text-red-400 mt-0.5">▸</span><div>Aceitar propina, presentes ou vantagens (<span data-tip="Crime de corrupção passiva — pena de 2 a 12 anos de reclusão.">crime de corrupção</span>)</div></li>
            </ul>
          </div>
        </div>

        <h3 class="text-white font-bold mt-4">📋 Deveres e Obrigações</h3>
        <div class="grid sm:grid-cols-3 gap-3">
          <div class="bg-zinc-900/60 rounded-xl p-3 text-xs border border-white/5">
            <div class="text-lg mb-1">📆</div>
            <strong class="text-white">Frequência</strong>
            <p class="text-zinc-400 mt-1">Deputados que faltarem mais de ⅓ das votações sem justificativa perdem o mandato. Na prática raramente é aplicado.</p>
          </div>
          <div class="bg-zinc-900/60 rounded-xl p-3 text-xs border border-white/5">
            <div class="text-lg mb-1">📝</div>
            <strong class="text-white">Declaração de bens</strong>
            <p class="text-zinc-400 mt-1">Todo político eleito deve declarar seus bens à Receita Federal e ao TSE. Disponível publicamente.</p>
          </div>
          <div class="bg-zinc-900/60 rounded-xl p-3 text-xs border border-white/5">
            <div class="text-lg mb-1">🗺️</div>
            <strong class="text-white">Transparência</strong>
            <p class="text-zinc-400 mt-1">Gastos com CEAP, verba de gabinete e contratos devem ser publicados no Portal da Transparência.</p>
          </div>
        </div>

        <div class="bg-zinc-900/50 rounded-xl p-4 border-l-4 border-violet-500 mt-2">
          <h4 class="font-bold text-white mb-2">⚖️ Como um político pode perder o mandato?</h4>
          <ul class="text-xs space-y-1 ml-3 list-disc text-zinc-300">
            <li>Condenação criminal transitada em julgado (sem recurso)</li>
            <li>Suspensão ou perda dos direitos políticos</li>
            <li>Decreto de Justiça Eleitoral pela infidelidade partidária</li>
            <li>Condenação por abuso de poder econômico ou uso indevido de meios de comunicação</li>
            <li>Cassação pela Casa Legislativa (voto dos colegas) por quebra de decoro parlamentar</li>
          </ul>
        </div>
      </div>

      <button onclick="markDone('deveres', this)" class="mark-done-btn mt-6 w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold transition flex items-center justify-center gap-2">
        ✅ Marcar como lido • +60 XP
      </button>
    </section>

    <!-- ══════════════════ CAPÍTULO 7 — GLOSSÁRIO ══════════════════ -->
    <section id="ch-glossario" class="chapter-card p-6 sm:p-8 fade-up">
      <div class="flex items-start gap-3 mb-5">
        <div class="text-4xl">📚</div>
        <div>
          <span class="tag bg-cyan-900/50 text-cyan-300 text-[10px] mb-1">Capítulo 7</span>
          <h2 class="text-xl font-black text-white">Glossário Político</h2>
          <p class="text-zinc-500 text-sm">Os termos que você ouve e nunca explicaram direito</p>
        </div>
        <div class="ml-auto flex-shrink-0">
          <span class="tag bg-amber-900/40 text-amber-300 border border-amber-500/30">+40 XP</span>
        </div>
      </div>

      <div class="mb-4">
        <input type="text" id="glossarioSearch" oninput="filterGlossario(this.value)" placeholder="🔍 Buscar termo..." class="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-violet-500 outline-none placeholder-zinc-600"/>
      </div>

      <div id="glossarioList" class="grid sm:grid-cols-2 gap-2 text-xs">
        <?php
        $termos = [
          ['Medida Provisória (MP)','Ato do Presidente com força de lei imediata, sem aprovação prévia do Congresso. Vigora por 60 dias (prorrogáveis por mais 60). O Congresso pode rejeitá-la.'],
          ['PEC','Proposta de Emenda à Constituição. Para alterar a Constituição, precisa de 3/5 dos votos em 2 turnos em cada Casa. É muito difícil de aprovar.'],
          ['PLs e MPVs','PL = Projeto de Lei. Proposta de criação de nova lei, apresentada por parlamentar, presidente ou cidadãos (com 1% do eleitorado).'],
          ['Emenda Parlamentar','Verba destinada a municípios ou estados por iniciativa individual do parlamentar. Pode ser impositiva (obrigatória de executar) ou voluntária.'],
          ['Pork Barrel','Expressão americana usada no Brasil para descrever emendas usadas para comprar apoio político.'],
          ['Fisiologismo','Prática de apoiar o governo em troca de cargos e verbas, independente de convicção ideológica.'],
          ['Centrão','Grupo de partidos sem ideologia definida que apoiam quem estiver no poder em troca de benefícios.'],
          ['Caixa Dois','Financiamento ilegal de campanhas com dinheiro não declarado. Crime eleitoral.'],
          ['Mensalão','Escândalo (2005) em que o governo Lula pagava mesadas a parlamentares para votarem a favor do governo.'],
          ['Lava Jato','Operação da Polícia Federal (2014) que investigou corrupção na Petrobras e outros órgãos. Maior operação anticorrupção da história do Brasil.'],
          ['Delação Premiada','Acordo entre réu e Ministério Público onde o réu confessa e delata outros em troca de redução de pena.'],
          ['Habeas Corpus','Instrumento jurídico que protege a liberdade do indivíduo. Pode suspender uma prisão se considerada ilegal.'],
          ['Presunção de Inocência','Princípio constitucional: ninguém é culpado antes do trânsito em julgado (fim de todos os recursos).'],
          ['Nepotismo','Nomear parentes para cargos públicos. Proibido pela Súmula Vinculante 13 do STF.'],
          ['Lobby','Pressão organizada de grupos de interesse sobre parlamentares. Legal se transparente, ilegal se envolver corrupção.'],
          ['Quórum','Número mínimo de parlamentares presentes para que uma votação seja válida.'],
          ['Reeleição','Presidente, governadores e prefeitos podem se reeleger uma vez. Senadores e deputados podem se reeleger infinitas vezes.'],
          ['Recall','Mecanismo que permite revogar mandatos por votação popular. Existe em alguns países, mas não existe no Brasil.'],
          ['Plenário','Reunião de todos os parlamentares de uma Casa para deliberar e votar projetos.'],
          ['Comissão Parlamentar de Inquérito (CPI)','Investigação conduzida pelo Legislativo sobre assuntos de interesse público. Tem poderes de testemunho e quebra de sigilo.'],
          ['Voto de Confiança','No parlamentarismo, o governo precisa da confiança do parlamento para governar. No presidencialismo brasileiro não existe formalmente.'],
          ['Decreto-Lei','Instrumento usado na ditadura militar. Hoje existem as Medidas Provisórias, com mais controle parlamentar.'],
          ['Orçamento Impositivo','Desde 2015, o governo é obrigado a executar as emendas parlamentares individuais aprovadas pelo Congresso.'],
        ];
        foreach($termos as [$termo,$def]):
        ?>
        <div class="glossario-item bg-zinc-900/60 rounded-xl p-3 border border-white/5 hover:border-violet-500/30 transition">
          <dt class="text-violet-300 font-bold mb-1"><?=htmlspecialchars($termo)?></dt>
          <dd class="text-zinc-400 leading-relaxed"><?=htmlspecialchars($def)?></dd>
        </div>
        <?php endforeach; ?>
      </div>

      <button onclick="markDone('glossario', this)" class="mark-done-btn mt-6 w-full py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-bold transition flex items-center justify-center gap-2">
        ✅ Marcar como lido • +40 XP
      </button>
    </section>

    <!-- ══════════════════ CAPÍTULO 7b — COMO AS LEIS NASCEM ══════════════════ -->
    <section id="ch-leis" class="chapter-card p-6 sm:p-8 fade-up">
      <div class="flex items-start gap-3 mb-5">
        <div class="text-4xl">📋</div>
        <div>
          <span class="tag bg-blue-900/50 text-blue-300 text-[10px] mb-1">Capítulo 7b</span>
          <h2 class="text-xl font-black text-white">Como as Leis Nascem no Brasil</h2>
          <p class="text-zinc-500 text-sm">Da proposta à publicação no Diário Oficial</p>
        </div>
        <div class="ml-auto flex-shrink-0"><span class="tag bg-amber-900/40 text-amber-300 border border-amber-500/30">+70 XP</span></div>
      </div>
      <div class="space-y-5 text-sm sm:text-base text-zinc-300 leading-relaxed">

        <h3 class="text-white font-bold">📝 Tipos de Proposição Legislativa</h3>
        <div class="grid sm:grid-cols-2 gap-3">
          <div class="bg-zinc-900/60 rounded-xl p-4 border border-white/5">
            <h4 class="font-bold text-violet-300 mb-1">PL — Projeto de Lei Ordinária</h4>
            <p class="text-xs text-zinc-400">O tipo mais comum. Pode ser apresentado por qualquer parlamentar, pelo Presidente, pelo STF, pelo TCU, pelo MP ou pela sociedade civil com 1% do eleitorado. Aprovado por maioria simples.</p>
          </div>
          <div class="bg-zinc-900/60 rounded-xl p-4 border border-white/5">
            <h4 class="font-bold text-violet-300 mb-1">PEC — Proposta de Emenda Constitucional</h4>
            <p class="text-xs text-zinc-400">Altera a Constituição. Exige 3/5 dos votos em <strong>2 turnos</strong> em cada Casa. Pode ser proposta por 1/3 dos deputados, 1/3 dos senadores, o Presidente ou mais da metade das assembleias estaduais.</p>
          </div>
          <div class="bg-zinc-900/60 rounded-xl p-4 border border-white/5">
            <h4 class="font-bold text-violet-300 mb-1">MP — Medida Provisória</h4>
            <p class="text-xs text-zinc-400">Expedida pelo Presidente com força de lei imediata, sem aprovação prévia. Vigora por 60 dias (prorrogáveis por mais 60). O Congresso pode aprová-la, rejeitar ou modificar. Se caducar sem votação, perde efeito.</p>
          </div>
          <div class="bg-zinc-900/60 rounded-xl p-4 border border-white/5">
            <h4 class="font-bold text-violet-300 mb-1">PLP — Projeto de Lei Complementar</h4>
            <p class="text-xs text-zinc-400">Trata de matérias específicas previstas na Constituição (como lei tributária, Lei de Responsabilidade Fiscal). Requer maioria absoluta (mais da metade dos membros).</p>
          </div>
          <div class="bg-zinc-900/60 rounded-xl p-4 border border-white/5">
            <h4 class="font-bold text-violet-300 mb-1">PLN — Projeto de Lei do Congresso</h4>
            <p class="text-xs text-zinc-400">Tratado pelas duas Casas reunidas. Usado para aprovação do orçamento federal (LOA), LDO e PPA.</p>
          </div>
          <div class="bg-zinc-900/60 rounded-xl p-4 border border-white/5">
            <h4 class="font-bold text-violet-300 mb-1">Decreto Legislativo e Resolução</h4>
            <p class="text-xs text-zinc-400">Decreto Legislativo: aprovado pelo Congresso sem sanção presidencial (ex: ratificar tratados internacionais). Resolução: norma interna de cada Casa, sem passar pela outra.</p>
          </div>
        </div>

        <h3 class="text-white font-bold mt-4">🗺️ O Processo Legislativo — Passo a Passo</h3>
        <div class="space-y-2 mt-2">
          <?php $steps = [
            ['1','📝','Apresentação da Proposta','O autor protocola o texto na Mesa da Câmara (se PL) ou do Senado. O documento recebe número e é publicado no sistema.'],
            ['2','📂','Comissões Temáticas','A proposta é enviada às comissões relevantes: CAE (Assuntos Econômicos), CAS (Saúde), CCJ (Constituição e Justiça), etc. Cada comissão nomeia um relator que analisa e sugere alterações (emendas). Pode ser aprovada nas comissões sem ir ao plenário — é o poder terminativo das comissões.'],
            ['3','⚡','Regime de Urgência','O Presidente da República pode solicitar urgência em projetos, que passa a tramitar em prazo menor (45 dias em cada Casa). Parlamentares também podem pedir regime de urgência por votação.'],
            ['4','🗳️','Votação no Plenário','Se for ao plenário, todos os parlamentares da Casa votam. Para aprovação: PL ordinário = maioria simples dos presentes; PLP = maioria absoluta; PEC = 3/5 em 2 turnos.'],
            ['5','↔️','Revisão pela Outra Casa','Toda proposta iniciada na Câmara precisa ser revisada pelo Senado e vice-versa. Se houver emendas, volta para a Casa original.'],
            ['6','✍️','Sanção ou Veto Presidencial','O Presidente tem 15 dias úteis para sancionar (aprovar) ou vetar (rejeitar) total ou parcialmente. O veto pode ser derrubado pelo Congresso por maioria absoluta em sessão conjunta.'],
            ['7','📰','Publicação no DOU','A lei publicada no Diário Oficial da União entra em vigor na data publicada ou conforme previsto no texto (vacatio legis — período de adaptação que pode ser de 45 dias a 1 ano).'],
          ]; foreach($steps as [$n,$icon,$title,$desc]): ?>
          <div class="flex gap-3 items-start bg-zinc-900/40 rounded-xl p-3 border border-white/5">
            <div class="w-7 h-7 rounded-full bg-violet-800/50 flex items-center justify-center text-violet-300 font-black text-xs flex-shrink-0"><?=$n?></div>
            <div><div class="flex items-center gap-2 mb-0.5"><span class="text-base"><?=$icon?></span><strong class="text-white text-sm"><?=$title?></strong></div><p class="text-zinc-400 text-xs"><?=$desc?></p></div>
          </div>
          <?php endforeach; ?>
        </div>

        <div class="bg-amber-950/30 border border-amber-500/20 rounded-xl p-4 mt-2">
          <h4 class="font-bold text-amber-300 mb-2">🔢 Números que impressionam</h4>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div class="bg-zinc-900/60 rounded-xl p-2"><div class="text-lg font-black text-violet-400">~30.000</div><div class="text-zinc-500">Propostas em tramitação na Câmara (2024)</div></div>
            <div class="bg-zinc-900/60 rounded-xl p-2"><div class="text-lg font-black text-blue-400">~800</div><div class="text-zinc-500">Leis aprovadas por ano em média</div></div>
            <div class="bg-zinc-900/60 rounded-xl p-2"><div class="text-lg font-black text-amber-400">~180 dias</div><div class="text-zinc-500">Tempo médio de tramitação de um PL</div></div>
            <div class="bg-zinc-900/60 rounded-xl p-2"><div class="text-lg font-black text-green-400">+42.000</div><div class="text-zinc-500">Leis federais vigentes no Brasil</div></div>
          </div>
        </div>

        <h3 class="text-white font-bold mt-4">🏛️ Principais Comissões da Câmara</h3>
        <div class="overflow-x-auto"><table class="salary-table w-full text-xs"><thead><tr><th>Sigla</th><th>Nome completo</th><th>O que analisa</th></tr></thead><tbody class="text-zinc-300">
          <tr><td class="text-violet-300 font-bold">CCJ</td><td>Comissão de Constituição e Justiça</td><td>Constitucionalidade de todas as propostas</td></tr>
          <tr><td class="text-violet-300 font-bold">CFT</td><td>Comissão de Finanças e Tributação</td><td>Impacto financeiro das propostas</td></tr>
          <tr><td class="text-violet-300 font-bold">CAPADR</td><td>Comissão de Agricultura</td><td>Agropecuária, abastecimento, irrigação</td></tr>
          <tr><td class="text-violet-300 font-bold">CSSF</td><td>Comissão de Seguridade Social e Família</td><td>Saúde, previdência, assistência social</td></tr>
          <tr><td class="text-violet-300 font-bold">CDEICS</td><td>Comissão de Desenvolvimento Econômico</td><td>Indústria, comércio, serviços</td></tr>
          <tr><td class="text-violet-300 font-bold">CME</td><td>Comissão de Minas e Energia</td><td>Petróleo, gás, energia elétrica</td></tr>
          <tr><td class="text-violet-300 font-bold">CPI</td><td>Comissão Parlamentar de Inquérito</td><td>Investigação de fatos determinados</td></tr>
        </tbody></table></div>

        <button class="wiki-lookup-btn mt-3 text-xs bg-blue-900/40 border border-blue-500/30 text-blue-300 rounded-lg px-3 py-1.5 hover:bg-blue-800/40 transition" onclick="openWiki('Processo_legislativo_no_Brasil')">
          🔍 Ver mais sobre Processo Legislativo na Wikipedia
        </button>
      </div>
      <button onclick="markDone('leis', this)" class="mark-done-btn mt-6 w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold transition flex items-center justify-center gap-2">
        ✅ Marcar como lido • +70 XP
      </button>
    </section>

    <!-- ══════════════════ CAPÍTULO 7c — DIVISÃO DE RECURSOS ══════════════════ -->
    <section id="ch-recursos" class="chapter-card p-6 sm:p-8 fade-up">
      <div class="flex items-start gap-3 mb-5">
        <div class="text-4xl">💳</div>
        <div>
          <span class="tag bg-green-900/50 text-green-300 text-[10px] mb-1">Capítulo 7c</span>
          <h2 class="text-xl font-black text-white">Divisão de Recursos e Orçamento Público</h2>
          <p class="text-zinc-500 text-sm">Como o dinheiro público é arrecadado e distribuído</p>
        </div>
        <div class="ml-auto flex-shrink-0"><span class="tag bg-amber-900/40 text-amber-300 border border-amber-500/30">+80 XP</span></div>
      </div>
      <div class="space-y-5 text-sm sm:text-base text-zinc-300 leading-relaxed">

        <div class="bg-green-950/30 border border-green-500/20 rounded-xl p-4">
          <h3 class="font-bold text-green-300 mb-3">💰 Arrecadação do Governo Federal (2023)</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-center">
            <div class="bg-zinc-900/60 rounded-xl p-2"><div class="text-lg font-black text-green-400">R$ 2,9 tri</div><div class="text-zinc-500">Receita total arrecadada</div></div>
            <div class="bg-zinc-900/60 rounded-xl p-2"><div class="text-lg font-black text-red-400">R$ 3,1 tri</div><div class="text-zinc-500">Despesa total executada</div></div>
            <div class="bg-zinc-900/60 rounded-xl p-2"><div class="text-lg font-black text-amber-400">R$ 200 bi</div><div class="text-zinc-500">Déficit primário</div></div>
            <div class="bg-zinc-900/60 rounded-xl p-2"><div class="text-lg font-black text-violet-400">R$ 7,9 tri</div><div class="text-zinc-500">Dívida pública total (bruta)</div></div>
            <div class="bg-zinc-900/60 rounded-xl p-2"><div class="text-lg font-black text-blue-400">37,5%</div><div class="text-zinc-500">Carga tributária % PIB</div></div>
            <div class="bg-zinc-900/60 rounded-xl p-2"><div class="text-lg font-black text-pink-400">R$ 926 bi</div><div class="text-zinc-500">Custo da dívida (juros anuais)</div></div>
          </div>
        </div>

        <h3 class="text-white font-bold">📊 Para onde vai o dinheiro? (Despesas federais 2023)</h3>
        <div class="space-y-2 mt-2">
          <?php $gastos = [
            ['Previdência Social (INSS)','R$ 968 bi','33%','bg-red-500','A maior despesa do governo. Paga aposentadorias, pensões, LOAS, BPC.'],
            ['Juros da Dívida Pública','R$ 580 bi','20%','bg-orange-500','O Brasil paga uma das maiores taxas de juros reais do mundo.'],
            ['Transferências a Estados e Municípios','R$ 320 bi','11%','bg-blue-500','FPM, FPE, SUS, FUNDEB, transferências constitucionais.'],
            ['Funcionalismo Público Federal','R$ 290 bi','10%','bg-violet-500','Salários de servidores, militares, magistrados, parlamentares.'],
            ['Saúde (SUS)','R$ 188 bi','6%','bg-green-500','Repasses ao SUS, programas federais de saúde.'],
            ['Educação e Cultura','R$ 120 bi','4%','bg-cyan-500','FUNDEB, universidades federais, merenda escolar.'],
            ['Bolsa Família / Auxílios Sociais','R$ 168 bi','6%','bg-pink-500','Bolsa Família, BPC, seguro-desemprego, abono salarial.'],
            ['Outros (infraestrutura, segurança, defesa...)','R$ 290 bi','10%','bg-zinc-500','Estradas, obras, Exército, Polícia Federal, etc.'],
          ]; foreach($gastos as [$nome,$valor,$pct,$cor,$desc]): ?>
          <div class="bg-zinc-900/50 rounded-xl p-3 border border-white/5">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-white text-xs font-bold"><?=$nome?></span>
              <div class="flex items-center gap-2">
                <span class="text-amber-300 text-xs font-mono"><?=$valor?></span>
                <span class="text-zinc-500 text-xs"><?=$pct?></span>
              </div>
            </div>
            <div class="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-1"><div class="h-full <?=$cor?> rounded-full" style="width:<?=$pct?>"></div></div>
            <p class="text-zinc-500 text-[11px]"><?=$desc?></p>
          </div>
          <?php endforeach; ?>
        </div>

        <h3 class="text-white font-bold mt-4">🏛️ As 3 Leis do Orçamento</h3>
        <div class="grid sm:grid-cols-3 gap-3">
          <div class="bg-violet-950/30 border border-violet-500/20 rounded-xl p-4">
            <div class="font-bold text-violet-300 mb-1">📅 PPA</div>
            <div class="text-white font-bold text-sm mb-1">Plano Plurianual</div>
            <p class="text-xs text-zinc-400">Planejamento de 4 anos (coincide com mandato presidencial). Define objetivos, metas e programas de governo a longo prazo. Ex: PPA 2024-2027.</p>
          </div>
          <div class="bg-blue-950/30 border border-blue-500/20 rounded-xl p-4">
            <div class="font-bold text-blue-300 mb-1">📋 LDO</div>
            <div class="text-white font-bold text-sm mb-1">Lei de Diretrizes Orçamentárias</div>
            <p class="text-xs text-zinc-400">Define as metas fiscais anuais, prioridades para o orçamento e regras para o uso do dinheiro público no ano seguinte. Aprovada até 30/junho de cada ano.</p>
          </div>
          <div class="bg-green-950/30 border border-green-500/20 rounded-xl p-4">
            <div class="font-bold text-green-300 mb-1">💰 LOA</div>
            <div class="text-white font-bold text-sm mb-1">Lei Orçamentária Anual</div>
            <p class="text-xs text-zinc-400">O orçamento do Brasil para o ano seguinte. Define exatamente quanto será arrecadado e gasto em cada área. Aprovado pelo Congresso até 22/dezembro. Estimativa: R$ 2,9 tri (2024).</p>
          </div>
        </div>

        <h3 class="text-white font-bold mt-4">🔄 Como o dinheiro chega aos municípios</h3>
        <div class="space-y-3 mt-2">
          <div class="flex gap-3 items-start bg-zinc-900/40 rounded-xl p-3 border border-white/5">
            <span class="text-2xl flex-shrink-0">🏛️→🏙️</span>
            <div><strong class="text-white">FPM — Fundo de Participação dos Municípios</strong><br/><span class="text-xs text-zinc-400">23,5% do IR e IPI arrecadados pela União são repassados a todos os 5.568 municípios. Corresponde a principal fonte de receita de municípios pequenos (às vezes +90% da arrecadação). Total: ~R$ 150 bi/ano.</span></div>
          </div>
          <div class="flex gap-3 items-start bg-zinc-900/40 rounded-xl p-3 border border-white/5">
            <span class="text-2xl flex-shrink-0">🏛️→🏘️</span>
            <div><strong class="text-white">FPE — Fundo de Participação dos Estados</strong><br/><span class="text-xs text-zinc-400">21,5% do IR e IPI vão para os estados. A distribuição favorece estados mais pobres (Norte e Nordeste). Total: ~R$ 120 bi/ano.</span></div>
          </div>
          <div class="flex gap-3 items-start bg-zinc-900/40 rounded-xl p-3 border border-white/5">
            <span class="text-2xl flex-shrink-0">📚</span>
            <div><strong class="text-white">FUNDEB — Fundo da Educação Básica</strong><br/><span class="text-xs text-zinc-400">20% dos impostos de estados e municípios alimentam o fundo. O governo federal complementa para estados mais pobres. Total: ~R$ 280 bi/ano. Garante que cada aluno da rede pública receba valor mínimo.</span></div>
          </div>
          <div class="flex gap-3 items-start bg-zinc-900/40 rounded-xl p-3 border border-white/5">
            <span class="text-2xl flex-shrink-0">🏥</span>
            <div><strong class="text-white">SUS — Sistema Único de Saúde</strong><br/><span class="text-xs text-zinc-400">A União repassa verbas para estados e municípios para financiar o SUS. A regra: União aplica no mínimo 15% da Receita Corrente Líquida; estados 12%; municípios 15% de suas receitas. Total: +R$ 200 bi/ano.</span></div>
          </div>
          <div class="flex gap-3 items-start bg-zinc-900/40 rounded-xl p-3 border border-white/5">
            <span class="text-2xl flex-shrink-0">📜</span>
            <div><strong class="text-white">Emendas Parlamentares (Impositivas)</strong><br/><span class="text-xs text-zinc-400">Cada deputado federal tem direito a ~R$ 33 mi/ano em emendas individuais de execução obrigatória. Bancadas e comissões têm mais. O governo tem 17 dias para executar emendas de transferência especial. Total 2024: ~R$ 50 bi.</span></div>
          </div>
        </div>

        <div class="bg-zinc-900/50 rounded-xl p-4 border-l-4 border-amber-500 mt-2">
          <h4 class="font-bold text-white mb-2">⚠️ Lei de Responsabilidade Fiscal (LRF)</h4>
          <p class="text-xs text-zinc-300">A Lei Complementar 101/2000 estabelece limites para gastos públicos: prefeitos e governadores não podem gastar mais de <strong>54%</strong> da receita com pessoal. A União tem limite de <strong>50%</strong>. Quem descumpre pode ser enquadrado em crime de responsabilidade fiscal.</p>
          <button class="wiki-lookup-btn mt-2 text-xs bg-amber-900/30 border border-amber-500/30 text-amber-300 rounded-lg px-3 py-1.5 hover:bg-amber-800/30 transition" onclick="openWiki('Lei_de_Responsabilidade_Fiscal')">
            🔍 Ver mais sobre a LRF na Wikipedia
          </button>
        </div>

        <h3 class="text-white font-bold mt-4">🗺️ De onde vem a arrecadação — principais impostos</h3>
        <div class="overflow-x-auto"><table class="salary-table w-full text-xs"><thead><tr><th>Imposto</th><th>Esfera</th><th>Quem paga</th><th>Arrecadação estimada</th></tr></thead><tbody class="text-zinc-300">
          <tr><td class="font-bold text-green-300">ICMS</td><td>Estadual</td><td>Consumidores (embutido nos produtos)</td><td>~R$ 700 bi/ano</td></tr>
          <tr><td class="font-bold text-green-300">IR (Imposto de Renda)</td><td>Federal</td><td>Pessoas físicas e jurídicas</td><td>~R$ 580 bi/ano</td></tr>
          <tr><td class="font-bold text-green-300">INSS/Contribuições</td><td>Federal</td><td>Trabalhadores e empregadores</td><td>~R$ 600 bi/ano</td></tr>
          <tr><td class="font-bold text-green-300">IPI</td><td>Federal</td><td>Indústrias</td><td>~R$ 80 bi/ano</td></tr>
          <tr><td class="font-bold text-green-300">COFINS / PIS</td><td>Federal</td><td>Empresas (faturamento)</td><td>~R$ 310 bi/ano</td></tr>
          <tr><td class="font-bold text-green-300">CSLL</td><td>Federal</td><td>Lucro das empresas</td><td>~R$ 120 bi/ano</td></tr>
          <tr><td class="font-bold text-green-300">ISS</td><td>Municipal</td><td>Prestadores de serviços</td><td>~R$ 80 bi/ano</td></tr>
          <tr><td class="font-bold text-green-300">IPTU</td><td>Municipal</td><td>Proprietários de imóveis urbanos</td><td>~R$ 50 bi/ano</td></tr>
          <tr><td class="font-bold text-green-300">ITR</td><td>Federal (c/municípios)</td><td>Proprietários rurais</td><td>~R$ 2 bi/ano</td></tr>
        </tbody></table></div>

        <div class="mt-3 text-xs text-zinc-500 bg-zinc-900/40 rounded-xl p-3 border border-white/5">
          <strong class="text-zinc-400">⚠️ Reforma Tributária (EC 132/2023):</strong> Aprovada em dezembro de 2023, unifica PIS, COFINS, IPI, ICMS e ISS nos novos tributos <strong class="text-white">CBS</strong> (federal) e <strong class="text-white">IBS</strong> (estadual/municipal), além do <strong class="text-white">IS</strong> (seletivo). A transição ocorre de 2026 a 2033.
        </div>

        <button class="wiki-lookup-btn mt-2 text-xs bg-green-900/40 border border-green-500/30 text-green-300 rounded-lg px-3 py-1.5 hover:bg-green-800/40 transition" onclick="openWiki('Orçamento_público_no_Brasil')">
          🔍 Ver mais sobre Orçamento Público na Wikipedia
        </button>
      </div>
      <button onclick="markDone('recursos', this)" class="mark-done-btn mt-6 w-full py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white font-bold transition flex items-center justify-center gap-2">
        ✅ Marcar como lido • +80 XP
      </button>
    </section>

    <!-- ══════════════════ CAPÍTULO 7d — FISCALIZAÇÃO E CONTROLE ══════════════════ -->
    <section id="ch-fiscalizacao" class="chapter-card p-6 sm:p-8 fade-up">
      <div class="flex items-start gap-3 mb-5">
        <div class="text-4xl">🔭</div>
        <div>
          <span class="tag bg-orange-900/50 text-orange-300 text-[10px] mb-1">Capítulo 7d</span>
          <h2 class="text-xl font-black text-white">Fiscalização e Controle</h2>
          <p class="text-zinc-500 text-sm">Como o cidadão e o Estado fiscalizam o poder público</p>
        </div>
        <div class="ml-auto flex-shrink-0"><span class="tag bg-amber-900/40 text-amber-300 border border-amber-500/30">+60 XP</span></div>
      </div>
      <div class="space-y-5 text-sm sm:text-base text-zinc-300 leading-relaxed">

        <h3 class="text-white font-bold">🔍 Órgãos de Controle Externo</h3>
        <div class="space-y-3">
          <div class="bg-zinc-900/50 rounded-xl p-4 border border-white/5">
            <div class="flex gap-3">
              <span class="text-2xl">🏦</span>
              <div>
                <h4 class="font-bold text-white mb-1">TCU — Tribunal de Contas da União</h4>
                <p class="text-xs text-zinc-400 mb-2">Fiscaliza todas as despesas do governo federal. Tem poderes para: julgar contas de administradores públicos, aplicar multas, declarar indisponibilidade de bens, bloquear contratos irregulares, afastar responsáveis. Os 9 ministros do TCU têm cargos vitalícios.</p>
                <a href="https://www.tcu.gov.br" target="_blank" rel="noopener" class="text-violet-400 text-xs hover:underline">→ tcu.gov.br</a>
              </div>
            </div>
          </div>
          <div class="bg-zinc-900/50 rounded-xl p-4 border border-white/5">
            <div class="flex gap-3">
              <span class="text-2xl">🕵️</span>
              <div>
                <h4 class="font-bold text-white mb-1">CGU — Controladoria-Geral da União</h4>
                <p class="text-xs text-zinc-400 mb-2">Controle interno do Executivo federal. Previne e combate corrupção, auditoria dos órgãos federais, gestão do Portal da Transparência e da Lei de Acesso à Informação.</p>
                <a href="https://www.gov.br/cgu" target="_blank" rel="noopener" class="text-violet-400 text-xs hover:underline">→ gov.br/cgu</a>
              </div>
            </div>
          </div>
          <div class="bg-zinc-900/50 rounded-xl p-4 border border-white/5">
            <div class="flex gap-3">
              <span class="text-2xl">⚖️</span>
              <div>
                <h4 class="font-bold text-white mb-1">Ministério Público (MP)</h4>
                <p class="text-xs text-zinc-400 mb-2">Instituição independente — não pertence a nenhum dos 3 poderes. Defende a sociedade, investiga crimes, propõe ação penal. O MPF atua na esfera federal; há MPs estaduais em cada estado. Promotores têm estabilidade e independência funcional.</p>
                <a href="https://www.mpf.mp.br" target="_blank" rel="noopener" class="text-violet-400 text-xs hover:underline">→ mpf.mp.br</a>
              </div>
            </div>
          </div>
          <div class="bg-zinc-900/50 rounded-xl p-4 border border-white/5">
            <div class="flex gap-3">
              <span class="text-2xl">🌐</span>
              <div>
                <h4 class="font-bold text-white mb-1">Portal da Transparência</h4>
                <p class="text-xs text-zinc-400 mb-2">Criado em 2004, exibe em tempo real todos os gastos do governo federal: salários de servidores, contratos, convênios, repasses. Qualquer cidadão pode consultar gratuitamente.</p>
                <a href="https://portaldatransparencia.gov.br" target="_blank" rel="noopener" class="text-violet-400 text-xs hover:underline">→ portaldatransparencia.gov.br</a>
              </div>
            </div>
          </div>
        </div>

        <h3 class="text-white font-bold mt-4">📜 Lei de Acesso à Informação (LAI)</h3>
        <div class="bg-blue-950/30 border border-blue-500/20 rounded-xl p-4">
          <p class="text-xs text-zinc-300 mb-2">A <strong class="text-white">Lei 12.527/2011</strong> garante ao cidadão o direito de pedir qualquer informação de órgãos públicos federais, estaduais e municipais. O prazo para resposta é de <strong>20 dias úteis</strong> (prorrogáveis por mais 10).</p>
          <p class="text-xs text-zinc-400 mb-2">Como usar: acesse o sistema e-SIC (<a href="https://esic.cgu.gov.br" target="_blank" rel="noopener" class="text-violet-400 hover:underline">esic.cgu.gov.br</a>) e protocole seu pedido. É gratuito e o órgão é obrigado a responder. Em caso de negativa, há recursos e o cidadão pode acionar a CGU.</p>
          <div class="text-xs text-zinc-500">📊 Em 2023 foram protocolados mais de <strong class="text-zinc-300">185.000 pedidos LAI</strong> ao governo federal.</div>
        </div>

        <h3 class="text-white font-bold mt-4">🗳️ Instrumentos de Democracia Direta</h3>
        <div class="grid sm:grid-cols-3 gap-3">
          <div class="bg-zinc-900/60 rounded-xl p-4 text-xs border border-white/5">
            <h4 class="font-bold text-white mb-1">Plebiscito</h4>
            <p class="text-zinc-400">Consulta popular <em>prévia</em> antes de uma decisão política importante. Exemplos: o plebiscito de 1993 que decidiu o regime de governo (República) e o sistema (presidencialismo).</p>
          </div>
          <div class="bg-zinc-900/60 rounded-xl p-4 text-xs border border-white/5">
            <h4 class="font-bold text-white mb-1">Referendo</h4>
            <p class="text-zinc-400">Consulta popular <em>posterior</em> para ratificar ou rejeitar uma lei já aprovada. Único referendo nacional: 2005, sobre o desarmamento (maioria votou contra a proibição de venda de armas).</p>
          </div>
          <div class="bg-zinc-900/60 rounded-xl p-4 text-xs border border-white/5">
            <h4 class="font-bold text-white mb-1">Iniciativa Popular</h4>
            <p class="text-zinc-400">1% do eleitorado (em pelo menos 5 estados com no mínimo 0,3% de eleitores cada) pode apresentar um projeto de lei. Foi usada na Lei Ficha Limpa (2010) e na Lei do Orçamento Participativo.</p>
          </div>
        </div>

        <h3 class="text-white font-bold mt-4">💡 Como o cidadão pode fiscalizar</h3>
        <div class="space-y-2">
          <div class="flex gap-3 items-start"><span class="text-green-400 text-lg">1</span><div class="text-xs text-zinc-300"><strong class="text-white">Portal da Transparência</strong> — veja todos os gastos federais em <a href="https://portaldatransparencia.gov.br" target="_blank" rel="noopener" class="text-violet-400 hover:underline">portaldatransparencia.gov.br</a></div></div>
          <div class="flex gap-3 items-start"><span class="text-green-400 text-lg">2</span><div class="text-xs text-zinc-300"><strong class="text-white">Câmara dos Deputados</strong> — acompanhe votações, presenças e gastos de deputados em <a href="https://www.camara.leg.br" target="_blank" rel="noopener" class="text-violet-400 hover:underline">camara.leg.br</a></div></div>
          <div class="flex gap-3 items-start"><span class="text-green-400 text-lg">3</span><div class="text-xs text-zinc-300"><strong class="text-white">Senado Federal</strong> — projetos, votações e transparência em <a href="https://www.senado.leg.br" target="_blank" rel="noopener" class="text-violet-400 hover:underline">senado.leg.br</a></div></div>
          <div class="flex gap-3 items-start"><span class="text-green-400 text-lg">4</span><div class="text-xs text-zinc-300"><strong class="text-white">Pedido LAI</strong> — solicite qualquer informação pública via <a href="https://esic.cgu.gov.br" target="_blank" rel="noopener" class="text-violet-400 hover:underline">e-SIC</a></div></div>
          <div class="flex gap-3 items-start"><span class="text-green-400 text-lg">5</span><div class="text-xs text-zinc-300"><strong class="text-white">Denúncias ao MP</strong> — denuncie irregularidades ao Ministério Público pelo <a href="https://www.mpf.mp.br/servicos/faleconosco" target="_blank" rel="noopener" class="text-violet-400 hover:underline">site do MPF</a> ou ao TCU</div></div>
          <div class="flex gap-3 items-start"><span class="text-green-400 text-lg">6</span><div class="text-xs text-zinc-300"><strong class="text-white">Denúncias à CGU</strong> — <a href="https://falabr.cgu.gov.br" target="_blank" rel="noopener" class="text-violet-400 hover:underline">Fala.BR</a> é a plataforma integrada de ouvidoria do governo federal</div></div>
        </div>

        <button class="wiki-lookup-btn mt-3 text-xs bg-orange-900/40 border border-orange-500/30 text-orange-300 rounded-lg px-3 py-1.5 hover:bg-orange-800/40 transition" onclick="openWiki('Portal_da_Transparência_(Brasil)')">
          🔍 Ver mais sobre o Portal da Transparência na Wikipedia
        </button>
      </div>
      <button onclick="markDone('fiscalizacao', this)" class="mark-done-btn mt-6 w-full py-2.5 rounded-xl bg-orange-700 hover:bg-orange-600 text-white font-bold transition flex items-center justify-center gap-2">
        ✅ Marcar como lido • +60 XP
      </button>
    </section>

    <!-- ══════════════════ CAPÍTULO 8 — QUIZ FINAL ══════════════════ -->
    <section id="ch-quiz" class="chapter-card p-6 sm:p-8 fade-up" style="border-color:rgba(245,158,11,.3);">
      <div class="flex items-start gap-3 mb-5">
        <div class="text-4xl">🎯</div>
        <div>
          <span class="tag bg-amber-900/50 text-amber-300 text-[10px] mb-1">Capítulo 8</span>
          <h2 class="text-xl font-black text-white">Quiz Final — Teste seu Conhecimento</h2>
          <p class="text-zinc-500 text-sm">10 questões para testar o que você aprendeu</p>
        </div>
        <div class="ml-auto flex-shrink-0">
          <span class="tag bg-amber-900/40 text-amber-300 border border-amber-500/30">+100 XP</span>
        </div>
      </div>

      <div id="quizContainer">
        <div id="quizQuestion" class="text-white font-bold text-base mb-4 p-4 bg-zinc-900/60 rounded-xl border border-white/8"></div>
        <div id="quizOptions" class="space-y-2"></div>
        <div id="quizFeedback" class="mt-3 text-sm font-semibold hidden"></div>
        <div class="flex justify-between items-center mt-5">
          <div class="text-zinc-500 text-sm" id="quizProgress">Questão 1/10</div>
          <div class="text-amber-400 font-bold text-sm" id="quizScore">Acertos: 0</div>
        </div>
      </div>
      <div id="quizResult" class="hidden text-center py-6">
        <div class="text-5xl mb-3" id="quizEmoji">🏆</div>
        <h3 class="text-2xl font-black text-white mb-1" id="quizResultTitle"></h3>
        <p class="text-zinc-400 mb-4" id="quizResultMsg"></p>
        <button onclick="restartQuiz()" class="px-6 py-2 bg-violet-700 hover:bg-violet-600 rounded-xl text-white font-bold transition">Refazer Quiz</button>
      </div>
    </section>

    <!-- ══════════════════ BADGES ══════════════════ -->
    <section class="fade-up">
      <h2 class="text-lg font-black text-white mb-4">🏅 Suas Conquistas</h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3" id="badgesGrid">
        <?php
        $badges = [
          ['sistema','🏛️','Constituinte','Leu o capítulo do Sistema'],
          ['poderes','⚡','Tripartite','Leu o capítulo dos Poderes'],
          ['cargos','👔','Sabe Tudo','Leu o capítulo dos Cargos'],
          ['salarios','💰','Fiscalista','Leu o capítulo dos Salários'],
          ['eleicoes','🗳️','Eleitor Consciente','Leu o capítulo de Eleições'],
          ['deveres','⚖️','Guardião','Leu o capítulo de Deveres'],
          ['leis','📋','Legislador','Entendeu como as leis nascem'],
          ['recursos','💳','Economista','Domina o orçamento público'],
          ['fiscalizacao','🔭','Fiscal','Leu sobre fiscalização'],
          ['glossario','📚','Lexicólogo','Leu o Glossário'],
          ['quiz','🎯','Mestre Político','Concluiu o Quiz Final'],
        ];
        foreach($badges as [$id,$icon,$nome,$desc]):
        ?>
        <div class="badge-card" id="badge-<?=$id?>">
          <div class="text-3xl mb-1 grayscale opacity-40" id="badge-icon-<?=$id?>"><?=$icon?></div>
          <div class="text-xs font-bold text-zinc-500" id="badge-name-<?=$id?>"><?=$nome?></div>
          <div class="text-[10px] text-zinc-600 mt-0.5"><?=$desc?></div>
        </div>
        <?php endforeach; ?>
      </div>
    </section>

    <!-- ══════════════════ FONTES E REFERÊNCIAS ══════════════════ -->
    <section class="fade-up mt-10">
      <h2 class="text-lg font-black text-white mb-4">📚 Fontes e Referências Oficiais</h2>
      <div class="glass rounded-2xl p-6">
        <p class="text-zinc-400 text-xs mb-5">Todo conteúdo desta Wiki é baseado em fontes primárias oficiais do governo brasileiro, dados do IBGE e Wikipedia. Abaixo estão todas as fontes utilizadas — clique para acessar.</p>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <?php $fontes = [
            ['🏛️','Câmara dos Deputados','Dados de deputados, votações, despesas (CEAP), projetos de lei e transparência parlamentar','https://www.camara.leg.br'],
            ['🎖️','Senado Federal','Senadores, votações, legislação, orçamento e histórico parlamentar','https://www.senado.leg.br'],
            ['🇧🇷','Portal da Transparência','Todos os gastos do governo federal, salários de servidores, contratos e convênios','https://portaldatransparencia.gov.br'],
            ['⚖️','STF — Supremo Tribunal Federal','Decisões, julgamentos, composição e jurisprudência constitucional','https://www.stf.jus.br'],
            ['🗳️','TSE — Tribunal Superior Eleitoral','Eleições, candidatos, partidos, financiamento e resultados eleitorais','https://www.tse.jus.br'],
            ['🏦','TCU — Tribunal de Contas da União','Fiscalização de contas públicas, acórdãos e relatórios de auditoria','https://www.tcu.gov.br'],
            ['🕵️','CGU — Controladoria-Geral da União','Dados sobre corrupção, auditoria, e-SIC e Portal da Transparência','https://www.gov.br/cgu'],
            ['📊','IBGE — Instituto Brasileiro de Geografia e Estatística','Dados populacionais, regionais e econômicos do Brasil','https://www.ibge.gov.br'],
            ['💰','Tesouro Nacional','Dados fiscais, dívida pública, LOA, LDO, PPA e resultado primário','https://www.tesouronacional.gov.br'],
            ['📰','Diário Oficial da União','Publicação oficial de leis, decretos, nomeações e atos do governo','https://www.in.gov.br'],
            ['📜','Planalto — Legislação Federal','Texto completo de todas as leis e decretos federais do Brasil','https://www.planalto.gov.br/legislacao'],
            ['🌐','Dados Abertos da Câmara','API pública com dados de deputados, despesas, projetos e muito mais','https://dadosabertos.camara.leg.br'],
            ['🌐','Dados Abertos do Senado','API e downloads de dados legislativos do Senado Federal','https://dadosabertos.senado.leg.br'],
            ['🌐','Dados Abertos do TSE','Candidatos, financiamentos, prestações de contas eleitorais','https://dadosabertos.tse.jus.br'],
            ['📖','Wikipedia PT','Enciclopédia livre com artigos detalhados sobre política brasileira','https://pt.wikipedia.org'],
            ['🏘️','FNP — Frente Nacional de Prefeitos','Dados sobre municípios, FPM e gestão municipal','https://www.fnp.org.br'],
            ['⚙️','Ministério da Fazenda','Política econômica, tributária e fiscal do governo federal','https://www.gov.br/fazenda'],
            ['📋','Sistema de Informações Legislativas','Tramitação de projetos de lei no Congresso Nacional','https://www.camara.leg.br/sileg'],
          ]; foreach($fontes as [$icon,$nome,$desc,$url]): ?>
          <a href="<?=htmlspecialchars($url)?>" target="_blank" rel="noopener" class="bg-zinc-900/60 rounded-xl p-3 border border-white/5 hover:border-violet-500/40 hover:bg-zinc-800/50 transition group block">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-base"><?=$icon?></span>
              <span class="text-white text-xs font-bold group-hover:text-violet-300 transition"><?=$nome?></span>
            </div>
            <p class="text-zinc-500 text-[11px] leading-relaxed"><?=$desc?></p>
            <span class="text-violet-500 text-[10px] mt-1 block truncate"><?=$url?></span>
          </a>
          <?php endforeach; ?>
        </div>
        <div class="mt-5 p-3 bg-zinc-900/40 rounded-xl border border-white/5 text-xs text-zinc-500">
          <strong class="text-zinc-400">⚠️ Importante:</strong> Os valores de salários e gastos apresentados são estimativas baseadas em dados públicos disponíveis até 2024. Consulte sempre as fontes oficiais para informações atualizadas e precisas. Esta Wiki tem fins educativos e não possui vínculo com nenhum partido ou grupo político.
        </div>
      </div>
    </section>

  </div><!-- /main -->

  <!-- ══════════════════ WIKIPEDIA MODAL ══════════════════ -->
  <div id="wikiModal" class="fixed inset-0 z-[9998] flex items-center justify-center p-4 hidden" style="background:rgba(0,0,0,.8);backdrop-filter:blur(8px);">
    <div class="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
      <div class="flex items-center gap-3 p-4 border-b border-zinc-800 flex-shrink-0">
        <span class="text-2xl">🌐</span>
        <div class="flex-1">
          <h3 class="text-white font-bold text-sm" id="wikiModalTitle">Wikipedia</h3>
          <p class="text-zinc-500 text-xs">Enciclopédia livre</p>
        </div>
        <button onclick="closeWiki()" class="text-zinc-500 hover:text-white text-xl w-8 h-8 flex items-center justify-center">&times;</button>
      </div>
      <div class="flex-1 overflow-y-auto p-5" id="wikiModalBody">
        <div class="text-center text-zinc-500 py-8"><div class="text-3xl mb-2">⏳</div>Carregando...</div>
      </div>
      <div class="p-3 border-t border-zinc-800 flex-shrink-0 flex justify-between items-center">
        <span class="text-zinc-600 text-xs">Conteúdo via Wikipedia API (CC BY-SA)</span>
        <a id="wikiModalLink" href="#" target="_blank" rel="noopener" class="text-violet-400 text-xs hover:underline">Ver artigo completo →</a>
      </div>
    </div>
  </div>

  <!-- ══════════════════ HYPERBOT BUTTON ══════════════════ -->
  <button id="hyperbot-btn" onclick="toggleBot()" title="Perguntar ao HyperBot">🤖</button>

  <!-- ══════════════════ HYPERBOT WINDOW ══════════════════ -->
  <div id="hyperbot-window" class="hidden">
    <div class="p-3 border-b border-white/8 flex items-center gap-2 bg-zinc-900 flex-shrink-0">
      <span class="text-xl">🤖</span>
      <div>
        <div class="text-white font-bold text-sm">HyperBot</div>
        <div class="text-violet-400 text-[10px]">Especialista em política brasileira</div>
      </div>
      <button onclick="toggleBot()" class="ml-auto text-zinc-500 hover:text-white text-xl w-7 h-7 flex items-center justify-center">&times;</button>
    </div>
    <div id="bot-messages">
      <div class="bot-msg">
        Olá! Sou o <strong>HyperBot</strong> 🤖<br/><br/>
        Posso explicar qualquer coisa sobre a política brasileira — cargos, salários, como funciona o Congresso, eleições, escândalos, direitos... é só perguntar!<br/><br/>
        <div class="flex flex-wrap gap-1 mt-2">
          <button onclick="sendBotSuggestion(this)" class="text-[10px] bg-violet-900/50 text-violet-300 rounded-full px-2 py-0.5 border border-violet-500/30 hover:bg-violet-800/50 transition">💰 Quanto ganha um deputado?</button>
          <button onclick="sendBotSuggestion(this)" class="text-[10px] bg-violet-900/50 text-violet-300 rounded-full px-2 py-0.5 border border-violet-500/30 hover:bg-violet-800/50 transition">🏛️ O que é o Senado?</button>
          <button onclick="sendBotSuggestion(this)" class="text-[10px] bg-violet-900/50 text-violet-300 rounded-full px-2 py-0.5 border border-violet-500/30 hover:bg-violet-800/50 transition">🗳️ Como funciona a CEAP?</button>
          <button onclick="sendBotSuggestion(this)" class="text-[10px] bg-violet-900/50 text-violet-300 rounded-full px-2 py-0.5 border border-violet-500/30 hover:bg-violet-800/50 transition">⚖️ O que é foro privilegiado?</button>
        </div>
      </div>
    </div>
    <div id="bot-typing" class="bot-typing hidden">HyperBot está digitando...</div>
    <div class="p-2 border-t border-white/8 flex gap-2 bg-zinc-900 flex-shrink-0">
      <input id="bot-input" type="text" placeholder="Pergunte sobre política..." class="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-violet-500" onkeydown="if(event.key==='Enter')sendBotMsg()"/>
      <button onclick="sendBotMsg()" class="bg-violet-700 hover:bg-violet-600 text-white rounded-xl px-3 py-2 text-sm font-bold transition">↑</button>
    </div>
  </div>

  <script>
  // ══════════════ STATE ══════════════
  const WIKI_KEY = 'wikiProgress_v1';
  let state = JSON.parse(localStorage.getItem(WIKI_KEY) || '{}');
  // state = { done: {sistema:true,...}, quizScore: 7, xp: 350 }
  if (!state.done)      state.done = {};
  if (!state.xp)        state.xp = 0;
  if (!state.quizDone)  state.quizDone = false;
  if (!state.quizScore) state.quizScore = 0;

  const XP_MAP = { sistema:50, poderes:50, cargos:60, salarios:70, eleicoes:60, deveres:60, leis:70, recursos:80, fiscalizacao:60, glossario:40, quiz:100 };

  function save() { localStorage.setItem(WIKI_KEY, JSON.stringify(state)); }

  // ══════════════ PROGRESS ══════════════
  function updateUI() {
    const total = Object.keys(XP_MAP).length;
    const done  = Object.keys(state.done).length;
    const pct   = Math.round((state.xp / 490) * 100);

    document.getElementById('progressBar').style.width = Math.min(pct, 100) + '%';
    document.getElementById('headerXP').textContent    = state.xp + ' XP';
    document.getElementById('statsXP').textContent     = state.xp;
    document.getElementById('statsChapters').textContent = done + '/' + total;
    document.getElementById('statsQuizzes').textContent  = state.quizDone ? '1/1' : '0/1';
    document.getElementById('statsBadges').textContent   = Object.keys(state.done).length;

    // Chapter nav highlights
    document.querySelectorAll('.chapter-nav-item').forEach(el => {
      const id = el.dataset.chapter;
      if (state.done[id]) el.classList.add('text-violet-400');
    });

    // Badge update
    Object.keys(state.done).forEach(id => earnBadge(id));

    // Mark done buttons
    Object.keys(state.done).forEach(id => {
      const sec = document.getElementById('ch-' + id);
      if (sec) {
        sec.classList.add('done');
        const btn = sec.querySelector('.mark-done-btn');
        if (btn) { btn.textContent = '✅ Lido!'; btn.disabled = true; btn.style.opacity = '.5'; }
      }
    });
  }

  function markDone(id, btn) {
    if (state.done[id]) return;
    state.done[id] = true;
    state.xp += XP_MAP[id] || 50;
    save();
    btn.textContent = '✅ Lido! +' + (XP_MAP[id]||50) + ' XP adicionados';
    btn.disabled = true;
    btn.style.opacity = '.5';
    document.getElementById('ch-' + id)?.classList.add('done');
    earnBadge(id);
    updateUI();
    // Vibrate
    if (navigator.vibrate) navigator.vibrate([80, 40, 120]);
    // Confetti burst
    _confetti();
  }

  function earnBadge(id) {
    const icon = document.getElementById('badge-icon-' + id);
    const name = document.getElementById('badge-name-' + id);
    const card = document.getElementById('badge-' + id);
    if (!icon) return;
    icon.classList.remove('grayscale','opacity-40');
    if (name) name.classList.remove('text-zinc-500');
    if (card) card.classList.add('earned');
  }

  // ══════════════ GLOSSÁRIO SEARCH ══════════════
  function filterGlossario(q) {
    document.querySelectorAll('.glossario-item').forEach(el => {
      el.style.display = el.textContent.toLowerCase().includes(q.toLowerCase()) ? '' : 'none';
    });
  }

  // ══════════════ QUIZ ══════════════
  const QUIZ_QUESTIONS = [
    { q:'Quantos deputados federais existem no Brasil?', opts:['81','513','559','278'], a:1 },
    { q:'Qual é o cargo político com o maior subsídio no Brasil?', opts:['Presidente','Ministro do STF','Senador','Ministro de Estado'], a:1 },
    { q:'O sistema proporcional é usado para eleger qual cargo?', opts:['Presidente','Governador','Deputado Federal','Senador'], a:2 },
    { q:'Quantos anos dura o mandato de um senador?', opts:['4 anos','6 anos','8 anos','5 anos'], a:2 },
    { q:'O que é a CEAP?', opts:['Imposto sobre despesas parlamentares','Cota mensal para gastos dos parlamentares','Fundo eleitoral público','Salário extra de deputados'], a:1 },
    { q:'Quem é responsável por fiscalizar a constitucionalidade das leis no Brasil?', opts:['TSE','TCU','STJ','STF'], a:3 },
    { q:'Como se chama o processo de remoção do Presidente por crime de responsabilidade?', opts:['Referendum','Plebiscito','Impeachment','Recall'], a:2 },
    { q:'Qual é o teto salarial do serviço público federal?', opts:['Presidente da República','Ministro do STF','Presidente do Senado','Procurador-Geral'], a:1 },
    { q:'Qual é o número de senadores por estado?', opts:['2','3','4','5'], a:1 },
    { q:'O que significa "fisiologismo" na política?', opts:['Estudo do corpo humano aplicado ao direito','Apoiar o governo em troca de cargos e verbas','Financiamento ilegal de campanhas','Prática de contratar parentes'], a:1 },
  ];

  let qIdx = 0, qScore = 0;

  function renderQuestion() {
    if (qIdx >= QUIZ_QUESTIONS.length) { endQuiz(); return; }
    const q = QUIZ_QUESTIONS[qIdx];
    document.getElementById('quizQuestion').textContent = (qIdx + 1) + '. ' + q.q;
    document.getElementById('quizProgress').textContent = 'Questão ' + (qIdx + 1) + '/' + QUIZ_QUESTIONS.length;
    document.getElementById('quizFeedback').classList.add('hidden');
    const opts = document.getElementById('quizOptions');
    opts.innerHTML = q.opts.map((o, i) =>
      `<button class="quiz-opt w-full" onclick="answerQuiz(${i})">${String.fromCharCode(65+i)}. ${o}</button>`
    ).join('');
  }

  function answerQuiz(chosen) {
    const q = QUIZ_QUESTIONS[qIdx];
    const btns = document.querySelectorAll('.quiz-opt');
    btns.forEach(b => b.disabled = true);
    btns[chosen].classList.add(chosen === q.a ? 'correct' : 'wrong');
    if (chosen !== q.a) btns[q.a].classList.add('correct');
    const fb = document.getElementById('quizFeedback');
    if (chosen === q.a) { qScore++; fb.textContent = '✅ Correto!'; fb.className = 'mt-3 text-sm font-semibold text-green-400'; if (navigator.vibrate) navigator.vibrate([60]); }
    else { fb.textContent = `❌ Resposta: ${q.opts[q.a]}`; fb.className = 'mt-3 text-sm font-semibold text-red-400'; }
    fb.classList.remove('hidden');
    document.getElementById('quizScore').textContent = 'Acertos: ' + qScore;
    setTimeout(() => { qIdx++; renderQuestion(); }, 1400);
  }

  function endQuiz() {
    document.getElementById('quizContainer').classList.add('hidden');
    document.getElementById('quizResult').classList.remove('hidden');
    const pct = (qScore / QUIZ_QUESTIONS.length) * 100;
    const emojis = ['😅','😐','🙂','😊','🏆'];
    const msgs   = ['Continue estudando!','Quase lá! Revise os capítulos.','Bom desempenho!','Muito bem! Quase perfeito.','Parabéns! Você domina a política brasileira!'];
    const tier = Math.min(4, Math.floor(pct / 25));
    document.getElementById('quizEmoji').textContent      = emojis[tier];
    document.getElementById('quizResultTitle').textContent = qScore + '/' + QUIZ_QUESTIONS.length + ' acertos';
    document.getElementById('quizResultMsg').textContent   = msgs[tier];
    if (!state.quizDone) {
      state.quizDone  = true;
      state.quizScore = qScore;
      state.done.quiz = true;
      state.xp += 100;
      save();
      earnBadge('quiz');
      updateUI();
      _confetti();
    }
  }

  function restartQuiz() {
    qIdx = 0; qScore = 0;
    document.getElementById('quizContainer').classList.remove('hidden');
    document.getElementById('quizResult').classList.add('hidden');
    document.getElementById('quizScore').textContent = 'Acertos: 0';
    renderQuestion();
  }

  // ══════════════ CONFETTI (lightweight) ══════════════
  function _confetti() {
    const colors = ['#7c3aed','#a855f7','#fbbf24','#22c55e','#3b82f6','#ec4899'];
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      const c = colors[Math.floor(Math.random() * colors.length)];
      const size = 4 + Math.random() * 6;
      p.style.cssText = `position:fixed;pointer-events:none;border-radius:2px;width:${size}px;height:${size}px;background:${c};top:${10+Math.random()*20}%;left:${Math.random()*100}%;z-index:9000;opacity:1;transition:transform ${1+Math.random()*1.5}s ease,opacity 1s ease ${Math.random()*0.5}s;`;
      document.body.appendChild(p);
      requestAnimationFrame(() => {
        p.style.transform = `translateY(${200+Math.random()*300}px) rotate(${Math.random()*360}deg)`;
        p.style.opacity = '0';
      });
      setTimeout(() => p.remove(), 3000);
    }
  }

  // ══════════════ HYPERBOT ══════════════
  let botOpen = false;
  function toggleBot() {
    botOpen = !botOpen;
    document.getElementById('hyperbot-window').classList.toggle('hidden', !botOpen);
  }

  function sendBotSuggestion(el) {
    const txt = el.textContent.replace(/^[^\s]+\s/, '');
    document.getElementById('bot-input').value = txt;
    sendBotMsg();
  }

  function sendBotMsg() {
    const input = document.getElementById('bot-input');
    const q = input.value.trim();
    if (!q) return;
    input.value = '';
    appendMsg(q, 'user');
    document.getElementById('bot-typing').classList.remove('hidden');
    fetch('/api.php?action=wiki_bot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: q })
    })
    .then(r => r.json())
    .then(data => {
      document.getElementById('bot-typing').classList.add('hidden');
      appendMsg(data.answer || 'Desculpe, não entendi bem.', 'bot', data.suggestions || []);
    })
    .catch(() => {
      document.getElementById('bot-typing').classList.add('hidden');
      appendMsg(localBotAnswer(q), 'bot', [
        'Quanto ganha um deputado federal?',
        'O que é a CEAP?',
        'Como funcionam as eleições?',
        'O que é corrupção política?',
      ]);
    });
  }

  function appendMsg(text, who, suggestions = []) {
    const msgs = document.getElementById('bot-messages');
    const d = document.createElement('div');
    d.className = who === 'bot' ? 'bot-msg' : 'user-msg';
    d.innerHTML = text.replace(/\n/g, '<br/>');

    // Suggestion chips
    if (suggestions.length > 0) {
      const chips = document.createElement('div');
      chips.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px;margin-top:8px;';
      suggestions.forEach(sug => {
        const btn = document.createElement('button');
        btn.textContent = sug;
        btn.style.cssText = 'font-size:10px;background:rgba(124,58,237,.22);color:#c4b5fd;border:1px solid rgba(124,58,237,.4);border-radius:999px;padding:3px 9px;cursor:pointer;transition:background .15s;text-align:left;line-height:1.4;';
        btn.onmouseenter = () => btn.style.background = 'rgba(124,58,237,.45)';
        btn.onmouseleave = () => btn.style.background = 'rgba(124,58,237,.22)';
        btn.onclick = () => { document.getElementById('bot-input').value = sug; sendBotMsg(); };
        chips.appendChild(btn);
      });
      d.appendChild(chips);
    }

    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  // ── Local fallback knowledge base ──
  const KB = [
    [/(quanto|salário|subsídio|ganha|remuneração).*(deputado|parlamentar)/i, 'O subsídio de um <strong>Deputado Federal</strong> é de <strong>R$ 46.366</strong>/mês. Mas além disso, cada deputado tem direito a até <strong>R$ 45.613/mês em CEAP</strong> (verba de gabinete) e outros benefícios. O custo real estimado por parlamentar chega a ~R$ 400 mil/mês para os cofres públicos.'],
    [/(quanto|salário|subsídio|ganha).*(senador)/i, 'Senadores recebem o mesmo subsídio dos Deputados Federais: <strong>R$ 46.366/mês</strong>. A verba de gabinete e benefícios são similares.'],
    [/(quanto|salário|subsídio|ganha).*(president)/i, 'O Presidente da República recebe <strong>R$ 30.934/mês</strong> de subsídio. Curiosamente, este valor é <strong>menor</strong> que o de Ministros e parlamentares, pois o teto é fixado na Constituição.'],
    [/(ceap|verba|gabinete)/i, 'A <strong>CEAP</strong> (Cota para Exercício da Atividade Parlamentar) é uma verba de até <strong>R$ 45.613/mês</strong> que deputados federais podem usar com: passagens aéreas, alimentação, hospedagem, combustível, telefone, etc. Há pouca fiscalização do uso e é um dos temas mais polêmicos da política brasileira.'],
    [/(senado|senador|câmara alta)/i, 'O <strong>Senado Federal</strong> é a "câmara alta" do Congresso. Tem <strong>81 senadores</strong> (3 por estado + DF), com mandato de <strong>8 anos</strong>. O Senado revisa as leis feitas pela Câmara dos Deputados, aprova tratados internacionais e nomeações importantes (ministros do STF, embaixadores, etc).'],
    [/(câmara|deputado federal|legislativo federal)/i, 'A <strong>Câmara dos Deputados</strong> tem <strong>513 deputados</strong>, eleitos pelo sistema proporcional com mandatos de <strong>4 anos</strong>. É onde a maioria das leis federais são criadas. O número de deputados por estado varia conforme a população.'],
    [/(stf|supremo)/i, 'O <strong>STF (Supremo Tribunal Federal)</strong> é a mais alta corte do Brasil. Tem <strong>11 ministros</strong>, indicados pelo Presidente e aprovados pelo Senado, com cargos vitalícios até os 70 anos. É o guardião da Constituição — pode anular qualquer lei inconstitucional.'],
    [/(eleição|eleicoes|votar|voto)/i, 'As eleições no Brasil são organizadas pelo <strong>TSE</strong>. O voto é <strong>obrigatório</strong> dos 18 aos 70 anos. Eleições municipais e gerais alternam a cada 2 anos (municipais em 2024, gerais em 2026, etc). O Brasil usa <strong>urna eletrônica</strong> desde 1996.'],
    [/(impeachment|cassação|remover presidente)/i, '<strong>Impeachment</strong> é o processo de destituição do Presidente por crime de responsabilidade. É iniciado na Câmara (2/3 dos votos) e julgado no Senado (2/3 dos votos). Aconteceu com <strong>Collor</strong> (1992) e <strong>Dilma</strong> (2016) no Brasil.'],
    [/(foro privilegiado|imunidade)/i, '<strong>Foro privilegiado</strong> é o direito de parlamentares e altas autoridades de serem julgados no STF, não em 1ª instância. Em 2018, o STF <strong>limitou</strong> o foro para crimes cometidos durante o mandato e em função do cargo. A <strong>imunidade material</strong> protege opiniões ditas no exercício do mandato.'],
    [/(lava jato|corrupcao|corrupção|lavagem|mensalão)/i, 'A <strong>Operação Lava Jato</strong> (2014) foi a maior operação anticorrupção da história brasileira, investigando desvios na Petrobras. Resultou em centenas de condenações. O <strong>Mensalão</strong> (2005) foi um escândalo de compra de votos de parlamentares. Ambos expuseram a corrupção sistêmica na política brasileira.'],
    [/(partido|pp|pt|pl|psol|mdb|centrão)/i, 'O Brasil tem mais de <strong>30 partidos</strong> registrados no TSE! O <strong>Centrão</strong> é um grupo de partidos sem ideologia definida que apoiam quem estiver no poder em troca de cargos e verbas. Os maiores partidos em 2024 são PL, União Brasil, PP, PSD, MDB e PT.'],
    [/(presid|governa|quem é o presidente)/i, 'O <strong>Luiz Inácio Lula da Silva</strong> (PT) é o atual Presidente do Brasil, eleito em outubro de 2022 com 50,9% dos votos no 2º turno. Seu mandato vai até 2026.'],
    [/(quanto.*(vereador|prefeito)|(vereador|prefeito).*quanto)/i, 'Varia muito! Em São Paulo, um vereador recebe <strong>R$ 25.000+</strong>. Em cidades pequenas pode ser menos de <strong>R$ 1.000</strong>. Prefeitos de capitais recebem entre R$ 20.000–35.000, enquanto prefeitos do interior podem receber bem menos.'],
    [/(poder|executivo|legislativo|judiciário)/i, 'O Brasil tem <strong>3 Poderes</strong>:\n• <strong>Executivo</strong> — executa as leis (Presidente, Governadores, Prefeitos)\n• <strong>Legislativo</strong> — cria as leis (Congresso, Assembleias, Câmaras)\n• <strong>Judiciário</strong> — aplica as leis e resolve conflitos (STF, STJ, TJ...)\n\nCada poder fiscaliza os outros pelo sistema de freios e contrapesos.'],
    [/(constituição|constituicao|1988)/i, 'A <strong>Constituição Federal de 1988</strong>, chamada de "Constituição Cidadã", é a lei máxima do Brasil. Foi promulgada em 5 de outubro de 1988, após o fim da ditadura militar. Tem <strong>250 artigos</strong> e já foi emendada mais de <strong>100 vezes</strong>.'],
  ];

  function localBotAnswer(q) {
    for (const [rx, ans] of KB) {
      if (rx.test(q)) return ans;
    }
    return `Hmm, não tenho uma resposta específica sobre "<em>${q.slice(0,60)}</em>". Tente perguntar sobre: salários, cargos, eleições, o Senado, a Câmara, corrupção, foro privilegiado ou como funciona o sistema político. 🇧🇷`;
  }

  // ══════════════ WIKIPEDIA INTEGRATION ══════════════
  function openWiki(articleTitle) {
    const modal = document.getElementById('wikiModal');
    const body  = document.getElementById('wikiModalBody');
    const title = document.getElementById('wikiModalTitle');
    const link  = document.getElementById('wikiModalLink');
    modal.classList.remove('hidden');
    body.innerHTML = '<div class="text-center text-zinc-500 py-8"><div class="text-3xl mb-2">⏳</div>Carregando da Wikipedia...</div>';
    const url = `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(articleTitle)}`;
    fetch(url)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => {
        title.textContent = data.title || articleTitle;
        link.href = data.content_urls?.desktop?.page || `https://pt.wikipedia.org/wiki/${encodeURIComponent(articleTitle)}`;
        const img = data.thumbnail ? `<img src="${data.thumbnail.source}" alt="${data.title}" class="w-full max-h-48 object-cover rounded-xl mb-4"/>` : '';
        body.innerHTML = `
          ${img}
          <h4 class="text-white font-bold text-base mb-3">${data.title || ''}</h4>
          <p class="text-zinc-300 text-sm leading-relaxed mb-4">${data.extract || 'Artigo não encontrado.'}</p>
          <div class="flex flex-wrap gap-2 mt-2">
            <button onclick="openWiki('${articleTitle.replace(/'/g,"\\'")}'); openWiki('${articleTitle.replace(/'/g,"\\'")}');" class="text-xs bg-zinc-800 text-zinc-400 rounded-lg px-3 py-1.5 hover:bg-zinc-700 transition" style="display:none"></button>
          </div>
          <p class="text-zinc-600 text-[11px] mt-3">Fonte: Wikipedia — Licença CC BY-SA 4.0</p>
        `;
      })
      .catch(() => {
        body.innerHTML = `
          <div class="text-center py-6">
            <div class="text-3xl mb-2">😕</div>
            <p class="text-zinc-400 text-sm mb-3">Não foi possível carregar o artigo.</p>
            <a href="https://pt.wikipedia.org/wiki/${encodeURIComponent(articleTitle)}" target="_blank" rel="noopener" class="text-violet-400 text-sm hover:underline">Abrir na Wikipedia →</a>
          </div>
        `;
        link.href = `https://pt.wikipedia.org/wiki/${encodeURIComponent(articleTitle)}`;
      });
  }

  function closeWiki() {
    document.getElementById('wikiModal').classList.add('hidden');
  }
  // Close wiki modal on backdrop click
  document.addEventListener('click', e => {
    const modal = document.getElementById('wikiModal');
    if (e.target === modal) closeWiki();
  });

  // ══════════════ INIT ══════════════
  window.addEventListener('DOMContentLoaded', () => {
    updateUI();
    renderQuestion();
    // Smooth scroll for chapter nav
    document.querySelectorAll('[href^="#ch-"]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        document.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior:'smooth', block:'start' });
      });
    });
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
