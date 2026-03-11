const fs = require('fs');

let content = fs.readFileSync('blog.ts', 'utf8');

// Add imports at the top
const importSection = `import { noFeeBlogPost } from './blog-no-fee';
import { businessBlogPost } from './blog-business';
import { aeroplanBlogPost } from './blog-aeroplan';

`;

content = importSection + content;

// Add new posts to the array
content = content.replace(
  /];\s*\n\s*export async function getBlogPosts/,
  `,
  noFeeBlogPost,
  businessBlogPost,
  aeroplanBlogPost,
];

export async function getBlogPosts`
);

fs.writeFileSync('blog.ts', content);
console.log('Updated blog.ts successfully');
