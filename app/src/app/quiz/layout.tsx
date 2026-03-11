import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Credit Card Quiz | Find Your Perfect Card in 2 Minutes',
  description: 'Take our quick quiz to find the best credit card for you. Answer 5 simple questions and get personalized recommendations based on your spending habits and preferences.',
  keywords: [
    'credit card quiz',
    'find the right credit card',
    'credit card recommendation',
    'best credit card for me',
    'credit card selector',
  ],
  openGraph: {
    title: 'Credit Card Quiz | Find Your Perfect Card',
    description: 'Answer 5 quick questions to get personalized credit card recommendations.',
    type: 'website',
    locale: 'en_CA',
  },
  alternates: {
    canonical: 'https://canadiancreditcardfinder.com/quiz',
  },
};

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Quiz/Assessment Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Quiz',
            name: 'Credit Card Finder Quiz',
            description: 'Find your perfect credit card with our 5-question quiz',
            about: 'Canadian credit cards',
            educationalLevel: 'General public',
            audience: {
              '@type': 'Audience',
              audienceType: 'Canadian consumers',
            },
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
                name: 'Quiz',
                item: 'https://canadiancreditcardfinder.com/quiz',
              },
            ],
          }),
        }}
      />
      
      {children}
    </>
  );
}
