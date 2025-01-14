import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Fraunces } from 'next/font/google'
import { useRouter } from 'next/router'

const fraunces = Fraunces({ 
  subsets: ['latin'],
  variable: '--font-fraunces',
})

export default function Research() {
  const router = useRouter();

  const handleAuthClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/signin');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/jenni-logo.svg" 
                alt="Nani Logo" 
                width={40} 
                height={40}
                className="w-10"
              />
              <span className="text-2xl font-bold">nani</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900">
              About
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <button 
              onClick={handleAuthClick}
              className="text-gray-600 hover:text-gray-900"
            >
              Log In
            </button>
            <button 
              onClick={handleAuthClick}
              className="bg-[#4339F2] text-white px-6 py-2 rounded-full hover:bg-[#372EE2] transition-colors"
            >
              Start writing
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className={`${fraunces.variable} max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20`}>
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-serif mb-8 font-medium tracking-tight">
            Meet Your Intelligent Research Assistant
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            The AI-powered workspace to help you read, write, and organize research with ease.
          </p>
          <button 
            onClick={handleAuthClick}
            className="inline-flex items-center justify-center bg-[#4339F2] text-white px-8 py-4 rounded-full text-lg hover:bg-[#372EE2] transition-colors"
          >
            Start writing - it's free
          </button>

          {/* Social Proof */}
          <div className="mt-12 flex items-center justify-center gap-2">
            <div className="flex text-yellow-400 text-2xl">
              {'★'.repeat(5)}
            </div>
            <span className="text-gray-600 ml-2">
              Loved by over 4 million academics
            </span>
          </div>
        </div>
      </main>
    </div>
  )
} 