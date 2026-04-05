/**
 * PRICE SYNC MODULE FOR STOCK INDIVIDUAL
 * Sincroniza los precios desde editPrecio.ejs automáticamente
 * Features:
 * - Detecta cambios en localStorage
 * - Actualiza precios en tiempo real
 * - Sincroniza con el backend
 */

console.log('✅ [priceSync.js] Script iniciado');

// Obtener ID del producto de la URL
const getProductIdFromURL = () => {
    const pathParts = window.location.pathname.split('/');
    return pathParts[pathParts.length - 1];
};

const productId = getProductIdFromURL();
console.log('[priceSync.js] Producto ID:', productId);

// Elementos del DOM
const precioMinoristaElement = document.querySelector('.detail-grid-large .detail-box-large:nth-child(1) .detail-box-value.price');
const precioMayoristaElement = document.querySelector('.detail-grid-large .detail-box-large:nth-child(2) .detail-box-value.price');
const precioCostoElement = document.querySelector('.detail-grid-large .detail-box-large:nth-child(3) .detail-box-value.price');

console.log('[priceSync.js] Elementos encontrados:', {
    minorista: !!precioMinoristaElement,
    mayorista: !!precioMayoristaElement,
    costo: !!precioCostoElement
});

// Sincronizar precios desde localStorage
const syncFromLocalStorage = () => {
    try {
        const lastUpdate = localStorage.getItem(`lastPriceUpdate_${productId}`);
        if (lastUpdate) {
            const data = JSON.parse(lastUpdate);
            console.log('[priceSync.js] Encontrado en localStorage:', data);
            
            // Actualizar precios si existen
            if (data.precioMinorista && precioMinoristaElement) {
                const oldPrice = precioMinoristaElement.textContent;
                precioMinoristaElement.textContent = `$${parseFloat(data.precioMinorista).toFixed(2)}`;
                precioMinoristaElement.style.animation = 'priceFlash 0.6s ease-out';
                console.log('[priceSync.js] Minorista actualizado:', oldPrice, '→', precioMinoristaElement.textContent);
            }
            
            if (data.precioMayorista && precioMayoristaElement) {
                const oldPrice = precioMayoristaElement.textContent;
                precioMayoristaElement.textContent = `$${parseFloat(data.precioMayorista).toFixed(2)}`;
                precioMayoristaElement.style.animation = 'priceFlash 0.6s ease-out';
                console.log('[priceSync.js] Mayorista actualizado:', oldPrice, '→', precioMayoristaElement.textContent);
            }
            
            if (data.precioCosto && precioCostoElement) {
                const oldPrice = precioCostoElement.textContent;
                precioCostoElement.textContent = `$${parseFloat(data.precioCosto).toFixed(2)}`;
                precioCostoElement.style.animation = 'priceFlash 0.6s ease-out';
                console.log('[priceSync.js] Costo actualizado:', oldPrice, '→', precioCostoElement.textContent);
            }
            
            // Limpiar localStorage
            localStorage.removeItem(`lastPriceUpdate_${productId}`);
            console.log('[priceSync.js] localStorage limpiado');
        }
    } catch (e) {
        console.log('[priceSync.js] Error sincronizando desde localStorage:', e);
    }
};

// Sincronizar precios desde el backend
const syncFromBackend = async () => {
    try {
        console.log('[priceSync.js] Sincronizando desde backend...');
        const response = await axios.get(`/administrador/productos/${productId}/precios`);
        
        if (response.data.success) {
            const precios = response.data.precios;
            console.log('[priceSync.js] Precios actuales del backend:', precios);
            
            // Actualizar si hay cambios
            if (precioMinoristaElement && precios.precioMinorista) {
                const currentPrice = precioMinoristaElement.textContent.replace('$', '');
                if (currentPrice !== precios.precioMinorista) {
                    precioMinoristaElement.textContent = `$${precios.precioMinorista}`;
                    console.log('[priceSync.js] Minorista sincronizado desde backend');
                }
            }
            
            if (precioMayoristaElement && precios.precioMayorista) {
                const currentPrice = precioMayoristaElement.textContent.replace('$', '');
                if (currentPrice !== precios.precioMayorista) {
                    precioMayoristaElement.textContent = `$${precios.precioMayorista}`;
                    console.log('[priceSync.js] Mayorista sincronizado desde backend');
                }
            }
            
            if (precioCostoElement && precios.precioCosto) {
                const currentPrice = precioCostoElement.textContent.replace('$', '');
                if (currentPrice !== precios.precioCosto) {
                    precioCostoElement.textContent = `$${precios.precioCosto}`;
                    console.log('[priceSync.js] Costo sincronizado desde backend');
                }
            }
        }
    } catch (e) {
        console.log('[priceSync.js] No se pudo sincronizar desde backend:', e.message);
    }
};

// Agregar estilos de animación
const style = document.createElement('style');
style.innerHTML = `
    @keyframes priceFlash {
        0% {
            color: #10b981;
            font-weight: 700;
            transform: scale(1.1);
        }
        50% {
            color: #16a34a;
            font-weight: 700;
            transform: scale(1.05);
        }
        100% {
            color: inherit;
            font-weight: inherit;
            transform: scale(1);
        }
    }
`;
document.head.appendChild(style);

// Ejecutar sincronización
console.log('[priceSync.js] Iniciando sincronización...');
syncFromLocalStorage();

// Sincronizar también desde backend cada 10 segundos (por si hay cambios desde otra sesión)
setInterval(syncFromBackend, 10000);

// Sincronizar al hacer focus en la ventana (cuando vuelves del editor de precios)
window.addEventListener('focus', () => {
    console.log('[priceSync.js] Sincronizando al retomar foco...');
    syncFromLocalStorage();
    syncFromBackend();
});

// Sincronizar al cargar la página en caso de que haya localStorage
document.addEventListener('DOMContentLoaded', () => {
    console.log('[priceSync.js] DOM cargado, haciendo sincronización final');
    syncFromLocalStorage();
});

console.log('✅ [priceSync.js] Script completamente cargado');
