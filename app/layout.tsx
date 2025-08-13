import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Tarakh Store - Toko Top Up Game Terpercaya",
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
        {/* Preload Midtrans Snap */}
        <link rel="preload" href="https://app.sandbox.midtrans.com/snap/snap.js" as="script" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        {children}

        {/* Midtrans Snap Script - Load with proper configuration */}
        <Script
          id="midtrans-snap"
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key="Mid-client-p2beYI8iXi1qxLJk"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
