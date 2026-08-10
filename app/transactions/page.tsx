"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { CustomerNotification } from "@/components/customer-notification"

interface Transaction {
  order_id: string
  game_name: string
  package_diamonds: number
  amount: number
  status: string
  created_at: string
}

export default function TransactionHistoryPage() {
  const [userId, setUserId] = useState("")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  async function searchHistory(event: FormEvent) {
    event.preventDefault()
    if (!userId.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const response = await fetch(`/api/transactions/history?userId=${encodeURIComponent(userId.trim())}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setTransactions(data.transactions ?? [])
    } catch (error) {
      setNotification(error instanceof Error ? error.message : "Riwayat transaksi tidak dapat dimuat")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-medium text-teal-700 hover:underline">Kembali ke halaman utama</Link>
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-bold">Riwayat Transaksi</h1>
          <p className="mt-2 text-sm text-slate-500">Masukkan User ID yang digunakan saat pembelian.</p>
          <form onSubmit={searchHistory} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="Contoh: 12345678" className="min-h-11 flex-1 rounded-lg border border-slate-300 px-3 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
            <button type="submit" disabled={loading} className="min-h-11 rounded-lg bg-teal-600 px-5 font-semibold text-white hover:bg-teal-700 disabled:opacity-60">{loading ? "Memuat..." : "Cari transaksi"}</button>
          </form>
        </div>
        <div className="mt-5 space-y-3">
          {searched && !loading && transactions.length === 0 && <div className="rounded-xl bg-white p-6 text-center text-slate-500 ring-1 ring-slate-200">Belum ada transaksi untuk User ID ini.</div>}
          {transactions.map((transaction) => (
            <article key={transaction.order_id} className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><h2 className="font-semibold">{transaction.game_name}</h2><p className="text-xs text-slate-500">{transaction.order_id}</p></div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${transaction.status === "success" ? "bg-emerald-100 text-emerald-700" : transaction.status === "failed" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{transaction.status}</span>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600"><span>{transaction.package_diamonds} diamonds</span><span>Rp {Number(transaction.amount).toLocaleString("id-ID")}</span><span>{new Date(transaction.created_at).toLocaleString("id-ID")}</span><a href={`https://wa.me/?text=${encodeURIComponent(`Riwayat transaksi Akaza Store\nTransaksi ID: ${transaction.order_id}\nGame: ${transaction.game_name}\nStatus: ${transaction.status}\nTotal: Rp ${Number(transaction.amount).toLocaleString("id-ID")}`)}`} target="_blank" rel="noreferrer" className="font-semibold text-teal-700 hover:underline">Kirim ke WhatsApp</a></div>
            </article>
          ))}
        </div>
      </div>
      {notification && <CustomerNotification message={notification} type="error" onClose={() => setNotification(null)} />}
    </main>
  )
}
