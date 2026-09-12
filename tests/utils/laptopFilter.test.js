import { describe, it, expect } from 'vitest';
import { filterLaptops, uniqueValues } from '../../src/utils/laptopFilter.js';

const laptop = (name, property) => ({ name, property });

const mockLaptops = [
  laptop('A', { size: 14, ramMax: 64, weight: 1.2, price: 30000, brand: 'HP', cpu: 'i5', vga: '內顯' }),
  laptop('B', { size: 16, ramMax: 32, weight: 2.4, price: 50000, brand: 'ASUS', cpu: 'i7', vga: 'RTX 4060' }),
  laptop('C', { size: 13, ramMax: 16, weight: 1.0, price: 22000, brand: 'HP', cpu: 'i5', vga: '內顯' }),
];

describe('laptopFilter', () => {
  describe('filterLaptops', () => {
    it('沒有條件時回傳全部', () => {
      expect(filterLaptops(mockLaptops, {})).toHaveLength(3);
    });

    it('依價格區間過濾', () => {
      const result = filterLaptops(mockLaptops, { priceMin: 25000, priceMax: 40000 });
      expect(result.map((l) => l.name)).toEqual(['A']);
    });

    it('ramMin 比的是最大可擴充容量', () => {
      const result = filterLaptops(mockLaptops, { ramMin: 32 });
      expect(result.map((l) => l.name)).toEqual(['A', 'B']);
    });

    it('多個條件是 AND', () => {
      const result = filterLaptops(mockLaptops, { brand: 'HP', weightMax: 1.1 });
      expect(result.map((l) => l.name)).toEqual(['C']);
    });

    it('falsy 條件不生效（null 與 0 都當作沒設定）', () => {
      expect(filterLaptops(mockLaptops, { priceMin: null, sizeMax: 0, brand: null })).toHaveLength(3);
    });

    it('空清單回傳空陣列', () => {
      expect(filterLaptops([], { brand: 'HP' })).toEqual([]);
    });
  });

  describe('uniqueValues', () => {
    it('回傳去重且排序後的值', () => {
      expect(uniqueValues(mockLaptops, 'brand')).toEqual(['ASUS', 'HP']);
    });

    it('空清單回傳空陣列', () => {
      expect(uniqueValues([], 'brand')).toEqual([]);
    });
  });
});
