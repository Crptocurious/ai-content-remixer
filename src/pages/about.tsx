import Image from 'next/image'
import Link from 'next/link'

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/jenni-logo.svg" 
                alt="Nani Logo" 
                width={32} 
                height={32}
                className="w-8"
              />
              <span className="text-xl font-medium">nani</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Coming Soon Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center">
          <div className="text-4xl font-medium text-[#4339F2]">
            Coming Soon
          </div>
          <p className="mt-6 text-gray-600 max-w-md">
            We're working on something exciting! Check back soon to learn more about our story and mission.
          </p>
          <Link 
            href="/"
            className="mt-8 text-[#4339F2] hover:text-[#372EE2] transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
} 