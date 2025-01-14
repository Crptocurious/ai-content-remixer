import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'

export default function Content() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [inputText, setInputText] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [outputTexts, setOutputTexts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  // Check if user is authenticated
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/signin');
      return;
    }
    setUser(JSON.parse(userStr));
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const remixStyles = [
    { 
      id: 'funny', 
      label: '🤡 Funny', 
      color: 'bg-gray-50 hover:bg-gray-100'
    },
    { 
      id: 'professional', 
      label: '💼 Professional', 
      color: 'bg-gray-50 hover:bg-gray-100'
    },
    { 
      id: 'poetic', 
      label: '📝 Poetic', 
      color: 'bg-gray-50 hover:bg-gray-100'
    },
    { 
      id: 'casual', 
      label: '⭐ Casual', 
      color: 'bg-gray-50 hover:bg-gray-100'
    }
  ];

  const handleSubmit = async () => {
    if (!inputText || !selectedStyle) {
      setError('Please enter text and select a style');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/remix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: inputText, 
          style: selectedStyle,
          numVariations: 4 // Request 4 variations
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to process request');
      }
      
      if (!data.variations || !data.variations.length) {
        throw new Error('No variations received from the server');
      }

      setOutputTexts(data.variations);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to process request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTweet = (text: string) => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleEdit = (index: number, text: string) => {
    setEditingIndex(index);
    setEditingText(text);
  };

  const handleSaveEdit = (index: number) => {
    const newTexts = [...outputTexts];
    newTexts[index] = editingText;
    setOutputTexts(newTexts);
    setEditingIndex(null);
    setEditingText('');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingText('');
  };

  if (!user) {
    return null; // Don't render anything while checking authentication
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <Image 
                  src="/jenni-logo.svg" 
                  alt="Nani Logo" 
                  width={32} 
                  height={32}
                  className="w-8"
                />
                <span className="text-xl font-medium">nani</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter your text here..."
            className="w-full h-40 p-4 text-base bg-[#F8F9FB] rounded-xl border-0 resize-none focus:ring-0 placeholder-gray-400"
          />

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {remixStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-4 rounded-xl transition-colors text-sm ${
                  selectedStyle === style.id 
                    ? 'bg-[#4339F2] text-white' 
                    : style.color
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-4 text-red-500 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isLoading || !inputText || !selectedStyle}
            className="mt-6 px-6 py-3 bg-[#4339F2] text-white text-sm rounded-xl hover:bg-[#372EE2] disabled:opacity-50 disabled:hover:bg-[#4339F2] transition-colors"
          >
            {isLoading ? 'Processing...' : 'Generate Variations'}
          </button>
        </div>

        {/* Output Section */}
        {outputTexts.length > 0 && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {outputTexts.map((text, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-500">
                    Variation {index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    {editingIndex === index ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(index)}
                          className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                          title="Save changes"
                        >
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                          title="Cancel editing"
                        >
                          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(index, text)}
                          className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                          title="Edit this variation"
                        >
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleTweet(text)}
                          className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                          title="Share on Twitter"
                        >
                          <svg className="w-4 h-4 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24">
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
                    className="w-full h-32 p-4 text-sm bg-[#F8F9FB] rounded-xl border-0 resize-none focus:ring-0 placeholder-gray-400"
                    autoFocus
                  />
                ) : (
                  <p className="text-gray-900 text-sm leading-relaxed">
                    {text}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 