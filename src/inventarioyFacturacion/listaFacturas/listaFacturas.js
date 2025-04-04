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
  

const formatMonto = (value) => {
    return value === 0 || value === "0.00" ? "-" : `${parseFloat(value).toFixed(2)}`;
  };

document.addEventListener("DOMContentLoaded", () => {
    const facturasBody = document.getElementById("facturasBody");
    const btnVolver = document.getElementById("btnVolver");

    btnVolver.addEventListener("click", () => {
        window.history.back();
    });

    fetch("https://backendtabacalera-production.up.railway.app/api/facturas/")
        .then(response => response.json())
        .then(data => {
            data.forEach(factura => {
                let signo = "";
                if (factura.moneda === "Lempiras"){
                    signo = "L";
                } else if (factura.moneda === "Dolares"){
                    signo = "$";
                }
                let total = parseFloat(factura.total_a_pagar) || 0;
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${factura.id}</td>
                    <td>No.${factura.numero_factura}</td>
                    <td>${formatDate(factura.fecha_emision)}</td>
                    <td>${factura.cliente_nombre}</td>
                    <td>${signo + total.toFixed(2)}</td>
                    <td>
                        <div class="dropdown">
                            <button class="dropbtn" data-id="${factura.id}">Opciones</button>
                            <div class="dropdown-content">
                                <a href="#" onclick="generarFactura(${factura.id})">Generar Factura</a>
                                <a href="#" onclick="generarPackageList(${factura.id})">Generar Package List</a>
                            </div>
                        </div>
                    </td>
                `;
                facturasBody.appendChild(row);
            });

            // Agregar eventos de clic a los botones de opciones
            document.querySelectorAll(".dropbtn").forEach(button => {
                button.addEventListener("click", event => {
                    event.stopPropagation(); // Evita que el documento cierre el menú inmediatamente
                    closeAllDropdowns(); // Cierra otros menús abiertos
                    const dropdownMenu = event.target.nextElementSibling;
                    dropdownMenu.classList.toggle("show");
                });
            });
        })
        .catch(error => console.error("Error al obtener facturas:", error));
});

function formatDate(fechaISO) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
}


// Función para cerrar todos los menús desplegables
function closeAllDropdowns() {
    document.querySelectorAll(".dropdown-content").forEach(menu => {
        menu.classList.remove("show");
    });
}

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

// Cerrar el menú si se hace clic fuera de él
document.addEventListener("click", closeAllDropdowns);


function toggleDropdown(event) {
    event.stopPropagation(); // Evita que el clic cierre el menú inmediatamente
    let dropdownContent = event.target.nextElementSibling;
    dropdownContent.classList.toggle("show");
}

// Cierra el menú desplegable si se hace clic fuera de él
document.addEventListener("click", () => {
    document.querySelectorAll(".dropdown-content").forEach(menu => {
        menu.classList.remove("show");
    });
});

function generarPDF(facturaData) {
    if (!facturaData || !facturaData.numeroFactura) {
        console.error("Error: Los datos de la factura no son válidos.", facturaData);
        alert("No se pudo generar la factura. Verifica los datos.");
        return;
    }
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
    console.log(facturaData);

    // --- Detalles de la factura ---
    doc.setFontSize(10);
    doc.setFont("Helvetica", "bold");
    doc.text("Factura : No." + facturaData.numeroFactura, 14, 55);
    doc.setFont("Helvetica", "normal");
    doc.text("Fecha Emisión: " + new Date(facturaData.fechaEmision).toLocaleDateString(), 150, 55);
    doc.text("Fecha Vencimiento: " + new Date(facturaData.fechaLimite).toLocaleDateString(), 150, 60);
    doc.text("Cliente: " + facturaData.cliente, 14, 60);
    doc.text("RTN: " + (facturaData.clienteRtn || "N/A"), 14, 65);
    doc.text("CAI: " + (facturaData.cai || "N/A"), 14, 80);
    doc.text("Correo: " + (facturaData.email || "N/A"), 14, 70);
    doc.text("Dirección: " + (facturaData.direccion || "N/A"), 14, 75);

    console.log(facturaData.fechaLimite);
    let tipoMoneda = "";

    if (facturaData.moneda === "Lempiras") {
      tipoMoneda = "L";
    } else if (facturaData.moneda === "Dolares") {
      tipoMoneda = "$"}

    // --- Agrupar pacas por tipo ---
    const pacasAgrupadas = {};
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
        pacasAgrupadas[tipo].valor += parseFloat(paca.total || 0);
    });

    // --- Convertir datos para la tabla ---
    const datosPacas = Object.keys(pacasAgrupadas).map((tipo) => {
        const p = pacasAgrupadas[tipo];
        const precioUnitarioPromedio = p.bultos > 0 ? (p.precioUnitarioTotal / p.bultos).toFixed(2) : "0.00";
        return [
            p.bultos,
            p.pesoNetoLbs.toFixed(2),
            tipo,
            p.pesoBrutoKg.toFixed(2),
            p.pesoNetoKg.toFixed(2),
          tipoMoneda + precioUnitarioPromedio,
          tipoMoneda + p.valor.toFixed(2),
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
       tipoMoneda + totalValor.toFixed(2),
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
  ["TOTAL FACTURA", tipoMoneda + formatMonto(facturaData.total)]
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
      
      const totalTexto = numeroATexto(facturaData.total) + " en " + facturaData.moneda;
      doc.text("Son: " + totalTexto, 14, doc.autoTable.previous.finalY + 10);

    // Cargar la imagen después de la tabla
    const logo = new Image();
    logo.src = '../../Bodega1/img/firma_factura.jpg';
     doc.addImage(logo, 'PNG', 10, finalY, 40, 30);

    // --- Guardar el PDF ---
    doc.save(`Factura_${facturaData.numeroFactura}.pdf`);
}

function generarPDFPackageList(packageListData) {
    if (!packageListData || !packageListData.numeroFactura) {
        console.error("Error: Los datos del package list no son válidos.", packageListData);
        alert("No se pudo generar el package list. Verifica los datos.");
        return;
    }

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

    // --- Listado de pacas ---
    const pacas = packageListData.pacas;

    // Variables para los totales
    let totalPacas = 0;
    let totalPesoBruto = 0;
    let totalTara = 0;
    let totalPesoNeto = 0;

    const datosPacas = pacas.map((paca) => {
        // Convertir valores a número y evitar NaN
        const pesoBruto = parseFloat(paca.peso_bruto) || 0;
        const tara = parseFloat(paca.tara) || 0;
        const pesoNeto = parseFloat(paca.peso_neto) || 0;

        // Sumar valores a los totales
        totalPacas += 1;
        totalPesoBruto += pesoBruto;
        totalTara += tara;
        totalPesoNeto += pesoNeto;

        return [
            paca.numero_paca || "N/A",
            paca.descripcion || "Sin descripción",
            pesoBruto.toFixed(2),
            tara.toFixed(2),
            pesoNeto.toFixed(2)
        ];
    });

    // --- Agregar la fila de totales ---
    datosPacas.push([
        "TOTAL", // Para la columna de número de paca
        totalPacas,
        totalPesoBruto.toFixed(2), // Total de peso bruto
        totalTara.toFixed(2), // Total de tara
        totalPesoNeto.toFixed(2) // Total de peso neto
    ]);

    // --- Generar la tabla de pacas ---
    doc.autoTable({
        startY: 60,
        head: [["Número de Paca", "Descripción", "Peso Bruto (lbs)", "Tara (lbs)", "Peso Neto (lbs)"]],
        body: datosPacas,
        theme: "grid",
        headStyles: { fillColor: [22, 160, 133] },
        styles: { fontSize: 10 },
        footStyles: { fillColor: [200, 200, 200] }, // Color de fondo para la fila de totales
    });

    const finalY = doc.autoTable.previous.finalY + 10; // Margen después de la tabla

    // Cargar la imagen después de la tabla
    const logo = new Image();
    logo.src = '../../Bodega1/img/firma_factura.jpg';
    doc.addImage(logo, 'PNG', 10, finalY, 40, 30);

    // --- Guardar el PDF ---
    doc.save(`PackageList_N.${packageListData.numeroFactura}.pdf`);
}


async function generarFactura(id) {
    alert("Generando factura para ID: " + id);
    
    try {
        const response = await fetch(`https://backendtabacalera-production.up.railway.app/api/facturas/${id}`);
        if (!response.ok) {
            throw new Error("Error al obtener la factura");
        }
        
        const data = await response.json();
        const factura = data.factura;
        const pacas = data.pacas;

        // Agrupar pacas por tipo
        const pacasAgrupadas = {};
        pacas.forEach((paca) => {
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
            pacasAgrupadas[tipo].valor += parseFloat(paca.total || 0);
        });
        
        // Preparar datos para PDF
        const facturaData = {
            numeroFactura: factura.numero_factura,
            fechaEmision: factura.fecha_emision,
            fechaLimite: factura.fecha_limite_emision,
            cliente: factura.cliente_nombre,
            clienteRtn: factura.cliente_rtn,
            cai: factura.cai,
            email: factura.email,
            direccion: factura.cliente_direccion,
            Exento: factura.importe_exento,
            Exonerado: factura.importe_exonerado,
            gravado15: factura.importe_gravado_15,
            gravado18: factura.importe_gravado_18,
            isv15: factura.isv_15,
            isv18: factura.isv_18,
            moneda: factura.moneda,
            total: factura.total_a_pagar,
            pacas: pacas,
            pacasAgrupadas: pacasAgrupadas,
        };
        console.log(facturaData);
        
        generarPDF(facturaData);
    } catch (error) {
        console.error("Error al generar la factura:", error);
        alert("Hubo un error al generar la factura.");
    }
}

document.getElementById("btnVolver").addEventListener("click", function () {
    window.location.href = "../pacas.html";
});



async function generarPackageList(id) {
    alert("Generando package list para ID: " + id);
    
    try {
        const response = await fetch(`https://backendtabacalera-production.up.railway.app/api/facturas/${id}`);
        if (!response.ok) {
            throw new Error("Error al obtener la factura");
        }
        
        const data = await response.json();
        const factura = data.factura;
        const pacas = data.pacas;

        // Preparar datos para PDF
        const packageListData = {
            numeroFactura: factura.numero_factura,
            fechaEmision: factura.fecha_emision,
            fechaLimite: factura.fecha_limite_emision,
            cliente: factura.cliente_nombre,
            clienteRtn: factura.cliente_rtn,
            cai: factura.cai,
            email: factura.email,
            direccion: factura.cliente_direccion,
            Exento: factura.importe_exento,
            Exonerado: factura.importe_exonerado,
            gravado15: factura.importe_gravado_15,
            gravado18: factura.importe_gravado_18,
            isv15: factura.isv_15,
            isv18: factura.isv_18,
            total: factura.total_a_pagar,
            pacas: pacas
        };

        // Generar el PDF para el listado de pacas
        generarPDFPackageList(packageListData);
    } catch (error) {
        console.error("Error al generar el package list:", error);
        alert("Hubo un error al generar el package list.");
    }
}
