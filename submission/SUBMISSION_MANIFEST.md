# Chrome Web Store Submission Package

## Package Information

**Version**: 2.1.0
**Package Name**: `holy-land-fee-calculator-v2.1.0.zip`
**Package Size**: 60 KB (compressed), 112 KB (uncompressed)
**File Count**: 34 files
**SHA256**: `f1ee93ceb57d4872e16070558c015d4f2aa4f6d13568774da2d04a3af31ec168`
**Build Date**: 2025-10-24
**Manifest Version**: 3

## Package Contents

### Core Files
- ✅ `manifest.json` - Extension manifest (v3)
- ✅ `icons/icon-16.png` - 16x16 icon
- ✅ `icons/icon-48.png` - 48x48 icon
- ✅ `icons/icon-128.png` - 128x128 icon

### Background Service Worker
- ✅ `src/background/service-worker.js` - Main background script
  - Exchange rate fetching
  - Fee calculation logic
  - Message handling

### Content Scripts
- ✅ `src/content/content-script.js` - Product page calculator
  - Runs on all Thomann.de pages (except checkout)
  - Quick price estimates

- ✅ `src/content/order-summary.js` - Order summary calculator
  - Runs on checkout pages only
  - Accurate calculations using real shipping costs
  - Height constraint fixes for full item visibility

### Popup UI
- ✅ `src/popup/popup.html` - Extension popup interface
- ✅ `src/popup/popup.js` - Popup logic
  - Settings management (Bulk vs Single mode)
  - Real-time settings synchronization

### Data Files
- ✅ `data/fee-statistics.json` - Historical fee data
  - Based on 17 real orders (2018-2025)
  - Statistical analysis for estimation

### Supporting Libraries
- ✅ `shared/calculation-engine.js` - Fee calculation logic
- ✅ `shared/shipping-estimator.js` - Shipping estimation
- ✅ `shared/fee-repository.js` - Historical data access
- ✅ `shared/types.js` - TypeScript type definitions
- ✅ `shared/constants.js` - Configuration constants
- ✅ `utils/logger.js` - Logging utility

## Permissions Required

### Storage
- **Purpose**: Save user settings (calculation method, order mode)
- **Scope**: `chrome.storage.sync` for cross-device settings

### Active Tab
- **Purpose**: Access current Thomann.de page content
- **Scope**: Only when user interacts with extension

### Host Permissions
- **Thomann.de** (`https://www.thomann.de/*`)
  - Parse product prices and order data
  - Inject Israeli price calculations

- **Exchange Rate API** (`https://v6.exchangerate-api.com/*`)
  - Fetch EUR → ILS exchange rates
  - 24-hour caching to minimize API calls

## Privacy & Security

✅ **No data collection** - Extension runs entirely client-side
✅ **No external servers** - Only calls public exchange rate API
✅ **No user tracking** - No analytics or telemetry
✅ **API key secured** - Environment variable system (not exposed in code)
✅ **Privacy policy** - Included in repository (`PRIVACY_POLICY.md`)
✅ **GDPR compliant** - No personal data processed

## Testing Checklist

- ✅ Tested on product pages (individual items)
- ✅ Tested on checkout pages (order summary)
- ✅ Verified 5-item order display (all items visible)
- ✅ Tested settings persistence (Bulk ↔ Single mode)
- ✅ Tested auto-reload on settings change
- ✅ Verified height constraint fixes
- ✅ Exchange rate caching working
- ✅ No console errors
- ✅ Icons loading correctly
- ✅ Manifest v3 compliance verified

## Build Information

**Build Command**: `npm run build`
**Build Tool**: Vite 5.4.21 + TypeScript
**Node Version**: 18.x+
**Source**: GitHub - [UnTypeBeats/thomann-holy-land-calculator](https://github.com/UnTypeBeats/thomann-holy-land-calculator)

**Source Files Excluded from Package**:
- TypeScript source files (`.ts`)
- Node modules
- Development dependencies
- Git repository
- Test files
- Documentation (except required privacy policy)

## Submission Notes

**Target Audience**: Israeli musicians and audio professionals shopping on Thomann.de

**Key Features**:
1. **Accurate price calculations** using real shipping costs from checkout
2. **Dual calculator approach**:
   - Quick estimates on product pages
   - Precise calculations on checkout page
3. **Real-time exchange rates** (EUR → ILS)
4. **Historical data-driven** estimates (17 real orders)
5. **User-configurable** settings (Bulk vs Single item mode)
6. **Auto-updating** calculations when settings change

**Browser Support**: Chrome/Chromium-based browsers (Edge, Brave, etc.)

**Chrome Web Store Category**: Shopping Tools / Price Comparison

## Known Limitations

- Customs estimates are approximate (exact customs vary by Israeli customs officer)
- Exchange rate reflects current rate, not future delivery rate
- Shipping estimates for product pages use historical averages
- Extension only works on Thomann.de (most popular music store for Israeli market)

## Support & Updates

**GitHub Issues**: https://github.com/UnTypeBeats/thomann-holy-land-calculator/issues
**Documentation**: See repository `docs/` folder
**Privacy Policy**: `PRIVACY_POLICY.md` in repository

## Version History

**v2.1.0** (2025-10-24) - Current Release
- ✅ Order summary calculator with real shipping costs
- ✅ Settings auto-reload functionality
- ✅ Height constraint fixes for full item visibility
- ✅ Dual calculator approach (product + checkout pages)
- ✅ API key security hardening
- ✅ Manifest v3 migration complete

**Previous Versions**:
- v2.0.0 - TypeScript refactor, modular architecture
- v1.0.0 - Original proof-of-concept

---

**Package Ready for Submission**: ✅ YES

**Next Steps**:
1. Upload `holy-land-fee-calculator-v2.1.0.zip` to Chrome Web Store Developer Dashboard
2. Fill in store listing details (description, screenshots, category)
3. Upload privacy policy link or text
4. Submit for review
5. Wait for Google review (typically 1-3 business days)

**Estimated Review Time**: 1-3 business days
**Expected Approval**: High confidence (no sensitive permissions, clear use case)
