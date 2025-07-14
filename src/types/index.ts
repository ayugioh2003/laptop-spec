export interface LaptopProperty {
  brand: string;
  size: number;
  cpu: string;
  ramBasic: number;
  ramMax: number;
  ssd: number;
  vga: string;
  thunderbolt: boolean;
  weight: number;
  price: number;
  date: string;
  time: string;
}

export interface LaptopSpec {
  index: number;
  img: string;
  name: string;
  size: string;
  cpu: string;
  ram: string;
  ssd: string;
  vga: string;
  interface: string;
  weight: string;
  os: string;
  price: string;
  property: LaptopProperty;
}

export interface FilterForm {
  sizeMin: number | null;
  sizeMax: number | null;
  ramMin: number | null;
  weightMax: number | null;
  priceMin: number | null;
  priceMax: number | null;
  brand: string | null;
  cpu: string | null;
  vga: string | null;
}

export interface ProductCardData {
  product: LaptopSpec;
}

export interface StatsData {
  totalProducts: LaptopSpec[];
  filteredProducts: LaptopSpec[];
}