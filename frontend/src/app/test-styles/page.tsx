export default function TestStyles() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          ✅ Tailwind CSS Funcionando
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Si ves este mensaje con estilos bonitos, Tailwind CSS está funcionando correctamente.
        </p>
        <div className="space-y-3">
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
            <p className="text-blue-800 font-semibold">✨ Colores funcionando</p>
          </div>
          <div className="bg-green-100 border border-green-300 rounded-lg p-4">
            <p className="text-green-800 font-semibold">✨ Bordes redondeados funcionando</p>
          </div>
          <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
            <p className="text-purple-800 font-semibold">✨ Espaciado funcionando</p>
          </div>
        </div>
        <button className="mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
          🚀 ¡Todo Funciona Perfectamente!
        </button>
      </div>
    </div>
  );
}
