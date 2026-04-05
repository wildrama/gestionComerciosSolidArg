const cajaData = window.CAJA_DATA || {};
const currency = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2
});

const lastTicketStorageKey = `isidorito-last-ticket:${cajaData.estacionId || 'default'}`;

const state = {
  items: [],
  lastFinderResults: [],
  salesHistory: []
};

const elements = {
  barcodeForm: document.getElementById('barcodeForm'),
  barcodeInput: document.getElementById('barcodeInput'),
  cartTableBody: document.getElementById('cartTableBody'),
  subtotalAmount: document.getElementById('subtotalAmount'),
  discountAmount: document.getElementById('discountAmount'),
  totalAmount: document.getElementById('totalAmount'),
  changeAmount: document.getElementById('changeAmount'),
  checkoutBtn: document.getElementById('checkoutBtn'),
  newSaleBtn: document.getElementById('newSaleBtn'),
  lastTicketBtn: document.getElementById('lastTicketBtn'),
  salesHistoryBtn: document.getElementById('salesHistoryBtn'),
  openFinderBtn: document.getElementById('openFinderBtn'),
  closeFinderBtn: document.getElementById('closeFinderBtn'),
  finderModal: document.getElementById('finderModal'),
  finderSearchForm: document.getElementById('finderSearchForm'),
  finderQuery: document.getElementById('finderQuery'),
  finderResults: document.getElementById('finderResults'),
  salesHistoryModal: document.getElementById('salesHistoryModal'),
  closeSalesHistoryBtn: document.getElementById('closeSalesHistoryBtn'),
  salesHistoryBody: document.getElementById('salesHistoryBody'),
  statusMessage: document.getElementById('statusMessage'),
  cashReceivedInput: document.getElementById('cashReceivedInput'),
  cashReceivedGroup: document.getElementById('cashReceivedGroup'),
  paymentInputs: Array.from(document.querySelectorAll('input[name="metodoPago"]')),
  offerButtons: Array.from(document.querySelectorAll('.offer-button')),
  ticketToggle: document.getElementById('ticketToggle')
};

const offerMap = new Map((cajaData.ofertasConjunto || []).map((offer) => [String(offer._id), offer]));
const individualOfferMap = new Map(
  (cajaData.ofertasIndividuales || [])
    .filter((offer) => offer.productoEnOferta && offer.productoEnOferta._id)
    .map((offer) => [String(offer.productoEnOferta._id), offer])
);

const formatMoney = (value) => currency.format(Number(value || 0));
const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const toQuantity = (value) => Math.max(1, Math.floor(toNumber(value, 1)));
const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

let statusTimer;
function showStatus(message, type = 'info') {
  if (!elements.statusMessage) return;

  elements.statusMessage.hidden = false;
  elements.statusMessage.className = `cash-status ${type}`;
  elements.statusMessage.textContent = message;

  if (statusTimer) clearTimeout(statusTimer);
  statusTimer = window.setTimeout(() => {
    elements.statusMessage.hidden = true;
  }, 4000);
}

function getMetodoPago() {
  const selected = elements.paymentInputs.find((input) => input.checked);
  return selected ? selected.value : 'EFECTIVO';
}

