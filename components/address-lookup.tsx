"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, ExternalLink, Loader2, AlertCircle, CheckCircle, Copy } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { junkinalsAPI } from "@/utils/completeApi"
import { API_BASE_URL } from "@/utils/api"
import Link from "next/link"

interface AddressSummaryState {
  address: string
  junkscriptions: any[]
  junk20Balances: any[]
  totalJunkscriptions: number
  totalJunk20Tokens: number
  isLoading: boolean
  error: string | null
}

export function AddressLookup() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams?.get("q") || ""

  const [address, setAddress] = useState(initialQuery)
  const [summary, setSummary] = useState<AddressSummaryState | null>(null)
  const [loading, setLoading] = useState(false)

  // Auto-search if there's a query parameter
  useEffect(() => {
    if (initialQuery && initialQuery !== address) {
      setAddress(initialQuery)
      lookupAddress(initialQuery)
    }
  }, [initialQuery])

  const lookupAddress = async (searchAddress?: string) => {
    const targetAddress = searchAddress || address.trim()

    if (!targetAddress) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid JKC address.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setSummary({
      address: targetAddress,
      junkscriptions: [],
      junk20Balances: [],
      totalJunkscriptions: 0,
      totalJunk20Tokens: 0,
      isLoading: true,
      error: null,
    })

    try {
      const result = await junkinalsAPI.getAddressAssets(targetAddress)

      setSummary({
        address: targetAddress,
        junkscriptions: result.junkscriptions.items,
        junk20Balances: result.junk20.items,
        totalJunkscriptions: result.junkscriptions.count,
        totalJunk20Tokens: result.junk20.count,
        isLoading: false,
        error: null,
      })

      toast({
        title: "Address Lookup Complete",
        description: `Found ${result.junkscriptions.count} junkscriptions and ${result.junk20.count} JUNK-20 tokens.`,
      })
    } catch (error) {
      console.error("Error looking up address:", error)
      setSummary((prev) =>
        prev
          ? {
              ...prev,
              isLoading: false,
              error: `Failed to lookup address: ${error instanceof Error ? error.message : String(error)}`,
            }
          : null,
      )
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

  const formatNumber = (num: string): string => {
    const bigNum = BigInt(num)
    return bigNum.toString()
  }

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card className="bg-[#031126] border-[#ff5e01]/20">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#ff5e01] vt323-regular">Address Lookup</CardTitle>
          <p className="text-[hsl(var(--body-text))] ibm-plex-mono-regular text-sm">
            Enter a JKC address to see all junkscriptions and JUNK-20 tokens owned by that address.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter JKC address (e.g., JKC1qw2e3r4t5y6u7i8o9p0a1s2d3f4g5h6j7k8l9)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="bg-[#031126] border-[#ff5e01]/20 text-[#ff5e01] ibm-plex-mono-regular"
              onKeyPress={(e) => e.key === "Enter" && lookupAddress()}
            />
            <Button
              onClick={() => lookupAddress()}
              disabled={loading || !address.trim()}
              className="text-[#ff5e01] hover:text-[#ff5e01]/80"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              {loading ? "Searching..." : "Lookup"}
            </Button>
          </div>

          {loading && (
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />
                <span className="text-yellow-400 ibm-plex-mono-regular text-sm">
                  Scanning blockchain for address assets...
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Section */}
      {summary && (
        <Card className="bg-[#031126] border-[#ff5e01]/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-[#ff5e01] vt323-regular">Address Summary</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(summary.address, "Address")}
                className="text-[#ff5e01] hover:text-[#ff5e01]/80"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[hsl(var(--body-text))] ibm-plex-mono-regular text-sm break-all">{summary.address}</p>
          </CardHeader>
          <CardContent>
            {summary.error ? (
              <div className="flex items-center space-x-2 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span>{summary.error}</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#ff5e01]">{summary.totalJunkscriptions}</div>
                  <div className="text-sm text-[hsl(var(--body-text))]">Junkscriptions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#ff5e01]">{summary.totalJunk20Tokens}</div>
                  <div className="text-sm text-[hsl(var(--body-text))]">JUNK-20 Tokens</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#ff5e01]">
                    {summary.totalJunkscriptions + summary.totalJunk20Tokens}
                  </div>
                  <div className="text-sm text-[hsl(var(--body-text))]">Total Assets</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center">
                    {summary.totalJunkscriptions > 0 || summary.totalJunk20Tokens > 0 ? (
                      <CheckCircle className="h-6 w-6 text-green-400" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-yellow-400" />
                    )}
                  </div>
                  <div className="text-sm text-[hsl(var(--body-text))]">
                    {summary.totalJunkscriptions > 0 || summary.totalJunk20Tokens > 0 ? "Has Assets" : "No Assets"}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Junkscriptions Section */}
      {summary && summary.junkscriptions.length > 0 && (
        <Card className="bg-[#031126] border-[#ff5e01]/20">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#ff5e01] vt323-regular">
              Owned Junkscriptions ({summary.junkscriptions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[hsl(var(--body-text))]">ID</TableHead>
                    <TableHead className="text-[hsl(var(--body-text))]">Content Type</TableHead>
                    <TableHead className="text-[hsl(var(--body-text))]">Genesis Height</TableHead>
                    <TableHead className="text-[hsl(var(--body-text))]">Content Length</TableHead>
                    <TableHead className="text-[hsl(var(--body-text))]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.junkscriptions.map((junkscription) => (
                    <TableRow key={junkscription.id}>
                      <TableCell className="font-mono text-[#ff5e01]">#{junkscription.id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-[hsl(var(--body-text))] border-[hsl(var(--body-text))]/20"
                        >
                          {junkscription.content_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[hsl(var(--body-text))]">{junkscription.genesis_height}</TableCell>
                      <TableCell className="text-[hsl(var(--body-text))]">
                        {junkscription.content_length} bytes
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(junkscription.id, "Junkscription ID")}
                            className="text-[#ff5e01] hover:text-[#ff5e01]/80"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Link
                            href={`${API_BASE_URL}/junkscription/${junkscription.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="sm" className="text-[#ff5e01] hover:text-[#ff5e01]/80">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* JUNK-20 Tokens Section */}
      {summary && summary.junk20Balances.length > 0 && (
        <Card className="bg-[#031126] border-[#ff5e01]/20">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#ff5e01] vt323-regular">
              JUNK-20 Token Balances ({summary.junk20Balances.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[hsl(var(--body-text))]">Token</TableHead>
                    <TableHead className="text-[hsl(var(--body-text))]">Available Balance</TableHead>
                    <TableHead className="text-[hsl(var(--body-text))]">Transferable Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.junk20Balances.map((balance) => (
                    <TableRow key={balance.tick}>
                      <TableCell className="font-medium text-[#ff5e01]">{balance.tick.toUpperCase()}</TableCell>
                      <TableCell className="text-[hsl(var(--body-text))]">{formatNumber(balance.available)}</TableCell>
                      <TableCell className="text-[hsl(var(--body-text))]">
                        {formatNumber(balance.transferable)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Assets Found */}
      {summary &&
        !summary.isLoading &&
        summary.totalJunkscriptions === 0 &&
        summary.totalJunk20Tokens === 0 &&
        !summary.error && (
          <Card className="bg-[#031126] border-yellow-500/40">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">No Assets Found</h3>
                <p className="text-[hsl(var(--body-text))] ibm-plex-mono-regular">
                  This address doesn't own any junkscriptions or JUNK-20 tokens.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  )
}
