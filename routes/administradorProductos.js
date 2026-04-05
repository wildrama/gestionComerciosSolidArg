const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn,isAdmin} = require('../middleware');
const Producto = require('../models/productos');

const roleADM = 'ADMINISTRADOR';

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
   const busqueda = req.body.busqueda
    console.log(req.user.funcion)
    const productos = await Producto.find({});
    const cantidadTotalDeProductos = await Producto.countDocuments({}).exec();
    res.render('stock/verStock', { productos, cantidadTotalDeProductos });
}))

// ==================================================
// CREATE: FORMULARIO Y GUARDAR NUEVO PRODUCTO
// ==================================================
router.get('/nuevo', isLoggedIn,isAdmin(roleADM), (req, res) => {
  console.log(req.user, 'req.user....');
  res.render('stock/cargaStock');
})

router.post('/',isLoggedIn,isAdmin(roleADM), catchAsync(async (req, res) => {
  const nuevoProducto = new Producto(req.body);
  await nuevoProducto.save();
  req.flash('success', 'Producto cargado correctamente correctamente');
  res.redirect(`/administrador/productos/${nuevoProducto._id}`)
}))

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

  // ========== ACTUALIZAR PRODUCTO ==========
  const producto = await Producto.findByIdAndUpdate(id, {
    codigo: codigo || productoExistente.codigo,
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
