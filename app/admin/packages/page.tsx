"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PackagesTable } from "@/components/admin/packages-table"
import { PackageForm } from "@/components/admin/package-form"
import { Plus } from "lucide-react"
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Packages Management</h2>
          <p className="text-muted-foreground">Manage top-up packages for all games</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Package
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Packages</CardTitle>
        </CardHeader>
        <CardContent>
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
