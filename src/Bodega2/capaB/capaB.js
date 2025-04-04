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
  

const apiUrl = 'https://backendtabacalera-production.up.railway.app/api/bodega2';
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
            <td>${pilon.capa_b_seco_grande}</td>
            <td>${pilon.capa_b_seco_claro_grande}</td>
            <td>${pilon.capa_b_seco_mediana}</td>
            <td>${pilon.capa_b_seco_claro_mediano}</td>
            <td>${pilon.capa_b_viso_grande}</td>
            <td>${pilon.capa_b_viso_mediano}</td>
            <td>${pilon.total_capa_b}</td>
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
    const url = `../actualizarProceso/actualizarProceso.html?id=${idPilon}`;
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
        doc.text("RENDIMIENTO Finca El Benque, Gran Jamastran", 50, 25);
        doc.text("RENDIMIENTO", 90, 35);

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
        const descripciones = [
            "Capa A Seco Grande",
            "Capa A Seco Claro Grande",
            "Capa A Seco Mediana",
            "Capa A Viso",
            "Capa B Seco Grande",
            "Capa B Seco Claro Grande",
            "Capa B Seco Mediana",
            "Capa B Seco Claro Mediano",
            "Capa B Viso Grande",
            "Capa B Viso Mediano",
            "Banda Seco Grande",
            "Banda Seco Claro Grande",
            "Banda Seco Mediano",
            "Banda Seco Claro Mediano",
            "Banda Viso Grande",
            "Tripa en Rama",
            "Picadura Larga",
            "Picadura",
            "Total Escogido"
        ];
    
        // Mapeo de claves del JSON con sus descripciones
        const claves = {
            "Capa A Seco Grande": "capa_a_seco_grande",
            "Capa A Seco Claro Grande": "capa_a_seco_claro_grande",
            "Capa A Seco Mediana": "capa_a_seco_mediana",
            "Capa A Viso": "capa_a_viso",
            "Capa B Seco Grande": "capa_b_seco_grande",
            "Capa B Seco Claro Grande": "capa_b_seco_claro_grande",
            "Capa B Seco Mediana": "capa_b_seco_mediana",
            "Capa B Seco Claro Mediano": "capa_b_seco_claro_mediano",
            "Capa B Viso Grande": "capa_b_viso_grande",
            "Capa B Viso Mediano": "capa_b_viso_mediano",
            "Banda Seco Grande": "banda_seco_grande",
            "Banda Seco Claro Grande": "banda_seco_claro_grande",
            "Banda Seco Mediano": "banda_seco_mediano",
            "Banda Seco Claro Mediano": "banda_seco_claro_mediano",
            "Banda Viso Grande": "banda_viso_grande",
            "Tripa en Rama": "tripa_en_rama",
            "Picadura Larga": "picadura_larga",
            "Picadura": "picadura",
            "Total Escogido": "total_escogido"
        };
    
        const totalLbrs = descripciones.reduce((sum, desc) => {
            if (desc !== "Total Escogido") {
                const clave = claves[desc];
                return sum + (parseFloat(pilon[clave]) || 0);
            }
            return sum;
        }, 0);
        
        // Crear la tabla con las descripciones fijas y sus valores de LBRS
        const columnas = ["N°", "DESCRIPCIÓN", "LBRS", "%"];
        const filas = descripciones.filter(desc => desc !== "Total Escogido")
            .map((desc, index) => {
                const clave = claves[desc];
                const lbrs = parseFloat(pilon[clave]) || 0;
                const porcentaje = totalLbrs > 0 ? ((lbrs / totalLbrs) * 100).toFixed(2) + "%" : "-";
                return [index + 1, desc, lbrs, porcentaje];
            });

            let librasMojadero = pilon.libras_mojadero;
            let totalEscogido = pilon.total_escogido;   

            // Cálculo de la diferencia
            let diferencia = totalEscogido - librasMojadero;

            // Cálculo del porcentaje
            let porcentaje = (diferencia / totalEscogido) * 100;
            
            doc.text(`Libras Mojadero: ${pilon.libras_mojadero} lbrs (100%)`, 150, 70);
            doc.text(`Libras Totales: ${pilon.total_escogido} lbrs (100%)`, 150, 75); 
            doc.text(`Humedad (%): ${diferencia} lbrs (${porcentaje.toFixed(2)}%)`, 150, 80);    

    doc.autoTable({
        startY: 90,
        head: [columnas],
        body: filas,
        styles: { fontSize: 10, cellPadding: 2 }
    });

          doc.save(`reporte-rendimiento-pilon-${pilon.numero_pilon}.pdf`);
      } else {
          alert("No se pudo obtener la información del pilón.");
      }
  } catch (error) {
      alert("Hubo un problema al generar el reporte.");
      console.error("Error:", error);
  }
}

window.onload = loadPilones;
