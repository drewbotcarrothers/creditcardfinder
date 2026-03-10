#!/usr/bin/env python3
"""
AI-Powered Credit Card Data Scraper
====================================
Dynamically extracts credit card information from product URLs using Google Gemini 3.0 Flash (FREE).

The first row of data is used as an EXAMPLE to show the AI what format you want for each field.
Fill in the first credit card completely, then run the script to populate the rest.

Example:
    Your Google Sheet has a "Features" column. You manually fill in the first card:
    Row 1: "5x points on dining, 3x on groceries, 1x on everything else"
    
    The script will use this as an example and extract features in the same format for all other cards.

Usage:
    python credit_card_scraper.py --csv-url "your-csv-url" --field "Features"
    python credit_card_scraper.py --csv-url "your-csv-url" --field "Insurance" --dry-run
"""

import argparse
import csv
import os
import sys
import time
import json
import re
from urllib.parse import urlparse

try:
    import requests
except ImportError:
    print("Error: 'requests' package not found. Install with: pip install requests --break-system-packages")
    sys.exit(1)

# Optional: BeautifulSoup for HTML cleaning
try:
    from bs4 import BeautifulSoup
    HAS_BS4 = True
except ImportError:
    HAS_BS4 = False
    print("Note: 'beautifulsoup4' not installed. HTML will be sent raw. Install with: pip install beautifulsoup4 --break-system-packages")


# =============================================================================
# Gemini 3.0 Flash - FREE AI Provider
# =============================================================================

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"


def extract_with_gemini(api_key: str, page_content: str, field_name: str, 
                        example_value: str, card_name: str) -> str:
    """Use Google Gemini 3.0 Flash to extract the specified field from page content."""
    
    prompt = f"""You are extracting credit card information from a webpage.

CARD NAME: {card_name}

FIELD TO EXTRACT: {field_name}

EXAMPLE FORMAT: Here is an example of how this field should be formatted (from another card):
"{example_value}"

IMPORTANT RULES:
1. Extract the "{field_name}" information for this card
2. Format your response EXACTLY like the example above (same style, structure, and level of detail)
3. Return ONLY the extracted value, nothing else
4. If the information cannot be found, return "NOT_FOUND"
5. Do not add explanations, prefixes, or extra formatting

PAGE CONTENT:
{page_content}

Extract the "{field_name}" field now (matching the example format):"""

    max_retries = 3
    base_delay = 5
    
    for attempt in range(max_retries + 1):
        response = requests.post(
            f"{GEMINI_API_URL}?key={api_key}",
            headers={"Content-Type": "application/json"},
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.1,
                    "maxOutputTokens": 1000
                }
            },
            timeout=60
        )
        
        if response.status_code == 429:
            if attempt < max_retries:
                sleep_time = base_delay * (2 ** attempt)
                print(f"    ⏳ Rate limited (429). Retrying in {sleep_time}s...")
                time.sleep(sleep_time)
                continue
            else:
                raise Exception(f"Gemini API error: 429 - Rate limit exceeded after {max_retries} retries")
        
        if response.status_code != 200:
            raise Exception(f"Gemini API error: {response.status_code} - {response.text}")
        
        result = response.json()
        text = result["candidates"][0]["content"]["parts"][0]["text"].strip()
        
        # Clean up result
        if text.lower().startswith(f"{field_name.lower()}:"):
            text = text[len(field_name)+1:].strip()
        
        return text if text.upper() != "NOT_FOUND" else ""
    return ""


# =============================================================================
# Helper Functions
# =============================================================================


def clean_html(html_content: str, max_chars: int = 50000) -> str:
    """Clean HTML to reduce token usage while preserving content."""
    if HAS_BS4:
        soup = BeautifulSoup(html_content, 'html.parser')
        
        for element in soup.find_all(['script', 'style', 'nav', 'footer', 'header', 'noscript', 'iframe']):
            element.decompose()
        
        text = soup.get_text(separator='\n', strip=True)
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r' {2,}', ' ', text)
    else:
        text = re.sub(r'<script[^>]*>.*?</script>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r'<style[^>]*>.*?</style>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r'<[^>]+>', ' ', text)
        text = re.sub(r'\s+', ' ', text)
    
    if len(text) > max_chars:
        text = text[:max_chars] + "\n\n[Content truncated...]"
    
    return text


