// ==============================================================
// DATOS INICIALES Y DE CONFIGURACIÓN
// ==============================================================

/**
 * Mapeo de regiones con sus provincias
 * @type {Object.<string, string[]>}
 */
const regions = {
  "Cibao": ["Santiago", "La Vega", "Puerto Plata", "Espaillat","Monseñor Nouel", "Valverde","Montecristi","Santiago Rodriguez","Dajabón"],
  "Suroeste": ["Barahona", "San Juan", "Azua", "Pedernales", "Peravia", "Bahoruco", "Independencia", "Elías Piña"],
  "Este": ["La Romana", "San Pedro de Macorís", "Hato Mayor", "La Altagracia", "El Seibo", "San Cristóbal", "Monte Plata"],
  "Nordeste": ["Samaná", "María Trinidad Sánchez", "Duarte", "Hermanas Mirabal", "Sánchez Ramírez"],
  "Metropolitana": ["Santo Domingo", "Distrito Nacional"]
};

/**
 * Iconos para condiciones climáticas
 * @type {Object.<string, string>}
 */
const conditionIcons = {
  "Mayormente Soleado":"iconos/soleado.png",
  "Medio Nublado": "iconos/bruma.png",
  "Nublado": "iconos/nublado.png",
  "Aguaceros": "iconos/aguaceros.png",
  "Tormentas Eléctricas": "iconos/tormenta.png",
  "Cielo Opaco": "iconos/neblina.png",
  "Bruma": "iconos/bruma.png",
  "Ventoso": "iconos/ventoso.png",
  "Lluvias Debiles": "iconos/lluvias.png",
  "Granizado": "iconos/granizado.png",
  "Cielo Despejado": "iconos/cielo_despejado.png",
  "Nubes Dispersas": "iconos/nubes_dispersas.png",
  "Lluvias": "iconos/lluviadebiles.png",
  "Cielo Estrellado": "iconos/cielo_estrellado.png",
  "Nubes Aisladas": "iconos/nubes Aislada.png",
  "Chubascos Aislados": "iconos/chubascoaislado.png"
};


// Máximo de reportes guardados en el historial
const MAX_HISTORY_ITEMS = 15;

// Variable para rastrear si se está cargando un pronóstico del historial
let isLoadingFromHistory = false;

// ==============================================================
// FUNCIONES PARA CREAR ELEMENTOS DE INTERFAZ
// ==============================================================

/**
 * Crea una celda para selección de condición climática
 * @returns {HTMLDivElement} Celda con selector e imagen de previsualización
 */
function createSimpleForecastCell() {
  const cell = document.createElement("div");
  cell.className = "simple-forecast-cell";
  
  // Crear selector de condiciones
  const select = document.createElement("select");
  select.innerHTML = `<option value="">-- Condición --</option>`;
  
  // Llenar opciones
  Object.keys(conditionIcons).forEach(condition => {
    select.innerHTML += `<option value="${condition}">${condition}</option>`;
  });
  
  // Crear imagen de previsualización
  const img = document.createElement("img");
  img.className = "icon-preview";
  
  // Evento para actualizar imagen al cambiar selección
  select.onchange = () => {
    img.src = conditionIcons[select.value] || "";
    autoSave();
  };
  
  cell.append(select, img);
  return cell;
}

/**
 * Crea una celda para temperaturas (máx/mín)
 * @returns {HTMLDivElement} Celda con inputs numéricos
 */
function createTemperatureCell() {
  const cell = document.createElement("div");
  cell.className = "temperature-cell-container";
  cell.innerHTML = `
    <input type="number" placeholder="Máx" class="input-max">
    <input type="number" placeholder="Mín" class="input-min">
  `;
  
  // Evento para guardar automáticamente
  cell.querySelectorAll('input').forEach(input => {
    input.oninput = autoSave;
  });
  
  return cell;
}

// ==============================================================
// FUNCIONES DE MANEJO DE DATOS
// ==============================================================

/**
 * Obtiene todos los datos del formulario en un objeto estructurado
 * @returns {Object} Datos del formulario
 */
