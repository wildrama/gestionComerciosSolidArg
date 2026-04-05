import { iniciar } from "./edit.js";
import { agregarArriba } from "./agregarProducto.js"
import { arrEliminar } from './eliminarDeCaja.js'
//Elementos
const borrarInvisible = document.getElementById("borrarInvisible")
export const textBuscar = document.getElementById("textBuscar");
const cajaCobroForm = document.getElementById("cajaCobroForm");
const sbBuscar = document.getElementById("sbBuscar");
const tablaCajaCobro = document.getElementById("tablaCajaCobro");
const totalHTML = document.getElementById("total");
const dineroIngresado = document.getElementById("dineroIngresado");
const vuelto = document.getElementById("vuelto");
const imprimirTicketC = document.getElementById("imprimirTicketC");
const cancelarCompra = document.getElementById("cancelarCompra");
const cambiarPrecio = document.getElementById("cambiarPrecio");
const imprimirTicketA = document.getElementById("imprimirTicketA");
const eliminarProductos = document.getElementById("eliminarProductos");
const agregarProducto = document.getElementById("agregarProducto");
const finalizarCompra = document.getElementById("finalizarCompra");
const bBody = document.getElementsByTagName("body")
const ul = document.getElementById("ulOfertas")
const idEstacion = document.getElementById("idEstacion").innerHTML;

const estacionDeCobroID = document.querySelector('#inputEstacionDeCobroID').value;
const idUsuario = document.querySelector('#inputUsuarioID').value;
const textoVentaFinalizada = document.querySelector('#textoVentaFinalizada');
bBody[0].classList.add("body")
textBuscar.focus()
//Variables globales

export let productosAgregados = [{ nombre: "vacio", precio: 0, cantidadAgregada: 1, impuestoPrecio: 0, id: 123, borrado: false }];
export let productosSeleccionados = []
let cantidad;
let index;
let totalGlobal;
let vueltoGlobal;
let ingresoDinero = 0;
dineroIngresado.value = "0";


//Funciones

let ultimo = 0;
let ofertasIndividuales = []

//fetch ofertas


window.onload = async () => {
	try {
		await axios.get(`/caja/ofertasFetch/?idESTACION=${idEstacion}`).then(res => {

			const ofertas = res.data;
			ofertas.ofertasIndividualesParaEstacion.map(oferta => {
				ofertasIndividuales.push(oferta)
				console.log(oferta)

			})	




			ofertas.ofertasConjuntoParaEstacion.map(oferta => {
				const li = document.createElement("li");
				li.innerHTML = `${oferta.nombreOferta}: $${oferta.precioOferta}`
				li.onclick = () => {
					const tr = document.createElement("tr");
					const thNombre = document.createElement("td");
					thNombre.innerHTML = oferta.nombreOferta;
					const thPrecio = document.createElement("td");
					const divPrecio = document.createElement("div");
					const signoPrecio = document.createElement("p");
					const checkbox = document.createElement("input");
					checkbox.setAttribute("type", "checkbox");
					checkbox.classList.add("check");

					signoPrecio.innerHTML = "$"
					signoPrecio.innerHTML = "$";
					divPrecio.innerHTML = (oferta.precioOferta).toFixed(2);
					divPrecio.style.width = "100px";
					divPrecio.style.height = "30px";
					divPrecio.style.display = "flex";
					divPrecio.style.justifyContent = "center";
					thPrecio.style.display = "flex";
					thPrecio.style.justifyContent = "left";
					thPrecio.appendChild(signoPrecio)
					thPrecio.appendChild(divPrecio)
					const thCantidad = document.createElement("td");
					const thSubtotal = document.createElement("td");
					const thCheck = document.createElement("td");
					thCheck.appendChild(checkbox);
					thSubtotal.innerHTML = `$${(oferta.precioOferta)}`;

					tr.appendChild(thNombre)
					tr.appendChild(thCantidad)
					tr.appendChild(thNombre);
					tr.appendChild(thCantidad);
					tr.classList.add(productosAgregados.length)
					tr.appendChild(thPrecio);
					tr.appendChild(thSubtotal);
					tr.appendChild(thCheck);
					thPrecio.style.cursor = "pointer"
					tablaCajaCobro.appendChild(tr)

					checkbox.addEventListener('change', () => {

						console.log(checkbox.checked)
						if (checkbox.checked == true) {
							productosSeleccionados.push(tr.classList.value)
						} else {

							for (let i = 0; i < productosSeleccionados.length; i++) {
								if (productosSeleccionados[i] == tr.classList.value) {
									productosSeleccionados.splice(i, 1);
								}
							}
						}
						if (productosSeleccionados.length > 0) {

							borrarInvisible.style.visibility = "visible";
						} else {
							borrarInvisible.style.visibility = "hidden"
						}
						console.log(productosSeleccionados)
					})

					productosAgregados.push({
						nombre: oferta.nombreOferta,
						precio: parseFloat(oferta.precioOferta),
						cantidadAgregada: 1,
						impuestoPrecio: parseFloat(oferta.precioOferta),
						idArr: productosAgregados.length
						


					})

					console.log(productosAgregados)

					sumarConImpuesto()
					textBuscar.focus()


				}
				ul.appendChild(li)

			})
		}

		)
	} catch (error) {
		console.log(error)
	}

}

