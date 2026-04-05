# ⚡ Quick Setup - Sistema de Búsqueda

**Tiempo estimado:** 15-20 minutos

---

## ✅ Estado Actual

✅ **COMPLETO (Frontend)**
- API backend: `/routes/searchApi.js` ✅
- Clase JavaScript: `/public/js/productSearch.js` ✅
- Componentes EJS: ✅
  - `/views/partials/productSearchInput.ejs` ✅
  - `/views/partials/productSearchModal.ejs` ✅
- Vistas de ejemplo: ✅
  - `/views/stock/actualizar.ejs` ✅
  - `/views/ofertas/agregarIndividual.ejs` ✅
  - `/views/ofertas/agregarBatch.ejs` ✅

❌ **PENDIENTE (Backend Routes)**
- Rutas Stock: ⏳ Necesaria
- Rutas Ofertas: ⏳ Necesaria
- Modelo Oferta: ⏳ Necesaria

---

## 🚀 3 Pasos para Activar

### Paso 1: Copiar Código de Rutas

1. Abrir `ROUTES_IMPLEMENTATION.md`
2. Copiar código de **Stock Routes**
3. Crear archivo `/routes/stock.js` (o actualizar si existe)
4. Copiar código de **Ofertas Routes**
5. Crear archivo `/routes/ofertas.js` (o actualizar si existe)

### Paso 2: Crear Modelo Oferta

1. En `/models/oferta.js`, copiar:

```javascript
const mongoose = require('mongoose');

const ofertaSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Producto',
        required: true
    },
    precioOferta: {
        type: Number,
        required: true
    },
    fechaInicio: {
        type: Date,
        required: true
    },
    fechaFin: {
        type: Date,
        required: true
    },
    descripcion: String,
    activa: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Oferta', ofertaSchema);
```

### Paso 3: Actualizar index.js

En `/index.js`, agregar estas líneas (si no están):

```javascript
// Cerca del top, con otros requires:
const stockRoutes = require('./routes/stock');
const ofertasRoutes = require('./routes/ofertas');

// Cerca del bottom, con otros app.use():
app.use('/administrador/stock', stockRoutes);
app.use('/administrador/ofertas', ofertasRoutes);
```

---

## 🧪 Validar Instalación

```bash
# Test 1: Verificar archivos
node validate-search.js

# Test 2: Setup
node setup-search.js
```

---

## 📱 Test en Navegador

1. Iniciar servidor: `npm start`
2. Ir a: `http://localhost:3000/administrador/stock/actualizar`
3. Escribir: "coca"
4. Esperar resultados (max 300ms)
5. Hacer click en un producto
6. Verificar que se selecciona

✅ Si funciona: ¡Listo!

---

## 🔌 Test con Barcode

1. Conectar reader USB
2. Ir a: `/administrador/stock/actualizar`
3. Hacer scan de un código de barras
4. Sistema debe detectar y buscar automáticamente

---

## 📞 Troubleshooting

| Problema | Solución |
|----------|----------|
| "404 Not Found" en ruta | Verificar que rutas estén creadas en `/routes` |
| "Oferta model not found" | Crear `/models/oferta.js` |
| Búsqueda no funciona | Verificar que `/api/search/smart` existe |
| Event no dispara | Ver console F12, verificar axios cargado |

---

## 📚 Documentación

```
├── README_BUSQUEDA.md            ← Lee esto primero (Guía rápida)
├── SEARCH_INTEGRATION_GUIDE.md   ← Detalles de uso
├── ROUTES_IMPLEMENTATION.md      ← Rutas necesarias
├── PHASE3_STATUS.md              ← Estado completo
└── setup-search.js               ← Validador
```

---

## ⏱️ Checklist Rápido

- [ ] Paso 1: Copiar código de rutas (5 min)
- [ ] Paso 2: Crear modelo Oferta (2 min)
- [ ] Paso 3: Actualizar index.js (3 min)
- [ ] Validar: `node validate-search.js` (1 min)
- [ ] Test en navegador (5 min)

**Total:** ~15-20 minutos

---

## 🎯 Después del Setup

1. **Stock module** - Listo para usar inmediatamente
2. **Ofertas module** - Listo para usar inmediatamente
3. **Buscar module** - Ya estaba, actualizado automáticamente
4. **Barcode reader** - Conectar y listo

---

## 💡 Atajos Útiles

### Para copiar rutas rápidamente:

```bash
# Ver archivo de rutas
cat ROUTES_IMPLEMENTATION.md | grep -A 50 "Stock Routes"
```

### Para validar instalación:

```bash
# Ejecutar validador
node validate-search.js

# Ejecutar setup
node setup-search.js
```

---

## ✨ Resultado Final

Cuando todo esté listo, tendrás:

✅ Búsqueda de texto funcionando  
✅ Búsqueda por código de barras funcionando  
✅ Detección automática (barcode vs texto)  
✅ Módulo Stock con búsqueda  
✅ Módulo Ofertas con búsqueda individual  
✅ Módulo Ofertas con búsqueda en lote  
✅ Compatible con lectores USB básicos  

---

## 📞 Soporte

**Dudas:**
1. Ver `SEARCH_INTEGRATION_GUIDE.md` (300+ líneas)
2. Ver `ROUTES_IMPLEMENTATION.md` (250+ líneas)
3. Revisar archivos de ejemplo en `/views`

**Errores:**
1. F12 → Console tab
2. Ver Network tab (ver request a API)
3. Verificar que rutas existen
4. Verificar autenticación

---

**🚀 ¡Listo para empezar!**

Siguiente paso: Copiar rutas de `ROUTES_IMPLEMENTATION.md`
