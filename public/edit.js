
/* VARIABLES GLOBALES */

let precioMinoristaActual = 119; //Por defecto 119
let resultadoMinoristaActual = 119 //Por defecto 119

let precioMayoristaActual = 119; 
let resultadoMayoristaActual = 119; 

let precioCostoActual = 119; 
let resultadoCostoActual = 119





/* DOM */


const body = document.getElementsByTagName("body");
const llamador = document.getElementById("cambiarPrecio"); //Elemento que lo llama desde html


const block = document.createElement("div");
const ventana = document.createElement("div");
const ventanaHeader = document.createElement("div");
const ventanaHeaderTituloContainer = document.createElement("div");

const cerrarVentana = document.createElement("div");

const ventanaHeaderTitulo = document.createElement("p");


ventana.style.color = "black";

const ventanaBodyVisible = document.createElement("div");

const divMinorista = document.createElement("div");

let precios = true;

//Utilidades


//Pantalla oscura
block.style.backgroundColor = "rgba(0, 0, 0, .9)";
block.style.display = "flex";
block.style.alignItems = "center";
block.style.justifyContent = "center";
block.style.width = "100%"
block.style.height = "100%";
block.style.position = "absolute";
block.style.top = "0";
block.style.left = "0";

//Root de ventana
ventana.style.zIndex = "200";
ventana.style.backgroundColor = "#ffffff";
ventana.style.width = "380px";
ventana.style.minHeight = "580px";
ventana.style.zIndex = "300";

//Header de ventana

cerrarVentana.innerHTML = "X";
cerrarVentana.style.backgroundColor = "#FFC700";
cerrarVentana.style.borderRadius = "13px";
cerrarVentana.style.width = "37px";
cerrarVentana.style.height = "34px";
cerrarVentana.style.color = "#9696A0"
cerrarVentana.style.textAlign = "center";
cerrarVentana.style.fontSize = "25px";
cerrarVentana.style.fontWeight = "bold";
cerrarVentana.style.display = "flex";
cerrarVentana.style.justifyContent = "center";
cerrarVentana.style.display = "flex";
cerrarVentana.style.cursor = "pointer"

ventanaHeader.style.width = "100%";
ventanaHeader.style.height = "83px";
ventanaHeader.style.backgroundColor = "#1B4EA3";
ventanaHeader.style.display = "flex";
ventanaHeader.style.justifyContent = "space-around";
ventanaHeader.style.alignItems = "center"

ventanaHeaderTitulo.innerHTML = "Editar precios";
ventanaHeaderTitulo.style.color = "#FFCF92";
ventanaHeaderTitulo.style.marginTop = "4px";
ventanaBodyVisible.style.minHeight = "500px";

ventanaHeaderTitulo.style.display = "flex";
ventanaHeaderTitulo.style.justifyContent = "center"
ventanaHeaderTitulo.style.alignItems = "center"
ventanaHeaderTitulo.style.cursor = "pointer";

ventanaHeaderTituloContainer.style.width = "200px";

ventanaHeaderTituloContainer.style.height = "34px";

ventanaHeaderTituloContainer.style.backgroundColor = "#CE6B00";
ventanaHeaderTituloContainer.style.border = "solid 2px #FB982E";
ventanaHeaderTituloContainer.style.borderRadius = "10px"; 


ventanaHeaderTitulo.onclick = () => {
	if (precios == true) {
		precios = false;
		ventanaHeaderTituloContainer.style.backgroundColor = "#1B4EA3"
		modoGlobal()
		return
	} 

	if (precios == false) {
		precios = true;
		ventanaHeaderTituloContainer.style.backgroundColor = "#CE6B00"
		modoPrecio()

	}
}

//ventanaBody


const modoGlobal = () => {
	ventanaBodyVisible.innerHTML = ""
	ventanaBodyVisible.appendChild(pestañaCompleta)
	
}

