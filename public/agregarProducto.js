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

const tdChk = document.createElement("td");
const tdNombre = document.createElement("td");
const tdPrecio = document.createElement("td");
const tdCategoria = document.createElement("td");
const btnAgregar = document.createElement("button");
const btnCancelar = document.createElement("button");
const llamadorVerde = document.getElementById("llamadorVerde")
const thCheck = document.createElement("td")

llamadorVerde.onclick = () => {

}
import {importar} from './cajaCobro.js'
thCheck.innerHTML = "Agregar"
tdNombre.innerHTML = "Nombre"
tdPrecio.innerHTML = "Precio por unidad"
tdCategoria.innerHTML = "Categoría"
tabla.appendChild(th)
tabla.appendChild(tb)
th.appendChild(tdChk);
tabla.classList.add("table")
tabla.classList.add("table-bordered")
tabla.style.color = "white"
th.appendChild(tdNombre);
th.appendChild(tdPrecio);
th.appendChild(tdCategoria);

row2.classList.add("d-flex");
row2.classList.add("form");

row2.appendChild(input);
row2.appendChild(button)
input.type = "text"

const heading  = document.createElement("p")

heading.innerHTML = "Agregar producto manualmente"


container.classList.add("container")
container.classList.add("pad")
tabla.classList.add("mt-4")

bloqueador.classList.add("bloqueador")
windowAgregar.classList.add("windowAgregar");
row1.classList.add("row");
button.innerHTML = "Buscar"
container.appendChild(heading)
windowAgregar.appendChild(container);
container.appendChild(row1);
container.appendChild(row2);
container.appendChild(tabla);
row1.appendChild(heading);
btnCancelar.innerHTML = "Cancelar"
btnAgregar.innerHTML = "Agregar a la compra"
btnCancelar.classList.add("btnCancelar")
btnAgregar.classList.add("btnAgregar")
container.appendChild(btnCancelar)

container.appendChild(btnAgregar)
input.focus()
	const funcion = () => {
//	alert("Acá se va a desplegar el modal agregarProduto, que ya está escrito.")
	
	bodyDoc[0].appendChild(bloqueador)
	bloqueador.appendChild(windowAgregar);

}

/*const generadorFilas = () => {
	for(let i = 3; i >= 0; i--) {
		const tr = document.createElement("tr");
		const tdNom = document.createElement("td")
		const tdPrec = document.createElement("td")
		const tdCant = document.createElement("td")
		
		tdNom.innerHTML = "ejemplo"
		tdPrec.innerHTML = "ejemplo"
		tdCant.innerHTML = "ejemplo"

		tr.appendChild(tdNom)
		tr.appendChild(tdPrec)
		tr.appendChild(tdCant)

		tb.appendChild(tr)
	}
}

generadorFilas()*/

//axios
let arrProductos = []
export let agregarArriba = []
btnAgregar.onclick = () => {
	console.log("Se va a agregar")
	
	arrProductos.map(prod => {
			if (prod.agregado == true) {
			let toPush = {}
			toPush.nombre = prod.nombre;
			toPush.precioMinorista = prod.precioMinorista;
			toPush.cantidadAgregada = prod.cantidadAgregada
			toPush.impuestoPrecio = prod.impuestoPrecio
			toPush.id = prod._id
			
				agregarArriba.push(toPush)
			
		}

	})
	console.log(agregarArriba)
	importar()
	bodyDoc[0].removeChild(bloqueador)
	console.log(tabla.children[1].innerHTML = "")
	 arrProductos = []
	agregarArriba = []
	textBuscar.focus()

}

row2.addEventListener("submit", async e => {
	e.preventDefault()
	const nombremarca = input.value;
	input.value = "";


	try {
		const res = await axios.post('/buscanombre', {search_query: nombremarca});
		const producto = res.data;
		arrProductos.push({
			nombre: producto[0].nombre,
			precio: producto[0].precioMinorista,
			cantidadAgregada: 1,
			agregado: true,
			impuestoPrecio:  (producto[0].precioMinorista).toFixed(2),
			_id: producto[0]._id
	
		})
		let arrIndex = arrProductos.length - 1

		console.log(arrProductos)
		const tr = document.createElement("tr");
		const tdChk = document.createElement("td")
		const tdNom = document.createElement("td")
		const tdPrec = document.createElement("td")
		const tdCant = document.createElement("td")
		const checkBox = document.createElement("div")
		checkBox.classList.add("chkFalse")
		checkBox.innerHTML = "&#10003;"
		
		let check = true;
		

		tr.addEventListener("click", () => {
			if (check == true) {
				check = false;
				checkBox.innerHTML = ""
				arrProductos[arrIndex].agregado = false;
				console.log(arrProductos)
				return
			}

			if (check == false) {
				check = true;
				checkBox.innerHTML = "&#10003;"
			arrProductos[arrIndex].agregado = true;

				console.log(arrProductos)

		

				return
			}
		})

		tdChk.appendChild(checkBox) 
		tdNom.innerHTML = producto[0].nombre
		tdPrec.innerHTML = producto[0].precioMinorista
		tdCant.innerHTML = producto[0].categoriaInterna
		tr.appendChild(tdChk)
		tr.appendChild(tdNom)
		tr.appendChild(tdPrec)
		tr.appendChild(tdCant)
		tb.appendChild(tr)
	} catch (error){
		console.log(error)
	}
})



btnCancelar.onclick = () => {
	 arrProductos = []
	agregarArriba = []
	bodyDoc[0].removeChild(bloqueador)
	textBuscar.focus()


}

llamadorAgregarProducto.onclick = () => {

funcion()
}

llamadorVerde.onclick = () => {
	funcion()
}
