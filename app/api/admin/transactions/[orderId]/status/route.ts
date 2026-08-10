import { NextResponse } from "next/server"
import { updateTransactionStatus, logTransactionStatus, getTransactionByOrderId } from "@/lib/database"

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
