import { type NextRequest, NextResponse } from "next/server"
import { createGameTransaction } from "@/lib/database"

const MIDTRANS_SERVER_KEY = "Mid-server-GopHRF_jXA9eU-w2yuJTc_vR"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { game, package: selectedPackage, userId, serverId, amount } = body

    console.log("=== PAYMENT API REQUEST ===")
    console.log("Game:", game)
    console.log("User ID:", userId)
    console.log("Server ID:", serverId)
    console.log("Amount:", amount)
    console.log("Package:", selectedPackage)

    // Validate required fields
    if (!game || !selectedPackage || !userId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate unique order ID
    const orderId = `TARAKH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    console.log("Generated Order ID:", orderId)

    // Create transaction in database (optional, won't fail if table doesn't exist)
    try {
      const transaction = await createGameTransaction({
        order_id: orderId,
        game_id: selectedPackage.game_id || "unknown",
        game_name: game,
        user_id: userId,
        server_id: serverId,
        package_diamonds: selectedPackage.diamonds,
        amount: amount,
        customer_email: `player${userId}@tarakhstore.com`,
        customer_phone: "08123456789",
      })
      if (transaction) {
        console.log("Transaction created in database:", transaction.id)
      }
    } catch (dbError) {
      console.error("Database error (continuing anyway):", dbError)
    }

    // Prepare transaction details for Midtrans
    const transactionDetails = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      credit_card: {
        secure: true,
      },
      item_details: [
        {
          id: selectedPackage.diamonds.toString(),
          price: amount,
          quantity: 1,
          name: `${game} - ${selectedPackage.diamonds} ${game.includes("Mobile Legends") ? "Diamonds" : "Credits"}`,
        },
      ],
      customer_details: {
        first_name: `Player ${userId}`,
        last_name: serverId ? `Server ${serverId}` : "",
        email: `player${userId}@tarakhstore.com`,
        phone: "08123456789",
      },
      custom_field1: game,
      custom_field2: userId,
      custom_field3: serverId || "",
    }

    console.log("=== MIDTRANS REQUEST ===")
    console.log("Transaction Details:", JSON.stringify(transactionDetails, null, 2))

    // Call Midtrans Snap API
    const midtransResponse = await fetch("https://app.sandbox.midtrans.com/snap/v1/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(MIDTRANS_SERVER_KEY + ":").toString("base64")}`,
        Accept: "application/json",
      },
      body: JSON.stringify(transactionDetails),
    })

    console.log("Midtrans Response Status:", midtransResponse.status)

    const responseText = await midtransResponse.text()
    console.log("Midtrans Raw Response:", responseText)

    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error("Failed to parse Midtrans response:", parseError)
      return NextResponse.json({ error: "Invalid response from payment gateway" }, { status: 500 })
    }

    if (midtransResponse.ok && data.token) {
      console.log("=== SUCCESS ===")
      console.log("Token received:", data.token.substring(0, 20) + "...")

      return NextResponse.json({
        success: true,
        token: data.token,
        redirect_url: data.redirect_url,
        order_id: orderId,
      })
    } else {
      console.error("=== MIDTRANS ERROR ===")
      console.error("Error Response:", data)

      return NextResponse.json(
        {
          error: data.error_messages || data.message || "Failed to create payment token",
          details: data,
        },
        { status: midtransResponse.status || 400 },
      )
    }
  } catch (error) {
    console.error("=== PAYMENT API ERROR ===")
    console.error("Error:", error)

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
