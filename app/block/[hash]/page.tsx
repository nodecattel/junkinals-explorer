"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { API_BASE_URL } from "@/utils/api"

interface BlockDetails {
  height: number
  hash: string
  target: string
  timestamp: number
  size: number
  weight: number
  prev_blockhash: string
  transactions: string[]
}

export default function BlockDetailsPage() {
  const params = useParams()
  const hash = params?.hash as string
  const [blockDetails, setBlockDetails] = useState<BlockDetails | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlockDetails = async () => {
      if (!hash) return

      try {
        const response = await fetch(`${API_BASE_URL}/block/${hash}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setBlockDetails(data)
      } catch (err) {
        console.error("Error fetching block details:", err)
        setError(`Failed to load block details: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    fetchBlockDetails()
  }, [hash])

  if (error) {
    return <div className="text-red-500 ibm-plex-mono-regular">{error}</div>
  }

  if (!blockDetails) {
    return <div className="text-[#ff5e01] ibm-plex-mono-regular">Loading...</div>
  }

  return (
    <Card className="bg-[#031126] border-[#ff5e01]/20">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-[#ff5e01] vt323-regular">
          Block {blockDetails.height}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-[#ff5e01] font-semibold">Hash</h3>
            <p className="text-[hsl(var(--body-text))] break-all">{blockDetails.hash}</p>
          </div>
          <div>
            <h3 className="text-[#ff5e01] font-semibold">Target</h3>
            <p className="text-[hsl(var(--body-text))] break-all">{blockDetails.target}</p>
          </div>
          <div>
            <h3 className="text-[#ff5e01] font-semibold">Timestamp</h3>
            <p className="text-[hsl(var(--body-text))]">{new Date(blockDetails.timestamp * 1000).toUTCString()}</p>
          </div>
          <div>
            <h3 className="text-[#ff5e01] font-semibold">Size</h3>
            <p className="text-[hsl(var(--body-text))]">{blockDetails.size} bytes</p>
          </div>
          <div>
            <h3 className="text-[#ff5e01] font-semibold">Weight</h3>
            <p className="text-[hsl(var(--body-text))]">{blockDetails.weight}</p>
          </div>
          <div>
            <h3 className="text-[#ff5e01] font-semibold">Previous Blockhash</h3>
            <Link
              href={`/block/${blockDetails.prev_blockhash}`}
              className="text-[hsl(var(--body-text))] hover:text-[#ff5e01] break-all"
            >
              {blockDetails.prev_blockhash}
            </Link>
          </div>
        </div>
        <div>
          <h3 className="text-[#ff5e01] font-semibold">Transactions ({blockDetails.transactions.length})</h3>
          <ul className="mt-2 space-y-2">
            {blockDetails.transactions.map((txid) => (
              <li key={txid}>
                <Link href={`/tx/${txid}`} className="text-[hsl(var(--body-text))] hover:text-[#ff5e01] break-all">
                  {txid}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-between">
          <Link
            href={`/block/${blockDetails.height - 1}`}
            className="text-[#ff5e01] hover:text-[hsl(var(--body-text))]"
          >
            Previous Block
          </Link>
          <Link
            href={`/block/${blockDetails.height + 1}`}
            className="text-[#ff5e01] hover:text-[hsl(var(--body-text))]"
          >
            Next Block
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
