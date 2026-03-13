import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getCardBySlug, getRelatedCards, getCards } from '@/lib/data';
import { CreditCard } from '@/lib/types';
import StructuredData from '@/components/StructuredData';
import { CardInternalLinks, BreadcrumbSchema } from '@/components/InternalLinks';

interface CardPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const cards = await getCards();
  return cards.map((card) => ({
    slug: card.slug,
  }));
}

export async function generateMetadata({ params }: CardPageProps): Promise<Metadata> {
  const { slug } = await params;
  const card = await getCardBySlug(slug);
  
  if (!card) {
    return {
      title: 'Card Not Found',
    };
  }

  const title = `${card.creditCardName} - ${card.welcomeBonus || 'Review & Details'} | Canadian Credit Card Finder`;
  const description = `Compare ${card.creditCardName} by ${card.issuer}. ${card.annualFeeDisplay} annual fee. ${card.welcomeBonus || 'Earn rewards'} with ${card.rewardsProgram}. See full details, benefits, and apply.`;

  return {
    title,
    description: description.slice(0, 160),
    keywords: [
      card.creditCardName,
      card.issuer,
      card.category,
      card.rewardsProgram,
      'credit card Canada',
      'compare credit cards',
      `${card.issuer} credit card`,
      `${card.category} credit card Canada`,
    ],
    openGraph: {
      title,
      description: description.slice(0, 160),
      type: 'article',
      locale: 'en_CA',
      images: [{
        url: `https://canadiancreditcardfinder.com/credit_card_images/${card.imageFile}`,
        width: 800,
        height: 506,
        alt: card.creditCardName,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description.slice(0, 160),
    },
    alternates: {
      canonical: `https://canadiancreditcardfinder.com/card/${card.slug}`,
    },
  };
}

function generateCardFAQ(card: CreditCard) {
  return [
    {
      question: `What is the annual fee for the ${card.creditCardName}?`,
      answer: `The ${card.creditCardName} has an annual fee of ${card.annualFeeDisplay}. ${card.annualFeeDetail ? `${card.annualFeeDetail}.` : ''}`,
    },
    {
      question: `What are the interest rates for the ${card.creditCardName}?`,
      answer: `The purchase interest rate is ${card.purchaseInterestRateDisplay} and the cash advance rate is ${card.cashAdvanceInterestRateDisplay}.`,
    },
    {
      question: `Who can apply for the ${card.creditCardName}?`,
      answer: card.cardEligibility || `The ${card.creditCardName} is available to Canadian residents who meet the issuer's eligibility requirements.`,
    },
    {
      question: `What welcome bonus does the ${card.creditCardName} offer?`,
      answer: card.welcomeBonusDetailed || card.welcomeBonus || `The ${card.creditCardName} offers competitive rewards through the ${card.rewardsProgram} program.`,
    },
    {
      question: `Is the ${card.creditCardName} worth it?`,
      answer: `The ${card.creditCardName} is ${card.annualFee === 0 ? 'a great no-annual-fee option' : 'worth considering if you can maximize its rewards'}. ${card.welcomeBonus ? `The welcome bonus of ${card.welcomeBonus} adds significant value.` : ''} ${card.rewardsProgram ? `The ${card.rewardsProgram} program offers flexibility for redemptions.` : ''}`,
    },
  ];
}

export default async function CardPage({ params }: CardPageProps) {
  const { slug } = await params;
  const card = await getCardBySlug(slug);
  
  if (!card) {
    notFound();
  }

  const relatedCards = await getRelatedCards(card, 4);
  const faqs = generateCardFAQ(card);
  const featuresList = card.features ? card.features.split(',').map(f => f.trim()).filter(Boolean) : [];
  const insuranceList = card.insurance ? card.insurance.split(',').map(i => i.trim()).filter(Boolean) : [];
  const schemaFeatures = [...featuresList.slice(0, 5), ...insuranceList.slice(0, 3)];

  // Breadcrumb schema items
  const breadcrumbItems = [
    { name: 'Home', item: 'https://canadiancreditcardfinder.com' },
    { name: card.category, item: `https://canadiancreditcardfinder.com/?category=${encodeURIComponent(card.category)}` },
    { name: card.creditCardName, item: `https://canadiancreditcardfinder.com/card/${card.slug}` },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      
      <StructuredData 
        type="Product"
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: card.creditCardName,
          description: `${card.creditCardName} by ${card.issuer}. ${card.welcomeBonus || ''} ${card.rewardsProgram || ''} credit card.`,
          brand: {
            "@type": "Brand",
            name: card.issuer,
          },
          category: card.category,
          offers: {
            "@type": "Offer",
            description: card.annualFeeDisplay,
            priceCurrency: "CAD",
            availability: "https://schema.org/InStock",
            url: `https://canadiancreditcardfinder.com/card/${card.slug}`,
          },
          ...(schemaFeatures.length > 0 && {
            featureList: schemaFeatures.join(", "),
          }),
        }}
      />

      <main className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex text-sm text-gray-600">
              <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900 font-medium">{card.creditCardName}</span>
            </nav>
          </div>
        </div>

        {/* Header Section */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Top: Category + Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                {card.category}
              </span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {card.issuer}
              </span>
            </div>

            {/* Card Name */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              {card.creditCardName}
            </h1>

            {/* Promo Text + Learn More */}
            <div className="space-y-2">
              <p className="text-lg text-gray-700 leading-relaxed">
                {card.welcomeBonus}
              </p>
              
              <Link
                href={`https://www.google.com/search?q=${encodeURIComponent(card.creditCardName + ' Canada')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-red-600 hover:text-red-700 font-medium group"
              >
                Learn more
                <svg 
                  className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Card Image & CTA */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                {/* Card Image */}
                <div className="relative aspect-[16/10] mb-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden">
                  <Image
                    src={`/credit_card_images/${card.imageFile}`}
                    alt={card.creditCardName}
                    fill
                    className="object-contain p-4"
                    sizes="(max-width: 768px) 100vw, 400px"
                    priority
                  />
                </div>

                {/* Key Highlights */}
                <div className="space-y-4 mb-6">
                  <div className="text-center p-4 bg-red-50 rounded-xl">
                    <div className="text-3xl font-bold text-red-600">${card.annualFee}</div>
                    <div className="text-sm text-gray-600">Annual Fee</div>
                  </div>
                  
                  {card.welcomeBonus && (
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                      <div className="text-lg font-bold text-green-700">{card.welcomeBonus}</div>
                      <div className="text-sm text-gray-600">Welcome Bonus</div>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <Link
                  href="#"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl text-center transition-colors flex items-center justify-center gap-2"
                >
                  Apply Now
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
                
                <p className="text-xs text-gray-500 text-center mt-3">
                  Terms and conditions apply. Subject to credit approval.
                </p>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Quick Stats */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Card Details</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-red-600 text-lg">💰</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Annual Fee</div>
                      <div className="text-gray-600">{card.annualFeeDisplay}</div>
                      {card.annualFeeDetail && (
                        <div className="text-sm text-gray-500">{card.annualFeeDetail}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-blue-600 text-lg">💳</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Interest Rate</div>
                      <div className="text-gray-600">{card.purchaseInterestRateDisplay}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-green-600 text-lg">🎁</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Rewards</div>
                      <div className="text-gray-600">{card.rewardsProgram}</div>
                    </div>
                  </div>

                  {card.additionalCardFee !== undefined && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-purple-600 text-lg">👨‍👩‍👧‍👦</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Additional Cards</div>
                        <div className="text-gray-600">{card.additionalCardFee === 0 ? 'Free' : `$${card.additionalCardFee}`}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              {featuresList.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Key Features</h2>
                  <ul className="space-y-3">
                    {featuresList.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Insurance */}
              {insuranceList.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Insurance Coverage</h2>
                  <ul className="space-y-3">
                    {insuranceList.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* FAQ */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Cards */}
        {relatedCards.length > 0 && (
          <section className="bg-white border-t border-gray-200 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Cards You Might Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedCards.map((relatedCard) => (
                  <Link
                    key={relatedCard.slug}
                    href={`/card/${relatedCard.slug}`}
                    className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-[16/10] relative mb-3 bg-white rounded-lg overflow-hidden">
                      <Image
                        src={`/credit_card_images/${relatedCard.imageFile}`}
                        alt={relatedCard.creditCardName}
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{relatedCard.creditCardName}</h3>
                    <p className="text-red-600 font-medium text-sm mt-1">{relatedCard.annualFeeDisplay}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}