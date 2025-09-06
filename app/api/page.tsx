"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, ExternalLink, Play } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { API_BASE_URL } from "@/utils/api"

// Default example address with actual data
const DEFAULT_EXAMPLE_ADDRESS = "7iWvZYWvnHr7ziyvHxotMTqpAwm7dSR8ns"

interface ApiEndpoint {
  method: string
  path: string
  description: string
  parameters?: { name: string; type: string; required: boolean; description: string }[]
  getExample: (address: string) => string
  status?: "available" | "planned" | "deprecated"
  category: string
  exampleResponse: string
}

interface ApiSection {
  title: string
  description: string
  endpoints: ApiEndpoint[]
}

export default function ApiDocumentationPage() {
  const [testEndpoint, setTestEndpoint] = useState("")
  const [testResponse, setTestResponse] = useState("")
  const [testing, setTesting] = useState(false)
  const [exampleAddress, setExampleAddress] = useState(DEFAULT_EXAMPLE_ADDRESS)

  const apiSections: ApiSection[] = [
    {
      title: "Block Data",
      description: "Endpoints for blockchain block information",
      endpoints: [
        {
          method: "GET",
          path: "/block-count",
          description: "Get current block height",
          status: "available",
          category: "block",
          getExample: () => `${API_BASE_URL}/block-count`,
          exampleResponse: `300123`,
        },
        {
          method: "GET",
          path: "/blocks/tip/height",
          description: "Alternative endpoint for current block height",
          status: "available",
          category: "block",
          getExample: () => `${API_BASE_URL}/blocks/tip/height`,
          exampleResponse: `300123`,
        },
        {
          method: "GET",
          path: "/block/{hash}",
          description: "Get block details by hash or height",
          status: "available",
          category: "block",
          parameters: [{ name: "hash", type: "string", required: true, description: "Block hash or height" }],
          getExample: () => `${API_BASE_URL}/block/300000`,
          exampleResponse: `{
  "hash": "00000000000000000008a89e854d57e5667df88f1cdef6fde2fbca1de5b639ad",
  "height": 300000,
  "timestamp": 1640995200,
  "tx_count": 2847,
  "size": 1234567,
  "weight": 3993456,
  "merkle_root": "4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b",
  "previous_block_hash": "00000000000000000007316856900e76b4f7a9139cfbfba89842c8d196cd5f91"
}`,
        },
      ],
    },
    {
      title: "Address & Ownership",
      description: "Endpoints for address-based queries and asset ownership",
      endpoints: [
        {
          method: "GET",
          path: "/address/{address}/assets",
          description: "Get all assets (junkscriptions + JUNK-20 tokens) owned by an address",
          status: "available",
          category: "address",
          parameters: [{ name: "address", type: "string", required: true, description: "JKC address" }],
          getExample: (address) => `${API_BASE_URL}/api/address/${address}/assets`,
          exampleResponse: `{
  "address": "7iWvZYWvnHr7ziyvHxotMTqpAwm7dSR8ns",
  "junkscriptions": {
    "count": 3,
    "items": [
      {
        "id": "b8f5e8c2d1a9f6e3b7c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6i0",
        "content_type": "text/html",
        "content_length": 1024,
        "genesis_height": 299850,
        "genesis_timestamp": 1640995200,
        "inscription_number": 12345
      },
      {
        "id": "a7e4d7c1b0a8f5e2b6c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5i1",
        "content_type": "image/png",
        "content_length": 2048,
        "genesis_height": 299851,
        "genesis_timestamp": 1640995800,
        "inscription_number": 12346
      }
    ]
  },
  "junk20": {
    "count": 2,
    "items": [
      {
        "tick": "junk",
        "available": "500000000000",
        "transferable": "250000000000"
      },
      {
        "tick": "test",
        "available": "1000000000",
        "transferable": "500000000"
      }
    ]
  }
}`,
        },
        {
          method: "GET",
          path: "/address/{address}/summary",
          description: "Get summary of address activity and holdings",
          status: "available",
          category: "address",
          parameters: [{ name: "address", type: "string", required: true, description: "JKC address" }],
          getExample: (address) => `${API_BASE_URL}/api/address/${address}/summary`,
          exampleResponse: `{
  "address": "7iWvZYWvnHr7ziyvHxotMTqpAwm7dSR8ns",
  "junkscriptions_count": 3,
  "junk20_tokens_count": 2,
  "total_transactions": 15,
  "first_seen_block": 299850,
  "last_activity_block": 299852,
  "has_assets": true
}`,
        },
      ],
    },
    {
      title: "Junkscriptions",
      description: "Endpoints for Junkscription data and content",
      endpoints: [
        {
          method: "GET",
          path: "/junkscriptions",
          description: "Get latest junkscriptions (HTML response with thumbnails)",
          status: "available",
          category: "junkscription",
          getExample: () => `${API_BASE_URL}/junkscriptions`,
          exampleResponse: `<!DOCTYPE html>
<html>
<head><title>Latest Junkscriptions</title></head>
<body>
  <div class="junkscription-grid">
    <div class="junkscription-item">
      <a href="/junkscription/b8f5e8c2d1a9f6e3b7c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6i0">
        <img src="/content/b8f5e8c2d1a9f6e3b7c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6i0" alt="Junkscription #12345">
        <span>Junkscription #12345</span>
      </a>
    </div>
    <!-- More junkscriptions... -->
  </div>
</body>
</html>

[Response truncated - full HTML response available via direct request]`,
        },
        {
          method: "GET",
          path: "/junkscriptions?page=1&limit=5",
          description: "Get paginated junkscriptions (JSON when Accept: application/json)",
          status: "available",
          category: "junkscription",
          parameters: [
            { name: "page", type: "number", required: false, description: "Page number (default: 1)" },
            { name: "limit", type: "number", required: false, description: "Items per page (default: 20)" },
          ],
          getExample: () => `${API_BASE_URL}/junkscriptions?page=1&limit=5`,
          exampleResponse: `{
  "junkscriptions": [
    {
      "id": "b8f5e8c2d1a9f6e3b7c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6i0",
      "number": 12345,
      "content_type": "text/html",
      "content_length": 1024,
      "genesis_height": 299850,
      "genesis_timestamp": 1640995200,
      "address": "7iWvZYWvnHr7ziyvHxotMTqpAwm7dSR8ns"
    },
    {
      "id": "a7e4d7c1b0a8f5e2b6c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5i1",
      "number": 12346,
      "content_type": "image/png",
      "content_length": 2048,
      "genesis_height": 299851,
      "genesis_timestamp": 1640995800,
      "address": "8jXwZYXvoHs8zjyvHxptNTrpBwn8eSS9ot"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 12567,
    "total_pages": 2514,
    "has_next": true,
    "has_prev": false
  }
}`,
        },
      ],
    },
    {
      title: "JUNK-20 Tokens",
      description: "Endpoints for JUNK-20 token information and balances",
      endpoints: [
        {
          method: "GET",
          path: "/junk20/ticks",
          description: "Get all available JUNK-20 token tickers",
          status: "available",
          category: "junk20",
          getExample: () => `${API_BASE_URL}/junk20/ticks`,
          exampleResponse: `{
  "ticks": [
    {
      "tick": "junk",
      "max": "21000000000000000",
      "lim": "1000000000000",
      "dec": "8",
      "deployed_height": 299800,
      "deployed_timestamp": 1640994000,
      "total_minted": "15750000000000000",
      "holders": 1247
    },
    {
      "tick": "test",
      "max": "100000000000000",
      "lim": "50000000000",
      "dec": "8",
      "deployed_height": 299820,
      "deployed_timestamp": 1640994600,
      "total_minted": "25000000000000",
      "holders": 89
    }
  ]
}`,
        },
        {
          method: "GET",
          path: "/junk20/tick/{tick}",
          description: "Get detailed information for a specific token",
          status: "available",
          category: "junk20",
          parameters: [
            { name: "tick", type: "string", required: true, description: "Token ticker (case insensitive)" },
          ],
          getExample: () => `${API_BASE_URL}/junk20/tick/junk`,
          exampleResponse: `{
  "tick": "junk",
  "max": "21000000000000000",
  "lim": "1000000000000",
  "dec": "8",
  "deployed_height": 299800,
  "deployed_timestamp": 1640994000,
  "deployer": "7iWvZYWvnHr7ziyvHxotMTqpAwm7dSR8ns",
  "total_minted": "15750000000000000",
  "remaining": "5250000000000000",
  "holders": 1247,
  "transactions": 8934,
  "last_mint_height": 300120,
  "last_mint_timestamp": 1641001200
}`,
        },
        {
          method: "GET",
          path: "/junk20/balance/{address}",
          description: "Get JUNK-20 token balances for an address",
          status: "available",
          category: "junk20",
          parameters: [{ name: "address", type: "string", required: true, description: "JKC address" }],
          getExample: (address) => `${API_BASE_URL}/junk20/balance/${address}`,
          exampleResponse: `{
  "address": "7iWvZYWvnHr7ziyvHxotMTqpAwm7dSR8ns",
  "junk20": [
    {
      "tick": "junk",
      "available": "500000000000",
      "transferable": "250000000000",
      "overall_balance": "750000000000"
    },
    {
      "tick": "test",
      "available": "1000000000",
      "transferable": "500000000",
      "overall_balance": "1500000000"
    }
  ]
}`,
        },
      ],
    },
    {
      title: "Search & Discovery",
      description: "Endpoints for searching and discovering content",
      endpoints: [
        {
          method: "GET",
          path: "/search",
          description: "Universal search for addresses, transactions, junkscriptions, and tokens",
          status: "available",
          category: "search",
          parameters: [
            { name: "q", type: "string", required: true, description: "Search query" },
            {
              name: "type",
              type: "string",
              required: false,
              description: "Filter by type: address, tx, junkscription, junk20",
            },
          ],
          getExample: (address) => `${API_BASE_URL}/api/search?q=${address}&type=address`,
          exampleResponse: `{
  "query": "7iWvZYWvnHr7ziyvHxotMTqpAwm7dSR8ns",
  "type": "address",
  "results": [
    {
      "type": "address",
      "address": "7iWvZYWvnHr7ziyvHxotMTqpAwm7dSR8ns",
      "junkscriptions_count": 3,
      "junk20_tokens_count": 2,
      "has_assets": true
    }
  ],
  "total_results": 1
}`,
        },
      ],
    },
  ]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Copied to clipboard",
          description: "Content copied to clipboard.",
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

  const testApiEndpoint = async (url: string) => {
    setTesting(true)
    setTestEndpoint(url)
    try {
      const response = await fetch(url)
      const contentType = response.headers.get("content-type")

      let responseText
      if (contentType?.includes("application/json")) {
        const json = await response.json()
        responseText = JSON.stringify(json, null, 2)
      } else {
        responseText = await response.text()
        if (responseText.length > 1000) {
          responseText =
            responseText.substring(0, 1000) + "...\n[Response truncated - full response available in browser]"
        }
      }

      setTestResponse(
        `Status: ${response.status} ${response.statusText}\nContent-Type: ${contentType}\nResponse Size: ${responseText.length} characters\n\n${responseText}`,
      )
    } catch (error) {
      setTestResponse(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setTesting(false)
    }
  }

  const resetToDefault = () => {
    setExampleAddress(DEFAULT_EXAMPLE_ADDRESS)
    toast({
      title: "Reset to default",
      description: "Example address reset to default with known data.",
    })
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-green-500/20 text-green-400 border-green-500/40"
      case "POST":
        return "bg-blue-500/20 text-blue-400 border-blue-500/40"
      case "PUT":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/40"
      case "DELETE":
        return "bg-red-500/20 text-red-400 border-red-500/40"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/40"
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "available":
        return "bg-green-500/20 text-green-400 border-green-500/40"
      case "planned":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/40"
      case "deprecated":
        return "bg-red-500/20 text-red-400 border-red-500/40"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/40"
    }
  }

  return (
    <div className="space-y-8">
      <Card className="bg-[#031126] border-[#ff5e01]/20">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-[#ff5e01] vt323-regular">
            Junkinals Explorer API Documentation
          </CardTitle>
          <p className="text-[hsl(var(--body-text))] ibm-plex-mono-regular">
            Complete API reference for the Junkcoin blockchain explorer. All endpoints are available and working with
            real data.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-[#ff5e01] mb-2">Base URL</h3>
              <div className="flex items-center space-x-2">
                <code className="bg-[#031126] border border-[#ff5e01]/20 px-3 py-1 rounded text-[#ff5e01] ibm-plex-mono-regular">
                  {API_BASE_URL}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(API_BASE_URL)}
                  className="text-white hover:text-[#ff5e01] hover:bg-[#ff5e01]/10"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#ff5e01] mb-2">Example Address (Customizable)</h3>
              <div className="flex items-center space-x-2 mb-2">
                <Input
                  value={exampleAddress}
                  onChange={(e) => setExampleAddress(e.target.value)}
                  placeholder="Enter any JKC address for examples..."
                  className="bg-[#031126] border-[#ff5e01]/20 text-[#ff5e01] ibm-plex-mono-regular flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(exampleAddress)}
                  className="text-white hover:text-[#ff5e01] hover:bg-[#ff5e01]/10"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`/address?q=${exampleAddress}`, "_blank")}
                  className="text-white hover:text-[#ff5e01] hover:bg-[#ff5e01]/10"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[hsl(var(--body-text))] text-sm">
                {exampleAddress === DEFAULT_EXAMPLE_ADDRESS ? (
                  <>
                    <strong className="text-green-400">Default address</strong> - Contains real junkscriptions and
                    JUNK-20 tokens for testing.
                  </>
                ) : (
                  <>
                    <strong className="text-yellow-400">Custom address</strong> - All examples will use this address.
                    Results may vary based on actual data.
                  </>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Tester */}
      <Card className="bg-[#031126] border-[#ff5e01]/20">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#ff5e01] vt323-regular">Live API Tester</CardTitle>
          <p className="text-[hsl(var(--body-text))] ibm-plex-mono-regular text-sm">
            Test any API endpoint directly. Click the test buttons below or enter a custom URL.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter API endpoint URL to test..."
                value={testEndpoint}
                onChange={(e) => setTestEndpoint(e.target.value)}
                className="bg-[#031126] border-[#ff5e01]/20 text-[#ff5e01] ibm-plex-mono-regular"
              />
              <Button
                onClick={() => testApiEndpoint(testEndpoint)}
                disabled={testing || !testEndpoint}
                className="bg-[#ff5e01] text-white hover:bg-[#ff5e01]/90"
              >
                <Play className="h-4 w-4 mr-2" />
                {testing ? "Testing..." : "Test"}
              </Button>
            </div>

            {testResponse && (
              <div className="bg-[#031126] border border-[#ff5e01]/20 rounded p-4">
                <h4 className="text-[#ff5e01] font-semibold mb-2">Live Response:</h4>
                <pre className="text-[hsl(var(--body-text))] text-sm ibm-plex-mono-regular whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto">
                  {testResponse}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* API Sections */}
      {apiSections.map((section, sectionIndex) => (
        <Card key={sectionIndex} className="bg-[#031126] border-[#ff5e01]/20">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#ff5e01] vt323-regular">{section.title}</CardTitle>
            <p className="text-[hsl(var(--body-text))] ibm-plex-mono-regular">{section.description}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {section.endpoints.map((endpoint, endpointIndex) => (
                <div key={endpointIndex} className="border border-[#ff5e01]/20 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Badge className={`${getMethodColor(endpoint.method)} border`}>{endpoint.method}</Badge>
                    <code className="text-[#ff5e01] ibm-plex-mono-regular font-semibold">{endpoint.path}</code>
                    {endpoint.status && (
                      <Badge className={`${getStatusColor(endpoint.status)} border`}>{endpoint.status}</Badge>
                    )}
                  </div>

                  <p className="text-[hsl(var(--body-text))] mb-4 ibm-plex-mono-regular">{endpoint.description}</p>

                  {endpoint.parameters && (
                    <div className="mb-4">
                      <h4 className="text-[#ff5e01] font-semibold mb-2">Parameters:</h4>
                      <div className="space-y-2">
                        {endpoint.parameters.map((param, paramIndex) => (
                          <div key={paramIndex} className="flex items-center space-x-2 text-sm">
                            <code className="bg-[#031126] border border-[#ff5e01]/20 px-2 py-1 rounded text-[#ff5e01]">
                              {param.name}
                            </code>
                            <Badge
                              variant="outline"
                              className="text-[hsl(var(--body-text))] border-[hsl(var(--body-text))]/20"
                            >
                              {param.type}
                            </Badge>
                            {param.required && (
                              <Badge className="bg-red-500/20 text-red-400 border-red-500/40">required</Badge>
                            )}
                            <span className="text-[hsl(var(--body-text))] ibm-plex-mono-regular">
                              {param.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <h4 className="text-[#ff5e01] font-semibold mb-2">Example Request:</h4>
                    <div className="flex items-center space-x-2">
                      <code className="bg-[#031126] border border-[#ff5e01]/20 px-3 py-2 rounded text-[#ff5e01] ibm-plex-mono-regular text-sm flex-1 overflow-x-auto">
                        {endpoint.getExample(exampleAddress)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(endpoint.getExample(exampleAddress))}
                        className="text-white hover:text-[#ff5e01] hover:bg-[#ff5e01]/10"
                        title="Copy URL"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {endpoint.status === "available" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => testApiEndpoint(endpoint.getExample(exampleAddress))}
                            className="text-white hover:text-[#ff5e01] hover:bg-[#ff5e01]/10"
                            title="Test endpoint"
                            disabled={testing}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(endpoint.getExample(exampleAddress), "_blank")}
                            className="text-white hover:text-[#ff5e01] hover:bg-[#ff5e01]/10"
                            title="Open in new tab"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[#ff5e01] font-semibold mb-2">Example Response:</h4>
                    <pre className="bg-[#031126] border border-[#ff5e01]/20 px-3 py-2 rounded text-[hsl(var(--body-text))] ibm-plex-mono-regular text-sm overflow-x-auto max-h-64 overflow-y-auto">
                      {endpoint.exampleResponse}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Usage Notes */}
      <Card className="bg-[#031126] border-[#ff5e01]/20">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#ff5e01] vt323-regular">
            Usage Notes & Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-[hsl(var(--body-text))] ibm-plex-mono-regular">
            <div>
              <h4 className="text-[#ff5e01] font-semibold mb-2">Static Example Responses</h4>
              <p>
                All response examples shown are static examples based on real data structure. Use the "Test" buttons or
                the Live API Tester above to get actual current responses from the endpoints.
              </p>
            </div>

            <div>
              <h4 className="text-[#ff5e01] font-semibold mb-2">Dynamic Address Examples</h4>
              <p>
                You can customize the example address above to see how URLs would look with different addresses. The
                default address <code className="text-[#ff5e01]">{DEFAULT_EXAMPLE_ADDRESS}</code> is guaranteed to have
                data for testing.
              </p>
            </div>

            <div>
              <h4 className="text-[#ff5e01] font-semibold mb-2">Rate Limiting</h4>
              <p>Please be respectful with API usage. Recommended: max 10 requests per second.</p>
            </div>

            <div>
              <h4 className="text-[#ff5e01] font-semibold mb-2">JUNK-20 Token Amounts</h4>
              <p>
                All token amounts are returned in the smallest unit. For tokens with 8 decimals, divide by 100,000,000
                to get the display amount.
              </p>
            </div>

            <div>
              <h4 className="text-[#ff5e01] font-semibold mb-2">Content Types</h4>
              <p>
                Most endpoints return JSON by default. The <code className="text-[#ff5e01]">/junkscriptions</code>{" "}
                endpoint returns HTML by default, but you can get JSON by setting the{" "}
                <code className="text-[#ff5e01]">Accept: application/json</code> header.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
