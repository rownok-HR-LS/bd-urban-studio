import { indexById, type Bundle, type Product } from '@bdu/core';
import { bundles as seedBundles, products as seedProducts } from '@bdu/core/catalog';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { supabase } from './supabase';

interface Catalog {
  products: Product[];
  bundles: Bundle[];
  byId: Map<string, Product>;
  loading: boolean;
  error: string | null;
  demo: boolean;
}

const CatalogContext = createContext<Catalog | null>(null);

type ProductRow = {
  id: string; sku: string; category: Product['category']; name_en: string; name_bn: string;
  description_en: string; description_bn: string; price: number; stock: number; unit: string;
  weight_kg: number; care_level: Product['care_level']; aesthetic_tags: Product['aesthetic_tags'];
  supplier_id: string; illustration: Product['illustration']; image_url: string | null; active: boolean;
  plant: Product['plant'] | null; pot: Product['pot'] | null; hardware: Product['hardware'] | null;
};

type BundleRow = {
  id: string; slug: string; name_en: string; name_bn: string; description_en: string; description_bn: string;
  discount_pct: number; min_sun_hours: number; max_sun_hours: number; illustration: Bundle['illustration'];
  bundle_items: { product_id: string; quantity: number }[];
};

function fromProductRow(r: ProductRow): Product {
  return {
    id: r.id, sku: r.sku, category: r.category,
    name: { en: r.name_en, bn: r.name_bn },
    description: { en: r.description_en, bn: r.description_bn },
    price: Number(r.price), cost: 0, stock: r.stock, unit: r.unit, weight_kg: Number(r.weight_kg),
    care_level: r.care_level, aesthetic_tags: r.aesthetic_tags, supplier_id: r.supplier_id,
    illustration: r.illustration, image_url: r.image_url, active: r.active,
    plant: r.plant ?? undefined, pot: r.pot ?? undefined, hardware: r.hardware ?? undefined,
  };
}

function fromBundleRow(r: BundleRow): Bundle {
  return {
    id: r.id, slug: r.slug,
    name: { en: r.name_en, bn: r.name_bn },
    description: { en: r.description_en, bn: r.description_bn },
    discount_pct: Number(r.discount_pct), min_sun_hours: Number(r.min_sun_hours), max_sun_hours: Number(r.max_sun_hours),
    illustration: r.illustration, items: r.bundle_items,
  };
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(supabase ? [] : seedProducts);
  const [bundles, setBundles] = useState<Bundle[]>(supabase ? [] : seedBundles);
  const [loading, setLoading] = useState(supabase !== null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    Promise.all([
      supabase.from('products').select('*').order('sku'),
      supabase.from('bundles').select('*, bundle_items(product_id, quantity)').order('id'),
    ])
      .then(([p, b]) => {
        if (cancelled) return;
        if (p.error || b.error) throw p.error ?? b.error;
        setProducts((p.data as ProductRow[]).map(fromProductRow));
        setBundles((b.data as BundleRow[]).map(fromBundleRow));
      })
      .catch((e: Error) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<Catalog>(
    () => ({ products, bundles, byId: indexById(products), loading, error, demo: supabase === null }),
    [products, bundles, loading, error],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): Catalog {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used inside CatalogProvider');
  return ctx;
}
