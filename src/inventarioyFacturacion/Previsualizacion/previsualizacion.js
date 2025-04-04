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

  
  // Función para formatear montos (cambiar 0.00 por "-")
  const formatMonto = (value) => {
    return value === 0 || value === "0.00" ? "-" : `${parseFloat(value).toFixed(2)}`;
  };
  

document.addEventListener("DOMContentLoaded", function () {
  // Obtener los datos de la factura pasados desde la URL y sessionStorage
  const params = new URLSearchParams(window.location.search);

  let facturaData = JSON.parse(sessionStorage.getItem('facturaData') || '{}');
  console.log("Factura Data:", facturaData.pacas);

  // Mostrar las pacas seleccionadas en la tabla
  const previewItemsFactura = document.getElementById("previewItemsFactura");

if (previewItemsFactura && Array.isArray(facturaData.pacas) && facturaData.pacas.length > 0) {
  previewItemsFactura.innerHTML = ""; // Limpia antes de agregar datos

  facturaData.pacas.forEach((paca) => {
    const row = document.createElement("tr");

    const campos = ["numeroPaca", "descripcion", "peso_bruto", "peso_neto", "precio_unitario", "descuento", "total"];
    campos.forEach((key) => {
      const cell = document.createElement("td");
      cell.textContent = paca[key] ?? "-";
      row.appendChild(cell);
    });

    previewItemsFactura.appendChild(row);
  });
} else {
  console.log("No hay datos para mostrar en la tabla.");
} 

  // Recuperar los valores de la URL, si están presentes, o mantener los de sessionStorage
  facturaData = {
    numeroFactura: params.get("numeroFactura") ?? facturaData.numeroFactura ?? "",
    fechaEmision: params.get("fechaEmision") ?? facturaData.fechaEmision ?? "",
    fechaVencimiento: params.get("fechaLimite") ?? facturaData.fechaVencimiento ?? "",
    cliente: params.get("cliente") ?? facturaData.cliente ?? "",
    rtnCliente: params.get("clienteRtn") ?? facturaData.rtnCliente ?? "",
    DirCliente: params.get("Dircliente") ?? facturaData.DirCliente ?? "",
    CorreoCliente: params.get("email") ?? facturaData.CorreoCliente ?? "",
    cai: params.get("cai") ?? facturaData.cai ?? "",
    NcompraExenta: params.get("numOrdenCE") ?? facturaData.NcompraExenta ?? "",
    NregistroSag: params.get("numSag") ?? facturaData.NregistroSag ?? "",
    NregistroExo: params.get("numConstancia") ?? facturaData.NregistroExo ?? "",
    moneda: params.get("moneda") ?? facturaData.moneda ?? "",
    total: parseFloat(params.get("total") || facturaData.total) || 0,
    isv15: parseFloat(params.get("isv15") || facturaData.isv15) || 0,
    isv18: parseFloat(params.get("isv18") || facturaData.isv18) || 0,
    Exento: parseFloat(params.get("Exento") || facturaData.Exento) || 0,
    Exonerado: parseFloat(params.get("Exonerado") || facturaData.Exonerado) || 0,
    gravado15: parseFloat(params.get("gravado15") || facturaData.gravado15) || 0,
    gravado18: parseFloat(params.get("gravado18") || facturaData.gravado18) || 0,
    pacas: JSON.parse(params.get("pacas") || "[]")
  };
  console.log("Factura Data:", facturaData.pacas);
  // Cargar los datos en la pantalla de previsualización
  const setTextContent = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };

  setTextContent("previewNumeroFactura", facturaData.numeroFactura);
  setTextContent("previewFechaEmision", facturaData.fechaEmision);
  setTextContent("previewFechaLimite", facturaData.fechaVencimiento);
  setTextContent("previewCliente", facturaData.cliente);
  setTextContent("previewRtnCliente", facturaData.rtnCliente);
  setTextContent("previewDirCliente", facturaData.DirCliente);
  setTextContent("previewCorreoCliente", facturaData.CorreoCliente);
  setTextContent("previewCai", facturaData.cai);
  setTextContent("previewNcompraExenta", facturaData.NcompraExenta);
  setTextContent("previewNregistroSag", facturaData.NregistroSag);
  setTextContent("previewNregistroExonerado", facturaData.NregistroExo);
  setTextContent("previewmoneda", facturaData.moneda);
  setTextContent("previewTotal", formatMonto(facturaData.total));
  setTextContent("previewImporteExonerado", formatMonto(facturaData.Exonerado));
  setTextContent("previewImporteExento", formatMonto(facturaData.Exento));
  setTextContent("previewImporteGravado15", formatMonto(facturaData.gravado15));
  setTextContent("previewImporteGravado18", formatMonto(facturaData.gravado18));
  setTextContent("previewIsv15", formatMonto(facturaData.isv15));
  setTextContent("previewIsv18", formatMonto(facturaData.isv18));

  function numeroATexto(numero) {
    if (isNaN(numero) || numero === null || numero === undefined) {
        console.error("Error: numeroATexto recibió un valor no numérico o indefinido", numero);
        return "Cero con cero centavos";
    }

    numero = parseFloat(numero); // Convertir a número si viene como string
    if (isNaN(numero)) return "Cero con cero centavos"; // Verificación extra

    const unidades = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];
    const especiales = ["diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve"];
    const decenas = ["", "", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
    const centenas = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];

    function convertirMenorMil(num) {
        if (num === 0) return "cero";
        if (num < 10) return unidades[num];
        if (num < 20) return especiales[num - 10];
        if (num < 100) return decenas[Math.floor(num / 10)] + (num % 10 !== 0 ? " y " + unidades[num % 10] : "");
        if (num === 100) return "cien";
        return centenas[Math.floor(num / 100)] + (num % 100 !== 0 ? " " + convertirMenorMil(num % 100) : "");
    }

    function convertirMiles(num) {
        if (num < 1000) return convertirMenorMil(num);
        if (num < 2000) return "mil " + convertirMenorMil(num % 1000);
        return convertirMenorMil(Math.floor(num / 1000)) + " mil" + (num % 1000 !== 0 ? " " + convertirMenorMil(num % 1000) : "");
    }

    function convertirMillones(num) {
        if (num < 1000000) return convertirMiles(num);
        if (num < 2000000) return "un millón " + convertirMiles(num % 1000000);
        return convertirMiles(Math.floor(num / 1000000)) + " millones" + (num % 1000000 !== 0 ? " " + convertirMiles(num % 1000000) : "");
    }

    // Asegurar que el número tenga 2 decimales
    const partes = numero.toFixed(2).split(".");
    const entero = parseInt(partes[0]);
    const centavos = parseInt(partes[1]);

    let resultado = convertirMillones(entero) + " con " + (centavos > 0 ? convertirMenorMil(centavos) : "cero") + " centavos";
    return resultado.charAt(0).toUpperCase() + resultado.slice(1);
}



  function generarPDF(facturaData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
  
    // --- Encabezado de la empresa ---
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.text("SM TABACOS S. DE R.L. C. V.", 105, 15, { align: "center" });
  
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);
    doc.text("SABOR DEL MUNDO TABACOS", 105, 23, { align: "center" });
  
    doc.setFontSize(10);
    doc.text("Bo. Gualiquemes, frente a uniplaza, Danli, El Paraíso", 105, 30, { align: "center" });
    doc.text("R.T.N. 07039021310105 | Tel. 3179-2213 / 9842-2707", 105, 36, { align: "center" });
    doc.text("E-mail: smtabacos@yahoo.com", 105, 42, { align: "center" });
  
    // Línea separadora
    doc.setLineWidth(0.5);
    doc.line(10, 45, 200, 45);
  
    // --- Detalles de la factura ---
    doc.setFontSize(10);
    doc.setFont("Helvetica", "bold");
    doc.text("Factura : No." + facturaData.numeroFactura, 14, 55);
    doc.setFont("Helvetica", "normal");
    doc.text("Fecha Emisión: " + facturaData.fechaEmision, 150, 55);
    doc.text("Fecha Vencimiento: " + facturaData.fechaLimite, 150, 60);
    doc.text("Cliente: " + facturaData.cliente, 14, 60);
    doc.text("RTN: " + facturaData.clienteRtn, 14, 65);
    doc.text("CAI: " + facturaData.cai, 14, 80);
    doc.text("Correo: " + facturaData.email, 14, 70);
    doc.text("Direccion: " + facturaData.Dircliente, 14, 75);

    let tipoMoneda = "";

    if (facturaData.moneda === "Lempiras") {
      tipoMoneda = "L";
    } else if (facturaData.moneda === "Dolares") {
      tipoMoneda = "$"}
  
    // --- Agrupar pacas por tipo ---
    const pacasAgrupadas = {};
    if (Array.isArray(facturaData.pacas) && facturaData.pacas.length > 0) {
      facturaData.pacas.forEach((paca) => {
        const tipo = paca.descripcion || "Sin tipo";
        if (!pacasAgrupadas[tipo]) {
          pacasAgrupadas[tipo] = {
            bultos: 0,
            pesoNetoLbs: 0,
            pesoBrutoKg: 0,
            pesoNetoKg: 0,
            precioUnitarioTotal: 0,
            valor: 0,
          };
        }
        pacasAgrupadas[tipo].bultos += 1;
        pacasAgrupadas[tipo].pesoNetoLbs += parseFloat(paca.peso_neto || 0);
        pacasAgrupadas[tipo].pesoBrutoKg += parseFloat(paca.peso_bruto || 0) * 0.453592;
        pacasAgrupadas[tipo].pesoNetoKg += parseFloat(paca.peso_neto || 0) * 0.453592;
        pacasAgrupadas[tipo].precioUnitarioTotal += parseFloat(paca.precio_unitario || 0);
        pacasAgrupadas[tipo].valor += parseFloat(paca.total || 0); // Ahora el valor viene del backend
      });
    }
  
    // --- Convertir datos para la tabla ---
    const datosPacas = Object.keys(pacasAgrupadas).map((tipo) => {
      const p = pacasAgrupadas[tipo];
      const precioUnitarioPromedio = p.bultos > 0 ? (p.precioUnitarioTotal / p.bultos).toFixed(2) : "0.00";
      return [
        p.bultos,
        p.pesoNetoLbs.toFixed(2), // Peso Neto en libras
        tipo,
        p.pesoBrutoKg.toFixed(2), // Peso Bruto en kg
        p.pesoNetoKg.toFixed(2), // Peso Neto en kg
       tipoMoneda + precioUnitarioPromedio, // Precio unitario promedio
       tipoMoneda + formatMonto(p.valor), // Ahora toma el valor desde el backend
      ];
    });
  
    // --- Agregar fila vacía para mejor visualización ---
    datosPacas.push(["", "", "", "", "", "", ""]);
  
    // --- Agregar fila de totales ---
    const totalBultos = Object.values(pacasAgrupadas).reduce((sum, p) => sum + p.bultos, 0);
    const totalPesoNetoLbs = Object.values(pacasAgrupadas).reduce((sum, p) => sum + p.pesoNetoLbs, 0);
    const totalPesoBrutoKg = Object.values(pacasAgrupadas).reduce((sum, p) => sum + p.pesoBrutoKg, 0);
    const totalPesoNetoKg = Object.values(pacasAgrupadas).reduce((sum, p) => sum + p.pesoNetoKg, 0);
    const totalValor = Object.values(pacasAgrupadas).reduce((sum, p) => sum + p.valor, 0);
  
    datosPacas.push([
      totalBultos,
      totalPesoNetoLbs.toFixed(2), 
      "Total",
      totalPesoBrutoKg.toFixed(2), 
      totalPesoNetoKg.toFixed(2), 
      "-", 
      tipoMoneda + formatMonto(totalValor),
    ]);
  
    // --- Generar la tabla ---
    doc.autoTable({
      startY: 85,
      head: [["Bultos", "Cantidad (lbs)", "Clase", "Peso Bruto (kg)", "Peso Neto (kg)", "Precio Unitario", "Valor"]],
      body: datosPacas,
      theme: "grid",
      headStyles: { fillColor: [22, 160, 133] },
      styles: { fontSize: 10 },
    });
  
