import type { Bundle, Product, ProductCategory } from './types';

export type ShopFlag = 'petSafe' | 'lowLight' | 'fullSun' | 'edible' | 'fragrant' | 'monsoon' | 'easy';

export interface ProductQuery {
  category?: ProductCategory | 'all';
  text?: string;
  flags?: ShopFlag[];
  includeInactive?: boolean;
}

const flagTests: Record<ShopFlag, (p: Product) => boolean> = {
  petSafe: (p) => p.plant?.pet_safe === true,
  lowLight: (p) => (p.plant ? p.plant.min_sun_hours <= 3 : false),
  fullSun: (p) => (p.plant ? p.plant.min_sun_hours >= 5 : false),
  edible: (p) => p.plant?.edible === true,
  fragrant: (p) => p.plant?.fragrant === true,
  monsoon: (p) => p.plant?.monsoon_tolerant === true,
  easy: (p) => p.care_level === 'easy',
};

/** Case-insensitive search across both languages, species, SKU and tags. */
export function matchesText(p: Product, text: string): boolean {
  const q = text.trim().toLowerCase();
  if (!q) return true;
  const haystack = [p.name.en, p.name.bn, p.sku, p.plant?.species ?? '', ...p.aesthetic_tags]
    .join(' ')
    .toLowerCase();
  return q.split(/\s+/).every((word) => haystack.includes(word));
}

export function filterProducts(products: Product[], query: ProductQuery): Product[] {
  return products.filter(
    (p) =>
      (query.includeInactive || p.active) &&
      (!query.category || query.category === 'all' || p.category === query.category) &&
      (!query.text || matchesText(p, query.text)) &&
      (query.flags ?? []).every((f) => flagTests[f](p)),
  );
}

export type StockState = 'in' | 'low' | 'out';

export const LOW_STOCK_THRESHOLD = 5;

export function stockState(p: Product): StockState {
  if (p.stock <= 0) return 'out';
  if (p.stock <= LOW_STOCK_THRESHOLD) return 'low';
  return 'in';
}

/** Gross margin as a fraction (0.35 = 35%). */
export function margin(p: Pick<Product, 'price' | 'cost'>): number {
  return p.price > 0 ? (p.price - p.cost) / p.price : 0;
}

export function bundlePrice(bundle: Bundle, byId: Map<string, Product>): { full: number; final: number } {
  const full = bundle.items.reduce((sum, item) => sum + (byId.get(item.product_id)?.price ?? 0) * item.quantity, 0);
  const final = Math.round((full * (100 - bundle.discount_pct)) / 100);
  return { full, final };
}

export function indexById<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]));
}
