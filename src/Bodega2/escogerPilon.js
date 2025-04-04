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
  

const apiUrl = 'https://backendtabacalera-production.up.railway.app/api/pilones';
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

function displayPilones(pilones) {
    const pilonesList = document.getElementById('pilonesList');
    pilonesList.innerHTML = '';

    pilones.forEach(pilon => {
        const tr = document.createElement('tr');
        tr.id = `pilon-${pilon.id}`; // Aseguramos que cada fila tenga un ID único

        tr.innerHTML = `
            <td>${pilon.numero_pilon}</td>
            <td>${new Date(pilon.fecha_creacion).toLocaleDateString()}</td>
            <td>${pilon.corte}</td>
            <td>${pilon.etapa}</td>
            <td>${pilon.descripcion}</td>
            <td>${pilon.nombre_finca}</td>
            <td>${pilon.variedad}</td>
            <td>${pilon.numero_viaje}</td>
            <td>${pilon.observacion}</td>
            <td>${pilon.numero_cajas}</td>
            <td>${pilon.peso_bruto}</td>
            <td>${pilon.merma}</td>
            <td>${pilon.libras_netas}</td>
            <td><button onclick="seleccionar(${pilon.id})">Seleccionar</button></td>
        `;
        pilonesList.appendChild(tr);
    });
}

function seleccionar(idPilon) {
    const url = `./formulario/form.html?id=${idPilon}`;
    window.location.href = url;
  }

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

document.getElementById("bodega2Btn").addEventListener("click", function (event) {
    event.preventDefault(); // Evita que el enlace navegue a otra página
    let submenu = document.getElementById("submenu");
    submenu.style.display = submenu.style.display === "block" ? "none" : "block";
  });

document.getElementById("bodega3Btn").addEventListener("click", function (event) {
    event.preventDefault(); // Evita que el enlace navegue a otra página
    let submenu = document.getElementById("submenu2");
    submenu.style.display = submenu.style.display === "block" ? "none" : "block";
  });

function filterPilones() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const fincaInput = document.getElementById('searchInputfinca').value.toLowerCase();
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    const filteredPilones = pilonesData.filter(pilon => {
        const matchesSearch = pilon.numero_pilon.toString().toLowerCase().includes(searchInput);
        const matchesFinca = pilon.nombre_finca.toLowerCase().includes(fincaInput);
        const matchesStartDate = !startDate || new Date(pilon.fecha_creacion) >= new Date(startDate);
        const matchesEndDate = !endDate || new Date(pilon.fecha_creacion) <= new Date(endDate);
        return matchesSearch && matchesFinca && matchesStartDate && matchesEndDate;
    });

    displayPilones(filteredPilones);
}


window.onload = loadPilones;
