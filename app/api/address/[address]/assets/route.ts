import { type NextRequest, NextResponse } from "next/server"
import { junkinalsAPI } from "@/utils/completeApi"

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  try {
    const result = await junkinalsAPI.getAddressAssets(params.address)
    return NextResponse.json(result)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to fetch address assets" }, { status: 500 })
  }
}
