/**
 * SEARCH MANAGER - Gestor Centralizado de Búsquedas
 * 
 * Proporciona lógica única de búsqueda inteligente para usar en:
 * - Stock (búsqueda rápida)
 * - Ofertas individual
 * - Ofertas batch
 * 
 * Características:
 * - Auto-detección: barcode vs texto
 * - Debounce configurable
 * - Manejo consistente de errores
 * - Soporte para múltiples modos
 */

class SearchManager {
  constructor(options = {}) {
    this.endpoint = options.endpoint || '/api/search/smart';
    this.debounceDelay = options.debounceDelay || 300;
    this.minChars = options.minChars || 1;
    this.maxResults = options.maxResults || 50;
    this.onSuccess = options.onSuccess || (() => {});
    this.onError = options.onError || (() => {});
    this.onLoading = options.onLoading || (() => {});
    
    this.searchTimeout = null;
    this.lastQuery = '';
  }

  /**
   * Realizar búsqueda con debounce
   */
  search(query, force = false) {
    return new Promise((resolve, reject) => {
      clearTimeout(this.searchTimeout);
      
      const searchTerm = String(query || '').trim();
      
      // Validación básica
      if (searchTerm.length < this.minChars) {
        this.onError('Ingresa un término de búsqueda');
        return reject(new Error('Term too short'));
      }
      
      if (!force && searchTerm === this.lastQuery) {
        return resolve([]);
      }
      
      this.lastQuery = searchTerm;
      this.onLoading(true);
      
      // Debounce la búsqueda
      this.searchTimeout = setTimeout(async () => {
        try {
          const results = await this._performSearch(searchTerm);
          this.onLoading(false);
          this.onSuccess(results);
          resolve(results);
        } catch (error) {
          this.onLoading(false);
          this.onError(error.message || 'Error en búsqueda');
          reject(error);
        }
      }, force ? 0 : this.debounceDelay);
    });
  }

  /**
   * Búsqueda inmediata (sin debounce)
   */
  async searchNow(query) {
    clearTimeout(this.searchTimeout);
    return this.search(query, true);
  }

  /**
   * Realizar búsqueda en API
   */
  async _performSearch(query) {
    const searchType = this._detectSearchType(query);
    
    const body = {
      query: query,
      type: searchType
    };

    const response = await axios.post(this.endpoint, body, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'No se encontraron productos');
    }

    return response.data.data || [];
  }

  /**
   * Detectar tipo de búsqueda (barcode vs texto)
   * - Si es numérico puro y >= 3 dígitos → barcode
   * - Si no → texto
   */
  _detectSearchType(query) {
    const isNumeric = /^\d+$/.test(query);
    const isLongEnough = query.length >= 3;
    
    return (isNumeric && isLongEnough) ? 'barcode' : 'text';
  }

  /**
   * Cancelar búsqueda actual
   */
  cancel() {
    clearTimeout(this.searchTimeout);
    this.onLoading(false);
  }

  /**
   * Limpiar estado
   */
  clear() {
    this.cancel();
    this.lastQuery = '';
  }
}

/**
 * SEARCH UI HELPER - Ayudante para crear interfaces de búsqueda
 * Encapsula la lógica UI común
 */
class SearchUIHelper {
  constructor(options = {}) {
    this.searchManager = options.searchManager;
    this.inputSelector = options.inputSelector;
    this.resultsSelector = options.resultsSelector;
    this.noResultsSelector = options.noResultsSelector;
    this.loadingSelector = options.loadingSelector;
    this.buttonSelector = options.buttonSelector;
    
    this.init();
  }

  init() {
    const input = document.querySelector(this.inputSelector);
    const btn = document.querySelector(this.buttonSelector);
    
    if (input) {
      // Input en tiempo real
      input.addEventListener('input', (e) => {
        this.searchManager.search(e.target.value);
      });
      
      // Enter
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.searchManager.searchNow(e.target.value);
        }
      });
    }
    
    if (btn) {
      // Botón de búsqueda
      btn.addEventListener('click', () => {
        if (input) {
          this.searchManager.searchNow(input.value);
        }
      });
    }
  }

  /**
   * Mostrar resultados en UI
   */
  displayResults(productos) {
    const container = document.querySelector(this.resultsSelector);
    const noResults = document.querySelector(this.noResultsSelector);
    
    if (!container) return;
    
    if (!productos || productos.length === 0) {
      if (container) container.style.display = 'none';
      if (noResults) noResults.style.display = 'block';
      return;
    }
    
    container.innerHTML = '';
    container.style.display = 'block';
    if (noResults) noResults.style.display = 'none';
    
    productos.forEach(producto => {
      const card = this.createProductCard(producto);
      container.appendChild(card);
    });
  }

  /**
   * Crear tarjeta de producto (personalizable por subclase)
   */
  createProductCard(producto) {
    const card = document.createElement('div');
    card.className = 'product-search-item';
    card.innerHTML = `
      <div class="product-name">${producto.nombre || 'Sin nombre'}</div>
      <div class="product-details">
        <small>Marca: ${producto.marca || 'N/A'} | Código: ${producto.codigo || 'N/A'}</small>
      </div>
      <div class="product-price">$${(producto.precioMinorista || 0).toFixed(2)}</div>
    `;
    return card;
  }

  hideResults() {
    const container = document.querySelector(this.resultsSelector);
    if (container) container.style.display = 'none';
  }
}