function getLastTicket() {
  try {
    const raw = window.localStorage.getItem(lastTicketStorageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLastTicket(ticketData) {
  try {
    window.localStorage.setItem(lastTicketStorageKey, JSON.stringify(ticketData));
    updateLastTicketButton();
  } catch {
    showStatus('No se pudo guardar la referencia del último ticket.', 'info');
  }
}

function updateLastTicketButton() {
  if (!elements.lastTicketBtn) return;

  const hasTicket = Boolean(getLastTicket());
  elements.lastTicketBtn.disabled = !hasTicket;
  elements.lastTicketBtn.title = hasTicket
    ? 'Reimprimir el último ticket guardado'
    : 'Todavía no hay ticket guardado';
}

function syncPaymentLabels() {
  elements.paymentInputs.forEach((input) => {
    const label = input.closest('.payment-option');
    if (!label) return;
    label.classList.toggle('active-option', input.checked);
  });

  const isCash = getMetodoPago() === 'EFECTIVO';
  elements.cashReceivedGroup.hidden = !isCash;
  if (!isCash) {
    elements.cashReceivedInput.value = '';
  }

  updateChange();
}

function getLineCalculation(item) {
  const quantity = toQuantity(item.quantity);
  const regularSubtotal = Number((toNumber(item.unitPrice) * quantity).toFixed(2));

  if (item.kind === 'offer') {
    return {
      regularSubtotal,
      finalSubtotal: regularSubtotal,
      discount: 0,
      note: item.productsText || 'Oferta precargada'
    };
  }

  const offer = individualOfferMap.get(String(item.productId));
  if (!offer || quantity < toQuantity(offer.cantidadDeUnidadesNecesarias)) {
    return {
      regularSubtotal,
      finalSubtotal: regularSubtotal,
      discount: 0,
      note: item.stock > 0 ? `Stock: ${item.stock}` : 'Sin stock'
    };
  }

  const packSize = toQuantity(offer.cantidadDeUnidadesNecesarias);
  const packPrice = toNumber(offer.precioOferta);
  const packs = Math.floor(quantity / packSize);
  const remainder = quantity % packSize;
  const finalSubtotal = Number(((packs * packPrice) + (remainder * toNumber(item.unitPrice))).toFixed(2));

  return {
    regularSubtotal,
    finalSubtotal,
    discount: Number((regularSubtotal - finalSubtotal).toFixed(2)),
    note: `Oferta automática aplicada: ${packSize}u por ${formatMoney(packPrice)}`
  };
}

function calculateSummary() {
  return state.items.reduce((acc, item) => {
    const calc = getLineCalculation(item);
    acc.subtotal += calc.regularSubtotal;
    acc.total += calc.finalSubtotal;
    acc.discount += calc.discount;
    return acc;
  }, { subtotal: 0, total: 0, discount: 0 });
}

function updateChange() {
  const summary = calculateSummary();
  const isCash = getMetodoPago() === 'EFECTIVO';
  const efectivo = toNumber(elements.cashReceivedInput.value);
  const change = isCash ? Math.max(0, efectivo - summary.total) : 0;
  elements.changeAmount.textContent = formatMoney(change);
}

function renderCart() {
  if (!elements.cartTableBody) return;

  if (!state.items.length) {
    elements.cartTableBody.innerHTML = `
      <tr class="empty-state-row">
        <td colspan="5">No hay productos cargados todavía. Escaneá con el lector o usá la búsqueda manual.</td>
      </tr>
    `;
  } else {
    elements.cartTableBody.innerHTML = state.items.map((item) => {
      const calc = getLineCalculation(item);
      return `
        <tr>
          <td>
            <div class="item-name">${escapeHtml(item.name)}</div>
            <div class="item-meta">${escapeHtml(item.code || '')} ${calc.note ? `· ${escapeHtml(calc.note)}` : ''}</div>
          </td>
          <td class="text-center">
            <div class="qty-controls">
              <button type="button" data-action="decrease" data-key="${escapeHtml(item.key)}">−</button>
              <span>${toQuantity(item.quantity)}</span>
              <button type="button" data-action="increase" data-key="${escapeHtml(item.key)}">+</button>
            </div>
          </td>
          <td class="text-end">${formatMoney(item.unitPrice)}</td>
          <td class="text-end">${formatMoney(calc.finalSubtotal)}</td>
          <td class="text-center">
            <button type="button" class="remove-line-btn" data-action="remove" data-key="${escapeHtml(item.key)}">Quitar</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  const summary = calculateSummary();
  elements.subtotalAmount.textContent = formatMoney(summary.subtotal);
  elements.discountAmount.textContent = `-${formatMoney(summary.discount)}`;
  elements.totalAmount.textContent = formatMoney(summary.total);
  updateChange();
}

function resetSale(message) {
  state.items = [];
  elements.cashReceivedInput.value = '';
  if (elements.ticketToggle) elements.ticketToggle.checked = true;
  renderCart();
  elements.barcodeInput.focus();
  if (message) showStatus(message, 'success');
}

function addProduct(producto, quantity = 1) {
  const stock = toNumber(producto.cantidad);
  if (stock <= 0) {
    showStatus(`Sin stock disponible para ${producto.nombre}.`, 'error');
    return;
  }

  const safeQuantity = Math.min(toQuantity(quantity), stock);
  const existing = state.items.find((item) => item.kind === 'product' && item.productId === String(producto._id));

  if (existing) {
    existing.quantity = Math.min(stock, toQuantity(existing.quantity) + safeQuantity);
  } else {
    state.items.push({
      key: `product-${producto._id}`,
      kind: 'product',
      productId: String(producto._id),
      code: `Cod. ${producto.codigo}`,
      name: producto.nombre,
      brand: producto.marca,
      unitPrice: toNumber(producto.precioMinorista),
      quantity: safeQuantity,
      stock
    });
  }

  renderCart();
  showStatus(`${producto.nombre} agregado a la compra.`, 'success');
}

function addOffer(offerId) {
  const offer = offerMap.get(String(offerId));
  if (!offer) return;

  const existing = state.items.find((item) => item.kind === 'offer' && item.offerId === String(offerId));
  if (existing) {
    existing.quantity = toQuantity(existing.quantity) + 1;
  } else {
    state.items.push({
      key: `offer-${offerId}`,
      kind: 'offer',
      offerId: String(offerId),
      code: 'OFERTA',
      name: offer.nombreOferta,
      unitPrice: toNumber(offer.precioOferta),
      quantity: 1,
      productsText: offer.productosTexto || 'Combo cargado'
    });
  }

  renderCart();
  showStatus(`Se agregó ${offer.nombreOferta}.`, 'success');
}

function changeQuantity(key, delta) {
  const item = state.items.find((entry) => entry.key === key);
  if (!item) return;

  const nextValue = toQuantity(item.quantity) + delta;
  if (nextValue <= 0) {
    state.items = state.items.filter((entry) => entry.key !== key);
    renderCart();
    return;
  }

  if (item.kind === 'product' && item.stock > 0) {
    item.quantity = Math.min(item.stock, nextValue);
    if (nextValue > item.stock) {
      showStatus(`Stock máximo disponible: ${item.stock}.`, 'info');
    }
  } else {
    item.quantity = nextValue;
  }

  renderCart();
}

function openFinder(results = [], query = '') {
  if (!elements.finderModal) return;

  elements.finderModal.hidden = false;
  if (query) {
    elements.finderQuery.value = query;
  }
  if (results.length) {
    renderFinderResults(results);
  }
  window.setTimeout(() => elements.finderQuery.focus(), 40);
}

function closeFinder() {
  if (elements.finderModal) {
    elements.finderModal.hidden = true;
  }
  elements.barcodeInput.focus();
}

function openSalesHistoryModal() {
  if (elements.salesHistoryModal) {
    elements.salesHistoryModal.hidden = false;
  }
}

function closeSalesHistoryModal() {
  if (elements.salesHistoryModal) {
    elements.salesHistoryModal.hidden = true;
  }
  elements.barcodeInput.focus();
}

function renderFinderResults(results) {
  if (!results.length) {
    elements.finderResults.innerHTML = '<p class="finder-empty">No se encontraron productos.</p>';
    return;
  }

  elements.finderResults.innerHTML = results.map((producto) => `
    <article class="finder-result-card">
      <div>
        <h3>${escapeHtml(producto.nombre)}</h3>
        <p>Cod. ${escapeHtml(producto.codigo)} · ${escapeHtml(producto.marca || 'Sin marca')}</p>
        <small>Stock: ${toNumber(producto.cantidad)} · Precio: ${formatMoney(producto.precioMinorista)}</small>
      </div>
      <button type="button" class="btn btn-sm btn-success" data-add-product="${escapeHtml(producto._id)}">Agregar</button>
    </article>
  `).join('');
}

async function searchProducts(query, { autoAdd = false, keepOpen = false } = {}) {
  const trimmed = String(query || '').trim();
  if (!trimmed) return [];

  const response = await fetch(`/caja/${cajaData.estacionId}/productos/buscar?q=${encodeURIComponent(trimmed)}`);
  const payload = await response.json();
  const results = Array.isArray(payload.data) ? payload.data : [];

  if (!response.ok) {
    throw new Error(payload.message || 'No se pudo realizar la búsqueda.');
  }

  state.lastFinderResults = results;

  if (!results.length) {
    if (!keepOpen) showStatus('No se encontró ningún producto con ese criterio.', 'error');
    renderFinderResults([]);
    return [];
  }

  const exactCodeMatch = results.find((producto) => String(producto.codigo) === trimmed);
  if (autoAdd && (exactCodeMatch || results.length === 1)) {
    addProduct(exactCodeMatch || results[0]);
    return results;
  }

  renderFinderResults(results);
  openFinder(results, trimmed);
  return results;
}

function buildTicketHtml(ticketData) {
  const negocioNombre = escapeHtml(ticketData.negocioNombre || cajaData.negocioNombre || 'Nombre del negocio');
  const estacionNombre = escapeHtml(ticketData.estacionNombre || cajaData.estacionNombre || 'Caja de Cobro');
  const fechaHora = escapeHtml(ticketData.fecha || new Date().toLocaleString('es-AR'));

  const itemsMarkup = (ticketData.items || []).map((item) => `
    <tr>
      <td>
        <strong>${escapeHtml(item.name)}</strong>
        ${item.note ? `<div class="line-note">${escapeHtml(item.note)}</div>` : ''}
      </td>
      <td>${toQuantity(item.quantity)}</td>
      <td>${formatMoney(item.subtotal)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>Ticket ${escapeHtml(ticketData.ventaId || '')}</title>
      <style>
        @page {
          size: 80mm auto;
          margin: 3mm;
        }
        html, body {
          width: 80mm;
          margin: 0;
          padding: 0;
          background: #ffffff;
          color: #111827;
          font-family: 'Courier New', Courier, monospace;
          font-size: 11px;
          line-height: 1.25;
        }
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .ticket {
          width: 72mm;
          margin: 0 auto;
          padding: 1mm 0;
        }
        .ticket h1, .ticket h2, .ticket p { margin: 0; }
        .ticket-header {
          text-align: center;
          margin-bottom: 8px;
        }
        .ticket-header h1 {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 2px;
        }
        .ticket-header .business-sub,
        .ticket-header .date-line {
          font-size: 11px;
          margin-top: 2px;
        }
        .divider {
          border-top: 1px dashed #475569;
          margin: 8px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }
        th, td {
          padding: 3px 0;
          text-align: left;
          vertical-align: top;
        }
        th:nth-child(2), td:nth-child(2) {
          text-align: center;
          width: 12mm;
        }
        th:last-child, td:last-child {
          text-align: right;
          width: 18mm;
        }
        .line-note {
          font-size: 10px;
          color: #475569;
          margin-top: 1px;
        }
        .meta p {
          font-size: 11px;
          margin-bottom: 3px;
        }
        .total-row {
          font-size: 13px;
          font-weight: 700;
        }
        .footer {
          text-align: center;
          font-size: 10.5px;
          margin-top: 8px;
        }
        .footer strong {
          display: block;
          margin-top: 6px;
          font-size: 10px;
        }
      </style>
    </head>
    <body>
      <div class="ticket">
        <div class="ticket-header">
          <h1>${negocioNombre}</h1>
          <p class="business-sub">${estacionNombre}</p>
          <p class="date-line">Fecha y hora: ${fechaHora}</p>
        </div>

        <div class="meta">
          <p><strong>Venta:</strong> ${escapeHtml(ticketData.ventaId || '-')}</p>
          <p><strong>Cajero:</strong> ${escapeHtml(ticketData.cajero || '-')}</p>
          <p><strong>Pago:</strong> ${escapeHtml(ticketData.metodoPago || '-')}</p>
        </div>

        <div class="divider"></div>

        <table>
          <thead>
            <tr>
              <th>Detalle</th>
              <th>Cant.</th>
              <th>Importe</th>
            </tr>
          </thead>
          <tbody>
            ${itemsMarkup}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="2">TOTAL</td>
              <td>${formatMoney(ticketData.total)}</td>
            </tr>
            <tr>
              <td colspan="2">Recibido</td>
              <td>${formatMoney(ticketData.efectivoRecibido)}</td>
            </tr>
            <tr>
              <td colspan="2">Vuelto</td>
              <td>${formatMoney(ticketData.cambio)}</td>
            </tr>
          </tfoot>
        </table>

        <div class="divider"></div>
        <div class="footer">
          <p>Ticket ${ticketData.ticketEntregado === 'SI' ? 'entregado' : 'no entregado'}</p>
          <p>Gracias por su compra</p>
          <strong>TICKET NO VÁLIDO COMO DOCUMENTO FISCAL</strong>
        </div>
      </div>
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 180);
        };

        window.onafterprint = function() {
          setTimeout(function() {
            window.close();
          }, 250);
        };

        window.onfocus = function() {
          setTimeout(function() {
            try {
              window.close();
            } catch (e) {
              // no-op
            }
          }, 500);
        };
      <\/script>
    </body>
    </html>
  `;
}

function printTicket(ticketData, { silent = false } = {}) {
  if (!ticketData) {
    if (!silent) showStatus('No hay datos de ticket para imprimir.', 'error');
    return false;
  }

  const printWindow = window.open('', '_blank', 'width=420,height=760');
  if (!printWindow) {
    if (!silent) {
      showStatus('El navegador bloqueó la impresión. Usá "Reimprimir último ticket" cuando habilites la ventana.', 'error');
    }
    return false;
  }

  printWindow.document.open();
  printWindow.document.write(buildTicketHtml(ticketData));
  printWindow.document.close();
  printWindow.focus();
  return true;
}

async function openSalesHistory() {
  if (!elements.salesHistoryBody) return;

  openSalesHistoryModal();
  elements.salesHistoryBody.innerHTML = `
    <tr>
      <td colspan="7" class="text-center text-muted">Cargando ventas...</td>
    </tr>
  `;

  try {
    const response = await fetch(`/caja/${cajaData.estacionId}/ventas-ultimas-24h`);
    const payload = await response.json();

    if (!response.ok || !payload.success) {
      throw new Error(payload.message || 'No se pudo cargar el listado de ventas.');
    }

    state.salesHistory = Array.isArray(payload.data) ? payload.data : [];
    renderSalesHistory(state.salesHistory);
  } catch (error) {
    elements.salesHistoryBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-danger">${escapeHtml(error.message || 'Error al cargar ventas.')}</td>
      </tr>
    `;
  }
}

function renderSalesHistory(sales) {
  if (!elements.salesHistoryBody) return;

  if (!sales.length) {
    elements.salesHistoryBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted">No hay ventas registradas en las últimas 24 horas.</td>
      </tr>
    `;
    return;
  }

  elements.salesHistoryBody.innerHTML = sales.map((sale) => `
    <tr>
      <td>${escapeHtml(sale.fecha || '-')}</td>
      <td>${escapeHtml(sale.cajero || '-')}</td>
      <td class="sales-detail-text">${escapeHtml(sale.detalleTexto || 'Sin detalle')}</td>
      <td>${formatMoney(sale.total)}</td>
      <td>${escapeHtml(sale.metodoPago || '-')}</td>
      <td>${escapeHtml(sale.ticketEntregado || '-')}</td>
      <td>
        <button type="button" class="btn btn-sm btn-outline-dark sales-print-btn" data-print-sale="${escapeHtml(sale._id)}">
          🖨️ Imprimir
        </button>
      </td>
    </tr>
  `).join('');
}

async function printSaleFromHistory(ventaId) {
  try {
    const response = await fetch(`/caja/${cajaData.estacionId}/ventas/${ventaId}/ticket-data`);
    const payload = await response.json();

    if (!response.ok || !payload.success) {
      throw new Error(payload.message || 'No se pudo recuperar el ticket de esa venta.');
    }

    saveLastTicket(payload.ticketData);
    printTicket(payload.ticketData);
  } catch (error) {
    showStatus(error.message || 'No se pudo imprimir la venta seleccionada.', 'error');
  }
}

async function handleCheckout() {
  if (!state.items.length) {
    showStatus('Primero agregá productos a la compra.', 'error');
    return;
  }

  const summary = calculateSummary();
  const metodoPago = getMetodoPago();
  const efectivoRecibido = toNumber(elements.cashReceivedInput.value);

  if (metodoPago === 'EFECTIVO' && efectivoRecibido < summary.total) {
    showStatus('El efectivo recibido debe ser igual o mayor al total.', 'error');
    elements.cashReceivedInput.focus();
    return;
  }

  elements.checkoutBtn.disabled = true;
  elements.checkoutBtn.textContent = 'Registrando...';

  try {
    const response = await fetch(`/caja/${cajaData.estacionId}/registrar-venta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: state.items.map((item) => ({
          kind: item.kind,
          productId: item.productId,
          offerId: item.offerId,
          quantity: toQuantity(item.quantity),
          unitPrice: toNumber(item.unitPrice)
        })),
        metodoPago,
        efectivoRecibido,
        ticketEntregado: elements.ticketToggle && elements.ticketToggle.checked ? 'SI' : 'NO'
      })
    });

    const payload = await response.json();

    if (!response.ok || !payload.success) {
      throw new Error(payload.message || 'No se pudo registrar la venta.');
    }

    if (payload.ticketData) {
      saveLastTicket(payload.ticketData);
      const printed = printTicket(payload.ticketData, { silent: true });

      if (!printed) {
        showStatus('Venta registrada. Si falló la impresión, usá “Reimprimir último ticket”.', 'info');
      }
    }

    resetSale(`Venta registrada por ${formatMoney(payload.total)}${payload.cambio ? ` · Vuelto: ${formatMoney(payload.cambio)}` : ''}`);
  } catch (error) {
    showStatus(error.message || 'Ocurrió un error al registrar la venta.', 'error');
  } finally {
    elements.checkoutBtn.disabled = false;
    elements.checkoutBtn.textContent = '✅ Registrar venta';
  }
}

