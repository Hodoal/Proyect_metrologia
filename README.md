# Sistema de Análisis Metrológico

Una aplicación web completa para análisis metrológico y ajuste de curvas con incertidumbres, desarrollada con React/Next.js frontend y Node.js/Express backend.

## 🚀 Características

### Frontend (React/Next.js)
- ✅ **Interfaz moderna y responsiva** con Tailwind CSS
- ✅ **Entrada de datos manual** y carga de archivos CSV/Excel
- ✅ **Visualización interactiva** con gráficas Recharts
- ✅ **Análisis en tiempo real** con validación de datos
- ✅ **Exportación** a PDF y Excel
- ✅ **Modo offline** para análisis básico
- ✅ **Política de privacidad** integrada

### Backend (Node.js/Express)
- ✅ **API REST completa** para análisis metrológico
- ✅ **Cálculos avanzados** de mínimos cuadrados ponderados
- ✅ **Linearización automática** (lineal, potencial, exponencial)
- ✅ **Procesamiento de archivos** CSV y Excel
- ✅ **Generación de reportes** PDF y Excel
- ✅ **Validación robusta** de datos de entrada
- ✅ **Seguridad** con helmet, CORS, rate limiting

### Análisis Metrológico
- ✅ **Ajuste por mínimos cuadrados ponderados**
- ✅ **Cálculo de incertidumbres** (Tipo A y propagación)
- ✅ **Linearización automática** según tipo de modelo
- ✅ **Estadísticas completas** (R², χ² reducido, residuos)
- ✅ **Análisis de residuos** para validación del modelo
- ✅ **Intervalos de confianza** para parámetros

## 📁 Estructura del Proyecto

```
App_analitic/
├── frontend/                 # Frontend React/Next.js
│   ├── src/
│   │   ├── app/             # Pages (App Router)
│   │   ├── components/      # Componentes modulares
│   │   ├── services/        # Servicios API
│   │   └── types/          # Definiciones TypeScript
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
├── backend/                 # Backend Node.js/Express
│   ├── src/
│   │   ├── routes/         # Rutas API
│   │   ├── services/       # Lógica de negocio
│   │   ├── middleware/     # Middleware Express
│   │   └── types/         # Tipos TypeScript
│   ├── package.json
│   └── tsconfig.json
└── README.md               # Esta documentación
```

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Git

### 1. Configuración del Backend

```bash
# Navegar al directorio backend
cd backend

# Instalar dependencias
npm install

# Compilar TypeScript
npm run build

# Ejecutar en desarrollo
npm run dev

# O ejecutar en producción
npm start
```

El backend estará disponible en `http://localhost:5000`

### 2. Configuración del Frontend

```bash
# Navegar al directorio frontend
cd frontend

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# O compilar para producción
npm run build
npm start
```

El frontend estará disponible en `http://localhost:3000`

## 🔧 Variables de Entorno

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📊 API Endpoints

### Health Check
- `GET /api/health` - Estado del servidor

### Análisis
- `POST /api/analysis` - Realizar análisis metrológico
- `POST /api/analysis/validate` - Validar datos
- `POST /api/analysis/statistics` - Estadísticas descriptivas

### Upload
- `POST /api/upload` - Subir archivo CSV/Excel

### Export
- `POST /api/export/pdf` - Generar reporte PDF
- `POST /api/export/excel` - Generar reporte Excel

## 📝 Uso de la Aplicación

### 1. Entrada de Datos
- **Manual**: Ingresar valores separados por comas
- **Archivo**: Subir CSV o Excel con columnas X, Y, u(X), u(Y)
- **Plantilla**: Descargar plantilla de ejemplo

### 2. Configuración del Análisis
- Seleccionar tipo de ajuste: lineal, potencial, exponencial
- Proporcionar incertidumbres (opcional)
- Validación automática de datos

### 3. Resultados
- **Parámetros**: Pendiente y ordenada con incertidumbres
- **Estadísticas**: R², χ² reducido, desviación estándar
- **Gráficas**: Datos originales, linearización, residuos
- **Interpretación**: Calidad del ajuste y recomendaciones

### 4. Exportación
- **PDF**: Reporte completo profesional
- **Excel**: Datos y resultados estructurados

## 🧮 Metodología Científica

### Linearización
- **Lineal**: y = mx + b
- **Potencial**: y = Ax^n → ln(y) = ln(A) + n·ln(x)
- **Exponencial**: y = Ae^(bx) → ln(y) = ln(A) + bx

### Mínimos Cuadrados Ponderados
- Pesos basados en incertidumbres: w = 1/σ²
- Minimización de χ² para mejor ajuste
- Cálculo riguroso de incertidumbres en parámetros

### Validación del Modelo
- Coeficiente de determinación R²
- Chi cuadrado reducido
- Análisis de residuos
- Intervalos de confianza

## 🔒 Seguridad y Privacidad

- **Datos locales**: Almacenamiento en navegador únicamente
- **Procesamiento temporal**: Cálculos sin almacenamiento permanente
- **HTTPS**: Comunicación segura
- **Validación robusta**: Protección contra datos maliciosos
- **Rate limiting**: Prevención de abuso

## 🚀 Deployment

### Desarrollo Local
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend  
cd frontend && npm run dev
```

### Producción
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

### Docker (Opcional)
```dockerfile
# Ejemplo Dockerfile para backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests (si se implementan)
cd frontend
npm test
```

## 📈 Roadmap Futuro

- [ ] Tests unitarios e integración
- [ ] Base de datos para histórico (opcional)
- [ ] Autenticación de usuarios
- [ ] Análisis estadísticos avanzados
- [ ] Más tipos de ajuste (polinomial, logarítmico)
- [ ] API GraphQL
- [ ] PWA (Progressive Web App)
- [ ] Integración con Jupyter Notebooks

## 👨‍💻 Desarrollo

### Tecnologías Utilizadas

**Frontend**:
- Next.js 14 (React 18)
- TypeScript
- Tailwind CSS
- Recharts (visualización)
- Lucide React (iconos)
- Axios (HTTP client)

**Backend**:
- Node.js + Express
- TypeScript
- Joi (validación)
- Multer (upload archivos)
- jsPDF (generación PDF)
- ExcelJS (generación Excel)
- Math.js (cálculos)

### Contribuir

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Crear Pull Request

## 📄 Licencia

MIT License - ver `LICENSE` para detalles.

## 👤 Autor

**J. Javier de la Ossa**  
*Físico - Web Development - Data Analytics*

- Sistema especializado en análisis metrológico
- Implementación de metodologías científicas rigurosas  
- Desarrollo de software para aplicaciones científicas

---

*Sistema de Análisis Metrológico - Herramienta profesional para análisis de datos experimentales con incertidumbres*