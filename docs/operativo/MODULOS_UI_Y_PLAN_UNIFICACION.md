# Modulos funcionales UI y plan de unificacion (sin CAJA)

Fecha: 2026-03-31

## Objetivo
Unificar estilos dispersos en un solo punto de entrada para evolucionar por modulos sin romper la operacion actual.

## Regla principal
- CAJA queda fuera de esta unificacion por ahora.
- Los modulos no-CAJA cargan `public/styles/app-unified.css`.

## Modulos funcionales identificados

1. Stock (consulta/listado)
- Vistas principales: `views/stock/listado.ejs`, `views/stock/verStock.ejs`, `views/stock/stockIndividual.ejs`
- Ruta base: `/administrador/stock`
- Plantilla/CSS referencia: `views/stock/listado.ejs` + `public/styles/admin.css`

2. Carga y ajuste de stock
- Vistas principales: `views/stock/cargaStock.ejs`, `views/stock/actualizar.ejs`, `views/stock/editar.ejs`
- Plantilla/CSS referencia: `views/stock/cargaStock.ejs` + `public/styles/admin.css`

3. Edicion de precios online
- Vistas principales: `views/edit/editPrecio.ejs`
- Soporte JS: `public/editPrice.js`, `public/priceSync.js`
- Plantilla/CSS referencia: `views/edit/editPrecio.ejs` + `public/styles/admin.css`

4. Edicion de productos (catalogo)
- Vistas principales: `views/edit/editResponsive.ejs`, `views/editarProducto.ejs`, `views/producto-form.ejs`
- Plantilla/CSS referencia: `views/edit/editResponsive.ejs` + `public/styles/admin.css`

5. Repartidores y pedidos (flujo especial)
- Vistas principales: `views/pedidos/crearPedido.ejs`, `views/pedidos/verTodosLosPedidos.ejs`, `views/pedidos/verPedidoIndividual.ejs`, `views/pedidos/editarPedidoIndividual.ejs`
- Rutas base: `/pedidos`
- Plantilla/CSS referencia: `views/pedidos/verTodosLosPedidos.ejs` + `public/styles/admin.css`

6. Cierres diarios/semanales/mensuales y analitica
- Vistas principales: `views/panelCierres/verTodosLosCierres.ejs`, `views/panelCierres/verCierreIndividual.ejs`, `views/panelCierres/listado.ejs`
- Soporte de estaciones/cierre diario: `views/panelEstacionCobro/*.ejs`
- Plantilla/CSS referencia: `views/panelCierres/verTodosLosCierres.ejs` + `public/styles/admin.css`

7. Gestion de usuarios
- Vistas principales: `views/panelUsuarios/todosLosUsuarios.ejs`, `views/panelUsuarios/registrarUsuario.ejs`, `views/panelUsuarios/usuarioIndividual.ejs`
- Ruta base: `/administrador/userpanel`
- Plantilla/CSS referencia: `views/panelUsuarios/todosLosUsuarios.ejs` + `public/styles/admin.css`

8. Ofertas y promociones
- Vistas principales: `views/panelOfertas/ofertaInicio.ejs`, `views/panelOfertas/crearOfertaConjunto.ejs`, `views/panelOfertas/crearOfertaIndividualP1.ejs`, `views/panelOfertas/crearOfertaIndividualP2.ejs`
- Ruta base: `/administrador/ofertas`
- Plantilla/CSS referencia: `views/panelOfertas/ofertaInicio.ejs` + `public/styles/admin.css`

## Decisiones de unificacion aplicadas
- Nuevo punto de entrada unico: `public/styles/app-unified.css`.
- Headers no-CAJA migrados para usar el CSS unificado.
- Se conserva compatibilidad: no se eliminaron hojas historicas, se centralizo el include.

## Siguiente iteracion recomendada por orden
1. Usuarios
2. Stock base (listado + ver)
3. Edicion precios/productos
4. Pedidos/repartidores
5. Cierres
6. Ofertas

Cada iteracion:
- Definir tokens visuales del modulo
- Extraer componentes repetidos (cards, tablas, forms)
- Probar mobile/desktop
- Cerrar con checklist visual y funcional
