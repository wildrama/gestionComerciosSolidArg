const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAdmin, isCaja } = require('../middleware');
const EstacionDeCobro = require('../models/estaciondecobro');
const Venta = require('../models/ventas');
const CierreCaja = require('../models/cierreDeCaja');




const roleADM = 'ADMINISTRADOR';
const roleCaja = 'CAJA';

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const hasValue = (value) => value !== undefined && value !== null && value !== '';

function resolvePaymentType(ventaOrType) {
  if (!ventaOrType) return '';

  if (typeof ventaOrType === 'string') {
    const normalized = ventaOrType.toUpperCase();
    return ['EFECTIVO', 'DEBITO', 'CREDITO', 'TRANSFERENCIA', 'TARJETA', 'OTRO'].includes(normalized)
      ? normalized
      : normalized;
  }

  const explicitType = resolvePaymentType(ventaOrType.tipoDePago);
  if (explicitType) return explicitType;

  const ingreso = toNumber(ventaOrType.dineroIngresado);
  const salida = toNumber(ventaOrType.dineroDeSalida);

  if (salida > 0) return 'EFECTIVO';
  if (ingreso > 0) return 'OTRO';
  return '';
}

function getVentaItemsRaw(venta = {}) {
  return [
    ...(Array.isArray(venta.productosDeStock) ? venta.productosDeStock : []),
    ...(Array.isArray(venta.productosSinStock) ? venta.productosSinStock : [])
  ];
}

function getProductoDisplayName(producto, fallbackId) {
  if (producto && typeof producto === 'object') {
    return producto.nombre || `Producto #${fallbackId}`;
  }

  if (typeof producto === 'string' && producto.trim()) {
    return /^[a-f\d]{24}$/i.test(producto)
      ? `Producto #${producto.slice(-6).toUpperCase()}`
      : producto;
  }

  return `Producto #${fallbackId}`;
}

function getVentaProductsTotal(venta = {}) {
  return getVentaItemsRaw(venta).reduce((sum, item) => sum + toNumber(item && item.valorDelProductoEnLaCompra), 0);
}

function getVentaTotal(venta = {}) {
  const ingreso = toNumber(venta.dineroIngresado);
  const salida = toNumber(venta.dineroDeSalida);
  const paymentType = resolvePaymentType(venta);

  if (ingreso > 0 || salida > 0) {
    const total = paymentType === 'EFECTIVO' ? ingreso - salida : ingreso;
    return Number(total.toFixed(2));
  }

  return Number(getVentaProductsTotal(venta).toFixed(2));
}

function buildVentaProductDetail(venta = {}) {
  const grouped = new Map();

  getVentaItemsRaw(venta).forEach((item, index) => {
    const producto = item ? item.identificadorDeProducto : null;
    const productoId = producto && typeof producto === 'object' ? producto._id : producto;
    const key = productoId ? String(productoId) : `item-${index}`;
    const fallbackId = productoId ? String(productoId).slice(-6).toUpperCase() : `${index + 1}`;
    const current = grouped.get(key) || {
      nombre: getProductoDisplayName(producto, fallbackId),
      cantidad: 0,
      total: 0
    };

    current.cantidad += 1;
    current.total += toNumber(item && item.valorDelProductoEnLaCompra);
    grouped.set(key, current);
  });

  return Array.from(grouped.values()).map((item) => ({
    ...item,
    precioUnitario: item.cantidad ? Number((item.total / item.cantidad).toFixed(2)) : 0,
    total: Number(item.total.toFixed(2))
  }));
}

function getPaymentLabel(tipoDePago) {
  switch (tipoDePago) {
    case 'EFECTIVO':
      return 'Efectivo';
    case 'DEBITO':
      return 'Débito';
    case 'CREDITO':
      return 'Crédito';
    case 'TRANSFERENCIA':
      return 'Transferencia';
    case 'TARJETA':
      return 'Tarjeta';
    case 'OTRO':
      return 'Tarjeta / Transferencia';
    default:
      return tipoDePago || 'Sin definir';
  }
}

function getPaymentClass(tipoDePago) {
  if (tipoDePago === 'EFECTIVO') return 'cash';
  if (tipoDePago === 'DEBITO' || tipoDePago === 'CREDITO' || tipoDePago === 'TARJETA') return 'card';
  if (tipoDePago === 'TRANSFERENCIA') return 'transfer';
  return 'other';
}

