const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { isLoggedIn, isAdmin, isCaja, hasAnyRole } = require('../middleware');
const CierreDeCaja = require('../models/cierreDeCaja');
const EstacionDeCobro = require('../models/estaciondecobro');
const Venta = require('../models/ventas');
const Usuario = require('../models/usuario');
const mongoose = require('mongoose');

const roleADM = 'ADMINISTRADOR';
const roleCaja = 'CAJA';

// ============================================
// FUNCIONES AUXILIARES
// ============================================

// Obtener ventas en un rango de fechas
async function obtenerVentasEnRango(estacionId, fechaInicio, fechaFin) {
    return await Venta.find({
        estacionDeCobro: estacionId,
        createdAt: { $gte: fechaInicio, $lte: fechaFin }
    });
}

// Calcular totales de ventas
function calcularTotalesVentas(ventas) {
    let efectivo = { cantidad: 0, monto: 0 };
    let otro = { cantidad: 0, monto: 0 };

    ventas.forEach(venta => {
        if (venta.tipoDePago === 'EFECTIVO') {
            efectivo.cantidad++;
            efectivo.monto += venta.dineroIngresado || 0;
        } else {
            otro.cantidad++;
            otro.monto += venta.dineroIngresado || 0;
        }
    });

    return { efectivo, otro };
}

// Obtener período (fecha inicio y fin)
function obtenerPeriodo(tipo, fecha) {
    const date = new Date(fecha);
    
    if (tipo === 'DIARIO') {
        const inicio = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
        const fin = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
        return { inicio, fin };
    }
    
    if (tipo === 'SEMANAL') {
        const dia = date.getDay() || 7;
        const inicio = new Date(date);
        inicio.setDate(date.getDate() - dia + 1);
        inicio.setHours(0, 0, 0, 0);
        
        const fin = new Date(inicio);
        fin.setDate(inicio.getDate() + 6);
        fin.setHours(23, 59, 59, 999);
        return { inicio, fin };
    }
    
    if (tipo === 'MENSUAL') {
        const inicio = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0);
        const fin = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
        return { inicio, fin };
    }
}

// ============================================
// RUTAS - VISTAS
// ============================================

// Listar todos los cierres
router.get('/', isLoggedIn, isAdmin(roleADM), catchAsync(async (req, res) => {
    const cierresDeCaja = await CierreDeCaja.find({})
        .populate('estacionDeCobro')
        .populate('usuarioQueCierra')
        .sort({ fechaDeCierre: -1 });
    
    res.render('panelCierres/verTodosLosCierres', { cierresDeCaja });
}));

// Ver detalle de un cierre
router.get('/:id', isLoggedIn, isAdmin(roleADM), catchAsync(async (req, res) => {
    const cierre = await CierreDeCaja.findById(req.params.id)
        .populate('estacionDeCobro')
        .populate('usuarioQueCierra');
    
    if (!cierre) {
        throw new ExpressError('Cierre no encontrado', 404);
    }
    
    res.render('panelCierres/verCierreIndividual', { cierre });
}));

router.get('/:id/imprimir', isLoggedIn, isAdmin(roleADM), catchAsync(async (req, res) => {
    const cierre = await CierreDeCaja.findById(req.params.id)
        .populate('estacionDeCobro')
        .populate('usuarioQueCierra');

    if (!cierre) {
        throw new ExpressError('Cierre no encontrado', 404);
    }

    res.render('panelCierres/imprimir-cierre', { cierre, isPreview: false });
}));

// ============================================
// RUTAS - DATOS PARA INICIAR CIERRE
// ============================================

// Obtener información para iniciar cierre
router.post('/inicio-cierre/datos', isLoggedIn, catchAsync(async (req, res) => {
    const { estacionId } = req.body;
    
    const estacion = await EstacionDeCobro.findById(estacionId);
    if (!estacion) {
        throw new ExpressError('Estación no encontrada', 404);
    }
    
    // Obtener último cierre
    const ultimoCierre = await CierreDeCaja.findOne({
        estacionDeCobro: estacionId
    }).sort({ fechaDeCierre: -1 });
    
    const fechaInicio = ultimoCierre ? ultimoCierre.fechaDeCierre : new Date(estacion.createdAt);
    const ahora = new Date();
    
    // Obtener ventas desde el último cierre
    const ventas = await obtenerVentasEnRango(estacionId, fechaInicio, ahora);
    const totales = calcularTotalesVentas(ventas);
    
    res.json({
        estacion: {
            id: estacion._id,
            ubicacion: estacion.ubicacionDeEstacion,
            dineroActual: estacion.dineroEnEstacion,
            dineroInicial: estacion.dineroDeInicio
        },
        ventas: totales,
        fechaUltimoCierre: ultimoCierre?.fechaDeCierre || estacion.createdAt,
        dineroEsperado: (ultimoCierre?.dineroEnCaja || estacion.dineroDeInicio) + totales.efectivo.monto
    });
}));

