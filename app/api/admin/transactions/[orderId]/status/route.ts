import { NextResponse } from "next/server"
import { updateTransactionStatus, logTransactionStatus, getTransactionByOrderId } from "@/lib/database"
import { sendBaileysMessage } from "@/lib/baileys-service"

export async function PATCH(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { status } = await request.json()
    const { orderId } = await params

    // Get current transaction
    const currentTransaction = await getTransactionByOrderId(orderId)
    if (!currentTransaction) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 })
    }

    // Update status
    const updatedTransaction = await updateTransactionStatus(orderId, status)

    // Log the status change
    if (updatedTransaction) {
      await logTransactionStatus(
        updatedTransaction.id,
        currentTransaction.status,
        status,
        "Manual status update by admin",
      )

      if (status === "success" && currentTransaction.status !== "success" && updatedTransaction.customer_phone) {
        const message = [
          "Selamat transaksi anda telah berhasil!",
          "",
          `Transaksi ID: ${orderId}`,
`Transaksi ID : ${orderId}`,
  `User ID : ${updatedTransaction.user_id}`,
  `Game : ${updatedTransaction.game_name}`,
  `Payment : ${updatedTransaction.payment_method || "Midtrans"}`,
  `Tanggal : ${new Date(updatedTransaction.created_at).toLocaleString("id-ID")}`,
  "",
  "Terimakasih telah order di Akaza.Store",
  ].join("\n")
        try {
          await sendBaileysMessage(updatedTransaction.customer_phone, message)
        } catch (notificationError) {
          console.error("[v0] Manual success notification failed", notificationError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      transaction: updatedTransaction,
    })
  } catch (error) {
    console.error("Error updating transaction status:", error)
    return NextResponse.json({ success: false, error: "Failed to update transaction status" }, { status: 500 })
  }
}
