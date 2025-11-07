import { 
  AnalysisRequest, 
  AnalysisResult, 
  DataPoint, 
  LinearDataPoint, 
  ResidualDataPoint, 
  AdjustmentType,
  StatisticalSummary 
} from '../types';

export class MetrologicalCalculator {
  
  async performAnalysis(request: AnalysisRequest): Promise<AnalysisResult> {
    const { xData, yData, uxData, uyData, adjustmentType, motionType, kinematicVariable } = request;
    
    // Calculate uncertainties if not provided (Type A evaluation)
    const ux = uxData || this.calculateTypeAUncertainty(xData);
    const uy = uyData || this.calculateTypeAUncertainty(yData);

    // Caso especial: MRUA con x-t y ajuste potencial -> ajuste cuadrático
    const useQuadraticFit = motionType === 'MRUA' && kinematicVariable === 'x-t' && adjustmentType === 'potencial';

    let fitResult: any;
    let yFit: number[];
    let residuals: number[];
    let linearization: any;

    if (useQuadraticFit) {
      // Ajuste cuadrático: x = x₀ + v₀t + ½at²
      const quadraticResult = this.performQuadraticFit(xData, yData, ux, uy);
      
      // Adaptar el resultado al formato esperado
      // m representa v₀ (velocidad inicial) y b representa x₀ (posición inicial)
      // El coeficiente cuadrático (½a) se guarda por separado
      fitResult = {
        m: quadraticResult.v0,        // velocidad inicial
        b: quadraticResult.x0,        // posición inicial  
        uM: quadraticResult.uV0,      // incertidumbre de v₀
        uB: quadraticResult.uX0,      // incertidumbre de x₀
        a: quadraticResult.a,         // aceleración
        uA: quadraticResult.uA        // incertidumbre de a
      };
      
      yFit = xData.map(t => quadraticResult.x0 + quadraticResult.v0 * t + 0.5 * quadraticResult.a * t * t);
      residuals = yData.map((y, i) => y - (yFit[i] || 0));
      
      linearization = {
        xLin: xData,
        yLin: yData,
        uxLin: ux,
        uyLin: uy,
        labelX: 't (s)',
        labelY: 'x (m)'
      };
    } else {
      // Linearization based on adjustment type and kinematic configuration
      linearization = this.linearizeData(xData, yData, ux, uy, adjustmentType, motionType, kinematicVariable);
      
      // Weighted least squares fit
      fitResult = this.performWeightedLeastSquaresFit(
        linearization.xLin, 
        linearization.yLin, 
        linearization.uxLin, 
        linearization.uyLin
      );

      // Calculate fitted values and residuals
      yFit = linearization.xLin.map((x: number) => fitResult.m * x + fitResult.b);
      residuals = linearization.yLin.map((y: number, i: number) => y - (yFit[i] || 0));
    }

    // Statistical measures
    const stats = this.calculateStatistics(residuals);
    const r2 = this.calculateR2(linearization.yLin, yFit);
    const chi2Red = this.calculateReducedChiSquared(residuals, uy, xData.length - 2);

    // Prepare data arrays
    const originalData: DataPoint[] = xData.map((x, i) => {
      const point: DataPoint = { x, y: yData[i] || 0 };
      if (ux[i] !== undefined) point.ux = ux[i];
      if (uy[i] !== undefined) point.uy = uy[i];
      return point;
    });

    const linearData: LinearDataPoint[] = linearization.xLin.map((x: number, i: number) => ({
      x,
      y: linearization.yLin[i] || 0,
      yFit: yFit[i] || 0
    }));

    const residualData: ResidualDataPoint[] = linearization.xLin.map((x: number, i: number) => ({
      x,
      residual: residuals[i] || 0
    }));

    // Test de normalidad
    const normalityTest = this.performNormalityTest(residuals);
    
    // Determinar si se usó linealización x vs t²
    const isLinearizedXvsT2 = motionType === 'MRUA' && kinematicVariable === 'x-t' && adjustmentType === 'lineal';
    
    // Interpretación física
    const physicalInterpretation = this.generatePhysicalInterpretation(
      fitResult.m, 
      fitResult.b, 
      motionType, 
      kinematicVariable,
      isLinearizedXvsT2,
      fitResult.a,
      useQuadraticFit
    );

    return {
      m: fitResult.m,
      b: fitResult.b,
      uM: fitResult.uM,
      uB: fitResult.uB,
      ...(fitResult.a !== undefined && { a: fitResult.a }),
      ...(fitResult.uA !== undefined && { uA: fitResult.uA }),
      r2,
      sRes: stats.std,
      chi2Red,
      df: xData.length - 2,
      originalData,
      linearData,
      residualData,
      residuals,
      labelX: linearization.labelX,
      labelY: linearization.labelY,
      x: xData,
      y: yData,
      xLin: linearization.xLin,
      yLin: linearization.yLin,
      ajusteType: adjustmentType,
      ...(motionType && { motionType }),
      ...(kinematicVariable && { kinematicVariable }),
      ...(normalityTest && { normalityTest }),
      ...(physicalInterpretation && { physicalInterpretation })
    };
  }

