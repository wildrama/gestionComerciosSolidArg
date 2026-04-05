# 🧪 TESTING GUIDE: MÓDULO DE EDICIÓN DE PRODUCTOS
**Fecha:** 19 de noviembre de 2025  
**Duración Estimada:** 40-50 minutos  
**Navegador Recomendado:** Chrome, Firefox, Edge (versión actual)  

---

## 📋 CHECKLIST PRE-TESTING

- [ ] Servidor Express corriendo en puerto 3037
- [ ] Base de datos MongoDB conectada
- [ ] Usuario administrador logueado
- [ ] Acceso a módulo de productos (/administrador/buscar)
- [ ] Console browser abierta para logs (F12)

---

## ✅ TESTING PHASE 1: Navegación y Acceso

### PASO 1.1: Acceder al buscador de productos
**Ruta:** `http://localhost:3037/administrador/buscar`

**Verificar:**
- [ ] Página carga correctamente
- [ ] Campo de búsqueda visible
- [ ] Acepta entrada de texto

**Resultado Esperado:**
```
✅ Campo de búsqueda funcional
✅ Sin errores en console
```

---

### PASO 1.2: Buscar un producto
**Acción:** Escribir nombre/código de un producto existente

**Verificar:**
- [ ] Resultados aparecen en tiempo real
- [ ] Tarjeta del producto muestra: nombre, marca, stock, precio
- [ ] Botón "Ver Detalle" visible

**Resultado Esperado:**
```
✅ Al menos 1 resultado visible
✅ Botón "Ver Detalle" disponible
```

---

### PASO 1.3: Hacer clic en "Ver Detalle"
**Acción:** Click en botón "Ver Detalle"

**Verificar:**
- [ ] Redirección a detalle del producto
- [ ] URL es `/administrador/productos/{id}`
- [ ] Información del producto visible

**Resultado Esperado:**
```
URL: http://localhost:3037/administrador/productos/[ID]
✅ Detalle de producto cargado
```

---

## ✅ TESTING PHASE 2: Botones de Acción en Detalle

### PASO 2.1: Verificar disponibilidad de botones
**Ubicación:** Sección "Acciones" en la página de detalle

**Verificar:**
- [ ] Botón "✏️ Editar Producto" visible (azul/gradiente)
- [ ] Botón "💰 Editar Precios" visible (rosa/gradiente)
- [ ] Botón "🗑️ Eliminar" visible (rojo)

**Resultado Esperado:**
```
✅ 3 botones de acción visibles
✅ Colores diferenciados
✅ Botones con hover effects
```

---

### PASO 2.2: Click en "✏️ Editar Producto"
**Acción:** Click en botón "Editar Producto"

**Verificar:**
- [ ] Redirección a formulario de edición
- [ ] URL es `/administrador/productos/{id}/edit`
- [ ] Página carga sin errores
- [ ] Console vacía (sin errores)

**Resultado Esperado:**
```
URL: http://localhost:3037/administrador/productos/[ID]/edit
✅ Formulario de edición cargado
✅ Sin errores en console
```

---

## ✅ TESTING PHASE 3: Formulario de Edición (Estado Inicial)

### PASO 3.1: Verificar estado de campos
**Ubicación:** Formulario completo

**Verificar que ESTÁN DESHABILITADOS (disabled):**
- [ ] Campo "Código de Barra" → ✅ EDITABLE
- [ ] Campo "Nombre del Producto" → ❌ DISABLED
- [ ] Campo "Marca" → ❌ DISABLED
- [ ] Campo "Stock" → ❌ DISABLED
- [ ] Campo "Categoría" → ❌ DISABLED
- [ ] Campo "Peso" → ❌ DISABLED
- [ ] Campo "Fecha Vencimiento" → ❌ DISABLED
- [ ] Campo "Impuesto" → ❌ DISABLED

