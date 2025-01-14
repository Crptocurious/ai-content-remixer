import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Here you would typically make an API call to authenticate
      // For now, let's simulate a successful sign-in
      if (email && password) {
        // Store some user info in localStorage (in real app, use proper auth tokens)
        localStorage.setItem('user', JSON.stringify({ email }));
        // Redirect to the content page
        router.push('/content');
      } else {
        setError('Please enter both email and password');
      }
    } catch (err) {
      setError('Failed to sign in. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // Here you would implement Google OAuth
      // For now, let's simulate a successful sign-in
      localStorage.setItem('user', JSON.stringify({ email: 'google-user@example.com' }));
      router.push('/content');
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      {/* Logo */}
      <Link href="/" className="mb-2">
        <div className="flex items-center gap-2">
          <Image 
            src="/jenni-logo.svg" 
            alt="Nani Logo" 
            width={40} 
            height={40}
            className="w-10"
          />
          <span className="text-2xl font-bold">nani.ai</span>
        </div>
      </Link>

      {/* Sign In Form */}
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Sign in to Nani</h2>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Google Sign In Button */}
          <button 
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-3 px-4 hover:bg-gray-50 transition-colors"
          >
            <Image 
              src="/google-logo.svg" 
              alt="Google" 
              width={20} 
              height={20} 
            />
            Continue with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or</span>
            </div>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4339F2] focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <button type="button" className="text-sm text-gray-500 hover:text-gray-700">
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Please enter your password"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4339F2] focus:border-transparent"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-[#4339F2] text-white py-3 rounded-lg hover:bg-[#372EE2] transition-colors font-medium"
            >
              Sign In
            </button>

            <div className="text-center text-sm text-gray-600">
              <span>Don't have an account? </span>
              <Link href="/signup" className="text-[#4339F2] hover:underline font-medium">
                Sign Up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 