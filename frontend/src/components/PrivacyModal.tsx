'use client';

import React, { useState } from 'react';

interface PrivacyModalProps {
  onAccept: () => void;
}

export default function PrivacyModal({ onAccept }: PrivacyModalProps) {
  const [hasRead, setHasRead] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-screen overflow-y-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Política de Privacidad y Tratamiento de Datos
        </h2>
        
        <div className="max-h-96 overflow-y-auto mb-6 text-gray-700 space-y-4 pr-4 border border-gray-200 rounded-lg p-4">
          <p className="text-sm">
            <strong>Última actualización:</strong> {new Date().toLocaleDateString()}
          </p>
          
          <h3 className="font-semibold text-lg mt-4 text-blue-900">1. Recopilación de Información</h3>
          <p className="text-sm">
            Esta aplicación recopila datos técnicos básicos para mejorar la experiencia del usuario, incluyendo:
          </p>
          <ul className="list-disc ml-6 space-y-1 text-sm">
            <li>Número de visitas (contador anónimo almacenado localmente)</li>
            <li>Preferencias de configuración de la aplicación</li>
            <li>Datos de análisis metrológico ingresados por el usuario</li>
            <li>Información técnica del navegador para compatibilidad</li>
          </ul>

          <h3 className="font-semibold text-lg mt-4 text-blue-900">2. Uso de la Información</h3>
          <p className="text-sm">
            Los datos recopilados se utilizan exclusivamente para:
          </p>
          <ul className="list-disc ml-6 space-y-1 text-sm">
            <li>Proporcionar funcionalidad de análisis metrológico</li>
            <li>Mantener preferencias del usuario entre sesiones</li>
            <li>Generar reportes personalizados (PDF, Excel)</li>
            <li>Mejorar la experiencia de usuario de la aplicación</li>
          </ul>

          <h3 className="font-semibold text-lg mt-4 text-blue-900">3. Almacenamiento de Datos</h3>
          <p className="text-sm">
            <strong>Almacenamiento Local:</strong> Los datos se almacenan exclusivamente en su navegador 
            mediante localStorage y sessionStorage. No se envían a servidores externos.
          </p>
          <p className="text-sm mt-2">
            <strong>Datos Temporales:</strong> Los cálculos y análisis se procesan temporalmente en el 
            servidor (si está disponible) pero no se almacenan permanentemente.
          </p>

          <h3 className="font-semibold text-lg mt-4 text-blue-900">4. Datos Científicos</h3>
          <p className="text-sm">
            Los datos experimentales que usted ingrese para análisis metrológico:
          </p>
          <ul className="list-disc ml-6 space-y-1 text-sm">
            <li>Se procesan únicamente para realizar los cálculos solicitados</li>
            <li>No se almacenan permanentemente en servidores</li>
            <li>Permanecen bajo su control total</li>
            <li>Pueden ser exportados en formatos estándar (PDF, Excel, CSV)</li>
          </ul>

          <h3 className="font-semibold text-lg mt-4 text-blue-900">5. Cookies y Tecnologías Similares</h3>
          <p className="text-sm">
            Esta aplicación utiliza únicamente almacenamiento local del navegador (localStorage) 
            para recordar sus preferencias. No se utilizan cookies de terceros ni tecnologías de rastreo.
          </p>

          <h3 className="font-semibold text-lg mt-4 text-blue-900">6. Sus Derechos</h3>
          <p className="text-sm">Usted tiene derecho a:</p>
          <ul className="list-disc ml-6 space-y-1 text-sm">
            <li>Acceder a todos los datos almacenados localmente</li>
            <li>Eliminar todos los datos (limpiando el localStorage del navegador)</li>
            <li>Revocar el consentimiento en cualquier momento</li>
            <li>Exportar sus datos de análisis en formatos estándar</li>
            <li>Utilizar la aplicación sin proporcionar datos opcionales</li>
          </ul>

          <h3 className="font-semibold text-lg mt-4 text-blue-900">7. Seguridad</h3>
          <p className="text-sm">
            Implementamos medidas técnicas apropiadas para proteger sus datos:
          </p>
          <ul className="list-disc ml-6 space-y-1 text-sm">
            <li>Comunicación segura HTTPS</li>
            <li>Procesamiento local cuando sea posible</li>
            <li>No almacenamiento permanente de datos sensibles</li>
            <li>Código fuente abierto para transparencia</li>
          </ul>

          <h3 className="font-semibold text-lg mt-4 text-blue-900">8. Actualizaciones</h3>
          <p className="text-sm">
            Esta política puede actualizarse ocasionalmente. Los cambios significativos 
            serán notificados através de la aplicación.
          </p>

          <h3 className="font-semibold text-lg mt-4 text-blue-900">9. Contacto</h3>
          <p className="text-sm">
            Para consultas sobre privacidad o el tratamiento de datos, contacte a:<br/>
            <strong>J. Javier de la Ossa</strong><br/>
            Físico - Web Development - Data Analytics<br/>
            <em>Desarrollador del Sistema de Análisis Metrológico</em>
          </p>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-semibold text-blue-900 mb-2">Resumen de Privacidad</h4>
            <p className="text-sm text-blue-800">
              ✓ Datos almacenados solo localmente<br/>
              ✓ No rastreo ni cookies de terceros<br/>
              ✓ Procesamiento temporal para cálculos<br/>
              ✓ Control total sobre sus datos científicos<br/>
              ✓ Exportación libre en formatos estándar
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <input 
              type="checkbox" 
              id="readPolicy" 
              checked={hasRead}
              onChange={(e) => setHasRead(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded mt-1"
            />
            <label htmlFor="readPolicy" className="text-sm text-gray-700 flex-1">
              He leído y entendido la política de privacidad y tratamiento de datos. 
              Comprendo que mis datos se almacenan localmente y que tengo control total sobre ellos.
            </label>
          </div>

          <div className="flex items-start space-x-3">
            <input 
              type="checkbox" 
              id="acceptPolicy" 
              className="w-5 h-5 text-blue-600 rounded mt-1"
              onChange={(e) => e.target.checked && hasRead && onAccept()}
              disabled={!hasRead}
            />
            <label htmlFor="acceptPolicy" className="text-sm text-gray-700 flex-1">
              Acepto la política de privacidad y autorizo el procesamiento de mis datos 
              según se describe anteriormente.
            </label>
          </div>

          <button
            onClick={onAccept}
            disabled={!hasRead}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Aceptar y Continuar al Sistema de Análisis
          </button>

          <p className="text-xs text-gray-500 text-center">
            Al continuar, acepta utilizar este sistema de análisis metrológico 
            bajo los términos de privacidad especificados.
          </p>
        </div>
      </div>
    </div>
  );
}