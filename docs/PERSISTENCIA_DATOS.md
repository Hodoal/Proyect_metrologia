# 💾 Sistema de Persistencia de Datos

## ✅ Funcionalidad Implementada

El sistema ahora guarda **automáticamente** todos los datos ingresados en el navegador usando `localStorage`. Los datos permanecen disponibles incluso después de cerrar el navegador o refrescar la página.

---

## 🔄 Datos que se Guardan Automáticamente

El sistema persiste los siguientes campos:

### **1. Datos Experimentales**
- ✅ **Valores de X**: Todos los valores ingresados en el campo X
- ✅ **Valores de Y**: Todos los valores ingresados en el campo Y
- ✅ **Incertidumbres u(X)**: Si se proporcionan
- ✅ **Incertidumbres u(Y)**: Si se proporcionan

### **2. Configuración de Análisis**
- ✅ **Tipo de Movimiento**: MRU o MRUA
- ✅ **Variable Cinemática**: x-t, v-t, o a-t
- ✅ **Tipo de Ajuste**: Lineal, Potencial, o Exponencial

---

## 💡 Cómo Funciona

### **Autoguardado Instantáneo**
```
Escribes un valor → Se guarda automáticamente
     ↓
Cierras el navegador
     ↓
Vuelves a abrir → ¡Tus datos siguen ahí!
```

### **Sin Necesidad de "Guardar"**
- ❌ NO necesitas hacer clic en ningún botón de "Guardar"
- ✅ Los datos se guardan mientras escribes
- ✅ Cada cambio se persiste inmediatamente

---

## 🗑️ Borrar Datos Guardados

### **Botón "Borrar Todo"**
Ubicado en la esquina superior derecha de la sección "Entrada de Datos"

**Funcionalidad:**
1. Clic en el botón rojo **"🗑️ Borrar Todo"**
2. Aparece confirmación: "¿Estás seguro de que deseas borrar todos los datos guardados?"
3. Si confirmas:
   - ✅ Se eliminan todos los datos de localStorage
   - ✅ Se restauran los valores por defecto (datos de ejemplo MRU)
   - ✅ Se limpia el archivo cargado (si existe)
   - ✅ Se resetean las configuraciones

**Valores por Defecto Restaurados:**
```javascript
// Datos de ejemplo MRU (velocidad ≈ 2 m/s)
Tiempo (s): 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
Posición (m): 0.5, 2.3, 4.1, 6.2, 8.0, 10.1, 12.3, 14.2, 16.1, 18.0, 20.2

Configuración:
- Tipo de Movimiento: MRU
- Variable: x-t (Posición vs Tiempo)
- Ajuste: Lineal
```

---

## 🔒 Privacidad y Seguridad

### **Almacenamiento Local**
- ✅ Los datos se guardan **SOLO en tu navegador**
- ✅ NO se envían a ningún servidor externo
- ✅ NO se comparten con nadie
- ✅ Solo tú tienes acceso a ellos

### **Limitaciones de localStorage**
- **Capacidad**: ~5-10 MB por dominio (más que suficiente para datos experimentales)
- **Duración**: Permanente hasta que borres los datos del navegador o uses el botón "Borrar Todo"
- **Ámbito**: Solo disponible en este dominio/puerto (localhost:3000)

---

## 🎯 Casos de Uso

### **Caso 1: Sesión Interrumpida**
```
1. Estás ingresando datos experimentales
2. Tu computadora se reinicia inesperadamente
3. Vuelves a abrir la aplicación
✅ Resultado: Todos tus datos siguen ahí
```

### **Caso 2: Múltiples Experimentos**
```
1. Analizas un experimento (Datos A)
2. Quieres analizar otro experimento (Datos B)
3. Haces clic en "Borrar Todo"
4. Ingresas nuevos datos
✅ Resultado: Datos limpios para el nuevo experimento
```

### **Caso 3: Trabajo Continuo**
```
1. Lunes: Ingresas datos parciales
2. Martes: Cierras el navegador
3. Miércoles: Vuelves y continúas
✅ Resultado: Puedes continuar donde lo dejaste
```

---

## 🔧 Implementación Técnica

### **Hooks de React Utilizados**

#### **1. Carga Inicial (useEffect)**
```typescript
useEffect(() => {
  // Cargar datos guardados al montar el componente
  const savedData = {
    xData: localStorage.getItem('metrologia_xData') || DEFAULT_X_DATA,
    yData: localStorage.getItem('metrologia_yData') || DEFAULT_Y_DATA,
    // ... más campos
  };
  
  // Restaurar estado
  setXData(savedData.xData);
  setYData(savedData.yData);
}, []);
```

