<?php
// api.php — Roteador principal. Toda lógica está em api/handlers/
require_once __DIR__ . '/waf.php'; // ← WAF — deve ser o primeiro include
ini_set('display_errors', 0);
error_reporting(E_ALL);
ini_set('memory_limit', '512M');

require_once __DIR__ . '/session_init.php';

header('Content-Type: application/json');
date_default_timezone_set('America/Sao_Paulo');
mb_internal_encoding('UTF-8');

set_exception_handler(function ($e) {
    http_response_code(500);
    error_log($e->getMessage() . "\n" . $e->getTraceAsString());
    echo json_encode(['status' => 'error', 'message' => 'Erro interno do servidor.']);
    exit;
});

require 'db.php';
require 'config.php';

if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
}
require 'mailer.php';

use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

// --- CONSTANTES ---
define('ENCRYPTION_KEY',    getenv('ENCRYPTION_KEY')    ?: 'CHAVE_PADRAO_INSEGURA_TROQUE_NO_ENV');
define('ENCRYPTION_IV_KEY', getenv('ENCRYPTION_IV_KEY') ?: 'IV_PADRAO_INSEGURO_TROQUE');
if (!defined('BASE_URL')) {
    define('BASE_URL', 'https://hyperzcommunity.com');
}

// --- FUNÇÕES DE CRIPTOGRAFIA ---
function encryptData($data, $key, $iv_key) {
    $cipher = "aes-256-cbc";
    $iv = substr(hash('sha256', $iv_key), 0, openssl_cipher_iv_length($cipher));
    return base64_encode(openssl_encrypt($data, $cipher, $key, 0, $iv));
}

function decryptData($data, $key, $iv_key) {
    $cipher = "aes-256-cbc";
    $iv = substr(hash('sha256', $iv_key), 0, openssl_cipher_iv_length($cipher));
    return openssl_decrypt(base64_decode($data), $cipher, $key, 0, $iv);
}

// --- SEGURANÇA: Sanitizar Imagem (GD) ---
function sanitizeImage($sourcePath, $targetPath, $mime) {
    if (!extension_loaded('gd')) return true;
    $img = null;
    switch ($mime) {
        case 'image/jpeg': $img = @imagecreatefromjpeg($sourcePath); break;
        case 'image/png':  $img = @imagecreatefrompng($sourcePath);  break;
        case 'image/gif':  $img = @imagecreatefromgif($sourcePath);  break;
        case 'image/webp': $img = @imagecreatefromwebp($sourcePath); break;
    }
    if (!$img) return false;

    $maxW = 1600; $maxH = 1600;
    $w = imagesx($img); $h = imagesy($img);
    if ($w > $maxW || $h > $maxH) {
        $ratio = $w / $h;
        if ($w > $h) { $nw = $maxW; $nh = $maxW / $ratio; }
        else         { $nh = $maxH; $nw = $maxH * $ratio; }
        $newImg = imagecreatetruecolor((int)$nw, (int)$nh);
        if (in_array($mime, ['image/png', 'image/webp', 'image/gif'])) {
            imagealphablending($newImg, false); imagesavealpha($newImg, true);
            imagefilledrectangle($newImg, 0, 0, (int)$nw, (int)$nh, imagecolorallocatealpha($newImg, 255, 255, 255, 127));
        }
        imagecopyresampled($newImg, $img, 0, 0, 0, 0, (int)$nw, (int)$nh, $w, $h);
        imagedestroy($img);
        $img = $newImg;
    }

    switch ($mime) {
        case 'image/jpeg': imageinterlace($img, true); imagejpeg($img, $targetPath, 80); break;
        case 'image/png':  imagealphablending($img, false); imagesavealpha($img, true); imagepng($img, $targetPath, 8); break;
        case 'image/gif':  imagegif($img, $targetPath);  break;
        case 'image/webp': imagewebp($img, $targetPath, 80); break;
    }
    imagedestroy($img);
    return true;
}

