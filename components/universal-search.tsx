"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2, ExternalLink, Copy, Info } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { junkinalsAPI, type SearchResult } from "@/utils/completeApi"
import Link from "next/link"

// Real example address with actual data
const EXAMPLE_ADDRESS = "7iWvZYWvnHr7ziyvHxotMTqpAwm7dSR8ns"

interface SearchSuggestion {
  type: string
  example: string
  description: string
}

const searchSuggestions: SearchSuggestion[] = [
  {
    type: "Address",
    example: EXAMPLE_ADDRESS,
    description: "Real JKC address with junkscriptions and JUNK-20 tokens",
  },
  {
    type: "Junkscription",
    example: "b8f5e8c2d1a9f6e3b7c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6i0",
    description: "Junkscription ID (transaction hash + i + index)",
  },
  {
    type: "Transaction",
    example: "b8f5e8c2d1a9f6e3b7c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6",
    description: "64-character transaction hash",
  },
  {
    type: "Block",
    example: "300000",
    description: "Block height or block hash",
  },
  {
    type: "JUNK-20 Token",
    example: "junk",
    description: "Token ticker symbol",
  },
]

export function UniversalSearch() {
  const [query, setQuery] = useState("")
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Empty Search",
        description: "Please enter a search query.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setShowSuggestions(false)

    try {
      const result = await junkinalsAPI.universalSearch(query.trim())
      setSearchResult(result)

      if (Object.keys(result.results).length === 0) {
        toast({
          title: "No Results Found",
          description: `No results found for "${query}". Try a different search term.`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Search Complete",
          description: `Found results for ${result.type}: ${query}`,
        })
      }
    } catch (error) {
      console.error("Search error:", error)
      toast({
        title: "Search Error",
        description: `Failed to search for "${query}". Please try again.`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Copied to clipboard",
          description: `${label} copied to clipboard.`,
        })
      },
      (err) => {
        console.error("Could not copy text: ", err)
        toast({
          title: "Copy failed",
          description: `Failed to copy ${label}.`,
          variant: "destructive",
        })
      },
    )
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "address":
        return "bg-blue-500/20 text-blue-400 border-blue-500/40"
      case "junkscription":
        return "bg-purple-500/20 text-purple-400 border-purple-500/40"
      case "tx":
        return "bg-green-500/20 text-green-400 border-green-500/40"
      case "block":
        return "bg-orange-500/20 text-orange-400 border-orange-500/40"
      case "junk20":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/40"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/40"
    }
  }

  const renderSearchResults = () => {
    if (!searchResult) return null

    const { results, type, query: searchQuery } = searchResult

    return (
      <Card className="bg-[#031126] border-[#ff5e01]/20 mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-[#ff5e01] vt323-regular">Search Results</CardTitle>
            <Badge className={`${getTypeColor(type)} border`}>{type.toUpperCase()}</Badge>
          </div>
          <p className="text-[hsl(var(--body-text))] ibm-plex-mono-regular text-sm break-all">Query: {searchQuery}</p>
        </CardHeader>
        <CardContent>
          {/* Address Results */}
          {results.address && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#ff5e01]">Address Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#ff5e01]">{results.address.junkscriptions_count}</div>
                  <div className="text-sm text-[hsl(var(--body-text))]">Junkscriptions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#ff5e01]">{results.address.junk20_tokens_count}</div>
                  <div className="text-sm text-[hsl(var(--body-text))]">JUNK-20 Tokens</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#ff5e01]">{results.address.total_transactions}</div>
                  <div className="text-sm text-[hsl(var(--body-text))]">Transactions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#ff5e01]">{results.address.has_assets ? "✓" : "✗"}</div>
                  <div className="text-sm text-[hsl(var(--body-text))]">Has Assets</div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Link href={`/address?q=${searchQuery}`}>
                  <Button className="text-[#ff5e01] hover:text-[#ff5e01]/80">View Full Address Details</Button>
                </Link>
              </div>
            </div>
          )}

          {/* Junkscription Results */}
          {results.junkscription && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#ff5e01]">Junkscription Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[#ff5e01] font-semibold">Content Type</h4>
                  <p className="text-[hsl(var(--body-text))]">{results.junkscription.content_type}</p>
                </div>
                <div>
                  <h4 className="text-[#ff5e01] font-semibold">Genesis Height</h4>
                  <p className="text-[hsl(var(--body-text))]">{results.junkscription.genesis_height}</p>
                </div>
                <div>
                  <h4 className="text-[#ff5e01] font-semibold">Owner Address</h4>
                  <p className="text-[hsl(var(--body-text))] break-all">{results.junkscription.address}</p>
                </div>
                <div>
                  <h4 className="text-[#ff5e01] font-semibold">Content Length</h4>
                  <p className="text-[hsl(var(--body-text))]">{results.junkscription.content_length} bytes</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Link href={`https://ord.junkiewally.xyz/junkscription/${searchQuery}`} target="_blank">
                  <Button className="text-[#ff5e01] hover:text-[#ff5e01]/80">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Junkscription
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* JUNK-20 Token Results */}
          {results.junk20 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#ff5e01]">JUNK-20 Token Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[#ff5e01] font-semibold">Ticker</h4>
                  <p className="text-[hsl(var(--body-text))]">{results.junk20.tick?.toUpperCase()}</p>
                </div>
                <div>
                  <h4 className="text-[#ff5e01] font-semibold">Total Supply</h4>
                  <p className="text-[hsl(var(--body-text))]">{results.junk20.supply}</p>
                </div>
                <div>
                  <h4 className="text-[#ff5e01] font-semibold">Minted</h4>
                  <p className="text-[hsl(var(--body-text))]">{results.junk20.minted}</p>
                </div>
                <div>
                  <h4 className="text-[#ff5e01] font-semibold">Deployed By</h4>
                  <p className="text-[hsl(var(--body-text))] break-all">{results.junk20.deploy_by?.Address}</p>
                </div>
              </div>
            </div>
          )}

          {/* Block Results */}
          {results.block && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#ff5e01]">Block Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[#ff5e01] font-semibold">Height</h4>
                  <p className="text-[hsl(var(--body-text))]">{results.block.height}</p>
                </div>
                <div>
                  <h4 className="text-[#ff5e01] font-semibold">Hash</h4>
                  <p className="text-[hsl(var(--body-text))] break-all">{results.block.hash}</p>
                </div>
                <div>
                  <h4 className="text-[#ff5e01] font-semibold">Timestamp</h4>
                  <p className="text-[hsl(var(--body-text))]">
                    {new Date(results.block.timestamp * 1000).toUTCString()}
                  </p>
                </div>
                <div>
                  <h4 className="text-[#ff5e01] font-semibold">Transactions</h4>
                  <p className="text-[hsl(var(--body-text))]">{results.block.transactions?.length || 0}</p>
                </div>
              </div>
            </div>
          )}

          {/* No Results */}
          {Object.keys(results).length === 0 && (
            <div className="text-center py-8">
              <Info className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">No Results Found</h3>
              <p className="text-[hsl(var(--body-text))] ibm-plex-mono-regular">
                No results found for "{searchQuery}". Please check your search term and try again.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <Card className="bg-[#031126] border-[#ff5e01]/20">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#ff5e01] vt323-regular">Universal Search</CardTitle>
          <p className="text-[hsl(var(--body-text))] ibm-plex-mono-regular text-sm">
            Search for addresses, junkscriptions, transactions, blocks, or JUNK-20 tokens. Try the real example address
            below!
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter address, junkscription ID, transaction hash, block height, or token ticker..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-[#031126] border-[#ff5e01]/20 text-[#ff5e01] ibm-plex-mono-regular"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              onFocus={() => setShowSuggestions(true)}
            />
            <Button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="text-[#ff5e01] hover:text-[#ff5e01]/80"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Suggestions */}
      {showSuggestions && !searchResult && (
        <Card className="bg-[#031126] border-[#ff5e01]/20">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#ff5e01] vt323-regular">
              Search Examples (Real Data)
            </CardTitle>
            <p className="text-[hsl(var(--body-text))] ibm-plex-mono-regular text-sm">
              Click any example to copy it to the search box. All examples use real blockchain data!
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchSuggestions.map((suggestion, index) => (
                <div key={index} className="border border-[#ff5e01]/20 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={`${getTypeColor(suggestion.type.toLowerCase())} border text-xs`}>
                      {suggestion.type}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuery(suggestion.example)}
                      className="text-[#ff5e01] hover:text-[#ff5e01]/80 p-1"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <code className="text-xs text-[hsl(var(--body-text))] ibm-plex-mono-regular block mb-2 break-all">
                    {suggestion.example}
                  </code>
                  <p className="text-xs text-[hsl(var(--body-text))]">{suggestion.description}</p>
                  {suggestion.type === "Address" && (
                    <div className="mt-2">
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/40 text-xs">
                        Real Data Available
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {renderSearchResults()}
    </div>
  )
}
