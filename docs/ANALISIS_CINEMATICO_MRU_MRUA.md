# 🎯 Sistema de Análisis Cinemático - MRU y MRUA

## 📚 Transformación Completa del Sistema

El sistema ahora está especializado en **análisis cinemático** con soporte completo para:
- ✅ Movimiento Rectilíneo Uniforme (MRU)
- ✅ Movimiento Rectilíneo Uniformemente Acelerado (MRUA)
- ✅ Test de normalidad mejorado con interpretación
- ✅ Interpretación física automática
- ✅ Técnicas de linealización para MRUA

---

## 🚀 Nuevas Características Implementadas

### 1️⃣ **Test de Normalidad Jarque-Bera**

#### ¿Qué es?
El test de Jarque-Bera evalúa si los residuos siguen una distribución normal mediante el análisis de:
- **Skewness (Asimetría)**: Mide la simetría de la distribución
- **Kurtosis (Curtosis)**: Mide el peso de las colas

#### Fórmula:
```
JB = (n/6) × [S² + (K²/4)]

Donde:
- n = número de observaciones
- S = skewness (asimetría)
- K = kurtosis excess (curtosis - 3)
```

#### Criterio:
- **JB < 5.991** (valor crítico χ² con 2 gl al 95%): Distribución NORMAL ✓
- **JB > 5.991**: Distribución NO NORMAL ✗

#### Interpretación Automática:

**Skewness:**
- |S| < 0.5: Distribución simétrica
- S > 0.5: Asimetría positiva (cola derecha más larga)
- S < -0.5: Asimetría negativa (cola izquierda más larga)

**Kurtosis:**
- |K| < 1: Distribución mesocúrtica (similar a normal)
- K > 1: Leptocúrtica (colas pesadas, pico alto)
- K < -1: Platicúrtica (colas ligeras, pico bajo)

---

### 2️⃣ **Análisis de Movimiento Rectilíneo Uniforme (MRU)**

#### Teoría Física

El MRU describe un movimiento con **velocidad constante**.

**Ecuaciones del MRU:**
```
x(t) = x₀ + v·t       (posición en función del tiempo)
v = constante          (velocidad no cambia)
a = 0                  (sin aceleración)
```

**Parámetros:**
- `x₀`: Posición inicial (m)
- `v`: Velocidad constante (m/s)
- `t`: Tiempo (s)

#### Gráficas Características del MRU

| Gráfica | Descripción | Forma |
|---------|-------------|-------|
| **x vs t** | Posición vs Tiempo | Línea recta con pendiente `v` |
| **v vs t** | Velocidad vs Tiempo | Línea horizontal en `v` |
| **a vs t** | Aceleración vs Tiempo | Línea horizontal en 0 |

#### Análisis Lineal para MRU

**Para x vs t:**
```
y = b + m·x
x(t) = x₀ + v·t

Donde:
- Pendiente (m) = v (velocidad constante)
- Intercepción (b) = x₀ (posición inicial)
```

**Interpretación del Ajuste:**
- Un buen ajuste lineal (R² > 0.95) confirma MRU
- La pendiente da la velocidad constante
- Residuos aleatorios validan el modelo

---

### 3️⃣ **Análisis de Movimiento Rectilíneo Uniformemente Acelerado (MRUA)**

#### Teoría Física

El MRUA describe un movimiento con **aceleración constante**.

**Ecuaciones del MRUA:**
```
x(t) = x₀ + v₀·t + ½a·t²    (posición, ecuación cuadrática)
v(t) = v₀ + a·t              (velocidad, ecuación lineal)
a = constante                 (aceleración constante)
```

**Parámetros:**
- `x₀`: Posición inicial (m)
- `v₀`: Velocidad inicial (m/s)
- `a`: Aceleración constante (m/s²)
- `t`: Tiempo (s)

#### Gráficas Características del MRUA

| Gráfica | Descripción | Forma |
|---------|-------------|-------|
| **x vs t** | Posición vs Tiempo | Parábola (ecuación cuadrática) |
| **v vs t** | Velocidad vs Tiempo | Línea recta con pendiente `a` |
| **a vs t** | Aceleración vs Tiempo | Línea horizontal en `a` |

