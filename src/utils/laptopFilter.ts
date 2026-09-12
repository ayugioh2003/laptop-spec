import type { LaptopSpec, LaptopProperty, FilterForm } from '@/types'

/**
 * 筆電篩選邏輯（純函式，不依賴 Vue，方便測試與日後給 MCP 共用）
 */

/**
 * 依表單條件過濾筆電清單
 * 條件為 falsy（null / 0 / undefined）時該條件不生效
 */
export function filterLaptops(laptops: LaptopSpec[], form: Partial<FilterForm> = {}): LaptopSpec[] {
  const { sizeMin, sizeMax, ramMin, weightMax, priceMin, priceMax, brand, cpu, vga } = form

  return laptops.filter(({ property: p }) =>
    (!sizeMin || sizeMin <= p.size) &&
    (!sizeMax || p.size <= sizeMax) &&
    (!ramMin || p.ramMax >= ramMin) &&
    (!weightMax || p.weight <= weightMax) &&
    (!priceMin || priceMin <= p.price) &&
    (!priceMax || p.price <= priceMax) &&
    (!brand || p.brand === brand) &&
    (!cpu || p.cpu === cpu) &&
    (!vga || p.vga === vga)
  )
}

/**
 * 取出某個 property 欄位的所有相異值（已排序），用來產生下拉選單
 */
export function uniqueValues<K extends keyof LaptopProperty>(
  laptops: LaptopSpec[],
  key: K,
): LaptopProperty[K][] {
  return [...new Set(laptops.map((lt) => lt.property[key]))].sort()
}