function buildVentaDetailViewModel(venta) {
  if (!venta || typeof venta !== 'object') {
    const ventaId = venta ? String(venta) : 'SIN-ID';
    return {
      _id: ventaId,
      codigoVenta: ventaId.slice(-6).toUpperCase(),
      totalVenta: 0,
      paymentLabel: 'Sin definir',
      paymentClass: 'other',
      detalleProductos: [],
      cantidadDeProductosTotales: 0,
      dineroIngresado: null,
      dineroDeSalida: null,
      ticketEntregado: 'NO REGISTRADO',
      ticketClass: 'unknown',
      ticketLabel: 'Sin registro',
      fechaTexto: '-',
      horaTexto: '-',
      observacionDatos: 'No se pudo recuperar el detalle completo de esta venta histórica.',
      dataCompleta: false
    };
  }

  const detalleProductos = buildVentaProductDetail(venta);
  const cantidadInferida = detalleProductos.reduce((sum, item) => sum + toNumber(item.cantidad), 0);
  const cantidadRegistrada = toNumber(venta.cantidadDeProductosTotales, 0);
  const subtotalProductos = detalleProductos.reduce((sum, item) => sum + toNumber(item.total), 0);
  const paymentType = resolvePaymentType(venta);
  const hasIngreso = hasValue(venta.dineroIngresado);
  const hasSalida = hasValue(venta.dineroDeSalida);
  const ticketStatus = venta.ticketEntregado === 'SI'
    ? 'SI'
    : venta.ticketEntregado === 'NO'
      ? 'NO'
      : 'NO REGISTRADO';

  const observaciones = [];
  if (!hasIngreso && !hasSalida) observaciones.push('Monto no disponible en el registro original.');
  if (!paymentType) observaciones.push('Tipo de pago sin definir.');
  if (!venta.createdAt) observaciones.push('Fecha y hora sin registrar.');
  if (!detalleProductos.length) observaciones.push('No hay productos asociados guardados.');

  return {
    ...venta,
    codigoVenta: String(venta._id || 'SIN-ID').slice(-6).toUpperCase(),
    totalVenta: getVentaTotal({ ...venta, tipoDePago: paymentType }),
    subtotalProductos: Number(subtotalProductos.toFixed(2)),
    paymentType,
    paymentLabel: getPaymentLabel(paymentType),
    paymentClass: getPaymentClass(paymentType),
    detalleProductos,
    cantidadDeProductosTotales: cantidadRegistrada > 0 ? cantidadRegistrada : cantidadInferida,
    dineroIngresado: hasIngreso ? Number(toNumber(venta.dineroIngresado).toFixed(2)) : null,
    dineroDeSalida: hasSalida ? Number(toNumber(venta.dineroDeSalida).toFixed(2)) : null,
    ticketEntregado: ticketStatus,
    ticketClass: ticketStatus === 'SI' ? 'yes' : ticketStatus === 'NO' ? 'no' : 'unknown',
    ticketLabel: ticketStatus === 'SI' ? 'Entregado' : ticketStatus === 'NO' ? 'No entregado' : 'Sin registro',
    fechaTexto: venta.createdAt ? new Date(venta.createdAt).toLocaleDateString('es-AR') : '-',
    horaTexto: venta.createdAt
      ? new Date(venta.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
      : '-',
    observacionDatos: observaciones.join(' '),
    dataCompleta: observaciones.length === 0
  };
}

function getPeriodRange(periodo = 'DIARIO', baseDate = new Date()) {
  const date = new Date(baseDate);

  if (periodo === 'SEMANAL') {
    const day = date.getDay() || 7;
    const inicio = new Date(date);
    inicio.setDate(date.getDate() - day + 1);
    inicio.setHours(0, 0, 0, 0);

    const fin = new Date(inicio);
    fin.setDate(inicio.getDate() + 6);
    fin.setHours(23, 59, 59, 999);
    return { inicio, fin };
  }

  if (periodo === 'MENSUAL') {
    const inicio = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
    const fin = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    return { inicio, fin };
  }

  const inicio = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  const fin = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
  return { inicio, fin };
}

function buildCierreSnapshot(estacionDeCobro, ventas, periodo = 'DIARIO', dineroRealInput) {
  const { inicio, fin } = getPeriodRange(periodo);
  const withinRange = (fecha) => {
    const date = new Date(fecha || Date.now());
    return date >= inicio && date <= fin;
  };

  const ingresos = (estacionDeCobro.ingresosDeEfectivoManual || []).filter((mov) => withinRange(mov.fecha));
  const egresos = (estacionDeCobro.egresoDeEfectivoManual || []).filter((mov) => withinRange(mov.fecha));

  const ingresosTotal = ingresos.reduce((sum, mov) => sum + toNumber(mov.cantidad), 0);
  const egresosTotal = egresos.reduce((sum, mov) => sum + toNumber(mov.cantidad), 0);

  const ventasEnEfectivo = { cantidad: 0, montoTotal: 0 };
  const ventasEnOtro = { cantidad: 0, montoTotal: 0 };

  const detallesDeVentas = ventas.map((venta) => {
    const totalVenta = getVentaTotal(venta);

    if (resolvePaymentType(venta) === 'EFECTIVO') {
      ventasEnEfectivo.cantidad += 1;
      ventasEnEfectivo.montoTotal += totalVenta;
    } else {
      ventasEnOtro.cantidad += 1;
      ventasEnOtro.montoTotal += totalVenta;
    }

    return {
      ventaId: venta._id,
      monto: totalVenta,
      tipoPago: getPaymentLabel(resolvePaymentType(venta)),
      fecha: venta.createdAt
    };
  });

  const detallesIngresosEgresos = [
    ...ingresos.map((mov) => ({
      tipo: 'INGRESO',
      monto: toNumber(mov.cantidad),
      concepto: 'Ingreso manual',
      fecha: mov.fecha,
      comentario: mov.comentarioDeIngreso || ''
    })),
    ...egresos.map((mov) => ({
      tipo: 'EGRESO',
      monto: toNumber(mov.cantidad),
      concepto: 'Egreso manual',
      fecha: mov.fecha,
      comentario: mov.comentarioDeEgreso || ''
    }))
  ].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  const dineroEsperado = Number((
    toNumber(estacionDeCobro.dineroDeInicio) + ventasEnEfectivo.montoTotal + ingresosTotal - egresosTotal
  ).toFixed(2));

  const dineroReal = Number(
    toNumber(dineroRealInput, toNumber(estacionDeCobro.dineroEnEstacion)).toFixed(2)
  );

  return {
    periodo,
    fechaDeApertura: inicio,
    fechaDeCierre: new Date(),
    dineroDeInicio: Number(toNumber(estacionDeCobro.dineroDeInicio).toFixed(2)),
    dineroEnCaja: dineroReal,
    dineroEsperado,
    dineroReal,
    diferencia: Number((dineroReal - dineroEsperado).toFixed(2)),
    ventasEnEfectivo: {
      cantidad: ventasEnEfectivo.cantidad,
      montoTotal: Number(ventasEnEfectivo.montoTotal.toFixed(2))
    },
    ventasEnOtro: {
      cantidad: ventasEnOtro.cantidad,
      montoTotal: Number(ventasEnOtro.montoTotal.toFixed(2))
    },
    ingresosManualDinero: {
      cantidad: ingresos.length,
      montoTotal: Number(ingresosTotal.toFixed(2))
    },
    egresosManualDinero: {
      cantidad: egresos.length,
      montoTotal: Number(egresosTotal.toFixed(2))
    },
    detallesDeVentas,
    detallesIngresosEgresos,
    totalVentas: Number((ventasEnEfectivo.montoTotal + ventasEnOtro.montoTotal).toFixed(2)),
    totalTransacciones: ventas.length,
    rangoTexto: `${inicio.toLocaleDateString('es-AR')} - ${fin.toLocaleDateString('es-AR')}`
  };
}

router.use(isLoggedIn, isAdmin(roleADM));

// mostrar las estaciones y ultimas ventas
router.get('/', async (req, res) => {
  console.log(req.user.funcion)
  try {

    const estacionesDeCobro = await EstacionDeCobro.find({});

    res.render('panelEstacionCobro/verTodasLasEstaciones', { estacionesDeCobro })
  } catch (error) {
    console.log(error)
    res.redirect('/administrador')
  }

});


// crear estacion

// render formulario
router.get('/nuevaestacion', (req, res) => {
  console.log(req.user, 'req.user....');
  res.render('panelEstacionCobro/crearEstacion');
});

// enviar formulario para la creacion de la estacion
router.post('/nuevaestacion', catchAsync(async (req, res) => {
  const dineroDeInicio = req.body.dineroEnEstacion;
  const ubicacionDeEstacion = req.body.ubicacionDeEstacion
  const nuevaEstacion = new EstacionDeCobro({ 
    dineroDeInicio: dineroDeInicio, 
    dineroEnEstacion: dineroDeInicio, 
    ubicacionDeEstacion: ubicacionDeEstacion 
  });
  await nuevaEstacion.save();

  req.flash('success', 'Estación de cobro creada');
  res.redirect(`/administrador/estacionesdecobro/${nuevaEstacion._id}`)
}))


// subtotal1 Dinero de inicio- Subtotal2- dinero de ventas-  dinero que debe haber en caja: TOTAL
//  agregar datos a la estación 

router.get('/:id', catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const estacionDeCobro = await EstacionDeCobro.findById(id).lean();

    if (!estacionDeCobro) {
      req.flash('error', 'No se encontró la estación de cobro');
      return res.redirect('/administrador/estacionesdecobro');
    }

    const ventaIds = (estacionDeCobro.ventasRealizadasEnLaEstacion || []).map((ventaId) => String(ventaId));
    const ventas = ventaIds.length
      ? await Venta.find({ _id: { $in: ventaIds } })
          .sort({ createdAt: -1 })
          .populate('productosDeStock.identificadorDeProducto')
          .lean()
      : [];

    const ventasDetalladas = ventas.map((venta) => buildVentaDetailViewModel(venta));
    const ventasEncontradas = new Set(ventas.map((venta) => String(venta._id)));
    const ventasHistoricasSinDocumento = ventaIds
      .filter((ventaId) => !ventasEncontradas.has(String(ventaId)))
      .map((ventaId) => buildVentaDetailViewModel({ _id: ventaId, nombreDelUsuario: 'Registro histórico' }));

    estacionDeCobro.ventasRealizadasEnLaEstacion = [...ventasDetalladas, ...ventasHistoricasSinDocumento];
    res.render('panelEstacionCobro/verEstacion', { estacionDeCobro });
  } catch (error) {
    req.flash('error', 'No se puede ingresar a la caja');
    res.redirect('/administrador/estacionesdecobro');
  }
}));

