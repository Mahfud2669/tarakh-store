"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { GamePackage, Game } from "@/lib/database"

interface PackageFormProps {
  package: GamePackage | null
  games: Game[]
  onClose: () => void
}

export function PackageForm({ package: pkg, games, onClose }: PackageFormProps) {
  const [formData, setFormData] = useState({
    game_id: "",
    diamonds: 0,
    price: 0,
    bonus: 0,
    is_active: true,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (pkg) {
      setFormData({
        game_id: pkg.game_id,
        diamonds: pkg.diamonds,
        price: pkg.price,
        bonus: pkg.bonus,
        is_active: pkg.is_active,
      })
    }
  }, [pkg])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = pkg ? `/api/admin/packages/${pkg.id}` : "/api/admin/packages"
      const method = pkg ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onClose()
      }
    } catch (error) {
      console.error("Error saving package:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{pkg ? "Edit Package" : "Add New Package"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="game_id">Game</Label>
            <Select value={formData.game_id} onValueChange={(value) => setFormData({ ...formData, game_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a game" />
              </SelectTrigger>
              <SelectContent>
                {games.map((game) => (
                  <SelectItem key={game.game_id} value={game.game_id}>
                    {game.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="diamonds">Diamonds/Credits</Label>
            <Input
              id="diamonds"
              type="number"
              value={formData.diamonds}
              onChange={(e) => setFormData({ ...formData, diamonds: Number.parseInt(e.target.value) || 0 })}
              required
            />
          </div>

          <div>
            <Label htmlFor="price">Price (IDR)</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number.parseInt(e.target.value) || 0 })}
              required
            />
          </div>

          <div>
            <Label htmlFor="bonus">Bonus</Label>
            <Input
              id="bonus"
              type="number"
              value={formData.bonus}
              onChange={(e) => setFormData({ ...formData, bonus: Number.parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
