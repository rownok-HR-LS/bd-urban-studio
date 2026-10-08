import type { Dictionary } from '@bdu/core';
import {
  Boxes,
  CalendarClock,
  ClipboardCheck,
  Gauge,
  Leaf,
  Map as MapIcon,
  Menu,
  Package,
  Receipt,
  Repeat,
  Settings,
  Sparkles,
  Store,
  Truck,
  Users,
  X,
} from 'lucide-react';
import { useState, type ComponentType } from 'react';
import { NavLink, Outlet } from 'react-router';

import { useCatalogStore } from '../lib/catalog-store';
import { usePrefs } from '../lib/prefs';

type NavItem = { to: string; icon: ComponentType<{ size?: number }>; label: (d: Dictionary) => string; ready: boolean };

const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: 'catalog',
    items: [
      { to: '/', icon: Gauge, label: (d) => d.admin.nav.dashboard, ready: true },
      { to: '/catalog', icon: Leaf, label: (d) => d.admin.nav.catalog, ready: true },
      { to: '/bundles', icon: Boxes, label: (d) => d.admin.nav.bundles, ready: true },
      { to: '/suppliers', icon: Store, label: (d) => d.admin.nav.suppliers, ready: true },
    ],
  },
  {
    group: 'ops',
    items: [
      { to: '/orders', icon: Package, label: (d) => d.admin.nav.orders, ready: false },
      { to: '/designs', icon: Sparkles, label: (d) => d.admin.nav.designs, ready: false },
      { to: '/review', icon: ClipboardCheck, label: (d) => d.admin.nav.reviewQueue, ready: false },
      { to: '/crews', icon: Users, label: (d) => d.admin.nav.crews, ready: false },
      { to: '/routes', icon: MapIcon, label: (d) => d.admin.nav.routes, ready: false },
      { to: '/subscriptions', icon: Repeat, label: (d) => d.admin.nav.subscriptions, ready: false },
      { to: '/finance', icon: Receipt, label: (d) => d.admin.nav.finance, ready: false },
    ],
  },
  {
    group: 'other',
    items: [
      { to: '/supplier-portal', icon: Truck, label: (d) => d.admin.nav.supplierPortal, ready: false },
      { to: '/settings', icon: Settings, label: (d) => d.admin.nav.settings, ready: false },
    ],
  },
];

function LanguageSwitch() {
  const { locale, setLocale } = usePrefs();
  return (
    <div role="radiogroup" aria-label="Language" className="flex rounded-full border border-line bg-surface p-0.5 text-xs font-bold">
      {(['en', 'bn'] as const).map((l) => (
        <button
          key={l}
          role="radio"
          aria-checked={locale === l}
          onClick={() => setLocale(l)}
          className={`min-w-10 rounded-full px-3 py-1.5 ${locale === l ? 'bg-primary text-primary-ink' : 'text-ink-soft'}`}>
          {l === 'en' ? 'EN' : 'বাং'}
        </button>
      ))}
    </div>
  );
}

export function Layout() {
  const { t } = usePrefs();
  const { demo } = useCatalogStore();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-5" aria-label="Main">
      {NAV.map(({ group, items }) => (
        <ul key={group} className="flex flex-col gap-0.5">
          {items.map(({ to, icon: Icon, label, ready }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-primary text-primary-ink' : 'text-ink-soft hover:bg-surface-alt'
                  } ${ready ? '' : 'opacity-60'}`
                }>
                <Icon size={18} />
                <span className="flex-1">{t(label)}</span>
                {!ready && <CalendarClock size={14} aria-label={t((d) => d.common.comingSoon)} />}
              </NavLink>
            </li>
          ))}
        </ul>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="hidden border-r border-line bg-surface p-4 lg:block">
        <div className="mb-6 px-2">
          <p className="font-display text-xl text-primary">{t((d) => d.brand.name)}</p>
          <p className="text-xs text-muted">{t((d) => d.admin.title)}</p>
        </div>
        {nav}
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-bg/90 px-4 py-3 backdrop-blur lg:px-8">
          <button className="rounded-lg p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <p className="font-display text-lg text-primary lg:hidden">{t((d) => d.brand.name)}</p>
          <div className="ml-auto">
            <LanguageSwitch />
          </div>
        </header>

        {demo && (
          <div className="mx-4 mt-4 rounded-xl bg-sun-soft px-4 py-3 text-sm text-ink-soft lg:mx-8">{t((d) => d.common.demoMode)}</div>
        )}

        <main className="px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>

      {open && (
        <div className="fixed inset-0 z-20 lg:hidden" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-black/40" aria-label={t((d) => d.common.close)} onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-surface p-4">
            <div className="mb-6 flex items-center justify-between px-2">
              <p className="font-display text-xl text-primary">{t((d) => d.brand.name)}</p>
              <button onClick={() => setOpen(false)} aria-label={t((d) => d.common.close)} className="rounded-lg p-2">
                <X size={18} />
              </button>
            </div>
            {nav}
          </div>
        </div>
      )}
    </div>
  );
}
