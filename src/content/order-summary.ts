/**
 * Order Summary Calculator
 * Provides ACCURATE HLF calculations on checkout summary page using REAL shipping costs
 */

import { logger } from '../utils/logger';

interface OrderItem {
  name: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  element: HTMLElement;
}

interface OrderData {
  subtotal: number;
  shipping: number;
  items: OrderItem[];
}

/**
 * Parse order summary data from the page
 */
function parseOrderData(): OrderData | null {
  try {
    // Parse subtotal (in EUR) - look for "Subtotal" label in order-prices-position
    let subtotal = 0;
    const pricePositions = document.querySelectorAll('.order-prices-position');
    for (const position of pricePositions) {
      const label = position.querySelector('.position-label');
      if (label?.textContent?.includes('Subtotal')) {
        const eurPrice = position.querySelector('.summary-product__price--secondary');
        const match = eurPrice?.textContent?.match(/€([\d,]+\.?\d*)/);
        subtotal = match ? parseFloat(match[1].replace(',', '')) : 0;
        break;
      }
    }

    // Parse shipping cost (in EUR) - look for "Shipping" label in order-prices-position
    let shipping = 0;
    for (const position of pricePositions) {
      const label = position.querySelector('.position-label');
      if (label?.textContent?.includes('Shipping')) {
        const eurPrice = position.querySelector('.summary-product__price--secondary');
        const match = eurPrice?.textContent?.match(/€([\d,]+\.?\d*)/);
        shipping = match ? parseFloat(match[1].replace(',', '')) : 0;
        break;
      }
    }

    // Parse items - each item is in .summary-product
    const items: OrderItem[] = [];
    const itemElements = document.querySelectorAll('.summary-product');

    itemElements.forEach((element) => {
      const nameElement = element.querySelector('.summary-product-name');
      const priceElement = element.querySelector('.summary-product__price--secondary');

      if (nameElement && priceElement) {
        const nameText = nameElement.textContent?.trim() || 'Unknown';

        // Extract quantity from name (e.g., "3x Ernie Ball 3221 3 Pack" -> 3)
        const quantityMatch = nameText.match(/^(\d+)x\s/);
        const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;

        // Remove quantity prefix from name
        const name = quantityMatch ? nameText.replace(/^\d+x\s/, '') : nameText;

        // Extract EUR price
        const priceMatch = priceElement.textContent?.match(/€([\d,]+\.?\d*)/);
        const totalPrice = priceMatch ? parseFloat(priceMatch[1].replace(',', '')) : 0;
        const pricePerUnit = totalPrice / quantity;

        items.push({
          name,
          quantity,
          pricePerUnit,
          totalPrice,
          element: element as HTMLElement,
        });
      }
    });

    logger.info('Parsed order data', { subtotal, shipping, itemCount: items.length });

    return {
      subtotal,
      shipping,
      items,
    };
  } catch (error) {
    logger.error('Failed to parse order data', error as Error);
    return null;
  }
}

/**
 * Calculate HLF for a single item using REAL shipping data
 */
async function calculateItemHLF(
  itemPrice: number,
  orderSubtotal: number,
  realShipping: number
): Promise<number> {
  try {
    // Proportional shipping allocation based on item value
    const itemShipping = (itemPrice / orderSubtotal) * realShipping;

    // Preliminary CIF for customs threshold check
    const preliminaryCIF = itemPrice + itemShipping;

    // Customs exemption: CIF < €75 = no customs
    const CUSTOMS_EXEMPTION_THRESHOLD = 75;
    let customs = 0;

    if (preliminaryCIF >= CUSTOMS_EXEMPTION_THRESHOLD) {
      // Proportional customs estimate
      // Using average from statistics: 153.15 EUR customs for 723.24 EUR order
      const AVG_ORDER_VALUE = 723.24;
      const AVG_CUSTOMS = 153.15;
      customs = (itemPrice / AVG_ORDER_VALUE) * AVG_CUSTOMS;
    }

    // Calculate CIF and VAT
    const cif = itemPrice + itemShipping + customs;
    const vat = cif * 0.18; // 18% Israeli VAT

    // Total HLF (everything except the base price)
    const totalHLF = itemShipping + customs + vat;

    logger.debug('Item HLF calculated', {
      itemPrice,
      itemShipping,
      customs,
      vat,
      totalHLF,
      exempt: preliminaryCIF < CUSTOMS_EXEMPTION_THRESHOLD,
    });

    return totalHLF;
  } catch (error) {
    logger.error('Failed to calculate item HLF', error as Error);
    return 0;
  }
}

/**
 * Display HLF information on the page
 */
