# 🗺️ Mapa Completo - Sistema de Búsqueda Universal

**Fase 3 - Search Implementation | Completado: 70%**

---

## 📍 Ubicación de Archivos

### Backend - API Rest

```
/routes/
└── searchApi.js (286 líneas)
    ├── POST /api/search/productos
    │   └── Búsqueda por texto en nombre, marca, código
    │   └── Query: { query, sort, limit }
    │   └── Response: Array de productos
    │
    ├── POST /api/search/barcode
    │   └── Búsqueda exacta de código de barras
    │   └── Query: { barcode }
    │   └── Response: Producto encontrado o fallback a regex
    │
    ├── POST /api/search/smart (⭐ RECOMENDADO)
    │   └── Auto-detecta: barcode vs texto
    │   └── Query: { query }
    │   └── Response: Según tipo de búsqueda
    │
    └── POST /api/search/advanced
        └── Multi-criteria search
        └── Query: { query, precioMin, precioMax, cantidadMin, sort }
        └── Response: Resultados filtrados
```

---

### Frontend - JavaScript (Clase)

```
/public/js/
└── productSearch.js (420 líneas)
    ├── Constructor(options)
    │   ├── DOM elements (searchInput, results, etc)
    │   ├── Configuration (apiEndpoint, searchDelay, etc)
    │   └── Callbacks (onResultClick)
    │
    ├── Methods
    │   ├── init() - Attach event listeners
    │   ├── performSearch(query) - Main search logic
    │   ├── searchProducts(query) - API call
    │   ├── displayResults(productos) - Render results
    │   ├── createProductCard(producto) - Template clone
    │   ├── onSearchInput(e) - Debounced input handler
    │   ├── onSearchTypeChange(e) - Barcode toggle
    │   └── onClear() - Clear search
    │
    └── Features
        ├── Smart barcode detection (numeric input ≥3)
        ├── Debounced input (300ms default)
        ├── Template-based rendering
        └── Event dispatch (productSelected)
```

---

### Frontend - Componentes EJS

#### Option 1: Input Inline (Para Formularios)

```
/views/partials/
└── productSearchInput.ejs (190 líneas)
    ├── Input con searchbox
    ├── Dropdown de resultados
    ├── Producto seleccionado display
    ├── CSS inline
    └── JavaScript inline
    
    Uso en vista:
    <%- include('../partials/productSearchInput', {
        inputId: 'mySearch',
        resultsId: 'myResults',
        selectedProductId: 'selectedProductId'
    }) %>
```

#### Option 2: Modal (Para Búsqueda Exploratoria)

```
/views/partials/
└── productSearchModal.ejs (218 líneas)
    ├── Bootstrap Modal container
    ├── Search input + icon
    ├── Barcode mode toggle
    ├── Results container (scrollable)
    ├── 4 states: initial, loading, results, no-results
    ├── Product item template
    ├── CSS & JS inline
    └── Events: productSelected
    
    Uso en vista:
    <%- include('../partials/productSearchModal', {
        modalId: 'searchModal',
        modalTitle: 'Buscar Producto'
    }) %>
```

---

### Vistas de Ejemplo

#### Stock Module

```
/views/stock/
├── listado.ejs (Original - ACTUALIZADO ✅)
│   └── Usa ProductSearch class
│   └── Anteriorment: 150+ líneas inline JS
│   └── Ahora: 10 líneas usando clase
│
└── actualizar.ejs (🆕 NUEVO - COMPLETO)
    ├── Breadcrumb & Header
    ├── Producto Search (usando productSearchInput)
    ├── Stock actual display
    ├── Update type selector (set/add/subtract)
    ├── Nueva cantidad input
    ├── Notas input
    ├── Change preview (estimación)
    ├── Form actions
    ├── JavaScript con axios
    ├── Event listener para productSelected
    └── Submit handler (POST /administrador/stock/update)
    
    URL: /administrador/stock/actualizar
    Método: GET → Muestra formulario
    Acción: POST → Actualiza stock
```

#### Ofertas Module - Individual

