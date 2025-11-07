@echo off
echo 🚀 Setting up Metrologia Analysis System...

REM Check Node.js version
node -v >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js is installed

REM Setup Backend
echo 📦 Setting up Backend...
cd backend
if not exist "package.json" (
    echo ❌ Backend package.json not found!
    pause
    exit /b 1
)

echo Installing backend dependencies...
npm install

echo Building backend...
npm run build

echo ✅ Backend setup complete!

REM Setup Frontend
echo 📦 Setting up Frontend...
cd ..\frontend
if not exist "package.json" (
    echo ❌ Frontend package.json not found!
    pause
    exit /b 1
)

echo Installing frontend dependencies...
npm install

echo ✅ Frontend setup complete!

REM Create environment files
echo 🔧 Creating environment files...

REM Backend .env
echo # Backend Configuration > ..\backend\.env
echo PORT=5000 >> ..\backend\.env
echo NODE_ENV=development >> ..\backend\.env
echo. >> ..\backend\.env
echo # Security >> ..\backend\.env
echo CORS_ORIGIN=http://localhost:3000 >> ..\backend\.env
echo. >> ..\backend\.env
echo # Rate Limiting >> ..\backend\.env
echo RATE_LIMIT_WINDOW_MS=900000 >> ..\backend\.env
echo RATE_LIMIT_MAX=100 >> ..\backend\.env

REM Frontend .env.local
echo # Frontend Configuration > .env.local
echo NEXT_PUBLIC_API_URL=http://localhost:5000/api >> .env.local
echo. >> .env.local
echo # App Configuration >> .env.local
echo NEXT_PUBLIC_APP_NAME=Sistema de Análisis Metrológico >> .env.local
echo NEXT_PUBLIC_APP_VERSION=1.0.0 >> .env.local

echo ✅ Environment files created!

echo.
echo 🎉 Setup complete! To start the application:
echo.
echo Backend (Terminal 1):
echo   cd backend
echo   npm run dev
echo.
echo Frontend (Terminal 2):
echo   cd frontend
echo   npm run dev
echo.
echo Then open http://localhost:3000 in your browser
echo.
pause