async function displayHLF(orderData: OrderData): Promise<void> {
  const { subtotal, shipping, items } = orderData;

  logger.info('Displaying HLF for order', { subtotal, shipping, itemCount: items.length });

  // Get exchange rate first
  const response = await chrome.runtime.sendMessage({
    type: 'GET_EXCHANGE_RATE',
  });
  const exchangeRate = response.rate || 3.8;

  // Calculate HLF for each item
  let totalHLF = 0;

  // Track total height we're adding so we can expand the container
  let totalAddedHeight = 0;

  for (const item of items) {
    const itemHLF = await calculateItemHLF(item.pricePerUnit, subtotal, shipping);
    totalHLF += itemHLF * item.quantity;

    // Calculate Israeli prices (per unit and total)
    const israeliPerUnitEUR = item.pricePerUnit + itemHLF;
    const israeliPerUnitILS = israeliPerUnitEUR * exchangeRate;
    const israeliTotalEUR = israeliPerUnitEUR * item.quantity;
    const israeliTotalILS = israeliPerUnitILS * item.quantity;

    // Create Israeli price display as a SEPARATE ROW (not inside product container)
    const israeliPriceDisplay = document.createElement('div');
    israeliPriceDisplay.className = 'hlf-israeli-price-row';
    israeliPriceDisplay.style.cssText = `
      margin: 8px 0 16px 0;
      padding: 12px 16px;
      background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
      border-radius: 6px;
      border-left: 4px solid #4caf50;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `;

    // Build the display content
    let displayHTML = `
      <div style="font-size: 11px; color: #2e7d32; font-weight: 600; margin-bottom: 6px;">
        🇮🇱 Israeli Price:
      </div>
    `;

    // Show total price prominently
    displayHTML += `
      <div style="font-size: 18px; color: #1b5e20; font-weight: 700; line-height: 1.2;">
        ₪${israeliTotalILS.toFixed(2)}
      </div>
      <div style="font-size: 12px; color: #558b2f; margin-top: 2px;">
        €${israeliTotalEUR.toFixed(2)}
      </div>
    `;

    // If quantity > 1, also show per-unit price
    if (item.quantity > 1) {
      displayHTML += `
        <div style="font-size: 10px; color: #558b2f; margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(76, 175, 80, 0.3);">
          ₪${israeliPerUnitILS.toFixed(2)} per unit × ${item.quantity}
        </div>
      `;
    }

    displayHTML += `
      <div style="font-size: 9px; color: #689f38; margin-top: 4px; font-style: italic;">
        Incl. shipping, customs & VAT
      </div>
    `;

    israeliPriceDisplay.innerHTML = displayHTML;

    // Insert as a SIBLING after the product element (not inside it)
    item.element.insertAdjacentElement('afterend', israeliPriceDisplay);

    // Estimate height of our box (padding + content + margin)
    // Rough estimate: ~90px per box (can adjust based on actual measurements)
    const estimatedBoxHeight = item.quantity > 1 ? 110 : 90; // More height if showing per-unit breakdown
    totalAddedHeight += estimatedBoxHeight;
  }

  // Apply constraints removal again after adding our boxes (in case something changed)
  removeAllHeightConstraints();

  logger.debug('Re-applied height constraint removal after adding HLF boxes', {
    addedBoxes: items.length,
    estimatedAddedHeight: totalAddedHeight,
  });

  // Display summary at the top
  displaySummaryBox(subtotal, shipping, totalHLF, exchangeRate);
}

/**
 * Display summary box with total cost including HLF
 */
