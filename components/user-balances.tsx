"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RefreshCw } from "lucide-react"
import { API_BASE_URL } from "@/utils/api"

interface TokenBalance {
  available: string
  tick: string
  transferable: string
}

interface BalanceResponse {
  junk20: TokenBalance[]
}

export function UserBalances() {
  const [balances, setBalances] = useState<TokenBalance[]>([])
  const [loading, setLoading] = useState(false)
  const [jkcAddress, setJkcAddress] = useState("")
  const [error, setError] = useState<string | null>(null)

  const fetchBalances = useCallback(async () => {
    if (!jkcAddress) return

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/junk20/balance/${jkcAddress}`)
      if (!response.ok) throw new Error("Failed to fetch balances")
      const balancesData: BalanceResponse = await response.json()
      console.log("Fetched balances:", balancesData)
      setBalances(balancesData.junk20)
    } catch (error) {
      console.error("Error fetching balances:", error)
      setError("Failed to fetch balances. Please check the address and try again.")
      setBalances([])
    } finally {
      setLoading(false)
    }
  }, [jkcAddress])

  const formatNumber = (num: string): string => {
    const bigNum = BigInt(num)
    const divisor = BigInt(10 ** 2) // Assuming 2 decimal places for all tokens
    const wholePart = bigNum / divisor
    const fractionalPart = bigNum % divisor

    if (fractionalPart === BigInt(0)) {
      return wholePart.toString()
    } else {
      const fractionalStr = fractionalPart.toString().padStart(2, "0")
      return `${wholePart}.${fractionalStr}`
    }
  }

  return (
    <Card className="bg-[#1b2032] border-[#c8953b]/20 w-full overflow-hidden mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl sm:text-2xl font-semibold text-[#c8953b] vt323-regular">User Balances</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center space-x-2">
          <Input
            placeholder="Enter your JKC address"
            value={jkcAddress}
            onChange={(e) => setJkcAddress(e.target.value)}
            className="bg-[#1b2032] border-[#c8953b]/20 text-[#c8953b] ibm-plex-mono-regular"
          />
          <Button onClick={fetchBalances} className="text-[#c8953b] hover:text-[#c8953b]/80" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {balances.length > 0 ? (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <Table className="w-full min-w-[640px]">
              <TableHeader>
                <TableRow className="hover:bg-[#1b2032]/80">
                  <TableHead className="text-[#c8953b]/80">Tick</TableHead>
                  <TableHead className="text-[#c8953b]/80">Available Balance</TableHead>
                  <TableHead className="text-[#c8953b]/80">Transferable Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {balances.map((balance) => (
                  <TableRow key={balance.tick} className="hover:bg-[#1b2032]/80">
                    <TableCell className="font-medium text-[#c8953b]">{balance.tick.toUpperCase()}</TableCell>
                    <TableCell className="text-[#c8953b]/80">{formatNumber(balance.available)}</TableCell>
                    <TableCell className="text-[#c8953b]/80">{formatNumber(balance.transferable)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-[#c8953b]/80">No balances to display. Enter an address and click the refresh button.</p>
        )}
      </CardContent>
    </Card>
  )
}
