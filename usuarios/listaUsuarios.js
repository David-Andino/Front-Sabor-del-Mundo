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
  
  // Ejecutar la verificación al cargar la página
  verificarAutenticacion();
  
  function logout() {
    localStorage.removeItem('authToken');
    alert("Sesión cerrada");
    window.location.href = "../../login.html";
  }

  function regresar() {
    window.location.href = '../menuPrincipal/menuPrincipal.html';
}

  document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken'); // Obtener el token del localStorage

    if (!token) {
        alert('No estás autenticado. Redirigiendo al login...');
        window.location.href = '../../login.html'; // Redirigir al login si no hay token
        return;
    }

    // Cargar la lista de usuarios al iniciar
    cargarUsuarios();

    // Botón para crear usuario
    document.getElementById('crearUsuario').addEventListener('click', () => {
        window.location.href = './crearUsuario/crearUsuario.html'; // Redirigir a la página de creación
    });
});

// Función para cargar los usuarios desde el backend
async function cargarUsuarios() {
    try {
        const response = await fetch('https://loginbackend-production.up.railway.app/api/auth/users', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Enviar el token
            },
        });

        if (!response.ok) {
            throw new Error('Error al cargar los usuarios');
        }

        const usuarios = await response.json();
        mostrarUsuarios(usuarios);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los usuarios');
    }
}

// Función para mostrar los usuarios en la tabla
function mostrarUsuarios(usuarios) {
    const tbody = document.querySelector('#tablaUsuarios tbody');
    tbody.innerHTML = ''; // Limpiar la tabla

    usuarios.forEach(usuario => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${usuario.id}</td>
            <td>${usuario.nombre}</td>
            <td>${usuario.rol}</td>
            <td>${usuario.sistemas_permitidos.join(', ')}</td>
            <td class="acciones">
                <button class="editar" onclick="editarUsuario(${usuario.id})">Editar</button>
                <button class="eliminar" onclick="eliminarUsuario(${usuario.id})">Eliminar</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// Función para editar un usuario
function editarUsuario(id) {
    window.location.href = `./actualizarUsuario/actualizarUsuario.html?id=${id}`;
}

// Función para eliminar un usuario
async function eliminarUsuario(id) {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
        const response = await fetch(`https://loginbackend-production.up.railway.app/api/auth/delete/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
        });

        if (!response.ok) {
            throw new Error('Error al eliminar el usuario');
        }

        alert('Usuario eliminado correctamente');
        cargarUsuarios(); // Recargar la lista de usuarios
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el usuario');
    }
}