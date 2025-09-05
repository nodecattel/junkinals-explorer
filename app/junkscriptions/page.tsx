"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { API_BASE_URL } from "@/utils/api"

interface Junkscription {
  id: string
  content_type: string
}

export default function JunkscriptionsPage() {
  const [junkscriptions, setJunkscriptions] = useState<Junkscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchJunkscriptions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/junkscriptions?page=${page}&limit=20`)
      if (!response.ok) throw new Error("Failed to fetch junkscriptions")
      const data = await response.json()
      setJunkscriptions((prev) => [...prev, ...data])
      setHasMore(data.length === 20)
      setPage((prev) => prev + 1)
    } catch (error) {
      console.error("Error fetching junkscriptions:", error)
      setError("Failed to load junkscriptions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJunkscriptions()
  }, [page, fetchJunkscriptions]) // Added fetchJunkscriptions to dependencies

  if (loading && junkscriptions.length === 0) return <div className="text-[#ff5e01]">Loading...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <Card className="bg-[#031126] border-[#ff5e01]/20 w-full overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-semibold text-[#ff5e01] vt323-regular">Junkscriptions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {junkscriptions.map((junkscription) => (
            <Link key={junkscription.id} href={`/junkscription/${junkscription.id}`}>
              <div className="aspect-square relative">
                <Card className="absolute inset-0 bg-[#031126] border-[#ff5e01]/20 overflow-hidden">
                  <CardContent className="p-2 h-full flex flex-col justify-between">
                    <div className="aspect-square w-full bg-[#031126] rounded-lg overflow-hidden">
                      <iframe
                        src={`${API_BASE_URL}/preview/${junkscription.id}`}
                        className="w-full h-full"
                        title={`Junkscription ${junkscription.id}`}
                        sandbox="allow-scripts"
                        scrolling="no"
                        loading="lazy"
                      />
                    </div>
                    <div className="mt-2 text-xs text-[hsl(var(--body-text))] ibm-plex-mono-regular truncate text-center">
                      #{junkscription.id.slice(0, 8)}...
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Link>
          ))}
        </div>
        {hasMore && (
          <div className="mt-8 text-center">
            <Button onClick={fetchJunkscriptions} disabled={loading} className="text-[#ff5e01] hover:text-[#ff5e01]/80">
              {loading ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
