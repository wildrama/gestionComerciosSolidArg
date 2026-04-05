# 🔐 AUDITORÍA SISTEMA DE LOGIN - ANÁLISIS COMPLETO

**Fecha:** 19 de noviembre de 2025  
**Status:** 🔍 ANÁLISIS EN CURSO

---

## 📊 SITUACIÓN ACTUAL

### Tecnología Utilizada
- **Express.js** - Framework web
- **Passport.js** - Autenticación
- **passport-local-mongoose** - Estrategia local + Mongoose
- **express-session** - Gestión de sesiones
- **connect-mongo** - Store de sesiones en MongoDB
- **connect-flash** - Mensajes flash

### Componentes Principales

#### 1. Model: `/models/usuario.js`
```javascript
- Schema básico con campo 'funcion'
- Plugin passportLocalMongoose (maneja username/password)
- Roles: CAJA, STOCK, REPARTIDOR, ADMINISTRADOR
- Timestamps habilitado
- Asociación con EstacionDeCobro (opcional)
```

#### 2. Routes: `/routes/usuarios.js`
```javascript
GET  /registro         - Comentado (sin funcionalidad)
GET  /ingresar         - Renderiza home.ejs
POST /ingresar         - Passport.authenticate + redirección por rol
GET  /cerrar-sesion    - Logout + flash
GET  /repartidorNuevo  - Crear usuario repartidor
GET  /crearAdmin1      - Crear usuario administrador (DEBUG)
```

#### 3. Middleware: `/middleware.js`
```javascript
- isLoggedIn()      - Verifica autenticación básica
- isAdmin(role)     - Verifica rol específico
- isCaja(role1)     - Verifica rol caja (duplicado)
```

#### 4. Configuración: `index.js`
```javascript
Sessions en MongoDB:
  - Store: MongoStore
  - Secret: 'this!' (muy débil)
  - Cookie: 7 días
  - httpOnly: true
  - Expires: 7 días

Passport:
  - LocalStrategy con User.authenticate()
  - serializeUser / deserializeUser con métodos de passport-local-mongoose
```

#### 5. Vista: `/views/home.ejs`
```html
- Form POST /ingresar
- Campos: username, password
- Toggle password (toggle básico)
- Checkbox "Recordar sesión" (sin funcionalidad)
- Diseño moderno responsive
```

---

## ⚠️ PROBLEMAS IDENTIFICADOS

### 🔴 CRÍTICOS

#### 1. Secret muy débil
```javascript
// ACTUAL
secret: 'this!'

// PROBLEMA
- Muy corto (5 caracteres)
- Sin caracteres especiales suficientes
- Fácil de adivinar/bruteforce
```

#### 2. Sin validaciones en login
```javascript
// ACTUAL
POST /ingresar → passport.authenticate directo

// PROBLEMAS
- Sin límite de intentos de login
- Sin validación de contraseña mínima
- Sin rate limiting
- Vulnerable a bruteforce/diccionario
```

#### 3. Usuario creado sin validaciones
```javascript
// ACTUAL
GET /crearAdmin1 → crea usuario directo sin protección

// PROBLEMAS
- Endpoints públicos para crear usuarios (CRÍTICO)
- Sin validación de contraseña fuerte
- Sin validación de formato username
- Sin hash/bcrypt (depende de passport-local-mongoose)
```

#### 4. Sin validación de logout (logOut deprecado)
```javascript
// ACTUAL
req.logOut()

// PROBLEMA
- logOut() es deprecado en Passport v0.6+
- Debería usar callback: req.logOut(callback)
- Puede causar errores en versiones futuras
```

### 🟠 IMPORTANTES

#### 5. Caché de sesión no optimizado
```javascript
// ACTUAL
- Sesión se guarda en MongoDB en cada request
- touchAfter: 24*60 (en minutos, parece estar mal interpretado)
- Sin caché de usuario en cliente
- Sin JWT para operaciones rápidas

// IMPACTO
- Más queries a BD en cada request
- Más latencia
- Más carga en servidor
```

#### 6. Sin persistencia de "Recordar sesión"
```javascript
// ACTUAL
<input type="checkbox" id="remember"> (sin funcionalidad)

// PROBLEMA
- Checkbox no hace nada
- No se implementó cookie de larga duración
```

#### 7. Flash messages sin timeout
```javascript
// ACTUAL
req.flash() - muestra mensaje una vez

// PROBLEMA
- Sin timeout de desaparición de mensajes
- Sin animación
- Usuario podría no verlo
```

#### 8. Sin throttling de requests
```javascript
// ACTUAL
Sin límite de requests por IP

// PROBLEMA
- Vulnerable a DDoS
- Vulnerable a bruteforce
- Sin protección de rate limiting
```

#### 9. Middleware duplicado
```javascript
// ACTUAL
isAdmin() y isCaja() hacen lo mismo
- Código duplicado
- Difícil de mantener
```

#### 10. Sin logging de intentos fallidos
```javascript
// ACTUAL
Sin registro de intentos fallidos de login

// PROBLEMA
- No hay auditoría
- No se detectan ataques
- Sin alertas de seguridad
```

