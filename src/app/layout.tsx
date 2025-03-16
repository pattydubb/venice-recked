import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata = {
  title: 'Recked | Venice.ai Reconciliation Tool',
  description: 'Intelligent bank reconciliation tool for the Venice.ai accounting platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable}`}>
        <body className="bg-gray-50 text-gray-900 min-h-screen">
          <Toaster />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