const modoPrecio = () => {
	ventanaBodyVisible.innerHTML = ""
	ventanaBodyVisible.appendChild(divMinorista)
ventanaBodyVisible.appendChild(divMayorista)
ventanaBodyVisible.appendChild(divCosto)

}


/* Body */

//Body visible
ventanaBodyVisible.style.padding = "1rem";

//Minorista

const flexMinorista = document.createElement("div");
flexMinorista.style.display = "flex";
flexMinorista.style.marginBottom = "1rem";
flexMinorista.style.columnGap = "1rem";
flexMinorista.style.justifyContent = "space-between"

flexMinorista.style.alignItems = "center"

const flexMinorista2 = document.createElement("div");
flexMinorista2.style.display = "flex";

const flexMinorista3 = document.createElement("div");
flexMinorista3.style.display = "flex";
flexMinorista3.style.marginBottom = ".5rem";
flexMinorista3.style.borderBottom = "solid 1px #000000"


const lMinoristaActual = document.createElement("label");
lMinoristaActual.innerHTML = "Precio <b>minorista</b> actual: "
const boxMinoristaActual = document.createElement("p");

boxMinoristaActual.style.color = "grey"
boxMinoristaActual.style.border = "solid 1px"
boxMinoristaActual.style.borderRadius = "10px" 
boxMinoristaActual.style.textAlign = "center";
boxMinoristaActual.style.margin = "0";
boxMinoristaActual.style.width = "40%"
boxMinoristaActual.style.height = "35px"
flexMinorista.appendChild(lMinoristaActual)
flexMinorista.appendChild(boxMinoristaActual)

flexMinorista2.style.gap = "1rem"
flexMinorista2.style.marginBottom = ".7rem"
const aumentoEnMinorista = document.createElement("label");
aumentoEnMinorista.innerHTML = "Aumento en %"
aumentoEnMinorista.style.fontSize = "13px";
const inputPorcMin = document.createElement("input");
inputPorcMin.type = "text";
inputPorcMin.style.width = "100%";
inputPorcMin.style.height = "35px"
inputPorcMin.style.border = "1px solid #000000"
inputPorcMin.style.borderRadius = "10px";



const aumentoEnMinManual = document.createElement("label");
aumentoEnMinManual.innerHTML = "Aumento manual"

aumentoEnMinManual.style.fontSize = "13px";


const inputManualMin = document.createElement("input");
inputManualMin.type = "text";
inputManualMin.style.width = "100%";
inputManualMin.style.height = "35px";

inputManualMin.style.border = "1px solid #000000";
inputManualMin.style.borderRadius = "10px";


flexMinorista2.appendChild(aumentoEnMinorista);
flexMinorista2.appendChild(inputPorcMin);
flexMinorista2.appendChild(aumentoEnMinManual);
flexMinorista2.appendChild(inputManualMin);

const lResultado = document.createElement("div");
lResultado.innerHTML = "Resultado"
lResultado.style.fontSize = "12px"
const pResultado = document.createElement("p");
pResultado.innerHTML = `${resultadoMinoristaActual}`

//flexMinorista3.style.display.alignItems = "center"

pResultado.style.border = "solid 1px"
pResultado.style.padding = ".5rem"
pResultado.style.width = "100%";
pResultado.style.margin = "auto";
pResultado.style.borderRadius = "10px";
pResultado.style.textAlign = "center"

const btnMinorista = document.createElement("button");
btnMinorista.innerHTML = "ACEPTAR";
btnMinorista.style.color = "#FFFFFF"
btnMinorista.style.borderStyle = "none";
btnMinorista.style.borderRadius = "10px";
btnMinorista.style.backgroundColor = "#4324AA";
btnMinorista.style.padding = ".7rem"; 
boxMinoristaActual.style.width = "105px";


flexMinorista3.appendChild(pResultado);
flexMinorista3.appendChild(btnMinorista);
flexMinorista3.style.alignItems = "center"
flexMinorista3.style.justifyContent = "space-around"
flexMinorista3.style.gap = "1rem";
flexMinorista3.style.paddingBottom = ".5rem"
//Mayorista

