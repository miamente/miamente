#!/bin/bash

echo "🚀 Migrando Miamente Platform a Railway..."

# 1. Instalar Railway CLI si no está instalado
if ! command -v railway &> /dev/null; then
    echo "📦 Instalando Railway CLI..."
    npm install -g @railway/cli
fi

# 2. Verificar estructura
echo "✅ Verificando estructura de archivos..."
if [ ! -d "apps/api" ]; then
    echo "❌ apps/api no existe. ¿Ya ejecutaste la migración?"
    exit 1
fi

if [ ! -f "railway.json" ]; then
    echo "❌ railway.json no existe. ¿Ejecutaste la configuración completa?"
    exit 1
fi

# 3. Login a Railway
echo "🔐 Iniciando sesión en Railway..."
railway login

# 4. Crear proyecto
echo "🆕 Creando proyecto en Railway..."
railway init

# 5. Conectar repositorio
echo "🔗 Conectando repositorio GitHub..."
railway connect

# 6. Crear ambientes
echo "🌍 Creando ambientes..."
railway environment create staging
railway environment create production

# 7. Configurar variables de entorno para staging
echo "⚙️ Configurando ambiente staging..."
railway environment set staging

echo "📝 Configurando variables de entorno básicas..."
railway variables set JWT_SECRET="$(openssl rand -base64 32)"
railway variables set CORS_ORIGINS="*"
railway variables set ENVIRONMENT="staging"
railway variables set LOG_LEVEL="INFO"

# 8. Configurar production
echo "⚙️ Configurando ambiente production..."
railway environment set production

railway variables set JWT_SECRET="$(openssl rand -base64 32)"
railway variables set ENVIRONMENT="production"
railway variables set LOG_LEVEL="INFO"

# 9. Deploy inicial
echo "🚀 Realizando deploy inicial a staging..."
railway environment set staging
railway up --detach

echo "✅ ¡Migración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configurar CORS_ORIGINS con tus dominios reales"
echo "2. Agregar RAILWAY_TOKEN a GitHub Secrets"
echo "3. Agregar STAGING_URL y PRODUCTION_URL a GitHub Secrets"
echo "4. Hacer push a staging para probar el deploy a staging"
echo "5. Hacer push a main para probar el deploy a production"
echo ""
echo "📚 Lee RAILWAY_SETUP.md para más detalles"
