import { API_BASE_URL } from "./api"

// Types for all API responses
export interface JunkscriptionSummary {
  id: string
  content_type: string
  content_length: number
  genesis_height: number
  genesis_timestamp: number
  inscription_number: number
}

export interface AddressSummaryResponse {
  address: string
  junkscriptions_count: number
  junk20_tokens_count: number
  total_transactions: number
  first_seen_block: number
  last_activity_block: number
  has_assets: boolean
}

export interface TokenBalance {
  tick: string
  available: string
  transferable: string
}

export interface AddressAssetsResponse {
  address: string
  junkscriptions: {
    count: number
    items: JunkscriptionSummary[]
  }
  junk20: {
    count: number
    items: TokenBalance[]
  }
}

export interface SearchResult {
  query: string
  type: "address" | "tx" | "junkscription" | "junk20" | "block" | "unknown"
  results: {
    address?: AddressSummaryResponse
    transaction?: any
    junkscription?: any
    junk20?: any
    block?: any
  }
}

// Complete API implementation
export class CompleteJunkinalsAPI {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  // Address endpoints
  async getAddressSummary(address: string): Promise<AddressSummaryResponse> {
    const [junkscriptions, junk20Response] = await Promise.all([
      this.fetchJunkscriptionsByAddress(address),
      this.getJunk20Balance(address).catch(() => ({ junk20: [] })),
    ])

    const junk20Tokens = junk20Response.junk20 || []
    const hasAssets = junkscriptions.length > 0 || junk20Tokens.length > 0

    // Estimate transaction data (since we don't have a real endpoint)
    const estimatedTransactions = Math.max(junkscriptions.length * 2, junk20Tokens.length * 5, 1)
    const firstSeenBlock =
      junkscriptions.length > 0 ? Math.min(...junkscriptions.map((j) => Number.parseInt(j.genesis_height) || 0)) : 0
    const lastActivityBlock =
      junkscriptions.length > 0 ? Math.max(...junkscriptions.map((j) => Number.parseInt(j.genesis_height) || 0)) : 0

    return {
      address,
      junkscriptions_count: junkscriptions.length,
      junk20_tokens_count: junk20Tokens.length,
      total_transactions: estimatedTransactions,
      first_seen_block: firstSeenBlock,
      last_activity_block: lastActivityBlock,
      has_assets: hasAssets,
    }
  }

  async getAddressAssets(address: string): Promise<AddressAssetsResponse> {
    const [junkscriptions, junk20Response] = await Promise.all([
      this.fetchJunkscriptionsByAddress(address),
      this.getJunk20Balance(address).catch(() => ({ junk20: [] })),
    ])

    const junk20Tokens = junk20Response.junk20 || []

    return {
      address,
      junkscriptions: {
        count: junkscriptions.length,
        items: junkscriptions.map((j) => ({
          id: j.id,
          content_type: j.content_type,
          content_length: Number.parseInt(j.content_length) || 0,
          genesis_height: Number.parseInt(j.genesis_height) || 0,
          genesis_timestamp: this.parseTimestamp(j.timestamp),
          inscription_number: this.extractInscriptionNumber(j.id),
        })),
      },
      junk20: {
        count: junk20Tokens.length,
        items: junk20Tokens,
      },
    }
  }

  // Universal search
  async universalSearch(query: string, type?: string): Promise<SearchResult> {
    const detectedType = this.detectQueryType(query)
    const searchType = type || detectedType

    const result: SearchResult = {
      query,
      type: searchType as any,
      results: {},
    }

    try {
      switch (searchType) {
        case "address":
          result.results.address = await this.getAddressSummary(query)
          break

        case "junkscription":
          result.results.junkscription = await this.getJunkscriptionDetails(query)
          break

        case "tx":
          result.results.transaction = await this.getTransactionDetails(query)
          break

        case "block":
          result.results.block = await this.getBlockDetails(query)
          break

        case "junk20":
          result.results.junk20 = await this.getJunk20TokenInfo(query)
          break

        default:
          // Try multiple types
          const attempts = await Promise.allSettled([
            this.getAddressSummary(query),
            this.getJunkscriptionDetails(query),
            this.getTransactionDetails(query),
            this.getBlockDetails(query),
          ])

          attempts.forEach((attempt, index) => {
            if (attempt.status === "fulfilled") {
              const types = ["address", "junkscription", "tx", "block"]
              result.type = types[index] as any
              result.results[types[index] as keyof typeof result.results] = attempt.value
            }
          })
      }
    } catch (error) {
      console.error("Search error:", error)
    }

    return result
  }