// ============================================
// RUTAS - CREAR CIERRE
// ============================================

// Crear nuevo cierre
router.post('/crear', isLoggedIn, hasAnyRole(['ADMINISTRADOR', 'CAJA']), catchAsync(async (req, res) => {
    const {
        estacionId,
        dineroEnCaja,
        notasDelCierre,
        periodo = 'DIARIO'
    } = req.body;
    
    const estacion = await EstacionDeCobro.findById(estacionId);
    if (!estacion) {
        throw new ExpressError('Estación no encontrada', 404);
    }
    
    // Obtener último cierre
    const ultimoCierre = await CierreDeCaja.findOne({
        estacionDeCobro: estacionId
    }).sort({ fechaDeCierre: -1 });
    
    const fechaInicio = ultimoCierre ? ultimoCierre.fechaDeCierre : new Date(estacion.createdAt);
    const ahora = new Date();
    
    // Calcular ventas
    const ventas = await obtenerVentasEnRango(estacionId, fechaInicio, ahora);
    const totales = calcularTotalesVentas(ventas);
    
    // Cálculos
    const dineroDeInicio = ultimoCierre ? ultimoCierre.dineroEnCaja : estacion.dineroDeInicio;
    const dineroEsperado = dineroDeInicio + totales.efectivo.monto;
    const diferencia = dineroEnCaja - dineroEsperado;
    
    // Crear cierre
    const cierre = new CierreDeCaja({
        estacionDeCobro: estacionId,
        ubicacionDeEstacion: estacion.ubicacionDeEstacion,
        usuarioQueCierra: req.user._id,
        nombreDelUsuario: req.user.username,
        fechaDeApertura: fechaInicio,
        fechaDeCierre: ahora,
        periodo,
        dineroDeInicio,
        dineroEnCaja,
        ventasEnEfectivo: {
            cantidad: totales.efectivo.cantidad,
            montoTotal: totales.efectivo.monto
        },
        ventasEnOtro: {
            cantidad: totales.otro.cantidad,
            montoTotal: totales.otro.monto
        },
        dineroEsperado,
        dineroReal: dineroEnCaja,
        diferencia,
        estado: 'CERRADO',
        notasDelCierre,
        detallesDeVentas: ventas.map(v => ({
            ventaId: v._id,
            monto: v.dineroIngresado,
            tipoPago: v.tipoDePago,
            fecha: v.createdAt
        }))
    });
    
    await cierre.save();
    
    // Actualizar estación
    estacion.dineroEnEstacion = dineroEnCaja;
    await estacion.save();
    
    req.flash('success', 'Cierre de caja registrado exitosamente');
    res.json({
        success: true,
        cierrId: cierre._id,
        diferencia
    });
}));

// ============================================
// RUTAS - REPORTES Y ESTADÍSTICAS
// ============================================

// Resumen general semanal/mensual/global
router.get('/reportes/resumen', isLoggedIn, isAdmin(roleADM), catchAsync(async (req, res) => {
    const ahora = new Date();
    
    // Período semanal
    const { inicio: inicioSemana, fin: finSemana } = obtenerPeriodo('SEMANAL', ahora);
    const cierresSemana = await CierreDeCaja.find({
        fechaDeCierre: { $gte: inicioSemana, $lte: finSemana },
        estado: 'CERRADO'
    });
    
    // Período mensual
    const { inicio: inicioMes, fin: finMes } = obtenerPeriodo('MENSUAL', ahora);
    const cierresMes = await CierreDeCaja.find({
        fechaDeCierre: { $gte: inicioMes, $lte: finMes },
        estado: 'CERRADO'
    });
    
    // Calcular totales
    const totalSemanal = cierresSemana.reduce((sum, c) => sum + (c.ventasEnEfectivo.montoTotal || 0), 0);
    const totalMensual = cierresMes.reduce((sum, c) => sum + (c.ventasEnEfectivo.montoTotal || 0), 0);
    
    const totalGlobalResult = await CierreDeCaja.aggregate([
        { $match: { estado: 'CERRADO' } },
        { $group: { _id: null, total: { $sum: '$ventasEnEfectivo.montoTotal' } } }
    ]);
    
    res.json({
        semanal: {
            total: totalSemanal,
            cantidad: cierresSemana.length,
            periodo: { inicio: inicioSemana, fin: finSemana }
        },
        mensual: {
            total: totalMensual,
            cantidad: cierresMes.length,
            periodo: { inicio: inicioMes, fin: finMes }
        },
        global: {
            total: totalGlobalResult[0]?.total || 0
        }
    });
}));

