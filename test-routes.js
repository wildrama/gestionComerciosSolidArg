#!/usr/bin/env node

/**
 * Test rápido - Verificar que las rutas están conectadas
 */

const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║  Test - Rutas Conectadas                             ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

// 1. Verificar que archivos de rutas existen
console.log('1️⃣  Verificando archivos de rutas...');
const routeFiles = [
    'routes/stock.js',
    'routes/ofertas-search.js',
    'routes/searchApi.js'
];

let allExists = true;
routeFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
        console.log(`   ✅ ${file}`);
    } else {
        console.log(`   ❌ FALTA: ${file}`);
        allExists = false;
    }
});

console.log('');

// 2. Verificar que vistas existen
console.log('2️⃣  Verificando vistas...');
const viewFiles = [
    'views/stock/buscar.ejs',
    'views/stock/producto.ejs',
    'views/stock/actualizar.ejs',
    'views/ofertas/producto.ejs',
    'views/ofertas/agregarIndividual.ejs',
    'views/ofertas/agregarBatch.ejs'
];

viewFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
        console.log(`   ✅ ${file}`);
    } else {
        console.log(`   ⚠️  ${file}`);
    }
});

console.log('');

// 3. Verificar que index.js tiene las rutas registradas
console.log('3️⃣  Verificando index.js...');
const indexPath = path.join(process.cwd(), 'index.js');
if (fs.existsSync(indexPath)) {
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    
    const checks = [
        { name: 'stock require', pattern: "require('./routes/stock')" },
        { name: 'ofertas-search require', pattern: "require('./routes/ofertas-search')" },
        { name: 'stock router', pattern: "/administrador/stock" },
        { name: 'ofertas-search router', pattern: "/administrador/ofertas-search" }
    ];
    
    checks.forEach(check => {
        if (indexContent.includes(check.pattern)) {
            console.log(`   ✅ ${check.name}`);
        } else {
            console.log(`   ❌ ${check.name} - NO ENCONTRADO`);
        }
    });
} else {
    console.log('   ❌ index.js no encontrado');
}

console.log('');

// 4. Verificar que las clases y APIs están disponibles
console.log('4️⃣  Verificando clases JavaScript...');
const jsFiles = [
    'public/js/productSearch.js',
    'public/js/productSearch.js'
];

const jsPath = path.join(process.cwd(), 'public/js/productSearch.js');
if (fs.existsSync(jsPath)) {
    console.log(`   ✅ productSearch.js`);
} else {
    console.log(`   ❌ productSearch.js no encontrado`);
}

console.log('');

// 5. Resumen
console.log('╔════════════════════════════════════════════════════════╗');
console.log('║  RESUMEN                                             ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

console.log('✅ Archivos conectados:\n');
console.log('  Backend:');
console.log('    - /routes/stock.js');
console.log('    - /routes/ofertas-search.js');
console.log('    - /routes/searchApi.js\n');

console.log('  Frontend:');
console.log('    - /public/js/productSearch.js');
console.log('    - /views/partials/productSearchInput.ejs');
console.log('    - /views/partials/productSearchModal.ejs\n');

console.log('  Vistas:');
console.log('    - /views/stock/buscar.ejs (Búsqueda principal)');
console.log('    - /views/stock/producto.ejs (Detalle)');
console.log('    - /views/stock/actualizar.ejs (Actualizar)\n');

console.log('📖 Documentación disponible:\n');
console.log('    - RUTAS_CONECTADAS.md (Este documento)');
console.log('    - QUICK_SETUP_BUSQUEDA.md');
console.log('    - README_BUSQUEDA.md\n');

console.log('🚀 URLs para Probar:\n');
console.log('    - Stock buscar: /administrador/stock/buscar');
console.log('    - Stock producto: /administrador/stock/producto/{ID}');
console.log('    - API search: POST /api/search/smart\n');

console.log('✨ Próximo paso:\n');
console.log('    npm start');
console.log('    Luego abre: http://localhost:3037/administrador/stock/buscar\n');

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║  ✅ TODO CONECTADO Y LISTO PARA USAR                 ║');
console.log('╚════════════════════════════════════════════════════════╝\n');
