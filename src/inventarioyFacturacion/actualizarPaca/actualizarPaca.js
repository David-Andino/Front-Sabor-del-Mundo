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

    if (!pilonId) {
      alert("ID de la Paca no encontrado.");
      return;
    }

    document.getElementById("calcularBtn").addEventListener("click", function () {
        let pesoBruto = parseFloat(document.getElementById("pesoBruto").value);
        let tara = parseFloat(document.getElementById("Tara").value);
        if (!isNaN(pesoBruto) && pesoBruto > 0) {
          let librasNetas = pesoBruto - tara;
      
          document.getElementById("librasNetas").value = librasNetas.toFixed(2);
        } else {
          alert("Ingrese un valor válido para el Peso Bruto.");
        }
      });
  
    // Cargar los datos de la Paca desde la API
    fetch(`https://backendtabacalera-production.up.railway.app/api/pacas/${pilonId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        // Precargar datos en los campos del formulario de edición
        document.getElementById("numeroPilon").value = data.numero_paca;
        document.getElementById("tipo").value = data.tipo;
        document.getElementById("fechaCreacion").value = data.fecha.split('T')[0];
        document.getElementById("Tara").value = data.tara;
        document.getElementById("cosecha").value = data.cosecha;
        document.getElementById("pesoBruto").value = data.peso_bruto;
        document.getElementById("librasNetas").value = data.peso_neto;
  
        // Guardar los datos en una variable global para uso posterior
        pilonData = data;
      })
      .catch((error) => {
        console.error(error);
        alert("Hubo un error al cargar los datos de la Paca.");
      });
  });
  
(function() {
  document.getElementById("registrarPilon").addEventListener("click", () => {
    pilonData = {
      numero_paca: document.getElementById("numeroPilon").value,
      tipo: document.getElementById("tipo").value,
      fecha: document.getElementById("fechaCreacion").value,
      tara: document.getElementById("Tara").value,
      cosecha: document.getElementById("cosecha").value,
      peso_bruto: document.getElementById("pesoBruto").value,
      peso_neto: document.getElementById("librasNetas").value,
    };

    // Validaciones básicas
    if (Object.values(pilonData).some((value) => !value)) {
      alert("Todos los campos son obligatorios.");
      return;
    }
    enviarDatos(pilonData);
  });

  function enviarDatos(pilonData) {
    fetch(`https://backendtabacalera-production.up.railway.app/api/pacas/${pilonId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pilonData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al actualizar la Paca.");
        }
        return response.json();
      })
      .then((data) => {
        alert("Paca actualizada exitosamente.");
        window.location.href = "../pacas.html"; // Redirigir de nuevo a la lista de pilones
      })
      .catch((error) => {
        console.error(error);
        alert("Error al actualizar la Paca.");
      });
  }
})();
  
  // Resetear el formulario y datos
  function resetFormulario() {
    pilonData = {};
    document.getElementById("pilonForm").reset();
  }
  
  document.getElementById("cancelarBtn").addEventListener("click", function () {
    // Mostrar una alerta de confirmación
    const confirmacion = confirm("¿Estás seguro de que quieres cancelar? Se perderán los cambios.");
  
    if (confirmacion) {
      // Si el usuario confirma, redirigir a la página principal
      window.location.href = "../pacas.html";
    } else {
      // Si el usuario cancela, no hacer nada
      console.log("Cancelación de la actualización cancelada.");
    }
  });