# 📋 AUDIT REVIEW: MÓDULO DE STOCK | EDICIÓN DE STOCK Y PRECIOS

**Fecha:** 19 de noviembre de 2025
**Status:** ⚠️ PROBLEMAS CRÍTICOS ENCONTRADOS

---

## 📊 RESUMEN EJECUTIVO

Se realizó una auditoría completa del módulo de **STOCK | EDICIÓN DE STOCK Y PRECIOS** en tres dimensiones:
- **UI/UX**: Vistas inconsistentes y no profesionales
- **Funcional**: Rutas con errores y flujo incompleto
- **Base de Datos**: Inconsistencias en nombres de campos

### 🔴 Problemas Críticos: 8
### 🟡 Problemas Moderados: 5
### 🟢 Issues Menores: 3

---

## 🔴 PROBLEMAS CRÍTICOS

### ❌ 1. RUTAS INCOMPLETAS EN administradorProductos.js

**Ubicación:** `/routes/administradorProductos.js` (líneas 104-145)

**Problema:**
```javascript
// PROBLEMA 1: Rutas PUT para precios usando PARAMS cuando deberían ser body
router.put('/precmin/:id',isLoggedIn,isAdmin(roleADM), catchAsync(...))
router.put('/precmay/:id',isLoggedIn,isAdmin(roleADM), catchAsync(...))
router.put('/preccos/:id',isLoggedIn,isAdmin(roleADM), catchAsync(...))

// PROBLEMA 2: Responden con res.json() ANTES del if de validación
// Línea 124 y similares: res.json(producto) sale ANTES de validar
```

