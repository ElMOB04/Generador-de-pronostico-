# API de Generador de Pronósticos

## Configuración

Para que la API funcione correctamente, asegúrate de:

1. **XAMPP ejecutándose**: Apache debe estar activo
2. **Acceder vía servidor web**: NO abrir los archivos HTML directamente desde el explorador
3. **URL correcta**: Usar `http://localhost/generar%20pronostico/api/test_api.html`

## Cómo probar la API

### Opción 1: Usar el navegador
1. Abre tu navegador
2. Ve a: `http://localhost/generar%20pronostico/api/test_api.html`
3. Ejecuta las pruebas

### Opción 2: Usar el panel de control de XAMPP
1. Abre XAMPP Control Panel
2. Haz clic en "Admin" junto a Apache
3. Navega a la carpeta del proyecto
4. Abre `api/test_api.html`

### Opción 3: Usar Postman

#### URLs para Postman:

**Base URL**: `http://localhost/generar%20pronostico/api/`

#### 1. Test Simple del Servidor
- **Método**: GET
- **URL**: `http://localhost/generar%20pronostico/api/test_simple.php`
- **Headers**: `Content-Type: application/json`

#### 2. Listar Pronósticos
- **Método**: GET
- **URL**: `http://localhost/generar%20pronostico/api/list_pronosticos.php`
- **Headers**: `Content-Type: application/json`

#### 3. Guardar Pronóstico
- **Método**: POST
- **URL**: `http://localhost/generar%20pronostico/api/save_pronostico.php`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
    "general": {
        "region-select": "Cibao",
        "fecha": "2024-01-15",
        "hora": "14:30",
        "pronosticador": "Juan Pérez",
        "condiciones": "Cielo parcialmente nublado con posibilidad de lluvias ligeras",
        "especiales": "Vientos moderados del este",
        "maritimas": "Oleaje moderado, visibilidad buena"
    },
    "table24": [
        {
            "province": "Santiago",
            "cells": [["Soleado"], ["Parcialmente Nublado"], ["Nublado"], ["25", "18"]]
        },
        {
            "province": "La Vega",
            "cells": [["Nublado"], ["Aguaceros"], ["Lluvias"], ["23", "16"]]
        }
    ],
    "table4872": [
        {
            "province": "Santiago",
            "cells": [["Soleado", "26"], ["Parcialmente Nublado", "24"]]
        },
        {
            "province": "La Vega",
            "cells": [["Nublado", "22"], ["Aguaceros", "20"]]
        }
    ]
}
```

#### Pasos en Postman:
1. Abre Postman
2. Crea una nueva colección llamada "Generador Pronósticos"
3. Crea requests para cada endpoint
4. Asegúrate de que XAMPP esté ejecutándose
5. Ejecuta las pruebas en orden

## Estructura de archivos

- `save_pronostico.php` - Guarda pronósticos en archivos JSON
- `list_pronosticos.php` - Lista todos los pronósticos guardados
- `test_simple.php` - Prueba simple del servidor
- `test_api.html` - Interfaz de pruebas
- `data/` - Carpeta donde se guardan los pronósticos

## Solución de problemas

### Error "Failed to fetch"
- Verifica que XAMPP esté ejecutándose
- Asegúrate de acceder vía `http://localhost/` y no `file://`
- Revisa que Apache esté activo en XAMPP Control Panel

### Error de permisos
- Verifica que la carpeta `data/` tenga permisos de escritura
- En Windows, ejecuta XAMPP como administrador si es necesario

### Error de CORS
- Los headers CORS ya están configurados en los archivos PHP
- Si persiste, verifica la configuración de Apache

### Error en Postman
- Verifica que la URL base sea correcta
- Asegúrate de que el Content-Type sea `application/json`
- Para POST requests, usa "raw" y selecciona "JSON" en el dropdown

# API para Generador de Pronósticos

Esta API permite guardar y recuperar los datos de pronósticos meteorológicos generados por la aplicación.

## Archivos de la API

### 1. `save_pronostico.php`
**Endpoint:** `POST /api/save_pronostico.php`

