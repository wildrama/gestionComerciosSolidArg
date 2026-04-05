# ISIDORITO - Resumen funcional (basado en codigo)

Fecha de relevamiento: 2026-03-31

## 1) Objetivo del sistema
Aplicacion web para operacion diaria de un negocio con:
- Gestion de productos
- Manejo de stock y precios
- Venta en caja
- Clientes y pedidos
- Ofertas
- Cierre de caja
- Control de acceso por roles

## 2) Stack actual
- Node.js + Express
- MongoDB + Mongoose
- EJS (render server-side)
- Passport Local + express-session + connect-mongo

Archivo de entrada operativo:
- index.js

Nota:
- app.js esta reducido a un stub y no actua como servidor principal.

## 3) Modulos funcionales detectados
- Login/usuarios: routes/usuarios.js
- Panel administrador (home): routes/ingresos.js
- Productos: routes/administradorProductos.js
- Busqueda administracion: routes/administradorBuscar.js
- Stock: routes/stock.js
- Ofertas: routes/administradorOfertas.js y routes/ofertas-search.js
- Estaciones/caja: routes/administradorEstaciones.js, routes/cajaRegular.js, routes/cajaAdministrador.js
- Cierres de caja: routes/administradorCierreDeCaja.js
- Clientes: routes/clientesRutas.js
- Pedidos: routes/pedidosRutas.js
- Guardado de ventas: routes/savesDeCaja.js

## 4) Estado de autorizacion (hallazgos)
Hallazgos confirmados durante este ordenamiento:
- Habia rutas administrativas con middleware de rol comentado o faltante.
- Habia imports de middleware no existentes en algunos archivos administrativos.

Correcciones aplicadas en esta intervencion:
- routes/administradorBuscar.js
  - Se agrego control de rol ADMINISTRADOR en:
    - POST /api/buscar-texto
    - POST /api/buscar-codigo
- routes/administradorEstaciones.js
  - Se agrego guardia global: router.use(isLoggedIn, isAdmin('ADMINISTRADOR'))
- routes/administradorUsuarios.js
  - Se corrigio import de middleware
  - Se agrego guardia global: router.use(isLoggedIn, isAdmin('ADMINISTRADOR'))
- routes/administradorOfertas.js
  - Se agrego guardia global: router.use(isLoggedIn, isAdmin('ADMINISTRADOR'))

## 5) Riesgos pendientes recomendados
- Revisar rutas no administrativas que hoy operan con autenticacion parcial (clientes, pedidos, guardado de ventas) para validar regla por rol segun negocio.
- Consolidar middlewares legados en middleware.js (isAdmin, isCaja, hasAnyRole) para simplificar mantenimiento.
- Unificar estrategia de redireccion ante denegacion de permiso para evitar loops o perdida de contexto.

## 6) Recomendacion para pasar a PRD
Antes de PRD, ejecutar una pasada de QA funcional por rol:
- ADMINISTRADOR
- CAJA
- REPARTIDOR

Checklist minimo:
- Login y logout
- Acceso a paneles por rol
- Acceso denegado en rutas sensibles
- CRUD de productos
- Venta de caja y cierre
- Modulo stock/ofertas
