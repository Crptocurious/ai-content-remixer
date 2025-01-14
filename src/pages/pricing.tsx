import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const plans = {
    free: {
      name: 'Free',
      price: {
        monthly: 0,
        annual: 0
      },
      features: [
        '200 AI words per day',
        'Unlimited PDF uploads',
        'AI Autocomplete',
        'Journal & web citations',
        'AI editing commands'
      ]
    },
    unlimited: {
      name: 'Unlimited',
      price: {
        monthly: 30,
        annual: 12
      },
      features: [
        'Unlimited AI words per day',
        'Unlimited PDF uploads',
        'AI Autocomplete',
        'Journal & web citations',
        'AI editing commands',
        'Access to latest features'
      ]
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <Image 
                  src="/jenni-logo.svg" 
                  alt="Nani Logo" 
                  width={24} 
                  height={24} 
                />
                <span className="text-xl font-medium">nani</span>
              </Link>
            </div>
            
            <div className="hidden sm:flex items-center gap-8">
              <Link href="/pricing" className="text-gray-900">
                Pricing
              </Link>
              <Link href="/about" className="text-gray-500 hover:text-gray-900">
                About
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link 
                href="/signin" 
                className="text-gray-500 hover:text-gray-900"
              >
                Log In
              </Link>
              <Link
                href="/signin"
                className="bg-[#4339F2] text-white px-4 py-2 rounded-lg hover:bg-[#372EE2] transition-colors"
              >
                Start writing
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-serif mb-4 tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="text-gray-600 text-lg">
            No credit card required, cancel anytime
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center items-center gap-2 mb-16">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              billingCycle === 'monthly' 
                ? 'bg-[#4339F2] text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors relative ${
              billingCycle === 'annual' 
                ? 'bg-[#4339F2] text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Annual
            {billingCycle === 'annual' && (
              <span className="absolute -top-2 -right-16 text-xs bg-[#FFB6B6] text-black px-2 py-0.5 rounded-full">
                Save 60%
              </span>
            )}
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 flex flex-col">
            <div>
              <h2 className="text-2xl font-medium text-gray-900 mb-6">{plans.free.name}</h2>
              <div className="mb-8 flex items-baseline">
                <span className="text-6xl font-medium text-gray-900">
                  ${plans.free.price[billingCycle]}
                </span>
                <span className="ml-2 text-gray-500">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {plans.free.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#4339F2]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
                {/* Spacer for alignment */}
                <li className="invisible flex items-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 20 20">
                    <path d="M0 0h20v20H0z" fill="none" />
                  </svg>
                  <span>Hidden spacer</span>
                </li>
              </ul>
            </div>
            <div className="mt-auto">
              <Link 
                href="/signin"
                className="block w-full text-center border border-[#4339F2] text-[#4339F2] py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Start for free
              </Link>
            </div>
          </div>

          {/* Unlimited Plan */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 flex flex-col">
            <div>
              <h2 className="text-2xl font-medium text-gray-900 mb-6">{plans.unlimited.name}</h2>
              <div className="mb-8 flex items-baseline">
                <span className="text-6xl font-medium text-gray-900">
                  ${billingCycle === 'annual' ? plans.unlimited.price.annual : plans.unlimited.price.monthly}
                </span>
                <span className="ml-2 text-gray-500">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {plans.unlimited.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#4339F2]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-auto">
              <Link 
                href="/signin"
                className="block w-full text-center bg-[#4339F2] text-white py-3 rounded-lg hover:bg-[#372EE2] transition-colors font-medium"
              >
                Start for free
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 