def fetch_page(url: str, timeout: int = 30) -> str:
    """Fetch a webpage and return its content."""
    try:
        import cloudscraper
        scraper = cloudscraper.create_scraper(
            browser={
                'browser': 'chrome',
                'platform': 'darwin',
                'desktop': True
            }
        )
        response = scraper.get(url, timeout=timeout)
        response.raise_for_status()
        return response.text
    except Exception as e:
        # Fallback to curl if cloudscraper fails
        try:
            print(f"    ⚠ Cloudscraper failed ({str(e)[:50]}), retrying with curl...")
            cmd = [
                'curl', '-s', '-L',
                '-H', 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                '-H', 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                '-H', 'Accept-Language: en-US,en;q=0.9',
                '-H', 'Referer: https://www.google.com/',
                url
            ]
            import subprocess
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
            if result.returncode != 0:
                raise Exception(f"Curl error: {result.stderr}")
            return result.stdout
        except Exception as curl_e:
             raise curl_e


def load_csv(csv_source: str) -> list[dict]:
    """Load CSV from URL or local file."""
    if csv_source.startswith('http://') or csv_source.startswith('https://'):
        print(f"📥 Fetching CSV from URL...")
        response = requests.get(csv_source)
        response.raise_for_status()
        lines = response.text.splitlines()
        reader = csv.DictReader(lines)
    else:
        print(f"📥 Loading CSV from file: {csv_source}")
        with open(csv_source, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            return list(reader)
    
    return list(reader)


def save_csv(data: list[dict], output_path: str, fieldnames: list[str]):
    """Save data to CSV file."""
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)


# =============================================================================
# Main
# =============================================================================

