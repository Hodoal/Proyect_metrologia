# 📖 Guía del Usuario - Sistema de Análisis Cinemático

## 🚀 Acceso al Sistema

**Frontend:** http://localhost:3000  
**Backend API:** http://localhost:5001/api

---

## 🎯 Cómo Usar el Sistema

### 1️⃣ **Configuración del Análisis**

En la sección **"Configuración de Análisis Cinemático"** encontrarás tres selectores:

#### **A) Tipo de Movimiento**
- **MRU (Movimiento Rectilíneo Uniforme)**: Velocidad constante
- **MRUA (Movimiento Rectilíneo Uniformemente Acelerado)**: Aceleración constante

#### **B) Variable Cinemática**
- **x-t (Posición vs Tiempo)**: Para analizar trayectoria
- **v-t (Velocidad vs Tiempo)**: Para analizar cambios de velocidad
- **a-t (Aceleración vs Tiempo)**: Para verificar aceleración constante

#### **C) Tipo de Ajuste**
- **Lineal**: Para relaciones y = mx + b
- **Potencial**: Para relaciones y = Ax^n
- **Exponencial**: Para relaciones y = Ae^(bx)

---

## 📊 Casos de Uso Específicos

### ✅ **Para Análisis MRU (Velocidad Constante)**

#### **Caso 1: Posición vs Tiempo (x-t)**
```
✓ Tipo de Movimiento: MRU
✓ Variable Cinemática: x-t (Posición vs Tiempo)
✓ Tipo de Ajuste: Lineal
✓ Resultado: Velocidad constante = pendiente (m)
```

**Datos de ejemplo:**
```
Tiempo (s): 0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0
Posición (m): 0.5, 2.3, 4.1, 6.2, 8.0, 10.1, 12.3, 14.2, 16.1, 18.0, 20.2
```

**Interpretación:**
- **Pendiente (m)**: Velocidad constante (v) en m/s
- **Ordenada (b)**: Posición inicial (x₀) en m
- **Ecuación física**: x = v·t + x₀

---

#### **Caso 2: Velocidad vs Tiempo (v-t)**
```
✓ Tipo de Movimiento: MRU
✓ Variable Cinemática: v-t (Velocidad vs Tiempo)
✓ Tipo de Ajuste: Lineal
✓ Resultado: Pendiente ≈ 0 (velocidad constante ideal)
```

**Datos de ejemplo:**
```
Tiempo (s): 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
Velocidad (m/s): 2.1, 2.0, 2.2, 1.9, 2.1, 2.0, 2.1, 2.0, 2.1, 2.0, 2.1
```

**Interpretación:**
- **Pendiente (m)**: Debe ser ≈ 0 (cambio de velocidad nulo)
- **Ordenada (b)**: Velocidad constante promedio
- Si m ≠ 0 significativamente, **NO es MRU**

---

### 🚀 **Para Análisis MRUA (Aceleración Constante)**

#### **Caso 3: Velocidad vs Tiempo (v-t)**
```
✓ Tipo de Movimiento: MRUA
✓ Variable Cinemática: v-t (Velocidad vs Tiempo)
✓ Tipo de Ajuste: Lineal
✓ Resultado: Aceleración constante = pendiente (m)
```

**Datos de ejemplo:**
```
Tiempo (s): 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
Velocidad (m/s): 0.5, 2.8, 5.1, 7.3, 9.6, 11.9, 14.2, 16.4, 18.7, 21.0, 23.3
```

**Interpretación:**
- **Pendiente (m)**: Aceleración constante (a) en m/s²
- **Ordenada (b)**: Velocidad inicial (v₀) en m/s
- **Ecuación física**: v = a·t + v₀

---

#### **Caso 4: Posición vs Tiempo (x-t) - Método 1 (Lineal, NO recomendado)**
```
⚠️ Tipo de Movimiento: MRUA
⚠️ Variable Cinemática: x-t (Posición vs Tiempo)
⚠️ Tipo de Ajuste: Lineal
⚠️ Problema: x vs t es una parábola, NO una línea recta
```

**Recomendación del sistema:**
> ⚠️ **Considera usar x vs t²:** Para MRUA, graficar x vs t² da una relación lineal

---

#### **Caso 5: Posición vs Tiempo (x-t) - Método 2 (Potencial, RECOMENDADO)**
```
✓ Tipo de Movimiento: MRUA
✓ Variable Cinemática: x-t (Posición vs Tiempo)
✓ Tipo de Ajuste: Potencial
✓ Resultado: Exponente n ≈ 2 confirma MRUA
```

**Datos de ejemplo:**
```
Tiempo (s): 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
Posición (m): 0.0, 1.2, 4.9, 11.0, 19.6, 30.5, 43.8, 59.5, 77.6, 98.1, 121.0
```

**Interpretación:**
- **Exponente (n)**: Debe ser ≈ 2 para confirmar MRUA
- **Coeficiente (A)**: Relacionado con a/2
- **Ecuación física**: x ≈ (a/2)·t² (si v₀ = 0 y x₀ = 0)

---

#### **Caso 6: Aceleración vs Tiempo (a-t)**
```
✓ Tipo de Movimiento: MRUA
✓ Variable Cinemática: a-t (Aceleración vs Tiempo)
✓ Tipo de Ajuste: Lineal
✓ Resultado: Pendiente ≈ 0 (aceleración constante ideal)
```

**Interpretación:**
- **Pendiente (m)**: Debe ser ≈ 0 (aceleración no cambia)
- **Ordenada (b)**: Aceleración constante
- Si m ≠ 0 significativamente, **NO es MRUA**

---

## 🎨 Sugerencias Automáticas de Linealización

El sistema proporciona **sugerencias inteligentes** según tu configuración:

