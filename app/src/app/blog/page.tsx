import { Metadata } from 'next';
import Link from 'next/link';
import { getBlogPosts } from '@/lib/blog';
import StructuredData from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'Credit Card Blog | Tips, Guides & Reviews 2025 | Canadian Credit Card Finder',
  description: 'Expert guides on choosing credit cards, maximizing rewards, improving credit scores, and finding the best welcome bonuses in Canada.',
  openGraph: {
    title: 'Credit Card Blog | Canadian Credit Card Finder',
    description: 'Expert guides on choosing credit cards, maximizing rewards, and more.',
    type: 'website',
    locale: 'en_CA',
  },
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <>
      <StructuredData
        type="WebSite"
        data={{
          name: 'Canadian Credit Card Finder Blog',
          description: 'Expert guides on choosing credit cards, maximizing rewards, and finding the best deals.',
          url: 'https://canadiancreditcardfinder.com/blog',
        }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Credit Card Guides & Tips</h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
              Expert advice on choosing cards, maximizing rewards, and improving your credit score.
            </p>
          </div>
        </section>

        {/* Blog Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <Link href={`/blog/${post.slug}`}>
                  <div className="h-48 bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                    <span className="text-6xl">{post.icon}</span>
                  </div>
                </Link>
                
                <div className="p-6">
                  <div className="text-sm text-red-600 font-semibold mb-2">{post.category}</div>
                  
                  <Link href={`/blog/${post.slug}`}>
                    <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-red-600 transition-colors">
                      {post.title}
                    </h2>
                  </Link>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{post.readingTime}</span>
                    <span>{post.publishedDate}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
