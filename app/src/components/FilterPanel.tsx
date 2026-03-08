'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback } from 'react';

interface FilterPanelProps {
  categories: string[];
  issuers: string[];
  rewardsPrograms: string[];
}

export default function FilterPanel({ categories, issuers, rewardsPrograms }: FilterPanelProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedCategories = searchParams.get('category')?.split(',').filter(Boolean) || [];
  const selectedIssuers = searchParams.get('issuer')?.split(',').filter(Boolean) || [];
  const selectedFees = searchParams.get('fee')?.split(',').filter(Boolean) || [];
  const selectedRewards = searchParams.get('rewards')?.split(',').filter(Boolean) || [];

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

  const clearAllFilters = () => {
    router.push('/');
  };

  const hasActiveFilters = selectedCategories.length + selectedIssuers.length + selectedFees.length + selectedRewards.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Category Filter */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Category</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <label
                key={category}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => toggleFilter('category', category)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Issuer Filter */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Issuer</h3>
          <div className="space-y-2">
            {issuers.map((issuer) => (
              <label
                key={issuer}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedIssuers.includes(issuer)}
                  onChange={() => toggleFilter('issuer', issuer)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">{issuer}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Annual Fee Filter */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Annual Fee</h3>
          <div className="space-y-2">
            {['$0', '$0-$50', '$50-$100', '$100-$200', '$200+'].map((fee) => (
              <label
                key={fee}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedFees.includes(fee)}
                  onChange={() => toggleFilter('fee', fee)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">{fee}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Rewards Program Filter */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Rewards Program</h3>
          <div className="space-y-2">
            {rewardsPrograms.map((program) => (
              <label
                key={program}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedRewards.includes(program)}
                  onChange={() => toggleFilter('rewards', program)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">{program}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
