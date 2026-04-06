const express = require('express');
const router = express.Router();
const catchAsync =require('../utils/catchAsync');
// const {isLoggedIn} = require('../middleware');
const Producto = require('../models/productos');
const Venta = require('../models/ventas');

const { isLoggedIn, isAdmin } = require('../middleware');

const roleADM = 'ADMINISTRADOR';


// isCaja(rolecAJA)
// isCaja(rolecAJA)
// isCaja(rolecAJA)

// READ PRODUCT {


// RENDER VER TABLA DE STOCK
router.get('/', isLoggedIn, isAdmin(roleADM), async (req, res) => {

  res.render('caja/cajainicio');

})
router.get('/cajacobro', isLoggedIn, isAdmin(roleADM), async (req, res) => {

  res.render('caja/cajacobro');

})




router.post('/buscar', isLoggedIn, isAdmin(roleADM), async (req, res) => {
  try {
    const codigo = req.body.codigo;
    console.log(codigo);
     const producto = await Producto.findOne({codigo: codigo });
    res.json(producto);    
  } catch (error) {
      res.send('error')
  } 


})

router.post('/finalizar-compra', isLoggedIn, isAdmin(roleADM), async (req, res) => {
    const {compraFinalizada} = req.body;
    const producto = await Producto.findOne({codigo: codigoInput})
    
    res.json(producto);
        
  })
// }


// ENVIAR DATOS DEL FORMULARIO A LA BBDD

router.post('/',isLoggedIn, isAdmin(roleADM), catchAsync( async (req,res)=>{
 const nuevoProducto = new Producto (req.body);
 await nuevoProducto.save();
  res.redirect(`/administrador/productos/${nuevoProducto._id}`)
} ))

// }




module.exports = router;
