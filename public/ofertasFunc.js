const codigoIndividualInput = document.querySelector('#codigoIndividualInput');
const searchBarFormCodigoIndividual = document.querySelector('#searchBarFormCodigoIndividual');
const offerSearchResults = document.querySelector('#offerSearchResults');
const nombreProdIndividual = document.querySelector('#nombreProdIndividual');
const marcaProdIndividual = document.querySelector('#marcaProdIndividual');
const precioProdIndividual = document.querySelector('#precioProdIndividual');
const cantidadProdIndividual = document.querySelector('#cantidadProdIndividual');
const idContainer = document.querySelector('#idContainer');
const btn2daPantalla = document.querySelector('#btn2daPantalla');

const comboSearchInput = document.querySelector('#searchProductCode');
const comboSearchResults = document.querySelector('#comboSearchResults');
const comboSearchForm = document.querySelector('#formSearchOfertaConjunto');
const btnBuscarProductoConjunto = document.querySelector('#btnBuscarProductoConjunto');
const productosEnConjunto = document.querySelector('#productosEnConjunto');
const productosIdsInput = document.querySelector('#productosIds');

let productosSeleccionados = [];
let ultimoResultadoIndividual = [];
let ultimoResultadoCombo = [];

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function buscarProductosOferta(query) {
  const term = String(query || '').trim();
  if (!term) return [];

  const response = await axios.get('/administrador/ofertas/api/productos', {
    params: { q: term }
  });

  return Array.isArray(response.data?.data) ? response.data.data : [];
}