dineroIngresado.addEventListener('click', function(e){
	dineroIngresado.value = "";
});

// window.addEventListener('keyPress',function(e){
// 	e.f12
// })




hotkeys('f2', function (event, handler){
	switch (handler.key) {
	  case 'f2': textBuscar.focus() ;
		break;
  
  
	  default: textBuscar.focus();
	}
  });




export const agregarFiambre = (nombre, precio, id) => {
	let fiambre = {
		nombre: nombre,
		precio: precio,
		cantidadAgregada: 1,
		impuestoPrecio: precio,
		idArr: id,
		borrado: false

	}

	productosAgregados.push(fiambre)
	sumarConImpuesto()
	textBuscar.focus()
	console.log(productosAgregados)
}







export const eliminar = () => {
	console.log(productosAgregados)
	console.log("Los productos que estan agregados son:")
	console.log(productosAgregados)
	console.log("Los productos que se van a intentar eliminar son:")
	console.log(arrEliminar)
	
	arrEliminar.map(arr => {
		for (let i = 0; i < productosAgregados.length; i++) {
			console.log(`Se va a comparar ${arr} con ${productosAgregados[i].nombre}`)
			if (arr == productosAgregados[i].nombre) {
				productosAgregados[i].borrado = true;
				console.log(productosAgregados)
				const trEspecifico = document.getElementsByClassName(productosAgregados[i].idArr)
				console.log(trEspecifico)
				trEspecifico[0].style.display = "none"

				productosAgregados[i].cantidadAgregada = 0;
				sumarConImpuesto()
				textBuscar.focus()

			}
		}

	})

	console.log(productosAgregados)
}

