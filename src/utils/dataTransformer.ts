import dayjs from 'dayjs';
import type { LaptopSpec, LaptopProperty } from '@/types';

/**
 * 資料轉換方法集合
 */
export const dataTransformers = {
  /**
   * 提取品牌名稱
   */
  getBrand(nameText: string): string {
    if (nameText.includes('捷元')) return '捷元';
    return [...nameText].filter(char => char !== '★').join('').split(' ')[0];
  },

  /**
   * 提取螢幕尺寸
   */
  getSize(sizeText: string): number {
    const match = sizeText.match(/尺寸：(\d+\.?\d*).+/);
    return match ? Number(match[1]) : 0;
  },

  /**
   * 提取 CPU 資訊
   */
  getCpu(cpuText: string): string {
    const splitArr = cpuText.split(' ');
    const cpuBrand = splitArr[0].match(/CPU：(.+)/)?.[1];
    const cpuLevel = splitArr[1]?.includes('-') ? splitArr[1].match(/(.+)-/)?.[1] : splitArr[1];
    return `${cpuBrand} ${cpuLevel}`;
  },

  /**
   * 提取基本記憶體容量
   */
  getRamBasic(ramText: string): number | null {
    const regularResultGB = ramText.match(/([0-9]*)GB/);
    const regularResultG = ramText.match(/([0-9]*)G/);

    if (regularResultGB) {
      return Number(regularResultGB[1]);
    } else if (regularResultG) {
      return Number(regularResultG[1]);
    }
    return null;
  },

  /**
   * 提取最大記憶體容量
   */
  getRamMax(ramText: string): number | null {
    const regularResult_G = ramText.match(/Max ([0-9]*)G/) || ramText.match(/Max([0-9]*)G/);
    const regularResultDotG = ramText.match(/Max\.([0-9]*)G/);
    const regularResultColonG = ramText.match(/Max\: ([0-9]*)G/) || ramText.match(/Max\:([0-9]*)G/);

    if (regularResult_G) {
      return Number(regularResult_G[1]);
    } else if (regularResultDotG) {
      return Number(regularResultDotG[1]);
    } else if (regularResultColonG) {
      return Number(regularResultColonG[1]);
    }
    return null;
  },

  /**
   * 提取 SSD 容量 (GB)
   */
  getSSD(ssdText: string): number | null {
    const tb = ssdText.match(/(\d+)TB/);
    const gb = ssdText.match(/(\d+)(GB|G)/);
    
    if (tb) {
      return Number(tb[1]) * 1024;
    } else if (gb) {
      return Number(gb[1]);
    }
    return null;
  },

  /**
   * 提取顯卡資訊
   */
  getVGA(vgaText: string): string {
    const cleanString = vgaText.split('VGA：')[1] || vgaText.split('獨顯：')[1] || vgaText.split('內顯：')[1];
    
    if (cleanString?.startsWith('Intel')) return 'Intel';
    return cleanString?.split(' ').splice(0, 2).join(' ') || '';
  },

  /**
   * 檢查是否支援 Thunderbolt
   */
  getThunderbolt(interfaceText: string): boolean {
    return interfaceText.includes('Thunderbolt ');
  },

  /**
   * 提取重量 (kg)
   */
  getWeight(weightText: string): number | null {
    const regularResultG = weightText.match(/([0-9.]*)g/);
    const regularResultKG = weightText.match(/([0-9.]*)Kg/i);
    const regularResultNoKG = weightText.match(/([0-9.]*) /i);

    if (regularResultKG) {
      return Number(regularResultKG[1]);
    } else if (regularResultG) {
      return Number(regularResultG[1]) / 1000;
    } else if (regularResultNoKG) {
      return Number(regularResultNoKG[1]);
    }
    return null;
  },

  /**
   * 提取價格
   */
  getPrice(priceText: string): number {
    const match = priceText.match(/NT([0-9]+)/);
    return match ? Number(match[1]) : 0;
  }
};

/**
 * 轉換原始資料為結構化資料
 */
export function transformRawData(rawData: Omit<LaptopSpec, 'property'>): LaptopSpec {
  const property: LaptopProperty = {
    brand: dataTransformers.getBrand(rawData.name),
    size: dataTransformers.getSize(rawData.size),
    cpu: dataTransformers.getCpu(rawData.cpu),
    ramBasic: dataTransformers.getRamBasic(rawData.ram) || 0,
    ramMax: dataTransformers.getRamMax(rawData.ram) || dataTransformers.getRamBasic(rawData.ram) || 0,
    ssd: dataTransformers.getSSD(rawData.ssd) || 0,
    vga: dataTransformers.getVGA(rawData.vga),
    thunderbolt: dataTransformers.getThunderbolt(rawData.interface),
    weight: dataTransformers.getWeight(rawData.weight) || 0,
    price: dataTransformers.getPrice(rawData.price),
    date: dayjs().format('YYYY-MM-DD'),
    time: dayjs().format('YYYY-MM-DD HH:mm:ss')
  };

  return {
    ...rawData,
    property,
  };
}