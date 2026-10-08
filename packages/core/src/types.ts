// Shared domain types for BD-urban Studio. These mirror the Postgres schema in
// supabase/migrations and are used by the mobile app, the admin app and the
// AI design service.

export type Locale = 'en' | 'bn';

/** Text that exists in both English and Bangla. */
export interface Bilingual {
  en: string;
  bn: string;
}

export type ProductCategory = 'plant' | 'pot' | 'hardware' | 'accessory';

export type CareLevel = 'easy' | 'moderate' | 'expert';

export type Season = 'summer' | 'monsoon' | 'autumn' | 'winter' | 'spring' | 'all';

export type AestheticTag =
  | 'modern' | 'boho' | 'minimal' | 'tropical' | 'traditional' | 'rustic' | 'colorful';

export type UseCase = 'relaxing' | 'gardening' | 'entertaining';

/** Drives the generated illustration when no product photo exists. */
export type IllustrationForm =
  | 'trailing' | 'upright' | 'palm' | 'bushy' | 'flowering' | 'herb' | 'succulent' | 'climber' | 'vegetable'
  | 'pot' | 'planter-long' | 'hanging' | 'trellis' | 'irrigation' | 'light' | 'seating' | 'bag' | 'tool' | 'mat';

export interface Illustration {
  form: IllustrationForm;
  /** Main colour (hex), e.g. leaf green or pot terracotta. */
  color: string;
  /** Accent colour (hex), e.g. flower colour. */
  accent?: string;
}

export interface Supplier {
  id: string;
  name: string;
  kind: 'nursery' | 'pots' | 'hardware' | 'accessories';
  city: 'dhaka' | 'chittagong';
  area: string;
  contact_name: string;
  phone: string;
  lead_time_days: number;
  /** 0–100, computed from lead time, defect rate and price stability. */
  reliability_score: number;
  payment_terms: string;
  is_sample: boolean;
}

export interface PlantSpecs {
  species: string;
  min_sun_hours: number;
  max_sun_hours: number;
  water_every_days: number;
  mature_height_cm: number;
  mature_spread_cm: number;
  indoor_ok: boolean;
  outdoor_ok: boolean;
  pet_safe: boolean;
  /** Tolerates heavy monsoon rain / waterlogging risk. */
  monsoon_tolerant: boolean;
  /** Tolerates 35°C+ summer heat on an exposed balcony. */
  heat_tolerant: boolean;
  /** Tolerates salty coastal air (relevant for Chittagong). */
  coastal_ok: boolean;
  edible: boolean;
  fragrant: boolean;
  seasons: Season[];
  /** Recommended pot diameter in inches. */
  pot_size_in: number;
}

export interface PotSpecs {
  material: 'plastic' | 'clay' | 'ceramic' | 'fiberglass' | 'cement' | 'recycled' | 'metal' | 'coir';
  diameter_in: number;
  height_in: number;
  drainage: boolean;
  /** Railing planters hang on the balcony grill instead of using floor space. */
  mount: 'floor' | 'railing' | 'hanging' | 'wall';
  self_watering: boolean;
}

export interface HardwareSpecs {
  kind: 'trellis' | 'rail' | 'wall-mount' | 'hanging-system' | 'irrigation' | 'grow-light' | 'lighting' | 'seating' | 'flooring' | 'shade';
  dimensions_cm: string;
  load_rating_kg?: number;
  install_difficulty: 1 | 2 | 3;
  needs_power: boolean;
  needs_drilling: boolean;
}

export interface Product {
  id: string;
  sku: string;
  category: ProductCategory;
  name: Bilingual;
  description: Bilingual;
  /** Retail price in BDT. */
  price: number;
  /** Cost of goods in BDT (admin only). */
  cost: number;
  stock: number;
  unit: string;
  weight_kg: number;
  care_level: CareLevel;
  aesthetic_tags: AestheticTag[];
  supplier_id: string;
  illustration: Illustration;
  image_url?: string | null;
  active: boolean;
  plant?: PlantSpecs;
  pot?: PotSpecs;
  hardware?: HardwareSpecs;
}

export interface BundleItem {
  product_id: string;
  quantity: number;
}

export interface Bundle {
  id: string;
  slug: string;
  name: Bilingual;
  description: Bilingual;
  items: BundleItem[];
  /** Discount off the sum of item prices, in percent. */
  discount_pct: number;
  min_sun_hours: number;
  max_sun_hours: number;
  illustration: Illustration;
}
