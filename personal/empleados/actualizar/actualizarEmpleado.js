// Función para verificar autenticación
function verificarAutenticacion() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '../../../login.html';
        return false;
    }
    return true;
}

// Función para mostrar mensajes al usuario
function mostrarMensaje(mensaje, tipo = 'error') {
    const contenedor = document.createElement('div');
    contenedor.className = tipo === 'error' ? 'mensaje-error' : 'mensaje-exito';
    contenedor.textContent = mensaje;
    document.body.appendChild(contenedor);
    
    setTimeout(() => {
        contenedor.remove();
    }, 5000);
}

// Función para manejar la cámara
function manejarCamara(video, canvas, boton, inputFoto) {
    let stream = null;
    
    boton.addEventListener('click', function() {
        if (stream) {
            detenerCamara(stream);
            stream = null;
            boton.textContent = 'Tomar Foto';
            video.style.display = 'none';
            return;
        }
        
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(mediaStream) {
                stream = mediaStream;
                video.srcObject = stream;
                video.style.display = 'block';
                boton.textContent = 'Detener Cámara';
            })
            .catch(function(error) {
                mostrarMensaje('No se pudo acceder a la cámara: ' + error.message);
                console.error('Error al acceder a la cámara:', error);
            });
    });
    
    video.addEventListener('click', function() {
        if (!stream) return;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(function(blob) {
            const file = new File([blob], 'foto-empleado.png', { type: 'image/png' });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            inputFoto.files = dataTransfer.files;
            
            // Mostrar vista previa
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('fotoPreview').src = e.target.result;
            };
            reader.readAsDataURL(file);
            
            detenerCamara(stream);
            stream = null;
            video.style.display = 'none';
            boton.textContent = 'Tomar Foto';
        }, 'image/png');
    });
    
    function detenerCamara(stream) {
        stream.getTracks().forEach(function(track) {
            track.stop();
        });
    }
}

// Función para cargar datos del empleado
async function cargarDatosEmpleado(id) {
    if (!verificarAutenticacion()) return;
    
    try {
        mostrarCargando(true);
        const token = localStorage.getItem('authToken');
        const respuesta = await fetch(`https://personal-backend-ggeb.onrender.com/api/empleados/${id}`, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        
        if (!respuesta.ok) {
            throw new Error('Error al obtener datos del empleado');
        }
        
        const datos = await respuesta.json();
        llenarFormulario(datos);
    } catch (error) {
        mostrarMensaje(error.message);
        console.error('Error:', error);
    } finally {
        mostrarCargando(false);
    }
}

// Función para llenar el formulario con datos
function llenarFormulario(datos) {
    const campos = {
        'nombre': datos.nombre || '',
        'puesto': datos.puesto || '',
        'tipo_contrato': datos.tipo_contrato || '',
        'sueldo_base': datos.sueldo_base || '',
        'activo': datos.activo === 1 || datos.activo === true || datos.activo === 'SI' ? 'SI' : 'NO',
        'fecha_contratacion': datos.fecha_contratacion ? datos.fecha_contratacion.split('T')[0] : '',
        'numero_identidad': datos.numero_identidad || '',
        'huella': datos.ruta_huella || '',
        'telefono': datos.telefono || '',
        'domicilio': datos.domicilio || '',
        'estado_civil': datos.estado_civil || '',
        'sexo': datos.sexo || '',
        'fecha_egreso': datos.fecha_egreso ? datos.fecha_egreso.split('T')[0] : '',
        'nivel_educativo': datos.nivel_educativo || '',
        'nombre_emergencia': datos.nombre_emergencia || '',
        'telefono_emergencia': datos.telefono_emergencia || '',
        'lugar_nacimiento': datos.lugar_nacimiento || '',
        'fecha_nacimiento': datos.fecha_nacimiento ? datos.fecha_nacimiento.split('T')[0] : '',
        'tipo_contrato_empleo': datos.tipo_contrato_empleo || '',
        'beneficiarios': datos.beneficiarios || '',
        'nacionalidad': datos.nacionalidad || ''
    };
    
    Object.keys(campos).forEach(function(id) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.value = campos[id];
        }
    });
    
    // Mostrar foto actual
    const fotoUrl = datos.foto || 'https://via.placeholder.com/150?text=Sin+Foto';
    const fotoPreview = document.getElementById('fotoPreview');
    if (fotoPreview) {
        fotoPreview.src = fotoUrl;
    }
}

// Función para validar el formulario
function validarFormulario() {
    const camposRequeridos = [
        'nombre', 'puesto', 'tipo_contrato', 'sueldo_base',
        'fecha_contratacion', 'numero_identidad'
    ];
    
    let valido = true;
    
    camposRequeridos.forEach(function(id) {
        const elemento = document.getElementById(id);
        if (elemento && !elemento.value.trim()) {
            mostrarMensaje(`El campo ${elemento.labels[0].textContent} es requerido`);
            elemento.focus();
            valido = false;
            return false; // Salir del forEach
        }
    });
    
    return valido;
}

// Función para mostrar/ocultar estado de carga
function mostrarCargando(mostrar) {
    const boton = document.getElementById('btnActualizar');
    if (boton) {
        boton.disabled = mostrar;
        boton.innerHTML = mostrar ? 
            '<span class="spinner"></span> Procesando...' : 
            'Actualizar Empleado';
    }
}

// Función principal al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    if (!verificarAutenticacion()) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const empleadoId = urlParams.get('id');
    
    if (!empleadoId) {
        mostrarMensaje('ID de empleado no especificado');
        window.location.href = '../empleados.html';
        return;
    }
    
    // Configurar cámara
    const video = document.getElementById('videoCamara');
    const canvas = document.getElementById('canvasFoto');
    const btnTomarFoto = document.getElementById('btnTomarFoto');
    const inputFoto = document.getElementById('fotografia');
    
    if (video && canvas && btnTomarFoto && inputFoto) {
        manejarCamara(video, canvas, btnTomarFoto, inputFoto);
    }
    
    // Cargar datos del empleado
    cargarDatosEmpleado(empleadoId);
    
    // Manejar envío del formulario
    const formulario = document.getElementById('formularioEmpleado');
    if (formulario) {
        formulario.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!validarFormulario()) return;
            
            try {
                mostrarCargando(true);
                const token = localStorage.getItem('authToken');
                const formData = new FormData(formulario);
                
                const respuesta = await fetch(`https://personal-backend-ggeb.onrender.com/api/empleados/${empleadoId}`, {
                    method: 'PUT',
                    body: formData,
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });
                
                if (!respuesta.ok) {
                    const error = await respuesta.json();
                    throw new Error(error.message || 'Error al actualizar empleado');
                }
                
                mostrarMensaje('Empleado actualizado correctamente', 'exito');
                setTimeout(function() {
                    window.location.href = '../empleados.html';
                }, 2000);
                
            } catch (error) {
                mostrarMensaje(error.message);
                console.error('Error al actualizar empleado:', error);
            } finally {
                mostrarCargando(false);
            }
        });
    }
    
    // Manejar botón cancelar
    const btnCancelar = document.getElementById('btnCancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', function() {
            if (confirm('¿Está seguro que desea cancelar? Los cambios no guardados se perderán.')) {
                window.location.href = '../empleados.html';
            }
        });
    }
});