function displaySummaryBox(
  subtotal: number,
  shipping: number,
  totalHLF: number,
  exchangeRate: number
): void {
  // Find a good place to insert the summary (look for the order block or summary step)
  const summaryContainer =
    document.querySelector('[data-testid="summary-block-order"]') ||
    document.querySelector('[data-testid="step-summary2"]') ||
    document.querySelector('.summary');

  if (!summaryContainer) {
    logger.warn('Could not find summary container to insert HLF summary box');
    return;
  }

  const trueTotalEUR = subtotal + totalHLF;
  const trueTotalILS = trueTotalEUR * exchangeRate;

  const summaryBox = document.createElement('div');
  summaryBox.style.cssText = `
    background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
    color: white;
    padding: 16px;
    border-radius: 8px;
    margin: 16px 0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;

  summaryBox.innerHTML = `
    <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
      🇮🇱 True Cost for Israeli Delivery
    </div>
    <div style="font-size: 24px; font-weight: 700; margin-bottom: 4px;">
      ₪${trueTotalILS.toFixed(2)}
    </div>
    <div style="font-size: 14px; opacity: 0.9;">
      €${trueTotalEUR.toFixed(2)} (incl. all fees)
    </div>
    <div style="font-size: 11px; opacity: 0.8; margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.3);">
      ✓ Real shipping: €${shipping.toFixed(2)}<br>
      ✓ Customs & VAT calculated<br>
      ✓ Exchange rate: €1 = ₪${exchangeRate.toFixed(2)}
    </div>
  `;

  // Insert at the top of summary
  summaryContainer.insertBefore(summaryBox, summaryContainer.firstChild);
}

/**
 * Find and remove height constraints ONLY from the scrollable container
 */
function removeAllHeightConstraints(): void {
  // Find the first summary-product element
  const firstProduct = document.querySelector('.summary-product') as HTMLElement;
  if (!firstProduct) {
    logger.warn('Could not find .summary-product to locate scrollable container');
    return;
  }

  // Walk up the DOM tree to find the element with height/overflow constraint
  let current = firstProduct.parentElement;
  const fixedElements: string[] = [];
  const allParents: string[] = [];

  while (current && current !== document.body) {
    const computedStyle = window.getComputedStyle(current);
    const maxHeight = computedStyle.maxHeight;
    const height = computedStyle.height;
    const overflow = computedStyle.overflow;
    const overflowY = computedStyle.overflowY;
    const scrollHeight = current.scrollHeight;
    const clientHeight = current.clientHeight;

    const elementInfo = `${current.className || current.tagName} (h:${height}, max:${maxHeight}, overflow:${overflow}/${overflowY}, scroll:${scrollHeight}, client:${clientHeight})`;
    allParents.push(elementInfo);

    // Check if this element is clipping content (scrollHeight > clientHeight)
    const isClipping = scrollHeight > clientHeight + 5; // +5px tolerance

    // Check if this element has constraints
    const hasMaxHeight = maxHeight && maxHeight !== 'none' && maxHeight !== '0px';
    const hasFixedHeight = height && height !== 'auto' && !height.includes('%');
    const hasOverflowHiding = overflow === 'hidden' || overflow === 'scroll' || overflow === 'auto' ||
                              overflowY === 'hidden' || overflowY === 'scroll' || overflowY === 'auto';

    if (isClipping || hasMaxHeight || hasFixedHeight) {
      logger.debug(`Found constrained container: ${elementInfo}`, {
        isClipping,
        hasMaxHeight,
        hasFixedHeight,
        hasOverflowHiding,
      });

      // Remove the constraints
      current.style.setProperty('max-height', 'none', 'important');
      current.style.setProperty('height', 'auto', 'important');

      // Also fix overflow if it's hiding content
      if (hasOverflowHiding) {
        current.style.setProperty('overflow', 'visible', 'important');
        current.style.setProperty('overflow-y', 'visible', 'important');
      }

      fixedElements.push(current.className || current.tagName);
    }

    current = current.parentElement;
  }

  logger.info(`All parent containers: ${allParents.join(' -> ')}`);
  logger.info(`Fixed containers: ${fixedElements.join(', ') || 'none'}`);
}

/**
 * Hide the "Show less" button to prevent layout breaking
 */
function hideShowLessButton(): void {
  // Find and hide the "Show less" button
  const showLessButton = Array.from(document.querySelectorAll('button, a, [role="button"]')).find(
    (el) => {
      const text = el.textContent?.toLowerCase() || '';
      return text.includes('show less') || text.includes('show fewer') || text === '-';
    }
  );

  if (showLessButton) {
    (showLessButton as HTMLElement).style.display = 'none';
    logger.info('Hid "Show less" button to prevent layout breaking');
  }
}

/**
 * Expand all items by clicking the "Show all" button if it exists
 */
async function expandAllItems(): Promise<void> {
  // Look for Thomann's "Show all" button
  // It might be a button with text "Show all" or similar
  const showAllButton = Array.from(document.querySelectorAll('button, a, [role="button"]')).find(
    (el) => {
      const text = el.textContent?.toLowerCase() || '';
      return text.includes('show all') || text.includes('show more') || text === '+';
    }
  );

  if (showAllButton) {
    logger.info('Found "Show all" button, clicking to expand items');
    (showAllButton as HTMLElement).click();

    // Wait a bit for Thomann's JavaScript to expand the items
    await new Promise((resolve) => setTimeout(resolve, 500));

    // NOW remove all height constraints AFTER Thomann's JS has run
    removeAllHeightConstraints();

    // Hide the "Show less" button to prevent users from breaking the layout
    hideShowLessButton();

    logger.info('Items expanded and constraints removed');
  } else {
    logger.debug('No "Show all" button found - items might already be expanded');
    // Still try to remove constraints
    removeAllHeightConstraints();
  }
}

// Track if we've already initialized to prevent duplicate runs
let isInitialized = false;
let isInitializing = false;

/**
 * Check if we're on the order summary page
 */
function isOrderSummaryPage(): boolean {
  // Check URL contains checkout
  const isCheckoutUrl = window.location.href.includes('/checkout');

  // Check for presence of order summary elements
  const hasOrderSummary = document.querySelector('[data-testid="summary-block-order"]') !== null ||
                          document.querySelector('.summary-product') !== null;

  return isCheckoutUrl && hasOrderSummary;
}

/**
 * Check if HLF boxes already exist on the page
 */
function hasHLFBoxes(): boolean {
  return document.querySelector('.hlf-israeli-price-row') !== null;
}

/**
 * Initialize order summary calculator
 */
async function init(): Promise<void> {
  // Prevent duplicate initialization
  if (isInitializing || isInitialized) {
    logger.debug('Init already running or completed, skipping');
    return;
  }

  // Check if we're actually on the order summary page
  if (!isOrderSummaryPage()) {
    logger.debug('Not on order summary page, skipping init');
    return;
  }

  // Check if HLF boxes already exist
  if (hasHLFBoxes()) {
    logger.debug('HLF boxes already present, skipping init');
    isInitialized = true;
    return;
  }

  isInitializing = true;
  logger.info('Order Summary Calculator initializing...');

  try {
    // Wait for page to fully load
    if (document.readyState !== 'complete') {
      await new Promise((resolve) => window.addEventListener('load', resolve));
    }

    // Give Thomann's JS a moment to fully render
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Expand all items first (click "Show all" if needed)
    await expandAllItems();

    // Parse order data
    const orderData = parseOrderData();

    if (!orderData || orderData.items.length === 0) {
      logger.warn('Could not parse order data or no items found');
      isInitializing = false;
      return;
    }

    // Display HLF calculations
    await displayHLF(orderData);

    isInitialized = true;
    logger.info('Order Summary Calculator initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Order Summary Calculator', error as Error);
  } finally {
    isInitializing = false;
  }
}

/**
 * Monitor for navigation to order summary page (for SPA-style navigation)
 */
function startNavigationMonitoring(): void {
  logger.debug('Starting navigation monitoring');

  // Monitor URL changes (for SPA navigation)
  let lastUrl = window.location.href;
  const checkUrlChange = () => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      logger.debug('URL changed', { from: lastUrl, to: currentUrl });
      lastUrl = currentUrl;

      // Reset initialization state on URL change
      isInitialized = false;
      isInitializing = false;

      // Try to initialize if we're on order summary
      if (isOrderSummaryPage()) {
        logger.info('Navigated to order summary page, initializing...');
        setTimeout(() => init(), 500); // Small delay for content to load
      }
    }
  };

  // Check for URL changes every 500ms
  setInterval(checkUrlChange, 500);

  // Also monitor DOM changes for order summary content appearing
  const observer = new MutationObserver((mutations) => {
    // Check if order summary content appeared
    if (!isInitialized && !isInitializing && isOrderSummaryPage()) {
      // Look for the appearance of order summary elements
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          const hasOrderContent = Array.from(mutation.addedNodes).some((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              return (
                element.classList?.contains('summary-product') ||
                element.querySelector?.('.summary-product') !== null ||
                element.getAttribute?.('data-testid') === 'summary-block-order'
              );
            }
            return false;
          });

          if (hasOrderContent) {
            logger.info('Order summary content detected via MutationObserver');
            setTimeout(() => init(), 500);
            break;
          }
        }
      }
    }
  });

  // Start observing the document body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  logger.debug('Navigation monitoring started');
}

// Listen for settings changes from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SETTINGS_CHANGED') {
    logger.info('Settings changed, reloading page calculations', message.settings);

    // Remove existing HLF boxes
    document.querySelectorAll('.hlf-israeli-price-row').forEach(el => el.remove());
    document.querySelectorAll('[style*="background: linear-gradient(135deg, #4caf50"]').forEach(el => {
      if (el.textContent?.includes('True Cost for Israeli Delivery')) {
        el.remove();
      }
    });

    // Reset state
    isInitialized = false;
    isInitializing = false;

    // Reinitialize with new settings
    setTimeout(() => init(), 300);

    sendResponse({ success: true });
  }
});

// Initialize on page load and start monitoring for navigation
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    init();
    startNavigationMonitoring();
  });
} else {
  init();
  startNavigationMonitoring();
}
