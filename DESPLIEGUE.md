# 🚀 Guía de Despliegue - Proyecto Metrología

## 📋 Opciones de Despliegue

### Opción 1: Vercel (Frontend) + Render (Backend) - RECOMENDADO

#### Backend en Render

1. **Crear cuenta en Render**
   - Ve a [render.com](https://render.com) y crea una cuenta
   - Conecta tu cuenta de GitHub

2. **Crear nuevo Web Service**
   - Click en "New +" → "Web Service"
   - Conecta el repositorio `Hodoal/Proyect_metrologia`
   - Configuración:
     - **Name**: `metrologia-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Plan**: Free

3. **Variables de entorno**
   ```
   NODE_ENV=production
   PORT=5001
   ```

4. **Esperar el despliegue**
   - Render te dará una URL como: `https://metrologia-backend.onrender.com`
   - **Guarda esta URL**, la necesitarás para el frontend

#### Frontend en Vercel

1. **Crear cuenta en Vercel**
   - Ve a [vercel.com](https://vercel.com) y crea una cuenta
   - Conecta tu cuenta de GitHub

2. **Importar proyecto**
   - Click en "Add New..." → "Project"
   - Selecciona `Hodoal/Proyect_metrologia`
   - Configuración:
     - **Framework Preset**: Next.js
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `.next`

3. **Variables de entorno**
   ```
   NEXT_PUBLIC_API_URL=https://metrologia-backend.onrender.com/api
   ```
   ⚠️ **Importante**: Reemplaza con la URL real de tu backend en Render

4. **Deploy**
   - Click en "Deploy"
   - Tu aplicación estará disponible en: `https://tu-proyecto.vercel.app`

---

### Opción 2: Railway (Backend + Frontend)

1. **Crear cuenta en Railway**
   - Ve a [railway.app](https://railway.app)
   - Conecta tu cuenta de GitHub

2. **Nuevo proyecto**
   - Click en "New Project" → "Deploy from GitHub repo"
   - Selecciona `Hodoal/Proyect_metrologia`

3. **Configurar Backend**
   - Click en el servicio → Settings
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`
   - **Build Command**: `npm install && npm run build`
   - Variables de entorno:
     ```
     NODE_ENV=production
     ```

4. **Configurar Frontend**
   - Agregar nuevo servicio desde el mismo repo
   - **Root Directory**: `frontend`
   - **Start Command**: `npm start`
   - **Build Command**: `npm run build`
   - Variables de entorno:
     ```
     NEXT_PUBLIC_API_URL=${{BACKEND_URL}}/api
     ```

---

### Opción 3: Despliegue Local con Docker

1. **Construir y ejecutar con Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Acceder a la aplicación**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5001

---

## 🔧 Configuración Post-Despliegue

### Actualizar CORS en el Backend

Edita `backend/src/index.ts`:

```typescript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tu-frontend.vercel.app'] // Tu URL de Vercel
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### Verificar el Despliegue

1. **Backend**: Prueba el endpoint de salud
   ```bash
   curl https://tu-backend.onrender.com/api/health
   ```
   Debe responder: `{"status":"ok","timestamp":"..."}`

2. **Frontend**: Abre la URL de Vercel en tu navegador

---

## 📝 Comandos Git para Actualizar

```bash
# Hacer cambios en el código
git add .
git commit -m "Descripción de los cambios"
git push origin main
```

Vercel y Render detectarán automáticamente los cambios y redesplegarán.

---

## ⚠️ Troubleshooting

### Error: Backend no responde
- Verifica que las variables de entorno estén configuradas
- Revisa los logs en Render/Railway
- Asegúrate de que el puerto sea correcto

### Error: CORS
- Actualiza la configuración de CORS con la URL correcta del frontend
- Redespliega el backend

### Error: Frontend no puede conectarse al backend
- Verifica que `NEXT_PUBLIC_API_URL` esté configurada correctamente
- Asegúrate de incluir `/api` al final de la URL
- Redespliega el frontend

---

## 📊 URLs del Proyecto

- **Repositorio**: https://github.com/Hodoal/Proyect_metrologia
- **Frontend**: (Se generará al desplegar en Vercel)
- **Backend**: (Se generará al desplegar en Render)

---

## 🎯 Checklist de Despliegue

- [ ] Cuenta creada en Render
- [ ] Backend desplegado en Render
- [ ] URL del backend guardada
- [ ] Cuenta creada en Vercel
- [ ] Variable `NEXT_PUBLIC_API_URL` configurada
- [ ] Frontend desplegado en Vercel
- [ ] CORS actualizado en el backend con URL del frontend
- [ ] Prueba realizada: análisis completo funciona correctamente
- [ ] Exportación PDF funciona
- [ ] Exportación Excel funciona

¡Listo! Tu aplicación está desplegada 🎉
