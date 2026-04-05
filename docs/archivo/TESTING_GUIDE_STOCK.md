# 🧪 TESTING GUIDE: MÓDULO DE STOCK

**Fecha:** 19 de noviembre de 2025
**Status:** ✅ LISTO PARA PRUEBAS

---

## 📋 CHECKLIST DE TESTING

### FLUJO PRINCIPAL: Buscar → Ver Detalle → Editar Stock/Precios

#### PASO 1: Búsqueda de Producto
```
URL: http://localhost:3037/administrador/buscar
Acción: 
  1. Escribe nombre de un producto conocido (ej: "arroz")
  2. Verifica que aparezcan resultados
  3. Revisa que se muestren: nombre, marca, código, stock, precio
```

**Esperado:**
- ✅ Resultados aparecen en tiempo real
- ✅ Tarjetas muestran información correcta
- ✅ Se ven 2 botones: "✏️ Ver Detalle" y "📦 Actualizar Stock"

**Problemas a buscar:**
- ❌ No aparecen resultados
- ❌ Precios o códigos mal formateados
- ❌ Botones no funcionan

---

#### PASO 2: Ver Detalle del Producto
```
URL: http://localhost:3037/administrador/productos/:id (automático después de Step 1)
Acción:
  1. Haz click en botón "✏️ Ver Detalle"
  2. Deberías ver la vista de detalle completo (stockIndividual.ejs)
```

**Esperado:**
- ✅ Se muestra vista read-only con toda la información
- ✅ Se ven 3 botones de acción:
  - "← Buscar Productos" (atrás)
  - "✏️ Editar Stock" (ir a editar)
  - "💰 Editar Precios" (ir a editar precios)
  - "🗑️ Eliminar" (eliminar producto)
- ✅ Se muestra código de barras
- ✅ Se muestran precios actuales (minorista, mayorista, costo)

**Problemas a buscar:**
- ❌ Falta información
- ❌ Fechas no se muestran
- ❌ Botones no llevan a las rutas correctas

---

#### PASO 3A: Editar Stock
```
URL: http://localhost:3037/administrador/productos/:id/upstock (automático después de Step 2)
Acción:
  1. Haz click en botón "✏️ Editar Stock"
  2. Se abre formulario de edición (editResponsive.ejs)
  3. Haz click en "Editar" para activar modo de edición
  4. Cambia la cantidad (stock)
  5. Haz click en "Guardar Cambios"
```

**Esperado:**
- ✅ Formulario carga todos los datos del producto
- ✅ Campos precios se muestran como read-only (disabled)
- ✅ Primer click en botón activa modo edición (campos se habilitan)
- ✅ Stock se actualiza en BD
- ✅ Se muestra mensaje de éxito
- ✅ Se redirige a vista de detalle

**Problemas a buscar:**
- ❌ Campos no se habilitan al hacer click
- ❌ Stock no se actualiza
- ❌ Error 404 o 500
- ❌ Precios afectados sin querer

**Validaciones:**
- Intenta cantidad negativa → Debería rechazar
- Intenta guardar sin cambios → Debería mostrar error

---

#### PASO 3B: Editar Precios
```
URL: http://localhost:3037/administrador/productos/:id/upstockprecio
Acción:
  1. Haz click en botón "💰 Editar Precios"
  2. Se abre formulario de edición de precios (editPrecio.ejs)
  3. Para PRECIO MINORISTA:
     - Escribe 10 en "Aumento %" → Debe calcular nuevo precio
     - O escribe 25.99 en "Aumento Manual" → Debe mostrar ese precio
  4. Haz click en "Guardar Cambio"
  5. Verifica que se actualice en BD
  6. Repite para PRECIO MAYORISTA y PRECIO COSTO
```

**Esperado:**
- ✅ Se muestra UI profesional con 3 cards (minorista, mayorista, costo)
- ✅ Cálculo de porcentaje funciona correctamente
- ✅ Aumento manual reemplaza el porcentaje
- ✅ Se muestra precio nuevo antes de guardar
- ✅ Cada precio se actualiza independientemente
- ✅ Mensaje de éxito después de guardar
- ✅ Valores se actualizan en pantalla después de guardar
- ✅ Responsive: funciona en móvil, tablet, desktop

**Problemas a buscar:**
- ❌ Cálculos incorrectos
- ❌ No se actualiza la BD
- ❌ Error en rutas PUT
- ❌ No se muestra feedback visual

**Validaciones:**
- Intenta precio negativo → Debería rechazar
- Intenta aumento muy alto → Debería funcionar (sin límites)
- Intenta 0 → Debería funcionar
- Deja campo vacío → Debería mostrar error

---

## 🔄 FLUJOS ALTERNATIVOS

### Flujo: Volver Atrás
```
Desde cualquier vista:
  1. Buscar → Haz click en "← Volver al Buscador" → Debería ir a /administrador/buscar
  2. Detalle → Haz click en "← Buscar Productos" → Debería ir a /administrador/buscar
  3. Editar Stock → Haz click en "💰 Editar Precios" → Debería ir a precios
  4. Editar Precios → Haz click en "← Volver al Detalle" → Debería ir a detalle
```

**Esperado:**
- ✅ Todos los links de navegación funcionan
- ✅ Datos se mantienen consistentes al navegar
- ✅ No hay pérdida de información

---

