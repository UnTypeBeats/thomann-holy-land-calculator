/**
 * Fee Repository - Loads and caches historical statistics
 */

import type { FeeStatistics } from './types';
import { CUSTOMS_EXEMPTION_THRESHOLD_EUR } from './constants';
import { logger } from '../utils/logger';

// Import statistics JSON (Vite will bundle this)
import feeStats from '../data/fee-statistics.json';

export class FeeRepository {
  private stats: FeeStatistics | null = null;

  constructor() {
    this.loadStatistics();
  }

  private loadStatistics(): void {
    try {
      this.stats = feeStats as FeeStatistics;
      logger.info('Fee statistics loaded', {
        orders: this.stats.meta.total_orders,
        dateRange: this.stats.meta.date_range,
      });
    } catch (error) {
      logger.error('Failed to load fee statistics', error as Error);
      throw new Error('Unable to load historical fee data');
    }
  }

  getStatistics(): FeeStatistics {
    if (!this.stats) {
      throw new Error('Fee statistics not loaded');
    }
    return this.stats;
  }

  getVATRate(): number {
    return this.stats?.vat_rate ?? 0.18;
  }

  getShippingEstimate(method: 'conservative' | 'average' | 'optimistic' = 'conservative'): number {
    if (!this.stats) return 120; // Fallback

    switch (method) {
      case 'conservative':
        return (this.stats.shipping.percentile_75 ?? this.stats.shipping.median) || 120;
      case 'average':
        return this.stats.shipping.mean;
      case 'optimistic':
        return this.stats.shipping.percentile_25 ?? this.stats.shipping.median;
      default:
        return this.stats.shipping.median;
    }
  }

  /**
   * Estimate customs fees based on CIF value (product + shipping)
   *
   * Israeli customs exemption: Items with CIF < €75 are exempt from customs duties
   *
   * @param cifValue - CIF value (Cost, Insurance, Freight = product price + shipping)
   * @returns Estimated customs fee in EUR
   */
  getCustomsEstimate(cifValue: number): number {
    if (!this.stats) return 0;

    // EXEMPTION THRESHOLD: CIF < threshold = no customs
    if (cifValue < CUSTOMS_EXEMPTION_THRESHOLD_EUR) {
      return 0; // Exempt from customs
    }

    // Above threshold: proportional estimation based on average customs/order ratio
    const avgOrderValue = this.stats.order_value.mean;
    const avgCustoms = this.stats.customs.mean;

    if (avgOrderValue === 0) return 0;

    return (cifValue / avgOrderValue) * avgCustoms;
  }

  getHLFPercentageEstimate(method: 'conservative' | 'average' | 'optimistic' = 'conservative'): number {
    if (!this.stats) return 0.6; // 60% fallback

    switch (method) {
      case 'conservative':
        return (this.stats.hlf_percentage.percentile_75 ?? this.stats.hlf_percentage.median) / 100;
      case 'average':
        return this.stats.hlf_percentage.mean / 100;
      case 'optimistic':
        return this.stats.hlf_percentage.median / 100;
      default:
        return this.stats.hlf_percentage.median / 100;
    }
  }
}
