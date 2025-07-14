import fs from 'fs';
import { CRAWLER_CONFIG } from '../../config.js';

/**
 * 寫入資料到 JSON 檔案
 */
export function writeDataToFile(data, filename = 'latest_date.json') {
  return new Promise((resolve, reject) => {
    const filePath = `${CRAWLER_CONFIG.OUTPUT_PATH}${filename}`;
    
    fs.writeFile(filePath, JSON.stringify(data), (err) => {
      if (err) {
        console.error('寫入檔案失敗:', err);
        reject(err);
      } else {
        console.log(`資料已成功寫入 ${filename}`);
        resolve();
      }
    });
  });
}

/**
 * 寫入帶日期的資料檔案 (註解掉的功能)
 */
export function writeDateStampedFile(data, dateString) {
  return writeDataToFile(data, `${dateString}.json`);
}