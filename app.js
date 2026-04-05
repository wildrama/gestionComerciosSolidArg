// ...existing code...

// Configurar archivos estáticos ANTES de las rutas
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ...existing code...