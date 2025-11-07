import './globals.css'
import { Inter } from 'next/font/google'
import { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Análisis Metrológico - Sistema Avanzado',
  description: 'Sistema profesional para análisis metrológico y ajuste de curvas con incertidumbres',
  keywords: 'metrología, análisis estadístico, ajuste de curvas, incertidumbres, física',
  authors: [{ name: 'J. Javier de la Ossa' }],
  openGraph: {
    title: 'Análisis Metrológico',
    description: 'Sistema profesional para análisis metrológico',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased bg-gray-50`}>
        {children}
      </body>
    </html>
  )
}