  private calculateTypeAUncertainty(data: number[]): number[] {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (data.length - 1);
    const standardError = Math.sqrt(variance / data.length);
    
    // Return 10% of standard error as default uncertainty
    return data.map(() => standardError * 0.1);
  }

  private linearizeData(
    x: number[], 
    y: number[], 
    ux: number[], 
    uy: number[], 
    type: AdjustmentType,
    motionType?: 'MRU' | 'MRUA',
    kinematicVariable?: 'x-t' | 'v-t' | 'a-t'
  ) {
    let xLin: number[], yLin: number[], uxLin: number[], uyLin: number[];
    let labelX: string, labelY: string;

    // Caso especial para MRUA con posición vs tiempo y ajuste lineal: usar x vs t²
    if (motionType === 'MRUA' && kinematicVariable === 'x-t' && type === 'lineal') {
      // Para MRUA: x = x₀ + v₀t + (1/2)at²
      // Si graficamos x vs t², obtenemos una línea: x = x₀ + (a/2)t²
      // (asumiendo v₀ ≈ 0 o despreciable)
      xLin = x.map(val => val * val); // t²
      yLin = [...y]; // posición
      uxLin = ux.map((u, i) => 2 * Math.abs(x[i] || 0) * u); // Propagación: u(t²) = 2t·u(t)
      uyLin = [...uy];
      labelX = 't² (s²)';
      labelY = 'x (m)';
      return { xLin, yLin, uxLin, uyLin, labelX, labelY };
    }

    switch (type) {
      case 'lineal':
        xLin = [...x];
        yLin = [...y];
        uxLin = [...ux];
        uyLin = [...uy];
        labelX = 'x';
        labelY = 'y';
        break;

      case 'potencial':
        // Caso especial MRUA con x-t: NO linearizar, mantener datos originales
        // para ajuste polinomial cuadrático directo
        if (motionType === 'MRUA' && kinematicVariable === 'x-t') {
          xLin = [...x];
          yLin = [...y];
          uxLin = [...ux];
          uyLin = [...uy];
          labelX = 't (s)';
          labelY = 'x (m)';
        } else {
          // y = Ax^n -> ln(y) = ln(A) + n*ln(x)
          xLin = x.map(val => Math.log(Math.abs(val)));
          yLin = y.map(val => Math.log(Math.abs(val)));
          uxLin = ux.map((u, i) => Math.abs(u / (x[i] || 1))); // Propagation: u(ln(x)) = u(x)/|x|
          uyLin = uy.map((u, i) => Math.abs(u / (y[i] || 1))); // Propagation: u(ln(y)) = u(y)/|y|
          labelX = 'ln(x)';
          labelY = 'ln(y)';
        }
        break;

      case 'exponencial':
        // y = Ae^(bx) -> ln(y) = ln(A) + bx
        xLin = [...x];
        yLin = y.map(val => Math.log(Math.abs(val)));
        uxLin = [...ux];
        uyLin = uy.map((u, i) => Math.abs(u / (y[i] || 1))); // Propagation: u(ln(y)) = u(y)/|y|
        labelX = 'x';
        labelY = 'ln(y)';
        break;

      default:
        throw new Error(`Unsupported adjustment type: ${type}`);
    }

    return { xLin, yLin, uxLin, uyLin, labelX, labelY };
  }