const divMayorista = document.createElement("div");


const flexMayorista = document.createElement("div");
flexMayorista.style.display = "flex";

const flexMayorista2 = document.createElement("div");
flexMayorista2.style.display = "flex";

const flexMayorista3 = document.createElement("div");
flexMayorista3.style.display = "flex";


const lMayoristaActual = document.createElement("label");
lMayoristaActual.innerHTML = "Precio <b>mayorista</b> actual: "
const boxMayoristaActual = document.createElement("p");
boxMayoristaActual.innerHTML = `${precioMayoristaActual}`
flexMayorista.appendChild(lMayoristaActual)
flexMayorista.appendChild(boxMayoristaActual)
flexMayorista2.style.columnGap = "1rem" 


const aumentoEnMayorista = document.createElement("label");
aumentoEnMayorista.innerHTML = "Aumento en %"
aumentoEnMayorista.style.fontSize = "13px";
const inputPorcMan = document.createElement("input");
inputPorcMan.type = "text";
inputPorcMan.style.width = "53px";
inputPorcMan.style.borderRadius = "10px";

const aumentoEnManManual = document.createElement("label");
aumentoEnManManual.innerHTML = "Aumento manual"
aumentoEnManManual.style.fontSize = "13px";

const inputManualMan = document.createElement("input");
inputManualMan.type = "text";
inputManualMan.style.width = "70px";
inputManualMan.style.borderRadius = "10px";
inputManualMan.style.width = "100%";

inputManualMan.style.border = "1px solid #000000";
inputPorcMan.style.width = "100%";
inputPorcMan.style.border = "1px solid #000000";

const lResultadoMayorista = document.createElement("div");
lResultadoMayorista.innerHTML = "Resultado";

const pResultadoMayorista = document.createElement("p");
pResultadoMayorista.innerHTML = `${resultadoMayoristaActual}`
const btnMayorista = document.createElement("button");
btnMayorista.innerHTML = "ACEPTAR";

flexMayorista2.appendChild(aumentoEnMayorista);
flexMayorista2.appendChild(inputPorcMan);
flexMayorista2.appendChild(aumentoEnManManual);
flexMayorista2.appendChild(inputManualMan);
flexMayorista3.appendChild(pResultadoMayorista)
flexMayorista3.appendChild(btnMayorista)
flexMayorista.style.marginTop = "1rem"
flexMayorista.style.display = "flex";
flexMayorista.style.marginBottom = "1rem";
flexMayorista.style.columnGap = "1rem";
flexMayorista.style.justifyContent = "space-between"
flexMayorista.style.alignItems = "center"

boxMayoristaActual.style.color = "grey"
boxMayoristaActual.style.border = "solid 1px"
boxMayoristaActual.style.borderRadius = "10px" 
boxMayoristaActual.style.textAlign = "center";
boxMayoristaActual.style.margin = "0";
boxMayoristaActual.style.width = "105px"
boxMayoristaActual.style.height = "35px"

btnMayorista.innerHTML = "ACEPTAR";
btnMayorista.style.color = "#FFFFFF"
btnMayorista.style.borderStyle = "none";
btnMayorista.style.borderRadius = "10px";
btnMayorista.style.backgroundColor = "#4324AA";
btnMayorista.style.padding = ".7rem"; 
boxMayoristaActual.style.width = "105px";
lResultadoMayorista.style.fontSize = "13px";

pResultadoMayorista.style.border = "solid 1px"
pResultadoMayorista.style.padding = ".5rem"
pResultadoMayorista.style.width = "100%";
pResultadoMayorista.style.margin = "auto";
pResultadoMayorista.style.borderRadius = "10px";
pResultadoMayorista.style.textAlign = "center"
flexMayorista2.style.marginBottom = ".7rem";
flexMayorista3.style.columnGap = "1rem";
flexMayorista3.style.borderBottom = "solid 1px #000000"
flexMayorista3.style.paddingBottom = ".5rem";
//Costo

