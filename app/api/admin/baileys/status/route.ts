import { NextResponse } from "next/server"
import { getBaileysStatus, startBaileys } from "@/lib/baileys-service"
import { requireAdmin } from "@/lib/auth"

export async function GET() {
  try { await requireAdmin(); await startBaileys(); return NextResponse.json({ success: true, ...getBaileysStatus() }) }
  catch (error) { return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Gagal memulai Baileys" }, { status: 500 }) }
}
