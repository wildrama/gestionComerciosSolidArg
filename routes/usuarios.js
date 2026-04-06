const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn,logAdmin,logCaja} = require('../middleware');
const Producto = require('../models/productos');
const User = require('../models/usuario');
const EstacionDeCobro = require('../models/estaciondecobro');
const passport = require('passport');

const PRIVATE_BOOTSTRAP_ROUTE = process.env.PRIVATE_BOOTSTRAP_ROUTE || '/__solidarg/private/bootstrap/ramiro-40189896/adm-caja-seed-prd-20260405';

const PROD_SEED_PRODUCTS = [
  {
    codigo: 401898961,
    nombre: 'Yerba Mate Suave 1kg',
    cantidad: 40,
    marca: 'Playadito',
    categoriaInterna: 'yerba',
    peso: '1kg',
    precioMinorista: 5200,
    precioMayorista: 4700,
    precioCosto: 3900,
    impuestoAplicado: '21'
  },
  {
    codigo: 401898962,
    nombre: 'Azucar Blanca 1kg',
    cantidad: 60,
    marca: 'Ledesma',
    categoriaInterna: 'azucar',
    peso: '1kg',
    precioMinorista: 1450,
    precioMayorista: 1300,
    precioCosto: 980,
    impuestoAplicado: '21'
  },
  {
    codigo: 401898963,
    nombre: 'Aceite de Girasol 900ml',
    cantidad: 50,
    marca: 'Cocinero',
    categoriaInterna: 'aceite/vinagre',
    peso: '900ml',
    precioMinorista: 3100,
    precioMayorista: 2850,
    precioCosto: 2350,
    impuestoAplicado: '21'
  },
  {
    codigo: 401898964,
    nombre: 'Arroz Largo Fino 1kg',
    cantidad: 70,
    marca: 'Gallo',
    categoriaInterna: 'arroz',
    peso: '1kg',
    precioMinorista: 1800,
    precioMayorista: 1600,
    precioCosto: 1250,
    impuestoAplicado: '21'
  },
  {
    codigo: 401898965,
    nombre: 'Fideos Spaghetti 500g',
    cantidad: 90,
    marca: 'Matarazzo',
    categoriaInterna: 'fideos',
    peso: '500g',
    precioMinorista: 1200,
    precioMayorista: 1050,
    precioCosto: 790,
    impuestoAplicado: '21'
  },
  {
    codigo: 401898966,
    nombre: 'Galletitas Dulces 400g',
    cantidad: 55,
    marca: 'Terrabusi',
    categoriaInterna: 'galletitas',
    peso: '400g',
    precioMinorista: 1650,
    precioMayorista: 1450,
    precioCosto: 1100,
    impuestoAplicado: '21'
  },
  {
    codigo: 401898967,
    nombre: 'Lavandina 1L',
    cantidad: 48,
    marca: 'Ayudin',
    categoriaInterna: 'articulos de limpieza',
    peso: '1L',
    precioMinorista: 1350,
    precioMayorista: 1200,
    precioCosto: 900,
    impuestoAplicado: '21'
  },
  {
    codigo: 401898968,
    nombre: 'Jabon de Tocador 3un',
    cantidad: 35,
    marca: 'Dove',
    categoriaInterna: 'higene corporal',
    peso: '3un',
    precioMinorista: 2400,
    precioMayorista: 2200,
    precioCosto: 1750,
    impuestoAplicado: '21'
  },
  {
    codigo: 401898969,
    nombre: 'Gaseosa Cola 2.25L',
    cantidad: 65,
    marca: 'Coca-Cola',
    categoriaInterna: 'bebidas sin alcohol',
    peso: '2.25L',
    precioMinorista: 2800,
    precioMayorista: 2550,
    precioCosto: 2100,
    impuestoAplicado: '21'
  },
  {
    codigo: 401898970,
    nombre: 'Harina Leudante 1kg',
    cantidad: 58,
    marca: 'Pureza',
    categoriaInterna: 'harina',
    peso: '1kg',
    precioMinorista: 1250,
    precioMayorista: 1100,
    precioCosto: 820,
    impuestoAplicado: '21'
  }
];

