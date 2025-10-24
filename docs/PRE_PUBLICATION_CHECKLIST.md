# Chrome Web Store Pre-Publication Checklist

Complete this checklist before submitting to Chrome Web Store.

## ✅ Security & Privacy

- [x] API key moved to environment variables (`.env` file, gitignored)
- [x] Legacy code with hardcoded API key moved to `archive/legacy/` with warning
- [x] No passwords or tokens in code
- [ ] Review all console.log statements (consider removing or adding production flag)
- [ ] Test files sanitized (see Test Data section below)

### Sensitive Files to Review

**BEFORE MAKING REPO PUBLIC** (if applicable):
- [ ] `tests/idea/thomann.de Checkout – Israel.mhtml` - Contains email address
  - Option 1: Delete and recreate from a test account
  - Option 2: Move to `.gitignore` and keep local only
  - Option 3: Sanitize by searching/replacing email addresses

- [ ] Screenshot files in `tests/` - May contain personal info
  - Review each screenshot for:
    - Personal names
    - Email addresses
    - Order numbers
    - Addresses
  - Redact sensitive info or use test data

- [ ] `data/thomann-purchases-history.xlsx` - Personal purchase history
  - Current status: Appears anonymized (no PII in structure)
  - Verify no personal names, addresses, or account numbers in data

## 📋 Required Assets

### Icons (Required)
- [ ] 16x16px icon
- [ ] 48x48px icon
- [ ] 128x128px icon

### Store Listing Images
- [ ] Main promo image (1280x800px) - Shows extension in action
- [ ] At least 1 screenshot (1280x800px or 640x400px)
- [ ] Recommended: 3-5 screenshots showing key features

### Promotional Images (Optional but Recommended)
- [ ] Small promo tile (440x280px)
- [ ] Marquee promo tile (1400x560px)

## 📄 Legal & Documentation

- [ ] Privacy policy document created
- [ ] Privacy policy hosted (GitHub Pages, own website, or included in extension)
- [ ] Terms of service (optional, but recommended)
- [ ] Contact/support email configured
- [ ] Store listing description written
- [ ] Detailed description (what it does, how to use it)
- [ ] Short description for search

## 🔧 Technical Preparation

### manifest.json Review
- [ ] Permissions justified and minimal
- [ ] `host_permissions` limited to necessary domains
- [ ] Version number appropriate (e.g., 1.0.0 for first public release)
- [ ] Description clear and accurate
- [ ] Homepage URL set (optional)

### Build & Test
- [ ] Production build succeeds (`npm run build`)
- [ ] Bundle size acceptable (<5MB total)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)

### Browser Testing
- [ ] Test in clean Chrome profile (no extensions, no cache)
- [ ] Test on multiple Thomann.de product pages
- [ ] Test checkout flow with multiple items
- [ ] Test with different order sizes (1 item, 5 items, 10+ items)
- [ ] Test edge cases:
  - [ ] Empty cart
  - [ ] Single item order
  - [ ] Free shipping (if applicable)
  - [ ] Discounts/coupons
  - [ ] Network failure (API down)
- [ ] Verify no console errors in production build
- [ ] Check memory usage (<10MB)
- [ ] Test performance (page load impact <100ms)

### Code Quality
- [ ] Remove or gate all `console.log` statements
  - Option: Add `if (process.env.NODE_ENV === 'development')` checks
- [ ] Remove commented-out code
- [ ] Remove TODOs or convert to GitHub issues
- [ ] Update version in `package.json` and `manifest.json`

## 📦 Package Preparation

- [ ] Create clean build: `rm -rf dist/ && npm run build`
- [ ] Verify dist/ contains:
  - [ ] manifest.json
  - [ ] All required assets (icons, etc.)
  - [ ] No source map files (unless intended)
  - [ ] No .env files
- [ ] Create ZIP file for upload:
  ```bash
  cd dist
  zip -r ../holy-land-calculator-v1.0.0.zip .
  cd ..
  ```
- [ ] Test ZIP by loading as unpacked extension

## 🚀 Store Listing

### Basic Info
- [ ] Extension name: "Holy Land Fee Calculator"
- [ ] Category: Shopping (or Developer Tools)
- [ ] Language: English
- [ ] Regions: Israel (primary), Worldwide (optional)

### Description Template

**Short description (132 chars max):**
```
Calculate true landed cost of Thomann.de products for Israeli customers, including shipping, customs, and VAT.
```

**Detailed description:**
```
Holy Land Fee Calculator helps Israeli musicians understand the true cost of musical equipment from Thomann.de before completing their purchase.

Key Features:
✓ Real-time price calculations including shipping, customs, and VAT
✓ Accurate estimates using actual Thomann shipping costs at checkout
✓ Displays prices in both ILS (₪) and EUR
✓ Works on product pages and checkout

How It Works:
1. Browse Thomann.de normally
2. Extension automatically calculates Israeli landed cost
3. See transparent breakdown of all fees
4. Make informed purchase decisions

Privacy: No data collection, all calculations performed locally.
```

### Screenshots Needed
1. Product page with Israeli price shown
2. Checkout page with full calculation breakdown
3. Price comparison (original vs. with fees)
4. (Optional) Extension popup/settings

## ✅ Final Checks

Before clicking "Submit for Review":

- [ ] Tested in incognito mode
- [ ] All screenshots are clear and representative
- [ ] Privacy policy URL works
- [ ] Support email is monitored
- [ ] Extension description has no typos
- [ ] Version number is correct
- [ ] ZIP file size is reasonable (<2MB ideally)
- [ ] Reviewed Chrome Web Store policies: https://developer.chrome.com/docs/webstore/program-policies/

## 📝 Post-Submission

After submission:

- [ ] Monitor review status
- [ ] Respond to any reviewer questions within 48 hours
- [ ] Prepare announcement (social media, blog, etc.)
- [ ] Set up user feedback channel (GitHub issues, email, etc.)
- [ ] Monitor error reports and user reviews
- [ ] Plan first maintenance update

## 🔄 For Future Updates

When releasing updates:

1. Increment version in `manifest.json` and `package.json`
2. Update changelog/release notes
3. Test all features again
4. Build and package new version
5. Submit update through Web Store dashboard
6. Monitor for issues after release

---

## Quick Reference

### Environment Setup
```bash
# Ensure .env exists with API key
cp .env.example .env
# Edit .env to add real API key

# Clean build
rm -rf dist/
npm run build

# Package for submission
cd dist && zip -r ../release.zip . && cd ..
```

### Common Issues

**"API key not configured"**
- Ensure `.env` file exists and contains `VITE_EXCHANGE_RATE_API_KEY`
- Rebuild after changing `.env`

**"Module not found" errors**
- Run `npm install`
- Delete `node_modules/` and reinstall if persists

**Extension not loading**
- Check manifest.json is valid
- Verify all file paths are correct
- Check browser console for errors

---

**Last Updated**: 2025-10-24
