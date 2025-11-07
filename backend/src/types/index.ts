// Types for the metrological analysis system

export interface DataPoint {
  x: number;
  y: number;
  ux?: number;
  uy?: number;
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
export type MotionType = 'MRU' | 'MRUA';
export type KinematicVariable = 'x-t' | 'v-t' | 'a-t';

export interface AnalysisRequest {
  xData: number[];
  yData: number[];
  uxData?: number[];
  uyData?: number[];
  adjustmentType: AdjustmentType;
  motionType?: MotionType;
  kinematicVariable?: KinematicVariable;
}

export interface NormalityTest {
  testName: string;
  statistic: number;
  isNormal: boolean;
  skewness: number;
  kurtosis: number;
  interpretation: string;
}

export interface AnalysisResult {
  m?: number;          // Slope (linear fit) or initial velocity in linearized fit
  b?: number;          // Y-intercept (linear fit) or initial position in linearized fit
  uM?: number;         // Uncertainty in slope
  uB?: number;         // Uncertainty in y-intercept
  x0?: number;         // Initial position (quadratic MRUA fit)
  v0?: number;         // Initial velocity (quadratic MRUA fit)
  uX0?: number;        // Uncertainty in x0
  uV0?: number;        // Uncertainty in v0
  a?: number;          // Acceleration (only in quadratic MRUA fit)
  uA?: number;         // Uncertainty in acceleration
  r2: number;          // Coefficient of determination
  sRes: number;        // Standard deviation of residuals
  chi2Red: number;     // Reduced chi-squared
  df: number;          // Degrees of freedom
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
  motionType?: MotionType;
  kinematicVariable?: KinematicVariable;
  normalityTest?: NormalityTest;
  physicalInterpretation?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface ValidationError {
  field: string;
  message: string;
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

export interface ProcessedFile {
  filename: string;
  size: number;
  type: string;
  data: DataPoint[];
  summary?: {
    totalPoints: number;
    validPoints: number;
    errors: string[];
  };
}