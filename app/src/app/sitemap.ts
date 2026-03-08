import { MetadataRoute } from 'next';
import { getCards } from '@/lib/data';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const cards = await getCards();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://canadiancreditcardfinder.com';

    const cardPages = cards.map((card) => ({
        url: `${baseUrl}/card/${card.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/compare`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        ...cardPages,
    ];
}