// --- SEGURANÇA: Restrições para Contas Novas ---
function checkSecurityRestrictions($pdo, $userId, $type = 'post') {
    $stmt = $pdo->prepare("SELECT created_at, avatar FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    if (!$user) return true;

    $isNew = (strtotime($user['created_at']) > strtotime('-24 hours'));
    $noAvatar = ($user['avatar'] === 'default.png' || empty($user['avatar']));

    if ($isNew || $noAvatar) {
        if ($type === 'group') return "Contas novas ou sem foto não podem criar grupos por segurança.";
        if ($type === 'link')  return "Contas novas ou sem foto não podem postar links.";
        if ($type === 'comment') {
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM comments WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)");
            $stmt->execute([$userId]);
            if ($stmt->fetchColumn() >= 5) return "Limite de comentários atingido para contas novas.";
        }
    }
    return true;
}

// --- PUSH NOTIFICATIONS ---
function sendPushNotification($pdo, $userId, $title, $body, $url = '/', $image = null) {
    try {
        $stmt = $pdo->prepare("SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = ?");
        $stmt->execute([$userId]);
        $subscriptions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if ($subscriptions) {
            $payload = json_encode(['title' => $title, 'body' => $body, 'url' => $url, 'icon' => 'img/icon-192x192.png', 'image' => $image]);
            $auth = ['VAPID' => ['subject' => 'mailto:admin@hyperz.com', 'publicKey' => getenv('VAPID_PUBLIC_KEY') ?: 'SUA_PUBLIC_KEY_AQUI', 'privateKey' => getenv('VAPID_PRIVATE_KEY') ?: 'SUA_PRIVATE_KEY_AQUI']];
            if (class_exists('Minishlink\WebPush\WebPush') && $auth['VAPID']['publicKey'] !== 'SUA_CHAVE_PUBLICA_AQUI') {
                $webPush = new WebPush($auth);
                foreach ($subscriptions as $sub) {
                    $webPush->sendOneNotification(Subscription::create(['endpoint' => $sub['endpoint'], 'publicKey' => $sub['p256dh'], 'authToken' => $sub['auth']]), $payload);
                }
            }
        }
    } catch (Exception $e) {}
}

// --- PROCESSAR MENÇÕES ---
function processMentions($pdo, $content, $actorId, $targetType, $targetId, $url) {
    preg_match_all('/@(\w+)/u', $content, $matches);
    if (!empty($matches[1])) {
        foreach (array_unique($matches[1]) as $username) {
            $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
            $stmt->execute([$username]);
            $userId = $stmt->fetchColumn();
            if ($userId && $userId != $actorId) {
                $col = ($targetType === 'group') ? 'group_id' : 'post_id';
                try { $pdo->prepare("INSERT INTO notifications (user_id, actor_id, type, $col) VALUES (?, ?, 'mention', ?)")->execute([$userId, $actorId, $targetId]); } catch (Exception $e) {}
                $context = ($targetType === 'post') ? 'post' : (($targetType === 'comment') ? 'comentário' : 'grupo');
                sendPushNotification($pdo, $userId, 'Você foi mencionado', "Alguém te marcou em um $context.", $url);
            }
        }
    }
}

// --- ALERTA DE NOVO DISPOSITIVO ---
function checkAndAlertNewDevice($pdo, $userId, $userEmail, $userName) {
    $userAgent  = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
    $ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'];
    if (strpos($ip, ',') !== false) $ip = explode(',', $ip)[0];
    $deviceHash = md5($userAgent);
    try {
        $stmt = $pdo->prepare("SELECT id FROM known_devices WHERE user_id = ? AND device_hash = ?");
        $stmt->execute([$userId, $deviceHash]);
        if (!$stmt->fetch()) {
            $pdo->prepare("INSERT INTO known_devices (user_id, device_hash, user_agent) VALUES (?, ?, ?)")->execute([$userId, $deviceHash, $userAgent]);
            $template = @file_get_contents(__DIR__ . '/src/templates/email_new_device.html') ?: "Olá {NAME}, novo acesso detectado em {TIME}. IP: {IP}.";
            $body = str_replace(['{NAME}', '{TIME}', '{DEVICE}', '{IP}', '{YEAR}'], [htmlspecialchars($userName), date('d/m/Y H:i'), htmlspecialchars($userAgent), $ip, date('Y')], $template);
            sendEmail($userEmail, $userName, "Alerta de Segurança: Novo acesso à sua conta", $body);
        } else {
            $pdo->prepare("UPDATE known_devices SET last_seen = NOW() WHERE user_id = ? AND device_hash = ?")->execute([$userId, $deviceHash]);
        }
    } catch (Exception $e) {}
}

