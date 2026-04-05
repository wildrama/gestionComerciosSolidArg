const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAdmin, isCaja } = require('../middleware');
const Pedido = require('../models/pedidosRepartidor');
const Cliente = require('../models/clientes');

// const RoleRep = "REPARTIDOR";
// isAdmin(roleADM),

// render index clientes 

router.get('/clientes-index', isLoggedIn, catchAsync(async (req, res) => {
    const usuario = req.user.funcion;
     
     res.render('clientes/clientesIndex',{usuario});
   }))
 
// render formulario para agregar cliente

router.get('/agregar-cliente', isLoggedIn, catchAsync(async (req, res) => {
   const usuario = req.user.funcion;
    
    res.render('clientes/agregarCliente',{usuario});
  }))

// agregar cliente a la bbdd
router.post('/agregar-cliente',catchAsync(async(req,res)=>{
    const nuevoCliente = new Cliente(req.body);
    await nuevoCliente.save();
    console.log(nuevoCliente);
    req.flash('success','Nuevo cliente agregardo correctamente')
    res.redirect(`/clientes/${nuevoCliente._id}`)



}))


// ver Todos los clientes de ser necesario
router.get('/ver-clientes', catchAsync(async(req,res)=>{

    try {

        const todosLosClientes = await Cliente.find({});

        res.render('clientes/verTodosLosClientes',{todosLosClientes});

    } catch (error) {
        console.log(error)
        res.redirect('/clientes/clientes-index');
    }
 
}))

// ver cliente individual

router.get('/:id', catchAsync(async(req,res)=>{
    const idCliente = req.params.id;
    try {
    const clienteIndividual = await Cliente.findById(idCliente).populate('pedidosRealizados');
    res.render('clientes/clienteIndividual',{clienteIndividual})


} catch (error) {
    console.log(error)
    res.redirect('/clientes/clientes-index');
}
}))
router.get('/:id/editar-cliente', catchAsync(async(req,res)=>{
    const idCliente = req.params.id;
    try {
    const clienteIndividual = await Cliente.findById(idCliente).populate('pedidosRealizados');
    res.render('clientes/editarCliente',{clienteIndividual})


} catch (error) {
    console.log(error)
    res.redirect('/clientes/clientes-index');
}
}))
// editar info de cliente



// eliminar cliente

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const eliminarCliente = await Cliente.findByIdAndDelete(id);
    if (!eliminarCliente) {
      req.flash('error', 'No se puede eliminar pedido');
      return res.redirect('/clientes/ver-clientes');
  }
  req.flash('success', 'Cliente Eliminado');

    res.redirect('/clientes/ver-clientes');
    
  }))


module.exports = router;