function verificarAutenticacion() {
    const token = localStorage.getItem('authToken');

    if (!token) {
        // Si no hay token, redirigir al login
        window.location.href = '../../login.html';
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
            window.location.href = '../../login.html';
        }
    })
    .catch(error => {
        console.error('Error al verificar el token:', error);
        window.location.href = '../../login.html';
    });
}

verificarAutenticacion();

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    document.getElementById('fecha-selector').value = dateStr;

    loadUserData();
    loadDashboardData();
});

// Cargar datos del usuario
function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if(userData) {
        document.getElementById('username-display').textContent = userData.nombre;
    }
}

// Cargar datos del dashboard
async function loadDashboardData() {
    const date = document.getElementById('fecha-selector').value;
    
    try {
        showLoading();
        
        // Obtener datos del resumen diario
        const resumenResponse = await fetch(`https://personal-backend-ggeb.onrender.com/api/asistencia/resumen/diario?fecha=${date}`);
        const resumenData = await resumenResponse.json();
        
        updateCards(resumenData);
        
        // Cargar últimos registros
        await loadLastRegisters(date);
        
    } catch (error) {
        console.error('Error al cargar datos:', error);
        alert('Error al cargar datos del dashboard');
    } finally {
        hideLoading();
    }
}

function updateCards(data) {
    if (!data || !data.length) {
        resetCards();
        return;
    }

    const resumen = data[0];

    document.getElementById('asistencias-hoy').textContent = resumen.asistieron || 0;
    const porcentajeAsistencia = document.getElementById('asistencias-tendencia');
    porcentajeAsistencia.textContent = resumen.porcentaje_asistencia ? `${resumen.porcentaje_asistencia}%` : '0%';
    porcentajeAsistencia.className = 'positive';

    document.getElementById('faltas-hoy').textContent = resumen.faltaron || 0;
    const porcentajeFaltas = document.getElementById('faltas-tendencia');
    porcentajeFaltas.textContent = resumen.porcentaje_faltas ? `${resumen.porcentaje_faltas}%` : '0%';
    porcentajeFaltas.className = 'negative';

    document.getElementById('permisos-hoy').textContent = resumen.con_permiso || 0;
    document.getElementById('permisos-tendencia').textContent = resumen.permisos_pendientes ? `${resumen.permisos_pendientes} pendientes` : '0 pendientes';

    document.getElementById('total-empleados').textContent = resumen.total_empleados || 0;
    document.getElementById('empleados-activos').textContent = `${resumen.empleados_activos || 0} activos`;
}

function resetCards() {
    document.getElementById('asistencias-hoy').textContent = '0';
    document.getElementById('faltas-hoy').textContent = '0';
    document.getElementById('permisos-hoy').textContent = '0';
    document.getElementById('total-empleados').textContent = '0';
    document.getElementById('asistencias-tendencia').textContent = '0%';
    document.getElementById('faltas-tendencia').textContent = '0%';
    document.getElementById('empleados-activos').textContent = '0 activos';
}

// Cargar últimos registros
async function loadLastRegisters(date) {
    try {
        const response = await fetch(`https://personal-backend-ggeb.onrender.com/api/asistencia/fecha/${date}`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const data = await response.json();
        const tbody = document.querySelector('#last-registers tbody');
        tbody.innerHTML = '';
        
        if (!data || data.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="4" class="no-data">No hay registros para esta fecha</td>`;
            tbody.appendChild(row);
            return;
        }

        const lastFive = data.slice(0, 5);
        
        lastFive.forEach(reg => {
            const row = document.createElement('tr');
            
            let tipo = '';
            let estado = '';
            
            if (reg.hora_entrada && !reg.hora_salida) {
                tipo = 'Entrada';
                estado = '<span class="badge success">Presente</span>';
            } else if (reg.hora_entrada && reg.hora_salida) {
                tipo = 'Salida';
                estado = '<span class="badge success">Completo</span>';
            } else if (reg.permiso) {
                tipo = 'Permiso';
                estado = '<span class="badge warning">Justificado</span>';
            } else {
                tipo = 'Falta';
                estado = '<span class="badge danger">Ausente</span>';
            }
            
            row.innerHTML = `
                <td>${reg.empleado_nombre || 'N/A'}</td>
                <td>${reg.hora_entrada || '--:--'}</td>
                <td>${tipo}</td>
                <td>${estado}</td>
            `;
            
            tbody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error al cargar últimos registros:', error);
        const tbody = document.querySelector('#last-registers tbody');
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="error-message">
                    Error al cargar los datos. Intente nuevamente.
                </td>
            </tr>
        `;
    }
}

// Mostrar loading
function showLoading() {
    document.body.classList.add('loading');
}

// Ocultar loading
function hideLoading() {
    document.body.classList.remove('loading');
}

// Logout
function logout() {
    window.location.href = '../empleados/empleados.html';
}