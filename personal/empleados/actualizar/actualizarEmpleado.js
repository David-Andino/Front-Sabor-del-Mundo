function verificarAutenticacion() {
    const token = localStorage.getItem('authToken');

    if (!token) {
        window.location.href = '../../../login.html';
        return;
    }

    fetch('https://loginbackend-production.up.railway.app/api/auth/verify-token', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    })
    .then(response => {
        if (!response.ok) {
            localStorage.removeItem('authToken');
            window.location.href = '../../../login.html';
        }
    })
    .catch(error => {
        console.error('Error al verificar el token:', error);
        window.location.href = '../../../login.html';
    });
}

verificarAutenticacion();

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const empleadoId = urlParams.get('id');
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const tomarFotoBtn = document.getElementById('tomarFoto');
    const fotografiaInput = document.getElementById('fotografia');
    const cancelarBtn = document.getElementById('cancelar');
    const form = document.getElementById('empleadoForm');
    let stream;

    if (!empleadoId) {
        alert('ID de empleado no proporcionado');
        window.location.href = '../empleados.html';
        return;
    }

    // Obtener y mostrar datos del empleado
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`https://personal-backend-ggeb.onrender.com/api/empleados/${empleadoId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('No se pudo obtener el empleado');
        
        const data = await response.json();
        llenarFormulario(data);

    } catch (error) {
        console.error('Error al obtener empleado:', error);
        alert('Error al cargar datos del empleado');
    }

    // Manejo de la cámara (código existente sin cambios)
    // ...

    // Enviar formulario
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const token = localStorage.getItem('authToken');
        const formData = new FormData(form);
        
        // Validación básica
        if (!validarFormulario(formData)) {
            return;
        }

        try {
            const response = await fetch(`https://personal-backend-ggeb.onrender.com/api/empleados/${empleadoId}`, {
                method: 'PUT',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Error al actualizar empleado');
            }

            alert('Empleado actualizado correctamente');
            window.location.href = '../empleados.html';
            
        } catch (error) {
            console.error('Error al actualizar:', error);
            alert(`Error: ${error.message}`);
        }
    });

    // Función para llenar el formulario
    function llenarFormulario(data) {
        document.getElementById('nombre').value = data.nombre || '';
        document.getElementById('puesto').value = data.puesto || '';
        document.getElementById('tipo_contrato').value = data.tipo_contrato || '';
        document.getElementById('sueldo_base').value = data.sueldo_base || '';
        document.getElementById('activo').value = data.activo === 1 || data.activo === true || data.activo === 'SI' ? 'SI' : 'NO';
        // ... resto de campos
        
        // Mostrar foto actual
        const fotoUrl = data.foto ? data.foto : 'https://via.placeholder.com/150?text=Sin+Foto';
        document.getElementById('carnetFoto').src = fotoUrl;
    }

    // Función para validar el formulario
    function validarFormulario(formData) {
        const requiredFields = ['nombre', 'puesto', 'tipo_contrato', 'sueldo_base'];
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!formData.get(field)) {
                alert(`El campo ${field} es obligatorio`);
                isValid = false;
            }
        });

        return isValid;
    }
});