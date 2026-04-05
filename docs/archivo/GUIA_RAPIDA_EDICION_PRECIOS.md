# 💰 GUÍA RÁPIDA: EDICIÓN DE PRECIOS

## 🚀 ¿QUÉ HA CAMBIADO?

La edición de precios ahora:
- ✅ Se ve mejor con animaciones fluidas
- ✅ Muestra cambios en tiempo real
- ✅ Sincroniza automáticamente entre pantallas
- ✅ Es más rápida y responsiva
- ✅ Tiene mejor feedback visual

---

## 📖 CÓMO USAR

### Paso 1: Buscar el Producto
```
1. Click en "🔍 Buscar Productos" (o "🔍 Administrador")
2. Escribe nombre del producto
3. Click "Ver Detalle" en la tarjeta
```

### Paso 2: Abrir Editor de Precios
```
Página de detalle del producto
    ↓
Click en el botón "💰 Editar Precios"
```

### Paso 3: Editar Precios
```
Verás 3 CARDS (una por cada tipo de precio):

┌─────────────────────────┐
│ 🛒 Precio Minorista     │
├─────────────────────────┤
│ Precio Actual: $100.00  │
│                         │
│ Aumento %:    [__] %    │
│ Aumento Manual: [__]    │
│                         │
│ Nuevo Precio: $[--]     │
│                         │
│ [✅ Guardar Cambio]     │
└─────────────────────────┘

- O ingresa un % (ej: 10 = +10%)
- O ingresa el nuevo precio manualmente
- El "Nuevo Precio" se actualiza EN TIEMPO REAL
```

### Paso 4: Guardar
```
Click en el botón azul "✅ Guardar Cambio"

Verás:
├─ Botón se vuelve "⏳ Guardando..."
├─ CARD hace un flash verde
├─ Aparece mensaje: "✅ Precio actualizado: $110.00 (+$10.00)"
└─ Después de 4 segundos desaparece el mensaje
```

### Paso 5: Volver al Detalle
```
Click en "← Volver al Detalle"

Automáticamente:
├─ Se actualiza el precio mostrado
├─ Hace una animación de "flash"
├─ Se sincroniza con la base de datos
└─ ✅ Listo para usar
```

---

## 🎨 CARACTERÍSTICAS NUEVAS

### 💫 Animaciones
- **Pulse:** Parpadeo suave cuando se actualiza
- **Flash:** Brillo verde cuando se guarda correctamente
- **Slide:** Las alertas entran suavemente desde arriba

### 📊 Información Detallada
- Muestra diferencia de precio: `(+$10.00)` o `(-$5.00)`
- Confirma el nombre del producto
- Indica exactamente qué precio se actualizó

### 🔄 Sincronización Automática
- Cuando vuelves a la página, los precios se actualizan solos
- Si haces cambios desde otra ventana, se sincronizan
- Cada 10 segundos verifica con la base de datos

---

## ⌨️ ATAJO: AUMENTO %

Si quieres aumentar un precio 10%:
```
1. Ingresa en "Aumento %": 10
2. El sistema calcula automáticamente
3. Muestra el nuevo precio en "Nuevo Precio"
4. Click "Guardar"
```

**Ejemplo:**
```
Precio actual:  $100.00
Aumento %:      10
                ↓
Nuevo precio:   $110.00 (100 + 10%)
```

---

## ⌨️ ATAJO: PRECIO MANUAL

Si sabes exactamente el nuevo precio:
```
1. Ingresa en "Aumento Manual": el nuevo precio
2. El campo "Aumento %" se limpia automáticamente
3. Muestra el nuevo precio en "Nuevo Precio"
4. Click "Guardar"
```

**Ejemplo:**
```
Precio actual:  $100.00
Precio manual:  125.50
                ↓
Nuevo precio:   $125.50
```

---

## 🔴 MENSAJES DE ERROR

### ❌ "No se registran cambios"
- **Significa:** No ingresaste nada
- **Solución:** Ingresa un % o un precio manual

### ❌ "Precio inválido"
- **Significa:** El precio es negativo o no es un número
- **Solución:** Verifica que ingresaste un número positivo

### ❌ "Error al guardar precio"
- **Significa:** Problema al guardar en la base de datos
- **Solución:** Recarga la página e intenta de nuevo

---

## ✅ MENSAJES DE ÉXITO

### ✅ "Precio minorista actualizado: $110.00 (+$10.00)"
- Verde significa que se guardó correctamente
- Muestra exactamente cuánto cambió el precio

---

## 📱 EN DISPOSITIVOS MÓVILES

- Todo funciona igual que en desktop
- Las CARDS se apilan verticalmente
- Los botones se adaptan al tamaño
- Los precios se sincronizar normalmente

---

## 🐛 SI ALGO NO FUNCIONA

### Los precios no se sincronizan
1. Recarga la página
2. Verifica que estés conectado a internet
3. Abre la consola (F12) para ver errores

### Las animaciones no se ven
1. Limpia el caché del navegador (Ctrl+Shift+Delete)
2. Recarga la página (Ctrl+R)
3. Abre DevTools para verificar errores

### El precio no se guarda
1. Verifica que ingresaste un número válido
2. Abre la consola (F12) para ver el error exacto
3. Intenta de nuevo

---

## 🔐 SEGURIDAD

- Solo administradores pueden editar precios
- Los precios se validan en el servidor
- Se guarda exactamente qué cambió
- No se pueden ingresar precios negativos

---

## 📞 TIPS ÚTILES

### 💡 Cambiar 3 precios a la vez
```
Minorista:  10% más
Mayorista:  8% más  
Costo:      5% más

Guardas cada uno → Todos se actualizan
```

### 💡 Sincronización rápida
```
Si cambias precios desde múltiples ventanas:
1. Vuelve a la página principal
2. Espera 10 segundos
3. Los precios se actualizan automáticamente
```

### 💡 Ver qué cambió
```
Abre la consola (F12) → Pestaña "Console"
Verás logs como: "[editPrice.js] Minorista actualizado: $100 → $110"
```

---

## 📊 TIPOS DE PRECIOS

| Tipo | Icono | Color | Uso |
|------|-------|-------|-----|
| **Minorista** | 🛒 | Azul | Clientes individuales |
| **Mayorista** | 🏪 | Naranja | Compras al por mayor |
| **Costo** | 💸 | Rosa | Tu costo de compra |

---

## ✨ PRÓXIMAS MEJORAS

- [ ] Editar múltiples precios a la vez
- [ ] Historial de cambios de precio
- [ ] Alertas si cambió de otra sesión
- [ ] Deshacer cambios (Undo)
- [ ] Programar cambios de precio

---

**¡Ahora los precios se actualizan perfectamente! 🎉**

**¿Necesitas ayuda?** Abre F12 (Console) para ver todos los detalles en tiempo real.
