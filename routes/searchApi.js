const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn } = require('../middleware');
const Producto = require('../models/productos');

/**
 * API BÚSQUEDA UNIVERSAL DE PRODUCTOS
 * Funciona con:
 * - Nombre del producto
 * - Marca
 * - Código de barra (numérico o texto)
 * - Compatible con lectores de código de barras
 */

// ==================== BÚSQUEDA POR TEXTO ====================
/**
 * POST /api/search/productos
 * Body: { query: string, sort?: string, limit?: number }
 * 
 * Busca en: nombre, marca, código
 * Ordena por: relevancia, nombre, precio, stock
 */
router.post('/productos', isLoggedIn, catchAsync(async (req, res) => {
  const { query, sort = 'relevancia', limit = 50 } = req.body;
  
  // Validación mínima
  if (!query || query.trim().length < 1) {
    return res.status(400).json({ 
      success: false,
      message: 'Ingresa un término de búsqueda',
      data: []
    });
  }

  const searchTerm = query.trim();
  const searchRegex = { $regex: searchTerm, $options: 'i' };
  
  try {
    // Búsqueda con relevancia mejorada - convertir codigo a string para búsqueda
    let productos = await Producto.find({
      $or: [
        { nombre: searchRegex },
        { marca: searchRegex }
      ]
    }).limit(limit);

    // Búsqueda en código por separado (convertir a string)
    const todosLosProductos = await Producto.find().limit(limit);
    const conCodigoMatch = todosLosProductos.filter(p => {
      const codigoStr = String(p.codigo || '');
      return codigoStr.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    // Combinar resultados
    const productosSet = new Set();
    productos.forEach(p => productosSet.add(p._id.toString()));
    conCodigoMatch.forEach(p => productosSet.add(p._id.toString()));
    
    const productosUnicos = Array.from(productosSet).map(id => {
      return productos.find(p => p._id.toString() === id) || 
             conCodigoMatch.find(p => p._id.toString() === id);
    }).filter(Boolean);

    // Aplicar ordenamiento
    let productosOrdenados = productosUnicos;
    switch(sort) {
      case 'nombre':
        productosOrdenados = productosUnicos.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es'));
        break;
        
      case 'precio':
        productosOrdenados = productosUnicos.sort((a, b) => 
          (a.precioMinorista || a.valor || 0) - (b.precioMinorista || b.valor || 0)
        );
        break;
        
      case 'stock':
        productosOrdenados = productosUnicos.sort((a, b) => (b.cantidad || 0) - (a.cantidad || 0));
        break;
        
      case 'relevancia':
      default:
        // Relevancia mejorada
        productosOrdenados = productosUnicos.sort((a, b) => {
          const queryLower = searchTerm.toLowerCase();
          
          // Exacto en nombre
          const aExactName = (a.nombre || '').toLowerCase() === queryLower ? 3 : 0;
          const bExactName = (b.nombre || '').toLowerCase() === queryLower ? 3 : 0;
          
          // Comienza con
          const aStartName = (a.nombre || '').toLowerCase().startsWith(queryLower) ? 2 : 0;
          const bStartName = (b.nombre || '').toLowerCase().startsWith(queryLower) ? 2 : 0;
          
          // Exacto en código
          const aExactCode = String(a.codigo || '').toLowerCase() === queryLower ? 3 : 0;
          const bExactCode = String(b.codigo || '').toLowerCase() === queryLower ? 3 : 0;
          
          const scoreA = aExactName + aStartName + aExactCode;
          const scoreB = bExactName + bStartName + bExactCode;
          
          return scoreB - scoreA;
        });
    }

    return res.json({
      success: true,
      count: productosOrdenados.length,
      query: searchTerm,
      data: productosOrdenados
    });
  } catch (error) {
    console.error('Search productos error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en búsqueda de productos',
      error: error.message,
      data: []
    });
  }
}));

// ==================== BÚSQUEDA POR CÓDIGO (LECTOR DE CÓDIGO DE BARRAS) ====================
/**
 * POST /api/search/barcode
 * Body: { codigo: string | number }
 * 
 * Búsqueda exacta de código de barra
 * Ideal para lectores de código de barras
 */
router.post('/barcode', isLoggedIn, catchAsync(async (req, res) => {
  const { codigo } = req.body;
  
  if (!codigo || String(codigo).trim().length < 1) {
    return res.status(400).json({ 
      success: false,
      message: 'Código inválido',
      data: []
    });
  }

  // Buscar por código - SOLO usar regex para evitar errores de conversión
  const codigoString = String(codigo).trim();
  
  const producto = await Producto.findOne({
    codigo: { $regex: codigoString, $options: 'i' }
  });

  if (!producto) {
    return res.status(404).json({ 
      success: false,
      message: 'Producto no encontrado',
      data: []
    });
  }

  return res.json({
    success: true,
    count: 1,
    barcode: codigo,
    data: [producto]
  });
}));

// ==================== BÚSQUEDA INTELIGENTE (DETECTA AUTOMÁTICAMENTE) ====================
/**
 * POST /api/search/smart
 * Body: { query: string, type?: 'auto' | 'text' | 'barcode' }
 * 
 * Detección automática:
 * - Si es numérico → búsqueda por código
 * - Si es texto → búsqueda por texto
 * 
 * Ideal para formularios donde no sabes qué tipo de búsqueda hacer
 */
router.post('/smart', isLoggedIn, catchAsync(async (req, res) => {
  const { query, type = 'auto' } = req.body;
  
  if (!query || query.trim().length < 1) {
    return res.status(400).json({ 
      success: false,
      message: 'Ingresa un término de búsqueda',
      data: []
    });
  }

  const searchTerm = query.trim();
  let searchType = type;

  // Auto-detección del tipo de búsqueda
  if (searchType === 'auto') {
    // Si es principalmente numérico (3+ dígitos), usar búsqueda por código
    searchType = /^\d+$/.test(searchTerm) && searchTerm.length >= 3 
      ? 'barcode' 
      : 'text';
  }

  try {
    if (searchType === 'barcode') {
      // Búsqueda por código - buscar por string match
      const todosLosProductos = await Producto.find().limit(50);
      const producto = todosLosProductos.find(p => {
        const codigoStr = String(p.codigo || '');
        return codigoStr === searchTerm;
      });

      if (!producto) {
        return res.json({
          success: false,
          message: 'Producto no encontrado',
          searchType: 'barcode',
          data: []
        });
      }

      return res.json({
        success: true,
        count: 1,
        searchType: 'barcode',
        data: [producto]
      });
    } else {
      // Búsqueda por texto
      const searchRegex = { $regex: searchTerm, $options: 'i' };
      
      let productos = await Producto.find({
        $or: [
          { nombre: searchRegex },
          { marca: searchRegex }
        ]
      }).limit(50);

      // Búsqueda en código por separado (convertir a string)
      const todosLosProductos = await Producto.find().limit(50);
      const conCodigoMatch = todosLosProductos.filter(p => {
        const codigoStr = String(p.codigo || '');
        return codigoStr.toLowerCase().includes(searchTerm.toLowerCase());
      });
      
      // Combinar resultados únicos
      const productosSet = new Set();
      productos.forEach(p => productosSet.add(p._id.toString()));
      conCodigoMatch.forEach(p => productosSet.add(p._id.toString()));
      
      const productosUnicos = Array.from(productosSet).map(id => {
        return productos.find(p => p._id.toString() === id) || 
               conCodigoMatch.find(p => p._id.toString() === id);
      }).filter(Boolean);

      return res.json({
        success: true,
        count: productosUnicos.length,
        searchType: 'text',
        data: productosUnicos
      });
    }
  } catch (error) {
    console.error('Search smart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en la búsqueda',
      error: error.message
    });
  }
}));

