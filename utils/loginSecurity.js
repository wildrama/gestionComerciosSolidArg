/**
 * LOGIN VALIDATION & SECURITY MODULE
 * Validaciones mejoradas, rate limiting, logging y seguridad
 */

const ExpressError = require('../utils/ExpressError');

// ============================================
// PASSWORD VALIDATION
// ============================================

/**
 * Valida que la contraseña cumpla con requisitos mínimos
 * - Mínimo 8 caracteres
 * - Al menos una mayúscula
 * - Al menos una minúscula
 * - Al menos un número
 * - Al menos un carácter especial
 */
const validatePassword = (password) => {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push('La contraseña debe tener mínimo 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una mayúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una minúscula');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Debe contener al menos un número');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Debe contener al menos un carácter especial (!@#$%^&* etc)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida que el username sea válido
 * - Mínimo 3 caracteres
 * - Máximo 20 caracteres
 * - Solo letras, números y guión bajo
 * - No puede empezar con número
 */
const validateUsername = (username) => {
  const errors = [];
  
  if (!username || username.length < 3) {
    errors.push('El usuario debe tener mínimo 3 caracteres');
  }
  
  if (username.length > 20) {
    errors.push('El usuario no puede superar 20 caracteres');
  }
  
  if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(username)) {
    errors.push('El usuario solo puede contener letras, números, guión y guión bajo');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida credenciales de login
 */
const validateLoginCredentials = (username, password) => {
  const errors = [];
  
  if (!username || username.trim().length === 0) {
    errors.push('El usuario es requerido');
  }
  
  if (!password || password.length === 0) {
    errors.push('La contraseña es requerida');
  }
  
  if (username && username.length < 2) {
    errors.push('El usuario debe tener al menos 2 caracteres');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida datos de registro de usuario
 */
const validateUserRegistration = (username, password, passwordConfirm) => {
  const errors = [];
  
  // Validar username
  const usernameValid = validateUsername(username);
  if (!usernameValid.isValid) {
    errors.push(...usernameValid.errors);
  }
  
  // Validar contraseña
  const passwordValid = validatePassword(password);
  if (!passwordValid.isValid) {
    errors.push(...passwordValid.errors);
  }
  
  // Validar confirmación
  if (password !== passwordConfirm) {
    errors.push('Las contraseñas no coinciden');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ============================================
// RATE LIMITING DATA STRUCTURE
// ============================================

class RateLimiter {
  constructor() {
    this.attempts = new Map();
    this.blockedIPs = new Map();
    
    // Limpiar intentos viejos cada 15 minutos
    setInterval(() => {
      this.cleanupOldAttempts();
    }, 15 * 60 * 1000);
  }
  
  /**
   * Registra un intento de login
   * @param {string} ip - Dirección IP
   * @param {string} username - Username intentado
   * @returns {object} - { allowed: boolean, remaining: number, resetTime: timestamp }
   */
  recordAttempt(ip, username) {
    const maxAttempts = 5;
    const lockoutTime = 15 * 60 * 1000; // 15 minutos
    const key = `${ip}:${username}`;
    
    // Si IP está bloqueada
    if (this.blockedIPs.has(ip)) {
      const blockData = this.blockedIPs.get(ip);
      if (Date.now() < blockData.unblockTime) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: blockData.unblockTime,
          message: 'Demasiados intentos fallidos. Intenta de nuevo en 15 minutos.'
        };
      } else {
        this.blockedIPs.delete(ip);
      }
    }
    
    // Obtener o crear registro de intentos
    if (!this.attempts.has(key)) {
      this.attempts.set(key, {
        count: 0,
        firstAttempt: Date.now(),
        lastAttempt: Date.now()
      });
    }
    
    const attempt = this.attempts.get(key);
    attempt.count++;
    attempt.lastAttempt = Date.now();
    
    // Si se excedieron los intentos
    if (attempt.count > maxAttempts) {
      this.blockedIPs.set(ip, {
        unblockTime: Date.now() + lockoutTime,
        username,
        blockedAt: Date.now()
      });
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + lockoutTime,
        message: 'Demasiados intentos fallidos. IP bloqueada por 15 minutos.'
      };
    }
    
    return {
      allowed: true,
      remaining: maxAttempts - attempt.count,
      resetTime: null,
      message: null
    };
  }
  
  /**
   * Limpia un registro de intentos exitosos
   */
  clearAttempts(ip, username) {
    const key = `${ip}:${username}`;
    this.attempts.delete(key);
  }
  
  /**
   * Limpia intentos viejos (más de 1 hora)
   */
  cleanupOldAttempts() {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hora
    
    for (const [key, data] of this.attempts) {
      if (now - data.lastAttempt > maxAge) {
        this.attempts.delete(key);
      }
    }
    
    // Limpiar IPs desbloqueadas
    for (const [ip, data] of this.blockedIPs) {
      if (now > data.unblockTime) {
        this.blockedIPs.delete(ip);
      }
    }
  }
  
  /**
   * Obtiene información de bloqueo para una IP
   */
  getBlockedInfo(ip) {
    return this.blockedIPs.get(ip) || null;
  }
}

// ============================================
// LOGIN LOGGING & AUDIT
// ============================================

class LoginAuditor {
  constructor() {
    this.logs = [];
    this.maxLogs = 10000; // Máximo de logs en memoria
  }
  
  /**
   * Registra un intento de login
   */
  logAttempt(ip, username, success, reason = '') {
    const logEntry = {
      timestamp: new Date().toISOString(),
      ip,
      username,
      success,
      reason,
      userAgent: null
    };
    
    this.logs.push(logEntry);
    
    // Mantener solo los últimos X logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    
    console.log(`[LOGIN AUDIT] ${new Date().toISOString()} - ${username}@${ip} - ${success ? 'SUCCESS' : 'FAILED'}: ${reason}`);
  }
  
  /**
   * Obtiene logs de login de un usuario
   */
  getAttemptsByUser(username, limit = 20) {
    return this.logs
      .filter(log => log.username === username)
      .slice(-limit)
      .reverse();
  }
  
  /**
   * Obtiene logs de una IP
   */
  getAttemptsByIP(ip, limit = 20) {
    return this.logs
      .filter(log => log.ip === ip)
      .slice(-limit)
      .reverse();
  }
  
  /**
   * Obtiene intentos fallidos recientes
   */
  getRecentFailures(minutes = 60) {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.logs.filter(log => !log.success && new Date(log.timestamp).getTime() > cutoff);
  }
  
  /**
   * Detecta patrones sospechosos
   */
  detectSuspiciousActivity() {
    const now = Date.now();
    const last5Minutes = now - (5 * 60 * 1000);
    
    const recentFailures = this.logs.filter(
      log => !log.success && new Date(log.timestamp).getTime() > last5Minutes
    );
    
    // Agrupar por IP
    const failuresByIP = {};
    recentFailures.forEach(log => {
      failuresByIP[log.ip] = (failuresByIP[log.ip] || 0) + 1;
    });
    
    // Agrupar por usuario
    const failuresByUser = {};
    recentFailures.forEach(log => {
      failuresByUser[log.username] = (failuresByUser[log.username] || 0) + 1;
    });
    
    const suspicious = {
      ips: {},
      users: {},
      highRiskIPs: [],
      highRiskUsers: []
    };
    
    // IPs con >5 fallos en 5 minutos
    for (const [ip, count] of Object.entries(failuresByIP)) {
      suspicious.ips[ip] = count;
      if (count > 5) {
        suspicious.highRiskIPs.push({ ip, failureCount: count });
      }
    }
    
    // Usuarios con >3 fallos en 5 minutos
    for (const [username, count] of Object.entries(failuresByUser)) {
      suspicious.users[username] = count;
      if (count > 3) {
        suspicious.highRiskUsers.push({ username, failureCount: count });
      }
    }
    
    return suspicious;
  }
}

// ============================================
// SESSION CACHE
// ============================================

class SessionCache {
  constructor(ttl = 5 * 60 * 1000) { // 5 minutos por defecto
    this.cache = new Map();
    this.ttl = ttl;
    
    // Limpiar cache cada 10 minutos
    setInterval(() => {
      this.cleanup();
    }, 10 * 60 * 1000);
  }
  
  /**
   * Guarda usuario en caché
   */
  setUser(userId, userData) {
    this.cache.set(userId, {
      data: userData,
      timestamp: Date.now(),
      hits: 0
    });
  }
  
  /**
   * Obtiene usuario del caché
   */
  getUser(userId) {
    if (!this.cache.has(userId)) {
      return null;
    }
    
    const entry = this.cache.get(userId);
    
    // Verificar si expiró
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(userId);
      return null;
    }
    
    entry.hits++;
    return entry.data;
  }
  
  /**
   * Invalida caché de usuario
   */
  invalidateUser(userId) {
    this.cache.delete(userId);
  }
  
  /**
   * Limpia entradas expiradas
   */
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * Obtiene estadísticas de caché
   */
  getStats() {
    let totalHits = 0;
    let totalSize = this.cache.size;
    
    for (const entry of this.cache.values()) {
      totalHits += entry.hits;
    }
    
    return {
      size: totalSize,
      hits: totalHits,
      ttl: this.ttl,
      hitRate: totalSize > 0 ? (totalHits / totalSize).toFixed(2) : 0
    };
  }
}

// ============================================
// EXPORT
// ============================================

module.exports = {
  validatePassword,
  validateUsername,
  validateLoginCredentials,
  validateUserRegistration,
  RateLimiter,
  LoginAuditor,
  SessionCache
};
