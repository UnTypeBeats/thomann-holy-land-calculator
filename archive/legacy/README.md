# Legacy Code Archive

⚠️ **DEPRECATED - DO NOT USE IN PRODUCTION**

This directory contains the original proof-of-concept (POC) code for the Holy Land Fee Calculator extension. These files are kept for reference only.

## Files

- `content.js` - Original content script (207 lines)
  - **Status**: DEPRECATED
  - **Security Issue**: Contains hardcoded API key (line 15)
  - **Replaced by**: `src/content/content-script.ts` and `src/content/order-summary.ts`

## Why This Code is Deprecated

1. **Security**: API key exposed in client-side code
2. **Accuracy**: Uses fixed estimates (40-50% variance)
3. **Maintainability**: Single file, no type safety
4. **Architecture**: No separation of concerns

## Modern Implementation

The current production code uses:
- TypeScript for type safety
- Environment variables for API keys
- Background service worker for secure API calls
- Real shipping costs from checkout page
- Better accuracy (10-20% variance)

See `docs/CLAUDE.md` for full documentation.

---

**Do not reference or copy code from this directory.**
**Use the modern TypeScript implementation in `src/` instead.**
