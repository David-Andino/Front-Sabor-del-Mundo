document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const empleadoId = urlParams.get('id');
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const tomarFotoBtn = document.getElementById('tomarFoto');
    const fotografiaInput = document.getElementById('fotografia');
    const cancelarBtn = document.getElementById('cancelar');
    let stream;

    if (!empleadoId) {
        alert('ID de empleado no proporcionado');
        window.location.href = '../empleados.html';
        return;
    }

    // Obtener los datos del empleado
    try {
        const response = await fetch(`http://localhost:5000/api/empleados/${empleadoId}`);
        if (!response.ok) throw new Error('No se pudo obtener el empleado');
        
        const data = await response.json();

        // Llenar los campos del formulario con los datos del empleado
        document.getElementById('nombre').value = data.nombre || '';
        document.getElementById('puesto').value = data.puesto || '';
        document.getElementById('tipo_contrato').value = data.tipo_contrato || '';
        document.getElementById('sueldo_base').value = data.sueldo_base || '';
        // Cambio importante para el campo activo (usando select)
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

        // Mostrar la foto del empleado
        const rutaBase = 'http://localhost:5000/imagenesEmpleados/';
        document.getElementById('carnetFoto').src = data.ruta_fotografia 
            ? rutaBase + data.ruta_fotografia 
            : rutaBase + 'predeterminado.png';
    } catch (error) {
        console.error('Error al obtener los datos del empleado:', error);
        alert('Error al obtener los datos del empleado');
    }

    // Activar la cámara
    tomarFotoBtn.addEventListener('click', async () => {
        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            video.style.display = 'block';
            tomarFotoBtn.textContent = 'Capturar Foto';
        } catch (error) {
            alert('No se pudo acceder a la cámara');
            console.error('Error al acceder a la cámara:', error);
        }
    });

    // Capturar foto
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

    // Enviar formulario
    document.getElementById('empleadoForm').addEventListener('submit', async (event) => {
        event.preventDefault();
    
        const formData = new FormData();
        formData.append('nombre', document.getElementById('nombre').value);
        formData.append('puesto', document.getElementById('puesto').value);
        formData.append('tipo_contrato', document.getElementById('tipo_contrato').value);
        formData.append('sueldo_base', parseFloat(document.getElementById('sueldo_base').value));
        // Cambio clave: Enviamos directamente 'SI' o 'NO'
        formData.append('activo', document.getElementById('activo').value);
        formData.append('fecha_contratacion', document.getElementById('fecha_contratacion').value);
        formData.append('numero_identidad', document.getElementById('numero_identidad').value);
        formData.append('huella', document.getElementById('huella').value || '');
        formData.append('telefono', document.getElementById('telefono').value || '');
        formData.append('domicilio', document.getElementById('domicilio').value || '');
        formData.append('estado_civil', document.getElementById('estado_civil').value || '');
        formData.append('sexo', document.getElementById('sexo').value || '');
        formData.append('fecha_egreso', document.getElementById('fecha_egreso').value || null);
        formData.append('nivel_educativo', document.getElementById('nivel_educativo').value || '');
        formData.append('nombre_emergencia', document.getElementById('nombre_emergencia').value || '');
        formData.append('telefono_emergencia', document.getElementById('telefono_emergencia').value || '');
        formData.append('lugar_nacimiento', document.getElementById('lugar_nacimiento').value || '');
        formData.append('fecha_nacimiento', document.getElementById('fecha_nacimiento').value || '');
        formData.append('tipo_contrato_empleo', document.getElementById('tipo_contrato_empleo').value || '');
        formData.append('beneficiarios', document.getElementById('beneficiarios').value || '');
        formData.append('nacionalidad', document.getElementById('nacionalidad').value || '');
    
        // Manejar la fotografía
        if (fotografiaInput.files[0] && fotografiaInput.files[0].size > 0) {
            formData.append('fotografia', fotografiaInput.files[0]);
        }
    
        // Debug: Mostrar datos en consola
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }
    
        // Enviar los datos al backend
        try {
            const response = await fetch(`http://localhost:5000/api/empleados/${empleadoId}`, {
                method: 'PUT',
                body: formData,
            });
    
            if (response.ok) {
                alert('Empleado actualizado correctamente');
                window.location.href = '../empleados.html';
            } else {
                const errorData = await response.json();
                alert(`Error al actualizar el empleado: ${errorData.message || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al actualizar el empleado. Por favor, inténtalo de nuevo.');
        }
    });
});