| Movimiento | Variable | Ajuste Sugerido | Interpretación |
|------------|----------|-----------------|----------------|
| MRU | x-t | Lineal | v = pendiente |
| MRU | v-t | Lineal | m ≈ 0 |
| MRUA | v-t | Lineal | a = pendiente |
| MRUA | x-t | Potencial (n=2) | a relacionada con A |
| MRUA | a-t | Lineal | m ≈ 0 |

---

## 📈 Resultados del Análisis

### **Interpretación Física**
El sistema genera automáticamente una interpretación física basada en:
- Tipo de movimiento seleccionado
- Variable cinemática analizada
- Valores de pendiente y ordenada
- Unidades físicas correctas

**Ejemplo para MRU (x-t):**
```
🎯 Interpretación Física (Cinemática)

Análisis de Movimiento Rectilíneo Uniforme (MRU)
Relación analizada: Posición vs Tiempo (x-t)

Parámetros físicos obtenidos:
• Velocidad constante: v = 2.0 ± 0.05 m/s
• Posición inicial: x₀ = 0.5 ± 0.2 m

Ecuación del movimiento:
x(t) = (2.0 ± 0.05)·t + (0.5 ± 0.2)

Interpretación:
El objeto se desplaza con velocidad constante de 2.0 m/s.
Partió desde la posición x₀ = 0.5 m en el instante t = 0.
```

---

### **Test de Normalidad (Jarque-Bera)**
Verifica si los residuos siguen una distribución normal:

- **✅ JB < 5.991**: Residuos normales → Buen modelo
- **⚠️ JB > 5.991**: Residuos no normales → Revisar modelo o datos

**Incluye:**
- Estadístico JB
- Valor crítico (α = 0.05)
- Asimetría (skewness)
- Curtosis (kurtosis)
- Interpretación automática

---

### **Gráficos Generados**

1. **Datos Originales con Ajuste**: Puntos experimentales y curva de ajuste
2. **Análisis de Residuos**: Distribución de errores
3. **Distribución de Residuos**: Histograma + curva normal + resultado JB

---

## 📥 Exportación de Resultados

### **Reporte PDF**
Incluye:
- ✅ Marco teórico (MRU o MRUA)
- ✅ Ecuaciones del modelo
- ✅ Tabla de datos experimentales
- ✅ Parámetros del ajuste con IC al 95%
- ✅ **3 gráficos embebidos** (datos, residuos, distribución)
- ✅ Interpretación física completa
- ✅ Test de normalidad Jarque-Bera
- ✅ Análisis estadístico detallado

### **Hoja de Cálculo Excel**
Incluye:
- Datos originales
- Datos linealizados (si aplica)
- Residuos
- Parámetros estadísticos
- Intervalos de confianza

---

## 🔍 Validación de Resultados

### **Indicadores de Calidad**

| R² | Calidad | Acción |
|----|---------|--------|
| > 0.99 | Excelente | ✅ Continuar |
| 0.95-0.99 | Muy Buena | ✅ Continuar |
| 0.90-0.95 | Buena | ⚠️ Revisar datos atípicos |
| 0.80-0.90 | Aceptable | ⚠️ Considerar otro modelo |
| < 0.80 | Pobre | ❌ Cambiar modelo o revisar datos |

### **Chi-cuadrado Reducido (χ²ᵣ)**
- **χ²ᵣ ≈ 1**: Ajuste óptimo
- **χ²ᵣ < 1**: Posible sobreestimación de incertidumbres
- **χ²ᵣ > 1.5**: Modelo inadecuado o incertidumbres subestimadas

---

## 🛠️ Solución de Problemas

### **Problema: "El ajuste no es bueno (R² bajo)"**
**Soluciones:**
1. Verifica que seleccionaste el tipo de movimiento correcto
2. Confirma la variable cinemática apropiada
3. Para MRUA con x-t, usa ajuste potencial en lugar de lineal
4. Revisa si hay datos atípicos (outliers)

### **Problema: "Test JB indica no normalidad"**
**Causas posibles:**
1. Modelo incorrecto para el tipo de movimiento
2. Errores sistemáticos en las mediciones
3. Datos atípicos afectando la distribución

**Soluciones:**
1. Revisa la configuración del tipo de movimiento
2. Elimina datos claramente erróneos
3. Verifica el instrumento de medición

### **Problema: "Pendiente muy diferente de lo esperado"**
**Para MRU x-t:**
- Revisa las unidades de tus datos
- Confirma que el movimiento realmente es uniforme

**Para MRUA v-t:**
- Confirma que la aceleración es constante
- Verifica las unidades (m/s²)

---

## 📚 Referencias Rápidas

### **Ecuaciones Fundamentales**

**MRU:**
```
x(t) = v·t + x₀
v = constante
```

**MRUA:**
```
x(t) = x₀ + v₀·t + ½·a·t²
v(t) = v₀ + a·t
a = constante
```

### **Linealización MRUA (x-t)**
Para convertir x = ½at² + v₀t + x₀ en forma lineal:

**Opción 1:** Si v₀ = 0 y x₀ = 0
```
x vs t² → x = (a/2)·(t²)
Graficar: x vs t²
Pendiente: a/2
```

**Opción 2:** Usar ajuste potencial
```
x ∝ t^n donde n ≈ 2
```

---

## 📞 Soporte

Para más información, consulta:
- `ANALISIS_CINEMATICO_MRU_MRUA.md`: Teoría completa
- `ESTADISTICAS_AVANZADAS.md`: Métodos estadísticos
- `API_DOCUMENTATION.md`: Documentación técnica de la API

---

**¡Listo para analizar! 🚀**

Ingresa tus datos, selecciona la configuración apropiada y haz clic en **"Realizar Análisis Metrológico"**.
