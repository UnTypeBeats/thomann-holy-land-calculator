#!/usr/bin/env python3
"""
Convert thomann-purchases-history.xlsx to JSON format for extension consumption.

Outputs:
- src/data/historical-orders.json: Individual order data
- src/data/fee-statistics.json: Aggregate statistics for calculations
"""

import pandas as pd
import json
import re
from pathlib import Path
from datetime import datetime
import statistics

def parse_sheet_date(sheet_name):
    """Convert sheet name (DDMMYY format) to ISO date string"""
    try:
        if len(sheet_name) == 6:
            day = int(sheet_name[0:2])
            month = int(sheet_name[2:4])
            year = int('20' + sheet_name[4:6])
            return f"{year}-{month:02d}-{day:02d}"
        elif len(sheet_name) == 5:
            day = int(sheet_name[0:1])
            month = int(sheet_name[1:3])
            year = int('20' + sheet_name[3:5])
            return f"{year}-{month:02d}-{day:02d}"
        elif len(sheet_name) == 4:
            day = int(sheet_name[0:1])
            month = int(sheet_name[1:2])
            year = int('20' + sheet_name[2:4])
            return f"{year}-{month:02d}-{day:02d}"
        else:
            return None
    except (ValueError, IndexError):
        return None

def extract_order_summary(df, sheet_name):
    """Extract summary data from an order sheet"""
    summary = {
        'sheet_name': sheet_name,
        'total_eur': None,
        'shipping_eur': None,
        'customs_eur': None,
        'gross_total_eur': None,
        'gross_total_ils': None,
        'hlf_total_eur': None,
        'hlf_total_ils': None,
        'exchange_rate': None
    }

    # Look for summary rows in column 11 (Unnamed: 11)
    for idx, row in df.iterrows():
        try:
            label_col = 'Unnamed: 11'
            if label_col in df.columns and pd.notna(row.get(label_col)):
                label = str(row[label_col]).strip()

                if label == 'Total':
                    summary['total_eur'] = float(row.get('Unnamed: 12', 0)) if pd.notna(row.get('Unnamed: 12')) else None
                elif label == 'Shipping':
                    summary['shipping_eur'] = float(row.get('Unnamed: 12', 0)) if pd.notna(row.get('Unnamed: 12')) else None
                elif label == 'Customs':
                    summary['customs_eur'] = float(row.get('Unnamed: 12', 0)) if pd.notna(row.get('Unnamed: 12')) else None
                elif label == 'Gross Total':
                    summary['gross_total_eur'] = float(row.get('Unnamed: 13', 0)) if pd.notna(row.get('Unnamed: 13')) else None
                    summary['gross_total_ils'] = float(row.get('Unnamed: 14', 0)) if pd.notna(row.get('Unnamed: 14')) else None
                elif label == 'Holy Land Fee Total':
                    summary['hlf_total_eur'] = float(row.get('Unnamed: 13', 0)) if pd.notna(row.get('Unnamed: 13')) else None
                    summary['hlf_total_ils'] = float(row.get('Unnamed: 14', 0)) if pd.notna(row.get('Unnamed: 14')) else None
                elif label == 'Exchange Rate by Date':
                    summary['exchange_rate'] = float(row.get('Unnamed: 13', 0)) if pd.notna(row.get('Unnamed: 13')) else None
        except (ValueError, KeyError, TypeError):
            continue

    return summary

def extract_items(df):
    """Extract individual product items from order sheet"""
    items = []

    # Find rows with actual product data (before summary section)
    for idx, row in df.iterrows():
        try:
            # Check if this row has product data
            item_name = row.get('Unnamed: 0')
            if pd.notna(item_name) and str(item_name) != 'Item' and str(item_name).strip() != '':
                quantity = row.get('Unnamed: 1', 0)
                item_total = row.get('Arrived' if 'Arrived' in df.columns else 'Order', 0)  # Column name varies
                unit_price = row.get(df.columns[3], 0)  # 4th column

                # Only add if we have valid numeric data
                if pd.notna(quantity) and pd.notna(unit_price) and isinstance(unit_price, (int, float)) and unit_price > 0:
                    items.append({
                        'name': str(item_name),
                        'quantity': int(quantity) if pd.notna(quantity) else 0,
                        'item_total': float(item_total) if pd.notna(item_total) else 0,
                        'unit_price': float(unit_price)
                    })
        except (ValueError, KeyError, TypeError):
            continue

    return items

