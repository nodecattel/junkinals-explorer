"use client"

import Link from "next/link"
import { Info, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { API_BASE_URL } from "@/utils/api"

export function Header() {
  const [query, setQuery] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSearch = async () => {
    if (query) {
      setError("")
      // Check if the query is a valid junkscription ID or transaction ID
      const isValidId = /^[a-fA-F0-9]{64}i?[0-9]*$/.test(query)

      if (!isValidId) {
        setError("Invalid search query. Please enter a valid junkscription ID or transaction ID.")
        return
      }

      // Determine if it's a junkscription ID or transaction ID
      const isJunkscription = query.includes("i")

      try {
        const endpoint = isJunkscription ? "junkscription" : "tx"
        const url = `${API_BASE_URL}/${endpoint}/${query}`

        const response = await fetch(url)
        if (response.ok) {
          router.push(url)
        } else {
          setError(`No results found for the given ${isJunkscription ? "junkscription" : "transaction"} ID.`)
        }
      } catch (error) {
        console.error("Error during search:", error)
        setError("An error occurred while searching. Please try again.")
      }
    }
  }

  return (
    <header className="border-b border-[#ff5e01]/20 relative z-10">
      <nav className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between">
        <div className="flex flex-wrap items-center space-x-4 mb-2 md:mb-0">
          <Link href="/" className="text-xl font-bold text-[#ff5e01] vt323-regular">
            Junkinals<sup className="text-xs">alpha</sup>
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
            placeholder="Search junkscription or transaction ID..."
            className="w-full md:w-96 bg-[#031126] border-[#ff5e01]/20 text-[#ff5e01] ibm-plex-mono-regular"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button variant="ghost" onClick={handleSearch} className="text-[#ff5e01] hover:text-[#ff5e01]/80">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </nav>
      {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}
    </header>
  )
}
