import { localDigits } from '@bdu/core';

import { Badge, PageHeader } from '../components/ui';
import { useCatalogStore } from '../lib/catalog-store';
import { usePrefs } from '../lib/prefs';

export function Suppliers() {
  const { t, locale } = usePrefs();
  const { suppliers, products } = useCatalogStore();
  return (
    <>
      <PageHeader title={t((d) => d.admin.nav.suppliers)} subtitle={t((d) => d.admin.suppliers.subtitle)} />
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-surface-alt text-left text-xs text-muted uppercase">
            <tr>
              <th className="px-4 py-3">{t((d) => d.admin.catalog.name)}</th>
              <th className="px-4 py-3">{t((d) => d.admin.suppliers.kind)}</th>
              <th className="px-4 py-3">{t((d) => d.admin.suppliers.city)}</th>
              <th className="px-4 py-3 text-right">{t((d) => d.admin.suppliers.leadTime)}</th>
              <th className="px-4 py-3">{t((d) => d.admin.suppliers.reliability)}</th>
              <th className="px-4 py-3 text-right">{t((d) => d.admin.suppliers.products)}</th>
              <th className="px-4 py-3">{t((d) => d.admin.suppliers.terms)}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {suppliers.map((s) => {
              const score = s.reliability_score;
              return (
                <tr key={s.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-muted">
                      {s.contact_name} · {s.phone}
                    </p>
                  </td>
                  <td className="px-4 py-3">{t((d) => d.admin.suppliers.kinds[s.kind])}</td>
                  <td className="px-4 py-3">
                    {t((d) => d.admin.suppliers.cities[s.city])}
                    <span className="text-muted"> · {s.area}</span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{t((d) => d.admin.suppliers.days, { days: s.lead_time_days })}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-20 rounded-full bg-surface-alt">
                        <span
                          className={`block h-full rounded-full ${score >= 85 ? 'bg-success' : score >= 70 ? 'bg-sun' : 'bg-danger'}`}
                          style={{ width: `${score}%` }}
                        />
                      </span>
                      <span className="tabular-nums">{localDigits(score, locale)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{localDigits(products.filter((p) => p.supplier_id === s.id).length, locale)}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    {s.payment_terms} {s.is_sample && <Badge tone="muted">{t((d) => d.admin.suppliers.sample)}</Badge>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