// --- Instrucciones de pago ---
const instrucciones = `Términos e Instrucciones:

- COUNTRY OF ORIGIN: HONDURAS

- De contado

- INCOTERM: FOB

- Instrucciones de pago: Transferencia o depósito a
  cuenta bancaria Banco de Occidente.
  - Ahorro en dólares: No. 22-414-001107-2
  - Cheques en lempiras: No. 11-414-0011516
  A nombre de: Sabor del Mundo Tabacos, S. de R.L. C.V.`;

// --- Datos de impuestos y totales ---
const impuestosTotales = [
  ["Importe Exento", tipoMoneda + formatMonto(parseFloat(facturaData.Exento).toFixed(2))],
  ["Importe Exonerado", tipoMoneda + formatMonto(parseFloat(facturaData.Exonerado).toFixed(2))],
  ["Importe Gravado 15%", tipoMoneda + formatMonto(facturaData.gravado15)],
  ["Importe Gravado 18%", tipoMoneda + formatMonto(facturaData.gravado18)],
  ["ISV 15%", tipoMoneda + formatMonto(facturaData.isv15)],
  ["ISV 18%", tipoMoneda + formatMonto(facturaData.isv18)],
  ["TOTAL FACTURA",tipoMoneda + formatMonto(facturaData.total)]
];

