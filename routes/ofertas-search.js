const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAdmin } = require('../middleware');
const Producto = require('../models/productos');
const Oferta = require('../models/ofertas');
const OfertaSingular = require('../models/ofertaSingular');

const roleADM = 'ADMINISTRADOR';

// GET - Listar ofertas
router.get('/', isLoggedIn, isAdmin(roleADM), catchAsync(async (req, res) => {
    const ofertasConjunto = await Oferta.find({});
    const ofertasIndividuales = await OfertaSingular.find({}).populate('productoEnOferta');
    res.render('panelOfertas/ofertaInicio', { ofertasConjunto, ofertasIndividuales });
}));

// GET - Formulario crear oferta individual
router.get('/individual', isLoggedIn, isAdmin(roleADM), (req, res) => {
    res.render('ofertas/agregarIndividual');
});

// GET - Formulario crear ofertas en lote
router.get('/batch', isLoggedIn, isAdmin(roleADM), (req, res) => {
    res.render('ofertas/agregarBatch');
});

// POST - Crear oferta individual
router.post('/create', isLoggedIn, isAdmin(roleADM), catchAsync(async (req, res) => {
    const { productId, precioOferta, fechaInicio, fechaFin, descripcion } = req.body;
    
    // Validar que el producto existe
    const producto = await Producto.findById(productId);
    if (!producto) {
        return res.status(404).json({ 
            success: false, 
            message: 'Producto no encontrado' 
        });
    }

    // Crear oferta
    const oferta = new OfertaSingular({
        productoEnOferta: productId,
        precioOferta: parseFloat(precioOferta),
        fechaDeVigencia: new Date(fechaFin),
        cantidadDeUnidadesNecesarias: 1
    });

    await oferta.save();

    res.json({ 
        success: true, 
        message: 'Oferta creada',
        data: oferta 
    });
}));

// POST - Crear múltiples ofertas
router.post('/create-batch', isLoggedIn, isAdmin(roleADM), catchAsync(async (req, res) => {
    const { ofertas, fechaInicio, fechaFin, descripcion } = req.body;

    if (!Array.isArray(ofertas) || ofertas.length === 0) {
        return res.status(400).json({ 
            success: false, 
            message: 'No hay ofertas para crear' 
        });
    }

    const ofertasCreadas = [];

    for (const oferta of ofertas) {
        // Validar que el producto existe
        const producto = await Producto.findById(oferta.productId);
        if (!producto) continue;

        const nuevaOferta = new OfertaSingular({
            productoEnOferta: oferta.productId,
            precioOferta: parseFloat(oferta.precioOferta),
            fechaDeVigencia: new Date(fechaFin),
            cantidadDeUnidadesNecesarias: 1
        });

        const saved = await nuevaOferta.save();
        ofertasCreadas.push(saved);
    }

    res.json({ 
        success: true, 
        message: `${ofertasCreadas.length} ofertas creadas`,
        created: ofertasCreadas.length,
        data: ofertasCreadas 
    });
}));

// GET - Producto individual por ID (para ver detalles)
router.get('/producto/:id', isLoggedIn, catchAsync(async (req, res) => {
    const producto = await Producto.findById(req.params.id);
    
    if (!producto) {
        return res.status(404).json({ 
            success: false, 
            message: 'Producto no encontrado' 
        });
    }

    // Si es AJAX request
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.json({ 
            success: true, 
            data: producto 
        });
    }

    // Si no, renderizar vista
    res.render('ofertas/producto', { producto });
}));

module.exports = router;
