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


// Variables globales
let pilonData = {};


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

// Registrar datos del pilón
document.getElementById("registrarPilon").addEventListener("click", () => {

  // Capturar datos del formulario
  pilonData = {
    numero_paca: document.getElementById("numeroPilon").value,
    tipo: document.getElementById("tipo").value,
    fecha: document.getElementById("fechaCreacion").value,
    tara: document.getElementById("Tara").value,
    cosecha: document.getElementById("cosecha").value,
    peso_bruto: document.getElementById("pesoBruto").value,
    peso_neto: document.getElementById("librasNetas").value
  };

  // Validaciones básicas
  if (Object.values(pilonData).some((value) => !value)) {
    alert("Todos los campos son obligatorios.");
    return;
  }
  enviarDatos();
});

// Enviar datos al backend
function enviarDatos() {
  fetch("https://backendtabacalera-production.up.railway.app/api/pacas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pilonData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al guardar la paca.");
      }
      return response.json();
    })
    .then((data) => {
      alert("Paca registrada exitosamente.");
      console.log(data);
      // Resetear datos
      resetFormulario();
    })
    .catch((error) => {
      console.error(error);
      alert(error.message);
    });
}


// Resetear el formulario y datos
function resetFormulario() {
  pilonData = {};
  document.getElementById("pilonForm").reset(); 
}

document.getElementById("cancelarBtn").addEventListener("click", function () {

    window.location.href = "../pacas.html";
 
});