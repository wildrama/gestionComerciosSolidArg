const switchCodigo = document.getElementById("switchCodigo");
const codigoProducto = document.getElementsByClassName("codigoProducto")
const bodyx = document.getElementsByTagName("body")
const input1 = document.querySelector('#primerInput')

const alertar = (mensaje, color) => {
	const pop = document.createElement("div")
	pop.innerHTML = mensaje 
	pop.classList.add("alert")
	pop.classList.add(color)
	pop.style.position = "fixed"
	pop.style.top = "0";
	
	pop.style.width = "100%"
	bodyx[0].appendChild(pop)
	setTimeout(() => {
		bodyx[0].removeChild(pop)	
	}, 3000)
}

window.onload = async () => {
	try {
		const res = await axios.post("/codigobarra/pedir");
		const codigos = res.data
		console.log(codigos)
		
		let nuevoCodigo = codigos.length
		if (nuevoCodigo < 10) {
			nuevoCodigo = "000" + nuevoCodigo
		}

		if (nuevoCodigo >= 10 && nuevoCodigo < 100) {
			nuevoCodigo = "00" + nuevoCodigo
		}
		if (nuevoCodigo >= 100 && nuevoCodigo < 1000) {
			nuevoCodigo = "0" + nuevoCodigo
		}

		nuevoCodigo = "5555" + nuevoCodigo + "555"
		switchCodigo.addEventListener("click", e => {
			codigoProducto[0].value = nuevoCodigo	
			input1.focus();
		})
		
		codigoProducto[0].addEventListener("input", e => {
			
			codigos.map(codigo => {
				if (codigo.codigo == e.target.value) {
					// codigoProducto[0].value = ""
					alertar("Ese código ya se encuentra en uso", "alert-danger")
					
				}
			})
		})
	

	} catch (error) {
		console.log(error)
	}

}

// switchCodigo.addEventListener("click", async e => {
// 	e.preventDefault();
// })


//JsBarcode("#code128", "1234567890123");


