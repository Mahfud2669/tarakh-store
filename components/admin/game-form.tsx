"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { Game } from "@/lib/database"

interface GameFormProps {
  game: Game | null
  onClose: () => void
}

export function GameForm({ game, onClose }: GameFormProps) {
  const [formData, setFormData] = useState({
    game_id: "",
    name: "",
    image_url: "",
    color: "",
    is_active: true,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (game) {
      setFormData({
        game_id: game.game_id,
        name: game.name,
        image_url: game.image_url || "",
        color: game.color || "",
        is_active: game.is_active,
      })
    }
  }, [game])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = game ? `/api/admin/games/${game.game_id}` : "/api/admin/games"

      const method = game ? "PUT" : "POST"

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
      console.error("Error saving game:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{game ? "Edit Game" : "Add New Game"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="game_id">Game ID</Label>
            <Input
              id="game_id"
              value={formData.game_id}
              onChange={(e) => setFormData({ ...formData, game_id: e.target.value })}
              placeholder="ml, pubg, etc."
              disabled={!!game}
              required
            />
          </div>

          <div>
            <Label htmlFor="name">Game Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Mobile Legends"
              required
            />
          </div>

          <div>
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="/game-icon.png"
            />
          </div>

          <div>
            <Label htmlFor="color">Color Class</Label>
            <Input
              id="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="bg-gradient-to-br from-blue-500 to-blue-600"
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
