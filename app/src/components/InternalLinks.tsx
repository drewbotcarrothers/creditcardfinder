'use client';

import Link from 'next/link';

interface RelatedLink {
  href: string;
  label: string;
}

interface InternalLinksProps {
  title: string;
  links: RelatedLink[];
  variant?: 'default' | 'cards' | 'categories' | 'blog';
}

export function InternalLinks({ title, links, variant = 'default' }: InternalLinksProps) {
  const styles = {
    default: 'bg-gray-50 border-gray-200',
    cards: 'bg-red-50 border-red-100',
    categories: 'bg-blue-50 border-blue-100',
    blog: 'bg-green-50 border-green-100',
  };

  return (
    <section className={`rounded-xl border p-6 ${styles[variant]}`}>
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        {title}
      </h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-gray-700 hover:text-red-600 hover:underline flex items-center gap-2 group"
            >
              <svg 
                className="w-3 h-3 text-gray-400 group-hover:text-red-500 transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Internal linking section for card detail pages
interface CardInternalLinksProps {
  category: string;
  issuer: string;
  rewardsProgram: string;
}

export function CardInternalLinks({ category, issuer, rewardsProgram }: CardInternalLinksProps) {
  const links: RelatedLink[] = [
    { href: `/?category=${encodeURIComponent(category)}`, label: `All ${category} Cards` },
    { href: `/?issuer=${encodeURIComponent(issuer)}`, label: `${issuer} Credit Cards` },
    { href: `/?rewards=${encodeURIComponent(rewardsProgram)}`, label: `${rewardsProgram} Cards` },
    { href: '/blog', label: 'Credit Card Guides' },
    { href: '/quiz', label: 'Find Your Perfect Card (Quiz)' },
    { href: '/compare', label: 'Compare Cards' },
  ];

  return (
    <InternalLinks 
      title="Related Resources"
      links={links}
      variant="cards"
    />
  );
}

// Internal linking for blog posts
interface BlogInternalLinksProps {
  category: string;
  relatedPosts?: { slug: string; title: string }[];
}

export function BlogInternalLinks({ category, relatedPosts = [] }: BlogInternalLinksProps) {
  const links: RelatedLink[] = [
    { href: '/blog', label: 'All Credit Card Guides' },
    { href: '/quiz', label: 'Find Your Perfect Card' },
    { href: '/compare', label: 'Compare Cards Side-by-Side' },
    ...relatedPosts.map(post => ({
      href: `/blog/${post.slug}`,
      label: post.title,
    })),
  ];

  return (
    <InternalLinks 
      title="Related Articles"
      links={links}
      variant="blog"
    />
  );
}

// Breadcrumb structured data component
interface BreadcrumbItem {
  name: string;
  item: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaData),
      }}
    />
  );
}

// Card Grid structured data for ItemList rich results
export function CardGridSchema({ cards }: { cards: { name: string; description: string; url: string }[] }) {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: cards.map((card, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: card.name,
        description: card.description,
        url: card.url,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaData),
      }}
    />
  );
}

// Site-wide organization schema
export function OrganizationSchema() {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Canadian Credit Card Finder',
    description: 'Compare Canadian credit cards and find your perfect match. Filter by rewards, cashback, travel perks, and more.',
    url: 'https://canadiancreditcardfinder.com',
    logo: 'https://canadiancreditcardfinder.com/logo.png',
    sameAs: [
      'https://twitter.com/creditcardca',
      'https://facebook.com/creditcardca',
    ],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://canadiancreditcardfinder.com/?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaData),
      }}
    />
  );
}

// Enhanced Product schema with aggregate ratings
interface EnhancedProductSchemaProps {
  name: string;
  issuer: string;
  category: string;
  annualFee: string;
  description: string;
  url: string;
  imageFile: string;
  features: string[];
}

export function EnhancedProductSchema({
  name,
  issuer,
  category,
  annualFee,
  description,
  url,
  imageFile,
  features,
}: EnhancedProductSchemaProps) {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: `https://canadiancreditcardfinder.com/images/cards/${imageFile}`,
    brand: {
      '@type': 'Brand',
      name: issuer,
    },
    category: {
      '@type': 'Thing',
      name: category,
    },
    offers: {
      '@type': 'Offer',
      price: annualFee.replace('$', '').replace(',', ''),
      priceCurrency: 'CAD',
      availability: 'https://schema.org/InStock',
      url,
      seller: {
        '@type': 'Organization',
        name: issuer,
      },
    },
    additionalProperty: features.map(feature => ({
      '@type': 'PropertyValue',
      name: 'Card Feature',
      value: feature,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaData),
      }}
    />
  );
}
