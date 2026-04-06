const switchCodigo = document.getElementById("switchCodigo");
const codigoInput = document.getElementById("codigo");
const nombreInput = document.getElementById("nombre");
const btnGuardarProducto = document.getElementById("btnCargaStock");
const barcodePreview = document.getElementById("barcodePreview");
const barcodeStatus = document.getElementById("barcodeStatus");

let codigosExistentes = new Set();
let codigosReservados = new Set();
let codigoGeneradoActual = "";

function setBarcodeStatus(message, type = "info") {
  if (!barcodeStatus) return;
  barcodeStatus.textContent = message;
  barcodeStatus.className = `form-help barcode-status is-${type}`;
}

function toggleGuardarProducto(enabled) {
  if (!btnGuardarProducto) return;
  btnGuardarProducto.disabled = !enabled;
}

function sanitizeBarcode(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 18);
}

function renderBarcodePreview(value) {
  if (!barcodePreview || typeof JsBarcode === "undefined") return;

  if (!value) {
    barcodePreview.innerHTML = "";
    return;
  }

  try {
    JsBarcode(barcodePreview, value, {
      format: "CODE128",
      displayValue: true,
      height: 58,
      margin: 8,
      fontSize: 16
    });
  } catch (error) {
    barcodePreview.innerHTML = "";
  }
}

async function cargarCodigosExistentes() {
  try {
    const response = await fetch("/codigobarra/pedir", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
      throw new Error("No se pudieron consultar los códigos existentes.");
    }

    const productos = await response.json();
    codigosExistentes = new Set(
      (productos || [])
        .map((producto) => sanitizeBarcode(producto.codigo))
        .filter(Boolean)
    );

    setBarcodeStatus("Escaneá el código o generá uno nuevo para este producto.", "info");
  } catch (error) {
    setBarcodeStatus("Podés cargar el código manualmente aunque la validación online no responda.", "warn");
  }
}

function codigoYaExiste(value) {
  if (!value) return false;
  if (value === codigoGeneradoActual) return false;
  return codigosExistentes.has(value) || codigosReservados.has(value);
}

function generarCodigoUnico() {
  for (let intento = 0; intento < 80; intento++) {
    const seed = typeof crypto !== "undefined" && crypto.getRandomValues
      ? crypto.getRandomValues(new Uint32Array(1))[0].toString()
      : `${Date.now()}${Math.floor(Math.random() * 1000000)}`;

    const candidato = sanitizeBarcode(`779${Date.now().toString().slice(-6)}${seed.slice(-6)}`)
      .slice(0, 13)
      .padEnd(13, "0");

    if (!codigoYaExiste(candidato)) {
      return candidato;
    }
  }

  return sanitizeBarcode(`779${Date.now()}${Math.floor(Math.random() * 1000000)}`)
    .slice(0, 13)
    .padEnd(13, "0");
}

function validarCodigoActual(showMessage = false) {
  if (!codigoInput) return true;

  const value = sanitizeBarcode(codigoInput.value);
  if (codigoInput.value !== value) {
    codigoInput.value = value;
  }

  if (!value) {
    codigoInput.setCustomValidity("Ingresá o escaneá un código de barras.");
    setBarcodeStatus("El primer paso es escanear o escribir el código del producto.", "info");
    renderBarcodePreview("");
    toggleGuardarProducto(false);
    return false;
  }

  renderBarcodePreview(value);

  if (codigoYaExiste(value)) {
    codigoInput.setCustomValidity("Ese código de barras ya existe en el sistema.");
    setBarcodeStatus("⚠️ Ese código ya existe en el sistema. Elegí otro o generá uno nuevo.", "error");
    toggleGuardarProducto(false);
    if (showMessage) {
      codigoInput.reportValidity();
    }
    return false;
  }

  codigoInput.setCustomValidity("");
  setBarcodeStatus("✅ Código validado automáticamente. Ya podés completar nombre, stock y precios.", "ok");
  toggleGuardarProducto(true);
  return true;
}

function enfocarCodigo() {
  if (!codigoInput) return;
  codigoInput.focus();
  codigoInput.select();
}

async function generarCodigo() {
  if (!codigoInput) return "";

  await cargarCodigosExistentes();

  if (codigoGeneradoActual) {
    codigosReservados.delete(codigoGeneradoActual);
  }

  const nuevoCodigo = generarCodigoUnico();
  codigoGeneradoActual = nuevoCodigo;
  codigosReservados.add(nuevoCodigo);
  codigoInput.value = nuevoCodigo;
  validarCodigoActual();

  if (nombreInput) {
    nombreInput.focus();
  }

  return nuevoCodigo;
}

window.enfocarCodigo = enfocarCodigo;
window.generarCodigo = generarCodigo;

document.addEventListener("DOMContentLoaded", async () => {
  if (!codigoInput) return;

  toggleGuardarProducto(false);
  enfocarCodigo();
  await cargarCodigosExistentes();
  validarCodigoActual();

  codigoInput.addEventListener("input", () => validarCodigoActual());
  codigoInput.addEventListener("change", () => validarCodigoActual(true));
  codigoInput.addEventListener("blur", () => validarCodigoActual(true));

  if (switchCodigo) {
    switchCodigo.addEventListener("click", async (event) => {
      event.preventDefault();
      await generarCodigo();
    });
  }
});
