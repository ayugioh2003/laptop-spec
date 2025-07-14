import { CRAWLER_CONFIG } from '../../config.ts';
import type { LaptopSpec } from '@/types';

/**
 * 過濾掉不相關的產品
 */
export function filterIrrelevantProducts(products: Omit<LaptopSpec, 'property'>[]): Omit<LaptopSpec, 'property'>[] {
  let filteredProducts = products;

  // 過濾掉不相關的產品
  CRAWLER_CONFIG.FILTERS.EXCLUDED_KEYWORDS.forEach((keyword: string) => {
    filteredProducts = filteredProducts.filter(item => !JSON.stringify(item).includes(keyword));
  });

  // 只保留包含顯卡資訊的產品
  filteredProducts = filteredProducts.filter((item) => 
    CRAWLER_CONFIG.FILTERS.REQUIRED_PATTERN.test(JSON.stringify(item))
  );

  return filteredProducts;
}

/**
 * 為產品加上索引編號
 */
export function addIndexToProducts<T extends { index?: number }>(products: T[]): T[] {
  return products.map((item, index) => ({
    ...item,
    index: index + 1,
  }));
}