const divCosto = document.createElement("div");


const flexCosto = document.createElement("div");
flexCosto.style.display = "flex";
flexCosto.style.paddingTop = "1rem";
flexCosto.style.alignItems = "center";
flexCosto.style.justifyContent =  "space-between"
const flexCosto2 = document.createElement("div");
flexCosto2.style.display = "flex";
flexCosto2.style.columnGap = "1rem"
const flexCosto3 = document.createElement("div");
flexCosto3.style.display = "flex";


const lCostoActual = document.createElement("label");
lCostoActual.innerHTML = "Precio <b>costo</b> actual: "
const boxCostoActual = document.createElement("p");


flexCosto.appendChild(lCostoActual)
flexCosto.appendChild(boxCostoActual)


const aumentoEnCosto = document.createElement("label");
aumentoEnCosto.innerHTML = "Aumento en %"
aumentoEnCosto.style.fontSize = "13px"
const inputPorcCos = document.createElement("input");
inputPorcCos.type = "text";
inputPorcCos.style.width = "100%";
inputPorcCos.style.width = "100%";
inputPorcCos.style.border = "solid 1px #000000";
inputPorcCos.style.borderRadius = "10px"
inputPorcCos.style.height = "40px"

const aumentoEnCosManual = document.createElement("label");
aumentoEnCosManual.innerHTML = "Aumento manual"
aumentoEnCosManual.style.fontSize = "13px"


const inputManualCos = document.createElement("input");
inputManualCos.type = "text";
inputManualCos.style.width = "100%";
inputManualCos.style.border = "solid 1px #000000";
inputManualCos.style.borderRadius = "10px"
inputManualCos.style.height = "40px"

flexCosto2.appendChild(aumentoEnCosto);
flexCosto2.appendChild(inputPorcCos);

flexCosto2.appendChild(aumentoEnCosManual);
flexCosto2.appendChild(inputManualCos);

const lResultadoCosto = document.createElement("div");
lResultadoCosto.innerHTML = "Resultado";

const pResultadoCosto = document.createElement("p");
pResultadoCosto.innerHTML = `${resultadoCostoActual}`
const btnCosto = document.createElement("button");
btnCosto.innerHTML = "ACEPTAR";

flexCosto3.appendChild(pResultadoCosto)
flexCosto3.appendChild(btnCosto)

boxCostoActual.style.color = "grey"
boxCostoActual.style.border = "solid 1px"
boxCostoActual.style.borderRadius = "10px" 
boxCostoActual.style.textAlign = "center";
boxCostoActual.style.margin = "0";
boxCostoActual.style.width = "105px"
boxCostoActual.style.height = "35px"

btnCosto.innerHTML = "ACEPTAR";
btnCosto.style.color = "#FFFFFF"
btnCosto.style.borderStyle = "none";
btnCosto.style.borderRadius = "10px";
btnCosto.style.backgroundColor = "#4324AA";
btnCosto.style.padding = ".7rem"; 
boxCostoActual.style.width = "105px";
lResultadoCosto.style.fontSize = "13px";
pResultadoCosto.style.border = "solid 1px"
pResultadoCosto.style.padding = ".5rem"
pResultadoCosto.style.width = "100%";
pResultadoCosto.style.margin = "auto";
pResultadoCosto.style.borderRadius = "10px";
pResultadoCosto.style.textAlign = "center"

flexCosto.style.marginBottom = "1rem";
flexCosto2.style.marginBottom = "1rem";
flexCosto3.style.marginBottom = "1rem";
flexCosto3.style.columnGap = "1rem"



//Pestaña completa

const pestañaCompleta = document.createElement("div");
const divCodigo = document.createElement("div");
divCodigo.classList.add("uFlex")
const lCodigoBarra = document.createElement("label")
const iCodigoBarra = document.createElement("input")
const pCodigoBarra = document.createElement("p")