  private performWeightedLeastSquaresFit(
    x: number[], 
    y: number[], 
    ux: number[], 
    uy: number[]
  ) {
    // Weights are inverse of variance
    const weights = uy.map(u => 1 / (u * u));
    
    const sumW = weights.reduce((sum, w) => sum + w, 0);
    const sumWX = weights.reduce((sum, w, i) => sum + w * (x[i] || 0), 0);
    const sumWY = weights.reduce((sum, w, i) => sum + w * (y[i] || 0), 0);
    const sumWXX = weights.reduce((sum, w, i) => sum + w * (x[i] || 0) * (x[i] || 0), 0);
    const sumWXY = weights.reduce((sum, w, i) => sum + w * (x[i] || 0) * (y[i] || 0), 0);

    const delta = sumW * sumWXX - sumWX * sumWX;
    
    if (Math.abs(delta) < 1e-10) {
      throw new Error('Singular matrix in least squares fit');
    }

    const m = (sumW * sumWXY - sumWX * sumWY) / delta;
    const b = (sumWXX * sumWY - sumWX * sumWXY) / delta;
    
    // Degrees of freedom
    const df = x.length - 2;
    
    // t-Student value for 95% confidence (two-tailed)
    const tValue = this.getTStudentValue(df, 0.95);
    
    // Uncertainties in parameters with 95% confidence interval
    const uM = Math.sqrt(sumW / delta) * tValue;
    const uB = Math.sqrt(sumWXX / delta) * tValue;

    return { m, b, uM, uB };
  }

  /**
   * Perform quadratic fit: y = c0 + c1*x + c2*x^2
   * For MRUA: x = x₀ + v₀*t + (1/2)*a*t²
   * Where: c0 = x₀, c1 = v₀, c2 = a/2
   */
  private performQuadraticFit(
    t: number[],
    x: number[],
    ut: number[],
    ux: number[]
  ): { x0: number; v0: number; a: number; uX0: number; uV0: number; uA: number } {
    const n = t.length;
    
    // Weights based on uncertainties in x
    const weights = ux.map(u => 1 / (u * u));
    
    // Build normal equations: [A][c] = [b]
    // For y = c0 + c1*x + c2*x^2
    // A is a 3x3 matrix, b is a 3x1 vector
    
    const sumW = weights.reduce((sum, w) => sum + w, 0);
    const sumWT = weights.reduce((sum, w, i) => sum + w * (t[i] || 0), 0);
    const sumWT2 = weights.reduce((sum, w, i) => sum + w * (t[i] || 0) * (t[i] || 0), 0);
    const sumWT3 = weights.reduce((sum, w, i) => sum + w * Math.pow((t[i] || 0), 3), 0);
    const sumWT4 = weights.reduce((sum, w, i) => sum + w * Math.pow((t[i] || 0), 4), 0);
    
    const sumWX = weights.reduce((sum, w, i) => sum + w * (x[i] || 0), 0);
    const sumWTX = weights.reduce((sum, w, i) => sum + w * (t[i] || 0) * (x[i] || 0), 0);
    const sumWT2X = weights.reduce((sum, w, i) => sum + w * (t[i] || 0) * (t[i] || 0) * (x[i] || 0), 0);
    
    // Matrix A (symmetric)
    const A = [
      [sumW, sumWT, sumWT2],
      [sumWT, sumWT2, sumWT3],
      [sumWT2, sumWT3, sumWT4]
    ];
    
    // Vector b
    const b = [sumWX, sumWTX, sumWT2X];
    
    // Solve using Gaussian elimination
    const coeffs = this.solveLinearSystem(A, b);
    
    const x0 = coeffs[0] || 0;  // Posición inicial
    const v0 = coeffs[1] || 0;  // Velocidad inicial
    const halfA = coeffs[2] || 0; // a/2
    const a = 2 * halfA;   // Aceleración
    
    // Calculate uncertainties (simplified approach)
    // Residuals
    const yFit = t.map((ti, i) => x0 + v0 * ti + halfA * ti * ti);
    const residuals = x.map((xi, i) => xi - (yFit[i] || 0));
    const ssRes = residuals.reduce((sum, r) => sum + r * r, 0);
    const sRes = Math.sqrt(ssRes / (n - 3)); // 3 parameters
    
    // Degrees of freedom
    const df = n - 3;
    
    // t-Student value for 95% confidence
    const tValue = this.getTStudentValue(df, 0.95);
    
    // Approximate uncertainties (should use covariance matrix for precision)
    const uX0 = sRes * Math.sqrt(sumWT2 / (sumW * sumWT2 - sumWT * sumWT)) * tValue;
    const uV0 = sRes * Math.sqrt(1 / sumWT2) * tValue;
    const uHalfA = sRes * Math.sqrt(1 / sumWT4) * tValue;
    const uA = 2 * uHalfA; // Propagación: u(2x) = 2*u(x)
    
    return { x0, v0, a, uX0, uV0, uA };
  }

