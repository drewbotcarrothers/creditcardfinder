export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  icon: string;
  readingTime: string;
  publishedDate: string;
  keywords: string[];
  faqs?: { question: string; answer: string }[];
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const posts: BlogPost[] = [
    {
      slug: 'best-travel-rewards-credit-cards-canada',
      title: 'Best Travel Rewards Credit Cards in Canada 2025',
      category: 'Best Of',
      excerpt: 'Compare the top travel rewards credit cards for Canadians. Aeroplan, Aventura, Scene+, and more. Find cards with the best earn rates plus lounge access.',
      icon: '✈️',
      readingTime: '9 min read',
      publishedDate: '2025-03-02',
      keywords: [
        'travel rewards credit cards Canada',
        'best travel credit cards',
        'Aeroplan credit cards',
        'Aventura vs Aeroplan',
        'travel points credit cards',
      ],
      content: `
        <p>Travel rewards cards offer the highest potential value for travelers. When used strategically, points can be worth 2-10 cents each — far exceeding cash back rates. Here's everything you need to know about maximizing travel rewards in Canada.</p>

        <h2>Canadian Loyalty Programs Overview</h2>

        <h3>Aeroplan (Air Canada)</h3>
        <p><strong>Partners:</strong> Star Alliance (United, Lufthansa, ANA, etc.)</p>
        <p><strong>Value:</strong> ~2.0 cents per point (cpp) for premium cabin redemptions</p>
        <p><strong>Best for:</strong> International flights, especially business class to Europe/Asia</p>
        <p><strong>Co-branded cards:</strong> TD Aeroplan, CIBC Aeroplan, American Express</p>

        <h3>CIBC Aventura</h3>
        <p><strong>Partners:</strong> 12+ airlines including Air Canada</p>
        <p><strong>Value:</strong> ~1.5 cpp through travel portal, up to 2.5 cpp with transfers</p>
        <p><strong>Best for:</strong> Flexibility — not tied to Air Canada</p>

        <h2>Best For Aeroplan: TD Aeroplan Visa Infinite</h2>
        <ul>
          <li><strong>Earn rate:</strong> 1.5x on gas/groceries/Air Canada, 1x elsewhere</li>
          <li><strong>Perks:</strong> First checked bag free, Aeroplan benefits</li>
          <li><strong>Annual fee:</strong> $139</li>
        </ul>

        <h2>Bottom Line</h2>
        <p>Travel rewards cards can deliver 2-5x more value than cash back IF you travel regularly and redeem strategically.</p>
      `,
      faqs: [
        {
          question: 'Which travel points are worth the most?',
          answer: 'Aeroplan points offer the highest potential value at 2+ cents per point for premium cabin flights.',
        },
        {
          question: 'Do I need an Aeroplan card to earn Aeroplan points?',
          answer: 'No. You can earn Aeroplan through American Express cards and transfer points 1:1.',
        },
      ],
    },
  ];
  return posts;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getBlogPosts();
  return posts.find((post) => post.slug === slug) || null;
}

export async function getRelatedBlogPosts(currentSlug: string, limit = 3): Promise<BlogPost[]> {
  const posts = await getBlogPosts();
  return posts
    .filter((post) => post.slug !== currentSlug)
    .slice(0, limit);
}