// =====================================================================
// BOOTSTRAP: Segurança, Sessão, Rotas
// =====================================================================

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$current_user_id = $_SESSION['user_id'] ?? null;
$current_advertiser_id = $_SESSION['advertiser_id'] ?? null; // Novo: Identificar anunciante

// --- CORS ---
if (isset($_SERVER['HTTP_ORIGIN'])) {
    $origin = parse_url($_SERVER['HTTP_ORIGIN'], PHP_URL_HOST);
    $allowed = [$_SERVER['SERVER_NAME'], 'localhost', '127.0.0.1', 'hyperzcommunity.com'];
    if (isset($_SERVER['HTTP_HOST'])) $allowed[] = explode(':', $_SERVER['HTTP_HOST'])[0];
    try {
        $stmt = $pdo->query("SELECT setting_value FROM system_settings WHERE setting_key = 'allowed_domains'");
        if ($row = $stmt->fetch()) {
            $extras = array_map(function($d) { return rtrim(preg_replace('#^https?://#', '', $d), '/'); }, array_map('trim', explode(',', $row['setting_value'])));
            $allowed = array_merge($allowed, $extras);
        }
    } catch (Exception $e) {}
    if (!in_array($origin, $allowed)) { http_response_code(403); echo json_encode(['status' => 'error', 'message' => 'Origem não permitida: ' . $origin]); exit; }
}

// --- CSRF Token ---
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// --- Ações Públicas (sem autenticação) ---
$public_actions = ['login', 'register', 'check_auth', 'check_username', 'verify_email', 'forgot_password', 'reset_password', 'abacate_webhook', 'political_news', 'proxy_camara', 'proxy_senado', 'proxy_portal_transparencia', 'proxy_brasilapi', 'google_login', 'verify_2fa', 'proxy_tse', 'proxy_tse_dados', 'proxy_nominatim', 'analyze_expenses', 'scan_anticorrupcao', 'busca_servidores', 'cruzamento_pfpj', 'get_ad_pricing', 'get_active_ad', 'track_ad_click', 'submit_ad_request', 'list_missions', 'get_company_reputation', 'get_solidarity_ranking', 'get_company_public_profile', 'get_public_missions_history', 'get_testimonials', 'get_platform_stats', 'get_recent_activity', 'track_page_view', 'get_page_online', 'game_leaderboard', 'wiki_bot', 'proxy_image', 'get_deputy_votes', 'investigate_supplier', 'get_emendas', 'cross_payments', 'patrimonio_tse', 'graph_network', 'check_beneficios_sociais', 'get_bens_tse', 'get_financiamento_tse', 'datajud_processos', 'noticias_deputado', 'osint_search', 'osint_intelligence', 'get_senator_details', 'get_senator_ceaps', 'dados_gov_search', 'proxy_fiorilli', 'proxy_pvl', 'web_search', 'corruption_ranking', 'submit_support_ticket', 'list_pautas_gz_public'];

$current_admin_id = $_SESSION['admin_id'] ?? null;

if (!$current_user_id && !$current_advertiser_id && !$current_admin_id && !in_array($action, $public_actions)) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Autenticação necessária']);
    exit;
}

// --- Atualizar Status Online ---
if ($current_user_id) {
    $ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'];
    if (strpos($ip, ',') !== false) $ip = explode(',', $ip)[0];
    try { $pdo->prepare("UPDATE users SET last_active = NOW(), ip_address = ? WHERE id = ?")->execute([$ip, $current_user_id]); } catch (Exception $e) {}
}

// --- Modo de Manutenção ---
if ($method === 'POST' && !in_array($action, ['login', 'check_auth'])) {
    try {
        $maintenance = $pdo->query("SELECT setting_value FROM system_settings WHERE setting_key = 'maintenance_mode'")->fetchColumn();
        if ($maintenance === '1' && empty($_SESSION['is_admin'])) {
            echo json_encode(['status' => 'error', 'message' => '⚠️ MODO DE EMERGÊNCIA ATIVO: Novas publicações estão temporariamente suspensas.']); exit;
        }
    } catch (Exception $e) {}
}

