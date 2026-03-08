'use client';

import Link from 'next/link';
import { useCompare } from '@/context/CompareContext';

export default function Header() {
  const { compareCards, clearCards } = useCompare();
  const compareCount = compareCards.length;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">Canadian Credit Card Finder</span>
          </Link>

          {/* Compare Button */}
          <div className="flex items-center gap-4">
            <Link
              href="/compare"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                compareCount > 0
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-100 text-gray-600 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Compare
              {compareCount > 0 && (
                <span className="bg-white text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {compareCount}
                </span>
              )}
            </Link>

            {compareCount > 0 && (
              <button
                onClick={clearCards}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
