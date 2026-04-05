db = db.getSiblingDB('isidorito');

// Crear usuario para la aplicación
db.createUser({
  user: 'isidorito_user',
  pwd: 'isidorito_pass123',
  roles: [
    {
      role: 'readWrite',
      db: 'isidorito'
    }
  ]
});

// Crear colecciones
db.createCollection('usuarios');
db.createCollection('productos');
db.createCollection('estaciones');
db.createCollection('ofertas');
db.createCollection('ventas');
db.createCollection('cierrescaja');

// Crear índices
db.usuarios.createIndex({ email: 1 }, { unique: true });
db.usuarios.createIndex({ username: 1 }, { unique: true });
db.productos.createIndex({ codigo: 1 }, { unique: true });
db.productos.createIndex({ nombre: 1 });
db.productos.createIndex({ marca: 1 });
db.estaciones.createIndex({ numero: 1 }, { unique: true });
db.ofertas.createIndex({ codigo: 1 });
db.ventas.createIndex({ fecha: 1 });
db.cierrescaja.createIndex({ fecha: 1 });

print('✅ Base de datos inicializada correctamente');
