import { formatPrice, localDigits, margin, pick, stockState, type ProductCategory } from '@bdu/core';
import { Link } from 'react-router';

import { Badge, Card, Illustration, PageHeader, Stat } from '../components/ui';
import { useCatalogStore } from '../lib/catalog-store';
import { usePrefs } from '../lib/prefs';

const CATEGORIES: ProductCategory[] = ['plant', 'pot', 'hardware', 'accessory'];

export function Dashboard() {
  const { t, locale } = usePrefs();
  const { products } = useCatalogStore();
  const active = products.filter((p) => p.active);
  const low = active.filter((p) => stockState(p) === 'low');
  const out = active.filter((p) => stockState(p) === 'out');
  const avgMargin = active.length ? active.reduce((s, p) => s + margin(p), 0) / active.length : 0;
  const stockValue = active.reduce((s, p) => s + p.cost * Math.max(p.stock, 0), 0);
  const plants = active.filter((p) => p.plant);
  const pct = (v: number) => `${localDigits(Math.round(v * 100), locale)}%`;
  const maxCount = Math.max(...CATEGORIES.map((c) => active.filter((p) => p.category === c).length), 1);

  return (
    <>
      <PageHeader title={t((d) => d.admin.nav.dashboard)} subtitle={t((d) => d.admin.dashboard.subtitle)} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t((d) => d.admin.dashboard.activeProducts)} value={localDigits(active.length, locale)} />
        <Stat label={t((d) => d.admin.dashboard.avgMargin)} value={pct(avgMargin)} />
        <Stat
          label={t((d) => d.admin.dashboard.lowStock)}
          value={localDigits(low.length, locale)}
          hint={out.length ? `${t((d) => d.admin.dashboard.outOfStock)}: ${localDigits(out.length, locale)}` : undefined}
          tone="danger"
        />
        <Stat label={t((d) => d.admin.catalog.stockValue)} value={formatPrice(stockValue, locale)} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-xl">{t((d) => d.admin.dashboard.byCategory)}</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {CATEGORIES.map((c) => {
              const count = active.filter((p) => p.category === c).length;
              return (
                <li key={c} className="grid grid-cols-[140px_1fr_40px] items-center gap-3 text-sm">
                  <span>{t((d) => d.shop.categories[c])}</span>
                  <span className="h-2.5 rounded-full bg-surface-alt">
                    <span className="block h-full rounded-full bg-primary" style={{ width: `${(count / maxCount) * 100}%` }} />
                  </span>
                  <span className="text-right font-bold tabular-nums">{localDigits(count, locale)}</span>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <h2 className="font-display text-xl">{t((d) => d.admin.dashboard.restock)}</h2>
          <ul className="mt-4 divide-y divide-line">
            {[...out, ...low].slice(0, 8).map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-2">
                <span className="rounded-lg bg-surface-alt">
                  <Illustration spec={p.illustration} size={36} />
                </span>
                <Link to={`/catalog?edit=${p.id}`} className="flex-1 text-sm font-medium hover:underline">
                  {pick(p.name, locale)}
                </Link>
                <Badge tone={p.stock <= 0 ? 'danger' : 'sun'}>
                  {p.stock <= 0 ? t((d) => d.common.outOfStock) : t((d) => d.common.lowStock, { count: p.stock })}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="font-display text-xl">{t((d) => d.admin.dashboard.aiReady)}</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">{t((d) => d.admin.dashboard.aiReadyBody)}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge tone="primary">{t((d) => d.admin.dashboard.petSafePlants, { count: plants.filter((p) => p.plant?.pet_safe).length })}</Badge>
          <Badge tone="sky">{t((d) => d.admin.dashboard.monsoonPlants, { count: plants.filter((p) => p.plant?.monsoon_tolerant).length })}</Badge>
        </div>
      </Card>
    </>
  );
}
