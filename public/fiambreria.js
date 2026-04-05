import {agregarFiambre, productosAgregados, productosSeleccionados, sumarConImpuesto} from './cajaCobro.js'
const call = document.getElementById("callFiambreria");
const body = document.getElementsByTagName("body")[0];
const block = document.createElement("div")
const tablaCajaCobro = document.getElementById("tablaCajaCobro");
block.style.height = "100%";
block.style.width = "100%"
block.style.backgroundColor = "rgba(0, 0, 0, 0.6)"

block.style.position = "absolute"
block.style.top = "0"
block.style.display = "flex"
block.style.justifyContent = "center"
block.style.alignItems = "center"

const div = document.createElement("div");
div.style.color = "black"
div.style.padding = "1rem";
div.style.borderRadius = "10px"
div.style.backgroundColor = "#fff";
div.style.height = "200px"



div.innerHTML = `
<h2>Escanee o tipee el código del producto</h2>
<input id="inputFiambre" class="w-100 p-1" type="text">


`
block.appendChild(div)

let precioACargar = 0

call.onclick = () => {
	body.appendChild(block)
	
	const inputFiambre = document.getElementById("inputFiambre")
	inputFiambre.addEventListener("input", e => {
		if(e.target.value.length == 13) {
			let precio = e.target.value.slice(5, 12)
			let entero = precio.slice(0, 5)
			let decimal = precio.slice(5, 7)
			precio = entero + "." + decimal
			precio = parseFloat(precio).toFixed(2)
			precioACargar = precio
			console.log(precioACargar)
			e.target.value = ""
			

			const tr = document.createElement("tr")
			const tdNombre = document.createElement("td")
			tdNombre.innerHTML = "Fiambrería"
			const tdPrecio = document.createElement("td")
			tdPrecio.style.display = "flex";	
			tdPrecio.style.justifyContent = "space-between"
			tdPrecio.style.width = "100%"
			const pSigno = document.createElement("p")
			const divPrecio = document.createElement("div")
			pSigno.innerHTML = "$"
			divPrecio.innerHTML = precioACargar
		divPrecio.style.width = "100px"
		divPrecio.style.height = "30px"
		divPrecio.style.display = "flex"
		divPrecio.style.justifyContent = "center";
			tdPrecio.appendChild(pSigno)
			tdPrecio.appendChild(divPrecio)



			const tdCantidad = document.createElement("td")
			tdCantidad.innerHTML = "1"
			const tdSubtotal = document.createElement("td")
			tdSubtotal.innerHTML = precioACargar
			const tdCheck = document.createElement("td")
			const checkbox = document.createElement("input");
			checkbox.setAttribute("type", "checkbox");
			checkbox.classList.add("check");
			tdCheck.appendChild(checkbox)
			tr.appendChild(tdNombre)
			tr.appendChild(tdCantidad)
			tr.appendChild(tdPrecio)


			tr.appendChild(tdSubtotal)
			tr.appendChild(tdCheck)

			tablaCajaCobro.appendChild(tr)	
			body.removeChild(block)
			let clase = productosAgregados.length;
				tr.classList.add(clase) 
			agregarFiambre("Fiambrería", precioACargar, clase)


			let yaNo = false;
			tdPrecio.style.cursor = "pointer"
			tdPrecio.onclick = () => {
				if (yaNo == false) {
					divPrecio.style.border = "1px solid #f9f9f9"
					divPrecio.style.borderRadius = "5px"
					let precioACambiar =  parseFloat(precioACargar).toFixed(2);
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
						let aMostrar =  (productosAgregados[tr.classList].impuestoPrecio *  productosAgregados[tr.classList].cantidadAgregada) 					
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


			checkbox.addEventListener('change', ()  => {
			console.log(checkbox.checked)
			if (checkbox.checked == true) {
				productosSeleccionados.push(clase)
			} else {
				
				for (let i = 0; i < productosSeleccionados.length; i++) {
					if (productosSeleccionados[i] == tr.classList.value) {
						productosSeleccionados.splice(i, 1);
					}
				}
			}
			if (productosSeleccionados.length > 0) {
				
				borrarInvisible.style.visibility = "visible";
				console.log(tr.classList)
			} else {
				borrarInvisible.style.visibility = "hidden"
			}
console.log(productosSeleccionados)
		})


		}
	})


}
