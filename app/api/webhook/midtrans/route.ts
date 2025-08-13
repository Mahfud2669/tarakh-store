import { type NextRequest, NextResponse } from "next/server"
import { updateTransactionStatus, getTransactionByOrderId, logTransactionStatus } from "@/lib/database"
import crypto from "crypto"

const MIDTRANS_SERVER_KEY = "Mid-server-GopHRF_jXA9eU-w2yuJTc_vR"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("=== MIDTRANS WEBHOOK ===")
    console.log("Webhook payload:", JSON.stringify(body, null, 2))

    const { order_id, transaction_status, fraud_status, payment_type, transaction_id, signature_key, gross_amount } =
      body

    if (!order_id || !transaction_status || !signature_key) {
      console.error("Missing required webhook fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify signature
    const expectedSignature = crypto
      .createHash("sha512")
      .update(`${order_id}${transaction_status}${gross_amount}${MIDTRANS_SERVER_KEY}`)
      .digest("hex")

    if (signature_key !== expectedSignature) {
      console.error("Invalid signature")
      console.error("Expected:", expectedSignature)
      console.error("Received:", signature_key)
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    console.log("✅ Signature verified successfully")

    // Get existing transaction
    const existingTransaction = await getTransactionByOrderId(order_id)
    if (!existingTransaction) {
      console.error("❌ Transaction not found:", order_id)
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    console.log("✅ Transaction found:", existingTransaction.id)

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

    console.log("Status change:", `${existingTransaction.status} -> ${newStatus}`)

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
      console.log("✅ Transaction status logged successfully")
    }

    console.log(`✅ Transaction ${order_id} updated to ${newStatus}`)

    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
      order_id: order_id,
      old_status: existingTransaction.status,
      new_status: newStatus,
    })
  } catch (error) {
    console.error("=== WEBHOOK ERROR ===")
    console.error("Error details:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
