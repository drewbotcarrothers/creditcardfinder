'use client';

import { Metadata } from 'next';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCompare } from '@/context/CompareContext';
import { CreditCard } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Compare Credit Cards Side-by-Side | Canadian Credit Card Finder',
  description: 'Compare up to 3 Canadian credit cards side-by-side. Compare annual fees, interest rates, rewards, welcome bonuses, and more to find your perfect card.',
  keywords: [
    'compare credit cards',
    'credit card comparison Canada',
    'card comparison tool',
    'side by side credit card comparison',
  ],
  openGraph: {
    title: 'Compare Credit Cards Side-by-Side',
    description: 'Compare up to 3 Canadian credit cards and find your perfect match.',
    type: 'website',
    locale: 'en_CA',
  },
  alternates: {
    canonical: 'https://canadiancreditcardfinder.com/compare',
  },
};

// Comparison table icon - scales/balance
const CompareIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
  </svg>
);

// Empty state illustration
const EmptyCompareIcon = () => (
  <svg className="w-16 h-16 mx-auto text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
  </svg>
);

export default function ComparePage() {
  const { compareCards, removeCard, clearCards } = useCompare();
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCards() {
      if (compareCards.length === 0) {
        setCards([]);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/cards');
        if (!response.ok) throw new Error('Failed to fetch cards');
        const allCards: CreditCard[] = await response.json();
        const selectedCards = allCards.filter(card => compareCards.includes(card.slug));
        setCards(selectedCards);
      } catch (error) {
        console.error('Error fetching cards:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCards();
  }, [compareCards]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-4 sm:pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-4 sm:pt-8 pb-20 sm:pb-8">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
            <EmptyCompareIcon />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-6 mb-3">
              No Cards to Compare
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Select up to 3 cards from our collection to compare side-by-side and find the perfect card for you.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Browse Cards
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const maxCards = 3;
  const emptySlots = maxCards - cards.length;

  // Comparison fields
  const comparisonFields = [
    { label: 'Annual Fee', key: 'annualFeeDisplay' },
    { label: 'Purchase Interest Rate', key: 'purchaseInterestRateDisplay' },
    { label: 'Cash Advance Rate', key: 'cashAdvanceInterestRateDisplay' },
    { label: 'Rewards Program', key: 'rewardsProgram' },
    { label: 'Welcome Bonus', key: 'welcomeBonus' },
    { label: 'Bonus Value', key: 'welcomeBonusValue' },
    { label: 'Key Features', key: 'features' },
    { label: 'Card Eligibility', key: 'cardEligibility' },
    { label: 'Insurance', key: 'insurance' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-4 sm:pt-8 pb-24 sm:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-red-600">
                  <CompareIcon />
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Compare Cards
                </h1>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">
                Side-by-side comparison of {cards.length} card{cards.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/"
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add More
              </Link>
              <button
                onClick={clearCards}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 sm:px-6 bg-gray-50 text-sm font-semibold text-gray-500 w-32 sm:w-40 sticky left-0 z-10 min-w-[100px]">
                    Feature
                  </th>
                  {cards.map((card) => (
                    <th key={card.id} className="py-4 px-4 sm:px-6 min-w-[200px] sm:min-w-[240px]">
                      <div className="text-center">
                        <div className="relative w-full aspect-[1.58/1] mb-3 bg-gray-50 rounded-lg overflow-hidden">
                          <Image
                            src={`/images/cards/${card.imageFile}`}
                            alt={card.creditCardName}
                            fill
                            className="object-contain p-2"
                          />
                        </div>
                        <Link
                          href={`/card/${card.slug}`}
                          className="font-semibold text-gray-900 hover:text-red-600 transition-colors line-clamp-2 text-sm"
                        >
                          {card.creditCardName}
                        </Link>
                        <button
                          onClick={() => removeCard(card.slug)}
                          className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </th>
                  ))}
                  {emptySlots > 0 && (
                    <th className="py-4 px-4 sm:px-6 min-w-[200px] sm:min-w-[240px]">
                      <Link
                        href="/"
                        className="flex flex-col items-center justify-center h-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-300 hover:bg-red-50/50 transition-colors"
                      >
                        <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-sm text-gray-500">Add Card</span>
                      </Link>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {comparisonFields.map((field, index) => (
                  <tr key={field.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="py-3 px-4 sm:px-6 text-sm font-medium text-gray-500 sticky left-0 z-10 bg-inherit min-w-[100px]">
                      {field.label}
                    </td>
                    {cards.map((card) => {
                      const value = card[field.key as keyof CreditCard] as string;
                      return (
                        <td key={card.id} className="py-3 px-4 sm:px-6">
                          <div className={`text-sm ${
                            field.key === 'welcomeBonusValue' ? 'text-green-600 font-semibold' : 'text-gray-700'
                          }`}>
                            {value || '—'}
                          </div>
                        </td>
                      );
                    })}
                    {emptySlots > 0 && <td className="py-3 px-4 sm:px-6" />}
                  </tr>
                ))}
                {/* Action Row */}
                <tr className="bg-red-50">
                  <td className="py-4 px-4 sm:px-6 text-sm font-semibold text-red-800 sticky left-0 z-10 bg-red-50 min-w-[100px]">
                    Action
                  </td>
                  {cards.map((card) => (
                    <td key={card.id} className="py-4 px-4 sm:px-6">
                      <a
                        href={card.productLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full bg-red-600 text-white py-2.5 px-4 rounded-lg font-semibold text-sm hover:bg-red-700 transition-colors"
                      >
                        Apply Now
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </td>
                  ))}
                  {emptySlots > 0 && <td className="py-4 px-4 sm:px-6" />}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Sticky CTA */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 sm:hidden z-50">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full bg-red-600 text-white py-3 rounded-lg font-semibold"
          >
            Browse More Cards
          </Link>
        </div>
      </div>
    </div>
  );
}
