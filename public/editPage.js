/**
 * EDIT PAGE (STOCK) MODULE - MINIMAL Y ROBUSTO
 * Versión simplificada sin variables innecesarias
 */

console.log('✅ [editPage.js] Script iniciado');

// ELEMENT GATHERING - Solo lo necesario
const formEdit = document.getElementById("formEdit");
const btnEditGuar = document.getElementById("editGuar");

// VALIDACIÓN CRÍTICA
if (!formEdit) {
	console.error('❌ [editPage.js] ERROR: formEdit no encontrado');
	alert('ERROR: Formulario no encontrado. Actualiza la página.');
	throw new Error('formEdit missing');
}

if (!btnEditGuar) {
	console.error('❌ [editPage.js] ERROR: editGuar no encontrado');
	alert('ERROR: Botón no encontrado. Actualiza la página.');
	throw new Error('editGuar missing');
}

console.log('✅ [editPage.js] Elementos encontrados');

// STATE
let isEditMode = false;

// FORM SUBMISSION
formEdit.addEventListener("submit", function(e) {
	e.preventDefault();
	console.log('📝 [editPage.js] Form submitted. isEditMode:', isEditMode);
	
	if (!isEditMode) {
		// ENABLE EDIT MODE
		console.log('📝 [editPage.js] Activando modo edición...');
		
		// Habilitar campos
		const campos = formEdit.querySelectorAll('input[type="text"], input[type="date"], select');
		campos.forEach(campo => {
			if (campo.id !== 'nombreProducto' && campo.id !== 'precioMinorista' && campo.id !== 'precioMayorista' && campo.id !== 'precioCosto') {
				campo.disabled = false;
			}
		});
		
		// Cambiar botón
		btnEditGuar.innerHTML = '💾 Guardar Cambios';
		isEditMode = true;
		
		console.log('✅ [editPage.js] Modo edición activado');
		return;
	}
	
	// SAVE MODE
	console.log('💾 [editPage.js] Intentando guardar...');
	
	// Obtener datos
	const idProducto = document.getElementById("id").value;
	const codigoVal = document.getElementById("codigoProducto").value;
	const cantidadVal = document.getElementById("cantidadProducto").value;
	const categoriaVal = document.getElementById("categoriaInterna").value;
	const impuestoVal = document.getElementById("impuesto").value;
	
	console.log('📦 [editPage.js] Datos:', { idProducto, codigoVal, cantidadVal, categoriaVal, impuestoVal });
	
	// Validación básica
	if (!codigoVal) {
		alert('❌ El código es requerido');
		return;
	}
	if (!cantidadVal || cantidadVal < 0) {
		alert('❌ La cantidad debe ser >= 0');
		return;
	}
	if (!categoriaVal) {
		alert('❌ La categoría es requerida');
		return;
	}
	if (!impuestoVal) {
		alert('❌ El impuesto es requerido');
		return;
	}
	
	console.log('✅ [editPage.js] Validaciones pasadas');
	
	// Deshabilitar botón
	btnEditGuar.disabled = true;
	btnEditGuar.innerHTML = '⏳ Guardando...';
	
	// ENVIAR DATOS
	const datos = {
		codigo: codigoVal,
		nombre: document.getElementById("nombreProducto").value,
		cantidad: parseInt(cantidadVal),
		marca: document.getElementById("marcaProducto").value,
		precioMinorista: document.getElementById("precioMinorista").value,
		precioMayorista: document.getElementById("precioMayorista").value,
		precioCosto: document.getElementById("precioCosto").value,
		categoria: categoriaVal,
		peso: document.getElementById("peso").value || null,
		fechaDeVencimiento: document.getElementById("fechaDeVencimiento").value || null,
		impuestoAplicado: impuestoVal
	};
	
	const urlPUT = '/administrador/productos/' + idProducto;
	console.log('📤 [editPage.js] Enviando PUT a:', urlPUT);
	console.log('📤 [editPage.js] Datos completos:', datos);
	
	// AXIOS REQUEST
	axios.put(urlPUT, datos)
		.then(response => {
			console.log('✅ [editPage.js] Respuesta exitosa:', response.data);
			alert('✅ Producto guardado correctamente');
			
			// Redirigir
			setTimeout(() => {
				window.location.href = '/administrador/productos/' + idProducto;
			}, 1000);
		})
		.catch(error => {
			console.error('❌ [editPage.js] Error:', error);
			console.error('❌ [editPage.js] Error status:', error.response?.status);
			console.error('❌ [editPage.js] Error data:', error.response?.data);
			console.error('❌ [editPage.js] Error headers:', error.response?.headers);
			
			const msg = error.response?.data?.message || error.message || 'Error desconocido';
			alert('❌ Error: ' + msg);
			
			// Revertir
			btnEditGuar.disabled = false;
			btnEditGuar.innerHTML = '💾 Guardar Cambios';
			isEditMode = true;
		});
});

console.log('✅ [editPage.js] Event listener agregado. Listo.');