elements.barcodeForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const value = elements.barcodeInput.value.trim();
  if (!value) return;

  try {
    await searchProducts(value, { autoAdd: true });
    elements.barcodeInput.value = '';
  } catch (error) {
    showStatus(error.message, 'error');
  }
});

elements.finderSearchForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    await searchProducts(elements.finderQuery.value, { keepOpen: true });
  } catch (error) {
    showStatus(error.message, 'error');
  }
});

elements.finderResults?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-add-product]');
  if (!button) return;

  const productId = button.getAttribute('data-add-product');
  const producto = state.lastFinderResults.find((item) => String(item._id) === String(productId));

  if (producto) {
    addProduct(producto);
    closeFinder();
  }
});

elements.salesHistoryBody?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-print-sale]');
  if (!button) return;

  printSaleFromHistory(button.getAttribute('data-print-sale'));
});

elements.cartTableBody?.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const { action, key } = button.dataset;

  if (action === 'remove') {
    state.items = state.items.filter((item) => item.key !== key);
    renderCart();
    return;
  }

  if (action === 'increase') {
    changeQuantity(key, 1);
  }

  if (action === 'decrease') {
    changeQuantity(key, -1);
  }
});

elements.paymentInputs.forEach((input) => {
  input.addEventListener('change', syncPaymentLabels);
});

