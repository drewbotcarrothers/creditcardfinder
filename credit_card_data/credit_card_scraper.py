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

# Optional: DrissionPage for advanced evasion
try:
    from DrissionPage import ChromiumPage, ChromiumOptions
    HAS_DRISSION = True
except ImportError:
    HAS_DRISSION = False
    print("Note: 'DrissionPage' not installed. Install with: pip install DrissionPage --break-system-packages")

BROWSER_INSTANCE = None
FORCE_BROWSER = False



# =============================================================================
# Gemini 3.0 Flash - FREE AI Provider
# =============================================================================

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"


def extract_with_gemini(api_key: str, page_content: str, field_name: str, 
                        example_value: str, card_name: str) -> str:
    """Use Google Gemini to extract the specified field from page content."""
    
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
        try:
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
        except Exception as e:
            if attempt == max_retries:
                raise e
            time.sleep(1)
            
    return ""

def extract_all_fields(api_key: str, page_content: str, fields_examples: dict, card_name: str) -> dict:
    """Use Google Gemini to extract ALL fields at once."""
    
    examples_str = json.dumps(fields_examples, indent=2)
    
    prompt = f"""You are extracting credit card information from a webpage.

CARD NAME: {card_name}

FIELDS TO EXTRACT (and their example formats from another card):
{examples_str}

IMPORTANT RULES:
1. Extract the information for EACH field listed above.
2. Format your response EXACTLY like the examples (same style, structure, and level of detail).
3. Return ONLY a valid JSON object where keys are the field names and values are the extracted strings.
4. If information for a field cannot be found, use "NOT_FOUND" as the value.
5. If a feature DEFINITIVELY does not exist (e.g. "Rewards" for a Low Rate card), return "N/A" instead of "NOT_FOUND".
6. Do not add markdown formatting (like ```json ... ```), just raw JSON.

PAGE CONTENT:
{page_content}

Extract all fields now as JSON:"""

    max_retries = 3
    base_delay = 5
    
    for attempt in range(max_retries + 1):
        try:
            response = requests.post(
                f"{GEMINI_API_URL}?key={api_key}",
                headers={"Content-Type": "application/json"},
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "temperature": 0.1,
                        "maxOutputTokens": 8192,
                        "responseMimeType": "application/json"
                    }
                },
                timeout=90
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
            
            # Remove markdown if present
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
                
            return json.loads(text)
            
        except Exception as e:
            if attempt == max_retries:
                print(f"    ❌ Error parsing/fetching: {e}")
                return {}
            time.sleep(1)
            
    return {}


# =============================================================================
# Helper Functions
# =============================================================================


def get_browser():
    """Get or create a global ChromiumPage instance."""
    global BROWSER_INSTANCE
    if HAS_DRISSION:
        try:
            if BROWSER_INSTANCE is None or not BROWSER_INSTANCE.process_id:
                # Browser configuration
                co = ChromiumOptions()
                # Use a specific user data folder to keep session/cookies if useful (optional)
                # co.set_user_data_path(r'./browser_data') 
                
                # Try to be stealthy
                co.set_argument('--no-first-run')
                co.set_argument('--no-default-browser-check')
                
                # Headless mode can be detectable, but let's try to keep it unobtrusive
                # If we want to see it, comment out the next line.
                # co.headless(True) 
                
                BROWSER_INSTANCE = ChromiumPage(addr_or_opts=co)
                
            return BROWSER_INSTANCE
        except Exception as e:
            print(f"    ⚠ Failed to launch DrissionPage browser: {e}")
            return None
    return None


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
    """Fetch a webpage using robust fallbacks: Cloudscraper -> DrissionPage -> Curl."""
    
    # 1. Try Cloudscraper (unless forced skip)
    if not FORCE_BROWSER:
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
            
            # Check for typical "blocked" responses
            text = response.text
            if "Access Denied" in text or "security check" in text or len(text) < 500:
                 raise Exception("Cloudscraper: Potential soft block or empty page")
                 
            return text
        except Exception as e:
            print(f"    ⚠ Cloudscraper failed ({str(e)[:50]}), trying fallbacks...")
    
    # 2. Try DrissionPage (Browser Automation - Best for evasion)
    if HAS_DRISSION:
        try:
            print(f"    🖥 Launching Browser (DrissionPage)...")
            page = get_browser()
            if page:
                page.get(url)
                # Wait slightly for JS to load
                time.sleep(2) 
                
                # Check for title/content
                if "Access Denied" in page.title or "Just a moment" in page.title:
                     # Sometimes waiting solves it (Cloudflare/Amex challenges)
                     print("    ⏳ Waiting for challenge to solve...")
                     time.sleep(6)
                
                html = page.html
                if len(html) > 1000:
                    return html
                else:
                    print("    ⚠ Browser returned empty/short content.")
        except Exception as browser_e:
            print(f"    ⚠ Browser automation failed: {browser_e}")

        # 3. Last Resort: Curl
        try:
            print(f"    Trying curl as last resort...")
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


