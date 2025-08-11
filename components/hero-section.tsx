export function HeroSection() {
  return (
    <section className="relative py-16 px-6 bg-gray-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 game-pattern" />

      <div className="container mx-auto text-center relative z-10">
        {/* Console Illustration */}
        <div className="mb-8 flex justify-center animate-fade-in">
          <div className="w-48 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center border-2 border-gray-300 shadow-lg">
            <div className="text-center">
              {/* Console Body */}
              <div className="w-24 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded mx-auto mb-2 relative shadow-md">
                <div className="absolute top-2 left-2 w-2 h-2 bg-green-400 rounded-full shadow-sm"></div>
                <div className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full shadow-sm"></div>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-600 rounded"></div>
              </div>
              {/* Controller */}
              <div className="w-20 h-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full mx-auto relative shadow-md">
                <div className="absolute top-1 left-2 w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="absolute top-1 right-2 w-2 h-2 bg-yellow-400 rounded-full"></div>
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-gray-500 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-4xl font-bold text-gray-800 mb-4 animate-fade-in">Selamat Datang Di Tarakh Store!</h2>
        <p className="text-xl text-gray-600 mb-8 animate-fade-in">Toko Top Up Game Terpercaya</p>
      </div>
    </section>
  )
}
