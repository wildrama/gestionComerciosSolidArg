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
const usarCalculoIVA = document.getElementById("usarCalculoIVA");
const ivaSelectRow = document.getElementById("ivaSelectRow");
const ivaStatus = document.getElementById("ivaStatus");
const previewMinorista = document.getElementById("previewMinorista");
const previewMayorista = document.getElementById("previewMayorista");

function parseNumberValue(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoneyPreview(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(parseNumberValue(value));
}

function calcularConIVA(value, porcentaje) {
  const base = parseNumberValue(value);
  const iva = parseNumberValue(porcentaje);
  if (!base || !iva) return base;
  return Number((base * (1 + iva / 100)).toFixed(2));
}

function updateIvaPreview() {
  const calcularIVA = Boolean(usarCalculoIVA && usarCalculoIVA.checked);
  const porcentaje = calcularIVA ? parseNumberValue(impuestoAplicado?.value) : 0;

  const finalMinorista = calcularIVA && porcentaje > 0
    ? calcularConIVA(precioMinorista?.value, porcentaje)
    : parseNumberValue(precioMinorista?.value);

  const finalMayorista = calcularIVA && porcentaje > 0
    ? calcularConIVA(precioMayorista?.value, porcentaje)
    : parseNumberValue(precioMayorista?.value);

  if (previewMinorista) previewMinorista.textContent = formatMoneyPreview(finalMinorista);
  if (previewMayorista) previewMayorista.textContent = formatMoneyPreview(finalMayorista);

  if (!ivaStatus) return;

  if (!calcularIVA) {
    ivaStatus.textContent = "IVA desactivado: el precio que escribís se toma como precio final.";
    return;
  }

  if (!porcentaje) {
    ivaStatus.textContent = "Sin porcentaje elegido: se tomará el precio cargado como final.";
    return;
  }

  ivaStatus.textContent = `Se sumará ${porcentaje}% de IVA al guardar el producto.`;
}

function toggleIvaMode() {
  if (ivaSelectRow) {
    ivaSelectRow.hidden = !(usarCalculoIVA && usarCalculoIVA.checked);
  }

  if (!usarCalculoIVA?.checked && impuestoAplicado) {
    impuestoAplicado.value = "0";
  }

  updateIvaPreview();
}

document.addEventListener("DOMContentLoaded", () => {
  if (codigo) {
    codigo.focus();
    codigo.select();
  }

  toggleIvaMode();

  [precioMinorista, precioMayorista, impuestoAplicado].forEach((field) => {
    field?.addEventListener("input", updateIvaPreview);
    field?.addEventListener("change", updateIvaPreview);
  });

  usarCalculoIVA?.addEventListener("change", toggleIvaMode);
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

    const calcularIVA = Boolean(usarCalculoIVA && usarCalculoIVA.checked);
    const porcentajeIVA = calcularIVA ? parseNumberValue(impuestoAplicado?.value) : 0;

    if (cantidad && cantidad.value === "") cantidad.value = 0;
    if (marca && marca.value.trim() === "") marca.value = "Sin especificar";
    if (precioMinorista && precioMinorista.value === "") precioMinorista.value = 0;
    if (precioMayorista && precioMayorista.value === "") precioMayorista.value = 0;
    if (precioCosto && precioCosto.value === "") precioCosto.value = 0;
    if (peso && peso.value === "") peso.value = 0;
    if (categoriaInterna && categoriaInterna.value === "") categoriaInterna.value = "varios";
    if (presentacion && presentacion.value.trim() === "") presentacion.value = "VARIOS";
    if (impuestoAplicado && (!calcularIVA || porcentajeIVA <= 0)) impuestoAplicado.value = "0";

    if (calcularIVA && porcentajeIVA > 0) {
      if (precioMinorista && precioMinorista.value !== "") {
        precioMinorista.value = calcularConIVA(precioMinorista.value, porcentajeIVA).toFixed(2);
      }
      if (precioMayorista && precioMayorista.value !== "") {
        precioMayorista.value = calcularConIVA(precioMayorista.value, porcentajeIVA).toFixed(2);
      }
    }

    btnCargaStock.disabled = true;
    btnCargaStock.innerHTML = '<span class="btn-icon">⏳</span> Cargando producto...';
    formStock.submit();
  });
}
