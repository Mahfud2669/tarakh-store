'use client'

import { useState, useEffect, use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import type { Game, GamePackage } from '@/lib/database'
import { useCart } from '@/components/cart-provider'
import { CartDrawer } from '@/components/cart-drawer'

interface GameDetailPageProps {
  params: Promise<{
    gameId: string
  }>
}

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

export default function GameDetailPage({ params: paramsPromise }: GameDetailPageProps) {
  const [gameId, setGameId] = useState<string | null>(null)
  const [game, setGame] = useState<Game | null>(null)
  const [packages, setPackages] = useState<GamePackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPackage, setSelectedPackage] = useState<GamePackage | null>(null)
  const [userId, setUserId] = useState('')
  const [serverId, setServerId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSnapLoaded, setIsSnapLoaded] = useState(false)
  const { addItem } = useCart()

  // Unwrap params promise
  useEffect(() => {
    paramsPromise.then((unwrappedParams) => {
      setGameId(unwrappedParams.gameId)
    })
  }, [paramsPromise])

  // Check Snap availability
  useEffect(() => {
    const checkSnap = () => {
      if (typeof window !== 'undefined' && window.snap && typeof window.snap.pay === 'function') {
        setIsSnapLoaded(true)
      } else {
        setTimeout(checkSnap, 500)
      }
    }
    checkSnap()
  }, [])

  // Fetch game and packages
  useEffect(() => {
    if (!gameId) return

    const fetchGameDetails = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch games
        const gameResponse = await fetch('/api/games')
        if (!gameResponse.ok) throw new Error('Failed to fetch games')

        const gameData = await gameResponse.json()
        const foundGame = (gameData.games || []).find((g: Game) => g.game_id === gameId)

        if (!foundGame) {
          setError('Game tidak ditemukan')
          return
        }

        setGame(foundGame)

        // Fetch packages
        const packagesResponse = await fetch(`/api/games/${gameId}/packages`)
        if (!packagesResponse.ok) throw new Error('Failed to fetch packages')

        const packagesData = await packagesResponse.json()
        if (packagesData.success && Array.isArray(packagesData.packages)) {
          setPackages(packagesData.packages.filter((pkg: GamePackage) => pkg.is_active))
        } else {
          setPackages([])
        }
      } catch (err) {
        console.error('Error fetching game details:', err)
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
      } finally {
        setLoading(false)
      }
    }

    fetchGameDetails()
  }, [gameId])

  const handlePayment = async () => {
    if (!selectedPackage || !userId.trim()) {
      alert('Mohon lengkapi semua data!')
      return
    }

    if (!isSnapLoaded || typeof window === 'undefined' || !window.snap) {
      alert('Sistem pembayaran belum siap. Mohon refresh halaman.')
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game: game?.name,
          package: { ...selectedPackage, game_id: gameId },
          userId: userId.trim(),
          serverId: serverId.trim() || null,
          amount: selectedPackage.price,
        }),
      })

      if (!response.ok) throw new Error('Failed to create payment')

      const data = await response.json()
      if (data.success && data.token) {
        window.snap.pay(data.token, {
          onSuccess: () => alert('Pembayaran berhasil! Top-up akan diproses.'),
          onPending: () => alert('Pembayaran pending.'),
          onError: () => alert('Pembayaran gagal! Silakan coba lagi.'),
          onClose: () => setIsProcessing(false),
        })
      } else {
        throw new Error(data.error || 'Token tidak diterima')
      }
    } catch (err) {
      alert(`Kesalahan: ${err instanceof Error ? err.message : 'Terjadi kesalahan'}`)
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    )
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="container mx-auto">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-800 mb-3">{error || 'Game tidak ditemukan'}</h3>
              <Link href="/">
                <Button className="bg-teal-600 hover:bg-teal-700">Kembali ke Beranda</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const isFormValid = selectedPackage && userId.trim() && (!['ml'].includes(gameId) || serverId.trim())
  const canPay = isFormValid && isSnapLoaded && !isProcessing

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-600 via-teal-700 to-teal-800 text-white py-6 px-4 sm:px-6 shadow-lg">
        <div className="container mx-auto">
          <Link href="/" className="text-teal-100 hover:text-white mb-3 inline-block">
            ← Kembali ke Beranda
          </Link>
          <div className="flex items-center justify-between"><h1 className="text-3xl font-bold">TARAKH STORE</h1><CartDrawer /></div>
          <p className="text-teal-100 mt-1">Game Top-Up Terpercaya</p>
        </div>
      </header>

      {/* Game Info & Payment Form */}
      <section className="py-12 px-4 sm:px-6">
        <div className="container mx-auto">
          {/* Game Info */}
          <Card className="mb-12 border-0 shadow-lg">
            <CardContent className="p-8 sm:p-12">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className={`w-32 h-32 sm:w-40 sm:h-40 ${game.color || 'bg-gray-500'} rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0`}>
                  <Image src={game.image_url || '/placeholder.svg'} alt={game.name} width={120} height={120} className="rounded-lg" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">{game.name}</h2>
                  <p className="text-gray-600 text-lg mb-6">Dapatkan mata uang game favorit dengan harga terbaik dan aman</p>
                  <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-4 inline-block">
                    <p className="text-teal-600 text-sm font-semibold mb-1">Paket Tersedia</p>
                    <p className="text-2xl font-bold text-teal-700">{packages.length}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {packages.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Payment Form */}
              <div>
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
                    <CardTitle>Isi Data Akun & Pilih Paket</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Snap Status */}
                    <div className={`flex items-center gap-2 p-3 rounded-lg ${isSnapLoaded ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                      {isSnapLoaded ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Loader2 className="w-4 h-4 text-yellow-600 animate-spin" />
                      )}
                      <p className={`text-sm ${isSnapLoaded ? 'text-green-800' : 'text-yellow-800'}`}>
                        {isSnapLoaded ? 'Sistem pembayaran siap' : 'Memuat sistem pembayaran...'}
                      </p>
                    </div>

                    {/* User ID */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">User ID / Player ID *</Label>
                      <Input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder={`Masukkan User ID ${game.name}`} className="h-12" disabled={isProcessing} />
                    </div>

                    {/* Server ID for ML */}
                    {gameId === 'ml' && (
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Server ID *</Label>
                        <Input value={serverId} onChange={(e) => setServerId(e.target.value)} placeholder="Masukkan Server ID" className="h-12" disabled={isProcessing} />
                        <p className="text-xs text-gray-500 mt-1">Contoh: 1234 (cek di profil game)</p>
                      </div>
                    )}

                    {/* Order Summary */}
                    {selectedPackage && (
                      <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-4">
                        <h4 className="font-semibold mb-3 text-gray-800">Ringkasan Pesanan</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Game:</span>
                            <span className="font-medium">{game.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Paket:</span>
                            <span className="font-medium">{(selectedPackage.diamonds || 0).toLocaleString('id-ID')}</span>
                          </div>
                          {(selectedPackage.bonus || 0) > 0 && (
                            <div className="flex justify-between text-orange-600">
                              <span>Bonus:</span>
                              <span className="font-medium">+{(selectedPackage.bonus || 0).toLocaleString('id-ID')}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-lg font-bold text-teal-700 border-t border-teal-200 pt-2 mt-2">
                            <span>Total:</span>
                            <span>Rp {(selectedPackage.price || 0).toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Payment Button */}
                    <Button onClick={handlePayment} disabled={!canPay} className={`w-full h-12 font-semibold ${canPay ? 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Memproses...
                        </>
                      ) : !isSnapLoaded ? (
                        'Memuat Sistem...'
                      ) : !isFormValid ? (
                        'Lengkapi Data'
                      ) : (
                        '💳 Bayar Sekarang'
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">Aman dengan Midtrans • QRIS • GoPay • Bank Transfer</p>
                  </CardContent>
                </Card>
              </div>

              {/* Packages Grid */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Pilih Paket</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
                  {packages.map((pkg) => (
                    <Card key={pkg.id} onClick={() => setSelectedPackage(pkg)} className={`cursor-pointer transition-all ${selectedPackage?.id === pkg.id ? 'ring-2 ring-teal-500 bg-teal-50 shadow-lg' : 'hover:shadow-lg'}`}>
                      <CardContent className="p-4 text-center">
                        <p className="font-bold text-teal-600 text-xl mb-1">{(pkg.diamonds || 0).toLocaleString('id-ID')}</p>
                        {(pkg.bonus || 0) > 0 && <p className="text-orange-600 text-sm font-semibold mb-2">+{(pkg.bonus || 0).toLocaleString('id-ID')} Bonus</p>}
                        <p className="text-gray-800 font-bold">Rp {(pkg.price || 0).toLocaleString('id-ID')}</p>
                        <Button type="button" size="sm" className="mt-3 w-full bg-teal-600 hover:bg-teal-700" onClick={(event) => { event.stopPropagation(); if (!addItem({ gameId: gameId!, gameName: game.name, pkg })) alert('Keranjang hanya dapat berisi package dari satu game.') }}>Masuk Keranjang</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Paket Tidak Tersedia</h3>
                <p className="text-gray-600 mb-8">Paket untuk game ini sedang tidak tersedia.</p>
                <Link href="/">
                  <Button className="bg-teal-600 hover:bg-teal-700">Kembali Pilih Game</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  )
}
