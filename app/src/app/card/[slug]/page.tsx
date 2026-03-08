import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getCardBySlug, getRelatedCards, getCards } from '@/lib/data';
import { CreditCard } from '@/lib/types';
import StructuredData from '@/components/StructuredData';

interface CardPageProps {
  params: Promise<{
    slug: string;
  }>;
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
    ],
    openGraph: {
      title,
      description: description.slice(0, 160),
      type: 'article',
      locale: 'en_CA',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description.slice(0, 160),
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

  // Generate SEO-friendly content sections
  const featuresList = card.features ? card.features.split(',').map(f => f.trim()).filter(Boolean) : [];
  const insuranceList = card.insurance ? card.insurance.split(',').map(i => i.trim()).filter(Boolean) : [];

  return (
    <>
      <StructuredData 
        type="Product"
        data={{
          name: card.creditCardName,
          description: `${card.creditCardName} by ${card.issuer}. ${card.annualFeeDisplay} annual fee. ${card.welcomeBonus || 'Earn rewards'}.`,
          brand: {
            '@type': 'Brand',
            name: card.issuer,
          },
          offers: {
            '@type': 'Offer',
            price: card.annualFee,
            priceCurrency: 'CAD',
            availability: 'https://schema.org/InStock',
          },
        }}
      />
      
      <StructuredData 
        type="FAQPage"
        data={{
          mainEntity: faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="text-gray-400 mb-8 text-sm">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">/</span>
              <Link href={`/?category=${encodeURIComponent(card.category)}`} className="hover:text-white">{card.category}</Link>
              <span className="mx-2">/</span>
              <span className="text-white">{card.creditCardName}</span>
            </nav>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Card Image */}
              <div className="relative w-full max-w-md aspect-[1.58/1] bg-white rounded-xl overflow-hidden shadow-xl">
                <Image
                  src={`/images/cards/${card.imageFile}`}
                  alt={card.creditCardName}
                  fill
                  className="object-contain p-6"
                  priority
                />
              </div>

              {/* Card Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                    {card.category}
                  </span>
                  <span className="bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded">
                    {card.rewardsProgram}
                  </span>
                </div>
                
                <h1 className="text-3xl lg:text-4xl font-bold mb-4">{card.creditCardName}</h1>
                <p className="text-xl text-gray-300 mb-2">by {card.issuer}</p>
                
                {card.welcomeBonus && (
                  <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-xl p-4 mb-6">
                    <p className="text-sm text-red-100 uppercase font-semibold">Welcome Bonus</p>
                    <p className="text-2xl font-bold text-white">{card.welcomeBonus}</p>
                    <p className="text-sm text-red-100">{card.welcomeBonusValue || 'See details below'}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-4">
                  <a
                    href={card.productLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
                  >
                    Apply Now
                  </a>
                  <Link
                    href="/compare"
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                  >
                    Compare Cards
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Key Details Grid */}
              <section className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-6">Card Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Annual Fee</p>
                    <p className="text-2xl font-bold text-gray-900">{card.annualFeeDisplay}</p>
                    {card.annualFeeDetail && (
                      <p className="text-xs text-gray-500 mt-1">{card.annualFeeDetail}</p>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Interest Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{card.purchaseInterestRateDisplay}</p>
                    <p className="text-xs text-gray-500 mt-1">Purchase APR</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Cash Advance</p>
                    <p className="text-2xl font-bold text-gray-900">{card.cashAdvanceInterestRateDisplay}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Additional Card</p>
                    <p className="text-2xl font-bold text-gray-900">{card.additionalCardFeeDisplay}</p>
                    {card.additionalCardDetail && (
                      <p className="text-xs text-gray-500 mt-1">{card.additionalCardDetail}</p>
                    )}
                  </div>
                </div>
              </section>

              {/* Features */}
              {featuresList.length > 0 && (
                <section className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-bold mb-4">Card Features</h2>
                  <ul className="space-y-3">
                    {featuresList.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {card.featuresDetailed && (
                    <p className="mt-4 text-gray-600 text-sm">{card.featuresDetailed}</p>
                  )}
                </section>
              )}

              {/* Insurance */}
              {insuranceList.length > 0 && (
                <section className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-bold mb-4">Insurance Coverage</h2>
                  <ul className="space-y-2">
                    {insuranceList.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Eligibility */}
              {card.cardEligibility && (
                <section className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-bold mb-4">Eligibility Requirements</h2>
                  <p className="text-gray-700">{card.cardEligibility}</p>
                </section>
              )}

              {/* FAQ Section */}
              <section className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-6">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                      <p className="text-gray-600 text-sm">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Quick Facts */}
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                <h3 className="font-bold mb-4">Quick Facts</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <span className="float-right font-medium">{card.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Issuer:</span>
                    <span className="float-right font-medium">{card.issuer}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Rewards:</span>
                    <span className="float-right font-medium">{card.rewardsProgram}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <a
                    href={card.productLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-red-600 hover:bg-red-700 text-white text-center py-3 rounded-xl font-semibold transition-colors"
                  >
                    Apply Now
                  </a>
                  <Link
                    href="/"
                    className="block w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 text-center py-2 rounded-xl font-medium transition-colors"
                  >
                    View All Cards
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Related Cards */}
          {relatedCards.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Similar Cards You May Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedCards.map((relatedCard) => (
                  <Link
                    key={relatedCard.id}
                    href={`/card/${relatedCard.slug}`}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative aspect-[1.58/1] bg-gray-100">
                      <Image
                        src={`/images/cards/${relatedCard.imageFile}`}
                        alt={relatedCard.creditCardName}
                        fill
                        className="object-contain p-4"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 leading-tight mb-1">{relatedCard.creditCardName}</h3>
                      <p className="text-sm text-gray-500">{relatedCard.annualFeeDisplay}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
