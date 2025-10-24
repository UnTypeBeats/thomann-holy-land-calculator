# Holy Land Fee Calculator

A Chrome extension that calculates the true landed cost of products from Thomann.de for Israeli customers, including shipping, customs, and VAT fees.

## 🎯 Current Status

**✅ Working MVP** - Order Summary Feature (Oct 2025)
- Runs on Thomann checkout pages
- Uses **real shipping costs** from actual orders
- Displays Israeli prices (₪) with full fee breakdown
- Successfully tested with multi-item orders

## Why This Extension?

Israeli musicians face **48-71% markup** (median 61%) on top of Thomann prices due to:
- Shipping costs (€50-€470)
- Customs duties (0-12%, varies by product)
- Israeli VAT (18%)
- Exchange rate fluctuations

This extension provides transparent, real-time pricing to avoid checkout surprises.

## Features

### Order Summary Calculator (New!)
- **Real shipping costs**: Uses actual Thomann shipping prices from your order
- **Per-item breakdown**: See the true cost for each item
- **Accurate calculations**: 10-20% variance (vs 40-50% with estimates)
- **Automatic expansion**: Shows all items without manual clicking

### Product Page Calculator (Legacy)
- Quick estimates on product pages
- Basic fee calculations using historical averages
- Less accurate but instant feedback

## Installation

### For Development
```bash
# 1. Clone repository
git clone https://github.com/UnTypeBeats/thomann-holy-land-calculator.git
cd thomann-holy-land-calculator

# 2. Install dependencies
npm install

# 3. Build extension
npm run build

# 4. Load in Chrome
# - Open chrome://extensions/
# - Enable "Developer mode"
# - Click "Load unpacked"
# - Select the project directory
```

### For Users
Coming soon to Chrome Web Store!

## How It Works

1. **Shop on Thomann.de** as usual
2. **Proceed to checkout** summary page
3. **Extension activates** automatically
4. **See Israeli prices** (₪) for each item with full fee breakdown

## Technical Details

- **Framework**: TypeScript + Vite
- **Architecture**: Chrome Extension Manifest V3
- **Calculations**: Based on 18 real orders (2018-2025)
- **Accuracy**: Uses real shipping + estimated customs

## Documentation

- **[PRD](docs/PRD.md)** - Product Requirements Document
- **[CLAUDE.md](docs/CLAUDE.md)** - Developer guidance for AI assistants
- **[REFACTORING_PLAN.md](REFACTORING_PLAN.md)** - 4-week refactoring roadmap

## Development Commands

```bash
# Install dependencies
npm install

# Build extension
npm run build

# Run tests (coming soon)
npm test

# Lint code
npm run lint
```

## Project Structure

```
thomann-holy-land-calculator/
├── src/
│   ├── background/       # Service worker (exchange rates, caching)
│   ├── content/          # DOM manipulation, UI components
│   ├── shared/           # Calculation engine, types
│   ├── popup/            # Settings UI
│   └── utils/            # Logging, storage helpers
├── dist/                 # Built extension (generated)
├── data/                 # Historical purchase data
├── archive/              # Legacy POC files
├── docs/                 # Documentation
└── tests/                # Test files and screenshots
```

## Contributing

Contributions welcome! Please:
1. Read [CLAUDE.md](docs/CLAUDE.md) for development context
2. Follow the TypeScript style guide
3. Add tests for new features
4. Update documentation

## Roadmap

- [x] Order summary calculator with real shipping costs
- [x] Auto-expand collapsed items
- [ ] Error handling and edge cases
- [ ] UI polish to match Thomann design
- [ ] Chrome Web Store publication
- [ ] Firefox support
- [ ] Settings page for customization

## Known Limitations

- **Customs estimation**: Uses historical averages (real customs vary widely)
- **Product categories**: May not perfectly match Israeli customs classification
- **Exchange rates**: Uses current rate (delivery rate may differ)

## License

MIT License - See [LICENSE](LICENSE) for details

## Support

Found a bug or have a feature request?
[Open an issue](https://github.com/UnTypeBeats/thomann-holy-land-calculator/issues)

---

**Built with ❤️ for Israeli musicians**
