import { indexById, type Bundle, type Product, type Supplier } from '@bdu/core';
import { bundles as seedBundles, products as seedProducts, suppliers as seedSuppliers } from '@bdu/core/catalog';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { supabase } from './supabase';

interface CatalogStore {
  products: Product[];
  suppliers: Supplier[];
  bundles: Bundle[];
  productsById: Map<string, Product>;
  suppliersById: Map<string, Supplier>;
  loading: boolean;
  error: string | null;
  demo: boolean;
  saveProduct: (product: Product) => Promise<void>;
  resetDemo: () => void;
}

const Ctx = createContext<CatalogStore | null>(null);

// In demo mode, edits are kept in this browser only so ops can try the editor.
const DEMO_KEY = 'bdu.admin.demo-products.v1';

function loadDemoEdits(): Record<string, Product> {
  try {
    return JSON.parse(localStorage.getItem(DEMO_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function saveDemoEdits(edits: Record<string, Product>) {
  try {
    localStorage.setItem(DEMO_KEY, JSON.stringify(edits));
  } catch {
    // Storage blocked: edits last until the tab closes.
  }
}

function withDemoEdits(): Product[] {
  const edits = loadDemoEdits();
  const merged = seedProducts.map((p) => edits[p.id] ?? p);
  const added = Object.values(edits).filter((p) => !seedProducts.some((s) => s.id === p.id));
  return [...merged, ...added];
}

type Row = Record<string, unknown> & { product_costs: { cost: number } | null };

function fromRow(r: Row): Product {
  return {
    id: r.id as string,
    sku: r.sku as string,
    category: r.category as Product['category'],
    name: { en: r.name_en as string, bn: r.name_bn as string },
    description: { en: r.description_en as string, bn: r.description_bn as string },
    price: Number(r.price),
    cost: Number(r.product_costs?.cost ?? 0),
    stock: r.stock as number,
    unit: r.unit as string,
    weight_kg: Number(r.weight_kg),
    care_level: r.care_level as Product['care_level'],
    aesthetic_tags: r.aesthetic_tags as Product['aesthetic_tags'],
    supplier_id: r.supplier_id as string,
    illustration: r.illustration as Product['illustration'],
    image_url: (r.image_url as string | null) ?? null,
    active: r.active as boolean,
    plant: (r.plant as Product['plant']) ?? undefined,
    pot: (r.pot as Product['pot']) ?? undefined,
    hardware: (r.hardware as Product['hardware']) ?? undefined,
  };
}

function toRow(p: Product) {
  return {
    id: p.id, sku: p.sku, category: p.category,
    name_en: p.name.en, name_bn: p.name.bn, description_en: p.description.en, description_bn: p.description.bn,
    price: p.price, stock: p.stock, unit: p.unit, weight_kg: p.weight_kg, care_level: p.care_level,
    aesthetic_tags: p.aesthetic_tags, supplier_id: p.supplier_id, illustration: p.illustration,
    image_url: p.image_url ?? null, active: p.active,
    plant: p.plant ?? null, pot: p.pot ?? null, hardware: p.hardware ?? null,
  };
}

export function CatalogStoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => (supabase ? [] : withDemoEdits()));
  const [suppliers, setSuppliers] = useState<Supplier[]>(supabase ? [] : seedSuppliers);
  const [bundles] = useState<Bundle[]>(seedBundles);
  const [loading, setLoading] = useState(supabase !== null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    Promise.all([
      supabase.from('products').select('*, product_costs(cost)').order('sku'),
      supabase.from('suppliers').select('*').order('id'),
    ])
      .then(([p, s]) => {
        if (p.error || s.error) throw p.error ?? s.error;
        setProducts((p.data as Row[]).map(fromRow));
        setSuppliers(s.data as Supplier[]);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const saveProduct = useCallback(async (product: Product) => {
    if (supabase) {
      const { error: e1 } = await supabase.from('products').upsert(toRow(product));
      if (e1) throw new Error(e1.message);
      const { error: e2 } = await supabase.from('product_costs').upsert({ product_id: product.id, cost: product.cost });
      if (e2) throw new Error(e2.message);
    } else {
      saveDemoEdits({ ...loadDemoEdits(), [product.id]: product });
    }
    setProducts((cur) => {
      const exists = cur.some((p) => p.id === product.id);
      return exists ? cur.map((p) => (p.id === product.id ? product : p)) : [...cur, product];
    });
  }, []);

  const resetDemo = useCallback(() => {
    saveDemoEdits({});
    setProducts(seedProducts);
  }, []);

  const value = useMemo<CatalogStore>(
    () => ({
      products,
      suppliers,
      bundles,
      productsById: indexById(products),
      suppliersById: indexById(suppliers),
      loading,
      error,
      demo: supabase === null,
      saveProduct,
      resetDemo,
    }),
    [products, suppliers, bundles, loading, error, saveProduct, resetDemo],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCatalogStore(): CatalogStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCatalogStore must be used inside CatalogStoreProvider');
  return ctx;
}