**Campos Precios (todos READ-ONLY):**
- [ ] "Precio Minorista" → ❌ DISABLED
- [ ] "Precio Mayorista" → ❌ DISABLED
- [ ] "Precio Costo" → ❌ DISABLED

**Resultado Esperado:**
```
✅ Todos los campos excepto código están DISABLED
✅ UI muestra que son campos de lectura
✅ Precios muestran valores correctos
```

---

### PASO 3.2: Verificar botón principal
**Elemento:** Botón principal en sección "Form Actions"

**Verificar:**
- [ ] Botón dice "✏️ Editar"
- [ ] Tipo es "submit"
- [ ] Visible y clickeable

**Resultado Esperado:**
```
✅ Botón muestra ✏️ Editar
✅ Sin efecto visual al hacerle hover (disabled state)
```

---

### PASO 3.3: Verificar breadcrumb de navegación
**Elemento:** Navegación superior

**Verificar:**
- [ ] Muestra: Dashboard / Buscar / Editar Producto
- [ ] Cada elemento es clickeable (excepto el último)
- [ ] Links funcionan correctamente

**Resultado Esperado:**
```
✅ Breadcrumb visible y funcional
✅ Puede regresar a búsqueda
```

---

## ✅ TESTING PHASE 4: Toggle Editar/Guardar

### PASO 4.1: Click en botón "✏️ Editar"
**Acción:** Click en botón principal

**Verificar:**
- [ ] Aparece alerta verde: "✏️ Modo edición activado"
- [ ] Campos se habilitan (excepto precios y nombre)
- [ ] Botón cambia a "💾 Guardar Cambios"
- [ ] Campos tienen fondo blanco editable

**Resultado Esperado:**
```
ALERTA: ✏️ Modo edición activado

CAMPOS AHORA EDITABLES:
✅ Código de Barra (si no estaba ya)
✅ Stock
✅ Categoría
✅ Peso
✅ Fecha Vencimiento
✅ Impuesto

BOTÓN CAMBIA A: 💾 Guardar Cambios
```

---

### PASO 4.2: Intentar editar un campo
**Acción:** Click en campo "Stock" y cambiar valor

**Verificar:**
- [ ] Campo es editable
- [ ] Se puede escribir/borrar
- [ ] Cursor visible
- [ ] Cambios se reflejan inmediatamente

**Resultado Esperado:**
```
✅ Campo Stock editable
✅ Nuevo valor visible en campo
```

---

## ✅ TESTING PHASE 5A: Validaciones (Errores)

### PASO 5A.1: Intentar guardar con Stock vacío
**Acción:**
1. Click "✏️ Editar"
2. Limpiar campo Stock (dejar vacío)
3. Click "💾 Guardar Cambios"

**Verificar:**
- [ ] Alerta roja aparece: "❌ La cantidad debe ser un número mayor o igual a 0"
- [ ] Botón vuelve a "💾 Guardar Cambios" (no se cambió a "Editar")
- [ ] Campos siguen habilitados
- [ ] Producto NO se actualiza

**Resultado Esperado:**
```
ALERTA ROJA: ❌ La cantidad debe ser un número mayor o igual a 0
✅ Validación funcionó
✅ Cambios NO se guardaron
```

---

### PASO 5A.2: Intentar guardar con Stock negativo
**Acción:**
1. Campo Stock ya debería estar en foco
2. Escribir: -5
3. Click "💾 Guardar Cambios"

**Verificar:**
- [ ] Alerta roja aparece: "❌ La cantidad debe ser un número mayor o igual a 0"
- [ ] Campos siguen habilitados
- [ ] Producto NO se actualiza

**Resultado Esperado:**
```
ALERTA ROJA: ❌ La cantidad debe ser un número mayor o igual a 0
✅ Validación de negativos funcionó
✅ Cambios NO se guardaron
```

---

### PASO 5A.3: Intentar guardar con Categoría vacía
**Acción:**
1. Seleccionar categoría vacía (si es posible)
2. Click "💾 Guardar Cambios"

