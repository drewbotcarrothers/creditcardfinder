'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

interface FilterPanelProps {
  categories: string[];
  issuers: string[];
  rewardsPrograms: string[];
}

const creditScoreRanges = [
  { label: 'Excellent (750+)', value: 'excellent', min: 750 },
  { label: 'Good (670-749)', value: 'good', min: 670, max: 749 },
  { label: 'Fair (580-669)', value: 'fair', min: 580, max: 669 },
  { label: 'Any Score', value: 'any' },
];

const bonusRanges = [
  { label: '$0-$200', value: '0-200', min: 0, max: 200 },
  { label: '$200-$500', value: '200-500', min: 200, max: 500 },
  { label: '$500-$1000', value: '500-1000', min: 500, max: 1000 },
  { label: '$1000+', value: '1000+', min: 1000 },
];

const aprRanges = [
  { label: '0% Intro APR', value: '0-intro' },
  { label: 'Low APR (<15%)', value: 'low', max: 15 },
  { label: 'Standard (15-20%)', value: 'standard', min: 15, max: 20 },
  { label: 'High APR (20%+)️', value: 'high', min: 20 },
];

export default function FilterPanel({ categories, issuers, rewardsPrograms }: FilterPanelProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const selectedCategories = searchParams.get('category')?.split(',').filter(Boolean) || [];
  const selectedIssuers = searchParams.get('issuer')?.split(',').filter(Boolean) || [];
  const selectedFees = searchParams.get('fee')?.split(',').filter(Boolean) || [];
  const selectedRewards = searchParams.get('rewards')?.split(',').filter(Boolean) || [];
  const selectedCreditScores = searchParams.get('creditScore')?.split(',').filter(Boolean) || [];
  const selectedBonuses = searchParams.get('bonus')?.split(',').filter(Boolean) || [];
  const selectedAprs = searchParams.get('apr')?.split(',').filter(Boolean) || [];
  const hasNoForeignFee = searchParams.get('noForeignFee') === 'true';
  const hasLoungeAccess = searchParams.get('loungeAccess') === 'true';
  const hasBalanceTransfer = searchParams.get('balanceTransfer') === 'true';
  const hasInsurance = searchParams.get('insurance') === 'true';

  const createQueryString = useCallback((
    name: string,
    value: string[],
    currentParams: URLSearchParams
  ) => {
    const params = new URLSearchParams(currentParams.toString());
    if (value.length > 0) {
      params.set(name, value.join(','));
    } else {
      params.delete(name);
    }
    return params.toString();
  }, []);

  const toggleFilter = (name: string, value: string) => {
    const currentValues = searchParams.get(name)?.split(',').filter(Boolean) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    const queryString = createQueryString(name, newValues, searchParams);
    router.push(queryString ? `?${queryString}` : '/');
  };

  const toggleBooleanFilter = (name: string, value: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, 'true');
    } else {
      params.delete(name);
    }
    router.push(params.toString() ? `?${params.toString()}` : '/');
  };

  const clearAllFilters = () => {
    router.push('/');
  };

  const hasBasicFilters = selectedCategories.length + selectedIssuers.length + selectedFees.length + selectedRewards.length > 0;
  const hasAdvancedFilters = selectedCreditScores.length + selectedBonuses.length + selectedAprs.length > 0 ||
    hasNoForeignFee || hasLoungeAccess || hasBalanceTransfer || hasInsurance;
  const hasActiveFilters = hasBasicFilters || hasAdvancedFilters;

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-red-600 hover:text-red-700 text-xs sm:text-sm font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-5 sm:space-y-6">
        {/* Category Filter */}
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Category</h3>
          <div className="space-y-1.5 sm:space-y-2">
            {categories.map((category) => (
              <label
                key={category}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 sm:p-1 rounded-lg touch-manipulation"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => toggleFilter('category', category)}
                  className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-gray-700">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Issuer Filter */}
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Issuer</h3>
          <div className="space-y-1.5 sm:space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
            {issuers.map((issuer) => (
              <label
                key={issuer}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 sm:p-1 rounded-lg touch-manipulation"
              >
                <input
                  type="checkbox"
                  checked={selectedIssuers.includes(issuer)}
                  onChange={() => toggleFilter('issuer', issuer)}
                  className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-gray-700 truncate">{issuer}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Annual Fee Filter */}
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Annual Fee</h3>
          <div className="space-y-1.5 sm:space-y-2">
            {['$0', '$0-$50', '$50-$100', '$100-$200', '$200+'].map((fee) => (
              <label
                key={fee}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 sm:p-1 rounded-lg touch-manipulation"
              >
                <input
                  type="checkbox"
                  checked={selectedFees.includes(fee)}
                  onChange={() => toggleFilter('fee', fee)}
                  className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-gray-700">{fee}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Rewards Program Filter */}
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Rewards Program</h3>
          <div className="space-y-1.5 sm:space-y-2">
            {rewardsPrograms.map((program) => (
              <label
                key={program}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 sm:p-1 rounded-lg touch-manipulation"
              >
                <input
                  type="checkbox"
                  checked={selectedRewards.includes(program)}
                  onChange={() => toggleFilter('rewards', program)}
                  className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-gray-700">{program}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 hover:text-red-600 transition-colors py-1 touch-manipulation"
          >
            <span>Advanced Filters</span>
            <svg
              className={`w-5 h-5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {hasAdvancedFilters && (
            <span className="inline-block mt-1 text-xs text-red-600 font-medium">
              {selectedCreditScores.length + selectedBonuses.length + selectedAprs.length + 
               (hasNoForeignFee ? 1 : 0) + (hasLoungeAccess ? 1 : 0) + 
               (hasBalanceTransfer ? 1 : 0) + (hasInsurance ? 1 : 0)} active
            </span>
          )}
        </div>

        {/* Advanced Filters Section */}
        {showAdvanced && (
          <div className="space-y-5 sm:space-y-6 pt-2">
            {/* Credit Score Filter */}
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Credit Score Needed</h3>
              <div className="space-y-1.5 sm:space-y-2">
                {creditScoreRanges.map((score) => (
                  <label
                    key={score.value}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 sm:p-1 rounded-lg touch-manipulation"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCreditScores.includes(score.value)}
                      onChange={() => toggleFilter('creditScore', score.value)}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                    />
                    <span className="text-xs sm:text-sm text-gray-700">{score.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Welcome Bonus Filter */}
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Welcome Bonus Value</h3>
              <div className="space-y-1.5 sm:space-y-2">
                {bonusRanges.map((bonus) => (
                  <label
                    key={bonus.value}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 sm:p-1 rounded-lg touch-manipulation"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBonuses.includes(bonus.value)}
                      onChange={() => toggleFilter('bonus', bonus.value)}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                    />
                    <span className="text-xs sm:text-sm text-gray-700">{bonus.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Purchase APR Filter */}
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Purchase APR</h3>
              <div className="space-y-1.5 sm:space-y-2">
                {aprRanges.map((apr) => (
                  <label
                    key={apr.value}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 sm:p-1 rounded-lg touch-manipulation"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAprs.includes(apr.value)}
                      onChange={() => toggleFilter('apr', apr.value)}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                    />
                    <span className="text-xs sm:text-sm text-gray-700">{apr.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Toggle Features */}
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Card Features</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1 cursor-pointer"
                  onClick={() => toggleBooleanFilter('noForeignFee', !hasNoForeignFee)}
                >
                  <span className="text-xs sm:text-sm text-gray-700">No Foreign Transaction Fee</span>
                  <button
                    className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                      hasNoForeignFee ? 'bg-red-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                        hasNoForeignFee ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between py-1 cursor-pointer"
                  onClick={() => toggleBooleanFilter('loungeAccess', !hasLoungeAccess)}
                >
                  <span className="text-xs sm:text-sm text-gray-700">Airport Lounge Access</span>
                  <button
                    className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                      hasLoungeAccess ? 'bg-red-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                        hasLoungeAccess ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between py-1 cursor-pointer"
                  onClick={() => toggleBooleanFilter('balanceTransfer', !hasBalanceTransfer)}
                >
                  <span className="text-xs sm:text-sm text-gray-700">Balance Transfer Offer</span>
                  <button
                    className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                      hasBalanceTransfer ? 'bg-red-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                        hasBalanceTransfer ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between py-1 cursor-pointer"
                  onClick={() => toggleBooleanFilter('insurance', !hasInsurance)}
                >
                  <span className="text-xs sm:text-sm text-gray-700">Travel Insurance Included</span>
                  <button
                    className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                      hasInsurance ? 'bg-red-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                        hasInsurance ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
