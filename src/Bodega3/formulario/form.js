function verificarAutenticacion() {
  const token = localStorage.getItem('authToken');

  if (!token) {
      // Si no hay token, redirigir al login
      window.location.href = '../../../login.html';
      return;
  }

  // Verificar el token con el backend
  fetch('http://localhost:4000/api/auth/verify-token', {
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
        document.getElementById("numero_pilon").value = data.numero_pilon;
        document.getElementById("fecha").value = data.fecha_creacion.split('T')[0];
        document.getElementById("corte").value = data.corte;
        document.getElementById("etapa").value = data.etapa;
        document.getElementById("variedad").value = data.variedad;
        document.getElementById("peso_bruto").value = data.peso_bruto;
        document.getElementById("merma").value = data.merma;
        document.getElementById("peso_neto").value = data.libras_netas;
  
        // Guardar los datos en una variable global para uso posterior
        pilonData = data;
      })
      .catch((error) => {
        console.error(error);
        alert("Hubo un error al cargar los datos del pilón.");
      });
  });
  

  document.getElementById('calcularBtn').addEventListener('click', function () {
    // Sección Tripa A
    let tripaSecoGrandeA = parseFloat(document.getElementById('tripa_desp_seco_grande_a').value) || 0;
    let tripaSecoMedianaA = parseFloat(document.getElementById('tripa_desp_seco_mediana_a').value) || 0;
    let tripaSecoPequenoA = parseFloat(document.getElementById('tripa_desp_seco_pequeno_a').value) || 0;

    // Total Tripa Seco A
    let totalTripaSecoA = tripaSecoGrandeA + tripaSecoMedianaA + tripaSecoPequenoA;
    document.getElementById('total_tripa_seco_a').value = totalTripaSecoA.toFixed(2);

    let tripaVisoGrandeA = parseFloat(document.getElementById('tripa_desp_viso_grande_a').value) || 0;
    let tripaVisoMedianaA = parseFloat(document.getElementById('tripa_desp_viso_mediana_a').value) || 0;
    let tripaVisoPequenoA = parseFloat(document.getElementById('tripa_desp_viso_pequeno_a').value) || 0;

    // Total Tripa Viso A
    let totalTripaVisoA = tripaVisoGrandeA + tripaVisoMedianaA + tripaVisoPequenoA;
    document.getElementById('total_tripa_viso_a').value = totalTripaVisoA.toFixed(2);

    let tripaLigeroGrandeA = parseFloat(document.getElementById('tripa_desp_ligero_grande_a').value) || 0;
    let tripaLigeroMedianaA = parseFloat(document.getElementById('tripa_desp_ligero_mediana_a').value) || 0;
    let tripaLigeroPequenoA = parseFloat(document.getElementById('tripa_desp_ligero_pequeno_a').value) || 0;

    // Total Tripa Ligero A
    let totalTripaLigeroA = tripaLigeroGrandeA + tripaLigeroMedianaA + tripaLigeroPequenoA;
    document.getElementById('total_tripa_ligero_a').value = totalTripaLigeroA.toFixed(2);

    // Sección Capa y Banda
    let capaBSecoGrande = parseFloat(document.getElementById('capa_b_seco_grande').value) || 0;
    let bandaSecoGrande = parseFloat(document.getElementById('banda_seco_grande').value) || 0;
    let bandaSecoMediana = parseFloat(document.getElementById('banda_seco_mediana').value) || 0;
    let bandaSecoPequena = parseFloat(document.getElementById('banda_seco_pequena').value) || 0;
    let bandaVisoGrande = parseFloat(document.getElementById('banda_viso_grande').value) || 0;

    // Total Capa B Grande
    let totalCapaBGrande = capaBSecoGrande;
    document.getElementById('total_capa_b_grande').value = totalCapaBGrande.toFixed(2);

    // Total Banda
    let totalBanda = bandaSecoGrande + bandaSecoMediana + bandaSecoPequena + bandaVisoGrande;
    document.getElementById('total_banda').value = totalBanda.toFixed(2);

    // Sección Tripa B
    let tripaSecoGrandeB = parseFloat(document.getElementById('tripa_desp_seco_grande_b').value) || 0;
    let tripaSecoMedianaB = parseFloat(document.getElementById('tripa_desp_seco_mediana_b').value) || 0;
    let tripaSecoPequenoB = parseFloat(document.getElementById('tripa_desp_seco_pequeno_b').value) || 0;

    // Total Tripa Seco B
    let totalTripaSecoB = tripaSecoGrandeB + tripaSecoMedianaB + tripaSecoPequenoB;
    document.getElementById('total_tripa_seco_b').value = totalTripaSecoB.toFixed(2);

    let tripaVisoGrandeB = parseFloat(document.getElementById('tripa_desp_viso_grande_b').value) || 0;
    let tripaVisoGrandeBPelotoso = parseFloat(document.getElementById('tripa_desp_viso_grande_b_pelotoso').value) || 0;
    let tripaVisoMedianaB = parseFloat(document.getElementById('tripa_desp_viso_mediana_b').value) || 0;
    let tripaVisoMedianaBPelotoso = parseFloat(document.getElementById('tripa_desp_viso_mediana_b_pelotoso').value) || 0;
    let tripaVisoPequenoB = parseFloat(document.getElementById('tripa_desp_viso_pequeno_b').value) || 0;

    // Total Tripa Viso B
    let totalTripaVisoB = tripaVisoGrandeB + tripaVisoGrandeBPelotoso + tripaVisoMedianaB + tripaVisoMedianaBPelotoso + tripaVisoPequenoB;
    document.getElementById('total_tripa_viso_b').value = totalTripaVisoB.toFixed(2);

    let tripaLigeroGrandeB = parseFloat(document.getElementById('tripa_desp_ligero_grande_b').value) || 0;
    let tripaLigeroGrandeBPelotoso = parseFloat(document.getElementById('tripa_desp_ligero_grande_b_pelotoso').value) || 0;
    let tripaLigeroMedianoB = parseFloat(document.getElementById('tripa_desp_ligero_mediano_b').value) || 0;
    let tripaLigeroMedianoBPelotoso = parseFloat(document.getElementById('tripa_desp_ligero_mediano_b_pelotoso').value) || 0;
    let tripaLigeroPequenoB = parseFloat(document.getElementById('tripa_desp_ligero_pequeno_b').value) || 0;

    // Total Tripa Ligero B
    let totalTripaLigeroB = tripaLigeroGrandeB + tripaLigeroGrandeBPelotoso + tripaLigeroMedianoB + tripaLigeroMedianoBPelotoso + tripaLigeroPequenoB;
    document.getElementById('total_tripa_ligero_b').value = totalTripaLigeroB.toFixed(2);

    // Sección Otros
    let pelotoso = parseFloat(document.getElementById('pelotoso').value) || 0;
    let picadura = parseFloat(document.getElementById('picadura').value) || 0;
    let vena = parseFloat(document.getElementById('vena').value) || 0;
    let hojasVerdes = parseFloat(document.getElementById('hojas_verdes').value) || 0;

    // Total Despalillo
    let totalDespalillo = totalTripaSecoA + totalTripaVisoA + totalTripaLigeroA +
                          totalCapaBGrande + totalBanda +
                          totalTripaSecoB + totalTripaVisoB + totalTripaLigeroB +
                          pelotoso + picadura + vena + hojasVerdes;
    document.getElementById('total_despalillo').value = totalDespalillo.toFixed(2);
});

  
(function() {
  
  document.getElementById("guardarCambiosPilon").addEventListener("click", () => {

    if (!pilonId) {
        alert("ID de pilón no encontrado.");
        return;
      }

    const formData = {
   // Datos generales del pilón
   numero_pilon: parseInt(document.getElementById("numero_pilon").value),
   fecha: document.getElementById("fecha").value,
   corte: document.getElementById("corte").value,
   etapa: document.getElementById("etapa").value,
   variedad: document.getElementById("variedad").value,
   peso_bruto: parseFloat(document.getElementById("peso_bruto").value),
   merma: parseFloat(document.getElementById("merma").value),
   peso_neto: parseFloat(document.getElementById("peso_neto").value),
   libras_mojadero: parseFloat(document.getElementById("libras_mojadero").value),

   // Sección Tripa A
   tripa_desp_seco_grande_a: parseFloat(document.getElementById("tripa_desp_seco_grande_a").value),
   tripa_desp_seco_mediana_a: parseFloat(document.getElementById("tripa_desp_seco_mediana_a").value),
   tripa_desp_seco_pequeno_a: parseFloat(document.getElementById("tripa_desp_seco_pequeno_a").value),
   total_tripa_seco_a: parseFloat(document.getElementById("total_tripa_seco_a").value),

   tripa_desp_viso_grande_a: parseFloat(document.getElementById("tripa_desp_viso_grande_a").value),
   tripa_desp_viso_mediana_a: parseFloat(document.getElementById("tripa_desp_viso_mediana_a").value),
   tripa_desp_viso_pequeno_a: parseFloat(document.getElementById("tripa_desp_viso_pequeno_a").value),
   total_tripa_viso_a: parseFloat(document.getElementById("total_tripa_viso_a").value),

   tripa_desp_ligero_grande_a: parseFloat(document.getElementById("tripa_desp_ligero_grande_a").value),
   tripa_desp_ligero_mediana_a: parseFloat(document.getElementById("tripa_desp_ligero_mediana_a").value),
   tripa_desp_ligero_pequeno_a: parseFloat(document.getElementById("tripa_desp_ligero_pequeno_a").value),
   total_tripa_ligero_a: parseFloat(document.getElementById("total_tripa_ligero_a").value),

   // Sección Capa y Banda
   capa_b_seco_grande: parseFloat(document.getElementById("capa_b_seco_grande").value),
   total_capa_b_grande: parseFloat(document.getElementById("total_capa_b_grande").value),

   banda_seco_grande: parseFloat(document.getElementById("banda_seco_grande").value),
   banda_seco_mediana: parseFloat(document.getElementById("banda_seco_mediana").value),
   banda_seco_pequena: parseFloat(document.getElementById("banda_seco_pequena").value),
   banda_viso_grande: parseFloat(document.getElementById("banda_viso_grande").value),
   total_banda: parseFloat(document.getElementById("total_banda").value),

   // Sección Tripa B
   tripa_desp_seco_grande_b: parseFloat(document.getElementById("tripa_desp_seco_grande_b").value),
   tripa_desp_seco_mediana_b: parseFloat(document.getElementById("tripa_desp_seco_mediana_b").value),
   tripa_desp_seco_pequeno_b: parseFloat(document.getElementById("tripa_desp_seco_pequeno_b").value),
   total_tripa_seco_b: parseFloat(document.getElementById("total_tripa_seco_b").value),

   tripa_desp_viso_grande_b: parseFloat(document.getElementById("tripa_desp_viso_grande_b").value),
   tripa_desp_viso_grande_b_pelotoso: parseFloat(document.getElementById("tripa_desp_viso_grande_b_pelotoso").value),
   tripa_desp_viso_mediana_b: parseFloat(document.getElementById("tripa_desp_viso_mediana_b").value),
   tripa_desp_viso_mediana_b_pelotoso: parseFloat(document.getElementById("tripa_desp_viso_mediana_b_pelotoso").value),
   tripa_desp_viso_pequeno_b: parseFloat(document.getElementById("tripa_desp_viso_pequeno_b").value),
   total_tripa_viso_b: parseFloat(document.getElementById("total_tripa_viso_b").value),

   tripa_desp_ligero_grande_b: parseFloat(document.getElementById("tripa_desp_ligero_grande_b").value),
   tripa_desp_ligero_grande_b_pelotoso: parseFloat(document.getElementById("tripa_desp_ligero_grande_b_pelotoso").value),
   tripa_desp_ligero_mediano_b: parseFloat(document.getElementById("tripa_desp_ligero_mediano_b").value),
   tripa_desp_ligero_mediano_b_pelotoso: parseFloat(document.getElementById("tripa_desp_ligero_mediano_b_pelotoso").value),
   tripa_desp_ligero_pequeno_b: parseFloat(document.getElementById("tripa_desp_ligero_pequeno_b").value),
   total_tripa_ligero_b: parseFloat(document.getElementById("total_tripa_ligero_b").value),

   // Sección Otros
   pelotoso: parseFloat(document.getElementById("pelotoso").value),
   picadura: parseFloat(document.getElementById("picadura").value),
   vena: parseFloat(document.getElementById("vena").value),
   hojas_verdes: parseFloat(document.getElementById("hojas_verdes").value),
   total_despalillo: parseFloat(document.getElementById("total_despalillo").value),

   pilon_id: parseInt(pilonId),
    };



    // Validaciones básicas
    if (Object.values(formData).some((value) => !value)) {
      alert("Todos los campos son obligatorios.");
      return;
    }
      

    // Guardar datos del pilón 
    pilonData = { ...formData };

    enviarDatos();
  });

  function enviarDatos() {
    fetch(`https://backendtabacalera-production.up.railway.app/api/bodega3`, {
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
        if (data.message === 'Registro creado en la Bodega #3') {
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