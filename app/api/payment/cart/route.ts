import { NextResponse } from "next/server"
import { createGameTransaction } from "@/lib/database"

export async function POST(request: Request) {
  try {
    const { items, phone, userId, serverId } = await request.json()
    if (!Array.isArray(items) || items.length === 0 || !phone || !userId) return NextResponse.json({ success: false, error: "Keranjang, nomor WhatsApp, dan User ID wajib diisi." }, { status: 400 })
    const gameId = items[0]?.gameId
    if (items.some((item: any) => item.gameId !== gameId)) return NextResponse.json({ success: false, error: "Keranjang hanya boleh berisi satu game." }, { status: 400 })
    const total = items.reduce((sum: number, item: any) => sum + Number(item.pkg.price) * Number(item.quantity), 0)
    if (!Number.isInteger(total) || total <= 0) return NextResponse.json({ success: false, error: "Total transaksi tidak valid." }, { status: 400 })
    const orderId = `AKAZA-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const first = items[0]
    for (const item of items) await createGameTransaction({ order_id: orderId, game_id: gameId, game_name: first.gameName, user_id: String(userId).trim(), server_id: serverId || null, package_diamonds: Number(item.pkg.diamonds) * Number(item.quantity), amount: Number(item.pkg.price) * Number(item.quantity), customer_email: `player${userId}@akaza.store`, customer_phone: String(phone).trim() })
    const details = { transaction_details: { order_id: orderId, gross_amount: total }, item_details: items.map((item: any) => ({ id: String(item.pkg.id), price: Number(item.pkg.price), quantity: Number(item.quantity), name: `${first.gameName} - ${item.pkg.diamonds}` })), customer_details: { first_name: `Player ${userId}`, phone: String(phone).trim() } }
    const serverKey = process.env.MIDTRANS_SERVER_KEY
    if (!serverKey) return NextResponse.json({ success: false, error: "Konfigurasi Midtrans belum tersedia." }, { status: 500 })
    // MIDTRANS_SNAP_URL must be the server API endpoint, never snap.js.
    // Keep the sandbox endpoint as the safe default for this project.
    const snapEndpoint = process.env.MIDTRANS_API_URL?.includes("sandbox")
      ? "https://app.sandbox.midtrans.com/snap/v1/transactions"
      : process.env.MIDTRANS_API_URL?.includes("api.midtrans.com")
        ? "https://app.midtrans.com/snap/v1/transactions"
        : "https://app.sandbox.midtrans.com/snap/v1/transactions"

    const response = await fetch(snapEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`,
      },
      body: JSON.stringify(details),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok || !data.token) {
      console.error("[v0] Midtrans cart error", response.status, data)
      return NextResponse.json({ success: false, error: data.error_messages?.join(", ") || `Midtrans menolak pembayaran (${response.status}).` }, { status: 502 })
    }
    return NextResponse.json({ success: true, token: data.token, order_id: orderId })
  } catch (error) { return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Terjadi kesalahan server." }, { status: 500 }) }
}
