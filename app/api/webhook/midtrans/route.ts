import { type NextRequest, NextResponse } from "next/server"
import { updateTransactionStatus, getTransactionByOrderId, logTransactionStatus } from "@/lib/database"
import crypto from "crypto"

const MIDTRANS_SERVER_KEY = "Mid-server-GopHRF_jXA9eU-w2yuJTc_vR"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("=== MIDTRANS WEBHOOK ===")
    console.log("Webhook payload:", JSON.stringify(body, null, 2))

    const { order_id, transaction_status, fraud_status, payment_type, transaction_id, signature_key } = body

    // Verify signature
    const expectedSignature = crypto
      .createHash("sha512")
      .update(`${order_id}${transaction_status}${body.gross_amount}${MIDTRANS_SERVER_KEY}`)
      .digest("hex")

    if (signature_key !== expectedSignature) {
      console.error("Invalid signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // Get existing transaction
    const existingTransaction = await getTransactionByOrderId(order_id)
    if (!existingTransaction) {
      console.error("Transaction not found:", order_id)
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    let newStatus = "pending"

    // Determine new status based on Midtrans response
    if (transaction_status === "capture") {
      if (fraud_status === "challenge") {
        newStatus = "challenge"
      } else if (fraud_status === "accept") {
        newStatus = "success"
      }
    } else if (transaction_status === "settlement") {
      newStatus = "success"
    } else if (transaction_status === "cancel" || transaction_status === "deny" || transaction_status === "expire") {
      newStatus = "failed"
    } else if (transaction_status === "pending") {
      newStatus = "pending"
    }

    // Update transaction status
    const updatedTransaction = await updateTransactionStatus(order_id, newStatus, {
      transaction_id,
      status: transaction_status,
      payment_method: payment_type,
    })

    // Log status change
    if (updatedTransaction) {
      await logTransactionStatus(
        updatedTransaction.id,
        existingTransaction.status,
        newStatus,
        `Midtrans webhook: ${transaction_status}`,
      )
    }

    console.log(`Transaction ${order_id} updated to ${newStatus}`)

    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
    })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
