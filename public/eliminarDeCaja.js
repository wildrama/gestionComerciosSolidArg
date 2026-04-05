//creacion de elementos dom
import {productosAgregados, textBuscar} from './cajaCobro.js'
import {eliminar} from './cajaCobro.js'
const btnBorrar = document.getElementById("eliminarProductos");
const bodyCaja = document.getElementsByTagName("body")
const blocker = document.createElement("div");
const guiBorrar = document.createElement("div");
const hGui = document.createElement("h1");
const xGui = document.createElement("p");
const searchBar = document.createElement("input");
const btnSearch = document.createElement("button")
const pGui = document.createElement("p");
const uGui = document.createElement("ul");
const btnCancel = document.createElement("button")
const btnSubmitDel = document.createElement("button")
const bForm = document.createElement("form")
blocker.style.width = "100%";
blocker.style.height = "100%";
blocker.style.top = "0";
blocker.style.left = "0";
blocker.classList.add("bloqueador");
guiBorrar.classList.add("ventana");

blocker.style.position = "absolute";
blocker.style.backgroundColor = "rgba(0, 0, 0, .9)";

btnSearch.innerHTML = `

<svg width="42" height="35" viewBox="0 0 42 35" fill="#361A00" xmlns="http://www.w3.org/2000/svg">
<path d="M31.6783 35L18.2201 21.5447C15.7911 23.1471 12.8538 23.7911 9.97706 23.352C7.10036 22.913 4.48893 21.4221 2.64847 19.1681C0.808017 16.9141 -0.13051 14.0574 0.0146355 11.1511C0.159781 8.24479 1.37827 5.49576 3.43415 3.43634C5.49328 1.37976 8.2424 0.160523 11.1491 0.0147584C14.0557 -0.131006 16.913 0.80708 19.1676 2.64732C21.4222 4.48757 22.9135 7.09901 23.3528 9.97584C23.7922 12.8527 23.1482 15.7902 21.5456 18.2194L34.9991 31.677L31.6783 35ZM11.7419 4.69646C9.87279 4.69522 8.07971 5.43652 6.75715 6.75727C5.43459 8.07803 4.69089 9.87005 4.68965 11.7391C4.68841 13.6082 5.42974 15.4012 6.75055 16.7237C8.07136 18.0462 9.86345 18.7899 11.7326 18.7911C13.6017 18.7924 15.3948 18.0511 16.7174 16.7303C18.0399 15.4096 18.7836 13.6175 18.7849 11.7485C18.7861 9.87939 18.0448 8.08638 16.724 6.76387C15.4032 5.44137 13.6111 4.69769 11.7419 4.69646ZM42 9.3309H27.9981V4.66379H42V9.3309Z" fill="#361A00"/>
</svg>
`;

xGui.innerHTML = "x"
hGui.innerHTML = "Eliminar producto de la lista por código"
pGui.innerHTML = "Producto(s) a eliminar:"
pGui.classList.add("parrafo")
xGui.classList.add("x")

btnSearch.classList.add("buscar")
btnCancel.classList.add("btnCancel")
btnCancel.innerHTML = "Cancelar"
btnSubmitDel.classList.add("btnSubmitDel")
btnSubmitDel.innerHTML = "Continuar"

guiBorrar.appendChild(xGui);
guiBorrar.appendChild(hGui);
bForm.appendChild(searchBar);
bForm.appendChild(btnSearch);
guiBorrar.appendChild(pGui);
guiBorrar.appendChild(uGui);
guiBorrar.appendChild(btnCancel);
guiBorrar.appendChild(btnSubmitDel);
guiBorrar.appendChild(bForm)
xGui.classList.add("salir")
xGui.style.cursor = "pointer";

searchBar.focus()
xGui.onclick = () => {
	bodyCaja[0].removeChild(blocker)
}

btnCancel.onclick = () => {
	bodyCaja[0].removeChild(blocker)
	textBuscar.focus()
}


btnBorrar.onclick = () => {
	bodyCaja[0].appendChild(blocker);
	blocker.appendChild(guiBorrar);


}
export let arrEliminar = []

btnSubmitDel.onclick = () => {
	bodyCaja[0].removeChild(blocker)
	eliminar()
	uGui.innerHTML = ""
	arrEliminar = []
	textBuscar.focus()
	//script submit
}


bForm.addEventListener("submit", async e => {
	e.preventDefault();

	try {
		const res = await axios.post('/caja/buscar', {codigo: searchBar.value});
		const producto = res.data;

		if (producto == null) {
			return
		}
		if (productosAgregados.length < 2) {
			alert("No hay ningun producto para borrar")
			return
		}
		if (producto.nombre == undefined) {
			searchBar.value = "";
			alert("Producto invalido")
			return
		}
		
		let presente = false;
		productosAgregados.map(p => {
			if (p.nombre == producto.nombre) {
				presente = true;
			}
		})

		if(presente == false) {
			alert("Ese producto no se encuentra agregado")
			return
		}

		searchBar.value = "";
		const liGui = document.createElement("li")
		liGui.innerHTML = producto.nombre;
		arrEliminar.push(producto.nombre)
		console.log(arrEliminar)
		uGui.appendChild(liGui)
		
		

		


	} catch (error) {
		console.log(error)
	}
})
