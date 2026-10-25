<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

$url = $_GET['url'] ?? '';

// Segurança: permitir apenas URLs do TSE
if (strpos($url, 'https://resultados.tse.jus.br') !== 0) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid URL or unauthorized domain"]);
    exit;
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
// Usar timeout baixo para não travar a aplicação
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Accept: application/json, text/plain, */*'));

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($response === false || $httpcode >= 400) {
    http_response_code(200); // Sempre retorna 200 para não sujar o console do navegador
    
    $errorMsg = "Erro ao buscar dados do TSE";
    if ($httpcode == 404) {
        $errorMsg = "Dados não encontrados ou eleição não iniciada (HTTP 404)";
    }
    
    echo json_encode([
        "error" => $errorMsg, 
        "http_code" => $httpcode ?: 500,
        "curl_error" => $error
    ]);
} else {
    echo $response;
}
