'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCompare } from '@/context/CompareContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { compareCards } = useCompare();
  const compareCount = compareCards.length;

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {/* Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-2 px-3 flex-1 min-h-[44px] touch-manipulation ${
            isActive('/') && !pathname.includes('/card/') && !pathname.includes('/blog/') && !pathname.includes('/quiz/')
              ? 'text-red-600'
              : 'text-gray-500'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs mt-0.5">Home</span>
        </Link>

        {/* Quiz */}
        <Link
          href="/quiz"
          className={`flex flex-col items-center justify-center py-2 px-3 flex-1 min-h-[44px] touch-manipulation ${
            isActive('/quiz') ? 'text-red-600' : 'text-gray-500'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <span className="text-xs mt-0.5">Quiz</span>
        </Link>

        {/* Blog */}
        <Link
          href="/blog"
          className={`flex flex-col items-center justify-center py-2 px-3 flex-1 min-h-[44px] touch-manipulation ${
            isActive('/blog') ? 'text-red-600' : 'text-gray-500'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <span className="text-xs mt-0.5">Blog</span>
        </Link>

        {/* Compare */}
        <Link
          href="/compare"
          className={`flex flex-col items-center justify-center py-2 px-3 flex-1 min-h-[44px] touch-manipulation relative ${
            isActive('/compare') ? 'text-red-600' : 'text-gray-500'
          }`}
        >
          <div className="relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {compareCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                {compareCount}
              </span>
            )}
          </div>
          <span className="text-xs mt-0.5">Compare</span>
        </Link>
      </div>
    </nav>
  );
}
