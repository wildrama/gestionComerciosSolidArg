#!/usr/bin/env node

/**
 * Script de Setup - Sistema de Búsqueda
 * Verifica dependencias y realiza validaciones
 */

const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║  Setup - Sistema de Búsqueda Universal                ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

// 1. Verificar Node.js
console.log('1️⃣  Verificando Node.js...');
const nodeVersion = process.version;
console.log(`   ✅ Node.js ${nodeVersion}\n`);

// 2. Verificar npm
console.log('2️⃣  Verificando npm...');
const npmVersion = require('child_process')
    .execSync('npm -v', { encoding: 'utf-8' })
    .trim();
console.log(`   ✅ npm ${npmVersion}\n`);

// 3. Verificar archivos requeridos
console.log('3️⃣  Verificando archivos del sistema...');
const requiredFiles = [
    'routes/searchApi.js',
    'public/js/productSearch.js',
    'views/partials/productSearchInput.ejs',
    'views/partials/productSearchModal.ejs',
    'index.js'
];

let allFilesOk = true;
requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
        console.log(`   ✅ ${file}`);
    } else {
        console.log(`   ❌ FALTA: ${file}`);
        allFilesOk = false;
    }
});

if (!allFilesOk) {
    console.log('\n⚠️  Faltan algunos archivos. Verifica que estén creados.\n');
    process.exit(1);
}

console.log('');

// 4. Verificar package.json
console.log('4️⃣  Verificando dependencias en package.json...');
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const requiredDeps = ['express', 'mongoose', 'axios'];
    
    let allDepsOk = true;
    requiredDeps.forEach(dep => {
        if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
            console.log(`   ✅ ${dep}`);
        } else {
            console.log(`   ⚠️  ${dep} no encontrado (verificar)`);
            allDepsOk = false;
        }
    });
    
    if (!allDepsOk) {
        console.log('\n💡 Sugerencia: npm install axios (si falta)\n');
    }
} else {
    console.log('   ⚠️  package.json no encontrado\n');
}

console.log('');

// 5. Verificar index.js configuración
console.log('5️⃣  Verificando configuración en index.js...');
const indexPath = path.join(process.cwd(), 'index.js');
if (fs.existsSync(indexPath)) {
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    
    const checks = [
        { name: 'searchApi require', pattern: "require('./routes/searchApi')" },
        { name: 'searchApi router', pattern: "app.use('/api/search'" }
    ];
    
    checks.forEach(check => {
        if (indexContent.includes(check.pattern)) {
            console.log(`   ✅ ${check.name}`);
        } else {
            console.log(`   ⚠️  ${check.name} - necesita ser agregado`);
        }
    });
} else {
    console.log('   ❌ index.js no encontrado\n');
    process.exit(1);
}

console.log('');

// 6. Verificar MongoDB
console.log('6️⃣  Verificando MongoDB...');
try {
    const mongoose = require('mongoose');
    console.log('   ✅ Mongoose instalado');
    console.log('   💡 Asegúrate de que MongoDB esté corriendo (local o Atlas)\n');
} catch (e) {
    console.log('   ⚠️  Mongoose no encontrado (verificar)\n');
}

// 7. Resumen
console.log('╔════════════════════════════════════════════════════════╗');
console.log('║  PRÓXIMOS PASOS                                       ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

console.log('1. ✅ Archivos del frontend: COMPLETOS\n');

console.log('2. ⏳ Rutas del backend (necesario):');
console.log('   - Crear/actualizar routes/stock.js');
console.log('   - Crear/actualizar routes/ofertas.js');
console.log('   - Ver: ROUTES_IMPLEMENTATION.md\n');

console.log('3. ⏳ Modelos MongoDB (si no existe):');
console.log('   - Crear modelo Oferta');
console.log('   - Ver: ROUTES_IMPLEMENTATION.md\n');

console.log('4. 📖 Documentación:');
console.log('   - Leer: SEARCH_INTEGRATION_GUIDE.md');
console.log('   - Leer: ROUTES_IMPLEMENTATION.md');
console.log('   - Leer: README_BUSQUEDA.md\n');

console.log('5. 🧪 Testing:');
console.log('   - npm start (iniciar servidor)');
console.log('   - Ir a: http://localhost:3000/administrador/stock/actualizar');
console.log('   - Probar búsqueda en navegador\n');

console.log('6. 🔍 Validar instalación:');
console.log('   - npm run validate (cuando exista script)\n');

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║  VERIFICACIÓN COMPLETADA ✅                           ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

console.log('📚 Para más información, ver:\n');
console.log('   - SEARCH_INTEGRATION_GUIDE.md    (Cómo usar)');
console.log('   - ROUTES_IMPLEMENTATION.md        (Rutas necesarias)');
console.log('   - PHASE3_STATUS.md                (Estado del proyecto)');
console.log('   - README_BUSQUEDA.md              (Guía rápida)\n');

process.exit(0);
