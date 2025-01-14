import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { HomeIcon, Cog6ToothIcon, BeakerIcon, Bars3Icon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface StyleWeight {
  id: string;
  weight: number;
}

interface StylePreset {
  id: string;
  name: string;
  styles: StyleWeight[];
}

export default function Content() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [inputText, setInputText] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<StyleWeight[]>([]);
  const [intensity, setIntensity] = useState(5);
  const [outputTexts, setOutputTexts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [showIntensityTooltip, setShowIntensityTooltip] = useState(false);
  const [savedPresets, setSavedPresets] = useState<StylePreset[]>([]);
  const [previewTexts, setPreviewTexts] = useState<{[key: string]: string}>({});
  const [selectedTab, setSelectedTab] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
      color: 'bg-gray-50 hover:bg-gray-100',
      description: 'Adds humor and wit to your text'
    },
    { 
      id: 'professional', 
      label: '💼 Professional', 
      color: 'bg-gray-50 hover:bg-gray-100',
      description: 'Formal and business-appropriate tone'
    },
    { 
      id: 'poetic', 
      label: '📝 Poetic', 
      color: 'bg-gray-50 hover:bg-gray-100',
      description: 'Lyrical and artistic expression'
    },
    { 
      id: 'casual', 
      label: '⭐ Casual', 
      color: 'bg-gray-50 hover:bg-gray-100',
      description: 'Relaxed and conversational tone'
    }
  ];

  const getIntensityDescription = (value: number) => {
    if (value <= 3) return "Subtle changes while maintaining most of original structure";
    if (value <= 7) return "Moderate transformation with balanced creativity";
    return "Maximum creativity and deviation from original";
  };

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyles(prev => {
      // If style is already selected, remove it
      if (prev.some(s => s.id === styleId)) {
        return prev.filter(s => s.id !== styleId);
      }
      
      // Don't add if we already have 3 styles
      if (prev.length >= 3) {
        return prev;
      }

      // Add new style with default weight
      const remainingWeight = 100 - prev.reduce((sum, s) => sum + s.weight, 0);
      return [...prev, { id: styleId, weight: remainingWeight }];
    });
  };

  const handleWeightChange = (styleId: string, newWeight: number) => {
    setSelectedStyles(prev => {
      const otherStyles = prev.filter(s => s.id !== styleId);
      const totalOtherWeight = otherStyles.reduce((sum, s) => sum + s.weight, 0);
      
      // Ensure total weight doesn't exceed 100
      if (totalOtherWeight + newWeight > 100) {
        return prev;
      }

      return [...otherStyles, { id: styleId, weight: newWeight }].sort((a, b) => b.weight - a.weight);
    });
  };

  const checkStyleConflicts = () => {
    const conflicts = [];
    if (selectedStyles.some(s => s.id === 'professional') && 
        selectedStyles.some(s => s.id === 'funny')) {
      conflicts.push('Professional and Funny styles may create tonal inconsistencies');
    }
    // Add more conflict rules as needed
    return conflicts;
  };

  const savePreset = (name: string) => {
    setSavedPresets(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name,
        styles: [...selectedStyles]
      }
    ]);
  };

  const loadPreset = (preset: StylePreset) => {
    setSelectedStyles(preset.styles);
  };

  const handleSubmit = async () => {
    if (!inputText || selectedStyles.length === 0) {
      setError('Please enter text and select at least one style');
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
          styles: selectedStyles,
          intensity
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

  const renderContent = () => {
    switch (selectedTab) {
      case 'home':
        return (
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter your text here..."
              className="w-full h-40 p-4 text-base bg-[#F8F9FB] rounded-xl border-0 resize-none focus:ring-0 placeholder-gray-400"
            />

            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Style Intensity</label>
                <div 
                  className="relative"
                  onMouseEnter={() => setShowIntensityTooltip(true)}
                  onMouseLeave={() => setShowIntensityTooltip(false)}
                >
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  {showIntensityTooltip && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
                      <p className="mb-1">Level 1-3: Subtle changes</p>
                      <p className="mb-1">Level 4-7: Moderate transformation</p>
                      <p>Level 8-10: Maximum creativity</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-600 w-8 text-center">{intensity}</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">{getIntensityDescription(intensity)}</p>
            </div>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {remixStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => handleStyleSelect(style.id)}
                  className={`p-4 rounded-xl transition-colors text-sm ${
                    selectedStyles.some(s => s.id === style.id) 
                      ? 'bg-[#4339F2] text-white' 
                      : style.color
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>

            {/* Style Weights Section */}
            {selectedStyles.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Style Weights</h3>
                <div className="space-y-3">
                  {selectedStyles.map((style) => {
                    const styleInfo = remixStyles.find(s => s.id === style.id)!;
                    return (
                      <div key={style.id} className="flex items-center gap-4">
                        <span className="w-24 text-sm">{styleInfo.label}</span>
                        <input
                          type="range"
                          min="1"
                          max={100 - selectedStyles.filter(s => s.id !== style.id).reduce((sum, s) => sum + s.weight, 0)}
                          value={style.weight}
                          onChange={(e) => handleWeightChange(style.id, parseInt(e.target.value))}
                          className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="w-12 text-sm text-right">{style.weight}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Style Conflicts Warning */}
            {selectedStyles.length > 1 && (
              <div className="mt-4">
                {checkStyleConflicts().map((conflict, index) => (
                  <div key={index} className="text-amber-600 text-sm flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {conflict}
                  </div>
                ))}
              </div>
            )}

            {/* Preview Cards */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Style Previews</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {remixStyles.map((style) => (
                  <div key={style.id} className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="text-sm font-medium mb-2">{style.label}</h4>
                    <p className="text-sm text-gray-600">{style.description}</p>
                    {previewTexts[style.id] && (
                      <p className="mt-2 text-sm text-gray-800">{previewTexts[style.id]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Presets Section */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Saved Presets</h3>
                {selectedStyles.length > 0 && (
                  <button
                    onClick={() => {
                      const name = prompt('Enter a name for this preset:');
                      if (name) savePreset(name);
                    }}
                    className="text-sm text-[#4339F2] hover:text-[#372EE2]"
                  >
                    Save Current Combination
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {savedPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => loadPreset(preset)}
                    className="p-3 text-left bg-gray-50 rounded-xl hover:bg-gray-100"
                  >
                    <h4 className="text-sm font-medium mb-1">{preset.name}</h4>
                    <div className="text-xs text-gray-500">
                      {preset.styles.map(s => {
                        const styleInfo = remixStyles.find(rs => rs.id === s.id)!;
                        return `${styleInfo.label}: ${s.weight}%`;
                      }).join(', ')}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="mt-4 text-red-500 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isLoading || !inputText || selectedStyles.length === 0}
              className="mt-6 px-6 py-3 bg-[#4339F2] text-white text-sm rounded-xl hover:bg-[#372EE2] disabled:opacity-50 disabled:hover:bg-[#4339F2] transition-colors"
            >
              {isLoading ? 'Processing...' : 'Generate Variations'}
            </button>
          </div>
        );
      case 'management':
      case 'testing':
        return (
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="flex flex-col items-center justify-center py-12">
              <Image
                src="/coming-soon.svg"
                alt="Coming Soon"
                width={200}
                height={200}
                className="mb-6"
              />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Coming Soon
              </h2>
              <p className="text-gray-600">
                We're working hard to bring you this feature. Stay tuned!
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex">
      {/* Sidebar */}
      <div className={`w-64 bg-white border-r border-gray-200 fixed h-full transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-64'
      }`}>
        <div className="flex items-center gap-2 p-4 border-b border-gray-200">
          <Image 
            src="/jenni-logo.svg" 
            alt="Nani Logo" 
            width={32} 
            height={32}
            className="w-8"
          />
          <span className="text-xl font-medium">nani</span>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setSelectedTab('home')}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedTab === 'home'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <HomeIcon className="w-5 h-5" />
                <span>Home</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedTab('management')}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedTab === 'management'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Cog6ToothIcon className="w-5 h-5" />
                <span>Management</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedTab('testing')}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedTab === 'testing'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <BeakerIcon className="w-5 h-5" />
                <span>Testing & Validation</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <nav className="bg-white border-b border-gray-200 relative">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`absolute left-0 top-1/2 -translate-y-1/2 ${
              isSidebarOpen 
                ? '-translate-x-1/2'
                : 'translate-x-0'
            } w-6 h-12 bg-white border border-gray-200 rounded-r flex items-center justify-center hover:bg-gray-50 focus:outline-none z-50 shadow-sm transition-transform duration-300`}
            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
          >
            {isSidebarOpen ? (
              <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronRightIcon className="w-4 h-4 text-gray-600" />
            )}
          </button>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-end items-center h-16">
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

        {/* Page Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
} 