lCodigoBarra.innerHTML = "Ingrese el código de barra del producto"
iCodigoBarra.type = "text";
pCodigoBarra.innerHTML = "Ingrese solo números"

divCodigo.appendChild(lCodigoBarra)
divCodigo.appendChild(iCodigoBarra)
divCodigo.appendChild(pCodigoBarra)

pestañaCompleta.appendChild(divCodigo);

const divNombre = document.createElement("div");
divNombre.classList.add("uFlex")
const lNombre = document.createElement("label")
const iNombre = document.createElement("input")

lNombre.innerHTML = "Ingrese el nombre del producto"
iNombre.type = "text";

divNombre.appendChild(lNombre)
divNombre.appendChild(iNombre)

pestañaCompleta.appendChild(divNombre);

const divCantidad = document.createElement("div");
divCantidad.classList.add("uFlex")
const lCantidad = document.createElement("label")
const iCantidad = document.createElement("input")
const pCantidad = document.createElement("p")

lCantidad.innerHTML = "Ingrese la cantidad de productos";
iCantidad.type = "text";
pCantidad.innerHTML = "Ingrese solo números"

divCantidad.appendChild(lCantidad)
divCantidad.appendChild(iCantidad)
divCantidad.appendChild(pCantidad)

pestañaCompleta.appendChild(divCantidad);

const divMarca = document.createElement("div");
divMarca.classList.add("uFlex")
const lMarca = document.createElement("label")
const iMarca = document.createElement("input")

lMarca.innerHTML = "Ingrese la marca del producto"
iMarca.text = "text";

divMarca.appendChild(lMarca)
divMarca.appendChild(iMarca)

pestañaCompleta.appendChild(divMarca);

const divPrecioMin = document.createElement("div");
divPrecioMin.classList.add("uFlex")
const lPrecioMin = document.createElement("label")
const iPrecioMin = document.createElement("input")
const pPrecioMin = document.createElement("p")

lPrecioMin.innerHTML = "Ingrese el precio minorista del producto"
iPrecioMin.type = "text";
pPrecioMin.innerHTML = "Ingrese solo números"

divPrecioMin.appendChild(lPrecioMin)
divPrecioMin.appendChild(iPrecioMin)
divPrecioMin.appendChild(pPrecioMin)

pestañaCompleta.appendChild(divPrecioMin);

const divPrecioMay = document.createElement("div");
divPrecioMay.classList.add("uFlex")
const lPrecioMay = document.createElement("label")
const iPrecioMay = document.createElement("input")
const pPrecioMay = document.createElement("p")

lPrecioMay.innerHTML = "Ingrese el precio mayorista del producto"
iPrecioMay.type = "text";
pPrecioMay.innerHTML = "Ingrese solo números"

divPrecioMay.appendChild(lPrecioMay)
divPrecioMay.appendChild(iPrecioMay)
divPrecioMay.appendChild(pPrecioMay)

pestañaCompleta.appendChild(divPrecioMay);

//PRECIO COSTO

const divPrecioCosto = document.createElement("div");
divPrecioCosto.classList.add("uFlex")
const lPrecioCosto = document.createElement("label")
const iPrecioCosto = document.createElement("input")
const pPrecioCosto = document.createElement("p")

lPrecioCosto.innerHTML = "Ingrese el precio costo del producto"
iPrecioCosto.type = "text";
pPrecioCosto.innerHTML = "Ingrese solo números"

divPrecioCosto.appendChild(lPrecioCosto)
divPrecioCosto.appendChild(iPrecioCosto)
divPrecioCosto.appendChild(pPrecioCosto)



pestañaCompleta.appendChild(divPrecioCosto);