function seleccionarProductoIndividual(producto) {
  if (!producto) return;

  nombreProdIndividual.textContent = producto.nombre || '-';
  marcaProdIndividual.textContent = producto.marca || '-';
  precioProdIndividual.textContent = `$ ${Number(producto.precioMinorista || 0).toFixed(2)}`;
  cantidadProdIndividual.textContent = producto.cantidad ?? 0;
  idContainer.textContent = producto.codigo || 'Sin código';

  if (btn2daPantalla) {
    btn2daPantalla.setAttribute('href', `/administrador/ofertas/agregar-oferta-individual/${producto._id}/nueva`);
    btn2daPantalla.setAttribute('aria-disabled', 'false');
    btn2daPantalla.classList.remove('is-disabled');
  }

  document.getElementById('productoIndividualContainer')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderIndividualResults(results) {
  if (!offerSearchResults) return;

  if (!results.length) {
    offerSearchResults.innerHTML = '<p class="finder-empty">No se encontraron productos para esa búsqueda.</p>';
    return;
  }

  offerSearchResults.innerHTML = results.map((producto) => `
    <article class="finder-result-card offer-result-card-enhanced offer-product-choice-card">
      <div class="offer-card-head">
        <div>
          <h3>${escapeHtml(producto.nombre)}</h3>
          <p>${escapeHtml(producto.marca || 'Sin marca')} · Código ${escapeHtml(producto.codigo || '-')}</p>
        </div>
        <span class="offer-metric success">$${Number(producto.precioMinorista || 0).toFixed(2)}</span>
      </div>
      <div class="offer-product-metrics">
        <span class="offer-metric">Stock: ${Number(producto.cantidad || 0)}</span>
        <span class="offer-metric">Catálogo</span>
      </div>
      <button type="button" class="btn-offer-result-action" data-select-offer-product="${escapeHtml(producto._id)}">Usar este producto</button>
    </article>
  `).join('');
}

function actualizarListaProductos() {
  if (!productosEnConjunto || !productosIdsInput) return;

  if (!productosSeleccionados.length) {
    productosEnConjunto.innerHTML = `
      <div class="empty-products">
        <span class="empty-icon">📦</span>
        <p>Opcional: todavía no vinculaste productos de stock al combo</p>
      </div>
    `;
    productosIdsInput.value = '';
    return;
  }

  productosEnConjunto.innerHTML = productosSeleccionados.map((prod, index) => `
    <div class="producto-conjunto-item">
      <div class="producto-conjunto-header">
        <p class="producto-conjunto-name">${escapeHtml(prod.nombre)}</p>
        <button type="button" class="producto-conjunto-remove" data-remove-combo-index="${index}" title="Quitar producto">✕</button>
      </div>
      <div class="producto-conjunto-details">${escapeHtml(prod.marca || 'Sin marca')} · Cod. ${escapeHtml(prod.codigo || '-')}</div>
      <div class="producto-conjunto-price">$${Number(prod.precioMinorista || 0).toFixed(2)}</div>
    </div>
  `).join('');

  productosIdsInput.value = productosSeleccionados.map((prod) => prod._id).join(',');
}

function agregarProductoConjuntoSeleccionado(producto) {
  if (!producto) return;

  const exists = productosSeleccionados.some((item) => String(item._id) === String(producto._id));
  if (exists) return;

  productosSeleccionados.push(producto);
  actualizarListaProductos();
}

function renderComboResults(results) {
  if (!comboSearchResults) return;

  if (!results.length) {
    comboSearchResults.innerHTML = '<p class="finder-empty">No se encontraron productos para agregar al combo.</p>';
    return;
  }

  comboSearchResults.innerHTML = results.map((producto) => `
    <article class="finder-result-card offer-result-card-enhanced offer-product-choice-card">
      <div class="offer-card-head">
        <div>
          <h3>${escapeHtml(producto.nombre)}</h3>
          <p>${escapeHtml(producto.marca || 'Sin marca')} · Código ${escapeHtml(producto.codigo || '-')}</p>
        </div>
        <span class="offer-metric success">$${Number(producto.precioMinorista || 0).toFixed(2)}</span>
      </div>
      <div class="offer-product-metrics">
        <span class="offer-metric">Stock: ${Number(producto.cantidad || 0)}</span>
        <span class="offer-metric">Descuenta stock</span>
      </div>
      <button type="button" class="btn-offer-result-action success" data-add-combo-product="${escapeHtml(producto._id)}">Vincular al combo</button>
    </article>
  `).join('');
}

if (searchBarFormCodigoIndividual && codigoIndividualInput) {
  searchBarFormCodigoIndividual.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
      const results = await buscarProductosOferta(codigoIndividualInput.value);
      ultimoResultadoIndividual = results;
      renderIndividualResults(results);

      if (results.length === 1) {
        seleccionarProductoIndividual(results[0]);
      }
    } catch (error) {
      offerSearchResults.innerHTML = '<p class="finder-empty">No se pudo completar la búsqueda en este momento.</p>';
    }
  });

  offerSearchResults?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-select-offer-product]');
    if (!button) return;

    const productId = button.getAttribute('data-select-offer-product');
    const producto = ultimoResultadoIndividual.find((item) => String(item._id) === String(productId));
    if (producto) seleccionarProductoIndividual(producto);
  });
}

async function ejecutarBusquedaCombo() {
  try {
    const results = await buscarProductosOferta(comboSearchInput.value);
    ultimoResultadoCombo = results;
    renderComboResults(results);

    if (results.length === 1) {
      agregarProductoConjuntoSeleccionado(results[0]);
    }
  } catch (error) {
    comboSearchResults.innerHTML = '<p class="finder-empty">No se pudo completar la búsqueda en este momento.</p>';
  }
}

if (comboSearchForm && comboSearchInput) {
  btnBuscarProductoConjunto?.addEventListener('click', ejecutarBusquedaCombo);
  comboSearchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      ejecutarBusquedaCombo();
    }
  });

  comboSearchResults?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-add-combo-product]');
    if (!button) return;

    const productId = button.getAttribute('data-add-combo-product');
    const producto = ultimoResultadoCombo.find((item) => String(item._id) === String(productId));
    if (producto) {
      agregarProductoConjuntoSeleccionado(producto);
      comboSearchInput.value = '';
      comboSearchInput.focus();
    }
  });

  productosEnConjunto?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove-combo-index]');
    if (!button) return;

    const index = Number(button.getAttribute('data-remove-combo-index'));
    productosSeleccionados.splice(index, 1);
    actualizarListaProductos();
  });

  actualizarListaProductos();
}