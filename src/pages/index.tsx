import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import confetti from 'canvas-confetti'

interface SavedResponse {
  id: string;
  text: string;
  style: string;
  timestamp: string;
}

export default function Home() {
  const [inputText, setInputText] = useState('')
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [outputTexts, setOutputTexts] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDark, setIsDark] = useState(false)
  const [savedResponses, setSavedResponses] = useState<SavedResponse[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingText, setEditingText] = useState<string>('')

  // Handle theme changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  const remixStyles = [
    { 
      id: 'funny', 
      label: '🎭 Funny', 
      color: 'bg-gradient-to-br from-[#FF6B6B] to-[#FF8E53] hover:from-[#FF5757] hover:to-[#FF7E3F]'
    },
    { 
      id: 'professional', 
      label: '💼 Professional', 
      color: 'bg-gradient-to-br from-[#4A90E2] to-[#5CB6E4] hover:from-[#357ABD] hover:to-[#49A3D1]'
    },
    { 
      id: 'poetic', 
      label: '📝 Poetic', 
      color: 'bg-gradient-to-br from-[#9D50BB] to-[#6E48AA] hover:from-[#8A3DAA] hover:to-[#5D3799]'
    },
    { 
      id: 'casual', 
      label: '🌟 Casual', 
      color: 'bg-gradient-to-br from-[#4CAF50] to-[#45B649] hover:from-[#3D9140] hover:to-[#39A23C]'
    }
  ]

  const throwConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  const handleSubmit = async () => {
    if (!inputText || !selectedStyle) {
      setError('Please enter text and select a style')
      return
    }

    setIsLoading(true)
    setOutputTexts([])
    setError(null)

    try {
      // Make 3 parallel requests for variations
      const variations = await Promise.all([1, 2, 3].map(async () => {
        const response = await fetch('/api/remix', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            text: inputText, 
            style: selectedStyle 
          }),
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.message || `Error: ${response.status}`)
        }

        if (!data.success || !data?.messages?.[0]?.content) {
          throw new Error('Invalid response format')
        }

        return data.messages[0].content
      }))

      setOutputTexts(variations)
      throwConfetti()
    } catch (error) {
      console.error('Remix Error:', error)
      setError(error instanceof Error ? error.message : 'Failed to process request')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTweetShare = (text: string) => {
    const tweetText = encodeURIComponent(text)
    const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}&via=RemixTool`
    window.open(tweetUrl, '_blank')
  }

  // Load saved responses only on client side
  useEffect(() => {
    const fetchSavedResponses = async () => {
      // Make sure we're on client side and supabase is initialized
      if (typeof window === 'undefined' || !supabase) return

      try {
        const { data, error } = await supabase
          .from('saved_responses')
          .select('*')
          .order('timestamp', { ascending: false })

        if (error) throw error
        if (data) setSavedResponses(data)
      } catch (error) {
        console.error('Error fetching saved responses:', error)
      }
    }

    fetchSavedResponses()
  }, [])

  const handleSaveResponse = async (text: string) => {
    if (!supabase || !selectedStyle) {
      setError('No style selected')
      return
    }
    
    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('saved_responses')
        .insert({
          text: text,
          style: selectedStyle,
          timestamp: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase Error:', error)
        throw new Error('Failed to save response')
      }

      if (data) {
        setSavedResponses(prev => [data, ...prev])
        // Open sidebar when saving
        setIsSidebarOpen(true)
        // Show success message
        setError('Response saved successfully!')
        setTimeout(() => setError(null), 3000)
      }
    } catch (error) {
      console.error('Save Error:', error)
      setError(error instanceof Error ? error.message : 'Failed to save response')
    }
  }

  const handleDeleteSaved = async (id: string) => {
    if (!supabase) return

    try {
      const { error } = await supabase
        .from('saved_responses')
        .delete()
        .eq('id', id)

      if (error) throw error
      setSavedResponses(prev => prev.filter(response => response.id !== id))
    } catch (error) {
      console.error('Error deleting response:', error)
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  // Update theme colors
  const themeColors = {
    dark: {
      background: 'bg-[#0E1525]',
      card: 'bg-white',
      button: 'bg-[#2B3245] hover:bg-[#353E59]',
      text: 'text-gray-900',
      border: 'border-gray-100',
      heading: 'text-gray-900',
      subtext: 'text-gray-600'
    },
    light: {
      background: 'bg-[#F9F9F9]',
      card: 'bg-white',
      button: 'bg-white hover:bg-gray-50',
      text: 'text-gray-900',
      border: 'border-gray-100',
      heading: 'text-gray-900',
      subtext: 'text-gray-600'
    }
  }

  // Add theme toggle button component
  const ThemeToggle = () => (
    <button
      onClick={toggleTheme}
      className={`fixed top-6 left-6 p-3 rounded-full 
        ${isDark 
          ? 'bg-[#2B3245] hover:bg-[#353E59]' 
          : 'bg-white hover:bg-gray-100 shadow-md border border-gray-200'
        }
        transition-all duration-200 z-50`}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
          />
        </svg>
      ) : (
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
          />
        </svg>
      )}
    </button>
  )

  // Add this new component for the sidebar toggle
  const SidebarToggle = ({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`fixed right-6 top-6 p-2 rounded-lg transition-all duration-200
        ${isDark 
          ? 'bg-[#1C2333] hover:bg-[#2B3245] text-gray-400 hover:text-white' 
          : 'bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900'} 
        border ${isDark ? 'border-gray-800' : 'border-gray-200'}
        shadow-sm z-50`}
      aria-label="Toggle sidebar"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
      </svg>
    </button>
  )

  // Update the edit handler
  const handleEdit = (text: string, index: number) => {
    setEditingIndex(index)
    setEditingText(text)
  }

  // Add save edit handler
  const handleSaveEdit = (index: number) => {
    if (editingText.trim()) {
      const newOutputTexts = [...outputTexts]
      newOutputTexts[index] = editingText
      setOutputTexts(newOutputTexts)
    }
    setEditingIndex(null)
    setEditingText('')
  }

  // Add cancel edit handler
  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditingText('')
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0E1525]' : 'bg-[#F9F9F9]'}`}>
      {/* Theme Toggle */}
      <ThemeToggle />

      <div className="flex">
        {/* Main Content */}
        <div className={`flex-1 ${isSidebarOpen ? 'mr-80' : 'mr-0'} transition-all duration-300`}>
          <main className="p-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className={`text-5xl font-serif font-medium mb-6 
                ${isDark ? 'text-white' : 'text-gray-900'}`}>
                AI Content Remixer
              </h1>
              <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Create beautiful, modern text variations at the speed of thought.
              </p>
            </div>

            {/* Input Card */}
            <div className={`${isDark ? 'bg-[#1C2333]' : 'bg-white'} 
              rounded-3xl shadow-sm border ${isDark ? 'border-gray-800' : 'border-gray-100'} p-8`}>
              <textarea
                className={`w-full h-40 px-6 py-4 rounded-2xl border 
                  ${isDark ? 'bg-[#0E1525] border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'} 
                  placeholder-gray-500 text-lg
                  focus:ring-2 focus:ring-[#2F7A4D] focus:border-transparent 
                  transition duration-200 ease-in-out resize-none`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="What would you like to remix? Start typing..."
              />

              {/* Style Selection */}
              <div className="mt-8">
                <label className={`block text-xl font-medium mb-4 
                  ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Choose a Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {remixStyles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`
                        px-6 py-4 rounded-xl text-base
                        font-medium transition-all duration-200
                        ${selectedStyle === style.id ? style.color : 
                          isDark ? 'bg-[#2B3245] text-white hover:bg-[#353E59]' : 
                          'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !inputText || !selectedStyle}
                  className={`px-8 py-4 rounded-xl text-lg
                    bg-[#3F7A48] hover:bg-[#346B3D] text-white 
                    transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center gap-3 min-w-[200px] justify-center`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Generate Variations
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Add the sidebar toggle button */}
            <SidebarToggle isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

            {/* Error/Success Messages */}
            {error && (
              <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 
                ${error.includes('success') 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'} 
                border rounded-lg shadow-lg px-6 py-3 flex items-center gap-3`}
              >
                {error.includes('success') && (
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                <p className={`font-medium ${
                  error.includes('success') ? 'text-green-800' : 'text-red-800'
                }`}>
                  {error}
                </p>
              </div>
            )}

            {/* Output Cards */}
            {outputTexts.length > 0 && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {outputTexts.map((text, index) => (
                  <div
                    key={index}
                    className={`${isDark ? 'bg-[#1C2333] border-gray-800' : 'bg-white border-gray-100'} 
                      rounded-xl border p-4 shadow-sm
                      hover:shadow-md transition-all duration-200`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Variation {index + 1}
                      </span>
                      <div className="flex items-center gap-3">
                        {editingIndex === index ? (
                          <>
                            {/* Save Edit Button */}
                            <button
                              onClick={() => handleSaveEdit(index)}
                              className={`p-2 rounded-lg transition-colors
                                ${isDark 
                                  ? 'hover:bg-[#2B3245] text-green-400 hover:text-green-300' 
                                  : 'hover:bg-gray-100 text-green-600 hover:text-green-500'
                                }`}
                              title="Save changes"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            {/* Cancel Edit Button */}
                            <button
                              onClick={handleCancelEdit}
                              className={`p-2 rounded-lg transition-colors
                                ${isDark 
                                  ? 'hover:bg-[#2B3245] text-red-400 hover:text-red-300' 
                                  : 'hover:bg-gray-100 text-red-600 hover:text-red-500'
                                }`}
                              title="Cancel editing"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <>
                            {/* Edit Button */}
                            <button
                              onClick={() => handleEdit(text, index)}
                              className={`p-2 rounded-lg transition-colors
                                ${isDark 
                                  ? 'hover:bg-[#2B3245] text-gray-400 hover:text-white' 
                                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                                }`}
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            {/* Save Button */}
                            <button
                              onClick={() => handleSaveResponse(text)}
                              className={`p-2 rounded-lg transition-colors
                                ${isDark 
                                  ? 'hover:bg-[#2B3245] text-gray-400 hover:text-white' 
                                  : 'hover:bg-gray-100 text-gray-600 hover:text-[#2F7A4D]'
                                }`}
                              title="Save"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                              </svg>
                            </button>
                            {/* Share Button */}
                            <button
                              onClick={() => handleTweetShare(text)}
                              className={`p-2 rounded-lg transition-colors
                                ${isDark 
                                  ? 'hover:bg-[#2B3245] text-gray-400 hover:text-[#1DA1F2]' 
                                  : 'hover:bg-gray-100 text-gray-600 hover:text-[#1DA1F2]'
                                }`}
                              title="Share on Twitter"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {editingIndex === index ? (
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className={`w-full p-2 rounded-lg border 
                          ${isDark 
                            ? 'bg-[#0E1525] border-gray-800 text-white' 
                            : 'bg-white border-gray-200 text-gray-900'
                          }
                          focus:ring-2 focus:ring-[#2F7A4D] focus:border-transparent 
                          transition duration-200 ease-in-out resize-none`}
                        rows={4}
                        autoFocus
                      />
                    ) : (
                      <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{text}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>

        {/* Sidebar */}
        <div className={`fixed right-0 top-0 h-full w-80 
          ${isDark ? 'bg-[#1C2333] border-gray-800' : 'bg-white border-gray-100'}
          border-l transform transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          flex flex-col`}
        >
          <div className="p-6 border-b border-gray-800">
            <div className="flex justify-between items-center">
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Saved Responses
              </h2>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-4">
              {savedResponses.map((response) => (
                <motion.div
                  key={response.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl ${isDark ? 'bg-[#2B3245] border-gray-800' : 'bg-gray-50 border-gray-200'} border`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-1 rounded-md text-sm
                      ${isDark ? 'bg-[#353E59] text-white/80' : 'bg-white text-gray-700'}`}>
                      {response.style}
                    </span>
                    <div className="flex gap-2">
                      {/* Tweet Button */}
                      <button
                        onClick={() => handleTweetShare(response.text)}
                        className={`p-1.5 rounded-lg transition-colors
                          ${isDark 
                            ? 'hover:bg-[#1a2e3b] text-[#1DA1F2]' 
                            : 'hover:bg-blue-50 text-[#1DA1F2]'
                          }`}
                        title="Share on Twitter"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                      </button>
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteSaved(response.id)}
                        className={`p-1.5 rounded-lg transition-colors
                          ${isDark 
                            ? 'hover:bg-[#2B3245] text-gray-400 hover:text-red-400' 
                            : 'hover:bg-red-50 text-gray-400 hover:text-red-500'
                          }`}
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-white/90' : 'text-gray-700'}`}>
                    {response.text}
                  </p>
                  <div className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(response.timestamp).toLocaleDateString()}
                  </div>
                </motion.div>
              ))}

              {savedResponses.length === 0 && (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No saved responses yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 