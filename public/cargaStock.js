const formStock = document.getElementById("formStock")
const btnCargaStock = document.getElementById("btnCargaStock")
const cantidad = document.getElementById("cantidad")
const marca= document.getElementById("marca")
const precioMinorista = document.getElementById("precioMinorista")
const precioMayorista = document.getElementById("precioMayorista")
const precioCosto= document.getElementById("precioCosto")
const peso = document.getElementById("peso")
const fechaVenc = document.getElementById("fechaVenc")
const categoriaInterna = document.getElementById("categoriaInterna")
const presentacion = document.getElementById("presentacion")
const impuestoAplicado = document.getElementById("impuestoAplicado")

// document.getElementById("myForm").onkeypress = function(e) {
//     var key = e.charCode || e.keyCode || 0;     
//     if (key == 13) {
//       alert("No Enter!");
//       e.preventDefault();
//     }
//   } 

  var inputs = document.querySelectorAll("input,select");
  for (var i = 0 ; i < inputs.length; i++) {
	 inputs[i].addEventListener("keypress", function(e){
		if (e.which == 13) {
		   e.preventDefault();
		   var nextInput = document.querySelectorAll('[tabIndex="' + (this.tabIndex + 1) + '"]');
		   if (nextInput.length === 0) {
			  nextInput = document.querySelectorAll('[tabIndex="1"]');
		   }
		   nextInput[0].focus();
		}
	 })
  }

btnCargaStock.addEventListener("click", e => {
	e.preventDefault();
	if (cantidad.value == "") {
		cantidad.value = 0
	} 

	if (marca.value == "") {
		marca.value = "Sin especiicar"
	} 
	if (precioMinorista.value == "") {
		precioMinorista.value = 0
	} 
	if (precioMayorista.value == "") {
		precioMayorista.value = 0
	} 
	if (precioCosto.value == "") {
		precioCosto.value = 0
	} 
	if (peso.value == "") {
		peso.value = 0
	} 
	if (fechaVenc.value == "") {
		fechaVenc.value = "Sin especiicar"
	} 
	if (categoriaInterna.value == "") {
		categoriaInterna.value = "Sin especiicar"
	} 
	if (presentacion.value == "") {
		presentacion.value = "VARIOS"
	} 
	if (impuestoAplicado.value == "") {
	
	} 

	

	formStock.submit()
})
