/**
 * EDIT PRICE MODULE
 * Maneja la edición individual de precios de productos
 */

const idPrec = document.getElementById("idPrec")
const subnav = document.getElementsByClassName("subnav");
const body = document.getElementsByTagName("body");
body[0].style.backgroundColor = "#fff"
subnav[0].style.display = "none"

// Elementos del DOM
const aumPorMin = document.getElementById("aumPorMin")
const aumManMin = document.getElementById("aumManMin")
const precioMinorista = document.getElementById("precioMinorista")
const minRes = document.getElementById("minRes")

const aumPorMay = document.getElementById("aumPorMay")
const aumManMay = document.getElementById("aumManMay")
const precioMayorista = document.getElementById("precioMayorista")
const manRes = document.getElementById("manRes")

const aumPorCos = document.getElementById("aumPorCos")
const aumManCos = document.getElementById("aumManCos")
const precioCosto = document.getElementById("precioCosto")
const cosRes = document.getElementById("cosRes")

// Variables de estado
let nuevoMinorista = parseFloat(precioMinorista.innerHTML)
let nuevoMayorista = parseFloat(precioMayorista.innerHTML)
let nuevoCosto = parseFloat(precioCosto.innerHTML)

// ALERT SYSTEM
const alertar = (mensaje, color, producto = "") => {
	const pop = document.createElement("div")
	pop.innerHTML = mensaje + (producto ? ' "' + producto + '"' : '')
	pop.classList.add("alert")
	pop.classList.add(color)
	pop.style.position = "fixed"
	pop.style.top = "0"
	pop.style.width = "100%"
	body[0].appendChild(pop)
	setTimeout(() => {
		body[0].removeChild(pop)	
	}, 3000)
}

// ==================================================
// PRECIO MINORISTA
// ==================================================
aumPorMin.addEventListener("input", e => {
	const incremento = parseFloat(e.target.value) || 0
	nuevoMinorista = (incremento * precioMinorista.innerHTML / 100) + parseFloat(precioMinorista.innerHTML)
	minRes.innerHTML = `$${nuevoMinorista.toFixed(2)}`
	aumManMin.value = ""
})

aumManMin.addEventListener("input", e => {
	nuevoMinorista = parseFloat(e.target.value) || 0	
	minRes.innerHTML = `$${nuevoMinorista.toFixed(2)}`
	aumPorMin.value = ""
})

// ==================================================
// PRECIO MAYORISTA
// ==================================================
aumPorMay.addEventListener("input", e => {
	const incremento = parseFloat(e.target.value) || 0
	nuevoMayorista = (incremento * precioMayorista.innerHTML / 100) + parseFloat(precioMayorista.innerHTML)
	manRes.innerHTML = `$${nuevoMayorista.toFixed(2)}`
	aumManMay.value = ""
})

aumManMay.addEventListener("input", e => {
	nuevoMayorista = parseFloat(e.target.value) || 0	
	manRes.innerHTML = `$${nuevoMayorista.toFixed(2)}`
	aumPorMay.value = ""
})

// ==================================================
// PRECIO COSTO
// ==================================================
aumPorCos.addEventListener("input", e => {
	const incremento = parseFloat(e.target.value) || 0
	nuevoCosto = (incremento * precioCosto.innerHTML / 100) + parseFloat(precioCosto.innerHTML)
	cosRes.innerHTML = `$${nuevoCosto.toFixed(2)}`
	aumManCos.value = ""
})

aumManCos.addEventListener("input", e => {
	nuevoCosto = parseFloat(e.target.value) || 0	
	cosRes.innerHTML = `$${nuevoCosto.toFixed(2)}`
	aumPorCos.value = ""
})

// ==================================================
// FORM SUBMIT HANDLERS
// ==================================================
const subMin = document.getElementById("subMin")
const subMay = document.getElementById("subMay")
const subCos = document.getElementById("subCos")

subMin.addEventListener("submit", async e => {
	e.preventDefault()

	if (minRes.innerHTML == "" || minRes.innerHTML == "-") {
		alertar("No se registran cambios en el producto", "alert-danger", idPrec.value)
		return
	} 

	if (minRes.innerHTML != "$NaN" && nuevoMinorista >= 0) {
		try {
			const send = await axios.put(`/administrador/productos/${idPrec.value}/precmin`, {
				precioMinorista: nuevoMinorista 
			})
			
			if (send.data.success) {
				alertar("Se actualizó el precio minorista del producto", "alert-success", send.data.data.nombre)
				// Actualizar valor mostrado
				precioMinorista.innerHTML = nuevoMinorista.toFixed(2)
				minRes.innerHTML = "-"
				aumPorMin.value = ""
				aumManMin.value = ""
			} else {
				alertar("Error: " + send.data.message, "alert-danger", "")
			}
		} catch (error) {
			console.log(error)
			const errorMsg = error.response?.data?.message || error.message || "Error desconocido"
			alertar("Error al guardar precio minorista", "alert-danger", errorMsg)
		} 
	}
})

subMay.addEventListener("submit", async e => {
	e.preventDefault()

	if (manRes.innerHTML == "" || manRes.innerHTML == "-") {
		alertar("No se registran cambios en el producto", "alert-danger", idPrec.value)
		return
	} 

	if (manRes.innerHTML != "$NaN" && nuevoMayorista >= 0) {
		try {
			const send = await axios.put(`/administrador/productos/${idPrec.value}/precmay`, {
				precioMayorista: nuevoMayorista 
			})
			
			if (send.data.success) {
				alertar("Se actualizó el precio mayorista del producto", "alert-success", send.data.data.nombre)
				// Actualizar valor mostrado
				precioMayorista.innerHTML = nuevoMayorista.toFixed(2)
				manRes.innerHTML = "-"
				aumPorMay.value = ""
				aumManMay.value = ""
			} else {
				alertar("Error: " + send.data.message, "alert-danger", "")
			}
		} catch (error) {
			console.log(error)
			const errorMsg = error.response?.data?.message || error.message || "Error desconocido"
			alertar("Error al guardar precio mayorista", "alert-danger", errorMsg)
		} 
	}
})

subCos.addEventListener("submit", async e => {
	e.preventDefault()

	if (cosRes.innerHTML == "" || cosRes.innerHTML == "-") {
		alertar("No se registran cambios en el producto", "alert-danger", idPrec.value)
		return
	} 

	if (cosRes.innerHTML != "$NaN" && nuevoCosto >= 0) {
		try {
			const send = await axios.put(`/administrador/productos/${idPrec.value}/preccos`, {
				precioCosto: nuevoCosto 
			})
			
			if (send.data.success) {
				alertar("Se actualizó el precio costo del producto", "alert-success", send.data.data.nombre)
				// Actualizar valor mostrado
				precioCosto.innerHTML = nuevoCosto.toFixed(2)
				cosRes.innerHTML = "-"
				aumPorCos.value = ""
				aumManCos.value = ""
			} else {
				alertar("Error: " + send.data.message, "alert-danger", "")
			}
		} catch (error) {
			console.log(error)
			const errorMsg = error.response?.data?.message || error.message || "Error desconocido"
			alertar("Error al guardar precio costo", "alert-danger", errorMsg)
		} 
	}
})
