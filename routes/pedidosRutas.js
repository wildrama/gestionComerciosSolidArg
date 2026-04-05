const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAdmin, isCaja } = require('../middleware');
const Pedido = require('../models/pedidosRepartidor');
const Cliente = require('../models/clientes');
const Producto = require('../models/productos');
const Usuario = require('../models/usuario');




const roleADM = 'ADMINISTRADOR';
const roleCaja = 'CAJA';

// isLoggedIn,isAdmin(roleADM),
// 

router.get('/pedidos-repartidor',catchAsync(async (req,res)=>{
    const usuario = req.user.funcion;
    res.render('pedidos/pedidoIndx',{usuario});
}))
// crear pedido
router.get('/crear-pedido', catchAsync(async(req,res)=>{
    const clientesActuales = await Cliente.find({})
    const fechaHoy = Date.now();
    const idRepartidorActual = req.user;
    const usuario = req.user.funcion;

    res.render('pedidos/crearPedido',{usuario,clientesActuales,fechaHoy,idRepartidorActual});
}));
router.get('/crear-pedido/b', catchAsync(async(req,res)=>{

    req.flash('success','Pedido realizo correctamente')
    res.redirect(`/pedidos/crear-pedido`)
}));
router.post('/crear-pedido',catchAsync(async(req,res)=>{
    const nuevoPedido = new Pedido(req.body.nuevoPedido);
    await nuevoPedido.save()
    req.flash('success','Nuevo pedido realizo correctamente')
    res.redirect(`/pedidos/${nuevoProducto._id}/ver-pedido`)



}))
// isAdmin(roleADM),
// RENDER VER TABLA DE STOCK
router.get('/stockMayorista',isLoggedIn , catchAsync(async (req, res) => {
    const busqueda = req.params.busquedaStock
     console.log(req.user.funcion)
     const productos = await Producto.find({});
    //  const cantidadTotalDeProductos = await Producto.countDocuments({}).exec();
     res.render('pedidos/productosStock', { productos});
    
    
    
 }))
// mostrar todos los pedidos realizados por un usuario en particular
router.get('/panel-pedidos/:id',isLoggedIn , catchAsync(async (req, res) => {
    // const busqueda = req.body.busqueda
    const idUsuario = req.params.id;
     const pedidos = await Pedido.find({usuarioRepartidor:idUsuario});
     const cantidadTotalDePedidos = await Pedido.countDocuments({usuarioRepartidor:idUsuario}).exec();
     res.render('pedidos/verPedidoIndividual', { pedidos, cantidadTotalDePedidos });
  
 
 
 }))
 router.get('/:id/ver-pedido',isLoggedIn , catchAsync(async (req, res) => {
    // const busqueda = req.body.busqueda
    const idUsuario = req.params.id;
     const pedidoIndividual = await Pedido.findById(idUsuario).populate('cliente');;
     res.render('pedidos/verPedidoIndividual', { pedidoIndividual });
     
 
 
 }))
//mostrar todos los pedidos realizados

router.get('/pedidos-todos',isLoggedIn , catchAsync(async (req, res) => {
    // const busqueda = req.body.busqueda
     console.log('TODOS LOS PEDIDOS')
     const repartidor = req.user;
     const pedidos = await Pedido.find({}).populate('cliente').exec();
     const cantidadTotalDePedido = await Pedido.countDocuments({});
     for(let ped of pedidos){
        console.log(cantidadTotalDePedido+ped)

     }
     res.render('pedidos/verTodosLosPedidos', { pedidos, cantidadTotalDePedido,repartidor });
    
    
    
 }))
 router.get('/todos-axios', catchAsync(async (req, res) => {
    try {
           // const busqueda = req.body.busqueda
     console.log('TODOS LOS PEDIDOS')
     const pedidos = await Pedido.find({}).populate('cliente').exec();
    // const fechaRegistroPedido = Date.now()
     res.send( pedidos );
    
    } catch (error) {
        res.send( error );

    }
 
    
    
 }))
 router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const eliminarPedido = await Pedido.findByIdAndDelete(id);
    if (!eliminarPedido) {
      req.flash('error', 'No se puede eliminar pedido');
      return res.redirect('/pedidos/pedidos-todos');
  }
  req.flash('success', 'Pedido Eliminado');

    res.redirect('/pedidos/pedidos-todos');
    
  }))
//  buscar productos para el pedido


router.get('/buscar-productos', catchAsync(async (req, res) => {
    const inputData = req.query.busqueda;
     console.log(req.query.busqueda)
     try {
  
        const busquedaRealizada = await Producto.find({
           $or:[
             {nombre:{$regex: inputData, $options : 'i'}},
             {marca:{$regex: inputData, $options : 'i'}}
            
           ]
             });
  
  
             console.log(busquedaRealizada);
             res.json(busquedaRealizada);
  
    } catch (error) {
        res.send(error)
    }
    //  const cantidadTotalDePedido = await Pedidos.countDocuments({}).exec();
    //  res.render('stock/verStock', { pedidos, cantidadTotalDePedido });
    
//  res.send(busquedaRealizada)
 
 }))
// post del pedido

router.post('/save-pedido', catchAsync(async(req,res)=>{
    console.log(req.body)
    const nuevoPedido = new Pedido(req.body);
    await nuevoPedido.save()
    req.flash('success','Nuevo pedido realizo correctamente')
    console.log(nuevoPedido)
    
    // res.redirect(`/pedidos/${nuevoProducto._id}`)
    res.redirect('/pedidos/crear-pedido');
}))

// editar un pedido en especifico

router.get('/:id/editar-pedido',isLoggedIn , catchAsync(async (req, res) => {
    // const busqueda = req.body.busqueda
    const idPedido = req.params.id;
     const pedidoIndividual = await Pedido.findById(idPedido).populate('cliente');;
     res.render('pedidos/editarPedidoIndividual', { pedidoIndividual });
     
 
 
 }))
 router.get('/:id/traer-pedido',isLoggedIn , catchAsync(async (req, res) => {
    // const busqueda = req.body.busqueda
    const idPedido = req.params.id;
     const pedidoIndividual = await Pedido.findById(idPedido).populate('cliente');;
     res.json(pedidoIndividual);
     
 
 
 }))

router.post('/:id/editar-pedido',isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const { cliente,productosPedidos, productosPedidosNombre,estadoDePedido, archivar, cantidadDeProductos, importeTotal} = req.body
    const pedidoActualizar = await Pedido.findByIdAndUpdate(id, {
        cliente: cliente,
        productosPedidos:productosPedidos,
        productosPedidosNombre: productosPedidosNombre,
        estadoDePedido: estadoDePedido,
        archivar: archivar,
        cantidadDeProductos: cantidadDeProductos, 
        importeTotal: importeTotal,

    },
{ runValidators: true });
res.json(pedidoActualizar)	

    if (!pedidoActualizar) {
      req.flash('error', 'No se puede encontrar editar el pedido');
      return res.redirect('/pedidos/pedidios-todos');
  }  
}))


// marcar como "ENTREGADO" a un pedido


// imprimir Pedido

// router.get('/pedidos/stockMayorista', catchAsync(async(res,res)=>{
//     const todosLosPedidos = await Pedido.find({})
//     console.log(todosLosPedidos)

//     res.render('pedidos/verTodosLosPedidos')
// }))
module.exports = router;