"use client"

import Link from "next/link"
import { Info, Search, Code, Zap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { junkinalsAPI } from "@/utils/completeApi"

export function Header() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    try {
      // Use universal search to detect and redirect appropriately
      const result = await junkinalsAPI.universalSearch(query.trim())

      // Redirect based on search result type
      switch (result.type) {
        case "address":
          router.push(`/address?q=${encodeURIComponent(query.trim())}`)
          break
        case "junkscription":
          window.open(`https://ord.junkiewally.xyz/junkscription/${query.trim()}`, "_blank")
          break
        case "tx":
          window.open(`https://ord.junkiewally.xyz/tx/${query.trim()}`, "_blank")
          break
        case "block":
          window.open(`https://ord.junkiewally.xyz/block/${query.trim()}`, "_blank")
          break
        default:
          // If type is unknown or multiple results, go to search page
          router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      }
    } catch (error) {
      console.error("Search error:", error)
      // Fallback to search page
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    } finally {
      setLoading(false)
    }
  }

  const getPlaceholder = () => {
    const placeholders = [
      "Search addresses, junkscriptions, transactions...",
      "Try: JKC1abc... or a1b2c3...i0 or block height",
      "Universal search: any address, tx, block, token",
    ]
    return placeholders[Math.floor(Math.random() * placeholders.length)]
  }

  return (
    <header className="border-b border-[#ff5e01]/20 relative z-10">
      <nav className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between">
        <div className="flex flex-wrap items-center space-x-4 mb-2 md:mb-0">
          <Link href="/" className="text-xl font-bold text-[#ff5e01] vt323-regular">
            Junkinals<sup className="text-xs">alpha</sup>
          </Link>
          <Link href="/api" className="text-[#ff5e01]/80 hover:text-[#ff5e01] ibm-plex-mono-regular flex items-center">
            <Code className="w-4 h-4 mr-1" />
            API
          </Link>
          <Link
            href="/search"
            className="text-[#ff5e01]/80 hover:text-[#ff5e01] ibm-plex-mono-regular flex items-center"
          >
            <Zap className="w-4 h-4 mr-1" />
            Search
          </Link>
          <Link
            href="/address"
            className="text-[#ff5e01]/80 hover:text-[#ff5e01] ibm-plex-mono-regular flex items-center"
          >
            <Search className="w-4 h-4 mr-1" />
            Address
          </Link>
          <Link
            href="https://github.com/Junkcoin-Foundation/junkscriptions"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#ff5e01]/80 hover:text-[#ff5e01] ibm-plex-mono-regular flex items-center"
          >
            <Info className="w-4 h-4 mr-1" />
            Github
          </Link>
          <Link
            href="https://junk-coin.com/tutorials/guide-to-junkscriptions-and-junk-20-tokens/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#ff5e01]/80 hover:text-[#ff5e01] ibm-plex-mono-regular flex items-center"
          >
            <Info className="w-4 h-4 mr-1" />
            JUNK-20 Guide
          </Link>
        </div>
        <div className="flex items-center space-x-2 w-full md:w-auto mt-2 md:mt-0">
          <Input
            type="text"
            placeholder={getPlaceholder()}
            className="w-full md:w-96 bg-[#031126] border-[#ff5e01]/20 text-[#ff5e01] ibm-plex-mono-regular"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            disabled={loading}
          />
          <Button
            variant="ghost"
            onClick={handleSearch}
            className="text-[#ff5e01] hover:text-[#ff5e01]/80"
            disabled={loading || !query.trim()}
          >
            <Search className={`h-5 w-5 ${loading ? "animate-pulse" : ""}`} />
          </Button>
        </div>
      </nav>
    </header>
  )
}
