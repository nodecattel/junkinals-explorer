"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RefreshCw, Copy, ExternalLink, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { API_BASE_URL } from "@/utils/api"
import Link from "next/link"

interface TokenData {
  tick: string
  inscription_id: string
  inscription_number: number
  supply: string
  minted: string
  limit_per_mint: string
  decimal: number
  deploy_by: {
    Address: string
  }
  deployed_number: number
  deployed_timestamp: number
  latest_mint_number: number
}

export function Junk20Section() {
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [jkcAddress, setJkcAddress] = useState("")

  const fetchTokens = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/junk20/ticks`)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const ticks = await response.json()

      const tokenPromises = ticks.map(async (tick: string) => {
        const response = await fetch(`${API_BASE_URL}/junk20/tick/${tick.toLowerCase()}`)
        if (!response.ok) {
          console.warn(`Failed to fetch data for tick ${tick}: ${response.status}`)
          return null
        }
        return response.json()
      })

      const results = await Promise.all(tokenPromises)
      const validTokens = results.filter((token): token is TokenData => token !== null)

      validTokens.sort((a, b) => a.deployed_number - b.deployed_number)

      console.log("Fetched tokens:", validTokens)
      setTokens(validTokens)
    } catch (error) {
      console.error("Error fetching tokens:", error)
      setError(`Failed to fetch tokens: ${error instanceof Error ? error.message : String(error)}`)
      setTokens([])
    } finally {
      setLoading(false)
    }
  }, [])

  const copyToClipboard = (tick: string, limit: string) => {
    const address = jkcAddress.trim() ? jkcAddress.trim() : "<JKCaddress>"
    const command = `node . junk-20 mint ${address} ${tick} ${limit} [repeat]`
    navigator.clipboard.writeText(command).then(
      () => {
        toast({
          title: "Copied to clipboard",
          description: "The command has been copied to your clipboard.",
        })
      },
      (err) => {
        console.error("Could not copy text: ", err)
        toast({
          title: "Copy failed",
          description: "Failed to copy the command to clipboard.",
          variant: "destructive",
        })
      },
    )
  }

  useEffect(() => {
    fetchTokens()
  }, [fetchTokens])

  const formatNumber = (num: string | number, decimal: number): string => {
    const bigNum = typeof num === "string" ? BigInt(num) : BigInt(Math.floor(num as number))
    const divisor = BigInt(10 ** decimal)
    const wholePart = bigNum / divisor
    const fractionalPart = bigNum % divisor

    if (fractionalPart === BigInt(0)) {
      return wholePart.toString()
    } else {
      const fractionalStr = fractionalPart.toString().padStart(decimal, "0")
      const rounded = Number.parseFloat(`${wholePart}.${fractionalStr}`).toFixed(2)
      return rounded
    }
  }

  const calculateRemainingSupply = (supply: string, minted: string): string => {
    const remainingSupply = BigInt(supply) - BigInt(minted)
    return remainingSupply.toString()
  }

  const isFullyMinted = (supply: string, minted: string): boolean => {
    return BigInt(supply) === BigInt(minted)
  }

  return (
    <Card className="bg-[#031126] border-[#ff5e01]/20 w-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl sm:text-2xl font-semibold text-[#ff5e01] vt323-regular">JUNK-20 Tokens</CardTitle>
        <Button
          variant="ghost"
          onClick={fetchTokens}
          className="text-[#ff5e01] hover:text-[#ff5e01]/80"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Enter your JKC address (optional)"
            value={jkcAddress}
            onChange={(e) => setJkcAddress(e.target.value)}
            className="w-full md:w-96 bg-[#031126] border-[#ff5e01]/20 text-[#ff5e01] ibm-plex-mono-regular"
          />
        </div>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <Table className="w-full min-w-[640px]">
            <TableHeader>
              <TableRow className="hover:bg-[#031126]/80">
                <TableHead className="text-[#ff5e01]/80">Tick</TableHead>
                <TableHead className="text-[#ff5e01]/80">Remaining Supply</TableHead>
                <TableHead className="text-[#ff5e01]/80">Minted</TableHead>
                <TableHead className="text-[#ff5e01]/80">Progress</TableHead>
                <TableHead className="text-[#ff5e01]/80">Limit/Mint</TableHead>
                <TableHead className="text-[#ff5e01]/80">Deployed By</TableHead>
                <TableHead className="text-[#ff5e01]/80">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.map((token) => {
                const remainingSupply = calculateRemainingSupply(token.supply, token.minted)
                const progress = (Number(token.minted) / Number(token.supply)) * 100
                const fullyMinted = isFullyMinted(token.supply, token.minted)
                const limitPerMint = formatNumber(token.limit_per_mint, token.decimal)
                return (
                  <TableRow key={token.tick} className="hover:bg-[#031126]/80">
                    <TableCell className="font-medium text-[#ff5e01] flex items-center space-x-2">
                      <span>{token.tick.toUpperCase()}</span>
                      {fullyMinted && <CheckCircle className="h-4 w-4 text-green-500" title="Fully Minted" />}
                    </TableCell>
                    <TableCell className="text-[#ff5e01]/80">{formatNumber(remainingSupply, token.decimal)}</TableCell>
                    <TableCell className="text-[#ff5e01]/80">{formatNumber(token.minted, token.decimal)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[#ff5e01] border-[#ff5e01]">
                        {progress.toFixed(2)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#ff5e01]/80">{limitPerMint}</TableCell>
                    <TableCell className="text-[#ff5e01]/80">{token.deploy_by.Address}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(token.tick, limitPerMint)}
                          className="text-[#ff5e01] hover:text-[#ff5e01]/80 p-1 sm:p-2"
                          disabled={fullyMinted}
                        >
                          <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="sr-only sm:not-sr-only sm:ml-2">Copy</span>
                        </Button>
                        <Link
                          href={`${API_BASE_URL}/junkscription/${token.inscription_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#ff5e01] hover:text-[#ff5e01]/80 p-1 sm:p-2"
                          >
                            <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="sr-only sm:not-sr-only sm:ml-2">View</span>
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
