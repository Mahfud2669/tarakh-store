import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminStats } from "@/components/admin/admin-stats"
import { RecentTransactions } from "@/components/admin/recent-transactions"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your game top-up store</p>
      </div>

      {/* Stats Cards */}
      <AdminStats />

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentTransactions />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <a
                href="/admin/games"
                className="flex items-center p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">🎮</div>
                <div>
                  <p className="font-medium">Manage Games</p>
                  <p className="text-sm text-gray-500">Add, edit, or remove games</p>
                </div>
              </a>

              <a
                href="/admin/packages"
                className="flex items-center p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">💎</div>
                <div>
                  <p className="font-medium">Manage Packages</p>
                  <p className="text-sm text-gray-500">Configure top-up packages</p>
                </div>
              </a>

              <a
                href="/admin/transactions"
                className="flex items-center p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">💳</div>
                <div>
                  <p className="font-medium">View Transactions</p>
                  <p className="text-sm text-gray-500">Monitor payment status</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
