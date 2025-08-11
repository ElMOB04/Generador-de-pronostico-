<?php
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Solo permitir peticiones POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

try {
    // Obtener el contenido JSON del body
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Error al decodificar JSON');
    }
    
    // Validar que tenemos datos
    if (empty($data)) {
        throw new Exception('No se recibieron datos');
    }
    
    // Agregar timestamp de cuando se guardó
    $data['timestamp'] = date('Y-m-d H:i:s');
    $data['ip'] = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    
    // Crear nombre único para el archivo
    $region = $data['general']['region-select'] ?? 'unknown';
    $fecha = $data['general']['fecha'] ?? date('Y-m-d');
    $hora = $data['general']['hora'] ?? date('H:i');
    
    $filename = sprintf(
        'pronostico_%s_%s_%s.json',
        preg_replace('/[^a-zA-Z0-9]/', '_', $region),
        $fecha,
        str_replace(':', '-', $hora)
    );
    
    // Usar la configuración centralizada para la ruta de datos
    $dataDir = Config::getDataPath();
    if (!is_dir($dataDir)) {
        if (!mkdir($dataDir, 0755, true)) {
            throw new Exception('No se pudo crear el directorio de datos');
        }
    }
    
    $filepath = $dataDir . '/' . $filename;
    
    // Guardar datos en archivo JSON
    if (file_put_contents($filepath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
        echo json_encode([
            'success' => true,
            'message' => 'Pronóstico guardado exitosamente',
            'filename' => $filename,
            'timestamp' => $data['timestamp'],
            'baseUrl' => Config::getBaseUrl()
        ]);
    } else {
        throw new Exception('Error al guardar el archivo');
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage()
    ]);
}
?> 