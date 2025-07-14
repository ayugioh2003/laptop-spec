import { runCrawler } from './src/services/crawlerService.js';

/**
 * 主程式入口
 */
async function main() {
  try {
    await runCrawler();
    console.log('爬蟲執行完成');
  } catch (error) {
    console.error('爬蟲執行失敗:', error);
    process.exit(1);
  }
}

main();