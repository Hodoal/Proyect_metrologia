import express, { Request, Response, NextFunction } from 'express';
import jsPDF from 'jspdf';
import ExcelJS from 'exceljs';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartConfiguration } from 'chart.js';
import { AnalysisResult, ApiResponse } from '../types';

const router = express.Router();

// PDF Export endpoint
router.post('/pdf', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const results: AnalysisResult = req.body;
    
    // Accept either linear fit (m, b) or quadratic fit (x0, v0, a)
    if (!results || (!results.m && !results.x0 && !results.v0)) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid analysis results',
        message: 'Analysis results are required to generate PDF',
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(response);
      return;
    }

    const pdfBuffer = await generatePDFReport(results);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Reporte_Metrologico_${new Date().toISOString().split('T')[0]}.pdf"`);
    res.send(pdfBuffer);

  } catch (error) {
    next(error);
  }
});

// Excel Export endpoint
router.post('/excel', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const results: AnalysisResult = req.body;
    
    if (!results || !results.m) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid analysis results',
        message: 'Analysis results are required to generate Excel file',
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(response);
      return;
    }

    const excelBuffer = await generateExcelReport(results);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Datos_Metrologicos_${new Date().toISOString().split('T')[0]}.xlsx"`);
    res.send(excelBuffer);

  } catch (error) {
    next(error);
  }
});

// Función para generar gráficos como imágenes
async function generateChartImage(
  chartConfig: ChartConfiguration,
  width: number = 800,
  height: number = 400
): Promise<Buffer> {
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour: 'white' });
  return await chartJSNodeCanvas.renderToBuffer(chartConfig);
}

// Generar gráfico de datos originales con ajuste
async function generateOriginalDataChart(results: AnalysisResult): Promise<Buffer> {
  const config: ChartConfiguration = {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'Datos Originales',
          data: results.originalData.map(d => ({ x: d.x, y: d.y })),
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgba(59, 130, 246, 1)',
          pointRadius: 6,
          pointHoverRadius: 8,
        },
        {
          label: 'Ajuste Lineal',
          data: results.linearData.map(d => ({ x: d.x, y: d.yFit })),
          type: 'line',
          borderColor: 'rgba(239, 68, 68, 1)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Datos Experimentales y Ajuste',
          font: { size: 18, weight: 'bold' }
        },
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        x: {
          type: 'linear',
          title: {
            display: true,
            text: results.labelX || 'X',
            font: { size: 14, weight: 'bold' }
          },
          grid: { color: 'rgba(0, 0, 0, 0.1)' }
        },
        y: {
          title: {
            display: true,
            text: results.labelY || 'Y',
            font: { size: 14, weight: 'bold' }
          },
          grid: { color: 'rgba(0, 0, 0, 0.1)' }
        }
      }
    }
  };
  return generateChartImage(config);
}

// Generar gráfico de residuos
async function generateResidualsChart(results: AnalysisResult): Promise<Buffer> {
  const config: ChartConfiguration = {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'Residuos',
          data: results.residualData.map(d => ({ x: d.x, y: d.residual })),
          backgroundColor: 'rgba(139, 92, 246, 0.6)',
          borderColor: 'rgba(139, 92, 246, 1)',
          pointRadius: 5,
        },
        {
          label: 'Línea Cero',
          data: [
            { x: Math.min(...results.residualData.map(d => d.x)), y: 0 },
            { x: Math.max(...results.residualData.map(d => d.x)), y: 0 }
          ],
          type: 'line',
          borderColor: 'rgba(0, 0, 0, 0.3)',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Análisis de Residuos',
          font: { size: 18, weight: 'bold' }
        },
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        x: {
          type: 'linear',
          title: {
            display: true,
            text: results.labelX || 'X',
            font: { size: 14, weight: 'bold' }
          },
          grid: { color: 'rgba(0, 0, 0, 0.1)' }
        },
        y: {
          title: {
            display: true,
            text: 'Residuo',
            font: { size: 14, weight: 'bold' }
          },
          grid: { color: 'rgba(0, 0, 0, 0.1)' }
        }
      }
    }
  };
  return generateChartImage(config);
}

