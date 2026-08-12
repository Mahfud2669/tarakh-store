"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import type { GameTransaction } from "@/lib/database"

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<GameTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentTransactions = async () => {
      try {
        const response = await fetch("/api/admin/transactions?limit=3")
        const data = await response.json()
        if (data.success) {
          setTransactions((data.transactions || []).slice(0, 3))
        }
      } catch (error) {
        console.error("Error fetching recent transactions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentTransactions()
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center justify-between p-3 border rounded-lg">
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-24"></div>
              <div className="h-3 bg-gray-300 rounded w-16"></div>
            </div>
            <div className="h-6 bg-gray-300 rounded w-16"></div>
          </div>
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No recent transactions</p>
      </div>
    )
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

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
          <div className="space-y-1">
            <p className="font-medium text-sm">{transaction.game_name}</p>
            <p className="text-xs text-gray-500">
              {transaction.package_diamonds} diamonds • {transaction.user_id}
            </p>
            <p className="text-xs text-gray-400">{new Date(transaction.created_at).toLocaleDateString("id-ID")}</p>
          </div>
          <div className="text-right space-y-1">
            <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
            <p className="text-sm font-medium">Rp {transaction.amount.toLocaleString("id-ID")}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
