/**
 * EDIT PAGE (STOCK) MODULE - REWRITTEN
 * Maneja la edición de stock e información básica del producto
 * 
 * Flujo:
 * 1. User ve campos disabled (lectura)
 * 2. Click en "✏️ Editar" → Habilita campos
 * 3. Click en "💾 Guardar" → Valida y envía PUT
 * 4. Éxito → Redirige a detalle
 */

//Se oculta el subnav
const subnav = document.getElementsByClassName("subnav");
const body = document.getElementsByTagName("body");
const form = document.getElementById("formEdit")
const codigo = document.getElementById("codigoProducto")
const nombre = document.getElementById("nombreProducto")
const cantidad = document.getElementById("cantidadProducto");
const marca = document.getElementById("marcaProducto")
const precioMinorista = document.getElementById("precioMinorista")
const precioMayorista = document.getElementById("precioMayorista")
const precioCosto = document.getElementById("precioCosto")
const categoriaInterna = document.getElementById("categoriaInterna")
const id = document.getElementById("id")
const peso = document.getElementById("peso")
const fechaDeVencimiento = document.getElementById("fechaDeVencimiento")
const impuesto = document.getElementById("impuesto")
let disabled = true;
const editGuar = document.getElementById("editGuar")

// Default no obligatorias
if (fechaDeVencimiento.value == "") {
 fechaDeVencimiento.value = ""
}

if (peso.value == "") {
	peso.value = ""
}

body[0].style.backgroundColor = "#fff"
subnav[0].style.display = "none"

/**
 * ALERT SYSTEM - Notificaciones visuales
 */
const alertar = (mensaje, color, producto = "") => {
	const pop = document.createElement("div")
	pop.innerHTML = mensaje + (producto ? ' "' + producto + '"' : '')
	pop.classList.add("alert")
	pop.classList.add(color)
	pop.style.position = "fixed"
	pop.style.top = "0"
	pop.style.width = "100%"
	pop.style.zIndex = "9999"
	body[0].appendChild(pop)
	setTimeout(() => {
		try {
			body[0].removeChild(pop)
		} catch(e) {}
	}, 3000)
}

/**
 * TOGGLE FUNCTION - Habilitar/Deshabilitar campos
 */
const toggleEditMode = () => {
	codigo.disabled = !codigo.disabled;
	cantidad.disabled = !cantidad.disabled;
	categoriaInterna.disabled = !categoriaInterna.disabled;
	peso.disabled = !peso.disabled;
	fechaDeVencimiento.disabled = !fechaDeVencimiento.disabled;
	impuesto.disabled = !impuesto.disabled;
}

/**
 * FORM SUBMISSION HANDLER
 */
form.addEventListener("submit", async e => {
	e.preventDefault()
	
	// Toggle mode: edit/view
	if (disabled == true) {
		// ENABLE EDIT MODE
		toggleEditMode();
		disabled = false;
		editGuar.innerHTML = "💾 Guardar Cambios"
		alertar("✏️ Modo edición activado", "alert-info");
		return
	}
	
	// SAVE CHANGES
	try {
		// ========== VALIDACIONES ==========
		
		// Validar código
		if (!codigo.value || codigo.value.trim() === '') {
			alertar("❌ El código de barra es requerido", "alert-danger");
			return
		}

		// Validar cantidad
		if (!cantidad.value || isNaN(cantidad.value) || parseInt(cantidad.value) < 0) {
			alertar("❌ La cantidad debe ser un número mayor o igual a 0", "alert-danger");
			return
		}

		// Validar categoría
		if (!categoriaInterna.value || categoriaInterna.value.trim() === '') {
			alertar("❌ La categoría es requerida", "alert-danger");
			return
		}

		// Validar impuesto
		if (!impuesto.value || impuesto.value === '') {
			alertar("❌ El impuesto es requerido", "alert-danger");
			return
		}

		// Desactivar campos durante envío
		editGuar.innerHTML = "⏳ Guardando..."
		editGuar.disabled = true;
		toggleEditMode();
		disabled = true;

		// ========== ENVIAR PUT REQUEST ==========
		const send = await axios.put(`/administrador/productos/${id.value}`, {
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
		})

		// ========== ÉXITO ==========
		alertar("✅ Producto actualizado correctamente", "alert-success", send.data.nombre || nombre.value)
		editGuar.innerHTML = "✏️ Editar"
		editGuar.disabled = false;
		
		// Redirigir después de 1.5 segundos
		setTimeout(() => {
			window.location.href = `/administrador/productos/${id.value}`
		}, 1500)

	} catch (error) {
		// ========== ERROR HANDLING ==========
		
		// Re-habilitar campos en caso de error
		toggleEditMode();
		disabled = false;
		editGuar.innerHTML = "💾 Guardar Cambios"
		editGuar.disabled = false;

		// Extraer mensaje de error
		const errorMsg = error.response?.data?.message || error.message || "Error desconocido al guardar";
		
		// Mostrar alerta
		alertar(`❌ Error: ${errorMsg}`, "alert-danger");
		
		// Log para debugging
		console.error("Error al guardar producto:", error);
		console.error("Datos enviados:", {
			codigo: codigo.value, 
			nombre: nombre.value, 
			cantidad: cantidad.value, 
			marca: marca.value, 
			categoria: categoriaInterna.value, 
			peso: peso.value, 
			fechaDeVencimiento: fechaDeVencimiento.value, 
			impuestoAplicado: impuesto.value
		});
	}
})
