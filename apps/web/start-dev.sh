#!/bin/bash

# Script para iniciar el frontend con Node.js 22
echo "🚀 Iniciando frontend con Node.js 22..."

# Verificar que nvm esté disponible
if ! command -v nvm &> /dev/null; then
    echo "❌ nvm no está disponible. Por favor instala nvm primero."
    exit 1
fi

# Cambiar a Node.js 22
echo "📦 Cambiando a Node.js 22..."
nvm use v22

# Verificar la versión
echo "✅ Versión de Node.js: $(node --version)"
echo "✅ Versión de npm: $(npm --version)"

# Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
    echo "📥 Instalando dependencias..."
    npm install
fi

# Iniciar el servidor de desarrollo
echo "🌐 Iniciando servidor de desarrollo..."
npm run dev
