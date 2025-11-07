'use client';

import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from 'recharts';
import { AnalysisResult } from '@/types';
import { Activity, BarChart3, LineChart as LineChartIcon, Settings } from 'lucide-react';

interface ChartsProps {
  results: AnalysisResult;
}

export default function Charts({ results }: ChartsProps) {
  const [showGrid, setShowGrid] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [activeChart, setActiveChart] = useState<'original' | 'linear' | 'residuals'>('original');

  const formatTooltipValue = (value: number, name: string) => {
    if (value === undefined || value === null || isNaN(value)) {
      return ['N/A', name];
    }
    if (Math.abs(value) < 0.001 || Math.abs(value) > 1000) {
      return [value.toExponential(4), name];
    }
    return [value.toFixed(6), name];
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-gray-800">{`X: ${formatTooltipValue(label, '')[0]}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${formatTooltipValue(entry.value, '')[0]}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const chartTabs = [
    { id: 'original', label: 'Datos Originales', icon: BarChart3 },
    { id: 'linear', label: 'Linearización', icon: LineChartIcon },
    { id: 'residuals', label: 'Residuos', icon: Activity },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Visualización de Datos</h2>
        
        {/* Chart Controls */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
            <Settings size={18} className="text-gray-600" />
            <label className="flex items-center space-x-1">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Grid</span>
            </label>
            <label className="flex items-center space-x-1">
              <input
                type="checkbox"
                checked={showLegend}
                onChange={(e) => setShowLegend(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Leyenda</span>
            </label>
          </div>
        </div>
      </div>

      {/* Chart Tabs */}
      <div className="flex space-x-2 mb-4">
        {chartTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveChart(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeChart === tab.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Chart Display */}
      <div className="bg-white rounded-xl p-6 shadow-lg border">
        {activeChart === 'original' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <BarChart3 className="mr-2" size={24} />
              Datos Experimentales Originales
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 40 }}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />}
                <XAxis 
                  dataKey="x" 
                  type="number" 
                  name="X" 
                  domain={['dataMin - 0.5', 'dataMax + 0.5']}
                  tick={{ fontSize: 12 }}
                  label={{ value: 'X', position: 'bottom' }}
                />
                <YAxis 
                  dataKey="y" 
                  type="number" 
                  name="Y" 
                  domain={['dataMin - 0.5', 'dataMax + 0.5']}
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Y', angle: -90, position: 'left' }}
                />
                <Tooltip content={<CustomTooltip />} />
                {showLegend && <Legend />}
                <Scatter 
                  name="Datos Experimentales" 
                  data={results.originalData} 
                  fill="#3b82f6"
                  strokeWidth={2}
                  stroke="#1d4ed8"
                />
              </ScatterChart>
            </ResponsiveContainer>
            
            <div className="mt-4 bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
              <p className="text-sm text-blue-800">
                <strong>Datos originales:</strong> {results.originalData.length} puntos experimentales. 
                Los datos muestran la relación directa entre las variables X e Y antes de cualquier transformación.
              </p>
            </div>
          </div>
        )}

        {activeChart === 'linear' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <LineChartIcon className="mr-2" size={24} />
              Linearización y Ajuste por Mínimos Cuadrados
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={results.linearData} margin={{ top: 20, right: 30, bottom: 40, left: 40 }}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />}
                <XAxis 
                  dataKey="x" 
                  tick={{ fontSize: 12 }}
                  label={{ value: results.labelX, position: 'bottom' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  label={{ value: results.labelY, angle: -90, position: 'left' }}
                />
                <Tooltip content={<CustomTooltip />} />
                {showLegend && <Legend />}
                <Scatter 
                  name="Datos Linearizados" 
                  dataKey="y" 
                  fill="#ef4444" 
                  strokeWidth={2}
                  stroke="#dc2626"
                />
                <Line 
                  name="Ajuste Lineal" 
                  dataKey="yFit" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={false}
                  strokeDasharray="none"
                />
              </LineChart>
            </ResponsiveContainer>
            
            <div className="mt-4 space-y-3">
              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                <p className="text-sm text-green-800 font-mono">
                  <strong>Ecuación:</strong> y = ({(results.m || 0).toFixed(6)} ± {(results.uM || 0).toFixed(6)})x + ({(results.b || 0).toFixed(6)} ± {(results.uB || 0).toFixed(6)})
                </p>
                <p className="text-xs text-green-700 mt-1">
                  R² = {(results.r2 || 0).toFixed(6)} | χ² reducido = {(results.chi2Red || 0).toFixed(6)}
                </p>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
                <p className="text-sm text-yellow-800">
                  <strong>Interpretación:</strong> La línea verde representa el mejor ajuste por mínimos cuadrados ponderados. 
                  Los puntos rojos muestran los datos después de la transformación para linearización del tipo "{results.ajusteType}".
                </p>
              </div>
            </div>
          </div>
        )}

        {activeChart === 'residuals' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <Activity className="mr-2" size={24} />
              Análisis de Residuos
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 40 }}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />}
                <XAxis 
                  dataKey="x" 
                  type="number" 
                  name="X" 
                  tick={{ fontSize: 12 }}
                  label={{ value: results.labelX, position: 'bottom' }}
                />
                <YAxis 
                  dataKey="residual" 
                  type="number" 
                  name="Residuo" 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Residuos', angle: -90, position: 'left' }}
                />
                <Tooltip content={<CustomTooltip />} />
                {showLegend && <Legend />}
                {/* Línea de referencia en y=0 */}
                <Line 
                  data={results.residualData.map(p => ({ ...p, zero: 0 }))} 
                  dataKey="zero" 
                  stroke="#6b7280" 
                  strokeWidth={1} 
                  strokeDasharray="5 5" 
                  dot={false}
                  name="Referencia (y=0)"
                />
                <Scatter 
                  name="Residuos" 
                  data={results.residualData} 
                  fill="#8b5cf6"
                  strokeWidth={2}
                  stroke="#7c3aed"
                />
              </ScatterChart>
            </ResponsiveContainer>
            
            <div className="mt-4 space-y-3">
              <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                <p className="text-sm text-purple-800">
                  <strong>Análisis de residuos:</strong> Los residuos representan la diferencia entre los valores observados y los predichos por el modelo.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Estadísticas de Residuos</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Desv. estándar:</span>
                      <span className="font-mono">{results.sRes.toExponential(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mín:</span>
                      <span className="font-mono">{Math.min(...results.residuals).toExponential(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Máx:</span>
                      <span className="font-mono">{Math.max(...results.residuals).toExponential(4)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Interpretación</h4>
                  <div className="text-sm text-gray-700">
                    {results.chi2Red < 1.2 ? (
                      <p className="text-green-700">✓ Los residuos sugieren un buen ajuste del modelo.</p>
                    ) : (
                      <p className="text-amber-700">⚠ Los residuos sugieren revisar el modelo o las incertidumbres.</p>
                    )}
                    <p className="mt-1">
                      Una distribución aleatoria alrededor de cero indica un modelo apropiado.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}