//CATEGORIA
//
const divCategoria = document.createElement("div");
divCategoria.classList.add("uFlex")
const lCategoria = document.createElement("label")
const sCategoria = document.createElement("select")
const almacen = document.createElement("option");
const varios = document.createElement("option");
const aceiteVinagre = document.createElement("option");
const arroz = document.createElement("option");
const articulos = document.createElement("option");
const azucar = document.createElement("option");
const sinAlcohol = document.createElement("option");
const enlatados = document.createElement("option");
const fideos = document.createElement("option");
const fiambreria = document.createElement("option");
const pañales = document.createElement("option");
const galletitas = document.createElement("option");
const golosinas = document.createElement("option");
const hCorporal = document.createElement("option");
const hFemenina = document.createElement("option");
const panaderia = document.createElement("option");
const noPerecederos = document.createElement("option");
const teCafe = document.createElement("option");
const sal = document.createElement("option");
const verduleria = document.createElement("option");
const yerba = document.createElement("option");


sCategoria.id = "sCategoria";
sCategoria.name = "sCategoria";

almacen.text = "Almacén"
almacen.value = "almacen"
varios.text = "Varios"
varios.value = "varios"
aceiteVinagre.value = "aceiteVinagre"
aceiteVinagre.text = "Aceite/Vinagre"
arroz.value = "arroz"
arroz.text = "Arroz"
articulos.text = "Artículos de Limpieza"
articulos.value = "limpieza"
azucar.text = "Azucar"
azucar.value = "azucar"
sinAlcohol.value = "bebidasSinAlcohol"
sinAlcohol.text = "Bebidas sin alcohol"
enlatados.value = "enlatados"
enlatados.text = "Enlatados"
fideos.value = "fideos"
fideos.text = "Fideos"
fiambreria.value = "fiambreria"
fiambreria.text = "Fibrería"
pañales.value = "pañales"
pañales.text = "Pañales"
galletitas.value = "galletitas"
galletitas.text = "Galletitas"
golosinas.value = "golosinas"
golosinas.text = "Golosinas"

hCorporal.value = "hCorporal"
hCorporal.text = "Higiene corporal"
hFemenina.value = "hFemenina"
hFemenina.text = "Higiene femenina"
hCorporal.value = "HIgiene personal"
panaderia.text = "Panaderia"
panaderia.value = "panaderia"
noPerecederos.value = "noPerecederos"
noPerecederos.text = "Alimentos no perecederos"
teCafe.value = "teCafe"
teCafe.text = "Te/Café"
sal.text = "Sal"
sal.value = "sal"
verduleria.text = "Verdulería"
verduleria.value = "verduleria"
yerba.text = "Yerba"
yerba.value = "yerba"

sCategoria.appendChild(almacen)
sCategoria.appendChild(varios)
sCategoria.appendChild(aceiteVinagre)
sCategoria.appendChild(arroz)
sCategoria.appendChild(articulos)
sCategoria.appendChild(azucar)
sCategoria.appendChild(sinAlcohol)
sCategoria.appendChild(enlatados)
sCategoria.appendChild(fideos)
sCategoria.appendChild(fiambreria)
sCategoria.appendChild(pañales)
sCategoria.appendChild(galletitas)
sCategoria.appendChild(golosinas)
sCategoria.appendChild(hCorporal)
sCategoria.appendChild(panaderia)
sCategoria.appendChild(noPerecederos)
sCategoria.appendChild(teCafe)
sCategoria.appendChild(sal)
sCategoria.appendChild(verduleria)
sCategoria.appendChild(yerba)




lCategoria.innerHTML = "Categoría inerna de góndola"

divCategoria.appendChild(lCategoria)
divCategoria.appendChild(sCategoria)



pestañaCompleta.appendChild(divCategoria);



//oculto
//
const hid = document.createElement("div");
pestañaCompleta.appendChild(hid);

const solapa = document.createElement("div");

const divPeso = document.createElement("div");
divPeso.classList.add("uFlex")
const lPeso = document.createElement("label")
const iPeso = document.createElement("input")
const pPeso = document.createElement("p")