---

### 4️⃣ **Técnicas de Linealización para MRUA**

#### Problema:
La ecuación `x(t) = x₀ + v₀·t + ½a·t²` **NO es lineal** en `t`.

#### Solución 1: Linealización x vs t²

**Transformación:**
```
x(t) = x₀ + v₀·t + ½a·t²

Si graficamos x vs t²:
x = x₀ + v₀·t + (½a)·t²

Definiendo: T = t²
x = x₀ + v₀·t + (½a)·T

Si v₀·t es pequeño o despreciable:
x ≈ x₀ + (½a)·t²

Entonces al graficar x vs t²:
y = b + m·X

Donde:
- X = t²
- Pendiente (m) = ½a  →  a = 2m
- Intercepción (b) = x₀
```

**Ventaja:**
- Relación lineal perfecta
- Fácil determinar aceleración: `a = 2 × pendiente`

#### Solución 2: Análisis de v vs t

**Para v vs t (ya es lineal):**
```
v(t) = v₀ + a·t

Gráfica v vs t:
y = b + m·x

Donde:
- Pendiente (m) = a (aceleración)
- Intercepción (b) = v₀ (velocidad inicial)
```

**Ventaja:**
- Directamente lineal, no requiere transformación
- La pendiente da directamente la aceleración

---

## 📊 Estructura del Reporte PDF Mejorado

### 📄 **Página 1: Teoría y Configuración**

#### Sección 1: Teoría Física
- **MRU**: Ecuaciones, características, gráficas típicas
- **MRUA**: Ecuaciones, características, técnicas de linealización
- Diferencias fundamentales entre MRU y MRUA

#### Sección 2: Configuración del Análisis
- Tipo de movimiento (MRU/MRUA)
- Variable cinemática analizada (x-t, v-t, a-t)
- Tipo de ajuste y linealización aplicada

#### Sección 3: Parámetros del Ajuste
- Pendiente y ordenada con IC 95%
- Significado físico de cada parámetro

#### Sección 4: Estadísticas
- R², χ² reducido, σ residuos

#### Sección 5: Interpretación Física (NUEVO) 
- Interpretación automática según tipo de movimiento
- Valores físicos calculados (velocidad, aceleración)
- Validación del modelo

#### Sección 6: Test de Normalidad (NUEVO)
- Resultado del test Jarque-Bera
- Skewness y Kurtosis
- Interpretación estadística

---

### 📈 **Página 2: Gráficos de Análisis**

1. **Gráfico de Datos Experimentales y Ajuste**
   - Puntos azules: Datos medidos
   - Línea roja: Modelo ajustado
   - Título indica IC 95%

2. **Gráfico de Residuos**
   - Puntos morados: Residuos
   - Línea punteada: Referencia en cero
   - Valida aleatoriedad

---

### 📉 **Página 3: Análisis de Distribución**

**Gráfico de Distribución con Test JB:**
- Histograma verde: Frecuencia de residuos
- Curva roja: Distribución normal teórica
- Título incluye resultado del test: "✓ Normal" o "✗ No Normal"

**Cuadro de Análisis de Normalidad:**
- Interpretación completa del test
- Identificación de asimetría o curtosis anormal
- Recomendaciones si no es normal

---

### 📋 **Páginas 4+: Tabla de Datos**

Tabla completa con:
- #, X, Y, u(X), u(Y), Y ajustado, Residuo

---

## 🎯 Ejemplos de Uso

### Ejemplo 1: MRU - Análisis de x vs t

**Datos de entrada:**
```
Tiempo (s): 0, 1, 2, 3, 4, 5
Posición (m): 2.0, 4.5, 7.1, 9.4, 12.0, 14.6
```

**Configuración:**
- Tipo de movimiento: MRU
- Variable cinemática: x-t
- Ajuste: Lineal

