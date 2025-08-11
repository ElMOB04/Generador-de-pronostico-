<?php
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

echo json_encode([
    'success' => true,
    'message' => 'Servidor PHP funcionando correctamente',
    'timestamp' => date('Y-m-d H:i:s'),
    'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    'environment' => Config::isLocalhost() ? 'localhost' : 'hosting',
    'baseUrl' => Config::getBaseUrl(),
    'dataPath' => Config::getDataPath()
]);
?> 