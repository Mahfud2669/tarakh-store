import { NextResponse } from "next/server"
import { refreshBaileysQr } from "@/lib/baileys-service"
import { requireAdmin } from "@/lib/auth"

export async function POST() {
  try {
    await requireAdmin()
    await refreshBaileysQr()
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Gagal membuat QR baru." }, { status: 500 })
  }
}
