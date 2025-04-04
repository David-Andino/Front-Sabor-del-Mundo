function verificarAutenticacion() {
    const token = localStorage.getItem('authToken');

    if (!token) {
        // Si no hay token, redirigir al login
        window.location.href = '../../../login.html';
        return;
    }

    // Verificar el token con el backend
    fetch('https://loginbackend-production.up.railway.app/api/auth/verify-token', {
        method: 'GET',
        headers: {
            'Authorization': token, // Enviar el token en el encabezado
        },
    })
    .then(response => {
        if (!response.ok) {
            // Si el token no es válido, redirigir al login
            localStorage.removeItem('authToken'); // Eliminar el token inválido
            window.location.href = '../../../login.html';
        }
    })
    .catch(error => {
        console.error('Error al verificar el token:', error);
        window.location.href = '../../../login.html';
    });
}

verificarAutenticacion();

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const currentDateEl = document.getElementById('currentDate');
    const empleadoIdInput = document.getElementById('empleadoId');
    const registroHora = document.getElementById('registroHora');
    const registroFecha = document.getElementById('registroFecha');
    const registrarEntradaBtn = document.getElementById('registrarEntradaBtn');
    const registrarSalidaBtn = document.getElementById('registrarSalidaBtn');
    const entradaBtnText = document.getElementById('entradaBtnText');
    const salidaBtnText = document.getElementById('salidaBtnText');
    const entradaSpinner = document.getElementById('entradaSpinner');
    const salidaSpinner = document.getElementById('salidaSpinner');
    const registroResult = document.getElementById('registroResult');
    const searchTypeSelect = document.getElementById('searchType');
    const fechaSearch = document.getElementById('fechaSearch');
    const empleadoSearch = document.getElementById('empleadoSearch');
    const resumenSearch = document.getElementById('resumenSearch');
    const buscarBtn = document.getElementById('buscarBtn');
    const resultsContainer = document.getElementById('resultsContainer');
    const loadingResults = document.getElementById('loadingResults');
    const cerrarJornadaBtn = document.getElementById('cerrarJornadaBtn');
    const cerrarBtnText = document.getElementById('cerrarBtnText');
    const cerrarSpinner = document.getElementById('cerrarSpinner');
    const cierreResult = document.getElementById('cierreResult');
    const cierreFecha = document.getElementById('cierreFecha');
    const cierreHora = document.getElementById('cierreHora');

    // Inicialización de fechas y horas
    function initializeDateTime() {
        const today = new Date().toISOString().split('T')[0];
        registroFecha.value = today;
        cierreFecha.value = today;
        document.getElementById('fecha').value = today;
        document.getElementById('resumenFecha').value = today;
        
        // Configurar hora actual para referencia
        const now = new Date();
        const currentHour = String(now.getHours()).padStart(2, '0');
        const currentMinute = String(now.getMinutes()).padStart(2, '0');
        registroHora.placeholder = `${currentHour}:${currentMinute}`;
        
        // Configurar hora de cierre según el día (15:00 viernes, 16:00 otros días)
        const isFriday = now.getDay() === 5;
        cierreHora.value = isFriday ? '15:00' : '16:00';
    }

    // Mostrar fecha actual formateada
    function updateCurrentDate() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateEl.textContent = now.toLocaleDateString('es-ES', options);
    }

    // Manejar cambio en el tipo de búsqueda
    searchTypeSelect.addEventListener('change', function() {
        fechaSearch.style.display = 'none';
        empleadoSearch.style.display = 'none';
        resumenSearch.style.display = 'none';

        const selectedValue = this.value;
        if (selectedValue === 'fecha') {
            fechaSearch.style.display = 'block';
        } else if (selectedValue === 'empleado') {
            empleadoSearch.style.display = 'block';
        } else if (selectedValue === 'resumen') {
            resumenSearch.style.display = 'block';
        }
    });

    // Función para registrar asistencia
    async function registrarAsistencia(tipo) {
        const numeroIdentidad = empleadoIdInput.value.trim();
        const horaManual = registroHora.value;
        const fecha = registroFecha.value;
        
        // Validaciones básicas
        if (!numeroIdentidad) {
            showResult('Por favor ingrese el número de identidad', 'error');
            return;
        }
        
        if (!fecha) {
            showResult('Por favor ingrese la fecha', 'error');
            return;
        }
    
        // Configurar elementos UI
        const btnTextElement = tipo === 'entrada' ? entradaBtnText : salidaBtnText;
        const spinnerElement = tipo === 'entrada' ? entradaSpinner : salidaSpinner;
        const buttonElement = tipo === 'entrada' ? registrarEntradaBtn : registrarSalidaBtn;
    
        // Mostrar spinner
        btnTextElement.textContent = 'Procesando...';
        spinnerElement.style.display = 'block';
        buttonElement.disabled = true;
    
        try {
            // Determinar la hora a registrar
            let horaRegistro;
            let esManual = false;
            
            if (horaManual) {
                // Validar formato de hora manual
                if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(horaManual)) {
                    throw new Error('Formato de hora inválido (use HH:MM)');
                }
                horaRegistro = horaManual;
                esManual = true;
            } else {
                // Usar hora actual si no se especificó manualmente
                const now = new Date();
                horaRegistro = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            }
    
            // Enviar datos al servidor
            const response = await fetch(`https://personal-backend-ggeb.onrender.com/api/asistencia/registrar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    numeroIdentidad,
                    tipo,
                    hora: horaRegistro,
                    fecha,
                    esManual
                })
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(data.error || 'Error al registrar asistencia');
            }
    
            // Mostrar mensaje de éxito
            let message;
            if (data.accion === 'entrada') {
                message = `✅ ${esManual ? 'Entrada manual' : 'Entrada'} registrada a las ${horaRegistro}`;
            } else if (data.accion === 'salida') {
                message = `🚪 ${esManual ? 'Salida manual' : 'Salida'} registrada a las ${horaRegistro}`;
            } else if (data.accion === 'ya_registrado') {
                message = '⚠️ Este empleado ya registró entrada hoy';
            } else if (data.accion === 'no_registro') {
                message = '⚠️ No se encontró registro de entrada para actualizar';
            }
            
            showResult(message, data.accion === 'entrada' || data.accion === 'salida' ? 'success' : 'warning');
            
           empleadoId.value = '';
    
        } catch (error) {
            showResult(`❌ ${error.message}`, 'error');
        } finally {
            // Restaurar botón
            btnTextElement.textContent = tipo === 'entrada' ? 'Registrar Entrada' : 'Registrar Salida';
            spinnerElement.style.display = 'none';
            buttonElement.disabled = false;
        }
    }

    // Event listeners para los botones de registro
    registrarEntradaBtn.addEventListener('click', () => registrarAsistencia('entrada'));
    registrarSalidaBtn.addEventListener('click', () => registrarAsistencia('salida'));

    // Función para mostrar resultados de registro
    function showResult(message, type) {
        registroResult.textContent = message;
        registroResult.className = 'result-message ' + type;
    }

    // Evento para el botón de cierre de jornada
    cerrarJornadaBtn.addEventListener('click', async function() {
        const fecha = cierreFecha.value;
        let hora = cierreHora.value;
        
        if (!fecha) {
            showCierreResult('Seleccione una fecha', 'error');
            return;
        }
        
        // Formatear hora (agregar segundos)
        hora = hora + ':00';
        
        // Mostrar spinner
        cerrarBtnText.textContent = 'Procesando...';
        cerrarSpinner.style.display = 'block';
        cerrarJornadaBtn.disabled = true;
        
        try {
            // Primero obtener empleados sin salida
            const response = await fetch(`https://personal-backend-ggeb.onrender.com/api/asistencia/sin-salida/${fecha}`);
            const sinSalida = await response.json();
            
            if (sinSalida.length === 0) {
                showCierreResult('✅ Todos los empleados ya registraron salida', 'success');
                return;
            }
            
            // Mostrar confirmación
            const confirmar = confirm(`¿Cerrar jornada para ${sinSalida.length} empleados?`);
            if (!confirmar) {
                showCierreResult('Operación cancelada', 'warning');
                return;
            }
            
            // Ejecutar cierre
            const cierreResponse = await fetch(`https://personal-backend-ggeb.onrender.com/api/asistencia/cerrar-jornada`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fecha, horaCierre: hora })
            });
            
            const resultado = await cierreResponse.json();
            
            if (resultado.success) {
                showCierreResult(`✅ Jornada cerrada para ${resultado.registrosActualizados} empleados`, 'success');
            } else {
                throw new Error('Error al cerrar jornada');
            }
        } catch (error) {
            showCierreResult(`❌ ${error.message}`, 'error');
        } finally {
            cerrarBtnText.textContent = 'Cerrar Jornada';
            cerrarSpinner.style.display = 'none';
            cerrarJornadaBtn.disabled = false;
        }
    });

    function showCierreResult(message, type) {
        cierreResult.textContent = message;
        cierreResult.className = 'result-message ' + type;
    }

    // Buscar asistencias
    buscarBtn.addEventListener('click', async function() {
        const searchType = searchTypeSelect.value;
        loadingResults.style.display = 'flex';
        resultsContainer.innerHTML = '';

        try {
            let url = '';
            let params = {};

            if (searchType === 'fecha') {
                const fecha = document.getElementById('fecha').value;
                if (!fecha) {
                    throw new Error('Por favor seleccione una fecha');
                }
                url = `https://personal-backend-ggeb.onrender.com/api/asistencia/fecha/${fecha}`;
            } else if (searchType === 'empleado') {
                const empleadoId = document.getElementById('empleadoSearchId').value.trim();
                const fechaInicio = document.getElementById('fechaInicio').value;
                const fechaFin = document.getElementById('fechaFin').value;
                
                if (!empleadoId) {
                    throw new Error('Por favor ingrese un ID de empleado');
                }
                
                url = `https://personal-backend-ggeb.onrender.com/api/asistencia/empleado/${empleadoId}`;
                params = {
                    fechaInicio: fechaInicio || undefined,
                    fechaFin: fechaFin || undefined
                };
            } else if (searchType === 'resumen') {
                const fecha = document.getElementById('resumenFecha').value;
                if (!fecha) {
                    throw new Error('Por favor seleccione una fecha');
                }
                url = 'https://personal-backend-ggeb.onrender.com/api/asistencia/resumen/diario';
                params = { fecha };
            }

            // Construir URL con parámetros
            const queryString = new URLSearchParams();
            for (const key in params) {
                if (params[key]) {
                    queryString.append(key, params[key]);
                }
            }
            
            if (queryString.toString()) {
                url += `?${queryString.toString()}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al obtener datos');
            }

            displayResults(data, searchType);
        } catch (error) {
            resultsContainer.innerHTML = `<div class="error">❌ ${error.message}</div>`;
        } finally {
            loadingResults.style.display = 'none';
        }
    });

    // Mostrar resultados de búsqueda
    function displayResults(data, searchType) {
        if (!data || data.length === 0) {
            resultsContainer.innerHTML = '<p>No se encontraron resultados</p>';
            return;
        }
    
        let html = '';
    
        if (searchType === 'fecha' || searchType === 'empleado') {
            // Tabla detallada
            html = `
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Empleado</th>
                                <th>Fecha</th>
                                <th>Entrada</th>
                                <th>Salida</th>
                                <th>Tipo</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.map(item => {
                                const entrada = item.hora_entrada ? 
                                    `${item.hora_entrada}${item.entrada_manual ? ' (M)' : ''}` : '--:--';
                                const salida = item.hora_salida ? 
                                    `${item.hora_salida}${item.salida_manual ? ' (M)' : ''}` : '--:--';
                                
                                return `
                                    <tr>
                                        <td>${item.empleado_nombre || 'N/A'}</td>
                                        <td>${formatDate(item.fecha)}</td>
                                        <td>${entrada}</td>
                                        <td>${salida}</td>
                                        <td>
                                            ${item.entrada_manual || item.salida_manual ? 
                                                '<span class="tag tag-manual"><i class="fas fa-user-edit"></i> Manual</span>' : 
                                                '<span class="tag tag-auto"><i class="fas fa-clock"></i> Automático</span>'
                                            }
                                        </td>
                                        <td>
                                            ${item.permiso ? 
                                                '<span class="tag tag-permiso"><i class="fas fa-file-alt"></i> Permiso</span>' : 
                                                (item.hora_entrada && item.hora_salida ? 
                                                    '<span class="tag tag-completo"><i class="fas fa-check-circle"></i> Completo</span>' : 
                                                    '<span class="tag tag-incompleto"><i class="fas fa-exclamation-circle"></i> Incompleto</span>')
                                            }
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } else if (searchType === 'resumen') {
            // Resumen diario (simplificado para una sola fecha)
            const item = data[0];
            html = `
                <div class="resumen-container">
                    <div class="resumen-card">
                        <h3>Resumen del ${formatDate(item.fecha)}</h3>
                        <div class="resumen-grid">
                            <div class="resumen-item">
                                <span class="resumen-label">Total Empleados:</span>
                                <span class="resumen-value">${item.total_empleados}</span>
                            </div>
                            <div class="resumen-item">
                                <span class="resumen-label">Asistieron:</span>
                                <span class="resumen-value">${item.asistieron}</span>
                            </div>
                            <div class="resumen-item">
                                <span class="resumen-label">Faltaron:</span>
                                <span class="resumen-value">${item.faltaron}</span>
                            </div>
                            <div class="resumen-item">
                                <span class="resumen-label">Activos:</span>
                                <span class="resumen-value">${item.empleados_activos}</span>
                            </div>
                        </div>
                        <div class="resumen-progress">
                            <div class="progress-container">
                                <div class="progress-info">
                                    <span>Asistencia: ${item.porcentaje_asistencia}%</span>
                                    <span>Faltas: ${item.porcentaje_faltas}%</span>
                                </div>
                                <div class="progress-bar-container">
                                    <div class="progress-bar positive" style="width: ${item.porcentaje_asistencia}%"></div>
                                    <div class="progress-bar negative" style="width: ${item.porcentaje_faltas}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    
        resultsContainer.innerHTML = html;
    }

    // Formatear fecha
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    // Inicialización
    initializeDateTime();
    updateCurrentDate();
});

function logout() {
    window.location.href = '../../empleados/empleados.html';
}