def main():
    parser = argparse.ArgumentParser(
        description='AI-powered credit card data scraper using Google Gemini 3.0 Flash (FREE)',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Setup:
  1. Get free API key at: https://aistudio.google.com/app/apikey
  2. Set environment variable: export GEMINI_API_KEY="your-key"
  3. Fill in the FIRST ROW of your target column as an example format

How It Works:
  The script uses the first credit card's data as an EXAMPLE to show the AI
  what format you want. Fill in the first card completely, then the script
  will extract data in the same format for all other cards.

Example:
  Your "Features" column, first row: "5x dining, 3x groceries, 1x other"
  The AI will extract features in that same comma-separated format for all cards.

Examples:
  # Extract features (dry run first)
  python credit_card_scraper.py \\
    --csv-url "https://docs.google.com/.../pub?output=csv" \\
    --field "Features" \\
    --dry-run

  # Extract insurance coverage  
  python credit_card_scraper.py \\
    --csv-url "./cards.csv" \\
    --field "Insurance"
        """
    )
    
    parser.add_argument('--csv-url', required=True,
                        help='URL to Google Sheets CSV export or local CSV file path')
    parser.add_argument('--field', required=True,
                        help='Column name to populate')
    parser.add_argument('--output', default='updated_cards.csv',
                        help='Output CSV filename (default: updated_cards.csv)')
    parser.add_argument('--overwrite', action='store_true',
                        help='Overwrite existing values (default: only fill empty cells)')
    parser.add_argument('--dry-run', action='store_true',
                        help='Preview extraction for first 3 cards (after example row) without saving')
    parser.add_argument('--api-key', 
                        help='Gemini API key (or set GEMINI_API_KEY env var)')
    parser.add_argument('--url-column', default='Product_Link',
                        help='Column name containing product URLs (default: Product_Link)')
    parser.add_argument('--name-column', default='Credit_Card_Name',
                        help='Column name containing card names (default: Credit_Card_Name)')
    parser.add_argument('--delay', type=float, default=2.0,
                        help='Delay between requests in seconds (default: 2.0)')
    
    args = parser.parse_args()
    
    # Get API key
    api_key = args.api_key or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        print("❌ Error: Gemini API key required.")
        print("   Get free key at: https://aistudio.google.com/app/apikey")
        print("   Then: export GEMINI_API_KEY='your-key'")
        sys.exit(1)
    
    print(f"\n🤖 Using Google Gemini (Gemini 2.0 Flash)")
    
    # Load CSV
    try:
        data = load_csv(args.csv_url)
    except Exception as e:
        print(f"❌ Error loading CSV: {e}")
        sys.exit(1)
    
    if not data:
        print("❌ Error: CSV is empty")
        sys.exit(1)
    
    if len(data) < 2:
        print("❌ Error: CSV needs at least 2 rows (1 example + 1 to process)")
        sys.exit(1)
    
    # Validate columns
    fieldnames = list(data[0].keys())
    
    if args.field not in fieldnames:
        print(f"❌ Error: Field '{args.field}' not found in CSV")
        print(f"   Available columns: {', '.join(fieldnames)}")
        sys.exit(1)
    
    if args.url_column not in fieldnames:
        print(f"❌ Error: URL column '{args.url_column}' not found in CSV")
        sys.exit(1)
    
    if args.name_column not in fieldnames:
        print(f"⚠ Warning: Name column '{args.name_column}' not found")
        args.name_column = None
    
    # Get example from first row
    example_row = data[0]
    example_value = example_row.get(args.field, '').strip()
    example_card_name = example_row.get(args.name_column, 'Row 1') if args.name_column else 'Row 1'
    
    if not example_value:
        print(f"❌ Error: First row has no value for '{args.field}'")
        print(f"   Fill in the first card's {args.field} as an example format")
        sys.exit(1)
    
    # Print config
    print(f"\n{'='*60}")
    print(f"🔧 Credit Card Scraper")
    print(f"{'='*60}")
    print(f"📊 Field: {args.field}")
    print(f"📝 Example (from {example_card_name}):")
    print(f"   \"{example_value[:80]}{'...' if len(example_value) > 80 else ''}\"")
    print(f"📁 Output: {args.output}")
    print(f"🔄 Overwrite: {args.overwrite}")
    print(f"🧪 Dry run: {args.dry_run}")
    print(f"{'='*60}\n")
    
    # Process cards (skip first row - it's the example)
    cards_to_process = data[1:]  # Skip example row
    total = len(cards_to_process)
    
    if args.dry_run:
        cards_to_process = cards_to_process[:3]
    
    processed = 0
    skipped = 0
    errors = 0
    
    for i, row in enumerate(cards_to_process):
        card_name = row.get(args.name_column, f"Card #{i+2}") if args.name_column else f"Card #{i+2}"
        url = row.get(args.url_column, '').strip()
        current_value = row.get(args.field, '').strip()
        
        print(f"[{i+1}/{len(cards_to_process)}] {card_name}")
        
        if not url:
            print(f"  ⏭ Skipped: No URL")
            skipped += 1
            continue
        
        if current_value and not args.overwrite:
            print(f"  ⏭ Skipped: Already has value")
            skipped += 1
            continue
        
        try:
            # Fetch page
            print(f"  🌐 Fetching page...")
            html = fetch_page(url)
            
            # Clean HTML
            cleaned = clean_html(html)
            print(f"  🧹 Cleaned: {len(cleaned):,} chars")
            
            # Extract with Gemini using example
            print(f"  🤖 Extracting with Gemini 3.0...")
            extracted = extract_with_gemini(api_key, cleaned, args.field, example_value, card_name)
            
            if extracted:
                print(f"  ✅ Result: {extracted[:80]}{'...' if len(extracted) > 80 else ''}")
                row[args.field] = extracted
                processed += 1
            else:
                print(f"  ⚠ Not found")
                errors += 1
            
            time.sleep(args.delay)
            
        except Exception as e:
            print(f"  ❌ Error: {str(e)[:60]}")
            errors += 1
    
    # Summary
    print(f"\n{'='*60}")
    print(f"📊 Summary")
    print(f"{'='*60}")
    print(f"✅ Extracted: {processed}")
    print(f"⏭ Skipped: {skipped}")
    print(f"❌ Errors: {errors}")
    
    if args.dry_run:
        print(f"\n🧪 DRY RUN - No changes saved")
        print(f"   Remove --dry-run to process all {total} cards")
    else:
        save_csv(data, args.output, fieldnames)
        print(f"\n💾 Saved to: {args.output}")


if __name__ == '__main__':
    main()