**Resultados esperados:**
```
Pendiente (v): 2.5 ± 0.1 m/s
Ordenada (x₀): 2.0 ± 0.2 m
R² > 0.99
```

**Interpretación física automática:**
> "El objeto se mueve con velocidad constante de 2.5 m/s,
> partiendo de la posición 2.0 m. Esto confirma un MRU."

---

### Ejemplo 2: MRUA - Análisis de v vs t

**Datos de entrada:**
```
Tiempo (s): 0, 1, 2, 3, 4, 5
Velocidad (m/s): 0, 2.1, 4.0, 6.2, 7.9, 10.1
```

**Configuración:**
- Tipo de movimiento: MRUA
- Variable cinemática: v-t
- Ajuste: Lineal

**Resultados esperados:**
```
Pendiente (a): 2.0 ± 0.1 m/s²
Ordenada (v₀): 0.1 ± 0.2 m/s
R² > 0.99
```

**Interpretación física automática:**
> "El objeto acelera constantemente a 2.0 m/s²,
> partiendo de una velocidad inicial de 0.1 m/s."

---

## 🔍 Validación Completa del Modelo

Para un análisis válido, verificar:

### ✅ Checklist de Calidad

- [ ] **R² > 0.95**: Buen ajuste lineal
- [ ] **χ² reducido ≈ 1**: Varianza apropiada
- [ ] **Test JB**: Residuos normales (JB < 5.991)
- [ ] **|Skewness| < 0.5**: Distribución simétrica
- [ ] **|Kurtosis| < 1**: Sin colas extremas
- [ ] **Residuos aleatorios**: Sin patrones sistemáticos
- [ ] **Interpretación física coherente**: Valores razonables

---

## 📐 Fórmulas de Linealización Implementadas

### Para MRUA con x vs t:

**Método 1: x vs t² (Recomendado)**
```python
# Transformar datos
t_squared = t ** 2

# Ajustar linealmente
x = b + m * t_squared

# Obtener aceleración
a = 2 * m
x₀ = b
```

**Método 2: Logarítmico (si v₀ ≠ 0)**
```python
# Solo si v₀ es significativo
ln(x - x₀) = ln(v₀) + ln(t) + constante
# Más complejo, menos usado
```

---

## 🚀 Mejoras Técnicas Implementadas

### Backend:
1. ✅ Nuevos tipos: `MotionType`, `KinematicVariable`, `NormalityTest`
2. ✅ Función `performNormalityTest()`: Test Jarque-Bera completo
3. ✅ Función `generatePhysicalInterpretation()`: Interpretación automática
4. ✅ Mejora en `generateDistributionChart()`: Incluye resultado del test
5. ✅ Sección de teoría física en PDF
6. ✅ Cuadro de interpretación física en PDF
7. ✅ Análisis detallado de normalidad en PDF

### Frontend:
- Próximo paso: Agregar selector de tipo de movimiento
- Próximo paso: Opciones de variables cinemáticas
- Próximo paso: Sugerencias de linealización

---

## 📚 Referencias Teóricas

### Cinemática:
- Serway & Jewett - "Física para Ciencias e Ingeniería"
- Halliday, Resnick & Walker - "Fundamentos de Física"

### Estadística:
- Jarque-Bera Test (1980): "Efficient tests for normality, homoscedasticity and serial independence"
- ISO/IEC Guide 98-3:2008 (GUM)

---

## ✨ Ventajas del Sistema Mejorado

### Para Estudiantes:
✅ Aprenden teoría y práctica simultáneamente
✅ Ven interpretación física de resultados
✅ Entienden importancia de normalidad de residuos
✅ Reportes profesionales para laboratorios

### Para Profesores:
✅ Herramienta completa para enseñanza de cinemática
✅ Validación estadística rigurosa
✅ Exportación a PDF para evaluación
✅ Cumple estándares académicos

### Para Investigadores:
✅ Análisis profesional con IC 95%
✅ Test estadísticos automáticos
✅ Reportes publicables
✅ Métodos validados científicamente

---

**🎓 El sistema ahora es una herramienta educativa y de investigación completa para análisis cinemático!**
