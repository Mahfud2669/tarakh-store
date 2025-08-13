"use client"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { GameTransaction } from "@/lib/database"

interface TransactionsTableProps {
  transactions: GameTransaction[]
  loading: boolean
  onStatusUpdate: (orderId: string, newStatus: string) => void
}

export function TransactionsTable({ transactions, loading, onStatusUpdate }: TransactionsTableProps) {
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
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center space-x-4 p-4">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4">Order ID</th>
            <th className="text-left p-4">Game</th>
            <th className="text-left p-4">User</th>
            <th className="text-left p-4">Amount</th>
            <th className="text-left p-4">Status</th>
            <th className="text-left p-4">Date</th>
            <th className="text-right p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-b hover:bg-gray-50">
              <td className="p-4">
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">{transaction.order_id}</code>
              </td>
              <td className="p-4">
                <div>
                  <p className="font-medium">{transaction.game_name}</p>
                  <p className="text-sm text-gray-500">{transaction.package_diamonds} diamonds</p>
                </div>
              </td>
              <td className="p-4">
                <div>
                  <p className="font-medium">{transaction.user_id}</p>
                  {transaction.server_id && <p className="text-sm text-gray-500">Server: {transaction.server_id}</p>}
                </div>
              </td>
              <td className="p-4">
                <span className="font-medium">Rp {transaction.amount.toLocaleString("id-ID")}</span>
              </td>
              <td className="p-4">
                <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
              </td>
              <td className="p-4 text-sm text-gray-500">
                {new Date(transaction.created_at).toLocaleDateString("id-ID")}
              </td>
              <td className="p-4">
                <Select
                  value={transaction.status}
                  onValueChange={(newStatus) => onStatusUpdate(transaction.order_id, newStatus)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
