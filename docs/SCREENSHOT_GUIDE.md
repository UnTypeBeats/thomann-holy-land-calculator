# Chrome Web Store Screenshot Guide

Screenshots are critical for Chrome Web Store listing - they're the first thing users see!

## Required Screenshots

Chrome Web Store requires **at least 1 screenshot**, but **3-5 is recommended** for better conversion.

### Size Requirements
- **1280x800** pixels (recommended)
- OR **640x400** pixels (minimum)
- Format: PNG or JPEG
- Max file size: 1MB each

## Screenshot Plan

### Screenshot 1: Order Summary Calculator (PRIMARY)
**What to show**: The main feature - accurate calculation at checkout

**Elements to capture**:
- Thomann checkout page with Israeli price overlay
- Green summary box showing total in ₪ and EUR
- Individual item fees displayed
- Clear, real-world example

**How to capture**:
1. Go to Thomann.de checkout with test items
2. Ensure extension is active (prices showing)
3. Use Chrome DevTools to set viewport to 1280x800:
   ```javascript
   // In DevTools Console
   window.resizeTo(1280, 800)
   ```
4. Take screenshot (Cmd+Shift+4 on Mac, Win+Shift+S on Windows)
5. Crop to exactly 1280x800

**Annotations** (optional but recommended):
- Arrow pointing to Israeli price calculation
- Label: "See real costs before you buy"
- Highlight the key value proposition

### Screenshot 2: Product Page View
**What to show**: Quick estimates on product pages

**Elements to capture**:
- Individual product page on Thomann.de
- Extension showing estimated Israeli price
- Original price vs. true cost comparison

**How to capture**:
1. Navigate to any Thomann product page
2. Ensure extension displays price
3. Capture full browser window at 1280x800
4. Highlight the price comparison

**Annotations**:
- Circle or box around the Israeli price
- Label: "Instant price estimates while browsing"

### Screenshot 3: Fee Breakdown Detail
**What to show**: Transparency - what you're paying for

**Elements to capture**:
- Detailed breakdown of fees
- Shipping, customs, VAT itemized
- Tooltip or expanded view (if available)

**How to capture**:
1. Use DevTools to zoom in on fee details
2. Show the calculation breakdown clearly
3. Make numbers easy to read

**Annotations**:
- Labels for each fee component
- "Complete transparency" callout

### Screenshot 4: Before/After Comparison (OPTIONAL)
**What to show**: The problem this extension solves

**Layout**: Split screen
- Left: Thomann price only (€478)
- Right: True cost with extension (₪2,314 / €606)

**Impact**: Shows 26% markup clearly

### Screenshot 5: Extension Popup/Settings (OPTIONAL)
**What to show**: Additional features

**Elements**:
- Settings interface
- Currency toggle
- Clear cache option

## Screenshot Best Practices

### DO:
✅ Use real, production-quality data
✅ Show the extension in action (not just UI mockups)
✅ Include Thomann branding (shows authenticity)
✅ Make text large and readable
✅ Use high-resolution images
✅ Show actual value (real prices, not Lorem Ipsum)
✅ Crop consistently (all 1280x800)

### DON'T:
❌ Include personal information (email, address, order numbers)
❌ Show fake/dummy data
❌ Use blurry or low-resolution images
❌ Include browser UI (address bar, bookmarks) - just the page content
❌ Show error states or broken functionality
❌ Make annotations too cluttered

## Tools for Screenshots

### Capture Tools
- **Mac**: Cmd+Shift+4 (built-in)
- **Windows**: Win+Shift+S (Snipping Tool)
- **Chrome Extension**: Awesome Screenshot, Nimbus Screenshot
- **Professional**: CleanShot X (Mac, paid but excellent)

### Annotation Tools
- **Figma** (free) - Best for professional annotations
- **Canva** (free) - Easy drag-and-drop
- **Snagit** (paid) - Professional screenshot tool
- **Preview** (Mac) - Built-in, basic annotations
- **Paint 3D** (Windows) - Basic annotations

### Editing Workflow

1. **Capture** at 1280x800 or larger
2. **Crop** to exactly 1280x800 in an image editor
3. **Annotate** with arrows, boxes, or text (optional)
4. **Optimize** file size (<500KB each, <1MB total)
5. **Export** as PNG (better quality) or JPEG (smaller size)

## Creating Screenshots Without Test Account

If you don't want to use your personal Thomann account:

### Option 1: Use Test Items
1. Add cheap items to cart (€1-5 items)
2. Proceed to checkout (don't complete payment)
3. Take screenshots
4. Clear cart

### Option 2: Use Existing Test Screenshots
- Check `tests/` directory for existing screenshots
- Look for `tests/CleanShot*.png` files
- Verify no personal data visible
- Crop and annotate as needed

### Option 3: Mock the Interface
1. Use browser DevTools to edit DOM
2. Change product names and prices to generic values
3. Remove any personal identifiers
4. Take clean screenshots

## Example Screenshot Captions

When uploading to Chrome Web Store, you'll need captions:

1. **"See true Israeli costs at checkout"**
   - Calculates shipping, customs, and VAT automatically

2. **"Instant price estimates while browsing"**
   - Know the real cost before adding to cart

3. **"Complete fee breakdown"**
   - Transparent calculation of all charges

4. **"26% average markup revealed"**
   - Avoid checkout surprises with accurate pricing

5. **"Works on all Thomann.de pages"**
   - Seamlessly integrated into your shopping experience

## Screenshot Checklist

Before uploading to Chrome Web Store:

- [ ] Created 3-5 screenshots at 1280x800px
- [ ] All screenshots show extension actively working
- [ ] No personal information visible
- [ ] Text is large and readable
- [ ] Images are high quality (not pixelated)
- [ ] File sizes are <1MB each
- [ ] Saved as PNG (preferred) or JPEG
- [ ] Consistent style across all screenshots
- [ ] Annotations (if used) are clear and professional
- [ ] Screenshots showcase key features:
  - [ ] Order summary calculator
  - [ ] Product page estimates
  - [ ] Fee breakdown
- [ ] Tested viewing on different screen sizes
- [ ] Cropped exactly to 1280x800 (use image info to verify)

## Quick Screenshot Script

If you want to automate capturing at the right size:

```javascript
// Run in Chrome DevTools Console on Thomann.de
// This sets viewport to perfect screenshot size

// Set window size
window.resizeTo(1280, 800);

// Remove browser chrome for clean screenshots
document.body.requestFullscreen();

// Take screenshot now (Cmd+Shift+3 or Win+PrtScn)
// Then exit fullscreen (Esc)
```

## Storage Location

Save screenshots in:
```
screenshots/
├── screenshot-1-order-summary.png
├── screenshot-2-product-page.png
├── screenshot-3-fee-breakdown.png
└── README.md (this file can be moved here)
```

## After Creating Screenshots

1. Review screenshots on different monitors
2. Show to a friend - can they understand what the extension does?
3. Check against Chrome Web Store policies
4. Verify no personal data leaked
5. Compress if needed (but maintain quality)
6. Ready to upload!

---

**Screenshots + Icons = Ready for Chrome Web Store submission!**