export const importar = () => {
	agregarArriba.map(importando => {
		let aAg = {
			nombre: importando.nombre,
			precio: importando.precio,
			cantidadAgregada: importando.cantidadAgregada,
			impuestoPrecio: importando.impuestoPrecio,
			id: importando.id,
			borrado: false
		}

		for (let i = 0; i < productosAgregados.length; i++) {
			if (productosAgregados[i].nombre == aAg.nombre) {
				document.getElementsByClassName(productosAgregados[i].idArr)[0].style.visibility = "visible"
			}
		}
		let check = false;
		const tr = document.createElement("tr");
		sumarConImpuesto()
		textBuscar.focus()

		productosAgregados.map(prod => {

			sumarConImpuesto()
	
			if (prod.nombre == aAg.nombre || (prod.nombre == aAg.nombre && prod.borrado == true)) {
				check = true;
				prod.cantidadAgregada = prod.cantidadAgregada + 1;
				let fila = document.getElementsByClassName(prod.idArr);
				fila[0].children[1].innerHTML = prod.cantidadAgregada;
				fila[0].children[3].innerHTML = prod.cantidadAgregada * prod.impuestoPrecio;
				fila[0].style.display = "table-row"





				ofertasIndividuales.map(oferta => {

					productosAgregados.map(producto => {
						if (producto.id == oferta.productoEnOferta) {
							if (producto.cantidadAgregada >= oferta.cantidadDeUnidadesNecesarias) {
								let cuantas = parseInt(producto.cantidadAgregada) / parseInt(oferta.cantidadDeUnidadesNecesarias);
								cuantas = parseInt(cuantas)
								let resto = producto.cantidadAgregada % oferta.cantidadDeUnidadesNecesarias;
								console.log("Cantidad de ofertas: " + cuantas)
								console.log("Resto: " + resto)
								for (let i = 1; i <= cuantas; i++) {
									productosAgregados.push({
										nombre: oferta.nombreOferta,
										cantidadAgregada: 1,
										impuestoPrecio: oferta.precioOferta,
										borrado: false

									})
								}
								console.log(productosAgregados)
								document.getElementsByClassName(producto.idArr)[0].childNodes[1].innerHTML = resto
								if (document.getElementsByClassName(producto.idArr)[0].childNodes[1].innerHTML == 0) {
									document.getElementsByClassName(producto.idArr)[0].style.display = "none";
								} else {
									document.getElementsByClassName(producto.idArr)[0].style.display = "table-row";
									
								}
								const tr = document.createElement("tr")
								const thNombre = document.createElement("td");
								const thCantidad = document.createElement("td")
								thNombre.innerHTML = "Oferta en " + producto.nombre;
								thCantidad.innerHTML = cuantas
								const thPrecio = document.createElement("td");
								thPrecio.innerHTML = "$" + oferta.precioOferta
								console.log(oferta)
								console.log("aca no")
								const checkbox = document.createElement("input");
								checkbox.setAttribute("type", "checkbox");
								checkbox.classList.add("check");
								const thSubtotal = document.createElement("td");
								const thCheck = document.createElement("td");
								thCheck.appendChild(checkbox);
								thSubtotal.innerHTML = `$${oferta.precioOferta * cuantas}`;

								tr.appendChild(thNombre)
								tr.appendChild(thCantidad)
								tr.appendChild(thNombre);
								tr.appendChild(thCantidad);

								tr.appendChild(thPrecio);
								tr.appendChild(thSubtotal);
								tr.appendChild(thCheck);
								thPrecio.style.cursor = "pointer"
								tablaCajaCobro.appendChild(tr)




								producto.cantidadAgregada = resto;









								sumarConImpuesto()
								textBuscar.focus()

							}
						}
					})
				})




				sumarConImpuesto()
				textBuscar.focus()

			}







		})

		if (check == false) {
			productosAgregados.push(aAg);
			sumarConImpuesto()

			const tdNombre = document.createElement("td")
			const tdPrecio = document.createElement("td")
			const tdCantidad = document.createElement("td")
			const tdSubtotal = document.createElement("td")
			const pSubtotal = document.createElement("p")
			const divPrecio = document.createElement("div")
			const pSigno = document.createElement("p")
			const checkbox = document.createElement("input");
			checkbox.setAttribute("type", "checkbox");
			checkbox.classList.add("check");


		

			checkbox.addEventListener('change', () => {

				console.log(checkbox.checked)
				if (checkbox.checked == true) {
					productosSeleccionados.push(tr.classList.value)
				} else {

					for (let i = 0; i < productosSeleccionados.length; i++) {
						if (productosSeleccionados[i] == tr.classList.value) {
							productosSeleccionados.splice(i, 1);
						}
					}
				}
				if (productosSeleccionados.length > 0) {

					borrarInvisible.style.visibility = "visible";
				} else {
					borrarInvisible.style.visibility = "hidden"
				}
				console.log(productosSeleccionados)
				textBuscar.focus()

			})

			tdNombre.innerHTML = aAg.nombre
			tdCantidad.innerHTML = aAg.cantidadAgregada
			//tdPrecio.innerHTML = aAg.impuestoPrecio
			tdPrecio.appendChild(pSigno)
			tdPrecio.appendChild(divPrecio)
			divPrecio.innerHTML = aAg.impuestoPrecio
			divPrecio.style.width = "100px"
			divPrecio.style.height = "30px"
			divPrecio.style.display = "flex"
			divPrecio.style.justifyContent = "center";
			tdPrecio.style.display = "flex"
			tdPrecio.style.justifyContent = "left"
			pSigno.innerHTML = "$"
			tdPrecio.appendChild(pSigno)
			tdPrecio.appendChild(divPrecio)
			pSubtotal.innerHTML = `$${aAg.impuestoPrecio * aAg.cantidadAgregada}`;
			tdSubtotal.appendChild(pSubtotal);
			const thCheck = document.createElement("td");
			tr.appendChild(tdNombre);
			tr.appendChild(tdCantidad)
			tr.appendChild(tdPrecio)
			tr.appendChild(tdSubtotal)
			thCheck.appendChild(checkbox)
			tr.appendChild(thCheck)
			tr.style.display = "table-row"
			tablaCajaCobro.appendChild(tr)
			tr.classList.add(productosAgregados.length - 1)
			ultimo = productosAgregados.length - 1
			aAg.idArr = productosAgregados.length - 1;

			tdPrecio.style.cursor = "pointer"
			document.getElementsByClassName(ultimo)[0].childNodes[1].style.color = "yellow"
			let yaNo = false;
			tdPrecio.onclick = () => {
				if (yaNo == false) {
					divPrecio.style.border = "1px solid #f9f9f9"
					divPrecio.style.borderRadius = "5px"
					let precioACambiar = (aAg.precioMinorista + aAg.impuestoAplicado * aAg.precioMinorista / 100).toFixed(2);
					divPrecio.innerHTML = ""
					const nuevoPrecioText = document.createElement("input");
					nuevoPrecioText.classList.add("nuevoPrecio")
					nuevoPrecioText.type = "text";
					nuevoPrecioText.placeholder = productosAgregados[tr.classList].impuestoPrecio

					divPrecio.appendChild(nuevoPrecioText)
					nuevoPrecioText.focus()
					yaNo = true;
					tr.style.display = "table-row"
					nuevoPrecioText.addEventListener("keypress", e => {
						if (e.key == "Enter") {

							productosAgregados[tr.classList].impuestoPrecio = e.target.value;
							productosAgregados[tr.classList].impuestoPrecio = parseFloat(productosAgregados[tr.classList].impuestoPrecio).toFixed(2)
							let aMostrar = (productosAgregados[tr.classList].impuestoPrecio * productosAgregados[tr.classList].cantidadAgregada)
							aMostrar = aMostrar.toFixed(2)
							sumarConImpuesto()
							tdSubtotal.innerHTML = "$" + aMostrar


						}
					})
					nuevoPrecioText.addEventListener("focusout", () => {
						yaNo = false;
						divPrecio.innerHTML = productosAgregados[tr.classList].impuestoPrecio
						divPrecio.style.border = "none"
						textBuscar.focus()

					})

				}
			}
		}
	})
}



