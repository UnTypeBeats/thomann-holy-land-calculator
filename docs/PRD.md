# Product Requirements Document (PRD)
## Thomann Price Calculator - Chrome Extension MVP

---

## 1. Executive Summary

### Product Vision
A Chrome extension that provides Israeli musicians and music enthusiasts with transparent, real-time pricing for Thomann.de products, including all import fees, customs, and shipping costs ("Holy Land Fee"), enabling informed purchasing decisions.

### Current Status (2025-10-24)
**✅ Order Summary Feature - WORKING!**
- Runs on Thomann checkout/order summary pages
- Uses REAL shipping costs from actual orders (major accuracy improvement)
- Displays Israeli prices for each item including all fees
- Successfully tested with 5-item order

### Success Metrics
- **Accuracy**: Price calculations within 10-20% of actual final cost (ACHIEVED with real shipping data)
- **Performance**: Price replacement completed within 1s of page load (ACHIEVED)
- **Adoption**: 100+ active users within first month (PENDING - not yet published)
- **User Satisfaction**: 4+ star rating, <5% error reports (PENDING)

---

## 2. Product Overview

### What is the App?
A lightweight Chrome extension that:
1. Detects product pages on Thomann.de
2. Calculates total landed cost in both EUR and ILS (shipping + customs + VAT)
3. Replaces or augments displayed prices with real costs
4. Provides breakdown tooltip showing fee components
5. Supports both EUR and ILS currency displays on Thomann.de

### Target Audience
- **Primary**: Israeli musicians shopping on Thomann.de
- **Secondary**: Music stores, professional musicians making bulk purchases
- **User Persona**: 
  - Age: 25-50
  - Tech-savvy but not developers
  - Makes 2-5 purchases/year from Thomann
  - Frustrated by unexpected costs at delivery

---

## 3. Core Features & Use Cases

### 3.1 Price Calculation Engine
**User Story**: As a shopper, I want to see the real final price immediately so I can budget accurately.

**Requirements**:
- ✅ Calculate Israeli customs duty (based on product category)
- ✅ Add shipping costs (weight/size-based estimation)
- ✅ Include Israeli VAT (17%)
- ✅ Handle both EUR and ILS displays
- ✅ Show calculation breakdown on hover/click
- 🆕 Support product bundles and accessories
- 🆕 Account for free shipping thresholds

**Data Sources**:
```
Israeli Government Sources:
- Israel Tax Authority: https://taxes.gov.il
- Customs duty rates: https://www.gov.il/he/departments/customs
- Current VAT rate: 17% (as of 2024)

Shipping Data:
- Historical purchase Excel data
- Thomann shipping calculator (reverse engineer)
- Weight/dimension estimates from product specs
```

### 3.2 Visual Price Replacement
**User Story**: As a user, I want prices updated seamlessly without breaking the site experience.

**Requirements**:
- Replace original prices while maintaining site layout
- Visual indicator (icon/badge) showing "real price"
- Toggle between original/calculated price
- Highlight savings opportunities (e.g., "Add €X to save on shipping")
- Preserve both EUR and ILS prices with calculations for each

### 3.3 Breakdown & Transparency
**User Story**: As a cautious buyer, I want to understand how the price was calculated.

**Requirements**:
- Tooltip/modal showing:
  - Original product price
  - Shipping estimate (€X)
  - Customs duty (X%)
  - Israeli VAT (17%)
  - Total landed cost
  - Confidence level (High/Medium/Low)
- Link to calculation methodology
- "Report incorrect calculation" feedback button

---

## 4. Technical Architecture

### 4.1 Recommended Tech Stack

#### Option A: Vanilla JS + Modern Build (Recommended for MVP)
```
Pros:
✅ Lightweight (~50KB bundle)
✅ Fast execution (<100ms overhead)
✅ No framework overhead
✅ Easy to maintain for simple logic

Tech:
- TypeScript (type safety, better IDE support)
- Vite (fast builds, modern bundler)
- Chrome Extension Manifest V3
- Web Components (for UI elements)
- IndexedDB (caching fee data)
```

#### Option B: React + Plasmo Framework (Future scalability)
```
Pros:
✅ Component reusability
✅ Easier complex UI state management
✅ Plasmo handles extension boilerplate
✅ Hot module reloading in development

Cons:
❌ Larger bundle (~200KB+)
❌ Potential performance overhead
❌ Overkill for current MVP scope

Recommendation: Consider for v2.0 if UI complexity grows
```

### 4.2 Architecture Patterns

