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

  const toggleCompare = () => {
    if (isSelected) {
      removeCard(card.slug);
    } else {
      addCard(card.slug);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Card Image */}
      <Link href={`/card/${card.slug}`} className="block relative aspect-[1.58/1] bg-gray-100">
        <Image
          src={`/images/cards/${card.imageFile}`}
          alt={card.creditCardName}
          fill
          className="object-contain p-4"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </Link>

      {/* Card Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link href={`/card/${card.slug}`}>
            <h3 className="font-semibold text-gray-900 leading-tight hover:text-red-600 transition-colors">
              {card.creditCardName}
            </h3>
          </Link>
        </div>

        <p className="text-sm text-gray-500 mb-3">{card.issuer}</p>

        {/* Key Details */}
        <div className="space-y-1 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Annual Fee:</span>
            <span className="font-medium">{card.annualFeeDisplay}</span>
          </div>
          {card.welcomeBonus && (
            <div className="flex justify-between">
              <span className="text-gray-600">Welcome Bonus:</span>
              <span className="font-medium text-green-600">{card.welcomeBonus}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/card/${card.slug}`}
            className="flex-1 bg-red-600 text-white text-center py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            View Details
          </Link>

          <button
            onClick={toggleCompare}
            className={`px-3 py-2 rounded-lg border-2 font-medium transition-colors ${
              isSelected
                ? 'bg-red-100 border-red-600 text-red-600'
                : 'border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600'
            }`}
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
