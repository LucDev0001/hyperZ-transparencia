<?php
/**
 * Simple Live Chat API for Apuração (Ephemeral)
 * Only keeps the last 50 messages in a JSON file.
 */

header('Content-Type: application/json');

$chatFile = __DIR__ . '/../chat_data.json';

// Initialize file if not exists
if (!file_exists($chatFile)) {
    file_put_contents($chatFile, json_encode([]));
}

$action = $_GET['action'] ?? 'read';

if ($action === 'post') {
    // Read raw post data
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || empty($input['username']) || empty($input['message'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid data']);
        exit;
    }

    $username = htmlspecialchars(strip_tags(trim($input['username'])));
    $message = htmlspecialchars(strip_tags(trim($input['message'])));

    // Prevent huge messages
    if (strlen($message) > 250) {
        $message = substr($message, 0, 250) . '...';
    }

    $messages = json_decode(file_get_contents($chatFile), true) ?: [];

    // Append new message
    $messages[] = [
        'id' => uniqid(),
        'username' => $username,
        'message' => $message,
        'time' => date('H:i:s')
    ];

    // Keep only last 50 messages to prevent heavy load
    if (count($messages) > 50) {
        $messages = array_slice($messages, -50);
    }

    // Save with lock
    file_put_contents($chatFile, json_encode($messages), LOCK_EX);

    echo json_encode(['success' => true]);
    exit;
}

if ($action === 'read') {
    $messages = json_decode(file_get_contents($chatFile), true) ?: [];
    echo json_encode(['messages' => $messages]);
    exit;
}

http_response_code(400);
echo json_encode(['error' => 'Unknown action']);
