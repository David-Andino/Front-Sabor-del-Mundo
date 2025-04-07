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


document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const tomarFotoBtn = document.getElementById('tomarFoto');
    const fotografiaInput = document.getElementById('fotografia');
    const cancelarBtn = document.getElementById('cancelar');

    let stream;

    // Acceder a la cámara
    tomarFotoBtn.addEventListener('click', async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            video.style.display = 'block';
            tomarFotoBtn.textContent = 'Capturar Foto';
        } catch (error) {
            alert('No se pudo acceder a la cámara');
            console.error('Error al acceder a la cámara:', error);
        }
    });

    // Capturar foto desde la cámara
    // Capturar foto desde la cámara
video.addEventListener('click', () => {
    if (stream) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convertir la imagen a un archivo
        canvas.toBlob((blob) => {
            const file = new File([blob], 'foto.png', { type: 'image/png' });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fotografiaInput.files = dataTransfer.files;

            // Detener la cámara
            stream.getTracks().forEach(track => track.stop());
            video.style.display = 'none';
            tomarFotoBtn.textContent = 'Tomar Foto';
        }, 'image/png');
    }
});

    cancelarBtn.addEventListener('click', () => {
        window.location.href = '../empleados.html';
    });

    // Enviar el formulario
    document.getElementById('empleadoForm').addEventListener('submit', async (event) => {
        event.preventDefault();
    
        // Obtener valores del formulario
        const formData = new FormData();
        
        // Obtener el valor del select (asegúrate de cambiar el HTML a select)
        const estadoActivo = document.getElementById('activo').value;
        
        // Validar que sea 'SI' o 'NO'
        if (estadoActivo !== 'SI' && estadoActivo !== 'NO') {
            alert('El estado activo debe ser "SI" o "NO"');
            return;
        }
    
        // Agregar campos al FormData
        formData.append('nombre', document.getElementById('nombre').value);
        formData.append('puesto', document.getElementById('puesto').value);
        formData.append('tipo_contrato', document.getElementById('tipo_contrato').value);
        formData.append('sueldo_base', parseFloat(document.getElementById('sueldo_base').value));
        formData.append('activo', estadoActivo); // Enviamos directamente 'SI' o 'NO'
        formData.append('fecha_contratacion', document.getElementById('fecha_contratacion').value);
        formData.append('numero_identidad', document.getElementById('numero_identidad').value);
        formData.append('huella', document.getElementById('huella').value || '');
        formData.append('telefono', document.getElementById('telefono').value || '');
        formData.append('domicilio', document.getElementById('domicilio').value || '');
        formData.append('estado_civil', document.getElementById('estado_civil').value || '');
        formData.append('sexo', document.getElementById('sexo').value || '');
    
        // Manejar fecha_egreso como null si está vacío
        const fechaEgreso = document.getElementById('fecha_egreso').value;
        formData.append('fecha_egreso', fechaEgreso || null);
    
        formData.append('nivel_educativo', document.getElementById('nivel_educativo').value || '');
        formData.append('nombre_emergencia', document.getElementById('nombre_emergencia').value || '');
        formData.append('telefono_emergencia', document.getElementById('telefono_emergencia').value || '');
        formData.append('lugar_nacimiento', document.getElementById('lugar_nacimiento').value || '');
        formData.append('fecha_nacimiento', document.getElementById('fecha_nacimiento').value || '');
        formData.append('tipo_contrato_empleo', document.getElementById('tipo_contrato_empleo').value || '');
        formData.append('beneficiarios', document.getElementById('beneficiarios').value || '');
        formData.append('nacionalidad', document.getElementById('nacionalidad').value || '');
    
        // Agregar la fotografía si existe
        if (fotografiaInput.files[0]) {
            formData.append('fotografia', fotografiaInput.files[0]);
        }
    
        // Enviar los datos al backend
        try {
  
            const response = await fetch('https://personal-backend-ggeb.onrender.com/api/empleados/crear', {
                method: 'POST',
                body: formData,
            });
    
            const responseData = await response.json();
            
            if (response.ok) {
                alert('Empleado creado correctamente');
                window.location.href = '../empleados.html'; // Redirigir después de éxito
            } else {
                // Mostrar mensaje de error del backend si existe
                const errorMsg = responseData.message || 'Error al crear el empleado';
                alert(`Error: ${errorMsg}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión con el servidor');
        }
    });
});