Guarda los datos del pronóstico en un archivo JSON.

**Parámetros de entrada:**
```json
{
  "general": {
    "region-select": "Cibao",
    "fecha": "2024-01-15",
    "hora": "14:30",
    "pronosticador": "Juan Pérez",
    "condiciones": "Cielo parcialmente nublado...",
    "especiales": "Vientos moderados...",
    "maritimas": "Oleaje moderado..."
  },
  "table24": [...],
  "table4872": [...]
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Pronóstico guardado exitosamente",
  "filename": "pronostico_Cibao_2024-01-15_14-30.json",
  "timestamp": "2024-01-15 14:30:00"
}
```

### 2. `list_pronosticos.php`
**Endpoint:** `GET /api/list_pronosticos.php`

Obtiene la lista de todos los pronósticos guardados.

**Respuesta:**
```json
{
  "success": true,
  "pronosticos": [
    {
      "filename": "pronostico_Cibao_2024-01-15_14-30.json",
      "region": "Cibao",
      "fecha": "2024-01-15",
      "hora": "14:30",
      "pronosticador": "Juan Pérez",
      "timestamp": "2024-01-15 14:30:00",
      "size": 2048
    }
  ],
  "total": 1
}
```

## Estructura de Datos

Los archivos JSON se guardan en la carpeta `api/data/` con el siguiente formato:

```json
{
  "general": {
    "region-select": "string",
    "fecha": "YYYY-MM-DD",
    "hora": "HH:MM",
    "pronosticador": "string",
    "condiciones": "string",
    "especiales": "string",
    "maritimas": "string"
  },
  "table24": [
    {
      "province": "string",
      "cells": [["condition"], ["condition"], ["condition"], ["max", "min"]]
    }
  ],
  "table4872": [
    {
      "province": "string",
      "cells": [["condition", "temp"], ["condition", "temp"]]
    }
  ],
  "timestamp": "YYYY-MM-DD HH:MM:SS",
  "ip": "string"
}
```

## Integración con el Frontend

La aplicación principal (`generador.js`) incluye las siguientes funciones para interactuar con la API:

### `enviarDatosAAPI()`
Envía los datos del formulario a la API automáticamente cuando se genera un PDF.

### `obtenerPronosticosGuardados()`
Obtiene la lista de pronósticos guardados (para futuras funcionalidades).

### `mostrarNotificacion(message, type)`
Muestra notificaciones al usuario sobre el estado de las operaciones con la API.

## Configuración del Servidor

### Requisitos
- Servidor web con soporte para PHP 7.0 o superior
- Permisos de escritura en la carpeta `api/data/`

### Permisos de Archivos
```bash
chmod 755 api/
chmod 644 api/*.php
chmod 755 api/data/
```

### Configuración de CORS
La API incluye headers CORS para permitir peticiones desde cualquier origen:
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET');
header('Access-Control-Allow-Headers: Content-Type');
```

## Pruebas

Usa el archivo `test_api.html` para probar la funcionalidad de la API:

1. Abre `api/test_api.html` en tu navegador
2. Haz clic en "Enviar Datos de Prueba" para probar el guardado
3. Haz clic en "Obtener Lista de Pronósticos" para ver los datos guardados
4. Haz clic en "Probar Conexión" para verificar que la API responde

## Seguridad

- La API valida que las peticiones sean POST para guardar datos
- Los nombres de archivo se sanitizan para evitar inyección de rutas
- Se registra la IP del cliente para auditoría
- Los datos se validan antes de ser procesados

## Solución de Problemas

### Error 405 - Método no permitido
- Verifica que estés usando POST para guardar y GET para listar

### Error 500 - Error interno del servidor
- Verifica los permisos de la carpeta `api/data/`
- Revisa los logs de error de PHP

### Error de CORS
- Verifica que los headers CORS estén configurados correctamente
- Asegúrate de que el servidor permita peticiones desde tu dominio

### Datos no se guardan
- Verifica que la carpeta `api/data/` exista y tenga permisos de escritura
- Revisa que el JSON enviado sea válido 