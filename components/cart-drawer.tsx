"use client"

import { useEffect, useState } from "react"
import { ArrowRight, ShoppingCart, Trash2 } from "lucide-react"
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
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    const checkSnap = () => setSnapReady(typeof window !== "undefined" && typeof window.snap?.pay === "function")
    checkSnap()
    const timer = window.setInterval(checkSnap, 500)
    return () => window.clearInterval(timer)
  }, [])

  const closeDrawer = () => {
    setClosing(true)
    window.setTimeout(() => { setOpen(false); setClosing(false) }, 300)
  }

  const checkout = async () => {
    if (!items.length || !phone.trim() || !userId.trim()) return
    if (!snapReady || typeof window.snap?.pay !== "function") { setError("Pembayaran belum siap. Tunggu sebentar lalu coba lagi."); return }
    setBusy(true); setError(null)
    try {
      const response = await fetch("/api/payment/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items, phone, userId, serverId }) })
      const data = await response.json()
      if (!response.ok || !data.success || !data.token) throw new Error(data.error || "Gagal membuat pembayaran.")
      window.snap.pay(data.token, { onSuccess: () => { clear(); closeDrawer(); setBusy(false) }, onPending: () => setBusy(false), onClose: () => setBusy(false), onError: () => { setError("Pembayaran gagal. Silakan coba lagi."); setBusy(false) } })
    } catch (checkoutError) { setError(checkoutError instanceof Error ? checkoutError.message : "Gagal membuat pembayaran."); setBusy(false) }
  }

  return <>
    <button type="button" aria-label="Buka keranjang" onClick={() => setOpen(true)} className="group relative inline-flex h-10 w-10 items-center justify-center rounded-md text-white transition hover:bg-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"><ShoppingCart className="h-5 w-5" />{items.length > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-orange-500 px-1.5 text-xs font-bold text-white">{items.length}</span>}</button>
    {open && <div className={`fixed inset-0 z-50 bg-black/75 backdrop-blur-sm ${closing ? "animate-out fade-out" : "animate-in fade-in"} duration-300`} onClick={closeDrawer}><aside role="dialog" aria-label="Keranjang belanja" onClick={(event) => event.stopPropagation()} className={`ml-auto flex h-full w-full max-w-md flex-col rounded-l-3xl bg-white text-slate-900 shadow-2xl ${closing ? "animate-out slide-out-to-right" : "animate-in slide-in-from-right"} duration-300`}><header className="flex items-center justify-between rounded-tl-3xl border-b border-slate-200 bg-slate-50 px-6 py-5"><h2 className="text-xl font-bold">Keranjang</h2><button type="button" aria-label="Tutup keranjang" onClick={closeDrawer} className="rounded-md p-1 transition hover:bg-slate-200"><ArrowRight className="h-5 w-5" /></button></header><div className="flex min-h-0 flex-1 flex-col p-6">{items.length === 0 ? <p className="py-10 text-center text-muted-foreground">Keranjang masih kosong.</p> : <><div className="flex-1 space-y-3 overflow-y-auto">{items.map((item) => <div key={item.pkg.id} className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-semibold">{item.gameName}</p><p className="text-sm text-muted-foreground">{item.pkg.diamonds.toLocaleString("id-ID")} × {item.quantity}</p><p className="text-sm font-semibold">Rp {(item.pkg.price * item.quantity).toLocaleString("id-ID")}</p></div><button type="button" aria-label="Hapus paket" onClick={() => removeItem(item.pkg.id)}><Trash2 className="h-4 w-4 text-destructive" /></button></div>)}</div><div className="mt-4 space-y-3 border-t pt-4"><Input placeholder="Nomor WhatsApp" value={phone} onChange={(e) => setPhone(e.target.value)} /><Input placeholder="User ID / Player ID" value={userId} onChange={(e) => setUserId(e.target.value)} /><Input placeholder="Server ID (jika diperlukan)" value={serverId} onChange={(e) => setServerId(e.target.value)} /><div className="flex justify-between font-bold"><span>Total</span><span>Rp {total.toLocaleString("id-ID")}</span></div>{error && <p role="alert" className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}<Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700" onClick={checkout} disabled={busy || !phone.trim() || !userId.trim()}>{busy ? "Memproses..." : "Bayar"}</Button></div></>}</div></aside></div>}
  </>
}
