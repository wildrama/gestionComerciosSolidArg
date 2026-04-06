const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAdmin } = require('../middleware');
const EstacionDeCobro = require('../models/estaciondecobro');
const User = require('../models/usuario');
const passport = require('passport');

const roleADM = 'ADMINISTRADOR';

async function ensurePrimaryCashStation() {
  let estacionPrincipal = await EstacionDeCobro.findOne({
    ubicacionDeEstacion: { $regex: /^CAJA 1$/i }
  });

  if (estacionPrincipal) {
    if (estacionPrincipal.isActive !== 'SI') {
      estacionPrincipal.isActive = 'SI';
      await estacionPrincipal.save();
    }
    return estacionPrincipal;
  }

  const primeraEstacion = await EstacionDeCobro.findOne({}).sort({ createdAt: 1 });

  if (primeraEstacion) {
    primeraEstacion.ubicacionDeEstacion = 'CAJA 1';
    primeraEstacion.isActive = 'SI';

    if (!Number.isFinite(Number(primeraEstacion.dineroEnEstacion))) {
      primeraEstacion.dineroEnEstacion = Number(primeraEstacion.dineroDeInicio || 0);
    }

    await primeraEstacion.save();
    return primeraEstacion;
  }

  return EstacionDeCobro.create({
    ubicacionDeEstacion: 'CAJA 1',
    dineroDeInicio: 0,
    dineroEnEstacion: 0,
    isActive: 'SI'
  });
}


router.get('/administrador', isLoggedIn, isAdmin(roleADM), async (req, res) => {
  res.render('adminicio');
});

router.get('/ingreso-administrador', async (req, res) => {
  res.redirect('/ingresar?panel=ADMINISTRADOR');
});

router.get('/ingreso-repartidor', async (req, res) => {
  req.flash('error', 'El módulo de repartidores fue retirado de esta versión.');
  res.redirect('/');
});


//   ingreso a caja
router.get('/ingreso-caja', catchAsync(async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.redirect('/ingresar?panel=CAJA');
    }

    if (req.user?.funcion !== 'CAJA') {
      req.flash('error', 'El acceso a caja está reservado para el usuario CAJA.');
      return res.redirect('/administrador');
    }

    const estacionPrincipal = await ensurePrimaryCashStation();
    return res.redirect(`/caja/${estacionPrincipal._id}/inicio`);
  } catch (error) {
    req.flash('error', 'No se pudo abrir la caja principal.');
    res.redirect('/');
  }
}));

router.get('/ingreso-caja/:id/login', catchAsync(async (req, res) => {
  if (req.isAuthenticated() && req.user?.funcion !== 'CAJA') {
    req.flash('error', 'El acceso a caja está reservado para el usuario CAJA.');
    return res.redirect('/administrador');
  }

  const estacionDeCobroId = req.params.id;
  const estacionDeCobro = await EstacionDeCobro.findById(estacionDeCobroId);

  if (!estacionDeCobro) {
    req.flash('error', 'La estación de cobro no existe.');
    return res.redirect('/ingreso-caja');
  }

  const nombreEstacion = estacionDeCobro.ubicacionDeEstacion;
  res.render('ingresoCaja', { estacionDeCobroId, nombreEstacion });
}));

// post del ingreso del usuario
router.post('/ingreso-caja/:id/login', (req, res, next) => {
  const estacionDeCobroId = req.params.id;
  const remember = req.body.remember;

  passport.authenticate('local', async (err, authenticatedUser, info) => {
    if (err) {
      req.flash('error', 'Error interno al iniciar sesión en caja.');
      return res.redirect(`/ingreso-caja/${estacionDeCobroId}/login`);
    }

    if (!authenticatedUser) {
      req.flash('error', info?.message || 'Usuario o contraseña incorrectos');
      return res.redirect(`/ingreso-caja/${estacionDeCobroId}/login`);
    }

    if (authenticatedUser.funcion !== 'CAJA') {
      req.flash('error', 'Solo el usuario CAJA puede ingresar a esta estación.');
      return res.redirect(`/ingreso-caja/${estacionDeCobroId}/login`);
    }

    req.logIn(authenticatedUser, async (loginError) => {
      if (loginError) {
        req.flash('error', 'No se pudo crear la sesión de caja.');
        return res.redirect(`/ingreso-caja/${estacionDeCobroId}/login`);
      }

      const sessionToken = crypto.randomUUID();
      req.session.userSessionToken = sessionToken;
      req.session.loginPanel = 'CAJA';

      await User.findByIdAndUpdate(authenticatedUser._id, {
        activeSessionToken: sessionToken,
        lastLoginAt: new Date()
      });

      if (remember === 'on') {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
      } else {
        req.session.cookie.expires = false;
        req.session.cookie.maxAge = null;
      }

      const nombreUser = authenticatedUser.username;
      const fechaDeLogeoEnEstación = Date.now();

      try {
        const checkearSiExisteCaja = await EstacionDeCobro.findByIdAndUpdate(
          estacionDeCobroId,
          { $push: { historialDeUsuarios: { nombreUser, fechaDeLogeoEnEstación } } }
        ).exec();

        if (!checkearSiExisteCaja) {
          req.flash('error', 'La estación seleccionada ya no está disponible.');
          return res.redirect('/ingreso-caja');
        }

        return res.redirect(`/caja/${checkearSiExisteCaja._id}/inicio`);
      } catch (error) {
        req.flash('error', 'Intenta de nuevo.');
        return res.redirect('/ingreso-caja');
      }
    });
  })(req, res, next);
});




module.exports = router;
