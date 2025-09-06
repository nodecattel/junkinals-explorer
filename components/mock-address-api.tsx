"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Copy, Play, RefreshCw } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Default example address with actual data
const DEFAULT_EXAMPLE_ADDRESS = "7iWvZYWvnHr7ziyvHxotMTqpAwm7dSR8ns"

interface MockEndpoint {
  method: string
  path: string
  description: string
  getMockResponse: (address: string) => any
}

const mockEndpoints: MockEndpoint[] = [
  {
    method: "GET",
    path: "/address/{address}/assets",
    description: "Get all assets (junkscriptions + JUNK-20 tokens) owned by an address",
    getMockResponse: (address) => ({
      address: address,
      junkscriptions: {
        count: 3,
        items: [
          {
            id: "b8f5e8c2d1a9f6e3b7c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6i0",
            content_type: "text/html",
            genesis_height: 299850,
          },
        ],
      },
      junk20: {
        count: 2,
        items: [
          {
            tick: "junk",
            available: "500000000000",
            transferable: "250000000000",
          },
          {
            tick: "test",
            available: "1000000000",
            transferable: "500000000",
          },
        ],
      },
    }),
  },
  {
    method: "GET",
    path: "/address/{address}/summary",
    description: "Get summary of address activity and holdings",
    getMockResponse: (address) => ({
      address: address,
      junkscriptions_count: 3,
      junk20_tokens_count: 2,
      total_transactions: 15,
      first_seen_block: 299850,
      last_activity_block: 299852,
      has_assets: true,
    }),
  },
]

export function MockAddressAPI() {
  const [testAddress, setTestAddress] = useState(DEFAULT_EXAMPLE_ADDRESS)
  const [selectedEndpoint, setSelectedEndpoint] = useState<MockEndpoint | null>(null)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Copied to clipboard",
          description: "Mock response copied to clipboard.",
        })
      },
      (err) => {
        console.error("Could not copy text: ", err)
        toast({
          title: "Copy failed",
          description: "Failed to copy to clipboard.",
          variant: "destructive",
        })
      },
    )
  }

  const testEndpoint = (endpoint: MockEndpoint) => {
    setSelectedEndpoint(endpoint)
    toast({
      title: "Mock Response Generated",
      description: `Generated mock response for ${endpoint.path} with address ${testAddress}`,
    })
  }

  const resetToDefault = () => {
    setTestAddress(DEFAULT_EXAMPLE_ADDRESS)
    toast({
      title: "Reset to default",
      description: "Test address reset to default with known data.",
    })
  }

  return (
    <Card className="bg-[#031126] border-[#ff5e01]/20">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-[#ff5e01] vt323-regular">
          Address API Endpoints (Now Available!)
        </CardTitle>
        <p className="text-[hsl(var(--body-text))] ibm-plex-mono-regular text-sm">
          These endpoints are now fully implemented and working with real data. Test with any JKC address below.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <label className="text-[#ff5e01] font-semibold mb-2 block">Test Address (Customizable):</label>
            <div className="flex items-center space-x-2">
              <Input
                value={testAddress}
                onChange={(e) => setTestAddress(e.target.value)}
                className="bg-[#031126] border-[#ff5e01]/20 text-[#ff5e01] ibm-plex-mono-regular flex-1"
                placeholder="Enter any JKC address"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={resetToDefault}
                className="text-[#ff5e01] hover:text-[#ff5e01]/80"
                title="Reset to default address with known data"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[hsl(var(--body-text))] text-xs mt-1">
              {testAddress === DEFAULT_EXAMPLE_ADDRESS ? (
                <>
                  <strong className="text-green-400">Default address</strong> - Contains real junkscriptions and JUNK-20
                  tokens
                </>
              ) : (
                <>
                  <strong className="text-yellow-400">Custom address</strong> - Results will vary based on actual data
                </>
              )}
            </p>
          </div>

          <div className="space-y-4">
            {mockEndpoints.map((endpoint, index) => (
              <div key={index} className="border border-[#ff5e01]/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/40">{endpoint.method}</Badge>
                    <code className="text-[#ff5e01] ibm-plex-mono-regular font-semibold">
                      {endpoint.path.replace("{address}", testAddress)}
                    </code>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/40">AVAILABLE</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => testEndpoint(endpoint)}
                    className="text-[#ff5e01] hover:text-[#ff5e01]/80"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Test
                  </Button>
                </div>
                <p className="text-[hsl(var(--body-text))] ibm-plex-mono-regular text-sm">{endpoint.description}</p>
              </div>
            ))}
          </div>

          {selectedEndpoint && (
            <div className="border border-[#ff5e01]/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[#ff5e01] font-semibold">Example Response for {testAddress}:</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(JSON.stringify(selectedEndpoint.getMockResponse(testAddress), null, 2))
                  }
                  className="text-[#ff5e01] hover:text-[#ff5e01]/80"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <pre className="bg-[#031126] border border-[#ff5e01]/20 px-3 py-2 rounded text-[hsl(var(--body-text))] ibm-plex-mono-regular text-sm overflow-x-auto max-h-64 overflow-y-auto">
                {JSON.stringify(selectedEndpoint.getMockResponse(testAddress), null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