async function ensureSeedCashStation() {
  let estacion = await EstacionDeCobro.findOne({
    ubicacionDeEstacion: { $regex: /^CAJA 1$/i }
  });

  if (estacion) {
    let changed = false;

    if (estacion.isActive !== 'SI') {
      estacion.isActive = 'SI';
      changed = true;
    }

    if (!Number.isFinite(Number(estacion.dineroDeInicio))) {
      estacion.dineroDeInicio = 0;
      changed = true;
    }

    if (!Number.isFinite(Number(estacion.dineroEnEstacion))) {
      estacion.dineroEnEstacion = Number(estacion.dineroDeInicio) || 0;
      changed = true;
    }

    if (!estacion.estadoCaja) {
      estacion.estadoCaja = 'CERRADA';
      changed = true;
    }

    if (changed) {
      await estacion.save();
    }

    return { estacion, action: changed ? 'updated' : 'kept' };
  }

  estacion = await EstacionDeCobro.create({
    ubicacionDeEstacion: 'CAJA 1',
    dineroDeInicio: 0,
    dineroEnEstacion: 0,
    dineroDeVentasEnEfectivo: 0,
    dineroDeVentasEnOtro: 0,
    comprasRealizadasEnEfectivo: 0,
    comprasRealizadasEnOtro: 0,
    estadoCaja: 'CERRADA',
    aperturaActual: {
      estado: 'CERRADA',
      montoInicial: 0,
      fondoCambio: 0,
      observaciones: 'Caja base generada automáticamente para PRD'
    },
    isActive: 'SI'
  });

  return { estacion, action: 'created' };
}

async function upsertSeedUser({ username, password, funcion, estacionDeCobroAsignada }) {
  const existingUser = await User.findOne({ username });

  if (existingUser) {
    existingUser.funcion = funcion;
    if (estacionDeCobroAsignada) {
      existingUser.estacionDeCobroAsignada = estacionDeCobroAsignada;
    }
    await existingUser.setPassword(password);
    await existingUser.save();
    return { username, funcion, action: 'updated' };
  }

  const user = new User({ username, funcion, estacionDeCobroAsignada });
  await User.register(user, password);
  return { username, funcion, action: 'created' };
}