const buscarLetras = str => {
	return false;
}

const sumarTotal = () => {

	let sum = 0;

	for (let i = 0; i < productosAgregados.length; i++) {
		sum += productosAgregados[i].precio * productosAgregados[i].cantidadAgregada;

		return sum.toFixed(2);

	}
}
export const sumarConImpuesto = () => {
	let sum = 0.00;

	for (let i = 0; i < productosAgregados.length; i++) {
		sum = sum + productosAgregados[i].impuestoPrecio * productosAgregados[i].cantidadAgregada;

		totalGlobal = sum.toFixed(2);
		totalHTML.innerHTML = "TOTAL: $" + sum.toFixed(2);
		vuelto.innerHTML = "$" + (ingresoDinero - totalGlobal).toFixed(2);
		
	}

}


//Eventos

dineroIngresado.addEventListener('input', e => {
	ingresoDinero = e.target.value;
	let totalMenosVuelto = e.target.value - totalGlobal;
	vueltoGlobal = totalMenosVuelto.toFixed(2);
	vuelto.innerHTML = "$" + vueltoGlobal;
	if (vuelto.innerHTML == "$NaN") {
		vuelto.innerHTML == "$0.00"
	}


})


const updateTotalConVuelto = () => {
	letTotalMenosVuelto = ingresoDinero.value - totalGlobal;
	vueltoGlobal = totalMenosVuelto.toFixed(2);
	vuelto.innerHTML = "$" + vueltoGlobal;

}


textBuscar.addEventListener("input", () => {
	textBuscar.style.backgroundColor = "#c4c4c4";
})


//Axios

