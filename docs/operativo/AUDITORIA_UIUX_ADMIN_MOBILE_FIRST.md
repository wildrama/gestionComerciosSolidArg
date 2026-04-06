# Auditoría UI/UX Mobile First — Módulo `ADMINISTRADOR`

**Fecha:** 2026-04-06  
**Alcance:** navegación, dashboard, stock, buscador, ofertas y alta de usuarios del panel administrador.  
**Excluido:** módulo `CAJA`, lógica de negocio y flujos de cobro.

---

## 1) Hallazgos principales

### Navegación
- El menú mobile no tenía atributos accesibles (`aria-expanded`, `aria-controls`) ni cierre por `Escape`.
- La navegación rápida generaba demasiado peso visual en pantallas pequeñas.
- Faltaba feedback visual del link activo.

### Jerarquía visual y consistencia
- Había muchos estilos inline repetidos en vistas administrativas.
- Botones y acciones mezclaban tamaños, colores y espaciados distintos.
- Algunas pantallas priorizaban la densidad de información por encima de la lectura táctil.

### Formularios y usabilidad táctil
- Faltaban `labels`/ayudas consistentes en buscadores y formularios.
- Varios controles no estaban optimizados para teclado móvil (`inputmode`, `enterkeyhint`, `autocomplete`).
- El toggle de contraseña no era accesible para lectores de pantalla.

### Accesibilidad
- No existía un “skip link” al contenido principal.
- Varias acciones dependían solo del color o del ícono.
- Faltaban `aria-labels` en botones clave de búsqueda, ofertas y detalle de producto.

### Responsividad y performance
- En `Ofertas`, la tabla quedaba oculta en mobile por una regla que escondía `.ofertas-table-wrapper` a `<= 768px`.
- En stock mobile faltaba paridad de acciones: no se podía imprimir código desde la card.
- El buscador deduplicaba por texto puro; al cambiar modo o criterio de orden no siempre relanzaba la búsqueda.

---

## 2) Mejoras implementadas

### Shared UI / navegación
- Menú admin con comportamiento accesible y mobile-first.
- `skip-link` al contenido principal.
- Estado activo para links del menú y accesos frecuentes.
- Mejoras de touch target y foco visible.

### Stock y búsqueda
- Inputs de búsqueda optimizados para mobile.
- Filtros con etiquetas accesibles y mejor jerarquía.
- Cards de stock mobile con tercera acción para imprimir código.
- `aria-live` para estados de resultados / vacíos.

### Ofertas
- Corrección del bug que ocultaba el listado en mobile.
- Estados `ACTIVA/PAUSADA` más claros con badges consistentes.
- Acciones con `aria-label` y formularios inline reutilizables.

### Usuarios
- Alta de usuario con ayudas consistentes.
- Toggle de contraseña accesible (`aria-pressed`, `aria-controls`).
- Mejor soporte de autocompletado en mobile.

### Interacción / JS
- Búsqueda optimizada con `DocumentFragment`.
- Re-ejecución correcta al cambiar modo de búsqueda o criterio de orden.
- Soporte para `Escape` como acción rápida de limpieza.

---

## 3) Archivos ajustados

- `views/partials/headerAdm.ejs`
- `public/js/admin-ui.js`
- `public/js/productSearch.js`
- `public/styles/app-unified.css`
- `public/styles/admin-mobile-first.css`
- `views/stock/verStock.ejs`
- `views/stock/listado.ejs`
- `views/stock/stockIndividual.ejs`
- `views/panelOfertas/ofertaInicio.ejs`
- `views/panelUsuarios/registrarUsuario.ejs`

---

## 4) Recomendaciones siguientes (sin tocar lógica)

1. Consolidar más estilos inline heredados en `editPrecio.ejs` y vistas administrativas secundarias.
2. Unificar componentes de tablas/card para evitar mantener dos layouts paralelos.
3. Añadir contraste verificado AA en todos los estados semánticos si el panel seguirá creciendo.
4. Incorporar pequeñas pruebas visuales/manuales por breakpoint (`360px`, `390px`, `768px`, `1024px`).
