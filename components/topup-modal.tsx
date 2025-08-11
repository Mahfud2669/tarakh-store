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

  // Check Snap loading
  useEffect(() => {
    const checkSnapLoaded = () => {
      if (typeof window !== "undefined") {
        const snapAvailable = window.snap && typeof window.snap.pay === "function"

        if (snapAvailable) {
          setIsSnapLoaded(true)
          setDebugInfo("✅ Midtrans Snap loaded successfully")
        } else {
          setDebugInfo("⏳ Loading Midtrans Snap...")
          setTimeout(checkSnapLoaded, 500)
        }
      }
    }

    if (isOpen) {
      checkSnapLoaded()
    }
  }, [isOpen])

  // Fallback packages function
  const getFallbackPackages = (gameId: string): GamePackage[] => {
    const mlPackages: GamePackage[] = [
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

    const defaultPackages: GamePackage[] = [
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
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }

          const contentType = response.headers.get("content-type")
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Server returned non-JSON response")
          }

          return response.json()
        })
        .then((data) => {
          if (data.success && data.packages) {
            setPackages(data.packages)
          } else {
            throw new Error(data.error || "Failed to fetch packages")
          }
        })
        .catch((error) => {
          console.error("Error fetching packages:", error)
          setPackageError(error.message)
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
    // Validation
    if (!selectedPackage || !userId.trim()) {
      alert("Mohon lengkapi semua data!")
      return
    }

    if (game.game_id === "ml" && !serverId.trim()) {
      alert("Server ID wajib diisi untuk Mobile Legends!")
      return
    }

    if (!isSnapLoaded || typeof window === "undefined" || !window.snap) {
      alert("Sistem pembayaran belum siap. Mohon refresh halaman dan coba lagi.")
      return
    }

    setIsProcessing(true)
    setDebugInfo("🔄 Memproses pembayaran...")

    try {
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          game: game.name,
          package: { ...selectedPackage, game_id: game.game_id },
          userId: userId.trim(),
          serverId: serverId.trim() || null,
          amount: selectedPackage.price,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()

      if (data.success && data.token) {
        setDebugInfo("💳 Membuka halaman pembayaran...")

        // Close modal before opening payment
        onClose()

        setTimeout(() => {
          window.snap.pay(data.token, {
            onSuccess: (result: any) => {
              console.log("Payment success:", result)
              alert("Pembayaran berhasil! Top-up akan diproses dalam beberapa menit.")
            },
            onPending: (result: any) => {
              console.log("Payment pending:", result)
              alert("Pembayaran pending, silakan selesaikan pembayaran")
            },
            onError: (result: any) => {
              console.error("Payment error:", result)
              alert("Pembayaran gagal! Silakan coba lagi.")
            },
            onClose: () => {
              console.log("Payment popup closed")
            },
          })
        }, 300)
      } else {
        throw new Error(data.error || "Token pembayaran tidak diterima")
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

  const isFormValid = selectedPackage && userId.trim() && (game.game_id !== "ml" || serverId.trim())
  const canPay = isFormValid && isSnapLoaded && !isProcessing

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-center">Top Up {game.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Debug Info */}
          {debugInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs sm:text-sm text-blue-800">{debugInfo}</p>
            </div>
          )}

          {/* Package Error Info */}
          {packageError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs sm:text-sm text-yellow-800">⚠️ Menggunakan paket fallback: {packageError}</p>
            </div>
          )}

          {/* User ID Input */}
          <div className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="userId" className="text-sm sm:text-base block mb-2">
                User ID / Player ID *
              </Label>
              <Input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Masukkan User ID"
                className="w-full"
                required
                disabled={isProcessing}
              />
            </div>

            {game.game_id === "ml" && (
              <div>
                <Label htmlFor="serverId" className="text-sm sm:text-base block mb-2">
                  Server ID *
                </Label>
                <Input
                  id="serverId"
                  type="text"
                  value={serverId}
                  onChange={(e) => setServerId(e.target.value)}
                  placeholder="Masukkan Server ID"
                  className="w-full"
                  required
                  disabled={isProcessing}
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Package Selection */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Pilih Paket Top Up *</h3>

            {loadingPackages ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {[...Array(6)].map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardContent className="p-3 sm:p-4 text-center">
                      <div className="h-5 sm:h-6 bg-gray-300 rounded mb-2"></div>
                      <div className="h-5 sm:h-6 bg-gray-300 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {packages
                  .filter(
                    (pkg, index, self) =>
                      index === self.findIndex((p) => p.diamonds === pkg.diamonds && p.price === pkg.price),
                  )
                  .map((pkg, index) => (
                    <Card
                      key={`${pkg.game_id}-${pkg.diamonds}-${pkg.price}`}
                      className={`cursor-pointer transition-all ${
                        selectedPackage?.diamonds === pkg.diamonds && selectedPackage?.price === pkg.price
                          ? "ring-2 ring-teal-500 bg-teal-50"
                          : "hover:shadow-md"
                      } ${isProcessing ? "pointer-events-none opacity-50" : ""}`}
                      onClick={() => !isProcessing && setSelectedPackage(pkg)}
                    >
                      <CardContent className="p-3 sm:p-4 text-center">
                        <div className="text-base sm:text-lg font-bold text-teal-600">
                          {pkg.diamonds} {game.game_id === "ml" ? "Diamonds" : "Credits"}
                        </div>
                        {pkg.bonus > 0 && <div className="text-xs sm:text-sm text-green-600">+{pkg.bonus} Bonus</div>}
                        <div className="text-base sm:text-lg font-semibold mt-2">
                          Rp {pkg.price.toLocaleString("id-ID")}
                        </div>
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
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Ringkasan Pesanan</h4>
                <div className="space-y-1 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span>Game:</span>
                    <span className="text-right">{game.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paket:</span>
                    <span className="text-right">
                      {selectedPackage.diamonds} {game.game_id === "ml" ? "Diamonds" : "Credits"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>User ID:</span>
                    <span className="text-right truncate max-w-[150px]">{userId || "-"}</span>
                  </div>
                  {serverId && (
                    <div className="flex justify-between">
                      <span>Server ID:</span>
                      <span className="text-right">{serverId}</span>
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
              className={`w-full text-sm sm:text-base ${
                canPay ? "bg-teal-600 hover:bg-teal-700" : "bg-gray-400 cursor-not-allowed"
              }`}
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
              <p className="text-xs sm:text-sm text-red-600 text-center">
                * Mohon lengkapi semua field yang wajib diisi
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
