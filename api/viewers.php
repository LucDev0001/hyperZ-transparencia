<?php
/**
 * Real-time Active Viewers API
 */

header('Content-Type: application/json');

$viewersFile = __DIR__ . '/../viewers_data.json';

// Initialize file if not exists
if (!file_exists($viewersFile)) {
    file_put_contents($viewersFile, json_encode([]));
}

// Get client IP
$clientIp = $_SERVER['HTTP_CLIENT_IP'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$sessionId = md5($clientIp . ($_SERVER['HTTP_USER_AGENT'] ?? ''));

$now = time();
$timeout = 15; // Consider viewer inactive after 15 seconds without a ping

// Read current viewers with shared lock
$json = file_get_contents($viewersFile);
$viewers = $json ? json_decode($json, true) : [];

if (!is_array($viewers)) {
    $viewers = [];
}

// Clean up old viewers and find if we exist
$activeViewers = [];
foreach ($viewers as $id => $timestamp) {
    if ($now - $timestamp <= $timeout) {
        $activeViewers[$id] = $timestamp;
    }
}

// Update our timestamp
$activeViewers[$sessionId] = $now;

// Save with exclusive lock
file_put_contents($viewersFile, json_encode($activeViewers), LOCK_EX);

// Return the real count
echo json_encode([
    'viewers' => count($activeViewers)
]);
