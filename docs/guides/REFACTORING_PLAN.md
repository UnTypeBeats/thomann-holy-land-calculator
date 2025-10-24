# Chrome Extension Refactoring Plan
## Thomann Holy Land Fee Calculator - POC → Production

**Created:** 2025-10-24
**Status:** Planning Phase
**Timeline:** 4 weeks (incremental refactor)

---

## Executive Summary

### Critical Issues Identified

**POC Audit Results:**
- ❌ **Calculation Accuracy**: Current formula significantly underestimates fees
  - POC assumes ~18% overhead
  - **Reality: 48-71% overhead** (median 61.1%)
- ❌ **Hard-coded values** are outdated (2018-era assumptions)
- ❌ **API key exposed** in client-side code (content.js:15)
- ❌ **No architecture**: All logic in single 207-line file
- ❌ **Shipping estimation**: Fixed fee vs reality (€50-€470 range)
- ❌ **No caching**: Fetches exchange rate on every page load

### Data-Driven Insights (18 orders, 2018-2025)

| Metric | POC Assumption | Actual Data | Impact |
|--------|---------------|-------------|--------|
| Average Order Value | €1,010.75 | €334.98 | ❌ 3x too high |
| Shipping Cost | 130 ILS (~€31) | €139 avg | ❌ 4.5x too low |
| Holy Land Fee % | ~25% | 61.1% median | ❌ 2.4x underestimate |
| Exchange Rate | Static API call | 3.52-4.15 (18% swing) | ⚠️ Needs real-time |
| Customs Fee | Fixed 120-150 ILS | €10-€985 (100x variance!) | ❌ Unpredictable |

**Conclusion**: Current POC provides misleading price estimates. Users may be shocked by actual costs.

---

## Refactoring Strategy

### Decision: Incremental Refactor ✅

**Why not rewrite from scratch?**
- ✅ DOM selectors work (Thomann layout detection is solid)
- ✅ Manifest V3 already implemented
- ✅ Core fee calculation formula exists (just needs better data)
- ❌ Only 207 lines - manageable to refactor incrementally

**Migration Path**: Vanilla JS → TypeScript + Vite + Modular Architecture

---

## 4-Week Implementation Plan

### Week 1: Foundation & Data Processing

#### Goals
- Set up modern build system
- Process historical data into usable format
- Migrate to TypeScript
- Fix security issues

#### Tasks

**Day 1-2: Project Setup**
```bash
# Initialize modern extension project
npm init -y
npm install -D typescript vite @types/chrome vite-plugin-web-extension
npm install -D eslint prettier
```

**Project Structure:**
```
Holy Land Fee Calculator/
├── src/
│   ├── background/
│   │   └── service-worker.ts          # Background service worker
│   ├── content/
│   │   ├── content-script.ts          # Main content script
│   │   ├── dom-manipulator.ts         # Price replacement logic
│   │   └── ui-components.ts           # Tooltip, badges
│   ├── shared/
│   │   ├── calculation-engine.ts      # Core fee calculator
│   │   ├── fee-repository.ts          # Fee data access
│   │   ├── shipping-estimator.ts      # Shipping cost ML
│   │   └── types.ts                   # TypeScript interfaces
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.ts
│   │   └── popup.css
│   ├── data/
│   │   ├── historical-orders.json     # Processed Excel data
│   │   └── fee-config.json            # Fee tables
│   └── utils/
│       ├── logger.ts
│       └── storage.ts
├── scripts/
│   └── process-excel-data.py          # Convert Excel → JSON
├── manifest.json
├── tsconfig.json
├── vite.config.ts
└── package.json
```

**Day 3: Data Processing Pipeline**

Create `scripts/process-excel-data.py`:

```python
"""
Convert thomann-purchases-history.xlsx to JSON format
for extension consumption.

Outputs:
- historical-orders.json: Training data for ML model
- fee-statistics.json: Aggregate statistics
"""

import pandas as pd
import json
from datetime import datetime

def process_historical_data():
    xl_file = 'thomann-purchases-history.xlsx'
    xl = pd.ExcelFile(xl_file)

    # Extract all order sheets
    order_sheets = [s for s in xl.sheet_names if s.isdigit()]

    processed_orders = []

    for sheet in order_sheets:
        df = pd.read_excel(xl_file, sheet_name=sheet)

        # Parse sheet name to date (DDMMYY format)
        day = int(sheet[0:2] if len(sheet) >= 4 else sheet[0])
        month = int(sheet[2:4] if len(sheet) >= 4 else 1)
        year = int('20' + sheet[4:6] if len(sheet) == 6 else '2018')
        order_date = f"{year}-{month:02d}-{day:02d}"

        # Extract summary data from the sheet
        order_summary = extract_order_summary(df, sheet, order_date)

        # Extract individual items
        items = extract_items(df)

        processed_orders.append({
            'order_id': sheet,
            'date': order_date,
            'summary': order_summary,
            'items': items
        })

    # Calculate aggregate statistics
    stats = calculate_statistics(processed_orders)

    # Save outputs
    with open('src/data/historical-orders.json', 'w') as f:
        json.dump(processed_orders, f, indent=2)

    with open('src/data/fee-statistics.json', 'w') as f:
        json.dump(stats, f, indent=2)

    print(f"✅ Processed {len(processed_orders)} orders")
    print(f"✅ Generated training dataset: {len(processed_orders)} samples")

def calculate_statistics(orders):
    """Calculate HLF prediction model parameters"""

    # Extract features
    order_values = [o['summary']['total_eur'] for o in orders]
    shipping_costs = [o['summary']['shipping_eur'] for o in orders]
    customs_fees = [o['summary']['customs_eur'] for o in orders]
    hlf_totals = [o['summary']['hlf_total_eur'] for o in orders]

    return {
        'order_value': {
            'mean': mean(order_values),
            'median': median(order_values),
            'std': std(order_values)
        },
        'shipping': {
            'mean': mean(shipping_costs),
            'median': median(shipping_costs),
            'min': min(shipping_costs),
            'max': max(shipping_costs),
            'percentile_25': percentile(shipping_costs, 25),
            'percentile_75': percentile(shipping_costs, 75)
        },
        'customs': {
            'mean': mean(customs_fees),
            'median': median(customs_fees),
            'correlation_with_order_value': correlation(order_values, customs_fees)
        },
        'hlf_percentage': {
            'mean': mean([h/o*100 for h,o in zip(hlf_totals, order_values)]),
            'median': median([h/o*100 for h,o in zip(hlf_totals, order_values)]),
            'conservative': percentile([h/o*100 for h,o in zip(hlf_totals, order_values)], 75)
        }
    }

# Run processing
if __name__ == '__main__':
    process_historical_data()
```

**Day 4-5: TypeScript Migration**

Migrate calculation logic to TypeScript with proper types:

```typescript
// src/shared/types.ts

export interface ProductData {
  price: number;
  currency: 'EUR' | 'ILS';
  weight?: number;
  category?: string;
  url: string;
}

export interface FeeBreakdown {
  originalPrice: number;
  shipping: {
    estimated: number;
    confidence: 'high' | 'medium' | 'low';
    range: { min: number; max: number };
  };
  customs: {
    estimated: number;
    confidence: 'high' | 'medium' | 'low';
  };
  vat: number; // 18% of (price + shipping + customs)
  total: number;
  totalILS: number;
  exchangeRate: number;
  calculatedAt: Date;
}

export interface HistoricalOrder {
  order_id: string;
  date: string;
  summary: {
    total_eur: number;
    shipping_eur: number;
    customs_eur: number;
    hlf_total_eur: number;
    exchange_rate: number;
  };
  items: ProductItem[];
}

export interface ProductItem {
  name: string;
  quantity: number;
  unitPrice: number;
  itemTotal: number;
  percentageOfOrder: number;
}
```

