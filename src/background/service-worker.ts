/**
 * Background Service Worker
 * Handles API calls, caching, and message routing
 *
 * SECURITY: API key is kept here, NOT in content script
 */

import type {
  Message,
  CalculateFeesRequest,
  CalculateFeesResponse,
  GetExchangeRateResponse,
  ExchangeRateCache,
} from '../shared/types';
import { PriceCalculator } from '../shared/calculation-engine';
import { CACHE_DURATION, API_ENDPOINTS } from '../shared/constants';
import { logger } from '../utils/logger';

// API Key - SECURE (loaded from environment variable at build time)
// For development: Set VITE_EXCHANGE_RATE_API_KEY in .env file
// For production: Inject via build process
const EXCHANGE_RATE_API_KEY = import.meta.env.VITE_EXCHANGE_RATE_API_KEY;

// Validate API key is present
if (!EXCHANGE_RATE_API_KEY || EXCHANGE_RATE_API_KEY === 'your_api_key_here') {
  console.error(
    'CRITICAL: Exchange rate API key not configured! Please set VITE_EXCHANGE_RATE_API_KEY in .env file'
  );
}

// Initialize calculator
const calculator = new PriceCalculator();

// ============================================================================
// Message Handling
// ============================================================================

chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
  logger.debug('Background received message', { type: message.type });

  switch (message.type) {
    case 'GET_EXCHANGE_RATE':
      handleGetExchangeRate()
        .then(sendResponse)
        .catch((error) => {
          logger.error('Failed to get exchange rate', error);
          sendResponse({ rate: 4.0, timestamp: Date.now(), fromCache: false });
        });
      return true; // Keep channel open for async response

    case 'CALCULATE_FEES':
      handleCalculateFees(message.payload as CalculateFeesRequest)
        .then(sendResponse)
        .catch((error) => {
          logger.error('Failed to calculate fees', error);
          sendResponse({
            success: false,
            error: error.message,
          } as CalculateFeesResponse);
        });
      return true;

    case 'CLEAR_CACHE':
      handleClearCache()
        .then(() => sendResponse({ success: true }))
        .catch((error) => {
          logger.error('Failed to clear cache', error);
          sendResponse({ success: false });
        });
      return true;

    case 'LOG_ERROR':
      // Log errors from content script
      logger.error('Error from content script', undefined, message.payload);
      break;

    default:
      logger.warn('Unknown message type', message.type);
  }
});

// ============================================================================
// Exchange Rate Management
// ============================================================================

async function handleGetExchangeRate(): Promise<GetExchangeRateResponse> {
  // Check cache first
  const cached = await getCachedExchangeRate();

  if (cached && !isExpired(cached.timestamp, CACHE_DURATION.EXCHANGE_RATE)) {
    logger.debug('Using cached exchange rate', { rate: cached.rate });
    return {
      rate: cached.rate,
      timestamp: cached.timestamp,
      fromCache: true,
    };
  }

  // Fetch fresh rate
  logger.info('Fetching fresh exchange rate from API');
  const rate = await fetchExchangeRate();

  // Cache the result
  await cacheExchangeRate(rate);

  return {
    rate,
    timestamp: Date.now(),
    fromCache: false,
  };
}

async function fetchExchangeRate(): Promise<number> {
  const url = `${API_ENDPOINTS.EXCHANGE_RATE_BASE}/${EXCHANGE_RATE_API_KEY}/latest/EUR`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.conversion_rates || !data.conversion_rates.ILS) {
      throw new Error('Invalid API response format');
    }

    const rate = data.conversion_rates.ILS;
    logger.info('Exchange rate fetched successfully', { rate });

    return rate;
  } catch (error) {
    logger.error('Failed to fetch exchange rate', error as Error);

    // Fallback to cached rate if available
    const cached = await getCachedExchangeRate();
    if (cached) {
      logger.warn('Using expired cached rate as fallback', { rate: cached.rate });
      return cached.rate;
    }

    // Last resort: use reasonable default
    logger.warn('Using default exchange rate', { rate: 4.0 });
    return 4.0;
  }
}

async function getCachedExchangeRate(): Promise<ExchangeRateCache | null> {
  try {
    const result = await chrome.storage.local.get('exchangeRate');
    return result.exchangeRate || null;
  } catch (error) {
    logger.error('Failed to get cached exchange rate', error as Error);
    return null;
  }
}

async function cacheExchangeRate(rate: number): Promise<void> {
  try {
    const cache: ExchangeRateCache = {
      rate,
      timestamp: Date.now(),
      source: 'api',
    };
    await chrome.storage.local.set({ exchangeRate: cache });
    logger.debug('Exchange rate cached', cache);
  } catch (error) {
    logger.error('Failed to cache exchange rate', error as Error);
  }
}

// ============================================================================
// Fee Calculation
// ============================================================================

async function handleCalculateFees(request: CalculateFeesRequest): Promise<CalculateFeesResponse> {
  try {
    const { product } = request;

    // TODO: Check calculation cache if enabled (request.useCache)
    // For now, always calculate fresh

    // Get current exchange rate
    const { rate: exchangeRate } = await handleGetExchangeRate();

    // Get user settings (for calculation method and order mode)
    const settings = await chrome.storage.sync.get('settings');
    const method = settings.settings?.calculationMethod || 'conservative';
    const orderMode = settings.settings?.orderMode || 'bulk';

    // Calculate fees
    const breakdown = await calculator.calculate(product, exchangeRate, method, orderMode);

    return {
      success: true,
      breakdown,
      fromCache: false,
    };
  } catch (error) {
    logger.error('Fee calculation error', error as Error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// Cache Management
// ============================================================================

async function handleClearCache(): Promise<void> {
  await chrome.storage.local.clear();
  logger.info('Cache cleared');
}

// ============================================================================
// Utilities
// ============================================================================

function isExpired(timestamp: number, ttl: number): boolean {
  return Date.now() - timestamp > ttl;
}

// ============================================================================
// Initialization
// ============================================================================

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    logger.info('Extension installed');
    // Initialize default settings
    chrome.storage.sync.set({
      settings: {
        currencyDisplay: 'both',
        calculationMethod: 'conservative',
        orderMode: 'bulk', // Default to bulk mode (more accurate for typical usage)
        showTooltip: true,
        cacheEnabled: true,
      },
    });
  } else if (details.reason === 'update') {
    logger.info('Extension updated', { previousVersion: details.previousVersion });
    // Ensure orderMode exists for existing users
    chrome.storage.sync.get('settings', (result) => {
      if (result.settings && !result.settings.orderMode) {
        chrome.storage.sync.set({
          settings: {
            ...result.settings,
            orderMode: 'bulk',
          },
        });
        logger.info('Added orderMode setting to existing user settings');
      }
    });
  }
});

logger.info('Background service worker initialized');