router.get('/:estacionId/ventas/:ventaId', catchAsync(async (req, res) => {
  const { estacionId, ventaId } = req.params;

  const estacionDeCobro = await EstacionDeCobro.findById(estacionId).lean();

  if (!estacionDeCobro) {
    req.flash('error', 'No se encontró la estación de cobro');
    return res.redirect('/administrador/estacionesdecobro');
  }

  const ventaReferenciada = (estacionDeCobro.ventasRealizadasEnLaEstacion || []).some(
    (ventaRefId) => String(ventaRefId) === String(ventaId)
  );

  if (!ventaReferenciada) {
    req.flash('error', 'La venta solicitada no pertenece a esta estación');
    return res.redirect(`/administrador/estacionesdecobro/${estacionId}`);
  }

  const venta = await Venta.findById(ventaId)
    .populate('productosDeStock.identificadorDeProducto')
    .lean();

  const ventaView = buildVentaDetailViewModel(venta || { _id: ventaId, nombreDelUsuario: 'Registro histórico' });
  res.render('panelEstacionCobro/detalle-venta', { estacionDeCobro, venta: ventaView });
}));

router.get('/:estacionId/ventas/:ventaId/imprimir', catchAsync(async (req, res) => {
  const { estacionId, ventaId } = req.params;

  const estacionDeCobro = await EstacionDeCobro.findById(estacionId).lean();

  if (!estacionDeCobro) {
    req.flash('error', 'No se encontró la estación de cobro');
    return res.redirect('/administrador/estacionesdecobro');
  }

  const ventaReferenciada = (estacionDeCobro.ventasRealizadasEnLaEstacion || []).some(
    (ventaRefId) => String(ventaRefId) === String(ventaId)
  );

  if (!ventaReferenciada) {
    req.flash('error', 'La venta solicitada no pertenece a esta estación');
    return res.redirect(`/administrador/estacionesdecobro/${estacionId}`);
  }

  const venta = await Venta.findById(ventaId)
    .populate('productosDeStock.identificadorDeProducto')
    .lean();

  const ventaView = buildVentaDetailViewModel(venta || { _id: ventaId, nombreDelUsuario: 'Registro histórico' });
  res.render('panelEstacionCobro/imprimir-venta-remito', {
    estacionDeCobro,
    venta: ventaView,
    printedBy: req.user.username
  });
}));

