"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TransactionFiltersProps {
  filters: {
    status: string
    game_id: string
    date_from: string
    date_to: string
  }
  onFiltersChange: (filters: any) => void
}

export function TransactionFilters({ filters, onFiltersChange }: TransactionFiltersProps) {
  const updateFilter = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
          <SelectTrigger>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="game_id">Game</Label>
        <Select value={filters.game_id} onValueChange={(value) => updateFilter("game_id", value)}>
          <SelectTrigger>
            <SelectValue placeholder="All games" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All games</SelectItem>
            <SelectItem value="ml">Mobile Legends</SelectItem>
            <SelectItem value="pubg">PUBG Mobile</SelectItem>
            <SelectItem value="freefire">Free Fire</SelectItem>
            <SelectItem value="genshin">Genshin Impact</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="date_from">From Date</Label>
        <Input
          id="date_from"
          type="date"
          value={filters.date_from}
          onChange={(e) => updateFilter("date_from", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="date_to">To Date</Label>
        <Input
          id="date_to"
          type="date"
          value={filters.date_to}
          onChange={(e) => updateFilter("date_to", e.target.value)}
        />
      </div>
    </div>
  )
}
