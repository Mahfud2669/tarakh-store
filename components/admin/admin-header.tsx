"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, LogOut } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface AdminUser {
  id: number
  username: string
  email?: string
  name?: string
}

interface AdminHeaderProps {
  user: AdminUser
}

interface Transaction {
  id: number
  order_id: string
  game_name: string
  user_id: string
  amount: number
  status: string
  created_at: string
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const [notifications, setNotifications] = useState<Transaction[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [lastReadAt, setLastReadAt] = useState(0)

  useEffect(() => {
    const stored = window.localStorage.getItem("akaza-admin-notifications-read-at")
    if (stored) setLastReadAt(Number(stored))
  }, [])

  // Fetch recent transactions for notifications
  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/admin/transactions?limit=10&recent=true")
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setNotifications(data.transactions || [])
          const recentCount = data.transactions?.filter((t: Transaction) => new Date(t.created_at).getTime() > lastReadAt).length || 0
          setUnreadCount(recentCount)
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Poll for new transactions every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [lastReadAt])

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" })
      window.location.href = "/admin/login"
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Baru saja"
    if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} jam lalu`
    return `${Math.floor(diffInMinutes / 1440)} hari lalu`
  }

  const displayName = user?.name || user?.username || user?.email || "Admin"

  return (
    <header className="relative z-10 bg-gradient-to-r from-teal-600 via-teal-700 to-teal-800 shadow-xl border-b border-teal-800">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">AKAZA STORE</h1>
            <p className="text-teal-100 text-sm">Admin Dashboard</p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Popover onOpenChange={(open) => {
              if (open) {
                const readAt = Date.now()
                window.localStorage.setItem("akaza-admin-notifications-read-at", String(readAt))
                setLastReadAt(readAt)
                setUnreadCount(0)
              }
            }}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="relative text-white hover:bg-teal-600 hover:text-white">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 bg-white border border-gray-200 shadow-lg" align="end">
                <Card className="border-0 shadow-none bg-white">
                  <CardHeader className="pb-3 bg-white">
                    <CardTitle className="text-sm font-medium text-gray-900">Transaksi Terbaru</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 bg-white">
                    <div className="max-h-80 overflow-y-auto bg-white">
                      {notifications.length > 0 ? (
                        <div className="space-y-1">
                          {notifications.map((transaction) => (
                            <div
                              key={transaction.id}
                              className="p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 bg-white"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">{transaction.game_name}</p>
                                  <p className="text-xs text-gray-500">
                                    {transaction.user_id} • Rp {transaction.amount.toLocaleString("id-ID")}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(transaction.created_at)}</p>
                                </div>
                                <Badge className={`text-xs ${getStatusColor(transaction.status)}`}>
                                  {transaction.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-500 bg-white">
                          <p className="text-sm">Tidak ada transaksi terbaru</p>
                        </div>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-gray-100 bg-white">
                        <Link href="/admin/transactions">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                          >
                            Lihat Semua Transaksi
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </PopoverContent>
            </Popover>

            {/* User Menu - Only Logout */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-teal-600 hover:text-white">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold">{displayName.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-sm font-medium">{displayName}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg">
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:bg-red-50 focus:bg-red-50">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
