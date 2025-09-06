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
        response: "300157",
      },
      {
        method: "GET",
        path: "/blocks/tip/height",
        description: "Alternative endpoint for current block height",
        example: `${API_BASE_URL}/blocks/tip/height`,
        response: "300157",
      },
      {
        method: "GET",
        path: "/block/{hash}",
        description: "Get block details by hash or height",
        parameters: [{ name: "hash", type: "string", required: true, description: "Block hash or height" }],
        example: `${API_BASE_URL}/block/300000`,
        response: `{
  "height": 300000,
  "hash": "0000000000000000000000000000000000000000000000000000000000000000",
  "target": "1d00ffff",
  "timestamp": 1704067200,
  "size": 285,
  "weight": 1140,
  "prev_blockhash": "0000000000000000000000000000000000000000000000000000000000000001",
  "transactions": [
    "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890"
  ]
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
        example: `${API_BASE_URL}/junkscriptions`,
        response: `<!DOCTYPE html>
<html>
<head><title>Junkscriptions</title></head>
<body>
  <div class="thumbnails">
    <a href="/junkscription/abc123i0">Junkscription #0</a>
    <a href="/junkscription/def456i1">Junkscription #1</a>
    <!-- ... more junkscriptions ... -->
  </div>
</body>
</html>`,
      },
      {
        method: "GET",
        path: "/junkscriptions",
        description: "Get paginated junkscriptions (JSON when Accept: application/json)",
        parameters: [
          { name: "page", type: "number", required: false, description: "Page number (default: 1)" },
          { name: "limit", type: "number", required: false, description: "Items per page (default: 20)" },
        ],
        example: `${API_BASE_URL}/junkscriptions?page=1&limit=5`,
        response: `[
  {
    "id": "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890i0",
    "content_type": "text/html"
  },
  {
    "id": "b2c3d4e5f6789012345678901234567890123456789012345678901234567890a1i1", 
    "content_type": "image/png"
  },
  {
    "id": "c3d4e5f6789012345678901234567890123456789012345678901234567890a1b2i2",
    "content_type": "text/plain"
  }
]`,
      },
      {
        method: "GET",
        path: "/junkscription/{id}",
        description: "Get junkscription details (HTML page)",
        parameters: [{ name: "id", type: "string", required: true, description: "Junkscription ID" }],
        example: `${API_BASE_URL}/junkscription/a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890i0`,
        response: `<!DOCTYPE html>
<html>
<head><title>Junkscription a1b2c3...i0</title></head>
<body>
  <dl>
    <dt>content type</dt><dd>text/html</dd>
    <dt>content</dt><dd>&lt;h1&gt;Hello Junkinals!&lt;/h1&gt;</dd>
    <dt>timestamp</dt><dd>2024-01-01 12:00:00 UTC</dd>
    <dt>address</dt><dd>JKC1abc123def456...</dd>
    <dt>output value</dt><dd>546</dd>
    <dt>content length</dt><dd>25</dd>
    <dt>genesis height</dt><dd>300000</dd>
    <dt>genesis fee</dt><dd>1000</dd>
    <dt>location</dt><dd>a1b2c3...i0:0:0</dd>
  </dl>
</body>
</html>`,
      },
      {
        method: "GET",
        path: "/preview/{id}",
        description: "Get junkscription preview content for iframe display",
        parameters: [{ name: "id", type: "string", required: true, description: "Junkscription ID" }],
        example: `${API_BASE_URL}/preview/a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890i0`,
        response: `<h1>Hello Junkinals!</h1>
<p>This is a sample junkscription content.</p>`,
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
        response: `["junk", "test", "demo", "coin", "meme"]`,
      },
      {
        method: "GET",
        path: "/junk20/tick/{tick}",
        description: "Get detailed information for a specific token",
        parameters: [{ name: "tick", type: "string", required: true, description: "Token ticker (case insensitive)" }],
        example: `${API_BASE_URL}/junk20/tick/junk`,
        response: `{
  "tick": "junk",
  "inscription_id": "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890i0",
  "inscription_number": 1,
  "supply": "2100000000000000",
  "minted": "1050000000000000",
  "limit_per_mint": "100000000000",
  "decimal": 8,
  "deploy_by": {
    "Address": "JKC1qw2e3r4t5y6u7i8o9p0a1s2d3f4g5h6j7k8l9"
  },
  "deployed_number": 1,
  "deployed_timestamp": 1704067200,
  "latest_mint_number": 150
}`,
      },
      {
        method: "GET",
        path: "/junk20/balance/{address}",
        description: "Get JUNK-20 token balances for an address",
        parameters: [{ name: "address", type: "string", required: true, description: "JKC address" }],
        example: `${API_BASE_URL}/junk20/balance/JKC1qw2e3r4t5y6u7i8o9p0a1s2d3f4g5h6j7k8l9`,
        response: `{
  "junk20": [
    {
      "tick": "junk",
      "available": "500000000000",
      "transferable": "250000000000"
    },
    {
      "tick": "test", 
      "available": "1000000000",
      "transferable": "500000000"
    },
    {
      "tick": "demo",
      "available": "750000000",
      "transferable": "0"
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
        description: "Get transaction details (HTML page)",
        parameters: [
          { name: "txid", type: "string", required: true, description: "Transaction ID (64-character hex)" },
        ],
        example: `${API_BASE_URL}/tx/a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890`,
        response: `<!DOCTYPE html>
<html>
<head><title>Transaction a1b2c3...7890</title></head>
<body>
  <h1>Transaction Details</h1>
  <dl>
    <dt>Transaction ID</dt><dd>a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890</dd>
    <dt>Block Height</dt><dd>300000</dd>
    <dt>Block Hash</dt><dd>0000000000000000000000000000000000000000000000000000000000000000</dd>
    <dt>Timestamp</dt><dd>2024-01-01 12:00:00 UTC</dd>
    <dt>Size</dt><dd>250 bytes</dd>
    <dt>Fee</dt><dd>1000 satoshis</dd>
    <dt>Confirmations</dt><dd>157</dd>
  </dl>
  <h2>Inputs</h2>
  <ul>
    <li>Previous TX: b2c3d4e5...a1b2:0 (546 sats)</li>
  </ul>
  <h2>Outputs</h2>
  <ul>
    <li>JKC1qw2e3r4t5y6u7i8o9p0a1s2d3f4g5h6j7k8l9: 546 sats</li>
  </ul>
</body>
</html>`,
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
            Complete API reference for the Junkinals Explorer. All endpoints return live data from the Junkcoin
            blockchain. Click the test buttons to see real responses.
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
                Most endpoints return JSON data. Legacy endpoints return HTML for direct browser viewing. All timestamps
                are Unix timestamps (seconds since epoch). JUNK-20 token amounts are in the smallest unit (considering
                decimals).
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#ff5e01] mb-2">Status Codes</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/40">200</Badge>
                  <span className="text-[hsl(var(--body-text))]">Success</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/40">404</Badge>
                  <span className="text-[hsl(var(--body-text))]">Not Found</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/40">400</Badge>
                  <span className="text-[hsl(var(--body-text))]">Bad Request</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/40">500</Badge>
                  <span className="text-[hsl(var(--body-text))]">Server Error</span>
                </div>
              </div>
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
                className="text-[#ff5e01] hover:text-[#ff5e01]/80"
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
                      <h4 className="text-[#ff5e01] font-semibold mb-2">Example Request:</h4>
                      <div className="flex items-center space-x-2">
                        <code className="bg-[#031126] border border-[#ff5e01]/20 px-3 py-2 rounded text-[#ff5e01] ibm-plex-mono-regular text-sm flex-1 overflow-x-auto">
                          {endpoint.example}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(endpoint.example!)}
                          className="text-[#ff5e01] hover:text-[#ff5e01]/80"
                          title="Copy URL"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => testApiEndpoint(endpoint.example!)}
                          className="text-[#ff5e01] hover:text-[#ff5e01]/80"
                          title="Test endpoint"
                          disabled={testing}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(endpoint.example!, "_blank")}
                          className="text-[#ff5e01] hover:text-[#ff5e01]/80"
                          title="Open in new tab"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {endpoint.response && (
                    <div>
                      <h4 className="text-[#ff5e01] font-semibold mb-2">Example Response:</h4>
                      <pre className="bg-[#031126] border border-[#ff5e01]/20 px-3 py-2 rounded text-[hsl(var(--body-text))] ibm-plex-mono-regular text-sm overflow-x-auto max-h-64 overflow-y-auto">
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
              <h4 className="text-[#ff5e01] font-semibold mb-2">Rate Limiting</h4>
              <p>
                Please be respectful with API usage. Excessive requests may be rate limited. Recommended: max 10
                requests per second.
              </p>
            </div>

            <div>
              <h4 className="text-[#ff5e01] font-semibold mb-2">CORS Support</h4>
              <p>Cross-origin requests are supported for web applications. No API key required for public endpoints.</p>
            </div>

            <div>
              <h4 className="text-[#ff5e01] font-semibold mb-2">Data Freshness</h4>
              <p>
                Data is updated in real-time as new blocks are mined on the Junkcoin network. Block data updates every
                ~1 minute.
              </p>
            </div>

            <div>
              <h4 className="text-[#ff5e01] font-semibold mb-2">Error Handling</h4>
              <p>
                HTTP status codes indicate success (200) or various error conditions. Always check the status code
                before processing responses.
              </p>
            </div>

            <div>
              <h4 className="text-[#ff5e01] font-semibold mb-2">JUNK-20 Token Amounts</h4>
              <p>
                All token amounts are returned in the smallest unit. For tokens with 8 decimals, divide by 100,000,000
                to get the display amount.
              </p>
            </div>

            <div>
              <h4 className="text-[#ff5e01] font-semibold mb-2">Junkscription IDs</h4>
              <p>
                Junkscription IDs follow the format: {`{txid}i{index}`} where txid is the transaction hash and index is
                the output index.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
