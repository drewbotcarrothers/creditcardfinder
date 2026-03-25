import pandas as pd
import re
from datetime import datetime

def slugify(text):
    if pd.isna(text):
        return ''
    text = str(text).lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')

# Fetch CSV from Google Sheets
csv_url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSLuyK4CeRn7azPK5NonipsptqpA6bAb4eQI7CjaoqWL0ojE1v9D4igzNR9Raw_-uhBMdsugEU1Wns6/pub?gid=272625262&single=true&output=csv'

df = pd.read_csv(csv_url)
card_slugs = [slugify(name) for name in df['Credit_Card_Name'] if name and not pd.isna(name)]

today = datetime.now().strftime('%Y-%m-%d')
base_url = 'https://canadiancreditcardfinder.com'

print('Writing sitemap.xml...')
with open('app/public/sitemap.xml', 'w', encoding='utf-8') as f:
    f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
    f.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
    
    # Static pages
    f.write(f'  <url>\n    <loc>{base_url}/</loc>\n    <lastmod>{today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n')
    f.write(f'  <url>\n    <loc>{base_url}/blog/</loc>\n    <lastmod>2026-02-01</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n')
    f.write(f'  <url>\n    <loc>{base_url}/compare/</loc>\n    <lastmod>{today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n')
    f.write(f'  <url>\n    <loc>{base_url}/quiz/</loc>\n    <lastmod>{today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n')
    
    # Card pages
    for slug in card_slugs:
        f.write(f'  <url>\n    <loc>{base_url}/card/{slug}/</loc>\n    <lastmod>{today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n')
    
    # Blog posts
    blog_posts = [
        ('ultimate-guide-canadian-credit-cards-2026', '2026-02-10'),
        ('best-no-annual-fee-credit-cards-canada', '2026-02-08'),
        ('best-travel-rewards-cards-canada', '2026-02-05'),
        ('best-cash-back-credit-cards-canada', '2026-02-03'),
        ('best-student-credit-cards-canada', '2026-02-01'),
    ]
    for slug, date in blog_posts:
        f.write(f'  <url>\n    <loc>{base_url}/blog/{slug}/</loc>\n    <lastmod>{date}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n')
    
    f.write('</urlset>\n')

print(f'Generated sitemap.xml with {len(card_slugs) + 9} URLs')
print(f'  - 4 static pages')
print(f'  - {len(card_slugs)} card pages')
print(f'  - 5 blog posts')