### Flujo: Eliminar Producto
```
Desde vista de Detalle:
  1. Haz click en "🗑️ Eliminar"
  2. Confirmación: ¿Estás seguro de eliminar? (debe mostrar nombre del producto)
  3. Confirma eliminación
  4. Debería ir a /administrador/productos (lista de stock)
```

**Esperado:**
- ✅ Confirmación muestra nombre del producto
- ✅ Producto desaparece de BD después de confirmar
- ✅ Redirige a lista de stock
- ✅ Si intentas acceder al producto después, debería mostrar error 404

---

## 🐛 CASOS DE ERROR ESPERADOS

### Error 404: Producto no encontrado
```
URL: http://localhost:3037/administrador/productos/111111111111111111111111
Esperado: Flash message "No se puede encontrar el producto" y redirige a /administrador/productos
```

### Error 400: Datos inválidos
```
Acción: Intenta guardar precio negativo desde editPrecio.ejs
Esperado: 
  - Response status: 400
  - JSON: { success: false, message: "Precio inválido" }
  - Alert en pantalla: "Error: Precio inválido"
```

### Error 500: Error del servidor
```
Si ocurre error interno:
  - Debería mostrar flash message de error
  - Redirige a URL anterior
  - No afecta datos en BD
```

---

## 📊 MATRIZ DE TESTING

| Caso | Acción | Resultado Esperado | Status |
|------|--------|-------------------|--------|
| 1.1 | Buscar producto | Resultados en tiempo real | ⏳ |
| 2.1 | Ver detalle | Muestra vista read-only | ⏳ |
| 3A.1 | Editar stock | Stock actualizado | ⏳ |
| 3B.1 | Editar precio minorista | Precio minorista actualizado | ⏳ |
| 3B.2 | Editar precio mayorista | Precio mayorista actualizado | ⏳ |
| 3B.3 | Editar precio costo | Precio costo actualizado | ⏳ |
| 4.1 | Validación: precio negativo | Rechaza y muestra error | ⏳ |
| 5.1 | Eliminar producto | Producto eliminado | ⏳ |
| 6.1 | Producto inexistente | Error 404 | ⏳ |
| 7.1 | Responsivo móvil | Funciona en mobile | ⏳ |
| 7.2 | Responsivo tablet | Funciona en tablet | ⏳ |
| 7.3 | Responsivo desktop | Funciona en desktop | ⏳ |

---

## 🔧 COMANDOS PARA DEBUGGING

```bash
# Ver en consola del navegador (F12)
# Si algo no funciona, abre la consola y busca errores

# En Network tab, verifica:
# - Requests a /administrador/productos/:id/precmin (debe ser 200)
# - Requests a /administrador/productos/:id (PUT, debe ser 200)
# - Response data tiene estructura correcta

# En Application tab > Cookies:
# - Verifica que connect.sid esté presente (sesión activa)
# - Verifica que req.user tenga funcion: "ADMINISTRADOR"
```

---

## 📝 REGISTRO DE TESTING

Después de cada prueba, actualiza este registro:

```
Fecha: 19-nov-2025
Tester: [tu nombre]
Navegador: [Chrome/Firefox/Safari]
Resolución: [1920x1080 / 768x1024 / 375x667]

Prueba 1: Búsqueda
  - ✅/❌ Resultados aparecen
  - ✅/❌ Datos correctos
  - ✅/❌ Botones funcionan
  Notas: ...

Prueba 2: Ver Detalle
  - ✅/❌ Vista carga correctamente
  - ✅/❌ Información se muestra
  - ✅/❌ Botones funcionan
  Notas: ...

[continúa para cada prueba]

Problemas encontrados:
1. [Descripción del problema]
2. [Descripción del problema]

Recomendaciones:
1. [Recomendación]
2. [Recomendación]
```

---

## 🚀 ROLLOUT CHECKLIST

Antes de considerar esta feature como LISTA PARA PRODUCCIÓN:

- [ ] Todos los casos de prueba pasan ✅
- [ ] Sin errores en consola del navegador
- [ ] Responsive en móvil, tablet, desktop
- [ ] Flujo de navegación es intuitivo
- [ ] Mensajes de error son claros
- [ ] Datos en BD se persisten correctamente
- [ ] Performance es aceptable (< 2 segundos por acción)
- [ ] Sin referencias a `id` - todas usan `_id` de MongoDB
- [ ] Validaciones previenen datos inválidos

---

## 📚 RECURSOS

**Vistas involucradas:**
- `/views/stock/listado.ejs` - Búsqueda
- `/views/stock/stockIndividual.ejs` - Ver detalle
- `/views/edit/editResponsive.ejs` - Editar stock
- `/views/edit/editPrecio.ejs` - Editar precios

**Scripts involucrados:**
- `/public/js/productSearch.js` - Búsqueda
- `/public/editPage.js` - Edición de stock
- `/public/editPrice.js` - Edición de precios

**Rutas involucradas:**
- GET `/administrador/productos` - Lista stock
- GET `/administrador/productos/:id` - Ver detalle
- GET `/administrador/productos/:id/upstock` - Editar stock
- GET `/administrador/productos/:id/upstockprecio` - Editar precios
- PUT `/administrador/productos/:id` - Actualizar stock
- PUT `/administrador/productos/:id/precmin` - Actualizar precio minorista
- PUT `/administrador/productos/:id/precmay` - Actualizar precio mayorista
- PUT `/administrador/productos/:id/preccos` - Actualizar precio costo
- DELETE `/administrador/productos/:id` - Eliminar producto

---

**Estado:** 🟢 LISTO PARA PRUEBAS MANUALES