cajaCobroForm.addEventListener('submit', async e => {
	e.preventDefault();
	const codigoactual = textBuscar.value;

	if (buscarLetras(codigoactual) == true) {
		textBuscar.value = "";
		textBuscar.style.backgroundColor = "#ffd6db";
		return;
	}


	try {

		const res = await axios.post('/caja/buscar', { codigo: codigoactual });
		const producto = res.data;
		if (producto.nombre == undefined) {
			textBuscar.value = "";
			textBuscar.style.backgroundColor = 'pink'
			return
		}
		textBuscar.value = "";


		for (let i = 0; i < productosAgregados.length; i++) {
			if (productosAgregados[i].nombre == producto.nombre) {
				document.getElementsByClassName(productosAgregados[i].idArr)[0].style.visibility = "visible"
			}
		}

		const tr = document.createElement("tr");
		const thNombre = document.createElement("td");
		thNombre.innerHTML = producto.nombre;
		const thPrecio = document.createElement("td");
		const divPrecio = document.createElement("div");
		const signoPrecio = document.createElement("p");
		const checkbox = document.createElement("input");
		checkbox.setAttribute("type", "checkbox");
		checkbox.classList.add("check");

		signoPrecio.innerHTML = "$"
		signoPrecio.innerHTML = "$";
		divPrecio.innerHTML = (producto.precioMinorista + producto.impuestoAplicado * producto.precioMinorista / 100).toFixed(2);
		divPrecio.style.width = "100px";
		divPrecio.style.height = "30px";
		divPrecio.style.display = "flex";
		divPrecio.style.justifyContent = "center";
		thPrecio.style.display = "flex";
		thPrecio.style.justifyContent = "left";
		thPrecio.appendChild(signoPrecio)
		thPrecio.appendChild(divPrecio)
		const thCantidad = document.createElement("td");
		const thSubtotal = document.createElement("td");
		const thCheck = document.createElement("td");
		thCheck.appendChild(checkbox);
		thSubtotal.innerHTML = `$${(producto.precioMinorista + producto.impuestoAplicado * producto.precioMinorista / 100).toFixed(2)}`;

		tr.appendChild(thNombre)
		tr.appendChild(thCantidad)
		tr.appendChild(thNombre);
		tr.appendChild(thCantidad);

		tr.appendChild(thPrecio);
		tr.appendChild(thSubtotal);
		tr.appendChild(thCheck);
		thPrecio.style.cursor = "pointer"

		checkbox.addEventListener('change', () => {

			console.log(checkbox.checked)
			if (checkbox.checked == true) {
				productosSeleccionados.push(tr.classList.value)
			} else {

				for (let i = 0; i < productosSeleccionados.length; i++) {
					if (productosSeleccionados[i] == tr.classList.value) {
						productosSeleccionados.splice(i, 1);
					}
				}
			}
			if (productosSeleccionados.length > 0) {

				borrarInvisible.style.visibility = "visible";
			} else {
				borrarInvisible.style.visibility = "hidden"
			}
			console.log(productosSeleccionados)
		})

		thPrecio.style.cursor = "pointer";
		let yaNo = false;
		thPrecio.addEventListener("click", () => {
			if (yaNo == false) {
				divPrecio.style.border = "1px solid #F9F9F9"
				divPrecio.style.borderRadius = "5px"
				let precioACambiar = (producto.precioMinorista + producto.impuestoAplicado * producto.precioMinorista / 100).toFixed(2);
				divPrecio.innerHTML = ""
				const nuevoPrecioText = document.createElement("input");
				nuevoPrecioText.classList.add("nuevoPrecio")
				nuevoPrecioText.type = "text";
				nuevoPrecioText.placeholder = productosAgregados[tr.classList].impuestoPrecio

				divPrecio.appendChild(nuevoPrecioText)
				nuevoPrecioText.focus()
				yaNo = true;
				checkbox.valor = tr.classList.value;
				nuevoPrecioText.addEventListener("keypress", e => {
					if (e.key == "Enter") {

						productosAgregados[tr.classList].impuestoPrecio = e.target.value;
						productosAgregados[tr.classList].impuestoPrecio = parseFloat(productosAgregados[tr.classList].impuestoPrecio).toFixed(2)
						let aMostrar = (productosAgregados[tr.classList].impuestoPrecio * productosAgregados[tr.classList].cantidadAgregada)
						aMostrar = aMostrar.toFixed(2)
						sumarConImpuesto()
						thSubtotal.innerHTML = "$" + aMostrar

						
					}
				})

				nuevoPrecioText.addEventListener("focusout", () => {
					yaNo = false;
					divPrecio.innerHTML = productosAgregados[tr.classList].impuestoPrecio
					divPrecio.style.border = "none"


				})


			}
		})




		tr.onclick = () => {
			window.sessionStorage.setItem("codigo", producto.codigo)

		}


		// esta?
		textBuscar.blur()
		let check = false;
		productosAgregados.map(itemProducto => {
			if (itemProducto.nombre == producto.nombre) {
				check = true;

				const trEspecifico = document.getElementsByClassName(itemProducto.idArr)
				itemProducto.cantidadAgregada = itemProducto.cantidadAgregada + 1;
				trEspecifico[0].childNodes[1].innerHTML = itemProducto.cantidadAgregada;
				trEspecifico[0].childNodes[3].innerHTML = "$" + (itemProducto.cantidadAgregada * itemProducto.impuestoPrecio).toFixed(2)
				trEspecifico[0].style.display = "table-row"
				sumarConImpuesto()
				textBuscar.focus()

				ofertasIndividuales.map(oferta => {

					productosAgregados.map(producto => {
						if (producto.id == oferta.productoEnOferta) {
							if (producto.cantidadAgregada >= oferta.cantidadDeUnidadesNecesarias) {
								let cuantas = parseInt(producto.cantidadAgregada) / parseInt(oferta.cantidadDeUnidadesNecesarias);
								cuantas = parseInt(cuantas)
								let resto = producto.cantidadAgregada % oferta.cantidadDeUnidadesNecesarias;
								console.log("Cantidad de ofertas: " + cuantas)
								console.log("Resto: " + resto)
								for (let i = 1; i <= cuantas; i++) {
									productosAgregados.push({
										nombre: oferta.nombreOferta,
										cantidadAgregada: 1,
										impuestoPrecio: oferta.precioOferta,
										borrado: false

									})
								}
								console.log(productosAgregados)
								document.getElementsByClassName(producto.idArr)[0].childNodes[1].innerHTML = resto
								if (document.getElementsByClassName(producto.idArr)[0].childNodes[1].innerHTML == 0) {
									document.getElementsByClassName(producto.idArr)[0].style.display = "none";
								} else {
									document.getElementsByClassName(producto.idArr)[0].style.display = "table-row";

								}
								const tr = document.createElement("tr")
								const thNombre = document.createElement("td");
								const thCantidad = document.createElement("td")
								thNombre.innerHTML = "Oferta en " + producto.nombre;
								thCantidad.innerHTML = cuantas
								const thPrecio = document.createElement("td");
								thPrecio.innerHTML = "$" + oferta.precioOferta
								console.log(oferta)
								console.log("aca no")
								const checkbox = document.createElement("input");
								checkbox.setAttribute("type", "checkbox");
								checkbox.classList.add("check");
								const thSubtotal = document.createElement("td");
								const thCheck = document.createElement("td");
								thCheck.appendChild(checkbox);
								thSubtotal.innerHTML = `$${oferta.precioOferta * cuantas}`;

								tr.appendChild(thNombre)
								tr.appendChild(thCantidad)
								tr.appendChild(thNombre);
								tr.appendChild(thCantidad);

								tr.appendChild(thPrecio);
								tr.appendChild(thSubtotal);
								tr.appendChild(thCheck);
								thPrecio.style.cursor = "pointer"
								tablaCajaCobro.appendChild(tr)




								producto.cantidadAgregada = resto;









								sumarConImpuesto()
								textBuscar.focus()

							}
						}
					})
				})
			}
		})

		if (check == false) {

			productosAgregados.push({
				nombre: producto.nombre,
				precio: producto.precioMinorista,
				impuestoPrecio: producto.precioMinorista,
				marca: producto.marca,
				cantidadAgregada: 1,
				idArr: productosAgregados.length,
				id: producto._id,
				backup: producto.precioMinorista,
				borrado: false
			})
			thCantidad.innerHTML = 1;
			tablaCajaCobro.appendChild(tr)
			tr.classList.add(productosAgregados.length - 1)
			ultimo = productosAgregados.length - 1
			sumarConImpuesto()
			console.log(productosAgregados)
			textBuscar.focus()



		}

		productosAgregados.map(productoArray => {
			index = productosAgregados.findIndex(() => productoArray.nombre == producto.nombre);
		})


		//


		// const multiplicador = (x) => {
		// 	let index = ultimo;
		// 	console.log(index)
		// 	productosAgregados[index].cantidadAgregada = x;
		// 	document.getElementsByClassName(index)[0].childNodes[1].innerHTML = x;
		// 	document.getElementsByClassName(index)[0].childNodes[3].innerHTML = "$" + productosAgregados[index].impuestoPrecio * productosAgregados[index].cantidadAgregada;
		// 	console.log(productosAgregados[index].impuestoPrecio)
		// 	console.log(productosAgregados[index])


		// 	ofertasIndividuales.map(oferta => {

		// 		productosAgregados.map(producto => {
		// 			if (producto.id == oferta.productoEnOferta) {
		// 				if (producto.cantidadAgregada == oferta.cantidadDeUnidadesNecesarias) {
		// 					producto.impuestoPrecio = oferta.precioOferta / oferta.cantidadDeUnidadesNecesarias
		// 					document.getElementsByClassName(producto.idArr)[0].childNodes[2].innerHTML = "$" + oferta.precioOferta

		// 					document.getElementsByClassName(producto.idArr)[0].childNodes[3].innerHTML = "$" + oferta.precioOferta
		// 					sumarConImpuesto()
		// 				}
		// 			}
		// 		})
		// 	})





		// 	sumarConImpuesto()
		// 	return

		// }


		// function logKey(e) {
		// 	let key = e.code.slice(5, 6);
		// 	switch (key) {
		// 		case "1":
		// 			multiplicador(1)
		// 			break;
		// 		case "2":
		// 			multiplicador(2)

		// 			return;

		// 		case "3":
		// 			multiplicador(3)

		// 			break;

		// 		case "4":
		// 			multiplicador(4)

		// 			break;

		// 		case "5":
		// 			multiplicador(5)

		// 			break;

		// 		case "6":
		// 			multiplicador(6)

		// 			break;

		// 		case "7":
		// 			multiplicador(7)

		// 			break;

		// 		case "8":
		// 			multiplicador(8)

		// 			break;

		// 		case "9":
		// 			multiplicador(9)

		// 			break;


		// 	}

		// }
		

		

	



		//

	} catch (error) {
		if (error == "TypeError: producto is null") {
			textBuscar.focus()

			textBuscar.value = "";
			textBuscar.style.backgroundColor = "#ffd6db";
		}
	}
})

