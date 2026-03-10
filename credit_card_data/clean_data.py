import csv
import unicodedata
import shutil
import os

INPUT_FILE = 'credit_card_data/updated_cards.csv'
OUTPUT_FILE = 'credit_card_data/updated_cards_cleaned.csv'

def clean_text(text):
    if not text:
        return text
    
    # 1. Replace smart quotes and common Windows-1252 chars
    replacements = {
        '\u2018': "'",  # Left single quote
        '\u2019': "'",  # Right single quote
        '\u201c': '"',  # Left double quote
        '\u201d': '"',  # Right double quote
        '\u2013': "-",  # En dash
        '\u2014': "-",  # Em dash
        '\u00a0': " ",  # Non-breaking space
        '®': '',        # Registered trademark
        '™': '',        # Trademark
        '©': '',        # Copyright
    }
    
    for char, replacement in replacements.items():
        text = text.replace(char, replacement)
        
    # 2. Normalize unicode (NFKD) to decompose characters
    # This turns "é" into "e" + combining accent
    text = unicodedata.normalize('NFKD', text)
    
    # 3. Encode to ASCII bytes, ignoring errors, then decode back
    text = text.encode('ascii', 'ignore').decode('ascii')
    
    return text.strip()

def main():
    print(f"🧹 Cleaning {INPUT_FILE} ...")
    
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        rows = list(reader)
        
    cleaned_rows = []
    changes_count = 0
    
    # specific columns to ignore
    SKIP_COLS = ['Image', 'Image_File', 'Product_Link', 'Apply_Link']
    
    for row in rows:
        cleaned_row = {}
        row_changed = False
        
        for key, value in row.items():
            if key in SKIP_COLS:
                cleaned_row[key] = value
            else:
                original = value
                cleaned = clean_text(value)
                cleaned_row[key] = cleaned
                
                if original != cleaned:
                    row_changed = True
                    
        cleaned_rows.append(cleaned_row)
        if row_changed:
            changes_count += 1
            
    # Save to new file
    with open(OUTPUT_FILE, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(cleaned_rows)
        
    print(f"✅ Cleaned data saved to {OUTPUT_FILE}")
    print(f"📊 Rows modified: {changes_count}/{len(rows)}")
    
    # Overwrite original?
    # shutil.move(OUTPUT_FILE, INPUT_FILE)
    # print(f"💾 Overwrote {INPUT_FILE}")

if __name__ == '__main__':
    main()
