const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn,isAdmin} = require('../middleware');
const Producto = require('../models/productos');

const roleADM = 'ADMINISTRADOR';

// Página principal de búsqueda
router.get('/', isLoggedIn, isAdmin(roleADM), (req,res) => {
  res.render('stock/listado');
});

// API: Búsqueda mixta (por texto - nombre, marca, código)
router.post('/api/buscar-texto', isLoggedIn, isAdmin(roleADM), catchAsync(async (req, res) => {
  const { query, sort = 'relevancia' } = req.body;
  
  if (!query || query.trim().length < 2) {
    return res.status(400).json({ 
      success: false, 
      message: 'Ingresa al menos 2 caracteres' 
    });
  }

  // Buscar solo en nombre y marca usando regex (campos String)
  const searchRegex = { $regex: query.trim(), $options: 'i' };
  
  let productos = await Producto.find({
    $or: [
      { nombre: searchRegex },
      { marca: searchRegex }
    ]
  });

  // Filtrar resultados en JavaScript para evitar CastError en campo 'codigo' (Number)
  const searchTerm = query.trim().toLowerCase();
  productos = productos.filter(p => {
    const matchNombre = p.nombre && p.nombre.toLowerCase().includes(searchTerm);
    const matchMarca = p.marca && p.marca.toLowerCase().includes(searchTerm);
    const matchCodigo = String(p.codigo).toLowerCase().includes(searchTerm);
    return matchNombre || matchMarca || matchCodigo;
  });

  // Aplicar ordenamiento
  switch(sort) {
    case 'nombre':
      productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
      break;
    case 'precio':
      productos.sort((a, b) => (a.precioMinorista || a.valor || 0) - (b.precioMinorista || b.valor || 0));
      break;
    case 'stock':
      productos.sort((a, b) => (b.cantidad || 0) - (a.cantidad || 0));
      break;
    case 'relevancia':
    default:
      // Relevancia: coincidencias exactas primero
      productos.sort((a, b) => {
        const aMatch = a.nombre.toLowerCase() === query.toLowerCase() ? 1 : 0;
        const bMatch = b.nombre.toLowerCase() === query.toLowerCase() ? 1 : 0;
        return bMatch - aMatch;
      });
  }

  res.json({
    success: true,
    count: productos.length,
    data: productos
    
  });
}));

// API: Búsqueda por código de barra
router.post('/api/buscar-codigo', isLoggedIn, isAdmin(roleADM), catchAsync(async (req, res) => {
  const { codigo } = req.body;
  
  if (!codigo || codigo.trim().length < 2) {
    return res.status(400).json({ 
      success: false, 
      message: 'Ingresa un código válido' 
    });
  }

  // Fetch todos los productos y filtrar por string match en JavaScript
  const productos = await Producto.find({});
  const searchTerm = codigo.trim().toLowerCase();
  
  const producto = productos.find(p => 
    String(p.codigo).toLowerCase() === searchTerm
  );

  if (!producto) {
    return res.status(404).json({ 
      success: false, 
      message: 'Producto no encontrado' 
    });
  }

  res.json({
    success: true,
    count: 1,
    data: [producto]
  });
}));

module.exports = router;
