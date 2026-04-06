require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/usuario');

const dbUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/dbIsidorito';

const defaultUsers = [
  {
    username: 'ramiroadm',
    password: 'ramiroadm',
    funcion: 'ADMINISTRADOR'
  },
  {
    username: 'ramirocaja',
    password: 'ramiro20',
    funcion: 'CAJA'
  }
];

async function ensureUser({ username, password, funcion }) {
  const existingUser = await User.findOne({ username });

  if (existingUser) {
    existingUser.funcion = funcion;
    await existingUser.setPassword(password);
    await existingUser.save();
    return { username, funcion, action: 'updated' };
  }

  const user = new User({ username, funcion });
  await User.register(user, password);
  return { username, funcion, action: 'created' };
}

async function main() {
  await mongoose.connect(dbUrl, { serverSelectionTimeoutMS: 10000 });

  const results = [];
  for (const userConfig of defaultUsers) {
    results.push(await ensureUser(userConfig));
  }

  console.table(results);
  console.log('Usuarios por defecto listos.');
}

main()
  .catch((error) => {
    console.error('No se pudieron crear/actualizar los usuarios por defecto:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