```
/views/ofertas/
└── agregarIndividual.ejs (🆕 NUEVO - COMPLETO)
    ├── Breadcrumb & Header
    ├── Producto Search (usando productSearchInput)
    ├── Precio regular display
    ├── Precio oferta input
    ├── Cantidad disponible (auto-load)
    ├── Descuento display (automatic)
    ├── Fechas (inicio/fin)
    ├── Descripción input
    ├── Resumen de oferta
    ├── Form actions
    ├── JavaScript con axios
    ├── Event listener para productSelected
    └── Submit handler (POST /administrador/ofertas/create)
    
    URL: /administrador/ofertas/individual
    Método: GET → Muestra formulario
    Acción: POST → Crea oferta
```

#### Ofertas Module - Batch

```
/views/ofertas/
└── agregarBatch.ejs (🆕 NUEVO - COMPLETO)
    ├── Breadcrumb & Header
    ├── Search Modal (usando productSearchModal)
    ├── Productos agregados lista
    ├── Descuento global slider
    ├── Fechas (inicio/fin)
    ├── Descripción input
    ├── Vista previa tabla
    ├── Resumen del lote
    ├── Edición inline de precios
    ├── Eliminar producto button
    ├── Form actions
    ├── JavaScript con axios
    ├── Event listener para productSelected
    └── Submit handler (POST /administrador/ofertas/create-batch)
    
    URL: /administrador/ofertas/batch
    Método: GET → Muestra formulario
    Acción: POST → Crea múltiples ofertas
```

---

### Documentación

```
📚 Documentación (7 archivos - 1100+ líneas)
├── VISUAL_STATUS.txt
│   └── ASCII art visual overview (250+ líneas)
│   └── Leer primero: 2-3 minutos
│
├── README_BUSQUEDA.md
│   └── Guía rápida (150+ líneas)
│   └── ¿Qué se hizo? Cómo usar. Ejemplo.
│   └── 5 minutos
│
├── QUICK_SETUP_BUSQUEDA.md
│   └── Setup paso a paso (180+ líneas)
│   └── 3 pasos para activar
│   └── 15-20 minutos
│
├── SEARCH_INTEGRATION_GUIDE.md
│   └── Guía completa (300+ líneas)
│   └── Arquitectura, ejemplos, barcode, testing
│   └── 20 minutos
│
├── ROUTES_IMPLEMENTATION.md
│   └── Código de rutas (250+ líneas)
│   └── Copy/paste code para Stock y Ofertas
│   └── 10 minutos
│
├── PHASE3_STATUS.md
│   └── Estado del proyecto (280+ líneas)
│   └── Resumen ejecutivo, checklist, troubleshooting
│   └── 15 minutos
│
└── DOCUMENTATION_INDEX_BUSQUEDA.md
    └── Este índice (este archivo)
    └── Guía de guías
```

---

### Validadores

```
🔧 Scripts (2 archivos)
├── validate-search.js
│   └── Verifica que archivos existan
│   └── Valida contenido
│   └── Ejecutar: node validate-search.js
│   └── Tiempo: 1 minuto
│
└── setup-search.js
    └── Verifica Node, npm, dependencias
    └── Verifica MongoDB
    └── Ejecutar: node setup-search.js
    └── Tiempo: 1 minuto

✨ Bonus:
├── summary.js
│   └── Resumen visual en terminal
│   └── Ejecutar: node summary.js
```

---

## 🔄 Flujo de Datos

```
Usuario escriba/scannea
        ↓
Input event (productSearchInput.ejs)
        ↓
ProductSearch.onSearchInput() [debounce 300ms]
        ↓
ProductSearch.performSearch(query)
        ↓
axios.post('/api/search/smart', { query })
        ↓
/routes/searchApi.js - Detecta tipo (barcode/texto)
        ↓
MongoDB query con regex
        ↓
Relevance scoring + sorting
        ↓
Response JSON (array de productos)
        ↓
ProductSearch.displayResults()
        ↓
Crea producto cards (clone template)
        ↓
Renderiza en dropdown/modal
        ↓
Usuario hace click
        ↓
productSelected event dispatch
        ↓
Evento escuchado en vista (en DOMContentLoaded)
        ↓
onResultClick callback ejecutado
        ↓
Datos de producto disponibles para usar
```

