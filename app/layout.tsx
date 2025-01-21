"use client"

import "./globals.css"
import { Inter } from "next/font/google"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { AuthProvider } from "@/contexts/AuthContext"
import { Navbar } from "@/components/ui/Navbar"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

const queryClient = new QueryClient()

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <main className={inter.className}>{children}</main>
            <Navbar />
          </AuthProvider>
        </QueryClientProvider>
        <Toaster />
      </body>
    </html>
  )
}