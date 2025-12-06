import type React from "react"
import type { Metadata } from "next"
import { Inter, Orbitron } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"
import ScrollToTop from "@/components/scroll-to-top"
import { PaypalProvider } from "@/components/paypal-provider"
import { SeasonalEffects } from "@/components/global/seasonal-effects"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
  title: "Levi | Developer & Designer",
  description: "Professional portfolio showcasing my work and skills"
}

import { auth } from "@/auth"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${orbitron.variable} font-sans`}>
        <PaypalProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
            <ScrollToTop />
            <Navbar user={session?.user} />
            <SeasonalEffects />
            {children}
          </ThemeProvider>
        </PaypalProvider>
      </body>
    </html>
  )
}
