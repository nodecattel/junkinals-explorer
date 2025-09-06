export interface JunkscriptionDetails {
  id: string
  content_type: string
  content: string
  timestamp: string
  address: string
  output_value: string
  content_length: string
  genesis_height: string
  genesis_fee: string
  location: string
}

export function parseJunkscriptionHTML(html: string, id: string): JunkscriptionDetails | null {
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

export async function fetchJunkscriptionsByAddress(address: string): Promise<JunkscriptionDetails[]> {
  try {
    // First, get all junkscriptions
    const response = await fetch(`https://ord.junkiewally.xyz/junkscriptions`)
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

    // Now check each junkscription for ownership
    const ownedJunkscriptions: JunkscriptionDetails[] = []

    // Process in batches to avoid overwhelming the server
    const batchSize = 5
    for (let i = 0; i < junkscriptionIds.length; i += batchSize) {
      const batch = junkscriptionIds.slice(i, i + batchSize)

      const batchPromises = batch.map(async (id) => {
        try {
          const detailResponse = await fetch(`https://ord.junkiewally.xyz/junkscription/${id}`)
          if (!detailResponse.ok) return null

          const detailHtml = await detailResponse.text()
          const details = parseJunkscriptionHTML(detailHtml, id)

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
      const validResults = batchResults.filter((result): result is JunkscriptionDetails => result !== null)
      ownedJunkscriptions.push(...validResults)

      // Add a small delay between batches to be respectful
      if (i + batchSize < junkscriptionIds.length) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    return ownedJunkscriptions
  } catch (error) {
    console.error("Error fetching junkscriptions by address:", error)
    throw error
  }
}
