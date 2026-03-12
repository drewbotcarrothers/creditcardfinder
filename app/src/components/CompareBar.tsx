'use client';

import Link from 'next/link';
import { useCompare } from '@/context/CompareContext';

export default function CompareBar() {
  const { compareCards, clearCards } = useCompare();

  if (compareCards.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 pb-safe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 sm:py-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                {compareCards.length} card{compareCards.length !== 1 ? 's' : ''} to compare
              </p>
              <p className="text-xs text-gray-500">
                Up to 3 cards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={clearCards}
              className="text-gray-500 hover:text-red-600 text-sm font-medium px-3 py-2"
            >
              Clear
            </button>
            
            <Link
              href="/compare"
              className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              Compare
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
