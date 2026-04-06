const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAdmin } = require('../middleware');
const User = require('../models/usuario');


const passport = require('passport');
const roleADM = 'ADMINISTRADOR';
const allowedVisibleRoles = ['ADMINISTRADOR', 'CAJA'];

router.use(isLoggedIn, isAdmin(roleADM));

// mostrar todos los usuarios
router.get('/', catchAsync(async(req,res)=>{
  console.log(req.user.funcion);
  const filtroUsuarios = { funcion: { $in: allowedVisibleRoles } };
  const usuariosTotales = await User.find(filtroUsuarios).sort({ username: 1 });
  const cantidadDeUsuarios = await User.countDocuments(filtroUsuarios).exec();
  console.log(usuariosTotales)
    res.render('panelUsuarios/todosLosUsuarios',{usuariosTotales, cantidadDeUsuarios})
}))

// Render AGREGAR USER FORM
router.get('/nuevousuario', (req,res)=>{
  res.render('panelUsuarios/registrarUsuario')
})

// router.get('/test', (req,res)=>{
//   const fecha = Date();
//   const newFecha= new Date();
//   const isoDate = new Date().toISOString()
//   console.log( fecha)
//   console.log( newFecha)
//   console.log(isoDate)
// })
router.post('/nuevousuario', catchAsync(async(req,res)=>{

  try {
      const { funcion, username, password } = req.body;

      if (!allowedVisibleRoles.includes(funcion)) {
        req.flash('error', 'En esta versión solo se permiten usuarios ADMINISTRADOR o CAJA.');
        return res.redirect('/administrador/userpanel/nuevousuario');
      }
    
      const user = new User({username, funcion});
      const usuarioRegistrado = await User.register(user,password);
      console.log(usuarioRegistrado)
      req.flash('success', 'Usuario Creado');
       res.redirect(`/administrador/userpanel/${usuarioRegistrado._id}`);
  } catch (e) {
      const errorRegisterMSG = 'Ya existe un usuario con ese nombre'
      req.flash('error', errorRegisterMSG);
      res.redirect('/administrador/userpanel/nuevousuario');
  }
 
}));

router.get('/:id', catchAsync(async (req,res)=>{

 try{ 
  const  {id}  = req.params;

  const usuarioIndividual = await User.findById(id);
    console.log('usuario esss', usuarioIndividual);
    res.render('panelUsuarios/usuarioIndividual',{usuarioIndividual} );

  }catch (error){
   res.render('errors', error)
 }
}));

router.get('/:id/edit', catchAsync(async (req,res)=>{

  try {
    const {id} = req.params;

  const usuarioIndividual = await User.findById(id);
console.log('edit user')
  res.render('panelUsuarios/verUsuario', {usuarioIndividual})
 } catch (error) {
   res.render('errors', error)
 } 
}));

// isLoggedIn,isAdmin(roleADM),

router.delete('/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  const eliminarUsuario = await User.findByIdAndDelete(id);
  if (!eliminarUsuario) {
    req.flash('error', 'No se puede eliminar el usuario');
    return res.redirect('/administrador/userpanel');
}
  res.redirect('/administrador/userpanel');
}))

module.exports = router;
