// Importar módulos de seguridad
const { SessionCache } = require('./utils/loginSecurity');
const User = require('./models/usuario');

// Instancia de caché global
const sessionCache = new SessionCache(5 * 60 * 1000); // 5 minutos

/**
 * Middleware para verificar que el usuario esté logeado
 * Incluye caché optimizado para reducir consultas a BD
 */
module.exports.isLoggedIn = async (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'Tiene que estar logeado antes');
        console.log('[MIDDLEWARE] No autenticado - Redirigiendo a home');
        return res.redirect('/');
    }
    
    // Verificar caché de sesión para obtener datos frescos del usuario
    if (req.user && req.user._id) {
        const userId = req.user._id.toString();
        const cachedUser = sessionCache.getUser(userId);
        if (cachedUser) {
            console.log('[MIDDLEWARE] Usuario obtenido de caché');
            req.user.funcion = cachedUser.funcion;
            req.user.username = cachedUser.username;
            req.user.activeSessionToken = cachedUser.activeSessionToken;
        }

        const currentSessionToken = req.session.userSessionToken || null;
        const storedToken = req.user.activeSessionToken || null;

        if (storedToken && currentSessionToken !== storedToken) {
            const redirectTarget = req.user?.funcion === 'CAJA' ? '/ingresar?panel=CAJA' : '/ingresar?panel=ADMINISTRADOR';
            console.log('[MIDDLEWARE] Sesión desplazada por nuevo login para:', req.user.username);
            req.session.userSessionToken = null;
            req.flash('error', 'Tu cuenta se abrió en otro navegador. Volvé a iniciar sesión.');

            return req.logOut((err) => {
                if (err) {
                    console.error('[MIDDLEWARE] Error al cerrar sesión desplazada:', err);
                    return res.redirect('/ingresar');
                }

                return res.redirect(redirectTarget);
            });
        }
    }
    
    next();
};

/**
 * Middleware de autorización por rol (flexible)
 * Soporta múltiples roles
 */
module.exports.isAuthorizedRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.isAuthenticated()) {
            req.flash('error', 'Debe estar autenticado');
            console.log('[MIDDLEWARE] No autenticado en isAuthorizedRole');
            return res.redirect('/');
        }
        
        // Convertir a array si es string
        const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        
        if (!rolesArray.includes(req.user.funcion)) {
            console.log('[MIDDLEWARE] Acceso denegado - Rol usuario:', req.user.funcion, 'Roles permitidos:', rolesArray);
            req.flash('error', 'No tiene permisos para acceder a esta sección');
            return res.redirect('/');
        }
        
        console.log('[MIDDLEWARE] Acceso permitido para:', req.user.funcion);
        next();
    };
};

/**
 * Middleware específico para ADMINISTRADOR
 * Método legado, mantener para compatibilidad
 */
module.exports.isAdmin = (role) => {
    return (req, res, next) => {
        if (!req.isAuthenticated()) {
            req.flash('error', 'Debe estar autenticado');
            return res.redirect('/');
        }
        
        if (req.user.funcion !== role) {
            console.log('[MIDDLEWARE] Acceso denegado - Usuario:', req.user.funcion, 'Rol requerido:', role);
            req.flash('error', 'No se puede ingresar');
            return res.redirect('/');
        }
        
        next();
    };
};

/**
 * Middleware específico para CAJA
 * Método legado, mantener para compatibilidad
 */
module.exports.isCaja = (role) => {
    return (req, res, next) => {
        if (!req.isAuthenticated()) {
            req.flash('error', 'Debe estar autenticado');
            return res.redirect('/');
        }
        
        if (req.user.funcion !== role) {
            console.log('[MIDDLEWARE] Acceso denegado - Usuario:', req.user.funcion, 'Rol requerido:', role);
            req.flash('error', 'No se puede ingresar');
            return res.redirect('/');
        }
        
        next();
    };
};

/**
 * Middleware para REPARTIDOR
 */
module.exports.isRepartidor = () => {
    return (req, res, next) => {
        if (!req.isAuthenticated()) {
            req.flash('error', 'Debe estar autenticado');
            return res.redirect('/');
        }
        
        if (req.user.funcion !== 'REPARTIDOR') {
            console.log('[MIDDLEWARE] Acceso denegado - Solo repartidores');
            req.flash('error', 'No se puede ingresar');
            return res.redirect('/');
        }
        
        next();
    };
};

/**
 * Middleware para verificar múltiples roles
 * Uso: middleware.hasAnyRole(['ADMINISTRADOR', 'STOCK'])
 */
module.exports.hasAnyRole = (roles) => {
    return (req, res, next) => {
        if (!req.isAuthenticated()) {
            req.flash('error', 'Debe estar autenticado');
            return res.redirect('/');
        }
        
        if (!roles.includes(req.user.funcion)) {
            console.log('[MIDDLEWARE] Acceso denegado - Rol:', req.user.funcion);
            req.flash('error', 'No tiene permisos suficientes');
            return res.redirect('/');
        }
        
        next();
    };
};

/**
 * Middleware de error para capturar excepciones asincrónicas
 */
module.exports.catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
}; 