def search_for_data(card_name: str, missing_fields: list, api_key: str, fields_examples: dict) -> dict:
    """Fallback: Search Google for missing fields."""
    print(f"    🔎 Search Fallback for: {', '.join(missing_fields)}")
    
    # 1. Perform Search with DrissionPage
    # We'll try to find a consolidated review or official page text from Google snippets
    search_query = f"{card_name} credit card Canada {' '.join(missing_fields)}"
    search_url = f"https://www.google.com/search?q={requests.utils.quote(search_query)}&hl=en"
    
    try:
        page = get_browser()
        if not page:
            return {}
            
        print(f"    🌐 Searching: {search_url[:60]}...")
        page.get(search_url)
        time.sleep(3)
        
        # Extract search results text (titles + snippets)
        # Verify we aren't blocked
        if "Sorry, we have detected unusual traffic" in page.html:
             print("    ⚠ Google Search Blocked.")
             return {}

        content = page.html
        cleaned_content = clean_html(content)
        
        # 2. Ask Gemini to find info in search results
        print(f"    🤖 Analyzing search results with Gemini...")
        
        # Filter examples to only relevant fields
        relevant_examples = {k: v for k, v in fields_examples.items() if k in missing_fields}
        
        return extract_all_fields(api_key, cleaned_content, relevant_examples, card_name)

    except Exception as e:
        print(f"    ❌ Search Fallback failed: {e}")
        return {}


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
    parser.add_argument('--field', required=False,
                        help='Column name to populate (optional, if omitted, all applicable columns are updated)')
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
    
    parser.add_argument('--limit', type=int,
                        help='Limit the number of cards to process')
    parser.add_argument('--target-id',
                        help='Process only the card with this ID (single ID)')
    parser.add_argument('--target-ids',
                        help='Process a list of card IDs (comma-separated, e.g. "1,3,5")')
    parser.add_argument('--start-id', type=int,
                        help='Process cards starting from this ID (inclusive)')
    parser.add_argument('--end-id', type=int,
                        help='Process cards up to this ID (inclusive)')
    parser.add_argument('--force-browser', action='store_true',
                        help='Force using DrissionPage (browser automation) instead of Cloudscraper')
    
    args = parser.parse_args()
    
    global FORCE_BROWSER
    FORCE_BROWSER = args.force_browser
    
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
    
    if args.url_column not in fieldnames:
        print(f"❌ Error: URL column '{args.url_column}' not found in CSV")
        sys.exit(1)
    
    if args.name_column not in fieldnames:
        print(f"⚠ Warning: Name column '{args.name_column}' not found")
        args.name_column = None

    # Determine mode: Single Field vs All Fields
    single_field_mode = bool(args.field)
    
    target_fields = []
    skipped_fields = ["ID", "Credit_Card_Name", "Image", "Image_File", "Issuer", "Category", args.url_column, "Apply_Link"]
    
    if single_field_mode:
        if args.field not in fieldnames:
            print(f"❌ Error: Field '{args.field}' not found in CSV")
            print(f"   Available columns: {', '.join(fieldnames)}")
            sys.exit(1)
        target_fields = [args.field]
    else:
        # Select all fields NOT in the skipped list
        target_fields = [f for f in fieldnames if f not in skipped_fields and f.strip()]
        if not target_fields:
            print("❌ Error: No fields left to extract after applying exclusions.")
            sys.exit(1)

    # Get example from first row
    example_row = data[0]
    example_card_name = example_row.get(args.name_column, 'Row 1') if args.name_column else 'Row 1'
    
    # Build examples dictionary
    fields_examples = {}
    missing_examples = []
    
    for field in target_fields:
        val = example_row.get(field, '').strip()
        if not val:
            missing_examples.append(field)
        fields_examples[field] = val
        
    if missing_examples:
        print(f"⚠ Warning: First row is missing example values for: {', '.join(missing_examples)}")
        print(f"   Skipping these columns for extraction.")
        target_fields = [f for f in target_fields if f not in missing_examples]
        
    if not target_fields:
        print("❌ Error: No valid target fields left (all missing examples or excluded).")
        sys.exit(1)
    
    # Print config
    print(f"\n{'='*60}")
    print(f"🔧 Credit Card Scraper")
    print(f"{'='*60}")
    if single_field_mode:
        print(f"📊 Field: {args.field}")
        print(f"📝 Example: \"{fields_examples[args.field][:50]}...\"")
    else:
        print(f"📊 Extracting {len(target_fields)} columns:")
        print(f"   {', '.join(target_fields)}")
        
    print(f"📁 Output: {args.output}")
    print(f"🔄 Overwrite: {args.overwrite}")
    print(f"🧪 Dry run: {args.dry_run}")
    print(f"{'='*60}\n")
    
    # Process cards (skip first row - it's the example)
    cards_to_process = data[1:]  # Skip example row
    total = len(cards_to_process)
    
    if args.dry_run:
        cards_to_process = cards_to_process[:3]
    elif args.target_id:
        cards_to_process = [c for c in cards_to_process if str(c.get('ID', '')).strip() == str(args.target_id).strip()]
        if not cards_to_process:
            print(f"❌ Error: Card with ID '{args.target_id}' not found.")
            sys.exit(1)
    elif args.target_ids:
        target_ids_list = [id_str.strip() for id_str in args.target_ids.split(',')]
        cards_to_process = [c for c in cards_to_process if str(c.get('ID', '')).strip() in target_ids_list]
        if not cards_to_process:
            print(f"❌ Error: No cards found matching IDs: {args.target_ids}")
            sys.exit(1)
    elif args.start_id or args.end_id:
        start = args.start_id or 0
        end = args.end_id or float('inf')
        
        filtered_cards = []
        for c in cards_to_process:
            try:
                card_id = int(str(c.get('ID', '0')).strip())
                if start <= card_id <= end:
                    filtered_cards.append(c)
            except ValueError:
                continue
        cards_to_process = filtered_cards
        
        if not cards_to_process:
            print(f"❌ Error: No cards found in range ID {start} to {end}.")
            sys.exit(1)
            
    elif args.limit:
        cards_to_process = cards_to_process[:args.limit]
    
    processed = 0
    skipped = 0
    errors = 0
    
    for i, row in enumerate(cards_to_process):
        card_name = row.get(args.name_column, f"Card #{i+2}") if args.name_column else f"Card #{i+2}"
        url = row.get(args.url_column, '').strip()
        
        print(f"[{i+1}/{len(cards_to_process)}] {card_name}")
        
        if not url:
            print(f"  ⏭ Skipped: No URL")
            skipped += 1
            continue
        
        # Check if we need to process this card (overwrite logic)
        needs_update = False
        if args.overwrite:
            needs_update = True
        else:
            # If ANY target field is empty, we process
            for field in target_fields:
                if not row.get(field, '').strip():
                    needs_update = True
                    break
        
        if not needs_update:
            print(f"  ⏭ Skipped: All target fields already have values")
            skipped += 1
            continue
        
        try:
            # Fetch page
            print(f"  🌐 Fetching page...")
            html = fetch_page(url)
            
            # Clean HTML
            cleaned = clean_html(html)
            print(f"  🧹 Cleaned: {len(cleaned):,} chars")
            
            # Extract
            print(f"  🤖 Extracting with Gemini 2.0 Flash...")
            
            if single_field_mode:
                # Old single field mode
                extracted = extract_with_gemini(api_key, cleaned, args.field, fields_examples[args.field], card_name)
                if extracted:
                    print(f"  ✅ Result: {extracted[:80]}...")
                    row[args.field] = extracted
                    processed += 1
                else:
                    print(f"  ⚠ Not found")
                    errors += 1
            else:
                # Multi-field mode
                results = extract_all_fields(api_key, cleaned, fields_examples, card_name)
                
                found_count = 0
                for field, value in results.items():
                    if field in target_fields and value and value != "NOT_FOUND":
                        if args.overwrite or not row.get(field, '').strip():
                            row[field] = value
                            found_count += 1
                
                if found_count > 0:
                    print(f"  ✅ Updated {found_count} fields")
                    processed += 1
                else:
                    print(f"  ⚠ No fields found")
                    errors += 1
            
            # --- FALLBACK MECHANISM ---
            # Check for NOT_FOUND fields that are in our target list
            still_missing = []
            for field in target_fields:
                val = row.get(field, '').strip()
                if not val or val == "NOT_FOUND":
                    still_missing.append(field)
            
            if still_missing and single_field_mode is False:
                fallback_results = search_for_data(card_name, still_missing, api_key, fields_examples)
                
                fb_found = 0
                for field, value in fallback_results.items():
                    if field in still_missing and value and value != "NOT_FOUND":
                        row[field] = value
                        fb_found += 1
                
                if fb_found > 0:
                     print(f"    🎉 Fallback recovered {fb_found} fields!")
                     # Adjust error count if we recovered everything? 
                     # For now, just count it.
            # --------------------------
            
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