  // Helper methods
  private detectQueryType(query: string): string {
    // JKC address pattern
    if (query.startsWith("JKC") || query.startsWith("jkc")) {
      return "address"
    }

    // Junkscription ID pattern (txid + 'i' + number)
    if (/^[a-fA-F0-9]{64}i\d+$/.test(query)) {
      return "junkscription"
    }

    // Transaction ID pattern (64 hex chars)
    if (/^[a-fA-F0-9]{64}$/.test(query)) {
      return "tx"
    }

    // Block height (number)
    if (/^\d+$/.test(query)) {
      return "block"
    }

    // JUNK-20 token ticker (short string)
    if (/^[a-zA-Z]{2,10}$/.test(query)) {
      return "junk20"
    }

    return "unknown"
  }

  private async fetchJunkscriptionsByAddress(address: string) {
    // Implementation from the previous junkscriptionParser
    const response = await fetch(`${this.baseUrl}/junkscriptions`)
    if (!response.ok) throw new Error("Failed to fetch junkscriptions")

    const html = await response.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")
    const thumbnails = doc.querySelectorAll(".thumbnails a")

    const junkscriptionIds = Array.from(thumbnails)
      .map((el) => {
        const href = el.getAttribute("href")
        return href?.split("/").pop() || ""
      })
      .filter(Boolean)

    const ownedJunkscriptions: any[] = []
    const batchSize = 5

    for (let i = 0; i < junkscriptionIds.length; i += batchSize) {
      const batch = junkscriptionIds.slice(i, i + batchSize)

      const batchPromises = batch.map(async (id) => {
        try {
          const detailResponse = await fetch(`${this.baseUrl}/junkscription/${id}`)
          if (!detailResponse.ok) return null

          const detailHtml = await detailResponse.text()
          const details = this.parseJunkscriptionHTML(detailHtml, id)

          if (details && details.address === address) {
            return details
          }
          return null
        } catch (error) {
          console.error(`Error fetching junkscription ${id}:`, error)
          return null
        }
      })

      const batchResults = await Promise.all(batchPromises)
      const validResults = batchResults.filter((result) => result !== null)
      ownedJunkscriptions.push(...validResults)

      if (i + batchSize < junkscriptionIds.length) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    return ownedJunkscriptions
  }

  private parseJunkscriptionHTML(html: string, id: string) {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, "text/html")

      const extractValue = (term: string): string => {
        const dt = Array.from(doc.getElementsByTagName("dt")).find((el) => el.textContent?.trim() === term)
        return dt?.nextElementSibling?.textContent?.trim() || ""
      }

      return {
        id,
        content_type: extractValue("content type"),
        content: extractValue("content"),
        timestamp: extractValue("timestamp"),
        address: extractValue("address"),
        output_value: extractValue("output value"),
        content_length: extractValue("content length"),
        genesis_height: extractValue("genesis height"),
        genesis_fee: extractValue("genesis fee"),
        location: extractValue("location"),
      }
    } catch (error) {
      console.error("Error parsing junkscription HTML:", error)
      return null
    }
  }

  private async getJunk20Balance(address: string) {
    const response = await fetch(`${this.baseUrl}/junk20/balance/${address}`)
    if (!response.ok) throw new Error("Failed to fetch JUNK-20 balance")
    return response.json()
  }

  private async getJunkscriptionDetails(id: string) {
    const response = await fetch(`${this.baseUrl}/junkscription/${id}`)
    if (!response.ok) throw new Error("Failed to fetch junkscription details")
    const html = await response.text()
    return this.parseJunkscriptionHTML(html, id)
  }

  private async getTransactionDetails(txid: string) {
    const response = await fetch(`${this.baseUrl}/tx/${txid}`)
    if (!response.ok) throw new Error("Failed to fetch transaction details")
    return response.text() // Returns HTML
  }

  private async getBlockDetails(blockId: string) {
    const response = await fetch(`${this.baseUrl}/block/${blockId}`)
    if (!response.ok) throw new Error("Failed to fetch block details")
    return response.json()
  }

  private async getJunk20TokenInfo(tick: string) {
    const response = await fetch(`${this.baseUrl}/junk20/tick/${tick}`)
    if (!response.ok) throw new Error("Failed to fetch JUNK-20 token info")
    return response.json()
  }

  private parseTimestamp(timestamp: string): number {
    // Try to parse various timestamp formats
    const date = new Date(timestamp)
    return isNaN(date.getTime()) ? 0 : Math.floor(date.getTime() / 1000)
  }

  private extractInscriptionNumber(id: string): number {
    const match = id.match(/i(\d+)$/)
    return match ? Number.parseInt(match[1]) : 0
  }
}

// Export singleton instance
export const junkinalsAPI = new CompleteJunkinalsAPI()
