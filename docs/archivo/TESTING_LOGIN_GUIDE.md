# Guía de Testing: Sistema de LOGIN v2.0

**Fecha:** 2024  
**Versión:** 2.0  
**Estado:** ✅ Ready for Testing

---

## 📋 Tabla de Contenidos

1. [Setup para Testing](#setup)
2. [Test de Validaciones](#validaciones)
3. [Test de Rate Limiting](#rate-limiting)
4. [Test de Caché](#cache)
5. [Test de Remember Me](#remember-me)
6. [Test de Auditoría](#auditoria)
7. [Test de Creación de Usuarios](#crear-usuarios)
8. [Test de Logout](#logout)
9. [Checklist Final](#checklist)

---

## <a name="setup"></a>🔧 Setup para Testing

### Requisitos Previos:
```bash
✓ MongoDB corriendo en localhost:27017
✓ Aplicación iniciada: npm start (puerto 3037)
✓ Navegador con consola abierta (F12)
✓ Usuarios de prueba creados
```

### Crear Usuarios de Prueba:

**Usuario 1: Admin**
```
Usuario: testadmin
Contraseña: TestAdmin123!
Rol: ADMINISTRADOR
```

**Usuario 2: Repartidor**
```
Usuario: testrepartidor
Contraseña: TestRepartidor123!
Rol: REPARTIDOR
```

**Usuario 3: Caja**
```
Usuario: testcaja
Contraseña: TestCaja123!
Rol: CAJA
```

---

## <a name="validaciones"></a>✅ Test 1: Validaciones de Input

### Test 1.1: Validar Username Requerido

**Pasos:**
1. Ir a http://localhost:3037/ingresar
2. Dejar campo "Usuario" vacío
3. Llenar campo "Contraseña" con: Pass123!
4. Hacer clic en "Ingresar"

**Resultado Esperado:**
```
❌ "Usuario o contraseña incorrectos"
📊 Console: [LOGIN] Validaciones fallidas: Username is required
```

---

### Test 1.2: Validar Password Requerido

**Pasos:**
1. Ir a http://localhost:3037/ingresar
2. Llenar "Usuario" con: testadmin
3. Dejar campo "Contraseña" vacío
4. Hacer clic en "Ingresar"

**Resultado Esperado:**
```
❌ "Usuario o contraseña incorrectos"
📊 Console: [LOGIN] Validaciones fallidas: Password is required
```

---

### Test 1.3: Validar Entrada Válida

**Pasos:**
1. Ir a http://localhost:3037/ingresar
2. Usuario: testadmin
3. Contraseña: TestAdmin123!
4. Hacer clic en "Ingresar"

**Resultado Esperado:**
```
✅ Redirecciona a /administrador
📊 Console: [LOGIN] Validaciones pasadas
```

---

## <a name="rate-limiting"></a>🚫 Test 2: Rate Limiting (5 intentos, 15 min)

### Test 2.1: Primer Intento Fallido

**Pasos:**
1. Ir a http://localhost:3037/ingresar
2. Usuario: testadmin
3. Contraseña: INCORRECTO
4. Hacer clic en "Ingresar"

**Resultado Esperado:**
```
❌ "Usuario o contraseña incorrectos"
📊 Console: [LOGIN FAILED] testadmin
📊 Intentos restantes: 4
```

---

### Test 2.2: Segundo Intento Fallido

**Pasos:**
1. Repetir Test 2.1 con otra contraseña incorrecta

**Resultado Esperado:**
```
❌ "Usuario o contraseña incorrectos"
📊 Console: [LOGIN FAILED] testadmin
📊 Intentos restantes: 3
```

---

### Test 2.3: Tercero, Cuarto, Quinto Intento Fallidos

**Pasos:**
1. Repetir Test 2.1 tres veces más
2. Cada vez usar contraseña diferente incorrecta

**Resultado Esperado:**
```
Intento 3: Restantes: 2
Intento 4: Restantes: 1
Intento 5: Restantes: 0
```

---

### Test 2.4: Sexto Intento - BLOQUEADO

**Pasos:**
1. Inmediatamente después del 5to intento
2. Intentar login nuevamente

**Resultado Esperado:**
```
❌ "Demasiados intentos. Reintentar en 15 minutos"
❌ Campo de contraseña deshabilitado
📊 Console: [LOGIN] Rate limit excedido
```

---

### Test 2.5: Esperar 15 Minutos - DESBLOQUEADO

**Pasos:**
1. Esperar 15 minutos
2. Intentar login con credenciales correctas

**Resultado Esperado:**
```
✅ Login exitoso
✅ Rate limiter reseteado
📊 Console: [LOGIN SUCCESS]
```

---

## <a name="cache"></a>⚡ Test 3: Caché de Sesiones (5 min TTL)

### Test 3.1: Primer Login - Consulta BD

**Pasos:**
1. Abrir DevTools (F12)
2. Network tab
3. Ir a http://localhost:3037/ingresar
4. Hacer login con: testadmin / TestAdmin123!

**Resultado Esperado:**
```
⏱️ Tiempo de login: ~100-200ms
📊 Console: [LOGIN] Usuario no en caché, buscando en BD...
✅ Login exitoso
```

---

### Test 3.2: Segundo Login - Caché Hit

**Pasos:**
1. Ir a /administrador (para verificar que está logeado)
2. Hacer logout
3. Volver a http://localhost:3037/ingresar
4. Hacer login CON EL MISMO USUARIO dentro de 5 minutos

**Resultado Esperado:**
```
⏱️ Tiempo de login: ~20-50ms (MUCHO más rápido)
📊 Console: [LOGIN] Usuario obtenido de caché ✓
✅ Login exitoso
📊 Cache Stats: hitRate = ~50%
```

**Diferencia de Rendimiento:**
```
Sin caché: 100-200ms
Con caché: 20-50ms
Mejora: 2-5x MÁS RÁPIDO
```

---

### Test 3.3: Tercera Sesión - Caché Expirada (5+ min después)

**Pasos:**
1. Esperar 5+ minutos con el usuario logeado
2. Hacer logout
3. Volver a hacer login con el mismo usuario

**Resultado Esperado:**
```
⏱️ Tiempo: ~100-200ms (se expira el caché)
📊 Console: [LOGIN] Usuario no en caché, buscando en BD...
✅ Login exitoso
✅ Caché almacenado nuevamente por 5 minutos
```

---

## <a name="remember-me"></a>🔑 Test 4: Remember Me (30 días)

### Test 4.1: Login SIN Remember Me

**Pasos:**
1. Ir a http://localhost:3037/ingresar
2. Usuario: testadmin
3. Contraseña: TestAdmin123!
4. Dejar checkbox "Remember Me" SIN MARCAR
5. Hacer clic en "Ingresar"
6. DevTools → Application → Cookies → Buscar 'session'

**Resultado Esperado:**
```
✅ Login exitoso
🍪 Cookie 'session':
   - Max-Age: 604800 (7 días = 7 * 24 * 60 * 60 segundos)
📊 Console: [LOGIN] Remember Me desactivado
```

---

### Test 4.2: Login CON Remember Me

**Pasos:**
1. Hacer logout
2. Volver a http://localhost:3037/ingresar
3. Usuario: testadmin
4. Contraseña: TestAdmin123!
5. MARCAR checkbox "Remember Me"
6. Hacer clic en "Ingresar"
7. DevTools → Application → Cookies → Buscar 'session'

**Resultado Esperado:**
```
✅ Login exitoso
🍪 Cookie 'session':
   - Max-Age: 2592000 (30 días = 30 * 24 * 60 * 60 segundos)
📊 Console: [LOGIN] Remember Me activado - Sesión: 30 días
```

**Verificación:**
```
7 días = 604800 segundos
30 días = 2592000 segundos
Mejora: 4.3x más tiempo de sesión
```

---

## <a name="auditoria"></a>📊 Test 5: Auditoría Completa

### Test 5.1: Verificar Console Logs

**Pasos:**
1. Abrir DevTools (F12) → Console
2. Hacer login exitoso
3. Buscar logs con prefix "[LOGIN]"

**Resultado Esperado:**
```
[LOGIN] Intento de login desde 127.0.0.1 para usuario: testadmin
[LOGIN] Validaciones pasadas. Intentos restantes: 5
[LOGIN SUCCESS] Usuario: testadmin Rol: ADMINISTRADOR
```

---

### Test 5.2: Verificar Logs de Intento Fallido

**Pasos:**
1. Hacer login con credenciales incorrectas
2. Buscar en console logs con "[LOGIN]"

**Resultado Esperado:**
```
[LOGIN] Intento de login desde 127.0.0.1 para usuario: testadmin
[LOGIN FAILED] testadmin - Razón: Credenciales inválidas
```

---

### Test 5.3: Detectar Actividad Sospechosa

**Pasos:**
1. Hacer 6+ intentos fallidos consecutivos (para disparar rate limit)
2. Ejecutar en console:
   ```javascript
   // Si tuvieras acceso a auditor (no es público)
   auditor.detectSuspiciousActivity()
   ```

**Resultado Esperado:**
```
IP: 127.0.0.1 - Intentos fallidos: 6 ⚠️
Usuario: testadmin - Intentos fallidos: 6 ⚠️
```

---

## <a name="crear-usuarios"></a>👤 Test 6: Crear Usuarios

### Test 6.1: Crear Repartidor (Éxito)

**Prerequisitos:**
- Estar logeado como ADMINISTRADOR (testadmin)

**Pasos:**
1. Ir a /administrador
2. Buscar formulario "Crear Repartidor"
3. Llenar:
   - Usuario: nuevo_repartidor
   - Contraseña: NuevoPass2024!
   - Confirmar: NuevoPass2024!
4. Hacer clic en [CREAR REPARTIDOR]

**Resultado Esperado:**
```
✅ "Repartidor 'nuevo_repartidor' creado correctamente"
📊 Console: [CREAR REPARTIDOR] Éxito - Usuario: nuevo_repartidor por Admin: testadmin
```

---

### Test 6.2: Crear Usuario con Contraseña Débil

**Pasos:**
1. Ir a /administrador
2. Formulario "Crear Repartidor"
3. Llenar:
   - Usuario: otro_repartidor
   - Contraseña: weak (CONTRASEÑA DÉBIL)
   - Confirmar: weak

**Resultado Esperado:**
```
❌ "La contraseña debe tener al menos 8 caracteres"
❌ Usuario NO creado
📊 Console: [CREAR REPARTIDOR] Validación fallida
```

---

### Test 6.3: Crear Usuario que Ya Existe

**Pasos:**
1. Ir a /administrador
2. Formulario "Crear Repartidor"
3. Llenar:
   - Usuario: testcaja (YA EXISTE)
   - Contraseña: TestPass2024!
   - Confirmar: TestPass2024!
4. Hacer clic

**Resultado Esperado:**
```
❌ "El usuario ya existe"
❌ Usuario NO creado
```

---

### Test 6.4: Crear Admin (Solo Admin)

**Pasos:**
1. Estar logeado como admin
2. Ir a /administrador
3. Formulario "Crear Administrador"
4. Llenar con datos válidos
5. Hacer clic

**Resultado Esperado:**
```
✅ "Administrador creado correctamente"
✅ Nuevo admin puede logearse
```

---

### Test 6.5: Intentar Crear Usuario sin Ser Admin

**Pasos:**
1. Logearse como REPARTIDOR (testrepartidor)
2. Intentar acceder directo a POST /repartidorNuevo
3. O intentar ir a /administrador

**Resultado Esperado:**
```
❌ "No tiene permisos para crear usuarios"
❌ Redirecciona a /
```

---

## <a name="logout"></a>🚪 Test 7: Logout Mejorado

### Test 7.1: Logout Exitoso

**Pasos:**
1. Estar logeado como testadmin
2. Ir a /cerrar-sesion
3. Verificar console

**Resultado Esperado:**
```
✅ "Sesión cerrada correctamente"
✅ Redirecciona a /
📊 Console: [LOGOUT] Usuario: testadmin IP: 127.0.0.1
📊 Cache invalidada para user_id
```

---

### Test 7.2: Logout Sin Estar Logeado

**Pasos:**
1. En navegador privado (sin sesión)
2. Ir a /cerrar-sesion

**Resultado Esperado:**
```
✅ Redirecciona a / (sin error)
```

---

## <a name="checklist"></a>✅ Checklist Final

Marcar cuando cada test pase:

### Validaciones:
- [ ] Username requerido
- [ ] Password requerido
- [ ] Input válido permitido

### Rate Limiting:
- [ ] 5 intentos permitidos
- [ ] 6to intento bloqueado
- [ ] Bloqueo dura 15 minutos
- [ ] Después de 15 min se resetea

### Caché:
- [ ] Primer login: consulta BD (~100ms)
- [ ] Segundo login (< 5 min): caché (~30ms)
- [ ] Tercer login (> 5 min): consulta BD nuevamente

### Remember Me:
- [ ] Sin marcar: sesión 7 días
- [ ] Marcado: sesión 30 días

### Auditoría:
- [ ] Intentos logeados en console
- [ ] Éxito registrado
- [ ] Fallos registrados
- [ ] Actividad sospechosa detectable

### Crear Usuarios:
- [ ] Crear repartidor exitoso
- [ ] Rechazar contraseña débil
- [ ] Rechazar usuario duplicado
- [ ] Crear admin exitoso
- [ ] Non-admin no puede crear

### Logout:
- [ ] Logout exitoso
- [ ] Cache invalidada
- [ ] Logout sin sesión OK

---

## 🐛 Debugging

### Si algo no funciona:

**1. Verificar Console:**
```javascript
// F12 → Console
// Buscar [LOGIN], [RATE LIMIT], [CACHE], etc.
```

**2. Verificar MongoDB:**
```bash
# En terminal de MongoDB
db.users.find() # Ver usuarios
db.sessions.find() # Ver sesiones
```

**3. Reiniciar Servidor:**
```bash
# En terminal de la app
Ctrl+C
npm start
```

**4. Limpiar Cache del Navegador:**
```
DevTools → Application → Clear Site Data
```

---

## 📊 Resultados Esperados Summary

| Prueba | Resultado Esperado | Estado |
|--------|------------------|--------|
| Validación Input | ✅ Funciona | [ ] |
| Rate Limiting | ✅ 5 intentos | [ ] |
| Caché Hit | ✅ 2-5x más rápido | [ ] |
| Remember Me | ✅ 30 días | [ ] |
| Auditoría | ✅ Todo registrado | [ ] |
| Crear Usuarios | ✅ Con validaciones | [ ] |
| Logout | ✅ Limpio | [ ] |

---

**Versión:** 2.0  
**Estado:** ✅ Testing Guide Ready