---

## 🌐 URLs Finales

### Con rutas completadas (después de setup):

```
Stock Module:
  /administrador/stock              → GET - Listar stock
  /administrador/stock/actualizar   → GET - Formulario actualizar
                                   → POST - Actualizar (API)

Ofertas Module:
  /administrador/ofertas            → GET - Listar ofertas
  /administrador/ofertas/individual → GET - Formulario individual
                                   → POST - Crear (API)
  /administrador/ofertas/batch      → GET - Formulario batch
                                   → POST - Crear batch (API)

Búsqueda (ya existe):
  /administrador/buscar             → GET - Página de búsqueda

API:
  /api/search/productos             → POST - Búsqueda texto
  /api/search/barcode               → POST - Búsqueda código
  /api/search/smart                 → POST - Auto-detect
  /api/search/advanced              → POST - Multi-criteria
```

---

## 📊 Estadísticas

| Categoría | Cantidad | Líneas |
|-----------|----------|--------|
| Archivos Backend | 1 | 286 |
| Archivos Frontend JS | 1 | 420 |
| Componentes EJS | 2 | 408 |
| Vistas de ejemplo | 3 | 880+ |
| Documentación | 7 | 1100+ |
| Validadores | 3 | 100+ |
| **TOTAL** | **17** | **3000+** |

---

## 🎯 Para Cada Tipo de Usuario

### 👨‍💼 Project Manager
→ Leer: PHASE3_STATUS.md + VISUAL_STATUS.txt

### 👨‍💻 Developer (Frontend)
→ Leer: README_BUSQUEDA.md → SEARCH_INTEGRATION_GUIDE.md
→ Ver: /public/js/productSearch.js
→ Ver: /views/partials/*.ejs

### 👨‍💻 Developer (Backend)
→ Leer: ROUTES_IMPLEMENTATION.md
→ Ver: /routes/searchApi.js
→ Copiar: Código de rutas

### 🔧 DevOps/SysAdmin
→ Ejecutar: node setup-search.js
→ Verificar: node validate-search.js

### 📚 Technical Writer
→ Usar: Toda la documentación como referencia
→ Combinar en: Manual de usuario final

---

## ⚡ Quick Links

| Necesito... | Archivo |
|------------|---------|
| Una overview rápida | VISUAL_STATUS.txt |
| Entender qué se hizo | README_BUSQUEDA.md |
| Setup paso a paso | QUICK_SETUP_BUSQUEDA.md |
| Integración detallada | SEARCH_INTEGRATION_GUIDE.md |
| Copiar rutas | ROUTES_IMPLEMENTATION.md |
| Estado completo | PHASE3_STATUS.md |
| Ver todos los archivos | DOCUMENTATION_INDEX_BUSQUEDA.md |
| Validar instalación | validate-search.js |
| Hacer setup | setup-search.js |
| Resumen visual | summary.js |

---

## ✅ Checklist de Implementación

- [ ] Leer VISUAL_STATUS.txt (2-3 min)
- [ ] Leer README_BUSQUEDA.md (5 min)
- [ ] Leer QUICK_SETUP_BUSQUEDA.md (15 min)
- [ ] Abrir ROUTES_IMPLEMENTATION.md
- [ ] Crear /routes/stock.js (5 min)
- [ ] Crear /routes/ofertas.js (5 min)
- [ ] Crear /models/oferta.js (2 min)
- [ ] Actualizar /index.js (3 min)
- [ ] Ejecutar: npm start
- [ ] Test en navegador (5 min)
- [ ] Verificar búsqueda funciona
- [ ] ✅ ¡Listo!

**Total: ~45 minutos**

---

## 🚀 Próximos Pasos

1. Abrir: `VISUAL_STATUS.txt`
2. Leer: `README_BUSQUEDA.md`
3. Seguir: `QUICK_SETUP_BUSQUEDA.md`
4. Implementar: Copiar rutas de `ROUTES_IMPLEMENTATION.md`
5. Test: `http://localhost:3000/administrador/stock/actualizar`

---

**Mapa completo | Fase 3 Search Implementation | 2024**
