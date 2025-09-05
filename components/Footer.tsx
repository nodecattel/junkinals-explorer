import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-[#031126] border-t border-[#ff5e01]/20 py-6">
      <div className="container mx-auto px-4 flex flex-col items-center space-y-4">
        <Link href="https://junkiewally.xyz/" target="_blank" rel="noopener noreferrer">
          <Image
            src="https://raw.githubusercontent.com/nodecattel/junkiewally/main/configs/_raw/logo-512.png"
            alt="JunkieWally Logo"
            width={40}
            height={40}
          />
        </Link>
        <div className="text-center">
          <p className="text-[#ff5e01] text-sm ibm-plex-mono-regular">© {new Date().getFullYear()} JunkieWally.</p>
          <p className="text-[#ff5e01] text-sm ibm-plex-mono-regular">All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
