const mongoose = require('mongoose');
const Producto = require('../models/productos');

const productosData = [
  {
    codigo: 1001,
    nombre: 'Aceite de Oliva Extra Virgen',
    cantidad: 50,
    marca: 'La Española',
    precioMinorista: 850,
    precioMayorista: 750,
    precioCosto: 600,
    categoriaInterna: 'aceite/vinagre',
    peso: '500ml',
    impuestoAplicado: '21'
  },
  {
    codigo: 1002,
    nombre: 'Pasta Integral Penne',
    cantidad: 120,
    marca: 'Gallo',
    precioMinorista: 180,
    precioMayorista: 150,
    precioCosto: 100,
    categoriaInterna: 'fideos',
    peso: '500g',
    impuestoAplicado: '21'
  },
  {
    codigo: 1003,
    nombre: 'Café Premium Molido',
    cantidad: 45,
    marca: 'Café Martínez',
    precioMinorista: 520,
    precioMayorista: 450,
    precioCosto: 350,
    categoriaInterna: 'te cafe',
    peso: '250g',
    impuestoAplicado: '21'
  },
  {
    codigo: 1004,
    nombre: 'Leche Entera Descremada',
    cantidad: 200,
    marca: 'La Serenísima',
    precioMinorista: 120,
    precioMayorista: 100,
    precioCosto: 70,
    categoriaInterna: 'bebidas sin alcohol',
    peso: '1L',
    impuestoAplicado: '21'
  },
  {
    codigo: 1005,
    nombre: 'Queso Pradera Cremoso',
    cantidad: 35,
    marca: 'Pradera',
    precioMinorista: 680,
    precioMayorista: 600,
    precioCosto: 450,
    categoriaInterna: 'fiambreria',
    peso: '400g',
    impuestoAplicado: '21'
  },
  {
    codigo: 1006,
    nombre: 'Pan Integral Casero',
    cantidad: 80,
    marca: 'Panadería Local',
    precioMinorista: 95,
    precioMayorista: 80,
    precioCosto: 50,
    categoriaInterna: 'panaderia',
    peso: '600g',
    impuestoAplicado: '21'
  },
  {
    codigo: 1007,
    nombre: 'Chocolate Negro 70%',
    cantidad: 60,
    marca: 'Lindt',
    precioMinorista: 450,
    precioMayorista: 380,
    precioCosto: 250,
    categoriaInterna: 'golosinas',
    peso: '100g',
    impuestoAplicado: '21'
  },
  {
    codigo: 1008,
    nombre: 'Agua Mineral Natural',
    cantidad: 300,
    marca: 'Villavicencio',
    precioMinorista: 85,
    precioMayorista: 70,
    precioCosto: 40,
    categoriaInterna: 'bebidas sin alcohol',
    peso: '1.5L',
    impuestoAplicado: '21'
  },
  {
    codigo: 1009,
    nombre: 'Mermelada de Fresa',
    cantidad: 55,
    marca: 'Bionaturista',
    precioMinorista: 320,
    precioMayorista: 280,
    precioCosto: 180,
    categoriaInterna: 'no perecederos',
    peso: '400g',
    impuestoAplicado: '21'
  },
  {
    codigo: 1010,
    nombre: 'Almendras Tostadas',
    cantidad: 25,
    marca: 'Nature Valley',
    precioMinorista: 890,
    precioMayorista: 800,
    precioCosto: 600,
    categoriaInterna: 'almacen',
    peso: '200g',
    impuestoAplicado: '21'
  }
];

async function seedProductos() {
  try {
    console.log('🔄 Intentando conectar a MongoDB...');
    
    await mongoose.connect('mongodb://localhost:27017/dbIsidorito', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Conectado a MongoDB');

    console.log('📝 Insertando 10 productos...');
    const resultado = await Producto.insertMany(productosData);
    console.log(`✅ ${resultado.length} productos cargados exitosamente`);
    console.log('📊 Códigos:', resultado.map(p => `${p.codigo} - ${p.nombre}`));

    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('📍 Stack:', error.stack);
    process.exit(1);
  }
}

seedProductos();