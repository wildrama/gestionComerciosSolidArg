# Referencia Rápida: LOGIN Security v2.0

---

## 🔑 Módulos Nuevos

### `/utils/loginSecurity.js`

```javascript
// IMPORTAR:
const {
  validatePassword,
  validateUsername,
  validateLoginCredentials,
  validateUserRegistration,
  RateLimiter,
  LoginAuditor,
  SessionCache
} = require('../utils/loginSecurity');

// CREAR INSTANCIAS:
const rateLimiter = new RateLimiter();
const auditor = new LoginAuditor();
const sessionCache = new SessionCache(5 * 60 * 1000);
```

---

## ✅ Validaciones

### validatePassword(password)
```javascript
// Retorna: { isValid: bool, errors: array }
const result = validatePassword('Test123!');
if (!result.isValid) {
  console.log(result.errors); // ["Must have 8+ chars", ...]
}
```

### validateUsername(username)
```javascript
// Retorna: { isValid: bool, errors: array }
const result = validateUsername('user_name');
if (!result.isValid) {
  console.log(result.errors);
}
```

### validateLoginCredentials(username, password)
```javascript
const result = validateLoginCredentials(username, password);
if (!result.isValid) {
  req.flash('error', result.errors[0]);
  return res.redirect('/ingresar');
}
```

### validateUserRegistration(username, password, passwordConfirm)
```javascript
const result = validateUserRegistration(username, password, passwordConfirm);
if (!result.isValid) {
  req.flash('error', result.errors[0]);
  return res.redirect('/registro');
}
```

---

## 🚫 Rate Limiter

### recordAttempt(ip, username)
```javascript
const check = rateLimiter.recordAttempt('192.168.1.1', 'admin');
// Retorna: { allowed, remaining, message, resetTime }

if (!check.allowed) {
  return res.status(429).send(check.message);
}
console.log(`Intentos restantes: ${check.remaining}`);
```

### clearAttempts(ip, username)
```javascript
// Limpiar después de login exitoso
rateLimiter.clearAttempts(ip, username);
```

### getBlockedInfo(ip, username)
```javascript
const info = rateLimiter.getBlockedInfo(ip, username);
if (info.isBlocked) {
  console.log(`Bloqueado hasta: ${info.resetTime}`);
}
```

---

## 📊 Login Auditor

### logAttempt(ip, username, success, reason)
```javascript
// Registrar intento exitoso
auditor.logAttempt('192.168.1.1', 'admin', true, 'Login exitoso - Rol: ADMIN');

// Registrar intento fallido
auditor.logAttempt('192.168.1.1', 'admin', false, 'Credenciales inválidas');
```

### detectSuspiciousActivity()
```javascript
const suspicious = auditor.detectSuspiciousActivity();
if (suspicious.length > 0) {
  console.log('🚨 Actividad sospechosa detectada:', suspicious);
}
```

### getAttemptsByIP(ip)
```javascript
const attempts = auditor.getAttemptsByIP('192.168.1.1');
console.log(`Intentos desde esta IP: ${attempts.length}`);
```

### getAttemptsByUser(username)
```javascript
const attempts = auditor.getAttemptsByUser('admin');
console.log(`Intentos para este usuario: ${attempts.length}`);
```

---

## ⚡ Session Cache

### setUser(userId, userData)
```javascript
sessionCache.setUser(user._id.toString(), {
  _id: user._id,
  username: user.username,
  funcion: user.funcion,
  loginTime: new Date()
});
```

### getUser(userId)
```javascript
const cachedUser = sessionCache.getUser(userId);
if (cachedUser) {
  console.log('✅ Usuario desde caché');
} else {
  console.log('❌ Caché expirado, buscar en BD');
}
```

### invalidateUser(userId)
```javascript
// Limpiar caché cuando logout
sessionCache.invalidateUser(userId);
```

### getStats()
```javascript
const stats = sessionCache.getStats();
console.log(`Cache stats: ${stats.hitRate}% hit rate`);
```

---

## 🔐 Middleware

### isLoggedIn
```javascript
// Verificar que esté logeado
app.get('/admin', isLoggedIn, (req, res) => {
  // req.user.funcion = ADMINISTRADOR, CAJA, REPARTIDOR, STOCK
});

// Con caché integrada automáticamente
```

### isAuthorizedRole
```javascript
// Verificar rol único
app.get('/admin', isAuthorizedRole('ADMINISTRADOR'), (req, res) => {
  res.send('Solo administradores');
});

// Verificar múltiples roles
app.get('/panel', isAuthorizedRole(['ADMINISTRADOR', 'STOCK']), (req, res) => {
  res.send('Admin o Stock');
});
```

### hasAnyRole
```javascript
// Alternativa más legible
app.get('/panel', hasAnyRole(['ADMIN', 'STOCK']), (req, res) => {
  // Acceso para múltiples roles
});
```

### isAdmin, isCaja (Legado)
```javascript
// Mantener para compatibilidad
app.get('/caja', isAdmin('CAJA'), (req, res) => {
  // Solo CAJA
});
```

---

## 📝 Login Route (POST /ingresar)

```javascript
router.post('/ingresar', async (req, res, next) => {
  // 1. VALIDAR
  const validation = validateLoginCredentials(username, password);
  if (!validation.isValid) return error;

  // 2. RATE LIMIT
  const limit = rateLimiter.recordAttempt(clientIP, username);
  if (!limit.allowed) return error;

  // 3. CACHÉ
  let user = sessionCache.getUser(username);
  if (!user) user = await User.findOne({ username });

  // 4. PASSPORT
  passport.authenticate('local', (err, user, info) => {
    if (!user) {
      auditor.logAttempt(clientIP, username, false, info?.message);
      return error;
    }

    // 5. SESIÓN
    req.logIn(user, (err) => {
      rateLimiter.clearAttempts(clientIP, username);
      sessionCache.setUser(user._id, userData);
      auditor.logAttempt(clientIP, username, true, 'Login exitoso');
      
      if (remember) req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
      
      res.redirect(redirectByRole(user.funcion));
    });
  })(req, res, next);
});
```

