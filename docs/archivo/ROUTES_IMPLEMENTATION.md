# Actualización de Rutas - Sistema de Búsqueda

## 📋 Resumen

Para completar la integración del sistema de búsqueda universal, necesitas actualizar/crear las siguientes rutas en el servidor:

## 📁 Rutas a Crear/Actualizar

### 1. Stock Routes (`/routes/stock.js` o similar)

```javascript
// GET /administrador/stock - Listar stock
router.get('/', isLoggedIn, async (req, res) => {
    try {
        const productos = await Producto.find().sort({ nombre: 1 });
        res.render('stock/listado', { productos });
    } catch (err) {
        res.status(500).render('errors', { error: err });
    }
});

// GET /administrador/stock/actualizar - Formulario de actualización
router.get('/actualizar', isLoggedIn, (req, res) => {
    res.render('stock/actualizar');
});

// POST /administrador/stock/update - Actualizar cantidad
router.post('/update', isLoggedIn, catchAsync(async (req, res) => {
    const { productId, cantidad, updateType, notes } = req.body;
    
    const producto = await Producto.findByIdAndUpdate(
        productId,
        { cantidad: cantidad },
        { new: true }
    );
    
    if (!producto) {
        return res.status(404).json({ 
            success: false, 
            message: 'Producto no encontrado' 
        });
    }

    // Opcional: Guardar historial de cambios
    // await StockHistory.create({ 
    //     productId, 
    //     cantidad, 
    //     updateType, 
    //     notes, 
    //     usuario: req.user._id, 
    //     fecha: new Date() 
    // });

    res.json({ 
        success: true, 
        message: 'Stock actualizado',
        data: producto 
    });
}));
```

### 2. Ofertas Routes (`/routes/ofertas.js` o similar)

```javascript
// GET /administrador/ofertas - Listar ofertas
router.get('/', isLoggedIn, async (req, res) => {
    try {
        const ofertas = await Oferta.find()
            .populate('productId')
            .sort({ fechaInicio: -1 });
        res.render('ofertas/listado', { ofertas });
    } catch (err) {
        res.status(500).render('errors', { error: err });
    }
});

// GET /administrador/ofertas/individual - Formulario crear oferta individual
router.get('/individual', isLoggedIn, (req, res) => {
    res.render('ofertas/agregarIndividual');
});

// GET /administrador/ofertas/batch - Formulario crear ofertas en lote
router.get('/batch', isLoggedIn, (req, res) => {
    res.render('ofertas/agregarBatch');
});

// POST /administrador/ofertas/create - Crear oferta individual
router.post('/create', isLoggedIn, catchAsync(async (req, res) => {
    const { productId, precioOferta, fechaInicio, fechaFin, descripcion } = req.body;
    
    // Validar que el producto existe
    const producto = await Producto.findById(productId);
    if (!producto) {
        return res.status(404).json({ 
            success: false, 
            message: 'Producto no encontrado' 
        });
    }

    // Crear oferta
    const oferta = new Oferta({
        productId,
        precioOferta,
        fechaInicio,
        fechaFin,
        descripcion,
        createdBy: req.user._id
    });

    await oferta.save();

    res.json({ 
        success: true, 
        message: 'Oferta creada',
        data: oferta 
    });
}));

// POST /administrador/ofertas/create-batch - Crear múltiples ofertas
router.post('/create-batch', isLoggedIn, catchAsync(async (req, res) => {
    const { ofertas, fechaInicio, fechaFin, descripcion } = req.body;

    if (!Array.isArray(ofertas) || ofertas.length === 0) {
        return res.status(400).json({ 
            success: false, 
            message: 'No hay ofertas para crear' 
        });
    }

    const ofertasCreadas = [];

    for (const oferta of ofertas) {
        // Validar que el producto existe
        const producto = await Producto.findById(oferta.productId);
        if (!producto) continue;

        const nuevaOferta = new Oferta({
            productId: oferta.productId,
            precioOferta: oferta.precioOferta,
            fechaInicio,
            fechaFin,
            descripcion,
            createdBy: req.user._id
        });

        const saved = await nuevaOferta.save();
        ofertasCreadas.push(saved);
    }

    res.json({ 
        success: true, 
        message: `${ofertasCreadas.length} ofertas creadas`,
        created: ofertasCreadas.length,
        data: ofertasCreadas 
    });
}));

// DELETE /administrador/ofertas/:id - Eliminar oferta
router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    await Oferta.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Oferta eliminada' });
}));
```

### 3. Registrar Rutas en `index.js`

