'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Upload, FileText, AlertCircle, X, Download, Trash2 } from 'lucide-react';
import { DataPoint, AdjustmentType } from '@/types';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface DataInputProps {
  onDataChange: (data: {
    xData: number[];
    yData: number[];
    uxData?: number[];
    uyData?: number[];
    adjustmentType: AdjustmentType;
    motionType?: 'MRU' | 'MRUA';
    kinematicVariable?: 'x-t' | 'v-t' | 'a-t';
  }) => void;
  isLoading: boolean;
}

// Valores por defecto
const DEFAULT_X_DATA = '0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0';
const DEFAULT_Y_DATA = '0.5, 2.3, 4.1, 6.2, 8.0, 10.1, 12.3, 14.2, 16.1, 18.0, 20.2';

export default function DataInput({ onDataChange, isLoading }: DataInputProps) {
  // Cargar datos desde localStorage o usar valores por defecto
  const [xData, setXData] = useState('');
  const [yData, setYData] = useState('');
  const [uxData, setUxData] = useState('');
  const [uyData, setUyData] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('lineal');
  const [motionType, setMotionType] = useState<'MRU' | 'MRUA'>('MRU');
  const [kinematicVariable, setKinematicVariable] = useState<'x-t' | 'v-t' | 'a-t'>('x-t');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<DataPoint[] | null>(null);
  const [error, setError] = useState<string>('');

  // Cargar datos persistidos al montar el componente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = {
        xData: localStorage.getItem('metrologia_xData') || DEFAULT_X_DATA,
        yData: localStorage.getItem('metrologia_yData') || DEFAULT_Y_DATA,
        uxData: localStorage.getItem('metrologia_uxData') || '',
        uyData: localStorage.getItem('metrologia_uyData') || '',
        adjustmentType: (localStorage.getItem('metrologia_adjustmentType') as AdjustmentType) || 'lineal',
        motionType: (localStorage.getItem('metrologia_motionType') as 'MRU' | 'MRUA') || 'MRU',
        kinematicVariable: (localStorage.getItem('metrologia_kinematicVariable') as 'x-t' | 'v-t' | 'a-t') || 'x-t',
      };

      setXData(savedData.xData);
      setYData(savedData.yData);
      setUxData(savedData.uxData);
      setUyData(savedData.uyData);
      setAdjustmentType(savedData.adjustmentType);
      setMotionType(savedData.motionType);
      setKinematicVariable(savedData.kinematicVariable);
    }
  }, []);

  // Guardar datos en localStorage cada vez que cambien
  useEffect(() => {
    if (typeof window !== 'undefined' && xData) {
      localStorage.setItem('metrologia_xData', xData);
    }
  }, [xData]);

  useEffect(() => {
    if (typeof window !== 'undefined' && yData) {
      localStorage.setItem('metrologia_yData', yData);
    }
  }, [yData]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('metrologia_uxData', uxData);
    }
  }, [uxData]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('metrologia_uyData', uyData);
    }
  }, [uyData]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('metrologia_adjustmentType', adjustmentType);
    }
  }, [adjustmentType]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('metrologia_motionType', motionType);
    }
  }, [motionType]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('metrologia_kinematicVariable', kinematicVariable);
    }
  }, [kinematicVariable]);

  const parseData = useCallback((str: string): number[] => {
    try {
      return str.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
    } catch {
      return [];
    }
  }, []);

  const validateData = useCallback(() => {
    const x = parseData(xData);
    const y = parseData(yData);
    
    if (x.length < 3) {
      throw new Error('Necesitas al menos 3 puntos de datos');
    }
    
    if (y.length !== x.length) {
      throw new Error('X e Y deben tener la misma cantidad de valores');
    }

    const ux = uxData ? parseData(uxData) : undefined;
    const uy = uyData ? parseData(uyData) : undefined;

    if (ux && ux.length !== x.length) {
      throw new Error('Las incertidumbres de X deben tener la misma cantidad de valores que X');
    }

    if (uy && uy.length !== x.length) {
      throw new Error('Las incertidumbres de Y deben tener la misma cantidad de valores que Y');
    }

    return { x, y, ux, uy };
  }, [xData, yData, uxData, uyData, parseData]);

  const handleAnalyze = useCallback(() => {
    try {
      setError('');
      const { x, y, ux, uy } = validateData();
      
      onDataChange({
        xData: x,
        yData: y,
        uxData: ux,
        uyData: uy,
        adjustmentType,
        motionType,
        kinematicVariable,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  }, [validateData, adjustmentType, motionType, kinematicVariable, onDataChange]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setUploadedFile(file);

    try {
      let data: DataPoint[] = [];

      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        // Procesar CSV
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsedData = results.data as any[];
            data = parsedData.map((row, index) => {
              const point: DataPoint = {
                x: parseFloat(row.X || row.x || row['0'] || row[Object.keys(row)[0]]),
                y: parseFloat(row.Y || row.y || row['1'] || row[Object.keys(row)[1]]),
              };

              if (row.ux || row.UX || row['2']) {
                point.ux = parseFloat(row.ux || row.UX || row['2']);
              }

              if (row.uy || row.UY || row['3']) {
                point.uy = parseFloat(row.uy || row.UY || row['3']);
              }

              return point;
            }).filter(point => !isNaN(point.x) && !isNaN(point.y));

            setFileData(data);
            populateFieldsFromData(data);
          },
          error: (error) => {
            setError(`Error al procesar CSV: ${error.message}`);
          }
        });
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // Procesar Excel
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        data = (jsonData as any[]).map((row) => {
          const keys = Object.keys(row);
          const point: DataPoint = {
            x: parseFloat(row[keys[0]]),
            y: parseFloat(row[keys[1]]),
          };

          if (keys[2] && row[keys[2]]) {
            point.ux = parseFloat(row[keys[2]]);
          }

          if (keys[3] && row[keys[3]]) {
            point.uy = parseFloat(row[keys[3]]);
          }

          return point;
        }).filter(point => !isNaN(point.x) && !isNaN(point.y));

        setFileData(data);
        populateFieldsFromData(data);
      } else {
        setError('Formato de archivo no soportado. Use CSV o Excel (.xlsx, .xls)');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el archivo');
    }
  }, []);

  const populateFieldsFromData = useCallback((data: DataPoint[]) => {
    setXData(data.map(p => p.x).join(', '));
    setYData(data.map(p => p.y).join(', '));
    
    if (data.some(p => p.ux !== undefined)) {
      setUxData(data.map(p => p.ux || '').join(', '));
    }
    
    if (data.some(p => p.uy !== undefined)) {
      setUyData(data.map(p => p.uy || '').join(', '));
    }
  }, []);

  const clearFile = useCallback(() => {
    setUploadedFile(null);
    setFileData(null);
    setError('');
  }, []);

  const clearAllData = useCallback(() => {
    if (typeof window !== 'undefined') {
      const confirmClear = window.confirm(
        '¿Estás seguro de que deseas borrar todos los datos guardados y restaurar los valores por defecto?'
      );
      
      if (confirmClear) {
        // Limpiar localStorage
        localStorage.removeItem('metrologia_xData');
        localStorage.removeItem('metrologia_yData');
        localStorage.removeItem('metrologia_uxData');
        localStorage.removeItem('metrologia_uyData');
        localStorage.removeItem('metrologia_adjustmentType');
        localStorage.removeItem('metrologia_motionType');
        localStorage.removeItem('metrologia_kinematicVariable');
        
        // Restaurar valores por defecto
        setXData(DEFAULT_X_DATA);
        setYData(DEFAULT_Y_DATA);
        setUxData('');
        setUyData('');
        setAdjustmentType('lineal');
        setMotionType('MRU');
        setKinematicVariable('x-t');
        setUploadedFile(null);
        setFileData(null);
        setError('');
        
        alert('✅ Todos los datos han sido borrados y restaurados a valores por defecto');
      }
    }
  }, []);

  const downloadTemplate = useCallback(() => {
    const templateData = [
      { X: 1.0, Y: 2.1, ux: 0.1, uy: 0.2 },
      { X: 2.0, Y: 4.2, ux: 0.1, uy: 0.2 },
      { X: 3.0, Y: 6.1, ux: 0.1, uy: 0.2 },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');
    XLSX.writeFile(wb, 'template_datos_metrologia.xlsx');
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Entrada de Datos</h2>
          <p className="text-gray-600">Ingrese sus datos experimentales manualmente o cargue un archivo</p>
        </div>
        <button
          onClick={clearAllData}
          className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all font-semibold shadow-lg"
          disabled={isLoading}
        >
          <Trash2 size={20} />
          <span>Borrar Todo</span>
        </button>
      </div>

      {/* Upload Section */}
      <div className="bg-blue-50 rounded-xl p-6 border-2 border-dashed border-blue-300">
        <div className="text-center">
          <Upload className="mx-auto text-blue-500 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Cargar Archivo de Datos</h3>
          <p className="text-blue-700 mb-4">Soporta archivos CSV y Excel (.xlsx, .xls)</p>
          
          <div className="flex justify-center gap-4 mb-4">
            <label className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 cursor-pointer transition-all font-semibold">
              <FileText className="inline mr-2" size={20} />
              Seleccionar Archivo
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            
            <button
              onClick={downloadTemplate}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all font-semibold"
            >
              <Download className="inline mr-2" size={20} />
              Descargar Template
            </button>
          </div>

          {uploadedFile && (
            <div className="bg-white rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="text-blue-500 mr-3" size={24} />
                <div className="text-left">
                  <p className="font-semibold text-gray-800">{uploadedFile.name}</p>
                  <p className="text-sm text-gray-600">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                    {fileData && ` • ${fileData.length} puntos`}
                  </p>
                </div>
              </div>
              <button
                onClick={clearFile}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Auto-save notification */}
      <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
        <p className="text-sm text-green-800">
          💾 <strong>Autoguardado activado:</strong> Tus datos se guardan automáticamente mientras escribes. 
          Permanecerán disponibles incluso si cierras el navegador.
        </p>
      </div>

      {/* Manual Input */}
      {/* Kinematic Analysis Configuration */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border-2 border-purple-200 space-y-4">
        <h3 className="text-lg font-bold text-purple-900 mb-4">⚙️ Configuración de Análisis Cinemático</h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Tipo de Movimiento</label>
            <select
              value={motionType}
              onChange={(e) => setMotionType(e.target.value as 'MRU' | 'MRUA')}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none transition bg-white"
              disabled={isLoading}
            >
              <option value="MRU">MRU (Velocidad Constante)</option>
              <option value="MRUA">MRUA (Aceleración Constante)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Variable Cinemática</label>
            <select
              value={kinematicVariable}
              onChange={(e) => setKinematicVariable(e.target.value as 'x-t' | 'v-t' | 'a-t')}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none transition bg-white"
              disabled={isLoading}
            >
              <option value="x-t">Posición vs Tiempo (x-t)</option>
              <option value="v-t">Velocidad vs Tiempo (v-t)</option>
              <option value="a-t">Aceleración vs Tiempo (a-t)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Tipo de Ajuste</label>
            <select
              value={adjustmentType}
              onChange={(e) => setAdjustmentType(e.target.value as AdjustmentType)}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none transition bg-white"
              disabled={isLoading}
            >
              <option value="lineal">Lineal (y = mx + b)</option>
              <option value="potencial">Potencial (y = Ax^n)</option>
              <option value="exponencial">Exponencial (y = Ae^(bx))</option>
            </select>
          </div>
        </div>

        {/* Linearization Suggestions */}
        <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
          <p className="text-sm font-semibold text-purple-900 mb-2">💡 Sugerencia de Linealización:</p>
          <p className="text-sm text-gray-700">
            {motionType === 'MRU' && kinematicVariable === 'x-t' && (
              <>✅ <strong>Usa ajuste lineal:</strong> x = v·t + x₀ (velocidad constante en la pendiente)</>
            )}
            {motionType === 'MRU' && kinematicVariable === 'v-t' && (
              <>✅ <strong>Usa ajuste lineal:</strong> v = constante (pendiente ≈ 0 para MRU ideal)</>
            )}
            {motionType === 'MRUA' && kinematicVariable === 'v-t' && (
              <>✅ <strong>Usa ajuste lineal:</strong> v = a·t + v₀ (aceleración constante en la pendiente)</>
            )}
            {motionType === 'MRUA' && kinematicVariable === 'x-t' && adjustmentType === 'lineal' && (
              <>✅ <strong>Linealización automática activada:</strong> El sistema transformará automáticamente los datos a x vs t² para obtener: x = x₀ + (a/2)·t². La aceleración se calculará como a = 2×pendiente.</>
            )}
            {motionType === 'MRUA' && kinematicVariable === 'x-t' && adjustmentType === 'potencial' && (
              <>✅ <strong>Ajuste potencial correcto:</strong> Para MRUA, x ∝ t² con exponente n ≈ 2</>
            )}
            {motionType === 'MRUA' && kinematicVariable === 'a-t' && (
              <>✅ <strong>Usa ajuste lineal:</strong> a = constante (pendiente ≈ 0 para MRUA ideal)</>
            )}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Valores de X <span className="text-red-500">*</span>
          </label>
          <textarea
            value={xData}
            onChange={(e) => setXData(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition font-mono text-sm"
            rows={3}
            placeholder="1.0, 2.0, 3.0, ..."
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Valores de Y <span className="text-red-500">*</span>
          </label>
          <textarea
            value={yData}
            onChange={(e) => setYData(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition font-mono text-sm"
            rows={3}
            placeholder="2.1, 4.2, 6.1, ..."
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
        <p className="text-sm font-semibold text-blue-900 mb-3">Incertidumbres (Opcional)</p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-blue-800 mb-1">u(X)</label>
            <input
              value={uxData}
              onChange={(e) => setUxData(e.target.value)}
              className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none transition font-mono text-sm"
              placeholder="0.1, 0.1, 0.1, ..."
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-blue-800 mb-1">u(Y)</label>
            <input
              value={uyData}
              onChange={(e) => setUyData(e.target.value)}
              className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none transition font-mono text-sm"
              placeholder="0.2, 0.2, 0.2, ..."
              disabled={isLoading}
            />
          </div>
        </div>
        <p className="text-xs text-blue-700 mt-2">
          Si se dejan vacías, se calcularán automáticamente usando evaluación Tipo A
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="text-red-500 mr-3 flex-shrink-0" size={24} />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <button
        onClick={handleAnalyze}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <>
            <div className="loading-dots">
              <div></div><div></div><div></div><div></div>
            </div>
            <span>Analizando...</span>
          </>
        ) : (
          <>
            <span>Realizar Análisis Metrológico</span>
          </>
        )}
      </button>
    </div>
  );
}