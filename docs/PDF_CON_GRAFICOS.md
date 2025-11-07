# 📊 Generación de PDFs con Gráficos Integrados

## ✨ Nueva Funcionalidad

El sistema ahora genera reportes PDF que incluyen **gráficos profesionales** además de los datos y estadísticas.

---

## 🎨 Gráficos Incluidos en el PDF

### 1️⃣ Gráfico de Datos Experimentales y Ajuste
- **Puntos azules**: Datos experimentales originales
- **Línea roja**: Ajuste lineal calculado
- Muestra la calidad del ajuste visualmente

### 2️⃣ Gráfico de Análisis de Residuos
- **Puntos morados**: Residuos de cada punto de datos
- **Línea punteada**: Línea de referencia en cero
- Permite identificar patrones o desviaciones sistemáticas

---

## 📄 Estructura del Reporte PDF

### Página 1: Información General
- Header con título y fecha
- Configuración del análisis
- Parámetros del ajuste (pendiente, ordenada)
- Estadísticas (R², χ² reducido, σ residuos)
- Interpretación de la calidad del ajuste

### Página 2: Gráficos
- **Gráfico 1**: Datos originales con línea de ajuste
- **Gráfico 2**: Análisis de residuos

### Páginas 3+: Tabla de Datos
- Tabla completa con todos los puntos
- Columnas: #, X, Y, u(X), u(Y), Y ajustado, Residuo
- Formato profesional con colores alternados

### Última Página: Footer
- Numeración de páginas
- Información del autor
- Timestamp de generación

---

## 🔧 Tecnologías Utilizadas

### Backend
- **jsPDF**: Generación de documentos PDF
- **chartjs-node-canvas**: Renderizado de gráficos del lado del servidor
- **Chart.js**: Motor de gráficos profesional

### Características de los Gráficos
- ✅ Alta resolución (800x400 px)
- ✅ Fondo blanco para impresión
- ✅ Ejes etiquetados correctamente
- ✅ Leyendas descriptivas
- ✅ Grilla para facilitar lectura
- ✅ Colores profesionales y distinguibles

---

## 📥 Cómo Usar

1. **Realizar un análisis** en la aplicación
2. Ir a la pestaña **"Resultados"**
3. Hacer clic en el botón **"Exportar PDF"**
4. El PDF se descargará automáticamente con todos los gráficos incluidos

---

## 🎯 Ventajas

✅ **Todo en un solo archivo**: No necesitas generar gráficos por separado
✅ **Listo para compartir**: El PDF es completamente autónomo
✅ **Calidad profesional**: Ideal para reportes académicos o profesionales
✅ **Imprimible**: Los gráficos se ven perfectos en papel
✅ **Reproducible**: Toda la información está documentada

---

## 🔍 Detalles Técnicos

### Configuración de Gráficos

**Gráfico de Datos Originales:**
- Tipo: Scatter + Line
- Colores: Azul (datos), Rojo (ajuste)
- Títulos: Automáticos según tipo de linearización
- Escalas: Lineales con grilla

**Gráfico de Residuos:**
- Tipo: Scatter + Line
- Color: Morado (residuos)
- Línea de referencia en Y=0
- Permite detectar desviaciones sistemáticas

### Tamaño de Imágenes en PDF
- Ancho: 170mm
- Alto: 85mm
- Resolución: 800x400 píxeles
- Formato: PNG con fondo blanco

---

## 🐛 Solución de Problemas

### El PDF no se genera
1. Verificar que el backend esté corriendo en puerto 5001
2. Revisar la consola del backend para errores
3. Asegurar que todos los datos estén completos

### Los gráficos se ven mal
- Los gráficos se generan automáticamente en alta calidad
- Si hay problemas, reiniciar el backend

### Demora en generar el PDF
- Es normal, la generación de gráficos toma unos segundos
- Se muestra un indicador de carga durante el proceso

---

## 📚 Ejemplo de Uso

```javascript
// El frontend envía los resultados al endpoint
POST /api/export/pdf
{
  "results": { /* AnalysisResult object */ }
}

// El backend:
// 1. Genera el gráfico de datos originales
// 2. Genera el gráfico de residuos
// 3. Crea el PDF con todos los elementos
// 4. Retorna el archivo PDF

// El PDF incluye automáticamente:
// - Header profesional
// - Estadísticas completas
// - Ambos gráficos en página separada
// - Tabla de datos detallada
// - Footer con información
```

---

## ✨ Resultado Final

El PDF generado es un documento profesional completo que incluye:
- 📊 Análisis estadístico detallado
- 📈 Visualizaciones gráficas profesionales
- 📋 Tabla de datos completa
- 🎨 Diseño limpio y profesional
- 📄 Listo para presentaciones o publicaciones

---

**¡Los reportes PDF ahora son completamente profesionales e incluyen todos los elementos visuales necesarios!** 🎉
