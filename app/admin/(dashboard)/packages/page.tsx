"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PackagesTable } from "@/components/admin/packages-table"
import { PackageForm } from "@/components/admin/package-form"
import { Plus, Package, Gamepad2 } from "lucide-react"
import type { GamePackage, Game } from "@/lib/database"

export default function PackagesManagement() {
  const [packages, setPackages] = useState<GamePackage[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPackage, setEditingPackage] = useState<GamePackage | null>(null)

  const fetchData = async () => {
    try {
      const [packagesRes, gamesRes] = await Promise.all([fetch("/api/admin/packages"), fetch("/api/admin/games")])

      const packagesData = await packagesRes.json()
      const gamesData = await gamesRes.json()

      if (packagesData.success) setPackages(packagesData.packages)
      if (gamesData.success) setGames(gamesData.games)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleEdit = (pkg: GamePackage) => {
    setEditingPackage(pkg)
    setShowForm(true)
  }

  const handleDelete = async (packageId: number) => {
    if (!confirm("Are you sure you want to delete this package?")) return

    try {
      const response = await fetch(`/api/admin/packages/${packageId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error("Error deleting package:", error)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingPackage(null)
    fetchData()
  }

  // Get statistics
  const totalPackages = packages.length
  const activePackages = packages.filter((pkg) => pkg.is_active).length
  const gamesWithPackages = new Set(packages.map((pkg) => pkg.game_id)).size

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Packages Management</h2>
          <p className="text-muted-foreground">Manage top-up packages for all games</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Package
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPackages}</div>
            <p className="text-xs text-muted-foreground">{activePackages} active packages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Games with Packages</CardTitle>
            <Gamepad2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gamesWithPackages}</div>
            <p className="text-xs text-muted-foreground">out of {games.length} total games</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average per Game</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gamesWithPackages > 0 ? Math.round(totalPackages / gamesWithPackages) : 0}
            </div>
            <p className="text-xs text-muted-foreground">packages per game</p>
          </CardContent>
        </Card>
      </div>

      {/* Packages Table */}
      <Card>
        <CardContent className="p-0">
          <PackagesTable
            packages={packages}
            games={games}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      {showForm && <PackageForm package={editingPackage} games={games} onClose={handleFormClose} />}
    </div>
  )
}
