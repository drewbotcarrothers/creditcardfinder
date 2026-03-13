import { noFeeBlogPost } from './blog-no-fee';
import { businessBlogPost } from './blog-business';
import { aeroplanBlogPost } from './blog-aeroplan';
import { bestCards2026Post } from './blog-posts-2026';
import { cashBackBlogPost } from './blog-cashback';
import { travelBlogPost } from './blog-travel';

export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  icon: string;
  image: string;
  readingTime: string;
  publishedDate: string;
  updatedDate?: string;
  keywords: string[];
  faqs?: { question: string; answer: string }[];
}

const blogPosts: BlogPost[] = [
  bestCards2026Post,
  noFeeBlogPost,
  businessBlogPost,
  aeroplanBlogPost,
  cashBackBlogPost,
  travelBlogPost,
  {
    slug: 'understanding-credit-scores-canada-2026',
    title: 'Credit Score Requirements 2026: What Score Do You Need?',
    category: 'Credit Tips',
    excerpt: 'Updated 2026 guide on credit score requirements for Canadian credit cards. Learn what score you need for premium, mid-tier, and student cards.',
    icon: '📊',
    image: '/credit_card_images/MBNA True Line Mastercard.png',
    readingTime: '6 min read',
    publishedDate: '2026-03-11',
    keywords: [
      'credit score Canada 2026',
      'minimum credit score credit card',
      'credit score requirements',
      'improve credit score',
      'credit card approval 2026',
    ],
    content: `
      <p>Choosing the right credit card can save you hundreds (or even thousands) of dollars per year.</p>

      <h2>How to Choose the Right Credit Card</h2>
      <ul>
        <li><strong>Your spending habits:</strong> Do you spend more on groceries, travel, or gas?</li>
        <li><strong>Annual fee tolerance:</strong> Are you willing to pay for premium benefits?</li>
        <li><strong>Credit score:</strong> Some cards require excellent credit</li>
      </ul>
    `,
    faqs: [
      {
        question: 'What\'s the best credit card in Canada for rewards?',
        answer: 'The best rewards card depends on your spending. For travel, the American Express Cobalt is excellent. For cash back, look at no-fee options.',
      },
    ],
  },
];

export async function getBlogPosts(): Promise<BlogPost[]> {
  return blogPosts;
}

export const getAllBlogPosts = getBlogPosts;

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  return blogPosts.find((post) => post.slug === slug) || null;
}

export async function getRelatedBlogPosts(currentSlug: string, limit = 3): Promise<BlogPost[]> {
  return blogPosts
    .filter((post) => post.slug !== currentSlug)
    .slice(0, limit);
}