# PHASE 2 - CIERRE DE CAJAS - DOCUMENTACIÓN

## Estado: ✅ RUTAS Y VISTAS COMPLETADAS

### Resumen
Se ha implementado el módulo completo de Cierre de Cajas con:
- **Modelo Mongoose** con schema completo
- **Rutas API** con CRUD y reportes
- **Vistas EJS** modernas y responsivas
- **CSS** integrado con diseño consistente

---

## 1. MODELO DE DATOS

### Archivo: `/models/cierreDeCaja.js`

**Campos principales:**

```javascript
// Identificación
- estacionDeCobro (ref EstacionDeCobro)
- usuarioQueCierra (ref Usuario)
- ubicacionDeEstacion (String)
- nombreDelUsuario (String)

// Fechas
- fechaDeApertura (Date)
- fechaDeCierre (Date)
- periodo (enum: DIARIO, SEMANAL, MENSUAL)

// Dinero
- dineroDeInicio (Number)
- dineroEnCaja (Number)
- dineroEsperado (Number)
- dineroReal (Number)
- diferencia (Number - calculado)

// Ventas
- ventasEnEfectivo: { cantidad, montoTotal }
- ventasEnOtro: { cantidad, montoTotal }

// Movimientos manuales
- ingresosManualDinero: { cantidad, montoTotal }
- egresosManualDinero: { cantidad, montoTotal }

// Detalles
- detallesDeVentas: [{ ventaId, monto, tipoPago, fecha }]
- detallesIngresosEgresos: [{ tipo, monto, concepto, fecha, comentario }]

// Estado
- estado (enum: ABIERTO, CERRADO, CONCILIADO)
- notasDelCierre (String)
```

---

## 2. RUTAS IMPLEMENTADAS

### Archivo: `/routes/administradorCierreDeCaja.js`

#### **VISTAS (GET)**

```
GET /
- Listar todos los cierres con populate
- Middleware: isLoggedIn, isAdmin(ADMINISTRADOR)
- Renderiza: panelCierres/verTodosLosCierres

GET /:id
- Ver detalle individual de un cierre
- Middleware: isLoggedIn, isAdmin(ADMINISTRADOR)
- Renderiza: panelCierres/verCierreIndividual
```

#### **DATOS (POST)**

```
POST /inicio-cierre/datos
- Obtiene información para iniciar un cierre
- Body: { estacionId }
- Retorna JSON con:
  - Datos de la estación
  - Totales de ventas desde último cierre
  - Dinero esperado

POST /crear
- Crea nuevo cierre de caja
- Middleware: isLoggedIn, isCaja(CAJA)
- Body: { estacionId, dineroEnCaja, notasDelCierre, periodo }
- Calcula: dineroEsperado, diferencia
- Actualiza: dineroEnEstacion en estación
```

#### **REPORTES (GET)**

```
GET /reportes/resumen
- Resumen semanal, mensual y global
- Retorna totales y cantidades

GET /reportes/por-estacion/:estacionId
- Totales por estación (semanal y mensual)

GET /reportes/detalle-semanal
- Listado detallado de cierres de esta semana

GET /reportes/detalle-mensual
- Listado detallado de cierres de este mes
```

#### **FUNCIONES AUXILIARES**

```javascript
obtenerVentasEnRango(estacionId, fechaInicio, fechaFin)
- Busca ventas en un rango de fechas

calcularTotalesVentas(ventas)
- Suma ventas por tipo (EFECTIVO, OTRO)
- Retorna: { efectivo: {cantidad, monto}, otro: {cantidad, monto} }

obtenerPeriodo(tipo, fecha)
- Calcula inicio/fin para DIARIO, SEMANAL, MENSUAL
```

---

## 3. VISTAS IMPLEMENTADAS

### Vista 1: `/views/panelCierres/listado.ejs` (NEW)