elements.cashReceivedInput?.addEventListener('input', updateChange);
elements.checkoutBtn?.addEventListener('click', handleCheckout);
elements.newSaleBtn?.addEventListener('click', () => resetSale('Compra limpia para iniciar una nueva venta.'));
elements.openFinderBtn?.addEventListener('click', () => openFinder());
elements.closeFinderBtn?.addEventListener('click', closeFinder);
elements.lastTicketBtn?.addEventListener('click', () => {
  const ticketData = getLastTicket();
  if (!ticketData) {
    showStatus('Todavía no hay un ticket guardado para reimprimir.', 'info');
    return;
  }

  printTicket(ticketData);
});
elements.salesHistoryBtn?.addEventListener('click', openSalesHistory);
elements.closeSalesHistoryBtn?.addEventListener('click', closeSalesHistoryModal);
elements.offerButtons.forEach((button) => {
  button.addEventListener('click', () => addOffer(button.dataset.offerId));
});

window.addEventListener('click', (event) => {
  if (event.target === elements.finderModal) {
    closeFinder();
  }

  if (event.target === elements.salesHistoryModal) {
    closeSalesHistoryModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'F4') {
    event.preventDefault();
    openFinder();
  }

  if (event.key === 'F9') {
    event.preventDefault();
    handleCheckout();
  }

  if (event.key === 'Escape') {
    if (elements.finderModal && !elements.finderModal.hidden) {
      closeFinder();
    }

    if (elements.salesHistoryModal && !elements.salesHistoryModal.hidden) {
      closeSalesHistoryModal();
    }
  }
});

renderCart();
syncPaymentLabels();
updateLastTicketButton();
elements.barcodeInput?.focus();