// --- Verificar CSRF em POST ---
if ($method === 'POST' && !in_array($action, ['login', 'register', 'abacate_webhook', 'forgot_password', 'reset_password', 'google_login', 'verify_2fa', 'wiki_bot', 'track_page_view', 'submit_ad_request', 'track_ad_click'])) {
    $headers = getallheaders();
    $token = $headers['X-CSRF-Token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? $_POST['csrf_token'] ?? '';
    if (!hash_equals($_SESSION['csrf_token'], $token)) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Sessão expirada (CSRF). Recarregue a página.']); exit;
    }
}

// --- Fechar sessão para escrita (melhora performance em concorrência) ---
if (!in_array($action, ['login', 'logout', 'google_login', 'verify_2fa'])) {
    session_write_close();
}

// --- Rate Limiting POST ---
if ($method === 'POST') {
    $lastAction = $_SESSION['last_action_time'] ?? 0;
    if (time() - $lastAction < 1) {
        echo json_encode(['status' => 'error', 'message' => 'Calma! Você está indo rápido demais.']); exit;
    }
    $_SESSION['last_action_time'] = time();
}

// =====================================================================
// MÓDULOS EXTERNOS (grupos, salas de áudio, transparência)
// =====================================================================
require 'api/groups.php';
require 'api/audio_rooms.php';
require 'api/transparency.php';

