/**
 * EDIT PAGE (STOCK) MODULE
 * Maneja la edición de stock y información básica del producto
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

// Alert system
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

form.addEventListener("submit", async e => {
	e.preventDefault()
	
	// Toggle mode: edit/view
	if (disabled == true) {
		// Enable edit mode
		codigo.disabled = false;
		nombre.disabled = false;
		cantidad.disabled = false;
		marca.disabled = false;
		categoriaInterna.disabled = false;
		peso.disabled = false;
		fechaDeVencimiento.disabled = false;
		impuesto.disabled = false
		disabled = false;
		editGuar.innerHTML = "💾 Guardar Cambios"
		return
	}
	
	// Save changes
	try {
		// Validaciones básicas
		if (!cantidad.value || isNaN(cantidad.value) || cantidad.value < 0) {
			alertar("La cantidad debe ser un número mayor o igual a 0", "alert-danger", "")
			return
		}

		// Desactivar campos y cambiar botón
		codigo.disabled = true;
		nombre.disabled = true;
		cantidad.disabled = true;
		marca.disabled = true;
		categoriaInterna.disabled = true;
		fechaDeVencimiento.disabled = true;
		peso.disabled = true;
		impuesto.disabled = true
		disabled = true;
		editGuar.innerHTML = "✏️ Editar"

		// Enviar PUT request
		const send = await axios.put(`/administrador/productos/${id.value}`, {
			codigo: codigo.value, 
			nombre: nombre.value, 
			cantidad: parseInt(cantidad.value), 
			marca: marca.value, 
			precioMinorista: precioMinorista.value, 
			precioMayorista: precioMayorista.value, 
			precioCosto: precioCosto.value, 
			categoria: categoriaInterna.value, 
			peso: peso.value, 
			fechaDeVencimiento: fechaDeVencimiento.value, 
			impuestoAplicado: impuesto.value
		})

		// Mostrar éxito
		alertar("✅ Se modificaron los valores en el producto", "alert-success", send.data.nombre || nombre.value)
		
		// Redirigir después de 1.5 segundos
		setTimeout(() => {
			window.location.href = `/administrador/productos/${id.value}`
		}, 1500)

	} catch (error) {
		// Re-habilitar campos en caso de error
		codigo.disabled = true;
		nombre.disabled = true;
		cantidad.disabled = true;
		marca.disabled = true;
		categoriaInterna.disabled = true;
		fechaDeVencimiento.disabled = true;
		peso.disabled = true;
		impuesto.disabled = true;
		disabled = true;
		editGuar.innerHTML = "✏️ Editar"

		const errorMsg = error.response?.data?.message || error.message || "Error desconocido"
		alertar("❌ Error al guardar cambios", "alert-danger", errorMsg)
		console.log("Error:", error)
	}
})
