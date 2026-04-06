const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAdmin } = require('../middleware');
const Producto = require('../models/productos');
const Oferta = require('../models/ofertas');
const OfertaSingular = require('../models/ofertaSingular');
const EstacionDeCobro = require('../models/estaciondecobro');

const roleADM = 'ADMINISTRADOR';

router.use(isLoggedIn, isAdmin(roleADM));

const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const normalizeArray = (value) => {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

async function generateOfferBarcode() {
  for (let intento = 0; intento < 80; intento += 1) {
    const candidate = `990${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
      .slice(0, 13)
      .padEnd(13, '0');

    const [comboExistente, individualExistente] = await Promise.all([
      Oferta.findOne({ codigoOferta: candidate }).lean(),
      OfertaSingular.findOne({ codigoOferta: candidate }).lean()
    ]);

    if (!comboExistente && !individualExistente) {
      return candidate;
    }
  }

  return `990${Date.now().toString().slice(-10)}`.slice(0, 13).padEnd(13, '0');
}

async function ensureOfferMetadata(ofertaDoc) {
  if (!ofertaDoc) return ofertaDoc;

  let shouldSave = false;

  if (!ofertaDoc.estado) {
    ofertaDoc.estado = 'ACTIVA';
    shouldSave = true;
  }

  if (!ofertaDoc.codigoOferta) {
    ofertaDoc.codigoOferta = await generateOfferBarcode();
    shouldSave = true;
  }

  if (shouldSave) {
    await ofertaDoc.save();
  }

  return ofertaDoc;
}

async function hydrateOfferCollection(collection = []) {
  return Promise.all((collection || []).map((item) => ensureOfferMetadata(item)));
}

async function searchProductsForOffers(query) {
  const term = String(query || '').trim();
  if (!term) return [];

  const regex = new RegExp(escapeRegex(term), 'i');
  const productos = await Producto.find({
    $or: [{ nombre: regex }, { marca: regex }]
  }).limit(25);

  let byCode = [];
  if (/^\d+$/.test(term)) {
    byCode = await Producto.find({ codigo: Number(term) }).limit(10);

    if (!byCode.length) {
      const candidates = await Producto.find({}, 'codigo nombre marca precioMinorista cantidad').limit(400);
      byCode = candidates.filter((producto) => String(producto.codigo || '').includes(term));
    }
  }

  const merged = new Map();
  [...byCode, ...productos].forEach((producto) => merged.set(String(producto._id), producto));
  return Array.from(merged.values()).slice(0, 25);
}

router.get('/api/productos', catchAsync(async (req, res) => {
  const productos = await searchProductsForOffers(req.query.q || req.query.query || '');
  res.json({ success: true, data: productos });
}));

router.get('/imprimir-codigos', catchAsync(async (req, res) => {
  const ofertasConjuntoRaw = await Oferta.find({})
    .populate('productosEnOfertaConCodigo')
    .sort({ createdAt: -1 });

  const ofertasConjunto = await hydrateOfferCollection(ofertasConjuntoRaw);
  const preselectedIds = normalizeArray(req.query.ids);
  const ofertasPayload = JSON.stringify(ofertasConjunto.map((oferta) => ({
    _id: String(oferta._id),
    nombreOferta: oferta.nombreOferta || 'Oferta conjunto',
    codigoOferta: oferta.codigoOferta || '',
    precioOferta: Number(oferta.precioOferta || 0),
    estado: oferta.estado || 'ACTIVA',
    productosTexto: (oferta.productosEnOfertaConCodigo || []).map((producto) => producto.nombre).filter(Boolean).join(' + ')
  })));

  res.render('panelOfertas/imprimirCodigosOfertas', {
    ofertasConjunto,
    preselectedIds,
    ofertasPayload,
    preselectedPayload: JSON.stringify(preselectedIds)
  });
}));

// menu inicio ofertas
router.get('/', catchAsync(async (req, res) => {
  const [ofertasConjuntoRaw, ofertasIndividualesRaw] = await Promise.all([
    Oferta.find({}).sort({ createdAt: -1 }),
    OfertaSingular.find({}).populate('productoEnOferta').sort({ createdAt: -1 })
  ]);

  const ofertasConjunto = await hydrateOfferCollection(ofertasConjuntoRaw);
  const ofertasIndividuales = await hydrateOfferCollection(ofertasIndividualesRaw);

  res.render('panelOfertas/ofertaInicio', { ofertasConjunto, ofertasIndividuales });
}));

// render form para crear la oferta de conjunto
router.get('/agregar-oferta-conjunto', catchAsync(async (req, res) => {
  const estacionesDeCobro = await EstacionDeCobro.find({});
  res.render('panelOfertas/crearOfertaConjunto', { estacionesDeCobro });
}));

router.post('/agregar-oferta-conjunto', catchAsync(async (req, res) => {
  const nombreOferta = String(req.body.nombreOferta || '').trim();
  const fechaDeVigencia = req.body.fechaDeVigencia ? new Date(req.body.fechaDeVigencia) : null;
  const precioOferta = Number(req.body.precioOferta || 0);
  const productosEnOfertaConCodigo = normalizeArray(req.body.productosEnOfertaConCodigo || req.body.productosEnOferta);
  const estacionesDeCobroParaLaOferta = normalizeArray(req.body.estacionDeCobroParaLaOferta);

  if (!nombreOferta || !precioOferta || estacionesDeCobroParaLaOferta.length === 0) {
    req.flash('error', 'Completa nombre, precio y selecciona al menos una caja para la oferta combo.');
    return res.redirect('/administrador/ofertas/agregar-oferta-conjunto');
  }

  const nuevaOferta = new Oferta({
    nombreOferta,
    codigoOferta: await generateOfferBarcode(),
    estado: 'ACTIVA',
    fechaDeVigencia,
    precioOferta,
    productosEnOfertaConCodigo,
    estacionesDeCobroParaLaOferta
  });

  await nuevaOferta.save();
  req.flash('success', productosEnOfertaConCodigo.length
    ? `Oferta combo "${nombreOferta}" creada correctamente con ${productosEnOfertaConCodigo.length} producto(s) vinculados al stock.`
    : `Oferta combo "${nombreOferta}" creada correctamente sin productos vinculados al stock.`);
  res.redirect(`/administrador/ofertas/oferta-conjunto/${nuevaOferta._id}`);
}));

// ver oferta de conjunto
router.get('/oferta-conjunto/:id', catchAsync(async (req, res) => {
  const ofertaConjuntoId = req.params.id;
  const ofertaConjuntoParaVer = await Oferta.findById(ofertaConjuntoId)
    .populate('estacionesDeCobroParaLaOferta')
    .populate('productosEnOfertaConCodigo')
    .exec();

  if (!ofertaConjuntoParaVer) {
    req.flash('error', 'No se encontró la oferta combo.');
    return res.redirect('/administrador/ofertas');
  }

  await ensureOfferMetadata(ofertaConjuntoParaVer);
  res.render('panelOfertas/verOfertaConjunto', { ofertaConjuntoParaVer });
}));

router.post('/oferta-conjunto/:id/estado', catchAsync(async (req, res) => {
  const { id } = req.params;
  const nuevoEstado = req.body.estado === 'PAUSADA' ? 'PAUSADA' : 'ACTIVA';

  const oferta = await Oferta.findByIdAndUpdate(id, { estado: nuevoEstado }, { new: true });
  if (!oferta) {
    req.flash('error', 'No se encontró la oferta combo para actualizar.');
    return res.redirect('/administrador/ofertas');
  }

  req.flash('success', `Oferta combo "${oferta.nombreOferta || 'sin nombre'}" ${nuevoEstado === 'PAUSADA' ? 'pausada' : 'reactivada'} correctamente.`);
  res.redirect(`/administrador/ofertas/oferta-conjunto/${id}`);
}));

router.get('/oferta-conjunto', catchAsync(async (req, res) => {
  const ofertasConjunto = await hydrateOfferCollection(await Oferta.find({}));
  res.json(ofertasConjunto);
}));

// pantalla 1 de oferta individual
router.get('/agregar-oferta-individual/', (req, res) => {
  res.render('panelOfertas/crearOfertaIndividualP1');
});

// render de la 2da pantalla con el formulario
router.get('/agregar-oferta-individual/nueva', catchAsync(async (req, res) => {
  const idProd = req.query.idProd;
  const [productoParaOfertaIndividual, estacionesDeCobro] = await Promise.all([
    Producto.findById(idProd).exec(),
    EstacionDeCobro.find({})
  ]);

  if (!productoParaOfertaIndividual) {
    req.flash('error', 'Primero selecciona un producto válido para la oferta individual.');
    return res.redirect('/administrador/ofertas/agregar-oferta-individual');
  }

  res.render('panelOfertas/crearOfertaIndividualP2', { productoParaOfertaIndividual, estacionesDeCobro });
}));

router.get('/agregar-oferta-individual/:id/nueva', catchAsync(async (req, res) => {
  const idProd = req.params.id;
  const [productoParaOfertaIndividual, estacionesDeCobro] = await Promise.all([
    Producto.findById(idProd).exec(),
    EstacionDeCobro.find({})
  ]);

  if (!productoParaOfertaIndividual) {
    req.flash('error', 'No se encontró el producto para la oferta individual.');
    return res.redirect('/administrador/ofertas/agregar-oferta-individual');
  }

  res.render('panelOfertas/crearOfertaIndividualP2', { productoParaOfertaIndividual, estacionesDeCobro });
}));

// post del form para crear la oferta individual
router.post('/agregar-oferta-individual/nueva', catchAsync(async (req, res) => {
  const cantidadDeUnidadesNecesarias = Number(req.body.cantidadDeUnidadesNecesarias || 0);
  const precioOferta = Number(req.body.precioOferta || 0);
  const fechaDeVigencia = req.body.fechaDeVigencia ? new Date(req.body.fechaDeVigencia) : null;
  const productoEnOferta = req.body.productoEnOferta;
  const estacionesDeCobroParaLaOferta = normalizeArray(req.body.estacionDeCobroParaLaOferta);

  if (!productoEnOferta || cantidadDeUnidadesNecesarias <= 0 || precioOferta <= 0) {
    req.flash('error', 'Completa correctamente la cantidad, el precio y el producto para la oferta individual.');
    return res.redirect('/administrador/ofertas/agregar-oferta-individual');
  }

  const nuevaOfertaSingular = new OfertaSingular({
    cantidadDeUnidadesNecesarias,
    codigoOferta: await generateOfferBarcode(),
    estado: 'ACTIVA',
    precioOferta,
    fechaDeVigencia,
    productoEnOferta,
    estacionesDeCobroParaLaOferta
  });

  await nuevaOfertaSingular.save();
  req.flash('success', `Oferta individual creada correctamente: ${cantidadDeUnidadesNecesarias} unidad(es) por $${precioOferta.toFixed(2)}.`);
  res.redirect(`/administrador/ofertas/oferta-individual/${nuevaOfertaSingular._id}`);
}));

// mostrar la oferta creada del producto individual
router.get('/oferta-individual/:id', catchAsync(async (req, res) => {
  const ofertaIndividualId = req.params.id;
  const ofertaIndividualParaVer = await OfertaSingular.findById(ofertaIndividualId)
    .populate('productoEnOferta')
    .populate('estacionesDeCobroParaLaOferta', 'ubicacionDeEstacion')
    .exec();

  if (!ofertaIndividualParaVer) {
    req.flash('error', 'No se encontró la oferta individual.');
    return res.redirect('/administrador/ofertas');
  }

  await ensureOfferMetadata(ofertaIndividualParaVer);
  res.render('panelOfertas/verOfertaIndividual', { ofertaIndividualParaVer });
}));

router.post('/oferta-individual/:id/estado', catchAsync(async (req, res) => {
  const { id } = req.params;
  const nuevoEstado = req.body.estado === 'PAUSADA' ? 'PAUSADA' : 'ACTIVA';

  const oferta = await OfertaSingular.findByIdAndUpdate(id, { estado: nuevoEstado }, { new: true });
  if (!oferta) {
    req.flash('error', 'No se encontró la oferta individual para actualizar.');
    return res.redirect('/administrador/ofertas');
  }

  req.flash('success', `Oferta individual ${nuevoEstado === 'PAUSADA' ? 'pausada' : 'reactivada'} correctamente.`);
  res.redirect(`/administrador/ofertas/oferta-individual/${id}`);
}));

// delete oferta individual
router.delete('/oferta-individual/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  const ofertaIndividualParaEliminar = await OfertaSingular.findByIdAndDelete(id);
  if (!ofertaIndividualParaEliminar) {
    req.flash('error', 'No se puede eliminar la oferta individual.');
    return res.redirect('/administrador/ofertas');
  }

  req.flash('success', 'Oferta individual eliminada correctamente.');
  res.redirect('/administrador/ofertas');
}));

// delete oferta conjunto
router.delete('/oferta-conjunto/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  const ofertaConjuntoParaEliminar = await Oferta.findByIdAndDelete(id);
  if (!ofertaConjuntoParaEliminar) {
    req.flash('error', 'No se puede eliminar la oferta combo.');
    return res.redirect('/administrador/ofertas');
  }

  req.flash('success', `Oferta combo "${ofertaConjuntoParaEliminar.nombreOferta || 'sin nombre'}" eliminada correctamente.`);
  res.redirect('/administrador/ofertas');
}));

module.exports = router;
