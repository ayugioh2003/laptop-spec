import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import { writeDataToFile, writeDateStampedFile } from '../../src/utils/fileWriter.js';

// Mock fs module
vi.mock('fs', () => ({
  default: {
    writeFile: vi.fn()
  }
}));

describe('fileWriter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('writeDataToFile', () => {
    it('should write data to file successfully', async () => {
      const mockData = [{ name: 'test' }];
      
      // Mock successful write
      fs.writeFile.mockImplementation((path, data, callback) => {
        callback(null);
      });

      await expect(writeDataToFile(mockData)).resolves.toBeUndefined();
      
      expect(fs.writeFile).toHaveBeenCalledWith(
        './src/assets/result/latest_date.json',
        JSON.stringify(mockData),
        expect.any(Function)
      );
    });

    it('should write data to custom filename', async () => {
      const mockData = [{ name: 'test' }];
      const customFilename = 'custom.json';
      
      fs.writeFile.mockImplementation((path, data, callback) => {
        callback(null);
      });

      await writeDataToFile(mockData, customFilename);
      
      expect(fs.writeFile).toHaveBeenCalledWith(
        './src/assets/result/custom.json',
        JSON.stringify(mockData),
        expect.any(Function)
      );
    });

    it('should handle file write errors', async () => {
      const mockData = [{ name: 'test' }];
      const mockError = new Error('Write failed');
      
      fs.writeFile.mockImplementation((path, data, callback) => {
        callback(mockError);
      });

      await expect(writeDataToFile(mockData)).rejects.toThrow('Write failed');
    });
  });

  describe('writeDateStampedFile', () => {
    it('should write data with date stamp', async () => {
      const mockData = [{ name: 'test' }];
      const dateString = '2024-01-15';
      
      fs.writeFile.mockImplementation((path, data, callback) => {
        callback(null);
      });

      await writeDateStampedFile(mockData, dateString);
      
      expect(fs.writeFile).toHaveBeenCalledWith(
        './src/assets/result/2024-01-15.json',
        JSON.stringify(mockData),
        expect.any(Function)
      );
    });
  });
});