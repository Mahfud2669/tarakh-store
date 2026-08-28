import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { sendBaileysMessage } from "@/lib/baileys-service"

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json()
    if (!body.to || !body.message) return NextResponse.json({ success: false, error: "Nomor dan pesan wajib diisi" }, { status: 400 })
    await sendBaileysMessage(String(body.to), String(body.message))
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengirim pesan"
    const errorText = message.includes("terhubung")
      ? `${message} Pastikan service Baileys berjalan pada server persistent dan QR sudah dipindai.`
      : message
    return NextResponse.json({ success: false, error: errorText }, { status: 503 })
  }
}
