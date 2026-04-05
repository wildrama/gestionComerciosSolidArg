# Análisis del Flujo de Búsqueda y Edición de Productos

## 🔍 Estado Actual

### Problemas Identificados

#### 1. **Endpoints Legacy en `administradorBuscar.js` (ARREGLADO)**
- ❌ `POST /api/buscar-texto` - Usaba regex en campo `codigo` (Number) → CastError
- ❌ `POST /api/buscar-codigo` - Usaba regex en campo `codigo` (Number) → CastError
- ✅ **Solución Aplicada**: Convertidos a string matching en JavaScript

**Impacto**: Estos endpoints causaban Error 500 en `/administrador/buscar`

---

#### 2. **Rutas de Edición Desconectadas**
La ruta `/administrador/buscar` renderiza `stock/listado.ejs` que tiene:
- Botones "Ver Detalle" → `/administrador/stock/producto/{ID}` ❓ (ruta no existe)
- Botones "Actualizar Stock" → `/administrador/stock/upstock` ❓ (ruta no existe)

La ruta correcta para editar es:
- `/administrador/productos/:id/edit` → `GET` - Renderiza formulario
- `/administrador/productos/:id` → `PUT` - Guarda los cambios

**Problema**: Links en los botones no coinciden con rutas disponibles.

---

#### 3. **Clases de Búsqueda Duplicadas**
Hay **DOS** clases de búsqueda:
1. `SearchManager.js` (420 líneas) - En `/public/js/searchManager.js`
2. `ProductSearch.js` (343 líneas) - En `/public/js/productSearch.js`

Ambas hacen lo mismo, genera confusión.

**Problema**: Mantenimiento difícil, inconsistencia entre vistas.

---

#### 4. **Flujo Incompleto en UI**
La vista `stock/listado.ejs` tiene:
- ✅ Búsqueda integrada
- ✅ Resultados en cards
- ❌ Links a edición NO FUNCIONAN
- ❌ Sin formulario de edición inline
- ❌ Sin feedback visual de guardado

---

## 📊 Flujo Esperado (Usuario Admin)

```
1. Entra a /administrador/buscar
   ↓
2. Ve "stock/listado.ejs"
   ├─ Input de búsqueda
   ├─ Resultados en cards
   └─ Botones: "Ver Detalle" | "Actualizar Stock"
   ↓
3. Clickea "Ver Detalle" 
   → Debería ir a: /administrador/productos/{ID}/edit
   → Renderiza: stock/stockIndividual.ejs
   ↓
4. En stock/stockIndividual.ejs
   ├─ Ve información del producto (READ-ONLY)
   ├─ Botón "Editar Stock" → /administrador/productos/{ID}/upstock ❌
   └─ Botón "Eliminar" ✅
   ↓
5. Clickea "Editar Stock"
   → Debería renderizar FORM de edición
   → Acepta cambios en: nombre, cantidad, precios, marca, etc.
   → PUT a /administrador/productos/{ID}
   ↓
6. Guarda y vuelve a ver detalle
```

---

## 🛠️ Cambios Necesarios

### PASO 1: Corregir links en stock/listado.ejs
Cambiar botones de cards para que apunten a rutas correctas:

```javascript
// ANTES:
<a href="/administrador/stock/producto/{ID}"> // ❌ NO EXISTE
<a href="/administrador/stock/upstock"> // ❌ NO EXISTE

// DESPUÉS:
<a href="/administrador/productos/{ID}/edit"> // ✅ Existe y renderiza stockIndividual.ejs
<a href="/administrador/productos/{ID}/edit"> // ✅ Mismo flujo
```

---

### PASO 2: Crear Vista de Edición Real (FORM)
Crear `stock/editarProducto.ejs` con:
- Formulario de edición completo
- Campos editables: nombre, cantidad, marca, precios, etc.
- Botones: Guardar | Cancelar
- Validación en cliente + servidor

Enlazar desde `stockIndividual.ejs`:
```html
<a href="/administrador/productos/<%= producto._id %>/edit" class="btn-edit-full">
  ✏️ Editar Producto
</a>
```

---

### PASO 3: Centralizar Búsqueda
Eliminar `productSearch.js` y usar solo `SearchManager.js`

Ventajas:
- ✅ Una sola clase a mantener
- ✅ Comportamiento consistente
- ✅ Reutilizable en múltiples vistas

---

### PASO 4: Mejorar UI Responsive
Para mobile:
- Cards con mejor layout en small screens
- Input de búsqueda full-width
- Botones stacked verticalmente en mobile
- Drawer o modal para filtros

---

## 📁 Archivos a Modificar

| Archivo | Acción | Prioridad |
|---------|--------|-----------|
| `/routes/administradorBuscar.js` | ✅ HECHO - Endpoints arreglados | CRÍTICA |
| `/views/stock/listado.ejs` | 🔴 Corregir links | ALTA |
| `/routes/administradorProductos.js` | 🟡 Crear GET para vista edit | MEDIA |
| `/views/stock/stockIndividual.ejs` | 🟡 Mejorar botones | MEDIA |
| `/views/stock/editarProducto.ejs` | 🔴 CREAR NUEVA | ALTA |
| `/public/js/productSearch.js` | 🟡 Deprecar (reemplazar con SearchManager) | BAJA |
| `/public/css/` | 🟡 Responsive improvements | MEDIA |

---

## 🎯 Prioridad de Trabajo

1. **Fase 1 (Crítica)**: Arreglar links en listado.ejs
2. **Fase 2 (Crítica)**: Crear vista editarProducto.ejs
3. **Fase 3 (Alta)**: Mejorar rutas en administradorProductos.js
4. **Fase 4 (Alta)**: Centralizar búsqueda (SearchManager only)
5. **Fase 5 (Media)**: Responsive design improvements

---

## ✅ Cambios Ya Realizados

- ✅ Arreglado `/routes/administradorBuscar.js` - Endpoints usan string matching
- ✅ Ambos endpoints (`buscar-texto` y `buscar-codigo`) ahora funcionan sin CastError

---

## 📝 Nota Técnica

### Por qué CastError en `codigo`?

```javascript
// ❌ PROBLEMA (en MongoDB):
Producto.find({ codigo: { $regex: "i", $options: 'i' } })
// MongoDB intenta convertir el regex "i" a Number (porque código es Number)
// → CastError: Cast to number failed for value 'i'

// ✅ SOLUCIÓN (en JavaScript):
const productos = await Producto.find({}); // Fetch all
const filtered = productos.filter(p => 
  String(p.codigo).toLowerCase() === searchTerm
);
// Convertimos a string PRIMERO, luego comparamos
```

El campo `codigo` está definido en el schema como `Number`, por lo que:
- ❌ No puedes usar regex/operadores string en MongoDB queries
- ✅ Debes fetch y filtrar en JavaScript
- ✅ Convertir `Number` a `String` antes de comparar

