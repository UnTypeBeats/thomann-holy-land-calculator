/**
 * Application constants
 */

// Cache durations (milliseconds)
export const CACHE_DURATION = {
  EXCHANGE_RATE: 24 * 60 * 60 * 1000, // 24 hours
  CALCULATION: 7 * 24 * 60 * 60 * 1000, // 7 days
  STATISTICS: 30 * 24 * 60 * 60 * 1000, // 30 days
} as const;

// Israeli VAT rate
export const VAT_RATE = 0.18; // 18%

/**
 * CUSTOMS EXEMPTION THRESHOLD
 *
 * Israeli customs regulations provide an exemption for low-value items.
 * Current implementation: €75 threshold on CIF value (product + shipping)
 *
 * NOTE: The exact threshold rules are unclear from official sources:
 * - Could be based on product price alone (not CIF)
 * - Could be $75 USD (~€68) instead of €75 EUR
 * - May have changed over time
 *
 * Current setting is based on empirical validation against purchase history
 * (5.3% average error across 144 items)
 *
 * TODO: Research official Israeli customs rules for future refinement
 */
export const CUSTOMS_EXEMPTION_THRESHOLD_EUR = 75;

// Default settings
export const DEFAULT_SETTINGS = {
  currencyDisplay: 'both' as const,
  calculationMethod: 'conservative' as const,
  orderMode: 'bulk' as const, // Most users buy multiple items
  showTooltip: true,
  cacheEnabled: true,
};

// DOM Selectors for Thomann.de
export const SELECTORS = {
  PRICE_ELEMENT: '.price',
  PRICE_SECONDARY: '.price__secondary',
  PRICE_CONTAINER: '.product-price-box',
  PRODUCT_TITLE: 'h1[itemprop="name"]',
} as const;

// Exchange Rate API
export const API_ENDPOINTS = {
  EXCHANGE_RATE_BASE: 'https://v6.exchangerate-api.com/v6',
} as const;

// Confidence thresholds
export const CONFIDENCE_THRESHOLDS = {
  ORDER_VALUE: {
    HIGH_MIN: 200, // Orders between 200-600 EUR have high confidence
    HIGH_MAX: 600,
    MEDIUM_MIN: 100,
    MEDIUM_MAX: 1000,
  },
} as const;

// Extension metadata
export const EXTENSION_INFO = {
  NAME: 'Holy Land Fee Calculator',
  VERSION: '2.0.0',
  PREFIX: '[HLF]',
} as const;
