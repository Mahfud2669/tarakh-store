"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestAuth() {
  const [debugInfo, setDebugInfo] = useState(null)
  const [loading, setLoading] = useState(false)

  const testSession = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/debug-session")
      const data = await response.json()
      setDebugInfo(data)
    } catch (error) {
      console.error("Test error:", error)
    } finally {
      setLoading(false)
    }
  }

  const testVerify = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/auth/verify")
      const data = await response.json()
      console.log("Verify result:", data)
      alert(JSON.stringify(data, null, 2))
    } catch (error) {
      console.error("Verify error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Admin Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={testSession} disabled={loading}>
              Test Session Debug
            </Button>
            <Button onClick={testVerify} disabled={loading}>
              Test Auth Verify
            </Button>
          </div>

          {debugInfo && (
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