**Características:**
- Dashboard con 4 tarjetas de resumen (Semanal, Mensual, Global, Cantidad)
- Tabla desktop responsiva con todos los cierres
- Búsqueda en tiempo real por estación/usuario
- Vista mobile con tarjetas
- Badges de estado, diferencia (ganancia/pérdida/igual)
- Acciones con enlace a detalle

**Estilos CSS:**
- Gradientes de colores para tarjetas totales
- Responsive: Grid auto-fit minmax(250px)
- Mobile: Table → Cards conversion
- Badges con colores intuitivos

### Vista 2: `/views/panelCierres/verCierreIndividual.ejs` (ACTUALIZADA)

**Características:**
- Breadcrumb para navegación
- Header con gradient y botón volver
- 4 tarjetas de estado (Estado, Fecha, Usuario, Período)
- Sección Dinero: 4 cards (Inicial, Esperado, Real, Diferencia)
- Sección Ventas: 2 cards (Efectivo, Otro medio)
- Tabla de detalles de operaciones
- Sección de notas

**Responsividad:**
- Desktop: Layouts completos
- Tablet: Grids ajustados
- Mobile: Tables → Filas con data-labels

---

## 4. ESTILOS CSS

### Archivo: `/public/styles/admin.css`

**Nuevas secciones agregadas:**

```css
/* Cierres - Header */
.cierres-header
.cierres-title-section
.cierres-main-title

/* Totales Grid */
.cierres-totales-grid
.cierre-total-card
.total-card-icon
.total-card-label
.total-card-value

/* Tabla */
.cierres-table-container
.cierres-table-header
.cierres-search-input
.cierres-table
.cierres-table thead/tbody

/* Badges */
.fecha-badge
.estacion-badge
.usuario-badge
.money-badge
.diferencia-badge
.ventas-badge
.estado-badge

/* Detalle Individual */
.cierre-detalle-header
.detalle-title
.btn-volver

/* Dinero Section */
.cierre-dinero-section
.dinero-cards-grid
.dinero-card
.dinero-card-icon
.dinero-card-value

/* Ventas Section */
.cierre-ventas-section
.ventas-cards-grid
.ventas-card
.ventas-card-header
.ventas-card-body

/* Detalles Table */
.detalles-table
.badge-tipo-pago

/* Notas */
.cierre-notas-section
.notas-card
```

**Breakpoints responsivos:**
- Desktop: 768px+
- Tablet: 480px - 767px
- Mobile: < 480px

---

## 5. FLUJO DE DATOS

### Crear Cierre (POST /crear)

```
1. Usuario (CAJA) submite formulario
   ↓
2. Obtiene último cierre de la estación
   ↓
3. Busca ventas desde último cierre
   ↓
4. Calcula totales por tipo de pago
   ↓
5. Calcula:
   - dineroDeInicio = último cierre.dineroEnCaja
   - dineroEsperado = dineroDeInicio + ventasEfectivo
   - diferencia = dineroReal - dineroEsperado
   ↓
6. Crea documento CierreDeCaja
   ↓
7. Actualiza estación.dineroEnEstacion
   ↓
8. Retorna success + cierreId
```

### Obtener Reportes

```
GET /reportes/resumen
  ↓
Busca cierres en periodo SEMANAL
Busca cierres en periodo MENSUAL
Busca TODOS los cierres (global)
  ↓
Suma ventasEnEfectivo.montoTotal
  ↓
Retorna totales + cantidades
```

---

## 6. SEGURIDAD

### Middleware aplicado:

```javascript
isLoggedIn
- Verifica que usuario esté autenticado
- Redirige a login si no

isAdmin(roleADM)
- Verifica que usuario sea ADMINISTRADOR
- Solo puede ver cierres y reportes

isCaja(roleCaja)
- Verifica que usuario sea CAJA
- Solo puede crear cierres
```

---

## 7. PRÓXIMOS PASOS - FASE DATA

