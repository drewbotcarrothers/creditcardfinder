# SOP: Canadian Credit Card Finder Website Development

## Project Overview

Build **Canadian Credit Card Finder** — a responsive website for Canadians to view, filter, compare, and find credit cards. The site pulls data from a Google Sheets source and provides a clean, user-friendly experience optimized for both desktop and mobile users.

**Site Name:** Canadian Credit Card Finder

---

## Technical Stack

- **Framework:** Next.js 14+ (App Router) with React
- **Styling:** Tailwind CSS
- **Data Source:** Google Sheets (published as CSV)
- **Hosting:** Vercel (recommended) or similar static hosting
- **Image Handling:** Next.js Image component with optimized loading

---

## Data Source Configuration

### Google Sheets CSV URL

```
https://docs.google.com/spreadsheets/d/e/2PACX-1vSLuyK4CeRn7azPK5NonipsptqpA6bAb4eQI7CjaoqWL0ojE1v9D4igzNR9Raw_-uhBMdsugEU1Wns6/pub?gid=272625262&single=true&output=csv
```

### Complete Data Schema

The Google Sheets file "Cards Master" contains exactly these 22 columns:

| Column Name | Data Type | Description | Example Values |
|-------------|-----------|-------------|----------------|
| ID | Number | Unique identifier | 1, 2, 3... |
| Credit_Card_Name | String | Full card name | "American Express Cobalt Card" |
| Image | String | Image reference (unused) | - |
| Image_File | String | Card image filename | "American Express Cobalt Card.png" |
| Issuer | String | Bank/institution | "American Express", "TD", "RBC" |
| Category | String | Card category | "Rewards", "Travel", "Cash Back", "Low Interest" |
| Annual_Fee | String | Annual fee with $ | "$155.88", "$0", "$120" |
| Annual_Fee_Detail | String | Fee explanation | "12.99 per month or $155.88 per year" |
| Additional_Card_Fee | String | Additional cardholder fee | "$0", "$50" |
| Additional_Card_Detail | String | Additional fee details | "$0 or no cost" |
| Purchase_Interest_Rate | String | Purchase APR | "21.99%", "20.99%" |
| Cash_Advance_Interest_Rate | String | Cash advance APR | "21.99%", "22.99%" |
| Rewards_Program | String | Rewards program name | "AMEX Membership Rewards", "Aeroplan" |
| Welcome_Bonus | String | Welcome bonus summary | "Earn up to 15,000 Membership Rewards points" |
| Welcome_Bonus_Detailed | String | Full welcome bonus details | Multi-line detailed description |
| Welcome_Bonus_Value | String | Estimated bonus value | "up to $150", "$200" |
| Welcome_Bonus_Eligbility | String | Eligibility requirements | "Current or former Cardmembers with this Card are not eligible" |
| Features | String | Key features summary | Earning rates summary |
| Features_Detailed | String | Full features description | Multi-line detailed features |
| Card_Eligibility | String | Who can apply | Requirements and restrictions |
| Insurance | String | Insurance coverage | Coverage types and details |
| Product_Link | String | Application URL | "https://..." |

### TypeScript Interface

```typescript
interface CreditCard {
  id: number;
  creditCardName: string;
  imageFile: string;
  issuer: string;
  category: string;
  annualFee: number;           // Parsed from "$155.88" → 155.88
  annualFeeDisplay: string;    // Original "$155.88" for display
  annualFeeDetail: string;
  additionalCardFee: number;
  additionalCardFeeDisplay: string;
  additionalCardDetail: string;
  purchaseInterestRate: number;  // Parsed from "21.99%" → 21.99
  purchaseInterestRateDisplay: string;
  cashAdvanceInterestRate: number;
  cashAdvanceInterestRateDisplay: string;
  rewardsProgram: string;
  welcomeBonus: string;
  welcomeBonusDetailed: string;
  welcomeBonusValue: string;
  welcomeBonusEligibility: string;
  features: string;
  featuresDetailed: string;
  cardEligibility: string;
  insurance: string;
  productLink: string;
  // Computed
  slug: string;                // URL-friendly version of name
}
```

### Data Parsing Function