```
┌─────────────────────────────────────────────────┐
│         CHROME EXTENSION ARCHITECTURE           │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐      ┌──────────────┐       │
│  │   Content    │◄────►│   Background │       │
│  │   Script     │      │    Service   │       │
│  │ (DOM Manip.) │      │   Worker     │       │
│  └──────┬───────┘      └───────┬──────┘       │
│         │                      │               │
│         │                      │               │
│  ┌──────▼───────┐      ┌───────▼──────┐       │
│  │   Price      │      │  Fee Data    │       │
│  │  Replacer    │      │   Store      │       │
│  │   Module     │      │ (IndexedDB)  │       │
│  └──────────────┘      └──────────────┘       │
│                                                 │
│  ┌──────────────┐      ┌──────────────┐       │
│  │  Calculation │      │   Settings   │       │
│  │    Engine    │      │     UI       │       │
│  │   (Core)     │      │   (Popup)    │       │
│  └──────────────┘      └──────────────┘       │
│                                                 │
└─────────────────────────────────────────────────┘

External Data Sources:
┌─────────────────┐
│  Israeli Gov    │
│  APIs (cached)  │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Historical     │
│  Purchase Data  │
│  (Excel → JSON) │
└─────────────────┘
```

### 4.3 Key Technical Decisions

**Decision 1: Content Script vs Injected Script**
- ✅ **Use Content Script** (isolated, secure, Chrome API access)
- ❌ Avoid injected scripts (security risks, sandbox limitations)

**Decision 2: Price Calculation Location**
- ✅ **Background Service Worker** (offload heavy computation)
- Pass DOM data via messaging
- Cache results for 24 hours

**Decision 3: Data Storage**
```javascript
Storage Strategy:
- chrome.storage.sync: User settings (max 100KB)
- IndexedDB: Fee tables, historical data (unlimited)
- sessionStorage: Current session calculations
```

---

## 5. Data Strategy

### 5.1 Fee Data Sources & Refresh

```yaml
Data Sources:
  primary:
    - name: "Israel Tax Authority"
      url: "https://taxes.gov.il/customs"
      refresh: "monthly"
      method: "scraping + manual verification"
    
    - name: "Israeli Customs Portal"
      url: "https://www.gov.il/he/departments/customs"
      refresh: "quarterly"
      
  secondary:
    - name: "Historical Purchase Data"
      source: "Excel file → JSON conversion"
      usage: "ML training, validation"
      
  tertiary:
    - name: "Thomann Shipping Calculator"
      method: "API reverse engineering"
      fallback: "Weight-based estimation"
```

### 5.2 Excel Data Processing Pipeline

```javascript
// Convert historical purchase Excel to training data
Excel Columns Required:
- Product URL/ID
- Original Price (EUR)
- Product Weight (kg)
- Shipping Cost (actual)
- Customs Duty (actual)
- Total Paid (ILS)
- Purchase Date

Processing Steps:
1. Parse Excel → JSON
2. Extract patterns (price ranges, weight brackets)
3. Calculate average fees per category
4. Identify outliers
5. Generate ML training dataset
6. Store in extension's IndexedDB
```

**Action Item**: Create Python script to process Excel → JSON with validation

---

## 6. AI Integration Opportunities

### 6.1 MVP AI Features (Phase 1)

**Feature 1: Intelligent Shipping Estimation**
```
Problem: Shipping costs vary by weight, size, delivery speed
Solution: Train regression model on historical data

Tech Stack:
- TensorFlow.js (runs in browser, no backend needed)
- Input: [price, weight, dimensions, category]
- Output: Predicted shipping cost ± confidence interval

Benefits:
✅ More accurate than rule-based estimation
✅ Adapts to seasonal changes
✅ Runs locally (privacy-friendly)
```

**Feature 2: Price Alert Intelligence**
```
Problem: Users don't know when to buy
Solution: Analyze price history + predict best purchase timing

Features:
- "Price likely to drop in X days" notification
- "Historical low detected" badge
- "Add to watchlist" with smart alerts

Data Source:
- Scrape Thomann price history (via archive.org or local DB)
- User-contributed price points
```

### 6.2 Advanced AI Features (Phase 2)

**Feature 3: Natural Language Fee Explainer**
```
Problem: Users confused by customs/VAT calculations
Solution: GPT-powered chatbot in popup

Example:
User: "Why is customs 12% on this guitar?"
Bot: "Musical instruments in Israel are subject to 12% 
      customs duty under tariff code 9207.10. This is 
      lower than the standard 17% because instruments 
      are considered educational tools..."

Tech:
- OpenAI API (small model, <$0.001/query)
- RAG with Israeli customs documentation
- Cached responses for common questions
```

**Feature 4: Smart Product Recommendations**
```
Problem: Users might save by bundling purchases
Solution: Recommendation engine

Features:
- "Buy these 3 items together to save €X on shipping"
- "Similar item ships cheaper from Thomann UK"
- "Wait 2 days for free shipping event"

Tech:
- Collaborative filtering on user behavior
- Real-time shipping optimization algorithm
```

### 6.3 AI Implementation Roadmap

