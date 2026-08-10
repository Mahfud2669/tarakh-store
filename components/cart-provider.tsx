"use client"

import { createContext, useContext, useMemo, useState } from "react"
import type { GamePackage } from "@/lib/database"

export type CartItem = { gameId: string; gameName: string; pkg: GamePackage; quantity: number }
type CartContextValue = { items: CartItem[]; addItem: (item: Omit<CartItem, "quantity">) => boolean; removeItem: (id: number) => void; clear: () => void; total: number; gameId: string | null }
const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const addItem = (item: Omit<CartItem, "quantity">) => {
    if (items.length > 0 && items[0].gameId !== item.gameId) return false
    setItems((current) => {
      const found = current.find((entry) => entry.pkg.id === item.pkg.id)
      return found ? current.map((entry) => entry.pkg.id === item.pkg.id ? { ...entry, quantity: entry.quantity + 1 } : entry) : [...current, { ...item, quantity: 1 }]
    })
    return true
  }
  const removeItem = (id: number) => setItems((current) => current.filter((item) => item.pkg.id !== id))
  const value = useMemo(() => ({ items, addItem, removeItem, clear: () => setItems([]), total: items.reduce((sum, item) => sum + item.pkg.price * item.quantity, 0), gameId: items[0]?.gameId ?? null }), [items])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
export function useCart() { const context = useContext(CartContext); if (!context) throw new Error("useCart must be used within CartProvider"); return context }
