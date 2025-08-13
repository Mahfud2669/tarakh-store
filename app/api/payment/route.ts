import { type NextRequest, NextResponse } from "next/server"
import { createGameTransaction } from "@/lib/database"

const MIDTRANS_SERVER_KEY = "Mid-server-GopHRF_jXA9eU-w2yuJTc_vR"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { game, package: selectedPackage, userId, serverId, amount } = body

    console.log("=== PAYMENT API REQUEST ===")
    console.log("Request body:", JSON.stringify(body, null, 2))

    // Validate required fields
    if (!game || !selectedPackage || !userId || !amount) {
      console.error("Missing required fields:", {
        game: !!game,
        package: !!selectedPackage,
        userId: !!userId,
        amount: !!amount,
      })
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      )
    }

    // Validate package structure
    if (!selectedPackage.diamonds || !selectedPackage.game_id) {
      console.error("Invalid package structure:", selectedPackage)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid package data",
        },
        { status: 400 },
      )
    }

    // Generate unique order ID
    const orderId = `TARAKH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    console.log("Generated Order ID:", orderId)

    // FIXED: Always try to create transaction in database with better error handling
    let transactionCreated = false
    try {
      console.log("=== ATTEMPTING TO CREATE TRANSACTION IN DATABASE ===")
      const transaction = await createGameTransaction({
        order_id: orderId,
        game_id: selectedPackage.game_id,
        game_name: game,
        user_id: userId,
        server_id: serverId,
        package_diamonds: selectedPackage.diamonds,
        amount: amount,
        customer_email: `player${userId}@tarakhstore.com`,
        customer_phone: "08123456789",
      })

      if (transaction) {
        console.log("✅ Transaction created in database successfully:", transaction.id)
        transactionCreated = true
      } else {
        console.error("❌ Failed to create transaction in database")
      }
    } catch (dbError) {
      console.error("❌ Database error when creating transaction:", dbError)
    }

    // Continue with Midtrans even if database fails
    console.log("Transaction database status:", transactionCreated ? "SUCCESS" : "FAILED")

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

    // Call Midtrans Snap API with better error handling
    let midtransResponse
    let data

    try {
      console.log("=== ATTEMPTING MIDTRANS API CALL ===")
      console.log("URL: https://app.sandbox.midtrans.com/snap/v1/transactions")
      console.log("Headers: Content-Type: application/json, Authorization: Basic [HIDDEN]")

      midtransResponse = await fetch("https://app.sandbox.midtrans.com/snap/v1/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(MIDTRANS_SERVER_KEY + ":").toString("base64")}`,
          Accept: "application/json",
        },
        body: JSON.stringify(transactionDetails),
        // Add timeout and signal for better error handling
        signal: AbortSignal.timeout(30000), // 30 second timeout
      })

      console.log("Midtrans Response Status:", midtransResponse.status)
      console.log("Midtrans Response OK:", midtransResponse.ok)
    } catch (fetchError) {
      console.error("=== MIDTRANS FETCH ERROR ===")
      console.error("Error type:", fetchError.constructor.name)
      console.error("Error message:", fetchError.message)

      // Handle specific network errors
      if (fetchError.name === "TypeError" && fetchError.message.includes("fetch failed")) {
        console.error("Network connectivity issue detected")
        return NextResponse.json(
          {
            success: false,
            error: "Koneksi ke server pembayaran gagal. Silakan cek koneksi internet dan coba lagi.",
            error_type: "network_error",
            details: "Unable to connect to Midtrans payment gateway",
          },
          { status: 503 }, // Service Unavailable
        )
      }

      if (fetchError.name === "AbortError") {
        console.error("Request timeout")
        return NextResponse.json(
          {
            success: false,
            error: "Koneksi ke server pembayaran timeout. Silakan coba lagi.",
            error_type: "timeout_error",
          },
          { status: 504 }, // Gateway Timeout
        )
      }

      // Generic network error
      return NextResponse.json(
        {
          success: false,
          error: "Gagal terhubung ke server pembayaran. Silakan coba lagi nanti.",
          error_type: "connection_error",
          message: fetchError.message,
        },
        { status: 503 },
      )
    }

    // Parse response
    try {
      const responseText = await midtransResponse.text()
      console.log("Midtrans Raw Response:", responseText.substring(0, 500))

      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error("Failed to parse Midtrans response:", parseError)
      return NextResponse.json(
        {
          success: false,
          error: "Respons server pembayaran tidak valid",
          error_type: "parse_error",
        },
        { status: 502 }, // Bad Gateway
      )
    }

    if (midtransResponse.ok && data.token) {
      console.log("=== SUCCESS ===")
      console.log("Token received:", data.token.substring(0, 20) + "...")
      console.log("Database transaction created:", transactionCreated)

      return NextResponse.json({
        success: true,
        token: data.token,
        redirect_url: data.redirect_url,
        order_id: orderId,
        database_status: transactionCreated ? "success" : "failed",
      })
    } else {
      console.error("=== MIDTRANS ERROR ===")
      console.error("Status:", midtransResponse.status)
      console.error("Error Response:", data)

      // Handle specific Midtrans errors
      let userMessage = "Gagal membuat token pembayaran"

      if (midtransResponse.status === 401) {
        userMessage = "Konfigurasi pembayaran tidak valid"
      } else if (midtransResponse.status === 400) {
        userMessage = "Data pembayaran tidak valid"
      } else if (midtransResponse.status >= 500) {
        userMessage = "Server pembayaran sedang bermasalah"
      }

      return NextResponse.json(
        {
          success: false,
          error: userMessage,
          error_type: "midtrans_error",
          status_code: midtransResponse.status,
          details: data.error_messages || data.message || "Unknown Midtrans error",
        },
        { status: midtransResponse.status || 400 },
      )
    }
  } catch (error) {
    console.error("=== PAYMENT API ERROR ===")
    console.error("Error:", error)

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