```typescript
function parseCSV(csvText: string): CreditCard[] {
  // Use papaparse or similar CSV parser
  const rows = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  
  return rows.data.map((row: any) => ({
    id: parseInt(row.ID) || 0,
    creditCardName: row.Credit_Card_Name || '',
    imageFile: row.Image_File || '',
    issuer: row.Issuer || '',
    category: row.Category || '',
    annualFee: parseFloat(row.Annual_Fee?.replace(/[$,]/g, '') || '0'),
    annualFeeDisplay: row.Annual_Fee || '$0',
    annualFeeDetail: row.Annual_Fee_Detail || '',
    additionalCardFee: parseFloat(row.Additional_Card_Fee?.replace(/[$,]/g, '') || '0'),
    additionalCardFeeDisplay: row.Additional_Card_Fee || '$0',
    additionalCardDetail: row.Additional_Card_Detail || '',
    purchaseInterestRate: parseFloat(row.Purchase_Interest_Rate?.replace('%', '') || '0'),
    purchaseInterestRateDisplay: row.Purchase_Interest_Rate || '',
    cashAdvanceInterestRate: parseFloat(row.Cash_Advance_Interest_Rate?.replace('%', '') || '0'),
    cashAdvanceInterestRateDisplay: row.Cash_Advance_Interest_Rate || '',
    rewardsProgram: row.Rewards_Program || '',
    welcomeBonus: row.Welcome_Bonus || '',
    welcomeBonusDetailed: row.Welcome_Bonus_Detailed || '',
    welcomeBonusValue: row.Welcome_Bonus_Value || '',
    welcomeBonusEligibility: row.Welcome_Bonus_Eligbility || '', // Note: typo in source
    features: row.Features || '',
    featuresDetailed: row.Features_Detailed || '',
    cardEligibility: row.Card_Eligibility || '',
    insurance: row.Insurance || '',
    productLink: row.Product_Link || '',
    slug: slugify(row.Credit_Card_Name || ''),
  }));
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
```

---

## Site Architecture

```
/
├── /                           (Home - Card Listing with Filters)
├── /card/[slug]                (Individual Product Pages)
├── /compare                    (Comparison Page)
└── /sitemap.xml               (Auto-generated sitemap)
```

---

## Page Specifications

### 1. Main Page (Home/Card Listing)

