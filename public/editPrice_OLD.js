const idPrec = document.getElementById("idPrec")
const subnav = document.getElementsByClassName("subnav");
const body = document.getElementsByTagName("body");
body[0].style.backgroundColor = "#fff"
subnav[0].style.display = "none"
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

//valores a cambiar

let nuevoMinorista = precioMinorista.innerHTML
let nuevoMayorista = precioMayorista.innerHTML
let nuevoCosto = precioCosto.innerHTML



//alert

const alertar = (mensaje, color, producto) => {
	const pop = document.createElement("div")
	pop.innerHTML = mensaje + ' "' + producto + '"'
	pop.classList.add("alert")
	pop.classList.add(color)
	pop.style.position = "fixed"
	pop.style.top = "0";
	
	pop.style.width = "100%"
	body[0].appendChild(pop)
	setTimeout(() => {
		body[0].removeChild(pop)	
	}, 3000)
}



//minorista
aumPorMin.addEventListener("input", e => {
	nuevoMinorista=  (e.target.value * precioMinorista.innerHTML / 100) + parseFloat(precioMinorista.innerHTML)
	minRes.innerHTML = `$${nuevoMinorista.toFixed(2)}`

	aumManMin.value = ""
})

aumManMin.addEventListener("input", e => {
	nuevoMinorista = e.target.value	
	minRes.innerHTML = `$${nuevoMinorista}`

	aumPorMin.value = ""
})



//mayorista
aumPorMay.addEventListener("input", e => {
	nuevoMayorista =  (e.target.value * precioMayorista.innerHTML / 100) + parseFloat(precioMayorista.innerHTML)
	manRes.innerHTML = `$${nuevoMayorista.toFixed(2)}`

	aumManMay.value = ""
})

aumManMay.addEventListener("input", e => {
	nuevoMayorista = e.target.value	
	manRes.innerHTML = `$${nuevoMayorista}`

	aumPorMay.value = ""
})

//costo
aumPorCos.addEventListener("input", e => {
	nuevoCosto =  (e.target.value * precioCosto.innerHTML / 100) + parseFloat(precioCosto.innerHTML)
	cosRes.innerHTML = `$${nuevoCosto.toFixed(2)}`
	aumManCos.value = ""
})

aumManCos.addEventListener("input", e => {
	nuevoCosto = e.target.value	
	cosRes.innerHTML = `$${nuevoCosto}`
	
	aumPorCos.value = ""
})



//submit

const subMin = document.getElementById("subMin")
const subMay = document.getElementById("subMay")
const subCos = document.getElementById("subCos")

subMin.addEventListener("submit", async e => {
	e.preventDefault()

	if (minRes.innerHTML == "") {
	alertar("No se registran cambios en el producto", "alert-danger", idPrec.innerHTML )
	} 

	if (minRes.innerHTML != "" && minRes.innerHTML != "$NaN" ) {
		try {
		const send = await axios.put(`/administrador/productos/precmin/${idPrec.innerHTML}`, {precioMinorista: nuevoMinorista })
		alertar("Se actualizó el precio minorista del producto","alert-success", send.data.nombre)		
		} catch (error) {
			console.log(error)
		} 


}})


subMay.addEventListener("submit", async e => {
	e.preventDefault()

	if (manRes.innerHTML == "") {
		alertar("No se registran cambios en el producto", "alert-danger", idPrec.innerHTML )
	} 

	if (manRes.innerHTML != "" && manRes.innerHTML != "$NaN" ) {
		try {
		const send = await axios.put(`/administrador/productos/precmay/${idPrec.innerHTML}`, {precioMayorista: nuevoMayorista })
		alertar("Se actualizó el precio mayorista del producto","alert-success", send.data.nombre)	
	
		} catch (error) {
			console.log(error)
		} 




}})

subCos.addEventListener("submit", async e => {

	e.preventDefault()

	if (cosRes.innerHTML == "") {
	alertar("No se registran cambios en el producto", "alert-danger", idPrec.innerHTML )
	} 

	if (cosRes.innerHTML != "" && cosRes.innerHTML != "$NaN" ) {
		try {
		const send = await axios.put(`/administrador/productos/preccos/${idPrec.innerHTML}`, {precioCosto: nuevoCosto })
		alertar("Se actualizó el precio costo del producto","alert-success", send.data.nombre)	
		} catch (error) {
			console.log(error)
		} 
	
	


}})
