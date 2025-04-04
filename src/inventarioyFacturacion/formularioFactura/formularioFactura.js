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


document.addEventListener("DOMContentLoaded", function() {
    const isv15Checkbox = document.getElementById("isv15");
    const isv18Checkbox = document.getElementById("isv18");
    const gravado15Checkbox = document.getElementById("gravado15");
    const gravado18Checkbox = document.getElementById("gravado18");
  
    // Validación para ISV 
    isv15Checkbox.addEventListener("change", function() {
      if (isv15Checkbox.checked) {
        isv18Checkbox.checked = false; // Deseleccionar ISV 18%
      }
    });
  
    isv18Checkbox.addEventListener("change", function() {
      if (isv18Checkbox.checked) {
        isv15Checkbox.checked = false; // Deseleccionar ISV 15%
      }
    });
  
    // Validación para Importes Gravados
    gravado15Checkbox.addEventListener("change", function() {
      if (gravado15Checkbox.checked) {
        gravado18Checkbox.checked = false; // Deseleccionar Gravado 18%
      }
    });
  
    gravado18Checkbox.addEventListener("change", function() {
      if (gravado18Checkbox.checked) {
        gravado15Checkbox.checked = false; // Deseleccionar Gravado 15%
      }
    });
  });

document.addEventListener("DOMContentLoaded", async () => {
      
    // Botón que abre el modal
    const calcularBtn = document.getElementById("seleccionarBtn");
    calcularBtn.addEventListener("click", showPacasModal);
  
    async function showPacasModal() {
        try {
          // Solicitar las pacas al backend
          const response = await fetch("https://backendtabacalera-production.up.railway.app/api/pacas/");
          if (!response.ok) throw new Error("Error al obtener las pacas");
    
          const pacas = await response.json();
          populatePacasTable(pacas); // Llamar función para mostrar las pacas en la tabla
          document.getElementById("modalCajas").style.display = "block"; // Mostrar el modal
        } catch (error) {
          console.error("Error al mostrar las pacas:", error);
        }
      }
    
      function populatePacasTable(pacas) {
        const pacasTable = document.getElementById("pacasTableBody");
        pacasTable.innerHTML = ""; // Limpiar la tabla antes de llenarla
    
        pacas.forEach((paca) => {
            const row = document.createElement("tr");
    
            // Columna de checkbox
            const checkboxCell = document.createElement("td");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.dataset.pacaId = paca.id; // Asignar el ID de la paca para identificarla
            checkboxCell.appendChild(checkbox);
            row.appendChild(checkboxCell);
    
            // Otras columnas
            const numeroPacaCell = document.createElement("td");
            numeroPacaCell.textContent = paca.numero_paca;
            row.appendChild(numeroPacaCell);
    
            const tipoCell = document.createElement("td");
            tipoCell.textContent = paca.tipo;
            row.appendChild(tipoCell);
    
            const pesoBrutoCell = document.createElement("td");
            pesoBrutoCell.textContent = paca.peso_bruto;
            row.appendChild(pesoBrutoCell);
    
            const pesoNetoCell = document.createElement("td");
            pesoNetoCell.className = "peso-neto";
            pesoNetoCell.textContent = paca.peso_neto;
            row.appendChild(pesoNetoCell);
    
            const precioUnitarioCell = document.createElement("td");
            const precioUnitarioInput = document.createElement("input");
            precioUnitarioInput.type = "number";
            precioUnitarioInput.className = "precio-unitario";
            precioUnitarioInput.min = "0";
            precioUnitarioInput.value = "0";
            precioUnitarioInput.disabled = true;
            precioUnitarioCell.appendChild(precioUnitarioInput);
            row.appendChild(precioUnitarioCell);
    
            const descuentoCell = document.createElement("td");
            const descuentoInput = document.createElement("input");
            descuentoInput.type = "number";
            descuentoInput.className = "descuento";
            descuentoInput.min = "0";
            descuentoInput.value = "0";
            descuentoInput.disabled = true;
            descuentoCell.appendChild(descuentoInput);
            row.appendChild(descuentoCell);
    
            const totalCell = document.createElement("td");
            totalCell.className = "total";
            totalCell.textContent = "0";
            row.appendChild(totalCell);
    
            pacasTable.appendChild(row);
    
            // Evento para habilitar/deshabilitar los campos según el estado del checkbox
            checkbox.addEventListener("change", function () {
                if (this.checked) {
                    // Habilitar los inputs si el checkbox está marcado
                    precioUnitarioInput.disabled = false;
                    descuentoInput.disabled = false;
                } else {
                    // Deshabilitar los inputs y restablecer su valor si el checkbox está desmarcado
                    precioUnitarioInput.disabled = true;
                    descuentoInput.disabled = true;
                    precioUnitarioInput.value = 0;
                    descuentoInput.value = 0;
                    totalCell.textContent = "0.00";
                }
            });
        });
    }
    });

  document.getElementById("pacasTableBody").addEventListener("input", (event) => {
    if (event.target.classList.contains("precio-unitario") || event.target.classList.contains("descuento")) {
      const row = event.target.closest("tr");
      const precioUnitario = parseFloat(row.querySelector(".precio-unitario").value) || 0;
      const descuento = parseFloat(row.querySelector(".descuento").value) || 0;
      const totalCell = row.querySelector(".total");
      totalCell.textContent = (precioUnitario - descuento).toFixed(2); // Calcular total
    }
  });
  
  document.getElementById("pacasTableBody").addEventListener("input", (event) => {
    if (event.target.classList.contains("precio-unitario") || event.target.classList.contains("descuento")) {
        const row = event.target.closest("tr");

        // Obtener los valores necesarios
        const precioUnitario = parseFloat(row.querySelector(".precio-unitario").value) || 0;
        const pesoNeto = parseFloat(row.querySelector(".peso-neto").textContent) || 0; // Obtener el peso neto
        const descuento = parseFloat(row.querySelector(".descuento").value) || 0;

        // Calcular el total: (precio unitario * peso neto) - descuento
        const total = (precioUnitario * pesoNeto) - descuento;

        // Actualizar la celda de total
        const totalCell = row.querySelector(".total");
        totalCell.textContent = total.toFixed(2); // Mostrar el total con 2 decimales

        // Actualizar el total general
        calculateTotalGeneral();
    }
});

