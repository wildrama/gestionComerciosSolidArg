const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn,isAdmin} = require('../middleware');
const Producto = require('../models/productos');

const roleADM = 'ADMINISTRADOR';

function normalizeIdArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

async function findProductByBarcode(codigoInput, excludeId = null) {
  const codigoTexto = String(codigoInput ?? '').trim();
  const codigoNormalizado = Number(codigoTexto);

  if (!codigoTexto || !Number.isFinite(codigoNormalizado)) {
    return null;
  }

  const filtro = {
    $or: [
      { codigo: codigoNormalizado },
      { $expr: { $eq: [{ $toString: '$codigo' }, codigoTexto] } }
    ]
  };

  if (excludeId) {
    filtro._id = { $ne: excludeId };
  }

  return Producto.findOne(filtro);
}

// ==================================================
// DEBUG: TEST PUT (sin autenticación)
// ==================================================
router.put('/debug/test/:id', catchAsync(async (req, res) => {
  console.log('🔧 [DEBUG] PUT /debug/test/:id llamado');
  console.log('ID:', req.params.id);
  console.log('Body:', req.body);
  res.json({
    success: true,
    message: 'DEBUG: Ruta PUT funcionando',
    idRecibido: req.params.id,
    bodyRecibido: req.body
  });
}));

// ==================================================
// DEBUG: VERIFICAR AUTENTICACIÓN
// ==================================================
router.get('/debug/auth', catchAsync(async (req, res) => {
  console.log('🔧 [DEBUG] GET /debug/auth llamado');
  console.log('req.isAuthenticated():', req.isAuthenticated());
  console.log('req.user:', req.user);
  res.json({
    success: true,
    authenticated: req.isAuthenticated(),
    user: req.user ? {
      id: req.user._id,
      username: req.user.username,
      funcion: req.user.funcion
    } : null,
    message: 'Estado de autenticación'
  });
}));

// ==================================================
// READ: OBTENER PRECIOS ACTUALES (PARA SINCRONIZACIÓN)
// ==================================================
router.get('/:id/precios', catchAsync(async (req, res) => {
  const { id } = req.params;
  const producto = await Producto.findById(id).select('precioMinorista precioMayorista precioCosto');
  
  if (!producto) {
    return res.status(404).json({
      success: false,
      message: 'Producto no encontrado'
    });
  }
  
  res.json({
    success: true,
    precios: {
      precioMinorista: parseFloat(producto.precioMinorista).toFixed(2),
      precioMayorista: parseFloat(producto.precioMayorista).toFixed(2),
      precioCosto: parseFloat(producto.precioCosto).toFixed(2)
    }
  });
}));

// ==================================================
// READ: VER TABLA DE STOCK
// ==================================================
router.get('/',isLoggedIn ,isAdmin(roleADM), catchAsync(async (req, res) => {
    console.log(req.user.funcion)

    const [productosRecientes, cantidadTotalDeProductos, categorias, stockResumen] = await Promise.all([
      Producto.find({}).sort({ createdAt: -1, _id: -1 }).limit(15).lean(),
      Producto.countDocuments({}).exec(),
      Producto.distinct('categoriaInterna'),
      Producto.aggregate([
        {
          $group: {
            _id: null,
            stockTotal: { $sum: { $ifNull: ['$cantidad', 0] } },
            stockBajoCount: {
              $sum: {
                $cond: [{ $lt: [{ $ifNull: ['$cantidad', 0] }, 10] }, 1, 0]
              }
            }
          }
        }
      ])
    ]);

    const resumen = stockResumen[0] || { stockTotal: 0, stockBajoCount: 0 };

    res.render('stock/verStock', {
      productos: productosRecientes,
      cantidadTotalDeProductos,
      categorias: (categorias || []).filter(Boolean).sort(),
      stockTotalGeneral: resumen.stockTotal || 0,
      stockBajoCount: resumen.stockBajoCount || 0,
      showingRecentOnly: true
    });
}))

router.get('/api/listado-completo', isLoggedIn, isAdmin(roleADM), catchAsync(async (req, res) => {
  const productos = await Producto.find({})
    .sort({ createdAt: -1, _id: -1 })
    .lean();

  const data = productos.map((producto) => ({
    _id: String(producto._id),
    nombre: producto.nombre || '',
    marca: producto.marca || '',
    categoriaInterna: producto.categoriaInterna || '',
    cantidad: Number(producto.cantidad || 0),
    precioMinorista: Number(producto.precioMinorista || 0),
    precioMayorista: Number(producto.precioMayorista || 0),
    presentacion: producto.presentacion || '',
    peso: producto.peso || ''
  }));

  res.json({ success: true, data });
}));

// ==================================================
// CREATE: FORMULARIO Y GUARDAR NUEVO PRODUCTO
// ==================================================
router.get('/nuevo', isLoggedIn,isAdmin(roleADM), (req, res) => {
  console.log(req.user, 'req.user....');
  res.render('stock/cargaStock');
})

