#!/usr/bin/env node

/**
 * Validador de Sistema de Búsqueda
 * Verifica que todos los archivos necesarios estén en su lugar
 */

const fs = require('fs');
const path = require('path');

const checks = [
    // Backend API
    {
        name: 'API Backend',
        file: 'routes/searchApi.js',
        required: true,
        checks: ['POST /api/search/productos', 'POST /api/search/barcode', 'POST /api/search/smart']
    },
    
    // Frontend JS
    {
        name: 'ProductSearch Class',
        file: 'public/js/productSearch.js',
        required: true,
        checks: ['class ProductSearch', 'performSearch()', 'displayResults()']
    },
    
    // Partials
    {
        name: 'Search Input Component',
        file: 'views/partials/productSearchInput.ejs',
        required: true,
        checks: ['productSearchInput', 'productSelected', 'axios.post']
    },
    {
        name: 'Search Modal Component',
        file: 'views/partials/productSearchModal.ejs',
        required: true,
        checks: ['productSearchModal', 'modal', 'productSelected']
    },
    
    // Vistas
    {
        name: 'Stock - Actualizar',
        file: 'views/stock/actualizar.ejs',
        required: false,
        checks: ['productSearchInput', 'updateStockForm']
    },
    {
        name: 'Ofertas - Individual',
        file: 'views/ofertas/agregarIndividual.ejs',
        required: false,
        checks: ['productSearchInput', 'ofertaForm']
    },
    {
        name: 'Ofertas - Batch',
        file: 'views/ofertas/agregarBatch.ejs',
        required: false,
        checks: ['productSearchModal', 'ofertasBatchForm']
    },
    
    // Documentación
    {
        name: 'Guía de Integración',
        file: 'SEARCH_INTEGRATION_GUIDE.md',
        required: false,
        checks: ['Guía de Integración', 'POST /api/search']
    },
    {
        name: 'Implementación de Rutas',
        file: 'ROUTES_IMPLEMENTATION.md',
        required: false,
        checks: ['Rutas a Crear', 'Modelo Oferta']
    },
    {
        name: 'Estado del Proyecto',
        file: 'PHASE3_STATUS.md',
        required: false,
        checks: ['Estado Actual', 'Resumen Ejecutivo']
    }
];

function checkFile(check) {
    const filePath = path.join(process.cwd(), check.file);
    
    if (!fs.existsSync(filePath)) {
        return {
            status: 'MISSING',
            required: check.required,
            message: `❌ FALTA: ${check.file}`
        };
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const missingChecks = check.checks.filter(c => !content.includes(c));

    if (missingChecks.length > 0) {
        return {
            status: 'INCOMPLETE',
            required: check.required,
            message: `⚠️  INCOMPLETO: ${check.file}`,
            missing: missingChecks
        };
    }

    return {
        status: 'OK',
        required: check.required,
        message: `✅ OK: ${check.file}`
    };
}

function main() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  Validador - Sistema de Búsqueda      ║');
    console.log('╚════════════════════════════════════════╝\n');

    let requiredOk = 0;
    let requiredFail = 0;
    let optionalOk = 0;
    let optionalFail = 0;

    checks.forEach(check => {
        const result = checkFile(check);
        console.log(`${result.message}`);

        if (result.missing) {
            result.missing.forEach(m => console.log(`   - Falta: "${m}"`));
        }

        if (result.status === 'OK') {
            result.required ? requiredOk++ : optionalOk++;
        } else {
            result.required ? requiredFail++ : optionalFail++;
        }
    });

    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  RESUMEN                              ║');
    console.log('╚════════════════════════════════════════╝\n');

    console.log(`Requeridos:  ${requiredOk}/${requiredOk + requiredFail} ✅`);
    console.log(`Opcionales:  ${optionalOk}/${optionalOk + optionalFail}`);

    if (requiredFail > 0) {
        console.log('\n⚠️  Faltan archivos requeridos. Procede a crear/verificar.');
        process.exit(1);
    } else if (optionalFail > 0) {
        console.log('\n✓ Todos los requeridos están OK. Faltan opcionales (no crítico).');
        process.exit(0);
    } else {
        console.log('\n✅ Sistema completo! Listo para usar.');
        process.exit(0);
    }
}

// Ejecutar
if (require.main === module) {
    main();
}

module.exports = { checkFile, checks };
