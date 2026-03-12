# Page Speed Optimization Plan

## Current Issues & Fixes

### 1. Image Optimization ✅

**Problem:** Large credit card images (800x506px) loading on all devices

**Solutions:**
- [ ] **WebP Format**: Convert all card images to WebP (60-80% smaller)
- [ ] **Responsive Sizes**: Serve different sizes for mobile/desktop
- [ ] **Lazy Loading**: Only load images in viewport
- [ ] **Priority Loading**: Load above-fold images first

**Implementation:**
```tsx
// CardItem.tsx - Add loading="lazy" for below-fold cards
<Image
  src={`/credit_card_images/${card.imageFile}`}
  alt={card.creditCardName}
  fill
  loading="lazy"  // Add this
  className="object-contain p-3 sm:p-4"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
```

**Priority Images** (load immediately):
- Hero section cards
- First 6 cards in grid
- Card detail page main image

---

### 2. Script Loading Optimization ✅

**Problem:** Google AdSense & Analytics blocking render

**Current:**
```html
<script async src="...adsbygoogle.js..."></script>
<script async src="...gtag/js..."></script>
```

**Optimized:**
```html
<!-- Defer non-critical scripts -->
<script 
  defer 
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7909541570116920"
  crossOrigin="anonymous"
/>
<script 
  defer 
  src="https://www.googletagmanager.com/gtag/js?id=G-0ENLPEM4YP"
/>
```

---

### 3. Font Loading Optimization ✅

**Problem:** Inter font may cause FOIT/FOUT

**Current:**
```tsx
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
```

**Optimized:**
```tsx
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',  // Prevents FOIT
  preload: true,
});
```

---

### 4. CSS Optimization ✅

**Problem:** Large CSS bundle, unused Tailwind classes

**Solutions:**
- [ ] **PurgeCSS**: Already configured in Tailwind
- [ ] **Critical CSS**: Inline above-fold styles
- [ ] **Minify**: Already done by Next.js

**Tailwind Config Check:**
```js
// tailwind.config.ts - Ensure purge is configured
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // ... rest of config
}
```

---

### 5. Code Splitting & Bundle Size ✅

**Already Added to next.config.ts:**
- Vendor chunk splitting
- Common chunk optimization
- Package import optimization for icons

---

### 6. Caching Strategy (Static Export Limitations)

**Problem:** Static export doesn't support Next.js headers

**Solutions:**
- [ ] **_headers file** for Netlify/Cloudflare Pages
- [ ] **CDN Configuration** (Cloudflare, etc.)
- [ ] **Service Worker** for offline caching

**_headers file** (create in `public/`):
```
/*
  Cache-Control: public, max-age=31536000, immutable

/*.html
  Cache-Control: public, max-age=0, must-revalidate

/credit_card_images/*
  Cache-Control: public, max-age=2592000
```

---

### 7. Third-Party Script Loading

**Lazy load non-critical scripts:**

```tsx
// components/AdSense.tsx
'use client';
import { useEffect } from 'react';

export default function AdSense() {
  useEffect(() => {
    // Load AdSense after page is interactive
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.dataset.client = 'ca-pub-7909541570116920';
    document.head.appendChild(script);
  }, []);

  return null;
}
```

---

## Quick Wins (Do These First)

1. **Add `loading="lazy"`** to CardItem images ✅
2. **Add `display: 'swap'`** to Inter font ✅
3. **Defer AdSense & Analytics** scripts ✅
4. **Create `_headers` file** for caching ✅
5. **Compress images** to WebP format

---

## Performance Targets

| Metric | Current | Target | Priority |
|--------|---------|--------|----------|
| **LCP** (Largest Contentful Paint) | ~2.5s | <1.8s | High |
| **FID** (First Input Delay) | ~50ms | <50ms | Medium |
| **CLS** (Cumulative Layout Shift) | ~0.1 | <0.1 | High |
| **TTFB** (Time to First Byte) | ~200ms | <100ms | Medium |
| **FCP** (First Contentful Paint) | ~1.2s | <0.9s | Medium |

---

## Testing Tools

1. **PageSpeed Insights**: https://pagespeed.web.dev/
2. **GTmetrix**: https://gtmetrix.com/
3. **WebPageTest**: https://www.webpagetest.org/
4. **Chrome DevTools** → Lighthouse

---

## Implementation Checklist

- [ ] 1. Optimize next.config.ts (done)
- [ ] 2. Add lazy loading to CardItem images
- [ ] 3. Add font-display: swap
- [ ] 4. Defer third-party scripts
- [ ] 5. Create _headers file
- [ ] 6. Convert images to WebP
- [ ] 7. Test with PageSpeed Insights
- [ ] 8. Monitor Core Web Vitals in Google Search Console

---

*Created: 2026-03-12*
