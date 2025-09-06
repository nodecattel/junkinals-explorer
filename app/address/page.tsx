import { AddressLookup } from "@/components/address-lookup"

export default function AddressPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#ff5e01] vt323-regular mb-4">Address Explorer</h1>
        <p className="text-[hsl(var(--body-text))] ibm-plex-mono-regular max-w-2xl mx-auto">
          Look up any JKC address to see all junkscriptions and JUNK-20 tokens owned by that address. This tool scans
          the entire blockchain to provide comprehensive ownership information.
        </p>
      </div>
      <AddressLookup />
    </div>
  )
}
