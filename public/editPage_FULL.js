/**
 * EDIT PAGE (STOCK) MODULE - REWRITTEN WITH DEBUG
 * Maneja la edición de stock e información básica del producto
 * 
 * Flujo:
 * 1. User ve campos disabled (lectura)
 * 2. Click en "✏️ Editar" → Habilita campos
 * 3. Click en "💾 Guardar" → Valida y envía PUT
 * 4. Éxito → Redirige a detalle
 */

console.log('✅ editPage.js cargado');

//Se oculta el subnav
const subnav = document.getElementsByClassName("subnav");
const body = document.getElementsByTagName("body");

// Obtener elementos del DOM - CON VERIFICACIÓN
const form = document.getElementById("formEdit");
const codigo = document.getElementById("codigoProducto");
const nombre = document.getElementById("nombreProducto");
const cantidad = document.getElementById("cantidadProducto");
const marca = document.getElementById("marcaProducto");
const precioMinorista = document.getElementById("precioMinorista");
const precioMayorista = document.getElementById("precioMayorista");
const precioCosto = document.getElementById("precioCosto");
const categoriaInterna = document.getElementById("categoriaInterna");
const id = document.getElementById("id");
const peso = document.getElementById("peso");
const fechaDeVencimiento = document.getElementById("fechaDeVencimiento");
const impuesto = document.getElementById("impuesto");
const editGuar = document.getElementById("editGuar");

// DEBUG: Verificar que todos los elementos existen
console.log('Elementos del DOM:');
console.log('- form:', form ? '✅' : '❌', form);
console.log('- codigo:', codigo ? '✅' : '❌', codigo);
console.log('- nombre:', nombre ? '✅' : '❌', nombre);
console.log('- cantidad:', cantidad ? '✅' : '❌', cantidad);
console.log('- marca:', marca ? '✅' : '❌', marca);
console.log('- precioMinorista:', precioMinorista ? '✅' : '❌', precioMinorista);
console.log('- precioMayorista:', precioMayorista ? '✅' : '❌', precioMayorista);
console.log('- precioCosto:', precioCosto ? '✅' : '❌', precioCosto);
console.log('- categoriaInterna:', categoriaInterna ? '✅' : '❌', categoriaInterna);
console.log('- id:', id ? '✅' : '❌', id);
console.log('- peso:', peso ? '✅' : '❌', peso);
console.log('- fechaDeVencimiento:', fechaDeVencimiento ? '✅' : '❌', fechaDeVencimiento);
console.log('- impuesto:', impuesto ? '✅' : '❌', impuesto);
console.log('- editGuar:', editGuar ? '✅' : '❌', editGuar);

// Verificación crítica
if (!form) {
	console.error('❌ CRITICAL: formEdit no encontrado');
	throw new Error('formEdit no encontrado en el DOM');
}

if (!editGuar) {
	console.error('❌ CRITICAL: editGuar no encontrado');
	throw new Error('editGuar no encontrado en el DOM');
}

console.log('✅ Todos los elementos necesarios encontrados');

// Estado
let disabled = true;

// Default no obligatorias
if (fechaDeVencimiento && fechaDeVencimiento.value == "") {
	fechaDeVencimiento.value = "";
}

if (peso && peso.value == "") {
	peso.value = "";
}

if (body[0]) {
	body[0].style.backgroundColor = "#fff";
}

if (subnav[0]) {
	subnav[0].style.display = "none";
}

/**
 * ALERT SYSTEM - Notificaciones visuales
 */
const alertar = (mensaje, color, producto = "") => {
	const pop = document.createElement("div");
	pop.innerHTML = mensaje + (producto ? ' "' + producto + '"' : '');
	pop.classList.add("alert");
	pop.classList.add(color);
	pop.style.position = "fixed";
	pop.style.top = "0";
	pop.style.width = "100%";
	pop.style.zIndex = "9999";
	if (body[0]) {
		body[0].appendChild(pop);
	}
	setTimeout(() => {
		try {
			if (body[0]) {
				body[0].removeChild(pop);
			}
		} catch (e) {}
	}, 3000);
};

/**
 * TOGGLE FUNCTION - Habilitar/Deshabilitar campos
 */
const toggleEditMode = () => {
	console.log('🔄 Toggling edit mode...');
	if (codigo) codigo.disabled = !codigo.disabled;
	if (cantidad) cantidad.disabled = !cantidad.disabled;
	if (categoriaInterna) categoriaInterna.disabled = !categoriaInterna.disabled;
	if (peso) peso.disabled = !peso.disabled;
	if (fechaDeVencimiento) fechaDeVencimiento.disabled = !fechaDeVencimiento.disabled;
	if (impuesto) impuesto.disabled = !impuesto.disabled;
	console.log('✅ Toggle completo. Disabled ahora:', disabled);
};

