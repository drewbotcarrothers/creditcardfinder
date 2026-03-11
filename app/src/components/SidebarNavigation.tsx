import Link from 'next/link';

interface CategoryLink {
  name: string;
  slug: string;
  count: number;
}

interface SidebarNavigationProps {
  categories: CategoryLink[];
  issuers: string[];
}

export function SidebarNavigation({ categories, issuers }: SidebarNavigationProps) {
  // Sort categories by count
  const sortedCategories = [...categories].sort((a, b) => b.count - a.count);
  
  return (
    <aside className="bg-white rounded-xl shadow-md p-6">
      <div className="mb-8">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          Popular Categories
        </h3>
        <ul className="space-y-2">
          {sortedCategories.slice(0, 8).map((category) => (
            <li key={category.slug}>
              <Link
                href={`/?category=${encodeURIComponent(category.name)}`}
                className="flex items-center justify-between text-sm text-gray-600 hover:text-red-600 group"
              >
                <span className="group-hover:underline">{category.name}</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {category.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Link 
          href="/"
          className="mt-4 inline-flex items-center text-sm text-red-600 hover:text-red-700 font-medium"
        >
          View all categories
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="mb-8 pt-6 border-t border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Card Issuers
        </h3>
        <ul className="space-y-2">
          {issuers.slice(0, 8).map((issuer) => (
            <li key={issuer}>
              <Link
                href={`/?issuer=${encodeURIComponent(issuer)}`}
                className="text-sm text-gray-600 hover:text-red-600 hover:underline"
              >
                {issuer}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-6 border-t border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Tools
        </h3>
        <ul className="space-y-3">
          <li>
            <Link
              href="/quiz"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 group"
            >
              <span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-lg">🎯</span>
              <span className="group-hover:underline">Card Finder Quiz</span>
            </Link>
          </li>
          <li>
            <Link
              href="/compare"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 group"
            >
              <span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-lg">⚖️</span>
              <span className="group-hover:underline">Compare Cards</span>
            </Link>
          </li>
          <li>
            <Link
              href="/blog"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 group"
            >
              <span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-lg">📚</span>
              <span className="group-hover:underline">Credit Card Guides</span>
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
}

// Quick links component for footer
export function QuickLinks() {
  const links = [
    { label: 'All Credit Cards', href: '/' },
    { label: 'Cash Back Cards', href: '/?category=Cash%20Back' },
    { label: 'Travel Cards', href: '/?category=Travel' },
    { label: 'No Annual Fee', href: '/?fee=0' },
    { label: 'Card Finder Quiz', href: '/quiz' },
    { label: 'Compare Cards', href: '/compare' },
    { label: 'Blog & Guides', href: '/blog' },
  ];
  
  return (
    <div className="grid grid-cols-2 gap-4">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-sm text-gray-500 hover:text-white transition-colors"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