```typescript
// src/shared/calculation-engine.ts

import type { ProductData, FeeBreakdown, HistoricalOrder } from './types';
import { ShippingEstimator } from './shipping-estimator';
import { FeeRepository } from './fee-repository';

export class PriceCalculator {
  private shippingEstimator: ShippingEstimator;
  private feeRepository: FeeRepository;

  constructor() {
    this.shippingEstimator = new ShippingEstimator();
    this.feeRepository = new FeeRepository();
  }

  async calculate(product: ProductData): Promise<FeeBreakdown> {
    // Get historical statistics
    const stats = await this.feeRepository.getStatistics();

    // Estimate shipping (using historical data patterns)
    const shipping = this.shippingEstimator.estimate(product, stats);

    // Estimate customs (correlated with order value)
    const customs = this.estimateCustoms(product.price, stats);

    // Calculate VAT (18% on CIF value)
    const cifValue = product.price + shipping.estimated + customs.estimated;
    const vat = cifValue * 0.18;

    // Get current exchange rate
    const exchangeRate = await this.getExchangeRate();

    const total = cifValue + vat;

    return {
      originalPrice: product.price,
      shipping,
      customs,
      vat,
      total,
      totalILS: total * exchangeRate,
      exchangeRate,
      calculatedAt: new Date()
    };
  }

  private estimateCustoms(orderValue: number, stats: any) {
    // Use linear regression based on historical data
    // customs_fee = base_fee + (order_value * rate)

    const correlation = stats.customs.correlation_with_order_value;
    const avgCustoms = stats.customs.mean;
    const avgOrderValue = stats.order_value.mean;

    const estimatedFee = (orderValue / avgOrderValue) * avgCustoms;

    return {
      estimated: estimatedFee,
      confidence: orderValue > 200 && orderValue < 600 ? 'high' : 'medium'
    };
  }

  private async getExchangeRate(): Promise<number> {
    // Try cache first (24h TTL)
    const cached = await this.feeRepository.getCachedRate();
    if (cached && !this.isExpired(cached.timestamp)) {
      return cached.rate;
    }

    // Fetch from API (moved to background worker for security)
    const rate = await chrome.runtime.sendMessage({
      type: 'GET_EXCHANGE_RATE'
    });

    return rate;
  }
}
```

**Day 5: Security Fix**

Move API key to background service worker:

```typescript
// src/background/service-worker.ts

const EXCHANGE_RATE_API_KEY = 'YOUR_API_KEY_HERE';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_EXCHANGE_RATE') {
    getExchangeRate().then(sendResponse);
    return true; // Keep channel open for async response
  }
});

async function getExchangeRate(): Promise<number> {
  const cached = await chrome.storage.local.get('exchangeRate');

  if (cached.exchangeRate &&
      Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.exchangeRate.rate;
  }

  // Fetch from API
  const url = `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/latest/EUR`;
  const response = await fetch(url);
  const data = await response.json();

  const rate = data.conversion_rates['ILS'];

  // Cache result
  await chrome.storage.local.set({
    exchangeRate: {
      rate,
      timestamp: Date.now()
    }
  });

  return rate;
}
```

**Week 1 Deliverables:**
- ✅ TypeScript build system working
- ✅ Historical data processed to JSON
- ✅ API key secured in background worker
- ✅ Core calculation engine with proper types
- ✅ Data-driven fee estimation (not hard-coded)

---

### Week 2: Core Refactor & Improved Calculations

#### Goals
- Implement improved calculation engine using historical data
- Add IndexedDB caching
- Refactor DOM manipulation
- Comprehensive error handling

#### Tasks

**Day 6-7: Shipping Estimator**

```typescript
// src/shared/shipping-estimator.ts

export class ShippingEstimator {
  estimate(product: ProductData, stats: Statistics) {
    // Use historical shipping data to estimate

    const { order_value } = product;
    const { shipping } = stats;

    // Pattern observed: shipping varies significantly
    // Conservative approach: use 75th percentile
    const conservative = shipping.percentile_75;
    const optimistic = shipping.percentile_25;

    // Weight-based adjustment (if available)
    let adjustment = 1.0;
    if (product.weight) {
      // Heavier items → higher shipping
      if (product.weight > 10) adjustment = 1.5;
      else if (product.weight > 5) adjustment = 1.2;
    }

    const estimated = conservative * adjustment;

    return {
      estimated,
      confidence: product.weight ? 'high' : 'medium',
      range: {
        min: optimistic * adjustment,
        max: shipping.max * adjustment
      }
    };
  }
}
```

**Day 8: IndexedDB Caching**

```typescript
// src/utils/storage.ts

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class CacheManager {
  private dbName = 'HolyLandFeeCache';
  private db: IDBDatabase | null = null;

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('calculations')) {
          db.createObjectStore('calculations', { keyPath: 'productUrl' });
        }

        if (!db.objectStoreNames.contains('exchangeRates')) {
          db.createObjectStore('exchangeRates', { keyPath: 'currency' });
        }
      };
    });
  }

  async get<T>(storeName: string, key: string): Promise<T | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        const entry = request.result as CacheEntry<T>;

        if (!entry) {
          resolve(null);
          return;
        }

        // Check TTL
        if (Date.now() - entry.timestamp > entry.ttl) {
          this.delete(storeName, key); // Expired
          resolve(null);
        } else {
          resolve(entry.data);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async set<T>(storeName: string, key: string, data: T, ttl: number = 24 * 60 * 60 * 1000) {
    if (!this.db) await this.init();

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put({ ...entry, [store.keyPath as string]: key });

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}
```

