# 🧪 GUÍA DE PRUEBA - Flujo de Búsqueda y Edición

## 📋 Prerequisitos

- ✅ Servidor corriendo: `http://localhost:3037`
- ✅ MongoDB conectado
- ✅ Usuario ADMINISTRADOR logueado
- ✅ Navegar a: `http://localhost:3037/administrador/buscar`

---

## 🎯 Pruebas Paso a Paso

### Test 1: Búsqueda por Texto

1. **Entra en:** `http://localhost:3037/administrador/buscar`
   - Deberías ver: Vista con search box, toggle, filtros y área de resultados vacía
   - Mensaje: "Comienza tu búsqueda"

2. **Busca por nombre:** Escribe "fideos" (o nombre de un producto que tengas)
   - Deberías ver: Cards con productos que contengan esa palabra
   - Tiempo: ~300ms de debounce

3. **Verifica que aparezca:**
   - Nombre del producto
   - Marca
   - Código
   - Stock disponible
   - Precio minorista
   - Botones: "Ver Detalle" y "Actualizar Stock"

**Resultado esperado:** ✅ Búsqueda muestra resultados sin errores

---

### Test 2: Búsqueda por Código de Barras

1. **Activa el toggle:** "Buscar por: Código"
   - Placeholder del input debería cambiar a "Escanea o ingresa código de barras..."

2. **Busca por código:** Escribe "5550011555" (o un código existente)
   - Deberías ver: Un resultado exacto (o ninguno si no existe)

3. **Verifica NO hay error 500:**
   - Si hay error, revisar consola del navegador
   - Error anterior era: "Cast to number failed for value 'i'"

**Resultado esperado:** ✅ Búsqueda por código funciona sin Error 500

---

### Test 3: Navegación a Edición

1. **En los resultados de búsqueda:** Haz click en un botón "Ver Detalle" en una card
   - Deberías ser redirigido a: `http://localhost:3037/administrador/productos/{ID}/edit`
   - Deberías ver: **Formulario de edición completo** (NO la vista de solo lectura)

2. **Verifica que el formulario incluya:**
   - ✅ Información Básica: Nombre, Marca, Código (read-only), Categoría
   - ✅ Stock: Cantidad, Peso, Fecha Vencimiento, Impuesto
   - ✅ Precios: Costo, Minorista, Mayorista (con símbolo $)
   - ✅ Botones: "Cancelar" y "Guardar Cambios"

**Resultado esperado:** ✅ Formulario de edición cargó correctamente

---

### Test 4: Validación de Precios

1. **En el formulario de edición:**
   - Cambia "Precio Costo" a 100
   - Cambia "Precio Minorista" a 50 (menor que costo)
   - Sal del campo (blur)

2. **Deberías ver:**
   - ⚠️ Aviso amarillo: "El precio minorista debería ser mayor que el precio de costo"

3. **Intenta guardar:**
   - Click en "Guardar Cambios"
   - Deberías ver popup: "¿Continuar de todas formas?"

**Resultado esperado:** ✅ Validación de precios funciona

---

### Test 5: Editar y Guardar

1. **En el formulario:**
   - Cambia el "Nombre" a algo distintivo (ej: "TEST_PRODUCTO_2024")
   - Cambia "Cantidad" a 999
   - Cambia "Precio Minorista" a 50.00

2. **Click en "Guardar Cambios"**
   - Deberías ver: La página procesando
   - Deberías ser redirigido de vuelta a la misma página

3. **Verifica:**
   - ✅ Mensaje verde (flash): "✅ Producto 'TEST_PRODUCTO_2024' actualizado correctamente"
   - ✅ Los datos en el formulario refleja los cambios (nombre = "TEST_PRODUCTO_2024", cantidad = 999, precio = 50.00)

**Resultado esperado:** ✅ Guardado exitoso con feedback

---

### Test 6: Cancelar Edición

1. **En el formulario:**
   - Cambia un campo (ej: nombre a "BORRADOR")
   - **NO hagas click en Guardar**

2. **Click en "Cancelar"**
   - Deberías ser redirigido a: `http://localhost:3037/administrador/stock`