function getFormDataAsObject() {
  const data = {
    general: {},
    table24: [],
    table4872: []
  };

  // Datos generales del formulario
  document.querySelectorAll(
    '#region-select, #fecha, #hora, #pronosticador, #condiciones, #especiales, #maritimas'
  ).forEach(el => {
    data.general[el.id] = el.value;
  });

  // Datos de la tabla de 24 horas
  document.querySelectorAll('#forecast-table-24 tbody tr').forEach(row => {
    const rowData = {
      province: row.cells[0].textContent,
      cells: []
    };
    
    Array.from(row.cells).slice(1).forEach(cell => {
      const inputs = Array.from(cell.querySelectorAll('input, select')).map(i => i.value);
      rowData.cells.push(inputs);
    });
    
    data.table24.push(rowData);
  });

  // Datos de la tabla de 48-72 horas
  document.querySelectorAll('#forecast-table-48-72 tbody tr').forEach(row => {
    const rowData = {
      province: row.cells[0].textContent,
      cells: []
    };
    
    Array.from(row.cells).slice(1).forEach(cell => {
      const inputs = Array.from(cell.querySelectorAll('input, select')).map(i => i.value);
      rowData.cells.push(inputs);
    });
    
    data.table4872.push(rowData);
  });

  return data;
}

/**
 * Aplica datos guardados al formulario
 * @param {Object} data - Datos a cargar en el formulario
 */
function applyDataToForm(data) {
  if (!data) return;
  
  // Restaurar valores generales
  Object.keys(data.general).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = data.general[id];
  });
  
  actualizarTitulo();
  
  // Si se está cargando desde el historial, usar actualizarTablas con preserveData
  if (isLoadingFromHistory) {
    actualizarTablas(true);
  } else {
    actualizarTablas();
  }
  
  // Restaurar datos de tablas después de un breve retraso
  setTimeout(() => {
    // Tabla de 24 horas
    document.querySelectorAll('#forecast-table-24 tbody tr').forEach((row, rowIndex) => {
      data.table24[rowIndex]?.cells.forEach((cellData, cellIndex) => {
        row.cells[cellIndex + 1].querySelectorAll('input, select').forEach((input, inputIndex) => {
          input.value = cellData[inputIndex];
          if (input.tagName === 'SELECT' && input.value) {
            input.dispatchEvent(new Event('change'));
          }
        });
      });
    });
    
    // Tabla de 48-72 horas
    document.querySelectorAll('#forecast-table-48-72 tbody tr').forEach((row, rowIndex) => {
      data.table4872[rowIndex]?.cells.forEach((cellData, cellIndex) => {
        row.cells[cellIndex + 1].querySelectorAll('input, select').forEach((input, inputIndex) => {
          input.value = cellData[inputIndex];
          if (input.tagName === 'SELECT' && input.value) {
            input.dispatchEvent(new Event('change'));
          }
        });
      });
    });
  }, 100);
}

// ==============================================================
// FUNCIONES DE ACCIÓN (CRUD)
// ==============================================================

/** Guarda automáticamente el estado actual del formulario */
function autoSave() {
  console.log("Autoguardando...");
  const data = getFormDataAsObject();
  localStorage.setItem('autosaveData', JSON.stringify(data));
}

/** Limpia completamente el formulario */
function clearForm() {
  if (!confirm("¿Estás seguro de que quieres limpiar todo el formulario? Se borrará el autoguardado actual.")) return;
  
  localStorage.removeItem('autosaveData');
  
  // Limpiar inputs y textareas
  document.querySelectorAll('input, textarea').forEach(el => el.value = '');
  
  // Resetear selects
  document.querySelectorAll('select').forEach(el => el.selectedIndex = 0);
  
  actualizarTitulo();
  actualizarTablas();
  colocarHoy();
}

