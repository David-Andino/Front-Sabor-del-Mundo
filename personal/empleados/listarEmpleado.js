const API_URL = 'https://personal-backend-je2r.onrender.com/api/empleados';
const empleadosTable = document.getElementById('empleadosTable').getElementsByTagName('tbody')[0];

function verificarAutenticacion() {
    const token = localStorage.getItem('authToken');

    if (!token) {
        // Si no hay token, redirigir al login
        window.location.href = '../../login.html';
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
            window.location.href = '../../login.html';
        }
    })
    .catch(error => {
        console.error('Error al verificar el token:', error);
        window.location.href = '../../login.html';
    });
}

verificarAutenticacion();

// Cargar empleados al iniciar
document.addEventListener('DOMContentLoaded', function() {
    cargarEmpleados();
    inicializarMenuFlotante();
});

let todosLosEmpleados = [];

async function cargarEmpleados() {
    try {
        const response = await fetch(API_URL);
        todosLosEmpleados = await response.json();
        actualizarTabla(todosLosEmpleados);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Función para cargar empleados
function actualizarTabla(empleados) {
    empleadosTable.innerHTML = '';

    empleados.forEach(empleado => {
        const fechaFormateada = empleado.fecha_contratacion.split('T')[0];
        const row = empleadosTable.insertRow();
        row.innerHTML = `
            <td>${empleado.nombre}</td>
            <td>${empleado.puesto}</td>
            <td>${empleado.tipo_contrato}</td>
            <td>${empleado.sueldo_base}</td>
            <td>${empleado.activo}</td>
            <td>${fechaFormateada}</td>
            <td>${empleado.numero_identidad}</td>
            <td class="acciones">
                <button class="editar" onclick="editarEmpleado(${empleado.id})">Editar</button>
                <button class="eliminar" onclick="eliminarEmpleado(${empleado.id})">Eliminar</button>
                <button class="ver" onclick="mostrarCarnet(${empleado.id})">
                    <i class="fas fa-user"></i>
                </button>
                <button class="pdf" onclick="generarPDF(${empleado.id})">
                    <i class="fas fa-file-pdf"></i>
                </button>
            </td>
        `;
    });
}

// Función para mostrar la imagen del empleado
async function mostrarCarnet(id) {
    try {
        // Obtener la información del empleado desde el servidor
        const response = await fetch(`${API_URL}/${id}`);
        const empleado = await response.json();

        // Asignar la información al modal
        document.getElementById('carnetNombre').textContent = empleado.nombre;
        document.getElementById('carnetPuesto').textContent = empleado.puesto;
        document.getElementById('carnetIdentidad').textContent = empleado.numero_identidad;

        // Asignar la URL completa de la imagen desde Cloudinary
        const urlCompleta = empleado.foto ? empleado.foto : 'https://via.placeholder.com/150?text=Sin+Foto';

        // Mostrar la foto del empleado
        document.getElementById('carnetFoto').src = urlCompleta;

        // Generar el código de barras
        JsBarcode("#carnetCodigoBarras", empleado.numero_identidad, {
            format: "CODE128",
            displayValue: false,
            width: 2,
            height: 50,
        });

        // Abrir el modal
        document.getElementById('carnetModal').style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
    }
}




function filtrarEmpleados() {
    const nombreBusqueda = document.getElementById('buscarNombre').value.toLowerCase();
    const identidadBusqueda = document.getElementById('buscarIdentidad').value.toLowerCase();

    const empleadosFiltrados = todosLosEmpleados.filter(empleado => {
        const nombreMatch = empleado.nombre.toLowerCase().includes(nombreBusqueda);
        const identidadMatch = empleado.numero_identidad.toLowerCase().includes(identidadBusqueda);
        return nombreMatch && identidadMatch;
    });

    actualizarTabla(empleadosFiltrados);
}

// Función para cerrar el modal
function cerrarModal() {
    document.getElementById('carnetModal').style.display = 'none';
}

// Función para eliminar un empleado
async function eliminarEmpleado(id) {
    try {
        // Mostrar cuadro de confirmación
        const confirmacion = confirm('¿Estás seguro de que deseas eliminar este empleado?');
        
        // Si el usuario hace clic en "Aceptar"
        if (confirmacion) {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            
            if (response.ok) {
                alert('Empleado eliminado correctamente');
                cargarEmpleados(); // Recargar la lista
            } else {
                alert('Error al eliminar el empleado');
            }
        } else {
            // Si el usuario hace clic en "Cancelar"
            alert('Eliminación cancelada');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function guardarCarnetComoImagen() {
    try {
        // Seleccionar el contenido del carnet
        const element = document.getElementById('carnetContent');
        
        // Configuración de html2canvas
        const canvas = await html2canvas(element, {
            scale: 2, // Mejor calidad
            logging: false,
            useCORS: true, // Para imágenes externas
            allowTaint: true,
            backgroundColor: null // Fondo transparente
        });
        
        // Convertir a imagen y descargar
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        const nombreEmpleado = document.getElementById('carnetNombre').textContent.replace(/\s+/g, '_');
        
        link.download = `Carnet_${nombreEmpleado}.png`;
        link.href = image;
        link.click();
        
    } catch (error) {
        console.error('Error al generar la imagen:', error);
        alert('Error al guardar el carnet como imagen');
    }
}

async function generarPDF(id) {
    try {
        // 1. Obtener datos del empleado
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error(`Error al obtener datos: ${response.status}`);
        const empleado = await response.json();
        if (!empleado || Object.keys(empleado).length === 0) {
            throw new Error("Datos del empleado no encontrados.");
        }

        // 2. Configuración del documento PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Configuración de márgenes y diseño (tamaños reducidos)
        const config = {
            pageMargin: 15,                // Margen reducido
            lineHeight: 6,                 // Altura de línea reducida
            labelWidth: 60,                // Ancho para etiquetas
            valueWidth: 125,               // Más espacio para valores
            imageSize: 35,                 // Tamaño de imagen reducido
            headerFontSize: 14,            // Tamaño de fuente reducido (antes 16)
            titleFontSize: 12,             // Tamaño para título
            bodyFontSize: 10,              // Tamaño de cuerpo reducido (antes 12)
            smallFontSize: 8               // Para información secundaria
        };

        // 3. Encabezado empresarial (con fuentes más pequeñas)
        doc.setFont("Helvetica", "bold").setFontSize(config.headerFontSize);
        doc.text("SM TABACOS S. DE R.L. C. V.", 105, 12, { align: "center" });

        doc.setFont("Helvetica", "normal").setFontSize(config.bodyFontSize);
        doc.text("SABOR DEL MUNDO TABACOS", 105, 18, { align: "center" });

        doc.setFontSize(config.smallFontSize);
        doc.text("Bo. Gualiquemes, frente a Uniplaza, Danlí, El Paraíso", 105, 24, { align: "center" });
        doc.text("R.T.N. 07039021310105 | Tel. 3179-2213 / 9842-2707", 105, 30, { align: "center" });
        doc.text("E-mail: smtabacos@yahoo.com", 105, 36, { align: "center" });

        // Línea separadora más delgada
        doc.setLineWidth(0.3).line(config.pageMargin, 40, 210 - config.pageMargin, 40);

        // 4. Función para cargar imagen (sin cambios)
        async function getBase64Image(url) {
            try {
                const response = await fetch(url);
                const blob = await response.blob();
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            } catch (error) {
                console.error("Error al cargar la imagen:", error);
                return null;
            }
        }

        // 5. Cargar y agregar foto del empleado (tamaño reducido)
        const urlCompleta = empleado.foto ? empleado.foto : 'https://via.placeholder.com/150?text=Sin+Foto';
     
        //const urlImagen = nombreImagen ? `${rutaBase}${nombreImagen}` : `${rutaBase}predeterminado.png`;
        
        const imgData = await getBase64Image(urlCompleta);
        if (imgData) {
            const imgX = (210 - config.imageSize) / 2;
            doc.addImage(imgData, "JPEG", imgX, 45, config.imageSize, config.imageSize);
        }

        // 6. Título del documento (tamaño reducido)
        doc.setFont("Helvetica", "bold").setFontSize(config.titleFontSize);
        doc.text("Hoja de Vida del Empleado", 105, 45 + config.imageSize + 8, { align: "center" });

        const formatValue = (value) => {
            if (value === null || value === undefined || value === "null") return "N/A";
            if (typeof value === "boolean") return value ? "Sí" : "No";
            if (typeof value === "number") {
                // Caso especial para el campo activo (1 o 0)
                if (value === 1 || value === 0) {
                    return value === 1 ? "Sí" : "No";
                }
                return value.toString();
            }
            if (value instanceof Date || typeof value === "string") {
                return value.split("T")[0];
            }
            return String(value);
        };

        const addWrappedText = (doc, text, x, y, maxWidth, lineHeight) => {
            const lines = doc.splitTextToSize(text, maxWidth);
            doc.text(lines, x, y);
            return lines.length * lineHeight;
        };

        // 8. Datos del empleado (posición inicial ajustada)
        let yPosition = 45 + config.imageSize + 15;

        const campos = [
            ["Nombre", empleado.nombre],
            ["Puesto", empleado.puesto],
            ["Tipo de Contrato", empleado.tipo_contrato],
            ["Sueldo Base", empleado.sueldo_base],
            ["Activo", empleado.activo],
            ["Fecha de Contratación", empleado.fecha_contratacion],
            ["Número de Identidad", empleado.numero_identidad],
            ["Teléfono", empleado.telefono],
            ["Domicilio", empleado.domicilio],
            ["Estado Civil", empleado.estado_civil],
            ["Sexo", empleado.sexo],
            ["Fecha de Egreso", empleado.fecha_egreso],
            ["Nivel Educativo", empleado.nivel_educativo],
            ["Nombre de Emergencia", empleado.nombre_emergencia],
            ["Teléfono de Emergencia", empleado.telefono_emergencia],
            ["Lugar de Nacimiento", empleado.lugar_nacimiento],
            ["Fecha de Nacimiento", empleado.fecha_nacimiento],
            ["Tipo de Contrato de Empleo", empleado.tipo_contrato_empleo],
            ["Beneficiarios", empleado.beneficiarios],
            ["Nacionalidad", empleado.nacionalidad],
        ];

        // 9. Agregar campos al PDF con texto más pequeño
        campos.forEach(([label, value]) => {
            const formattedValue = formatValue(value);
            
            // Agregar etiqueta en negrita
            doc.setFont("Helvetica", "bold").setFontSize(config.bodyFontSize)
               .text(`${label}:`, config.pageMargin, yPosition);
            
            // Agregar valor con tamaño de fuente ligeramente más pequeño
            doc.setFont("Helvetica", "normal").setFontSize(config.bodyFontSize);
            const textX = config.pageMargin + config.labelWidth;
            const heightUsed = addWrappedText(
                doc, 
                formattedValue, 
                textX, 
                yPosition, 
                config.valueWidth, 
                config.lineHeight
            );
            
            yPosition += Math.max(config.lineHeight, heightUsed);
            
            // Manejo de nueva página
            if (yPosition > 280) {
                doc.addPage();
                yPosition = config.pageMargin;
                // Opcional: repetir encabezado en nuevas páginas
                doc.setFontSize(config.smallFontSize)
                   .text("Hoja de Vida - Continuación", config.pageMargin, yPosition);
                yPosition += config.lineHeight;
            }
        });

        // 10. Guardar el PDF
        const nombreArchivo = `HV_${empleado.nombre.replace(/\s+/g, "_").substring(0, 30)}.pdf`;
        doc.save(nombreArchivo);

    } catch (error) {
        console.error("Error al generar PDF:", error);
        alert("Error al generar el PDF: " + error.message);
    }
}

function cerrarSesion() {
    localStorage.removeItem('authToken');
    alert("Sesión cerrada");
    window.location.href = "../../login.html";
}

// Función para editar un empleado
function editarEmpleado(id) {
    window.location.href = `./actualizar/actualizarEmpleado.html?id=${id}`; 
}

/* ========== FUNCIONES PARA EL MENÚ FLOTANTE ========== */

function inicializarMenuFlotante() {
    const menuToggle = document.querySelector('.menu-toggle');
    const floatingMenu = document.querySelector('.floating-menu');
    
    if (menuToggle && floatingMenu) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            floatingMenu.classList.toggle('active');
        });
        
        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (!floatingMenu.contains(e.target)) {
                floatingMenu.classList.remove('active');
            }
        });
    }
}

// Navegación del menú flotante
function navegar(destino) {
    // Cerrar el menú al seleccionar una opción
    document.querySelector('.floating-menu').classList.remove('active');
    
    switch(destino) {
        case 'asistencia':
            window.location.href = '../asistencia/dashboard.html';
            break;
        case 'nomina':
            alert("🛠️ Este apartado está en desarrollo. 🛠️");
            window.location.href = '#';
            break;
        case 'derechos':
            alert("🛠️ Este apartado está en desarrollo. 🛠️");
            window.location.href = '#';
            break;
        default:
            console.log('Destino no reconocido');
    }
}