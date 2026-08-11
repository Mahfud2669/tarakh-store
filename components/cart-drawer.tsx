"use client"

import { useEffect, useState } from "react"
import { ShoppingCart, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/components/cart-provider"

declare global { interface Window { snap: { pay: (token: string, options?: { onSuccess?: () => void; onPending?: () => void; onError?: () => void; onClose?: () => void }) => void } } }

export function CartDrawer() {
  const { items, removeItem, clear, total } = useCart()
  const [open, setOpen] = useState(false)
  const [phone, setPhone] = useState("")
  const [userId, setUserId] = useState("")
  const [serverId, setServerId] = useState("")
  const [busy, setBusy] = useState(false)
  const [snapReady, setSnapReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkSnap = () => setSnapReady(typeof window !== "undefined" && typeof window.snap?.pay === "function")
    checkSnap()
    const timer = window.setInterval(checkSnap, 500)
    return () => window.clearInterval(timer)
  }, [])

  const checkout = async () => {
    if (!items.length || !phone.trim() || !userId.trim()) return
    if (!snapReady || typeof window.snap?.pay !== "function") {
      setError("Pembayaran belum siap. Tunggu sebentar lalu coba lagi.")
      return
    }
    setBusy(true)
    setError(null)
    try {
      const response = await fetch("/api/payment/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items, phone, userId, serverId }) })
      const data = await response.json()
      if (!response.ok || !data.success || !data.token) throw new Error(data.error || "Gagal membuat pembayaran.")
      window.snap.pay(data.token, { onSuccess: () => { if (data.whatsapp_url) window.open(data.whatsapp_url, "_blank", "noopener,noreferrer"); clear(); setOpen(false); setBusy(false) }, onPending: () => { if (data.whatsapp_url) window.open(data.whatsapp_url, "_blank", "noopener,noreferrer"); setBusy(false) }, onClose: () => setBusy(false), onError: () => { setError("Pembayaran gagal. Silakan coba lagi."); setBusy(false) } })
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Gagal membuat pembayaran.")
      setBusy(false)
    }
  }
  return <>
    <button type="button" aria-label="Buka keranjang" onClick={() => setOpen(true)} className="group relative inline-flex h-10 w-10 items-center justify-center rounded-md text-white transition hover:bg-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"><ShoppingCart className="h-5 w-5" />{items.length > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-orange-500 px-1.5 text-xs font-bold text-white">{items.length}</span>}</button>
    {open && <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm" onClick={() => setOpen(false)}><aside role="dialog" aria-label="Keranjang belanja" onClick={(event) => event.stopPropagation()} className="ml-auto flex h-full w-full max-w-md translate-x-0 animate-in slide-in-from-right flex-col bg-white p-6 text-slate-900 shadow-2xl duration-300"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Keranjang</h2><button type="button" aria-label="Tutup keranjang" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button></div>{items.length === 0 ? <p className="py-10 text-center text-muted-foreground">Keranjang masih kosong.</p> : <><div className="mt-6 flex-1 space-y-3 overflow-y-auto">{items.map((item) => <div key={item.pkg.id} className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-semibold">{item.gameName}</p><p className="text-sm text-muted-foreground">{item.pkg.diamonds.toLocaleString("id-ID")} × {item.quantity}</p><p className="text-sm font-semibold">Rp {(item.pkg.price * item.quantity).toLocaleString("id-ID")}</p></div><button type="button" aria-label="Hapus paket" onClick={() => removeItem(item.pkg.id)}><Trash2 className="h-4 w-4 text-destructive" /></button></div>)}</div><div className="space-y-3 border-t pt-4"><Input placeholder="Nomor WhatsApp" value={phone} onChange={(e) => setPhone(e.target.value)} /><Input placeholder="User ID / Player ID" value={userId} onChange={(e) => setUserId(e.target.value)} /><Input placeholder="Server ID (jika diperlukan)" value={serverId} onChange={(e) => setServerId(e.target.value)} /><div className="flex justify-between font-bold"><span>Total</span><span>Rp {total.toLocaleString("id-ID")}</span></div>{error && <p role="alert" className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}<Button className="w-full" onClick={checkout} disabled={busy || !phone.trim() || !userId.trim()}>{busy ? "Memproses..." : "Bayar"}</Button></div></>}</aside></div>}
  </>
}