**Day 9-10: Error Handling & Logging**

```typescript
// src/utils/logger.ts

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export class Logger {
  private static level: LogLevel = LogLevel.INFO;

  static error(message: string, error?: Error, context?: any) {
    console.error(`[HLF Error] ${message}`, error, context);

    // Send to background for potential analytics
    chrome.runtime.sendMessage({
      type: 'LOG_ERROR',
      payload: { message, error: error?.message, context }
    });
  }

  static warn(message: string, context?: any) {
    if (this.level <= LogLevel.WARN) {
      console.warn(`[HLF Warn] ${message}`, context);
    }
  }

  static info(message: string, context?: any) {
    if (this.level <= LogLevel.INFO) {
      console.info(`[HLF Info] ${message}`, context);
    }
  }

  static debug(message: string, context?: any) {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(`[HLF Debug] ${message}`, context);
    }
  }
}
```

**Week 2 Deliverables:**
- ✅ Data-driven shipping estimator with confidence intervals
- ✅ IndexedDB caching (calculations & exchange rates)
- ✅ Comprehensive error handling
- ✅ Logging system for debugging

---

### Week 3: UI Enhancement

#### Goals
- Implement breakdown tooltip
- Add settings page
- Improve visual design
- EUR/ILS toggle

#### Tasks

**Day 11-12: Breakdown Tooltip**

```typescript
// src/content/ui-components.ts

export class FeeBreakdownTooltip {
  private tooltip: HTMLElement | null = null;

  create(breakdown: FeeBreakdown, targetElement: HTMLElement) {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'hlf-tooltip';
    this.tooltip.innerHTML = `
      <div class="hlf-tooltip-content">
        <h3>Holy Land Fee Breakdown</h3>

        <div class="hlf-row">
          <span>Product Price:</span>
          <span>€${breakdown.originalPrice.toFixed(2)}</span>
        </div>

        <div class="hlf-row">
          <span>Shipping (est.):</span>
          <span>€${breakdown.shipping.estimated.toFixed(2)}</span>
          <span class="confidence ${breakdown.shipping.confidence}">
            ${breakdown.shipping.confidence}
          </span>
        </div>

        <div class="hlf-row">
          <span>Customs (est.):</span>
          <span>€${breakdown.customs.estimated.toFixed(2)}</span>
        </div>

        <div class="hlf-row">
          <span>VAT (18%):</span>
          <span>€${breakdown.vat.toFixed(2)}</span>
        </div>

        <div class="hlf-divider"></div>

        <div class="hlf-row total">
          <span><strong>Total:</strong></span>
          <span><strong>€${breakdown.total.toFixed(2)}</strong></span>
        </div>

        <div class="hlf-row total">
          <span><strong>In ILS:</strong></span>
          <span><strong>₪${breakdown.totalILS.toFixed(0)}</strong></span>
        </div>

        <div class="hlf-info">
          <small>
            Exchange rate: ${breakdown.exchangeRate.toFixed(4)}<br>
            Based on ${this.getDataSourceInfo()} historical orders<br>
            <a href="#" class="report-link">Report incorrect calculation</a>
          </small>
        </div>
      </div>
    `;

    // Inject styles
    this.injectStyles();

    // Position tooltip
    this.position(targetElement);

    // Attach to DOM
    document.body.appendChild(this.tooltip);

    // Auto-hide on click outside
    this.setupAutoHide();
  }

  private injectStyles() {
    if (document.getElementById('hlf-tooltip-styles')) return;

    const style = document.createElement('style');
    style.id = 'hlf-tooltip-styles';
    style.textContent = `
      .hlf-tooltip {
        position: absolute;
        z-index: 10000;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        padding: 16px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        min-width: 300px;
      }

      .hlf-tooltip h3 {
        margin: 0 0 12px 0;
        font-size: 16px;
        color: #333;
      }

      .hlf-row {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
      }

      .hlf-row.total {
        font-size: 16px;
        color: #2e7d32;
      }

      .hlf-divider {
        border-top: 1px solid #eee;
        margin: 8px 0;
      }

      .confidence {
        font-size: 11px;
        padding: 2px 6px;
        border-radius: 4px;
        margin-left: 8px;
      }

      .confidence.high {
        background: #c8e6c9;
        color: #2e7d32;
      }

      .confidence.medium {
        background: #fff9c4;
        color: #f57c00;
      }

      .confidence.low {
        background: #ffcdd2;
        color: #c62828;
      }

      .hlf-info {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #eee;
        color: #666;
      }

      .report-link {
        color: #1976d2;
        text-decoration: none;
      }
    `;

    document.head.appendChild(style);
  }
}
```