```
Phase 1 (MVP):
✅ Rule-based fee calculation
✅ Weight-based shipping estimation
⏱️ 2 weeks development

Phase 2 (Post-MVP):
🤖 TensorFlow.js shipping model
🤖 Historical price tracking
⏱️ 4 weeks development

Phase 3 (Advanced):
🚀 NLP fee explainer
🚀 Smart bundling recommendations
🚀 Predictive analytics dashboard
⏱️ 8 weeks development
```

---

## 7. POC Audit & Refactor Plan

### 7.1 Audit Checklist

```
Code Quality Assessment:
□ Review manifest.json (V2 or V3?)
□ Analyze performance bottlenecks (profiling needed)
□ Security audit (API keys, XSS vulnerabilities)
□ Check calculation accuracy vs. actual purchases
□ Test on multiple Thomann page types (product, cart, search)
□ Evaluate code modularity and testability

Keep if:
✅ Calculation logic is accurate
✅ DOM selectors work reliably
✅ No major security issues
✅ Core fee data structure is solid

Refactor if:
❌ Vanilla JS is unmaintainable (500+ lines)
❌ Performance issues (>1s price calculation)
❌ Hard-coded values (fees, rates)
❌ No error handling
❌ Manifest V2 (deprecated)
```

### 7.2 Refactor Strategy

**Recommended Approach**: **Incremental Refactor**

```
Week 1: Audit & Setup
- Run POC through Chrome DevTools profiler
- Document all calculation formulas
- Extract hard-coded values → config
- Set up TypeScript + Vite project
- Migrate to Manifest V3

Week 2: Core Refactor
- Modularize calculation engine
- Implement IndexedDB caching
- Add error handling & logging
- Create unit tests (Jest)

Week 3: UI Enhancement
- Design calculation breakdown tooltip
- Add settings page
- Implement EUR/ILS toggle
- Improve visual indicators

Week 4: Testing & Polish
- Cross-browser testing (Chrome, Edge, Brave)
- Performance optimization
- User acceptance testing
- Documentation
```

### 7.3 Code Migration Pattern

```typescript
// OLD (Vanilla JS - POC)
function calculatePrice(price) {
  const shipping = price > 100 ? 30 : 50;
  const customs = price * 0.12;
  const vat = (price + shipping + customs) * 0.17;
  return price + shipping + customs + vat;
}

// NEW (TypeScript - Refactored)
interface ProductData {
  price: number;
  currency: 'EUR' | 'ILS';
  weight?: number;
  category: string;
}

interface FeeBreakdown {
  originalPrice: number;
  shipping: number;
  customs: number;
  vat: number;
  total: number;
  confidence: 'high' | 'medium' | 'low';
}

class PriceCalculator {
  constructor(
    private feeRepository: FeeRepository,
    private shippingEstimator: ShippingEstimator
  ) {}

  async calculate(product: ProductData): Promise<FeeBreakdown> {
    const shipping = await this.shippingEstimator.estimate(product);
    const customsRate = await this.feeRepository.getCustomsRate(product.category);
    
    const customs = product.price * customsRate;
    const subtotal = product.price + shipping + customs;
    const vat = subtotal * 0.17;
    
    return {
      originalPrice: product.price,
      shipping,
      customs,
      vat,
      total: subtotal + vat,
      confidence: this.calculateConfidence(product)
    };
  }
}
```

---

## 8. User Experience Flow

### 8.1 Installation & Onboarding

```
Step 1: Install from Chrome Web Store
Step 2: Welcome popup appears
  → "Calculate real Thomann prices including Israeli fees"
  → "Grant permission to access thomann.de"
  
Step 3: First-time setup
  → Select currency preference (EUR/ILS/Both)
  → Optional: Import purchase history
  → "You're ready! Visit Thomann.de to see real prices"

Step 4: First product page visit
  → Highlight price change with animation
  → Show "Click for breakdown" tooltip
  → Offer quick tutorial (3 slides)
```

### 8.2 Core User Journey

```
User visits Thomann.de product page
            ↓
Extension detects page load
            ↓
Content script extracts:
- Product price
- Weight (if available)
- Category
            ↓
Background worker calculates fees
            ↓
Content script replaces price with:
  "€499 → ₪2,450 (incl. all fees)"
            ↓
User hovers over price
            ↓
Tooltip shows breakdown:
┌─────────────────────────┐
│ Original: €499          │
│ Shipping: €45           │
│ Customs:  €59.88 (12%)  │
│ VAT:      €102.66 (17%) │
│ ─────────────────────   │
│ Total:    ₪2,450        │
│ Confidence: High ✓      │
│                         │
│ [View Details] [Report] │
└─────────────────────────┘
```

### 8.3 Edge Cases & Error Handling

```
Scenario 1: Price not found
→ Show "Unable to calculate" badge
→ Offer manual input form

Scenario 2: Category unknown
→ Use conservative estimate
→ Label as "Estimated" with lower confidence

Scenario 3: Thomann layout changes
→ Graceful degradation (no price replacement)
→ Log error to backend for developer review
→ Show notification: "Extension needs update"

Scenario 4: EUR/ILS both displayed