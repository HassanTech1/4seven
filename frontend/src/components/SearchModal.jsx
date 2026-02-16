import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const inputRef = useRef(null);
  const { openProductDetail } = useCart();

  const categories = [
    { id: '', name: 'All', nameAr: 'الكل' },
    { id: 'bags', name: 'Bags', nameAr: 'حقائب' },
    { id: 'shirts', name: 'Shirts', nameAr: 'قمصان' },
    { id: 'jackets', name: 'Jackets', nameAr: 'جاكيتات' },
    { id: 'pants', name: 'Pants', nameAr: 'بناطيل' },
  ];

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const searchProducts = async () => {
      if (!query && !selectedCategory) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (selectedCategory) params.append('category', selectedCategory);

        const response = await fetch(`${API_URL}/api/products/search?${params}`);
        const data = await response.json();
        setResults(data.products || []);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [query, selectedCategory]);

  const handleProductClick = (product) => {
    openProductDetail(product);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-white" data-testid="search-modal">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-lg"
                data-testid="search-input"
              />
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
              data-testid="close-search"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                data-testid={`category-filter-${cat.id || 'all'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 lg:px-8 py-8 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 160px)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-gray-200 border-t-black rounded-full" />
          </div>
        ) : results.length > 0 ? (
          <>
            <p className="text-sm text-gray-500 mb-6">
              {results.length} product{results.length !== 1 ? 's' : ''} found
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {results.map((product) => (
                <div
                  key={product.id}
                  className="group cursor-pointer"
                  onClick={() => handleProductClick(product)}
                  data-testid={`search-result-${product.id}`}
                >
                  <div className="relative h-64 bg-gray-100 mb-4 overflow-hidden rounded-lg">
                    <img
                      src={product.image}
                      alt={product.nameEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.isNew && (
                      <span className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded">
                        NEW
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-medium uppercase tracking-wide mb-1">
                    {product.nameEn}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {product.price.toFixed(2)} SAR
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : query || selectedCategory ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found</p>
            <p className="text-gray-400 text-sm mt-2">Try a different search term or category</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Start typing to search</p>
            <p className="text-gray-400 text-sm mt-2">Search for bags, shirts, jackets, and more</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;
