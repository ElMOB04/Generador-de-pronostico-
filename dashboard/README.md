# 🌡️ Dashboard de Temperaturas

## 📋 Descripción

Dashboard para visualizar temperaturas por provincia y día, conectado a la API de pronósticos meteorológicos.

## 🔗 Conexión con la API

El dashboard se conecta automáticamente a la API en `../api/list_pronosticos.php` para obtener los datos de pronósticos.

### URLs de la API:
- **API Principal**: `../api/list_pronosticos.php`
- **API de Prueba**: `../api/test_dashboard.php`

## 🚀 Cómo usar

### 1. Acceder al Dashboard
```
http://localhost/generar%20pronostico/dashboard/dashboard.html
```

### 2. Funcionalidades
- **Filtro por fecha**: Selecciona el día que quieres ver
- **Estadísticas**: Muestra máxima, mínima y promedio del día
- **Tabla de provincias**: Lista todas las provincias con sus temperaturas
- **Exportación**: Descarga datos en CSV o Excel

### 3. Datos mostrados
- **Provincia**: Nombre de la provincia
- **Condición**: Estado del tiempo (Soleado, Nublado, etc.)
- **Temperatura Máxima**: En grados Celsius
- **Temperatura Mínima**: En grados Celsius

## 🧪 Modo de Prueba

Para usar datos de prueba durante el desarrollo:

1. Abre `dashboard.js`
2. Cambia `const USE_TEST_API = false;` a `const USE_TEST_API = true;`
3. Recarga la página

Los datos de prueba incluyen:
- Santiago: 25°C / 18°C
- La Vega: 23°C / 16°C
- Puerto Plata: 27°C / 20°C

## 🔧 Configuración

### Variables importantes en `dashboard.js`:
```javascript
const API_URL = '../api/list_pronosticos.php';
const API_TEST_URL = '../api/test_dashboard.php';
const USE_TEST_API = false; // Cambiar a true para pruebas
```

### Estructura de datos esperada:
```json
{
  "success": true,
  "pronosticos": [
    {
      "data": {
        "general": {
          "fecha": "2024-01-15",
          "region-select": "Cibao"
        },
        "table24": [
          {
            "province": "Santiago",
            "cells": [
              ["Soleado"],
              ["Nublado"],
              ["Lluvias"],
              ["25", "18"]
            ]
          }
        ]
      }
    }
  ]
}
```

## 🐛 Solución de Problemas

### Error "Failed to fetch"
- Verifica que XAMPP esté ejecutándose
- Asegúrate de acceder vía `http://localhost/`
- Revisa la consola del navegador para errores

### No aparecen datos
- Verifica que haya pronósticos guardados en la API
- Revisa que los archivos JSON tengan el formato correcto
- Usa el modo de prueba para verificar la funcionalidad

### Temperaturas no se muestran
- Verifica que las tablas `table24` y `table4872` tengan datos
- Revisa que las temperaturas estén en el formato correcto
- Abre la consola del navegador para ver logs

## 📊 Logs de Debug

El dashboard incluye logs detallados en la consola del navegador:
- Datos cargados desde la API
- Pronósticos encontrados por fecha
- Temperaturas extraídas
- Estadísticas calculadas

Para ver los logs:
1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Console"
3. Recarga la página

## 📁 Archivos del Dashboard

- `dashboard.html` - Interfaz principal
- `dashboard.js` - Lógica y conexión con API
- `dashboard.css` - Estilos y diseño
- `README.md` - Esta documentación

## 🔄 Actualizaciones

El dashboard se actualiza automáticamente cuando:
- Se selecciona una nueva fecha
- Se cargan nuevos datos de la API
- Se cambia entre modo real y de prueba

## 📱 Responsive

El dashboard es completamente responsive y funciona en:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Móvil (< 768px) 