lPeso.innerHTML = "Ingrese el peso en KG o GRAMOS"
iPeso.type = "text";
pPeso.innerHTML = "Ingrese solo números"

divPeso.appendChild(lPeso)
divPeso.appendChild(iPeso)
divPeso.appendChild(pPeso)

solapa.appendChild(divPeso);

const divVenc = document.createElement("div");
divVenc.classList.add("uFlex")
const lVenc = document.createElement("label")
const iVenc = document.createElement("input")
const pVenc = document.createElement("p")

lVenc.innerHTML = "Ingrese la fecha de vencimiento"
iVenc.type = "text";
pVenc.innerHTML = "Ingrese solo números"

divVenc.appendChild(lVenc)
divVenc.appendChild(iVenc)
divVenc.appendChild(pVenc)

solapa.appendChild(divVenc);

const divImpuesto = document.createElement("div");
divImpuesto.classList.add("uFlex");
const lImpuesto = document.createElement("label")
lImpuesto.innerHTML = "Impuesto del producto"
const sImpuesto = document.createElement("select");

sImpuesto.id = "sImpuesto";
sImpuesto.name = "sImpuesto";

const i8 = document.createElement("option");
const i21 = document.createElement("option");
const i35 = document.createElement("option");

i8.text = "8%"
i8.value = "8"
i21.text = "21%"
i21.value = "21"
i35.text = "35%"
i35.value = "35"


sImpuesto.appendChild(i8)
sImpuesto.appendChild(i21)
sImpuesto.appendChild(i35)

divImpuesto.appendChild(lImpuesto)
divImpuesto.appendChild(sImpuesto)


solapa.appendChild(divImpuesto)

//Bottom

const bottom = document.createElement("div");
bottom.style.display = "flex";
bottom.style.columnGap = "1rem"
bottom.style.padding = "1rem"
bottom.style.marginTop = "-1rem"

bottom.style.justifyContent = "space-around";
const mostrar = document.createElement("button")
mostrar.innerHTML = "Mostrar opciones no obligatorias"
const guardar = document.createElement("button")
guardar.innerHTML = "Editar"

mostrar.style.border = "solid 3px grey"
mostrar.style.borderRadius = "13px"
mostrar.style.backgroundColor = "white"

mostrar.style.width = "100%";


guardar.style.border = "solid 3px #4324AA"
guardar.style.color = "#4324AA"
guardar.style.fontWeight = "bold"
mostrar.style.fontWeight = "bold"
guardar.style.borderRadius = "13px"
guardar.style.backgroundColor = "white"
guardar.style.width = "100%";
bottom.appendChild(mostrar)
bottom.appendChild(guardar)

pestañaCompleta.appendChild(bottom)
//appendChild

ventana.appendChild(ventanaHeader)
ventanaHeader.appendChild(ventanaHeaderTituloContainer)
ventanaHeaderTituloContainer.appendChild(ventanaHeaderTitulo)
ventanaHeader.appendChild(cerrarVentana)
ventana.appendChild(ventanaBodyVisible);
ventanaBodyVisible.appendChild(divMinorista)
divMinorista.appendChild(flexMinorista)
divMinorista.appendChild(flexMinorista2)
divMinorista.appendChild(lResultado)
divMinorista.appendChild(flexMinorista3)
ventanaBodyVisible.appendChild(divMayorista)
divMayorista.appendChild(flexMayorista)
divMayorista.appendChild(flexMayorista2)
divMayorista.appendChild(lResultadoMayorista)
divMayorista.appendChild(flexMayorista3)
ventanaBodyVisible.appendChild(divCosto)
divCosto.appendChild(flexCosto)
divCosto.appendChild(flexCosto2)
divCosto.appendChild(lResultadoCosto)

divCosto.appendChild(flexCosto3)
//ventana.appendChild(bottom)

