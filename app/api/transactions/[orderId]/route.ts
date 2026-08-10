import { NextResponse } from "next/server"
import { getTransactionByOrderId } from "@/lib/database"

export async function GET(_request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params
  const transaction = await getTransactionByOrderId(orderId)
  if (!transaction) return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
  return NextResponse.json({ transaction })
}
