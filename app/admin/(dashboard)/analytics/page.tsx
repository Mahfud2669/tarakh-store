"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Gamepad2,
  CreditCard,
  Target,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react"

interface AnalyticsData {
  totalRevenue: number
  totalTransactions: number
  totalUsers: number
  avgTransaction: number
  successRate: number
  popularGames: Array<{
    game_name: string
    transaction_count: number
    revenue: number
  }>
  monthlyRevenue: Array<{
    month: string
    revenue: number
    transactions: number
  }>
  statusDistribution: Array<{
    status: string
    count: number
    revenue: number
  }>
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalTransactions: 0,
    totalUsers: 0,
    avgTransaction: 0,
    successRate: 0,
    popularGames: [],
    monthlyRevenue: [],
    statusDistribution: [],
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30")

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/analytics?days=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setAnalyticsData(data.analytics)
        }
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <CreditCard className="w-4 h-4 text-gray-600" />
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

  if (loading) {
    return (
      <div className="space-y-6 bg-white min-h-screen p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-32"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="bg-white p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Analisis performa transaksi dan revenue</p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40 bg-white border-teal-200 focus:border-teal-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="7">7 Hari Terakhir</SelectItem>
                <SelectItem value="30">30 Hari Terakhir</SelectItem>
                <SelectItem value="90">90 Hari Terakhir</SelectItem>
                <SelectItem value="365">1 Tahun Terakhir</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white border-teal-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-teal-700">Total Revenue</p>
                  <p className="text-2xl font-bold text-teal-900">{formatCurrency(analyticsData.totalRevenue)}</p>
                  <p className="text-xs text-teal-600 mt-1">{timeRange} hari terakhir</p>
                </div>
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-blue-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Transaksi</p>
                  <p className="text-3xl font-bold text-blue-900">{analyticsData.totalTransactions.toLocaleString()}</p>
                  <p className="text-xs text-blue-600 mt-1">{timeRange} hari terakhir</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-green-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Pengguna Aktif</p>
                  <p className="text-3xl font-bold text-green-900">{analyticsData.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1">Unique users</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-purple-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Rata-rata Transaksi</p>
                  <p className="text-2xl font-bold text-purple-900">{formatCurrency(analyticsData.avgTransaction)}</p>
                  <p className="text-xs text-purple-600 mt-1">Per transaksi</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Games */}
          <Card className="bg-white border-teal-200 shadow-sm">
            <CardHeader className="bg-teal-50 border-b border-teal-200">
              <CardTitle className="text-teal-800 flex items-center gap-2">
                <Gamepad2 className="w-5 h-5" />
                Game Terpopuler
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              <div className="space-y-4">
                {analyticsData.popularGames.length > 0 ? (
                  analyticsData.popularGames.slice(0, 5).map((game, index) => (
                    <div
                      key={game.game_name}
                      className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-teal-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{game.game_name}</p>
                          <p className="text-sm text-gray-500">{game.transaction_count} transaksi</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(game.revenue)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-white">
                    <Gamepad2 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Belum ada data transaksi</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card className="bg-white border-teal-200 shadow-sm">
            <CardHeader className="bg-teal-50 border-b border-teal-200">
              <CardTitle className="text-teal-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Status Transaksi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              <div className="space-y-4">
                {analyticsData.statusDistribution.length > 0 ? (
                  analyticsData.statusDistribution.map((status) => (
                    <div
                      key={status.status}
                      className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(status.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 capitalize">{status.status}</p>
                            <Badge className={getStatusColor(status.status)}>{status.count}</Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            {((status.count / analyticsData.totalTransactions) * 100).toFixed(1)}% dari total
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(status.revenue)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-white">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Belum ada data status</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Revenue Trend */}
        <Card className="bg-white border-teal-200 shadow-sm">
          <CardHeader className="bg-teal-50 border-b border-teal-200">
            <CardTitle className="text-teal-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Tren Revenue Bulanan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-white">
            <div className="space-y-4">
              {analyticsData.monthlyRevenue.length > 0 ? (
                analyticsData.monthlyRevenue.map((month) => (
                  <div
                    key={month.month}
                    className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{month.month}</p>
                      <p className="text-sm text-gray-500">{month.transactions} transaksi</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(month.revenue)}</p>
                      <div className="w-32 h-2 bg-gray-200 rounded-full mt-2">
                        <div
                          className="h-2 bg-teal-500 rounded-full"
                          style={{
                            width: `${Math.min((month.revenue / Math.max(...analyticsData.monthlyRevenue.map((m) => m.revenue))) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-white">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Belum ada data revenue bulanan</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Success Rate Card */}
        <Card className="bg-white border-teal-200 shadow-sm">
          <CardHeader className="bg-teal-50 border-b border-teal-200">
            <CardTitle className="text-teal-800 text-center">Tingkat Keberhasilan Transaksi</CardTitle>
          </CardHeader>
          <CardContent className="p-8 bg-white">
            <div className="text-center">
              <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-teal-600" />
              </div>
              <p className="text-4xl font-bold text-teal-900 mb-2">{analyticsData.successRate}%</p>
              <p className="text-gray-600">Transaksi berhasil dari total {analyticsData.totalTransactions} transaksi</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
