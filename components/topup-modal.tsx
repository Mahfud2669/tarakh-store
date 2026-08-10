"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Loader2, Gamepad2 } from "lucide-react"
import type { Game, GamePackage } from "@/lib/database"
import { CustomerNotification } from "@/components/customer-notification"

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
  const [loadingPackages, setLoadingPackages] = useState(false)
  const [packageError, setPackageError] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ message: string; type: "processing" | "success" | "error" } | null>(null)

  // Check Snap loading
  useEffect(() => {
    const checkSnapLoaded = () => {
      if (typeof window !== "undefined") {
        const snapAvailable = window.snap && typeof window.snap.pay === "function"
        setIsSnapLoaded(snapAvailable)
        if (!snapAvailable) {
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

      const fetchPackages = async () => {
        try {
          console.log("=== FETCHING PACKAGES ===")
          console.log("Game ID:", game.game_id)

          const response = await fetch(`/api/games/${game.game_id}/packages`)

          console.log("Response status:", response.status)
          console.log("Response ok:", response.ok)

          // Handle non-200 responses
          if (!response.ok) {
            console.error("API returned error status:", response.status)
            throw new Error(`API Error: ${response.status}`)
          }

          // Check content type
          const contentType = response.headers.get("content-type")
          console.log("Content type:", contentType)

          if (!contentType || !contentType.includes("application/json")) {
            console.error("Non-JSON response received")
            const textResponse = await response.text()
            console.error("Response text:", textResponse.substring(0, 500))
            throw new Error("Server returned non-JSON response")
          }

          // Parse JSON
          const data = await response.json()
          console.log("Parsed data:", data)

          if (data.success && data.packages && Array.isArray(data.packages)) {
            setPackages(data.packages)
            setPackageError(null)
            console.log("✅ Packages loaded successfully:", data.packages.length)
          } else {
            console.error("Invalid data structure:", data)
            throw new Error("Invalid response structure")
          }
        } catch (error) {
          console.error("=== PACKAGE FETCH ERROR ===")
          console.error("Error details:", error)

          // Set user-friendly error message
          if (error instanceof Error) {
            if (error.message.includes("500")) {
              setPackageError("Server sedang bermasalah")
            } else if (error.message.includes("fetch")) {
              setPackageError("Koneksi internet bermasalah")
            } else {
              setPackageError("Gagal memuat paket")
            }
          } else {
            setPackageError("Terjadi kesalahan tidak dikenal")
          }

          // Use fallback packages
          const fallbackPackages = getFallbackPackages(game.game_id)
          setPackages(fallbackPackages)
          console.log("✅ Using fallback packages:", fallbackPackages.length)
        } finally {
          setLoadingPackages(false)
        }
      }

      fetchPackages()
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

    try {
      console.log("=== INITIATING PAYMENT ===")

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

      console.log("Payment API Response Status:", response.status)

      // Handle different error status codes
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))

        let userMessage = "Terjadi kesalahan saat memproses pembayaran"

        if (response.status === 503) {
          userMessage = "Server pembayaran tidak dapat dijangkau. Silakan cek koneksi internet dan coba lagi."
        } else if (response.status === 504) {
          userMessage = "Koneksi ke server pembayaran timeout. Silakan coba lagi."
        } else if (response.status === 502) {
          userMessage = "Server pembayaran memberikan respons yang tidak valid."
        } else if (errorData.error) {
          userMessage = errorData.error
        }

        throw new Error(userMessage)
      }

      const data = await response.json()
      console.log("Payment API Response:", data)

      if (data.success && data.token) {
        console.log("✅ Payment token received successfully")

        // Close modal before opening payment
        onClose()

        setTimeout(() => {
          window.snap.pay(data.token, {
            onSuccess: (result: any) => {
              console.log("Payment success:", result)
              setNotification({ message: "pembayaran berhasil, mohon tunggu sebentar, pembelian mu sedang di proses...", type: "processing" })

              let attempts = 0
              const pollStatus = window.setInterval(async () => {
                attempts += 1
                try {
                  const statusResponse = await fetch(`/api/transactions/${encodeURIComponent(data.order_id)}`)
                  const statusData = await statusResponse.json()
                  if (statusData.transaction?.status === "success") {
                    window.clearInterval(pollStatus)
                    setNotification({ message: "selamat pembelian mu telah berhasil", type: "success" })
                  } else if (statusData.transaction?.status === "failed" || attempts >= 60) {
                    window.clearInterval(pollStatus)
                  }
                } catch {
                  if (attempts >= 60) window.clearInterval(pollStatus)
                }
              }, 5000)
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
      console.error("=== PAYMENT ERROR ===")
      console.error("Error details:", error)

      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan tidak dikenal"
      alert(`❌ ${errorMessage}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const isFormValid = selectedPackage && userId.trim() && (game.game_id !== "ml" || serverId.trim())
  const canPay = isFormValid && isSnapLoaded && !isProcessing

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] overflow-y-auto modal-scroll bg-white">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Gamepad2 className="w-6 h-6 text-teal-600" />
            Top Up {game.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Messages */}
          <div className="space-y-2">
            {/* Snap Status */}
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${
                isSnapLoaded ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"
              }`}
            >
              {isSnapLoaded ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <Loader2 className="w-4 h-4 text-yellow-600 animate-spin" />
              )}
              <p className={`text-sm ${isSnapLoaded ? "text-green-800" : "text-yellow-800"}`}>
                {isSnapLoaded ? "Sistem pembayaran siap" : "Memuat sistem pembayaran..."}
              </p>
            </div>

            {/* Package Error */}
            {packageError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-50 border border-orange-200">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <p className="text-sm text-orange-800">{packageError} - Menggunakan data cadangan</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Form */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </span>
                  Masukkan Data Akun
                </h3>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="userId" className="text-sm font-medium block mb-2">
                      User ID / Player ID *
                    </Label>
                    <Input
                      id="userId"
                      type="text"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder={`Masukkan User ID ${game.name}`}
                      className="w-full h-12"
                      required
                      disabled={isProcessing}
                    />
                  </div>

                  {game.game_id === "ml" && (
                    <div>
                      <Label htmlFor="serverId" className="text-sm font-medium block mb-2">
                        Server ID *
                      </Label>
                      <Input
                        id="serverId"
                        type="text"
                        value={serverId}
                        onChange={(e) => setServerId(e.target.value)}
                        placeholder="Masukkan Server ID"
                        className="w-full h-12"
                        required
                        disabled={isProcessing}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Contoh: 1234 (Server ID dapat ditemukan di profil game)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              {selectedPackage && (
                <div className="bg-white p-4 rounded-lg border-2 border-teal-200 shadow-sm">
                  <h4 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                    <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </span>
                    Ringkasan Pesanan
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Game:</span>
                      <span className="font-medium">{game.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paket:</span>
                      <span className="font-medium">
                        {selectedPackage.diamonds} {game.game_id === "ml" ? "Diamonds" : "Credits"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">User ID:</span>
                      <span className="font-medium truncate max-w-[150px]">{userId || "-"}</span>
                    </div>
                    {serverId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Server ID:</span>
                        <span className="font-medium">{serverId}</span>
                      </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between text-lg font-bold text-teal-700">
                      <span>Total Bayar:</span>
                      <span>Rp {selectedPackage.price.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Button */}
              <div className="space-y-3">
                <Button
                  onClick={handlePayment}
                  disabled={!canPay}
                  className={`w-full h-12 text-base font-semibold ${
                    canPay
                      ? "bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memproses Pembayaran...
                    </>
                  ) : !isSnapLoaded ? (
                    "Memuat Sistem Pembayaran..."
                  ) : !isFormValid ? (
                    "Lengkapi Data Terlebih Dahulu"
                  ) : (
                    <>💳 Bayar Sekarang</>
                  )}
                </Button>

                {!isFormValid && (
                  <p className="text-sm text-red-600 text-center">* Mohon lengkapi semua field yang wajib diisi</p>
                )}

                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Pembayaran aman dengan Midtrans • QRIS • GoPay • Bank Transfer
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Package Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                Pilih Paket Top Up
              </h3>

              {loadingPackages ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {packages
                    .filter(
                      (pkg, index, self) =>
                        index === self.findIndex((p) => p.diamonds === pkg.diamonds && p.price === pkg.price),
                    )
                    .map((pkg) => (
                      <Card
                        key={`${pkg.game_id}-${pkg.diamonds}-${pkg.price}`}
                        className={`cursor-pointer transition-all duration-200 ${
                          selectedPackage?.diamonds === pkg.diamonds && selectedPackage?.price === pkg.price
                            ? "ring-2 ring-teal-500 bg-teal-50 shadow-lg scale-105 border-teal-200"
                            : "hover:shadow-md hover:scale-102 border-gray-200 bg-white"
                        } ${isProcessing ? "pointer-events-none opacity-50" : ""}`}
                        onClick={() => !isProcessing && setSelectedPackage(pkg)}
                      >
                        <CardContent className="p-4 text-center relative">
                          {selectedPackage?.diamonds === pkg.diamonds && selectedPackage?.price === pkg.price && (
                            <div className="absolute -top-2 -right-2">
                              <Badge className="bg-teal-600 text-white">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Dipilih
                              </Badge>
                            </div>
                          )}

                          <div className="text-lg font-bold text-teal-700 mb-1">
                            {pkg.diamonds} {game.game_id === "ml" ? "💎" : "🪙"}
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            {game.game_id === "ml" ? "Diamonds" : "Credits"}
                          </div>
                          {pkg.bonus > 0 && (
                            <div className="text-xs text-green-600 font-medium mb-2">+{pkg.bonus} Bonus</div>
                          )}
                          <div className="text-lg font-bold text-gray-800">Rp {pkg.price.toLocaleString("id-ID")}</div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
      {notification && (
        <CustomerNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </Dialog>
  )
}
