import type React from "react"

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Completely isolated layout for login - no auth checks
  return <>{children}</>
}
