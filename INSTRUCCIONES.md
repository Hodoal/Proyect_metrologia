# 🚀 Sistema de Análisis Metrológico - Guía Rápida

## ✅ Aplicación Lista para Usar

### 📍 URLs de Acceso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Documentación API**: http://localhost:5001/api/health

### 🎯 Servidores Actualmente Ejecutándose

✅ **Backend** corriendo en puerto **5001**
✅ **Frontend** corriendo en puerto **3000**

---

## 🖥️ Cómo Usar la Aplicación

### Abrir en el Navegador

Simplemente abre tu navegador y ve a:

```
http://localhost:3000
```

### Características de la Interfaz Moderna

✨ **Header Profesional**
- Logo animado
- Indicador de estado del servidor (Online/Offline)
- Contador de visitas
- Link de política de privacidad

📊 **Tabs de Navegación**
- **Entrada de Datos**: Introduce tus datos manualmente o carga archivos CSV/Excel
- **Resultados**: Visualiza el análisis estadístico completo
- **Gráficas**: Gráficos interactivos de tus datos y ajustes

🎨 **Footer Elegante**
- Información del autor
- Copyright y derechos reservados

---

## 🛠️ Comandos Útiles

### Si Necesitas Reiniciar los Servidores

#### Backend:
```bash
cd backend
npm run dev
```

#### Frontend:
```bash
cd frontend
npm run dev
```

### Si hay Problemas con los Puertos

#### Liberar puerto 5001 (Backend):
```bash
lsof -ti:5001 | xargs kill -9
```

#### Liberar puerto 3000 (Frontend):
```bash
lsof -ti:3000 | xargs kill -9
```

---

## 📋 Funcionalidades Disponibles

### 1️⃣ Entrada de Datos
- ✅ Entrada manual punto por punto
- ✅ Carga de archivos CSV
- ✅ Carga de archivos Excel
- ✅ Validación automática de datos

### 2️⃣ Análisis Metrológico
- ✅ Ajuste por mínimos cuadrados ponderados
- ✅ Cálculo de incertidumbres
- ✅ Linearización automática (lineal, potencial, exponencial)
- ✅ Estadísticas completas (R², χ² reducido)
- ✅ Análisis de residuos

### 3️⃣ Visualización
- ✅ Gráfico de datos originales con barras de error
- ✅ Línea de ajuste superpuesta
- ✅ Gráfico de residuos
- ✅ Zoom interactivo

### 4️⃣ Exportación
- ✅ Reporte PDF profesional
- ✅ Archivo Excel con todos los datos
- ✅ Descarga automática al navegador

---

## 🎨 Diseño Moderno

La aplicación ahora cuenta con:

- ✨ Diseño limpio y profesional
- 🎯 Interfaz intuitiva y fácil de usar
- 📱 Totalmente responsive (funciona en móviles, tablets y desktop)
- 🚀 Animaciones suaves y transiciones elegantes
- 🎨 Paleta de colores moderna (azul, índigo, gris)
- ⚡ Carga rápida y rendimiento optimizado

---

## 🔧 Solución de Problemas

### El frontend no se ve correctamente
```bash
cd frontend
rm -rf .next
npm run dev
```

### Error al conectar con el backend
1. Verifica que el backend esté corriendo en puerto 5001
2. Revisa el indicador de estado en el header
3. Si está "Offline", reinicia el backend

### Errores de compilación
```bash
# Reinstalar dependencias
cd frontend && npm install
cd ../backend && npm install
```

---

## 📞 Soporte

Si encuentras algún problema, revisa:
1. Los logs en la terminal del backend
2. Los logs en la terminal del frontend
3. La consola del navegador (F12)

---

## 👨‍💻 Desarrollado por

**J. Javier de la Ossa**
- Físico
- Web Development
- Data Analytics

© 2025 - Sistema de Análisis Metrológico Avanzado

---

**🎉 ¡Disfruta usando la aplicación!**
