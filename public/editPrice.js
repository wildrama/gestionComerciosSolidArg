/**
 * EDIT PRICE MODULE - IMPROVED VERSION
 * Maneja la edición individual de precios con actualizaciones en tiempo real
 * Features:
 * - Animaciones visuales mientras se guarda
 * - Feedback inmediato al usuario
 * - Actualización del precio en la CARD en tiempo real
 * - Mejor manejo de errores
 * - Console logs para debugging
 */

// ============================================
// DOM ELEMENTS
// ============================================
const idPrec = document.getElementById("idPrec");
const subnav = document.getElementsByClassName("subnav");
const body = document.getElementsByTagName("body");
if (body.length > 0) {
    body[0].style.backgroundColor = "#fff";
}
if (subnav.length > 0) {
    subnav[0].style.display = "none";
}

// Elementos del DOM - Precios
const aumPorMin = document.getElementById("aumPorMin");
const aumManMin = document.getElementById("aumManMin");
const precioMinorista = document.getElementById("precioMinorista");
const minRes = document.getElementById("minRes");

const aumPorMay = document.getElementById("aumPorMay");
const aumManMay = document.getElementById("aumManMay");
const precioMayorista = document.getElementById("precioMayorista");
const manRes = document.getElementById("manRes");

const aumPorCos = document.getElementById("aumPorCos");
const aumManCos = document.getElementById("aumManCos");
const precioCosto = document.getElementById("precioCosto");
const cosRes = document.getElementById("cosRes");

// Elementos de formulario
const subMin = document.getElementById("subMin");
const subMay = document.getElementById("subMay");
const subCos = document.getElementById("subCos");

// ============================================
// STATE MANAGEMENT
// ============================================
let nuevoMinorista = parseFloat(precioMinorista?.innerHTML || 0);
let nuevoMayorista = parseFloat(precioMayorista?.innerHTML || 0);
let nuevoCosto = parseFloat(precioCosto?.innerHTML || 0);
let isLoading = false;

console.log('✅ [editPrice.js] Script iniciado');
console.log('✅ [editPrice.js] Precio Minorista:', nuevoMinorista);
console.log('✅ [editPrice.js] Precio Mayorista:', nuevoMayorista);
console.log('✅ [editPrice.js] Precio Costo:', nuevoCosto);

// ============================================
// ALERT SYSTEM - MEJORADO
// ============================================
const alertar = (mensaje, color, producto = "") => {
    const pop = document.createElement("div");
    pop.innerHTML = mensaje + (producto ? ' "' + producto + '"' : '');
    pop.classList.add("alert");
    pop.classList.add(color);
    pop.style.position = "fixed";
    pop.style.top = "0";
    pop.style.width = "100%";
    pop.style.zIndex = "10000";
    pop.style.animation = "slideDown 0.3s ease-out";
    pop.style.padding = "16px";
    pop.style.fontWeight = "600";
    pop.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
    
    if (body.length > 0) {
        body[0].appendChild(pop);
        console.log('[editPrice.js] Alert mostrada:', color, mensaje);
        setTimeout(() => {
            pop.style.animation = "slideUp 0.3s ease-out";
            setTimeout(() => {
                if (body.length > 0 && body[0].contains(pop)) {
                    body[0].removeChild(pop);
                }
            }, 300);
        }, color.includes('success') ? 4000 : 3000);
    }
};

// Agregar estilos de animación
const style = document.createElement("style");
style.innerHTML = `
    @keyframes slideDown {
        from {
            transform: translateY(-100%);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes slideUp {
        from {
            transform: translateY(0);
            opacity: 1;
        }
        to {
            transform: translateY(-100%);
            opacity: 0;
        }
    }
    
    .price-update-spinner {
        display: inline-block;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .price-card-updating {
        opacity: 0.7;
        pointer-events: none;
    }
    
    .price-success-flash {
        animation: flash 0.5s ease-out;
    }
    
    @keyframes flash {
        0% { background-color: #10b981; }
        100% { background-color: transparent; }
    }
`;
document.head.appendChild(style);

// ============================================
// UTILITY FUNCTIONS
// ============================================
const getButtonFromForm = (form) => {
    return form.querySelector('button[type="submit"]');
};

const setButtonLoading = (button, isLoading) => {
    if (!button) return;
    
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = '⏳ Guardando...';
        button.style.opacity = '0.7';
    } else {
        button.disabled = false;
        button.innerHTML = '✅ Guardar Cambio';
        button.style.opacity = '1';
    }
};

const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
};

