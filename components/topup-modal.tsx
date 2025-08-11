"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Game, GamePackage } from "@/lib/database"

// Declare Midtrans Snap types
declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: any) => void
          onPending?: (result: any) => void
          onError?: (result: any) => void
          onClose?: () => void
        },
      ) => void
    }
  }
}

interface TopUpModalProps {
  game: Game | null
  isOpen: boolean
  onClose: () => void
}

export function TopUpModal({ game, isOpen, onClose }: TopUpModalProps) {
  const [packages, setPackages] = useState<GamePackage[]>([])
  const [selectedPackage, setSelectedPackage] = useState<GamePackage | null>(null)
  const [userId, setUserId] = useState("")
  const [serverId, setServerId] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSnapLoaded, setIsSnapLoaded] = useState(false)
  const [debugInfo, setDebugInfo] = useState("")
  const [loadingPackages, setLoadingPackages] = useState(false)
  const [packageError, setPackageError] = useState<string | null>(null)

  useEffect(() => {
    // More robust check for Snap loading
    const checkSnapLoaded = () => {
      if (typeof window !== "undefined") {
        console.log("Checking Snap availability...")

        // Check if script tag exists
        const scriptExists = document.querySelector('script[src*="snap.js"]')
        console.log("Script tag exists:", !!scriptExists)

        // Check if window.snap is available
        const snapAvailable = window.snap && typeof window.snap.pay === "function"
        console.log("Window.snap available:", snapAvailable)

        if (snapAvailable) {
          setIsSnapLoaded(true)
          setDebugInfo("✅ Midtrans Snap loaded successfully")
          console.log("Midtrans Snap loaded successfully")
        } else {
          setDebugInfo("⏳ Loading Midtrans Snap...")
          // Retry after a longer delay
          setTimeout(checkSnapLoaded, 500)
        }
      }
    }

    // Start checking immediately and also after a delay
    checkSnapLoaded()
    const timer = setTimeout(checkSnapLoaded, 1000)

    return () => clearTimeout(timer)
  }, [isOpen])

  // Fallback packages function
  function getFallbackPackages(gameId: string): GamePackage[] {
    const mlPackages = [
      {
        id: 1,
        game_id: gameId,
        diamonds: 86,
        price: 20000,
        bonus: 0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        game_id: gameId,
        diamonds: 172,
        price: 40000,
        bonus: 0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        game_id: gameId,
        diamonds: 257,
        price: 60000,
        bonus: 0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 4,
        game_id: gameId,
        diamonds: 344,
        price: 80000,
        bonus: 0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 5,
        game_id: gameId,
        diamonds: 429,
        price: 100000,
        bonus: 0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 6,
        game_id: gameId,
        diamonds: 514,
        price: 120000,
        bonus: 0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]

    const defaultPackages = [
      {
        id: 1,
        game_id: gameId,
        diamonds: 100,
        price: 25000,
        bonus: 0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        game_id: gameId,
        diamonds: 200,
        price: 50000,
        bonus: 0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        game_id: gameId,
        diamonds: 300,
        price: 75000,
        bonus: 0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 4,
        game_id: gameId,
        diamonds: 500,
        price: 125000,
        bonus: 0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 5,
        game_id: gameId,
        diamonds: 1000,
        price: 250000,
        bonus: 0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 6,
        game_id: gameId,
        diamonds: 2000,
        price: 500000,
        bonus: 0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]

    return gameId === "ml" ? mlPackages : defaultPackages
  }

  // Fetch packages when game changes
  useEffect(() => {
    if (game && isOpen) {
      setLoadingPackages(true)
      setPackageError(null)

      fetch(`/api/games/${game.game_id}/packages`)
        .then(async (response) => {
          console.log("Packages API response status:", response.status)

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }

          const contentType = response.headers.get("content-type")
          if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text()
            console.error("Non-JSON response:", text.substring(0, 200))
            throw new Error("Server returned non-JSON response")
          }

          return response.json()
        })
        .then((data) => {
          console.log("Packages API response:", data)
          if (data.success && data.packages) {
            setPackages(data.packages)
          } else {
            throw new Error(data.error || "Failed to fetch packages")
          }
        })
        .catch((error) => {
          console.error("Error fetching packages:", error)
          setPackageError(error.message)
          // Use fallback packages
          setPackages(getFallbackPackages(game.game_id))
        })
        .finally(() => {
          setLoadingPackages(false)
        })
    }
  }, [game, isOpen])

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPackage(null)
      setUserId("")
      setServerId("")
      setIsProcessing(false)
    }
  }, [isOpen])

  if (!game) return null

  const handlePayment = async () => {
    console.log("Payment button clicked")
    console.log("Form data:", { selectedPackage, userId, serverId })
    console.log("Snap loaded:", isSnapLoaded)
    console.log("Window.snap:", typeof window !== "undefined" ? !!window.snap : "undefined")

    if (!selectedPackage || !userId) {
      alert("Mohon lengkapi semua data!")
      return
    }

    if (!isSnapLoaded || typeof window === "undefined" || !window.snap) {
      alert("Sistem pembayaran belum siap. Mohon refresh halaman dan coba lagi.")
      return
    }

    setIsProcessing(true)
    setDebugInfo("🔄 Memproses pembayaran...")

    try {
      console.log("Sending payment request to API...")

      const response = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          game: game.name,
          package: { ...selectedPackage, game_id: game.game_id },
          userId,
          serverId,
          amount: selectedPackage.price,
        }),
      })

      console.log("API Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("API Response data:", data)

      if (data.token) {
        setDebugInfo("💳 Membuka halaman pembayaran...")
        console.log("Opening Snap payment with token:", data.token)

        // Close the current modal to prevent z-index conflicts
        onClose()

        // Add a small delay to ensure modal is closed
        setTimeout(() => {
          window.snap.pay(data.token, {
            onSuccess: (result: any) => {
              console.log("Payment success:", result)
              alert("Pembayaran berhasil! Top-up akan diproses dalam beberapa menit.")
              setDebugInfo("✅ Pembayaran berhasil!")
            },
            onPending: (result: any) => {
              console.log("Payment pending:", result)
              alert("Pembayaran pending, silakan selesaikan pembayaran")
              setDebugInfo("⏳ Pembayaran pending...")
            },
            onError: (result: any) => {
              console.error("Payment error:", result)
              alert("Pembayaran gagal! Silakan coba lagi.")
              setDebugInfo("❌ Pembayaran gagal!")
            },
            onClose: () => {
              console.log("Payment popup closed")
              setDebugInfo("🔄 Siap untuk pembayaran")
            },
          })
        }, 300)
      } else {
        throw new Error("Token pembayaran tidak diterima: " + (data.error || "Unknown error"))
      }
    } catch (error) {
      console.error("Payment error:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      alert(`Terjadi kesalahan: ${errorMessage}`)
      setDebugInfo("❌ Error: " + errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const isFormValid = selectedPackage && userId && (game.game_id !== "ml" || serverId)
  const canPay = isFormValid && isSnapLoaded && !isProcessing

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-40">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Top Up {game.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Debug Info */}
          {debugInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">{debugInfo}</p>
            </div>
          )}

          {/* Package Error Info */}
          {packageError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">⚠️ Menggunakan paket fallback: {packageError}</p>
            </div>
          )}

          {/* User ID Input */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="userId">User ID / Player ID *</Label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Masukkan User ID"
                className="mt-1"
                required
              />
            </div>

            {game.game_id === "ml" && (
              <div>
                <Label htmlFor="serverId">Server ID *</Label>
                <Input
                  id="serverId"
                  value={serverId}
                  onChange={(e) => setServerId(e.target.value)}
                  placeholder="Masukkan Server ID"
                  className="mt-1"
                  required
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Package Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Pilih Paket Top Up *</h3>

            {loadingPackages ? (
              <div className="grid grid-cols-2 gap-3">
                {[...Array(6)].map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardContent className="p-4 text-center">
                      <div className="h-6 bg-gray-300 rounded mb-2"></div>
                      <div className="h-6 bg-gray-300 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {packages.map((pkg, index) => (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-all ${
                      selectedPackage === pkg ? "ring-2 ring-teal-500 bg-teal-50" : "hover:shadow-md"
                    }`}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-lg font-bold text-teal-600">
                        {pkg.diamonds} {game.game_id === "ml" ? "Diamonds" : "Credits"}
                      </div>
                      {pkg.bonus > 0 && <div className="text-sm text-green-600">+{pkg.bonus} Bonus</div>}
                      <div className="text-lg font-semibold mt-2">Rp {pkg.price.toLocaleString("id-ID")}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary */}
          {selectedPackage && (
            <>
              <Separator />
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Ringkasan Pesanan</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Game:</span>
                    <span>{game.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paket:</span>
                    <span>
                      {selectedPackage.diamonds} {game.game_id === "ml" ? "Diamonds" : "Credits"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>User ID:</span>
                    <span>{userId || "-"}</span>
                  </div>
                  {serverId && (
                    <div className="flex justify-between">
                      <span>Server ID:</span>
                      <span>{serverId}</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>Rp {selectedPackage.price.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Payment Button */}
          <div className="space-y-2">
            <Button
              onClick={handlePayment}
              disabled={!canPay}
              className={`w-full ${canPay ? "bg-teal-600 hover:bg-teal-700" : "bg-gray-400 cursor-not-allowed"}`}
              size="lg"
            >
              {isProcessing
                ? "Memproses..."
                : !isSnapLoaded
                  ? "Memuat Sistem Pembayaran..."
                  : !isFormValid
                    ? "Lengkapi Data Terlebih Dahulu"
                    : "Bayar Sekarang"}
            </Button>

            {!isFormValid && (
              <p className="text-sm text-red-600 text-center">* Mohon lengkapi semua field yang wajib diisi</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
