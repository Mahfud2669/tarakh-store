"use client"

import { FormEvent, useState } from "react"
import { ArrowLeft, ReceiptText } from "lucide-react"

interface Transaction { order_id: string; game_name: string; package_diamonds: number; amount: number; status: string; created_at: string }

export function TransactionDrawer() {
  const [open, setOpen] = useState(false)
  const [userId, setUserId] = useState("")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [closing, setClosing] = useState(false)

  const close = () => { setClosing(true); window.setTimeout(() => { setOpen(false); setClosing(false) }, 300) }
  async function search(event: FormEvent) {
    event.preventDefault(); if (!userId.trim()) return
    setLoading(true); setSearched(true)
    try { const response = await fetch(`/api/transactions/history?userId=${encodeURIComponent(userId.trim())}`); const data = await response.json(); setTransactions(data.transactions ?? []) } finally { setLoading(false) }
  }
  return <>
    <button type="button" aria-label="Buka riwayat transaksi" title="Riwayat transaksi" onClick={() => setOpen(true)} className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white transition hover:bg-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"><ReceiptText className="h-5 w-5" /></button>
    {open && <div className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-sm ${closing ? "animate-out fade-out" : "animate-in fade-in"}`} onClick={close}><aside role="dialog" aria-label="Riwayat transaksi" onClick={(event) => event.stopPropagation()} className={`ml-auto flex h-full w-full max-w-md flex-col rounded-l-3xl bg-white p-6 text-slate-900 shadow-2xl ${closing ? "animate-out slide-out-to-right" : "animate-in slide-in-from-right"} duration-300`}><header className="flex items-center gap-3 border-b border-slate-200 pb-4"><button type="button" aria-label="Tutup riwayat transaksi" onClick={close} className="rounded-md p-1 transition hover:bg-slate-100"><ArrowLeft className="h-5 w-5" /></button><div><h2 className="text-xl font-bold">Riwayat Transaksi</h2><p className="text-sm text-slate-500">Cari berdasarkan User ID</p></div></header><form onSubmit={search} className="mt-5 flex gap-2"><input value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="User ID / Player ID" className="min-h-11 min-w-0 flex-1 rounded-lg border border-slate-300 px-3 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" /><button type="submit" disabled={loading} className="rounded-lg bg-teal-600 px-4 font-semibold text-white hover:bg-teal-700">{loading ? "..." : "Cari"}</button></form><div className="mt-5 flex-1 space-y-3 overflow-y-auto">{searched && !loading && transactions.length === 0 && <p className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">Belum ada transaksi.</p>}{transactions.map((transaction) => <article key={transaction.order_id} className="rounded-xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{transaction.game_name}</h3><p className="text-xs text-slate-500">{transaction.order_id}</p></div><span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">{transaction.status}</span></div><div className="mt-3 flex justify-between text-sm text-slate-600"><span>{transaction.package_diamonds} diamonds</span><span>Rp {Number(transaction.amount).toLocaleString("id-ID")}</span></div></article>)}</div></aside></div>}
  </>
}
