import { UniversalSearch } from "@/components/universal-search"

export default function SearchPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#ff5e01] vt323-regular mb-4">Universal Search</h1>
        <p className="text-[hsl(var(--body-text))] ibm-plex-mono-regular max-w-2xl mx-auto">
          Search the entire Junkcoin blockchain. Find addresses, junkscriptions, transactions, blocks, and JUNK-20
          tokens all in one place.
        </p>
      </div>
      <UniversalSearch />
    </div>
  )
}