console.log('✅ Funciones definidas');

/**
 * FORM SUBMISSION HANDLER
 */
if (form) {
	console.log('✅ Agregando event listener a form');
	
	form.addEventListener("submit", async e => {
		e.preventDefault();
		console.log('📝 Form submitted. Disabled state:', disabled);

		// Toggle mode: edit/view
		if (disabled == true) {
			// ENABLE EDIT MODE
			console.log('📝 Habilitando modo edición...');
			toggleEditMode();
			disabled = false;
			if (editGuar) {
				editGuar.innerHTML = "💾 Guardar Cambios";
			}
			alertar("✏️ Modo edición activado", "alert-info");
			console.log('✅ Modo edición habilitado');
			return;
		}

		// SAVE CHANGES
		console.log('💾 Intentando guardar cambios...');
		try {
			// ========== VALIDACIONES ==========

			// Validar código
			if (!codigo.value || codigo.value.trim() === '') {
				alertar("❌ El código de barra es requerido", "alert-danger");
				console.warn('❌ Validación: Código vacío');
				return;
			}

			// Validar cantidad
			if (!cantidad.value || isNaN(cantidad.value) || parseInt(cantidad.value) < 0) {
				alertar("❌ La cantidad debe ser un número mayor o igual a 0", "alert-danger");
				console.warn('❌ Validación: Cantidad inválida');
				return;
			}

			// Validar categoría
			if (!categoriaInterna.value || categoriaInterna.value.trim() === '') {
				alertar("❌ La categoría es requerida", "alert-danger");
				console.warn('❌ Validación: Categoría vacía');
				return;
			}

			// Validar impuesto
			if (!impuesto.value || impuesto.value === '') {
				alertar("❌ El impuesto es requerido", "alert-danger");
				console.warn('❌ Validación: Impuesto vacío');
				return;
			}

			console.log('✅ Todas las validaciones pasaron');

			// Desactivar campos durante envío
			if (editGuar) {
				editGuar.innerHTML = "⏳ Guardando...";
				editGuar.disabled = true;
			}
			toggleEditMode();
			disabled = true;

			// ========== ENVIAR PUT REQUEST ==========
			const datosEnvio = {
				codigo: codigo.value,
				nombre: nombre.value,
				cantidad: parseInt(cantidad.value),
				marca: marca.value,
				precioMinorista: precioMinorista.value,
				precioMayorista: precioMayorista.value,
				precioCosto: precioCosto.value,
				categoria: categoriaInterna.value,
				peso: peso.value || null,
				fechaDeVencimiento: fechaDeVencimiento.value || null,
				impuestoAplicado: impuesto.value
			};

			console.log('📤 Enviando datos:', datosEnvio);

			const send = await axios.put(`/administrador/productos/${id.value}`, datosEnvio);

			console.log('✅ Respuesta del servidor:', send.data);

			// ========== ÉXITO ==========
			alertar("✅ Producto actualizado correctamente", "alert-success", send.data.nombre || nombre.value);
			if (editGuar) {
				editGuar.innerHTML = "✏️ Editar";
				editGuar.disabled = false;
			}

			// Redirigir después de 1.5 segundos
			setTimeout(() => {
				console.log('🔄 Redirigiendo a detalle...');
				window.location.href = `/administrador/productos/${id.value}`;
			}, 1500);

		} catch (error) {
			// ========== ERROR HANDLING ==========

			console.error('❌ Error al guardar:', error);

			// Re-habilitar campos en caso de error
			toggleEditMode();
			disabled = false;
			if (editGuar) {
				editGuar.innerHTML = "💾 Guardar Cambios";
				editGuar.disabled = false;
			}

			// Extraer mensaje de error
			const errorMsg = error.response?.data?.message || error.message || "Error desconocido al guardar";

			// Mostrar alerta
			alertar(`❌ Error: ${errorMsg}`, "alert-danger");

			// Log para debugging
			console.error("Error al guardar producto:", error);
			console.error("Datos enviados:", datosEnvio);
			if (error.response) {
				console.error("Status:", error.response.status);
				console.error("Data:", error.response.data);
			}
		}
	});
	
	console.log('✅ Event listener agregado exitosamente');
} else {
	console.error('❌ No se pudo encontrar el formulario para agregar event listener');
}

console.log('✅ editPage.js completamente inicializado');
