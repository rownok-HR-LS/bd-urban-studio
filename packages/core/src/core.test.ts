import assert from 'node:assert/strict';
import { test } from 'node:test';

import { bundles, products, suppliers } from './catalog/index.ts';
import { bundlePrice, filterProducts, indexById, margin, stockState } from './catalog-utils.ts';
import { formatPrice, localDigits, toBanglaDigits } from './format.ts';
import { createTranslator, unitLabel } from './i18n/index.ts';
import { illustrationShapes } from './illustration.ts';

test('prices use South Asian grouping and Bangla digits', () => {
  assert.equal(formatPrice(921950, 'en'), '৳9,21,950');
  assert.equal(formatPrice(1500, 'bn'), '৳১,৫০০');
  assert.equal(formatPrice(80, 'en'), '৳80');
  assert.equal(toBanglaDigits('2–6'), '২–৬');
  assert.equal(localDigits(2.5, 'bn'), '২.৫');
});

test('translator fills placeholders and localises numbers', () => {
  assert.equal(createTranslator('en')((d) => d.common.lowStock, { count: 3 }), 'Only 3 left');
  assert.equal(createTranslator('bn')((d) => d.home.guarantee, { days: 60 }), '৬০ দিনের সুস্থ গাছের গ্যারান্টি');
  assert.equal(unitLabel('sq ft', 'bn'), 'বর্গফুট');
  assert.equal(unitLabel('mystery', 'bn'), 'mystery');
});

test('every catalog unit has a translation', () => {
  for (const p of products) assert.notEqual(unitLabel(p.unit, 'bn'), p.unit, `${p.sku} unit "${p.unit}"`);
});

test('shop filters respect pet safety and sunlight', () => {
  const petSafe = filterProducts(products, { flags: ['petSafe'] });
  assert.ok(petSafe.length > 10);
  assert.ok(petSafe.every((p) => p.plant?.pet_safe));
  const lowLight = filterProducts(products, { flags: ['lowLight'] });
  assert.ok(lowLight.every((p) => (p.plant?.min_sun_hours ?? 99) <= 3));
  assert.ok(filterProducts(products, { text: 'তুলসী' }).some((p) => p.sku === 'PLT-0048'));
  assert.ok(filterProducts(products, { text: 'ocimum' }).length >= 2);
});

test('catalog data is internally consistent', () => {
  const supplierIds = new Set(suppliers.map((s) => s.id));
  const byId = indexById(products);
  for (const p of products) {
    assert.ok(supplierIds.has(p.supplier_id), `${p.sku} supplier`);
    assert.ok(margin(p) > 0, `${p.sku} margin`);
    assert.ok(illustrationShapes(p.illustration).length > 0, `${p.sku} illustration`);
  }
  for (const b of bundles) {
    const { full, final } = bundlePrice(b, byId);
    assert.ok(final < full && final > 0, `${b.slug} price`);
  }
  assert.ok(products.some((p) => stockState(p) === 'out'), 'catalog includes out-of-stock items to exercise the UI');
});