router.post('/',isLoggedIn,isAdmin(roleADM), catchAsync(async (req, res) => {
  const codigoNormalizado = Number(String(req.body.codigo || '').trim());

  if (!Number.isFinite(codigoNormalizado) || codigoNormalizado <= 0) {
    req.flash('error', 'El código de barras es obligatorio y debe ser numérico.');
    return res.redirect('/administrador/productos/nuevo#codigo');
  }

  const productoDuplicado = await findProductByBarcode(req.body.codigo);
  if (productoDuplicado) {
    req.flash('error', `El código de barras ${codigoNormalizado} ya existe en el sistema.`);
    return res.redirect('/administrador/productos/nuevo#codigo');
  }

  const nuevoProducto = new Producto({
    ...req.body,
    codigo: codigoNormalizado
  });

  await nuevoProducto.save();
  req.flash('success', 'Producto cargado correctamente');
  res.redirect(`/administrador/productos/${nuevoProducto._id}`)
}))

// ==================================================
// PRINT: MÓDULO DE ETIQUETAS Y CÓDIGOS DE BARRA
// ==================================================
router.get('/imprimir-codigos', isLoggedIn, isAdmin(roleADM), catchAsync(async (req, res) => {
  const productos = await Producto.find({ codigo: { $exists: true, $ne: null } })
    .sort({ nombre: 1 })
    .lean();

  const preselectedIds = normalizeIdArray(req.query.ids);
  const productosPayload = JSON.stringify(productos.map((producto) => ({
    _id: String(producto._id),
    nombre: producto.nombre || 'Producto',
    marca: producto.marca || 'Sin marca',
    codigo: producto.codigo || '',
    precioMinorista: Number(producto.precioMinorista || 0),
    cantidad: Number(producto.cantidad || 0),
    categoriaInterna: producto.categoriaInterna || ''
  })));

  res.render('stock/imprimirCodigos', {
    productos,
    preselectedIds,
    productosPayload,
    preselectedPayload: JSON.stringify(preselectedIds)
  });
}));

// ==================================================
// READ: VER DETALLE DEL PRODUCTO (Read-only)
// ==================================================
router.get('/:id',isLoggedIn,isAdmin(roleADM),catchAsync(async (req, res) => {
  const { id } = req.params;
  const producto = await Producto.findById(id)
  if (!producto) {
    req.flash('error', 'No se puede encontrar el producto');
    return res.redirect('/administrador/productos');
  }
  res.render('stock/stockIndividual', { producto });
}))

// ==================================================
// UPDATE: EDITAR STOCK DEL PRODUCTO
// ==================================================
router.get('/:id/upstock', isLoggedIn,isAdmin(roleADM),catchAsync(async (req, res) => {
  const {id} = req.params;
  const producto = await Producto.findById(id)
  if (!producto) {
    req.flash('error', 'Producto no encontrado');
    return res.redirect('/administrador/productos');
  }
  res.render('edit/editResponsive.ejs', {producto})
}))

// ==================================================
// UPDATE: EDITAR PRECIOS DEL PRODUCTO
// ==================================================
router.get('/:id/upstockprecio', isLoggedIn,isAdmin(roleADM),catchAsync(async (req, res) => {
  const {id} = req.params;
  const producto = await Producto.findById(id)
  if (!producto) {
    req.flash('error', 'Producto no encontrado');
    return res.redirect('/administrador/productos');
  }
  res.render('edit/editPrecio.ejs', {producto})
}))

// Ruta deprecada - redirige a /upstock
router.get('/:id/edit',isLoggedIn, isAdmin(roleADM), catchAsync(async (req, res) => {
  const { id } = req.params;
  const producto = await Producto.findById(id);
  if (!producto) {
    req.flash('error', 'No se puede encontrar este producto');
    return res.redirect('/administrador/productos');
  }
  res.render('edit/editResponsive.ejs', {producto})
}))

