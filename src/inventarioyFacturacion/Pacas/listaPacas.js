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
  
  // Ejecutar la verificación al cargar la página
  verificarAutenticacion();
  
  function logout() {
    localStorage.removeItem('authToken');
    alert("Sesión cerrada");
    window.location.href = "../../../login.html";
  }
  

const apiUrl = 'https://backendtabacalera-production.up.railway.app/api/pacas';
let pilonesData = [];

async function loadPilones() {
    try {
        const response = await fetch(apiUrl);
        pilonesData = await response.json();
        displayPilones(pilonesData);
    } catch (error) {
        alert('Error al cargar los pilones: ' + error.message);
    }
}

function totalpacas() {
    fetch("https://backendtabacalera-production.up.railway.app/api/pacas/total")
    .then(response => response.json())
    .then(data => {
        console.log("Respuesta de la API:", data); // Depuración

        if (data && typeof data === 'object' && 'total_pacas' in data) {
            document.getElementById('totalPacas').textContent = data.total_pacas;
        } else {
            console.error("Error: La respuesta no tiene la propiedad 'total_pacas'", data);
        }
    })
    .catch(error => {
        console.error("Error en la solicitud:", error);
    });
}

function displayPilones(pilones) {
    const pilonesList = document.getElementById('pilonesList');
    pilonesList.innerHTML = '';

    pilones.forEach(pilon => {
        const tr = document.createElement('tr');
        tr.id = `pilon-${pilon.id}`; // Aseguramos que cada fila tenga un ID único

        tr.innerHTML = `
            <td>${pilon.numero_paca}</td>
            <td>${pilon.tipo}</td>
            <td>${new Date(pilon.fecha).toLocaleDateString()}</td>
            <td>${pilon.tara}</td>
            <td>${pilon.cosecha}</td>
            <td>${pilon.peso_bruto}</td>
            <td>${pilon.peso_neto}</td>
            <td>
                <div class="dropdown">
                    <button class="dropdown-btn" onclick="toggleDropdown(this)">Selecciona</button>
                    <div class="dropdown-menu">
                        <button onclick="abrirModalEditarPilon(${pilon.id})">Editar</button>
                        <button onclick="eliminarPilon(${pilon.id})">Eliminar</button>
                    </div>
                </div>
            </td>
        `;
        pilonesList.appendChild(tr);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    loadPilones();
    totalpacas();
});

function toggleDropdown(button) {
  const dropdown = button.parentElement;
  dropdown.classList.toggle('show');
}

window.onclick = function(event) {
  if (!event.target.matches('.dropdown-btn')) {
      const dropdowns = document.querySelectorAll('.dropdown');
      dropdowns.forEach(dropdown => dropdown.classList.remove('show'));
  }
};

document.addEventListener("click", function (event) {
  let submenu1 = document.getElementById("submenu");   // Menú de Bodega 2
  let submenu2 = document.getElementById("submenu2"); // Menú de Bodega 3
  let bodega2Btn = document.getElementById("bodega2Btn");
  let bodega3Btn = document.getElementById("bodega3Btn");

  // Si el clic NO es en el botón ni dentro del menú de Bodega 2, se cierra
  if (!bodega2Btn.contains(event.target) && !submenu1.contains(event.target)) {
      submenu1.style.display = "none";
  }

  // Si el clic NO es en el botón ni dentro del menú de Bodega 3, se cierra
  if (!bodega3Btn.contains(event.target) && !submenu2.contains(event.target)) {
      submenu2.style.display = "none";
  }
});

// Control para abrir/cerrar el menú de Bodega 2
document.getElementById("bodega2Btn").addEventListener("click", function (event) {
  event.preventDefault(); 
  let submenu = document.getElementById("submenu");
  submenu.style.display = submenu.style.display === "block" ? "none" : "block";
  event.stopPropagation(); // Evita que el evento burbujee y cierre inmediatamente
});

// Control para abrir/cerrar el menú de Bodega 3
document.getElementById("bodega3Btn").addEventListener("click", function (event) {
  event.preventDefault();
  let submenu = document.getElementById("submenu2");
  submenu.style.display = submenu.style.display === "block" ? "none" : "block";
  event.stopPropagation(); // Evita que el evento burbujee y cierre inmediatamente
});

async function eliminarPilon(pilonId) {
    const confirmacion = confirm("¿Estás seguro de que deseas eliminar este pilón?");
    if (!confirmacion) return;
  
    try {
        const response = await fetch(`${apiUrl}/${pilonId}`, { method: 'DELETE' });
        if (response.ok) {
            alert("Paca eliminada exitosamente.");
            const fila = document.querySelector(`#pilon-${pilonId}`);
            if (fila) fila.remove();
        } else {
            const errorData = await response.json();
            alert(`Error al eliminar el pilón: ${errorData.error || 'Error desconocido.'}`);
        }
    } catch (error) {
        alert("Hubo un problema al conectar con el servidor. Por favor, inténtalo de nuevo.");
        console.error("Error al eliminar la paca:", error);
    }
  }

  function abrirModalEditarPilon(idPilon) {
    const url = `../actualizarPaca/actualizarPaca.html?id=${idPilon}`;
    window.location.href = url;
  }

function filterPilones() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const searchInput1 = document.getElementById('searchInput1').value.toLowerCase();

    const filteredPilones = pilonesData.filter(pilon => {
        const matchesSearch = pilon.tipo.toLowerCase().includes(searchInput);
        const matchesSearch1 = pilon.numero_paca.toString().toLowerCase().includes(searchInput1);
        return matchesSearch && matchesSearch1;
    });

    displayPilones(filteredPilones);
}

window.onload = loadPilones;
