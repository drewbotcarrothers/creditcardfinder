'use client';

import { useSearchParams } from 'next/navigation';
import { CreditCard, SortOption } from '@/lib/types';
import { parseFeeRange, parseBonusValue } from '@/lib/utils';
import FilterPanel from '@/components/FilterPanel';
import CardGrid from '@/components/CardGrid';
import SearchBar from '@/components/SearchBar';
import { useState, useMemo } from 'react';

interface HomeContentProps {
    cards: CreditCard[];
    categories: string[];
    issuers: string[];
    rewardsPrograms: string[];
}

export default function HomeContent({ cards, categories, issuers, rewardsPrograms }: HomeContentProps) {
    const searchParams = useSearchParams();
    const [sortBy, setSortBy] = useState<SortOption>('featured');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Parse filters from URL
    const selectedCategories = searchParams.get('category')?.split(',').filter(Boolean) || [];
    const selectedIssuers = searchParams.get('issuer')?.split(',').filter(Boolean) || [];
    const selectedFeeRanges = searchParams.get('fee')?.split(',').filter(Boolean) || [];
    const selectedRewardsPrograms = searchParams.get('rewards')?.split(',').filter(Boolean) || [];
    const searchQuery = searchParams.get('search')?.toLowerCase() || '';

    // Filter cards with search
    const filteredCards = useMemo(() => {
        let result = cards.filter(card => {
            // Category filter
            if (selectedCategories.length > 0 && !selectedCategories.includes(card.category)) {
                return false;
            }

            // Issuer filter
            if (selectedIssuers.length > 0 && !selectedIssuers.includes(card.issuer)) {
                return false;
            }

            // Fee range filter
            if (selectedFeeRanges.length > 0) {
                const matchesFee = selectedFeeRanges.some(range => {
                    const { min, max } = parseFeeRange(range);
                    return card.annualFee >= min && card.annualFee <= max;
                });
                if (!matchesFee) return false;
            }

            // Rewards program filter
            if (selectedRewardsPrograms.length > 0 && !selectedRewardsPrograms.includes(card.rewardsProgram)) {
                return false;
            }

            // Search filter
            if (searchQuery) {
                const searchableText = [
                    card.creditCardName,
                    card.issuer,
                    card.category,
                    card.rewardsProgram,
                    card.features,
                    card.welcomeBonus,
                    card.description,
                ].filter(Boolean).join(' ').toLowerCase();
                
                if (!searchableText.includes(searchQuery)) {
                    return false;
                }
            }

            return true;
        });

        // Sort cards
        result = [...result].sort((a, b) => {
            switch (sortBy) {
                case 'fee-low-high':
                    return a.annualFee - b.annualFee;
                case 'fee-high-low':
                    return b.annualFee - a.annualFee;
                case 'bonus-high-low':
                    return parseBonusValue(b.welcomeBonusValue) - parseBonusValue(a.welcomeBonusValue);
                case 'name-az':
                    return a.creditCardName.localeCompare(b.creditCardName);
                case 'featured':
                default:
                    return 0;
            }
        });

        return result;
    }, [cards, selectedCategories, selectedIssuers, selectedFeeRanges, selectedRewardsPrograms, searchQuery, sortBy]);

    const hasActiveFilters = selectedCategories.length > 0 ||
        selectedIssuers.length > 0 ||
        selectedFeeRanges.length > 0 ||
        selectedRewardsPrograms.length > 0 ||
        searchQuery.length > 0;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Search Bar Section */}
            <div className="mb-8">
                <SearchBar cards={cards} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filter Panel - Desktop */}
                <aside className="hidden lg:block lg:col-span-1">
                    <div className="sticky top-24">
                        <FilterPanel
                            categories={categories}
                            issuers={issuers}
                            rewardsPrograms={rewardsPrograms}
                        />
                    </div>
                </aside>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    {/* Results Header */}
                    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <p className="text-gray-600">
                                    Showing <span className="font-semibold text-gray-900">{filteredCards.length}</span> of{' '}
                                    <span className="font-semibold text-gray-900">{cards.length}</span> cards
                                    {searchQuery && (
                                        <span className="ml-2 text-sm">
                                            for "<span className="font-medium text-red-600">{searchQuery}</span>"
                                        </span>
                                    )}
                                </p>

                                {/* Mobile Filter Button */}
                                <button
                                    className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-medium"
                                    onClick={() => setShowMobileFilters(true)}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                    Filters
                                    {hasActiveFilters && (
                                        <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                            !
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Sort Dropdown */}
                            <div className="flex items-center gap-2">
                                <label htmlFor="sort" className="text-gray-600 text-sm">Sort by:</label>
                                <select
                                    id="sort"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-red-500 focus:border-red-500"
                                >
                                    <option value="featured">Featured</option>
                                    <option value="fee-low-high">Annual Fee: Low to High</option>
                                    <option value="fee-high-low">Annual Fee: High to Low</option>
                                    <option value="bonus-high-low">Welcome Bonus: High to Low</option>
                                    <option value="name-az">Name: A-Z</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Card Grid */}
                    <CardGrid cards={filteredCards} />
                </div>
            </div>

            {/* Mobile Filter Modal */}
            {showMobileFilters && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
                    <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                            <h2 className="font-semibold text-lg">Filters</h2>
                            <button
                                onClick={() => setShowMobileFilters(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-4">
                            <FilterPanel
                                categories={categories}
                                issuers={issuers}
                                rewardsPrograms={rewardsPrograms}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
