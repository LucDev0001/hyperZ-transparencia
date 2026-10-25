<?php
require_once __DIR__ . '/../../../public_init.php';
$is_logged_in = isset($_SESSION['user_id']);
?>
<!doctype html>
<html lang="pt-br">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Portal de Transparência — A Plataforma Hacker da Geração Z</title>
  <meta
    name="description"
    content="O banco de dados hacker da Geração Z. Investigue contratos, cruze dados de políticos e use IA para descobrir o que tentam esconder." />
  <meta name="theme-color" content="#09090b" />
  
  <script>
    window.BASE_PATH = "<?php echo BASE_PATH; ?>";
  </script>

  <!-- Open Graph / WhatsApp / Twitter -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://hyperzcommunity.com/transparency/" />
  <meta property="og:title" content="Portal de Transparência — A Plataforma Hacker da Geração Z" />
  <meta property="og:description" content="Cruze dados oficiais com IA e descubra padrões suspeitos. O civic tech hacker da nova geração." />
  <meta property="og:image" content="https://hyperzcommunity.com/img/og-transparency.png" />
  <meta property="og:locale" content="pt_BR" />
  <meta property="og:site_name" content="Hyper Z" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Portal de Transparência — A Plataforma Hacker da Geração Z" />
  <meta name="twitter:description" content="Cruze dados de políticos, gastos e contratos com a plataforma civic tech do Brasil." />
  <meta name="twitter:image" content="https://hyperzcommunity.com/img/og-transparency.png" />

  <!-- Caminhos ajustados para caminhos absolutos usando BASE_PATH -->
  <link rel="icon" type="image/png" href="<?php echo BASE_PATH; ?>/img/favicon.png" />
  <link rel="stylesheet" href="<?php echo BASE_PATH; ?>/src/css/output.css?v=<?php echo time(); ?>" />
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <!-- Leaflet (Mapas) -->
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js"></script>
  <!-- Vis-Network (Grafos do Radar) -->
  <script type="text/javascript" src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background-color: #09090b;
      color: #e4e4e7;
      background-image: 
        radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.12), transparent 45%),
        radial-gradient(circle at 100% 100%, rgba(59, 130, 246, 0.06), transparent 40%);
    }
    
    .glass-panel {
      background: rgba(24, 24, 27, 0.65);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .glass-card {
      background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
      border: 1px solid rgba(255,255,255,0.08);
      backdrop-filter: blur(8px);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .glass-card:hover {
      border-color: rgba(139, 92, 246, 0.35);
      transform: translateY(-2px);
      box-shadow: 0 12px 30px -10px rgba(124, 58, 237, 0.18);
    }

    /* Skeleton shimmer loader */
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .skeleton-box {
      background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 37%, rgba(255,255,255,0.04) 63%);
      background-size: 400% 100%;
      animation: shimmer 1.6s ease-in-out infinite;
      border-radius: 8px;
    }

    ::-webkit-scrollbar {
      width: 8px;
    }

    ::-webkit-scrollbar-track {
      background: #18181b;
    }

    ::-webkit-scrollbar-thumb {
      background: #3f3f46;
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #52525b;
    }

    /* Scrollbar hide utility */
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }

    /* App shell: sidebar scrolls independently */
    #sidebar {
      scrollbar-width: thin;
      scrollbar-color: #3f3f46 transparent;
    }
    #sidebar::-webkit-scrollbar { width: 4px; height: 4px; }
    #sidebar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 2px; }

    /* Top bar */
    #topbar {
      border-bottom: 1px solid rgba(255,255,255,0.06);
      background: rgba(9,9,11,0.85);
      backdrop-filter: blur(14px);
    }

    /* ── Etapa 8: Ajustes de acessibilidade para elementos interativos ────── */
    /* Inputs e selects — altura mínima 42px e fonte 16px (evita zoom no iOS) */
    input[type="text"],
    input[type="search"],
    input[type="email"],
    input[type="number"],
    select {
      min-height: 42px;
      font-size: 1rem !important;
    }
    /* Botões de ação principal — área de toque mínima */
    button[onclick],
    .btn-action {
      min-height: 40px;
    }
    /* Labels de filtro — texto legível (de text-xs para text-sm) */
    label {
      font-size: 0.8125rem;
    }
    /* Badges do Radar — de 10px para 11px */
    .text-\[10px\] {
      font-size: 11px !important;
    }
    /* Melhorar legibilidade de texto secundário no tema escuro */
    .text-zinc-500 {
      color: #a1a1aa !important;
    }
  </style>
  <!-- Barra de acessibilidade: tamanho de fonte e contraste (Etapa 1) -->
  <script src="<?php echo BASE_PATH; ?>/transparency/js/accessibility_bar.js?v=<?php echo filemtime(__DIR__.'/../../js/accessibility_bar.js'); ?>"></script>
  <script src="<?php echo BASE_PATH; ?>/src/js/main.js"></script>

  <!-- PWA & Mobile Support -->
  <link rel="manifest" href="<?php echo BASE_PATH; ?>/manifest.json" />
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Hyper Z">
  <link rel="apple-touch-icon" href="<?php echo BASE_PATH; ?>/img/apple-touch-icon.png">
</head>

