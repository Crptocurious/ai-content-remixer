import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { PlusIcon, PencilIcon, TrashIcon, DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/24/outline';

interface CustomStyle {
  id: string;
  name: string;
  description: string;
  category: string;
  baseTone: string;
  isEnabled: boolean;
  createdAt: Date;
}

const baseTones = [
  { id: 'professional', label: 'Professional', description: 'Formal and business-appropriate tone' },
  { id: 'casual', label: 'Casual', description: 'Relaxed and conversational tone' },
  { id: 'funny', label: 'Funny', description: 'Adds humor and wit to your text' },
  { id: 'poetic', label: 'Poetic', description: 'Lyrical and artistic expression' }
];

export default function StylesManagement() {
  const router = useRouter();
  const [styles, setStyles] = useState<CustomStyle[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStyle, setEditingStyle] = useState<CustomStyle | null>(null);
  const [previewText, setPreviewText] = useState('Enter sample text to preview your style...');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [formData, setFormData] = useState<Partial<CustomStyle>>({
    name: '',
    description: '',
    category: '',
    baseTone: 'professional',
    isEnabled: true
  });

  const categories = Array.from(new Set(styles.map(style => style.category))).filter(Boolean);

  const handleCreateStyle = () => {
    const newStyle: CustomStyle = {
      id: Math.random().toString(36).substring(7),
      name: formData.name || 'Untitled Style',
      description: formData.description || '',
      category: formData.category || 'Uncategorized',
      baseTone: formData.baseTone || 'professional',
      isEnabled: formData.isEnabled ?? true,
      createdAt: new Date()
    };

    setStyles([...styles, newStyle]);
    setFormData({
      name: '',
      description: '',
      category: '',
      baseTone: 'professional',
      isEnabled: true
    });
    setIsCreateModalOpen(false);
  };

  const handleEditStyle = (style: CustomStyle) => {
    setStyles(styles.map(s => s.id === style.id ? style : s));
    setEditingStyle(null);
  };

  const handleDuplicateStyle = (style: CustomStyle) => {
    const duplicatedStyle: CustomStyle = {
      ...style,
      id: Math.random().toString(36).substring(7),
      name: `${style.name} (Copy)`,
      createdAt: new Date()
    };
    setStyles([...styles, duplicatedStyle]);
  };

  const handleDeleteStyle = (styleId: string) => {
    setStyles(styles.filter(style => style.id !== styleId));
  };

  const filteredStyles = styles.filter(style => {
    const matchesCategory = selectedCategory === 'all' || style.category === selectedCategory;
    const matchesSearch = style.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         style.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Style Management</h1>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Style
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search styles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Style Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStyles.map((style) => (
            <div
              key={style.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{style.name}</h3>
                    <span className="inline-block px-2 py-1 text-sm bg-gray-100 rounded mt-1">
                      {style.category}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingStyle(style)}
                      className="p-2 text-gray-400 hover:text-blue-600"
                      title="Edit"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDuplicateStyle(style)}
                      className="p-2 text-gray-400 hover:text-blue-600"
                      title="Duplicate"
                    >
                      <DocumentDuplicateIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteStyle(style.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                      title="Delete"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">{style.description}</p>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">
                    Base Tone: {style.baseTone}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={style.isEnabled}
                      onChange={() => {
                        const updatedStyle = { ...style, isEnabled: !style.isEnabled };
                        handleEditStyle(updatedStyle);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Quick Preview Section */}
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <textarea
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                  className="w-full h-20 p-2 text-sm border border-gray-200 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter text to preview style..."
                />
                <button className="mt-2 w-full px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                  Preview Style
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Create/Edit Modal */}
      {(isCreateModalOpen || editingStyle) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingStyle ? 'Edit Style' : 'Create New Style'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Style Name
                </label>
                <input
                  type="text"
                  value={editingStyle?.name || formData.name}
                  onChange={(e) => editingStyle 
                    ? setEditingStyle({ ...editingStyle, name: e.target.value })
                    : setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter style name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editingStyle?.description || formData.description}
                  onChange={(e) => editingStyle
                    ? setEditingStyle({ ...editingStyle, description: e.target.value })
                    : setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe your style"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={editingStyle?.category || formData.category}
                  onChange={(e) => editingStyle
                    ? setEditingStyle({ ...editingStyle, category: e.target.value })
                    : setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter category"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Tone
                </label>
                <select
                  value={editingStyle?.baseTone || formData.baseTone}
                  onChange={(e) => editingStyle
                    ? setEditingStyle({ ...editingStyle, baseTone: e.target.value })
                    : setFormData({ ...formData, baseTone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {baseTones.map(tone => (
                    <option key={tone.id} value={tone.id}>
                      {tone.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={editingStyle?.isEnabled ?? formData.isEnabled}
                  onChange={(e) => editingStyle
                    ? setEditingStyle({ ...editingStyle, isEnabled: e.target.checked })
                    : setFormData({ ...formData, isEnabled: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Enable Style
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingStyle(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => editingStyle ? handleEditStyle(editingStyle) : handleCreateStyle()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingStyle ? 'Save Changes' : 'Create Style'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 