//Botonena

cancelarCompra.onclick = () => {
	textBuscar.style.backgroundColor = "#c4c4c4";
	tablaCajaCobro.innerHTML = "";
	productosAgregados = [{ nombre: "vacio", precio: 0, cantidadAgregada: 1, impuestoPrecio: 0 }]
	totalGlobal = 0;
	totalHTML.innerHTML = "TOTAL: $"
	vueltoGlobal = 0;
	dineroIngresado.value = "";
	vuelto.innerHTML = "$"
	textBuscar.focus()

}


//datos a pushear 


const productosDeStockArr = ()=>{
	productosAgregados.map()
}
const tipoDePagoCheck = document.querySelector('#flexCheckDefault')
let tipoDePagosTR = "EFECTIVO";
tipoDePagoCheck.addEventListener("change", (e) => {
	if (e.target.checked) {
	  tipoDePagosTR = 'OTRO';
	  console.log(tipoDePagosTR)
	} else {
		tipoDePagosTR = 'EFECTIVO';
		console.log(tipoDePagosTR)

	}
  });
  
//   const printTag = document.querySelector('#prinTag')
//   let ticketSINOSTR = "";
//   tipoDePagoCheck.addEventListener("click", (e) => {
// 	  if (e.target.checked) {
// 		tipoDePagosTR = 'OTRO';
// 		console.log(tipoDePagosTR)
// 	  } else {
// 		  tipoDePagosTR = 'EFECTIVO';
// 		  console.log(tipoDePagosTR)
  
