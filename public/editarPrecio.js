const llamador = document.getElementById("cambiarPrecio");

import {textBuscar} from './cajaCobro.js'
const llamadorAgregarProducto = document.getElementById("agregarProducto");
const form = document.getElementById("cajaCobroForm")
const bloqueador = document.createElement("div");
const bodyDoc = document.getElementsByTagName("body");
const windowAgregar = document.createElement("div")
const container = document.createElement("div")
const row1 = document.createElement("div")
const row2= document.createElement("form")
const input = document.createElement("input");
const button = document.createElement("button");
const tabla = document.createElement("table");
const th = document.createElement("thead");
const tb = document.createElement("tbody");
const btnCancelar = document.createElement("button");
const btnAceptar = document.createElement("button");
const formEditar = document.createElement("form");
const pNombre = document.createElement("p");
const iMinorista = document.createElement("input");
const iMayorista = document.createElement("input");
const iCosto = document.createElement("input");
const lMinorista = document.createElement("label");
const lMayorista = document.createElement("label");
const lCosto = document.createElement("label");
const idDom = document.createElement("p") 
pNombre.classList.add("mt-4")
iMinorista.classList.add("mb-2");

lMinorista.innerHTML = "Precio minorista";
lMayorista.innerHTML = "Precio mayorista";
lCosto.innerHTML = "Precio costo";

row2.classList.add("d-flex");
row2.classList.add("form");

row2.appendChild(input);
row2.appendChild(button)
input.type = "text"

const heading  = document.createElement("p")

heading.innerHTML = "Buscar producto cuyo precio desea modificar"


container.classList.add("container")
container.classList.add("pad")

bloqueador.classList.add("bloqueador")
windowAgregar.classList.add("windowAgregar");
row1.classList.add("row");
button.innerHTML = "Buscar"
container.appendChild(heading)
windowAgregar.appendChild(container);
container.appendChild(row1);
container.appendChild(row2);
btnCancelar.innerHTML = "Cancelar"
btnAceptar.innerHTML = "Guardar edición"
btnAceptar.classList.add("btnAgregar")
btnCancelar.classList.add("btnCancelar")
container.appendChild(btnCancelar)
container.appendChild(btnAceptar)

const alertar = (mensaje, color) => {
	const pop = document.createElement("div")
	pop.innerHTML = mensaje 
	pop.classList.add("alert")
	pop.classList.add(color)
	pop.style.position = "fixed"
	pop.style.top = "0";
	
	pop.style.width = "100%"
	bodyDoc[0].appendChild(pop)
	setTimeout(() => {
		bodyDoc[0].removeChild(pop)	
	}, 3000)
}

input.focus()
	const funcion = () => {
	
	bodyDoc[0].appendChild(bloqueador)
	bloqueador.appendChild(windowAgregar);

}


//axios
let arrProductos = []
export let agregarArriba = []


row2.addEventListener("submit", async e => {
	e.preventDefault()
	const nombremarca = input.value;
	input.value = "";


	try {
		const res = await axios.post('/buscanombre', {search_query: nombremarca});
		const producto = res.data;
		idDom.innerHTML = producto[0]._id;
		
		pNombre.innerHTML = producto[0].nombre;
		iMinorista.value = producto[0].precioMinorista
		iMayorista.value = producto[0].precioMayorista
		iCosto.value = producto[0].precioCosto
		container.appendChild(formEditar)
		formEditar.appendChild(pNombre);
		formEditar.appendChild(lMinorista)
		formEditar.appendChild(iMinorista)
		formEditar.appendChild(lMayorista)
		formEditar.appendChild(iMayorista)
		formEditar.appendChild(lCosto)
		formEditar.appendChild(iCosto)



	} catch (error){
		console.log(error)
	}
})



btnCancelar.onclick = () => {
	 arrProductos = []
	agregarArriba = []

	bodyDoc[0].removeChild(bloqueador)
	container.removeChild(formEditar)
	pNombre.innerHTML = ""
	IMinorista.innerHTML = ""
	IMayorista.innerHTML = ""
	ICosto.innerHTML = ""
	idDom.innerHTML = ""
	textBuscar.focus()


}

btnAceptar.onclick = async () => {
	try {
		const send = await axios.put(`/administrador/productos/precmay/${idDom.innerHTML}`, {precioMayorista: iMayorista.value})
	}

	catch (error) {
		console.log(error)
	alertar(error, "alert-success")

		return
		
	}

	try {
		const send = await axios.put(`/administrador/productos/precmin/${idDom.innerHTML}`, {precioMinorista: iMinorista.value})
	}

	catch (error) {
		console.log(error)
	alertar(error, "alert-success")

		return
	}


	try {
		const send = await axios.put(`/administrador/productos/preccos/${idDom.innerHTML}`, {precioCosto: iCosto.value})
	}
	catch (error) {
		console.log(error)
	alertar(error, "alert-success")

		return
	}
	
	bodyDoc[0].removeChild(bloqueador)
	container.removeChild(formEditar)
	pNombre.innerHTML = ""
	iMinorista.innerHTML = ""
	iMayorista.innerHTML = ""
	iCosto.innerHTML = ""
	idDom.innerHTML = ""
	textBuscar.focus()
	alertar("Datos guardados correctamente", "alert-success")

}

llamador.onclick = () => {

funcion()
}