let oculto = true;
mostrar.onclick = () => {
	if (oculto == true) {
		hid.appendChild(solapa)
		mostrar.innerHTML = "Ocultar opciones no obligatorias"
		oculto = false;
		return
	}

	if (oculto == false) {
		hid.innerHTML = "";
		mostrar.innerHTML = "Mostrar opciones no obligatorias"
		oculto = true;
		return
	}
}



// Axios IN

let productoIn = {
	precioMinorista: 0,
	precioMayorista: 0,
	precioCosto: 0
}






export const iniciar = async () => {
		//Axios Out
		let codigo = sessionStorage.getItem('codigo')
		try {
			const res = await axios.post('/caja/buscar', {codigo: codigo})
			const producto = res.data;
			precioMinoristaActual = producto.precioMinorista
			boxMinoristaActual.innerHTML = `$${precioMinoristaActual}`
			precioMayoristaActual = producto.precioMayorista
			boxMayoristaActual.innerHTML = `$${precioMayoristaActual}`
			precioCostoActual = producto.precioCosto
			boxCostoActual.innerHTML = `$${precioCostoActual}`

			inputManualMin.addEventListener("input", () => {
			resultadoMinoristaActual = parseFloat(inputManualMin.value).toFixed(2);
			inputPorcMin.value = ""	
			pResultado.innerHTML = `$${resultadoMinoristaActual}`

			})



			inputPorcMin.addEventListener("input", () => {
			let porcentaje = inputPorcMin.value * producto.precioMinorista / 100;
			inputManualMin.value = ""
			resultadoMinoristaActual = (porcentaje + producto.precioMinorista).toFixed(2);
			precioMinoristaActual.innerHTML = resultadoMinoristaActual 
			pResultado.innerHTML = `$${resultadoMinoristaActual}`	
			
			})
			
			btnMinorista.onclick = () => {
		
				productoIn.precioMinorista = resultadoMinoristaActual
				console.log(productoIn)
			
			}
			
			inputManualMan.addEventListener("input", () => {
				resultadoMayoristaActual = parseFloat(inputManualMan.value).toFixed(2);
				inputPorcMan.value = "";
				pResultadoMayorista.innerHTML = `$${resultadoMayoristaActual}`
			
			})

			inputPorcMan.addEventListener("input", () => {
				let porcentaje = inputPorcMan.value * producto.precioMayorista / 100;
				inputManualMan.value = "";
				resultadoMayoristaActual = (porcentaje + producto.precioMayorista).toFixed(2);
				precioMayoristaActual.innerHTML = resultadoMayoristaActual
				pResultadoMayorista.innerHTML = `$${resultadoMayoristaActual}`
			})
	
				btnMayorista.onclick = () => {
		
				productoIn.precioMayorista = resultadoMayoristaActual
				console.log(productoIn)
			
			}

			inputManualCos.addEventListener("input", () => {
				resultadoCostoActual = parseFloat(inputManualCos.value).toFixed(2);
				inputPorcCos.value = "";
				pResultadoCosto.innerHTML = `$${resultadoCostoActual}`;
			})

			inputPorcCos.addEventListener("input", () => {
				let porcentaje = inputPorcCos.value * producto.precioCosto / 100;
				inputManualCos.value = "";
				resultadoCostoActual = (porcentaje + producto.precioCosto).toFixed(2);
				precioCostoActual.innerHTML = resultadoCostoActual;
				pResultadoCosto.innerHTML = `$${resultadoCostoActual}`
			})

			btnCosto.onclick = () => {
				productoIn.precioCosto = resultadoCostoActual;
				console.log(productoIn)
			}

			guardar.onclick = () => {
				try {
					axios.post(`/administrador/productos/${producto._id}/edit`, productoIn);	
				} catch(error) {
					console.log(error)
				}
			}

		

		} catch (error) {
			console.log(error)
		}

	body[0].appendChild(block);
	block.appendChild(ventana);
}

cerrarVentana.onclick = () => {
	body[0].removeChild(block);
}






