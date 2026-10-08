import { HashRouter, Route, Routes } from 'react-router';

import { Layout } from './components/Layout';
import { CatalogStoreProvider } from './lib/catalog-store';
import { PrefsProvider, usePrefs } from './lib/prefs';
import { Bundles } from './pages/Bundles';
import { Catalog } from './pages/Catalog';
import { ComingSoon } from './pages/ComingSoon';
import { Dashboard } from './pages/Dashboard';
import { Suppliers } from './pages/Suppliers';

function AppRoutes() {
  const { t } = usePrefs();
  const later: [string, string][] = [
    ['orders', t((d) => d.admin.nav.orders)],
    ['designs', t((d) => d.admin.nav.designs)],
    ['review', t((d) => d.admin.nav.reviewQueue)],
    ['crews', t((d) => d.admin.nav.crews)],
    ['routes', t((d) => d.admin.nav.routes)],
    ['subscriptions', t((d) => d.admin.nav.subscriptions)],
    ['finance', t((d) => d.admin.nav.finance)],
    ['supplier-portal', t((d) => d.admin.nav.supplierPortal)],
    ['settings', t((d) => d.admin.nav.settings)],
  ];
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="catalog" element={<Catalog />} />
        <Route path="bundles" element={<Bundles />} />
        <Route path="suppliers" element={<Suppliers />} />
        {later.map(([path, title]) => (
          <Route key={path} path={path} element={<ComingSoon title={title} />} />
        ))}
        <Route path="*" element={<ComingSoon title={t((d) => d.admin.comingSoon.title)} />} />
      </Route>
    </Routes>
  );
}

// Hash routing keeps deep links working on GitHub Pages, which has no server rewrites.
export default function App() {
  return (
    <PrefsProvider>
      <CatalogStoreProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </CatalogStoreProvider>
    </PrefsProvider>
  );
}