/** Guarda el reporte actual en el historial */
function saveToHistory() {
  const data = getFormDataAsObject();
  
  // Validación básica
  if (!data.general['region-select'] || !data.general.fecha) {
    return alert("Por favor, selecciona una región y una fecha antes de guardar.");
  }
  
  let history = JSON.parse(localStorage.getItem('reportHistory')) || [];
  
  // Asignar ID único y nombre para mostrar
  data.id = Date.now();
  data.displayName = `${data.general['region-select']} - ${data.general.fecha}`;
  
  // Agregar al inicio del historial
  history.unshift(data);
  
  // Limitar historial al tamaño máximo
  if (history.length > MAX_HISTORY_ITEMS) {
    history = history.slice(0, MAX_HISTORY_ITEMS);
  }
  
  localStorage.setItem('reportHistory', JSON.stringify(history));
  renderHistory();
  alert(`Reporte "${data.displayName}" guardado en el historial.`);
}

/** Carga un reporte desde el historial */
function loadFromHistory() {
  const historySelect = document.getElementById('history-select');
  const reportId = historySelect.value;
  
  if (!reportId) return;
  
  const history = JSON.parse(localStorage.getItem('reportHistory')) || [];
  const reportToLoad = history.find(r => r.id == reportId);
  
  if (reportToLoad) {
    isLoadingFromHistory = true;
    applyDataToForm(reportToLoad);
    autoSave();
    // Resetear la variable después de un breve retraso
    setTimeout(() => {
      isLoadingFromHistory = false;
    }, 1000);
  }
}

/** Elimina un reporte del historial */
function deleteFromHistory() {
  const historySelect = document.getElementById('history-select');
  const reportId = historySelect.value;
  
  if (!reportId) return;
  
  if (!confirm("¿Estás seguro de que quieres borrar este reporte del historial?")) return;
  
  let history = JSON.parse(localStorage.getItem('reportHistory')) || [];
  const newHistory = history.filter(r => r.id != reportId);
  
  localStorage.setItem('reportHistory', JSON.stringify(newHistory));
  renderHistory();
}

/** Actualiza el selector de historial con los reportes guardados */
function renderHistory() {
  const history = JSON.parse(localStorage.getItem('reportHistory')) || [];
  const historySelect = document.getElementById('history-select');
  
  historySelect.innerHTML = `<option value="">-- Cargar un reporte guardado --</option>`;
  
  history.forEach(report => {
    historySelect.innerHTML += `<option value="${report.id}">${report.displayName}</option>`;
  });
}

// ==============================================================
// FUNCIONES PRINCIPALES DE LA APLICACIÓN
// ==============================================================

/** Llena el selector de regiones con las opciones disponibles */
function llenarRegiones() {
  const regionSelect = document.getElementById('region-select');
  
  Object.keys(regions).forEach(regionName => {
    regionSelect.innerHTML += `<option value="${regionName}">${regionName}</option>`;
  });
}