#### **2. Guardado Automático (useEffect con dependencias)**
```typescript
useEffect(() => {
  if (typeof window !== 'undefined' && xData) {
    localStorage.setItem('metrologia_xData', xData);
  }
}, [xData]); // Se ejecuta cada vez que xData cambia
```

### **Keys de localStorage Utilizadas**
```javascript
metrologia_xData              // Valores de X
metrologia_yData              // Valores de Y
metrologia_uxData             // Incertidumbres u(X)
metrologia_uyData             // Incertidumbres u(Y)
metrologia_adjustmentType     // Tipo de ajuste
metrologia_motionType         // MRU o MRUA
metrologia_kinematicVariable  // x-t, v-t, o a-t
```

---

## 🎨 Interfaz de Usuario

### **Indicador Visual**
```
┌─────────────────────────────────────────────────────────┐
│ 💾 Autoguardado activado: Tus datos se guardan         │
│    automáticamente mientras escribes. Permanecerán     │
│    disponibles incluso si cierras el navegador.        │
└─────────────────────────────────────────────────────────┘
```
**Color:** Verde claro con borde verde
**Ubicación:** Debajo de la sección de carga de archivos

### **Botón Borrar Todo**
```
┌──────────────────────────┐
│  🗑️  Borrar Todo          │
└──────────────────────────┘
```
**Color:** Rojo con hover más oscuro
**Ubicación:** Esquina superior derecha del panel "Entrada de Datos"
**Confirmación:** Sí (diálogo de confirmación)

---

## 🧪 Pruebas Recomendadas

### **Test 1: Persistencia Básica**
1. Ingresa datos en X e Y
2. Cierra el navegador completamente
3. Abre nuevamente http://localhost:3000
4. **Esperado:** Los datos ingresados están presentes

### **Test 2: Persistencia de Configuración**
1. Cambia tipo de movimiento a MRUA
2. Cambia variable a v-t
3. Cambia ajuste a Potencial
4. Refresca la página (F5)
5. **Esperado:** Configuración se mantiene

### **Test 3: Borrado Completo**
1. Ingresa datos personalizados
2. Clic en "Borrar Todo"
3. Confirma la acción
4. **Esperado:** 
   - Datos vuelven a valores por defecto
   - Configuración resetea a MRU, x-t, Lineal
   - Mensaje de confirmación aparece

### **Test 4: Valores por Defecto**
1. Primera vez que abres la aplicación (o después de borrar datos)
2. **Esperado:**
   - Datos de ejemplo MRU precargados
   - 11 puntos de tiempo (0 a 10 s)
   - Posición con velocidad ~2 m/s

---

## 🔄 Compatibilidad

### **Navegadores Soportados**
- ✅ Chrome/Edge (v90+)
- ✅ Firefox (v85+)
- ✅ Safari (v14+)
- ✅ Opera (v75+)

### **Modo Incógnito**
- ⚠️ Los datos se borran al cerrar la ventana incógnita
- ⚠️ No persisten entre sesiones en modo privado

---

## 📊 Beneficios para el Usuario

1. **Sin Pérdida de Datos**
   - Protección contra cierres accidentales
   - Continuidad en el trabajo

2. **Mejor Experiencia**
   - No necesitas recordar guardar
   - Flujo de trabajo más natural

3. **Flexibilidad**
   - Puedes trabajar en múltiples sesiones
   - Fácil limpieza cuando necesites empezar de nuevo

4. **Privacidad**
   - Tus datos nunca salen de tu computadora
   - Control total sobre cuándo borrarlos

---

## 🚀 Próximas Mejoras Sugeridas

### **Posibles Adiciones Futuras:**
1. **Múltiples Slots de Guardado**
   - Guardar diferentes conjuntos de datos con nombres
   - "Guardar como..." funcionalidad

2. **Importar/Exportar Configuración**
   - Exportar datos + configuración a JSON
   - Importar desde JSON guardado previamente

3. **Historial de Análisis**
   - Mantener registro de análisis anteriores
   - Ver resultados históricos

4. **Sincronización en la Nube** (opcional)
   - Para usuarios que trabajen en múltiples dispositivos
   - Requeriría backend y autenticación

---

## ✅ Estado Actual

| Funcionalidad | Estado | Notas |
|--------------|--------|-------|
| Autoguardado de X/Y | ✅ | Funcional |
| Autoguardado de u(X)/u(Y) | ✅ | Funcional |
| Autoguardado de configuración | ✅ | Funcional |
| Botón "Borrar Todo" | ✅ | Con confirmación |
| Valores por defecto | ✅ | Datos ejemplo MRU |
| Indicador visual | ✅ | Mensaje verde |
| Persistencia entre sesiones | ✅ | Funcional |

---

**¡Sistema de persistencia completamente implementado y funcional! 💾✨**