router.get('/:estacionId/ventas/:ventaId/ticket', catchAsync(async (req, res) => {
  const { estacionId, ventaId } = req.params;

  const estacionDeCobro = await EstacionDeCobro.findById(estacionId).lean();

  if (!estacionDeCobro) {
    req.flash('error', 'No se encontró la estación de cobro');
    return res.redirect('/administrador/estacionesdecobro');
  }

  const ventaReferenciada = (estacionDeCobro.ventasRealizadasEnLaEstacion || []).some(
    (ventaRefId) => String(ventaRefId) === String(ventaId)
  );

  if (!ventaReferenciada) {
    req.flash('error', 'La venta solicitada no pertenece a esta estación');
    return res.redirect(`/administrador/estacionesdecobro/${estacionId}`);
  }

  const venta = await Venta.findById(ventaId)
    .populate('productosDeStock.identificadorDeProducto')
    .lean();

  const ventaView = buildVentaDetailViewModel(venta || { _id: ventaId, nombreDelUsuario: 'Registro histórico' });
  res.render('panelEstacionCobro/imprimir-venta-ticket', {
    estacionDeCobro,
    venta: ventaView
  });
}));

router.put('/:id', catchAsync(async (req, res) => {
  // agregar datos a la estación
}))

// mostrar el historial de ventas

