# Configuración de Docker para Isidorito

## Requisitos
- Docker Desktop instalado y ejecutándose
- Docker Compose (incluido en Docker Desktop)

## Comandos rápidos

### 1. Iniciar la aplicación
```bash
docker-compose up -d
```

### 2. Ver logs en tiempo real
```bash
docker-compose logs -f
```

### 3. Ver logs de MongoDB
```bash
docker-compose logs -f mongodb
```

### 4. Detener la aplicación
```bash
docker-compose down
```

### 5. Limpiar todo (volúmenes incluidos)
```bash
docker-compose down -v
```

### 6. Entrar a la consola de la app
```bash
docker exec -it isidorito-app sh
```

### 7. Ver estado de los contenedores
```bash
docker ps
```

## URLs de acceso

- **Aplicación**: http://localhost:3000
- **Mongo Express (Admin)**: http://localhost:8081
- **MongoDB**: mongodb://admin:admin123@localhost:27017

## Credenciales

### MongoDB Admin
- Usuario: `admin`
- Contraseña: `admin123`

### MongoDB App User
- Usuario: `isidorito_user`
- Contraseña: `isidorito_pass123`

## Estructura de carpetas