**Verificar:**
- [ ] Si UI no permite vacío, verificar validación backend
- [ ] Si permite, debe mostrar error

**Resultado Esperado:**
```
✅ Validación de categoría activa
```

---

## ✅ TESTING PHASE 5B: Guardado Exitoso

### PASO 5B.1: Editar un campo y guardar correctamente
**Acción:**
1. Click "✏️ Editar"
2. Cambiar Stock a: 50 (o número válido)
3. Click "💾 Guardar Cambios"

**Verificar:**
- [ ] Aparece alerta verde: "✅ Se modificaron los valores en el producto"
- [ ] Botón cambia a: "✏️ Editar" (vuelve al estado inicial)
- [ ] Campos se deshabilitan nuevamente
- [ ] Después de ~1.5 segundos, redirecciona a detalle

**Resultado Esperado:**
```
ALERTA VERDE: ✅ Se modificaron los valores en el producto "NOMBRE"

DESPUÉS:
✅ Campos se deshabilitan
✅ Botón vuelve a "✏️ Editar"
✅ Redirecciona a http://localhost:3037/administrador/productos/[ID]
```

---

### PASO 5B.2: Verificar que los cambios se guardaron
**Ubicación:** Página de detalle (después de redirección)

**Verificar:**
- [ ] Stock actualizado al nuevo valor (50)
- [ ] Otros datos sin cambios
- [ ] Sin errores en console

**Resultado Esperado:**
```
Stock Disponible: 50 unidades ✅ (o el valor que guardaste)
✅ Base de datos se actualizó correctamente
```

---

### PASO 5B.3: Editar otro campo (Categoría)
**Acción:**
1. Click "✏️ Editar Producto" de nuevo
2. Click "✏️ Editar"
3. Cambiar Categoría a: "Bebidas sin alcohol"
4. Click "💾 Guardar Cambios"

**Verificar:**
- [ ] Categoría se actualiza en detalle
- [ ] Stock mantiene el valor anterior (50)
- [ ] Sin conflictos entre actualizaciones

**Resultado Esperado:**
```
✅ Categoría actualizada
✅ Otros campos no afectados
✅ Múltiples ediciones funcionan
```

---

## ✅ TESTING PHASE 6: Validación de Precios

### PASO 6.1: Verificar que precios son READ-ONLY
**Acción:**
1. Click en "✏️ Editar"
2. Intentar hacer click en campo "Precio Minorista"

**Verificar:**
- [ ] Campo está DISABLED (grisáceo)
- [ ] No se puede escribir
- [ ] Muestra mensaje: "Edita en la sección de precios"

**Resultado Esperado:**
```
✅ Precios permanecen READ-ONLY
✅ Usuario debe ir a "Editar Precios" separado
```

---

### PASO 6.2: Acceder a edición de precios
**Acción:** Click en botón "💰 Editar Precios"

**Verificar:**
- [ ] Redirecciona a `/administrador/productos/{id}/upstockprecio`
- [ ] Interfaz de edición de precios carga correctamente

**Resultado Esperado:**
```
URL: http://localhost:3037/administrador/productos/[ID]/upstockprecio
✅ Interfaz de precios funcional (auditoría separada)
```

---

## ✅ TESTING PHASE 7: Regresión y Edge Cases

### PASO 7.1: Cargar nuevamente el formulario de edición
**Acción:** Ir a detalle → Click "Editar Producto"

**Verificar:**
- [ ] Valores se muestran correctamente (últimos guardados)
- [ ] Campos están DISABLED al cargar
- [ ] Botón muestra "✏️ Editar"
- [ ] Sin cache stale o inconsistencias

**Resultado Esperado:**
```
✅ Datos actualizados desde base de datos
✅ UI coherente
```

---

