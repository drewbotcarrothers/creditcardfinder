// Affiliate Link Management
// Add tracking parameters to product links based on issuer

export interface AffiliateConfig {
  issuer: string;
  network: 'rakuten' | 'cj' | 'direct' | 'none';
  baseUrl: string;
  trackingParam: string;
}

// Affiliate network tracking parameters
// These will be appended to product links
const AFFILIATE_PARAMS: Record<string, string> = {
  // Rakuten LinkShare parameters
  'RBC': 'utm_source=canadiancreditcardfinder&utm_medium=affiliate&utm_campaign=rbc',
  'TD': 'utm_source=canadiancreditcardfinder&utm_medium=affiliate&utm_campaign=td',
  'CIBC': 'utm_source=canadiancreditcardfinder&utm_medium=affiliate&utm_campaign=cibc',
  'BMO': 'utm_source=canadiancreditcardfinder&utm_medium=affiliate&utm_campaign=bmo',
  'Scotiabank': 'utm_source=canadiancreditcardfinder&utm_medium=affiliate&utm_campaign=scotiabank',
  'American Express': 'utm_source=canadiancreditcardfinder&utm_medium=affiliate&utm_campaign=amex',
  
  // CJ Affiliate parameters
  'Capital One': 'utm_source=canadiancreditcardfinder&utm_medium=affiliate&utm_campaign=capitalone',
  'MBNA': 'utm_source=canadiancreditcardfinder&utm_medium=affiliate&utm_campaign=mbna',
  
  // Direct partnerships
  'Tangerine': 'utm_source=canadiancreditcardfinder&utm_medium=affiliate&utm_campaign=tangerine',
  'Simplii Financial': 'utm_source=canadiancreditcardfinder&utm_medium=affiliate&utm_campaign=simplii',
  'Neo Financial': 'utm_source=canadiancreditcardfinder&utm_medium=affiliate&utm_campaign=neo',
  'KOHO': 'utm_source=canadiancreditcardfinder&utm_medium=affiliate&utm_campaign=koho',
  'Rogers Bank': 'utm_source=canadiancreditcardfinder&utm_medium=affiliate&utm_campaign=rogers',
  'PC Financial': 'utm_source=canadiancreditcardfinder&utm_medium=affiliate&utm_campaign=pcfinancial',
};

/**
 * Build affiliate link with tracking parameters
 * @param baseUrl - The original product URL
 * @param issuer - Card issuer name
 * @returns URL with affiliate tracking parameters
 */
export function buildAffiliateLink(baseUrl: string, issuer: string): string {
  if (!baseUrl || baseUrl === '#') return '#';
  
  const trackingParams = AFFILIATE_PARAMS[issuer];
  if (!trackingParams) return baseUrl;
  
  // Check if URL already has query parameters
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${trackingParams}`;
}

/**
 * Get affiliate network for an issuer
 */
export function getAffiliateNetwork(issuer: string): 'rakuten' | 'cj' | 'direct' | 'none' {
  const rakutenIssuers = ['RBC', 'TD', 'CIBC', 'BMO', 'Scotiabank', 'American Express', 'PC Financial', 'Rogers Bank'];
  const cjIssuers = ['Capital One', 'MBNA'];
  const directIssuers = ['Tangerine', 'Simplii Financial', 'Neo Financial', 'KOHO'];
  
  if (rakutenIssuers.includes(issuer)) return 'rakuten';
  if (cjIssuers.includes(issuer)) return 'cj';
  if (directIssuers.includes(issuer)) return 'direct';
  return 'none';
}

/**
 * Check if issuer has active affiliate program
 */
export function hasAffiliateProgram(issuer: string): boolean {
  return issuer in AFFILIATE_PARAMS;
}

// Disclosure text for affiliate links
export const AFFILIATE_DISCLOSURE = 
  "We may receive compensation when you click on links to products from our partners. " +
  "This helps us provide free comparison tools and content. " +
  "Our editorial opinions are independent of any compensation we receive.";

// Short disclosure for inline use
export const AFFILIATE_DISCLOSURE_SHORT = 
  "We may earn a commission when you apply through our links (at no extra cost to you).";