async function upsertDummyProducts() {
  const results = [];

  for (const product of PROD_SEED_PRODUCTS) {
    const saved = await Producto.findOneAndUpdate(
      { codigo: product.codigo },
      {
        $set: {
          ...product,
          ofertaVigente: false,
          cantidadDeVecesVendido: 0
        }
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    results.push({ codigo: saved.codigo, nombre: saved.nombre });
  }

  return results;
}

// Security modules
const {
  validateLoginCredentials,
  validateUserRegistration,
  RateLimiter,
  LoginAuditor,
  SessionCache
} = require('../utils/loginSecurity');

// Instancias globales
const rateLimiter = new RateLimiter();
const auditor = new LoginAuditor();
const sessionCache = new SessionCache(5 * 60 * 1000); // 5 minutos

router.get(PRIVATE_BOOTSTRAP_ROUTE, catchAsync(async (req, res) => {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'AdmRamiro#40189896';
  const cajaPassword = process.env.SEED_CAJA_PASSWORD || 'CajaRamiro#40189896';

  const { estacion, action: cajaAction } = await ensureSeedCashStation();
  const usuarios = [];

  usuarios.push(await upsertSeedUser({
    username: 'admramiro-40189896',
    password: adminPassword,
    funcion: 'ADMINISTRADOR'
  }));

  usuarios.push(await upsertSeedUser({
    username: 'cajaramiro-40189896',
    password: cajaPassword,
    funcion: 'CAJA',
    estacionDeCobroAsignada: estacion._id
  }));

  const productos = await upsertDummyProducts();

  res.status(200).json({
    ok: true,
    message: 'Bootstrap PRD ejecutado correctamente.',
    rutaPrivada: PRIVATE_BOOTSTRAP_ROUTE,
    admin: {
      username: 'admramiro-40189896',
      password: adminPassword
    },
    caja: {
      username: 'cajaramiro-40189896',
      password: cajaPassword,
      estacion: estacion.ubicacionDeEstacion,
      estacionId: estacion._id
    },
    resumen: {
      usuarios,
      productosDummy: productos.length,
      caja: cajaAction
    }
  });
}));

// crear usuario
 router.get('/registro', catchAsync(async (req, res) => {
  // const user = new User({ funcion: 'CAJA', username: 'caja' })
  // const nuevoUser = await User.register(user, '123456')
  // console.log(user)
  
  // res.send('registrado')
}))




router.get('/ingresar', (req, res) => {
  const panel = String(req.query.panel || 'ADMINISTRADOR').toUpperCase();

  if (req.isAuthenticated && req.isAuthenticated()) {
    if (req.user?.funcion === 'ADMINISTRADOR' && panel === 'ADMINISTRADOR') {
      return res.redirect('/administrador');
    }

    if (req.user?.funcion === 'CAJA' && panel === 'CAJA') {
      return res.redirect('/ingreso-caja');
    }
  }

  res.render('home', { panel });
})

router.post('/ingresar', async (req, res, next) => {
  try {
    const { username, password, remember, panel } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;
    const targetPanel = String(panel || '').toUpperCase();
    const loginRedirect = targetPanel ? `/ingresar?panel=${encodeURIComponent(targetPanel)}` : '/ingresar';

    console.log(`[LOGIN] Intento de login desde ${clientIP} para usuario: ${username}`);

    // 1. VALIDAR ENTRADA
    const validation = validateLoginCredentials(username, password);
    if (!validation.isValid) {
      auditor.logAttempt(clientIP, username, false, 'Validación fallida: ' + validation.errors[0]);
      req.flash('error', validation.errors[0]);
      return res.redirect(loginRedirect);
    }

    // 2. VERIFICAR RATE LIMITING
    const rateLimitCheck = rateLimiter.recordAttempt(clientIP, username);
    if (!rateLimitCheck.allowed) {
      auditor.logAttempt(clientIP, username, false, 'Rate limit excedido');
      req.flash('error', rateLimitCheck.message);
      return res.redirect(loginRedirect);
    }

    console.log(`[LOGIN] Validaciones pasadas. Intentos restantes: ${rateLimitCheck.remaining}`);

    // 3. VERIFICAR CACHÉ DE SESIÓN
    let user = sessionCache.getUser(username);
    if (!user) {
      console.log(`[LOGIN] Usuario no en caché, buscando en BD...`);
      user = await User.findOne({ username });
    } else {
      console.log(`[LOGIN] Usuario obtenido de caché`);
    }

    // 4. USAR PASSPORT PARA AUTENTICAR
    passport.authenticate('local', (err, authenticatedUser, info) => {
      if (err) {
        console.error('[LOGIN ERROR]', err);
        auditor.logAttempt(clientIP, username, false, 'Error interno: ' + err.message);
        req.flash('error', 'Error interno del servidor');
        return res.redirect(loginRedirect);
      }

      if (!authenticatedUser) {
        auditor.logAttempt(clientIP, username, false, info?.message || 'Credenciales inválidas');
        console.log('[LOGIN FAILED]', username, '- Razón:', info?.message || 'Credenciales inválidas');

        req.flash('error', 'Usuario o contraseña incorrectos');
        return res.redirect(loginRedirect);
      }

      if (targetPanel === 'ADMINISTRADOR' && authenticatedUser.funcion !== 'ADMINISTRADOR') {
        auditor.logAttempt(clientIP, username, false, 'Intento de acceso cruzado al panel ADMINISTRADOR');
        req.flash('error', 'Ese usuario no puede ingresar al panel de administración.');
        return res.redirect('/ingresar?panel=ADMINISTRADOR');
      }

      if (targetPanel === 'CAJA' && authenticatedUser.funcion !== 'CAJA') {
        auditor.logAttempt(clientIP, username, false, 'Intento de acceso cruzado al panel CAJA');
        req.flash('error', 'Ese usuario no puede ingresar al panel de caja.');
        return res.redirect('/ingresar?panel=CAJA');
      }

      // LOGIN EXITOSO
      req.logIn(authenticatedUser, async (err) => {
        if (err) {
          console.error('[LOGIN SESSION ERROR]', err);
          req.flash('error', 'Error al crear sesión');
          return res.redirect(loginRedirect);
        }

        rateLimiter.clearAttempts(clientIP, username);

        const sessionToken = crypto.randomUUID();
        req.session.userSessionToken = sessionToken;
        req.session.loginPanel = authenticatedUser.funcion === 'CAJA' ? 'CAJA' : 'ADMINISTRADOR';

        await User.findByIdAndUpdate(authenticatedUser._id, {
          activeSessionToken: sessionToken,
          lastLoginAt: new Date()
        });

        authenticatedUser.activeSessionToken = sessionToken;

        sessionCache.setUser(authenticatedUser._id.toString(), {
          _id: authenticatedUser._id,
          username: authenticatedUser.username,
          funcion: authenticatedUser.funcion,
          activeSessionToken: sessionToken,
          loginTime: new Date(),
          ip: clientIP
        });

        auditor.logAttempt(clientIP, username, true, 'Login exitoso - Rol: ' + authenticatedUser.funcion);
        console.log('[LOGIN SUCCESS] Usuario:', username, 'Rol:', authenticatedUser.funcion);

        if (remember === 'on') {
          req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
          console.log('[LOGIN] Remember Me activado - Sesión: 30 días');
        } else {
          req.session.cookie.expires = false;
          req.session.cookie.maxAge = null;
        }

        if (authenticatedUser.funcion) {
          let role = authenticatedUser.funcion;
          let redirectUrl;

          switch (role) {
            case 'ADMINISTRADOR':
              redirectUrl = req.session.returnTo || '/administrador';
              console.log('[LOGIN REDIRECT] ADMINISTRADOR → ' + redirectUrl);
              break;
            case 'REPARTIDOR':
              redirectUrl = req.session.returnTo || '/';
              console.log('[LOGIN REDIRECT] REPARTIDOR → ' + redirectUrl);
              break;
            case 'CAJA':
              redirectUrl = req.session.returnTo || '/ingreso-caja';
              console.log('[LOGIN REDIRECT] CAJA → ' + redirectUrl);
              break;
            default:
              redirectUrl = req.session.returnTo || '/';
              console.log('[LOGIN REDIRECT] UNKNOWN ROLE → ' + redirectUrl);
          }

          delete req.session.returnTo;
          return res.redirect(redirectUrl);
        }
      });
    })(req, res, next);
  } catch (error) {
    console.error('[LOGIN EXCEPTION]', error);
    auditor.logAttempt(req.ip, req.body.username || 'unknown', false, 'Excepción: ' + error.message);
    req.flash('error', 'Error al procesar login');
    res.redirect('/ingresar');
  }
});


router.get('/cerrar-sesion', (req, res, next) => {
  if (!req.user) {
    return res.redirect('/');
  }
  
  const username = req.user.username;
  const userId = req.user._id?.toString();
  const clientIP = req.ip || req.connection.remoteAddress;
  
  // Logout con callback (nuevo estándar de Passport)
  req.logOut(async (err) => {
    if (err) {
      console.error('[LOGOUT ERROR]', err);
      req.flash('error', 'Error al cerrar sesión');
      return res.redirect('/administrador');
    }
    
    if (userId) {
      sessionCache.invalidateUser(userId);
      await User.findByIdAndUpdate(userId, { activeSessionToken: null });
    }

    req.session.userSessionToken = null;
    
    // AUDITORÍA - LOGOUT
    auditor.logAttempt(clientIP, username, true, 'Logout exitoso');
    console.log('[LOGOUT] Usuario:', username, 'IP:', clientIP);
    
    req.flash('success', 'Sesión cerrada correctamente');
    res.redirect('/');
  });
});

router.post('/repartidorNuevo', isLoggedIn, async(req, res)=>{
  try {
    const { username, password, passwordConfirm } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;
    
    console.log('[CREAR REPARTIDOR] Solicitud de:', req.user.username, 'para usuario:', username);
    
    // SOLO ADMINISTRADORES
    if (req.user.funcion !== 'ADMINISTRADOR') {
      auditor.logAttempt(clientIP, req.user.username, false, 'Intento de crear usuario sin permisos');
      req.flash('error', 'No tiene permisos para crear usuarios');
      return res.redirect('/administrador');
    }
    
    // VALIDAR ENTRADA
    const validation = validateUserRegistration(username, password, passwordConfirm);
    if (!validation.isValid) {
      auditor.logAttempt(clientIP, username, false, 'Validación fallida al crear repartidor: ' + validation.errors[0]);
      req.flash('error', validation.errors[0]);
      return res.redirect('/administrador');
    }
    
    // VERIFICAR SI USUARIO YA EXISTE
    const usuarioExistente = await User.findOne({ username });
    if (usuarioExistente) {
      auditor.logAttempt(clientIP, username, false, 'Usuario ya existe');
      req.flash('error', 'El usuario ya existe');
      return res.redirect('/administrador');
    }
    
    // CREAR USUARIO
    const usuario = new User({
      funcion: 'REPARTIDOR',
      username: username
    });
    
    const nuevoUsuario = await User.register(usuario, password);
    
    // LIMPIAR CACHÉ
    sessionCache.invalidateUser(nuevoUsuario._id.toString());
    
    // AUDITORÍA
    auditor.logAttempt(clientIP, req.user.username, true, 'Repartidor creado: ' + username);
    console.log('[CREAR REPARTIDOR] Éxito - Usuario:', username, 'por Admin:', req.user.username);
    
    req.flash('success', `Repartidor "${username}" creado correctamente`);
    res.redirect('/administrador');
    
  } catch (error) {
    console.error('[CREAR REPARTIDOR ERROR]', error);
    auditor.logAttempt(req.ip, req.body.username || 'unknown', false, 'Error al crear repartidor: ' + error.message);
    req.flash('error', 'Error al crear usuario: ' + error.message);
    res.redirect('/administrador');
  }
})


router.post('/crearAdmin', isLoggedIn, async(req, res)=>{
  try {
    const { username, password, passwordConfirm } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;
    
    console.log('[CREAR ADMIN] Solicitud de:', req.user.username, 'para usuario:', username);
    
    // SOLO ADMINISTRADORES EXISTENTES
    if (req.user.funcion !== 'ADMINISTRADOR') {
      auditor.logAttempt(clientIP, req.user.username, false, 'Intento de crear admin sin permisos');
      req.flash('error', 'No tiene permisos para crear administradores');
      return res.redirect('/administrador');
    }
    
    // VALIDAR ENTRADA
    const validation = validateUserRegistration(username, password, passwordConfirm);
    if (!validation.isValid) {
      auditor.logAttempt(clientIP, username, false, 'Validación fallida al crear admin: ' + validation.errors[0]);
      req.flash('error', validation.errors[0]);
      return res.redirect('/administrador');
    }
    
    // VERIFICAR SI USUARIO YA EXISTE
    const usuarioExistente = await User.findOne({ username });
    if (usuarioExistente) {
      auditor.logAttempt(clientIP, username, false, 'Usuario administrador ya existe');
      req.flash('error', 'El usuario ya existe');
      return res.redirect('/administrador');
    }
    
    // CREAR USUARIO ADMINISTRADOR
    const usuario = new User({
      funcion: 'ADMINISTRADOR',
      username: username
    });
    
    const nuevoUsuario = await User.register(usuario, password);
    
    // LIMPIAR CACHÉ
    sessionCache.invalidateUser(nuevoUsuario._id.toString());
    
    // AUDITORÍA
    auditor.logAttempt(clientIP, req.user.username, true, 'Admin creado: ' + username);
    console.log('[CREAR ADMIN] Éxito - Usuario:', username, 'por Admin:', req.user.username);
    
    req.flash('success', `Administrador "${username}" creado correctamente`);
    res.redirect('/administrador');
    
  } catch (error) {
    console.error('[CREAR ADMIN ERROR]', error);
    auditor.logAttempt(req.ip, req.body.username || 'unknown', false, 'Error al crear admin: ' + error.message);
    req.flash('error', 'Error al crear usuario: ' + error.message);
    res.redirect('/administrador');
  }
})


// app.get('/crearAdmin1', async( req, res)=>{
//   const usuario = new User({funcion:'ADMINISTRADOR', username:'escososa'});
//   const nuevoUsuario = await User.register(usuario,'admescososa2022');

//   console.log(nuevoUsuario);
//   res.send(nuevoUsuario)
// })
// app.get('/crearAdmin2', async( req, res)=>{
//   const usuario = new User({funcion:'ADMINISTRADOR', username:'yaelsosa'});
//   const nuevoUsuario = await User.register(usuario,'admyael2022')

//   console.log(nuevoUsuario);
//   res.send(nuevoUsuario)
// })
// app.get('/crearAdmin3', async( req, res)=>{
//   const usuario = new User({funcion:'ADMINISTRADOR', username:'francososa'});
//   const nuevoUsuario = await User.register(usuario,'admfranco2022')

//   console.log(nuevoUsuario);
//   res.send(nuevoUsuario)
// })

// app.get('/crearCaja4', async( req, res)=>{
//   const usuario = new User({funcion:'CAJA', username:'cajaescososa'});
//   const nuevoUsuario = await User.register(usuario,'cajaescososa2022')

//   console.log(nuevoUsuario);
//   res.send(nuevoUsuario)
// })

// app.get('/crearAdmin2', async( req, res)=>{
//   const usuario = new User({funcion:'ADMINISTRADOR', username:'yaelsosa'});
//   const nuevoUsuario = await User.register(usuario,'admyael2022')

//   console.log(nuevoUsuario);
//   res.send(nuevoUsuario)
// })
// app.get('/crearcaja', async( req, res)=>{
//   const usuario = new User({funcion:'ADMINISTRADOR', username:'123'});
//   const nuevoUsuario = await User.register(usuario,'123')

//   console.log(nuevoUsuario);
//   res.send('nuevoUsuario')
// })


module.exports = router;