```javascript
// Existing routes...
const administradorProductos = require('./routes/administradorProductos');
const administradorOfertas = require('./routes/administradorOfertas');
const administradorStock = require('./routes/administradorStock');
const searchApiRoutes = require('./routes/searchApi');

// ... más requires ...

// Rutas de administración
app.use('/administrador/productos', administradorProductos);
app.use('/administrador/ofertas', administradorOfertas);
app.use('/administrador/stock', administradorStock);
app.use('/api/search', searchApiRoutes);

// ... más rutas ...
```

## 📝 Modelos MongoDB Necesarios

### Modelo Oferta (si no existe)

```javascript
// models/oferta.js
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

// Middleware para verificar si está vigente
ofertaSchema.virtual('esVigente').get(function() {
    const hoy = new Date();
    return hoy >= this.fechaInicio && hoy <= this.fechaFin && this.activa;
});

module.exports = mongoose.model('Oferta', ofertaSchema);
```

### Modelo Stock History (Opcional - para auditoría)

```javascript
// models/stockHistory.js
const mongoose = require('mongoose');

const stockHistorySchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Producto',
        required: true
    },
    cantidadAnterior: Number,
    cantidadNueva: Number,
    updateType: {
        type: String,
        enum: ['set', 'add', 'subtract'],
        required: true
    },
    notes: String,
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    fecha: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('StockHistory', stockHistorySchema);
```

## 🔗 URLs de las Vistas Creadas

| Vista | Ruta | Descripción |
|-------|------|-------------|
| Buscar Productos | `/administrador/buscar` | ✅ Ya existe (actualizada) |
| Stock - Listar | `/administrador/stock` | ⏳ Necesita ruta GET |
| Stock - Actualizar | `/administrador/stock/actualizar` | ⏳ Necesita ruta GET |
| Ofertas - Listar | `/administrador/ofertas` | ⏳ Necesita ruta GET |
| Ofertas - Individual | `/administrador/ofertas/individual` | ⏳ Necesita ruta GET |
| Ofertas - Batch | `/administrador/ofertas/batch` | ⏳ Necesita ruta GET |

## 🧪 Testing de Rutas

### 1. Test API de Búsqueda

```bash
# Búsqueda de texto
curl -X POST http://localhost:3000/api/search/smart \
  -H "Content-Type: application/json" \
  -d '{"query":"coca"}'

# Búsqueda de barcode
curl -X POST http://localhost:3000/api/search/barcode \
  -H "Content-Type: application/json" \
  -d '{"barcode":"7791234567890"}'
```

### 2. Test Stock Update

```bash
curl -X POST http://localhost:3000/administrador/stock/update \
  -H "Content-Type: application/json" \
  -d '{
    "productId":"507f1f77bcf86cd799439011",
    "cantidad":100,
    "updateType":"set",
    "notes":"Reposición"
  }'
```

### 3. Test Crear Oferta

```bash
curl -X POST http://localhost:3000/administrador/ofertas/create \
  -H "Content-Type: application/json" \
  -d '{
    "productId":"507f1f77bcf86cd799439011",
    "precioOferta":2.50,
    "fechaInicio":"2024-01-01",
    "fechaFin":"2024-01-31",
    "descripcion":"Oferta especial"
  }'
```

## ⚙️ Configuración Recomendada

### Índices MongoDB (para mejor performance)

```javascript
// En seeds o scripts de setup
db.productos.createIndex({ nombre: "text", marca: "text", codigo: "text" });
db.productos.createIndex({ codigo: 1 });
db.ofertas.createIndex({ productId: 1 });
db.ofertas.createIndex({ fechaInicio: 1, fechaFin: 1 });
```

### Middleware de Autenticación

Asegurar que existe el middleware `isLoggedIn`:

```javascript
// middleware.js
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ 
            success: false, 
            message: 'No autenticado' 
        });
    }
    next();
};

module.exports = { isLoggedIn };
```

## 🚀 Checklist de Implementación

- [ ] Crear/actualizar rutas de Stock
- [ ] Crear/actualizar rutas de Ofertas
- [ ] Crear modelo Oferta (si no existe)
- [ ] Crear modelo StockHistory (opcional)
- [ ] Registrar rutas en index.js
- [ ] Crear índices en MongoDB
- [ ] Verificar middleware de autenticación
- [ ] Test de búsqueda en navegador
- [ ] Test de actualización de stock
- [ ] Test de crear ofertas
- [ ] Test con barcode reader real

---

**Estado:** 🚧 En Desarrollo  
**Próximo Paso:** Implementar rutas del servidor
