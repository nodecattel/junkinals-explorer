"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface JunkscriptionDetailsProps {
  details: {
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
}

function DetailItem({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <h3 className="text-[#ff5e01] font-semibold">{title}</h3>
      <p className="text-[hsl(var(--body-text))]">{value}</p>
    </div>
  )
}

export function JunkscriptionDetails({ details }: JunkscriptionDetailsProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate a short delay to show loading state
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#ff5e01]" />
      </div>
    )
  }

  return (
    <Card className="bg-[#031126] border-[#ff5e01]/20 w-full overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-semibold text-[#ff5e01] vt323-regular">
          Junkscription #{details.id}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <DetailItem title="Content Type" value={details.content_type} />
          <DetailItem title="Content" value={details.content} />
          <DetailItem title="Timestamp" value={details.timestamp} />
          <DetailItem title="Address" value={details.address} />
          <DetailItem title="Output Value" value={details.output_value} />
          <DetailItem title="Content Length" value={details.content_length} />
          <DetailItem title="Genesis Height" value={details.genesis_height} />
          <DetailItem title="Genesis Fee" value={details.genesis_fee} />
          <DetailItem title="Location" value={details.location} />
        </div>
      </CardContent>
    </Card>
  )
}
