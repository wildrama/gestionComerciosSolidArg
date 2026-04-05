const express = require('express');
const app = express();
const port = 3037;
const path = require('path');

const mongoose = require('mongoose');
require('dotenv').config();


const methodOverride = require('method-override');

const flash = require('connect-flash');

// session
const session = require('express-session');
const MongoStore = require('connect-mongo');

// passport
const passport = require('passport');
const LocalStrategy = require('passport-local');


// require mongoose models
const User = require('./models/usuario.js')
const ExpressError=require('./utils/ExpressError');

const ingresos = require('./routes/ingresos')
const cajaRoutes= require('./routes/cajaRegular')
const admCaja = require('./routes/cajaAdministrador')
const loginRoutes = require('./routes/usuarios')
const administradorUsuariosRoutes = require('./routes/administradorUsuarios');
const administradorProductosRoutes = require('./routes/administradorProductos');
const administradorBuscarRoutes = require('./routes/administradorBuscar');
const administradorEstacionDeCobroRoutes  = require('./routes/administradorEstaciones');
const administradorOfertasRoutes = require('./routes/administradorOfertas');
const administradorCierresDeCajaRoutes = require('./routes/administradorCierreDeCaja');
const clientesRoutes = require('./routes/clientesRutas');
const pedidosRoutes = require('./routes/pedidosRutas');

const busquedaNombre = require('./routes/buscarProd');
const codigoBarra = require('./routes/codigoBarra');
const searchApiRoutes = require('./routes/searchApi');
const stockRoutes = require('./routes/stock');
const ofertasSearchRoutes = require('./routes/ofertas-search');
 
const saveVentasRoutes = require('./routes/savesDeCaja')



const dbUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/dbIsidorito';
main().catch(err => {
  console.error('[DB] Error al conectar MongoDB:', err.message);
  process.exit(1);
});

async function main() {
  console.log('[DB] Intentando conectar a MongoDB...');
  await mongoose.connect(dbUrl, {
    serverSelectionTimeoutMS: 10000
  });
  console.log('[DB] MongoDB conectada OK:', dbUrl);
  app.listen(port, () => console.log(`Isidorito v.0.1 ${port}!`));
}

const store = new MongoStore({
  mongoUrl: dbUrl,
  secret:'thisNot',
  touchAfter:24*60,
})

store.on("error", function(e){
  console.log('error on session store',e)
})
const sessionConfig = {
  store,
  name:'session',
  secret: process.env.SESSION_SECRET || 'sk-isidorito-2024-prod-abc123def456ghi789jkl012mno345pqr', // 60+ caracteres
  resave: false,
  saveUninitialized: false,
  cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only en producción
      sameSite: 'strict', // CSRF protection
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7
  }
}
// sessionMiddleware
app.use(session(sessionConfig));



// const stockRoutes = require('./routes/stock')

app.use(express.json());

// statics files
app.use(express.static('public'));
app.use(express.static('files'));
app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))



app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



// flash Middleware
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})



app.use('/',loginRoutes);
app.use('/administrador/productos',administradorProductosRoutes);
app.use('/administrador/userpanel',administradorUsuariosRoutes);
app.use('/administrador/estacionesdecobro',administradorEstacionDeCobroRoutes);
app.use('/administrador/cierres-caja',administradorCierresDeCajaRoutes);
app.use('/clientes', clientesRoutes);
app.use('/pedidos',pedidosRoutes);
app.use('/caja',cajaRoutes);
app.use('/administrador/caja', admCaja)
app.use('/administrador/buscar',administradorBuscarRoutes);
app.use('/administrador/ofertas',administradorOfertasRoutes)
app.use('/administrador/stock', stockRoutes);
app.use('/administrador/ofertas-search', ofertasSearchRoutes);
app.use('/buscanombre', busquedaNombre)
app.use('/codigobarra', codigoBarra)
app.use('/api/search', searchApiRoutes);
app.use('/', ingresos)

app.use('/save', saveVentasRoutes);
// falta ingreso repartidor

// RENDER HOME
app.get('/', (req, res) => {
    res.render('index');
})        

// error midller ware base
app.all('*', (req, res, next) => {
  next(new ExpressError('Esta pagina no existe. Vuleve al Inicio I.I', 404))
})


app.use(function (err, req, res, next) {
  const { statusCode = 500 } = err;
  console.log(err);
     
  

    if (!err.message) err.message = 'Algo salio mal!'
  res.status(statusCode).render('errors',)
}); 

// endapp


