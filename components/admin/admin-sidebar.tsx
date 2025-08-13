"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Gamepad2, Package, CreditCard, Settings, BarChart3 } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Games", href: "/admin/games", icon: Gamepad2 },
  { name: "Packages", href: "/admin/packages", icon: Package },
  { name: "Transactions", href: "/admin/transactions", icon: CreditCard },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white shadow-sm border-r min-h-screen">
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-teal-50 text-teal-700 border-r-2 border-teal-500"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
