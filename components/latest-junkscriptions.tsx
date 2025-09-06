"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { API_BASE_URL } from "@/utils/api"
import { RefreshCw, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

interface Inscription {
  id: string
}

export function LatestJunkscriptions() {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([])
  const [currentBlock, setCurrentBlock] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    setInscriptions([])
    try {
      // Fetch latest inscriptions
      const inscriptionsResponse = await fetch(`${API_BASE_URL}/junkscriptions`)
      if (!inscriptionsResponse.ok) throw new Error("Failed to fetch latest inscriptions")
      const html = await inscriptionsResponse.text()

      const parser = new DOMParser()
      const doc = parser.parseFromString(html, "text/html")
      const thumbnails = doc.querySelectorAll(".thumbnails a")

      const latestInscriptions = Array.from(thumbnails)
        .slice(0, 12)
        .map((el) => ({
          id: el.getAttribute("href")?.split("/").pop() || "",
        }))

      setInscriptions(latestInscriptions)

      // Fetch current block height
      const blockResponse = await fetch(`${API_BASE_URL}/block-count`)
      if (!blockResponse.ok) throw new Error("Failed to fetch current block")
      const blockHeight = await blockResponse.text()
      setCurrentBlock(Number.parseInt(blockHeight.trim(), 10))
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to load latest inscriptions and current block")
    } finally {
      setLoading(false)
    }
  }, [])

  const copyApiEndpoint = () => {
    const endpoint = `${API_BASE_URL}/junkscriptions`
    navigator.clipboard.writeText(endpoint).then(
      () => {
        toast({
          title: "API Endpoint Copied",
          description: "Junkscriptions API endpoint copied to clipboard.",
        })
      },
      (err) => {
        console.error("Could not copy text: ", err)
        toast({
          title: "Copy failed",
          description: "Failed to copy API endpoint.",
          variant: "destructive",
        })
      },
    )
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (error) {
    return <div className="text-red-500 ibm-plex-mono-regular">{error}</div>
  }

  if (inscriptions.length === 0 && !loading) {
    return <div className="text-[#ff5e01] ibm-plex-mono-regular">No inscriptions found.</div>
  }

  return (
    <Card className="bg-[#031126] border-[#ff5e01]/20 w-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl sm:text-2xl font-semibold text-[#ff5e01] vt323-regular">
          Latest Junkscriptions
        </CardTitle>
        <div className="flex items-center space-x-2">
          {currentBlock !== null && (
            <span className="text-sm text-[hsl(var(--body-text))] ibm-plex-mono-regular">
              Current Block: {currentBlock}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={copyApiEndpoint}
            className="text-[#ff5e01] hover:text-[hsl(var(--body-text))]"
            title="Copy API endpoint"
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchData}
            className="text-[#ff5e01] hover:text-[hsl(var(--body-text))]"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-[#ff5e01] ibm-plex-mono-regular">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
            {inscriptions.map((inscription) => (
              <Link
                href={`${API_BASE_URL}/junkscription/${inscription.id}`}
                key={inscription.id}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="aspect-square relative">
                  <Card className="absolute inset-0 bg-[#031126] border-[#ff5e01]/20 overflow-hidden">
                    <CardContent className="p-1 h-full flex flex-col justify-between">
                      <div className="aspect-square w-full bg-[#031126] rounded-lg overflow-hidden">
                        <iframe
                          src={`${API_BASE_URL}/preview/${inscription.id}`}
                          className="w-full h-full"
                          title={`Inscription ${inscription.id}`}
                          sandbox="allow-scripts"
                          scrolling="no"
                          loading="lazy"
                        />
                      </div>
                      <div className="mt-1 text-[0.6rem] sm:text-xs text-[hsl(var(--body-text))] ibm-plex-mono-regular truncate text-center">
                        #{inscription.id.slice(0, 6)}...
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
