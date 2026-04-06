/**
 * PRODUCT SEARCH MODULE
 * 
 * Sistema de búsqueda universal para productos
 * Funciona con:
 * - Búsqueda por texto (nombre, marca, código)
 * - Búsqueda por código de barras
 * - Búsqueda inteligente (auto-detección)
 * - Compatible con lectores de código de barras
 * 
 * Uso:
 * const search = new ProductSearch(options);
 * search.init();
 */

class ProductSearch {
  constructor(options = {}) {
    // Elementos del DOM
    this.searchInput = options.searchInput || document.getElementById('searchInput');
    this.searchByBarcode = options.searchByBarcode || document.getElementById('searchByBarcode');
    this.sortFilter = options.sortFilter || document.getElementById('sortFilter');
    this.searchResults = options.searchResults || document.getElementById('searchResults');
    this.noResults = options.noResults || document.getElementById('noResults');
    this.initialState = options.initialState || document.getElementById('initialState');
    this.alertMessage = options.alertMessage || document.getElementById('alertMessage');
    this.searchStats = options.searchStats || document.getElementById('searchStats');
    this.resultCount = options.resultCount || document.getElementById('resultCount');
    this.template = options.template || document.getElementById('productCardTemplate');
    this.clearSearchBtn = options.clearSearchBtn || document.getElementById('clearSearchBtn');

    // Opciones de configuración
    this.searchDelay = options.searchDelay || 300;
    this.minChars = options.minChars || 2;
    this.apiEndpoint = options.apiEndpoint || '/api/search/smart';
    this.useSmartSearch = options.useSmartSearch !== false;
    this.onResultClick = options.onResultClick || null;
    this.maxResults = options.maxResults || 50;

    // Estados
    this.searchTimeout = null;
    this.lastSearch = '';

    // Validar elementos críticos
    if (!this.searchInput || !this.searchResults) {
      console.warn('ProductSearch: Elementos del DOM no encontrados');
    }
  }