def calculate_statistics(orders):
    """Calculate aggregate statistics for fee estimation"""

    # Filter orders with complete data
    complete_orders = [o for o in orders if all([
        o['summary'].get('total_eur'),
        o['summary'].get('shipping_eur'),
        o['summary'].get('hlf_total_eur')
    ])]

    if not complete_orders:
        return {}

    # Extract values
    order_values = [o['summary']['total_eur'] for o in complete_orders]
    shipping_costs = [o['summary']['shipping_eur'] for o in complete_orders]
    customs_fees = [o['summary']['customs_eur'] for o in complete_orders if o['summary'].get('customs_eur')]
    hlf_totals = [o['summary']['hlf_total_eur'] for o in complete_orders]
    exchange_rates = [o['summary']['exchange_rate'] for o in complete_orders if o['summary'].get('exchange_rate')]

    # Calculate HLF percentages
    hlf_percentages = [
        (hlf / order_val) * 100
        for hlf, order_val in zip(hlf_totals, order_values)
        if order_val > 0 and hlf > 0
    ]

    def safe_percentile(data, percentile):
        """Calculate percentile safely"""
        if not data:
            return 0
        sorted_data = sorted(data)
        index = int(len(sorted_data) * (percentile / 100))
        return sorted_data[min(index, len(sorted_data) - 1)]

    stats = {
        'meta': {
            'total_orders': len(complete_orders),
            'date_range': {
                'earliest': min(o['date'] for o in complete_orders),
                'latest': max(o['date'] for o in complete_orders)
            },
            'generated_at': datetime.now().isoformat()
        },
        'order_value': {
            'mean': statistics.mean(order_values),
            'median': statistics.median(order_values),
            'std': statistics.stdev(order_values) if len(order_values) > 1 else 0,
            'min': min(order_values),
            'max': max(order_values)
        },
        'shipping': {
            'mean': statistics.mean(shipping_costs),
            'median': statistics.median(shipping_costs),
            'min': min(shipping_costs),
            'max': max(shipping_costs),
            'percentile_25': safe_percentile(shipping_costs, 25),
            'percentile_75': safe_percentile(shipping_costs, 75),
            'percentile_90': safe_percentile(shipping_costs, 90)
        },
        'customs': {
            'mean': statistics.mean(customs_fees) if customs_fees else 0,
            'median': statistics.median(customs_fees) if customs_fees else 0,
            'min': min(customs_fees) if customs_fees else 0,
            'max': max(customs_fees) if customs_fees else 0
        },
        'hlf_total': {
            'mean': statistics.mean(hlf_totals),
            'median': statistics.median(hlf_totals),
            'min': min(hlf_totals),
            'max': max(hlf_totals)
        },
        'hlf_percentage': {
            'mean': statistics.mean(hlf_percentages),
            'median': statistics.median(hlf_percentages),
            'percentile_75': safe_percentile(hlf_percentages, 75),
            'percentile_90': safe_percentile(hlf_percentages, 90),
            'min': min(hlf_percentages),
            'max': max(hlf_percentages)
        },
        'exchange_rate': {
            'mean': statistics.mean(exchange_rates) if exchange_rates else 0,
            'median': statistics.median(exchange_rates) if exchange_rates else 0,
            'min': min(exchange_rates) if exchange_rates else 0,
            'max': max(exchange_rates) if exchange_rates else 0
        },
        'vat_rate': 0.18  # Current Israeli VAT rate (18%)
    }

    return stats

