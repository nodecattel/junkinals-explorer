import { Junk20Section } from "@/components/junk20-section"
import { LatestJunkscriptions } from "@/components/latest-junkscriptions"
import { Junk20BalanceByAddress } from "@/components/junk20-balance-by-address"

export default function JunkinalsExplorer() {
  return (
    <div className="grid gap-4 sm:gap-8">
      <LatestJunkscriptions />
      <Junk20Section />
      <Junk20BalanceByAddress />
    </div>
  )
}