---

## 🔄 Logout Route (GET /cerrar-sesion)

```javascript
router.get('/cerrar-sesion', (req, res) => {
  const username = req.user.username;
  
  req.logOut((err) => {
    if (err) return res.redirect('/');
    
    sessionCache.invalidateUser(req.user._id);
    auditor.logAttempt(req.ip, username, true, 'Logout');
    
    req.flash('success', 'Sesión cerrada');
    res.redirect('/');
  });
});
```

---

## 👤 Create Users Routes

### POST /repartidorNuevo
```javascript
router.post('/repartidorNuevo', isLoggedIn, async (req, res) => {
  // Solo ADMINISTRADOR
  if (req.user.funcion !== 'ADMINISTRADOR') return error;
  
  // Validar
  const validation = validateUserRegistration(username, password, passwordConfirm);
  if (!validation.isValid) return error;
  
  // Crear
  const usuario = new User({ funcion: 'REPARTIDOR', username });
  const nuevoUsuario = await User.register(usuario, password);
  
  // Auditoría + Caché
  sessionCache.invalidateUser(nuevoUsuario._id);
  auditor.logAttempt(req.ip, req.user.username, true, 'Repartidor creado');
  
  res.redirect('/administrador');
});
```

### POST /crearAdmin
```javascript
// Idéntico a /repartidorNuevo pero con funcion: 'ADMINISTRADOR'
```

---

## 🛡️ Config en index.js

```javascript
const sessionConfig = {
  store,
  name: 'session',
  secret: process.env.SESSION_SECRET || 'very-strong-secret-60+chars',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only
    sameSite: 'strict', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
  }
};
```

---

## 📊 Password Validation Reglas

```javascript
// ✅ VÁLIDO
'MyPassword123!'     // 8+ chars, mayús, minús, número, especial
'Admin@Secure2024'   // Cumple todos
'Test#Pass123'       // Cumple todos

// ❌ INVÁLIDO
'password'           // Sin mayúscula, número, especial
'Pass123'            // Sin carácter especial
'Pas!23'             // Muy corta
'UPPERCASE123!'      // Sin minúscula
'lowercase123!'      // Sin mayúscula
```

---

## 📊 Username Validation Reglas

```javascript
// ✅ VÁLIDO
'juan_lopez'         // 3-20 chars, sin números al inicio
'maria-rosa'         // Guion permitido
'admin123'           // Números al final OK

// ❌ INVÁLIDO
'ju'                 // Muy corta
'juan_lopez_super_long_name'  // Muy larga
'123juan'            // Comienza con número
'juan#lopez'         // Carácter inválido
```

---

## 🧪 Testing Cheatsheet

```bash
# TEST 1: Validación input
curl -X POST http://localhost:3037/ingresar \
  -d "username=&password=test"

# TEST 2: Login exitoso
curl -X POST http://localhost:3037/ingresar \
  -d "username=admin&password=Admin123!&remember=on"

# TEST 3: Rate limit (5 intentos)
for i in {1..6}; do
  curl -X POST http://localhost:3037/ingresar \
    -d "username=admin&password=wrong"
done

# TEST 4: Ver logs
tail -f /path/to/app.log | grep "[LOGIN]"
```

---

## 🚨 Debugging

```javascript
// Habilitar verbose logging
console.log('[LOGIN DEBUG]', {
  username,
  ip: req.ip,
  rateLimitCheck,
  cacheHit: !!cachedUser,
  userExists: !!user
});

// Ver estado de rate limiter
console.log(rateLimiter.getBlockedInfo(ip, username));

// Ver estadísticas de caché
console.log(sessionCache.getStats());

// Detectar actividad sospechosa
console.log(auditor.detectSuspiciousActivity());
```

---

## 📞 Cambios Recientes

### Archivos Modificados:
- ✅ `/routes/usuarios.js` - Nuevas rutas + validaciones
- ✅ `/utils/loginSecurity.js` - Nuevo módulo (400+ líneas)
- ✅ `/index.js` - Config de sesión mejorada
- ✅ `/middleware.js` - Middleware optimizado

### Archivos Nuevos:
- ✅ `/AUDITORIA_LOGIN_COMPLETA.md` - Reporte de auditoría
- ✅ `/IMPLEMENTACION_SEGURIDAD_LOGIN.md` - Guía completa
- ✅ `/GUIA_CREAR_USUARIOS.md` - Guía para usuarios
- ✅ `/TESTING_LOGIN_GUIDE.md` - Guía de testing

---

## 🔄 Flujo Completo: Login

```
Usuario entra a /ingresar
        ↓
Llena formulario: admin / Admin123!
        ↓
POST /ingresar
        ↓
validateLoginCredentials() ✓
        ↓
rateLimiter.recordAttempt() ✓
        ↓
sessionCache.getUser() → No encontrado
        ↓
User.findOne() → Busca en BD
        ↓
Passport.authenticate()
        ↓
Credenciales válidas ✓
        ↓
rateLimiter.clearAttempts()
        ↓
sessionCache.setUser() → Caché por 5 min
        ↓
auditor.logAttempt() → Registrar éxito
        ↓
remember? 
  ├─ Sí → maxAge = 30 días
  └─ No → maxAge = 7 días
        ↓
Redirigir según rol
        ↓
✅ Login exitoso
```

---

**Versión:** 2.0  
**Status:** ✅ Production Ready  
**Last Updated:** 2024
