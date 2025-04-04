document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Evita que el formulario se envíe de forma tradicional

    // Obtener los valores del formulario
    const nombre = document.getElementById('username').value.trim(); // Cambiado de "username" a "nombre"
    const password = document.getElementById('password').value.trim();

    // Validar que los campos no estén vacíos
    if (!nombre || !password) {
        showError('Por favor, ingrese usuario y contraseña.');
        return;
    }

    // Datos para enviar al backend
    const loginData = { nombre, password }; // Cambiado de "usename" a "nombre"

    try {
        // Enviar la solicitud al backend
        const response = await fetch('https://loginbackend-production.up.railway.app/api/auth/login', { // Nueva ruta
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
        });

        // Verificar si la respuesta es exitosa
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error en el inicio de sesión');
        }

        // Procesar la respuesta exitosa
        const data = await response.json();
        if (data.token) {
            // Almacenar el token en localStorage
            localStorage.setItem('authToken', data.token);
            showSuccess('Login exitoso. Redirigiendo...');

            // Redirigir al usuario después de 2 segundos
            setTimeout(() => {
                window.location.href = 'menuPrincipal/menuPrincipal.html'; // Cambia esta ruta según tu proyecto
            }, 2000);
        } else {
            throw new Error('No se recibió un token de autenticación.');
        }
    } catch (error) {
        // Manejar errores
        console.error('Error en el login:', error);
        showError(error.message);
    }
});

// Función para mostrar mensajes de error
function showError(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorMessage.style.color = 'red';
}

// Función para mostrar mensajes de éxito
function showSuccess(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorMessage.style.color = 'green';
}