router.get('/:id/historial-ventas', catchAsync(async (req, res) => {
  const id = req.params.id;

  const historialVentasEstacion = await EstacionDeCobro.findById(id).populate("ventasRealizadasEnLaEstacion").sort({ createdAt: -1 }).exec()
  console.log(historialVentasEstacion)

  res.render('panelEstacionCobro/estacion-historial')

}))
// delete de estacion
router.delete('/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  const eliminarEstacion = await EstacionDeCobro.findByIdAndDelete(id);
  if (!eliminarEstacion) {
    req.flash('error', 'No se puede eliminar la estación');
    return res.redirect('/administrador/estacionesdecobro');
  }
  req.flash('sucess', 'Estación eliminada correctamente');

  res.redirect('/administrador/estacionesdecobro');
}))


// render formulario ingreso-efectivo-inicio

router.get('/:id/ingreso-efectivo-inicio', async (req, res) => {
  const estacionDeCobroId = req.params.id;
  const estacionDeCobro = await EstacionDeCobro.findById(estacionDeCobroId);
  res.render('panelEstacionCobro/ingreso-efectivo-inicio', { estacionDeCobro });
});

// post de ingreso efectivo-inicio
router.post('/:id/ingreso-efectivo-inicio', catchAsync(async (req, res) => {

  const estacionId = req.params.id;
  const cantidad = req.body.dineroDeIngresoInicio;


  const estacionDeCobro = await EstacionDeCobro.findByIdAndUpdate(estacionId, { $set: { dineroDeInicio: cantidad }, $inc: { dineroEnEstacion: cantidad } }).exec();


  req.flash('success', `Se ingreso $${cantidad} al inicio de la caja`);

  res.redirect(`/administrador/estacionesdecobro/${estacionDeCobro._id}`)
}))

