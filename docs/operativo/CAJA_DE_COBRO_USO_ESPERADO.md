# Caja de Cobro - Uso esperado

## Objetivo
La `Caja de Cobro` permite que un usuario con rol `CAJA` o `ADMINISTRADOR` registre ventas presenciales desde una interfaz pensada para escritorio, usando lector de código de barras y búsqueda manual sin perder la compra actual.

## Flujo operativo esperado
1. **Ingreso a caja**
   - El usuario entra desde `/ingreso-caja` o desde el link del panel administrador.
   - Selecciona la estación de cobro.
   - Inicia la jornada con la base de dinero ya cargada en la estación (`dineroDeInicio` / `dineroEnEstacion`).

2. **Carga de productos**
   - El cajero escanea productos con el lector de código.
   - También puede abrir la mini búsqueda manual para encontrar un producto por nombre, marca o código sin afectar la compra en curso.
   - La compra se arma como proceso individual por cliente.

3. **Ofertas integradas**
   - Se muestran ofertas precargadas tipo `Oferta 1-9` para agregarlas rápidamente al ticket.
   - Las ofertas automáticas por cantidad se contemplan al calcular subtotales de productos configurados en `OfertaSingular`.

4. **Cobro y registro**
   - Antes de cerrar la venta se elige el medio de pago:
     - `EFECTIVO`
     - `TRANSFERENCIA`
     - `TARJETA DÉBITO/CRÉDITO`
   - No se procesa el pago; solo se **registra la venta**.
   - Si el pago es en efectivo, el sistema calcula el vuelto.

5. **Impacto en stock y ventas**
   - Al registrar la venta, se guarda un documento en `Venta`.
   - Se descuenta stock de los productos vendidos.
   - Se incrementa el historial de la estación de cobro.

## Accesos disponibles
- **Administrador:** link directo en el panel principal.
- **Caja:** ingreso por el flujo `/ingreso-caja`.

## Alcance actual
- La interfaz está optimizada para **desktop**.
- `TRANSFERENCIA` y `TARJETA` se registran hoy dentro del tipo persistido `OTRO`, respetando el modelo actual sin modificar esquema.

## Atajos útiles de uso
- `Enter`: agregar desde el campo de código.
- `F4`: abrir mini búsqueda.
- `F9`: registrar la venta.
- `Esc`: cerrar mini búsqueda.
