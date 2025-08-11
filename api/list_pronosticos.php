<?php
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Solo permitir peticiones GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

try {
    // Usar la configuración centralizada para la ruta de datos
    $dataDir = Config::getDataPath();
    
    // Verificar si existe la carpeta de datos y crearla si no existe
    if (!is_dir($dataDir)) {
        // Intentar crear la carpeta con permisos completos
        if (!mkdir($dataDir, 0755, true)) {
            // Si falla, intentar con permisos más permisivos
            if (!mkdir($dataDir, 0777, true)) {
                throw new Exception('No se pudo crear el directorio de datos. Verifica los permisos del servidor.');
            }
        }
        
        // Crear un archivo .htaccess para proteger la carpeta
        $htaccessContent = "# Proteger archivos JSON\n";
        $htaccessContent .= "<Files \"*.json\">\n";
        $htaccessContent .= "    Order allow,deny\n";
        $htaccessContent .= "    Deny from all\n";
        $htaccessContent .= "</Files>\n";
        $htaccessContent .= "\n";
        $htaccessContent .= "# Permitir acceso solo a la API\n";
        $htaccessContent .= "<Files \"*.php\">\n";
        $htaccessContent .= "    Order allow,deny\n";
        $htaccessContent .= "    Allow from all\n";
        $htaccessContent .= "</Files>\n";
        
        file_put_contents($dataDir . '/.htaccess', $htaccessContent);
        
        // Crear un archivo index.html para evitar listado de directorios
        file_put_contents($dataDir . '/index.html', '<html><head><title>403 Forbidden</title></head><body><h1>403 Forbidden</h1><p>Access denied.</p></body></html>');
        
        echo json_encode([
            'success' => true,
            'pronosticos' => [],
            'message' => 'Directorio de datos creado. No hay pronósticos guardados aún.',
            'baseUrl' => Config::getBaseUrl(),
            'dataDirCreated' => true
        ]);
        exit;
    }
    
    // Verificar permisos de escritura en la carpeta
    if (!is_writable($dataDir)) {
        // Intentar cambiar permisos
        if (!chmod($dataDir, 0755)) {
            throw new Exception('La carpeta de datos no tiene permisos de escritura. Contacta al administrador del servidor.');
        }
    }
    
    // Obtener todos los archivos JSON
    $files = glob($dataDir . '/*.json');
    $pronosticos = [];
    
    foreach ($files as $file) {
        $content = file_get_contents($file);
        $data = json_decode($content, true);
        if ($data) {
            $pronosticos[] = [
                'filename' => basename($file),
                'size' => filesize($file),
                'region' => $data['general']['region-select'] ?? 'Desconocida',
                'fecha' => $data['general']['fecha'] ?? 'Desconocida',
                'hora' => $data['general']['hora'] ?? 'Desconocida',
                'pronosticador' => $data['general']['pronosticador'] ?? 'Desconocido',
                'timestamp' => $data['timestamp'] ?? 'Desconocido',
                // Incluir todos los datos del pronóstico para el dashboard
                'data' => $data
            ];
        }
    }
    
    // Ordenar por fecha más reciente (usando timestamp si existe)
    usort($pronosticos, function($a, $b) {
        $ta = isset($a['timestamp']) ? strtotime($a['timestamp']) : 0;
        $tb = isset($b['timestamp']) ? strtotime($b['timestamp']) : 0;
        return $tb - $ta;
    });
    
    echo json_encode([
        'success' => true,
        'pronosticos' => $pronosticos,
        'total' => count($pronosticos),
        'baseUrl' => Config::getBaseUrl(),
        'dataDir' => $dataDir,
        'dataDirWritable' => is_writable($dataDir)
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage(),
        'dataDir' => $dataDir ?? 'No definida',
        'serverInfo' => [
            'phpVersion' => PHP_VERSION,
            'serverSoftware' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
            'documentRoot' => $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown'
        ]
    ]);
}
?> 