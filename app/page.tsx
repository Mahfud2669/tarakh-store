import { GameGrid } from "@/components/game-grid"
import { HeroSection } from "@/components/hero-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-600 via-teal-700 to-teal-800 text-white py-6 px-6 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold tracking-wider animate-fade-in">TARAKH STORE</h1>
          <p className="text-teal-100 mt-1 animate-fade-in">Game Top-Up Terpercaya</p>
        </div>
      </header>

      {/* Hero Section */}
      <HeroSection />

      {/* Games Grid */}
      <GameGrid />

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-6">
        <div className="container mx-auto text-center">
          <h3 className="text-xl font-bold mb-2">TARAKH STORE</h3>
          <p className="text-gray-400 mb-4">Toko Top Up Game Online Terpercaya</p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <span>© 2024 Tarakh Store</span>
            <span>•</span>
            <span>Semua Hak Dilindungi</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
