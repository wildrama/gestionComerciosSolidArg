const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn,logAdmin,logCaja} = require('../middleware');
const Producto = require('../models/productos');
const User = require('../models/usuario');
const passport = require('passport');

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
// crear usuario
 router.get('/registro', catchAsync(async (req, res) => {
  // const user = new User({ funcion: 'CAJA', username: 'caja' })
  // const nuevoUser = await User.register(user, '123456')
  // console.log(user)
  
  // res.send('registrado')
}))




router.get('/ingresar', (req, res) => {
  res.render('home');
})

router.post('/ingresar', async (req, res, next) => {
  try {
    const { username, password, remember } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;
    
    console.log(`[LOGIN] Intento de login desde ${clientIP} para usuario: ${username}`);
    
    // 1. VALIDAR ENTRADA
    const validation = validateLoginCredentials(username, password);
    if (!validation.isValid) {
      auditor.logAttempt(clientIP, username, false, 'Validación fallida: ' + validation.errors[0]);
      req.flash('error', validation.errors[0]);
      return res.redirect('/ingresar');
    }
    
    // 2. VERIFICAR RATE LIMITING
    const rateLimitCheck = rateLimiter.recordAttempt(clientIP, username);
    if (!rateLimitCheck.allowed) {
      auditor.logAttempt(clientIP, username, false, 'Rate limit excedido');
      req.flash('error', rateLimitCheck.message);
      return res.redirect('/ingresar');
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
        return res.redirect('/ingresar');
      }
      
      if (!authenticatedUser) {
        // Login fallido
        auditor.logAttempt(clientIP, username, false, info?.message || 'Credenciales inválidas');
        console.log('[LOGIN FAILED]', username, '- Razón:', info?.message || 'Credenciales inválidas');
        
        // Mensajes genéricos para evitar user enumeration
        req.flash('error', 'Usuario o contraseña incorrectos');
        return res.redirect('/ingresar');
      }
      
      // LOGIN EXITOSO
      req.logIn(authenticatedUser, (err) => {
        if (err) {
          console.error('[LOGIN SESSION ERROR]', err);
          req.flash('error', 'Error al crear sesión');
          return res.redirect('/ingresar');
        }
        
        // Limpiar intentos fallidos
        rateLimiter.clearAttempts(clientIP, username);
        
        // Guardar en caché
        sessionCache.setUser(authenticatedUser._id.toString(), {
          _id: authenticatedUser._id,
          username: authenticatedUser.username,
          funcion: authenticatedUser.funcion,
          loginTime: new Date(),
          ip: clientIP
        });
        
        // AUDITORÍA - LOGIN EXITOSO
        auditor.logAttempt(clientIP, username, true, 'Login exitoso - Rol: ' + authenticatedUser.funcion);
        console.log('[LOGIN SUCCESS] Usuario:', username, 'Rol:', authenticatedUser.funcion);
        
        // REMEMBER ME - Configurar cookie de larga duración si está checkeado
        if (remember === 'on') {
          req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 días
          console.log('[LOGIN] Remember Me activado - Sesión: 30 días');
        }
        
        // REDIRECCIONAR SEGÚN ROL
        if (authenticatedUser.funcion) {
          let role = authenticatedUser.funcion;
          let redirectUrl;
          
          switch(role) {
            case 'ADMINISTRADOR':
              redirectUrl = req.session.returnTo || '/administrador';
              console.log('[LOGIN REDIRECT] ADMINISTRADOR → ' + redirectUrl);
              break;
            case 'REPARTIDOR':
              redirectUrl = req.session.returnTo || '/pedidos/pedidos-repartidor';
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
  req.logOut((err) => {
    if (err) {
      console.error('[LOGOUT ERROR]', err);
      req.flash('error', 'Error al cerrar sesión');
      return res.redirect('/administrador');
    }
    
    // Invalidar caché ANTES de hacer logout
    if (userId) {
      sessionCache.invalidateUser(userId);
    }
    
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