  /**
   * Solve linear system Ax = b using Gaussian elimination
   */
  private solveLinearSystem(A: number[][], b: number[]): number[] {
    const n = A.length;
    const augmented: number[][] = A.map((row, i) => [...row, b[i] || 0]);
    
    // Forward elimination
    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        const rowK = augmented[k];
        const rowMax = augmented[maxRow];
        if (rowK && rowMax) {
          const currentVal = Math.abs(rowK[i] || 0);
          const maxVal = Math.abs(rowMax[i] || 0);
          if (currentVal > maxVal) {
            maxRow = k;
          }
        }
      }
      
      // Swap rows
      if (i !== maxRow) {
        const rowI = augmented[i];
        const rowMax = augmented[maxRow];
        if (rowI && rowMax) {
          augmented[i] = rowMax;
          augmented[maxRow] = rowI;
        }
      }
      
      // Make all rows below this one 0 in current column
      const rowI = augmented[i];
      if (rowI) {
        for (let k = i + 1; k < n; k++) {
          const rowK = augmented[k];
          if (rowK) {
            const factor = (rowK[i] || 0) / (rowI[i] || 1);
            for (let j = i; j < n + 1; j++) {
              rowK[j] = (rowK[j] || 0) - factor * (rowI[j] || 0);
            }
          }
        }
      }
    }
    
    // Back substitution
    const x: number[] = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      const row = augmented[i];
      if (row) {
        let sum = row[n] || 0;
        for (let j = i + 1; j < n; j++) {
          const val = row[j];
          const xj = x[j];
          if (val !== undefined && xj !== undefined) {
            sum -= val * xj;
          }
        }
        const divisor = row[i];
        if (divisor !== undefined && divisor !== 0) {
          x[i] = sum / divisor;
        } else {
          x[i] = sum;
        }
      }
    }
    
    return x;
  }

  private calculateR2(observed: number[], fitted: number[]): number {
    const yMean = observed.reduce((sum, y) => sum + y, 0) / observed.length;
    
    const ssRes = observed.reduce((sum, y, i) => sum + Math.pow(y - (fitted[i] || 0), 2), 0);
    const ssTot = observed.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    
    return Math.max(0, 1 - ssRes / ssTot);
  }

  private calculateReducedChiSquared(residuals: number[], uncertainties: number[], df: number): number {
    const chiSquared = residuals.reduce((sum, res, i) => {
      const u = uncertainties[i] || 1;
      return sum + (res * res) / (u * u);
    }, 0);
    
    return chiSquared / df;
  }

  calculateStatistics(data: number[]): StatisticalSummary {
    if (data.length === 0) {
      throw new Error('Cannot calculate statistics for empty data');
    }

    const sorted = [...data].sort((a, b) => a - b);
    const n = data.length;
    const mean = data.reduce((sum, val) => sum + val, 0) / n;
    
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (n - 1);
    const std = Math.sqrt(variance);
    
    const q1 = this.percentile(sorted, 25);
    const median = this.percentile(sorted, 50);
    const q3 = this.percentile(sorted, 75);

    return {
      count: n,
      mean,
      std,
      min: sorted[0] || 0,
      max: sorted[n - 1] || 0,
      q1,
      median,
      q3
    };
  }

  private percentile(sortedArray: number[], p: number): number {
    if (p < 0 || p > 100) {
      throw new Error('Percentile must be between 0 and 100');
    }
    
    const n = sortedArray.length;
    const index = (p / 100) * (n - 1);
    
    if (Number.isInteger(index)) {
      return sortedArray[index] || 0;
    }
    
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const fraction = index - lower;
    
    return (sortedArray[lower] || 0) + fraction * ((sortedArray[upper] || 0) - (sortedArray[lower] || 0));
  }

  validateData(data: DataPoint[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!Array.isArray(data)) {
      errors.push('Data must be an array');
      return { valid: false, errors };
    }
    
    if (data.length < 3) {
      errors.push('At least 3 data points are required');
    }
    
    data.forEach((point, index) => {
      if (typeof point.x !== 'number' || isNaN(point.x)) {
        errors.push(`Invalid X value at index ${index}`);
      }
      
      if (typeof point.y !== 'number' || isNaN(point.y)) {
        errors.push(`Invalid Y value at index ${index}`);
      }
      
      if (point.ux !== undefined && (typeof point.ux !== 'number' || isNaN(point.ux) || point.ux <= 0)) {
        errors.push(`Invalid uncertainty UX at index ${index}`);
      }
      
      if (point.uy !== undefined && (typeof point.uy !== 'number' || isNaN(point.uy) || point.uy <= 0)) {
        errors.push(`Invalid uncertainty UY at index ${index}`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get t-Student value for given degrees of freedom and confidence level
   * Using two-tailed distribution for 95% confidence
   */
  private getTStudentValue(df: number, confidenceLevel: number): number {
    // t-values for 95% confidence (two-tailed, α = 0.05)
    const tTable: { [key: number]: number } = {
      1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
      6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228,
      11: 2.201, 12: 2.179, 13: 2.160, 14: 2.145, 15: 2.131,
      16: 2.120, 17: 2.110, 18: 2.101, 19: 2.093, 20: 2.086,
      21: 2.080, 22: 2.074, 23: 2.069, 24: 2.064, 25: 2.060,
      26: 2.056, 27: 2.052, 28: 2.048, 29: 2.045, 30: 2.042,
      40: 2.021, 50: 2.009, 60: 2.000, 80: 1.990, 100: 1.984,
      120: 1.980
    };

    if (df <= 0) return 1.96;
    if (tTable[df]) return tTable[df];
    
    // Interpolation for intermediate values
    if (df < 30) {
      const lower = Math.floor(df);
      const upper = Math.ceil(df);
      if (tTable[lower] && tTable[upper]) {
        const fraction = df - lower;
        return tTable[lower] + fraction * (tTable[upper] - tTable[lower]);
      }
    }

    // For large df (> 120), use normal distribution approximation
    if (df > 120) return 1.96;

    // Find closest values for interpolation
    const keys = Object.keys(tTable).map(Number).sort((a, b) => a - b);
    let lower = 30;
    let upper = 120;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const currentKey = keys[i];
      const nextKey = keys[i + 1];
      if (currentKey !== undefined && nextKey !== undefined && currentKey <= df && nextKey > df) {
        lower = currentKey;
        upper = nextKey;
        break;
      }
    }
    
    const fraction = (df - lower) / (upper - lower);
    const lowerValue = tTable[lower] || 2.042;
    const upperValue = tTable[upper] || 1.980;
    return lowerValue + fraction * (upperValue - lowerValue);
  }

  /**
   * Perform normality test on residuals
   * Tests for skewness and kurtosis to determine if distribution is normal
   */
  private performNormalityTest(residuals: number[]): any {
    const n = residuals.length;
    const mean = residuals.reduce((sum, r) => sum + r, 0) / n;
    const std = Math.sqrt(residuals.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (n - 1));
    
    // Calculate skewness (measure of asymmetry)
    const skewness = residuals.reduce((sum, r) => sum + Math.pow((r - mean) / std, 3), 0) / n;
    
    // Calculate kurtosis (measure of tail heaviness)
    const kurtosis = residuals.reduce((sum, r) => sum + Math.pow((r - mean) / std, 4), 0) / n - 3;
    
    // Jarque-Bera test statistic
    const jbStatistic = (n / 6) * (Math.pow(skewness, 2) + Math.pow(kurtosis, 2) / 4);
    
    // Critical value for JB test at 95% confidence (chi-square with 2 df)
    const criticalValue = 5.991;
    const isNormal = jbStatistic < criticalValue;
    
    let interpretation = '';
    if (isNormal) {
      interpretation = 'Los residuos siguen aproximadamente una distribución NORMAL. ';
      interpretation += 'Esto valida el modelo de ajuste y confirma que los errores son aleatorios.';
    } else {
      if (Math.abs(skewness) > 0.5) {
        interpretation = `Los residuos muestran ASIMETRÍA ${skewness > 0 ? 'positiva' : 'negativa'} (skewness = ${skewness.toFixed(3)}). `;
      }
      if (Math.abs(kurtosis) > 1) {
        interpretation += `Presentan colas ${kurtosis > 0 ? 'pesadas' : 'ligeras'} (kurtosis exceso = ${kurtosis.toFixed(3)}). `;
      }
      interpretation += 'Considere revisar datos atípicos o el modelo de ajuste.';
    }
    
    return {
      testName: 'Jarque-Bera',
      statistic: jbStatistic,
      isNormal,
      skewness,
      kurtosis,
      interpretation
    };
  }

  /**
   * Generate physical interpretation for kinematic analysis
   */
  private generatePhysicalInterpretation(
    m: number, 
    b: number, 
    motionType?: string,
    kinematicVariable?: string,
    isLinearizedXvsT2?: boolean,
    a?: number,
    isQuadraticFit?: boolean
  ): string {
    if (!motionType || !kinematicVariable) {
      return 'Análisis metrológico general sin interpretación física específica.';
    }

    let interpretation = '';

    if (motionType === 'MRU') {
      // Movimiento Rectilíneo Uniforme
      interpretation = '📐 MOVIMIENTO RECTILÍNEO UNIFORME (MRU)\n\n';
      
      if (kinematicVariable === 'x-t') {
        interpretation += `La ecuación del movimiento es: x(t) = x₀ + v·t\n\n`;
        interpretation += `• Posición inicial (x₀): ${b.toFixed(3)} m\n`;
        interpretation += `• Velocidad constante (v): ${m.toFixed(3)} m/s\n\n`;
        interpretation += `El objeto se mueve con velocidad constante de ${m.toFixed(3)} m/s, `;
        interpretation += `partiendo de la posición ${b.toFixed(3)} m.`;
      } else if (kinematicVariable === 'v-t') {
        interpretation += `En MRU, la velocidad es constante:\n\n`;
        interpretation += `• Velocidad constante (v): ${b.toFixed(3)} m/s\n`;
        interpretation += `• Cambio de velocidad: ${m.toFixed(6)} m/s² (≈ 0)\n\n`;
        interpretation += `La pendiente cercana a cero confirma que no hay aceleración.`;
      }
    } else if (motionType === 'MRUA') {
      // Movimiento Rectilíneo Uniformemente Acelerado
      interpretation = '🚀 MOVIMIENTO RECTILÍNEO UNIFORMEMENTE ACELERADO (MRUA)\n\n';
      
      if (kinematicVariable === 'x-t') {
        if (isQuadraticFit && a !== undefined) {
          // Ajuste cuadrático completo: x = x₀ + v₀·t + ½a·t²
          interpretation += `La ecuación del movimiento es: x(t) = x₀ + v₀·t + ½a·t²\n\n`;
          interpretation += `📊 AJUSTE POLINOMIAL CUADRÁTICO\n\n`;
          interpretation += `Ajuste completo de 3 parámetros:\n\n`;
          interpretation += `• Posición inicial (x₀): ${b.toFixed(3)} m\n`;
          interpretation += `• Velocidad inicial (v₀): ${m.toFixed(3)} m/s\n`;
          interpretation += `• Aceleración constante (a): ${a.toFixed(3)} m/s²\n\n`;
          interpretation += `Ecuación completa:\n`;
          interpretation += `x(t) = ${b.toFixed(3)} + ${m.toFixed(3)}·t + ${(0.5 * a).toFixed(3)}·t²\n\n`;
          interpretation += `El objeto parte de la posición x₀ = ${b.toFixed(3)} m con velocidad inicial `;
          interpretation += `v₀ = ${m.toFixed(3)} m/s y acelera constantemente a a = ${a.toFixed(3)} m/s².`;
          
          if (Math.abs(b) < 1) {
            interpretation += `\nLa posición inicial cercana a cero es consistente con el origen de referencia.`;
          }
          if (Math.abs(m) < 0.1) {
            interpretation += `\nLa velocidad inicial cercana a cero indica que el objeto parte del reposo.`;
          }
        } else {
          // Ajuste linealizado: x vs t²
          interpretation += `La ecuación del movimiento es: x(t) = x₀ + v₀·t + ½a·t²\n\n`;
          interpretation += `📊 ANÁLISIS LINEALIZADO: x vs t²\n\n`;
          interpretation += `Ajuste lineal realizado: x = x₀ + (a/2)·t²\n\n`;
          
          const acceleration = 2 * m; // Porque m = a/2, entonces a = 2m
          interpretation += `• Posición inicial (x₀): ${b.toFixed(3)} m\n`;
          interpretation += `• Aceleración constante (a): ${acceleration.toFixed(3)} m/s²\n`;
          interpretation += `  (calculada como a = 2 × pendiente = 2 × ${m.toFixed(3)} = ${acceleration.toFixed(3)} m/s²)\n\n`;
          interpretation += `El objeto parte de x₀ = ${b.toFixed(3)} m con aceleración constante `;
          interpretation += `de ${acceleration.toFixed(3)} m/s².`;
          
          if (Math.abs(b) < 1) {
            interpretation += `\nLa posición inicial cercana a cero es consistente con el origen de referencia.`;
          }
        }
      } else if (kinematicVariable === 'v-t') {
        interpretation += `La ecuación de velocidad es: v(t) = v₀ + a·t\n\n`;
        interpretation += `• Velocidad inicial (v₀): ${b.toFixed(3)} m/s\n`;
        interpretation += `• Aceleración constante (a): ${m.toFixed(3)} m/s²\n\n`;
        interpretation += `El objeto acelera constantemente a ${m.toFixed(3)} m/s², `;
        interpretation += `partiendo de una velocidad inicial de ${b.toFixed(3)} m/s.`;
      } else if (kinematicVariable === 'a-t') {
        interpretation += `En MRUA, la aceleración es constante:\n\n`;
        interpretation += `• Aceleración constante (a): ${b.toFixed(3)} m/s²\n`;
        interpretation += `• Cambio de aceleración: ${m.toFixed(6)} m/s³ (≈ 0)\n\n`;
        interpretation += `La pendiente cercana a cero confirma aceleración constante.`;
      }
    }

    return interpretation;
  }
}