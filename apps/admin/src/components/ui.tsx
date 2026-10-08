import { illustrationShapes, type Illustration as Spec } from '@bdu/core';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function Illustration({ spec, size = 48 }: { spec: Spec; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      {illustrationShapes(spec).map((s, i) => {
        switch (s.kind) {
          case 'path':
            return <path key={i} d={s.d} fill={s.fill ?? 'none'} stroke={s.stroke} strokeWidth={s.strokeWidth} strokeLinecap="round" opacity={s.opacity} transform={s.transform} />;
          case 'circle':
            return <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={s.fill} stroke={s.stroke} strokeWidth={s.strokeWidth} opacity={s.opacity} />;
          case 'ellipse':
            return <ellipse key={i} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} fill={s.fill} opacity={s.opacity} transform={s.transform} />;
          case 'rect':
            return <rect key={i} x={s.x} y={s.y} width={s.width} height={s.height} rx={s.rx} fill={s.fill} stroke={s.stroke} strokeWidth={s.strokeWidth} opacity={s.opacity} transform={s.transform} />;
        }
      })}
    </svg>
  );
}

const tones = {
  primary: 'bg-primary-soft text-primary',
  accent: 'bg-accent-soft text-accent',
  sun: 'bg-sun-soft text-warning',
  sky: 'bg-sky-soft text-sky',
  danger: 'bg-danger-soft text-danger',
  muted: 'bg-surface-alt text-muted',
} as const;

export type Tone = keyof typeof tones;

export function Badge({ children, tone = 'primary' }: { children: ReactNode; tone?: Tone }) {
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }) {
  const styles = {
    primary: 'bg-primary text-primary-ink hover:opacity-90',
    secondary: 'bg-primary-soft text-primary hover:opacity-90',
    ghost: 'text-ink-soft hover:bg-surface-alt',
  }[variant];
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-bold transition disabled:opacity-40 ${styles} ${className}`}
    />
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-surface p-5 ${className}`}>{children}</div>;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({ label, value, hint, tone = 'primary' }: { label: string; value: string; hint?: string; tone?: Tone }) {
  return (
    <Card>
      <p className="text-sm text-muted">{label}</p>
      <p className="font-display mt-1 text-3xl">{value}</p>
      {hint && (
        <div className="mt-2">
          <Badge tone={tone}>{hint}</Badge>
        </div>
      )}
    </Card>
  );
}

export const inputClass =
  'w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none';

/** Same look as inputs, but sized to its content (for filter dropdowns). */
export const selectClass = inputClass.replace('w-full ', '');