Cuando se completen todas las vistas, se ejecutarán:

1. **Optimización de Índices**
   - Agregar índices en: estacionDeCobro, periodo, usuarioQueCierra

2. **Agregaciones optimizadas**
   - Usar aggregation pipeline de MongoDB
   - Caché de reportes diarios

3. **Validaciones avanzadas**
   - Pre-hooks: Calcular diferencia automática
   - Post-hooks: Auditoría de cambios

4. **Reportes avanzados**
   - Excel export de cierres
   - Gráficos de tendencias
   - Análisis de discrepancias

---

## 8. URLS DE ACCESO

### Admin Dashboard
```
GET /administrador/cierres-caja
   → Listado de todos los cierres

GET /administrador/cierres-caja/:id
   → Detalle individual del cierre
```

### API Endpoints (JSON)
```
GET /administrador/cierres-caja/reportes/resumen
   → {semanal, mensual, global}

GET /administrador/cierres-caja/reportes/por-estacion/:id
   → {semanal, mensual} por estación

GET /administrador/cierres-caja/reportes/detalle-semanal
   → Detalle completo de esta semana

GET /administrador/cierres-caja/reportes/detalle-mensual
   → Detalle completo de este mes

POST /administrador/cierres-caja/inicio-cierre/datos
   → {estacionId} → Calcula montos esperados

POST /administrador/cierres-caja/crear
   → {estacionId, dineroEnCaja, notasDelCierre, periodo}
```

---

## 9. NOTAS TÉCNICAS

### Cálculos importantes:

```javascript
// Dinero Esperado
dineroEsperado = dineroDeInicio + ventasEnEfectivo.montoTotal

// Diferencia (puede ser +/- o 0)
diferencia = dineroReal - dineroEsperado

// Si diferencia > 0 → Ganancia (verde)
// Si diferencia < 0 → Pérdida (rojo)
// Si diferencia = 0 → Cuadrado (gris)
```

### Períodos soportados:

```javascript
DIARIO:   00:00 - 23:59 mismo día
SEMANAL:  Lunes 00:00 - Domingo 23:59
MENSUAL:  Día 1 00:00 - Último día 23:59
```

### Estados del cierre:

```javascript
ABIERTO     → Recién creado, editable
CERRADO     → Finalizado, no editable
CONCILIADO  → Revisado por administrador
```

---

## 10. ESTADÍSTICAS

### Files Created:
- ✅ `/models/cierreDeCaja.js` (150 líneas)
- ✅ `/views/panelCierres/listado.ejs` (500+ líneas)
- ✅ `/views/panelCierres/verCierreIndividual.ejs` (actualizada - 772 líneas)

### Files Modified:
- ✅ `/routes/administradorCierreDeCaja.js` (450+ líneas)
- ✅ `/public/styles/admin.css` (+600 líneas CSS)

### Total líneas agregadas:
- Backend: ~600 líneas
- Frontend: ~1500 líneas
- Estilos: ~600 líneas

**Total: ~2700 líneas de código funcional**

---

## 11. TESTING MANUAL

### Crear cierre:
```
1. Login como usuario CAJA
2. POST /administrador/cierres-caja/crear
3. Ver en GET /administrador/cierres-caja
```

### Ver reportes:
```
1. Login como ADMINISTRADOR
2. GET /administrador/cierres-caja/reportes/resumen
3. Ver totales semanal/mensual/global
```

### Búsqueda:
```
1. En listado, escribir en input #searchCierres
2. Filtra en tiempo real por estación/usuario
```

---

## ESTADO ACTUAL: ✅ LISTO PARA PHASE 3 (DATA)

- ✅ Modelo con schema completo
- ✅ Rutas CRUD + reportes
- ✅ Vistas responsivas
- ✅ CSS integrado
- ✅ Cálculos automáticos
- ✅ Seguridad por middleware

**Próximo: Optimizaciones de data layer**
