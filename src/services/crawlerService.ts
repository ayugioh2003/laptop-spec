import axios from 'axios';
import iconv from 'iconv-lite';
import { CRAWLER_CONFIG } from '../../config.ts';
import { parseProductCards, extractRawProductData, hasValidChildren } from '../utils/dataParser.js';
import { transformRawData } from '../utils/dataTransformer.js';
import { filterIrrelevantProducts, addIndexToProducts } from '../utils/dataFilter.js';
import { writeDataToFile } from '../utils/fileWriter.js';
import type { LaptopSpec } from '@/types';

/**
 * 處理爬蟲回應資料
 */
export async function processData(responseData: ArrayBuffer): Promise<LaptopSpec[]> {
  try {
    // 解碼網頁內容
    const body = iconv.decode(Buffer.from(responseData), CRAWLER_CONFIG.ENCODING);
    
    // 解析商品卡片
    const cardList = parseProductCards(body);
    const cardListLength = cardList.length;
    const result: Omit<LaptopSpec, 'property'>[] = [];

    // 提取原始資料
    for (let i = 0; i < cardListLength; i += 1) {
      const card = cardList[i];

      if (!hasValidChildren(card)) {
        continue;
      }

      const rawData = extractRawProductData(card);
      result.push(rawData);
    }

    // 過濾不相關產品
    const filteredResult = filterIrrelevantProducts(result);
    
    // 加上索引編號
    const indexedResult = addIndexToProducts(filteredResult);

    // 轉換資料格式
    const transformedResult = indexedResult.map(item => transformRawData(item));

    // 寫入檔案
    await writeDataToFile(transformedResult);

    return transformedResult;
  } catch (error) {
    console.error('處理資料時發生錯誤:', error);
    throw error;
  }
}

/**
 * 執行爬蟲任務
 */
export async function runCrawler(): Promise<LaptopSpec[]> {
  try {
    const config = {
      url: CRAWLER_CONFIG.URL,
      method: 'GET' as const,
      responseType: 'arraybuffer' as const,
    };

    const response = await axios(config);
    const result = await processData(response.data);
    
    return result;
  } catch (error) {
    console.error('爬蟲執行失敗:', error);
    throw error;
  }
}