'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Eye, AlertCircle, CheckCircle, Database, BarChart3, LineChart } from 'lucide-react';
import { AnalysisResult, AdjustmentType } from '@/types';
import { analysisService, healthService } from '@/services/api';
import DataInput from '@/components/DataInput';
import ResultsDisplay from '@/components/ResultsDisplay';
import Charts from '@/components/Charts';
import PrivacyModal from '@/components/PrivacyModal';

type TabType = 'input' | 'results' | 'graphs';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>('input');
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string>('');
  const [visits, setVisits] = useState(0);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [serverStatus, setServerStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');

  // Initialize privacy and visits
  useEffect(() => {
    const savedVisits = parseInt(localStorage.getItem('metrologiaVisits') || '0');
    const newVisits = savedVisits + 1;
    setVisits(newVisits);
    localStorage.setItem('metrologiaVisits', newVisits.toString());

    const policyAccepted = localStorage.getItem('policyAccepted') === 'true';
    setAcceptedPolicy(policyAccepted);
    
    if (!policyAccepted) {
      setShowPrivacy(true);
    }

    // Check server status
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    try {
      const isOnline = await healthService.checkHealth();
      setServerStatus(isOnline ? 'online' : 'offline');
    } catch (error) {
      setServerStatus('offline');
    }
  };

  const handleAnalysis = useCallback(async (data: {
    xData: number[];
    yData: number[];
    uxData?: number[];
    uyData?: number[];
    adjustmentType: AdjustmentType;
    motionType?: 'MRU' | 'MRUA';
    kinematicVariable?: 'x-t' | 'v-t' | 'a-t';
  }) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await analysisService.performAnalysis(
        data.xData,
        data.yData,
        data.uxData,
        data.uyData,
        data.adjustmentType,
        data.motionType,
        data.kinematicVariable
      );

      setResults(result);
      setActiveTab('results');
    } catch (err) {
      console.error('Error in analysis:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido en el análisis');
      
      // Si el servidor no está disponible, mostrar análisis offline
      if (err instanceof Error && err.message.includes('conectar')) {
        handleOfflineAnalysis(data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleOfflineAnalysis = (data: {
    xData: number[];
    yData: number[];
    uxData?: number[];
    uyData?: number[];
    adjustmentType: AdjustmentType;
  }) => {
    // Implementación básica offline del análisis
    const { xData, yData, uxData, uyData, adjustmentType } = data;
    
    // Calcular incertidumbres si no están proporcionadas
    const ux = uxData || xData.map(() => Math.sqrt(xData.reduce((a,b) => a + b*b, 0) / xData.length) / Math.sqrt(xData.length) * 0.1);
    const uy = uyData || yData.map(() => Math.sqrt(yData.reduce((a,b) => a + b*b, 0) / yData.length) / Math.sqrt(yData.length) * 0.1);

    // Linearización básica
    let xLin = xData;
    let yLin = yData;
    let labelX = 'x';
    let labelY = 'y';

    if (adjustmentType === 'potencial') {
      xLin = xData.map(v => Math.log(v));
      yLin = yData.map(v => Math.log(v));
      labelX = 'ln(x)';
      labelY = 'ln(y)';
    } else if (adjustmentType === 'exponencial') {
      yLin = yData.map(v => Math.log(v));
      labelY = 'ln(y)';
    }

    // Ajuste lineal simple
    const n = xLin.length;
    const sumX = xLin.reduce((a, b) => a + b, 0);
    const sumY = yLin.reduce((a, b) => a + b, 0);
    const sumXY = xLin.reduce((sum, x, i) => sum + x * yLin[i], 0);
    const sumXX = xLin.reduce((sum, x) => sum + x * x, 0);

    const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const b = (sumY - m * sumX) / n;

    // Estadísticas básicas
    const yFit = xLin.map(x => m * x + b);
    const residuals = yLin.map((y, i) => y - yFit[i]);
    const ssRes = residuals.reduce((sum, r) => sum + r * r, 0);
    const yMean = yLin.reduce((a, b) => a + b, 0) / yLin.length;
    const ssTot = yLin.reduce((sum, y) => sum + (y - yMean) * (y - yMean), 0);
    const r2 = Math.max(0, 1 - ssRes / ssTot);
    const df = n - 2;
    const sRes = Math.sqrt(ssRes / df);

    const offlineResult: AnalysisResult = {
      m,
      b,
      uM: Math.sqrt(1 / (sumXX - sumX * sumX / n)) * sRes,
      uB: Math.sqrt((1/n + sumX*sumX/(n*(sumXX - sumX*sumX/n)))) * sRes,
      r2,
      sRes,
      chi2Red: ssRes / df,
      df,
      originalData: xData.map((x, i) => ({ x, y: yData[i], ux: ux[i], uy: uy[i] })),
      linearData: xLin.map((x, i) => ({ x, y: yLin[i], yFit: yFit[i] })),
      residualData: xLin.map((x, i) => ({ x, residual: residuals[i] })),
      residuals,
      labelX,
      labelY,
      x: xData,
      y: yData,
      xLin,
      yLin,
      ajusteType: adjustmentType,
    };

    setResults(offlineResult);
    setActiveTab('results');
    setError('Análisis realizado en modo offline (servidor no disponible)');
  };

  const handleExportPDF = useCallback(async () => {
    if (!results) return;

    setIsExporting(true);
    try {
      const blob = await analysisService.generatePDF(results);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Reporte_Metrologico_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      setError('Error al generar el PDF. Intente nuevamente.');
    } finally {
      setIsExporting(false);
    }
  }, [results]);

  const handleExportExcel = useCallback(async () => {
    if (!results) return;

    setIsExporting(true);
    try {
      const blob = await analysisService.exportToExcel(results);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Datos_Metrologicos_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting Excel:', err);
      setError('Error al generar el archivo Excel. Intente nuevamente.');
    } finally {
      setIsExporting(false);
    }
  }, [results]);

  const acceptPolicy = useCallback(() => {
    localStorage.setItem('policyAccepted', 'true');
    setAcceptedPolicy(true);
    setShowPrivacy(false);
  }, []);

  if (showPrivacy) {
    return <PrivacyModal onAccept={acceptPolicy} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Modern Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <TrendingUp className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Análisis Metrológico</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Sistema Avanzado de Ajuste y Linearización</p>
              </div>
            </div>
            
            {/* Status and Info */}
            <div className="flex items-center space-x-3 sm:space-x-6">
              {/* Server Status */}
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                serverStatus === 'online' ? 'bg-green-100 text-green-700' :
                serverStatus === 'offline' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {serverStatus === 'online' && <CheckCircle size={14} />}
                {serverStatus === 'offline' && <AlertCircle size={14} />}
                {serverStatus === 'unknown' && <AlertCircle size={14} />}
                <span className="hidden sm:inline">
                  {serverStatus === 'online' ? 'Online' :
                   serverStatus === 'offline' ? 'Offline' :
                   'Conectando...'}
                </span>
              </div>

              {/* Visits Counter */}
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-full">
                <Eye size={14} className="text-gray-600" />
                <span className="text-xs font-medium text-gray-700">{visits} visitas</span>
              </div>
              
              {/* Privacy Policy Link */}
              <button 
                onClick={() => setShowPrivacy(true)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors hidden sm:block"
              >
                Privacidad
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className={`p-4 rounded-lg flex items-start space-x-3 ${
            error.includes('offline') || error.includes('servidor') 
              ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <span className="flex-1 text-sm font-medium">{error}</span>
            <button 
              onClick={() => setError('')}
              className="text-2xl leading-none hover:opacity-75 text-gray-500"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Modern Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-1 mb-6 inline-flex space-x-1">
          <button
            onClick={() => setActiveTab('input')}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-md font-medium transition-all text-sm ${
              activeTab === 'input'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Database size={18} />
            <span>Entrada de Datos</span>
          </button>
          
          <button
            onClick={() => setActiveTab('results')}
            disabled={!results}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-md font-medium transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
              activeTab === 'results'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <BarChart3 size={18} />
            <span>Resultados</span>
          </button>
          
          <button
            onClick={() => setActiveTab('graphs')}
            disabled={!results}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-md font-medium transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
              activeTab === 'graphs'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <LineChart size={18} />
            <span>Gráficas</span>
          </button>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 min-h-[600px]">
          {activeTab === 'input' && (
            <DataInput 
              onDataChange={handleAnalysis} 
              isLoading={isLoading}
            />
          )}

          {activeTab === 'results' && results && (
            <ResultsDisplay
              results={results}
              onExportPDF={handleExportPDF}
              onExportExcel={handleExportExcel}
              isExporting={isExporting}
            />
          )}

          {activeTab === 'graphs' && results && (
            <Charts results={results} />
          )}

          {!results && activeTab !== 'input' && (
            <div className="text-center py-16">
              <TrendingUp size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">Primero realiza un análisis para ver los resultados</p>
            </div>
          )}
        </div>
      </main>

      {/* Modern Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-white" size={18} />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">Sistema de Análisis Metrológico</p>
                <p className="text-xs text-gray-500">J. Javier de la Ossa</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center md:items-end space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Físico</span> • Web Development • Data Analytics
              </p>
              <p className="text-xs text-gray-400">
                © {new Date().getFullYear()} Todos los derechos reservados
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}