# Guía Rápida: Crear Usuarios (Repartidores y Administradores)

**Última Actualización:** 2024  
**Versión:** 2.0 - Segura

---

## ⚠️ IMPORTANTE - Cambios en Seguridad

Los endpoints para crear usuarios han sido **completamente rediseñados** por razones de seguridad:

### ❌ ANTES (Inseguro - NO USAR)
```
GET /repartidorNuevo
GET /crearAdmin1
```
- Accesibles directamente desde URL
- Sin contraseña
- Sin validación
- Sin autorización
- **NUNCA Usar estos URLs**

### ✅ AHORA (Seguro - USAR ESTO)
```
POST /repartidorNuevo
POST /crearAdmin
```
- Solo vía formulario POST
- Requiere contraseña fuerte
- Con validaciones completas
- Solo administradores pueden crear

---

## 📋 Requisitos de Contraseña

Toda contraseña debe cumplir **TODOS** estos requisitos:

✓ **Mínimo 8 caracteres**
✓ **Al menos 1 mayúscula** (A-Z)
✓ **Al menos 1 minúscula** (a-z)
✓ **Al menos 1 número** (0-9)
✓ **Al menos 1 carácter especial** (!@#$%^&*)

### Ejemplos VÁLIDOS:
```
✅ Caja2024Segura!
✅ Admin@Isidorito123
✅ Repartidor#2024
✅ MiPass123!Seguro
✅ Control2024$Acceso
```

### Ejemplos INVÁLIDOS:
```
❌ 12345678 (sin letras)
❌ password (sin mayúscula ni número)
❌ Pass123 (sin carácter especial)
❌ Abc! (muy corto)
❌ MAYUSCULAS123! (sin minúsculas)
```

---

## 👨‍💼 Crear Repartidor

### Paso 1: Acceder a Panel de Administración
1. Logearse como ADMINISTRADOR
2. Ir a: `/administrador`
3. Buscar sección "Crear Repartidor"

### Paso 2: Rellenar Formulario

```html
Formulario de Creación de Repartidor:

┌─────────────────────────────────────────────┐
│  CREAR REPARTIDOR                           │
├─────────────────────────────────────────────┤
│                                             │
│ Usuario: [repartidor_nombre          ]     │
│ (3-20 caracteres, sin números al inicio)    │
│                                             │
│ Contraseña: [••••••••••••••••  ]           │
│ (8+ chars, mayús, minús, número, especial)  │
│                                             │
│ Confirmar: [••••••••••••••••  ]            │
│ (Debe ser idéntica a la de arriba)         │
│                                             │
│            [CREAR REPARTIDOR] (Botón)      │
│                                             │
└─────────────────────────────────────────────┘
```

### Paso 3: Verificación

Si todo es correcto:
```
✅ Repartidor "nombre_usuario" creado correctamente
Ahora puede logearse con estas credenciales
```

Si hay errores:
```
❌ El usuario ya existe
❌ Las contraseñas no coinciden
❌ La contraseña es muy débil
```

---

## 👨‍💻 Crear Administrador

### Paso 1: Acceder a Panel de Administración
1. Logearse como ADMINISTRADOR
2. Ir a: `/administrador`
3. Buscar sección "Crear Administrador"

### Paso 2: Rellenar Formulario

```html
Formulario de Creación de Administrador:

┌─────────────────────────────────────────────┐
│  CREAR ADMINISTRADOR                        │
├─────────────────────────────────────────────┤
│                                             │
│ Usuario: [nombre_admin           ]         │
│ (3-20 caracteres, sin números al inicio)    │
│                                             │
│ Contraseña: [••••••••••••••••  ]           │
│ (8+ chars, mayús, minús, número, especial)  │
│                                             │
│ Confirmar: [••••••••••••••••  ]            │
│ (Debe ser idéntica a la de arriba)         │
│                                             │
│            [CREAR ADMIN] (Botón)           │
│                                             │
└─────────────────────────────────────────────┘
```

### Paso 3: Verificación

Si todo es correcto:
```
✅ Administrador "nombre_usuario" creado correctamente
Ahora puede logearse con estas credenciales
```

---

## 🔐 Reglas de Seguridad

### ✅ PERMITIDO:
- Crear usuarios solo siendo ADMINISTRADOR
- Usar POST (formulario), nunca GET (URL)
- Contraseñas fuertes (8+ caracteres)
- Remember Me en login

### ❌ NO PERMITIDO:
- Acceder directamente por URL
- Crear usuarios sin ser admin
- Contraseñas débiles
- Compartir contraseñas
- Mantener sesiones abiertas sin vigilancia

---

## 🆘 Problemas Comunes

### Problema: "El usuario ya existe"
**Causa:** Ya hay un usuario con ese nombre  
**Solución:** Usar otro nombre de usuario

### Problema: "Las contraseñas no coinciden"
**Causa:** Los dos campos de contraseña son diferentes  
**Solución:** Escribirlas igual en ambos campos

### Problema: "La contraseña es muy débil"
**Causa:** No cumple requisitos (8 chars, mayús, minús, número, especial)  
**Solución:** Usar una contraseña como: `Seguro2024!`

### Problema: "No tiene permisos para crear usuarios"
**Causa:** No está logeado como ADMINISTRADOR  
**Solución:** Logearse con cuenta de admin primero

### Problema: "Error al crear usuario"
**Causa:** Error interno del servidor  
**Solución:** 
1. Contactar al administrador técnico
2. Revisar console para detalles
3. Verificar que MongoDB está corriendo

---

## 🔄 Proceso Completo (Ejemplo Real)

### Crear Repartidor "Juan"

```
1. Admin entra a /administrador
2. Hace clic en "Crear Repartidor"
3. Completa:
   Usuario: juan_lopez
   Contraseña: JuanPass2024!
   Confirmar: JuanPass2024!
4. Hace clic en [CREAR REPARTIDOR]
5. Sistema valida todo
6. Se crea usuario exitosamente
7. Juan ahora puede logearse:
   Usuario: juan_lopez
   Contraseña: JuanPass2024!
8. Al logearse como repartidor, ve: /pedidos/pedidos-repartidor
```

---

## 📊 Auditoría y Registro

Cada creación de usuario es registrada:

```
[CREAR REPARTIDOR] Solicitud de: admin
[CREAR REPARTIDOR] Éxito - Usuario: juan_lopez por Admin: admin
```

Para ver el registro completo:
1. Ver logs de la aplicación
2. Buscar "[CREAR REPARTIDOR]" o "[CREAR ADMIN]"
3. Verificar IP, timestamp, usuario creador

---

## 🎯 Mejores Prácticas

### Crear Contraseñas Seguras:
```
Plantilla: [Concepto][Año][Carácter especial]

Ejemplos generados:
✅ Repartidor2024!
✅ StockIsidorito#2024
✅ Admin$Control2024
✅ Caja@Venta2024
```

### Gestionar Usuarios:
1. Usar nombres descriptivos (juan_lopez, no user123)
2. Cambiar contraseñas cada 90 días
3. No compartir credenciales
4. Registrar quién creó cada usuario

### Seguridad en el Navegador:
1. No guardar contraseñas en navegador (si es público)
2. Usar Remember Me en dispositivos personales
3. Cerrar sesión después de usar
4. No compartir la pantalla mientras se crea usuario

---

## 📞 Soporte

### Contactar Admin para:
- Olvidé mi contraseña
- No puedo crear usuario
- Error del servidor
- Reportar usuario sospechoso
- Cambiar permisos de usuario

---

**Versión:** 2.0 - Sistema Seguro  
**Estado:** ✅ En Producción
