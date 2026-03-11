import { MetadataRoute } from 'next';
import { getCards } from '@/lib/data';
import { getBlogPosts } from '@/lib/blog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://canadiancreditcardfinder.com';
  
  const cards = await getCards();
  const posts = await getBlogPosts();
  
  // Static pages
  const staticPages = [
    { url: baseUrl, priority: 1.0 },
    { url: `${baseUrl}/blog`, priority: 0.8 },
    { url: `${baseUrl}/compare`, priority: 0.8 },
    { url: `${baseUrl}/quiz`, priority: 0.9 },
  ];
  
  // Card pages
  const cardPages = cards.map((card) => ({
    url: `${baseUrl}/card/${card.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));
  
  // Blog pages
  const blogPages = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedDate),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));
  
  return [
    ...staticPages.map((page) => ({
      url: page.url,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: page.priority,
    })),
    ...cardPages,
    ...blogPages,
  ];
}
