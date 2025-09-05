import { JunkscriptionDetails } from "./JunkscriptionDetails"
import { API_BASE_URL } from "@/utils/api"

async function getJunkscriptionDetails(id: string) {
  const res = await fetch(`${API_BASE_URL}/junkscription/${id}`, { cache: "no-store" })

  if (!res.ok) {
    throw new Error("Failed to fetch junkscription details")
  }

  const html = await res.text()
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, "text/html")

  const extractValue = (term: string) => {
    const dt = Array.from(doc.getElementsByTagName("dt")).find((el) => el.textContent === term)
    return dt?.nextElementSibling?.textContent || ""
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
}

export default async function JunkscriptionPage({ params }: { params: { id: string } }) {
  try {
    const details = await getJunkscriptionDetails(params.id)
    return <JunkscriptionDetails details={details} />
  } catch (error) {
    return (
      <div className="text-red-500 text-center">Error: {error instanceof Error ? error.message : String(error)}</div>
    )
  }
}
