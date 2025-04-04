// Verificar si el usuario está autenticado
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
            <td><button onclick="verCajas(${pilon.id}, ${pilon.numero_pilon})">Ver Cajas</button></td>
            <td>
                <div class="dropdown">
                    <button class="dropdown-btn" onclick="toggleDropdown(this)">Selecciona</button>
                    <div class="dropdown-menu">
                        <button onclick="abrirModalEditarPilon(${pilon.id})">Editar</button>
                        <button onclick="eliminarPilon(${pilon.id})">Eliminar</button>
                        <button onclick="generarReporte(${pilon.id})">Generar Reporte</button>
                    </div>
                </div>
            </td>
        `;
        pilonesList.appendChild(tr);
    });
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

function abrirModalEditarPilon(idPilon) {
  const url = `./actualizar/actualizarPilon.html?id=${idPilon}`;
  window.location.href = url;
}

async function eliminarPilon(pilonId) {
  const confirmacion = confirm("¿Estás seguro de que deseas eliminar este pilón?");
  if (!confirmacion) return;

  try {
      const response = await fetch(`${apiUrl}/${pilonId}`, { method: 'DELETE' });
      if (response.ok) {
          alert("Pilón eliminado exitosamente.");
          const fila = document.querySelector(`#pilon-${pilonId}`);
          if (fila) fila.remove();
      } else {
          const errorData = await response.json();
          alert(`Error al eliminar el pilón: ${errorData.error || 'Error desconocido.'}`);
      }
  } catch (error) {
      alert("Hubo un problema al conectar con el servidor. Por favor, inténtalo de nuevo.");
      console.error("Error al eliminar el pilón:", error);
  }
}

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

function verCajas(pilonId, numeroPilon) {
    fetch(`https://backendtabacalera-production.up.railway.app/api/cajas/${pilonId}`)
      .then(response => response.json())
      .then(cajas => {
        const cajasBody = document.getElementById('cajasBody');
        cajasBody.innerHTML = '';

        if (cajas.length === 0) {
          const row = document.createElement('tr');
          row.innerHTML = `<td colspan="2">No hay cajas asociadas a este pilón</td>`;
          cajasBody.appendChild(row);
        } else {
          cajas.forEach(caja => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${caja.numero_caja}</td>
              <td>${caja.peso_libras}</td>
            `;
            cajasBody.appendChild(row);
          });
        }

        document.getElementById('modalPilonId').textContent = numeroPilon;
        document.getElementById('cajasModal').style.display = 'block';
      })
      .catch(error => {
        console.error('Error al cargar las cajas:', error);
        alert('Error al cargar las cajas.');
      });
}

async function generarReporte(pilonId) {
  try {
      const response = await fetch(`${apiUrl}/${pilonId}`);
      const pilon = await response.json();
      const { jsPDF } = window.jspdf;

      if (response.ok) {
          if (!pilon || !pilon.numero_pilon || !pilon.fecha_creacion) {
              alert("Datos del pilón no válidos.");
              console.log("Respuesta del servidor:", pilon);
              return;
          }

          const doc = new jsPDF();
          const logo = new Image();
          logo.src = './img/Sabor del mundo Tabacos.jpg';
          doc.addImage(logo, 'PNG', 10, 10, 40, 40);

          doc.setFontSize(20);
          doc.setFont("helvetica", "bold");
          doc.text('Sabor del Mundo Tabaco S. de RL. de C.V', 60, 30);

          doc.setFontSize(20);
          doc.text(`Pilón #${pilon.numero_pilon}`, 80, 60);

          function formatDate(dateString) {
              const date = new Date(dateString);
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              return `${year}-${month}-${day}`;
          }

          doc.setFontSize(12);
          const lineHeight = 10;
          let yPosition = 80;

          doc.text('Fecha de creación:', 10, yPosition);
          doc.text(formatDate(pilon.fecha_creacion), 70, yPosition);
          yPosition += lineHeight;

          doc.text('Corte:', 10, yPosition);
          doc.text(pilon.corte, 70, yPosition);
          yPosition += lineHeight;

          doc.text('Etapa:', 10, yPosition);
          doc.text(pilon.etapa, 70, yPosition);
          yPosition += lineHeight;

          doc.text('Descripción:', 10, yPosition);
          doc.text(pilon.descripcion, 70, yPosition);
          yPosition += lineHeight;

          doc.text('Finca:', 10, yPosition);
          doc.text(pilon.nombre_finca, 70, yPosition);
          yPosition += lineHeight;

          doc.text('Variedad:', 10, yPosition);
          doc.text(pilon.variedad, 70, yPosition);
          yPosition += lineHeight;

          doc.text('Número de cajas:', 10, yPosition);
          doc.text(pilon.numero_cajas.toString(), 70, yPosition);
          yPosition += lineHeight;

          doc.text('Peso bruto:', 10, yPosition);
          doc.text(`${pilon.peso_bruto} libras`, 70, yPosition);
          yPosition += lineHeight;

          doc.text('Libras netas:', 10, yPosition);
          doc.text(`${pilon.libras_netas} libras`, 70, yPosition);
          yPosition += lineHeight;

          doc.text('% Humedad:', 10, yPosition);
          doc.text(`${pilon.merma} libras`, 70, yPosition);
          yPosition += lineHeight;

          doc.text('Observaciones:', 10, yPosition);
          doc.text(pilon.observacion || 'N/A', 70, yPosition);
          yPosition += lineHeight;

          yPosition += lineHeight * 2;
          doc.setFontSize(8);
          doc.text('Sabor del Mundo @todos los derechos reservados', 70, yPosition);

          doc.save(`reporte-pilon-${pilon.numero_pilon}.pdf`);
      } else {
          alert("No se pudo obtener la información del pilón.");
      }
  } catch (error) {
      alert("Hubo un problema al generar el reporte.");
      console.error("Error:", error);
  }
}

function closeModal() {
    document.getElementById('cajasModal').style.display = "none";
}

window.onload = loadPilones;
