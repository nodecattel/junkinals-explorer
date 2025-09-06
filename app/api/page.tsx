"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, ExternalLink, Play } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { API_BASE_URL } from "@/utils/api"

interface ApiEndpoint {
  method: string
  path: string
  description: string
  parameters?: { name: string; type: string; required: boolean; description: string }[]
  example?: string
  response?: string
}

interface ApiSection {
  title: string
  description: string
  endpoints: ApiEndpoint[]
}

const apiSections: ApiSection[] = [
  {
    title: "Block Data",
    description: "Endpoints for blockchain block information",
    endpoints: [
      {
        method: "GET",
        path: "/block-count",
        description: "Get current block height",
        example: `${API_BASE_URL}/block-count`,
        response: "300150",
      },
      {
        method: "GET",
        path: "/blocks/tip/height",
        description: "Alternative endpoint for current block height",
        example: `${API_BASE_URL}/blocks/tip/height`,
        response: "300150",
      },
      {
        method: "GET",
        path: "/block/{hash}",
        description: "Get block details by hash or height",
        parameters: [{ name: "hash", type: "string", required: true, description: "Block hash or height" }],
        example: `${API_BASE_URL}/block/300000`,
        response: `{
  "height": 300000,
  "hash": "abc123...",
  "target": "def456...",
  "timestamp": 1640995200,
  "size": 1024,
  "weight": 4096,
  "prev_blockhash": "ghi789...",
  "transactions": ["tx1...", "tx2..."]
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
        description: "Get latest junkscriptions (HTML response)",
        example: `${API_BASE_URL}/junkscriptions`,
        response: "HTML page with junkscription thumbnails",
      },
      {
        method: "GET",
        path: "/junkscriptions",
        description: "Get paginated junkscriptions (JSON)",
        parameters: [
          { name: "page", type: "number", required: false, description: "Page number (default: 1)" },
          { name: "limit", type: "number", required: false, description: "Items per page (default: 20)" },
        ],
        example: `${API_BASE_URL}/junkscriptions?page=1&limit=20`,
        response: `[
  {
    "id": "abc123i0",
    "content_type": "text/html"
  }
]`,
      },
      {
        method: "GET",
        path: "/junkscription/{id}",
        description: "Get junkscription details",
        parameters: [{ name: "id", type: "string", required: true, description: "Junkscription ID" }],
        example: `${API_BASE_URL}/junkscription/abc123i0`,
        response: "HTML page with junkscription details",
      },
      {
        method: "GET",
        path: "/preview/{id}",
        description: "Get junkscription preview content",
        parameters: [{ name: "id", type: "string", required: true, description: "Junkscription ID" }],
        example: `${API_BASE_URL}/preview/abc123i0`,
        response: "Raw content for iframe display",
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
        example: `${API_BASE_URL}/junk20/ticks`,
        response: `["junk", "test", "demo"]`,
      },
      {
        method: "GET",
        path: "/junk20/tick/{tick}",
        description: "Get detailed information for a specific token",
        parameters: [{ name: "tick", type: "string", required: true, description: "Token ticker (case insensitive)" }],
        example: `${API_BASE_URL}/junk20/tick/junk`,
        response: `{
  "tick": "junk",
  "inscription_id": "abc123i0",
  "inscription_number": 1,
  "supply": "21000000000000",
  "minted": "10500000000000",
  "limit_per_mint": "1000000000",
  "decimal": 8,
  "deploy_by": {
    "Address": "JKC1abc..."
  },
  "deployed_number": 1,
  "deployed_timestamp": 1640995200,
  "latest_mint_number": 150
}`,
      },
      {
        method: "GET",
        path: "/junk20/balance/{address}",
        description: "Get JUNK-20 token balances for an address",
        parameters: [{ name: "address", type: "string", required: true, description: "JKC address" }],
        example: `${API_BASE_URL}/junk20/balance/JKC1abc...`,
        response: `{
  "junk20": [
    {
      "tick": "junk",
      "available": "1000000000",
      "transferable": "500000000"
    }
  ]
}`,
      },
    ],
  },
  {
    title: "Transactions",
    description: "Endpoints for transaction data",
    endpoints: [
      {
        method: "GET",
        path: "/tx/{txid}",
        description: "Get transaction details",
        parameters: [{ name: "txid", type: "string", required: true, description: "Transaction ID" }],
        example: `${API_BASE_URL}/tx/abc123...`,
        response: "HTML page with transaction details",
      },
    ],
  },
]

export default function ApiDocumentationPage() {
  const [testEndpoint, setTestEndpoint] = useState("")
  const [testResponse, setTestResponse] = useState("")
  const [testing, setTesting] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Copied to clipboard",
          description: "API endpoint copied to clipboard.",
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
        // Truncate HTML responses for display
        if (responseText.length > 1000) {
          responseText = responseText.substring(0, 1000) + "...\n[Response truncated]"
        }
      }

      setTestResponse(`Status: ${response.status}\nContent-Type: ${contentType}\n\n${responseText}`)
    } catch (error) {
      setTestResponse(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setTesting(false)
    }
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

  return (
    <div className="space-y-8">
      <Card className="bg-[#031126] border-[#ff5e01]/20">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-[#ff5e01] vt323-regular">
            Junkinals Explorer API Documentation
          </CardTitle>
          <p className="text-[hsl(var(--body-text))] ibm-plex-mono-regular">
            Complete API reference for the Junkinals Explorer. All endpoints return data from the Junkcoin blockchain.
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
                  className="text-[#ff5e01] hover:text-[#ff5e01]/80"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#ff5e01] mb-2">Response Format</h3>
              <p className="text-[hsl(var(--body-text))] ibm-plex-mono-regular text-sm">
                Most endpoints return JSON data. Some legacy endpoints return HTML for direct browser viewing. All
                timestamps are Unix timestamps (seconds since epoch).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Tester */}
      <Card className="bg-[#031126] border-[#ff5e01]/20">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#ff5e01] vt323-regular">API Tester</CardTitle>
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
                className="text-[#ff5e01] hover:text-[#ff5e01]/80"
              >
                <Play className="h-4 w-4 mr-2" />
                {testing ? "Testing..." : "Test"}
              </Button>
            </div>

            {testResponse && (
              <div className="bg-[#031126] border border-[#ff5e01]/20 rounded p-4">
                <h4 className="text-[#ff5e01] font-semibold mb-2">Response:</h4>
                <pre className="text-[hsl(var(--body-text))] text-sm ibm-plex-mono-regular whitespace-pre-wrap overflow-x-auto">
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

                  {endpoint.example && (
                    <div className="mb-4">
                      <h4 className="text-[#ff5e01] font-semibold mb-2">Example:</h4>
                      <div className="flex items-center space-x-2">
                        <code className="bg-[#031126] border border-[#ff5e01]/20 px-3 py-2 rounded text-[#ff5e01] ibm-plex-mono-regular text-sm flex-1 overflow-x-auto">
                          {endpoint.example}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(endpoint.example!)}
                          className="text-[#ff5e01] hover:text-[#ff5e01]/80"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => testApiEndpoint(endpoint.example!)}
                          className="text-[#ff5e01] hover:text-[#ff5e01]/80"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(endpoint.example!, "_blank")}
                          className="text-[#ff5e01] hover:text-[#ff5e01]/80"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {endpoint.response && (
                    <div>
                      <h4 className="text-[#ff5e01] font-semibold mb-2">Response:</h4>
                      <pre className="bg-[#031126] border border-[#ff5e01]/20 px-3 py-2 rounded text-[hsl(var(--body-text))] ibm-plex-mono-regular text-sm overflow-x-auto">
                        {endpoint.response}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Rate Limiting & Usage Notes */}
      <Card className="bg-[#031126] border-[#ff5e01]/20">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#ff5e01] vt323-regular">Usage Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-[hsl(var(--body-text))] ibm-plex-mono-regular">
            <div>
              <h4 className="text-[#ff5e01] font-semibold mb-2">Rate Limiting</h4>
              <p>Please be respectful with API usage. Excessive requests may be rate limited.</p>
            </div>

            <div>
              <h4 className="text-[#ff5e01] font-semibold mb-2">CORS</h4>
              <p>Cross-origin requests are supported for web applications.</p>
            </div>

            <div>
              <h4 className="text-[#ff5e01] font-semibold mb-2">Data Freshness</h4>
              <p>Data is updated in real-time as new blocks are mined on the Junkcoin network.</p>
            </div>

            <div>
              <h4 className="text-[#ff5e01] font-semibold mb-2">Error Handling</h4>
              <p>HTTP status codes indicate success (200) or various error conditions (404, 500, etc.).</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
