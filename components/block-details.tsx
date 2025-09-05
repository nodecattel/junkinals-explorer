import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { safeFormatDate } from "@/utils/dateUtils"

interface BlockDetailsProps {
  height: number
  hash: string
  target: string
  timestamp: number
  size: number
  weight: number
  prevBlockhash?: string
  bestHeight: number
}

export function BlockDetails({
  height,
  hash,
  target,
  timestamp,
  size,
  weight,
  prevBlockhash,
  bestHeight,
}: BlockDetailsProps) {
  return (
    <div className="bg-secondary p-4 rounded-lg border border-orange/20">
      <h3 className="text-lg font-semibold mb-2 text-orange vt323-regular">Block {height}</h3>
      <dl className="grid grid-cols-2 gap-2 text-sm ibm-plex-mono-regular">
        <dt className="text-orange/80">Hash</dt>
        <dd className="text-orange">{hash}</dd>
        <dt className="text-orange/80">Target</dt>
        <dd className="text-orange">{target}</dd>
        <dt className="text-orange/80">Timestamp</dt>
        <dd className="text-orange">
          <time>{safeFormatDate(timestamp)}</time>
        </dd>
        <dt className="text-orange/80">Size</dt>
        <dd className="text-orange">{size} bytes</dd>
        <dt className="text-orange/80">Weight</dt>
        <dd className="text-orange">{weight}</dd>
        {prevBlockhash && (
          <>
            <dt className="text-orange/80">Previous blockhash</dt>
            <dd>
              <Link href={`/block/${prevBlockhash}`} className="text-orange hover:text-orange/80">
                {prevBlockhash}
              </Link>
            </dd>
          </>
        )}
      </dl>
      <div className="flex justify-end space-x-4 mt-2 text-sm ibm-plex-mono-regular">
        {height > 0 ? (
          <Link href={`/block/${height - 1}`} className="text-orange hover:text-orange/80">
            Previous
          </Link>
        ) : (
          <span className="text-orange/50">Previous</span>
        )}
        {height < bestHeight ? (
          <Link href={`/block/${height + 1}`} className="text-orange hover:text-orange/80">
            Next
          </Link>
        ) : (
          <span className="text-orange/50">Next</span>
        )}
      </div>
    </div>
  )
}