// render de ingreso efectivo 
router.get('/:id/ingreso-efectivo', async (req, res) => {
  const estacionDeCobroId = req.params.id;
  const estacionDeCobro = await EstacionDeCobro.findById(estacionDeCobroId);
  res.render('panelEstacionCobro/ingreso-efectivo', { estacionDeCobro });
});
// post de
// Ingresar efectivo a la estación de cobro
router.post('/:id/ingreso-efectivo', catchAsync(async (req, res) => {

  const estacionId = req.params.id;
  const cantidad = req.body.dineroDeIngreso;
  const fecha = Date.now();
  const comentarioDeIngreso = req.body.comentarioDeIngreso;

  
  const ingresoEfectivo = {
    cantidad: cantidad,
    fecha: fecha,
    comentarioDeIngreso:comentarioDeIngreso
  }
  const estacionDeCobro = await EstacionDeCobro.findByIdAndUpdate(estacionId, { $push: { ingresosDeEfectivoManual: ingresoEfectivo }, $inc: { dineroEnEstacion: cantidad } }).exec();


  req.flash('success', `Se ingreso $ ${cantidad}`);

  res.redirect(`/administrador/estacionesdecobro/${estacionDeCobro._id}`)
}))
// render de egreso efectivo 
router.get('/:id/egreso-efectivo', async (req, res) => {
  const estacionDeCobroId = req.params.id;
  const estacionDeCobro = await EstacionDeCobro.findById(estacionDeCobroId);
  res.render('panelEstacionCobro/egreso-efectivo', { estacionDeCobro });
});
// post de
// Retirar efectivo a la estación de cobro

router.post('/:id/egreso-efectivo', catchAsync(async (req, res) => {
  const estacionId = req.params.id;
  const cantidad = req.body.dineroDeEgreso;
  const comentarioDeEgreso = req.body.comentarioDeEgreso;

  const fecha = Date.now();

  const egresoEfectivo = {
    cantidad: cantidad,
    fecha: fecha,
    comentarioDeEgreso:comentarioDeEgreso
  }
  const estacionDeCobro = await EstacionDeCobro.findByIdAndUpdate(estacionId, { $push: { egresoDeEfectivoManual: egresoEfectivo }, $inc: { dineroEnEstacion: -cantidad } }).exec();


  req.flash('success', `Se realizo un retiro de efectivo de $${cantidad}`);

  res.redirect(`/caja/${estacionDeCobro._id}/inicio`)
}))



// reiniciar el dia



router.post('/:id/reset', catchAsync(async (req, res) => {
  const estacionDeCobroId = req.params.id;
  if (req.body.dineroDeInicio) {

    const estacionDeCobro = await EstacionDeCobro.findByIdAndUpdate(estacionDeCobroId, { dineroDeInicio: req.body.dineroDeInicio, dineroEnEstacion: req.body.dineroDeInicio, dineroDeVentasEnEfectivo: 0, dineroDeVentasEnOtro: 0, comprasRealizadasEnEfectivo: 0, comprasRealizadasEnOtro: 0 }).exec();

    req.flash('success', `Se reseteo el dia correctamente`);

    res.redirect(`/administrador/estacionesdecobro/${estacionDeCobro._id}`);
  } else {
    const estacionDeCobro1 = await EstacionDeCobro.findByIdAndUpdate(estacionDeCobroId, { dineroDeInicio: 0, dineroEnEstacion: 0, dineroDeVentasEnEfectivo: 0, dineroDeVentasEnOtro: 0, comprasRealizadasEnEfectivo: 0, comprasRealizadasEnOtro: 0 }).exec();

    req.flash('success', `Se reseteo el dia correctamente`);

    res.redirect(`/administrador/estacionesdecobro/${estacionDeCobro1._id}`);
  }

}));



// historial de usuarios
router.get('/:id/historial-usuario', catchAsync(async (req, res) => {
  const estacionId = req.params.id;
  const estacionDeCobro = await EstacionDeCobro.findById(estacionId);

  res.render('panelEstacionCobro/estacion-historial', { estacionDeCobro })
}))


router.get('/:id/cierre-caja', catchAsync(async (req, res) => {
  const estacionDeCobroId = req.params.id;
  const periodo = req.query.periodo || 'DIARIO';
  const estacionDeCobro = await EstacionDeCobro.findById(estacionDeCobroId);

  const { inicio, fin } = getPeriodRange(periodo);
  const ventas = await Venta.find({
    estacionDeCobro: estacionDeCobroId,
    createdAt: { $gte: inicio, $lte: fin }
  }).sort({ createdAt: -1 }).lean();

  const cierrePreview = buildCierreSnapshot(estacionDeCobro.toObject ? estacionDeCobro.toObject() : estacionDeCobro, ventas, periodo);
  res.render('panelEstacionCobro/cierre-caja', { estacionDeCobro, cierrePreview, periodo });
}));

