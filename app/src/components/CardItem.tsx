'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CreditCard } from '@/lib/types';
import { useCompare } from '@/context/CompareContext';

interface CardItemProps {
  card: CreditCard;
}

export default function CardItem({ card }: CardItemProps) {
  const { isInCompare, addCard, removeCard } = useCompare();
  const isSelected = isInCompare(card.slug);

  const toggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSelected) {
      removeCard(card.slug);
    } else {
      addCard(card.slug);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg hover:shadow-red-100/50 transition-all duration-200 group">
      {/* Card Image */}
      <Link href={`/card/${card.slug}`} className="block relative aspect-[1.58/1] bg-gradient-to-br from-gray-50 to-gray-100">
        <Image
          src={`/images/cards/${card.imageFile}`}
          alt={card.creditCardName}
          fill
          className="object-contain p-3 sm:p-4 group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Category Badge - Mobile Optimized */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
          <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-red-600 text-white rounded-md shadow-sm">
            {card.category}
          </span>
        </div>
      </Link>

      {/* Card Info */}
      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <Link href={`/card/${card.slug}`} className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 leading-tight hover:text-red-600 transition-colors text-sm sm:text-base line-clamp-2">
              {card.creditCardName}
            </h3>
          </Link>
        </div>

        <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 truncate">{card.issuer}</p>

        {/* Key Details - Improved Mobile Layout */}
        <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm mb-3 sm:mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Annual Fee:</span>
            <span className="font-semibold text-gray-900">{card.annualFeeDisplay}</span>
          </div>
          {card.welcomeBonus && (
            <div className="flex justify-between items-start gap-2">
              <span className="text-gray-500 flex-shrink-0">Bonus:</span>
              <span className="font-semibold text-green-600 text-right line-clamp-2 leading-tight">
                {card.welcomeBonus}
              </span>
            </div>
          )}
        </div>

        {/* Actions - Mobile Optimized Touch Targets */}
        <div className="flex gap-2 sm:gap-3">
          <Link
            href={`/card/${card.slug}`}
            className="flex-1 bg-red-600 text-white text-center py-2.5 sm:py-2 rounded-lg font-semibold text-sm hover:bg-red-700 active:bg-red-800 transition-colors min-h-[44px] flex items-center justify-center touch-manipulation"
          >
            View Details
          </Link>

          <button
            onClick={toggleCompare}
            className={`px-3 sm:px-4 rounded-lg border-2 font-semibold text-sm transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation ${
              isSelected
                ? 'bg-red-50 border-red-600 text-red-600'
                : 'border-gray-300 text-gray-600 hover:border-red-600 hover:text-red-600'
            }`}
            aria-label={isSelected ? 'Remove from comparison' : 'Add to comparison'}
            title={isSelected ? 'Remove from comparison' : 'Add to comparison'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isSelected ? 'M5 13l4 4L19 7' : 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'}
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
