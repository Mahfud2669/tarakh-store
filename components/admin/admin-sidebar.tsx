"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Gamepad2,
  Package,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Games",
    href: "/admin/games",
    icon: Gamepad2,
  },
  {
    name: "Packages",
    href: "/admin/packages",
    icon: Package,
  },
  {
    name: "Transactions",
    href: "/admin/transactions",
    icon: CreditCard,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col",
        collapsed ? "w-20" : "w-64",
      )}
    >
      {/* Header */}
      <div className={cn("border-b border-gray-200 flex items-center", collapsed ? "justify-center p-3" : "justify-between p-4")}>
        <div className={cn("flex items-center", collapsed ? "gap-1" : "space-x-2")}>
          <div className={cn("h-8 rounded-lg bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center", collapsed ? "w-14 gap-1" : "w-8")}>
            <span className="text-white font-bold text-sm">T</span>
            <button
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Perbesar sidebar" : "Perkecil sidebar"}
              className="rounded p-0.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-gray-900">AKAZA</h2>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                collapsed ? "justify-center" : "space-x-3",
                isActive
                  ? "bg-teal-600 text-white shadow-sm hover:bg-teal-700"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className={cn("flex-shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4")} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>© 2024 Akaza Store</p>
          <p>Admin Dashboard v1.0</p>
        </div>
        </div>
      )}
    </div>
  )
}