router.get('/:id/cierre-caja/imprimir', catchAsync(async (req, res) => {
  const estacionDeCobroId = req.params.id;
  const periodo = req.query.periodo || 'DIARIO';
  const dineroReal = req.query.dineroReal;
  const estacionDeCobro = await EstacionDeCobro.findById(estacionDeCobroId);

  const { inicio, fin } = getPeriodRange(periodo);
  const ventas = await Venta.find({
    estacionDeCobro: estacionDeCobroId,
    createdAt: { $gte: inicio, $lte: fin }
  }).sort({ createdAt: -1 }).lean();

  const cierre = buildCierreSnapshot(estacionDeCobro.toObject ? estacionDeCobro.toObject() : estacionDeCobro, ventas, periodo, dineroReal);
  res.render('panelCierres/imprimir-cierre', {
    cierre: {
      ...cierre,
      ubicacionDeEstacion: estacionDeCobro.ubicacionDeEstacion,
      nombreDelUsuario: req.user.username
    },
    isPreview: true
  });
}));

router.post('/:id/cierre-caja/guardar', catchAsync(async (req, res) => {
  const estacionDeCobroId = req.params.id;
  const periodo = req.body.periodo || 'DIARIO';
  const dineroRealIngresado = req.body.dineroReal;
  const comentarioDeCierre = req.body.comentarioDeCierre || '';

  const estacionDeCobro = await EstacionDeCobro.findById(estacionDeCobroId);
  const { inicio, fin } = getPeriodRange(periodo);
  const ventas = await Venta.find({
    estacionDeCobro: estacionDeCobroId,
    createdAt: { $gte: inicio, $lte: fin }
  }).sort({ createdAt: -1 }).lean();

  const snapshot = buildCierreSnapshot(
    estacionDeCobro.toObject ? estacionDeCobro.toObject() : estacionDeCobro,
    ventas,
    periodo,
    dineroRealIngresado
  );

  const cierreCajaGuardado = new CierreCaja({
    estacionDeCobro: estacionDeCobro._id,
    ubicacionDeEstacion: estacionDeCobro.ubicacionDeEstacion,
    usuarioQueCierra: req.user._id,
    nombreDelUsuario: req.user.username,
    fechaDeApertura: snapshot.fechaDeApertura,
    fechaDeCierre: snapshot.fechaDeCierre,
    periodo: snapshot.periodo,
    dineroDeInicio: snapshot.dineroDeInicio,
    dineroEnCaja: snapshot.dineroEnCaja,
    ventasEnEfectivo: snapshot.ventasEnEfectivo,
    ventasEnOtro: snapshot.ventasEnOtro,
    ingresosManualDinero: snapshot.ingresosManualDinero,
    egresosManualDinero: snapshot.egresosManualDinero,
    dineroEsperado: snapshot.dineroEsperado,
    dineroReal: snapshot.dineroReal,
    diferencia: snapshot.diferencia,
    estado: 'CERRADO',
    notasDelCierre: comentarioDeCierre,
    detallesDeVentas: snapshot.detallesDeVentas,
    detallesIngresosEgresos: snapshot.detallesIngresosEgresos
  });

  await cierreCajaGuardado.save();
  estacionDeCobro.dineroEnEstacion = snapshot.dineroReal;
  await estacionDeCobro.save();

  req.flash('success', 'Cierre realizado correctamente');
  res.redirect(`/administrador/cierres-caja/${cierreCajaGuardado._id}`);
}));

// delete de estacion

router.get('/:id/eliminar-caja', catchAsync(async (req, res) => {
  const estacionDeCobroId = req.params.id;
  const estacionDeCobro = await EstacionDeCobro.findById(estacionDeCobroId);
  res.render('panelEstacionCobro/eliminar-caja', { estacionDeCobro });
}));



router.delete('/:id/eliminar-caja', catchAsync(async (req, res) => {
  const { id } = req.params;
  const eliminarEstacion = await EstacionDeCobro.findByIdAndDelete(id);
  if (!eliminarEstacion) {
    req.flash('error', 'No se puede eliminar la estación');
    return res.redirect('/administrador/estacionesdecobro');
  }
  req.flash('sucess', 'Estación eliminada correctamente');

  res.redirect('/administrador/estacionesdecobro');
}))
// agregar ofertas a la estación
module.exports = router;