/** Actualiza las tablas de pronóstico según región y fecha seleccionadas */
function actualizarTablas(preserveData = false) {
  const region = document.getElementById('region-select').value;
  const fecha = document.getElementById('fecha').value;
  const tbody24 = document.querySelector('#forecast-table-24 tbody');
  const tbody48_72 = document.querySelector('#forecast-table-48-72 tbody');
  
  // Si preserveData es true, guardar los datos actuales antes de limpiar
  let savedData = null;
  if (preserveData) {
    savedData = {
      table24: [],
      table4872: []
    };
    
    // Guardar datos de tabla 24 horas
    document.querySelectorAll('#forecast-table-24 tbody tr').forEach(row => {
      const rowData = {
        province: row.cells[0].textContent,
        cells: []
      };
      
      Array.from(row.cells).slice(1).forEach(cell => {
        const inputs = Array.from(cell.querySelectorAll('input, select')).map(i => i.value);
        rowData.cells.push(inputs);
      });
      
      savedData.table24.push(rowData);
    });
    
    // Guardar datos de tabla 48-72 horas
    document.querySelectorAll('#forecast-table-48-72 tbody tr').forEach(row => {
      const rowData = {
        province: row.cells[0].textContent,
        cells: []
      };
      
      Array.from(row.cells).slice(1).forEach(cell => {
        const inputs = Array.from(cell.querySelectorAll('input, select')).map(i => i.value);
        rowData.cells.push(inputs);
      });
      
      savedData.table4872.push(rowData);
    });
  }
  
  // Limpiar tablas
  tbody24.innerHTML = '';
  tbody48_72.innerHTML = '';
  
  if (!region || !fecha) return;
  
  const provinces = regions[region];
  const selectedDate = new Date(fecha);
  
  // Calcular fechas para 48 y 72 horas
  const date48 = new Date(selectedDate.getTime() + 24 * 3600000);
  const date72 = new Date(selectedDate.getTime() + 48 * 3600000);
  
  // Actualizar encabezados
  document.getElementById('header-48').innerHTML = `
    ${obtenerDiaSemana(date48)}<br>(48 Hrs)
  `;

  
  document.getElementById('header-72').innerHTML = `
    ${obtenerDiaSemana(date72)}<br>(72 Hrs)
  `;
  
  // Generar filas para cada provincia
  provinces.forEach((province, index) => {
    // Tabla de 24 horas
    const row24 = tbody24.insertRow();
    row24.insertCell().textContent = province;
    
    // Celdas de condiciones (3 periodos)
    for (let i = 0; i < 3; i++) {
      row24.insertCell().appendChild(createSimpleForecastCell());
    }
    
    // Celda de temperaturas
    row24.insertCell().appendChild(createTemperatureCell());
    
    // Tabla de 48-72 horas
    const row4872 = tbody48_72.insertRow();
    row4872.insertCell().textContent = province; // Provincia
    
    // 48 horas: Condición + Temperatura
    row4872.insertCell().appendChild(createSimpleForecastCell());
    row4872.insertCell().appendChild(createTemperatureCell());
    
    // 72 horas: Condición + Temperatura
    row4872.insertCell().appendChild(createSimpleForecastCell());
    row4872.insertCell().appendChild(createTemperatureCell());
    
    // Si hay datos guardados, restaurarlos
    if (preserveData && savedData) {
      // Restaurar datos de tabla 24 horas
      if (savedData.table24[index]) {
        savedData.table24[index].cells.forEach((cellData, cellIndex) => {
          row24.cells[cellIndex + 1].querySelectorAll('input, select').forEach((input, inputIndex) => {
            input.value = cellData[inputIndex];
            if (input.tagName === 'SELECT' && input.value) {
              input.dispatchEvent(new Event('change'));
            }
          });
        });
      }
      
      // Restaurar datos de tabla 48-72 horas
      if (savedData.table4872[index]) {
        savedData.table4872[index].cells.forEach((cellData, cellIndex) => {
          row4872.cells[cellIndex + 1].querySelectorAll('input, select').forEach((input, inputIndex) => {
            input.value = cellData[inputIndex];
            if (input.tagName === 'SELECT' && input.value) {
              input.dispatchEvent(new Event('change'));
            }
          });
        });
      }
    }
  });
}

// ==============================================================
// FUNCIONES UTILITARIAS
// ==============================================================

/**
 * Obtiene el nombre del día de la semana en español
 * @param {Date} fecha - Fecha a convertir
 * @returns {string} Nombre del día
 */
function obtenerDiaSemana(fecha) {
  const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  return dias[new Date(fecha.getTime() + fecha.getTimezoneOffset() * 60000).getDay()];
}

/**
 * Formatea una fecha en formato español largo
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
function formatSpanishDate(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  const localDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
  
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return localDate.toLocaleDateString('es-ES', options).toUpperCase();
}

/**
 * Formatea una hora en formato AM/PM
 * @param {string} timeString - Hora en formato HH:mm
 * @returns {string} Hora formateada
 */
function formatTime(timeString) {
  if (!timeString) return "";
  let [h, m] = timeString.split(':');
  return new Date(1970, 0, 1, h, m).toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: 'numeric', 
    hour12: true 
  });
}

