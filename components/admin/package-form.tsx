"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
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

  const selectedGame = games.find((game) => game.game_id === formData.game_id)

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

      const data = await response.json()

      if (response.ok) {
        onClose()
      } else {
        alert(data.error || "Failed to save package")
      }
    } catch (error) {
      console.error("Error saving package:", error)
      alert("Error saving package")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white border-gray-200 shadow-2xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold text-gray-900">
            {pkg ? "Edit Package" : "Add New Package"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="game_id" className="text-sm font-medium text-gray-700">
                Game *
              </Label>
              <Select value={formData.game_id} onValueChange={(value) => setFormData({ ...formData, game_id: value })}>
                <SelectTrigger className="w-full bg-white border-gray-300">
                  <SelectValue placeholder="Select a game" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 shadow-lg z-[100001]">
                  {games.map((game) => (
                    <SelectItem key={game.game_id} value={game.game_id}>
                      <div className="flex items-center space-x-2">
                        <Image src={game.image_url || "/placeholder.svg"} alt={game.name} width={20} height={20} />
                        <span>{game.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="diamonds" className="text-sm font-medium text-gray-700">
                Diamonds/Credits *
              </Label>
              <Input
                id="diamonds"
                type="number"
                value={formData.diamonds}
                onChange={(e) => setFormData({ ...formData, diamonds: Number.parseInt(e.target.value) || 0 })}
                className="w-full bg-white border-gray-300"
                placeholder="Enter amount"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                Price (IDR) *
              </Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number.parseInt(e.target.value) || 0 })}
                className="w-full bg-white border-gray-300"
                placeholder="Enter price in IDR"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonus" className="text-sm font-medium text-gray-700">
                Bonus
              </Label>
              <Input
                id="bonus"
                type="number"
                value={formData.bonus}
                onChange={(e) => setFormData({ ...formData, bonus: Number.parseInt(e.target.value) || 0 })}
                className="w-full bg-white border-gray-300"
                placeholder="Enter bonus amount (optional)"
              />
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Active Package
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
                {loading ? "Saving..." : "Save Package"}
              </Button>
            </div>
          </form>

          {/* Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Preview</h3>

            {selectedGame ? (
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="p-4">
                  <div className="text-center space-y-3">
                    <div
                      className={`w-16 h-16 mx-auto rounded-xl flex items-center justify-center ${selectedGame.color}`}
                    >
                      <Image
                        src={selectedGame.image_url || "/placeholder.svg"}
                        alt={selectedGame.name}
                        width={32}
                        height={32}
                        className="rounded"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{selectedGame.name}</h4>
                      <p className="text-sm text-gray-500">Package Preview</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-lg font-bold text-teal-700">
                        {formData.diamonds.toLocaleString()} {formData.game_id === "ml" ? "💎" : "🪙"}
                      </div>
                      <div className="text-sm text-gray-600">{formData.game_id === "ml" ? "Diamonds" : "Credits"}</div>
                      {formData.bonus > 0 && (
                        <div className="text-xs text-green-600 font-medium">+{formData.bonus} Bonus</div>
                      )}
                      <div className="text-lg font-bold text-gray-800 mt-2">
                        Rp {formData.price.toLocaleString("id-ID")}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="p-8 text-center text-gray-500">
                  <p>Select a game to see preview</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
