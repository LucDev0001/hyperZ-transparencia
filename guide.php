<?php
require_once __DIR__ . '/../public_init.php';
?>
<!doctype html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Guia de Uso — Portal de Transparência Hyper Z</title>
    
    <script>
        window.BASE_PATH = "<?php echo BASE_PATH; ?>";
    </script>

    <link rel="icon" type="image/png" href="<?php echo BASE_PATH; ?>/img/favicon.png" />
    <link rel="stylesheet" href="<?php echo BASE_PATH; ?>/src/css/output.css?v=1.1">
    <!-- PWA & Mobile Support -->
    <link rel="manifest" href="<?php echo BASE_PATH; ?>/manifest.json" />
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Hyper Z">
    <link rel="apple-touch-icon" href="<?php echo BASE_PATH; ?>/img/apple-touch-icon.png">
    <style>
        body { background-color: #09090b; color: #e4e4e7; }
        .glass {
            background: rgba(24, 24, 27, 0.6);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .tool-card { transition: border-color .2s, transform .15s; }
        .tool-card:hover { transform: translateY(-2px); }
        .tag { display:inline-flex; align-items:center; font-size:.65rem; font-weight:700;
               padding:.15rem .45rem; border-radius:9999px; letter-spacing:.04em; }
        .tag-red    { background:rgba(239,68,68,.15);  color:#f87171; border:1px solid rgba(239,68,68,.25); }
        .tag-violet { background:rgba(139,92,246,.15); color:#a78bfa; border:1px solid rgba(139,92,246,.25); }
        .tag-blue   { background:rgba(59,130,246,.15); color:#93c5fd; border:1px solid rgba(59,130,246,.25); }
        .tag-amber  { background:rgba(245,158,11,.15); color:#fcd34d; border:1px solid rgba(245,158,11,.25); }
        .tag-green  { background:rgba(34,197,94,.15);  color:#86efac; border:1px solid rgba(34,197,94,.25); }
        .tag-zinc   { background:rgba(113,113,122,.15);color:#a1a1aa; border:1px solid rgba(113,113,122,.25); }
        details > summary { cursor:pointer; list-style:none; }
        details > summary::-webkit-details-marker { display:none; }
        .section-anchor { scroll-margin-top: 1.5rem; }
        .step-num {
            display:inline-flex; align-items:center; justify-content:center;
            min-width:1.75rem; height:1.75rem; background:rgba(139,92,246,.2);
            border:1px solid rgba(139,92,246,.4); border-radius:9999px;
            font-size:.8rem; font-weight:800; color:#a78bfa; flex-shrink:0;
        }
    </style>
</head>
<body class="relative overflow-x-hidden selection:bg-violet-500/30">

    <!-- Background glows -->
    <div class="fixed inset-0 z-[-1] pointer-events-none">
        <div class="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] bg-violet-600/8 rounded-full blur-[140px]"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-indigo-600/8 rounded-full blur-[140px]"></div>
    </div>

    <div class="container mx-auto px-4 py-10 max-w-5xl">

        <!-- Back link -->
        <a href="index.php" class="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition group text-sm">
            <svg class="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Voltar ao Portal
        </a>

        <!-- Hero -->
        <div class="mb-10">
            <div class="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 text-violet-300 text-xs font-semibold mb-4">
                <span class="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></span>
                Versão 2.4.5 — Atualizado em março de 2026
            </div>
            <h1 class="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400 mb-4 leading-tight">
                Guia de Uso do Portal
            </h1>
            <p class="text-zinc-400 text-lg leading-relaxed max-w-3xl">
                O <strong class="text-white">Portal de Transparência Hyper Z</strong> é uma plataforma de fiscalização cidadã que agrega dados de fontes governamentais oficiais em tempo real. Este guia explica cada ferramenta disponível, como utilizá-la e quais APIs alimentam os dados.
            </p>
        </div>

        <!-- Índice rápido -->
        <nav class="glass rounded-2xl p-6 mb-10">
            <h2 class="text-sm font-bold text-zinc-300 uppercase tracking-widest mb-4">Índice</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <?php
                $toc = [
                    ['#osint',        '🔮', 'OSINT Intelligence'],
                    ['#parlamentares','👔', 'Parlamentares'],
                    ['#anticorrupcao','🔍', 'Anti-Corrupção'],
                    ['#financas',     '💰', 'Finanças Públicas'],
                    ['#eleicoes-tse', '🗳️', 'Eleições & Partidos'],
                    ['#gestao-exec',  '📊', 'Gestão & Executivo'],
                    ['#dados-abertos','📡', 'Dados Abertos'],
                    ['#fontes',       '📚', 'Fontes & APIs'],
                ];
                foreach($toc as [$href, $icon, $label]):
                ?>
                <a href="<?= $href ?>" class="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition">
                    <span><?= $icon ?></span>
                    <span class="truncate"><?= $label ?></span>
                </a>
                <?php endforeach; ?>
            </div>
        </nav>

        <!-- ══════════════════════════════════════════════════
             OSINT INTELLIGENCE  (DESTAQUE)
        ══════════════════════════════════════════════════ -->
        <section id="osint" class="section-anchor mb-10">
            <div class="glass rounded-2xl border border-violet-500/25 overflow-hidden">
                <!-- Header -->
                <div class="bg-gradient-to-r from-violet-900/40 to-indigo-900/30 px-8 py-6 border-b border-violet-500/15">
                    <div class="flex items-start gap-4">
                        <div class="text-4xl">🔮</div>
                        <div>
                            <div class="flex flex-wrap items-center gap-2 mb-1">
                                <h2 class="text-2xl font-bold text-white">OSINT Intelligence</h2>
                                <span class="tag tag-violet">NOVO</span>
                                <span class="tag tag-red">IA</span>
                            </div>
                            <p class="text-zinc-300 text-sm leading-relaxed">
                                Motor de inteligência que combina múltiplas bases públicas para gerar um <strong class="text-white">relatório completo</strong> com <strong class="text-violet-300">Score de Suspeição 0–100</strong> sobre qualquer entidade (pessoa, empresa, político).
                            </p>
                        </div>
                    </div>
                </div>
                <!-- Content -->
                <div class="p-8 space-y-6">
                    <!-- Como acessar -->
                    <div>
                        <h3 class="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-3">Como Acessar</h3>
                        <div class="grid md:grid-cols-3 gap-3">
                            <div class="bg-white/5 rounded-xl p-4">
                                <div class="text-violet-400 font-bold text-xs uppercase tracking-wider mb-2">Tela Inicial (Investigação Rápida)</div>
                                <p class="text-zinc-400 text-sm">Na Home do portal, use o painel <em>"Investigação OSINT"</em> — digite nome, CNPJ ou CPF e clique em <strong class="text-white">Gerar Relatório</strong>.</p>
                            </div>
                            <div class="bg-white/5 rounded-xl p-4">
                                <div class="text-violet-400 font-bold text-xs uppercase tracking-wider mb-2">Barra de Busca Global</div>
                                <p class="text-zinc-400 text-sm">Ao digitar na barra de pesquisa principal, os resultados mostram um link <strong class="text-white">Ver Inteligência OSINT</strong> para empresas e políticos encontrados.</p>
                            </div>
                            <div class="bg-white/5 rounded-xl p-4">
                                <div class="text-violet-400 font-bold text-xs uppercase tracking-wider mb-2">Radar Anti-Corrupção</div>
                                <p class="text-zinc-400 text-sm">Ao consultar uma empresa no Radar A-C, o botão <strong class="text-white">Dossiê Completo</strong> abre o relatório OSINT com score calculado automaticamente.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Score de suspeição -->
                    <div>
                        <h3 class="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-3">Score de Suspeição — Como é Calculado</h3>
                        <div class="grid md:grid-cols-2 gap-3">
                            <?php
                            $fatores = [
                                ['CNEP — Cadastro Nacional de Punidos', '+35 pts', 'red'],
                                ['CEIS — Sanções por Inidoneidade', '+25 pts', 'red'],
                                ['CEAF — Expulsão de Agentes Públicos', '+20 pts', 'red'],
                                ['CEPIM — Entidades Impedidas', '+15 pts', 'amber'],
                                ['Empresa jovem com contratos elevados', '+20 pts', 'amber'],
                                ['Capital social baixo vs contratos', '+8 pts', 'amber'],
                                ['Situação cadastral irregular', '+12 pts', 'amber'],
                            ];
                            foreach($fatores as [$desc, $pts, $color]):
                            ?>
                            <div class="flex items-center gap-3 bg-white/4 rounded-lg px-4 py-2.5">
                                <span class="tag tag-<?= $color ?> shrink-0"><?= $pts ?></span>
                                <span class="text-zinc-300 text-sm"><?= $desc ?></span>
                            </div>
                            <?php endforeach; ?>
                        </div>
                        <div class="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
                            <div class="bg-emerald-900/30 border border-emerald-500/20 rounded-lg py-2 px-1"><div class="font-bold text-emerald-400">0–24</div><div class="text-zinc-500">Baixo</div></div>
                            <div class="bg-amber-900/30 border border-amber-500/20 rounded-lg py-2 px-1"><div class="font-bold text-amber-400">25–49</div><div class="text-zinc-500">Moderado</div></div>
                            <div class="bg-orange-900/30 border border-orange-500/20 rounded-lg py-2 px-1"><div class="font-bold text-orange-400">50–74</div><div class="text-zinc-500">Alto</div></div>
                            <div class="bg-red-900/30 border border-red-500/20 rounded-lg py-2 px-1"><div class="font-bold text-red-400">75–100</div><div class="text-zinc-500">Crítico</div></div>
                        </div>
                    </div>

                    <!-- Fontes consultadas -->
                    <div>
                        <h3 class="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-3">Fontes Consultadas em Paralelo</h3>
                        <div class="flex flex-wrap gap-2">
                            <?php foreach(['CNEP','CEIS','CEAF','CEPIM','Contratos Federais','Convênios','CNPJ/Receita Federal','Processos DataJud','Licitações'] as $f): ?>
                            <span class="tag tag-zinc"><?= $f ?></span>
                            <?php endforeach; ?>
                        </div>
                    </div>

                    <!-- Quick start -->
                    <div class="bg-violet-900/20 border border-violet-500/20 rounded-xl p-5">
                        <h3 class="text-sm font-bold text-violet-300 mb-3">Passo a Passo — Investigar uma Empresa</h3>
                        <ol class="space-y-2 text-sm text-zinc-300">
                            <li class="flex gap-3 items-start"><span class="step-num mt-0.5">1</span>Na Home, localize o painel <em>"Investigação Rápida OSINT"</em>.</li>
                            <li class="flex gap-3 items-start"><span class="step-num mt-0.5">2</span>Digite o CNPJ (com ou sem pontuação) ou nome da empresa.</li>
                            <li class="flex gap-3 items-start"><span class="step-num mt-0.5">3</span>Clique em <strong class="text-white">Gerar Relatório</strong>. O sistema consulta 9 fontes em paralelo.</li>
                            <li class="flex gap-3 items-start"><span class="step-num mt-0.5">4</span>O modal exibe: score visual 0–100, nível de risco, alertas categorizados, dados da empresa, quadro de sócios e histórico de contratos.</li>
                            <li class="flex gap-3 items-start"><span class="step-num mt-0.5">5</span>Use os botões internos do modal para navegar diretamente ao Radar A-C ou ao dossiê completo do fornecedor.</li>
                        </ol>
                    </div>
                </div>
            </div>
        </section>

        <!-- ══════════════════════════════════════════════════
             PARLAMENTARES
        ══════════════════════════════════════════════════ -->
        <section id="parlamentares" class="section-anchor mb-10">
            <h2 class="text-xl font-bold text-zinc-200 mb-4 flex items-center gap-2">
                <span>👔</span> Parlamentares
            </h2>
            <div class="grid md:grid-cols-2 gap-4">

                <!-- Deputados -->
                <div class="glass tool-card rounded-2xl p-6 hover:border-blue-500/30">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-2xl">👔</span>
                        <h3 class="text-lg font-bold text-white">Deputados Federais</h3>
                        <span class="tag tag-blue">Câmara API</span>
                    </div>
                    <p class="text-zinc-400 text-sm mb-4">Lista todos os 513 deputados com filtro por partido, estado e nome. Clique em um deputado para ver perfil completo com foto, biografia, proposições e gastos da cota parlamentar (CEAP).</p>
                    <div class="space-y-1.5 text-xs text-zinc-500">
                        <div class="flex gap-2"><strong class="text-zinc-400 w-20 shrink-0">API:</strong> api.camara.leg.br/v2</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-20 shrink-0">Dados:</strong> Perfil, mandato, despesas CEAP, proposições, votações</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-20 shrink-0">Cache:</strong> 60 min (lista) / 30 min (perfil)</div>
                    </div>
                </div>

                <!-- Senadores -->
                <div class="glass tool-card rounded-2xl p-6 hover:border-blue-500/30">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-2xl">🏛️</span>
                        <h3 class="text-lg font-bold text-white">Senadores</h3>
                        <span class="tag tag-blue">Senado API</span>
                    </div>
                    <p class="text-zinc-400 text-sm mb-4">Lista dos 81 senadores com perfil detalhado, comissões e histórico de gastos. O modal de senador exibe mandatos anteriores, votações e projetos de autoria.</p>
                    <div class="space-y-1.5 text-xs text-zinc-500">
                        <div class="flex gap-2"><strong class="text-zinc-400 w-20 shrink-0">API:</strong> legis.senado.leg.br/dadosabertos</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-20 shrink-0">Dados:</strong> Perfil, partido, UF, gastos, projetos</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-20 shrink-0">Cache:</strong> 60 min</div>
                    </div>
                </div>

                <!-- Presidentes -->
                <div class="glass tool-card rounded-2xl p-6 hover:border-green-500/30">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-2xl">🇧🇷</span>
                        <h3 class="text-lg font-bold text-white">Presidentes da República</h3>
                        <span class="tag tag-green">Histórico</span>
                    </div>
                    <p class="text-zinc-400 text-sm mb-4">Linha do tempo dos presidentes brasileiros desde a Proclamação da República. Cada card exibe período, partido, principais realizações e marcadores históricos.</p>
                    <div class="space-y-1.5 text-xs text-zinc-500">
                        <div class="flex gap-2"><strong class="text-zinc-400 w-20 shrink-0">Dados:</strong> Histórico curado + fontes abertas</div>
                    </div>
                </div>

                <!-- Comparador -->
                <div class="glass tool-card rounded-2xl p-6 hover:border-blue-500/30">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-2xl">⚖️</span>
                        <h3 class="text-lg font-bold text-white">Comparador de Parlamentares</h3>
                        <span class="tag tag-blue">Análise</span>
                    </div>
                    <p class="text-zinc-400 text-sm mb-4">Compare dois parlamentares lado a lado: gastos, votações, projetos e presença. Ideal para avaliar performance entre deputados do mesmo estado ou partido.</p>
                    <div class="space-y-1.5 text-xs text-zinc-500">
                        <div class="flex gap-2"><strong class="text-zinc-400 w-20 shrink-0">API:</strong> Câmara + Senado</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-20 shrink-0">Dados:</strong> CEAP, presença, votações, projetos</div>
                    </div>
                </div>

            </div>
        </section>

        <!-- ══════════════════════════════════════════════════
             ANTI-CORRUPÇÃO & RISCO
        ══════════════════════════════════════════════════ -->
        <section id="anticorrupcao" class="section-anchor mb-10">
            <h2 class="text-xl font-bold text-zinc-200 mb-4 flex items-center gap-2">
                <span>🔍</span> Anti-Corrupção & Risco
            </h2>
            <div class="grid md:grid-cols-2 gap-4">

                <!-- Radar A-C -->
                <div class="glass tool-card rounded-2xl p-6 hover:border-red-500/30">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-2xl">🔍</span>
                        <h3 class="text-lg font-bold text-white">Radar Anti-Corrupção</h3>
                        <span class="tag tag-red">CNEP</span>
                        <span class="tag tag-red">CEIS</span>
                    </div>
                    <p class="text-zinc-400 text-sm mb-4">Busca simultânea em 5 cadastros oficiais: CNEP, CEIS, CEAF, CEPIM e PEP. Digite nome, CPF ou CNPJ. Os resultados indicam tipo de sanção, órgão sancionador, período e valor da multa.</p>
                    <div class="space-y-1.5 text-xs text-zinc-500">
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">API:</strong> Portal da Transparência Federal</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Chave:</strong> API Key configurada no backend</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Bases:</strong> CNEP · CEIS · CEAF · CEPIM · PEP</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Integração:</strong> Aciona OSINT Intelligence automaticamente</div>
                    </div>
                </div>

                <!-- Análise de Risco -->
                <div class="glass tool-card rounded-2xl p-6 hover:border-red-500/30">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-2xl">🚨</span>
                        <h3 class="text-lg font-bold text-white">Análise de Risco</h3>
                        <span class="tag tag-red">Gastos CEAP</span>
                    </div>
                    <p class="text-zinc-400 text-sm mb-4">Aplica algoritmos sobre os gastos da cota parlamentar (CEAP) para detectar padrões suspeitos: refeições acima de R$ 500, combustível fora do estado, fornecedores recorrentes de alto valor.</p>
                    <div class="space-y-1.5 text-xs text-zinc-500">
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">API:</strong> Câmara dos Deputados v2</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Detecta:</strong> Gastos atípicos, fornecedores suspeitos, concentração</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Saída:</strong> Score de risco por deputado + alertas detalhados</div>
                    </div>
                </div>

                <!-- Top Corrupção -->
                <div class="glass tool-card rounded-2xl p-6 hover:border-red-500/30">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-2xl">🏆</span>
                        <h3 class="text-lg font-bold text-white">Top Corrupção</h3>
                        <span class="tag tag-red">Ranking</span>
                    </div>
                    <p class="text-zinc-400 text-sm mb-4">Ranking dos parlamentares com maior score de risco calculado pelo sistema. Combina análise de gastos CEAP, presença em listas de sanções e cruzamento com fornecedores suspeitos.</p>
                    <div class="space-y-1.5 text-xs text-zinc-500">
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Método:</strong> Score composto multicritério</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Atualização:</strong> Recalculado a cada consulta (sem cache)</div>
                    </div>
                </div>

                <!-- Radar Conexões -->
                <div class="glass tool-card rounded-2xl p-6 hover:border-violet-500/30">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-2xl">🕸️</span>
                        <h3 class="text-lg font-bold text-white">Radar de Conexões</h3>
                        <span class="tag tag-violet">Grafo</span>
                    </div>
                    <p class="text-zinc-400 text-sm mb-4">Visualização em grafo das relações entre políticos, empresas, partidos e contratos. Revela redes de influência, fornecedores comuns e vínculos entre entidades aparentemente desconexas.</p>
                    <div class="space-y-1.5 text-xs text-zinc-500">
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Ação backend:</strong> graph_network</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Dados:</strong> Contratos, doações TSE, sócios CNPJ, vínculos</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Visualização:</strong> D3.js / grafo interativo</div>
                    </div>
                </div>

            </div>
        </section>

        <!-- ══════════════════════════════════════════════════
             FINANÇAS PÚBLICAS
        ══════════════════════════════════════════════════ -->
        <section id="financas" class="section-anchor mb-10">
            <h2 class="text-xl font-bold text-zinc-200 mb-4 flex items-center gap-2">
                <span>💰</span> Finanças Públicas
            </h2>
            <div class="grid md:grid-cols-2 gap-4">

                <!-- Orçamento -->
                <div class="glass tool-card rounded-2xl p-6 hover:border-amber-500/30">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-2xl">💰</span>
                        <h3 class="text-lg font-bold text-white">Orçamento Federal</h3>
                        <span class="tag tag-amber">Execução</span>
                    </div>
                    <p class="text-zinc-400 text-sm mb-4">Acompanhe a execução orçamentária por órgão, função e programa. Exibe dotação autorizada, liquidado, pago e saldo disponível com filtros por ano e unidade gestora.</p>
                    <div class="space-y-1.5 text-xs text-zinc-500">
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">API:</strong> Portal da Transparência — Despesas</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Dados:</strong> Dotação, empenho, liquidação, pagamento</div>
                    </div>
                </div>

                <!-- Gestão & Finanças -->
                <div class="glass tool-card rounded-2xl p-6 hover:border-amber-500/30">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-2xl">📊</span>
                        <h3 class="text-lg font-bold text-white">Gestão & Finanças</h3>
                        <span class="tag tag-amber">Transferências</span>
                    </div>
                    <p class="text-zinc-400 text-sm mb-4">Visualiza transferências da União para estados e municípios, gastos com cartão corporativo do governo e execução de convênios. Gráficos mensais de série histórica.</p>
                    <div class="space-y-1.5 text-xs text-zinc-500">
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">API:</strong> Portal da Transparência</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Dados:</strong> Transferências, cartão corporativo, convênios</div>
                    </div>
                </div>

                <!-- Receitas Públicas -->
                <div class="glass tool-card rounded-2xl p-6 hover:border-green-500/30">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-2xl">📈</span>
                        <h3 class="text-lg font-bold text-white">Receitas Públicas</h3>
                        <span class="tag tag-green">Arrecadação</span>
                    </div>
                    <p class="text-zinc-400 text-sm mb-4">Acompanhe a arrecadação federal por categoria de receita (impostos, contribuições, patrimonial). Filtros por ano, órgão e tipo. Gráfico de barras mensal.</p>
                    <div class="space-y-1.5 text-xs text-zinc-500">
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">API:</strong> Portal da Transparência — Receitas</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Dados:</strong> Previsto, lançado, realizado por categoria</div>
                    </div>
                </div>

                <!-- Mapa de Gastos -->
                <div class="glass tool-card rounded-2xl p-6 hover:border-amber-500/30">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-2xl">🗺️</span>
                        <h3 class="text-lg font-bold text-white">Mapa de Gastos</h3>
                        <span class="tag tag-amber">Geoespacial</span>
                    </div>
                    <p class="text-zinc-400 text-sm mb-4">Distribuição geográfica dos recursos públicos por município e estado. Identifique concentrações de despesa, regiões subfinanciadas e fluxo de transferências no território nacional.</p>
                    <div class="space-y-1.5 text-xs text-zinc-500">
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">APIs:</strong> Portal Transparência + Nominatim (geo)</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Mapa:</strong> Leaflet.js + tiles OpenStreetMap</div>
                    </div>
                </div>

                <!-- Licitações -->
                <div class="glass tool-card rounded-2xl p-6 hover:border-amber-500/30">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-2xl">📝</span>
                        <h3 class="text-lg font-bold text-white">Licitações</h3>
                        <span class="tag tag-amber">Contratos</span>
                    </div>
                    <p class="text-zinc-400 text-sm mb-4">Pesquise licitações e contratos federais por órgão, modalidade (pregão, concorrência, dispensa) e valor. Cada resultado mostra vencedor, CNPJ e link para o edital original.</p>
                    <div class="space-y-1.5 text-xs text-zinc-500">
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">API:</strong> Portal da Transparência — Licitações</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Dados:</strong> Modalidade, valor, fornecedor, situação</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Integração:</strong> OSINT Intelligence pelo CNPJ do vencedor</div>
                    </div>
                </div>

                <!-- Viagens a Serviço -->
                <div class="glass tool-card rounded-2xl p-6 hover:border-blue-500/30">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-2xl">✈️</span>
                        <h3 class="text-lg font-bold text-white">Viagens a Serviço</h3>
                        <span class="tag tag-blue">Diárias</span>
                    </div>
                    <p class="text-zinc-400 text-sm mb-4">Viagens internacionais e nacionais de servidores e agentes públicos. Filtros por CPF, órgão, destino e período. Exibe valor de passagem, diárias e justificativa.</p>
                    <div class="space-y-1.5 text-xs text-zinc-500">
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">API:</strong> Portal da Transparência — Viagens</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Dados:</strong> Destino, custo total, órgão, servidor</div>
                    </div>
                </div>

            </div>
        </section>

        <!-- ══════════════════════════════════════════════════
             ELEIÇÕES & PARTIDOS
        ══════════════════════════════════════════════════ -->
        <section id="eleicoes-tse" class="section-anchor mb-10">
            <h2 class="text-xl font-bold text-zinc-200 mb-4 flex items-center gap-2">
                <span>🗳️</span> Eleições & Partidos
            </h2>
            <div class="grid md:grid-cols-2 gap-4">

                <!-- Eleições TSE -->
                <div class="glass tool-card rounded-2xl p-6 hover:border-blue-500/30">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-2xl">🗳️</span>
                        <h3 class="text-lg font-bold text-white">Eleições (TSE)</h3>
                        <span class="tag tag-blue">TSE API</span>
                    </div>
                    <p class="text-zinc-400 text-sm mb-4">Dados eleitorais do TSE: resultados por candidato, doadores de campanha, bens declarados e prestação de contas. Filtros por ano, cargo e município.</p>
                    <div class="space-y-1.5 text-xs text-zinc-500">
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">API:</strong> dadosabertos.tse.jus.br</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Dados:</strong> Candidatos, doações, bens, resultados</div>
                    </div>
                </div>

                <!-- Partidos -->
                <div class="glass tool-card rounded-2xl p-6 hover:border-blue-500/30">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-2xl">🚩</span>
                        <h3 class="text-lg font-bold text-white">Partidos Políticos</h3>
                        <span class="tag tag-blue">Câmara API</span>
                    </div>
                    <p class="text-zinc-400 text-sm mb-4">Lista todos os partidos com número eleitoral, número de parlamentares e histórico. Clique em um partido para ver seus deputados, senadores e lideranças.</p>
                    <div class="space-y-1.5 text-xs text-zinc-500">
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">API:</strong> api.camara.leg.br/v2/partidos</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Dados:</strong> Membros, lideranças, histórico</div>
                    </div>
                </div>

            </div>
        </section>

        <!-- ══════════════════════════════════════════════════
             GESTÃO & EXECUTIVO
        ══════════════════════════════════════════════════ -->
        <section id="gestao-exec" class="section-anchor mb-10">
            <h2 class="text-xl font-bold text-zinc-200 mb-4 flex items-center gap-2">
                <span>📊</span> Gestão & Executivo
            </h2>
            <div class="grid md:grid-cols-2 gap-4">

                <!-- Servidores -->
                <div class="glass tool-card rounded-2xl p-6 hover:border-zinc-500/30">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-2xl">👥</span>
                        <h3 class="text-lg font-bold text-white">Servidores Públicos</h3>
                        <span class="tag tag-zinc">SIAPE</span>
                    </div>
                    <p class="text-zinc-400 text-sm mb-4">Consulte servidores públicos federais por nome, CPF ou cargo. Exibe vínculo, órgão de lotação, cargo e remuneração bruta. Permite cruzar com contratos e licitações via OSINT.</p>
                    <div class="space-y-1.5 text-xs text-zinc-500">
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">API:</strong> Portal da Transparência — Servidores</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Dados:</strong> Nome, cargo, órgão, salário bruto</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Ação:</strong> busca_servidores + cruzamento_pfpj</div>
                    </div>
                </div>

                <!-- Executivo & Municípios -->
                <div class="glass tool-card rounded-2xl p-6 hover:border-zinc-500/30">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-2xl">🏙️</span>
                        <h3 class="text-lg font-bold text-white">Executivo & Municípios</h3>
                        <span class="tag tag-zinc">IBGE</span>
                    </div>
                    <p class="text-zinc-400 text-sm mb-4">Dados do executivo federal e municipalidades: ministérios, secretarias, gestores e receitas municipais. Filtro por UF e município via BrasilAPI + IBGE.</p>
                    <div class="space-y-1.5 text-xs text-zinc-500">
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">API:</strong> BrasilAPI · IBGE SIDRA</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Dados:</strong> Municípios, PIB, população, gestores</div>
                    </div>
                </div>

                <!-- Imóveis Funcionais -->
                <div class="glass tool-card rounded-2xl p-6 hover:border-zinc-500/30">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-2xl">🏢</span>
                        <h3 class="text-lg font-bold text-white">Imóveis Funcionais</h3>
                        <span class="tag tag-zinc">SPU</span>
                    </div>
                    <p class="text-zinc-400 text-sm mb-4">Imóveis da União cedidos a servidores e agentes públicos. Mostra endereço, valor do imóvel e nome do beneficiário. Verifique se o imóvel está sendo ocupado corretamente.</p>
                    <div class="space-y-1.5 text-xs text-zinc-500">
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">API:</strong> Portal da Transparência — Imóveis</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Dados:</strong> Endereço, valor, beneficiário, órgão</div>
                    </div>
                </div>

                <!-- Notícias -->
                <div class="glass tool-card rounded-2xl p-6 hover:border-zinc-500/30">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-2xl">📰</span>
                        <h3 class="text-lg font-bold text-white">Notícias Políticas</h3>
                        <span class="tag tag-zinc">Feed</span>
                    </div>
                    <p class="text-zinc-400 text-sm mb-4">Feed de notícias políticas recentes agregadas de veículos jornalísticos. Integrado com nomes de parlamentares para contextualizar os dados do portal com cobertura da imprensa.</p>
                    <div class="space-y-1.5 text-xs text-zinc-500">
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Ação:</strong> political_news</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Dados:</strong> Título, fonte, data, link</div>
                    </div>
                </div>

            </div>
        </section>

        <!-- ══════════════════════════════════════════════════
             DADOS ABERTOS & BUSCA
        ══════════════════════════════════════════════════ -->
        <section id="dados-abertos" class="section-anchor mb-10">
            <h2 class="text-xl font-bold text-zinc-200 mb-4 flex items-center gap-2">
                <span>📡</span> Dados Abertos & Busca
            </h2>
            <div class="grid md:grid-cols-2 gap-4">

                <!-- OSINT Search -->
                <div class="glass tool-card rounded-2xl p-6 hover:border-violet-500/30">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-2xl">🔎</span>
                        <h3 class="text-lg font-bold text-white">Busca OSINT Unificada</h3>
                        <span class="tag tag-violet">NLP</span>
                    </div>
                    <p class="text-zinc-400 text-sm mb-4">A barra de busca global usa processamento de linguagem natural para detectar automaticamente se a consulta é um CNPJ, CPF, nome de pessoa ou empresa, e direciona para as APIs mais relevantes.</p>
                    <div class="space-y-1.5 text-xs text-zinc-500">
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Ação:</strong> osint_search</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Detecta:</strong> CNPJ (14 dígitos), CPF (11 dígitos), texto livre</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Retorna:</strong> Entidades, contratos, sanções, sugestões</div>
                    </div>
                </div>

                <!-- Dados.gov.br -->
                <div class="glass tool-card rounded-2xl p-6 hover:border-green-500/30">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-2xl">🗄️</span>
                        <h3 class="text-lg font-bold text-white">Dados.gov.br (CKAN)</h3>
                        <span class="tag tag-green">Datasets</span>
                    </div>
                    <p class="text-zinc-400 text-sm mb-4">Pesquise o catálogo nacional de dados abertos do governo federal. Retorna datasets com nome, organização, formatos disponíveis e link direto para download.</p>
                    <div class="space-y-1.5 text-xs text-zinc-500">
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Ação:</strong> dados_gov_search</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">API:</strong> dados.gov.br — CKAN package_search</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Formatos:</strong> CSV, JSON, XLS, ODS, SHP</div>
                    </div>
                </div>

                <!-- Dossiê Fornecedor -->
                <div class="glass tool-card rounded-2xl p-6 hover:border-red-500/30">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-2xl">🔬</span>
                        <h3 class="text-lg font-bold text-white">Dossiê de Fornecedor</h3>
                        <span class="tag tag-red">CNPJ</span>
                        <span class="tag tag-violet">Score</span>
                    </div>
                    <p class="text-zinc-400 text-sm mb-4">Relatório completo de uma empresa: dados cadastrais (Receita Federal), contratos com o governo, sanções aplicadas, sócios e score de suspeição automaticamente calculado.</p>
                    <div class="space-y-1.5 text-xs text-zinc-500">
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Ação:</strong> investigate_supplier</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Input:</strong> CNPJ (qualquer formato)</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Saída:</strong> Empresa + Score + Sanções + Contratos</div>
                    </div>
                </div>

                <!-- Processos DataJud -->
                <div class="glass tool-card rounded-2xl p-6 hover:border-blue-500/30">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-2xl">⚖️</span>
                        <h3 class="text-lg font-bold text-white">Processos Judiciais</h3>
                        <span class="tag tag-blue">DataJud / CNJ</span>
                    </div>
                    <p class="text-zinc-400 text-sm mb-4">Consulta processos no DataJud (CNJ) por CPF, CNPJ ou nome. Mostra tribunal, classe processual, assunto, data de distribuição e movimentações recentes.</p>
                    <div class="space-y-1.5 text-xs text-zinc-500">
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Ação:</strong> datajud_processos</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">API:</strong> api-publica.datajud.cnj.jus.br</div>
                        <div class="flex gap-2"><strong class="text-zinc-400 w-28 shrink-0">Dados:</strong> Classe, tribunal, assunto, movimentações</div>
                    </div>
                </div>

            </div>
        </section>

        <!-- ══════════════════════════════════════════════════
             FONTES DE DADOS
        ══════════════════════════════════════════════════ -->
        <section id="fontes" class="section-anchor mb-10">
            <h2 class="text-xl font-bold text-zinc-200 mb-4 flex items-center gap-2">
                <span>📚</span> Fontes & APIs Utilizadas
            </h2>
            <div class="glass rounded-2xl p-6">
                <p class="text-zinc-400 text-sm mb-5">Todos os dados são obtidos em tempo real ou via cache curto (5–60 min) de APIs governamentais públicas. O portal não armazena nem modifica os dados originais.</p>
                <div class="grid md:grid-cols-2 gap-3">
                    <?php
                    $fontes = [
                        ['Câmara dos Deputados',      'api.camara.leg.br/v2',                       'Deputados, CEAP, proposições, votações, partidos'],
                        ['Senado Federal',             'legis.senado.leg.br/dadosabertos',           'Senadores, mandatos, projetos'],
                        ['Portal da Transparência',   'portaldatransparencia.gov.br/api-de-dados',  'CNEP, CEIS, CEAF, CEPIM, contratos, despesas, receitas, servidores, viagens, imóveis, licitações'],
                        ['TSE — Tribunal Superior',   'dadosabertos.tse.jus.br',                    'Candidatos, doações, bens, resultados eleitorais'],
                        ['CNJ — DataJud',             'api-publica.datajud.cnj.jus.br',             'Processos judiciais de todos os tribunais'],
                        ['BrasilAPI',                 'brasilapi.com.br/api',                       'CNPJ/Receita Federal, CEP, IBGE, câmbio'],
                        ['Dados.gov.br (CKAN)',       'dados.gov.br/dados/api/3/action',            'Catálogo de datasets abertos do governo federal'],
                        ['Nominatim / OSM',           'nominatim.openstreetmap.org',                'Geocodificação de endereços para o mapa'],
                    ];
                    foreach($fontes as [$nome, $url, $dados]):
                    ?>
                    <div class="bg-white/4 rounded-xl p-4">
                        <div class="font-semibold text-white text-sm mb-1"><?= $nome ?></div>
                        <div class="text-violet-400/80 text-xs font-mono mb-2"><?= $url ?></div>
                        <div class="text-zinc-500 text-xs"><?= $dados ?></div>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </section>

        <!-- ══════════════════════════════════════════════════
             DICAS FINAIS
        ══════════════════════════════════════════════════ -->
        <section class="mb-10">
            <div class="glass rounded-2xl border-l-4 border-l-violet-500 p-6">
                <h2 class="text-lg font-bold text-white mb-4">Dicas de Uso</h2>
                <div class="grid md:grid-cols-2 gap-4 text-sm text-zinc-400">
                    <div class="flex gap-3">
                        <span class="text-violet-400 text-lg shrink-0">💡</span>
                        <p>Use o <strong class="text-white">OSINT Intelligence</strong> antes de qualquer investigação: ele cruza todas as bases em segundos e mostra um score que orienta onde aprofundar.</p>
                    </div>
                    <div class="flex gap-3">
                        <span class="text-amber-400 text-lg shrink-0">⚡</span>
                        <p>Todas as buscas têm <strong class="text-white">cache de 30 segundos</strong> no navegador — consultas idênticas rápidas não geram novas requisições.</p>
                    </div>
                    <div class="flex gap-3">
                        <span class="text-blue-400 text-lg shrink-0">🔗</span>
                        <p>No <strong class="text-white">Radar de Conexões</strong>, arraste os nós do grafo para reorganizar a visualização e identificar clusters de relacionamentos.</p>
                    </div>
                    <div class="flex gap-3">
                        <span class="text-green-400 text-lg shrink-0">📱</span>
                        <p>No celular, use a <strong class="text-white">barra inferior</strong> para navegar entre seções. O botão <em>"Mais"</em> abre todas as 20 ferramentas em um menu deslizante.</p>
                    </div>
                    <div class="flex gap-3">
                        <span class="text-red-400 text-lg shrink-0">⚠️</span>
                        <p>Os dados são fornecidos pelas APIs governamentais. Erros ou ausência de dados refletem o que os órgãos disponibilizaram oficialmente, não uma falha do portal.</p>
                    </div>
                    <div class="flex gap-3">
                        <span class="text-violet-400 text-lg shrink-0">🎯</span>
                        <p>Para investigar um fornecedor suspeito: use o Radar A-C → copie o CNPJ → abra o Dossiê → veja o Score OSINT e os alertas detalhados.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="mt-12 pt-8 border-t border-white/8 text-center text-zinc-600 text-sm">
            &copy; <?php echo date('Y'); ?> Hyper Z Community — Portal de Transparência v2.4.5 &middot;
            <a href="index.php" class="hover:text-zinc-400 transition">Acessar o Portal</a>
        </footer>

    </div>

    <script>
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