// Resumen por estación
router.get('/reportes/por-estacion/:estacionId', isLoggedIn, isAdmin(roleADM), catchAsync(async (req, res) => {
    const { estacionId } = req.params;
    const ahora = new Date();
    
    // Semanal
    const { inicio: inicioSemana, fin: finSemana } = obtenerPeriodo('SEMANAL', ahora);
    const totalSemanal = await CierreDeCaja.aggregate([
        {
            $match: {
                estacionDeCobro: mongoose.Types.ObjectId(estacionId),
                fechaDeCierre: { $gte: inicioSemana, $lte: finSemana },
                estado: 'CERRADO'
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$ventasEnEfectivo.montoTotal' }
            }
        }
    ]);
    
    // Mensual
    const { inicio: inicioMes, fin: finMes } = obtenerPeriodo('MENSUAL', ahora);
    const totalMensual = await CierreDeCaja.aggregate([
        {
            $match: {
                estacionDeCobro: mongoose.Types.ObjectId(estacionId),
                fechaDeCierre: { $gte: inicioMes, $lte: finMes },
                estado: 'CERRADO'
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$ventasEnEfectivo.montoTotal' }
            }
        }
    ]);
    
    res.json({
        estacionId,
        semanal: {
            total: totalSemanal[0]?.total || 0,
            periodo: { inicio: inicioSemana, fin: finSemana }
        },
        mensual: {
            total: totalMensual[0]?.total || 0,
            periodo: { inicio: inicioMes, fin: finMes }
        }
    });
}));

// Detalle semanal a pagar
router.get('/reportes/detalle-semanal', isLoggedIn, isAdmin(roleADM), catchAsync(async (req, res) => {
    const ahora = new Date();
    const { inicio, fin } = obtenerPeriodo('SEMANAL', ahora);
    
    const cierres = await CierreDeCaja.find({
        fechaDeCierre: { $gte: inicio, $lte: fin },
        estado: 'CERRADO'
    })
        .populate('estacionDeCobro')
        .populate('usuarioQueCierra');
    
    const detalles = cierres.map(c => ({
        id: c._id,
        estacion: c.ubicacionDeEstacion,
        usuario: c.nombreDelUsuario,
        ventasEfectivo: c.ventasEnEfectivo.montoTotal,
        ventasOtro: c.ventasEnOtro.montoTotal,
        totalAPagar: c.ventasEnEfectivo.montoTotal,
        diferencia: c.diferencia,
        fecha: c.fechaDeCierre
    }));
    
    res.json({
        periodo: 'SEMANAL',
        fechaInicio: inicio,
        fechaFin: fin,
        detalles,
        totalAPagar: detalles.reduce((sum, d) => sum + d.totalAPagar, 0),
        cantidad: detalles.length
    });
}));

// Detalle mensual a pagar
router.get('/reportes/detalle-mensual', isLoggedIn, isAdmin(roleADM), catchAsync(async (req, res) => {
    const ahora = new Date();
    const { inicio, fin } = obtenerPeriodo('MENSUAL', ahora);
    
    const cierres = await CierreDeCaja.find({
        fechaDeCierre: { $gte: inicio, $lte: fin },
        estado: 'CERRADO'
    })
        .populate('estacionDeCobro')
        .populate('usuarioQueCierra');
    
    const detalles = cierres.map(c => ({
        id: c._id,
        estacion: c.ubicacionDeEstacion,
        usuario: c.nombreDelUsuario,
        ventasEfectivo: c.ventasEnEfectivo.montoTotal,
        ventasOtro: c.ventasEnOtro.montoTotal,
        totalAPagar: c.ventasEnEfectivo.montoTotal,
        diferencia: c.diferencia,
        fecha: c.fechaDeCierre
    }));
    
    res.json({
        periodo: 'MENSUAL',
        fechaInicio: inicio,
        fechaFin: fin,
        detalles,
        totalAPagar: detalles.reduce((sum, d) => sum + d.totalAPagar, 0),
        cantidad: detalles.length
    });
}));

module.exports = router;

