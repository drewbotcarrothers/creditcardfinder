import csv

def check_missing():
    missing_cards = []
    with open('updated_cards.csv', 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Check key fields. Adjust logic as needed.
            # We care about IDs 26-70 specifically, or all.
            # Let's check IDs 1-100 just to be safe.
            try:
                cid = int(row['ID'])
            except:
                continue
            
            # Fields we monitor for completeness
            # We exclude optional/image fields
            fields_to_check = [
                'Purchase_Interest_Rate', 'Cash_Advance_Interest_Rate', 
                'Rewards_Program', 'Welcome_Bonus', 
                'Features', 'Annual_Fee', 'Insurance'
            ]
            
            missing_in_this_card = []
            for field in fields_to_check:
                if not row.get(field, '').strip():
                    missing_in_this_card.append(field)
            
            # Filter out expected missing (e.g. Low Rate cards might not have Rewards)
            # But for now, let's just list everything to see the scope.
            if missing_in_this_card:
                missing_cards.append({
                    'id': cid,
                    'name': row['Credit_Card_Name'],
                    'missing': missing_in_this_card
                })

    print(f"Found {len(missing_cards)} cards with missing fields:")
    for card in missing_cards:
        print(f"ID {card['id']} ({card['name']}): Missing {len(card['missing'])} fields: {', '.join(card['missing'])}")

if __name__ == '__main__':
    check_missing()
