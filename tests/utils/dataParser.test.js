import { describe, it, expect } from 'vitest';
import { parseProductCards, extractRawProductData, hasValidChildren } from '../../src/utils/dataParser.js';

describe('dataParser', () => {
  describe('parseProductCards', () => {
    it('should parse HTML and return product cards', () => {
      const mockHTML = `
        <div class="main">
          <span>Product 1</span>
          <span>Product 2</span>
        </div>
      `;
      
      const result = parseProductCards(mockHTML);
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
    });

    it('should return empty result for invalid HTML', () => {
      const mockHTML = '<div>No main class</div>';
      const result = parseProductCards(mockHTML);
      expect(result.length).toBe(0);
    });
  });

  describe('hasValidChildren', () => {
    it('should return true for cards with enough children', () => {
      const mockCard = {
        children: new Array(12).fill({ data: 'test' })
      };
      
      expect(hasValidChildren(mockCard)).toBe(true);
    });

    it('should return false for cards with insufficient children', () => {
      const mockCard = {
        children: new Array(5).fill({ data: 'test' })
      };
      
      expect(hasValidChildren(mockCard)).toBe(false);
    });
  });

  describe('extractRawProductData', () => {
    it('should extract product data from card', () => {
      const mockCard = {
        children: [
          { attribs: { src: 'test.jpg' } },
          { children: [{ data: 'Test Product' }] },
          { children: [{ data: 'useless element' }] }, // This will be removed (index 2)
          { children: [{ data: '尺寸：14吋' }] },
          { children: [{ data: 'CPU：Intel i5' }] },
          { children: [{ data: '16GB RAM' }] },
          { children: [{ data: '512GB SSD' }] },
          { children: [{ data: 'VGA：Intel UHD' }] },
          { children: [{ data: 'USB 3.0' }] },
          { children: [{ data: '1.5Kg' }] },
          { children: [{ data: 'Windows 11' }] },
          { children: [{ data: 'NT35000' }] },
          { children: [{ data: 'Extra' }] },
          { children: [{ data: 'More' }] }
        ]
      };

      const result = extractRawProductData(mockCard);
      
      expect(result.name).toBe('Test Product');
      expect(result.size).toBe('尺寸：14吋');
      expect(result.cpu).toBe('CPU：Intel i5');
      expect(result.ram).toBe('16GB RAM');
      expect(result.ssd).toBe('512GB SSD');
      expect(result.vga).toBe('VGA：Intel UHD');
      expect(result.interface).toBe('USB 3.0');
      expect(result.weight).toBe('1.5Kg');
      expect(result.os).toBe('Windows 11');
      expect(result.price).toBe('NT35000');
      expect(result.img).toBe('test.jpg');
    });

    it('should handle missing size data', () => {
      const mockCard = {
        children: [
          { attribs: { src: 'test.jpg' } },
          { children: [{ data: 'Test Product' }] },
          { children: [{ data: 'useless element' }] }, // This will be removed (index 2)
          { children: [] }, // Missing size data
          { children: [{ data: 'CPU：Intel i5' }] },
          { children: [{ data: '16GB RAM' }] },
          { children: [{ data: '512GB SSD' }] },
          { children: [{ data: 'VGA：Intel UHD' }] },
          { children: [{ data: 'USB 3.0' }] },
          { children: [{ data: '1.5Kg' }] },
          { children: [{ data: 'Windows 11' }] },
          { children: [{ data: 'NT35000' }] },
          { children: [{ data: 'Extra' }] },
          { children: [{ data: 'More' }] }
        ]
      };

      const result = extractRawProductData(mockCard);
      expect(result.size).toBe('');
    });
  });
});