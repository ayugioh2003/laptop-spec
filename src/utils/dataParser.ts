import * as cheerio from 'cheerio';
import { CRAWLER_CONFIG } from '../../config.ts';
import type { LaptopSpec } from '@/types';

interface CardElement {
  attribs: { src: string };
  children: Array<{ children: Array<{ data: string }> }>;
}

/**
 * 解析 HTML 獲取商品卡片列表
 */
export function parseProductCards(htmlBody: string): cheerio.Cheerio<any> {
  const $ = cheerio.load(htmlBody);
  const cardList = $('.main').find('span');
  return cardList;
}

/**
 * 提取單個商品的原始資料
 */
export function extractRawProductData(card: { children: any[] }): Omit<LaptopSpec, 'property'> {
  const unUselessElementIndex = CRAWLER_CONFIG.REMOVE_USELESS_ELEMENT_INDEX;
  card.children = card.children.filter((child, index) => index !== unUselessElementIndex);

  return {
    index: 0, // 將在後續處理中設定
    img: card.children[0].attribs.src,
    name: card.children[1].children[0].data,
    size: card.children[2].children?.[0]?.data || '',
    cpu: card.children[3].children[0].data,
    ram: card.children[4].children[0].data,
    ssd: card.children[5].children[0].data,
    vga: card.children[6].children[0].data,
    interface: card.children[7].children[0].data,
    weight: card.children[8].children[0].data,
    os: card.children[9].children[0].data,
    price: card.children[10].children[0].data,
  };
}

/**
 * 檢查商品是否有足夠的子元素
 */
export function hasValidChildren(card: { children: any[] }): boolean {
  return card.children.length >= CRAWLER_CONFIG.MIN_CHILDREN;
}