function calculateTotalGeneral() {
  let totalBase = 0;
    
  // Sumar todos los valores de la tabla sin impuestos
  document.querySelectorAll("#pacasTableBody .total").forEach((totalCell) => {
      totalBase += parseFloat(totalCell.textContent) || 0;
  });

  // Guardamos el total antes de impuestos para asignar a Exento/Exonerado
  updateExentoExonerado(totalBase);

  // Calcular importe gravado (si el checkbox está marcado)
  const gravado15 = document.getElementById("gravado15").checked ? totalBase : 0;
  const gravado18 = document.getElementById("gravado18").checked ? totalBase : 0;

  // Calcular ISV sobre el total base
  const isv15 = document.getElementById("isv15").checked ? totalBase * 0.15 : 0;
  const isv18 = document.getElementById("isv18").checked ? totalBase * 0.18 : 0;


  // Total final con impuestos
  const totalFinal = totalBase + isv15 + isv18;

  // Actualizar los spans de importe gravado
  document.getElementById("ImpGravado15").textContent = gravado15.toFixed(2);
  document.getElementById("ImpGravado18").textContent = gravado18.toFixed(2);

  // Actualizar los spans de ISV
  document.getElementById("isv15s").textContent = isv15.toFixed(2);
  document.getElementById("isv18s").textContent = isv18.toFixed(2);

  
  // Actualizar el total de la factura con impuestos
  document.getElementById("totalFactura").textContent = totalFinal.toFixed(2);
}

function updateExentoExonerado(totalBase = 0) {
  const tipoImporte = document.getElementById("tipoImporte").value;
  const exentoInput = document.getElementById("Exento");
  const exoneradoInput = document.getElementById("Exonerado");

  if (!exentoInput || !exoneradoInput) {
      console.error("No se encontraron los inputs ocultos.");
      return;
  }

  // Asignar valores según el tipo de importe seleccionado
  exentoInput.value = tipoImporte === "exento" ? totalBase.toFixed(2) : "0";
  exoneradoInput.value = tipoImporte === "exonerado" ? totalBase.toFixed(2) : "0";

}

