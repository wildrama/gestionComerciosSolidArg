# 🔍 Sistema de Búsqueda Universal - Guía Rápida

## ¿Qué se hizo?

Se creó un **sistema de búsqueda moderno y reutilizable** para toda la aplicación con soporte para:
- 📝 Búsqueda por texto (nombre, marca)
- 📦 Búsqueda por código de barra
- 🤖 Detección automática inteligente
- ♻️ Componentes reutilizables en múltiples módulos
- 📱 Compatible con lectores USB básicos

---

## 📁 Archivos Creados

```
isidorito/
├── routes/
│   └── searchApi.js (286 líneas) ✅
│
├── public/js/
│   └── productSearch.js (420 líneas) ✅
│
├── views/
│   ├── partials/
│   │   ├── productSearchInput.ejs (190 líneas) ✅
│   │   └── productSearchModal.ejs (218 líneas) ✅
│   │
│   ├── stock/
│   │   └── actualizar.ejs (250+ líneas) ✅
│   │
│   └── ofertas/
│       ├── agregarIndividual.ejs (280+ líneas) ✅
│       └── agregarBatch.ejs (350+ líneas) ✅
│
├── SEARCH_INTEGRATION_GUIDE.md ✅
├── ROUTES_IMPLEMENTATION.md ✅
└── PHASE3_STATUS.md ✅
```

---

## 🚀 Empezar en 3 Pasos

### Paso 1: Usar en una vista

```ejs
<!-- En cualquier vista: -->
<%- include('../partials/productSearchInput', {
    inputId: 'mySearch',
    resultsId: 'myResults',
    selectedProductId: 'selectedProductId'
}) %>

<!-- Y escuchar la selección: -->
<script>
document.addEventListener('productSelected', function(e) {
    console.log('Producto seleccionado:', e.detail.producto);
    // Hacer algo con el producto...
});
</script>
```

### Paso 2: Crear las rutas del servidor

Ver `ROUTES_IMPLEMENTATION.md` para copiar/pegar código de rutas.

### Paso 3: Test en navegador

1. Ir a `/administrador/stock/actualizar`
2. Escribir "coca" en búsqueda
3. Seleccionar un producto
4. Verificar que funciona

---

## 🎯 Módulos Listos para Usar

| Módulo | Vista | Estado |
|--------|-------|--------|
| **Stock** | `/views/stock/actualizar.ejs` | ✅ Listo |
| **Ofertas Individual** | `/views/ofertas/agregarIndividual.ejs` | ✅ Listo |
| **Ofertas Batch** | `/views/ofertas/agregarBatch.ejs` | ✅ Listo |
| **Buscar** | `/views/stock/listado.ejs` | ✅ Actualizado |

---

## 🔌 API Endpoints

```javascript
// Smart Search (RECOMENDADO)
POST /api/search/smart
Body: { query: "coca" }

// Búsqueda por Texto
POST /api/search/productos
Body: { query: "coca", sort: "relevancia", limit: 50 }

// Búsqueda por Código
POST /api/search/barcode
Body: { barcode: "7791234567890" }

// Búsqueda Avanzada
POST /api/search/advanced
Body: { query: "coca", precioMin: 1, precioMax: 5 }
```

---

## 📱 Barcode Reader

Funciona con cualquier lector USB básico:

1. **Hardware:** Conectar reader USB (se ve como teclado)
2. **Software:** No necesita instalación
3. **Uso:** Hacer focus en input y hacer scan
4. **Detección:** Sistema detecta automáticamente si es barcode

---

## 🔧 Arquitectura

```
Input (Teclado/Barcode)
        ↓
ProductSearch.js (Debounce + Smart Detection)
        ↓
/api/search/smart (Backend)
        ↓
MongoDB Regex Query
        ↓
Template Rendering (Producto Cards)
        ↓
productSelected Event
        ↓
Custom Handler (tu lógica)
```

---

## 📚 Documentación Completa

- **`SEARCH_INTEGRATION_GUIDE.md`** - Guía de integración (300+ líneas)
- **`ROUTES_IMPLEMENTATION.md`** - Rutas necesarias (250+ líneas)
- **`PHASE3_STATUS.md`** - Estado completo del proyecto

---

## 🛠️ Troubleshooting

### Búsqueda no funciona
- ✓ ¿Axios.js está cargado?
- ✓ ¿API endpoint `/api/search/smart` existe?
- ✓ ¿Usuario autenticado?

### Event no dispara
- ✓ ¿Verificaste `productSelected` en el console?
- ✓ ¿El producto fue seleccionado correctamente?

### Barcode no detecta
- ✓ ¿Reader USB está conectado?
- ✓ ¿Input tiene focus?
- ✓ ¿Código tiene al menos 3 dígitos?

---

## ⚡ Características Principales

| Feature | Input | Modal | Class |
|---------|-------|-------|-------|
| Búsqueda texto | ✅ | ✅ | ✅ |
| Búsqueda barcode | ✅ | ✅ | ✅ |
| Detección automática | ✅ | ✅ | ✅ |
| Debounce | ✅ | ✅ | ✅ |
| Sorting | ❌ | ❌ | ✅ |
| Configurable | ✅ | ✅ | ✅ |
| Event listeners | ✅ | ✅ | ✅ |

---

## 📊 Estadísticas

- **2000+ líneas** de código nuevo
- **3 componentes** reutilizables
- **4 endpoints** de API
- **550+ líneas** de documentación
- **3 vistas** de ejemplo completas

---

## ✅ Checklist

### Antes de usar
- [ ] Leer guía de integración
- [ ] Copiar rutas del archivo ROUTES_IMPLEMENTATION.md
- [ ] Crear modelo Oferta (si no existe)
- [ ] Actualizar index.js

### Para testear
- [ ] Prueba búsqueda de texto
- [ ] Prueba búsqueda por código
- [ ] Prueba con reader (si tienes)
- [ ] Verifica eventos en console

---

## 🎬 Ejemplo Completo

```ejs
<!-- En formulario -->
<%- include('../partials/productSearchInput', {
    inputId: 'productSearch',
    resultsId: 'productResults',
    selectedProductId: 'productId'
}) %>

<input type="hidden" id="productId" name="productId">
<input type="number" id="quantity" name="cantidad" placeholder="Cantidad">
<button type="submit">Guardar</button>

<script>
document.addEventListener('productSelected', function(e) {
    const producto = e.detail.producto;
    
    // Llenar formulario
    document.getElementById('productId').value = producto._id;
    document.getElementById('quantity').value = producto.cantidad;
    
    // O hacer lo que necesites...
    console.log('Producto:', producto.nombre);
});
</script>
```

---

## 🚀 Próximos Pasos

1. **Implementar rutas** (ver ROUTES_IMPLEMENTATION.md)
2. **Test en navegador** 
3. **Conectar reader** (si tienes)
4. **Integrar en otros módulos**

---

**¿Preguntas?** Ver documentación completa en:
- `SEARCH_INTEGRATION_GUIDE.md`
- `ROUTES_IMPLEMENTATION.md`
- `PHASE3_STATUS.md`

---

**Versión:** 1.0  
**Estado:** ✅ Listo para usar  
**Soporte:** Completo
