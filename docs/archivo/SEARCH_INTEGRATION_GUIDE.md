# Guía de Integración: Sistema de Búsqueda Universal

## 📋 Descripción General

Se ha creado un sistema de búsqueda universal reutilizable con soporte para:
- ✅ Búsqueda por texto (nombre, marca)
- ✅ Búsqueda por código de barra
- ✅ Detección automática de tipo de búsqueda
- ✅ Compatible con lectores de código de barra USB básicos
- ✅ Reusable en múltiples módulos

## 🏗️ Arquitectura

```
Frontend (ProductSearch class)
    ↓
API Routes (/api/search/*)
    ↓
MongoDB Query (Regex search)
    ↓
Response JSON
    ↓
Template Rendering
```

## 📁 Archivos del Sistema

### Backend
- **`/routes/searchApi.js`** (286 líneas)
  - 4 endpoints: `/productos`, `/barcode`, `/smart`, `/advanced`
  - Búsqueda con relevancia y sorting
  - Middleware de autenticación

### Frontend
- **`/public/js/productSearch.js`** (420 líneas)
  - Clase reutilizable `ProductSearch`
  - Debounced input (300ms)
  - Smart detection de barcode
  - Template-based rendering

### Componentes EJS
- **`/views/partials/productSearchModal.ejs`** (218 líneas)
  - Modal reutilizable para búsqueda
  - Self-contained con templates
  - Event-based product selection

- **`/views/partials/productSearchInput.ejs`** (NUEVO - 190 líneas)
  - Input inline para formularios
  - Resultado seleccionado mostrado
  - Mejor para integración en forms existentes

## 🚀 Cómo Usar

### Opción 1: Input Inline (Para Forms)

**Mejor para:** Agregar productos a formularios (Stock, Ofertas, etc.)

```ejs
<form method="POST" action="/admin/stock/update">
    <!-- Usar el input de búsqueda -->
    <%- include('../partials/productSearchInput', {
        inputId: 'productSearch',
        resultsId: 'productResults',
        selectedProductId: 'selectedProductId'
    }) %>
    
    <!-- Campos adicionales -->
    <input type="hidden" name="productId" id="selectedProductId">
    <input type="number" name="cantidad" placeholder="Cantidad">
    
    <button type="submit">Guardar</button>
</form>

<script>
// Escuchar selección de producto
document.addEventListener('productSelected', function(e) {
    console.log('Producto seleccionado:', e.detail.producto);
    // Llenar campos adicionales si es necesario
});
</script>
```

### Opción 2: Modal (Para Búsqueda Avanzada)

**Mejor para:** Búsqueda exploratoria sin agregar inmediatamente

```ejs
<!-- Botón para abrir modal -->
<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#productSearchModal">
    Buscar Producto
</button>

<!-- Modal -->
<%- include('../partials/productSearchModal', {
    modalId: 'productSearchModal',
    modalTitle: 'Búsqueda de Productos',
    modalSize: 'lg'
}) %>

<script>
// Escuchar selección
document.addEventListener('productSelected', function(e) {
    const producto = e.detail.producto;
    // Hacer algo con el producto
    // Ejemplo: agregar a tabla, redirect, etc.
});
</script>
```

### Opción 3: ProductSearch Class (Para Control Total)

**Mejor para:** Casos especializados con lógica personalizada

```ejs
<input type="text" id="mySearchInput">
<div id="myResults"></div>
<input type="hidden" id="mySelectedId" name="productId">

<script src="/js/productSearch.js"></script>
<script>
const search = new ProductSearch({
    searchInput: document.getElementById('mySearchInput'),
    searchResults: document.getElementById('myResults'),
    useSmartSearch: true,
    apiEndpoint: '/api/search/smart',
    
    onResultClick: function(producto, action) {
        document.getElementById('mySelectedId').value = producto._id;
        console.log('Seleccionado:', producto);
        // Lógica personalizada aquí
    }
});

search.init();
</script>
```

## 📱 Barcode Reader Integration

El sistema detecta automáticamente si la entrada es un código de barra:

```javascript
// Smart Detection (automático):
// - Input numérico (≥3 dígitos) → Búsqueda de código
// - Input con letras → Búsqueda de texto

// El reader USB emula teclado:
1. Usuario hace scan con reader
2. Reader emite: "7791234567890"
3. ProductSearch detecta como barcode
4. Busca en campo Producto.codigo
5. Retorna resultado
```

### Configuración para Barcode Reader

La mayoría de readers USB no necesita configuración:

```ejs
<!-- Activar manualmente barcode mode -->
<label>
    <input type="checkbox" id="barcodeMode">
    Modo Código de Barra
</label>

<script>
document.getElementById('barcodeMode').addEventListener('change', function() {
    search.setBarcodeMode(this.checked);
});
</script>
```

## 🔌 API Endpoints

### POST `/api/search/productos`
Búsqueda de texto en nombre, marca y código.

```javascript
axios.post('/api/search/productos', {
    query: 'coca',
    sort: 'relevancia', // relevancia|nombre|precio|stock
    limit: 50
});
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "_id": "507f1f77bcf86cd799439011",
            "codigo": "1234567",
            "nombre": "Coca Cola 2L",
            "marca": "Coca",
            "cantidad": 50,
            "precioMinorista": 2.50
        }
    ]
}
```

### POST `/api/search/barcode`
Búsqueda exacta por código de barra.

```javascript
axios.post('/api/search/barcode', {
    barcode: '7791234567890'
});
```

### POST `/api/search/smart`
Auto-detecta si es texto o código (RECOMENDADO).

```javascript
axios.post('/api/search/smart', {
    query: '7791234567890' // o 'coca cola'
});
```

