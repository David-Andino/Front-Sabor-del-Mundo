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
  

const apiUrl = 'https://backendtabacalera-production.up.railway.app/api/bodega3';
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
            <td>${new Date(pilon.fecha).toLocaleDateString()}</td>
            <td>${pilon.peso_bruto}</td>
            <td>${pilon.merma}</td>
            <td>${pilon.peso_neto}</td>
            <td>${pilon.libras_mojadero}</td>
            <td>${pilon.variedad}</td>
            <td>${pilon.corte}</td>
            <td>${pilon.etapa}</td>
            <td>${pilon.tripa_desp_seco_grande_a}</td>
            <td>${pilon.tripa_desp_seco_mediana_a}</td>
            <td>${pilon.tripa_desp_seco_pequeno_a}</td>
            <td>${pilon.total_tripa_seco_a}</td>
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


function abrirModalEditarPilon(idPilon, pilon_id) {
    const url = `../ActualizarDespalillo/actualizarDespalillo.html?id=${idPilon}`;
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
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    const filteredPilones = pilonesData.filter(pilon => {
        const matchesSearch = pilon.numero_pilon.toString().toLowerCase().includes(searchInput);
        const matchesStartDate = !startDate || new Date(pilon.fecha) >= new Date(startDate);
        const matchesEndDate = !endDate || new Date(pilon.fecha) <= new Date(endDate);
        return matchesSearch  && matchesStartDate && matchesEndDate;
    });

    displayPilones(filteredPilones);
}