def main():
    """Main processing function"""
    print("=" * 70)
    print("Processing Thomann Purchase History")
    print("=" * 70)

    # Paths
    project_root = Path(__file__).parent.parent
    excel_file = project_root / 'thomann-purchases-history.xlsx'
    output_dir = project_root / 'src' / 'data'

    # Ensure output directory exists
    output_dir.mkdir(parents=True, exist_ok=True)

    # Load Excel file
    print(f"\n📂 Reading Excel file: {excel_file}")
    xl = pd.ExcelFile(excel_file)

    # Find order sheets (numeric names like 81025, 1925, etc.)
    order_sheets = [s for s in xl.sheet_names if re.match(r'^\d+$', s)]
    print(f"📊 Found {len(order_sheets)} order sheets")

    # Process each order
    processed_orders = []
    skipped = []

    for sheet in sorted(order_sheets):
        print(f"\n  Processing: {sheet}")

        try:
            df = pd.read_excel(excel_file, sheet_name=sheet)

            # Parse date
            date = parse_sheet_date(sheet)
            if not date:
                print(f"    ⚠️  Could not parse date from '{sheet}', using placeholder")
                date = f"20XX-XX-{sheet}"

            # Extract data
            summary = extract_order_summary(df, sheet)
            items = extract_items(df)

            order_data = {
                'order_id': sheet,
                'date': date,
                'summary': summary,
                'items': items,
                'item_count': len(items)
            }

            processed_orders.append(order_data)

            # Show summary
            total = summary.get('total_eur')
            hlf = summary.get('hlf_total_eur')
            if total and hlf:
                hlf_pct = (hlf / total) * 100
                print(f"    ✅ Total: €{total:.2f}, HLF: €{hlf:.2f} ({hlf_pct:.1f}%), Items: {len(items)}")
            else:
                print(f"    ⚠️  Incomplete data (may be missing summary rows)")
                skipped.append(sheet)

        except Exception as e:
            print(f"    ❌ Error processing sheet: {e}")
            skipped.append(sheet)
            continue

    # Calculate statistics
    print("\n" + "=" * 70)
    print("Calculating Statistics")
    print("=" * 70)

    stats = calculate_statistics(processed_orders)

    if stats:
        print(f"\n📊 Based on {stats['meta']['total_orders']} complete orders:")
        print(f"  Order Value (EUR):     Mean=€{stats['order_value']['mean']:.2f}, Median=€{stats['order_value']['median']:.2f}")
        print(f"  Shipping (EUR):        Mean=€{stats['shipping']['mean']:.2f}, Median=€{stats['shipping']['median']:.2f}")
        print(f"  Holy Land Fee (%):     Mean={stats['hlf_percentage']['mean']:.1f}%, Median={stats['hlf_percentage']['median']:.1f}%")
        print(f"  Conservative (75th):   {stats['hlf_percentage']['percentile_75']:.1f}%")

    # Save outputs
    print("\n" + "=" * 70)
    print("Saving Outputs")
    print("=" * 70)

    # Save historical orders
    orders_file = output_dir / 'historical-orders.json'
    with open(orders_file, 'w', encoding='utf-8') as f:
        json.dump(processed_orders, f, indent=2, ensure_ascii=False)
    print(f"\n✅ Saved historical orders: {orders_file}")
    print(f"   {len(processed_orders)} orders, {sum(o['item_count'] for o in processed_orders)} total items")

    # Save statistics
    stats_file = output_dir / 'fee-statistics.json'
    with open(stats_file, 'w', encoding='utf-8') as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)
    print(f"\n✅ Saved statistics: {stats_file}")

    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"✅ Successfully processed: {len(processed_orders)} orders")
    if skipped:
        print(f"⚠️  Skipped (incomplete data): {len(skipped)} orders: {', '.join(skipped)}")
    print(f"\n📁 Output files ready in: {output_dir}")
    print("   - historical-orders.json")
    print("   - fee-statistics.json")
    print("\n🎯 Next step: Use these files in TypeScript calculation engine")
    print("=" * 70)

if __name__ == '__main__':
    main()
