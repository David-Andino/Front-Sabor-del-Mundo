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
        document.getElementById("variedad").value = data.variedad;
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
  

  document.getElementById('calcularBtn').addEventListener('click', function () {
    // Capa A
    let capaASecoGrande = parseFloat(document.getElementById('capa_a_seco_grande').value) || 0;
    let capaASecoClaroGrande = parseFloat(document.getElementById('capa_a_seco_claro_grande').value) || 0;
    let capaASecoMediana = parseFloat(document.getElementById('capa_a_seco_mediana').value) || 0;
    let capaAViso = parseFloat(document.getElementById('capa_a_viso').value) || 0;

    // Total Capa A
    let totalCapaA = capaASecoGrande + capaASecoClaroGrande + capaASecoMediana + capaAViso;
    document.getElementById('total_capa_a').value = totalCapaA;

    // Capa B
    let capaBSecoGrande = parseFloat(document.getElementById('capa_b_seco_grande').value) || 0;
    let capaBSecoClaroGrande = parseFloat(document.getElementById('capa_b_seco_claro_grande').value) || 0;
    let capaBSecoMediano = parseFloat(document.getElementById('capa_b_mediano').value) || 0;
    let capaBSecoClaroMediano = parseFloat(document.getElementById('capa_b_seco_claro_mediano').value) || 0;
    let capaBVisoGrande = parseFloat(document.getElementById('capa_b_viso_grande').value) || 0;
    let capaBVisoMediano = parseFloat(document.getElementById('capa_b_viso_mediano').value) || 0;

    // Total Capa B
    let totalCapaB = capaBSecoGrande + capaBSecoClaroGrande + capaBSecoMediano + capaBSecoClaroMediano + capaBVisoGrande + capaBVisoMediano;
    document.getElementById('total_capa_b').value = totalCapaB;

    // Banda
    let bandaSecoGrande = parseFloat(document.getElementById('banda_seco_grande').value) || 0;
    let bandaSecoClaroGrande = parseFloat(document.getElementById('banda_seco_claro_grande').value) || 0;
    let bandaSecoMediano = parseFloat(document.getElementById('banda_seco_mediano').value) || 0;
    let bandaSecoClaroMediano = parseFloat(document.getElementById('banda_seco_claro_mediano').value) || 0;
    let bandaVisoGrande = parseFloat(document.getElementById('banda_viso_grande').value) || 0;

    // Total Banda
    let totalBanda = bandaSecoGrande + bandaSecoClaroGrande + bandaSecoMediano + bandaSecoClaroMediano + bandaVisoGrande;
    document.getElementById('total_banda').value = totalBanda;

    // Tripa en Rama, Picadura Larga, Picadura
    let tripaEnRama = parseFloat(document.getElementById('tripa_en_rama').value) || 0;
    let picaduraLarga = parseFloat(document.getElementById('picadura_larga').value) || 0;
    let picadura = parseFloat(document.getElementById('picadura').value) || 0;

    // Total Escogido
    let totalEscogido = totalCapaA + totalCapaB + totalBanda + tripaEnRama + picaduraLarga + picadura;
    document.getElementById('total_escogido').value = totalEscogido;
});

  
(function() {
  
  document.getElementById("guardarCambiosPilon").addEventListener("click", () => {

    if (!pilonId) {
        alert("ID de pilón no encontrado.");
        return;
      }

    const formData = {
      // Datos generales del pilón
    numero_pilon: parseInt(document.getElementById("numeroPilon").value),
    fecha: document.getElementById("fechaCreacion").value,
    corte: document.getElementById("corte").value,
    etapa: document.getElementById("etapa").value,
    variedad: document.getElementById("variedad").value,
    peso_bruto: parseFloat(document.getElementById("pesoBruto").value),
    merma: parseFloat(document.getElementById("merma").value),
    peso_neto: parseFloat(document.getElementById("librasNetas").value),
    libras_mojadero: parseFloat(document.getElementById("librasMojadero").value),

  // Campos adicionales de Bodega #2
    capa_a_seco_grande: parseFloat(document.getElementById("capa_a_seco_grande").value) || 0,
    capa_a_seco_claro_grande: parseFloat(document.getElementById("capa_a_seco_claro_grande").value) || 0,
    capa_a_seco_mediana: parseFloat(document.getElementById("capa_a_seco_mediana").value) || 0,
    capa_a_viso: parseFloat(document.getElementById("capa_a_viso").value) || 0,
    total_capa_a: parseFloat(document.getElementById("total_capa_a").value) || 0,

    capa_b_seco_grande: parseFloat(document.getElementById("capa_b_seco_grande").value) || 0,
    capa_b_seco_claro_grande: parseFloat(document.getElementById("capa_b_seco_claro_grande").value) || 0,
    capa_b_seco_mediana: parseFloat(document.getElementById("capa_b_mediano").value) || 0,
    capa_b_seco_claro_mediano: parseFloat(document.getElementById("capa_b_seco_claro_mediano").value) || 0,
    capa_b_viso_grande: parseFloat(document.getElementById("capa_b_viso_grande").value) || 0,
    capa_b_viso_mediano: parseFloat(document.getElementById("capa_b_viso_mediano").value) || 0,
    total_capa_b: parseFloat(document.getElementById("total_capa_b").value) || 0,

    banda_seco_grande: parseFloat(document.getElementById("banda_seco_grande").value) || 0,
    banda_seco_claro_grande: parseFloat(document.getElementById("banda_seco_claro_grande").value) || 0,
    banda_seco_mediano: parseFloat(document.getElementById("banda_seco_mediano").value) || 0,
    banda_seco_claro_mediano: parseFloat(document.getElementById("banda_seco_claro_mediano").value) || 0,
    banda_viso_grande: parseFloat(document.getElementById("banda_viso_grande").value) || 0,
    total_banda: parseFloat(document.getElementById("total_banda").value) || 0,

    tripa_en_rama: parseFloat(document.getElementById("tripa_en_rama").value) || 0,
    picadura_larga: parseFloat(document.getElementById("picadura_larga").value) || 0,
    picadura: parseFloat(document.getElementById("picadura").value) || 0,

  // Total Escogido
    total_escogido: parseFloat(document.getElementById("total_escogido").value) || 0,

    pilon_id: parseInt(pilonId)
    };



    // Validaciones básicas
    if (Object.values(formData).some((value) => value === "" || value === null || value === undefined)) {
        alert("Todos los campos son obligatorios.");
        return;
      }
      

    // Guardar datos del pilón 
    pilonData = { ...formData };

    enviarDatos();
  });

  function enviarDatos() {
    fetch(`https://backendtabacalera-production.up.railway.app/api/bodega2`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pilonData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            // Extraemos el mensaje de error
            throw new Error(error.message || "Error al generar proceso.");
          });
        }
        return response.json();
      })
      .then((data) => {
        alert(data.message);  // Aquí mostramos el mensaje del backend
        if (data.message === 'Registro creado en la Bodega #2') {
          // Si la operación fue exitosa, redirigimos o limpiamos el formulario.
          window.location.href = "../escogerPilon.html";
          resetFormulario();
        }
      })
      .catch((error) => {
        // En caso de error, mostramos el mensaje
        console.error(error);
        alert(error.message);
      });
  }
  
  
  
})();
  
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
      window.location.href = "../escogerPilon.html";
    } else {
      // Si el usuario cancela, no hacer nada
      console.log("Cancelación de la actualización cancelada.");
    }
  });