const startY = doc.autoTable.previous.finalY;

// --- Agregar Instrucciones como una tabla separada en la misma línea ---
doc.autoTable({
  startY: startY,
  body: [[{ content: instrucciones, styles: { fontSize: 8, halign: "left", valign: "top" } }]],
  theme: "grid",
  styles: { fontSize: 8 },
  columnStyles: { 0: { cellWidth: 100, halign: "left", valign: "top" } } // Instrucciones en la izquierda
});

// --- Agregar la tabla de impuestos y totales a la derecha ---
doc.autoTable({
  startY: startY, // Asegura que ambas tablas comiencen en la misma línea
  margin: { left: 110 }, // Mueve esta tabla a la derecha
  body: impuestosTotales,
  theme: "grid",
  styles: { fontSize: 8 },
  columnStyles: {
    0: { cellWidth: 56, halign: "left" }, // Descripción de impuestos
    1: { cellWidth: 30, halign: "right" } // Monto alineado a la derecha
  }
});


      const finalY = doc.autoTable.previous.finalY + 10; // Margen después de la tabla
      
      const totalTexto = numeroATexto(facturaData.total);
      doc.text("Son: " + totalTexto, 14, doc.autoTable.previous.finalY + 10);

    // Cargar la imagen después de la tabla
    const logo = new Image();
    logo.src = '../../Bodega1/img/firma_factura.jpg';
     doc.addImage(logo, 'PNG', 10, finalY, 40, 30);

    // Guardar el PDF con el número de factura en el nombre
    const nombreArchivo = `Factura_No_${facturaData.numeroFactura}.pdf`;
    doc.save(nombreArchivo);
  }
  
  // Botón de confirmar factura
  document.getElementById("confirmarFacturaBtn")?.addEventListener("click", async function () {
    // Recuperar los datos almacenados en sessionStorage
    const facturaData = JSON.parse(sessionStorage.getItem('facturaData') || '{}');
  
    // Validar los campos obligatorios: número de factura, fecha de emisión y total a pagar
    if (!facturaData.numeroFactura || !facturaData.fechaEmision || !facturaData.total) {
      alert("Los campos 'Número de Factura', 'Fecha de Emisión' y 'Total a Pagar' son obligatorios.");
      return;
    }
  
    // Construir el payload según la estructura requerida por el backend
    const payload = {
      numero_factura: facturaData.numeroFactura,
      fecha_emision: facturaData.fechaEmision,
      cliente_nombre: facturaData.cliente || "",
      cliente_direccion: facturaData.Dircliente || "",
      cliente_rtn: facturaData.clienteRtn || "",
      telefono1: facturaData.telefono1 || "",
      telefono2: facturaData.telefono2 || "",
      email: facturaData.email || "",
      cai: facturaData.cai || "",
      direccion_empresa: facturaData.direccionEmpresa || "",
      adquiriente_exonerado_num_orden: facturaData.numOrdenCE || "",
      adquiriente_exonerado_num_sag: facturaData.numSag || "",
      adquiriente_exonerado_constancia: facturaData.numConstancia || "",
      moneda: facturaData.moneda || "",
      impuestos: {
        importe_exonerado: facturaData.Exonerado || 0,
        importe_exento: facturaData.Exento || 0,
        importe_gravado_15: facturaData.gravado15 || 0,
        importe_gravado_18: facturaData.gravado18 || 0,
        isv_15: facturaData.isv15 || 0,
        isv_18: facturaData.isv18 || 0,
      },
      total_a_pagar: facturaData.total,
      total_a_pagar_letras: facturaData.total_a_pagar_letras || "",
      rango_autorizado: facturaData.rangoAutorizado || "",
      fecha_limite_emision: facturaData.fechaLimite || "",
      pacas: facturaData.pacas || []
    };
    console.log("Payload:", facturaData.pacas);
    try {
      // Enviar el JSON al endpoint del backend que crea la factura
      const response = await fetch("https://backendtabacalera-production.up.railway.app/api/facturas/crear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
  
      if (!response.ok) {
        throw new Error("Error al guardar la factura en la base de datos.");
      }
  
      // Se asume que el backend retorna, al menos, el id de la factura creada
      const data = await response.json();
      // Si deseas, puedes agregar el facturaId a la información (para el PDF u otros fines)
      facturaData.facturaId = data.facturaId;
  
      // Una vez guardada la factura, se genera el PDF
      generarPDF(facturaData);
      alert("Factura creada y confirmada correctamente.");
      window.location.href = "../listaFacturas/listaFacturas.html";
    } catch (error) {
      console.error("Error:", error);
      alert("Ocurrió un error al guardar la factura.");
    }
  });
  

  // Botón de cancelar
  document.getElementById("cancelarFacturaBtn")?.addEventListener("click", function () {
    window.location.href = "../formularioFactura/formularioFactura.html";
  });
});