document.getElementById("tipoImporte").addEventListener("change", calculateTotalGeneral);


document.querySelectorAll("#isv15, #isv18").forEach((checkbox) => {
    checkbox.addEventListener("change", calculateTotalGeneral);
});
  
  function closeModal() {
    document.getElementById("modalCajas").style.display = "none";
    console.log("Valor de isv15s en el DOM:", document.getElementById('isv15s').textContent);
  }

  document.getElementById("searchPacaInput").addEventListener("input", function (event) {
    const searchValue = event.target.value.toLowerCase();
  
    // Seleccionar todas las filas de la tabla
    const rows = document.querySelectorAll("#pacasTableBody tr");
  
    rows.forEach((row) => {
      const numeroPacaCell = row.cells[1];
      if (numeroPacaCell) {
        const numeroPaca = numeroPacaCell.textContent.toLowerCase();
        if (numeroPaca.includes(searchValue)) {
          row.style.display = ""; // Mostrar si coincide
        } else {
          row.style.display = "none"; // Ocultar si no coincide
        }
      }
    });
  });

  document.getElementById("cancelarBtn").addEventListener("click", function () {

    window.location.href = "../pacas.html";
 
});

document.getElementById('numeroFactura').addEventListener('input', function (e) {
  let input = e.target;
  let value = input.value.replace(/-/g, ''); // Elimina guiones existentes

  // Filtra caracteres no numéricos
  value = value.replace(/\D/g, '');

  // Aplica el formato
  if (value.length > 3) {
      value = value.slice(0, 3) + '-' + value.slice(3);
  }
  if (value.length > 7) {
      value = value.slice(0, 7) + '-' + value.slice(7);
  }
  if (value.length > 10) {
      value = value.slice(0, 10) + '-' + value.slice(10);
  }

  // Limita la longitud total del valor
  if (value.length > 19) {
      value = value.slice(0, 19);
  }

  // Actualiza el valor del input
  input.value = value;
});

document.getElementById('cai').addEventListener('input', function (e) {
  let input = e.target;
  let value = input.value;

  // Convierte todas las letras a mayúsculas
  value = value.toUpperCase();

  // Elimina caracteres no permitidos (solo letras, números y guiones)
  value = value.replace(/[^A-Z0-9-]/g, '');

  // Elimina guiones existentes para reformatear
  let valueWithoutHyphens = value.replace(/-/g, '');

  // Añade guiones automáticamente en las posiciones correctas
  let formattedValue = '';
  for (let i = 0; i < valueWithoutHyphens.length; i++) {
      if (i === 6 || i === 12 || i === 18 || i === 24 || i === 30) {
          formattedValue += '-';
      }
      formattedValue += valueWithoutHyphens[i];
  }

  // Limita la longitud total del valor
  if (formattedValue.length > 37) {
      formattedValue = formattedValue.slice(0, 37);
  }

  // Actualiza el valor del input
  input.value = formattedValue;
});

document.getElementById('guardarPacasBtn').addEventListener('click', function () {
  // Obtener todas las filas de pacas
  const filasPacas = document.querySelectorAll('#pacasTableBody tr');
  let alMenosUnaSeleccionada = false;

  // Verificar si al menos una paca está seleccionada
  filasPacas.forEach(fila => {
      const checkbox = fila.querySelector('input[type="checkbox"]');
      if (checkbox && checkbox.checked) {
          alMenosUnaSeleccionada = true;
      }
  });

  // Si no hay ninguna paca seleccionada, mostrar alerta
  if (!alMenosUnaSeleccionada) {
      alert('Debe seleccionar al menos una paca.');
      return; // Detener la ejecución
  }

  
  const inputIsv15 = document.getElementById('isv15s').textContent;
  
  const isv15Dato = document.getElementById('inputIsv15');
  if (isv15Dato) {
    isv15Dato.value = inputIsv15;
  }

  const inputIsv18 = document.getElementById('isv18s').textContent;
  
  const isv18Dato = document.getElementById('inputIsv18');
  if (isv18Dato) {
    isv18Dato.value = inputIsv18;
  }
  
  
  const totalFactura = document.getElementById('totalFactura').textContent;
  
  // Pasar el total al input del formulario principal
  const inputTotalFormularioPrincipal = document.getElementById('total');
  if (inputTotalFormularioPrincipal) {
    inputTotalFormularioPrincipal.value = totalFactura;
  }
  
  
  // Cerrar el modal (opcional)
  closeModal();
});

