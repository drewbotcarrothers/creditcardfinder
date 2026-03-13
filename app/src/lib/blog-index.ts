// Re-export all blog posts consolidated
export * from './blog';

// Import for combined list
import { noFeeBlogPost } from './blog-no-fee';
import { businessBlogPost } from './blog-business';
import { aeroplanBlogPost } from './blog-aeroplan';
import { bestCards2026Post } from './blog-posts-2026';
import { cashBackBlogPost } from './blog-cashback';
import { travelBlogPost } from './blog-travel';
import { getBlogPosts as getOriginalBlogPosts, getBlogPostBySlug as getOriginalBlogPostBySlug } from './blog';
import { BlogPost } from './blog';

// Re-export the blog posts
export { noFeeBlogPost, businessBlogPost, aeroplanBlogPost, bestCards2026Post, cashBackBlogPost, travelBlogPost };

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const existingPosts = await getOriginalBlogPosts();
  return [
    ...existingPosts,
    noFeeBlogPost,
    businessBlogPost,
    aeroplanBlogPost,
    bestCards2026Post,
    cashBackBlogPost,
    travelBlogPost,
  ];
}

export async function getBlogPostBySlugFromAll(slug: string): Promise<BlogPost | null> {
  const existingPost = await getOriginalBlogPostBySlug(slug);
  if (existingPost) return existingPost;
  
  const newPosts = [noFeeBlogPost, businessBlogPost, aeroplanBlogPost, bestCards2026Post, cashBackBlogPost, travelBlogPost];
  return newPosts.find((post) => post.slug === slug) || null;
}