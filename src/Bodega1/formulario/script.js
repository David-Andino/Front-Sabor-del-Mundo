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
let cajas = [];
let totalCajas = 0;
let cajaActual = 0;

// Referencias a elementos del DOM
const modalCajas = document.getElementById("modalCajas");
const numeroCajaActualElement = document.getElementById("numeroCajaActual");
const numeroTotalCajas = document.getElementById("totalCajas");
const pesoCajaInput = document.getElementById("pesoCaja");

document.getElementById("calcularBtn").addEventListener("click", function () {
  let pesoBruto = parseFloat(document.getElementById("pesoBruto").value);

  if (!isNaN(pesoBruto) && pesoBruto > 0) {
    let merma = pesoBruto * 0.10;
    let librasNetas = pesoBruto - merma;

    document.getElementById("merma").value = merma.toFixed(2);
    document.getElementById("librasNetas").value = librasNetas.toFixed(2);
  } else {
    alert("Ingrese un valor válido para el Peso Bruto.");
  }
});

// Registrar datos del pilón
document.getElementById("registrarPilon").addEventListener("click", () => {

  // Capturar datos del formulario
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
    numero_cajas: document.getElementById("numeroCajas").value,
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
  pilonData = { ...formData, cajas: [] };
  totalCajas = parseInt(formData.numero_cajas, 10);
  cajaActual = 1;
  abrirModalCajas();
});

// Abrir modal para capturar cajas
function abrirModalCajas() {
  document.getElementById("pesoCaja").value = "";
  numeroTotalCajas.textContent = totalCajas;
  if (numeroCajaActualElement) {
    numeroCajaActualElement.textContent = cajaActual;
    //cajastotales.textContent = totalCajas;
    modalCajas.style.display = "block";
  } else {
    console.error("El elemento 'numeroCajaActual' no existe en el DOM.");
  }
}

// Guardar datos de cada caja
document.getElementById("agregarCajaBtn").addEventListener("click", () => {
  const pesoCaja = pesoCajaInput.value;

  if (!pesoCaja) {
    alert("El peso de la caja es obligatorio.");
    return;
  }

  // Guardar caja en el array
  cajas.push({ numero_caja: cajaActual, peso_libras: parseFloat(pesoCaja) });
  cajaActual++;

  if (cajaActual > totalCajas) {
    closeModal();
    enviarDatos();
  } else {
    abrirModalCajas();
  }
});

// Enviar datos al backend
function enviarDatos() {
  pilonData.cajas = cajas;

  fetch("https://backendtabacalera-production.up.railway.app/api/pilones", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pilonData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al guardar el pilón.");
      }
      return response.json();
    })
    .then((data) => {
      alert("Pilón registrado exitosamente.");
      console.log(data);
      // Resetear datos
      resetFormulario();
    })
    .catch((error) => {
      console.error(error);
      alert(error.message);
    });
}

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

document.getElementById("cancelarBtn").addEventListener("click", function () {

    window.location.href = "../index.html";
 
});