### 🟡 MEJORABLE

#### 11. Session cookie podría ser más segura
```javascript
// ACTUAL
httpOnly: true ✅
secure: false ❌ (debería ser true en producción)
sameSite: no especificado ❌ (debería ser 'strict')
```

#### 12. Sin validación de roles
```javascript
// ACTUAL
enum: ['CAJA', 'STOCK', 'REPARTIDOR', 'ADMINISTRADOR']

// PROBLEMA
- STOCK no se usa en middleware
- Sin validación de rol en endpoints críticos
```

#### 13. Error handling genérico
```javascript
// ACTUAL
failureFlash: true (sin mensaje específico)

// PROBLEMA
- No diferencia entre usuario no encontrado vs contraseña incorrecta
- Vulnerable a user enumeration
```

---

## 📈 ESTADÍSTICAS ACTUALES

| Aspecto | Estado |
|---------|--------|
| Seguridad de Secret | 🔴 Débil |
| Validaciones Login | 🔴 Ninguna |
| Rate Limiting | 🔴 Ninguno |
| Caché Sesiones | 🟡 Básico |
| Logging Auditoría | 🔴 Ninguno |
| Password Requirements | 🔴 Ninguno |
| Timeout Sesión | 🟢 7 días |
| HttpOnly Cookies | 🟢 Sí |
| CSRF Protection | 🟡 No implementado |
| 2FA/MFA | 🔴 No |

---

## 📊 ANÁLISIS DE TECNOLOGÍA

### ✅ LO QUE ESTÁ BIEN

1. **Passport.js** - Excelente para autenticación local
2. **passport-local-mongoose** - Plugin completo y probado
3. **express-session** - Sesiones seguras por defecto
4. **MongoStore** - Store de sesiones en BD es robusto
5. **HttpOnly cookies** - Protege contra XSS

### ⚠️ LO QUE NECESITA MEJORA

1. **Configuración de Session** - Muy débil actualmente
2. **Validaciones** - Ninguna en lugar de tenerlas
3. **Rate Limiting** - Sin implementar
4. **Logging** - Sin auditoría
5. **Error Messages** - Genéricos y sin distinción

### 🚀 LO QUE SE PUEDE OPTIMIZAR

1. **Caché de usuario** - En memoria para operaciones rápidas
2. **JWT** - Para APIs (ya hay axios requests)
3. **Validación de contraseña** - Con reglas fuertes
4. **Remember Me** - Con cookies de larga duración
5. **Session Management** - Mejor control

---

## 🔄 FLUJO ACTUAL DE LOGIN

```
Usuario → home.ejs (form POST)
            ↓
        /ingresar (POST)
            ↓
    passport.authenticate('local')
            ↓
    User.authenticate() (passport-local-mongoose)
            ↓
    Si OK → Serialize usuario
    Si FAIL → failureFlash + redirect /
            ↓
    Verificar req.user.funcion
            ↓
    Switch by role:
        ADMINISTRADOR → /administrador
        REPARTIDOR → /pedidos/pedidos-repartidor
        CAJA → /caja/cajaCobro
            ↓
    Sesión en MongoDB
    Cookie con sessionID
```

---

## 💾 CONFIGURACIÓN ACTUAL DE SESIONES

```javascript
Sessions en MongoDB:
  URL: mongodb://localhost:27017/dbIsidorito
  Collection: 'sessions' (default)
  TTL: 7 días (604800000 ms)
  
Cookie:
  Name: 'session'
  Secret: 'this!' ❌ MUY DÉBIL
  httpOnly: true ✅
  expires: Date.now() + 7 días
  maxAge: 7 días
  
Session Store:
  touchAfter: 24*60 (minutos)
  mongoUrl: dbUrl
```

---

## 🎯 PLAN DE MEJORAS (PRÓXIMAS ACCIONES)

### FASE 1: Seguridad Crítica
- [ ] Mejorar secret con string fuerte
- [ ] Agregar validaciones en login
- [ ] Implementar rate limiting
- [ ] Usar logOut con callback
- [ ] Agregar logging de intentos

### FASE 2: Caché y Performance
- [ ] Implementar caché de usuarios en memoria
- [ ] Optimizar MongoStore
- [ ] Agregar validación de contraseña fuerte
- [ ] Implementar "Remember Me" correcto

### FASE 3: Funcionalidades
- [ ] Mejorar error messages (sin user enumeration)
- [ ] Agregar timeout de sesión inactiva
- [ ] CSRF protection
- [ ] Auditoría completa de logins

### FASE 4: Futuro
- [ ] 2FA/MFA
- [ ] JWT para APIs
- [ ] Session Fingerprinting
- [ ] Bot detection

---

## 📝 PRÓXIMOS PASOS

1. **Crear validaciones mejoradas de login**
2. **Implementar rate limiting con express-rate-limit**
3. **Mejorar caché de sesiones**
4. **Agregar logging y auditoría**
5. **Implementar "Remember Me" correctamente**
6. **Mejorar error handling**

---

**Auditoría realizada:** GitHub Copilot  
**Versión:** 1.0  
**Estado:** 🔍 Listo para implementar mejoras