/** Coloca la fecha y hora actual en los campos correspondientes */
function colocarHoy() {
  const now = new Date();
  document.getElementById('fecha').value = now.toISOString().slice(0, 10);
  document.getElementById('hora').value = 
    `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  // Verificar si hay datos existentes para preservarlos
  const hasExistingData = document.querySelectorAll('#forecast-table-24 tbody tr').length > 0;
  actualizarTablas(hasExistingData);
  autoSave();
}

/** Actualiza el título del pronóstico según la región seleccionada */
function actualizarTitulo() {
  const region = document.getElementById('region-select').value;
  document.getElementById('titulo-pronostico').textContent = 
    region ? `PRONÓSTICO REGIONAL - ${region.toUpperCase()}` : "PRONÓSTICO REGIONAL";
}

/** Muestra el modal de generación de reportes */
function mostrarOpcionesGenerar() {
  document.getElementById("modal-generar").classList.add('show');
}

/** Cierra cualquier modal abierto */
function cerrarModal() {
  document.getElementById("modal-generar").classList.remove('show');
}

// ==============================================================
// FUNCIONES PARA GENERACIÓN DE REPORTES (PDF/WORD)
// ==============================================================

/**
 * Prepara las tablas para la conversión a canvas (reemplaza selects por spans)
 */
function prepararTablasParaCanvas() {
  document.querySelectorAll('td select').forEach(select => {
    if (select.value) {
      const textDisplay = document.createElement('span');
      textDisplay.className = 'pdf-select-replacement';
      textDisplay.textContent = select.options[select.selectedIndex].text;
      
      // Estilos para la visualización en PDF
      textDisplay.style.cssText = `
        display: inline-block;
        padding: 0.5rem;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        font-size: 14px;
        background-color: #fff;
        color: #2d3748;
      `;
      
      select.style.display = 'none';
      select.parentNode.insertBefore(textDisplay, select);
    }
  });
}




/** Restaura las tablas a su estado original después de generar PDF */
function restaurarTablasDespuesDeCanvas() {
  document.querySelectorAll('.pdf-select-replacement').forEach(el => el.remove());
  document.querySelectorAll('td select').forEach(select => {
    select.style.display = '';
  });
}

/** 
 * Espera a que todas las imágenes se carguen
 * @returns {Promise} Promesa que se resuelve cuando todas las imágenes están cargadas
 */
async function cargarTodasLasImagenes() {
  const imagePromises = Array.from(document.querySelectorAll('.icon-preview'))
    .filter(img => img.src)
    .map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    });
  
  await Promise.all(imagePromises);
}

/** Genera un reporte en formato PDF */
async function generarPDF() {
  // Verificar librerías
  if (typeof window.jspdf === "undefined" || typeof window.html2canvas === "undefined") {
    return alert("Error: Las librerías PDF no se han cargado. Inténtelo de nuevo.");
  }
  
  cerrarModal();
  const { jsPDF } = window.jspdf;
  
  // Configuración del documento
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4'
  });
  
  const MARGIN = 10;
  const PAGE_WIDTH = doc.internal.pageSize.getWidth();
  const PAGE_HEIGHT = doc.internal.pageSize.getHeight();
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 1;
  const PAGE_BOTTOM = PAGE_HEIGHT - MARGIN;
  
  let yPosition = 0;
  
  try {
    prepararTablasParaCanvas();
    await cargarTodasLasImagenes();
    
    // Color de encabezado
    const headerColor = '#2c5282';
    
    // Cabecera del documento
    doc.setFillColor(headerColor);
    doc.rect(0, 0, PAGE_WIDTH, 30, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor('#FFFFFF');
    doc.text(
      document.getElementById('titulo-pronostico').textContent, 
      PAGE_WIDTH / 2, 
      15, 
      { align: 'center' }
    );
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    
    // Fecha y hora
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;
    
    doc.text(
      `${formatSpanishDate(fecha)} | ${formatTime(hora)}`,
      PAGE_WIDTH / 2,
      23,
      { align: 'center' }
    );
    
    yPosition = 40;
    
    /**
     * Función auxiliar para agregar secciones de texto
     * @param {string} title - Título de la sección
     * @param {string} content - Contenido de la sección
     */
    const addSection = (title, content) => {
      if (!content.trim()) return;
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(headerColor);
      
      const titleHeight = 7;
      const splitText = doc.splitTextToSize(content, CONTENT_WIDTH);
      const contentHeight = splitText.length * 4 + 8;
      const totalSectionHeight = titleHeight + contentHeight;
      
      // Manejo de saltos de página
      if (yPosition + totalSectionHeight > PAGE_BOTTOM) {
        doc.addPage();
        yPosition = MARGIN + 5;
      }
      
      doc.text(title, MARGIN, yPosition);
      yPosition += titleHeight;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor('#2d3748');
      doc.text(splitText, MARGIN, yPosition);
      
      yPosition += contentHeight;
    };
    
    // Secciones de texto
    addSection(
      'CONDICIONES METEOROLÓGICAS',
      document.getElementById('condiciones').value
    );
    
    addSection(
      'CONDICIONES ESPECIALES',
      document.getElementById('especiales').value || 'No hay condiciones especiales a destacar.'
    );
    
    addSection(
      'CONDICIONES MARÍTIMAS',
      document.getElementById('maritimas').value
    );
    
    /**
     * Agrega una tabla como imagen al PDF
     * @param {string} tableId - ID de la tabla
     * @param {string} title - Título de la tabla
     */
    const addTableAsImage = async (tableId, title) => {
      const tableElement = document.getElementById(tableId);
      
      // Verificar si la tabla tiene datos
      if (!tableElement || tableElement.rows.length <= 1) return;
      
      const canvas = await html2canvas(tableElement, {
        scale: 1,
        useCORS: true,
        backgroundColor: null
      });
      

      
      const imgData = canvas.toDataURL('image/png');
      const imgHeight = (canvas.height * CONTENT_WIDTH) / canvas.width;
      
      const titleHeight = 10;
      const totalBlockHeight = titleHeight + imgHeight + 5;
      
      // Manejo de saltos de página
      if (yPosition + totalBlockHeight > PAGE_BOTTOM) {
        doc.addPage();
        yPosition = MARGIN + 5;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(headerColor);
      doc.text(title, MARGIN, yPosition);
      
      yPosition += titleHeight;
      
      doc.addImage(
        imgData, 
        'PNG', 
        MARGIN, 
        yPosition, 
        CONTENT_WIDTH, 
        imgHeight
      );
      
      yPosition += imgHeight + 10;
    };
    
    // Agregar tablas como imágenes
    await addTableAsImage('forecast-table-24', 'Pronóstico para Hoy');
    await addTableAsImage('forecast-table-48-72', 'Pronóstico Extendido');
    
    // Pie de página: Autor e institución centrados en barra inferior
    const authorName = document.getElementById('pronosticador').value || '';
    const footerHeight = 16; // altura suficiente para dos líneas
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const pw = doc.internal.pageSize.getWidth();
      const ph = doc.internal.pageSize.getHeight();
      
      // Barra inferior con mismo estilo del encabezado
      doc.setFillColor(headerColor);
      doc.rect(0, ph - footerHeight, pw, footerHeight, 'F');
      
      // Texto centrado en blanco (dos líneas)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor('#FFFFFF');
      const line1Y = ph - footerHeight + 6;
      const line2Y = ph - footerHeight + 12;
      doc.text(`Autor: ${authorName}`, pw / 2, line1Y, { align: 'center' });
      doc.text('Instituto Dominicano De Meteorologia(INDOMET)', pw / 2, line2Y, { align: 'center' });
    }
    
    // Guardar PDF
    doc.save(`Pronostico_${document.getElementById('region-select').value}_${fecha}.pdf`);
    
    // Enviar datos a la API automáticamente
    try {
      const apiResult = await enviarDatosAAPI();
      mostrarNotificacion('PDF generado y datos guardados en el servidor', 'success');
      console.log('Datos enviados a la API:', apiResult);
    } catch (apiError) {
      console.error('Error al enviar datos a la API:', apiError);
      mostrarNotificacion('PDF generado pero error al guardar en servidor', 'warning');
    }
    
  } catch (error) {
    console.error("Error al generar PDF:", error);
    alert("Ocurrió un error al generar el PDF. Asegúrese de que todas las condiciones en las tablas estén seleccionadas y revise la consola para más detalles.");
  } finally {
    restaurarTablasDespuesDeCanvas();
  }
}

/** Función placeholder para generación de Word */
async function generarWord() {
  alert("La generación de Word está en desarrollo. Utilice la opción PDF para un reporte completo y bien diseñado.");
  cerrarModal();
}

// ==============================================================
// FUNCIONES DE API
// ==============================================================

/**
 * Envía los datos del formulario a la API
 * @returns {Promise<Object>} Respuesta de la API
 */
async function enviarDatosAAPI() {
  try {
    const formData = getFormDataAsObject();
    
    const response = await fetch('api/save_pronostico.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.message);
    }
    
    return result;
    
  } catch (error) {
    console.error('Error al enviar datos a la API:', error);
    throw error;
  }
}

/**
 * Obtiene la lista de pronósticos guardados en la API
 * @returns {Promise<Object>} Lista de pronósticos
 */
async function obtenerPronosticosGuardados() {
  try {
    const response = await fetch('api/list_pronosticos.php', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.message);
    }
    
    return result;
    
  } catch (error) {
    console.error('Error al obtener pronósticos:', error);
    throw error;
  }
}

/**
 * Muestra una notificación al usuario
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación (success, error, warning)
 */
function mostrarNotificacion(message, type = 'success') {
  // Crear elemento de notificación
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Estilos básicos
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 5px;
    color: white;
    font-weight: bold;
    z-index: 10000;
    max-width: 300px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    animation: slideIn 0.3s ease-out;
  `;
  
  // Colores según tipo
  if (type === 'success') {
    notification.style.backgroundColor = '#10b981';
  } else if (type === 'error') {
    notification.style.backgroundColor = '#ef4444';
  } else if (type === 'warning') {
    notification.style.backgroundColor = '#f59e0b';
  }
  
  // Agregar al DOM
  document.body.appendChild(notification);
  
  // Remover después de 5 segundos
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 5000);
}

