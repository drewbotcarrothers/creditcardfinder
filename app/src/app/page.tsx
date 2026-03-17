import Link from 'next/link';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { getCards, getUniqueCategories, getUniqueIssuers, getUniqueRewardsPrograms } from '@/lib/data';
import { OrganizationSchema } from '@/components/InternalLinks';
import HomeContent from './HomeContent';

export const metadata: Metadata = {
  title: 'Compare Canadian Credit Cards 2025 | Find the Best Card for You',
  description: 'Compare 90+ Canadian credit cards. Find the best cashback, travel, and rewards cards. Filter by annual fee, credit score & more. Updated March 2025.',
  keywords: [
    'Canadian credit cards',
    'credit card comparison',
    'best credit cards Canada',
    'cashback credit cards',
    'travel rewards cards',
    'no annual fee cards',
    'credit card offers',
  ],
  openGraph: {
    title: 'Compare Canadian Credit Cards 2025 | Canadian Credit Card Finder',
    description: 'Find your perfect credit card. Compare 90+ cards by rewards, fees, and benefits.',
    type: 'website',
    locale: 'en_CA',
    siteName: 'Canadian Credit Card Finder',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compare Canadian Credit Cards 2025',
    description: 'Find your perfect credit card. Compare 90+ cards by rewards, fees, and benefits.',
  },
  alternates: {
    canonical: 'https://canadiancreditcardfinder.com',
  },
  verification: {
    google: 'oIWFujFUr96sNoLM3OGi02ZA01Oa5xX-g6kc6MfZr0w',
  },
};

export default async function HomePage() {
  const [cards, categories, issuers, rewardsPrograms] = await Promise.all([
    getCards(),
    getUniqueCategories(),
    getUniqueIssuers(),
    getUniqueRewardsPrograms(),
  ]);

  return (
    <>
      <OrganizationSchema />
      
      {/* ItemList schema for card rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: cards.slice(0, 6).map((card, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'Product',
                name: card.creditCardName,
                description: `${card.creditCardName} by ${card.issuer}. ${card.annualFeeDisplay} annual fee. ${card.category} card with ${card.rewardsProgram} rewards.`,
                image: `https://canadiancreditcardfinder.com/credit_card_images/${card.imageFile}`,
                brand: {
                  '@type': 'Brand',
                  name: card.issuer,
                },
                category: card.category,
                offers: {
                  '@type': 'Offer',
                  price: card.annualFee,
                  priceCurrency: 'CAD',
                  availability: 'https://schema.org/InStock',
                  url: `https://canadiancreditcardfinder.com/card/${card.slug}`,
                },
              },
            })),
          }),
        }}
      />

      <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Find the Best Credit Card for You
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Compare Canadian credit cards and find your perfect match.
            Filter by rewards, cashback, travel perks, and more.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/quiz"
              className="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 font-semibold text-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Take the Quiz
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded">2 min</span>
            </Link>
            
            <Link
              href="#cards"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white border border-white/30 px-8 py-4 rounded-lg hover:bg-white/20 font-semibold text-lg transition-colors"
            >
              Browse All Cards
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
          </div>
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
  </>
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