3. **Verifica:**
   - ✅ El cambio NO se guardó (si vuelves a abrir el producto, el nombre es el original)

**Resultado esperado:** ✅ Cancelar descarta cambios

---

### Test 7: Código de Barras Read-Only

1. **En el formulario de edición:**
   - Intenta hacer click en el campo "Código de Barras"
   - Intenta escribir algo

**Resultado esperado:**
- ✅ Campo deshabilitado (background gris)
- ✅ No se puede modificar
- ✅ Tiene nota: "El código no se puede modificar"

---

### Test 8: Responsive Mobile

1. **Abre DevTools:** F12 → Device toolbar (mobile view)

2. **Resolución: 375x667 (iPhone)**
   - Búsqueda: ✅ Input full-width, resultados stacked
   - Cards: ✅ Botones apilados verticalmente
   - Formulario: ✅ Campos apilados, no side-by-side

3. **Resolución: 768x1024 (Tablet)**
   - Formulario: ✅ Layout mixto (algunos campos side-by-side)

4. **Resolución: 1920x1080 (Desktop)**
   - Formulario: ✅ Múltiples columnas, layout completo

**Resultado esperado:** ✅ Funciona bien en todos los tamaños

---

## 🐛 Troubleshooting

### Problema: Error 500 al buscar

```
Error: Cast to number failed for value 'i'
```

**Causa:** Endpoints en `/administradorBuscar.js` aún usan regex en MongoDB

**Solución:**
1. Verificar que `/routes/administradorBuscar.js` tiene string matching (no regex en MongoDB)
2. Reiniciar servidor: `node index.js`
3. Limpiar cache del navegador: Ctrl+Shift+Delete

---

### Problema: Formulario no abre, va a página read-only

```
Ves: Información en boxes, NO formulario
```

**Causa:** Ruta GET `/:id/edit` sigue renderizando `stockIndividual.ejs`

**Solución:**
1. Verificar `/routes/administradorProductos.js` línea ~50:
   ```javascript
   res.render('stock/editarProducto', { producto })  // ← Debe ser esto
   ```
2. Reiniciar servidor

---

### Problema: Guardar no funciona

```
Click en "Guardar" → Nada pasa
```

**Causa:** Problema con PUT request o form-method-override

**Solución:**
1. Abrir DevTools → Network
2. Hacer click en "Guardar"
3. Buscar request PUT a `/administrador/productos/{ID}`
4. Ver status: debería ser 302 (redirect) o 200 (OK)
5. Si error: ver console del navegador y servidor

---

### Problema: Los cambios no se guardan

```
Guardas → Ves mensaje ✅ → Pero los datos no cambiaron
```

**Causa:** Base de datos no actualizó o hay conflicto

**Solución:**
1. Verificar que MongoDB está corriendo: `mongosh` en otra terminal
2. Conectar a base de datos: `use dbIsidorito`
3. Buscar producto: `db.productos.findOne({_id: ObjectId("...")})`
4. Ver si tiene los datos nuevos

---

## 📊 Checklist Final

- [ ] ✅ Búsqueda por texto funciona
- [ ] ✅ Búsqueda por código funciona
- [ ] ✅ Sin Error 500 en búsqueda
- [ ] ✅ Botones abren formulario de edición
- [ ] ✅ Formulario muestra todos los campos
- [ ] ✅ Validación de precios funciona
- [ ] ✅ Guardar actualiza los datos
- [ ] ✅ Flash message aparece
- [ ] ✅ Cancelar descarta cambios
- [ ] ✅ Código de barras es read-only
- [ ] ✅ Responsive en mobile
- [ ] ✅ Responsive en tablet
- [ ] ✅ Responsive en desktop

---

## 📞 Contacto / Reporte

Si encuentras un problema:

1. **Nota la URL:** `http://localhost:3037/...`
2. **Nota el error:** Exactamente qué sucede y qué esperabas
3. **Abre DevTools:** F12 → Console → Copia errores
4. **Revisa Network tab:** Ve si hay requests fallidos
5. **Proporciona:** Pasos para reproducir + logs

---

## ✨ Felicidades

Si pasaste todos los tests, ¡el flujo está listo para producción! 🚀

