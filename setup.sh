# Development Setup Scripts

#!/bin/bash

echo "🚀 Setting up Metrologia Analysis System..."

# Check Node.js version
node_version=$(node -v 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $node_version"

# Setup Backend
echo "📦 Setting up Backend..."
cd backend
if [ ! -f "package.json" ]; then
    echo "❌ Backend package.json not found!"
    exit 1
fi

echo "Installing backend dependencies..."
npm install

echo "Building backend..."
npm run build

echo "✅ Backend setup complete!"

# Setup Frontend
echo "📦 Setting up Frontend..."
cd ../frontend
if [ ! -f "package.json" ]; then
    echo "❌ Frontend package.json not found!"
    exit 1
fi

echo "Installing frontend dependencies..."
npm install

echo "✅ Frontend setup complete!"

# Create environment files
echo "🔧 Creating environment files..."

# Backend .env
cat > ../backend/.env << EOF
# Backend Configuration
PORT=5000
NODE_ENV=development

# Security
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
EOF

# Frontend .env.local
cat > .env.local << EOF
# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# App Configuration
NEXT_PUBLIC_APP_NAME=Sistema de Análisis Metrológico
NEXT_PUBLIC_APP_VERSION=1.0.0
EOF

echo "✅ Environment files created!"

echo ""
echo "🎉 Setup complete! To start the application:"
echo ""
echo "Backend (Terminal 1):"
echo "  cd backend"
echo "  npm run dev"
echo ""
echo "Frontend (Terminal 2):"
echo "  cd frontend" 
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""