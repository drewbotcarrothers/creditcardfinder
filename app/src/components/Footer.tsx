import Link from 'next/link';
import EmailCapture from './EmailCapture';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="mb-10">
          <EmailCapture 
            location="footer" 
            title="💳 Never Miss a Deal"
            description="Get notified when welcome bonuses increase or exclusive offers drop. One email per week, unsubscribe anytime."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Canadian Credit Card Finder</h3>
            <p className="text-gray-400 text-sm">
              Find the best Canadian credit cards. Compare rewards, cashback, travel perks, and more.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/quiz" className="text-gray-400 hover:text-white text-sm">
                  Card Finder
                </Link>
              </li>
              <li>
                <Link href="/compare" className="text-gray-400 hover:text-white text-sm">
                  Compare Cards
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white text-sm">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Disclaimer</h4>
            <p className="text-gray-400 text-sm">
              We may receive compensation from card issuers. Rates and terms subject to change.
            </p>
          </div>
        </div>

          {/* Affiliate Disclosure */}
          <div className="col-span-1 md:col-span-3 mt-6 pt-6 border-t border-gray-700">
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-amber-400 mb-2">Affiliate Disclosure</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Canadian Credit Card Finder is an independent comparison website. We may receive compensation 
                when you click on links to products from our partner card issuers. This comes at no additional 
                cost to you and helps us maintain this free comparison service. Our reviews and recommendations 
                are based on independent analysis and are not influenced by compensation we receive.
              </p>
            </div>
          </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Canadian Credit Card Finder. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
