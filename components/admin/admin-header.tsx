"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import type { AdminUser } from "@/lib/auth"

interface AdminHeaderProps {
  user: AdminUser
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setLoggingOut(true)

    try {
      const response = await fetch("/api/admin/auth/logout", {
        method: "POST",
      })

      if (response.ok) {
        router.push("/admin/login")
        router.refresh()
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Tarakh Store Admin</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>Halo, {user.username}</span>
            </div>

            <a href="/" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
              ← Kembali ke Toko
            </a>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center space-x-2 bg-transparent"
            >
              <LogOut className="w-4 h-4" />
              <span>{loggingOut ? "Keluar..." : "Keluar"}</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
