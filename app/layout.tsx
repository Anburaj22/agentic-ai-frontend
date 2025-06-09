import type React from "react"
import { Inter } from "next/font/google"
import { Poppins } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import favicon from '../public/assets/favicon.png';
import { AuthProvider } from '@/components/AuthProvider'

const inter = Inter({ subsets: ["latin"] })

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>AgenticAI</title>
        <link rel="icon" type="image/x-icon" href={favicon.src}></link>
      </head>
      <body className={`${inter.className} ${poppins.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
           <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
