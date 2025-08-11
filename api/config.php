<?php
// Configuración para diferentes entornos
class Config {
    // Detectar si estamos en localhost o en hosting
    public static function isLocalhost() {
        return in_array($_SERVER['HTTP_HOST'], ['localhost', '127.0.0.1']) || 
               strpos($_SERVER['HTTP_HOST'], 'localhost') !== false;
    }
    
    // Obtener la URL base
    public static function getBaseUrl() {
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'];
        $path = dirname($_SERVER['SCRIPT_NAME']);
        
        return $protocol . '://' . $host . $path;
    }
    
    // Obtener la ruta de datos
    public static function getDataPath() {
        return __DIR__ . '/data';
    }
    
    // Configurar headers CORS
    public static function setCorsHeaders() {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        
        // Manejar preflight requests
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    }
    
    // Configurar zona horaria
    public static function setTimezone() {
        date_default_timezone_set('America/Santo_Domingo');
    }
}

// Aplicar configuración global
Config::setCorsHeaders();
Config::setTimezone();
?> 