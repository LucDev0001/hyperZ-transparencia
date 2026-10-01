<?php
$url = "https://divulgacandcontas.tse.jus.br/divulga/rest/v1/eleicao/listar/federacao/2022";
$ch = curl_init($url);
curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_SSL_VERIFYPEER => false, CURLOPT_USERAGENT => 'Mozilla/5.0 HyperZBot/2.0', CURLOPT_TIMEOUT => 10, CURLOPT_FOLLOWLOCATION => true]);
$body = curl_exec($ch);
curl_close($ch);
echo $body;