**Purpose:** Display all credit cards with filtering capabilities

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│                        HEADER                           │
├─────────────────────────────────────────────────────────┤
│  HERO SECTION                                           │
│  H1: "Find the Best Credit Card for You"                │
│  Subtext: "Compare Canadian credit cards and find       │
│           your perfect match"                           │
├────────────┬────────────────────────────────────────────┤
│            │  Results count + Sort dropdown             │
│  FILTERS   │────────────────────────────────────────────│
│  (Sidebar) │                                            │
│            │           CARD GRID                        │
│  Category  │  ┌─────┐ ┌─────┐ ┌─────┐                  │
│  Issuer    │  │Card │ │Card │ │Card │                  │
│  Annual Fee│  │  1  │ │  2  │ │  3  │                  │
│  Features  │  └─────┘ └─────┘ └─────┘                  │
│            │                                            │
│            │  ┌─────┐ ┌─────┐ ┌─────┐                  │
│            │  │Card │ │Card │ │Card │                  │
│            │  │  4  │ │  5  │ │  6  │                  │
│            │  └─────┘ └─────┘ └─────┘                  │
├────────────┴────────────────────────────────────────────┤
│                        FOOTER                           │
└─────────────────────────────────────────────────────────┘
```

**Filter Panel:**

| Filter | Type | Options |
|--------|------|---------|
| Category | Multi-select checkbox | Dynamic from data (Rewards, Travel, Cash Back, Low Interest, etc.) |
| Issuer | Multi-select checkbox | Dynamic from data (American Express, TD, RBC, etc.) |
| Annual Fee | Preset buttons | $0, $1-$99, $100-$199, $200+ |
| Rewards Program | Multi-select checkbox | Dynamic from data (Aeroplan, AMEX Membership Rewards, etc.) |

**Filter Behavior:**
- Real-time filtering without page reload
- Show result count: "Showing X of Y cards"
- "Clear All Filters" button
- URL state persistence: `/?category=Travel&issuer=TD&fee=0-99`
- Mobile: Collapsible filter panel

**Sort Options:**
- Featured (default)
- Annual Fee: Low to High
- Annual Fee: High to Low
- Welcome Bonus Value: High to Low
- Card Name: A-Z

**Card Grid Item:**
```
┌─────────────────────────────────────┐
│         [Card Image]                │
│                                     │
│  ┌───────────┐                      │
│  │ Category  │                      │
│  └───────────┘                      │
│                                     │
│  Card Name (H3)                     │
│  by Issuer                          │
│                                     │
│  Annual Fee: $XX                    │
│  Welcome Bonus: Brief summary       │
│                                     │
│  ┌───────────────┐ ┌──────────────┐ │
│  │ View Details  │ │ + Compare    │ │
│  └───────────────┘ └──────────────┘ │
└─────────────────────────────────────┘
```

**Card Item Fields Displayed:**
- Image (from Image_File)
- Category (as badge)
- Credit_Card_Name
- Issuer
- Annual_Fee (display version)
- Welcome_Bonus (truncated if long)
- "View Details" button → /card/[slug]
- "Add to Compare" button

---

### 2. Product Page (/card/[slug])

**Purpose:** Display comprehensive details for a single credit card

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│                        HEADER                           │
├─────────────────────────────────────────────────────────┤
│  Breadcrumb: Home > [Card Name]                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐                                       │
│  │   [Card      │   Card Name (H1)                      │
│  │    Image]    │   by Issuer                           │
│  │              │   ┌──────────┐                        │
│  │              │   │ Category │                        │
│  │              │   └──────────┘                        │
│  └──────────────┘                                       │
│                                                         │
│  ┌─────────────────┐  ┌─────────────────┐               │
│  │   Apply Now     │  │  + Compare      │               │
│  └─────────────────┘  └─────────────────┘               │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  QUICK FACTS (grid of key stats)                        │
│  ┌────────────┬────────────┬────────────┬────────────┐  │
│  │Annual Fee  │Purchase    │Cash Adv.   │Rewards     │  │
│  │$XX.XX      │Rate XX%    │Rate XX%    │Program     │  │
│  └────────────┴────────────┴────────────┴────────────┘  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  WELCOME BONUS SECTION                                  │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Welcome Bonus Value: $XXX                       │    │
│  │ [Welcome_Bonus summary]                         │    │
│  │ [Welcome_Bonus_Detailed - expandable]           │    │
│  │ Eligibility: [Welcome_Bonus_Eligibility]        │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  FEES & INTEREST RATES                                  │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Annual Fee         │ $XX (detail)               │    │
│  │ Additional Card    │ $XX (detail)               │    │
│  │ Purchase Rate      │ XX.XX%                     │    │
│  │ Cash Advance Rate  │ XX.XX%                     │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  REWARDS & FEATURES                                     │
│  Rewards Program: [Rewards_Program]                     │
│  [Features - summary]                                   │
│  [Features_Detailed - full description]                 │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  INSURANCE COVERAGE                                     │
│  [Insurance details]                                    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ELIGIBILITY                                            │
│  [Card_Eligibility details]                             │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  APPLY NOW (CTA Section)                                │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Ready to apply for [Card Name]?                │    │
│  │  ┌─────────────────────────────────────────┐    │    │
│  │  │           Apply Now                     │    │    │
│  │  └─────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  RELATED CARDS (same category or issuer)                │
│  ┌─────┐ ┌─────┐ ┌─────┐                               │
│  │Card │ │Card │ │Card │                               │
│  └─────┘ └─────┘ └─────┘                               │
├─────────────────────────────────────────────────────────┤
│                        FOOTER                           │
└─────────────────────────────────────────────────────────┘
```

**Section Details:**

1. **Hero Section:**
   - Card image (from Image_File)
   - Credit_Card_Name as H1
   - Issuer name
   - Category badge
   - "Apply Now" primary button (links to Product_Link, opens new tab)
   - "Add to Compare" secondary button

2. **Quick Facts Grid:**
   - Annual Fee (Annual_Fee)
   - Purchase Interest Rate (Purchase_Interest_Rate)
   - Cash Advance Rate (Cash_Advance_Interest_Rate)
   - Rewards Program (Rewards_Program)

3. **Welcome Bonus Section:**
   - Welcome_Bonus_Value (highlighted)
   - Welcome_Bonus (summary)
   - Welcome_Bonus_Detailed (expandable "Read more")
   - Welcome_Bonus_Eligibility

