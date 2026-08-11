"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function BaileysPanel() {
  const [status, setStatus] = useState<any>(null)
  const [to, setTo] = useState("")
  const [message, setMessage] = useState("Tes pesan dari Akaza Store")
  const [notice, setNotice] = useState("")
  const load = async () => { const response = await fetch("/api/admin/baileys/status"); const data = await response.json(); setStatus(data); if (!data.success) setNotice(data.error) }
  const send = async () => { setNotice(""); const response = await fetch("/api/admin/baileys/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to, message }) }); const data = await response.json(); setNotice(data.success ? "Pesan berhasil dikirim." : data.error) }
  return <Card className="border-teal-200 bg-white shadow-sm"><CardHeader><CardTitle className="text-teal-800">WhatsApp Testing (Baileys)</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm text-slate-600">Khusus testing. Jalankan worker pada server persisten dan scan QR dari perangkat admin.</p><Button onClick={load}>Mulai / Refresh QR</Button>{status?.qrDataUrl && <img src={status.qrDataUrl} alt="QR code WhatsApp Baileys" className="h-64 w-64 rounded border p-2" />}{status?.status && <p className="text-sm">Status: <strong>{status.status}</strong></p>}<div className="grid gap-2 sm:grid-cols-2"><Input placeholder="Nomor WhatsApp, contoh 62812..." value={to} onChange={(e) => setTo(e.target.value)} /><Input placeholder="Pesan" value={message} onChange={(e) => setMessage(e.target.value)} /></div><Button variant="outline" onClick={send} disabled={!to || !message}>Kirim pesan tes</Button>{notice && <p className="text-sm text-slate-700">{notice}</p>}</CardContent></Card>
}
