import { Suspense } from 'react';
import { getCards, getUniqueCategories, getUniqueIssuers, getUniqueRewardsPrograms } from '@/lib/data';
import HomeContent from './HomeContent';

export default async function HomePage() {
  const [cards, categories, issuers, rewardsPrograms] = await Promise.all([
    getCards(),
    getUniqueCategories(),
    getUniqueIssuers(),
    getUniqueRewardsPrograms(),
  ]);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Find the Best Credit Card for You
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
            Compare Canadian credit cards and find your perfect match.
            Filter by rewards, cashback, travel perks, and more.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <Suspense fallback={<LoadingState />}>
        <HomeContent
          cards={cards}
          categories={categories}
          issuers={issuers}
          rewardsPrograms={rewardsPrograms}
        />
      </Suspense>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-6" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-4 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                <div className="h-40 bg-gray-200 rounded mb-4" />
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
