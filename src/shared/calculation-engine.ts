/**
 * Price Calculation Engine
 * Replaces the hard-coded POC logic with data-driven calculations
 */

import type { ProductData, FeeBreakdown, CalculationMethod, OrderMode } from './types';
import { FeeRepository } from './fee-repository';
import { ShippingEstimator } from './shipping-estimator';
import { VAT_RATE } from './constants';
import { logger } from '../utils/logger';

export class PriceCalculator {
  private feeRepository: FeeRepository;
  private shippingEstimator: ShippingEstimator;

  constructor() {
    this.feeRepository = new FeeRepository();
    this.shippingEstimator = new ShippingEstimator();
  }

  /**
   * Calculate Holy Land Fee breakdown for a product
   *
   * @param product - Product data from Thomann page
   * @param exchangeRate - Current EUR to ILS exchange rate
   * @param method - Calculation method (conservative/average/optimistic)
   * @param orderMode - Order mode (single item vs bulk order)
   * @returns Complete fee breakdown with confidence levels
   */
  async calculate(
    product: ProductData,
    exchangeRate: number,
    method: CalculationMethod = 'conservative',
    orderMode: OrderMode = 'bulk'
  ): Promise<FeeBreakdown> {
    logger.debug('Calculating fees', { product, exchangeRate, method, orderMode });

    try {
      // Load historical statistics
      const stats = this.feeRepository.getStatistics();

      // Estimate shipping cost
      const shipping = this.shippingEstimator.estimate(product, stats, method, orderMode);

      // Calculate preliminary CIF (product + shipping) for customs threshold check
      const preliminaryCIF = product.price + shipping.estimated;

      // Estimate customs fee (exempt if CIF < €75)
      const customsEstimated = this.feeRepository.getCustomsEstimate(preliminaryCIF);
      const customs = {
        estimated: customsEstimated,
        confidence: shipping.confidence, // Use same confidence as shipping for now
      };

      // Calculate final CIF (Cost, Insurance, Freight) value
      const cifValue = product.price + shipping.estimated + customs.estimated;

      // Calculate VAT (18% of CIF)
      const vat = cifValue * VAT_RATE;

      // Total landed cost
      const total = cifValue + vat;
      const totalILS = total * exchangeRate;

      const breakdown: FeeBreakdown = {
        originalPrice: product.price,
        shipping,
        customs,
        vat,
        total,
        totalILS,
        exchangeRate,
        calculatedAt: new Date(),
      };

      logger.info('Fee calculation complete', {
        originalPrice: product.price,
        total,
        totalILS,
        confidence: shipping.confidence,
      });

      return breakdown;
    } catch (error) {
      logger.error('Fee calculation failed', error as Error, { product });
      throw error;
    }
  }

  /**
   * Quick estimate using HLF percentage (for comparison with POC)
   *
   * @param productPrice - Product price in EUR
   * @param exchangeRate - Exchange rate
   * @param method - Calculation method
   * @returns Estimated total in EUR and ILS
   */
  quickEstimate(
    productPrice: number,
    exchangeRate: number,
    method: CalculationMethod = 'conservative'
  ): { totalEUR: number; totalILS: number; hlfPercentage: number } {
    const hlfPercentage = this.feeRepository.getHLFPercentageEstimate(method);
    const totalEUR = productPrice * (1 + hlfPercentage);
    const totalILS = totalEUR * exchangeRate;

    return {
      totalEUR,
      totalILS,
      hlfPercentage: hlfPercentage * 100,
    };
  }
}
