#!/usr/bin/env python3
"""
Validate extension calculations against actual purchase data
"""

import pandas as pd
import json
from datetime import datetime

# Extension calculation parameters (from fee-statistics.json)
# Updated with all 17 complete orders
AVG_ORDER_VALUE = 723.24  # Mean order value from historical data
SHIPPING_MEDIAN = 120.0   # Median shipping (conservative uses 75th percentile)
SHIPPING_75TH = 170.0     # 75th percentile shipping
AVG_CUSTOMS = 153.15      # Mean customs from historical data
VAT_RATE = 0.18
EXCHANGE_RATE = 3.79      # Approximate current rate

def calculate_extension_estimate(product_price, order_mode='bulk', method='conservative'):
    """
    Simulate what the extension would calculate

    NEW FORMULA (proportional allocation + customs exemption):
    - Shipping is allocated proportionally by value: (item_price / avg_order_value) * base_shipping
    - Customs exemption: If CIF < €75, customs = 0 (Israeli customs rule)
    - This matches how shipping is actually distributed in multi-item orders
    """

    # Base shipping estimate (conservative = 75th percentile, average = median)
    base_shipping = SHIPPING_75TH if method == 'conservative' else SHIPPING_MEDIAN

    # Shipping allocation
    if order_mode == 'bulk':
        # Proportional allocation: reflects actual distribution in multi-item orders
        shipping = (product_price / AVG_ORDER_VALUE) * base_shipping
    else:
        # Single item: full shipping cost
        shipping = base_shipping

    # Preliminary CIF (for customs threshold check)
    preliminary_cif = product_price + shipping

    # CUSTOMS EXEMPTION: CIF < €75 = no customs
    CUSTOMS_EXEMPTION_THRESHOLD = 75.0
    if preliminary_cif < CUSTOMS_EXEMPTION_THRESHOLD:
        customs = 0  # Exempt
    else:
        # Proportional allocation above threshold
        customs = (product_price / AVG_ORDER_VALUE) * AVG_CUSTOMS

    # Final CIF and VAT
    cif = product_price + shipping + customs
    vat = cif * VAT_RATE
    total = cif + vat

    return {
        'shipping': shipping,
        'customs': customs,
        'vat': vat,
        'total': total,
        'cif': preliminary_cif,
        'exempt': preliminary_cif < CUSTOMS_EXEMPTION_THRESHOLD
    }

def analyze_orders():
    import os
    script_dir = os.path.dirname(os.path.abspath(__file__))
    xl_file = os.path.join(script_dir, '..', 'thomann-purchases-history.xlsx')
    xl = pd.ExcelFile(xl_file)

    # Get order sheets (numeric names)
    import re
    order_sheets = [s for s in xl.sheet_names if re.match(r'^\d+$', s)]

    print("=" * 100)
    print("VALIDATION: Extension Calculations vs Actual Purchases")
    print("=" * 100)
    print()

    results = []

    for sheet in sorted(order_sheets):
        df = pd.read_excel(xl_file, sheet_name=sheet)

        # Extract items (rows with product data)
        items = []
        order_summary = {}

        for idx, row in df.iterrows():
            # Skip header row
            if idx == 0:
                continue

            # Check if this is a product row
            item_name = row.iloc[0]  # First column is item name
            if pd.notna(item_name) and str(item_name).strip() != '':
                unit_price = row.iloc[3]  # 4th column is unit price
                hlf = row.iloc[5]  # 6th column is Holy Land Fee

                if pd.notna(unit_price) and isinstance(unit_price, (int, float)) and unit_price > 0:
                    if pd.notna(hlf) and isinstance(hlf, (int, float)) and hlf > 0:
                        items.append({
                            'name': str(item_name),
                            'unit_price': float(unit_price),
                            'hlf_actual': float(hlf)
                        })

            # Check for summary data (in columns 11-13)
            if len(row) > 11 and pd.notna(row.iloc[11]):
                label = str(row.iloc[11]).strip()
                if label == 'Shipping' and len(row) > 12:
                    order_summary['shipping'] = row.iloc[12]
                elif label == 'Customs' and len(row) > 12:
                    order_summary['customs'] = row.iloc[12]
                elif label == 'Holy Land Fee Total' and len(row) > 13:
                    order_summary['hlf_total'] = row.iloc[13]

        if len(items) > 0:
            print(f"\n{'='*100}")
            print(f"Order {sheet} - {len(items)} items")
            print(f"{'='*100}")
            print(f"{'Item':<40} {'Price':>8} {'Actual HLF':>12} {'Est. HLF':>12} {'Error':>10}")
            print(f"{'-'*100}")

            for item in items:
                # Calculate what extension would estimate
                estimate = calculate_extension_estimate(item['unit_price'], 'bulk')
                estimated_hlf = estimate['total'] - item['unit_price']
                actual_hlf = item['hlf_actual']
                error_pct = ((estimated_hlf / actual_hlf - 1) * 100) if actual_hlf > 0 else 0

                # Truncate item name if too long
                item_name = item['name'][:37] + '...' if len(item['name']) > 40 else item['name']

                print(f"{item_name:<40} €{item['unit_price']:>7.2f} €{actual_hlf:>11.2f} €{estimated_hlf:>11.2f} {error_pct:>9.1f}%")

                results.append({
                    'order': sheet,
                    'item': item['name'],
                    'price': item['unit_price'],
                    'actual_hlf': actual_hlf,
                    'estimated_hlf': estimated_hlf,
                    'error_pct': error_pct
                })

    # Summary statistics
    print(f"\n\n{'='*100}")
    print("OVERALL STATISTICS")
    print(f"{'='*100}")

    if results:
        errors = [r['error_pct'] for r in results]
        print(f"\nTotal items analyzed: {len(results)}")
        print(f"\nError Distribution:")
        print(f"  Average error:  {sum(errors)/len(errors):>6.1f}%")
        print(f"  Median error:   {sorted(errors)[len(errors)//2]:>6.1f}%")
        print(f"  Min error:      {min(errors):>6.1f}%")
        print(f"  Max error:      {max(errors):>6.1f}%")

        # Count by error range
        under_10 = len([e for e in errors if abs(e) < 10])
        under_25 = len([e for e in errors if abs(e) < 25])
        under_50 = len([e for e in errors if abs(e) < 50])

        print(f"\nAccuracy:")
        print(f"  Within ±10%: {under_10}/{len(results)} ({under_10/len(results)*100:.1f}%)")
        print(f"  Within ±25%: {under_25}/{len(results)} ({under_25/len(results)*100:.1f}%)")
        print(f"  Within ±50%: {under_50}/{len(results)} ({under_50/len(results)*100:.1f}%)")

        # Find outliers
        print(f"\nBiggest Overestimates:")
        top_over = sorted(results, key=lambda x: x['error_pct'], reverse=True)[:3]
        for r in top_over:
            print(f"  {r['item'][:50]}: +{r['error_pct']:.1f}%")

        print(f"\nBiggest Underestimates:")
        top_under = sorted(results, key=lambda x: x['error_pct'])[:3]
        for r in top_under:
            print(f"  {r['item'][:50]}: {r['error_pct']:.1f}%")

    print("\n" + "="*100)

if __name__ == '__main__':
    analyze_orders()
