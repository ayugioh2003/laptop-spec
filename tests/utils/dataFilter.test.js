import { describe, it, expect } from 'vitest';
import { filterIrrelevantProducts, addIndexToProducts } from '../../src/utils/dataFilter.js';

describe('dataFilter', () => {
  describe('filterIrrelevantProducts', () => {
    it('should filter out irrelevant products', () => {
      const mockProducts = [
        { name: 'Laptop with 內顯' },
        { name: 'Power Bank 電源' },
        { name: 'Gaming laptop with 獨顯' },
        { name: 'Camera 相機' },
        { name: 'Smartphone 手機' }
      ];

      const result = filterIrrelevantProducts(mockProducts);
      
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Laptop with 內顯');
      expect(result[1].name).toBe('Gaming laptop with 獨顯');
    });

    it('should return empty array when no valid products', () => {
      const mockProducts = [
        { name: 'Power Bank 電源' },
        { name: 'Camera 相機' },
        { name: 'Smartphone 手機' }
      ];

      const result = filterIrrelevantProducts(mockProducts);
      expect(result).toHaveLength(0);
    });

    it('should keep products with VGA info', () => {
      const mockProducts = [
        { name: 'Laptop', vga: 'VGA：內顯 Intel UHD' },
        { name: 'Gaming laptop', vga: 'VGA：獨顯 RTX 4060' },
        { name: 'No VGA info', vga: 'Other info' }
      ];

      const result = filterIrrelevantProducts(mockProducts);
      expect(result).toHaveLength(2);
    });
  });

  describe('addIndexToProducts', () => {
    it('should add index to products starting from 1', () => {
      const mockProducts = [
        { name: 'Product A' },
        { name: 'Product B' },
        { name: 'Product C' }
      ];

      const result = addIndexToProducts(mockProducts);
      
      expect(result).toHaveLength(3);
      expect(result[0].index).toBe(1);
      expect(result[0].name).toBe('Product A');
      expect(result[1].index).toBe(2);
      expect(result[1].name).toBe('Product B');
      expect(result[2].index).toBe(3);
      expect(result[2].name).toBe('Product C');
    });

    it('should handle empty array', () => {
      const result = addIndexToProducts([]);
      expect(result).toHaveLength(0);
    });
  });
});