import {
  filterProducts,
  formatPrice,
  localDigits,
  margin,
  pick,
  stockState,
  type ProductCategory,
} from '@bdu/core';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';

import { Badge, Button, Card, Illustration, inputClass, PageHeader, selectClass } from '../components/ui';
import { useCatalogStore } from '../lib/catalog-store';
import { usePrefs } from '../lib/prefs';
import { ProductEditor } from './ProductEditor';

const CATEGORIES: (ProductCategory | 'all')[] = ['all', 'plant', 'pot', 'hardware', 'accessory'];

export function Catalog() {
  const { t, locale } = usePrefs();
  const { products, suppliers, suppliersById, demo, resetDemo } = useCatalogStore();
  const [params, setParams] = useSearchParams();
  const [text, setText] = useState('');
  const [category, setCategory] = useState<ProductCategory | 'all'>('all');
  const [supplier, setSupplier] = useState('all');
  const [lowOnly, setLowOnly] = useState(false);
  const editing = params.get('edit');

  const rows = useMemo(
    () =>
      filterProducts(products, { category, text, includeInactive: true }).filter(
        (p) => (supplier === 'all' || p.supplier_id === supplier) && (!lowOnly || stockState(p) !== 'in'),
      ),
    [products, category, text, supplier, lowOnly],
  );

  const pct = (v: number) => `${localDigits(Math.round(v * 100), locale)}%`;
  const open = (id: string) => setParams({ edit: id });

  return (
    <>
      <PageHeader
        title={t((d) => d.admin.nav.catalog)}
        subtitle={t((d) => d.admin.catalog.count, { count: rows.length })}
        actions={
          demo && (
            <Button variant="ghost" onClick={resetDemo}>
              {t((d) => d.admin.catalog.resetDemo)}
            </Button>
          )
        }
      />

      <Card className="mb-4 flex flex-wrap items-center gap-3 p-3">
        <label className="relative min-w-60 flex-1">
          <span className="sr-only">{t((d) => d.common.search)}</span>
          <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder={t((d) => d.admin.catalog.searchPlaceholder)} className={`${inputClass} pl-9`} />
        </label>
        <select value={category} onChange={(e) => setCategory(e.target.value as ProductCategory | 'all')} className={selectClass} aria-label={t((d) => d.admin.catalog.category)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c === 'all' ? t((d) => d.common.all) : t((d) => d.shop.categories[c])}
            </option>
          ))}
        </select>
        <select value={supplier} onChange={(e) => setSupplier(e.target.value)} className={`${selectClass} max-w-64`} aria-label={t((d) => d.admin.catalog.supplier)}>
          <option value="all">{t((d) => d.admin.catalog.allSuppliers)}</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} className="size-4 accent-[var(--c-primary)]" />
          {t((d) => d.admin.catalog.lowStockOnly)}
        </label>
      </Card>

      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-surface-alt text-left text-xs text-muted uppercase">
            <tr>
              <th className="px-4 py-3">{t((d) => d.admin.catalog.name)}</th>
              <th className="px-4 py-3">{t((d) => d.admin.catalog.category)}</th>
              <th className="px-4 py-3 text-right">{t((d) => d.admin.catalog.price)}</th>
              <th className="px-4 py-3 text-right">{t((d) => d.admin.catalog.cost)}</th>
              <th className="px-4 py-3 text-right">{t((d) => d.admin.catalog.margin)}</th>
              <th className="px-4 py-3 text-right">{t((d) => d.admin.catalog.stock)}</th>
              <th className="px-4 py-3">{t((d) => d.admin.catalog.supplier)}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((p) => {
              const m = margin(p);
              const stock = stockState(p);
              return (
                <tr key={p.id} className={`cursor-pointer hover:bg-surface-alt/60 ${p.active ? '' : 'opacity-50'}`} onClick={() => open(p.id)}>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <span className="shrink-0 rounded-lg bg-surface-alt">
                        <Illustration spec={p.illustration} size={40} />
                      </span>
                      <div className="min-w-0">
                        <button type="button" onClick={(e) => (e.stopPropagation(), open(p.id))} className="text-left font-medium hover:underline">
                          {pick(p.name, locale)}
                        </button>
                        <p className="text-xs text-muted">
                          {p.sku}
                          {p.plant && <span className="italic"> · {p.plant.species}</span>}
                        </p>
                      </div>
                      {!p.active && <Badge tone="muted">{t((d) => d.admin.catalog.inactive)}</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-2">{t((d) => d.shop.categories[p.category])}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{formatPrice(p.price, locale)}</td>
                  <td className="px-4 py-2 text-right text-muted tabular-nums">{formatPrice(p.cost, locale)}</td>
                  <td className="px-4 py-2 text-right">
                    <Badge tone={m < 0 ? 'danger' : m < 0.25 ? 'sun' : 'primary'}>{pct(m)}</Badge>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Badge tone={stock === 'out' ? 'danger' : stock === 'low' ? 'sun' : 'muted'}>{localDigits(p.stock, locale)}</Badge>
                  </td>
                  <td className="max-w-48 truncate px-4 py-2 text-ink-soft">{suppliersById.get(p.supplier_id)?.name ?? p.supplier_id}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing && <ProductEditor id={editing} onClose={() => setParams({})} />}
    </>
  );
}
