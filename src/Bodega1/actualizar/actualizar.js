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


// Obtener el ID del pilón desde la URL
const urlParams = new URLSearchParams(window.location.search);
const pilonId = urlParams.get('id');
document.addEventListener("DOMContentLoaded", () => {
    
    
    // Declarar las variables globales
    let pilonData = {}; // Variable global para los datos del pilón
    let cajas = []; // Lista global de cajas
    let totalCajas = 0; // Total de cajas
    let cajaActual = 1; // Caja actual
    

    if (!pilonId) {
      alert("ID de pilón no encontrado.");
      return;
    }
  
    // Cargar los datos del pilón desde la API
    fetch(`https://backendtabacalera-production.up.railway.app/api/pilones/${pilonId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        // Precargar datos en los campos del formulario de edición
        document.getElementById("numeroPilon").value = data.numero_pilon;
        document.getElementById("fechaCreacion").value = data.fecha_creacion.split('T')[0];
        document.getElementById("corte").value = data.corte;
        document.getElementById("etapa").value = data.etapa;
        document.getElementById("descripcion").value = data.descripcion;
        document.getElementById("nombreFinca").value = data.nombre_finca;
        document.getElementById("variedad").value = data.variedad;
        document.getElementById("numeroViaje").value = data.numero_viaje;
        document.getElementById("observacion").value = data.observacion;
        document.getElementById("numeroCajas").value = data.numero_cajas;
        document.getElementById("pesoBruto").value = data.peso_bruto;
        document.getElementById("merma").value = data.merma;
        document.getElementById("librasNetas").value = data.libras_netas;
  
        // Guardar los datos en una variable global para uso posterior
        pilonData = data;
      })
      .catch((error) => {
        console.error(error);
        alert("Hubo un error al cargar los datos del pilón.");
      });
  });
  
(function() {
  const numeroCajaActualactElement = document.getElementById("numeroCajaActualact");
  const numeroTotalCajas = document.getElementById("totalCajas");
  const modalCajas = document.getElementById("modalCajas");
  const pesoCajaInput = document.getElementById("pesoCaja1");
  
  document.getElementById("guardarCambiosPilon").addEventListener("click", () => {
    const formData = {
      numero_pilon: document.getElementById("numeroPilon").value,
      fecha_creacion: document.getElementById("fechaCreacion").value,
      corte: document.getElementById("corte").value,
      etapa: document.getElementById("etapa").value,
      descripcion: document.getElementById("descripcion").value,
      nombre_finca: document.getElementById("nombreFinca").value,
      variedad: document.getElementById("variedad").value,
      numero_viaje: document.getElementById("numeroViaje").value,
      observacion: document.getElementById("observacion").value,
      numero_cajas: parseInt(document.getElementById("numeroCajas").value, 10),
      peso_bruto: document.getElementById("pesoBruto").value,
      merma: document.getElementById("merma").value,
      libras_netas: document.getElementById("librasNetas").value,
    };

    // Validaciones básicas
    if (Object.values(formData).some((value) => !value)) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    // Guardar datos del pilón y preparar captura de cajas
    let pilonData = { ...formData, cajas: [] };
    let totalCajas = parseInt(formData.numero_cajas, 10);
    let cajaActual = 1;
    abrirModalCajasactu();

    // Abrir modal para capturar cajas
    function abrirModalCajasactu() {
      numeroTotalCajas.textContent = totalCajas;
      if (numeroCajaActualactElement && modalCajas) {
        numeroCajaActualactElement.textContent = cajaActual;
        modalCajas.style.display = "block";
      } else {
        console.error("numeroCajaActualactElement o modalCajas no están definidos.");
      }
    }

    // Guardar datos de cada caja
    document.getElementById("actualizarCajaBtn").addEventListener("click", () => {
      const pesoCaja = pesoCajaInput.value;

      if (!pesoCaja) {
        alert("El peso de la caja es obligatorio.");
        return;
      }

      // Guardar caja en el array
      pilonData.cajas.push({ numero_caja: cajaActual, peso_libras: parseFloat(pesoCaja) });
      cajaActual++;

      if (cajaActual > totalCajas) {
        closeModal();
        enviarDatos(pilonData);
      } else {
        numeroCajaActualactElement.textContent = cajaActual;
        pesoCajaInput.value = '';
      }
    });
  });

  function enviarDatos(pilonData) {
    fetch(`https://backendtabacalera-production.up.railway.app/api/pilones/${pilonId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pilonData), // Aquí debes enviar los datos completos, incluidas las cajas
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al actualizar el pilón.");
        }
        return response.json();
      })
      .then((data) => {
        alert("Pilón actualizado exitosamente.");
        window.location.href = "../index.html"; // Redirigir de nuevo a la lista de pilones
      })
      .catch((error) => {
        console.error(error);
        alert("Error al actualizar el pilón.");
      });
  }
})();
  
  // Cerrar el modal
  function closeModal() {
    const modal = document.getElementById('modalCajas');
    if (modal) {
      modal.style.display = 'none'; // Cambia la visibilidad del modal
    } else {
      console.error('El elemento modal no fue encontrado.');
    }
  }
  
  // Resetear el formulario y datos
  function resetFormulario() {
    pilonData = {};
    cajas = [];
    totalCajas = 0;
    cajaActual = 0;
    document.getElementById("pilonForm").reset();
  }
  
  document.getElementById("cancelarActualizacion").addEventListener("click", function () {
    // Mostrar una alerta de confirmación
    const confirmacion = confirm("¿Estás seguro de que quieres cancelar? Se perderán los cambios.");
  
    if (confirmacion) {
      // Si el usuario confirma, redirigir a la página principal
      window.location.href = "../index.html";
    } else {
      // Si el usuario cancela, no hacer nada
      console.log("Cancelación de la actualización cancelada.");
    }
  });