### PASO 7.2: Navegación away and back
**Acción:**
1. Hacer cambios (sin guardar)
2. Click "Volver" (botón breadcrumb o navegación)

**Verificar:**
- [ ] NO hay confirmación de cambios sin guardar (opcional)
- [ ] Redirecciona correctamente
- [ ] Sin datos corruptos

**Resultado Esperado:**
```
✅ Navegación funciona
✅ Base de datos NO modificada
```

---

### PASO 7.3: Testing en dispositivo móvil
**Acción:** Abrir en móvil o DevTools modo mobile

**Verificar:**
- [ ] Formulario responsivo (se adapta a pantalla)
- [ ] Botones clickeables (toque táctil)
- [ ] Texto legible sin zoom
- [ ] Campos editable en móvil

**Resultado Esperado:**
```
✅ UI responsiva en mobile
✅ Experiencia tactil funcional
✅ Sin layout breaks
```

---

## 📊 MATRIZ DE TESTING

| Fase | Paso | Esperado | Actual | ✅/❌ |
|------|------|----------|--------|-------|
| 1 | 1.1 | Búsqueda funciona | | |
| 1 | 1.2 | Resultados aparecen | | |
| 1 | 1.3 | Detalle carga | | |
| 2 | 2.1 | 3 botones visibles | | |
| 2 | 2.2 | Redirige a /edit | | |
| 3 | 3.1 | Campos DISABLED | | |
| 3 | 3.2 | Botón "✏️ Editar" | | |
| 3 | 3.3 | Breadcrumb funciona | | |
| 4 | 4.1 | Alerta + Toggle | | |
| 4 | 4.2 | Campos editables | | |
| 5A | 5A.1 | Validación Stock vacío | | |
| 5A | 5A.2 | Validación Stock < 0 | | |
| 5A | 5A.3 | Validación categoría | | |
| 5B | 5B.1 | Guardado exitoso | | |
| 5B | 5B.2 | Datos se actualizaron | | |
| 5B | 5B.3 | Múltiples ediciones | | |
| 6 | 6.1 | Precios READ-ONLY | | |
| 6 | 6.2 | Acceder a precios | | |
| 7 | 7.1 | Reload mantiene datos | | |
| 7 | 7.2 | Navegación away/back | | |
| 7 | 7.3 | Responsivo en mobile | | |

---

## 🐛 REGISTRO DE ISSUES

### Si encuentras problemas, completar:

```
ISSUE #1
--------
Descripción: [qué pasó]
Pasos para reproducir: [paso 1, paso 2, ...]
Resultado esperado: [qué debería pasar]
Resultado actual: [qué pasó en realidad]
Console error: [copiar error si existe]
Navegador: [Chrome, Firefox, etc.]
```

---

## ✅ CHECKLIST FINAL

### Si todos los tests pasan:
- [ ] Fase 1: Navegación ✅
- [ ] Fase 2: Botones de acción ✅
- [ ] Fase 3: Estado inicial ✅
- [ ] Fase 4: Toggle funciona ✅
- [ ] Fase 5A: Validaciones ✅
- [ ] Fase 5B: Guardado ✅
- [ ] Fase 6: Precios ✅
- [ ] Fase 7: Regresión ✅

**Si TODOS están ✅:** 
```
✅ MÓDULO DE EDICIÓN LISTO PARA PRODUCCIÓN
```

---

**Testing Duration:** [Comenzó] → [Terminó] = [TOTAL]  
**Tester Name:** _____________________  
**Status:** ✅ PASSED / ❌ FAILED / ⚠️ NEEDS REVIEW  
**Notes:** 
```
[Escribe observaciones adicionales aquí]
```

---

**Próximos Pasos (si FAILED):**
1. Documentar cada issue
2. Compartir con equipo de desarrollo
3. Implementar fixes
4. Re-test

**Próximos Pasos (si PASSED):**
1. Preparar para deployment
2. Notificar a usuario final
3. Actualizar documentación en producción
