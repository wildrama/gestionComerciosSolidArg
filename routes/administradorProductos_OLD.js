const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn,isAdmin} = require('../middleware');
const Producto = require('../models/productos');




const roleADM = 'ADMINISTRADOR';


// RENDER VER TABLA DE STOCK
router.get('/',isLoggedIn ,isAdmin(roleADM), catchAsync(async (req, res) => {
   const busqueda = req.body.busqueda
    console.log(req.user.funcion)
    const productos = await Producto.find({});
    const cantidadTotalDeProductos = await Producto.countDocuments({}).exec();
    res.render('stock/verStock', { productos, cantidadTotalDeProductos });
 


}))
// }

//  CREATE {
// RENDER FORMULARIO DE CARGA DE STOCK

router.get('/nuevo', isLoggedIn,isAdmin(roleADM), (req, res) => {
  console.log(req.user, 'req.user....');

  res.render('stock/cargaStock');
})
// ENVIAR DATOS DEL FORMULARIO A LA BBDD

router.post('/',isLoggedIn,isAdmin(roleADM), catchAsync(async (req, res) => {
  const nuevoProducto = new Producto(req.body);
  await nuevoProducto.save();
  req.flash('success', 'Producto cargado correctamente correctamente');

  res.redirect(`/administrador/productos/${nuevoProducto._id}`)
}))

// }


// UPDATE {

// VER DETALLE DEL PRODUCTO (Read-only)
router.get('/:id',isLoggedIn,isAdmin(roleADM),catchAsync(async (req, res) => {
  const { id } = req.params;
  const producto = await Producto.findById(id)
  if (!producto) {
    req.flash('error', 'No se puede encontrar el producto');
    return res.redirect('/administrador/productos');
  }
  res.render('stock/stockIndividual', { producto });
}))

// EDITAR STOCK DEL PRODUCTO
router.get('/:id/upstock', isLoggedIn,isAdmin(roleADM),catchAsync(async (req, res) => {
  const {id} = req.params;
  const producto = await Producto.findById(id)
  if (!producto) {
    req.flash('error', 'Producto no encontrado');
    return res.redirect('/administrador/productos');
  }
  res.render('edit/editResponsive.ejs', {producto})
}))

// EDITAR PRECIOS DEL PRODUCTO
router.get('/:id/upstockprecio', isLoggedIn,isAdmin(roleADM),catchAsync(async (req, res) => {
  const {id} = req.params;
  const producto = await Producto.findById(id)
  if (!producto) {
    req.flash('error', 'Producto no encontrado');
    return res.redirect('/administrador/productos');
  }
  res.render('edit/editPrecio.ejs', {producto})
}))

// Renderizar formulario de edición del producto (DEPRECATED - usar /upstock)
router.get('/:id/edit',isLoggedIn, isAdmin(roleADM), catchAsync(async (req, res) => {
  const { id } = req.params;
  const producto = await Producto.findById(id);
  if (!producto) {
    req.flash('error', 'No se puede encontrar este producto');
    return res.redirect('/administrador/productos');
  }
  // Redirigir a la nueva ruta de edición de stock
  return res.redirect(`/administrador/productos/${id}/upstock`);
}))




// ACTUALIZAR PRODUCTO COMPLETO
router.put('/:id',isLoggedIn,isAdmin(roleADM), catchAsync(async (req, res) => {
  const { id } = req.params;
  const { nombre, cantidad, marca, precioMinorista, precioMayorista, precioCosto, categoria, peso, fechaDeVencimiento, impuestoAplicado} = req.body
  
  const producto = await Producto.findByIdAndUpdate(id, {
    nombre: nombre,
    cantidad: cantidad,
    marca: marca,
    precioMinorista: precioMinorista,
    precioMayorista: precioMayorista,
    precioCosto: precioCosto, 
    categoriaInterna: categoria,
    impuestoAplicado: impuestoAplicado,
    fechaDeVencimiento: fechaDeVencimiento,
    peso: peso,
  }, { runValidators: true, new: true });

  if (!producto) {
    req.flash('error', 'No se puede encontrar el producto para editar');
    return res.redirect('/administrador/productos');
  }

  req.flash('success', `✅ Producto "${producto.nombre}" actualizado correctamente`);
  res.redirect(`/administrador/productos/${producto._id}/upstock`);
}))

// ACTUALIZAR PRECIO MINORISTA (RUTAS ESPECÍFICAS ANTES DE RUTAS GENÉRICAS)
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

// ACTUALIZAR PRECIO MAYORISTA
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

// ACTUALIZAR PRECIO COSTO
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

// BORRAR PRODUCTO
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

//


// ENVIAR PUT REQUEST PRECIO




router.put('/precmin/:id',isLoggedIn,isAdmin(roleADM), catchAsync(async (req, res) => {
  const { id } = req.params;
  const {precioMinorista} = req.body
  const producto = await Producto.findByIdAndUpdate(id, {
	  precioMinorista: precioMinorista
  },
		{ runValidators: true });

             res.json(producto)

  if (!producto) {
    req.flash('error', 'No se puede encontrar editar el producto');
     res.redirect('/administrador/productos');
}
 

}))



//


//


// ENVIAR PUT REQUEST PRECIO




router.put('/precmay/:id',isLoggedIn,isAdmin(roleADM), catchAsync(async (req, res) => {
  const { id } = req.params;
  const {precioMayorista} = req.body
  const producto = await Producto.findByIdAndUpdate(id, {
	  precioMayorista: precioMayorista
  },
		{ runValidators: true });

             res.json(producto)

  if (!producto) {
    req.flash('error', 'No se puede encontrar editar el producto');
    return res.redirect('/administrador/productos');
}
 

}))



//



//


// ENVIAR PUT REQUEST PRECIO




router.put('/preccos/:id',isLoggedIn,isAdmin(roleADM), catchAsync(async (req, res) => {
  const { id } = req.params;
  const {precioCosto} = req.body
  const producto = await Producto.findByIdAndUpdate(id, {
	  precioCosto: precioCosto
  },
		{ runValidators: true });
             res.json(producto)

  if (!producto) {
    req.flash('error', 'No se puede encontrar editar el producto');
    return res.redirect('/administrador/productos');
}
 

}))



//





// }


//EDITAR STOCK INDIVIDUAL

router.get('/:id/upstock', isLoggedIn,isAdmin(roleADM),catchAsync(async (req, res) => {
  const {id} = req.params;
	const producto = await Producto.findById(id)
	if (!producto) {
		
	}
  res.render('edit/editResponsive.ejs', {producto})
}))

router.get('/:id/upstockprecio', isLoggedIn,isAdmin(roleADM),catchAsync(async (req, res) => {
  const {id} = req.params;
	const producto = await Producto.findById(id)
	if (!producto) {
		
	}
  res.render('edit/editPrecio.ejs', {producto})
}))

// RENDER STOCK INDIVIDUAL
router.get('/:id', isLoggedIn,isAdmin(roleADM),catchAsync(async (req, res) => {
  
  const { id } = req.params;
  const producto = await Producto.findById(id)
  if (!producto) {
    req.flash('error', 'No se puede encontrar el producto');
    return res.redirect('/administrador/productos');
}
  res.render('stock/stockIndividual', { producto });
}))


// BORRAR STOCK INDIVIDUAL

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