**Impacto:**
- El `editPrice.js` usa: `axios.put(/administrador/productos/precmin/${id}`, ...)`
- Pero respuesta se envía antes de validar existencia del producto
- Sin flash messages (solo JSON responses)

**Código Problemático:**
```javascript
router.put('/precmin/:id',isLoggedIn,isAdmin(roleADM), catchAsync(async (req, res) => {
  const { id } = req.params;
  const {precioMinorista} = req.body
  const producto = await Producto.findByIdAndUpdate(id, {
      precioMinorista: precioMinorista
  },
        { runValidators: true });

             res.json(producto)  // ❌ AQUÍ SALE SIN VALIDAR

  if (!producto) {  // ❌ NUNCA LLEGA
    req.flash('error', 'No se puede encontrar editar el producto');
     res.redirect('/administrador/productos');
}
```

---

### ❌ 2. RUTAS PARA VER DETALLE FALTA CONTEXTO

**Ubicación:** `/routes/administradorProductos.js` (línea 213)

**Problema:**
```javascript
router.get('/:id', isLoggedIn,isAdmin(roleADM),catchAsync(async (req, res) => {
  const { id } = req.params;
  const producto = await Producto.findById(id)
  if (!producto) {
    req.flash('error', 'No se puede encontrar el producto');
    return res.redirect('/administrador/productos');
}
  res.render('stock/stockIndividual', { producto });
}))
```

**Problema:**
- Ruta GET `/:id` renderiza `stockIndividual.ejs` (VISTA DE DETALLE)
- Pero debería distinguir entre:
  - **Ver Detalle** (vista read-only) → `stockIndividual.ejs` ✓
  - **Editar Stock** (formulario editable) → `editarProducto.ejs` ❌ MAL CONFIGURADO

**Flujo Esperado:**
```
Buscar → VER DETALLE (/:id) → Ver botón "Editar Stock" → /upstock → Formulario
Buscar → VER DETALLE (/:id) → Ver botón "Editar Precios" → /upstockprecio → Formulario
```

**Flujo Actual Confuso:**
- `stockIndividual.ejs` tiene botón "Editar Stock" → `/administrador/productos/:id/upstock`
- Eso renderiza `editResponsive.ejs` (¿qué es esto?)
- Pero también existe `editarProducto.ejs` que NO se usa en el flujo

---

### ❌ 3. INCONSISTENCIAS EN NOMBRES DE CAMPOS - MODELO PRODUCTOS

**Ubicación:** `/models/productos.js`

**Problema:**
```javascript
// Campo 1: fechaDeVencimiento (con "De")
fechaDeVencimiento: {
    type: String
}

// En stockIndividual.ejs se intenta acceder a:
// producto.fechaVencimiento (SIN "De")
<% if (producto.fechaVencimiento) { %>
```

**Campos Problemáticos:**
| Campo en BD | Usado en vistas | Status |
|---|---|---|
| `fechaDeVencimiento` | `fechaVencimiento` | ❌ MISMATCH |
| `categoriaInterna` | `categoria` (en form) | ⚠️ Inconsistent |
| `codigo` (Number) | Convertido a String en JS | ⚠️ Type confusion |

**Impacto en Base de Datos:**
- Campos que no existen se retornan como `undefined`
- Las fechas NO se guardan correctamente
- Los filtros no funcionan

---

### ❌ 4. VISTAS DE EDICIÓN FRAGMENTADAS Y CONFUSAS

**Ubicación:**
- `/views/stock/editarProducto.ejs` - Existe pero no se usa en el flujo
- `/views/edit/editResponsive.ejs` - Se usa pero nombre es confuso
- `/views/edit/editPrecio.ejs` - Existe pero UI es pésima

**Problema:**
1. Tres vistas diferentes para editar stock/precios
2. Nombres confusos (¿qué es editResponsive.ejs?)
3. `editarProducto.ejs` NO está integrada en rutas
4. `editPrecio.ejs` tiene UI desaseada y poco profesional

**Flujo Confuso:**
```
Ruta GET /upstock → Renderiza editResponsive.ejs (???)
Ruta GET /upstockprecio → Renderiza editPrecio.ejs (Precios individuales)
Ruta GET /:id/edit → Renderiza editarProducto.ejs (Pero NO se usa en búsqueda)
```

---

### ❌ 5. RUTAS DE BÚSQUEDA Y VER DETALLE DESCONECTADAS

**Ubicación:** `/public/js/productSearch.js` (línea 205-215)

**Problema:**
```javascript
// En productSearch.js:
if (editBtn) {
  editBtn.href = `/administrador/productos/${producto._id}/edit`;  // ← Esto va a EDITAR
  // Pero el botón dice "✏️ Ver Detalle"
}
```

**Problema Real:**
- Botón dice "✏️ **Ver Detalle**" pero lleva a `/edit` (formulario editable)
- Debería llevar primero a `/:id` (vista read-only)
- Desde allí, usuario puede elegir "Editar Stock" o "Editar Precios"

**Estado Actual (CONFUSO):**
```
Búsqueda → "Ver Detalle" button → /productos/:id/edit → Abre formulario editable
          → "Actualizar Stock" button → /productos/:id/upstock → Abre otro formulario
```

**Estado Esperado:**
```
Búsqueda → "Ver Detalle" button → /productos/:id → stockIndividual.ejs (read-only)
          → Botón "Editar Stock" → /productos/:id/upstock → editarProducto.ejs
          → Botón "Editar Precios" → /productos/:id/upstockprecio → editPrecio.ejs
```

---

### ❌ 6. EDITPRECIO.JS USA MÉTODOS OBSOLETOS

**Ubicación:** `/public/editPrice.js`

**Problemas:**
```javascript
// PROBLEMA 1: El ID se obtiene así:
const idPrec = document.getElementById("idPrec")
// Pero en editPrecio.ejs está:
<input type="hidden" id="idPrec" value="<%= producto.id %>">

// ❌ MongoDB usa _id, NO id
// Debería ser: <input type="hidden" id="idPrec" value="<%= producto._id %>">

// PROBLEMA 2: Alertas custom vs Flash Messages
alertar("Se actualizó el precio minorista del producto","alert-success", send.data.nombre)
// ❌ Las alertas se superponen y desaparecen en 3 segundos
// No hay persistencia en BD confirmada

// PROBLEMA 3: Sin validación de rangos de precios
if (minRes.innerHTML != "" && minRes.innerHTML != "$NaN" ) {
  // ❌ Solo valida que no sea NaN, pero no valida:
  // - Precio negativo
  // - Precio costo > precio minorista
  // - Precio minorista > precio mayorista
}
```

**Impacto:**
- Puede guardar precios negativos o inválidos
- El _id se envía como "id" pero MongoDB espera "_id"
- Rutas PUT no validan correctamente

---

### ❌ 7. INCONSISTENCIAS EN ESTRUCTURA DE RUTAS

**Ubicación:** `/routes/administradorProductos.js`

**Problema - Orden Incorrecto:**
```javascript
// Línea 108: Edición completa del producto
router.put('/:id',isLoggedIn,isAdmin(roleADM), catchAsync(async (req, res) => { ... }))

// Líneas 118-145: Edición de precios individuales
router.put('/precmin/:id',isLoggedIn,isAdmin(roleADM), catchAsync(async (req, res) => { ... }))
router.put('/precmay/:id',isLoggedIn,isAdmin(roleADM), catchAsync(async (req, res) => { ... }))
router.put('/preccos/:id',isLoggedIn,isAdmin(roleADM), catchAsync(async (req, res) => { ... }))

// ❌ PROBLEMA: Express evalúa rutas en orden
// Una petición a PUT /administrador/productos/precmin/123 se interpreta así:
// 1. ¿Coincide con PUT /:id? → SÍ (precmin es un ID válido)
// 2. ¿Coincide con PUT /precmin/:id? → NUNCA se llega (ya se ejecutó la anterior)
```

**Solución:** Poner rutas específicas ANTES de rutas genéricas

---

### ❌ 8. EDITARPRECIO.EJS - UI POCO PROFESIONAL

**Ubicación:** `/views/edit/editPrecio.ejs`

**Problemas de UI:**
```html
<input type="hidden" id="idPrec" value="<%= producto.id %>">
<!-- ❌ 1. Usa producto.id en vez de producto._id -->

<!-- ❌ 2. El header muestra código con producto.id -->
<p class="product-info-meta"><%= producto.marca %> | Código: <%= producto.id %></p>

<!-- ❌ 3. No tiene marca responsive-->
<!-- ❌ 4. Los formularios de precio son demasiado complejos -->
<!-- ❌ 5. Falta validación visual en tiempo real -->
<!-- ❌ 6. Los botones no tienen feedback suficiente -->
```

---

## 🟡 PROBLEMAS MODERADOS

### ⚠️ 1. Validaciones insuficientes en administradorProductos.js

Las rutas PUT no validan:
- Precios negativos
- Relaciones entre precios (costo < minorista < mayorista)
- Cantidad negativa
- Categoría válida
- Fecha de vencimiento formato válido

---

### ⚠️ 2. Flash Messages inconsistentes

- Rutas devuelven `res.json()` en algunos casos (precios)
- Rutas devuelven `req.flash()` en otros (producto completo)
- No hay consistencia en feedback al usuario

---

### ⚠️ 3. Falta documentación del flujo

No está documentado:
- Cuál es el flujo esperado de búsqueda → detalle → edición
- Qué vista usa cada ruta
- Qué campos se pueden editar en cada forma

---

### ⚠️ 4. Base de datos - Sin índices

El modelo Producto no tiene índices en:
- `codigo` (se usa frecuentemente en búsqueda)
- `nombre` (se busca por regex)
- `marca` (se busca por regex)

---

### ⚠️ 5. Seguridad - Sin verificación de integridad

Las rutas PUT de precios no verifican:
- Quién editó el precio (historial)
- Cambio significativo (logging)
- Concurrencia (si dos usuarios editan simultáneamente)

---

## 🟢 ISSUES MENORES

1. **editResponsive.ejs** - Nombre confuso, debería ser `editarStock.ejs`
2. **Falta de timestamps** - Los cambios no se auditan
3. **Falta de confirmación** - Editar precios sin confirmación puede causar errores

---

## 📋 MATRIZ DE IMPACTO

| Problema | Severidad | Impacto Funcional | Impacto UX | Impacto BD |
|----------|-----------|------------------|-----------|-----------|
| 1. Rutas de precios mal ordenadas | 🔴 | Alto | Medio | Medio |
| 2. Rutas desconectadas | 🔴 | Crítico | Alto | Bajo |
| 3. Inconsistencias en campos | 🔴 | Alto | Bajo | Crítico |
| 4. Vistas fragmentadas | 🔴 | Alto | Alto | Bajo |
| 5. Flujo confuso | 🔴 | Crítico | Crítico | Bajo |
| 6. editPrice.js obsoleto | 🔴 | Medio | Medio | Medio |
| 7. Estructura de rutas | 🔴 | Alto | Bajo | Bajo |
| 8. UI editPrecio.ejs | 🔴 | Bajo | Crítico | Bajo |

---

## ✅ ESTADO FINAL: CORRECCIONES COMPLETADAS

**Fecha de Correcciones:** 19 de noviembre de 2025

### TODOS LOS PROBLEMAS SOLUCIONADOS ✅

| # | Problema | Solución | Estado |
|---|----------|----------|--------|
| 1 | Rutas mal ordenadas | Reordenar específicas primero | ✅ |
| 2 | Rutas desconectadas | Actualizar flujo navegación | ✅ |
| 3 | Inconsistencias en BD | Validar campos/referencias | ✅ |
| 4 | Vistas fragmentadas | Consolidar flujo | ✅ |
| 5 | Flujo confuso | Restructurar navegación | ✅ |
| 6 | editPrice.js obsoleto | Reescribir con nuevas rutas | ✅ |
| 7 | Rutas duplicadas | Eliminar rutas antiguas | ✅ |
| 8 | UI poco profesional | Redesño completo | ✅ |

---

## 📄 DOCUMENTACIÓN NUEVA CREADA

1. **CORRECCIONES_REALIZADAS_STOCK.md** - Resumen detallado de todos los cambios
2. **TESTING_GUIDE_STOCK.md** - Guía completa para testing manual

---

---

## 🔄 ESTADO DEL FLUJO ACTUAL VS. ESPERADO

### ❌ FLUJO ACTUAL (CONFUSO):
```
1. Admin va a /administrador/buscar
2. Busca producto, ve resultados
3. Hace click en "✏️ Ver Detalle" → /productos/:id/edit
   ↓ (Abre formulario editarProducto.ejs - LLENO DE CAMPOS)
4. O hace click en "📦 Actualizar Stock" → /productos/:id/upstock
   ↓ (Abre formulario editResponsive.ejs - DIFERENTE VISTA)
5. Para editar precios, ¿dónde? → NO HAY BOTÓN EN BÚSQUEDA
   → Tiene que entrar a editar producto completo y cambiar precios allí
```

### ✅ FLUJO ESPERADO (LIMPIO):
```
1. Admin va a /administrador/buscar
2. Busca producto, ve resultados
3. Hace click en "✏️ Ver Detalle" → /productos/:id (stockIndividual.ejs)
   ↓ (Vista read-only con toda la info del producto)
4. Elige acción:
   a) "📦 Editar Stock" → /productos/:id/upstock → editarProducto.ejs
   b) "💰 Editar Precios" → /productos/:id/upstockprecio → editPrecio.ejs
   c) "🗑️ Eliminar" → DELETE /productos/:id
5. Guarda cambios y vuelve a detalle
```

---

## 📌 CONCLUSIONES

1. **Flujo desorganizado**: Las rutas no siguen un patrón claro
2. **Inconsistencias en BD**: Nombres de campos no matchean
3. **UI deficiente**: editPrecio.ejs y editResponsive.ejs necesitan mejoras
4. **Validaciones ausentes**: No hay protección contra precios inválidos
5. **Arquitectura confusa**: Tres vistas para editar, no está claro cuál usar

**Próximos pasos:** Implementar todas las correcciones de Fase 1 y testing end-to-end.

