import type React from "react"
import { Suspense } from "react"
import "./globals.css"
import { Inter, IBM_Plex_Mono, VT323, Share_Tech_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

const inter = Inter({ subsets: ["latin"], display: "swap" })

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
})

const vt323 = VT323({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-vt323",
  display: "swap",
})

const shareTechMono = Share_Tech_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-share-tech-mono",
  display: "swap",
})

export const metadata = {
  title: "Junkinals Explorer",
  description: "Explore Junkcoin blockchain data",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`dark ${ibmPlexMono.variable} ${vt323.variable} ${shareTechMono.variable}`}>
      <head>
        <link rel="icon" href="https://raw.githubusercontent.com/nodecattel/junkiewally/main/configs/_raw/logo.ico" />
      </head>
      <body className={`${inter.className} bg-[#031126] text-[#ff5e01]`}>
        <div className="grid-container">
          <div className="plane">
            <div className="grid"></div>
          </div>
        </div>
        <div className="relative z-10 min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-full">
            <div className="p-4">
              <h1 className="main-title text-center mb-8">Junkinals Explorer</h1>
              <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
            </div>
          </main>
          <Footer />
          <Toaster />
        </div>
      </body>
    </html>
  )
}
