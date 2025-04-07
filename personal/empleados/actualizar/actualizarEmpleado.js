/**
 * Verifica la autenticación del usuario mediante el token almacenado
 */
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

// Verificar autenticación al cargar la página
verificarAutenticacion();

document.addEventListener('DOMContentLoaded', async () => {
    // Elementos del DOM
    const urlParams = new URLSearchParams(window.location.search);
    const empleadoId = urlParams.get('id');
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const tomarFotoBtn = document.getElementById('tomarFoto');
    const fotografiaInput = document.getElementById('fotografia');
    const cancelarBtn = document.getElementById('cancelar');
    const form = document.getElementById('empleadoForm');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const submitBtn = document.getElementById('submitBtn');
    let stream;

    // Validar ID de empleado
    if (!empleadoId) {
        alert('ID de empleado no proporcionado');
        window.location.href = '../empleados.html';
        return;
    }

    /**
     * Llena el formulario con los datos del empleado
     * @param {Object} data - Datos del empleado
     */
    const llenarFormulario = (data) => {
        document.getElementById('nombre').value = data.nombre || '';
        document.getElementById('puesto').value = data.puesto || '';
        document.getElementById('tipo_contrato').value = data.tipo_contrato || '';
        document.getElementById('sueldo_base').value = data.sueldo_base || '';
        document.getElementById('activo').value = data.activo === 1 || data.activo === true || data.activo === 'SI' ? 'SI' : 'NO';
        document.getElementById('fecha_contratacion').value = data.fecha_contratacion?.split("T")[0] || '';
        document.getElementById('numero_identidad').value = data.numero_identidad || '';
        document.getElementById('huella').value = data.ruta_huella || '';
        document.getElementById('telefono').value = data.telefono || '';
        document.getElementById('domicilio').value = data.domicilio || '';
        document.getElementById('estado_civil').value = data.estado_civil || '';
        document.getElementById('sexo').value = data.sexo || '';
        document.getElementById('fecha_egreso').value = data.fecha_egreso?.split("T")[0] || '';
        document.getElementById('nivel_educativo').value = data.nivel_educativo || '';
        document.getElementById('nombre_emergencia').value = data.nombre_emergencia || '';
        document.getElementById('telefono_emergencia').value = data.telefono_emergencia || '';
        document.getElementById('lugar_nacimiento').value = data.lugar_nacimiento || '';
        document.getElementById('fecha_nacimiento').value = data.fecha_nacimiento?.split("T")[0] || '';
        document.getElementById('tipo_contrato_empleo').value = data.tipo_contrato_empleo || '';
        document.getElementById('beneficiarios').value = data.beneficiarios || '';
        document.getElementById('nacionalidad').value = data.nacionalidad || '';

        // Mostrar foto actual
        const fotoUrl = data.foto ? data.foto : 'https://via.placeholder.com/150?text=Sin+Foto';
        document.getElementById('carnetFoto').src = fotoUrl;
    };

    /**
     * Valida los campos obligatorios del formulario
     * @param {FormData} formData - Datos del formulario
     * @returns {boolean} - True si es válido, False si no
     */
    const validarFormulario = (formData) => {
        const requiredFields = ['nombre', 'puesto', 'tipo_contrato', 'sueldo_base', 'fecha_contratacion', 'numero_identidad'];
        let isValid = true;
        
        requiredFields.forEach(field => {
            const value = formData.get(field);
            if (!value || value.trim() === '') {
                alert(`El campo ${field.replace('_', ' ')} es obligatorio`);
                document.getElementById(field).focus();
                isValid = false;
            }
        });

        return isValid;
    };

    /**
     * Muestra u oculta el indicador de carga
     * @param {boolean} show - True para mostrar, False para ocultar
     */
    const toggleLoading = (show) => {
        if (loadingIndicator) {
            loadingIndicator.style.display = show ? 'block' : 'none';
        }
        if (submitBtn) {
            submitBtn.disabled = show;
        }
    };

    // Cargar datos del empleado
    const cargarDatosEmpleado = async () => {
        try {
            toggleLoading(true);
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
        } finally {
            toggleLoading(false);
        }
    };

    // Inicializar cámara
    const inicializarCamara = () => {
        tomarFotoBtn.addEventListener('click', async () => {
            try {
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }

                stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        facingMode: 'user' 
                    } 
                });
                video.srcObject = stream;
                video.style.display = 'block';
                tomarFotoBtn.textContent = 'Capturar Foto';
            } catch (error) {
                alert('No se pudo acceder a la cámara. Asegúrese de haber concedido los permisos necesarios.');
                console.error('Error al acceder a la cámara:', error);
            }
        });

        // Capturar foto desde la cámara
        video.addEventListener('click', () => {
            if (!stream) return;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            
            // Aplicar espejo para mejor experiencia de usuario
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Restaurar contexto
            ctx.setTransform(1, 0, 0, 1, 0, 0);

            // Convertir a blob y asignar al input
            canvas.toBlob((blob) => {
                const file = new File([blob], `foto_${Date.now()}.png`, { 
                    type: 'image/png',
                    lastModified: Date.now()
                });
                
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fotografiaInput.files = dataTransfer.files;

                // Detener la cámara
                stream.getTracks().forEach(track => track.stop());
                stream = null;
                video.style.display = 'none';
                tomarFotoBtn.textContent = 'Tomar Foto';

                // Mostrar vista previa
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementById('carnetFoto').src = e.target.result;
                };
                reader.readAsDataURL(file);

            }, 'image/png', 0.9); // Calidad del 90%
        });
    };

    // Manejar envío del formulario
    const manejarEnvioFormulario = async (event) => {
        event.preventDefault();
        
        const token = localStorage.getItem('authToken');
        const formData = new FormData(form);
        
        // Validar antes de enviar
        if (!validarFormulario(formData)) {
            return;
        }

        try {
            toggleLoading(true);
            
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
            console.error('Error al actualizar:', {
                error: error,
                message: error.message,
                stack: error.stack
            });
            alert(`Error: ${error.message || 'Ocurrió un error al actualizar el empleado'}`);
        } finally {
            toggleLoading(false);
        }
    };

    // Botón cancelar
    cancelarBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('¿Está seguro que desea cancelar? Los cambios no guardados se perderán.')) {
            window.location.href = '../empleados.html';
        }
    });

    // Inicialización
    cargarDatosEmpleado();
    inicializarCamara();
    form.addEventListener('submit', manejarEnvioFormulario);
});