const flashPriceCard = (cardElement) => {
    if (!cardElement) return;
    
    // Agregar múltiples efectos
    cardElement.classList.add('price-success-flash');
    
    // Pulse animation
    const priceValue = cardElement.querySelector('[style*="font-size: 24px"]');
    if (priceValue) {
        priceValue.style.animation = 'pulse 0.6s ease-out';
        setTimeout(() => {
            priceValue.style.animation = '';
        }, 600);
    }
    
    setTimeout(() => {
        cardElement.classList.remove('price-success-flash');
    }, 800);
};

// ============================================
// PRECIO MINORISTA
// ============================================
if (aumPorMin) {
    aumPorMin.addEventListener("input", e => {
        const incremento = parseFloat(e.target.value) || 0;
        const precioActual = parseFloat(precioMinorista.innerHTML);
        nuevoMinorista = (incremento * precioActual / 100) + precioActual;
        if (minRes) minRes.innerHTML = formatPrice(nuevoMinorista);
        if (aumManMin) aumManMin.value = "";
        console.log('📝 [editPrice.js] Minorista - Aumento %:', incremento, '-> Nuevo:', nuevoMinorista);
    });
}

if (aumManMin) {
    aumManMin.addEventListener("input", e => {
        nuevoMinorista = parseFloat(e.target.value) || 0;
        if (minRes) minRes.innerHTML = formatPrice(nuevoMinorista);
        if (aumPorMin) aumPorMin.value = "";
        console.log('📝 [editPrice.js] Minorista - Manual:', nuevoMinorista);
    });
}

// ============================================
// PRECIO MAYORISTA
// ============================================
if (aumPorMay) {
    aumPorMay.addEventListener("input", e => {
        const incremento = parseFloat(e.target.value) || 0;
        const precioActual = parseFloat(precioMayorista.innerHTML);
        nuevoMayorista = (incremento * precioActual / 100) + precioActual;
        if (manRes) manRes.innerHTML = formatPrice(nuevoMayorista);
        if (aumManMay) aumManMay.value = "";
        console.log('📝 [editPrice.js] Mayorista - Aumento %:', incremento, '-> Nuevo:', nuevoMayorista);
    });
}

if (aumManMay) {
    aumManMay.addEventListener("input", e => {
        nuevoMayorista = parseFloat(e.target.value) || 0;
        if (manRes) manRes.innerHTML = formatPrice(nuevoMayorista);
        if (aumPorMay) aumPorMay.value = "";
        console.log('📝 [editPrice.js] Mayorista - Manual:', nuevoMayorista);
    });
}

// ============================================
// PRECIO COSTO
// ============================================
if (aumPorCos) {
    aumPorCos.addEventListener("input", e => {
        const incremento = parseFloat(e.target.value) || 0;
        const precioActual = parseFloat(precioCosto.innerHTML);
        nuevoCosto = (incremento * precioActual / 100) + precioActual;
        if (cosRes) cosRes.innerHTML = formatPrice(nuevoCosto);
        if (aumManCos) aumManCos.value = "";
        console.log('📝 [editPrice.js] Costo - Aumento %:', incremento, '-> Nuevo:', nuevoCosto);
    });
}

if (aumManCos) {
    aumManCos.addEventListener("input", e => {
        nuevoCosto = parseFloat(e.target.value) || 0;
        if (cosRes) cosRes.innerHTML = formatPrice(nuevoCosto);
        if (aumPorCos) aumPorCos.value = "";
        console.log('📝 [editPrice.js] Costo - Manual:', nuevoCosto);
    });
}