// Generar histograma de distribución de residuos con test de normalidad
async function generateDistributionChart(results: AnalysisResult): Promise<Buffer> {
  // Calcular histograma
  const residuals = results.residuals;
  const min = Math.min(...residuals);
  const max = Math.max(...residuals);
  const numBins = Math.min(Math.ceil(Math.sqrt(residuals.length)), 15);
  const binWidth = (max - min) / numBins;
  
  // Crear bins
  const bins: { x: number; count: number }[] = [];
  for (let i = 0; i < numBins; i++) {
    const binStart = min + i * binWidth;
    const binCenter = binStart + binWidth / 2;
    const count = residuals.filter(r => r >= binStart && r < binStart + binWidth).length;
    bins.push({ x: binCenter, count });
  }
  
  // Calcular curva normal teórica
  const mean = residuals.reduce((sum, r) => sum + r, 0) / residuals.length;
  const std = Math.sqrt(residuals.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (residuals.length - 1));
  
  const normalCurve: { x: number; y: number }[] = [];
  for (let i = 0; i <= 100; i++) {
    const x = min + (max - min) * i / 100;
    const z = (x - mean) / std;
    const y = (residuals.length * binWidth / std) * Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
    normalCurve.push({ x, y });
  }

  // Información del test de normalidad para el título
  const normalityInfo = results.normalityTest 
    ? `(${results.normalityTest.testName}: ${results.normalityTest.isNormal ? '✓ Normal' : '✗ No Normal'})`
    : '';

  const config: ChartConfiguration = {
    type: 'bar',
    data: {
      labels: bins.map(b => b.x.toFixed(4)),
      datasets: [
        {
          label: 'Frecuencia de Residuos',
          data: bins.map(b => b.count),
          backgroundColor: 'rgba(34, 197, 94, 0.6)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1,
        },
        {
          label: 'Distribución Normal Teórica',
          data: normalCurve.map(p => p.y),
          type: 'line',
          borderColor: 'rgba(239, 68, 68, 1)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          yAxisID: 'y',
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `Distribución de Residuos vs Normal ${normalityInfo}`,
          font: { size: 16, weight: 'bold' }
        },
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Residuo',
            font: { size: 14, weight: 'bold' }
          },
          grid: { color: 'rgba(0, 0, 0, 0.1)' }
        },
        y: {
          title: {
            display: true,
            text: 'Frecuencia',
            font: { size: 14, weight: 'bold' }
          },
          grid: { color: 'rgba(0, 0, 0, 0.1)' },
          beginAtZero: true
        }
      }
    }
  };
  return generateChartImage(config);
}

