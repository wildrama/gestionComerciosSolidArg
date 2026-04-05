# 🎨 Guía de Estilos - Sistema de Diseño Unificado

## 📚 Tabla de Contenidos
1. [Colores](#colores)
2. [Tipografía](#tipografía)
3. [Componentes](#componentes)
4. [Espaciado](#espaciado)
5. [Responsive Design](#responsive-design)
6. [Ejemplos de Uso](#ejemplos-de-uso)

---

## 🎨 Colores

### Variables CSS (`:root` en admin.css)

```css
/* Colores Principales */
--primary-color: #6366f1        /* Azul Indigo - CTAs, Enlaces */
--primary-dark: #4f46e5         /* Azul Oscuro - Hover primario */
--success-color: #10b981        /* Verde - Confirmaciones, Precios */
--warning-color: #f59e0b        /* Naranja - Alertas, Fechas */
--danger-color: #ef4444         /* Rojo - Eliminaciones, Errores */

/* Neutral */
--text-primary: #1f2937         /* Texto principal */
--text-secondary: #6b7280       /* Texto secundario */
--border-color: #e5e7eb         /* Bordes */
--background-light: #f9fafb     /* Fondo claro */

/* Radios */
--radius-sm: 8px                /* Pequeño */
--radius-md: 12px               /* Medio */
--radius-lg: 16px               /* Grande */

/* Sombras */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1)
```

### Paleta Visual

```
🔵 PRIMARIO: #6366f1 (Botones, Enlaces, Acentos)
🟢 ÉXITO: #10b981 (OK, Confirmaciones, Precios)
🟡 ADVERTENCIA: #f59e0b (Alertas, Fechas)
🔴 PELIGRO: #ef4444 (Errores, Eliminaciones)
⚪ NEUTRAL: Escala de grises para textos
```

---

## 📝 Tipografía

### Jerarquía de Tamaños

```
Títulos Grandes (h1):       1.75rem (28px) | font-weight: 700
Títulos Medianos (h2):      1.5rem (24px)  | font-weight: 600
Títulos Pequeños (h3):      1.25rem (20px) | font-weight: 600
Subtítulos:                 1.1rem (17px)  | font-weight: 500 | color: text-secondary
Cuerpo Normal:              1rem (16px)    | font-weight: 400
Cuerpo Pequeño:             0.95rem (15px) | font-weight: 400
Etiquetas/Labels:           0.9rem (14px)  | font-weight: 500
Ayuda/Helper Text:          0.85rem (13px) | font-weight: 400 | color: text-secondary
```

### Uso en EJS

```html
<!-- Título de Página -->
<h1 class="form-title">🎁 Gestión de Ofertas</h1>

<!-- Subtítulo -->
<p class="form-subtitle">Crea y administra ofertas de productos</p>

<!-- Título de Sección -->
<h3 class="section-title-form">📍 Ubicación y Datos</h3>

<!-- Etiqueta de Input -->
<label class="form-label-modern">Nombre de la Estación *</label>

<!-- Texto de Ayuda -->
<small class="form-help">Nombre identificador único</small>
```

---

## 🧩 Componentes

### 1. Botones

#### Botón Primario (Acción Principal)
```html
<button class="btn-primary-modern">
    <span class="btn-icon">✓</span>
    Guardar Cambios
</button>
```

**Estilos**:
- Background: `--primary-color`
- Hover: `--primary-dark` + transform translateY(-2px) + shadow
- Padding: 0.75rem 1.5rem
- Border Radius: `--radius-md`

#### Botón Secundario (Acción Alternativa)
```html
<a href="/cancelar" class="btn-secondary-modern">
    ← Cancelar
</a>
```

**Estilos**:
- Background: `--border-color`
- Hover: #e5e7eb más oscuro
- Padding: 0.75rem 1.5rem
- Border Radius: `--radius-md`

#### Botón de Acción Pequeño (Iconos)
```html
<a href="/detalles" class="btn-oferta-view" title="Ver detalles">👁️</a>
<button class="btn-oferta-delete">🗑️</button>
```

**Estilos**:
- Sin fondo, solo iconos
- Font-size: 1.25rem
- Hover: transform scale(1.2)

### 2. Inputs

#### Input Moderno (con Ícono)
```html
<div class="input-with-icon">
    <span class="input-icon">💰</span>
    <input type="number" class="form-control-modern with-icon" 
           placeholder="0.00" step="0.01" min="0">
</div>
```

**Estilos**:
- Padding-left: 3.5rem (espacio para ícono)
- Border: 2px solid `--border-color`
- Focus: border-color: `--primary-color` + shadow

#### Input Normal
```html
<input type="text" class="form-control-modern" placeholder="Nombre">
```

### 3. Badges

#### Badge de Precio (Verde)
```html
<span class="price-badge">$150.00</span>
```

#### Badge de Cantidad (Azul)
```html
<span class="quantity-badge">5 unid.</span>
```

#### Badge de Fecha (Naranja)
```html
<span class="date-badge">15/01/2024</span>
```

### 4. Cards/Tarjetas

#### Tarjeta de Producto
```html
<div class="search-result-card">
    <div class="result-card-header">
        <span class="result-card-icon">📦</span>
        <div class="result-card-title-group">
            <h4 class="result-card-title">Nombre del Producto</h4>
        </div>
    </div>
    <div class="result-card-body">
        <div class="result-detail-row">
            <span class="detail-label">Precio:</span>
            <span class="detail-value">$50.00</span>
        </div>
    </div>
    <div class="result-card-footer">
        <a href="#" class="btn-result-edit">✏️ Editar</a>
    </div>
</div>
```

### 5. Cajas de Información

#### Info Box (Azul)
```html
<div class="form-info-box">
    <span class="info-box-icon">💡</span>
    <p class="info-box-text">
        Este será el monto de efectivo con el que abrirá la estación.
    </p>
</div>
```

**Estilos**:
- Background: rgba(99, 102, 241, 0.05)
- Border-left: 4px solid `--primary-color`

### 6. Estados Vacíos

```html
<div class="empty-state-search show">
    <div class="empty-icon-large">📭</div>
    <h3>Sin resultados</h3>
    <p>Prueba con otras palabras clave</p>
</div>
```

---

## 📏 Espaciado

### Unidades Base
```
Mínimo:     0.5rem  (8px)
Pequeño:    1rem    (16px)
Medio:      1.5rem  (24px)
Grande:     2rem    (32px)
Extra:      2.5rem  (40px)
```

### Aplicación
```css
/* Gaps entre componentes */
gap: 1rem;              /* Espaciado normal */
gap: 1.5rem;            /* Espaciado generoso */
gap: 0.75rem;           /* Espaciado comprimido (móvil) */

/* Padding dentro de elementos */
padding: 1.5rem;        /* Padding normal */
padding: 1.25rem;       /* Padding comprimido */
padding-left: 3.5rem;   /* Espacio para ícono */

/* Margins */
margin-bottom: 1.5rem;  /* Espacio entre secciones */
margin: 0;              /* Reset */
```

---

## 📱 Responsive Design

### Breakpoints Estándar
```javascript
xs:  0px        // Móvil pequeño
sm:  576px      // Móvil normal
md:  768px      // Tablet
lg:  992px      // Desktop
xl:  1200px     // Desktop grande
xxl: 1920px     // Ultra-wide
```

### Media Query Pattern

```css
/* Mobile First - Estilos base para móvil */
.container {
    flex: 1;
    min-width: 150px;
}

/* Tablet y arriba */
@media (min-width: 768px) {
    .container {
        flex: 2;
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .container {
        flex: 3;
    }
}
```

### Grids Responsivos

#### Grid Automático (Búsqueda)
```css
.search-results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

@media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
}

@media (max-width: 480px) {
    grid-template-columns: 1fr;
}
```

#### Tablas Responsivas (Ofertas)
```css
/* Desktop: tabla normal */
.ofertas-table {
    display: table;
    width: 100%;
}

/* Móvil: grid cards */
@media (max-width: 768px) {
    .ofertas-table {
        display: grid;
        grid-template-columns: 1fr;
    }
    
    .oferta-row {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
        padding: 1.5rem;
        border: 1px solid var(--border-color);
    }
    
    .ofertas-table td::before {
        content: attr(data-label);
        font-weight: 600;
    }
}
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Crear un nuevo formulario

```html
<div class="form-container">
    <!-- Header -->
    <div class="form-header">
        <h1 class="form-title">📝 Nuevo Elemento</h1>
        <p class="form-subtitle">Completa los campos requeridos</p>
    </div>

    <!-- Formulario -->
    <form class="modern-form">
        <div class="form-grid">
            <!-- Sección 1 -->
            <div class="form-section">
                <h3 class="section-title-form">🏷️ Información General</h3>
                
                <div class="form-group-modern">
                    <label class="form-label-modern">Nombre *</label>
                    <div class="input-with-icon">
                        <span class="input-icon">✏️</span>
                        <input type="text" class="form-control-modern with-icon" required>
                    </div>
                </div>
            </div>
        </div>

        <!-- Acciones -->
        <div class="form-actions">
            <button type="button" class="btn-secondary-modern">Cancelar</button>
            <button type="submit" class="btn-primary-modern">Guardar</button>
        </div>
    </form>
</div>
```

### Ejemplo 2: Agregar tabla responsiva

```html
<div class="ofertas-section">
    <h2 class="ofertas-section-title">📊 Mi Lista</h2>
    
    <div class="ofertas-table-wrapper">
        <table class="ofertas-table">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Valor</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                <tr class="oferta-row">
                    <td data-label="Nombre:">Producto</td>
                    <td data-label="Valor:">
                        <span class="price-badge">$100</span>
                    </td>
                    <td data-label="Acciones:">
                        <a class="btn-oferta-view">👁️</a>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
```

### Ejemplo 3: Búsqueda con filtros

```html
<div class="search-form-modern">
    <div class="search-box-large">
        <span class="input-icon">🔍</span>
        <input type="text" class="search-input-large" placeholder="Buscar...">
    </div>

    <div class="search-filters-row">
        <div class="filter-group">
            <label class="filter-label">Ordenar por:</label>
            <select class="filter-select-modern">
                <option>Relevancia</option>
                <option>Nombre</option>
                <option>Precio</option>
            </select>
        </div>
        <button class="btn-clear-search">Limpiar</button>
    </div>

    <div class="search-results-grid">
        <!-- Resultados aquí -->
    </div>
</div>
```

---

## 🔧 Mantenimiento

### Agregar Nuevo Color
1. Definir variable en `:root` de admin.css
2. Usar la variable en componentes
3. Documentar en esta guía

### Crear Nuevo Componente
1. Seguir naming: `.component-name` o `.component-name-variant`
2. Incluir media queries para 768px, 480px
3. Usar variables CSS para colores, espaciado
4. Documentar con ejemplo HTML

### Actualizar Breakpoints
- Editar en esta guía
- Actualizar admin.css
- Testar en 320px, 480px, 768px, 1024px, 1920px

---

## ✅ Checklist para Nuevos Módulos

- [ ] Usar clases existentes (`.modern-form`, `.btn-primary-modern`, etc.)
- [ ] Agregar media queries para móvil
- [ ] Usar variables CSS para colores
- [ ] Incluir estados vacíos
- [ ] Testear en 5 breakpoints
- [ ] Documentar cambios
- [ ] Revisar accesibilidad (focus states, labels)

---

*Guía de Estilos - Estándares de Diseño Unificados*