4. **Fees & Interest:**
   - Table with Annual_Fee, Annual_Fee_Detail
   - Additional_Card_Fee, Additional_Card_Detail
   - Purchase_Interest_Rate
   - Cash_Advance_Interest_Rate

5. **Rewards & Features:**
   - Rewards_Program
   - Features (summary)
   - Features_Detailed (full text, preserve line breaks)

6. **Insurance:**
   - Insurance (formatted, preserve line breaks)

7. **Eligibility:**
   - Card_Eligibility

8. **CTA Section:**
   - "Apply Now" button linking to Product_Link

9. **Related Cards:**
   - 3-4 cards from same Category or Issuer

---

### 3. Comparison Page (/compare)

**Purpose:** Side-by-side comparison of up to 3 credit cards

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│                        HEADER                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Compare Credit Cards (H1)                              │
│  Select up to 3 cards to compare                        │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  CARD SELECTION                                         │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐  │
│  │ [Card Image]  │ │ [Card Image]  │ │  + Add Card   │  │
│  │  Card Name    │ │  Card Name    │ │               │  │
│  │     [×]       │ │     [×]       │ │               │  │
│  └───────────────┘ └───────────────┘ └───────────────┘  │
├─────────────────────────────────────────────────────────┤
│  COMPARISON TABLE                                       │
│  ┌─────────────────┬─────────┬─────────┬─────────┐      │
│  │ Feature         │ Card 1  │ Card 2  │ Card 3  │      │
│  ├─────────────────┼─────────┼─────────┼─────────┤      │
│  │ Card Image      │  [img]  │  [img]  │  [img]  │      │
│  │ Issuer          │   ...   │   ...   │   ...   │      │
│  │ Category        │   ...   │   ...   │   ...   │      │
│  │ Annual Fee      │  $XX ★  │  $XX    │  $XX    │      │
│  │ Purchase Rate   │  XX%    │  XX% ★  │  XX%    │      │
│  │ Cash Adv. Rate  │  XX%    │  XX%    │  XX% ★  │      │
│  │ Rewards Program │   ...   │   ...   │   ...   │      │
│  │ Welcome Bonus   │   ...   │   ...   │   ...   │      │
│  │ Bonus Value     │  $XX ★  │  $XX    │  $XX    │      │
│  │ Insurance       │   ...   │   ...   │   ...   │      │
│  ├─────────────────┼─────────┼─────────┼─────────┤      │
│  │                 │ [Apply] │ [Apply] │ [Apply] │      │
│  └─────────────────┴─────────┴─────────┴─────────┘      │
│                                                         │
│  ★ = Best value in row                                  │
├─────────────────────────────────────────────────────────┤
│                        FOOTER                           │
└─────────────────────────────────────────────────────────┘
```

**Comparison Table Rows:**
1. Card Image
2. Issuer
3. Category
4. Annual Fee (highlight lowest)
5. Purchase Interest Rate (highlight lowest)
6. Cash Advance Interest Rate (highlight lowest)
7. Rewards Program
8. Welcome Bonus
9. Welcome Bonus Value (highlight highest)
10. Insurance (summary)
11. Apply Now buttons

**Card Selection Modal:**
- Search/filter by card name
- Show card image, name, issuer
- Click to add

**State Management:**
- URL: `/compare?cards=slug1,slug2,slug3`
- localStorage for persistence
- Header badge shows count when cards selected

---

### 4. Header Component

**Desktop:**
```
┌─────────────────────────────────────────────────────────┐
│  Canadian Credit Card Finder    Home    Compare (2)     │
└─────────────────────────────────────────────────────────┘
```

**Mobile:**
```
┌─────────────────────────────────────────────────────────┐
│  Canadian Credit Card Finder                 [☰ Menu]   │
└─────────────────────────────────────────────────────────┘
```

- Logo/Site name links to home
- "Compare" shows badge with selected card count
- Mobile: Hamburger menu

---

### 5. Footer Component

```
┌─────────────────────────────────────────────────────────┐
│  Canadian Credit Card Finder                            │
│                                                         │
│  Home  |  Compare Cards                                 │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Disclaimer: Information is believed to be accurate.    │
│  Please verify all details with the card issuer before  │
│  applying. We may receive compensation from partners.   │
│                                                         │
│  © 2025 Canadian Credit Card Finder. All rights reserved│
└─────────────────────────────────────────────────────────┘
```

---

## Design Specifications

### Color Palette

| Usage | Color | Hex |
|-------|-------|-----|
| Background | White | #FFFFFF |
| Primary Accent | Red | #FF0000 |
| Primary Hover | Dark Red | #CC0000 |
| Text Primary | Dark Gray | #1A1A1A |
| Text Secondary | Medium Gray | #666666 |
| Borders | Light Gray | #E5E5E5 |
| Card Shadow | - | rgba(0,0,0,0.08) |
| Best Value Highlight | Light Green | #DCFCE7 |
| Badge Background | Light Gray | #F3F4F6 |

### Typography

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

| Element | Size | Weight |
|---------|------|--------|
| H1 | 32px / 24px mobile | Bold |
| H2 | 24px / 20px mobile | Bold |
| H3 | 20px / 18px mobile | Semibold |
| Body | 16px | Regular |
| Small | 14px | Regular |

### Components

**Primary Button (Apply Now):**
```css
background: #FF0000;
color: white;
padding: 12px 24px;
border-radius: 8px;
font-weight: 600;
```

**Secondary Button:**
```css
background: white;
color: #FF0000;
border: 2px solid #FF0000;
padding: 10px 22px;
border-radius: 8px;
```

**Card Component:**
```css
background: white;
border-radius: 12px;
box-shadow: 0 2px 8px rgba(0,0,0,0.08);
padding: 16px;
transition: all 0.2s;
/* Hover: lift and increase shadow */
```

**Badge:**
```css
background: #F3F4F6;
color: #374151;
padding: 4px 12px;
border-radius: 9999px;
font-size: 12px;
```

---

## Branding

### Site Name
**Canadian Credit Card Finder**

### Logo/Wordmark
- Display "Canadian Credit Card Finder" as text wordmark in header
- Font: Bold, same font family as site
- Color: Primary text color (#1A1A1A) or Red accent (#FF0000)
- Consider a simple icon (credit card outline or maple leaf) alongside text (optional)

### Brand Voice
- Helpful and informative
- Clear and straightforward
- Trustworthy and unbiased
- Canadian-focused

### Usage
- Header: Full name "Canadian Credit Card Finder"
- Footer: Full name with copyright
- Meta titles: Include "Canadian Credit Card Finder" 
- Browser tab: Abbreviated to "CCCF" or use full name if space permits

---

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, collapsible filters |
| Tablet | 640-1024px | 2-column grid |
| Desktop | > 1024px | 3-column grid, sidebar filters |

---

## SEO Requirements

### Meta Tags

**Main Page:**
```html
<title>Canadian Credit Card Finder | Compare & Find Your Perfect Card 2025</title>
<meta name="description" content="Canadian Credit Card Finder helps you compare the best Canadian credit cards. Filter by rewards, cashback, travel, and low interest rates. Find your perfect card.">
```

**Product Pages:**
```html
<title>[Card Name] | [Issuer] | Canadian Credit Card Finder</title>
<meta name="description" content="[Card Name] from [Issuer]. Annual fee: [Fee]. Interest: [Rate]. [Welcome Bonus]. Compare and apply at Canadian Credit Card Finder.">
```

**Comparison Page:**
```html
<title>Compare Credit Cards Side-by-Side | Canadian Credit Card Finder</title>
<meta name="description" content="Compare up to 3 Canadian credit cards side by side. See fees, rates, rewards to find your best match at Canadian Credit Card Finder.">
```

### Structured Data (JSON-LD)

**Organization (all pages):**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Canadian Credit Card Finder",
  "url": "[Site URL]"
}
```

