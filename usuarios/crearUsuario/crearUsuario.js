document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken'); // Obtener el token del localStorage

    if (!token) {
        alert('No estás autenticado. Redirigiendo al login...');
        window.location.href = '../../login.html'; 
        return;
    }

    // Mapeo de roles a sistemas permitidos
    const sistemasPorRol = {
        admin: ['usuarios', 'bodegas', 'finanzas', 'personal'],
        Personal: ['personal'],
        Bodegas: ['bodegas'],
        Finanzas: ['finanzas']
    };

    // Llenar sistemas permitidos según el rol seleccionado
    const rolSelect = document.getElementById('rol');
const sistemasContainer = document.getElementById('sistemas_permitidos');

rolSelect.addEventListener('change', () => {
    const rol = rolSelect.value;
    const sistemas = sistemasPorRol[rol] || [];

    // Limpiar y llenar el contenedor de sistemas permitidos
    sistemasContainer.innerHTML = '';
    sistemas.forEach(sistema => {
        const label = document.createElement('label');
        label.style.display = 'inline-block'; // Mostrar en línea
        label.style.marginRight = '10px'; // Espacio entre checkboxes

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'sistemas_permitidos';
        checkbox.value = sistema;

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(sistema));
        sistemasContainer.appendChild(label);
    });
    });

    // Enviar el formulario
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
            const response = await fetch('https://loginbackend-production.up.railway.app/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(usuario),
            });

            if (!response.ok) {
                throw new Error('Error al crear el usuario');
            }

            alert('Usuario creado correctamente');
            window.location.href = '../listaUsuarios.html';
        } catch (error) {
            console.error('Error:', error);
            alert('Error al crear el usuario');
        }
    });
});

// Función para cancelar
function cancelar() {
    window.location.href = '../listaUsuarios.html';
}

// Función para cerrar sesión
function logout() {
    localStorage.removeItem('authToken');
    window.location.href = '../../login.html'; 
}