document.getElementById('registrarPilon').addEventListener('click', function () {
  // Obtener todos los campos obligatorios
  const camposObligatorios = [
      document.getElementById('numeroFactura'),
      document.getElementById('fechaEmision'),
      document.getElementById('cliente'), 
      document.getElementById('clienteRtn'),
      document.getElementById('cai'),
      document.getElementById('fechaLimite'),
      document.getElementById('total')
  ];

  let formularioValido = true;

  // Validar que los campos obligatorios no estén vacíos
  camposObligatorios.forEach(campo => {
      if (!campo.value.trim()) {
          formularioValido = false;
          campo.classList.add('error'); // Añadir clase de error
      } else {
          campo.classList.remove('error'); // Remover clase de error si está lleno
      }
  });

  // Mostrar mensaje de error si algún campo obligatorio está vacío
  if (!formularioValido) {
      alert('Los campos en rojo son obligatorios.');
      return; // Detener la ejecución
  }   

  const pacasSeleccionadas = [];
  const filasPacas = document.querySelectorAll('#pacasTableBody tr');
  filasPacas.forEach(fila => {
      const checkbox = fila.querySelector('input[type="checkbox"]');
      if (checkbox && checkbox.checked) {
        const numeroPaca = fila.cells[1].textContent;
        const descripcion = fila.cells[2].textContent;
        const peso_bruto = parseFloat(fila.cells[3].textContent); // Convertir a número
        const peso_neto = parseFloat(fila.cells[4].textContent); // Convertir a número
        const precio_unitario = parseFloat(fila.querySelector('.precio-unitario').value); // Convertir a número
        const descuento = parseFloat(fila.querySelector('.descuento').value) || 0; 
        const total = parseFloat(fila.querySelector('.total').textContent); 
        const pacaId = checkbox.dataset.pacaId;

          pacasSeleccionadas.push({
              paca_id: pacaId && !isNaN(pacaId) ? Number(pacaId) : null,
              numeroPaca,
              descripcion,
              peso_bruto,
              peso_neto,
              precio_unitario,
              descuento,
              total
          });
      }
  });

  const facturaData = {
    numeroFactura: document.getElementById('numeroFactura').value || '',
    fechaEmision: document.getElementById('fechaEmision').value || '',
    cliente: document.getElementById('cliente').value || '',
    Dircliente: document.getElementById('Dircliente').value || '',
    clienteRtn: document.getElementById('clienteRtn').value || '',
    email: document.getElementById('email').value || '',
    cai: document.getElementById('cai').value || '',
    numOrdenCE: document.getElementById('numOrdenCE').value || '',
    numSag: document.getElementById('numSag').value || '',
    numConstancia: document.getElementById('numConstancia').value || '',
    moneda: document.getElementById('moneda').value || '',
    fechaLimite: document.getElementById('fechaLimite').value || '',
    total: document.getElementById('total').value || '0',
    isv15: document.getElementById('inputIsv15').value || '0',
    isv18: document.getElementById('inputIsv18').value || '0',
    Exento: document.getElementById('Exento').value || '0',
    Exonerado: document.getElementById('Exonerado').value || '0',
    gravado15: document.getElementById('ImpGravado15').textContent || '0',
    gravado18: document.getElementById('ImpGravado18').textContent || '0',
    pacas: pacasSeleccionadas
  };
  
  // Guardar la factura en sessionStorage
sessionStorage.setItem('facturaData', JSON.stringify(facturaData));

// Redirigir sin incluir pacas en la URL
const queryString = Object.keys(facturaData)
  .filter(key => key !== "pacas") // Excluir pacas de la URL
  .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(facturaData[key])}`)
  .join('&');
  
  
  // Redirigir a la página de previsualización con los datos incluidos
  window.location.href = `../Previsualizacion/previsualizacion.html?${queryString}`;
});