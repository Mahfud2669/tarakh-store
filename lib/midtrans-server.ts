'use server'

import axios from 'axios'
import crypto from 'crypto'

const SNAP_API_URL = 'https://app.midtrans.com/snap/v1/transactions'

export interface PaymentParams {
  orderId: string
  gross_amount: number
  customer_details: {
    email: string
    phone?: string
    first_name: string
  }
  item_details: Array<{
    id: string
    price: number
    quantity: number
    name: string
  }>
}

/**
 * Server-side only: Create Midtrans Snap transaction token
 * This should only be called from server actions or API routes
 */
export async function createMidtransTransaction(params: PaymentParams): Promise<{ token: string; redirect_url: string }> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY

  if (!serverKey) {
    throw new Error('Midtrans server key not configured')
  }

  try {
    const auth = Buffer.from(serverKey + ':').toString('base64')

    const response = await axios.post(SNAP_API_URL, params, {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    })

    if (response.status === 201 && response.data.token) {
      return {
        token: response.data.token,
        redirect_url: response.data.redirect_url,
      }
    }

    throw new Error(`Unexpected response: ${response.status}`)
  } catch (error) {
    console.error('Midtrans API Error:', error)
    throw new Error('Failed to create payment token')
  }
}

/**
 * Server-side only: Check transaction status from Midtrans
 */
export async function getMidtransTransactionStatus(orderId: string): Promise<{
  transaction_status: string
  fraud_status?: string
  gross_amount?: number
  transaction_id?: string
}> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY

  if (!serverKey) {
    throw new Error('Midtrans server key not configured')
  }

  try {
    const auth = Buffer.from(serverKey + ':').toString('base64')

    const response = await axios.get(`${SNAP_API_URL}/${orderId}/status`, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
      timeout: 10000,
    })

    return {
      transaction_status: response.data.transaction_status,
      fraud_status: response.data.fraud_status,
      gross_amount: response.data.gross_amount,
      transaction_id: response.data.transaction_id,
    }
  } catch (error) {
    console.error('Midtrans Status Check Error:', error)
    throw new Error('Failed to check transaction status')
  }
}

/**
 * Server-side only: Verify Midtrans webhook signature
 */
export function verifyMidtransWebhook(
  notification: Record<string, any>,
  signature: string,
): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY

  if (!serverKey) {
    console.error('Midtrans server key not configured')
    return false
  }

  try {
    const orderId = notification.order_id
    const statusCode = notification.status_code
    const grossAmount = notification.gross_amount

    const rawString = `${orderId}${statusCode}${grossAmount}${serverKey}`
    const calculatedSignature = crypto
      .createHash('sha512')
      .update(rawString)
      .digest('hex')

    return calculatedSignature === signature
  } catch (error) {
    console.error('Webhook verification error:', error)
    return false
  }
}
