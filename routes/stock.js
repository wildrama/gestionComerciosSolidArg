const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAdmin } = require('../middleware');
const Producto = require('../models/productos');

const roleADM = 'ADMINISTRADOR';

// GET - Listar stock
router.get('/', isLoggedIn, isAdmin(roleADM), catchAsync(async (req, res) => {
    const productos = await Producto.find().sort({ nombre: 1 });
    res.render('stock/listado', { productos });
}));

// GET - Búsqueda de productos (simple search page)
router.get('/buscar', isLoggedIn, isAdmin(roleADM), (req, res) => {
    res.render('stock/buscar');
});

// GET - Formulario de actualización
router.get('/actualizar', isLoggedIn, isAdmin(roleADM), (req, res) => {
    res.render('stock/actualizar');
});

// POST - Actualizar cantidad
router.post('/update', isLoggedIn, isAdmin(roleADM), catchAsync(async (req, res) => {
    const { productId, cantidad, updateType, notes } = req.body;
    
    if (!productId || cantidad === undefined) {
        return res.status(400).json({ 
            success: false, 
            message: 'Faltan parámetros' 
        });
    }

    const producto = await Producto.findById(productId);
    if (!producto) {
        return res.status(404).json({ 
            success: false, 
            message: 'Producto no encontrado' 
        });
    }

    // Actualizar cantidad según tipo
    let newQty = cantidad;
    if (updateType === 'add') {
        newQty = (producto.cantidad || 0) + cantidad;
    } else if (updateType === 'subtract') {
        newQty = Math.max(0, (producto.cantidad || 0) - cantidad);
    }
    // Si es 'set', usar el valor directamente

    producto.cantidad = newQty;
    await producto.save();

    res.json({ 
        success: true, 
        message: 'Stock actualizado',
        data: producto 
    });
}));

// GET - Producto individual (para ver detalles después de buscar)
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
    res.render('stock/producto', { producto });
}));

module.exports = router;
