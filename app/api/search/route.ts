import { type NextRequest, NextResponse } from "next/server"
import { junkinalsAPI } from "@/utils/completeApi"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const type = searchParams.get("type")

    if (!query) {
      return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 })
    }

    const result = await junkinalsAPI.universalSearch(query, type || undefined)
    return NextResponse.json(result)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 })
  }
}
