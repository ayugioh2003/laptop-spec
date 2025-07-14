export const CRAWLER_CONFIG = {
  URL: 'http://www.coolpc.com.tw/eachview.php?IGrp=2',
  MIN_CHILDREN: 12,
  OUTPUT_PATH: './src/assets/result/',
  REMOVE_USELESS_ELEMENT_INDEX: 2,
  ENCODING: 'big5' as const,
  FILTERS: {
    EXCLUDED_KEYWORDS: ['電源', '相機', '錶', '手機', '充電器', '快充', 'IO擴充充電DOCK'],
    REQUIRED_PATTERN: /內顯|獨顯/
  }
};