**Day 13-14: Settings Page**

```html
<!-- src/popup/popup.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Holy Land Fee Calculator Settings</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="container">
    <h1>⚙️ Settings</h1>

    <div class="setting-group">
      <h2>Display Preferences</h2>

      <label>
        <input type="radio" name="currency" value="both" checked>
        Show both EUR and ILS
      </label>

      <label>
        <input type="radio" name="currency" value="ils">
        ILS only
      </label>

      <label>
        <input type="radio" name="currency" value="eur">
        EUR only
      </label>
    </div>

    <div class="setting-group">
      <h2>Calculation Method</h2>

      <label>
        <input type="radio" name="calculation" value="conservative" checked>
        Conservative (higher estimate, safer)
      </label>

      <label>
        <input type="radio" name="calculation" value="average">
        Average (historical mean)
      </label>

      <label>
        <input type="radio" name="calculation" value="optimistic">
        Optimistic (lower estimate)
      </label>
    </div>

    <div class="setting-group">
      <h2>Cache & Data</h2>

      <button id="clearCache">Clear Cached Calculations</button>
      <button id="refreshRates">Refresh Exchange Rates</button>

      <div class="info">
        <small>
          Last rate update: <span id="lastUpdate">-</span><br>
          Cached calculations: <span id="cacheCount">0</span>
        </small>
      </div>
    </div>

    <div class="setting-group">
      <h2>About</h2>
      <p>
        Version: 2.0.0<br>
        Based on <span id="orderCount">18</span> historical orders (2018-2025)<br>
        <a href="https://github.com/yourusername/hlf-calculator" target="_blank">
          Documentation & Source
        </a>
      </p>
    </div>
  </div>

  <script src="popup.js"></script>
</body>
</html>
```

**Week 3 Deliverables:**
- ✅ Interactive breakdown tooltip
- ✅ Settings page with preferences
- ✅ Visual improvements
- ✅ EUR/ILS display toggle

---

### Week 4: Testing, Polish & Documentation

#### Goals
- Comprehensive testing
- Performance optimization
- Create CLAUDE.md
- Prepare for Chrome Web Store

#### Tasks

**Day 15-16: Testing**

```typescript
// tests/calculation-engine.test.ts

import { describe, it, expect } from 'vitest';
import { PriceCalculator } from '../src/shared/calculation-engine';

describe('PriceCalculator', () => {
  it('should calculate fees for typical order (€300)', async () => {
    const calculator = new PriceCalculator();

    const result = await calculator.calculate({
      price: 300,
      currency: 'EUR',
      url: 'https://www.thomann.de/test'
    });

    // Based on historical data:
    // Median HLF = 61.1% of product price
    // Conservative shipping = €120-150

    expect(result.total).toBeGreaterThan(400); // At least €400 total
    expect(result.total).toBeLessThan(600); // Not more than €600
    expect(result.shipping.estimated).toBeGreaterThan(50);
    expect(result.vat).toBeCloseTo((300 + result.shipping.estimated + result.customs.estimated) * 0.18, 2);
  });

  it('should provide confidence levels', async () => {
    const calculator = new PriceCalculator();

    const result = await calculator.calculate({
      price: 350, // Within historical range
      currency: 'EUR',
      url: 'https://www.thomann.de/test'
    });

    expect(result.shipping.confidence).toBe('high');
  });

  it('should handle extreme values', async () => {
    const calculator = new PriceCalculator();

    // Very cheap item
    const cheap = await calculator.calculate({
      price: 20,
      currency: 'EUR',
      url: 'https://www.thomann.de/test'
    });

    expect(cheap.shipping.confidence).toBe('medium'); // Outside typical range

    // Very expensive item
    const expensive = await calculator.calculate({
      price: 2000,
      currency: 'EUR',
      url: 'https://www.thomann.de/test'
    });

    expect(expensive.shipping.confidence).toBe('medium');
  });
});
```

**Day 17: Performance Optimization**

```typescript
// Performance targets:
// - Price calculation: < 100ms
// - DOM manipulation: < 50ms
// - Extension overhead: < 10KB memory

// Optimizations:
1. Lazy load tooltip only on hover
2. Debounce price updates (if page has multiple products)
3. Use Web Workers for heavy calculations (if needed)
4. Minify bundle with Vite
5. Code splitting (popup vs content script)
```

