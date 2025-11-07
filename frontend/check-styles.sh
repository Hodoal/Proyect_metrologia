#!/bin/bash

echo "🔍 Verificando configuración de Tailwind CSS..."
echo ""

# Verificar PostCSS
echo "✅ PostCSS Config:"
if [ -f "postcss.config.js" ]; then
    echo "   ✓ postcss.config.js existe"
    cat postcss.config.js
else
    echo "   ✗ postcss.config.js NO existe"
fi

echo ""

# Verificar Tailwind Config
echo "✅ Tailwind Config:"
if [ -f "tailwind.config.js" ]; then
    echo "   ✓ tailwind.config.js existe"
else
    echo "   ✗ tailwind.config.js NO existe"
fi

echo ""

# Verificar globals.css
echo "✅ Globals CSS:"
if [ -f "src/app/globals.css" ]; then
    echo "   ✓ src/app/globals.css existe"
    echo "   Primeras líneas:"
    head -n 5 src/app/globals.css
else
    echo "   ✗ src/app/globals.css NO existe"
fi

echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Test de Estilos: http://localhost:3000/test-styles"
echo "   Backend: http://localhost:5001"
echo ""
echo "💡 Instrucciones:"
echo "   1. Abre http://localhost:3000/test-styles en tu navegador"
echo "   2. Si ves una página con colores bonitos = ✅ Tailwind funciona"
echo "   3. Si ves texto plano sin estilos = ❌ Presiona Cmd+Shift+R para limpiar cache"
echo ""
