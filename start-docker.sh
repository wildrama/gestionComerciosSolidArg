#!/bin/bash

echo "🚀 Iniciando Isidorito en Docker..."
echo ""

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado"
    exit 1
fi

echo "✅ Docker y Docker Compose detectados"
echo ""

# Detener contenedores anteriores
echo "🛑 Deteniendo contenedores anteriores..."
docker-compose down 2>/dev/null

echo ""
echo "🔨 Construyendo imagen..."
docker-compose build

echo ""
echo "▶️  Iniciando servicios..."
docker-compose up -d

echo ""
echo "⏳ Esperando a que los servicios estén listos..."
sleep 5

echo ""
echo "✅ ¡Servicios iniciados correctamente!"
echo ""
echo "📍 URLs de acceso:"
echo "   - Aplicación: http://localhost:3000"
echo "   - Mongo Express: http://localhost:8081"
echo ""
echo "🗄️  Base de datos: mongodb://admin:admin123@localhost:27017"
echo ""
echo "📝 Para ver los logs:"
echo "   docker-compose logs -f"
echo ""
