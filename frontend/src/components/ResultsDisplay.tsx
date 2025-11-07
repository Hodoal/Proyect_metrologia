'use client';

import React from 'react';
import { Download, TrendingUp, Calculator, FileText, Target, BarChart, CheckCircle, AlertTriangle } from 'lucide-react';
import { AnalysisResult } from '@/types';

interface ResultsDisplayProps {
  results: AnalysisResult;
  onExportPDF: () => void;
  onExportExcel: () => void;
  isExporting: boolean;
}

export default function ResultsDisplay({ 
  results, 
  onExportPDF, 
  onExportExcel, 
  isExporting 
}: ResultsDisplayProps) {
  const formatNumber = (num: number | undefined, precision = 6): string => {
    if (num === undefined || num === null || isNaN(num)) {
      return 'N/A';
    }
    if (Math.abs(num) < 0.001 || Math.abs(num) > 1000) {
      return num.toExponential(precision);
    }
    return num.toFixed(precision);
  };

  const getAdjustmentEquation = (): string => {
    switch (results.ajusteType) {
      case 'lineal':
        return `y = (${formatNumber(results.m, 4)} ± ${formatNumber(results.uM, 4)})x + (${formatNumber(results.b, 4)} ± ${formatNumber(results.uB, 4)})`;
      case 'potencial':
        return `y = A·x^n donde ln(A) = ${formatNumber(results.b, 4)}, n = ${formatNumber(results.m, 4)}`;
      case 'exponencial':
        return `y = A·e^(bx) donde ln(A) = ${formatNumber(results.b, 4)}, b = ${formatNumber(results.m, 4)}`;
      default:
        return '';
    }
  };

  const getQualityDescription = (r2: number): { text: string; color: string } => {
    if (r2 > 0.99) return { text: 'Excelente', color: 'text-green-600' };
    if (r2 > 0.95) return { text: 'Muy Buena', color: 'text-blue-600' };
    if (r2 > 0.90) return { text: 'Buena', color: 'text-yellow-600' };
    if (r2 > 0.80) return { text: 'Aceptable', color: 'text-orange-600' };
    return { text: 'Pobre', color: 'text-red-600' };
  };

  const quality = getQualityDescription(results.r2);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Resultados del Análisis</h2>
        <div className="flex space-x-3">
          <button
            onClick={onExportPDF}
            disabled={isExporting}
            className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={20} />
            <span>PDF</span>
          </button>
          <button
            onClick={onExportExcel}
            disabled={isExporting}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText size={20} />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Equation Display */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
          <Calculator className="mr-2" size={24} />
          Ecuación del Ajuste
        </h3>
        <div className="bg-white rounded-lg p-4 font-mono text-lg text-center border">
          {getAdjustmentEquation()}
        </div>
        <div className="mt-3 flex justify-between text-sm text-blue-800">
          <span>R² = {formatNumber(results.r2, 6)}</span>
          <span className={`font-semibold ${quality.color}`}>
            Calidad: {quality.text}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={`grid gap-4 ${results.a !== undefined ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Coef. Determinación</span>
            <TrendingUp size={24} className="opacity-75" />
          </div>
          <p className="text-3xl font-bold">{formatNumber(results.r2, 6)}</p>
          <p className="text-xs mt-2 opacity-75">Bondad del ajuste</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">
              {results.a !== undefined ? 'Posición inicial (x₀)' : 'Pendiente (m)'}
            </span>
            <Calculator size={24} className="opacity-75" />
          </div>
          <p className="text-2xl font-bold">{formatNumber(results.b, 4)}</p>
          <p className="text-xs mt-2 opacity-75">± {formatNumber(results.uB, 4)}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">
              {results.a !== undefined ? 'Velocidad inicial (v₀)' : 'Ordenada (b)'}
            </span>
            <FileText size={24} className="opacity-75" />
          </div>
          <p className="text-2xl font-bold">{formatNumber(results.m, 4)}</p>
          <p className="text-xs mt-2 opacity-75">± {formatNumber(results.uM, 4)}</p>
        </div>

        {results.a !== undefined && (
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">Aceleración (a)</span>
              <TrendingUp size={24} className="opacity-75" />
            </div>
            <p className="text-2xl font-bold">{formatNumber(results.a, 4)}</p>
            <p className="text-xs mt-2 opacity-75">± {formatNumber(results.uA, 4)}</p>
          </div>
        )}
      </div>

      {/* Detailed Statistics */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center">
          <TrendingUp className="mr-2" size={24} />
          Estadísticas Detalladas
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border">
            <div className="text-sm font-semibold text-gray-700 mb-1">Puntos de datos</div>
            <div className="text-2xl font-bold text-gray-900">{results.x.length}</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <div className="text-sm font-semibold text-gray-700 mb-1">Grados de libertad</div>
            <div className="text-2xl font-bold text-gray-900">{results.df}</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <div className="text-sm font-semibold text-gray-700 mb-1">χ² reducido</div>
            <div className="text-xl font-bold text-gray-900">{formatNumber(results.chi2Red, 4)}</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <div className="text-sm font-semibold text-gray-700 mb-1">σ residuos</div>
            <div className="text-xl font-bold text-gray-900">{formatNumber(results.sRes, 4)}</div>
          </div>
        </div>
      </div>

      {/* Uncertainty Analysis */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200">
        <h3 className="text-lg font-bold text-amber-900 mb-4">Análisis de Incertidumbres</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Incertidumbre Relativa</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Pendiente:</span>
                <span className="font-mono">
                  {(results.uM && results.m) ? ((Math.abs(results.uM / results.m) * 100)).toFixed(2) : 'N/A'}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Ordenada:</span>
                <span className="font-mono">
                  {(results.b && results.uB && results.b !== 0) ? ((Math.abs(results.uB / results.b) * 100)).toFixed(2) : 'N/A'}%
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Intervalos de Confianza (68%)</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="block text-gray-600">Pendiente:</span>
                <span className="font-mono text-xs">
                  {(results.m !== undefined && results.uM !== undefined) 
                    ? `[${formatNumber(results.m - results.uM, 4)}, ${formatNumber(results.m + results.uM, 4)}]`
                    : 'N/A'}
                </span>
              </div>
              <div>
                <span className="block text-gray-600">Ordenada:</span>
                <span className="font-mono text-xs">
                  {(results.b !== undefined && results.uB !== undefined)
                    ? `[${formatNumber(results.b - results.uB, 4)}, ${formatNumber(results.b + results.uB, 4)}]`
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Physical Interpretation (if available) */}
      {results.physicalInterpretation && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border-l-4 border-purple-500">
          <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Interpretación Física (Cinemática)
          </h3>
          <div className="bg-white rounded-lg p-4 text-gray-800 whitespace-pre-line leading-relaxed">
            {results.physicalInterpretation}
          </div>
        </div>
      )}

      {/* Normality Test (if available) */}
      {results.normalityTest && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-l-4 border-green-500">
          <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center gap-2">
            <BarChart className="w-5 h-5" />
            Test de Normalidad (Jarque-Bera)
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold">Estadístico JB:</span>
                  <span className="font-mono">{formatNumber(results.normalityTest.jbStatistic, 4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Valor crítico (α=0.05):</span>
                  <span className="font-mono">{formatNumber(results.normalityTest.criticalValue, 4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Asimetría:</span>
                  <span className="font-mono">{formatNumber(results.normalityTest.skewness, 4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Curtosis:</span>
                  <span className="font-mono">{formatNumber(results.normalityTest.kurtosis, 4)}</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="mb-2">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                  results.normalityTest.isNormal 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {results.normalityTest.isNormal 
                    ? <><CheckCircle className="w-4 h-4" /> Distribución Normal</> 
                    : <><AlertTriangle className="w-4 h-4" /> No Normal</>
                  }
                </span>
              </div>
              <p className="text-sm text-gray-700 mt-3">
                {results.normalityTest.interpretation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interpretation */}
      <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500">
        <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Interpretación Estadística
        </h3>
        
        <div className="prose prose-blue max-w-none">
          <p className="text-blue-800 mb-3">
            El ajuste presenta una calidad <strong className={quality.color}>{quality.text.toLowerCase()}</strong> con 
            R² = {formatNumber(results.r2, 4)}.
          </p>
          
          <ul className="text-blue-800 text-sm space-y-1">
            <li>
              La incertidumbre relativa de la pendiente es del {(results.uM && results.m) ? ((Math.abs(results.uM / results.m) * 100)).toFixed(2) : 'N/A'}%.
            </li>
            <li>
              El χ² reducido de {formatNumber(results.chi2Red, 4)} {results.chi2Red < 1.2 ? 'indica un buen ajuste' : 'sugiere revisar el modelo o las incertidumbres'}.
            </li>
            <li>
              Se analizaron {results.x.length} puntos experimentales con {results.df} grados de libertad.
            </li>
          </ul>
        </div>
      </div>

      {isExporting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex items-center space-x-4">
            <div className="loading-dots">
              <div></div><div></div><div></div><div></div>
            </div>
            <span className="text-lg font-semibold">Generando reporte...</span>
          </div>
        </div>
      )}
    </div>
  );
}