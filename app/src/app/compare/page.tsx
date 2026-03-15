'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCompare } from '@/context/CompareContext';
import { CreditCard } from '@/lib/types';
import { staticCards } from '@/lib/cards-data-static';
import EmailCapture from '@/components/EmailCapture';

// Winner badge component
const WinnerBadge = () => (
  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
    Best Value
  </span>
);

// Comparison tooltip component
const FieldTooltip = ({ label, tooltip }: { label: string; tooltip: string }) => (
  <div className="group relative inline-flex items-center gap-1">
    {label}
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
      {tooltip}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
);

// Parse numeric value from string or number
const parseNumericValue = (value: string | number): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const match = value.match(/[\d,]+\.?\d*/);
    if (match) {
      return parseFloat(match[0].replace(/,/g, ''));
    }
  }
  return null;
};

// Determine winner for numeric fields
const findWinner = (cards: CreditCard[], field: string, type: 'min' | 'max'): number | null => {
  const values = cards.map(card => {
    const val = card[field as keyof CreditCard] as string | number;
    return parseNumericValue(val);
  }).filter((val): val is number => val !== null);

  if (values.length === 0) return null;
  return type === 'min' ? Math.min(...values) : Math.max(...values);
};

export default function ComparePage() {
  const { compareCards, removeCard, clearCards } = useCompare();
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  useEffect(() => {
    try {
      // Use statically imported cards data (generated at build time)
      if (compareCards.length > 0) {
        if (!staticCards || staticCards.length === 0) {
          setError('Card data not available. Please try refreshing the page.');
        } else {
          const selectedCards = staticCards.filter((card) => compareCards.includes(card.slug));
          setCards(selectedCards);
        }
      }
    } catch (err) {
      console.error('Error loading cards:', err);
      setError('Failed to load card data. Please try again.');
    }
    setLoading(false);
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-4 sm:pt-8 pb-20 sm:pb-8">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 sm:p-12">
            <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Error Loading Cards
            </h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
            >
              Back to Home
            </Link>
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
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              No Cards Selected for Comparison
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              Add up to 3 cards to compare their features, rewards, and fees side-by-side. 
              Click the compare button on any card to add it here.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
              >
                Browse All Cards
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              
              <Link
                href="/quiz"
                className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 border-2 border-gray-200 px-8 py-3 rounded-xl font-semibold hover:border-red-300 hover:bg-red-50 transition-colors"
              >
                Take the Quiz
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const maxCards = 3;
  const emptySlots = maxCards - cards.length;

  // Find winners for different metrics
  const lowestFee = findWinner(cards, 'annualFee', 'min');
  const highestBonus = findWinner(cards, 'welcomeBonusValue', 'max');

  // Comparison field definitions with tooltips
  const comparisonFields = [
    { 
      label: 'Annual Fee', 
      key: 'annualFeeDisplay',
      tooltip: 'Yearly cost to keep the card. Many premium cards waive the first year.',
      type: 'min' as const,
    },
    { 
      label: 'Purchase Rate', 
      key: 'purchaseInterestRateDisplay',
      tooltip: 'Interest charged on unpaid balances. Pay in full monthly to avoid interest.',
      type: 'min' as const,
    },
    { 
      label: 'Cash Advance', 
      key: 'cashAdvanceInterestRateDisplay',
      tooltip: 'Interest rate for cash withdrawals. Usually higher than purchase rate.',
      type: 'min' as const,
    },
    { 
      label: 'Rewards Program', 
      key: 'rewardsProgram',
      tooltip: 'Type of points/cashback earned on purchases.',
    },
    { 
      label: 'Welcome Bonus', 
      key: 'welcomeBonus',
      tooltip: 'Bonus earned for meeting spending requirements in first 3 months.',
    },
    { 
      label: 'Bonus Value', 
      key: 'welcomeBonusValue',
      tooltip: 'Estimated dollar value of the welcome bonus offer.',
      type: 'max' as const,
    },
    { 
      label: 'Key Features', 
      key: 'features',
      tooltip: 'Special perks like lounge access, purchase protection, etc.',
    },
    { 
      label: 'Eligibility', 
      key: 'cardEligibility',
      tooltip: 'Credit score and income requirements for approval.',
    },
    { 
      label: 'Insurance', 
      key: 'insurance',
      tooltip: 'Included coverage like travel, purchase, or mobile device insurance.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-4 sm:pt-8 pb-24 sm:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-200">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Compare Cards
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Comparing {cards.length} card{cards.length !== 1 ? 's' : ''} side-by-side
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* View Toggle */}
              <div className="bg-white border border-gray-200 rounded-lg p-1 flex">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'table' 
                      ? 'bg-red-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'cards' 
                      ? 'bg-red-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Cards
                </button>
              </div>
              
              <Link
                href="/"
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Card
              </Link>
              
              <button
                onClick={clearCards}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Card Grid View */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {cards.map((card, index) => (
              <div key={card.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Card Header */}
                <div className="relative aspect-[1.58/1] bg-gradient-to-br from-gray-50 to-gray-100">
                  <Image
                    src={`/credit_card_images/${card.imageFile}`}
                    alt={card.creditCardName}
                    fill
                    className="object-contain p-4"
                  />
                  {index === 0 && cards.length > 1 && (
                    <div className="absolute top-3 left-3">
                      <WinnerBadge />
                    </div>
                  )}
                  <button
                    onClick={() => removeCard(card.slug)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-500 hover:text-red-600 transition-colors shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Card Details */}
                <div className="p-5">
                  <Link href={`/card/${card.slug}`}>
                    <h3 className="font-bold text-lg text-gray-900 hover:text-red-600 transition-colors mb-1">{card.creditCardName}</h3>
                  </Link>
                  <p className="text-gray-500 text-sm mb-4">{card.issuer}</p>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">Annual Fee</span>
                      <span className={`font-semibold ${
                        parseNumericValue(String(card.annualFeeDisplay ?? '')) === lowestFee && lowestFee !== null
                          ? 'text-green-600' 
                          : 'text-gray-900'
                      }`}>
                        {card.annualFeeDisplay}
                        {parseNumericValue(String(card.annualFeeDisplay ?? '')) === lowestFee && lowestFee !== null && (
                          <span className="ml-1 text-xs">👑</span>
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between items-start py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">Welcome Bonus</span>
                      <span className={`font-semibold text-right text-sm max-w-[50%] ${
                        parseNumericValue(String(card.welcomeBonusValue ?? '')) === highestBonus && highestBonus !== null
                          ? 'text-green-600' 
                          : 'text-gray-900'
                      }`}>
                        {card.welcomeBonus}
                        {parseNumericValue(String(card.welcomeBonusValue ?? '')) === highestBonus && highestBonus !== null && (
                          <span className="ml-1">🔥</span>
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">Rewards</span>
                      <span className="font-semibold text-gray-900 text-sm text-right">{card.rewardsProgram}</span>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-500 text-sm">Category</span>
                      <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                        {card.category}
                      </span>
                    </div>
                  </div>

                  <a
                    href={card.productLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 flex items-center justify-center gap-2 w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
                  >
                    Apply Now
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
            
            {/* Empty Slot */}
            {emptySlots > 0 && (
              <Link
                href="/"
                className="border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-8 hover:border-red-400 hover:bg-red-50/30 transition-colors min-h-[400px]"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">Add Another Card</p>
                <p className="text-gray-400 text-sm mt-1">Up to {maxCards} cards</p>
              </Link>
            )}
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 sm:px-6 bg-gray-50 text-sm font-semibold text-gray-500 w-32 sm:w-40 sticky left-0 z-10">
                      Feature
                    </th>
                    {cards.map((card, index) => (
                      <th key={card.id} className="py-4 px-4 sm:px-6 min-w-[200px] sm:min-w-[240px]">
                        <div className="text-center">
                          <div className="relative w-full aspect-[1.58/1] mb-3 bg-gray-50 rounded-lg overflow-hidden">
                            <Image
                              src={`/credit_card_images/${card.imageFile}`}
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
                          
                          {index === 0 && cards.length > 1 && (
                            <div className="mt-2">
                              <WinnerBadge />
                            </div>
                          )}
                          
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
                          className="flex flex-col items-center justify-center h-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-400 hover:bg-red-50/30 transition-colors"
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
                  {comparisonFields.map((field, index) => {
                    const winnerValue = field.type ? findWinner(cards, field.key, field.type) : null;
                    
                    return (
                      <tr key={field.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="py-3 px-4 sm:px-6 text-sm font-medium text-gray-500 sticky left-0 bg-inherit">
                          <FieldTooltip label={field.label} tooltip={field.tooltip} />
                        </td>
                        {cards.map((card) => {
                          const value = card[field.key as keyof CreditCard] as string | number;
                          const numericValue = parseNumericValue(value ?? '');
                          const isWinner = winnerValue !== null && numericValue === winnerValue && cards.length > 1;
                          
                          return (
                            <td key={card.id} className="py-3 px-4 sm:px-6">
                              <div className={`text-sm ${
                                field.key === 'welcomeBonusValue' ? 'text-green-600 font-semibold' : 'text-gray-700'
                              } ${isWinner ? 'bg-green-50 px-2 py-1 rounded-lg font-semibold' : ''}`}>
                                {String(value ?? '—')}
                                {isWinner && (
                                  <span className="ml-1">{field.type === 'min' ? '👑' : '🔥'}</span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                        {emptySlots > 0 && <td className="py-3 px-4 sm:px-6" />}
                      </tr>
                    );
                  })}
                  
                  {/* Action Row */}
                  <tr className="bg-red-50">
                    <td className="py-4 px-4 sm:px-6 text-sm font-semibold text-red-800 sticky left-0 bg-red-50">
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
        )}

        {/* Email Capture */}
        <div className="mt-8">
          <EmailCapture
            location="blog"
            title="Compare results sent to your inbox"
            description="Save this comparison and get notified when these cards have better offers."
          />
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Comparison Tips
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">👑</span>
              <span><strong>Lowest fee:</strong> Best annual fee value</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">🔥</span>
              <span><strong>Highest bonus:</strong> Best welcome offer</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500">⭐</span>
              <span><strong>Best Value:</strong> Our top recommendation based on overall features</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
