import dayjs from 'dayjs';

/**
 * 資料轉換方法集合
 */
export const dataTransformers = {
  /**
   * 提取品牌名稱
   */
  getBrand(nameText) {
    if (nameText.includes('捷元')) return '捷元';
    return [...nameText].filter(char => char !== '★').join('').split(' ')[0];
  },

  /**
   * 提取螢幕尺寸
   */
  getSize(sizeText) {
    return Number(sizeText.match(/尺寸：(\d+\.?\d).+/)?.[1]);
  },

  /**
   * 提取 CPU 資訊
   */
  getCpu(cpuText) {
    const splitArr = cpuText.split(' ');
    const cpuBrand = splitArr[0].match(/CPU：(.+)/)?.[1];
    const cpuLevel = splitArr[1].includes('-') ? splitArr[1].match(/(.+)-/)?.[1] : splitArr[1];
    return `${cpuBrand} ${cpuLevel}`;
  },

  /**
   * 提取基本記憶體容量
   */
  getRamBasic(ramText) {
    const regularResultGB = ramText.match(/([0-9]*)GB/);
    const regularResultG = ramText.match(/([0-9]*)G/);

    if (regularResultGB == null && regularResultG == null) {
      return null;
    } else if (regularResultGB) {
      return Number(regularResultGB[1]);
    } else if (regularResultG) {
      return Number(regularResultG[1]);
    }
  },

  /**
   * 提取最大記憶體容量
   */
  getRamMax(ramText) {
    const regularResult_G = ramText.match(/Max ([0-9]*)G/) || ramText.match(/Max([0-9]*)G/);
    const regularResultDotG = ramText.match(/Max\.([0-9]*)G/);
    const regularResultColonG = ramText.match(/Max\: ([0-9]*)G/) || ramText.match(/Max\:([0-9]*)G/);

    if (regularResult_G == null && regularResultDotG == null && regularResultColonG == null) {
      return null;
    } else if (regularResult_G) {
      return Number(regularResult_G[1]);
    } else if (regularResultDotG) {
      return Number(regularResultDotG[1]);
    } else if (regularResultColonG) {
      return Number(regularResultColonG[1]);
    }
  },

  /**
   * 提取 SSD 容量 (GB)
   */
  getSSD(ssdText) {
    const tb = ssdText.match(/(\d+)TB/);
    const gb = ssdText.match(/(\d+)(GB|G)/);
    
    if (tb == null && gb == null) {
      return null;
    } else if (tb) {
      return Number(tb[1]) * 1024;
    } else if (gb) {
      return Number(gb[1]);
    }
  },

  /**
   * 提取顯卡資訊
   */
  getVGA(vgaText) {
    const cleanString = vgaText.split('VGA：')[1] || vgaText.split('獨顯：')[1] || vgaText.split('內顯：')[1];
    const brand = cleanString?.[0];
    
    if (brand === 'Intel') return 'Intel';
    return cleanString.split(' ').splice(0, 2).join(' ');
  },

  /**
   * 檢查是否支援 Thunderbolt
   */
  getThunderbolt(interfaceText) {
    return interfaceText.includes('Thunderbolt ');
  },

  /**
   * 提取重量 (kg)
   */
  getWeight(weightText) {
    const regularResultG = weightText.match(/([0-9.]*)g/);
    const regularResultKG = weightText.match(/([0-9.]*)Kg/i);
    const regularResultNoKG = weightText.match(/([0-9.]*) /i);

    if (regularResultG == null && regularResultKG == null && regularResultNoKG == null) {
      return null;
    } else if (regularResultKG) {
      return Number(regularResultKG[1]);
    } else if (regularResultG) {
      return Number(regularResultG[1]) / 1000;
    } else if (regularResultNoKG) {
      return Number(regularResultNoKG[1]);
    }
  },

  /**
   * 提取價格
   */
  getPrice(priceText) {
    return Number(priceText.match(/NT([0-9]+)/)[1]);
  }
};

/**
 * 轉換原始資料為結構化資料
 */
export function transformRawData(rawData) {
  const property = {
    brand: dataTransformers.getBrand(rawData.name),
    size: dataTransformers.getSize(rawData.size),
    cpu: dataTransformers.getCpu(rawData.cpu),
    ramBasic: dataTransformers.getRamBasic(rawData.ram),
    ramMax: dataTransformers.getRamMax(rawData.ram) || dataTransformers.getRamBasic(rawData.ram),
    ssd: dataTransformers.getSSD(rawData.ssd),
    vga: dataTransformers.getVGA(rawData.vga),
    thunderbolt: dataTransformers.getThunderbolt(rawData.interface),
    weight: dataTransformers.getWeight(rawData.weight),
    price: dataTransformers.getPrice(rawData.price),
    date: dayjs().format('YYYY-MM-DD'),
    time: dayjs().format('YYYY-MM-DD HH:mm:ss')
  };

  return {
    ...rawData,
    property,
  };
}