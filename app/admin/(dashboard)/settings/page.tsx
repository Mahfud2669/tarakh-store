"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { User, Calendar, Shield, Key, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react"
import { BaileysPanel } from "@/components/admin/baileys-panel"

interface AdminUser {
  id: number
  username: string
  email?: string
  name?: string
  created_at: string
  role: string
}

export default function SettingsPage() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    username: "",
    name: "",
    email: "",
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/admin/auth/verify")
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user) {
            setUser(data.user)
            setProfileForm({
              username: data.user.username || "",
              name: data.user.name || "",
              email: data.user.email || "",
            })
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    setMessage(null)

    try {
      const response = await fetch("/api/admin/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileForm),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: "success", text: "Profil berhasil diperbarui!" })
        setUser((prev) => (prev ? { ...prev, ...profileForm } : null))
      } else {
        setMessage({ type: "error", text: data.error || "Gagal memperbarui profil" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Terjadi kesalahan saat memperbarui profil" })
    } finally {
      setUpdating(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setChangingPassword(true)
    setMessage(null)

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "Password baru dan konfirmasi password tidak cocok" })
      setChangingPassword(false)
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password baru minimal 6 karakter" })
      setChangingPassword(false)
      return
    }

    try {
      const response = await fetch("/api/admin/profile/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: "success", text: "Password berhasil diubah!" })
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        setMessage({ type: "error", text: data.error || "Gagal mengubah password" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Terjadi kesalahan saat mengubah password" })
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 bg-white min-h-screen p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="animate-pulse bg-gray-200 rounded-lg h-64"></div>
          <div className="animate-pulse bg-gray-200 rounded-lg h-64"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="bg-white p-6 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pengaturan Akun</h1>
          <p className="text-gray-600 mt-1">Kelola informasi akun dan keamanan</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Alert Messages */}
        {message && (
          <Alert className={`bg-white border ${message.type === "success" ? "border-green-200" : "border-red-200"}`}>
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Information */}
          <Card className="bg-white border-teal-200 shadow-sm">
            <CardHeader className="bg-teal-50 border-b border-teal-200">
              <CardTitle className="text-teal-800 flex items-center gap-2">
                <User className="w-5 h-5" />
                Informasi Akun
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white space-y-6">
              {/* Account Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Bergabung</span>
                  </div>
                  <p className="font-medium text-gray-900">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString("id-ID") : "N/A"}
                  </p>
                </div>
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Role</span>
                  </div>
                  <Badge className="bg-teal-100 text-teal-800">{user?.role || "Administrator"}</Badge>
                </div>
              </div>

              <Separator />

              {/* Profile Form */}
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-700">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={profileForm.username}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, username: e.target.value }))}
                    className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700">
                    Nama Lengkap
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>

                <Button type="submit" disabled={updating} className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                  {updating ? "Memperbarui..." : "Perbarui Profil"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card className="bg-white border-teal-200 shadow-sm">
            <CardHeader className="bg-teal-50 border-b border-teal-200">
              <CardTitle className="text-teal-800 flex items-center gap-2">
                <Key className="w-5 h-5" />
                Ubah Password
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white space-y-6">
              {/* Password Form */}
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-gray-700">
                    Password Saat Ini
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                      className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                    >
                      {showPasswords.current ? (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-gray-700">
                    Password Baru
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                      className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500 pr-10"
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                    >
                      {showPasswords.new ? (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700">
                    Konfirmasi Password Baru
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500 pr-10"
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {changingPassword ? "Mengubah Password..." : "Ubah Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      <BaileysPanel />
      </div>
    </div>
  )
}
