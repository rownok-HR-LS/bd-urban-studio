import { bundlePrice, formatPrice, localDigits, pick } from '@bdu/core';
import { Sun } from 'lucide-react';

import { Badge, Card, Illustration, PageHeader } from '../components/ui';
import { useCatalogStore } from '../lib/catalog-store';
import { usePrefs } from '../lib/prefs';

export function Bundles() {
  const { t, locale } = usePrefs();
  const { bundles, productsById } = useCatalogStore();
  return (
    <>
      <PageHeader title={t((d) => d.admin.nav.bundles)} subtitle={t((d) => d.admin.bundles.subtitle)} />
      <div className="grid gap-4 md:grid-cols-2">
        {bundles.map((b) => {
          const { full, final } = bundlePrice(b, productsById);
          return (
            <Card key={b.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl">{pick(b.name, locale)}</h2>
                  <p className="mt-1 text-sm text-ink-soft">{pick(b.description, locale)}</p>
                </div>
                <Badge tone="accent">{t((d) => d.shop.bundleSave, { pct: b.discount_pct })}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-muted">
                  <Sun size={14} /> {t((d) => d.product.sunRange, { min: b.min_sun_hours, max: b.max_sun_hours })}
                </span>
                <span>
                  <span className="font-bold text-primary">{formatPrice(final, locale)}</span>{' '}
                  <span className="text-muted line-through">{formatPrice(full, locale)}</span>
                </span>
              </div>
              <ul className="mt-4 divide-y divide-line">
                {b.items.map((item) => {
                  const p = productsById.get(item.product_id);
                  if (!p) return null;
                  return (
                    <li key={item.product_id} className="flex items-center gap-3 py-1.5 text-sm">
                      <span className="rounded-md bg-surface-alt">
                        <Illustration spec={p.illustration} size={32} />
                      </span>
                      <span className="flex-1">{pick(p.name, locale)}</span>
                      <span className="text-muted tabular-nums">
                        {localDigits(item.quantity, locale)} × {formatPrice(p.price, locale)}
                      </span>
                      {p.stock < item.quantity && <Badge tone="danger">{t((d) => d.common.outOfStock)}</Badge>}
                    </li>
                  );
                })}
              </ul>
            </Card>
          );
        })}
      </div>
    </>
  );
}
