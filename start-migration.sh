#!/bin/bash

# Script de inicio rápido para la migración de Firebase a FastAPI + Railway + Vercel

echo "🚀 Iniciando migración de Miamente Platform..."
echo "================================================"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Ejecuta este script desde la raíz del proyecto"
    exit 1
fi

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar dependencias
echo "🔍 Verificando dependencias..."

if ! command_exists python3; then
    echo "❌ Python 3 no está instalado"
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm no está instalado"
    exit 1
fi

echo "✅ Dependencias verificadas"

# Configurar backend
echo ""
echo "🔧 Configurando backend (FastAPI)..."
echo "====================================="

cd backend

# Crear entorno virtual si no existe
if [ ! -d "venv" ]; then
    echo "📦 Creando entorno virtual..."
    python3 -m venv venv
fi

# Activar entorno virtual
echo "🔌 Activando entorno virtual..."
source venv/bin/activate

# Instalar dependencias
echo "📥 Instalando dependencias de Python..."
pip install -r requirements.txt

# Crear archivo .env si no existe
if [ ! -f ".env" ]; then
    echo "⚙️  Creando archivo de configuración..."
    echo "📝 Por favor, crea backend/.env con tus configuraciones"
    echo "   Consulta SETUP_INSTRUCTIONS.md para más detalles"
fi

echo "✅ Backend configurado"

# Configurar frontend
echo ""
echo "🔧 Configurando frontend (Next.js)..."
echo "======================================"

cd ../apps/web

# Instalar dependencias
echo "📥 Instalando dependencias de Node.js..."
npm install

# Crear archivo .env.local si no existe
if [ ! -f ".env.local" ]; then
    echo "⚙️  Creando archivo de configuración..."
    echo "📝 Por favor, crea apps/web/.env.local con tu URL de API"
    echo "   Consulta SETUP_INSTRUCTIONS.md para más detalles"
fi

echo "✅ Frontend configurado"

# Volver al directorio raíz
cd ../..

echo ""
echo "🎉 ¡Configuración completada!"
echo "============================="
echo ""
echo "📋 Próximos pasos:"
echo "1. Configura tu base de datos PostgreSQL"
echo "2. Edita backend/.env con tus configuraciones"
echo "3. Edita apps/web/.env.local con tu URL de API"
echo "4. Ejecuta las migraciones de base de datos:"
echo "   cd backend && alembic upgrade head"
echo "5. Inicia el backend:"
echo "   cd backend && uvicorn app.main:app --reload"
echo "6. Inicia el frontend:"
echo "   cd apps/web && npm run dev"
echo ""
echo "📚 Para más información, consulta SETUP_INSTRUCTIONS.md"
echo ""
echo "🌐 URLs de desarrollo:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
