"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TransactionsTable } from "@/components/admin/transactions-table"
import { TransactionFilters } from "@/components/admin/transaction-filters"
import { Search, Filter, CreditCard, TrendingUp, Clock, CheckCircle } from "lucide-react"
import type { GameTransaction } from "@/lib/database"

export default function TransactionsManagement() {
  const [transactions, setTransactions] = useState<GameTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [filters, setFilters] = useState({
    status: "",
    game_id: "",
    date_from: "",
    date_to: "",
  })

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await fetch(`/api/admin/transactions?${params}`)
      const data = await response.json()

      if (data.success) {
        setTransactions(data.transactions)
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [filters])

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/transactions/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchTransactions()
      }
    } catch (error) {
      console.error("Error updating transaction status:", error)
    }
  }

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.game_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Calculate stats
  const totalTransactions = transactions.length
  const successTransactions = transactions.filter((t) => t.status === "success").length
  const pendingTransactions = transactions.filter((t) => t.status === "pending").length
  const totalRevenue = transactions.filter((t) => t.status === "success").reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transactions Management</h1>
        <p className="text-gray-600 mt-1">Monitor dan kelola semua transaksi</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-teal-700">Total Transactions</p>
                <p className="text-3xl font-bold text-teal-900">{totalTransactions}</p>
              </div>
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Success</p>
                <p className="text-3xl font-bold text-green-900">{successTransactions}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">Pending</p>
                <p className="text-3xl font-bold text-yellow-900">{pendingTransactions}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Revenue</p>
                <p className="text-2xl font-bold text-blue-900">Rp {(totalRevenue / 1000000).toFixed(1)}M</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-teal-200">
        <CardHeader>
          <CardTitle className="text-teal-800">Filter Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari berdasarkan Order ID, Game, atau User ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-teal-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 border-teal-200 focus:border-teal-500">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <TransactionFilters filters={filters} onFiltersChange={setFilters} />
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="border-teal-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-teal-50 to-white border-b border-teal-200">
          <CardTitle className="text-teal-800">
            Transactions List ({filteredTransactions.length} dari {totalTransactions})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <TransactionsTable
            transactions={filteredTransactions}
            loading={loading}
            onStatusUpdate={handleStatusUpdate}
          />
        </CardContent>
      </Card>
    </div>
  )
}
