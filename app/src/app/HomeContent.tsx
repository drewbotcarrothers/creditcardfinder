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

// Parse credit score requirement
function parseCreditScore(score: string): { min?: number; max?: number } {
    switch (score) {
        case 'excellent': return { min: 750 };
        case 'good': return { min: 670, max: 749 };
        case 'fair': return { min: 580, max: 669 };
        case 'any': return {};
        default: return {};
    }
}

// Parse welcome bonus range
function parseBonusRange(range: string): { min: number; max?: number } {
    switch (range) {
        case '0-200': return { min: 0, max: 200 };
        case '200-500': return { min: 200, max: 500 };
        case '500-1000': return { min: 500, max: 1000 };
        case '1000+': return { min: 1000 };
        default: return { min: 0 };
    }
}

// Parse APR from card data
function parseCardAPR(card: CreditCard): number | null {
    // Try to extract APR from purchaseAPR field
    if (!card.purchaseAPR) return null;
    const match = card.purchaseAPR.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : null;
}

// Check APR range match
function matchesAprRange(card: CreditCard, aprRanges: string[]): boolean {
    if (aprRanges.length === 0) return true;
    
    const cardAPR = parseCardAPR(card);
    if (cardAPR === null) return false;
    
    return aprRanges.some(range => {
        switch (range) {
            case '0-intro':
                return card.purchaseAPR?.toLowerCase().includes('0%') || 
                       card.purchaseAPR?.toLowerCase().includes('intro');
            case 'low':
                return cardAPR < 15;
            case 'standard':
                return cardAPR >= 15 && cardAPR < 20;
            case 'high':
                return cardAPR >= 20;
            default:
                return true;
        }
    });
}

// Check credit score match
function matchesCreditScore(card: CreditCard, creditScores: string[]): boolean {
    if (creditScores.length === 0 || creditScores.includes('any')) return true;
    
    // Extract credit score requirement from card
    const cardScoreText = card.creditScore?.toLowerCase() || '';
    
    return creditScores.some(score => {
        const range = parseCreditScore(score);
        
        // Check if card mentions this score range
        if (score === 'excellent') {
            return cardScoreText.includes('excellent') || cardScoreText.includes('750');
        }
        if (score === 'good') {
            return cardScoreText.includes('good') || cardScoreText.includes('700');
        }
        if (score === 'fair') {
            return cardScoreText.includes('fair') || cardScoreText.includes('650');
        }
        return true;
    });
}

// Check bonus value match
function matchesBonusValue(card: CreditCard, bonusRanges: string[]): boolean {
    if (bonusRanges.length === 0) return true;
    
    const bonusValue = parseBonusValue(card.welcomeBonusValue);
    
    return bonusRanges.some(range => {
        const { min, max } = parseBonusRange(range);
        if (max !== undefined) {
            return bonusValue >= min && bonusValue <= max;
        }
        return bonusValue >= min;
    });
}

// Check feature flags
function hasFeature(card: CreditCard, feature: 'foreignFee' | 'loungeAccess' | 'balanceTransfer' | 'insurance'): boolean {
    const features = card.features?.toLowerCase() || '';
    const additionalInfo = card.additionalInfo?.toLowerCase() || '';
    const combinedText = features + ' ' + additionalInfo;
    
    switch (feature) {
        case 'foreignFee':
            // Check for NO foreign transaction fee or "no annual fee" + mentions of foreign
            return combinedText.includes('no foreign transaction fee') ||
                   combinedText.includes('no foreign fees') ||
                   (combinedText.includes('foreign') && combinedText.includes('none'));
        case 'loungeAccess':
            return combinedText.includes('lounge') ||
                   combinedText.includes('priority pass') ||
                   combinedText.includes('airport lounge');
        case 'balanceTransfer':
            return card.balanceTransferAPR !== undefined ||
                   combinedText.includes('balance transfer');
        case 'insurance':
            return combinedText.includes('travel insurance') ||
                   combinedText.includes('trip insurance') ||
                   combinedText.includes('purchase protection') ||
                   combinedText.includes('extended warranty');
        default:
            return false;
    }
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
    const selectedCreditScores = searchParams.get('creditScore')?.split(',').filter(Boolean) || [];
    const selectedBonuses = searchParams.get('bonus')?.split(',').filter(Boolean) || [];
    const selectedAprs = searchParams.get('apr')?.split(',').filter(Boolean) || [];
    const searchQuery = searchParams.get('search')?.toLowerCase() || '';
    const hasNoForeignFee = searchParams.get('noForeignFee') === 'true';
    const hasLoungeAccess = searchParams.get('loungeAccess') === 'true';
    const hasBalanceTransfer = searchParams.get('balanceTransfer') === 'true';
    const hasInsurance = searchParams.get('insurance') === 'true';

    // Filter cards with all filters
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

            // Credit score filter
            if (selectedCreditScores.length > 0 && !matchesCreditScore(card, selectedCreditScores)) {
                return false;
            }

            // Welcome bonus value filter
            if (selectedBonuses.length > 0 && !matchesBonusValue(card, selectedBonuses)) {
                return false;
            }

            // APR filter
            if (selectedAprs.length > 0 && !matchesAprRange(card, selectedAprs)) {
                return false;
            }

            // Boolean feature filters
            if (hasNoForeignFee && !hasFeature(card, 'foreignFee')) {
                return false;
            }
            if (hasLoungeAccess && !hasFeature(card, 'loungeAccess')) {
                return false;
            }
            if (hasBalanceTransfer && !hasFeature(card, 'balanceTransfer')) {
                return false;
            }
            if (hasInsurance && !hasFeature(card, 'insurance')) {
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
    }, [cards, selectedCategories, selectedIssuers, selectedFeeRanges, selectedRewardsPrograms, 
        selectedCreditScores, selectedBonuses, selectedAprs, hasNoForeignFee, hasLoungeAccess, 
        hasBalanceTransfer, hasInsurance, searchQuery, sortBy]);

    const hasActiveFilters = selectedCategories.length > 0 ||
        selectedIssuers.length > 0 ||
        selectedFeeRanges.length > 0 ||
        selectedRewardsPrograms.length > 0 ||
        selectedCreditScores.length > 0 ||
        selectedBonuses.length > 0 ||
        selectedAprs.length > 0 ||
        hasNoForeignFee ||
        hasLoungeAccess ||
        hasBalanceTransfer ||
        hasInsurance ||
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
                                            for {'"'}<span className="font-medium text-red-600">{searchQuery}</span>{'"'}
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
