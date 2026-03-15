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

// Parse features into categories
function parseFeatures(featuresDetailed: string) {
  if (!featuresDetailed) return { main: [], travel: [], shopping: [], other: [] };
  
  const allFeatures = featuresDetailed.split(',').map(f => f.trim()).filter(Boolean);
  const travelKeywords = ['lounge', 'airport', 'travel', 'flight', 'hotel', 'trip', 'baggage', 'rental car'];
  const shoppingKeywords = ['purchase protection', 'extended warranty', 'price protection', 'return', 'shop'];
  
  const travel = allFeatures.filter(f => travelKeywords.some(k => f.toLowerCase().includes(k)));
  const shopping = allFeatures.filter(f => shoppingKeywords.some(k => f.toLowerCase().includes(k)));
  const other = allFeatures.filter(f => !travel.includes(f) && !shopping.includes(f));
  
  return {
    main: other.slice(0, 6),
    travel: travel.slice(0, 4),
    shopping: shopping.slice(0, 4),
    other: other.slice(6)
  };
}

// Generate pros and cons based on card data
function generateProsAndCons(card: CreditCard) {
  const pros: string[] = [];
  const cons: string[] = [];
  
  // Pros
  if (card.annualFee === 0) pros.push('No annual fee');
  if (card.welcomeBonus) pros.push(`Generous welcome bonus: ${card.welcomeBonus}`);
  if (card.rewardsProgram && card.rewardsProgram !== 'N/A') pros.push(`${card.rewardsProgram} rewards program`);
  if (card.features?.toLowerCase().includes('lounge')) pros.push('Airport lounge access');
  if (card.features?.toLowerCase().includes('insurance')) pros.push('Comprehensive insurance coverage');
  if (card.additionalCardFee === 0) pros.push('Free additional cards');
  
  // Cons
  if (card.annualFee > 150) cons.push(`High annual fee (${card.annualFeeDisplay})`);
  if (card.purchaseInterestRate > 20) cons.push(`High interest rate (${card.purchaseInterestRateDisplay})`);
  if (!card.welcomeBonus) cons.push('No welcome bonus offer currently available');
  if (card.annualFee > 0 && card.annualFee < 50) cons.push('Limited premium benefits for the annual fee');
  
  return { pros, cons };
}

// Generate verdict
function generateVerdict(card: CreditCard) {
  if (card.annualFee === 0) {
    return `The ${card.creditCardName} is an excellent choice for those seeking a no-annual-fee card with solid rewards. ${card.welcomeBonus ? 'The welcome bonus adds immediate value.' : ''} Ideal for everyday spending without the commitment of an annual fee.`;
  }
  if (card.category.toLowerCase().includes('travel') || card.features?.toLowerCase().includes('lounge')) {
    return `The ${card.creditCardName} is a premium travel card worth the ${card.annualFeeDisplay} annual fee for frequent travelers. ${card.welcomeBonus ? 'The substantial welcome bonus offsets the first year cost.' : ''} Best suited for those who can maximize travel benefits and rewards.`;
  }
  if (card.category.toLowerCase().includes('cash')) {
    return `The ${card.creditCardName} offers straightforward cash back rewards that are easy to understand and redeem. ${card.welcomeBonus ? 'The welcome bonus provides a nice head start.' : ''} Great for those who prefer cash over points.`;
  }
  return `The ${card.creditCardName} offers a balanced mix of rewards and benefits for the ${card.annualFeeDisplay} annual fee. ${card.welcomeBonus ? 'The welcome bonus helps justify the first-year cost.' : ''} Consider your spending habits to determine if this card aligns with your financial goals.`;
}

