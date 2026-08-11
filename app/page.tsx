import Link from "next/link"
import { ReceiptText } from "lucide-react"
import { GameGrid } from "@/components/game-grid"
import { HeroSection } from "@/components/hero-section"
import { CartDrawer } from "@/components/cart-drawer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-600 via-teal-700 to-teal-800 text-white py-4 sm:py-6 px-4 sm:px-6 shadow-lg">
        <div className="container mx-auto">
          <div className="flex items-center justify-between"><h1 className="text-2xl sm:text-3xl font-bold tracking-wider animate-fade-in">AKAZA STORE</h1><div className="flex items-center gap-1"><CartDrawer /><Link href="/transactions" aria-label="Buka riwayat transaksi" title="Riwayat transaksi" className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white transition hover:bg-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"><ReceiptText className="h-5 w-5" /></Link></div></div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-teal-100 mt-1 text-sm sm:text-base animate-fade-in">Game Top-Up Terpercaya</p>
          </div>
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