**Product Pages:**
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "[Credit_Card_Name]",
  "brand": { "@type": "Brand", "name": "[Issuer]" },
  "category": "Credit Card",
  "offers": {
    "@type": "Offer",
    "price": "[annualFee]",
    "priceCurrency": "CAD"
  }
}
```

### Technical SEO
- XML sitemap at /sitemap.xml
- Semantic HTML (proper heading hierarchy)
- Alt text on all images
- Canonical URLs
- robots.txt allowing all pages

---

## Image Handling

**Directory:** `/public/images/cards/`

**Source:** Image_File column from spreadsheet

**Implementation:**
```jsx
<Image
  src={`/images/cards/${card.imageFile}`}
  alt={`${card.creditCardName} credit card`}
  width={300}
  height={189}
  onError={(e) => e.currentTarget.src = '/images/cards/placeholder.png'}
/>
```

**Fallback:** Create `/public/images/cards/placeholder.png`

---

## Data Fetching

```typescript
// lib/data.ts
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSLuyK4CeRn7azPK5NonipsptqpA6bAb4eQI7CjaoqWL0ojE1v9D4igzNR9Raw_-uhBMdsugEU1Wns6/pub?gid=272625262&single=true&output=csv';

export async function getCards(): Promise<CreditCard[]> {
  const response = await fetch(CSV_URL, {
    next: { revalidate: 3600 } // Cache for 1 hour
  });
  const csvText = await response.text();
  return parseCSV(csvText);
}

