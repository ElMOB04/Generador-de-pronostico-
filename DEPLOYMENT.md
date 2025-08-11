# 🚀 Guía de Despliegue en Hosting Web

## 📋 Requisitos del Hosting

Tu hosting debe tener:
- ✅ **PHP 7.4 o superior**
- ✅ **Soporte para archivos JSON**
- ✅ **Permisos de escritura en carpetas**
- ✅ **Soporte para CORS**

## �� Archivos a Subir

**IMPORTANTE: NO subas la carpeta `data/` - se creará automáticamente**

Sube el proyecto completo EXCEPTO la carpeta `data/`:

```
📦 Tu proyecto (sin la carpeta data/)
├── 📁 api/
│   ├── 📄 config.php
│   ├── 📄 save_pronostico.php
│   ├── 📄 list_pronosticos.php
│   ├── 📄 test_simple.php
│   ├── 📄 test_dashboard.php
│   ├── 📄 test_api.html
│   ├── 📄 README.md
│   └── 📁 data/ ← NO SUBIR ESTA CARPETA
├── 📁 dashboard/
│   ├── 📄 dashboard.html
│   ├── 📄 dashboard.js
│   ├── 📄 dashboard.css
│   └── 📄 README.md
├── 📁 iconos/
├── 📄 generador.html
├── 📄 generador.js
├── 📄 generador.css
├── 📄 logo.jpg
└── 📄 DEPLOYMENT.md
```

## 🔧 Configuraciones Necesarias

### 1. Permisos de Carpetas
En tu hosting, asegúrate de que:
- La carpeta `api/` tenga permisos **755**
- Los archivos PHP tengan permisos **644**

### 2. Configuración de PHP
Verifica que tu hosting tenga habilitado:
- `file_get_contents()`
- `file_put_contents()`
- `json_encode()` y `json_decode()`
- `mkdir()` con recursión

### 3. Límites de PHP
Si tienes problemas, aumenta estos límites en tu hosting:
```php
// En .htaccess o php.ini
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 300
memory_limit = 256M
```

## 🌐 URLs en Hosting

### Base URL
```
https://tudominio.com/tu-carpeta/api/
```

### URLs específicas:
- **Test Simple**: `https://tudominio.com/tu-carpeta/api/test_simple.php`
- **Listar Pronósticos**: `https://tudominio.com/tu-carpeta/api/list_pronosticos.php`
- **Guardar Pronóstico**: `https://tudominio.com/tu-carpeta/api/save_pronostico.php`
- **Test API**: `https://tudominio.com/tu-carpeta/api/test_api.html`
- **Dashboard**: `https://tudominio.com/tu-carpeta/dashboard/dashboard.html`

## 🧪 Pruebas Post-Despliegue

### 1. Prueba Simple
```
GET https://tudominio.com/tu-carpeta/api/test_simple.php
```

### 2. Prueba de Listado
```
GET https://tudominio.com/tu-carpeta/api/list_pronosticos.php
```

### 3. Prueba de Guardado
```
POST https://tudominio.com/tu-carpeta/api/save_pronostico.php
Content-Type: application/json

{
    "general": {
        "region-select": "Cibao",
        "fecha": "2024-01-15",
        "hora": "14:30",
        "pronosticador": "Test User"
    }
}
```

## ⚠️ Problemas Comunes

### Error 500
- Verifica permisos de carpetas
- Revisa logs de error del hosting
- Asegúrate de que PHP esté habilitado

### Error de CORS
- Los headers CORS ya están configurados
- Si persiste, contacta a tu proveedor de hosting

### Error de Permisos
- La API intentará crear la carpeta `data/` automáticamente
- Si falla, contacta a tu proveedor de hosting
- Verifica que el hosting permita escritura

### Error de JSON
- Verifica que `json_encode()` esté habilitado
- Revisa la sintaxis del JSON enviado

### La carpeta data no se crea
- Verifica que `mkdir()` esté habilitado
- Revisa los permisos del directorio padre
- Contacta a tu proveedor de hosting

## 🔒 Seguridad

### Protección Automática:
- ✅ La API crea automáticamente un `.htaccess` en la carpeta `data/`
- ✅ Los archivos JSON están protegidos contra acceso directo
- ✅ Se crea un `index.html` para evitar listado de directorios

### Recomendaciones:
- ✅ Usa HTTPS en producción
- ✅ Limita el tamaño de archivos JSON
- ✅ Valida datos de entrada
- ✅ Configura backup automático de la carpeta `data/`

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs de error del hosting
2. Prueba con el archivo `test_simple.php`
3. Verifica que la carpeta `data/` se haya creado automáticamente
4. Contacta a tu proveedor de hosting

## ✅ Checklist de Despliegue

- [ ] Subir todos los archivos EXCEPTO la carpeta `data/`
- [ ] Verificar que la carpeta `api/` tenga permisos 755
- [ ] Probar `test_simple.php` primero
- [ ] Verificar que se crea automáticamente la carpeta `data/`
- [ ] Probar `list_pronosticos.php`
- [ ] Probar `save_pronostico.php`
- [ ] Probar el dashboard
- [ ] Probar desde Postman
- [ ] Probar desde el navegador

## 🎯 Resumen

**Lo que SÍ subir:**
- Todo el proyecto excepto la carpeta `data/`

**Lo que NO subir:**
- La carpeta `data/` (se crea automáticamente)

**Lo que se crea automáticamente:**
- Carpeta `api/data/`
- Archivo `.htaccess` de protección
- Archivo `index.html` de seguridad 