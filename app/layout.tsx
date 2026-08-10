import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Script from "next/script"
import { CartProvider } from "@/components/cart-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Akaza Store - Toko Top Up Game Terpercaya",
  description: "Top up game online terpercaya dengan berbagai pilihan game populer",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <CartProvider>{children}</CartProvider>

        {/* Midtrans Snap Script - Load with proper configuration */}
        <Script
          id="midtrans-snap"
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.MIDTRANS_CLIENT_KEY || ""}
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
