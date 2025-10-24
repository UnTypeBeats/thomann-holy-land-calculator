/**
 * TypeScript type definitions for Holy Land Fee Calculator
 */

// ============================================================================
// Product Data
// ============================================================================

export interface ProductData {
  price: number;
  currency: 'EUR' | 'ILS';
  weight?: number;
  category?: string;
  url: string;
  productName?: string;
}

// ============================================================================
// Fee Calculation Results
// ============================================================================

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface FeeEstimate {
  estimated: number;
  confidence: ConfidenceLevel;
  range?: {
    min: number;
    max: number;
  };
}

export interface FeeBreakdown {
  originalPrice: number;
  shipping: FeeEstimate;
  customs: FeeEstimate;
  vat: number; // 18% of (price + shipping + customs)
  total: number;
  totalILS: number;
  exchangeRate: number;
  calculatedAt: Date;
}

// ============================================================================
// Historical Data (from Excel processing)
// ============================================================================

export interface ProductItem {
  name: string;
  quantity: number;
  itemTotal: number;
  unitPrice: number;
}

export interface OrderSummary {
  sheet_name: string;
  total_eur: number | null;
  shipping_eur: number | null;
  customs_eur: number | null;
  gross_total_eur: number | null;
  gross_total_ils: number | null;
  hlf_total_eur: number | null;
  hlf_total_ils: number | null;
  exchange_rate: number | null;
}

export interface HistoricalOrder {
  order_id: string;
  date: string;
  summary: OrderSummary;
  items: ProductItem[];
  item_count: number;
}

// ============================================================================
// Statistics (from fee-statistics.json)
// ============================================================================

export interface StatisticValues {
  mean: number;
  median: number;
  min: number;
  max: number;
  std?: number;
  percentile_25?: number;
  percentile_75?: number;
  percentile_90?: number;
}

export interface FeeStatistics {
  meta: {
    total_orders: number;
    date_range: {
      earliest: string;
      latest: string;
    };
    generated_at: string;
  };
  order_value: StatisticValues;
  shipping: StatisticValues;
  customs: StatisticValues;
  hlf_total: StatisticValues;
  hlf_percentage: StatisticValues;
  exchange_rate: StatisticValues;
  vat_rate: number;
}

// ============================================================================
// Cache Management
// ============================================================================

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface ExchangeRateCache {
  rate: number;
  timestamp: number;
  source: 'api' | 'cache';
}

export interface CalculationCache {
  productUrl: string;
  breakdown: FeeBreakdown;
  timestamp: number;
}

// ============================================================================
// Extension Settings
// ============================================================================

export type CurrencyDisplay = 'both' | 'ils' | 'eur';
export type CalculationMethod = 'conservative' | 'average' | 'optimistic';
export type OrderMode = 'single' | 'bulk';

export interface ExtensionSettings {
  currencyDisplay: CurrencyDisplay;
  calculationMethod: CalculationMethod;
  orderMode: OrderMode;
  showTooltip: boolean;
  cacheEnabled: boolean;
}

// ============================================================================
// Messaging (between content script and background worker)
// ============================================================================

export type MessageType =
  | 'GET_EXCHANGE_RATE'
  | 'CALCULATE_FEES'
  | 'GET_SETTINGS'
  | 'UPDATE_SETTINGS'
  | 'CLEAR_CACHE'
  | 'LOG_ERROR';

export interface Message<T = unknown> {
  type: MessageType;
  payload?: T;
}

export interface CalculateFeesRequest {
  product: ProductData;
  useCache?: boolean;
}

export interface CalculateFeesResponse {
  success: boolean;
  breakdown?: FeeBreakdown;
  error?: string;
  fromCache?: boolean;
}

export interface GetExchangeRateResponse {
  rate: number;
  timestamp: number;
  fromCache: boolean;
}

// ============================================================================
// UI Components
// ============================================================================

export interface PriceDisplayData {
  originalPrice: number;
  originalCurrency: 'EUR' | 'ILS';
  calculatedPriceEUR: number;
  calculatedPriceILS: number;
  breakdown: FeeBreakdown;
}

export interface TooltipPosition {
  top: number;
  left: number;
}

// ============================================================================
// Error Types
// ============================================================================

export class CalculationError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: unknown
  ) {
    super(message);
    this.name = 'CalculationError';
  }
}

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// ============================================================================
// Utility Types
// ============================================================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];
