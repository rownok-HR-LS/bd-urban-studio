import { margin, type CareLevel, type PlantSpecs, type Product } from '@bdu/core';
import { AlertTriangle, Check, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

import { Button, Illustration, inputClass } from '../components/ui';
import { useCatalogStore } from '../lib/catalog-store';
import { usePrefs } from '../lib/prefs';

function Field({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <label className={`flex flex-col gap-1 text-sm ${wide ? 'sm:col-span-2' : ''}`}>
      <span className="font-medium text-ink-soft">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-[var(--c-primary)]" />
      {label}
    </label>
  );
}

export function ProductEditor({ id, onClose }: { id: string; onClose: () => void }) {
  const { t } = usePrefs();
  const { productsById, suppliers, saveProduct, demo } = useCatalogStore();
  const original = productsById.get(id);
  const [draft, setDraft] = useState<Product | undefined>(original);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState('');

  useEffect(() => setDraft(original), [original]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!draft) return null;

  const set = <K extends keyof Product>(key: K, value: Product[K]) => {
    setDraft({ ...draft, [key]: value });
    setStatus('idle');
  };
  const setPlant = <K extends keyof PlantSpecs>(key: K, value: PlantSpecs[K]) => {
    if (draft.plant) set('plant', { ...draft.plant, [key]: value });
  };
  const num = (v: string) => (v === '' ? 0 : Number(v));

  const warnings: string[] = [];
  if (draft.price < draft.cost) warnings.push(t((d) => d.admin.catalog.priceBelowCost));
  else if (margin(draft) < 0.25) warnings.push(t((d) => d.admin.catalog.lowMargin));
  const sunInvalid = !!draft.plant && draft.plant.min_sun_hours > draft.plant.max_sun_hours;
  if (sunInvalid) warnings.push(t((d) => d.admin.catalog.sunRangeInvalid));

  const save = async () => {
    setStatus('saving');
    try {
      await saveProduct(draft);
      setStatus('saved');
    } catch (e) {
      setError((e as Error).message);
      setStatus('error');
    }
  };

  const supplierOptions = suppliers.filter((s) =>
    draft.category === 'plant' ? s.kind === 'nursery' : draft.category === 'pot' ? s.kind === 'pots' : s.kind === 'hardware' || s.kind === 'accessories',
  );

  return (
    <div className="fixed inset-0 z-30" role="dialog" aria-modal="true" aria-labelledby="editor-title">
      <button className="absolute inset-0 bg-black/40" aria-label={t((d) => d.common.close)} onClick={onClose} />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-bg shadow-2xl">
        <div className="flex items-center gap-3 border-b border-line bg-surface px-5 py-4">
          <span className="rounded-lg bg-surface-alt">
            <Illustration spec={draft.illustration} size={44} />
          </span>
          <div className="flex-1">
            <h2 id="editor-title" className="font-display text-xl">
              {t((d) => d.admin.catalog.editProduct)}
            </h2>
            <p className="text-xs text-muted">{draft.sku}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-surface-alt" aria-label={t((d) => d.common.close)}>
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t((d) => d.admin.catalog.nameEn)}>
              <input autoFocus className={inputClass} value={draft.name.en} onChange={(e) => set('name', { ...draft.name, en: e.target.value })} />
            </Field>
            <Field label={t((d) => d.admin.catalog.nameBn)}>
              <input className={inputClass} lang="bn" value={draft.name.bn} onChange={(e) => set('name', { ...draft.name, bn: e.target.value })} />
            </Field>
            <Field label={t((d) => d.admin.catalog.descEn)} wide>
              <textarea rows={2} className={inputClass} value={draft.description.en} onChange={(e) => set('description', { ...draft.description, en: e.target.value })} />
            </Field>
            <Field label={t((d) => d.admin.catalog.descBn)} wide>
              <textarea rows={2} lang="bn" className={inputClass} value={draft.description.bn} onChange={(e) => set('description', { ...draft.description, bn: e.target.value })} />
            </Field>
            <Field label={`${t((d) => d.admin.catalog.price)} (৳)`}>
              <input type="number" min={0} className={inputClass} value={draft.price} onChange={(e) => set('price', num(e.target.value))} />
            </Field>
            <Field label={`${t((d) => d.admin.catalog.cost)} (৳)`}>
              <input type="number" min={0} className={inputClass} value={draft.cost} onChange={(e) => set('cost', num(e.target.value))} />
            </Field>
            <Field label={t((d) => d.admin.catalog.stock)}>
              <input type="number" className={inputClass} value={draft.stock} onChange={(e) => set('stock', Math.round(num(e.target.value)))} />
            </Field>
            <Field label={t((d) => d.admin.catalog.weight)}>
              <input type="number" min={0} step={0.1} className={inputClass} value={draft.weight_kg} onChange={(e) => set('weight_kg', num(e.target.value))} />
            </Field>
            <Field label={t((d) => d.admin.catalog.supplier)}>
              <select className={inputClass} value={draft.supplier_id} onChange={(e) => set('supplier_id', e.target.value)}>
                {supplierOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t((d) => d.admin.catalog.careLevel)}>
              <select className={inputClass} value={draft.care_level} onChange={(e) => set('care_level', e.target.value as CareLevel)}>
                {(['easy', 'moderate', 'expert'] as const).map((c) => (
                  <option key={c} value={c}>
                    {t((d) => d.care[c])}
                  </option>
                ))}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Toggle label={t((d) => d.admin.catalog.visibleToCustomers)} checked={draft.active} onChange={(v) => set('active', v)} />
            </div>
          </div>

          {draft.plant && (
            <fieldset className="mt-6 rounded-2xl border border-line p-4">
              <legend className="px-1 text-sm font-bold text-primary">{t((d) => d.admin.catalog.plantDetails)}</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t((d) => d.admin.catalog.sunMin)}>
                  <input type="number" min={0} max={12} step={0.5} className={inputClass} aria-invalid={sunInvalid} value={draft.plant.min_sun_hours} onChange={(e) => setPlant('min_sun_hours', num(e.target.value))} />
                </Field>
                <Field label={t((d) => d.admin.catalog.sunMax)}>
                  <input type="number" min={0} max={14} step={0.5} className={inputClass} aria-invalid={sunInvalid} value={draft.plant.max_sun_hours} onChange={(e) => setPlant('max_sun_hours', num(e.target.value))} />
                </Field>
                <Field label={t((d) => d.admin.catalog.waterEvery)}>
                  <input type="number" min={1} className={inputClass} value={draft.plant.water_every_days} onChange={(e) => setPlant('water_every_days', num(e.target.value))} />
                </Field>
                <Field label={t((d) => d.admin.catalog.potSize)}>
                  <input type="number" min={2} className={inputClass} value={draft.plant.pot_size_in} onChange={(e) => setPlant('pot_size_in', num(e.target.value))} />
                </Field>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Toggle label={t((d) => d.product.petSafe)} checked={draft.plant.pet_safe} onChange={(v) => setPlant('pet_safe', v)} />
                <Toggle label={t((d) => d.product.monsoon)} checked={draft.plant.monsoon_tolerant} onChange={(v) => setPlant('monsoon_tolerant', v)} />
                <Toggle label={t((d) => d.product.heat)} checked={draft.plant.heat_tolerant} onChange={(v) => setPlant('heat_tolerant', v)} />
                <Toggle label={t((d) => d.product.coastal)} checked={draft.plant.coastal_ok} onChange={(v) => setPlant('coastal_ok', v)} />
                <Toggle label={t((d) => d.product.edible)} checked={draft.plant.edible} onChange={(v) => setPlant('edible', v)} />
                <Toggle label={t((d) => d.product.fragrant)} checked={draft.plant.fragrant} onChange={(v) => setPlant('fragrant', v)} />
              </div>
            </fieldset>
          )}
        </div>

        <div className="border-t border-line bg-surface px-5 py-4">
          {warnings.length > 0 && (
            <ul className="mb-3 flex flex-col gap-1" aria-live="polite">
              {warnings.map((w) => (
                <li key={w} className="flex items-center gap-2 text-sm text-warning">
                  <AlertTriangle size={14} /> {w}
                </li>
              ))}
            </ul>
          )}
          {status === 'error' && <p className="mb-3 text-sm text-danger">{error}</p>}
          <div className="flex items-center justify-end gap-2">
            {status === 'saved' && (
              <span className="mr-auto flex items-center gap-1 text-sm text-success" role="status">
                <Check size={16} /> {demo ? t((d) => d.admin.catalog.savedDemo) : t((d) => d.common.saved)}
              </span>
            )}
            <Button variant="ghost" onClick={onClose}>
              {t((d) => d.common.close)}
            </Button>
            <Button onClick={save} disabled={sunInvalid || status === 'saving' || !draft.name.en.trim()}>
              {t((d) => d.common.save)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