// ============================================
// FORM SUBMIT HANDLERS - MINORISTA
// ============================================
if (subMin) {
    subMin.addEventListener("submit", async e => {
        e.preventDefault();
        
        if (isLoading) return;
        
        console.log('📤 [editPrice.js] Guardando Minorista:', nuevoMinorista);
        
        if (!minRes || minRes.innerHTML == "" || minRes.innerHTML == "-") {
            alertar("No se registran cambios en el producto", "alert-danger", idPrec.value);
            console.log('❌ [editPrice.js] Sin cambios en minorista');
            return;
        }
        
        if (minRes.innerHTML == "$NaN" || isNaN(nuevoMinorista) || nuevoMinorista < 0) {
            alertar("Precio minorista inválido", "alert-danger", "");
            console.log('❌ [editPrice.js] Precio inválido:', nuevoMinorista);
            return;
        }
        
        isLoading = true;
        const button = getButtonFromForm(subMin);
        setButtonLoading(button, true);
        
        try {
            console.log('📡 [editPrice.js] Enviando PUT a /administrador/productos/' + idPrec.value + '/precmin');
            
            const send = await axios.put(`/administrador/productos/${idPrec.value}/precmin`, {
                precioMinorista: nuevoMinorista
            });
            
            console.log('✅ [editPrice.js] Respuesta:', send.data);
            
            if (send.data.success) {
                // Actualizar CARD visual
                if (precioMinorista) {
                    precioMinorista.innerHTML = nuevoMinorista.toFixed(2);
                }
                
                // Guardar en localStorage para sincronización
                try {
                    const productId = idPrec?.value;
                    if (productId) {
                        const lastUpdate = {
                            productId,
                            precioMinorista: nuevoMinorista,
                            timestamp: new Date().toISOString()
                        };
                        localStorage.setItem(`lastPriceUpdate_${productId}`, JSON.stringify(lastUpdate));
                        console.log('[editPrice.js] Guardado en localStorage:', lastUpdate);
                    }
                } catch (e) {
                    console.log('[editPrice.js] No se pudo guardar en localStorage:', e);
                }
                
                // Flash effect
                const card = subMin.closest('.price-edit-card');
                if (card) flashPriceCard(card);
                
                // Reset formulario
                if (minRes) minRes.innerHTML = "-";
                if (aumPorMin) aumPorMin.value = "";
                if (aumManMin) aumManMin.value = "";
                
                // Notificación mejorada
                const precioAnterior = parseFloat(precioMinorista.innerHTML);
                const diferencia = (nuevoMinorista - precioAnterior).toFixed(2);
                alertar(`✅ Precio minorista actualizado: $${nuevoMinorista.toFixed(2)} (${diferencia > 0 ? '+' : ''}$${diferencia})`, "alert-success", send.data.data.nombre);
                console.log('✅ [editPrice.js] Minorista guardado exitosamente - Anterior:', precioAnterior, 'Nuevo:', nuevoMinorista);
            } else {
                alertar("Error: " + send.data.message, "alert-danger", "");
                console.log('❌ [editPrice.js] Error:', send.data.message);
            }
        } catch (error) {
            console.error('❌ [editPrice.js] Error al guardar minorista:', error);
            const errorMsg = error.response?.data?.message || error.message || "Error desconocido";
            const errorStatus = error.response?.status || 'N/A';
            console.log('❌ [editPrice.js] Error status:', errorStatus);
            console.log('❌ [editPrice.js] Error completo:', error);
            alertar("❌ Error al guardar precio minorista: " + errorMsg, "alert-danger", "");
        } finally {
            isLoading = false;
            setButtonLoading(button, false);
        }
    });
}

// ============================================
// FORM SUBMIT HANDLERS - MAYORISTA
// ============================================
if (subMay) {
    subMay.addEventListener("submit", async e => {
        e.preventDefault();
        
        if (isLoading) return;
        
        console.log('📤 [editPrice.js] Guardando Mayorista:', nuevoMayorista);
        
        if (!manRes || manRes.innerHTML == "" || manRes.innerHTML == "-") {
            alertar("No se registran cambios en el producto", "alert-danger", idPrec.value);
            console.log('❌ [editPrice.js] Sin cambios en mayorista');
            return;
        }
        
        if (manRes.innerHTML == "$NaN" || isNaN(nuevoMayorista) || nuevoMayorista < 0) {
            alertar("Precio mayorista inválido", "alert-danger", "");
            console.log('❌ [editPrice.js] Precio inválido:', nuevoMayorista);
            return;
        }
        
        isLoading = true;
        const button = getButtonFromForm(subMay);
        setButtonLoading(button, true);
        
        try {
            console.log('📡 [editPrice.js] Enviando PUT a /administrador/productos/' + idPrec.value + '/precmay');
            
            const send = await axios.put(`/administrador/productos/${idPrec.value}/precmay`, {
                precioMayorista: nuevoMayorista
            });
            
            console.log('✅ [editPrice.js] Respuesta:', send.data);
            
            if (send.data.success) {
                // Actualizar CARD visual
                if (precioMayorista) {
                    precioMayorista.innerHTML = nuevoMayorista.toFixed(2);
                }
                
                // Guardar en localStorage para sincronización
                try {
                    const productId = idPrec?.value;
                    if (productId) {
                        const lastUpdate = {
                            productId,
                            precioMayorista: nuevoMayorista,
                            timestamp: new Date().toISOString()
                        };
                        localStorage.setItem(`lastPriceUpdate_${productId}`, JSON.stringify(lastUpdate));
                        console.log('[editPrice.js] Guardado en localStorage:', lastUpdate);
                    }
                } catch (e) {
                    console.log('[editPrice.js] No se pudo guardar en localStorage:', e);
                }
                
                // Flash effect
                const card = subMay.closest('.price-edit-card');
                if (card) flashPriceCard(card);
                
                // Reset formulario
                if (manRes) manRes.innerHTML = "-";
                if (aumPorMay) aumPorMay.value = "";
                if (aumManMay) aumManMay.value = "";
                
                // Notificación mejorada
                const precioAnterior = parseFloat(precioMayorista.innerHTML);
                const diferencia = (nuevoMayorista - precioAnterior).toFixed(2);
                alertar(`✅ Precio mayorista actualizado: $${nuevoMayorista.toFixed(2)} (${diferencia > 0 ? '+' : ''}$${diferencia})`, "alert-success", send.data.data.nombre);
                console.log('✅ [editPrice.js] Mayorista guardado exitosamente - Anterior:', precioAnterior, 'Nuevo:', nuevoMayorista);
            } else {
                alertar("Error: " + send.data.message, "alert-danger", "");
                console.log('❌ [editPrice.js] Error:', send.data.message);
            }
        } catch (error) {
            console.error('❌ [editPrice.js] Error al guardar mayorista:', error);
            const errorMsg = error.response?.data?.message || error.message || "Error desconocido";
            const errorStatus = error.response?.status || 'N/A';
            console.log('❌ [editPrice.js] Error status:', errorStatus);
            console.log('❌ [editPrice.js] Error completo:', error);
            alertar("❌ Error al guardar precio mayorista: " + errorMsg, "alert-danger", "");
        } finally {
            isLoading = false;
            setButtonLoading(button, false);
        }
    });
}

