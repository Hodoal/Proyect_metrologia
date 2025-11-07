import axios from 'axios';
import { AnalysisResult, DataPoint, AdjustmentType, ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptores para manejo de errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response?.status === 500) {
      throw new Error('Error interno del servidor. Intente nuevamente.');
    }
    if (error.response?.status === 404) {
      throw new Error('Servicio no encontrado.');
    }
    if (error.code === 'ECONNREFUSED') {
      throw new Error('No se puede conectar al servidor. Verifique que esté ejecutándose.');
    }
    throw error;
  }
);

export const analysisService = {
  /**
   * Realizar análisis metrológico
   */
  async performAnalysis(
    xData: number[],
    yData: number[],
    uxData?: number[],
    uyData?: number[],
    adjustmentType: AdjustmentType = 'lineal',
    motionType?: 'MRU' | 'MRUA',
    kinematicVariable?: 'x-t' | 'v-t' | 'a-t'
  ): Promise<AnalysisResult> {
    try {
      const response = await apiClient.post<ApiResponse<AnalysisResult>>('/analysis', {
        xData,
        yData,
        uxData,
        uyData,
        adjustmentType,
        motionType,
        kinematicVariable,
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Error en el análisis');
      }

      return response.data.data!;
    } catch (error) {
      console.error('Error en performAnalysis:', error);
      throw error;
    }
  },

  /**
   * Generar reporte PDF
   */
  async generatePDF(analysisResult: AnalysisResult): Promise<Blob> {
    try {
      const response = await apiClient.post('/export/pdf', analysisResult, {
        responseType: 'blob',
      });

      return new Blob([response.data], { type: 'application/pdf' });
    } catch (error) {
      console.error('Error en generatePDF:', error);
      throw error;
    }
  },

  /**
   * Exportar datos a Excel
   */
  async exportToExcel(analysisResult: AnalysisResult): Promise<Blob> {
    try {
      const response = await apiClient.post('/export/excel', analysisResult, {
        responseType: 'blob',
      });

      return new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
    } catch (error) {
      console.error('Error en exportToExcel:', error);
      throw error;
    }
  },

  /**
   * Validar datos de entrada
   */
  async validateData(data: DataPoint[]): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const response = await apiClient.post<ApiResponse<{ valid: boolean; errors: string[] }>>('/validate', {
        data,
      });

      return response.data.data!;
    } catch (error) {
      console.error('Error en validateData:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas descriptivas
   */
  async getStatistics(data: number[]): Promise<any> {
    try {
      const response = await apiClient.post<ApiResponse<any>>('/statistics', {
        data,
      });

      return response.data.data!;
    } catch (error) {
      console.error('Error en getStatistics:', error);
      throw error;
    }
  },
};

export const fileService = {
  /**
   * Procesar archivo CSV/Excel
   */
  async processFile(file: File): Promise<DataPoint[]> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post<ApiResponse<DataPoint[]>>('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al procesar archivo');
      }

      return response.data.data!;
    } catch (error) {
      console.error('Error en processFile:', error);
      throw error;
    }
  },
};

export const healthService = {
  /**
   * Verificar estado del servidor
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await apiClient.get('/health');
      return response.data.success;
    } catch (error) {
      return false;
    }
  },
};

export default apiClient;