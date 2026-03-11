import { Metadata } from 'next';

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

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Comparison Tool Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Credit Card Comparison Tool',
            applicationCategory: 'FinanceApplication',
            description: 'Compare up to 3 Canadian credit cards side-by-side',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'CAD',
            },
            browserRequirements: 'Requires JavaScript',
            featureList: [
              'Compare up to 3 credit cards side-by-side',
              'View annual fees and interest rates',
              'Compare rewards programs',
              'Compare welcome bonuses',
            ],
          }),
        }}
      />
      
      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://canadiancreditcardfinder.com',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Compare',
                item: 'https://canadiancreditcardfinder.com/compare',
              },
            ],
          }),
        }}
      />
      
      {children}
    </>
  );
}