// ============================================
// FORM SUBMIT HANDLERS - COSTO
// ============================================
if (subCos) {
    subCos.addEventListener("submit", async e => {
        e.preventDefault();
        
        if (isLoading) return;
        
        console.log('📤 [editPrice.js] Guardando Costo:', nuevoCosto);
        
        if (!cosRes || cosRes.innerHTML == "" || cosRes.innerHTML == "-") {
            alertar("No se registran cambios en el producto", "alert-danger", idPrec.value);
            console.log('❌ [editPrice.js] Sin cambios en costo');
            return;
        }
        
        if (cosRes.innerHTML == "$NaN" || isNaN(nuevoCosto) || nuevoCosto < 0) {
            alertar("Precio costo inválido", "alert-danger", "");
            console.log('❌ [editPrice.js] Precio inválido:', nuevoCosto);
            return;
        }
        
        isLoading = true;
        const button = getButtonFromForm(subCos);
        setButtonLoading(button, true);
        
        try {
            console.log('📡 [editPrice.js] Enviando PUT a /administrador/productos/' + idPrec.value + '/preccos');
            
            const send = await axios.put(`/administrador/productos/${idPrec.value}/preccos`, {
                precioCosto: nuevoCosto
            });
            
            console.log('✅ [editPrice.js] Respuesta:', send.data);
            
            if (send.data.success) {
                // Actualizar CARD visual
                if (precioCosto) {
                    precioCosto.innerHTML = nuevoCosto.toFixed(2);
                }
                
                // Guardar en localStorage para sincronización
                try {
                    const productId = idPrec?.value;
                    if (productId) {
                        const lastUpdate = {
                            productId,
                            precioCosto: nuevoCosto,
                            timestamp: new Date().toISOString()
                        };
                        localStorage.setItem(`lastPriceUpdate_${productId}`, JSON.stringify(lastUpdate));
                        console.log('[editPrice.js] Guardado en localStorage:', lastUpdate);
                    }
                } catch (e) {
                    console.log('[editPrice.js] No se pudo guardar en localStorage:', e);
                }
                
                // Flash effect
                const card = subCos.closest('.price-edit-card');
                if (card) flashPriceCard(card);
                
                // Reset formulario
                if (cosRes) cosRes.innerHTML = "-";
                if (aumPorCos) aumPorCos.value = "";
                if (aumManCos) aumManCos.value = "";
                
                // Notificación mejorada
                const precioAnterior = parseFloat(precioCosto.innerHTML);
                const diferencia = (nuevoCosto - precioAnterior).toFixed(2);
                alertar(`✅ Precio costo actualizado: $${nuevoCosto.toFixed(2)} (${diferencia > 0 ? '+' : ''}$${diferencia})`, "alert-success", send.data.data.nombre);
                console.log('✅ [editPrice.js] Costo guardado exitosamente - Anterior:', precioAnterior, 'Nuevo:', nuevoCosto);
            } else {
                alertar("Error: " + send.data.message, "alert-danger", "");
                console.log('❌ [editPrice.js] Error:', send.data.message);
            }
        } catch (error) {
            console.error('❌ [editPrice.js] Error al guardar costo:', error);
            const errorMsg = error.response?.data?.message || error.message || "Error desconocido";
            const errorStatus = error.response?.status || 'N/A';
            console.log('❌ [editPrice.js] Error status:', errorStatus);
            console.log('❌ [editPrice.js] Error completo:', error);
            alertar("❌ Error al guardar precio costo: " + errorMsg, "alert-danger", "");
        } finally {
            isLoading = false;
            setButtonLoading(button, false);
        }
    });
}

console.log('✅ [editPrice.js] Todos los listeners inicializados');
