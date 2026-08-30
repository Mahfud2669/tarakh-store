"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Upload, Eye, EyeOff } from "lucide-react"
import Image from "next/image"

interface Game {
  id: number
  name: string
  description: string
  icon_url: string
  image_url?: string
  is_active: boolean
  created_at: string
}

interface GameFormProps {
  game?: Game | null
  onClose: () => void
}

const defaultFormData = {
  name: "",
  description: "",
  icon_url: "",
  image_url: "",
  is_active: true,
}

export function GameForm({ game, onClose }: GameFormProps) {
  const [formData, setFormData] = useState(defaultFormData)
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>("")

  useEffect(() => {
    if (game) {
      setFormData({
        name: game.name || "",
        description: game.description || "",
        icon_url: game.icon_url || "",
        image_url: game.image_url || game.icon_url || "",
        is_active: game.is_active ?? true,
      })
      setImagePreview(game.image_url || game.icon_url || "")
    } else {
      setFormData(defaultFormData)
      setImagePreview("")
    }
  }, [game])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
        const url = game ? `/api/admin/games/${game.id}` : "/api/admin/games"
      const method = game ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onClose()
      } else {
        const error = await response.json()
        alert("Error: " + error.error)
      }
    } catch (error) {
      console.error("Error saving game:", error)
      alert("Terjadi kesalahan saat menyimpan game")
    } finally {
      setLoading(false)
    }
  }

  const handleImageUrlChange = (value: string) => {
    setFormData({ ...formData, icon_url: value })
    setImagePreview(value)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white text-gray-900">
        <CardHeader className="bg-gradient-to-r from-teal-50 to-white border-b border-teal-200">
          <div className="flex justify-between items-center">
            <CardTitle className="text-teal-800">{game ? "Edit Game" : "Tambah Game Baru"}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Form Fields */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Nama Game *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Masukkan nama game"
                    required
                    className="mt-1 border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Deskripsi
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Masukkan deskripsi game"
                    rows={3}
                    className="mt-1 border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <Label htmlFor="icon_url" className="text-sm font-medium text-gray-700">
                    URL Icon Game
                  </Label>
                  <Input
                    id="icon_url"
                    type="url"
                    value={formData.icon_url}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    placeholder="https://example.com/icon.png"
                    className="mt-1 border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <Label htmlFor="image_url" className="text-sm font-medium text-gray-700">URL Banner Game</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/banner-game.jpg"
                    className="mt-1 border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Gunakan gambar landscape untuk banner halaman game.</p>
                </div>

                {/* Status Toggle with Custom Colors */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    {formData.is_active ? (
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Eye className="w-4 h-4 text-green-600" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <EyeOff className="w-4 h-4 text-red-600" />
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium text-gray-900">Status Game</Label>
                      <p className="text-xs text-gray-500">
                        {formData.is_active ? "Game aktif dan dapat diakses" : "Game nonaktif dan tersembunyi"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    className={`${
                      formData.is_active ? "data-[state=checked]:bg-gray-400" : "data-[state=unchecked]:bg-red-500"
                    }`}
                  />
                </div>
              </div>

              {/* Right Column - Preview */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Preview</Label>
                  <div className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                    {imagePreview ? (
                      <div className="text-center">
                        <Image
                          src={imagePreview || "/placeholder.svg"}
                          alt="Preview"
                          width={120}
                          height={120}
                          className="mx-auto rounded-lg object-cover"
                          onError={() => setImagePreview("")}
                        />
                        <p className="mt-2 text-sm text-gray-600">Icon Preview</p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Masukkan URL icon untuk melihat preview</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Game Card Preview */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">Card Preview</Label>
                  <div className="mt-2 p-4 bg-gradient-to-br from-teal-50 to-white border border-teal-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        {imagePreview ? (
                          <Image
                            src={imagePreview || "/placeholder.svg"}
                            alt={formData.name || "Game"}
                            width={48}
                            height={48}
                            className="rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Upload className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                            formData.is_active ? "bg-gray-400" : "bg-red-500"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{formData.name || "Nama Game"}</h3>
                        <p className="text-sm text-gray-500 truncate">{formData.description || "Deskripsi game"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white"
              >
                {loading ? "Menyimpan..." : game ? "Update Game" : "Tambah Game"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
