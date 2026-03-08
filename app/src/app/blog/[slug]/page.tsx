import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug, getBlogPosts } from '@/lib/blog';
import StructuredData from '@/components/StructuredData';

interface BlogPostProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: `${post.title} | Canadian Credit Card Finder Blog`,
    description: post.excerpt,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      locale: 'en_CA',
      publishedTime: post.publishedDate,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPost({ params }: BlogPostProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  
  if (!post) {
    notFound();
  }

  // Generate FAQ schema if post has FAQs
  const faqSchema = post.faqs? {
    mainEntity: post.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  } : null;

  return (
    <>
      <StructuredData
        type="BlogPosting"
        data={{
          headline: post.title,
          description: post.excerpt,
          author: {
            '@type': 'Organization',
            name: 'Canadian Credit Card Finder',
          },
          publisher: {
            '@type': 'Organization',
            name: 'Canadian Credit Card Finder',
            logo: {
              '@type': 'ImageObject',
              url: 'https://canadiancreditcardfinder.com/logo.png',
            },
          },
          datePublished: post.publishedDate,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://canadiancreditcardfinder.com/blog/${post.slug}`,
          },
        }}
      />

      {faqSchema && (
        <StructuredData type="FAQPage" data={faqSchema} />
      )}

      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="text-gray-400 mb-6 text-sm">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/blog" className="hover:text-white">Blog</Link>
              <span className="mx-2">/</span>
              <span className="text-white">{post.title}</span>
            </nav>

            <div className="flex items-center gap-2 mb-4">
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                {post.category}
              </span>
              <span className="text-gray-400 text-sm">{post.readingTime}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">{post.title}</h1>
            <p className="text-xl text-gray-300">{post.excerpt}</p>
          </div>
        </section>

        {/* Content */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-xl shadow-md p-8 lg:p-12">
            <div 
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-red-600 prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* FAQs Section */}
          {post.faqs && post.faqs.length > 0 && (
            <section className="mt-12 bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              <div className="space-y-6">
                {post.faqs.map((faq, index) => (
                  <div key={index} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Back to Blog */}
          <div className="mt-12 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-red-600 font-semibold hover:text-red-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Blog
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
