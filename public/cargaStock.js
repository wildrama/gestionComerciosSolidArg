const formStock = document.getElementById("formStock");
const btnCargaStock = document.getElementById("btnCargaStock");
const codigo = document.getElementById("codigo");
const cantidad = document.getElementById("cantidad");
const marca = document.getElementById("marca");
const precioMinorista = document.getElementById("precioMinorista");
const precioMayorista = document.getElementById("precioMayorista");
const precioCosto = document.getElementById("precioCosto");
const peso = document.getElementById("peso");
const categoriaInterna = document.getElementById("categoriaInterna");
const presentacion = document.getElementById("presentacion");
const impuestoAplicado = document.getElementById("impuestoAplicado");

document.addEventListener("DOMContentLoaded", () => {
  if (codigo) {
    codigo.focus();
    codigo.select();
  }
});

const inputs = document.querySelectorAll("input, select, textarea");
inputs.forEach((input) => {
  input.addEventListener("keypress", (e) => {
    if (e.which === 13 && input.tabIndex) {
      e.preventDefault();
      let nextInput = document.querySelector(`[tabIndex="${input.tabIndex + 1}"]`);
      if (!nextInput) {
        nextInput = document.querySelector('[tabIndex="1"]');
      }
      if (nextInput) {
        nextInput.focus();
      }
    }
  });
});

if (btnCargaStock && formStock) {
  btnCargaStock.addEventListener("click", (e) => {
    e.preventDefault();

    if (!formStock.reportValidity()) {
      return;
    }

    if (cantidad && cantidad.value === "") cantidad.value = 0;
    if (marca && marca.value.trim() === "") marca.value = "Sin especificar";
    if (precioMinorista && precioMinorista.value === "") precioMinorista.value = 0;
    if (precioMayorista && precioMayorista.value === "") precioMayorista.value = 0;
    if (precioCosto && precioCosto.value === "") precioCosto.value = 0;
    if (peso && peso.value === "") peso.value = 0;
    if (categoriaInterna && categoriaInterna.value === "") categoriaInterna.value = "varios";
    if (presentacion && presentacion.value.trim() === "") presentacion.value = "VARIOS";
    if (impuestoAplicado && impuestoAplicado.value === "") impuestoAplicado.value = "0";

    btnCargaStock.disabled = true;
    btnCargaStock.innerHTML = '<span class="btn-icon">⏳</span> Cargando producto...';
    formStock.submit();
  });
}
