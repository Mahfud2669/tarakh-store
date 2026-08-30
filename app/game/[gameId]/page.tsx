'use client'

import { useState, useEffect, use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'
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
  const [showSuccessModal, setShowSuccessModal] = useState(false)
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
          onSuccess: () => { setShowSuccessModal(true); setIsProcessing(false) },
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
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
          <div className="flex items-center justify-between"><h1 className="text-3xl font-bold">AKAZA STORE</h1><CartDrawer /></div>
          <p className="text-teal-100 mt-1">Game Top-Up Terpercaya</p>
        </div>
      </header>

      {/* Game Info & Payment Form */}
      <section className="py-12 px-4 sm:px-6">
        <div className="container mx-auto">
          {/* Game Info */}
          <div className="relative mb-12 min-h-72 overflow-hidden rounded-3xl bg-slate-900 shadow-xl">
            <Image src={game.image_url || '/placeholder.svg'} alt={game.name} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-slate-950/65" />
            <div className="relative flex min-h-72 items-end p-8 sm:p-12">
              <div>
                <h2 className="text-3xl font-bold text-white sm:text-5xl">{game.name}</h2>
                <p className="mt-3 text-lg text-slate-200">Dapatkan mata uang game favorit dengan harga terbaik dan aman</p>
              </div>
              <div className="ml-auto hidden rounded-2xl bg-teal-600 px-5 py-4 text-center text-white sm:block">
                <p className="text-sm font-semibold">Paket Tersedia</p>
                <p className="text-3xl font-bold">{packages.length}</p>
              </div>
            </div>
          </div>

          {packages.length > 0 ? (
            <div className="grid grid-cols-1 gap-8">
              {/* Packages Grid */}
              <div className="rounded-3xl bg-slate-900 p-5 sm:p-7">
                <h3 className="rounded-2xl bg-teal-700 px-5 py-4 text-2xl font-bold text-white">Pilih Paket</h3>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 max-h-96 overflow-y-auto pr-2">
                  {packages.map((pkg) => (
                    <Card key={pkg.id} onClick={() => setSelectedPackage(pkg)} className={`cursor-pointer transition-all ${selectedPackage?.id === pkg.id ? 'ring-2 ring-teal-500 bg-teal-50 shadow-lg' : 'hover:shadow-lg'}`}>
                      <CardContent className="p-4 text-center">
                        <p className="font-bold text-teal-600 text-xl mb-1">{(pkg.diamonds || 0).toLocaleString('id-ID')}</p>
                        {(pkg.bonus || 0) > 0 && <p className="text-orange-600 text-sm font-semibold mb-2">+{(pkg.bonus || 0).toLocaleString('id-ID')} Bonus</p>}
                        <p className="text-gray-800 font-bold">Rp {(pkg.price || 0).toLocaleString('id-ID')}</p>
                        <Button type="button" size="sm" className="mt-3 w-full bg-teal-600 text-white hover:bg-teal-700" onClick={(event) => { event.stopPropagation(); if (!addItem({ gameId: gameId!, gameName: game.name, pkg })) alert('Keranjang hanya dapat berisi package dari satu game.'); else { const cart = document.querySelector('[aria-label="Buka keranjang"]'); cart?.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 450 }) } }}>Masuk Keranjang</Button>
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
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="payment-success-title">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="bg-teal-700 px-6 py-4 text-xl font-bold text-white" id="payment-success-title">caution!</div>
            <div className="space-y-5 p-6 text-slate-700">
              <p>Transaksi mu berhasil, mohon tunggu admin untuk proses selanjutnya!</p>
              <Button className="w-full bg-teal-700 text-white hover:bg-teal-800" onClick={() => setShowSuccessModal(false)}>Mengerti</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
