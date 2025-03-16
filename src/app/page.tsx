'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

export default function Home() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    // Auto-redirect to dashboard if user is signed in
    if (isLoaded && isSignedIn) {
      router.push('/dashboard')
    }
  }, [isLoaded, isSignedIn, router])

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary-700">
              Recked
            </h1>
            <span className="ml-2 text-sm text-gray-500">by Venice.ai</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/sign-in" className="text-sm text-gray-600 hover:text-primary-700">
              Sign In
            </Link>
            <Link href="/sign-up" className="px-4 py-2 rounded-md bg-primary-600 text-white text-sm font-medium hover:bg-primary-700">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="max-w-4xl w-full text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Intelligent Bank Reconciliation
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Automate your bank reconciliation process with AI-powered matching and an intuitive interface.
            Recked by Venice.ai saves you time and reduces errors.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/sign-up" className="px-6 py-3 rounded-md bg-primary-600 text-white font-medium hover:bg-primary-700">
              Get Started
            </Link>
            <Link href="#features" className="px-6 py-3 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">
              Learn More
            </Link>
          </div>
        </div>

        <div className="mt-20 max-w-6xl w-full" id="features">
          <h3 className="text-2xl font-bold text-center mb-12">Key Features</h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-lg font-medium mb-2">Intelligent Matching</h4>
              <p className="text-gray-600">Automatically match transactions between bank statements and your general ledger with our smart algorithm.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <h4 className="text-lg font-medium mb-2">Multi-transaction Matching</h4>
              <p className="text-gray-600">Support for complex matching scenarios including one-to-many and many-to-one transaction relationships.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium mb-2">Detailed Reporting</h4>
              <p className="text-gray-600">Generate comprehensive reconciliation reports with matched and unmatched transactions clearly highlighted.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-50 border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Venice.ai. All rights reserved.</p>
          <p className="mt-2">Recked is part of the Venice.ai suite of accounting tools.</p>
        </div>
      </footer>
    </div>
  )
}
