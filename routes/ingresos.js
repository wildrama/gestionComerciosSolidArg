const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn,logAdmin,logCaja} = require('../middleware');
const EstacionDeCobro = require('../models/estaciondecobro');
const User = require('../models/usuario');

const passport = require('passport');


router.get('/administrador', isLoggedIn, async (req, res) => {
    
    res.render('adminicio');
    
  });

 
  router.get('/ingreso-administrador', async(req,res)=>{
    res.render('home');
  });
  
  router.get('/ingreso-repartidor', async(req,res)=>{
    res.render('ingresoRepartidor');
  });


//   ingreso a caja
  router.get('/ingreso-caja',catchAsync( async(req,res)=>{
      try {
        // const sesionDeUsuario = req.user;
        const estacionesDeCobro = await EstacionDeCobro.find({});

        res.render('inicioCajas',{estacionesDeCobro});
      } catch (error) {
        req.flash('error','No hay cajas activas');
          res.redirect('/');
      }
      

  }));
  router.get('/ingreso-caja/:id/login',catchAsync( async(req,res)=>{
    const estacionDeCobroId = req.params.id;
    const estacionDeCobro = await EstacionDeCobro.findById(estacionDeCobroId);
    const nombreEstacion = estacionDeCobro.ubicacionDeEstacion;
    res.render('ingresoCaja',{estacionDeCobroId,nombreEstacion});

  }));
// post del ingreso del usuario
  router.post('/ingreso-caja/:id/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/ingreso-caja' }),async (req, res) => {
    const estacionDeCobroId = req.params.id;
    const nombreUser = req.user.username;

        const fechaDeLogeoEnEstación = Date.now();
       try {
        
        
        const checkearSiExisteCaja = await EstacionDeCobro.findByIdAndUpdate(estacionDeCobroId,{$push:{historialDeUsuarios:{nombreUser:nombreUser,fechaDeLogeoEnEstación:fechaDeLogeoEnEstación}}}).exec();
        
        res.redirect(`/caja/${checkearSiExisteCaja._id}/inicio`);
        
    } catch (error) {
      req.flash('error', 'IntentaR de nuevo');
        res.redirect('/ingreso-caja');
    }
    
    
    })




module.exports = router;