### POST `/api/search/advanced`
Búsqueda multi-criterio.

```javascript
axios.post('/api/search/advanced', {
    query: 'coca',
    precioMin: 1.00,
    precioMax: 5.00,
    cantidadMin: 10,
    sort: 'precio'
});
```

## 📦 Integración en Módulos Específicos

### 1. Módulo Stock (Actualizar Stock)

```ejs
<!-- views/stock/actualizar.ejs -->

<div class="form-group">
    <label>Buscar Producto</label>
    <%- include('../partials/productSearchInput', {
        inputId: 'stockProductSearch',
        resultsId: 'stockResults',
        selectedProductId: 'stockProductId'
    }) %>
</div>

<div class="form-group">
    <label>Nueva Cantidad</label>
    <input type="number" id="newQuantity" name="quantity" required>
</div>

<button type="submit" class="btn btn-primary">Actualizar Stock</button>

<script>
document.addEventListener('productSelected', function(e) {
    if (e.detail.selectedProductId === 'stockProductId') {
        const producto = e.detail.producto;
        document.getElementById('newQuantity').value = producto.cantidad || '';
    }
});
</script>
```

### 2. Módulo Ofertas - Individual

```ejs
<!-- views/ofertas/agregarIndividual.ejs -->

<div class="card">
    <div class="card-header">Agregar Oferta Individual</div>
    <div class="card-body">
        <%- include('../partials/productSearchInput', {
            inputId: 'ofertaProductSearch',
            resultsId: 'ofertaResults',
            selectedProductId: 'ofertaProductId'
        }) %>

        <div class="form-group mt-3">
            <label>Precio Original</label>
            <input type="number" id="precioOriginal" readonly class="form-control">
        </div>

        <div class="form-group">
            <label>Precio Oferta</label>
            <input type="number" name="precioOferta" required>
        </div>

        <button type="submit" class="btn btn-success">Guardar Oferta</button>
    </div>
</div>

<script>
document.addEventListener('productSelected', function(e) {
    if (e.detail.selectedProductId === 'ofertaProductId') {
        const producto = e.detail.producto;
        document.getElementById('precioOriginal').value = 
            (producto.precioMinorista || 0).toFixed(2);
    }
});
</script>
```

### 3. Módulo Ofertas - Batch

```ejs
<!-- views/ofertas/agregarBatch.ejs -->

<div class="card">
    <div class="card-header">Agregar Ofertas en Lote</div>
    <div class="card-body">
        <!-- Modal para agregar productos -->
        <button type="button" class="btn btn-primary" data-bs-toggle="modal" 
                data-bs-target="#productSearchModal">
            + Agregar Producto
        </button>

        <%- include('../partials/productSearchModal', {
            modalId: 'productSearchModal',
            modalTitle: 'Buscar Productos para Oferta'
        }) %>

        <!-- Tabla de productos agregados -->
        <table class="table mt-3" id="productosTable">
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Marca</th>
                    <th>Precio Original</th>
                    <th>Precio Oferta</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>

        <button type="submit" class="btn btn-success">Guardar Ofertas</button>
    </div>
</div>

<script>
let productosSeleccionados = [];

document.addEventListener('productSelected', function(e) {
    const producto = e.detail.producto;
    
    // Agregar a tabla
    const tbody = document.querySelector('#productosTable tbody');
    const row = tbody.insertRow();
    row.innerHTML = `
        <td>${producto.nombre}</td>
        <td>${producto.marca}</td>
        <td>$${(producto.precioMinorista || 0).toFixed(2)}</td>
        <td><input type="number" class="form-control" placeholder="Precio" step="0.01"></td>
        <td><button type="button" class="btn btn-sm btn-danger">Quitar</button></td>
    `;
    
    productosSeleccionados.push(producto._id);
});
</script>
```

## 🧪 Testing

### Test Manual - Búsqueda de Texto
1. Navegar a `/administrador/buscar`
2. Escribir "coca" en input
3. Esperar 300ms
4. Verificar resultados

### Test Manual - Búsqueda por Barcode
1. Ir a `/administrador/stock`
2. Colocar cursor en input de búsqueda
3. Hacer scan con reader (o paste: "7791234567890")
4. Sistema debe detectar como barcode
5. Verificar resultado exacto

### Test con Reader Real
```javascript
// Agregar esto en consola para debug
window.debugSearch = true;

// Escaneando:
// - Ver en console.log el query capturado
// - Ver si detectó como barcode (true/false)
// - Ver resultado de API call
```

## 🔐 Seguridad

Todas las rutas de API requieren autenticación:
```javascript
// Middleware: isLoggedIn
// Solo usuarios autenticados pueden buscar productos
```

## ⚡ Performance

- **Debounce:** 300ms (configurable)
- **Límite de resultados:** 50 (configurable)
- **Índices MongoDB:** Recomendado en campos codigo, nombre, marca
- **Cache:** No implementado (podría mejorarse)

## 📝 Próximos Pasos

1. ✅ Crear API universal de búsqueda
2. ✅ Crear ProductSearch class
3. ✅ Crear componentes EJS reutilizables
4. ⏳ Integrar en módulo Stock
5. ⏳ Integrar en módulo Ofertas (individual)
6. ⏳ Integrar en módulo Ofertas (batch)
7. ⏳ Testing con reader de barcode real
8. ⏳ Documentación de usuario final

## 💬 Soporte

Para problemas:
1. Ver console del navegador (F12)
2. Verificar que axios.js esté cargado
3. Verificar que API endpoint es `/api/search/smart`
4. Verificar autenticación (cookies/tokens)
5. Verificar MongoDB connection

---

**Versión:** 1.0  
**Fecha:** 2024  
**Status:** En Desarrollo
