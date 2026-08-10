"use client"

import { CheckCircle2, Clock3, X } from "lucide-react"

interface CustomerNotificationProps {
  message: string
  type?: "processing" | "success" | "error"
  onClose: () => void
}

export function CustomerNotification({ message, type = "processing", onClose }: CustomerNotificationProps) {
  const Icon = type === "success" ? CheckCircle2 : type === "error" ? X : Clock3
  const color = type === "success" ? "text-emerald-600" : type === "error" ? "text-red-600" : "text-teal-600"

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4" role="alertdialog" aria-modal="true">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-7 text-center shadow-2xl">
        <button type="button" onClick={onClose} aria-label="Tutup notifikasi" className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          <X className="h-5 w-5" />
        </button>
        <Icon className={`mx-auto mb-4 h-14 w-14 ${color}`} />
        <p className="text-lg font-semibold leading-relaxed text-slate-900">{message}</p>
        <button type="button" onClick={onClose} className="mt-6 rounded-lg bg-teal-600 px-6 py-2.5 font-medium text-white hover:bg-teal-700">Tutup</button>
      </div>
    </div>
  )
}

export default CustomerNotification
