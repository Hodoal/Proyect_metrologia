export interface DataPoint {
  x: number;
  y: number;
  ux?: number;
  uy?: number;
}

export interface NormalityTest {
  jbStatistic: number;
  criticalValue: number;
  isNormal: boolean;
  skewness: number;
  kurtosis: number;
  interpretation: string;
}

export interface AnalysisResult {
  m?: number;          // Pendiente (ajuste lineal) o velocidad en fit linealizado
  b?: number;          // Ordenada (ajuste lineal) o posición en fit linealizado
  uM?: number;         // Incertidumbre de la pendiente
  uB?: number;         // Incertidumbre de la ordenada
  x0?: number;         // Posición inicial (ajuste cuadrático MRUA)
  v0?: number;         // Velocidad inicial (ajuste cuadrático MRUA)
  uX0?: number;        // Incertidumbre de x0
  uV0?: number;        // Incertidumbre de v0
  a?: number;          // Aceleración (solo en ajuste cuadrático MRUA)
  uA?: number;         // Incertidumbre de la aceleración
  r2: number;          // Coeficiente de determinación
  sRes: number;        // Desviación estándar de los residuos
  chi2Red: number;     // Chi cuadrado reducido
  df: number;          // Grados de libertad
  originalData: DataPoint[];
  linearData: LinearDataPoint[];
  residualData: ResidualDataPoint[];
  residuals: number[];
  labelX: string;
  labelY: string;
  x: number[];
  y: number[];
  xLin: number[];
  yLin: number[];
  ajusteType: AdjustmentType;
  normalityTest?: NormalityTest;
  physicalInterpretation?: string;
  motionType?: 'MRU' | 'MRUA';
  kinematicVariable?: 'x-t' | 'v-t' | 'a-t';
}

export interface LinearDataPoint {
  x: number;
  y: number;
  yFit: number;
}

export interface ResidualDataPoint {
  x: number;
  residual: number;
}

export type AdjustmentType = 'lineal' | 'potencial' | 'exponencial';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface FileUploadData {
  name: string;
  size: number;
  type: string;
  data: DataPoint[];
}

export interface ChartConfiguration {
  title: string;
  xLabel: string;
  yLabel: string;
  showGrid: boolean;
  showLegend: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface StatisticalSummary {
  count: number;
  mean: number;
  std: number;
  min: number;
  max: number;
  q1: number;
  median: number;
  q3: number;
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeCharts: boolean;
  includeStatistics: boolean;
  includeRawData: boolean;
}