# Privacy Policy for Holy Land Fee Calculator

**Last Updated**: October 24, 2025

## Overview

Holy Land Fee Calculator ("the Extension") is committed to protecting your privacy. This privacy policy explains what information we collect, how we use it, and your rights regarding your data.

## Information We DO NOT Collect

The Extension **does not collect, store, or transmit any personal information**. Specifically, we do not:

- ❌ Track your browsing history
- ❌ Collect personal identification information (name, email, address)
- ❌ Store your purchase history or shopping cart data
- ❌ Use cookies or tracking technologies
- ❌ Share any data with third parties
- ❌ Use analytics or telemetry
- ❌ Access your Thomann.de account credentials
- ❌ Store payment information
- ❌ Track your location

## Information We DO Process (Locally Only)

The Extension processes the following information **entirely on your device** and **never sends it to any server**:

### 1. Product Prices from Thomann.de
- **What**: Product prices displayed on Thomann.de pages
- **Why**: To calculate estimated Israeli landed costs
- **Where**: Processed in your browser only
- **Stored**: Not stored anywhere

### 2. Exchange Rates
- **What**: EUR to ILS exchange rates
- **Source**: Fetched from a third-party API (ExchangeRate-API.com)
- **Why**: To convert prices from EUR to ILS
- **Where**: Cached locally in your browser for 24 hours
- **Stored**: In Chrome's local storage (never sent to our servers)

### 3. Extension Settings
- **What**: Your preferences (e.g., currency display options)
- **Where**: Stored in Chrome's sync storage
- **Access**: Only you and the Extension can access this data

## Third-Party Services

The Extension uses one external service:

### ExchangeRate-API.com
- **Purpose**: Fetch current EUR to ILS exchange rates
- **Data Sent**: Only the currency pair (EUR/ILS) - no personal data
- **Frequency**: Once per 24 hours (cached locally)
- **Privacy Policy**: https://www.exchangerate-api.com/terms

This service receives **no information about you**, your browsing, or your purchases.

## Data Storage

All data processed by the Extension is stored locally on your device using Chrome's built-in storage:

- **chrome.storage.local**: Exchange rate cache (deleted after 24 hours)
- **chrome.storage.sync**: User preferences (synced across your Chrome devices if you're signed in)

You can clear this data at any time by:
1. Right-clicking the Extension icon
2. Selecting "Clear Cache" from the popup

Or by uninstalling the Extension.

## Permissions Explained

The Extension requests the following permissions:

### `storage`
- **Why**: To cache exchange rates locally (performance optimization)
- **Access**: Only the Extension can read this data

### `activeTab`
- **Why**: To read product prices from the active Thomann.de page
- **Scope**: Only works when you're on Thomann.de

### `host_permissions` for `https://www.thomann.de/*`
- **Why**: To modify the page and display calculated prices
- **Scope**: Only active on Thomann.de domains

### `host_permissions` for `https://v6.exchangerate-api.com/*`
- **Why**: To fetch exchange rates
- **Data Sent**: Only currency codes (EUR, ILS)

## Your Rights

Since we don't collect any personal data, there's no data to:
- Request access to
- Request deletion of
- Request correction of
- Request portability of

However, you have the right to:
- **Use the Extension anonymously**: No account or registration required
- **Uninstall anytime**: Removes all local data
- **Inspect the code**: The Extension is open source (link available in the Chrome Web Store listing)

## Children's Privacy

The Extension does not target children under 13 and does not knowingly collect any data from children. No registration or personal information is required to use the Extension.

## Changes to This Policy

We may update this Privacy Policy to reflect:
- Changes in our practices
- Legal requirements
- New features

Changes will be posted on this page with an updated "Last Updated" date. For significant changes, we'll provide notice in the Extension's release notes.

## Open Source

The Extension's source code is publicly available and can be audited for privacy and security compliance. This transparency ensures our privacy practices match our claims.

## Data Security

Since we don't collect or transmit personal data, there's minimal risk of data breaches. The only data processed (prices, exchange rates) is:
- Not personally identifiable
- Processed locally on your device
- Never transmitted to our servers (we don't have any servers!)

## Contact & Support

For questions, concerns, or privacy-related inquiries:

- **GitHub Issues**: [Create an issue](https://github.com/UnTypeBeats/thomann-holy-land-calculator/issues)
- **Email**: oleg@befeast.com

We'll respond to privacy inquiries within 7 business days.

## Compliance

This Extension complies with:
- **GDPR** (General Data Protection Regulation)
- **CCPA** (California Consumer Privacy Act)
- **Chrome Web Store Developer Program Policies**

Since we don't collect personal data, most data protection regulations don't apply, but we follow best practices for user privacy.

## Summary (TL;DR)

✅ **We don't collect any personal data**
✅ **Everything runs locally in your browser**
✅ **No tracking, no analytics, no servers**
✅ **Open source and auditable**
✅ **Exchange rates cached for 24h to save API calls**
✅ **You can clear all data by uninstalling**

---

**This privacy policy is effective as of October 24, 2025.**

If you have any questions or concerns, please don't hesitate to contact us.
