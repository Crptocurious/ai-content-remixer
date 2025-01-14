import { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, DocumentDuplicateIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

interface CustomStyle {
  id: string;
  name: string;
  description?: string;
  category?: string;
  baseTone: string;
  isEnabled: boolean;
}

const baseTones = [
  { id: 'professional', label: 'Professional' },
  { id: 'casual', label: 'Casual' },
  { id: 'funny', label: 'Funny' },
  { id: 'poetic', label: 'Poetic' }
];

export default function StylesPage() {
  const [text, setText] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['funny']);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Style Editor</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {/* Text Input */}
            <div className="mb-8">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your text here..."
                className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Style Controls */}
            <div className="space-y-8">
              {/* Style Intensity */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    Style Intensity
                    <QuestionMarkCircleIcon className="w-4 h-4 ml-1 text-gray-400" />
                  </label>
                  <span className="text-sm text-gray-500">{intensity}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={intensity}
                  onChange={(e) => setIntensity(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Moderate transformation with balanced creativity
                </p>
              </div>

              {/* Style Selection */}
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {baseTones.map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => {
                        if (selectedStyles.includes(tone.id)) {
                          setSelectedStyles(selectedStyles.filter(id => id !== tone.id));
                        } else {
                          setSelectedStyles([...selectedStyles, tone.id]);
                        }
                      }}
                      className={`p-3 rounded-lg border ${
                        selectedStyles.includes(tone.id)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <span className="text-sm font-medium">{tone.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Previews */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">Style Previews</h3>
                <div className="space-y-4">
                  {baseTones.map((tone) => (
                    <div key={tone.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-sm font-medium">{tone.label}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {tone.id === 'funny' && 'Adds humor and wit to your text'}
                        {tone.id === 'professional' && 'Formal and business-appropriate tone'}
                        {tone.id === 'poetic' && 'Lyrical and artistic expression'}
                        {tone.id === 'casual' && 'Relaxed and conversational tone'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex justify-center">
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Generate Variations
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 