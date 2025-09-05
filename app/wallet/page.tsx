"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { API_BASE_URL } from "@/utils/api"

interface TokenBalance {
  tick: string
  balance: string
}

export default function WalletPage() {
  const [address, setAddress] = useState("")
  const [balances, setBalances] = useState<TokenBalance[]>([])
  const [loading, setLoading] = useState(false)

  const fetchBalances = async () => {
    if (!address) return

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/junk20/balance/${address}`)
      if (!response.ok) throw new Error("Failed to fetch balances")
      const balancesData = await response.json()
      setBalances(balancesData)
    } catch (error) {
      console.error("Error fetching balances:", error)
      setBalances([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-[#031126] border-[#ff5e01]/20 w-full overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-semibold text-[#ff5e01] vt323-regular">
          Wallet Balances
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-4">
          <Input
            placeholder="Enter JKC address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="bg-[#031126] border-[#ff5e01]/20 text-[#ff5e01] ibm-plex-mono-regular"
          />
          <Button onClick={fetchBalances} disabled={loading} className="text-[#ff5e01] hover:text-[#ff5e01]/80">
            {loading ? "Loading..." : "Check Balances"}
          </Button>
        </div>
        {balances.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[hsl(var(--body-text))]">Token</TableHead>
                <TableHead className="text-[hsl(var(--body-text))]">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {balances.map((balance) => (
                <TableRow key={balance.tick}>
                  <TableCell className="text-[#ff5e01]">{balance.tick}</TableCell>
                  <TableCell className="text-[#ff5e01]">{balance.balance}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