async function generarReporte(pilonId) {
  try {
      const response = await fetch(`${apiUrl}/${pilonId}`);
      const pilon = await response.json();
      const { jsPDF } = window.jspdf;

      if (response.ok) {
          if (!pilon || !pilon.numero_pilon || !pilon.fecha) {
              alert("Datos del pilón no válidos.");
              console.log("Respuesta del servidor:", pilon);
              return;
          }

          const doc = new jsPDF();
          const logo = new Image();
          logo.src = '../../Bodega1/img/Sabor del mundo Tabacos.jpg';
          doc.addImage(logo, 'PNG', 10, 10, 40, 40);

         // Encabezado
        doc.setFontSize(14);
        doc.text("SABOR DEL MUNDO TABACOS", 70, 15);
        doc.setFontSize(12);
        doc.text("DESPALILLO Finca El Benque, Gran Jamastran", 50, 25);
        doc.text("DESPALILLO", 90, 35);

         // Información del Pilón
        doc.setFontSize(10);
        doc.text(`N° PILON: ${pilon.numero_pilon}`, 15, 50);
        doc.text(`VARIEDAD: ${pilon.variedad}`, 15, 55);
        doc.text(`CORTE: ${pilon.corte}`, 15, 60);
        doc.text(`ETAPA: ${pilon.etapa}`, 15, 65);
        doc.text(`Peso Bruto: ${pilon.peso_bruto} lbrs`, 15, 70);
        doc.text(`Peso Neto: ${pilon.peso_neto} lbrs`, 15, 75);
        doc.text(`% HUMEDAD: ${pilon.merma} lbrs`, 15, 80);

        // Descripciones predefinidas
        // Descripciones predefinidas sin los totales (excepto "TOTAL DESPALILLO")
const descripciones = [
    "TRIPA DESP. SECO GRANDE A",
    "TRIPA DESP. SECO MEDIANA A",
    "TRIPA DESP. SECO PEQUEÑO A",
    "TRIPA DESP. VISO GRANDE A",
    "TRIPA DESP. VISO MEDIANA A",
    "TRIPA DESP. VISO PEQUEÑO A",
    "TRIPA DESP. LIGERO GRANDE A",
    "TRIPA DESP. LIGERO MEDIANA A",
    "TRIPA DESP. LIGERO PEQUEÑO A",
    "CAPA B SECO GRANDE",
    "BANDA SECO GRANDE",
    "BANDA SECO MEDIANA",
    "BANDA SECO PEQUEÑA",
    "BANDA VISO GRANDE",
    "TRIPA DESP. SECO GRANDE B",
    "TRIPA DESP. SECO MEDIANA B",
    "TRIPA DESP. SECO PEQUEÑO B",
    "TRIPA DESP. VISO GRANDE B",
    "TRIPA DESP. VISO GRANDE B (PELOTOSO)",
    "TRIPA DESP. VISO MEDIANA B",
    "TRIPA DESP. VISO MEDIANA B (PELOTOSO)",
    "TRIPA DESP. VISO PEQUEÑO B",
    "TRIPA DESP. LIGERO GRANDE B",
    "TRIPA DESP. LIGERO GRANDE B (PELOTOSO)",
    "TRIPA DESP. LIGERO MEDIANO B",
    "TRIPA DESP. LIGERO MEDIANO B (PELOTOSO)",
    "TRIPA DESP. LIGERO PEQUEÑO B",
    "PELOTOSO",
    "PICADURA",
    "VENA",
    "HOJAS VERDES",
    "TOTAL DESPALILLO"
];

// Mapeo de claves del JSON con sus descripciones, eliminando los totales excepto "TOTAL DESPALILLO"
const claves = {
    "TRIPA DESP. SECO GRANDE A": "tripa_desp_seco_grande_a",
    "TRIPA DESP. SECO MEDIANA A": "tripa_desp_seco_mediana_a",
    "TRIPA DESP. SECO PEQUEÑO A": "tripa_desp_seco_pequeno_a",
    "TRIPA DESP. VISO GRANDE A": "tripa_desp_viso_grande_a",
    "TRIPA DESP. VISO MEDIANA A": "tripa_desp_viso_mediana_a",
    "TRIPA DESP. VISO PEQUEÑO A": "tripa_desp_viso_pequeno_a",
    "TRIPA DESP. LIGERO GRANDE A": "tripa_desp_ligero_grande_a",
    "TRIPA DESP. LIGERO MEDIANA A": "tripa_desp_ligero_mediana_a",
    "TRIPA DESP. LIGERO PEQUEÑO A": "tripa_desp_ligero_pequeno_a",
    "CAPA B SECO GRANDE": "capa_b_seco_grande",
    "BANDA SECO GRANDE": "banda_seco_grande",
    "BANDA SECO MEDIANA": "banda_seco_mediana",
    "BANDA SECO PEQUEÑA": "banda_seco_pequena",
    "BANDA VISO GRANDE": "banda_viso_grande",
    "TRIPA DESP. SECO GRANDE B": "tripa_desp_seco_grande_b",
    "TRIPA DESP. SECO MEDIANA B": "tripa_desp_seco_mediana_b",
    "TRIPA DESP. SECO PEQUEÑO B": "tripa_desp_seco_pequeno_b",
    "TRIPA DESP. VISO GRANDE B": "tripa_desp_viso_grande_b",
    "TRIPA DESP. VISO GRANDE B (PELOTOSO)": "tripa_desp_viso_grande_b_pelotoso",
    "TRIPA DESP. VISO MEDIANA B": "tripa_desp_viso_mediana_b",
    "TRIPA DESP. VISO MEDIANA B (PELOTOSO)": "tripa_desp_viso_mediana_b_pelotoso",
    "TRIPA DESP. VISO PEQUEÑO B": "tripa_desp_viso_pequeno_b",
    "TRIPA DESP. LIGERO GRANDE B": "tripa_desp_ligero_grande_b",
    "TRIPA DESP. LIGERO GRANDE B (PELOTOSO)": "tripa_desp_ligero_grande_b_pelotoso",
    "TRIPA DESP. LIGERO MEDIANO B": "tripa_desp_ligero_mediano_b",
    "TRIPA DESP. LIGERO MEDIANO B (PELOTOSO)": "tripa_desp_ligero_mediano_b_pelotoso",
    "TRIPA DESP. LIGERO PEQUEÑO B": "tripa_desp_ligero_pequeno_b",
    "PELOTOSO": "pelotoso",
    "PICADURA": "picadura",
    "VENA": "vena",
    "HOJAS VERDES": "hojas_verdes",
    "TOTAL DESPALILLO": "total_despalillo"
};

    
        const totalLbrs = descripciones.reduce((sum, desc) => {
        if (desc !== "TOTAL DESPALILLO") {
                const clave = claves[desc];
                return sum + (parseFloat(pilon[clave]) || 0);
            }
            return sum;  // Excluir "Total Escogido"
        }, 0);
        
        // Crear la tabla con las descripciones fijas y sus valores de LBRS
        const columnas = ["N°", "DESCRIPCIÓN", "LBRS", "%"];
        const filas = descripciones.filter(desc => desc !== "TOTAL DESPALILLO")  // Filtra fuera "Total Escogido"
            .map((desc, index) => {
                const clave = claves[desc];
                const lbrs = parseFloat(pilon[clave]) || 0;
                const porcentaje = totalLbrs > 0 ? ((lbrs / totalLbrs) * 100).toFixed(2) + "%" : "-";
                return [index + 1, desc, lbrs, porcentaje];
            });

            let librasMojadero = pilon.libras_mojadero;
            let totalEscogido = pilon.total_despalillo;   

            // Cálculo de la diferencia
            let diferencia = totalEscogido - librasMojadero;

            // Cálculo del porcentaje
            let porcentaje = (diferencia / totalEscogido) * 100;
            
            doc.text(`Libras Mojadero: ${pilon.libras_mojadero} lbrs`, 150, 70);
            doc.text(`Libras Despalilladas: ${pilon.total_despalillo} lbrs`, 150, 75); 
            doc.text(`Humedad (%): ${diferencia} lbrs (${porcentaje.toFixed(2)}%)`, 150, 80);  

    doc.autoTable({
        startY: 90,
        head: [columnas],
        body: filas,
        styles: { fontSize: 10, cellPadding: 2 }
    });

          doc.save(`reporte-despalillo-pilon-${pilon.numero_pilon}.pdf`);
      } else {
          alert("No se pudo obtener la información del pilón.");
      }
  } catch (error) {
      alert("Hubo un problema al generar el reporte.");
      console.error("Error:", error);
  }
}

window.onload = loadPilones;