**Day 18: Documentation**

Create comprehensive CLAUDE.md (see separate section)

**Day 19-20: Chrome Web Store Preparation**

```
Checklist:
□ Create promotional images (1280x800, 440x280)
□ Write store description
□ Privacy policy (if using analytics)
□ Screenshots of extension in action
□ Promotional video (optional)
□ Finalize manifest.json metadata
□ Create release build
□ Test on fresh Chrome profile
□ Submit for review
```

**Week 4 Deliverables:**
- ✅ Test coverage >80%
- ✅ Performance benchmarks met
- ✅ Documentation complete
- ✅ Ready for production release

---

## Migration Checklist

### Pre-Migration
- [x] Audit POC code
- [x] Analyze historical purchase data
- [x] Identify calculation inaccuracies
- [ ] Backup current POC code

### Week 1
- [ ] Set up TypeScript + Vite build
- [ ] Create project structure
- [ ] Process Excel data to JSON
- [ ] Migrate calculation engine
- [ ] Move API key to background worker
- [ ] Test: Basic price calculation works

### Week 2
- [ ] Implement shipping estimator
- [ ] Implement customs estimator
- [ ] Add IndexedDB caching
- [ ] Error handling & logging
- [ ] Test: Calculations match historical data (±10%)

### Week 3
- [ ] Build breakdown tooltip
- [ ] Create settings page
- [ ] Implement EUR/ILS toggle
- [ ] Visual polish
- [ ] Test: UI works on Thomann.de

### Week 4
- [ ] Write unit tests
- [ ] Performance optimization
- [ ] Create CLAUDE.md
- [ ] Chrome Web Store assets
- [ ] Test: Full end-to-end flow
- [ ] Release v2.0.0

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Thomann changes website layout | HIGH | Use resilient selectors, add fallbacks |
| Exchange rate API down | MEDIUM | Cache last rate, provide manual override |
| Calculation still inaccurate | MEDIUM | Show confidence levels, allow user feedback |
| Build complexity scares contributors | LOW | Comprehensive README, simple npm scripts |
| Chrome Web Store rejection | MEDIUM | Follow all guidelines, privacy policy ready |

---

## Success Metrics

**Technical:**
- [ ] Calculation accuracy within 10% of actual fees (90% of cases)
- [ ] Extension bundle < 200KB
- [ ] Page load impact < 100ms
- [ ] Zero security vulnerabilities

**User:**
- [ ] 100+ active users in first month
- [ ] 4+ star rating
- [ ] <5% error reports
- [ ] Positive feedback on Reddit/forums

---

## Post-Launch Roadmap

### v2.1 (1 month post-launch)
- User feedback integration
- Bug fixes
- Improved accuracy based on real usage

### v2.2 (3 months)
- TensorFlow.js ML model for shipping
- Historical price tracking
- Price alerts

### v3.0 (6 months)
- Multi-retailer support (Sweetwater, B&H)
- NLP fee explainer (GPT integration)
- Smart bundling recommendations

---

## Appendix: Key Files to Migrate

### Keep (with refactor):
- `manifest.json` ✅ (update paths)
- Calculation formula logic (migrate to TypeScript)
- DOM selectors for price elements

### Archive:
- `Customs Calc.html` (standalone calculator - keep for reference)
- `content.js` (replace with modular TypeScript)
- Hard-coded fee values (replace with data-driven)

### New Files:
- `src/shared/calculation-engine.ts`
- `src/background/service-worker.ts`
- `src/data/historical-orders.json`
- `src/data/fee-statistics.json`
- `scripts/process-excel-data.py`
- `tests/*.test.ts`
- `CLAUDE.md`
- `README.md` (user-facing documentation)

---

## Questions for Clarification

1. **Historical data**: Should we include all 27 order sheets or just the 18 with complete data?
2. **Calculation method**: Conservative (75th percentile) vs Average (mean) as default?
3. **UI preference**: Inline price replacement vs badge/icon approach?
4. **Product categories**: Do you categorize products (guitars, cables, accessories) differently for customs?
5. **Privacy**: Should we collect anonymous usage stats to improve accuracy?

---

**Next Steps:**
1. Review this plan and approve/modify
2. Answer clarification questions
3. Begin Week 1 implementation
4. Set up weekly check-in schedule