// Agregar estilos CSS para las animaciones
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// ==============================================================
// INICIALIZACIÓN Y EVENTOS
// ==============================================================

document.addEventListener("DOMContentLoaded", function() {
  // Inicialización básica
  llenarRegiones();
  
  // Elementos clave
  const regionSelect = document.getElementById('region-select');
  const fechaSelect = document.getElementById('fecha');
  
  // Eventos de cambio
  regionSelect.addEventListener('change', () => {
    actualizarTitulo();
    actualizarTablas();
    autoSave();
  });
  
  fechaSelect.addEventListener('change', () => {
    // Si se está cargando desde el historial, preservar los datos
    // Si hay datos en las tablas, también preservar
    const hasExistingData = document.querySelectorAll('#forecast-table-24 tbody tr').length > 0;
    const shouldPreserveData = isLoadingFromHistory || hasExistingData;
    
    actualizarTablas(shouldPreserveData);
    autoSave();
  });
  
  // Eventos de autoguardado en inputs
  document.querySelectorAll(
    '#hora, #pronosticador, #condiciones, #especiales, #maritimas'
  ).forEach(el => {
    el.addEventListener('input', autoSave);
  });
  
  // Cargar autoguardado si existe
  const autosavedData = localStorage.getItem('autosaveData');
  if (autosavedData) {
    applyDataToForm(JSON.parse(autosavedData));
  } else {
    colocarHoy();
  }
  
  // Inicializar historial
  renderHistory();
  
  // Eventos para modales
  document.querySelector(".close")?.addEventListener("click", cerrarModal);
  
  window.onclick = (event) => {
    if (event.target.id == "modal-generar") {
      cerrarModal();
    }
  };
});
