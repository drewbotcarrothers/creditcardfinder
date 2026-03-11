// Re-export all blog posts consolidated
export * from './blog';
export { default as noFeeBlogPost } from './blog-no-fee';
export { default as businessBlogPost } from './blog-business';
export { default as aeroplanBlogPost } from './blog-aeroplan';

// Import for combined list
import { noFeeBlogPost } from './blog-no-fee';
import { businessBlogPost } from './blog-business';
import { aeroplanBlogPost } from './blog-aeroplan';
import { getBlogPosts as getOriginalBlogPosts, getBlogPostBySlug as getOriginalBlogPostBySlug } from './blog';
import { BlogPost } from './blog';

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const existingPosts = await getOriginalBlogPosts();
  return [
    ...existingPosts,
    noFeeBlogPost,
    businessBlogPost,
    aeroplanBlogPost,
  ];
}

export async function getBlogPostBySlugFromAll(slug: string): Promise<BlogPost | null> {
  const existingPost = await getOriginalBlogPostBySlug(slug);
  if (existingPost) return existingPost;
  
  const newPosts = [noFeeBlogPost, businessBlogPost, aeroplanBlogPost];
  return newPosts.find((post) => post.slug === slug) || null;
}