export default async function CardPage({ params }: CardPageProps) {
  const { slug } = await params;
  const card = await getCardBySlug(slug);
  
  if (!card) {
    notFound();
  }

  const relatedCards = await getRelatedCards(card, 4);
  const faqs = generateCardFAQ(card);
  const features = parseFeatures(card.featuresDetailed);
  const insuranceList = card.insurance ? card.insurance.split(',').map(i => i.trim()).filter(Boolean) : [];
  const { pros, cons } = generateProsAndCons(card);
  const verdict = generateVerdict(card);
  const schemaFeatures = [...card.features?.split(',').slice(0, 5) || [], ...insuranceList.slice(0, 3)];

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
              <Link href={`/?category=${encodeURIComponent(card.category)}`} className="hover:text-red-600 transition-colors">
                {card.category}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900 font-medium">{card.creditCardName}</span>
            </nav>
          </div>
        </div>

        {/* Header Section */}
        <section className="bg-gradient-to-br from-red-600 to-red-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold">
                {card.category}
              </span>
              <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                {card.issuer}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              {card.creditCardName}
            </h1>

            <p className="text-xl text-red-100 max-w-3xl leading-relaxed">
              {card.welcomeBonus}
            </p>
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
                    <div className="text-3xl font-bold text-red-600">{card.annualFeeDisplay}</div>
                    <div className="text-sm text-gray-600">Annual Fee</div>
                    {card.annualFeeDetail && (
                      <div className="text-xs text-gray-500 mt-1">{card.annualFeeDetail}</div>
                    )}
                  </div>
                  
                  {card.welcomeBonus && (
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                      <div className="text-lg font-bold text-green-700">{card.welcomeBonus}</div>
                      <div className="text-sm text-gray-600">Welcome Bonus</div>
                    </div>
                  )}

                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <div className="text-lg font-bold text-blue-700">{card.rewardsProgram}</div>
                    <div className="text-sm text-gray-600">Rewards Program</div>
                  </div>
                </div>

                {/* CTA Button */}
                <Link
                  href={card.productLink || '#'}
                  target={card.productLink ? "_blank" : undefined}
                  rel={card.productLink ? "noopener noreferrer" : undefined}
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
              
              {/* 1. Card Overview */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600 text-lg">📋</span>
                  Card Overview
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Issuer</span>
                      <span className="font-semibold text-gray-900">{card.issuer}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Category</span>
                      <span className="font-semibold text-gray-900">{card.category}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Annual Fee</span>
                      <span className="font-semibold text-gray-900">{card.annualFeeDisplay}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Additional Cards</span>
                      <span className="font-semibold text-gray-900">{card.additionalCardFeeDisplay}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Purchase Rate</span>
                      <span className="font-semibold text-gray-900">{card.purchaseInterestRateDisplay}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Cash Advance</span>
                      <span className="font-semibold text-gray-900">{card.cashAdvanceInterestRateDisplay}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Rewards Program</span>
                      <span className="font-semibold text-gray-900">{card.rewardsProgram}</span>
                    </div>
                    {card.welcomeBonusValue && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Bonus Value</span>
                        <span className="font-semibold text-green-600">{card.welcomeBonusValue}</span>
                      </div>
                    )}
                  </div>
                </div>

                {card.description && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="text-gray-700 leading-relaxed">{card.description}</p>
                  </div>
                )}
              </div>

              {/* 2. Welcome Bonus & Eligibility */}
              {(card.welcomeBonusDetailed || card.welcomeBonusEligibility) && (
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-lg">🎁</span>
                    Welcome Bonus & Eligibility
                  </h2>
                  
                  {card.welcomeBonusDetailed && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-2">Welcome Offer</h3>
                      <p className="text-gray-700 leading-relaxed">{card.welcomeBonusDetailed}</p>
                    </div>
                  )}
                  
                  {card.welcomeBonusEligibility && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Eligibility Requirements
                      </h3>
                      <p className="text-gray-700">{card.welcomeBonusEligibility}</p>
                    </div>
                  )}
                </div>
              )}

              {/* 3. Key Card Features */}
              {features.main.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-lg">✨</span>
                    Key Card Features
                  </h2>
                  <ul className="space-y-3">
                    {features.main.map((feature, index) => (
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

              {/* 4. Rewards */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600 text-lg">🏆</span>
                  Rewards Program
                </h2>
                
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 mb-4">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{card.rewardsProgram}</h3>
                  {card.additionalInfo ? (
                    <p className="text-gray-700">{card.additionalInfo}</p>
                  ) : (
                    <p className="text-gray-700">Earn rewards on every purchase with the {card.rewardsProgram} program. Redeem for travel, merchandise, gift cards, or statement credits.</p>
                  )}
                </div>

                {card.welcomeBonusValue && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                    <span className="text-2xl">💰</span>
                    <div>
                      <div className="font-semibold text-gray-900">Welcome Bonus Value</div>
                      <div className="text-green-700 font-bold text-lg">{card.welcomeBonusValue}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Insurance Coverage */}
              {insuranceList.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-lg">🛡️</span>
                    Insurance Coverage
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {insuranceList.map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. Who Can Apply? */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-lg">👤</span>
                  Who Can Apply?
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Residency</h3>
                      <p className="text-gray-600">Canadian residents</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Eligibility</h3>
                      <p className="text-gray-600">{card.cardEligibility || 'Must meet issuer credit and income requirements'}</p>
                    </div>
                  </div>

                  {card.creditScore && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Credit Score</h3>
                        <p className="text-gray-600">{card.creditScore}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 7. Is This Card Right For You? */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600 text-lg">🤔</span>
                  Is This Card Right For You?
                </h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-xl">
                    <h3 className="font-semibold text-green-800 mb-2">✅ This card is great for:</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">•</span>
                        <span>People who want {card.rewardsProgram} rewards</span>
                      </li>
                      {card.category.toLowerCase().includes('travel') && (
                        <li className="flex items-start gap-2">
                          <span className="text-green-600">•</span>
                          <span>Frequent travelers looking for travel benefits</span>
                        </li>
                      )}
                      {card.annualFee === 0 && (
                        <li className="flex items-start gap-2">
                          <span className="text-green-600">•</span>
                          <span>Those who want rewards without paying an annual fee</span>
                        </li>
                      )}
                      {card.welcomeBonus && (
                        <li className="flex items-start gap-2">
                          <span className="text-green-600">•</span>
                          <span>Anyone looking for a generous welcome bonus</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="p-4 bg-red-50 rounded-xl">
                    <h3 className="font-semibold text-red-800 mb-2">❌ Look elsewhere if:</h3>
                    <ul className="space-y-2 text-gray-700">
                      {card.annualFee > 0 && (
                        <li className="flex items-start gap-2">
                          <span className="text-red-600">•</span>
                          <span>You want a no-annual-fee card</span>
                        </li>
                      )}
                      <li className="flex items-start gap-2">
                        <span className="text-red-600">•</span>
                        <span>You don't spend enough to justify the rewards structure</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600">•</span>
                        <span>You prefer a different rewards program</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 8. Pros & Cons */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600 text-lg">⚖️</span>
                  Pros & Cons
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Pros
                    </h3>
                    <ul className="space-y-2">
                      {pros.map((pro, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <span className="text-green-500 shrink-0">+</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Cons
                    </h3>
                    <ul className="space-y-2">
                      {cons.length > 0 ? cons.map((con, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <span className="text-red-500 shrink-0">−</span>
                          <span>{con}</span>
                        </li>
                      )) : (
                        <li className="text-gray-500 italic">No major drawbacks identified</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* 9. Our Verdict */}
              <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl shadow-lg p-6 text-white">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  Our Verdict
                </h2>
                <p className="text-lg text-red-100 leading-relaxed mb-6">
                  {verdict}
                </p>
                <Link
                  href={card.productLink || '#'}
                  target={card.productLink ? "_blank" : undefined}
                  rel={card.productLink ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center gap-2 bg-white text-red-600 font-bold py-3 px-6 rounded-xl hover:bg-red-50 transition-colors"
                >
                  Apply Now
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </div>

              {/* FAQ */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 text-lg">❓</span>
                  Frequently Asked Questions
                </h2>
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