// 	  }
// 	});

finalizarCompra.onclick = async () => {

	if (productosAgregados.length < 2) {
		alert("No agregaste productos")
		textBuscar.focus()
		return
	}
	if (vueltoGlobal == undefined || vueltoGlobal < 0) {
		alert("monto ingresado invalido")
		textBuscar.focus()
		return
	}


	//Maqueta de datos, remotamente la definitiva.

	let cantidadTotal = 0;
	productosAgregados.map(p => {
		cantidadTotal = p.cantidadAgregada + cantidadTotal
	})
	cantidadTotal = cantidadTotal - 1;


	const stringValorDelProducto = () => {
		let stringBase = ""
		productosAgregados.map(p => {
			if (p.nombre != "vacio") {
				stringBase = stringBase + `${p.nombre}x${p.cantidadAgregada}: $${p.cantidadAgregada}\n`


			}
		})
		textBuscar.focus()
		return stringBase;



	}
	// const ventaRealizada = {

	// }

	const res = await axios.post('/save/save-venta', {
		dineroIngresado: ingresoDinero,
		dineroDeSalida: vueltoGlobal,
		productosDeStock: [
			{
				valorDelProductoEnLaCompra: 'stringValorDelProducto()',
				identificadorDeProducto: '624488cac68a3c3a7b2df4ec'
			}
		],
		productosSinStock: [
			{
				valorDelProductoEnLaCompra: 'stringValorDelProducto()',
				identificadorDeProducto: 'SinSTOCK'
			}
		],
		ticket: "NO",
		tipoDePago: tipoDePagosTR,
		cantidadDeProductosTotales: cantidadTotal,
		estacionDeCobro: idEstacion,
		nombreDelUsuario: idUsuario
	})


	textoVentaFinalizada.innerHTML = "Venta efectuada correctamente!"

	function finalizarCompraTXT(){
		textoVentaFinalizada.innerHTML = ""
	}
	  
	  setTimeout(finalizarCompraTXT, 2000);

	console.log("EL OBJETO QUE SE VA A IMPORTAR:")
	// console.log(ventaRealizada)
	console.log("LO QUE DICE LA PROPIEDAD valorDelProducto EN EL OBJETO:")
	// console.log(ventaRealizada.valorDelProducto)

	// set time out para el aler de venta finalizada
	
	
	console.log(res)

	

	textBuscar.style.backgroundColor = "#c4c4c4";
	tablaCajaCobro.innerHTML = "";
	productosAgregados = [{ nombre: "vacio", precio: 0, cantidadAgregada: 1, impuestoPrecio: 0 }]
	totalGlobal = 0;
	totalHTML.innerHTML = "TOTAL: $"
	vueltoGlobal = 0;
	dineroIngresado.value = "";
	vuelto.innerHTML = "$"

	textBuscar.focus()
	
}

borrarInvisible.onclick = () => {
	productosSeleccionados.map(item => {
		for (let i = 0; i < productosAgregados.length; i++) {
			if (productosAgregados[i].idArr == item) {
				const domRow = document.getElementsByClassName(i.toString())[0]
				console.log(i)
				domRow.style.display = "none"


				productosAgregados[i].cantidadAgregada = 0;
				productosAgregados[i].impuestoPrecio = productosAgregados[i].backup
				document.getElementsByClassName(productosAgregados[i].idArr)[0].childNodes[2].innerHTML = "$" + productosAgregados[i].impuestoPrecio



			}
		}
	})

	console.log(productosAgregados)
	sumarConImpuesto()

	let todosLosChecks = document.getElementsByClassName("check")
	todosLosChecks = Array.from(todosLosChecks)
	console.log(todosLosChecks)
	todosLosChecks.map(item => {
		item.checked = false;
	})


	productosSeleccionados = []
	borrarInvisible.style.visibility = "hidden";
}
// productos: [
// 	{
// 		valorDelProductoEnLaCompra:
// 		{
// 			type: Number
// 		},
// 		identificadorDeProducto:
// 		{
// 			type: Schema.Types.ObjectId,
// 			ref: Producto
// 		}
// 	}
// ]


