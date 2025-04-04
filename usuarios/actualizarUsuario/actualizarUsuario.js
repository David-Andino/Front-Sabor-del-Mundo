const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('id'); // Obtener el ID del usuario desde la URL

let token; // Declarar token en el ámbito global

document.addEventListener('DOMContentLoaded', async () => {
    token = localStorage.getItem('authToken'); // Obtener el token del localStorage

    if (!token) {
        alert('No estás autenticado. Redirigiendo al login...');
        window.location.href = '../../../login.html'; // Redirigir al login si no hay token
        return;
    }

    if (!userId) {
        alert('ID de usuario no proporcionado');
        window.location.href = '../listaUsuarios.html'; // Redirigir al listado de usuarios
        return;
    }

    // Obtener los datos del usuario
    await obtenerDatosUsuario(userId, token);
});

// Función para obtener los datos del usuario
async function obtenerDatosUsuario(userId, token) {
    try {
        const response = await fetch(`https://loginbackend-production.up.railway.app/api/auth/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Error al obtener los datos del usuario');
        }

        const user = await response.json();
        rellenarFormulario(user); // Rellenar el formulario con los datos del usuario
    } catch (error) {
        console.error('Error:', error);
        alert('Error al obtener los datos del usuario');
    }
}

// Mapeo de roles a sistemas permitidos
const sistemasPorRol = {
    admin: ['usuarios', 'bodegas', 'finanzas', 'personal'],
    Personal: ['personal'],
    Bodegas: ['bodegas'],
    Finanzas: ['finanzas']
};

// Función para actualizar los checkboxes según el rol seleccionado
function actualizarCheckboxes(rol) {
    const sistemasContainer = document.getElementById('sistemas_permitidos');
    sistemasContainer.innerHTML = ''; // Limpiar el contenedor

    const sistemas = sistemasPorRol[rol] || []; // Obtener los sistemas permitidos para el rol

    sistemas.forEach(sistema => {
        const label = document.createElement('label');
        label.style.display = 'inline-block';
        label.style.marginRight = '10px';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'sistemas_permitidos';
        checkbox.value = sistema;

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(sistema));
        sistemasContainer.appendChild(label);
    });
}

// Evento change para el campo de selección de rol
document.getElementById('rol').addEventListener('change', (e) => {
    const rol = e.target.value; // Obtener el rol seleccionado
    actualizarCheckboxes(rol); // Actualizar los checkboxes
});

// Función para rellenar el formulario con los datos del usuario
function rellenarFormulario(user) {
    // Rellenar campos básicos
    document.getElementById('nombre').value = user.nombre;
    document.getElementById('rol').value = user.rol;

    // Actualizar los checkboxes según el rol del usuario
    actualizarCheckboxes(user.rol);

    // Pre-seleccionar los checkboxes según los sistemas permitidos del usuario
    const sistemasPermitidos = user.sistemas_permitidos;
    const checkboxes = document.querySelectorAll('#sistemas_permitidos input[type="checkbox"]');

    checkboxes.forEach(checkbox => {
        if (sistemasPermitidos.includes(checkbox.value)) {
            checkbox.checked = true;
        }
    });
}

// Enviar el formulario actualizado
const formulario = document.getElementById('formularioUsuario');
formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const password = document.getElementById('password').value;
    const rol = document.getElementById('rol').value;

    // Obtener los sistemas permitidos seleccionados
    const sistemasPermitidos = Array.from(document.querySelectorAll('#sistemas_permitidos input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);

    const usuario = {
        nombre,
        password,
        rol,
        sistemas_permitidos: sistemasPermitidos
    };

    try {
        const response = await fetch(`https://loginbackend-production.up.railway.app/api/auth/update/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(usuario),
        });

        if (!response.ok) {
            throw new Error('Error al actualizar el usuario');
        }

        alert('Usuario actualizado correctamente');
        window.location.href = '../listaUsuarios.html'; // Redirigir al listado de usuarios
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar el usuario');
    }
});

function cancelar() {
    // Mostrar una alerta de confirmación
    const confirmacion = confirm("¿Estás seguro de que quieres cancelar? Se perderán los cambios.");

    if (confirmacion) {
        // Si el usuario confirma, redirigir a la página principal
        window.location.href = '../listaUsuarios.html';
    } else {
        // Si el usuario cancela, no hacer nada
        console.log("Cancelación de la actualización cancelada.");
    }
}

function logout() {
    localStorage.removeItem('authToken');
    window.location.href = '../../../login.html';
}