// ==================================================
// UPDATE: ACTUALIZAR PRODUCTO COMPLETO
// ==================================================
router.put('/:id',isLoggedIn,isAdmin(roleADM), catchAsync(async (req, res) => {
  const { id } = req.params;
  const { codigo, nombre, cantidad, marca, precioMinorista, precioMayorista, precioCosto, categoria, peso, fechaDeVencimiento, impuestoAplicado} = req.body
  
  // ========== VALIDACIONES PREVIAS ==========
  
  // Validar existencia del producto
  const productoExistente = await Producto.findById(id);
  if (!productoExistente) {
    return res.status(404).json({ 
      success: false, 
      message: 'Producto no encontrado' 
    });
  }

  // Validar cantidad
  if (cantidad !== undefined && cantidad !== null) {
    if (isNaN(cantidad) || parseInt(cantidad) < 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'La cantidad debe ser un número mayor o igual a 0' 
      });
    }
  }

  // Validar categoría
  if (!categoria || categoria.trim() === '') {
    return res.status(400).json({ 
      success: false, 
      message: 'La categoría es requerida' 
    });
  }

  // Validar impuesto
  if (impuestoAplicado !== undefined && impuestoAplicado !== null) {
    const impuestosValidos = ['0', '8', '21', '35'];
    if (!impuestosValidos.includes(impuestoAplicado.toString())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Impuesto inválido. Valores aceptados: 0, 8, 21, 35' 
      });
    }
  }

  const codigoNormalizado = codigo !== undefined && codigo !== null && String(codigo).trim() !== ''
    ? Number(String(codigo).trim())
    : productoExistente.codigo;

  if (!Number.isFinite(codigoNormalizado) || codigoNormalizado <= 0) {
    return res.status(400).json({
      success: false,
      message: 'El código de barras debe ser numérico y válido'
    });
  }

  const codigoDuplicado = await findProductByBarcode(codigoNormalizado, id);

  if (codigoDuplicado) {
    return res.status(400).json({
      success: false,
      message: `El código de barras ${codigoNormalizado} ya está asignado a otro producto`
    });
  }

  // ========== ACTUALIZAR PRODUCTO ==========
  const producto = await Producto.findByIdAndUpdate(id, {
    codigo: codigoNormalizado,
    nombre: nombre || productoExistente.nombre,
    cantidad: cantidad !== undefined ? parseInt(cantidad) : productoExistente.cantidad,
    marca: marca || productoExistente.marca,
    precioMinorista: precioMinorista || productoExistente.precioMinorista,
    precioMayorista: precioMayorista || productoExistente.precioMayorista,
    precioCosto: precioCosto || productoExistente.precioCosto, 
    categoriaInterna: categoria,
    impuestoAplicado: impuestoAplicado || productoExistente.impuestoAplicado,
    fechaDeVencimiento: fechaDeVencimiento || productoExistente.fechaDeVencimiento,
    peso: peso || productoExistente.peso,
  }, { runValidators: true, new: true });

  // ========== RESPUESTA EXITOSA ==========
  res.json({
    success: true,
    nombre: producto.nombre,
    message: `✅ Producto "${producto.nombre}" actualizado correctamente`
  });
}))

// ==================================================
// UPDATE: EDITAR PRECIO MINORISTA
// ==================================================
router.put('/:id/precmin',isLoggedIn,isAdmin(roleADM), catchAsync(async (req, res) => {
  const { id } = req.params;
  const { precioMinorista } = req.body;

  // Validar que el precio sea un número positivo
  if (!precioMinorista || isNaN(precioMinorista) || precioMinorista < 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Precio minorista inválido' 
    });
  }

  const producto = await Producto.findByIdAndUpdate(id, {
    precioMinorista: parseFloat(precioMinorista)
  }, { runValidators: true, new: true });

  if (!producto) {
    return res.status(404).json({ 
      success: false, 
      message: 'Producto no encontrado' 
    });
  }

  res.json({
    success: true,
    message: 'Precio minorista actualizado',
    data: producto
  });
}))

// ==================================================
// UPDATE: EDITAR PRECIO MAYORISTA
// ==================================================
router.put('/:id/precmay',isLoggedIn,isAdmin(roleADM), catchAsync(async (req, res) => {
  const { id } = req.params;
  const { precioMayorista } = req.body;

  // Validar que el precio sea un número positivo
  if (!precioMayorista || isNaN(precioMayorista) || precioMayorista < 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Precio mayorista inválido' 
    });
  }

  const producto = await Producto.findByIdAndUpdate(id, {
    precioMayorista: parseFloat(precioMayorista)
  }, { runValidators: true, new: true });

  if (!producto) {
    return res.status(404).json({ 
      success: false, 
      message: 'Producto no encontrado' 
    });
  }

  res.json({
    success: true,
    message: 'Precio mayorista actualizado',
    data: producto
  });
}))

// ==================================================
// UPDATE: EDITAR PRECIO COSTO
// ==================================================
router.put('/:id/preccos',isLoggedIn,isAdmin(roleADM), catchAsync(async (req, res) => {
  const { id } = req.params;
  const { precioCosto } = req.body;

  // Validar que el precio sea un número positivo
  if (!precioCosto || isNaN(precioCosto) || precioCosto < 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Precio costo inválido' 
    });
  }

  const producto = await Producto.findByIdAndUpdate(id, {
    precioCosto: parseFloat(precioCosto)
  }, { runValidators: true, new: true });

  if (!producto) {
    return res.status(404).json({ 
      success: false, 
      message: 'Producto no encontrado' 
    });
  }

  res.json({
    success: true,
    message: 'Precio costo actualizado',
    data: producto
  });
}))

// ==================================================
// DELETE: BORRAR PRODUCTO
// ==================================================
router.delete('/:id',isLoggedIn,isAdmin(roleADM), catchAsync(async (req, res) => {
  const { id } = req.params;
  const deletedProducto = await Producto.findByIdAndDelete(id);
  if (!deletedProducto) {
    req.flash('error', 'No se puede eliminar el producto');
    return res.redirect('/administrador/productos');
  }
  res.redirect('/administrador/productos');
}))

module.exports = router;
