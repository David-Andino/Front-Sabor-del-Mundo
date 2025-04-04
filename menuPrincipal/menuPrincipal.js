// Verificar si el usuario está autenticado
function verificarAutenticacion() {
    const token = localStorage.getItem('authToken');

    if (!token) {
        // Si no hay token, redirigir al login
        window.location.href = '../login.html';
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
            window.location.href = '../login.html';
        }
    })
    .catch(error => {
        console.error('Error al verificar el token:', error);
        window.location.href = '../login.html';
    });

    obtenerSistemasPermitidos(token);
}

function decodificarToken(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1])); // Decodificar el payload del token
        return payload;
    } catch (error) {
        console.error('Error al decodificar el token:', error);
        return null;
    }
}

async function obtenerSistemasPermitidos(token) {
    try {
        // Decodificar el token para obtener el ID del usuario
        const payload = decodificarToken(token);
        if (!payload || !payload.id) {
            throw new Error('Token inválido o sin ID de usuario');
        }

        const userId = payload.id; // Obtener el ID del usuario desde el token

        // Hacer la solicitud al backend con el ID del usuario
        const response = await fetch(`https://loginbackend-production.up.railway.app/api/auth/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Error al obtener los sistemas permitidos');
        }

        const user = await response.json();
        const sistemasPermitidos = user.sistemas_permitidos;
        console.log('Sistemas permitidos:', sistemasPermitidos);

        // Habilitar o deshabilitar botones según los sistemas permitidos
        habilitarBotones(sistemasPermitidos);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al obtener los sistemas permitidos');
    }
}

// Función para habilitar o deshabilitar botones
function habilitarBotones(sistemasPermitidos) {
    const botones = {
        bodegas: document.getElementById('bodegas'),
        personal: document.getElementById('personal'),
        finanzas: document.getElementById('finanzas'),
        usuarios: document.getElementById('usuarios')
    };

    // Deshabilitar todos los botones por defecto
    Object.values(botones).forEach(boton => {
        boton.disabled = true;
        boton.classList.add('disabled'); // Agregar clase CSS para estilo
    });

    // Habilitar botones según los sistemas permitidos
    sistemasPermitidos.forEach(sistema => {
        if (botones[sistema]) {
            botones[sistema].disabled = false;
            botones[sistema].classList.remove('disabled');
        }
    });
}
// Ejecutar la verificación al cargar la página
verificarAutenticacion();

function redirigir(url) {
    window.location.href = url;
}

function cerrarSesion() {
    localStorage.removeItem('authToken');
    alert("Sesión cerrada");
    window.location.href = "../login.html";
}

function descargarManual() {
    window.location.href = "manual.pdf";
}