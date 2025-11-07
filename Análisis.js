import React, { useState, useEffect } from 'react';
import { LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Download, TrendingUp, Calculator, FileText, Eye, Users, Activity } from 'lucide-react';

const MetrologiaApp = () => {
  const [xData, setXData] = useState('1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0');
  const [yData, setYData] = useState('2.1, 4.2, 6.1, 8.3, 10.2, 12.1, 14.3, 16.0, 18.2, 20.1');
  const [uxData, setUxData] = useState('');
  const [uyData, setUyData] = useState('');
  const [ajusteType, setAjusteType] = useState('lineal');
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('input');
  const [visits, setVisits] = useState(0);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);

  useEffect(() => {
    // Cargar visitas
    const savedVisits = parseInt(localStorage.getItem('metrologiaVisits') || '0');
    const newVisits = savedVisits + 1;
    setVisits(newVisits);
    localStorage.setItem('metrologiaVisits', newVisits.toString());

    // Verificar política
    const policyAccepted = localStorage.getItem('policyAccepted') === 'true';
    setAcceptedPolicy(policyAccepted);
    if (!policyAccepted) {
      setShowPrivacy(true);
    }

    // Registrar visita (simulación de analytics)
    if (policyAccepted) {
      const visitData = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        language: navigator.language
      };
      console.log('Visit registered:', visitData);
    }
  }, []);

  const parseData = (str) => {
    try {
      return str.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
    } catch {
      return [];
    }
  };

  const calculateAnalysis = () => {
    const x = parseData(xData);
    const y = parseData(yData);
    const ux = uxData ? parseData(uxData) : x.map(() => Math.sqrt(x.reduce((a,b) => a + b*b, 0) / x.length) / Math.sqrt(x.length) * 0.1);
    const uy = uyData ? parseData(uyData) : y.map(() => Math.sqrt(y.reduce((a,b) => a + b*b, 0) / y.length) / Math.sqrt(y.length) * 0.1);

    if (x.length < 3 || y.length !== x.length) {
      alert('Necesitas al menos 3 puntos y X e Y deben tener la misma longitud');
      return;
    }

    // Linearización
    let xLin, yLin, uxLin, uyLin, labelX, labelY;
    
    if (ajusteType === 'lineal') {
      xLin = x;
      yLin = y;
      uxLin = ux;
      uyLin = uy;
      labelX = 'x';
      labelY = 'y';
    } else if (ajusteType === 'potencial') {
      xLin = x.map(v => Math.log(v));
      yLin = y.map(v => Math.log(v));
      uxLin = ux.map((u, i) => u / x[i]);
      uyLin = uy.map((u, i) => u / y[i]);
      labelX = 'ln(x)';
      labelY = 'ln(y)';
    } else {
      xLin = x;
      yLin = y.map(v => Math.log(v));
      uxLin = ux;
      uyLin = uy.map((u, i) => u / y[i]);
      labelX = 'x';
      labelY = 'ln(y)';
    }

    // Ajuste por mínimos cuadrados ponderados
    const w = uyLin.map(u => 1 / (u * u));
    const sumW = w.reduce((a, b) => a + b, 0);
    const sumWX = w.reduce((sum, wi, i) => sum + wi * xLin[i], 0);
    const sumWY = w.reduce((sum, wi, i) => sum + wi * yLin[i], 0);
    const sumWXX = w.reduce((sum, wi, i) => sum + wi * xLin[i] * xLin[i], 0);
    const sumWXY = w.reduce((sum, wi, i) => sum + wi * xLin[i] * yLin[i], 0);

    const delta = sumW * sumWXX - sumWX * sumWX;
    const m = (sumW * sumWXY - sumWX * sumWY) / delta;
    const b = (sumWXX * sumWY - sumWX * sumWXY) / delta;
    const uM = Math.sqrt(sumW / delta);
    const uB = Math.sqrt(sumWXX / delta);

    // Valores ajustados y residuos
    const yFit = xLin.map(xi => m * xi + b);
    const residuals = yLin.map((yi, i) => yi - yFit[i]);
    
    // Estadísticas
    const ssRes = residuals.reduce((sum, r) => sum + r * r, 0);
    const yMean = yLin.reduce((a, b) => a + b, 0) / yLin.length;
    const ssTot = yLin.reduce((sum, yi) => sum + (yi - yMean) * (yi - yMean), 0);
    const r2 = 1 - ssRes / ssTot;
    const df = x.length - 2;
    const sRes = Math.sqrt(ssRes / df);
    const chi2Red = ssRes / df;

    // Preparar datos para gráficas
    const originalData = x.map((xi, i) => ({ x: xi, y: y[i], ux: ux[i], uy: uy[i] }));
    const linearData = xLin.map((xi, i) => ({ x: xi, y: yLin[i], yFit: yFit[i] }));
    const residualData = xLin.map((xi, i) => ({ x: xi, residual: residuals[i] }));

    setResults({
      m, b, uM, uB, r2, sRes, chi2Red, df,
      originalData, linearData, residualData, residuals,
      labelX, labelY, x, y, xLin, yLin, ajusteType
    });

    setActiveTab('results');
  };

  const generatePDF = async () => {
    if (!results) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Colores corporativos
    const primary = [41, 128, 185];
    const secondary = [52, 73, 94];
    const accent = [231, 76, 60];

    // Header con logo (simulado)
    doc.setFillColor(...primary);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Logo placeholder
    doc.setFillColor(255, 255, 255);
    doc.circle(20, 20, 12, 'F');
    doc.setTextColor(primary[0], primary[1], primary[2]);
    doc.setFontSize(10);
    doc.text('LOGO', 20, 22, { align: 'center' });

    // Título
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('REPORTE DE ANÁLISIS METROLÓGICO', 105, 18, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 105, 28, { align: 'center' });

    let yPos = 50;

    // Información del análisis
    doc.setTextColor(...secondary);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('CONFIGURACIÓN DEL ANÁLISIS', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Tipo de ajuste: ${results.ajusteType}`, 20, yPos);
    doc.text(`Puntos de datos: ${results.x.length}`, 120, yPos);
    yPos += 6;
    doc.text(`Grados de libertad: ${results.df}`, 20, yPos);
    
    // Línea separadora
    yPos += 8;
    doc.setDrawColor(...primary);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);
    yPos += 10;

    // Parámetros del ajuste
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...accent);
    doc.text('PARÁMETROS DEL AJUSTE', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...secondary);
    doc.text(`Pendiente (m):`, 20, yPos);
    doc.setFont(undefined, 'bold');
    doc.text(`${results.m.toExponential(6)} ± ${results.uM.toExponential(6)}`, 70, yPos);
    
    yPos += 7;
    doc.setFont(undefined, 'normal');
    doc.text(`Ordenada (b):`, 20, yPos);
    doc.setFont(undefined, 'bold');
    doc.text(`${results.b.toExponential(6)} ± ${results.uB.toExponential(6)}`, 70, yPos);

    // Box de estadísticas
    yPos += 12;
    doc.setFillColor(240, 248, 255);
    doc.roundedRect(20, yPos - 5, 170, 35, 3, 3, 'F');
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...primary);
    doc.text('ESTADÍSTICAS DEL AJUSTE', 25, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...secondary);
    doc.text(`R² (Coef. Determinación):`, 25, yPos);
    doc.text(`${results.r2.toFixed(6)}`, 90, yPos);
    doc.text(`χ² reducido:`, 130, yPos);
    doc.text(`${results.chi2Red.toFixed(6)}`, 165, yPos);
    
    yPos += 7;
    doc.text(`σ residuos:`, 25, yPos);
    doc.text(`${results.sRes.toExponential(4)}`, 90, yPos);

    // Interpretación
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...accent);
    doc.text('INTERPRETACIÓN', 20, yPos);
    
    yPos += 8;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...secondary);
    const quality = results.r2 > 0.99 ? 'excelente' : results.r2 > 0.95 ? 'muy buena' : results.r2 > 0.90 ? 'buena' : 'aceptable';
    doc.text(`El ajuste presenta una calidad ${quality} con R² = ${results.r2.toFixed(4)}.`, 20, yPos);
    yPos += 5;
    doc.text(`La incertidumbre relativa de la pendiente es ${((results.uM/Math.abs(results.m))*100).toFixed(2)}%.`, 20, yPos);

    // Nueva página para datos
    doc.addPage();
    yPos = 20;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...primary);
    doc.text('DATOS EXPERIMENTALES', 20, yPos);

    yPos += 10;
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    
    // Tabla de datos
    const headers = ['#', 'X', 'Y', 'u(X)', 'u(Y)', 'Y ajustado', 'Residuo'];
    const colWidths = [10, 25, 25, 25, 25, 30, 25];
    let xPos = 20;
    
    doc.setFillColor(...primary);
    doc.setTextColor(255, 255, 255);
    headers.forEach((header, i) => {
      doc.rect(xPos, yPos - 5, colWidths[i], 8, 'F');
      doc.text(header, xPos + colWidths[i]/2, yPos, { align: 'center' });
      xPos += colWidths[i];
    });

    yPos += 8;
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...secondary);

    results.x.forEach((_, i) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      xPos = 20;
      const rowData = [
        (i + 1).toString(),
        results.x[i].toFixed(4),
        results.y[i].toFixed(4),
        results.originalData[i].ux.toFixed(4),
        results.originalData[i].uy.toFixed(4),
        results.linearData[i].yFit.toFixed(4),
        results.residuals[i].toFixed(6)
      ];

      if (i % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(20, yPos - 4, 165, 6, 'F');
      }

      rowData.forEach((val, j) => {
        doc.text(val, xPos + colWidths[j]/2, yPos, { align: 'center' });
        xPos += colWidths[j];
      });

      yPos += 6;
    });

    // Footer en todas las páginas
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      doc.setDrawColor(...primary);
      doc.setLineWidth(0.3);
      doc.line(20, 280, 190, 280);
      
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.setFont(undefined, 'italic');
      doc.text('J. Javier de la Ossa - Físico, Web Development, Data Analytics', 105, 288, { align: 'center' });
      doc.setFontSize(6);
      doc.text(`Página ${i} de ${pageCount}`, 190, 293, { align: 'right' });
      doc.text(`Generado: ${new Date().toLocaleString()}`, 20, 293);
    }

    doc.save(`Reporte_Metrologico_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const acceptPolicy = () => {
    localStorage.setItem('policyAccepted', 'true');
    setAcceptedPolicy(true);
    setShowPrivacy(false);
  };

  if (showPrivacy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Política de Privacidad y Tratamiento de Datos</h2>
          
          <div className="max-h-96 overflow-y-auto mb-6 text-gray-700 space-y-4 pr-4">
            <p className="text-sm">
              <strong>Última actualización:</strong> {new Date().toLocaleDateString()}
            </p>
            
            <h3 className="font-semibold text-lg mt-4">1. Recopilación de Información</h3>
            <p>
              Esta aplicación recopila datos técnicos básicos para mejorar la experiencia del usuario, incluyendo:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Número de visitas (contador anónimo)</li>
              <li>Idioma del navegador</li>
              <li>Información técnica del dispositivo (user agent)</li>
              <li>Fecha y hora de acceso</li>
            </ul>

            <h3 className="font-semibold text-lg mt-4">2. Uso de la Información</h3>
            <p>
              Los datos recopilados se utilizan exclusivamente para:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Estadísticas de uso de la aplicación</li>
              <li>Mejoras en la funcionalidad y experiencia del usuario</li>
              <li>Análisis de rendimiento técnico</li>
            </ul>

            <h3 className="font-semibold text-lg mt-4">3. Almacenamiento de Datos</h3>
            <p>
              Los datos se almacenan localmente en su navegador mediante localStorage. No se envían a servidores externos ni se comparten con terceros.
            </p>

            <h3 className="font-semibold text-lg mt-4">4. Datos Científicos</h3>
            <p>
              Los datos experimentales que usted ingrese para análisis metrológico permanecen exclusivamente en su navegador y no son almacenados ni transmitidos.
            </p>

            <h3 className="font-semibold text-lg mt-4">5. Sus Derechos</h3>
            <p>
              Usted tiene derecho a:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Acceder a los datos almacenados</li>
              <li>Eliminar todos los datos (limpiando el localStorage del navegador)</li>
              <li>Revocar el consentimiento en cualquier momento</li>
            </ul>

            <h3 className="font-semibold text-lg mt-4">6. Contacto</h3>
            <p>
              Para consultas sobre privacidad, contacte a:<br/>
              <strong>J. Javier de la Ossa</strong><br/>
              Físico - Web Development - Data Analytics
            </p>
          </div>

          <div className="flex items-center mb-4">
            <input 
              type="checkbox" 
              id="accept" 
              className="w-5 h-5 text-blue-600 rounded"
              onChange={(e) => e.target.checked && acceptPolicy()}
            />
            <label htmlFor="accept" className="ml-3 text-sm text-gray-700">
              He leído y acepto la política de privacidad y tratamiento de datos
            </label>
          </div>

          <button
            onClick={acceptPolicy}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold"
          >
            Aceptar y Continuar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Análisis Metrológico</h1>
              <p className="text-xs text-blue-200">Sistema de Ajuste y Linearización</p>
            </div>
          </div>
          <div className="flex items-center space-x-6 text-white">
            <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg">
              <Eye size={18} />
              <span className="text-sm font-semibold">{visits} visitas</span>
            </div>
            <button 
              onClick={() => setShowPrivacy(true)}
              className="text-xs text-blue-200 hover:text-white transition"
            >
              Política de Privacidad
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          {[
            { id: 'input', label: 'Entrada de Datos', icon: Calculator },
            { id: 'results', label: 'Resultados', icon: FileText },
            { id: 'graphs', label: 'Gráficas', icon: Activity }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-t-lg font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <tab.icon size={20} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {activeTab === 'input' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Configuración del Análisis</h2>
                <p className="text-gray-600">Ingrese sus datos experimentales separados por comas</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Tipo de Ajuste</label>
                  <select
                    value={ajusteType}
                    onChange={(e) => setAjusteType(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
                  >
                    <option value="lineal">Lineal (y = mx + b)</option>
                    <option value="potencial">Potencial (y = Ax^n)</option>
                    <option value="exponencial">Exponencial (y = Ae^(bx))</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Valores de X</label>
                  <textarea
                    value={xData}
                    onChange={(e) => setXData(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition font-mono text-sm"
                    rows="3"
                    placeholder="1.0, 2.0, 3.0, ..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Valores de Y</label>
                  <textarea
                    value={yData}
                    onChange={(e) => setYData(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition font-mono text-sm"
                    rows="3"
                    placeholder="2.1, 4.2, 6.1, ..."
                  />
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                <p className="text-sm font-semibold text-blue-900 mb-2">Incertidumbres (Opcional)</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    value={uxData}
                    onChange={(e) => setUxData(e.target.value)}
                    className="px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none transition font-mono text-sm"
                    placeholder="u(X): 0.1, 0.1, 0.1, ..."
                  />
                  <input
                    value={uyData}
                    onChange={(e) => setUyData(e.target.value)}
                    className="px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none transition font-mono text-sm"
                    placeholder="u(Y): 0.2, 0.2, 0.2, ..."
                  />
                </div>
                <p className="text-xs text-blue-700 mt-2">Si se dejan vacías, se calcularán automáticamente (Tipo A)</p>
              </div>

              <button
                onClick={calculateAnalysis}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <Calculator size={24} />
                <span>Realizar Análisis Metrológico</span>
              </button>
            </div>
          )}

          {activeTab === 'results' && results && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Resultados del Análisis</h2>
                <button
                  onClick={generatePDF}
                  className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-pink-700 transition-all shadow-lg"
                >
                  <Download size={20} />
                  <span>Descargar PDF</span>
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <p className="text-sm opacity-90 mb-1">Coeficiente R²</p>
                  <p className="text-3xl font-bold">{results.r2.toFixed(6)}</p>
                  <p className="text-xs mt-2 opacity-75">Calidad del ajuste</p>
                </div>

                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
                  <p className="text-sm opacity-90 mb-1">Pendiente (m)</p>
                  <p className="text-2xl font-bold">{results.m.toExponential(4)}</p>
                  <p className="text-xs mt-2 opacity-75">± {results.uM.toExponential(4)}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <p className="text-sm opacity-90 mb-1">Ordenada (b)</p>
                  <p className="text-2xl font-bold">{results.b.toExponential(4)}</p>
                  <p className="text-xs mt-2 opacity-75">± {results.uB.toExponential(4)}</p>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-800">Estadísticas Detalladas</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-semibold text-gray-700">Puntos de datos:</span>
                    <span className="text-gray-900">{results.x.length}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-semibold text-gray-700">Grados de libertad:</span>
                    <span className="text-gray-900">{results.df}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-semibold text-gray-700">χ² reducido:</span>
                    <span className="text-gray-900">{results.chi2Red.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-semibold text-gray-700">σ residuos:</span>
                    <span className="text-gray-900">{results.sRes.toExponential(4)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'graphs' && results && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-800">Visualización de Datos</h2>

              {/* Datos Originales */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Datos Experimentales Originales</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="x" type="number" name="X" />
                    <YAxis dataKey="y" type="number" name="Y" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend />
                    <Scatter name="Datos" data={results.originalData} fill="#3b82f6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              {/* Linearización y Ajuste */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Linearización y Ajuste</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={results.linearData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="x" label={{ value: results.labelX, position: 'bottom' }} />
                    <YAxis label={{ value: results.labelY, angle: -90, position: 'left' }} />
                    <Tooltip />
                    <Legend />
                    <Scatter name="Datos" dataKey="y" fill="#ef4444" />
                    <Line name="Ajuste" dataKey="yFit" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                  <p className="text-sm font-mono text-gray-700">
                    y = ({results.m.toFixed(4)} ± {results.uM.toFixed(4)})x + ({results.b.toFixed(4)} ± {results.uB.toFixed(4)})
                  </p>
                  <p className="text-xs text-gray-600 mt-1">R² = {results.r2.toFixed(6)}</p>
                </div>
              </div>

              {/* Residuos */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Análisis de Residuos</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="x" label={{ value: results.labelX, position: 'bottom' }} />
                    <YAxis label={{ value: 'Residuos', angle: -90, position: 'left' }} />
                    <Tooltip />
                    <Legend />
                    <Scatter name="Residuos" data={results.residualData} fill="#8b5cf6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {!results && activeTab !== 'input' && (
            <div className="text-center py-16">
              <Activity size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">Primero realiza un análisis para ver los resultados</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-md border-t border-white/10 mt-16 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-white/60 text-sm italic">
            J. Javier de la Ossa - Físico, Web Development, Data Analytics
          </p>
          <p className="text-white/40 text-xs mt-2">
            © {new Date().getFullYear()} - Sistema de Análisis Metrológico
          </p>
        </div>
      </footer>

      {/* jsPDF Script */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    </div>
  );
};

export default MetrologiaApp;