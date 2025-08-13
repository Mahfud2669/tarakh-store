import type React from "react"
import { redirect } from "next/navigation"
import { getAdminUser } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check authentication
  const user = await getAdminUser()

  if (!user) {
    redirect("/admin/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AdminHeader user={user} />

      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