  /**
   * Inicializar event listeners
   */
  init() {
    if (!this.searchInput) return;

    // Input cambio
    this.searchInput.addEventListener('input', () => this.onSearchInput());

    // Enter key
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.performSearch();
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        this.clear();
      }
    });

    // Toggle búsqueda por código/texto
    if (this.searchByBarcode) {
      this.searchByBarcode.addEventListener('change', () => this.onSearchTypeChange());
    }

    // Cambio de ordenamiento
    if (this.sortFilter) {
      this.sortFilter.addEventListener('change', () => this.performSearch());
    }

    // Limpiar búsqueda
    if (this.clearSearchBtn) {
      this.clearSearchBtn.addEventListener('click', (e) => this.onClear(e));
    }

    console.log('ProductSearch initialized');
  }

  /**
   * Ejecutar búsqueda (con debounce)
   */
  onSearchInput() {
    clearTimeout(this.searchTimeout);
    
    const value = this.searchInput.value.trim();
    
    // Si está vacío, mostrar estado inicial
    if (value.length === 0) {
      this.showInitialState();
      return;
    }

    // Esperar a que el usuario termine de escribir
    this.searchTimeout = setTimeout(() => {
      this.performSearch();
    }, this.searchDelay);
  }

  /**
   * Ejecutar búsqueda real
   */
  async performSearch() {
    const searchTerm = this.searchInput.value.trim();
    const searchMode = this.searchByBarcode?.checked ? 'barcode' : 'text';
    const sortBy = this.sortFilter?.value || 'relevancia';
    const searchKey = `${searchTerm}|${searchMode}|${sortBy}`;

    // Validación
    if (searchTerm.length < this.minChars) {
      this.showAlert(`Ingresa al menos ${this.minChars} caracteres`);
      return;
    }

    // Evitar búsquedas duplicadas reales
    if (searchKey === this.lastSearch) return;
    this.lastSearch = searchKey;

    // Mostrar loading
    this.showLoading();

    try {
      const response = await this.searchProducts(searchTerm);

      if (!response.success || response.data.length === 0) {
        this.showNoResults();
        return;
      }

      this.displayResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
      this.showAlert(error.message || 'Error al buscar productos');
    }
  }

  /**
   * Enviar petición de búsqueda al servidor
   */
  async searchProducts(searchTerm) {
    const isBarcodeSearch = this.searchByBarcode?.checked || false;
    const sortBy = this.sortFilter?.value || 'relevancia';

    let endpoint, payload;

    if (this.useSmartSearch) {
      endpoint = this.apiEndpoint;
      payload = { 
        query: searchTerm,
        type: isBarcodeSearch ? 'barcode' : 'text'
      };
    } else {
      if (isBarcodeSearch) {
        endpoint = '/api/search/barcode';
        payload = { codigo: searchTerm };
      } else {
        endpoint = '/api/search/productos';
        payload = { query: searchTerm, sort: sortBy };
      }
    }

    const response = await axios.post(endpoint, payload);
    return response.data;
  }

  /**
   * Mostrar resultados de búsqueda
   */
  displayResults(productos) {
    if (!this.searchResults || !this.template) {
      console.error('Elementos requeridos no encontrados');
      return;
    }

    const sortBy = this.sortFilter?.value || 'relevancia';
    const safeResults = Array.isArray(productos) ? [...productos] : [];

    if (sortBy === 'nombre') {
      safeResults.sort((a, b) => String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es'));
    } else if (sortBy === 'precio') {
      safeResults.sort((a, b) => Number(a.precioMinorista || a.valor || 0) - Number(b.precioMinorista || b.valor || 0));
    } else if (sortBy === 'stock') {
      safeResults.sort((a, b) => Number(b.cantidad || 0) - Number(a.cantidad || 0));
    }

    const limitedResults = safeResults.slice(0, this.maxResults);
    const fragment = document.createDocumentFragment();

    this.searchResults.innerHTML = '';
    this.hideInitialState();
    this.hideNoResults();
    this.hideAlert();
    this.showSearchStats(limitedResults.length);

    limitedResults.forEach((producto) => {
      const card = this.createProductCard(producto);
      fragment.appendChild(card);
    });

    this.searchResults.appendChild(fragment);
  }

  /**
   * Crear tarjeta de producto
   */
  createProductCard(producto) {
    const clone = this.template.content.cloneNode(true);

    // Rellenar datos
    const setTextContent = (selector, value) => {
      const el = clone.querySelector(selector);
      if (el) el.textContent = value || 'N/A';
    };

    setTextContent('.result-card-title', producto.nombre);
    setTextContent('.result-card-brand', producto.marca || 'Sin marca');
    setTextContent('.code', producto.codigo);
    setTextContent('.brand', producto.marca);
    setTextContent('.stock', `${producto.cantidad || 0} unidades`);

    const price = producto.precioMinorista || producto.valor || 0;
    setTextContent('.price', `$${price.toFixed(2)}`);

    // Links
    const editBtn = clone.querySelector('.btn-result-edit');
    const stockBtn = clone.querySelector('.btn-result-stock');

    if (editBtn) {
      editBtn.href = `/administrador/productos/${producto._id}`;
      editBtn.setAttribute('aria-label', `Ver detalle de ${producto.nombre || 'producto'}`);
      editBtn.setAttribute('title', `Ver detalle de ${producto.nombre || 'producto'}`);
      editBtn.addEventListener('click', (e) => {
        if (this.onResultClick) {
          e.preventDefault();
          this.onResultClick(producto, 'detail');
        }
      });
    }

    if (stockBtn) {
      stockBtn.href = `/administrador/productos/${producto._id}/upstock`;
      stockBtn.setAttribute('aria-label', `Actualizar stock de ${producto.nombre || 'producto'}`);
      stockBtn.setAttribute('title', `Actualizar stock de ${producto.nombre || 'producto'}`);
      stockBtn.addEventListener('click', (e) => {
        if (this.onResultClick) {
          e.preventDefault();
          this.onResultClick(producto, 'stock');
        }
      });
    }

    return clone;
  }

  /**
   * Cambio de tipo de búsqueda
   */
  onSearchTypeChange() {
    if (!this.searchByBarcode) return;

    const isBarcode = this.searchByBarcode.checked;
    this.lastSearch = '';
    this.searchInput.placeholder = isBarcode
      ? 'Escanea o ingresa código de barra...'
      : 'Busca por nombre, marca o código...';

    // Re-ejecutar búsqueda al cambiar el modo
    if (this.searchInput.value.trim()) {
      this.performSearch();
    }
  }

  /**
   * Limpiar búsqueda
   */
  onClear(e) {
    e?.preventDefault();

    this.lastSearch = '';
    this.searchInput.value = '';
    if (this.searchByBarcode) this.searchByBarcode.checked = false;
    if (this.sortFilter) this.sortFilter.value = 'relevancia';

    this.searchInput.placeholder = 'Busca por nombre, marca o código...';
    this.showInitialState();
    this.searchInput.focus();
  }

  /**
   * UI - Mostrar/ocultar estados
   */
  showInitialState() {
    if (this.initialState) this.initialState.style.display = 'flex';
    if (this.searchResults) this.searchResults.innerHTML = '';
    this.hideNoResults();
    this.hideAlert();
    this.hideSearchStats();
  }

  showNoResults() {
    if (this.noResults) this.noResults.style.display = 'flex';
    if (this.initialState) this.initialState.style.display = 'none';
    if (this.searchResults) this.searchResults.innerHTML = '';
    this.hideAlert();
    this.hideSearchStats();
  }

  showLoading() {
    if (this.searchResults) {
      this.searchResults.innerHTML = '<div class="search-loading" role="status" aria-live="polite">Buscando productos...</div>';
    }
  }

  showAlert(message) {
    if (this.alertMessage && this.alertMessage.querySelector?.('#alertText')) {
      this.alertMessage.style.display = 'flex';
      this.alertMessage.querySelector('#alertText').textContent = message;
    }
  }

  hideAlert() {
    if (this.alertMessage) this.alertMessage.style.display = 'none';
  }

  showSearchStats(count) {
    if (this.searchStats && this.resultCount) {
      this.searchStats.style.display = 'flex';
      this.resultCount.textContent = count;
    }
  }

  hideSearchStats() {
    if (this.searchStats) this.searchStats.style.display = 'none';
  }

  hideNoResults() {
    if (this.noResults) this.noResults.style.display = 'none';
  }

  hideInitialState() {
    if (this.initialState) this.initialState.style.display = 'none';
  }

  /**
   * API pública - Buscar manualmente
   */
  async search(query) {
    this.searchInput.value = query;
    return this.performSearch();
  }

  /**
   * API pública - Limpiar
   */
  clear() {
    this.onClear();
  }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProductSearch;
}
