import { describe, it, expect } from 'vitest';
import { dataTransformers, transformRawData } from '../../src/utils/dataTransformer.js';

describe('dataTransformers', () => {
  describe('getBrand', () => {
    it('should extract brand from product name', () => {
      expect(dataTransformers.getBrand('ASUS ROG Zephyrus G14')).toBe('ASUS');
      expect(dataTransformers.getBrand('MacBook Pro 13')).toBe('MacBook');
      expect(dataTransformers.getBrand('★Dell XPS 13')).toBe('Dell');
    });

    it('should handle special case for 捷元', () => {
      expect(dataTransformers.getBrand('捷元電腦 ABC')).toBe('捷元');
    });
  });

  describe('getSize', () => {
    it('should extract screen size from size text', () => {
      expect(dataTransformers.getSize('尺寸：13.3吋')).toBe(13.3);
      expect(dataTransformers.getSize('尺寸：15.6吋 FHD')).toBe(15.6);
      expect(dataTransformers.getSize('尺寸：14吋 2K')).toBe(14);
    });

    it('should return NaN for invalid format', () => {
      expect(dataTransformers.getSize('無效格式')).toBeNaN();
    });
  });

  describe('getCpu', () => {
    it('should extract CPU information', () => {
      expect(dataTransformers.getCpu('CPU：Intel i7-13700H')).toBe('Intel i7');
      expect(dataTransformers.getCpu('CPU：AMD Ryzen-5600H')).toBe('AMD Ryzen');
    });
  });

  describe('getRamBasic', () => {
    it('should extract RAM capacity in GB', () => {
      expect(dataTransformers.getRamBasic('16GB DDR4')).toBe(16);
      expect(dataTransformers.getRamBasic('8G RAM')).toBe(8);
      expect(dataTransformers.getRamBasic('32GB LPDDR5')).toBe(32);
    });

    it('should return null for invalid format', () => {
      expect(dataTransformers.getRamBasic('無效格式')).toBeNull();
    });
  });

  describe('getRamMax', () => {
    it('should extract maximum RAM capacity', () => {
      expect(dataTransformers.getRamMax('8GB Max 32G')).toBe(32);
      expect(dataTransformers.getRamMax('16GB Max.64G')).toBe(64);
      expect(dataTransformers.getRamMax('8GB Max: 32G')).toBe(32);
      expect(dataTransformers.getRamMax('16GB Max:64G')).toBe(64);
    });

    it('should return null when no max capacity found', () => {
      expect(dataTransformers.getRamMax('16GB DDR4')).toBeNull();
    });
  });

  describe('getSSD', () => {
    it('should extract SSD capacity in GB', () => {
      expect(dataTransformers.getSSD('512GB SSD')).toBe(512);
      expect(dataTransformers.getSSD('1TB NVMe')).toBe(1024);
      expect(dataTransformers.getSSD('256G M.2')).toBe(256);
    });

    it('should return null for invalid format', () => {
      expect(dataTransformers.getSSD('無效格式')).toBeNull();
    });
  });

  describe('getVGA', () => {
    it('should extract VGA information', () => {
      expect(dataTransformers.getVGA('VGA：NVIDIA RTX 4060')).toBe('NVIDIA RTX');
      expect(dataTransformers.getVGA('獨顯：AMD Radeon RX')).toBe('AMD Radeon');
      expect(dataTransformers.getVGA('內顯：Intel UHD Graphics')).toBe('Intel');
    });
  });

  describe('getThunderbolt', () => {
    it('should detect Thunderbolt support', () => {
      expect(dataTransformers.getThunderbolt('USB 3.0, Thunderbolt 4')).toBe(true);
      expect(dataTransformers.getThunderbolt('USB 3.0, HDMI')).toBe(false);
    });
  });

  describe('getWeight', () => {
    it('should extract weight in kg', () => {
      expect(dataTransformers.getWeight('1.5Kg')).toBe(1.5);
      expect(dataTransformers.getWeight('2000g')).toBe(2);
      expect(dataTransformers.getWeight('1.8 ')).toBe(1.8);
    });

    it('should return null for invalid format', () => {
      expect(dataTransformers.getWeight('無效格式')).toBeNull();
    });
  });

  describe('getPrice', () => {
    it('should extract price from price text', () => {
      expect(dataTransformers.getPrice('NT35000')).toBe(35000);
      expect(dataTransformers.getPrice('含稅NT42990')).toBe(42990);
    });
  });
});

describe('transformRawData', () => {
  it('should transform raw data to structured format', () => {
    const rawData = {
      name: 'ASUS ROG Zephyrus G14',
      size: '尺寸：14吋 2K',
      cpu: 'CPU：AMD Ryzen-5600H',
      ram: '16GB Max 32G',
      ssd: '512GB SSD',
      vga: 'VGA：NVIDIA RTX 4060',
      interface: 'USB 3.0, Thunderbolt 4',
      weight: '1.5Kg',
      price: 'NT35000',
      os: 'Windows 11'
    };

    const result = transformRawData(rawData);

    expect(result.property.brand).toBe('ASUS');
    expect(result.property.size).toBe(14);
    expect(result.property.cpu).toBe('AMD Ryzen');
    expect(result.property.ramBasic).toBe(16);
    expect(result.property.ramMax).toBe(32);
    expect(result.property.ssd).toBe(512);
    expect(result.property.vga).toBe('NVIDIA RTX');
    expect(result.property.thunderbolt).toBe(true);
    expect(result.property.weight).toBe(1.5);
    expect(result.property.price).toBe(35000);
    expect(result.property.date).toBeDefined();
    expect(result.property.time).toBeDefined();
    
    // Should include original data
    expect(result.name).toBe('ASUS ROG Zephyrus G14');
    expect(result.os).toBe('Windows 11');
  });
});