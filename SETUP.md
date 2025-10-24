# Development Setup Guide

This guide will help you set up the Holy Land Fee Calculator extension for local development.

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Chrome browser
- Exchange Rate API key (free from https://www.exchangerate-api.com/)

## Initial Setup

### 1. Clone and Install

```bash
# Clone the repository (if not already done)
git clone https://github.com/UnTypeBeats/thomann-holy-land-calculator.git
cd thomann-holy-land-calculator

# Install dependencies
npm install
```

### 2. Configure API Key

The extension uses an exchange rate API that requires a key. The key is stored securely in environment variables.

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your API key
# Get a free key from: https://www.exchangerate-api.com/
```

Your `.env` file should look like this:

```
VITE_EXCHANGE_RATE_API_KEY=your_actual_api_key_here
```

⚠️ **Important**: Never commit the `.env` file! It's already in `.gitignore`.

### 3. Build the Extension

```bash
# Development build (watches for changes)
npm run dev

# Production build (optimized)
npm run build
```

The built extension will be in the `dist/` directory.

### 4. Load in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist/` directory from this project
5. The extension should now appear in your extensions list

### 5. Test the Extension

1. Navigate to https://www.thomann.de
2. Browse to any product page
3. The extension should automatically calculate and display the Israeli price
4. For accurate calculations, proceed to checkout with items in your cart

## Development Workflow

### Running in Development Mode

```bash
# Start development server with hot reload
npm run dev
```

This will:
- Watch for file changes
- Rebuild automatically
- Update the extension in Chrome (you may need to refresh the page)

### Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm test:ui

# Run tests in watch mode
npm test -- --watch
```

### Linting and Formatting

```bash
# Check for code issues
npm run lint

# Auto-format code
npm run format
```

## Project Structure

```
Holy Land Fee Calculator/
├── src/
│   ├── background/      # Service worker (API calls, caching)
│   ├── content/         # Content scripts (DOM manipulation)
│   ├── shared/          # Shared types and calculation logic
│   ├── popup/           # Extension popup UI
│   └── utils/           # Utilities (logging, etc.)
├── dist/                # Built extension (generated)
├── tests/               # Test files and fixtures
├── docs/                # Documentation
├── .env                 # Local environment variables (DO NOT COMMIT)
├── .env.example         # Template for .env file
├── manifest.json        # Chrome extension manifest
└── vite.config.ts       # Build configuration
```

## Troubleshooting

### "API key not configured" error

**Problem**: You see an error about missing API key in the console.

**Solution**:
1. Ensure you have a `.env` file in the project root
2. Verify it contains `VITE_EXCHANGE_RATE_API_KEY=your_key`
3. Rebuild the extension: `npm run build`
4. Reload the extension in Chrome

### Extension not appearing on Thomann.de

**Problem**: The extension doesn't activate on product pages.

**Solution**:
1. Check that the extension is enabled in `chrome://extensions/`
2. Open DevTools (F12) and check the Console for errors
3. Verify you're on a Thomann.de page (not thomann.com or other domains)
4. Try hard-refreshing the page (Ctrl+Shift+R or Cmd+Shift+R)

### Build errors

**Problem**: `npm run build` fails.

**Solution**:
1. Delete `node_modules/` and `dist/`
2. Run `npm install` again
3. Ensure Node.js version is >= 18.0.0 (`node --version`)
4. Check for TypeScript errors: `npx tsc --noEmit`

### Prices not updating

**Problem**: Prices show but don't update or are incorrect.

**Solution**:
1. Check network tab in DevTools for failed API calls
2. Verify your API key is valid
3. Check exchange rate cache: `chrome://extensions/` → Extension details → "Inspect views: service worker"
4. Clear cache: Click the extension icon → Settings → Clear Cache

## Security Notes

- Never commit `.env` file
- Never commit the `dist/` directory to git (it's auto-generated)
- API key is injected at build time and not visible in source code
- For production builds, rotate the API key before publishing

## Getting Help

- Read `docs/CLAUDE.md` for comprehensive documentation
- Check existing issues on GitHub
- For bugs, create an issue with:
  - Steps to reproduce
  - Expected vs actual behavior
  - Console errors (if any)
  - Chrome version

## Next Steps

After setup:
1. Read `docs/CLAUDE.md` for architecture overview
2. Review `docs/guides/REFACTORING_PLAN.md` for roadmap
3. Check open issues for tasks to work on
4. Make changes and test on Thomann.de
5. Run tests before committing: `npm test`
6. Submit PR with description of changes

---

**Happy coding!** 🎸🎹🥁
