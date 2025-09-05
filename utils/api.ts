export const API_BASE_URL = "https://ord.junkiewally.xyz"

export async function fetchBlockCount(): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/block-count`)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const text = await response.text()
  const blockCount = Number.parseInt(text.trim(), 10)
  if (isNaN(blockCount)) {
    throw new Error("Unexpected data format")
  }
  return blockCount
}