async function generatePDFReport(results: AnalysisResult): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });
  
  // Generar gráficos primero (esto puede tomar tiempo)
  const [originalDataChart, residualsChart, distributionChart] = await Promise.all([
    generateOriginalDataChart(results),
    generateResidualsChart(results),
    generateDistributionChart(results)
  ]);
  
  // Colors - Tema Rojo y Blanco Universitario
  const primaryRed: [number, number, number] = [196, 22, 28];      // Rojo universitario
  const darkRed: [number, number, number] = [139, 0, 0];           // Rojo oscuro
  const lightGray: [number, number, number] = [240, 240, 240];     // Gris claro
  const darkGray: [number, number, number] = [60, 60, 60];         // Gris oscuro
  const accentGold: [number, number, number] = [218, 165, 32];     // Dorado (acento)
  
  // Función para dibujar iconos simples en lugar de emojis
  const drawIcon = (type: string, x: number, y: number, size: number = 4) => {
    doc.setDrawColor(primaryRed[0], primaryRed[1], primaryRed[2]);
    doc.setLineWidth(0.5);
    
    switch(type) {
      case 'chart': // Para estadísticas
        doc.rect(x, y - size, size, size, 'S');
        doc.line(x + 1, y - 1, x + size - 1, y - size + 1);
        break;
      case 'physics': // Para física
        doc.circle(x + size/2, y - size/2, size/2, 'S');
        doc.line(x + size/2, y - size/2, x + size/2 + 2, y - size/2 - 2);
        break;
      case 'config': // Para configuración
        doc.circle(x + size/2, y - size/2, size/3, 'S');
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const x1 = x + size/2 + Math.cos(angle) * size/2;
          const y1 = y - size/2 + Math.sin(angle) * size/2;
          doc.line(x + size/2, y - size/2, x1, y1);
        }
        break;
      case 'formula': // Para fórmulas
        doc.setFont('times', 'italic');
        doc.setFontSize(10);
        doc.text('f', x, y);
        doc.setFont('helvetica', 'normal');
        break;
    }
  };

  // ========== ENCABEZADO CON LOGO ==========
  // Fondo del encabezado - Rojo con degradado visual
  doc.setFillColor(primaryRed[0], primaryRed[1], primaryRed[2]);
  doc.rect(0, 0, 210, 45, 'F');
  
  // Línea decorativa dorada
  doc.setDrawColor(accentGold[0], accentGold[1], accentGold[2]);
  doc.setLineWidth(1);
  doc.line(0, 45, 210, 45);
  
  // Cargar y agregar el logo (lado izquierdo)
  try {
    const fs = await import('fs');
    const path = await import('path');
    const logoPath = path.join(__dirname, '../assets/logo.png');
    const logoData = fs.readFileSync(logoPath);
    const logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;
    doc.addImage(logoBase64, 'PNG', 15, 8, 35, 30);
  } catch (error) {
    console.warn('No se pudo cargar el logo:', error);
  }
  
  // Título principal (derecha del logo)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORTE DE ANÁLISIS', 105, 15, { align: 'center' });
  doc.setFontSize(20);
  doc.text('METROLÓGICO', 105, 25, { align: 'center' });
  
  // Subtítulo con fecha
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const fechaActual = new Date().toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.text(`Fecha: ${fechaActual}`, 105, 37, { align: 'center' });

  let yPos = 58;

  // ========== SECCION DE TEORIA FISICA ==========
  if (results.motionType) {
    // Caja con fondo gris claro y borde rojo
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.roundedRect(15, yPos - 3, 180, 50, 3, 3, 'F');
    doc.setDrawColor(primaryRed[0], primaryRed[1], primaryRed[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, yPos - 3, 180, 50, 3, 3, 'S');
    
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryRed[0], primaryRed[1], primaryRed[2]);
    const motionTitle = results.motionType === 'MRU' 
      ? 'MOVIMIENTO RECTILINE UNIFORME (MRU)'
      : 'MOVIMIENTO RECTILINEO UNIFORMEMENTE ACELERADO (MRUA)';
    doc.text(motionTitle, 20, yPos + 2);
    yPos += 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

    if (results.motionType === 'MRU') {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text('El MRU describe un movimiento con velocidad constante.', 20, yPos);
      yPos += 7;
      
      // Ecuacion LaTeX-style en recuadro
      doc.setFillColor(255, 250, 250);
      doc.roundedRect(25, yPos - 2, 155, 8, 2, 2, 'F');
      doc.setDrawColor(primaryRed[0], primaryRed[1], primaryRed[2]);
      doc.setLineWidth(0.5);
      doc.roundedRect(25, yPos - 2, 155, 8, 2, 2, 'S');
      
      // Ecuacion con notacion matematica
      doc.setFont('times', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(darkRed[0], darkRed[1], darkRed[2]);
      doc.text('x', 88, yPos + 3);
      doc.setFont('times', 'normal');
      doc.text('(', 91, yPos + 3);
      doc.setFont('times', 'italic');
      doc.text('t', 93, yPos + 3);
      doc.setFont('times', 'normal');
      doc.text(') = ', 96, yPos + 3);
      doc.setFont('times', 'italic');
      doc.text('x', 104, yPos + 3);
      doc.setFontSize(7);
      doc.text('0', 107, yPos + 4);
      doc.setFontSize(10);
      doc.setFont('times', 'normal');
      doc.text(' + ', 110, yPos + 3);
      doc.setFont('times', 'italic');
      doc.text('v t', 118, yPos + 3);
      
      yPos += 10;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text('donde x0 = posicion inicial,  v = velocidad constante,  t = tiempo', 20, yPos);
      yPos += 5;
      doc.text('Caracteristicas: velocidad constante, aceleracion nula, grafica lineal', 20, yPos);
    } else {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text('El MRUA describe un movimiento con aceleracion constante.', 20, yPos);
      yPos += 6;
      
      // Ecuacion cuadratica LaTeX-style
      doc.setFillColor(255, 245, 245);
      doc.roundedRect(25, yPos - 2, 155, 10, 2, 2, 'F');
      doc.setDrawColor(darkRed[0], darkRed[1], darkRed[2]);
      doc.setLineWidth(0.6);
      doc.roundedRect(25, yPos - 2, 155, 10, 2, 2, 'S');
      
      // x(t) = x0 + v0*t + (1/2)*a*t^2
      doc.setFont('times', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(darkRed[0], darkRed[1], darkRed[2]);
      doc.text('x', 70, yPos + 3);
      doc.setFont('times', 'normal');
      doc.text('(', 73, yPos + 3);
      doc.setFont('times', 'italic');
      doc.text('t', 75, yPos + 3);
      doc.setFont('times', 'normal');
      doc.text(') = ', 78, yPos + 3);
      doc.setFont('times', 'italic');
      doc.text('x', 85, yPos + 3);
      doc.setFontSize(6);
      doc.text('0', 88, yPos + 4);
      doc.setFontSize(9);
      doc.setFont('times', 'normal');
      doc.text(' + ', 91, yPos + 3);
      doc.setFont('times', 'italic');
      doc.text('v', 98, yPos + 3);
      doc.setFontSize(6);
      doc.text('0', 101, yPos + 4);
      doc.setFontSize(9);
      doc.setFont('times', 'italic');
      doc.text('t', 104, yPos + 3);
      doc.setFont('times', 'normal');
      doc.text(' + ', 107, yPos + 3);
      doc.setFontSize(8);
      doc.text('1', 115, yPos + 2);
      doc.line(114, yPos + 3, 119, yPos + 3);
      doc.text('2', 115, yPos + 5);
      doc.setFontSize(9);
      doc.setFont('times', 'italic');
      doc.text('a t', 121, yPos + 3);
      doc.setFontSize(6);
      doc.text('2', 130, yPos + 1);
      
      yPos += 12;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text('Velocidad: v(t) = v0 + a*t', 20, yPos);
      yPos += 4;
      doc.text('donde x0 = posicion inicial, v0 = velocidad inicial, a = aceleracion', 20, yPos);
      yPos += 4;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6);
      doc.text('* Linealizacion: Para x vs t^2, la pendiente es a/2', 20, yPos);
    }

    yPos += 8;
  }

  // ========== CONFIGURACION DEL ANALISIS ==========
  drawIcon('config', 20, yPos + 2);
  doc.setTextColor(primaryRed[0], primaryRed[1], primaryRed[2]);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('CONFIGURACION DEL ANALISIS', 28, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text(`Tipo de ajuste:`, 20, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text(`${results.ajusteType}`, 55, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`Puntos de datos:`, 110, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text(`${results.x.length}`, 155, yPos);
  yPos += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(`Grados de libertad:`, 20, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text(`${results.df}`, 55, yPos);
  
  // Linea separadora dorada
  yPos += 8;
  doc.setDrawColor(accentGold[0], accentGold[1], accentGold[2]);
  doc.setLineWidth(1);
  doc.line(20, yPos, 190, yPos);
  yPos += 8;

  // ========== PARAMETROS DEL AJUSTE ==========
  drawIcon('formula', 20, yPos + 2);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkRed[0], darkRed[1], darkRed[2]);
  doc.text('PARAMETROS DEL AJUSTE', 28, yPos);
  
  yPos += 10;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  
  // Si es ajuste cuadratico, mostrar x0, v0, a
  if (results.a !== undefined) {
    // Caja para parametros
    doc.setFillColor(255, 250, 250);
    doc.roundedRect(15, yPos - 3, 180, 24, 2, 2, 'F');
    doc.setDrawColor(primaryRed[0], primaryRed[1], primaryRed[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(15, yPos - 3, 180, 24, 2, 2, 'S');
    
    yPos += 2;
    
    // Parametro x0
    doc.setFont('times', 'italic');
    doc.text('x', 20, yPos);
    doc.setFontSize(7);
    doc.text('0', 23, yPos + 1);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('=', 27, yPos);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkRed[0], darkRed[1], darkRed[2]);
    const x0Val = results.x0 ?? results.b ?? 0;
    const uX0Val = results.uX0 ?? results.uB ?? 0;
    doc.text(`${x0Val.toFixed(4)} +/- ${uX0Val.toFixed(4)} m`, 31, yPos);
    
    yPos += 7;
    
    // Parametro v0
    doc.setFont('times', 'italic');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text('v', 20, yPos);
    doc.setFontSize(7);
    doc.text('0', 23, yPos + 1);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('=', 27, yPos);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkRed[0], darkRed[1], darkRed[2]);
    const v0Val = results.v0 ?? results.m ?? 0;
    const uV0Val = results.uV0 ?? results.uM ?? 0;
    doc.text(`${v0Val.toFixed(4)} +/- ${uV0Val.toFixed(4)} m/s`, 31, yPos);
    
    yPos += 7;
    
    // Parametro a
    doc.setFont('times', 'italic');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text('a', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text('=', 27, yPos);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkRed[0], darkRed[1], darkRed[2]);
    doc.text(`${(results.a ?? 0).toFixed(4)} +/- ${(results.uA ?? 0).toFixed(4)} m/s`, 31, yPos);
    doc.setFontSize(7);
    doc.text('2', 121, yPos - 2);
    
    yPos += 5;
    
    // Nota de confianza
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('* Intervalos de confianza al 95%', 20, yPos);
    
  } else {
    // Ajuste lineal tradicional
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(15, yPos - 3, 180, 18, 2, 2, 'F');
    doc.setDrawColor(primaryRed[0], primaryRed[1], primaryRed[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(15, yPos - 3, 180, 18, 2, 2, 'S');
    
    yPos += 2;
    
    // Pendiente m
    doc.setFont('times', 'italic');
    doc.text('m', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text('=', 27, yPos);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkRed[0], darkRed[1], darkRed[2]);
    doc.text(`${(results.m ?? 0).toExponential(4)} +/- ${(results.uM ?? 0).toExponential(4)}`, 31, yPos);
    
    yPos += 7;
    
    // Ordenada b
    doc.setFont('times', 'italic');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text('b', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text('=', 27, yPos);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkRed[0], darkRed[1], darkRed[2]);
    doc.text(`${(results.b ?? 0).toExponential(4)} +/- ${(results.uB ?? 0).toExponential(4)}`, 31, yPos);
    
    yPos += 5;
  }

  // ========== CAJA DE ESTADISTICAS ==========
  yPos += 10;
  // Fondo con borde rojo
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(20, yPos - 3, 170, 30, 3, 3, 'F');
  doc.setDrawColor(primaryRed[0], primaryRed[1], primaryRed[2]);
  doc.setLineWidth(0.8);
  doc.roundedRect(20, yPos - 3, 170, 30, 3, 3, 'S');
  
  drawIcon('chart', 23, yPos + 2);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryRed[0], primaryRed[1], primaryRed[2]);
  doc.text('ESTADISTICAS DEL AJUSTE', 31, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text(`R^2 (Coef. Determinacion):`, 25, yPos);
  doc.text(`${results.r2.toFixed(6)}`, 90, yPos);
  doc.text(`Chi^2 reducido:`, 130, yPos);
  doc.text(`${results.chi2Red.toFixed(6)}`, 165, yPos);
  
  yPos += 7;
  doc.text(`Sigma residuos:`, 25, yPos);
  doc.text(`${results.sRes.toExponential(4)}`, 90, yPos);

  // Interpretation
  yPos += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkRed[0], darkRed[1], darkRed[2]);
  doc.text('INTERPRETACIÓN', 20, yPos);
  
  yPos += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  const quality = results.r2 > 0.99 ? 'excelente' : results.r2 > 0.95 ? 'muy buena' : results.r2 > 0.90 ? 'buena' : 'aceptable';
  doc.text(`El ajuste presenta una calidad ${quality} con R² = ${results.r2.toFixed(4)}.`, 20, yPos);
  yPos += 5;
  const slopeVal = results.v0 ?? results.m ?? 0;
  const uSlopeVal = results.uV0 ?? results.uM ?? 0;
  doc.text(`La incertidumbre relativa de la pendiente es ${((uSlopeVal/Math.abs(slopeVal))*100).toFixed(2)}%.`, 20, yPos);

  // ========== INTERPRETACION FISICA ==========
  if (results.physicalInterpretation) {
    yPos += 8;
    // Caja MAS ANGOSTA con fondo suave y borde rojo oscuro - EVITA SOLAPAMIENTO
    const boxWidth = 130;  // Reducido de 170 a 130
    const boxX = 15;
    doc.setFillColor(255, 245, 245);
    doc.roundedRect(boxX, yPos - 3, boxWidth, 40, 3, 3, 'F');
    doc.setDrawColor(darkRed[0], darkRed[1], darkRed[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(boxX, yPos - 3, boxWidth, 40, 3, 3, 'S');
    
    drawIcon('physics', boxX + 3, yPos + 2);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkRed[0], darkRed[1], darkRed[2]);
    doc.text('INTERPRETACION FISICA', boxX + 10, yPos);
    yPos += 7;
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    
    // Dividir la interpretacion en lineas con ancho reducido
    const maxWidth = boxWidth - 10;  // Margen interno
    const lines = doc.splitTextToSize(results.physicalInterpretation, maxWidth);
    
    let lineCount = 0;
    lines.forEach((line: string) => {
      if (lineCount < 8 && yPos < 270) {  // Limitar numero de lineas
        doc.text(line, boxX + 5, yPos);
        yPos += 3.5;
        lineCount++;
      }
    });
    
    yPos += 2;
  }

  // Test de normalidad
  if (results.normalityTest) {
    yPos += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryRed[0], primaryRed[1], primaryRed[2]);
    doc.text('TEST DE NORMALIDAD', 20, yPos);
    yPos += 7;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(`Test: ${results.normalityTest.testName}`, 20, yPos);
    doc.text(`Resultado: ${results.normalityTest.isNormal ? '✓ Normal' : '✗ No Normal'}`, 100, yPos);
    yPos += 5;
    doc.text(`Estadístico JB: ${results.normalityTest.statistic.toFixed(3)}`, 20, yPos);
    yPos += 5;
    doc.text(`Skewness: ${results.normalityTest.skewness.toFixed(3)}`, 20, yPos);
    doc.text(`Kurtosis: ${results.normalityTest.kurtosis.toFixed(3)}`, 100, yPos);
  }

  // New page for graphs
  doc.addPage();
  yPos = 20;
  
  // Título de gráficos
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryRed[0], primaryRed[1], primaryRed[2]);
  doc.text('GRÁFICOS DE ANÁLISIS (Intervalos de Confianza 95%)', 105, yPos, { align: 'center' });
  yPos += 10;

  // Gráfico de datos originales
  const chartWidth = 170;
  const chartHeight = 80;
  doc.addImage(originalDataChart, 'PNG', 20, yPos, chartWidth, chartHeight);
  yPos += chartHeight + 8;

  // Gráfico de residuos
  doc.addImage(residualsChart, 'PNG', 20, yPos, chartWidth, chartHeight);
  
  // Nueva página para distribución
  doc.addPage();
  yPos = 20;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryRed[0], primaryRed[1], primaryRed[2]);
  doc.text('ANÁLISIS DE DISTRIBUCIÓN', 105, yPos, { align: 'center' });
  yPos += 10;
  
  // Gráfico de distribución
  doc.addImage(distributionChart, 'PNG', 20, yPos, chartWidth, chartHeight);
  yPos += chartHeight + 10;
  
  // Interpretación de la distribución
  doc.setFillColor(245, 250, 255);
  doc.roundedRect(20, yPos - 3, 170, 45, 3, 3, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryRed[0], primaryRed[1], primaryRed[2]);
  doc.text('ANÁLISIS DE NORMALIDAD', 25, yPos);
  yPos += 8;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  
  if (results.normalityTest) {
    const lines = doc.splitTextToSize(results.normalityTest.interpretation, 165);
    lines.forEach((line: string) => {
      doc.text(line, 25, yPos);
      yPos += 4.5;
    });
  } else {
    doc.text('Este gráfico muestra la distribución de los residuos comparada con una distribución', 25, yPos);
    yPos += 5;
    doc.text('normal teórica. Una buena concordancia indica que los residuos siguen un', 25, yPos);
    yPos += 5;
    doc.text('comportamiento estadístico esperado, validando el modelo de ajuste.', 25, yPos);
  }

  // ========== NOTA: TABLA DE DATOS ELIMINADA ==========
  // La tabla de datos completa ha sido eliminada para simplificar el reporte.
  // Los datos se pueden ver en los graficos y en el archivo Excel si es necesario.

  // ========== FOOTER PROFESIONAL CON ESTILO INSTITUCIONAL ==========
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Línea decorativa dorada superior
    doc.setDrawColor(accentGold[0], accentGold[1], accentGold[2]);
    doc.setLineWidth(0.5);
    doc.line(20, 280, 190, 280);
    
    // Línea roja inferior más gruesa
    doc.setDrawColor(primaryRed[0], primaryRed[1], primaryRed[2]);
    doc.setLineWidth(1.5);
    doc.line(20, 295, 190, 295);
    
    // Información del autor y sistema
    doc.setFontSize(7);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFont('helvetica', 'normal');
    doc.text('Institución Universitaria de Barranquilla', 105, 285, { align: 'center' });
    doc.setFont('helvetica', 'italic');
    doc.text('Sistema de Análisis Metrológico y Cinemático', 105, 290, { align: 'center' });
    
    // Paginación
    doc.setFontSize(6);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'bold');
    doc.text(`Pág. ${i}/${pageCount}`, 190, 292, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text(`${new Date().toLocaleDateString('es-ES')}`, 20, 292);
  }

  return Buffer.from(doc.output('arraybuffer'));
}

async function generateExcelReport(results: AnalysisResult): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'J. Javier de la Ossa';
  workbook.created = new Date();

  // Summary sheet
  const summarySheet = workbook.addWorksheet('Resumen', {
    headerFooter: {
      firstHeader: 'Análisis Metrológico - Resumen',
      firstFooter: '&CGenerado por Sistema de Análisis Metrológico'
    }
  });

  // Headers
  summarySheet.getCell('A1').value = 'ANÁLISIS METROLÓGICO - RESUMEN';
  summarySheet.getCell('A1').font = { bold: true, size: 16 };
  summarySheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2980B9' } };
  summarySheet.getCell('A1').font = { ...summarySheet.getCell('A1').font, color: { argb: 'FFFFFFFF' } };
  summarySheet.mergeCells('A1:D1');

  // Analysis info
  summarySheet.getCell('A3').value = 'Tipo de ajuste:';
  summarySheet.getCell('B3').value = results.ajusteType;
  summarySheet.getCell('A4').value = 'Puntos de datos:';
  summarySheet.getCell('B4').value = results.x.length;
  summarySheet.getCell('A5').value = 'Grados de libertad:';
  summarySheet.getCell('B5').value = results.df;

  // Parameters
  summarySheet.getCell('A7').value = 'PARÁMETROS DEL AJUSTE';
  summarySheet.getCell('A7').font = { bold: true, size: 12 };
  summarySheet.getCell('A8').value = 'Pendiente (m):';
  summarySheet.getCell('B8').value = results.m;
  summarySheet.getCell('C8').value = '±';
  summarySheet.getCell('D8').value = results.uM;
  summarySheet.getCell('A9').value = 'Ordenada (b):';
  summarySheet.getCell('B9').value = results.b;
  summarySheet.getCell('C9').value = '±';
  summarySheet.getCell('D9').value = results.uB;

  // Statistics
  summarySheet.getCell('A11').value = 'ESTADÍSTICAS';
  summarySheet.getCell('A11').font = { bold: true, size: 12 };
  summarySheet.getCell('A12').value = 'R² (Coef. Determinación):';
  summarySheet.getCell('B12').value = results.r2;
  summarySheet.getCell('A13').value = 'χ² reducido:';
  summarySheet.getCell('B13').value = results.chi2Red;
  summarySheet.getCell('A14').value = 'σ residuos:';
  summarySheet.getCell('B14').value = results.sRes;

  // Data sheet
  const dataSheet = workbook.addWorksheet('Datos');
  
  // Headers
  const headers = ['Punto', 'X', 'Y', 'u(X)', 'u(Y)', 'Y ajustado', 'Residuo'];
  headers.forEach((header, index) => {
    const cell = dataSheet.getCell(1, index + 1);
    cell.value = header;
    cell.font = { bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3F2FD' } };
  });

  // Data rows
  results.x.forEach((x, i) => {
    const rowIndex = i + 2;
    dataSheet.getCell(rowIndex, 1).value = i + 1;
    dataSheet.getCell(rowIndex, 2).value = x;
    dataSheet.getCell(rowIndex, 3).value = results.y[i] || 0;
    dataSheet.getCell(rowIndex, 4).value = results.originalData[i]?.ux || null;
    dataSheet.getCell(rowIndex, 5).value = results.originalData[i]?.uy || null;
    dataSheet.getCell(rowIndex, 6).value = results.linearData[i]?.yFit || 0;
    dataSheet.getCell(rowIndex, 7).value = results.residuals[i] || 0;
  });

  // Auto-size columns
  [summarySheet, dataSheet].forEach(sheet => {
    sheet.columns.forEach(column => {
      column.width = 15;
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export default router;