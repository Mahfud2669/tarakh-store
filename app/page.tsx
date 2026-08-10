import { GameGrid } from "@/components/game-grid"
import { HeroSection } from "@/components/hero-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-600 via-teal-700 to-teal-800 text-white py-4 sm:py-6 px-4 sm:px-6 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-wider animate-fade-in">AKAZA STORE</h1>
          <p className="text-teal-100 mt-1 text-sm sm:text-base animate-fade-in">Game Top-Up Terpercaya</p>
        </div>
      </header>

      {/* Hero Section */}
      <HeroSection />

      {/* Games Grid */}
      <GameGrid />

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 sm:py-8 px-4 sm:px-6">
        <div className="container mx-auto text-center">
          <h3 className="text-lg sm:text-xl font-bold mb-2">AKAZA STORE</h3>
          <p className="text-gray-400 mb-4 text-sm sm:text-base">Toko Top Up Game Online Terpercaya</p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm text-gray-400">
            <span>© 2024 Akaza Store</span>
            <span className="hidden sm:inline">•</span>
            <span>Semua Hak Dilindungi</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
