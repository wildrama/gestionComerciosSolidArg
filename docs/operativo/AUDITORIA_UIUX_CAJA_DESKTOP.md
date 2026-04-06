# Auditoría UI/UX Desktop — Módulo `CAJA`

**Fecha:** 2026-04-06  
**Enfoque:** experiencia de mostrador / escritorio, teclado, lector de código y operación rápida.  
**Sin cambios:** lógica de negocio, persistencia y flujo de ventas.

---

## Hallazgos detectados

### 1. Claridad operativa
- La terminal ya tenía una buena base, pero faltaban **indicadores inmediatos** de la venta actual: líneas, unidades y medio de pago activo.
- Los atajos de teclado estaban presentes en texto, aunque no quedaban visualmente destacados para el cajero.

### 2. Jerarquía visual
- La zona de cobro y los datos de resumen no se separaban con suficiente énfasis para trabajo intenso en escritorio.
- La cabecera y los modales tenían margen de mejora para escaneo rápido visual.

### 3. Desktop workflow
- En ventas con muchos productos, faltaba una mejor sensación de “terminal de escritorio”: resumen más fijo, tabla más estable y lectura más continua.
- La interfaz de acceso a caja y selección de estación podía orientar mejor al operador de escritorio.

### 4. Accesibilidad y ergonomía
- Faltaban mejoras pequeñas pero importantes: `skip link`, roles de diálogo, `aria-live`, `aria-labels` en acciones repetidas y toggle accesible de contraseña.

---

## Mejoras implementadas

### Terminal activa (`views/caja/cajacobro.ejs`)
- Se agregó acceso directo al contenido principal (`skip link`).
- Se incorporó una **franja operativa** con:
  - cantidad de líneas cargadas
  - unidades en venta
  - medio de pago activo
- Se reforzaron los **atajos de teclado** como chips visuales.
- Se mejoró la accesibilidad del estado dinámico (`role="status"`, `aria-live`).
- Se formalizaron los modales con `role="dialog"` y mejor semántica.

### JS de terminal (`public/js/caja-terminal.js`)
- Actualización en tiempo real de KPIs operativos de la venta.
- Mejoras en accesibilidad para botones de sumar/restar/quitar y resultados del buscador.
- Sin cambios en la lógica de cálculo ni en el proceso de checkout.

### Estilos desktop-first (`public/styles/caja-desktop.css`)
- Sidebar más estable para escritorio.
- Tabla de venta con mejor comportamiento visual y scroll operativo.
- Mejoras de foco visible, contraste y modales.
- Ajustes para login y selección de estaciones con enfoque de escritorio.

### Acceso / apertura
- `views/ingresoCaja.ejs`: guía visual desktop + toggle de contraseña accesible.
- `views/inicioCajas.ejs`: tip de operación para escritorio antes de elegir estación.
- `views/caja/cajainicio.ejs`: checklist breve antes de iniciar caja.

---

## Archivos modificados

- `public/styles/caja-desktop.css`
- `views/partials/headerCaja.ejs`
- `views/caja/cajacobro.ejs`
- `public/js/caja-terminal.js`
- `views/ingresoCaja.ejs`
- `views/inicioCajas.ejs`
- `views/caja/cajainicio.ejs`

---

## Verificación realizada

- Revisión de errores de archivos modificados: **sin errores**
- Verificación local: `http://localhost:3037` respondió **HTTP 200**

---

## Próximos pulidos recomendados

1. Unificar visualmente `navbarUnificada` para que la experiencia de CAJA se sienta aún más separada del backoffice.
2. Agregar un modo de “alto contraste” opcional para cajas con mucha luz ambiente.
3. Si la operación crece, sumar una vista secundaria para teclado numérico / pago rápido sin abrir más modales.
