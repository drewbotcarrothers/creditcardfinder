'use client';

import { useState, useEffect, useRef } from 'react';
import { CreditCard } from '@/lib/types';
import Link from 'next/link';

interface SearchBarProps {
  cards: CreditCard[];
}

export default function SearchBar({ cards }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<CreditCard[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle search
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (searchTerm.length < 2) {
      queueMicrotask(() => setResults([]));
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = cards.filter(card => {
      // Search in card name
      if (card.creditCardName.toLowerCase().includes(term)) return true;
      // Search in issuer
      if (card.issuer.toLowerCase().includes(term)) return true;
      // Search in category
      if (card.category.toLowerCase().includes(term)) return true;
      // Search in rewards program
      if (card.rewardsProgram.toLowerCase().includes(term)) return true;
      // Search in features
      if (card.features?.toLowerCase().includes(term)) return true;
      // Search in welcome bonus
      if (card.welcomeBonus?.toLowerCase().includes(term)) return true;
      // Search in description
      if (card.description?.toLowerCase().includes(term)) return true;
      
      return false;
    }).slice(0, 8); // Limit to 8 results

    setResults(filtered);
  }, [searchTerm, cards]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Open dropdown when searching
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (searchTerm.length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [searchTerm]);

  // Handle keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Escape to close
      if (e.key === 'Escape') {
        queueMicrotask(() => setIsOpen(false));
        inputRef.current?.blur();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const clearSearch = () => {
    setSearchTerm('');
    setResults([]);
    inputRef.current?.focus();
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i} className="bg-red-100 text-red-900 px-0.5 rounded">{part}</mark> : part
    );
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      {/* Search Input - Mobile Optimized */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search cards by name, issuer, rewards..."
          className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm sm:text-base text-gray-900 placeholder-gray-400 bg-white shadow-sm min-h-[48px]"
        />

        {/* Clear button */}
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-400 hover:text-gray-600 min-w-[44px] justify-center"
            aria-label="Clear search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Keyboard shortcut hint - Hidden on small mobile */}
        {!searchTerm && (
          <div className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center pointer-events-none">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs font-semibold text-gray-400 bg-gray-100 border border-gray-200 rounded">
              Ctrl K
            </kbd>
          </div>
        )}
      </div>

      {/* Search Results Dropdown - Mobile Optimized */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden max-h-[70vh] sm:max-h-96 overflow-y-auto">
          {results.map((card) => (
            <Link
              key={card.id}
              href={`/card/${card.slug}`}
              onClick={() => {
                setIsOpen(false);
                setSearchTerm('');
              }}
              className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
            >
              {/* Card Image - Smaller on mobile */}
              <div className="flex-shrink-0 w-12 h-8 sm:w-16 sm:h-10 bg-gray-100 rounded flex items-center justify-center text-xs sm:text-sm text-gray-400 font-medium">
                {card.issuer.slice(0, 2).toUpperCase()}
              </div>

              {/* Card Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                  {highlightText(card.creditCardName, searchTerm)}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  {card.issuer} • {card.category}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {card.annualFee === 0 ? (
                    <span className="inline-block text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded">
                      No Annual Fee
                    </span>
                  ) : (
                    <span className="inline-block text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                      {card.annualFeeDisplay}
                    </span>
                  )}
                </div>
              </div>

              {/* Arrow - Hidden on mobile */}
              <div className="hidden sm:flex flex-shrink-0 self-center">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
          
          {/* View all results link */}
          <Link
            href={`/?search=${encodeURIComponent(searchTerm)}`}
            onClick={() => setIsOpen(false)}
            className="block p-3 sm:p-4 text-center text-sm font-medium text-red-600 hover:bg-gray-50 transition-colors border-t border-gray-100 sticky bottom-0 bg-white"
          >
            View all {results.length} results
          </Link>
        </div>
      )}

      {/* No results message - Mobile Optimized */}
      {isOpen && searchTerm.length >= 2 && results.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-4 sm:p-6 text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-gray-300">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-900 font-medium text-sm sm:text-base">No cards found</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Try searching for a different card or issuer</p>
        </div>
      )}
    </div>
  );
}