export async function getCardBySlug(slug: string): Promise<CreditCard | null> {
  const cards = await getCards();
  return cards.find(card => card.slug === slug) || null;
}
```

---

## State Management

### Comparison State

```typescript
// hooks/useComparison.ts
export function useComparison() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const selectedSlugs = searchParams.get('cards')?.split(',').filter(Boolean) || [];
  
  const addCard = (slug: string) => {
    if (selectedSlugs.length < 3 && !selectedSlugs.includes(slug)) {
      router.push(`/compare?cards=${[...selectedSlugs, slug].join(',')}`);
    }
  };
  
  const removeCard = (slug: string) => {
    router.push(`/compare?cards=${selectedSlugs.filter(s => s !== slug).join(',')}`);
  };
  
  return { selectedSlugs, addCard, removeCard, count: selectedSlugs.length };
}
```

### Filter State

URL parameters: `/?category=Travel,Rewards&issuer=TD&fee=0-99`

---

## File Structure

```
/project-root
├── /public
│   └── /images/cards/          # Card images matching Image_File
├── /src
│   ├── /app
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Main listing
│   │   ├── /card/[slug]/page.tsx
│   │   ├── /compare/page.tsx
│   │   └── sitemap.ts
│   ├── /components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── CardGrid.tsx
│   │   ├── CardItem.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── ComparisonTable.tsx
│   │   ├── CardSelector.tsx
│   │   └── Badge.tsx
│   ├── /hooks
│   │   ├── useComparison.ts
│   │   └── useFilters.ts
│   └── /lib
│       ├── data.ts
│       ├── types.ts
│       └── utils.ts
├── tailwind.config.js
├── next.config.js
└── package.json
```

---

## Development Phases

### Phase 1: Setup (Day 1)
- [ ] Initialize Next.js + TypeScript + Tailwind
- [ ] Set up project structure
- [ ] Create types and data fetching
- [ ] Build Header/Footer

### Phase 2: Main Page (Day 2)
- [ ] CardItem and CardGrid components
- [ ] FilterPanel with all filters
- [ ] Sorting functionality
- [ ] URL state for filters

### Phase 3: Product Pages (Day 3)
- [ ] Dynamic product page template
- [ ] All content sections
- [ ] Related cards section
- [ ] Structured data

### Phase 4: Comparison (Day 4)
- [ ] CardSelector modal
- [ ] ComparisonTable
- [ ] Add/remove functionality
- [ ] Best value highlighting

### Phase 5: Polish (Day 5)
- [ ] SEO (meta tags, sitemap)
- [ ] Performance optimization
- [ ] Mobile testing
- [ ] Accessibility audit

---

## Testing Checklist

- [ ] All pages render correctly
- [ ] Filters work individually and combined
- [ ] Product pages load for all cards
- [ ] Comparison handles 0-3 cards
- [ ] "Apply Now" opens Product_Link in new tab
- [ ] Images load with fallback
- [ ] Mobile responsive
- [ ] SEO meta tags present
- [ ] URL state persists and is shareable

---

## Critical Notes

1. **Apply Now buttons** must link to `Product_Link` column, open in new tab with `rel="noopener noreferrer"`

2. **Handle multi-line content** in Features_Detailed, Welcome_Bonus_Detailed, Insurance - preserve line breaks

3. **Note typo in source:** Column is `Welcome_Bonus_Eligbility` (missing 'i')

4. **Empty handling:** Some cards may have empty fields - display gracefully or hide section

5. **URL slugs:** Generate from Credit_Card_Name, ensure uniqueness

---

*End of SOP*
