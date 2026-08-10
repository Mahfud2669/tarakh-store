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
      <DialogContent className="max-w-md bg-white border-gray-200 shadow-2xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold text-gray-900">{game ? "Edit Game" : "Add New Game"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="game_id" className="text-sm font-medium text-gray-700">
              Game ID *
            </Label>
            <Input
              id="game_id"
              value={formData.game_id}
              onChange={(e) => setFormData({ ...formData, game_id: e.target.value })}
              placeholder="ml, pubg, etc."
              disabled={!!game}
              required
              className="w-full bg-white border-gray-300"
            />
            {game && <p className="text-xs text-gray-500">Game ID cannot be changed after creation</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Game Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Mobile Legends"
              required
              className="w-full bg-white border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url" className="text-sm font-medium text-gray-700">
              Image URL
            </Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="/game-icon.png"
              className="w-full bg-white border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color" className="text-sm font-medium text-gray-700">
              Color Class
            </Label>
            <Input
              id="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="bg-gradient-to-br from-blue-500 to-blue-600"
              className="w-full bg-white border-gray-300"
            />
            <p className="text-xs text-gray-500">Tailwind CSS gradient class for game card background</p>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Active Game
            </Label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="px-6 bg-teal-600 hover:bg-teal-700 text-white">
              {loading ? "Saving..." : "Save Game"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