// =====================================================================
// ROTEADOR — mapeia action -> arquivo handler
// =====================================================================
$routes = [

    // Autenticação
    'check_auth'          => 'auth', 'logout'               => 'auth',
    'login'               => 'auth', 'register'             => 'auth',
    'check_username'      => 'auth', 'google_login'         => 'auth',
    'verify_2fa'          => 'auth', 'verify_email'         => 'auth',
    'forgot_password'     => 'auth', 'reset_password'       => 'auth',
    'change_password'     => 'auth', 'disconnect_google'    => 'auth',
    'delete_account'      => 'auth', 'toggle_2fa'           => 'auth',

    // Feed
    'feed'                => 'feed', 'user_feed'            => 'feed',
    'explore'             => 'feed', 'trending'             => 'feed',
    'search'              => 'feed', 'global_search'        => 'feed',
    'save_interests'      => 'feed', 'check_interests'      => 'feed',
    'view_post'           => 'feed',

    // Posts & Comentarios
    'get_comments'        => 'posts', 'get_user_comments'   => 'posts',
    'create_post'         => 'posts', 'edit_post'           => 'posts',
    'delete_post'         => 'posts', 'like'                => 'posts',
    'vote_poll'           => 'posts', 'add_comment'         => 'posts',
    'get_poll_voters'     => 'posts',
    'edit_comment'        => 'posts', 'delete_comment'      => 'posts',
    'like_comment'        => 'posts', 'report_content'      => 'posts',
    'react_post'          => 'posts',

    // Stories
    'stories'             => 'stories', 'get_story_comments' => 'stories',
    'get_story_views'     => 'stories', 'create_story'       => 'stories',
    'view_story'          => 'stories', 'like_story'         => 'stories',
    'comment_story'       => 'stories',

    // Usuarios / Perfil
    'suggestions'            => 'users', 'get_profile'           => 'users',
    'friends_list'           => 'users', 'get_privacy'           => 'users',
    'get_connected_accounts' => 'users', 'download_data'         => 'users',
    'update_avatar'          => 'users', 'update_cover'          => 'users',
    'update_info'            => 'users', 'follow'                => 'users',
    'update_privacy'         => 'users', 'claim_gz_badge'        => 'users',

    // Convites
    'get_invite_stats'       => 'social', 'get_invite_leaderboard' => 'social',

    // Mensagens
    'chat_contacts'         => 'messages', 'get_messages'          => 'messages',
    'check_unread_messages' => 'messages', 'send_message'          => 'messages',
    'read_messages'         => 'messages', 'set_typing'            => 'messages',
    'chat_search_users'     => 'messages',
    'send_message_image'    => 'messages', 'pin_message' => 'messages',

    // Notificacoes
    'notifications'             => 'notifications',
    'check_notifications_count' => 'notifications',
    'get_vapid_public_key'      => 'notifications',
    'subscribe_push'            => 'notifications',
    'test_push_self'            => 'notifications',

    // Eventos
    'get_events'          => 'events', 'get_calendar_events' => 'events',
    'get_user_events'     => 'events', 'create_event'        => 'events',
    'edit_event'          => 'events', 'delete_event'        => 'events',
    'attend_event'        => 'events',

    // Media
    'proxy_image'         => 'media',

    // Biblioteca
    'get_books'              => 'library', 'upload_book'          => 'library',
    'delete_book'            => 'library', 'toggle_favorite_book' => 'library',

    // Doacoes
    'get_donors'             => 'donations', 'check_donation_status' => 'donations',
    'create_donation'        => 'donations', 'simulate_payment'      => 'donations',
    'abacate_webhook'        => 'donations',

    // Recrutamento
    'get_my_application'     => 'recruitment', 'get_recruitment_list'   => 'recruitment',
    'get_recruitment_stats'  => 'recruitment', 'submit_recruitment'     => 'recruitment',
    'process_recruitment'    => 'recruitment',

        // Transparência / Proxies (adicione estas linhas)
    'proxy_fiorilli'          => 'transparency',
    'proxy_pvl'               => 'transparency',
    'proxy_camara'            => 'transparency',
    'proxy_senado'            => 'transparency',
    'proxy_portal_transparencia' => 'transparency',
    'proxy_brasilapi'         => 'transparency',
    'proxy_tse'               => 'transparency',
    'proxy_tse_dados'         => 'transparency',
    'proxy_nominatim'         => 'transparency',

    // Jogo
    'game_sync'           => 'game', 'game_parties'         => 'game',
    'game_daily_reward'   => 'game', 'game_market_items'    => 'game',
    'game_events'         => 'game', 'game_leaderboard'     => 'game',
    'game_gym_info'       => 'game', 'game_raid_info'       => 'game',
    'game_chat_get'       => 'game', 'game_trade_list'      => 'game',
    'game_friend_list'    => 'game', 'game_chat_send'       => 'game',
    'game_trade_create'   => 'game', 'game_trade_accept'    => 'game',
    'game_friend_request' => 'game', 'game_friend_accept'   => 'game',
    'game_use_item'       => 'game', 'game_capture'         => 'game',
    'game_evolve'         => 'game', 'game_rocket_loss'     => 'game',
    'game_release'        => 'game', 'game_join_party'      => 'game',
    'game_market_buy'     => 'game', 'game_market_sell'     => 'game',
    'game_gym_claim'      => 'game', 'game_gym_attack'      => 'game',
    'game_raid_attack'    => 'game', 'game_heartbeat'       => 'game',
    'game_quest_claim'    => 'game', 'game_event_register'  => 'game',
    'game_battle_result'  => 'game',
    'wiki_bot'            => 'wiki_bot',
    // Ads
    'submit_ad_request'   => 'ads',  'get_active_ad'        => 'ads',
    'track_ad_click'      => 'ads',  'get_ad_pricing'       => 'ads',

    // Solidariedade & Reputação
    'list_missions'               => 'solidarity', 'submit_mission_proof'   => 'solidarity',
    'rate_company'                => 'solidarity', 'get_company_reputation' => 'solidarity',
    'get_solidarity_ranking'      => 'solidarity', 'approve_mission_proof'  => 'solidarity',
    'get_company_public_profile'  => 'solidarity', 'get_public_missions_history' => 'solidarity',

    // Avaliações / Depoimentos
    'submit_rating'       => 'ratings', 'check_rating'      => 'ratings',
    'get_testimonials'    => 'ratings', 'get_platform_stats' => 'ratings',
    'get_recent_activity' => 'ratings', 'track_page_view'   => 'ratings',
    'get_page_online'     => 'ratings',

    // Parceria GZ
    'list_pautas_gz_public' => 'pautas_gz',

    // Suporte
    'submit_support_ticket' => 'support',
];

if (isset($routes[$action])) {
    $handlerFile = __DIR__ . '/api/handlers/' . $routes[$action] . '.php';
    if (!file_exists($handlerFile)) {
        http_response_code(500);
        error_log("Handler não encontrado: $handlerFile");
        echo json_encode(['status' => 'error', 'message' => 'Handler não encontrado: ' . $routes[$action]]);
        exit;
    }
    require $handlerFile;
    exit;
}

// Acao nao encontrada
http_response_code(404);
echo json_encode(['status' => 'error', 'message' => 'Acao nao encontrada: ' . htmlspecialchars($action)]);