// ==================== BÚSQUEDA POR MÚLTIPLES CRITERIOS ====================
/**
 * POST /api/search/advanced
 * Body: { 
 *   query?: string, 
 *   codigo?: string | number,
 *   nombre?: string,
 *   marca?: string,
 *   precioMin?: number,
 *   precioMax?: number,
 *   stockMin?: number,
 *   sort?: string
 * }
 * 
 * Búsqueda avanzada con múltiples filtros
 */
router.post('/advanced', isLoggedIn, catchAsync(async (req, res) => {
  const { 
    query, 
    codigo, 
    nombre, 
    marca, 
    precioMin, 
    precioMax,
    stockMin,
    sort = 'relevancia' 
  } = req.body;

  let searchQuery = {};

  // Búsqueda general
  if (query && query.trim().length > 0) {
    const searchRegex = { $regex: query.trim(), $options: 'i' };
    searchQuery.$or = [
      { nombre: searchRegex },
      { marca: searchRegex },
      { codigo: searchRegex }
    ];
  }

  // Filtros específicos
  if (codigo) {
    searchQuery.codigo = { 
      $regex: String(codigo).trim(), 
      $options: 'i' 
    };
  }

  if (nombre) {
    searchQuery.nombre = { 
      $regex: nombre.trim(), 
      $options: 'i' 
    };
  }

  if (marca) {
    searchQuery.marca = { 
      $regex: marca.trim(), 
      $options: 'i' 
    };
  }

  // Rango de precio
  if (precioMin !== undefined || precioMax !== undefined) {
    searchQuery.precioMinorista = {};
    if (precioMin !== undefined) {
      searchQuery.precioMinorista.$gte = precioMin;
    }
    if (precioMax !== undefined) {
      searchQuery.precioMinorista.$lte = precioMax;
    }
  }

  // Stock mínimo
  if (stockMin !== undefined) {
    searchQuery.cantidad = { $gte: stockMin };
  }

  let productos = await Producto.find(searchQuery).limit(100);

  // Aplicar ordenamiento
  switch(sort) {
    case 'nombre':
      productos.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
      break;
    case 'precio-asc':
      productos.sort((a, b) => 
        (a.precioMinorista || 0) - (b.precioMinorista || 0)
      );
      break;
    case 'precio-desc':
      productos.sort((a, b) => 
        (b.precioMinorista || 0) - (a.precioMinorista || 0)
      );
      break;
    case 'stock-desc':
      productos.sort((a, b) => (b.cantidad || 0) - (a.cantidad || 0));
      break;
  }

  res.json({
    success: true,
    count: productos.length,
    data: productos
  });
}));

module.exports = router;
