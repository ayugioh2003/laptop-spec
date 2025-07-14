import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { processData, runCrawler } from '../../src/services/crawlerService.js';

// Mock dependencies
vi.mock('axios');
vi.mock('../../src/utils/dataParser.js', () => ({
  parseProductCards: vi.fn(),
  extractRawProductData: vi.fn(),
  hasValidChildren: vi.fn()
}));
vi.mock('../../src/utils/dataTransformer.js', () => ({
  transformRawData: vi.fn()
}));
vi.mock('../../src/utils/dataFilter.js', () => ({
  filterIrrelevantProducts: vi.fn(),
  addIndexToProducts: vi.fn()
}));
vi.mock('../../src/utils/fileWriter.js', () => ({
  writeDataToFile: vi.fn()
}));

describe('crawlerService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('runCrawler', () => {
    it('should run crawler successfully', async () => {
      const mockResponse = {
        data: Buffer.from('test html content', 'utf8')
      };

      axios.mockResolvedValue(mockResponse);

      // Mock all the utility functions
      const { parseProductCards } = await import('../../src/utils/dataParser.js');
      const { filterIrrelevantProducts, addIndexToProducts } = await import('../../src/utils/dataFilter.js');
      const { transformRawData } = await import('../../src/utils/dataTransformer.js');
      const { writeDataToFile } = await import('../../src/utils/fileWriter.js');

      parseProductCards.mockReturnValue([]);
      filterIrrelevantProducts.mockReturnValue([]);
      addIndexToProducts.mockReturnValue([]);
      transformRawData.mockReturnValue({ transformed: true });
      writeDataToFile.mockResolvedValue();

      const result = await runCrawler();

      expect(axios).toHaveBeenCalledWith({
        url: 'http://www.coolpc.com.tw/eachview.php?IGrp=2',
        method: 'GET',
        responseType: 'arraybuffer'
      });

      expect(result).toBeDefined();
    });

    it('should handle axios errors', async () => {
      const mockError = new Error('Network error');
      axios.mockRejectedValue(mockError);

      await expect(runCrawler()).rejects.toThrow('Network error');
    });
  });
});