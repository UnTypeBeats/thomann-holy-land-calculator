/**
 * Shipping Cost Estimator
 * Uses historical data to estimate shipping costs with confidence levels
 */

import type { ProductData, FeeEstimate, FeeStatistics, CalculationMethod, OrderMode } from './types';
import { CONFIDENCE_THRESHOLDS } from './constants';

/**
 * Shipping allocation strategy:
 * - Single mode: Full shipping cost for the item
 * - Bulk mode: Proportional allocation based on item value
 *   Formula: (item_price / avg_order_value) * shipping_estimate
 *
 * This reflects how shipping costs are distributed in multi-item orders:
 * - Cheap items get less shipping allocated
 * - Expensive items get more shipping allocated
 * - Total shipping across all items ≈ actual shipping cost
 */

export class ShippingEstimator {
  estimate(
    product: ProductData,
    stats: FeeStatistics,
    method: CalculationMethod = 'conservative',
    orderMode: OrderMode = 'bulk'
  ): FeeEstimate {
    const { shipping, order_value } = stats;

    // Base shipping estimate based on calculation method
    let baseShipping: number;
    switch (method) {
      case 'conservative':
        baseShipping = shipping.percentile_75 ?? shipping.median;
        break;
      case 'average':
        baseShipping = shipping.mean;
        break;
      case 'optimistic':
        baseShipping = shipping.percentile_25 ?? shipping.median;
        break;
      default:
        baseShipping = shipping.median;
    }

    // Allocate shipping based on order mode
    let estimated: number;
    if (orderMode === 'bulk') {
      // Proportional allocation: expensive items bear more shipping cost
      // This matches how shipping is actually distributed in multi-item orders
      const avgOrderValue = order_value.mean;
      estimated = (product.price / avgOrderValue) * baseShipping;
    } else {
      // Single item mode: full shipping cost
      estimated = baseShipping;
    }

    // Weight-based adjustment (if available)
    if (product.weight) {
      estimated = this.applyWeightAdjustment(estimated, product.weight);
    }

    // Confidence level based on order value
    const confidence = this.calculateConfidence(product.price, stats);

    return {
      estimated,
      confidence,
      range: {
        min: shipping.percentile_25 ?? shipping.min,
        max: shipping.percentile_90 ?? shipping.max,
      },
    };
  }

  private applyWeightAdjustment(baseEstimate: number, weight: number): number {
    // Rough heuristic: heavier items cost more to ship
    let adjustment = 1.0;

    if (weight > 20) adjustment = 1.8; // Very heavy
    else if (weight > 10) adjustment = 1.5; // Heavy
    else if (weight > 5) adjustment = 1.2; // Medium
    // else normal weight, no adjustment

    return baseEstimate * adjustment;
  }

  private calculateConfidence(orderValue: number, _stats: FeeStatistics): 'high' | 'medium' | 'low' {
    const { HIGH_MIN, HIGH_MAX, MEDIUM_MIN, MEDIUM_MAX } = CONFIDENCE_THRESHOLDS.ORDER_VALUE;

    // High confidence if order value is within historical range
    if (orderValue >= HIGH_MIN && orderValue <= HIGH_MAX) {
      return 'high';
    }

    // Medium confidence if close to historical range
    if (orderValue >= MEDIUM_MIN && orderValue <= MEDIUM_MAX) {
      return 'medium';
    }

    // Low confidence if outside typical range
    return 'low';
  }
}
