/**
 * Content Script - Runs on Thomann.de product pages
 * Extracts prices and displays calculated Holy Land Fees
 */

import type { ProductData, CalculateFeesRequest, CalculateFeesResponse } from '../shared/types';
import { SELECTORS } from '../shared/constants';
import { logger } from '../utils/logger';

logger.info('Holy Land Fee Calculator content script loaded');

// ============================================================================
// Price Extraction
// ============================================================================

function extractProductData(): ProductData | null {
  try {
    // Find price elements (Thomann shows EUR in secondary price for Israeli IPs)
    const priceSecondaryElement = document.querySelector(SELECTORS.PRICE_SECONDARY);

    if (!priceSecondaryElement) {
      logger.warn('Price element not found on page');
      return null;
    }

    // Extract EUR price from text like "1.290,00 €" or "499 €"
    const priceText = priceSecondaryElement.textContent?.trim() || '';
    const priceMatch = priceText.replace('.', '').replace(',', '.').match(/[\d.]+/);

    if (!priceMatch) {
      logger.warn('Could not parse price from element', { priceText });
      return null;
    }

    const price = parseFloat(priceMatch[0]);

    if (isNaN(price) || price <= 0) {
      logger.warn('Invalid price value', { price });
      return null;
    }

    // Extract product name (optional)
    const titleElement = document.querySelector(SELECTORS.PRODUCT_TITLE);
    const productName = titleElement?.textContent?.trim();

    const productData: ProductData = {
      price,
      currency: 'EUR',
      url: window.location.href,
      productName,
    };

    logger.debug('Product data extracted', productData);
    return productData;
  } catch (error) {
    logger.error('Failed to extract product data', error as Error);
    return null;
  }
}

// ============================================================================
// Fee Calculation
// ============================================================================

async function calculateAndDisplayFees(): Promise<void> {
  try {
    // Extract product data
    const product = extractProductData();

    if (!product) {
      logger.warn('No product data available, skipping calculation');
      return;
    }

    logger.info('Calculating fees for product', { price: product.price });

    // Request calculation from background worker
    const request: CalculateFeesRequest = {
      product,
      useCache: true,
    };

    const response: CalculateFeesResponse = await chrome.runtime.sendMessage({
      type: 'CALCULATE_FEES',
      payload: request,
    });

    if (!response.success || !response.breakdown) {
      logger.error('Calculation failed', undefined, { error: response.error });
      showError('Unable to calculate fees. Please try refreshing the page.');
      return;
    }

    // Display the result
    displayCalculatedPrice(response.breakdown);

    logger.info('Fees calculated and displayed', {
      original: response.breakdown.originalPrice,
      total: response.breakdown.total,
      totalILS: response.breakdown.totalILS,
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Failed to calculate and display fees', err);
    showError('An error occurred while calculating fees.');
  }
}

// ============================================================================
// DOM Manipulation (Basic - will be enhanced in Week 3)
// ============================================================================

function displayCalculatedPrice(breakdown: any): void {
  const priceElement = document.querySelector(SELECTORS.PRICE_ELEMENT);

  if (!priceElement) {
    logger.warn('Cannot display price - price element not found');
    return;
  }

  // For now, just add a simple indicator next to the price
  // Week 3 will implement the full price replacement and tooltip
  const indicator = document.createElement('div');
  indicator.id = 'hlf-indicator';
  indicator.style.cssText = `
    color: green;
    font-size: 1.1em;
    font-weight: bold;
    margin-top: 8px;
    padding: 8px;
    background: #e8f5e9;
    border-radius: 4px;
    border-left: 4px solid #4caf50;
  `;

  indicator.textContent = `✓ Real cost: ₪${Math.round(breakdown.totalILS)} (€${breakdown.total.toFixed(2)} incl. all fees)`;

  // Add click handler to show details
  indicator.style.cursor = 'pointer';
  indicator.title = 'Click for breakdown';
  indicator.addEventListener('click', () => {
    alert(`
Holy Land Fee Breakdown:

Product Price: €${breakdown.originalPrice.toFixed(2)}
Shipping (est.): €${breakdown.shipping.estimated.toFixed(2)} (${breakdown.shipping.confidence} confidence)
Customs (est.): €${breakdown.customs.estimated.toFixed(2)}
VAT (18%): €${breakdown.vat.toFixed(2)}
────────────────────────
Total: €${breakdown.total.toFixed(2)}
In ILS: ₪${Math.round(breakdown.totalILS)}

Exchange Rate: ${breakdown.exchangeRate.toFixed(4)}
Calculated at: ${new Date(breakdown.calculatedAt).toLocaleString()}

⚠️ This is an estimate based on historical data.
Actual fees may vary.
    `.trim());
  });

  // Remove old indicator if exists
  const oldIndicator = document.getElementById('hlf-indicator');
  if (oldIndicator) {
    oldIndicator.remove();
  }

  // Insert after price element
  priceElement.parentElement?.appendChild(indicator);
}

function showError(message: string): void {
  const priceElement = document.querySelector(SELECTORS.PRICE_ELEMENT);

  if (!priceElement) return;

  const errorDiv = document.createElement('div');
  errorDiv.id = 'hlf-error';
  errorDiv.style.cssText = `
    color: #d32f2f;
    font-size: 0.9em;
    margin-top: 8px;
    padding: 8px;
    background: #ffebee;
    border-radius: 4px;
    border-left: 4px solid #f44336;
  `;
  errorDiv.textContent = `⚠️ ${message}`;

  const oldError = document.getElementById('hlf-error');
  if (oldError) oldError.remove();

  priceElement.parentElement?.appendChild(errorDiv);
}

// ============================================================================
// Initialization
// ============================================================================

// Wait for page to load, then calculate and display
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(calculateAndDisplayFees, 500);
  });
} else {
  // Already loaded
  setTimeout(calculateAndDisplayFees, 500);
}

// Also handle dynamic page updates (if Thomann uses client-side routing)
const observer = new MutationObserver((mutations) => {
  // Check if price element appeared/changed
  const hasPriceChange = mutations.some((mutation) =>
    Array.from(mutation.addedNodes).some(
      (node) => node instanceof Element && node.querySelector(SELECTORS.PRICE_ELEMENT)
    )
  );

  if (hasPriceChange) {
    logger.debug('Price element changed, recalculating');
    setTimeout(calculateAndDisplayFees, 500);
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

logger.info('Holy Land Fee Calculator initialized');
