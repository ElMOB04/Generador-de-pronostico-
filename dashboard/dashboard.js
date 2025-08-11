// Configuración de la API
const API_URL = '../api/list_pronosticos.php';
const API_TEST_URL = '../api/test_dashboard.php'; // Para pruebas

// Variable para alternar entre API real y de prueba
const USE_TEST_API = false; // Cambiar a true para usar datos de prueba

document.addEventListener('DOMContentLoaded', async () => {
    const fechaSelect = document.getElementById('fecha-select');
    const clearFiltersBtn = document.getElementById('clear-filters');
    const noDataMessage = document.getElementById('no-data-message');
    const tablaTemperaturas = document.getElementById('tabla-temperaturas');
    const tablaBody = document.getElementById('tabla-body');
    const fechaSeleccionada = document.getElementById('fecha-seleccionada');
    const exportCsvBtn = document.getElementById('export-csv');
    const exportXlsxBtn = document.getElementById('export-xlsx');

    // Elementos de estadísticas
    const tempMaxima = document.getElementById('temp-maxima');
    const tempMinima = document.getElementById('temp-minima');
    const tempPromedio = document.getElementById('temp-promedio');

    let pronosticos = [];
    let datosTemperaturas = [];

    // Cargar datos de la API
    async function cargarDatos() {
        try {
            const url = USE_TEST_API ? API_TEST_URL : API_URL;
            console.log('Cargando datos desde:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Datos recibidos:', data);
            
            if (data.success) {
                pronosticos = data.pronosticos;
                console.log('Pronósticos cargados:', pronosticos.length);
                llenarFiltros();
                if (fechaSelect.value) {
                    mostrarTemperaturas(fechaSelect.value);
                }
            } else {
                mostrarMensaje('No se pudieron cargar los datos de la API: ' + (data.message || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error al cargar datos:', error);
            mostrarMensaje('Error al conectar con la API: ' + error.message);
        }
    }

    // Llenar el select de fechas
    function llenarFiltros() {
        const fechas = new Set();

        pronosticos.forEach(p => {
            if (p.data && p.data.general && p.data.general.fecha) {
                fechas.add(p.data.general.fecha);
            }
        });

        fechaSelect.innerHTML = '<option value="">Selecciona una fecha</option>';
        Array.from(fechas).sort().reverse().forEach(fecha => {
            const fechaFormateada = formatearFecha(fecha);
            fechaSelect.innerHTML += `<option value="${fecha}">${fechaFormateada}</option>`;
        });
        
        console.log('Filtros llenados. Fechas disponibles:', Array.from(fechas));
    }

    // Formatear fecha para mostrar
    function formatearFecha(fecha) {
        if (!fecha) return 'Sin fecha';
        const date = new Date(fecha + 'T00:00:00');
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Mostrar temperaturas para una fecha específica
    function mostrarTemperaturas(fecha) {
        console.log('Mostrando temperaturas para fecha:', fecha);
        
        const pronosticosFecha = pronosticos.filter(p => {
            return p.data && p.data.general && p.data.general.fecha === fecha;
        });

        console.log('Pronósticos encontrados para la fecha:', pronosticosFecha.length);

        if (pronosticosFecha.length === 0) {
            mostrarMensajeNoDatos();
            return;
        }

        // Extraer datos de temperaturas de todas las tablas
        datosTemperaturas = [];
        
        pronosticosFecha.forEach(pronostico => {
            const data = pronostico.data;
            console.log('Procesando pronóstico:', data.general?.region);
            
            // Extraer de tabla 24h
            if (data.table24) {
                console.log('Tabla 24h encontrada con', data.table24.length, 'filas');
                data.table24.forEach(row => {
                    if (row.cells && row.cells[3] && row.cells[3].length >= 2) {
                        const maxima = parseFloat(row.cells[3][0]);
                        const minima = parseFloat(row.cells[3][1]);
                        
                        if (!isNaN(maxima) || !isNaN(minima)) {
                            datosTemperaturas.push({
                                provincia: row.province || 'Sin especificar',
                                maxima: !isNaN(maxima) ? maxima : null,
                                minima: !isNaN(minima) ? minima : null,
                                condicion: row.cells[1] ? row.cells[1][0] : 'Sin especificar'
                            });
                            console.log('Temperatura agregada:', row.province, maxima, minima);
                        }
                    }
                });
            }
            
            // Extraer de tabla 48/72h
            if (data.table4872) {
                console.log('Tabla 48/72h encontrada con', data.table4872.length, 'filas');
                data.table4872.forEach(row => {
                    if (row.cells && row.cells.length >= 2) {
                        const temp = row.cells[1] ? parseFloat(row.cells[1]) : null;
                        if (temp && !isNaN(temp)) {
                            datosTemperaturas.push({
                                provincia: row.province || 'Sin especificar',
                                maxima: temp,
                                minima: temp - 5, // Estimación de mínima
                                condicion: row.cells[0] ? row.cells[0][0] : 'Sin especificar'
                            });
                            console.log('Temperatura 48/72h agregada:', row.province, temp);
                        }
                    }
                });
            }
        });

        console.log('Total de temperaturas extraídas:', datosTemperaturas.length);

        // Eliminar duplicados por provincia (mantener el primero)
        const provinciasUnicas = new Map();
        datosTemperaturas.forEach(dato => {
            if (!provinciasUnicas.has(dato.provincia)) {
                provinciasUnicas.set(dato.provincia, dato);
            }
        });

        datosTemperaturas = Array.from(provinciasUnicas.values());
        console.log('Temperaturas únicas por provincia:', datosTemperaturas.length);

        if (datosTemperaturas.length === 0) {
            mostrarMensajeNoDatos();
            return;
        }

        // Actualizar estadísticas
        actualizarEstadisticas();
        
        // Mostrar tabla
        mostrarTabla();
        
        // Actualizar fecha seleccionada
        fechaSeleccionada.textContent = formatearFecha(fecha);
    }

    // Actualizar estadísticas
    function actualizarEstadisticas() {
        const maximas = datosTemperaturas.map(d => d.maxima).filter(t => t !== null);
        const minimas = datosTemperaturas.map(d => d.minima).filter(t => t !== null);
        
        console.log('Estadísticas - Máximas:', maximas, 'Mínimas:', minimas);
        
        if (maximas.length > 0) {
            const maxTemp = Math.max(...maximas);
            tempMaxima.textContent = `${maxTemp}°C`;
        } else {
            tempMaxima.textContent = '--°C';
        }
        
        if (minimas.length > 0) {
            const minTemp = Math.min(...minimas);
            tempMinima.textContent = `${minTemp}°C`;
        } else {
            tempMinima.textContent = '--°C';
        }
        
        if (maximas.length > 0 && minimas.length > 0) {
            const promedio = (Math.max(...maximas) + Math.min(...minimas)) / 2;
            tempPromedio.textContent = `${promedio.toFixed(1)}°C`;
        } else {
            tempPromedio.textContent = '--°C';
        }
    }

    // Mostrar tabla de temperaturas
    function mostrarTabla() {
        tablaBody.innerHTML = '';
        
        datosTemperaturas.forEach(dato => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="provincia">${dato.provincia}</td>
                <td class="condicion">${dato.condicion}</td>
                <td class="maxima">${dato.maxima !== null ? dato.maxima + '°C' : '--'}</td>
                <td class="minima">${dato.minima !== null ? dato.minima + '°C' : '--'}</td>
            `;
            tablaBody.appendChild(row);
        });
        
        tablaTemperaturas.style.display = 'table';
        noDataMessage.style.display = 'none';
        
        console.log('Tabla mostrada con', datosTemperaturas.length, 'filas');
    }

    // Mostrar mensaje de no datos
    function mostrarMensajeNoDatos() {
        tablaTemperaturas.style.display = 'none';
        noDataMessage.style.display = 'block';
        fechaSeleccionada.textContent = 'No hay datos disponibles';
        
        // Limpiar estadísticas
        tempMaxima.textContent = '--°C';
        tempMinima.textContent = '--°C';
        tempPromedio.textContent = '--°C';
        
        console.log('No hay datos para mostrar');
    }

    // Exportar a CSV
    function exportarCSV() {
        if (datosTemperaturas.length === 0) {
            alert('No hay datos para exportar');
            return;
        }

        const fecha = fechaSelect.value;
        const fechaFormateada = formatearFecha(fecha);
        
        let csv = 'Provincia,Condición,Temperatura Máxima (°C),Temperatura Mínima (°C)\n';
        
        datosTemperaturas.forEach(dato => {
            csv += `"${dato.provincia}","${dato.condicion}",${dato.maxima || ''},${dato.minima || ''}\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `temperaturas_${fechaFormateada.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Exportar a Excel
    function exportarXLSX() {
        if (datosTemperaturas.length === 0) {
            alert('No hay datos para exportar');
            return;
        }

        const fecha = fechaSelect.value;
        const fechaFormateada = formatearFecha(fecha);
        
        const wsData = [
            ['Provincia', 'Condición', 'Temperatura Máxima (°C)', 'Temperatura Mínima (°C)']
        ];
        
        datosTemperaturas.forEach(dato => {
            wsData.push([
                dato.provincia,
                dato.condicion,
                dato.maxima || '',
                dato.minima || ''
            ]);
        });
        
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Temperaturas');
        
        XLSX.writeFile(wb, `temperaturas_${fechaFormateada.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
    }

    // Event listeners
    fechaSelect.addEventListener('change', (e) => {
        if (e.target.value) {
            mostrarTemperaturas(e.target.value);
        } else {
            mostrarMensajeNoDatos();
        }
    });

    clearFiltersBtn.addEventListener('click', () => {
        fechaSelect.value = '';
        mostrarMensajeNoDatos();
    });

    exportCsvBtn.addEventListener('click', exportarCSV);
    exportXlsxBtn.addEventListener('click', exportarXLSX);

    // Función para mostrar mensajes de error
    function mostrarMensaje(mensaje) {
        console.error(mensaje);
        alert(mensaje);
    }

    // Cargar datos al iniciar
    console.log('Iniciando dashboard...');
    cargarDatos();
}); 