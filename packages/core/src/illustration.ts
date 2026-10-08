// Turns a product's Illustration spec into simple SVG shapes (viewBox 0 0 100 100).
// The mobile app renders them with react-native-svg and the admin app with DOM
// <svg>, so every product has a consistent, friendly picture even before ops
// upload real photos.

import type { Illustration } from './types';

export type Shape =
  | { kind: 'path'; d: string; fill?: string; stroke?: string; strokeWidth?: number; opacity?: number; transform?: string }
  | { kind: 'circle'; cx: number; cy: number; r: number; fill?: string; stroke?: string; strokeWidth?: number; opacity?: number }
  | { kind: 'ellipse'; cx: number; cy: number; rx: number; ry: number; fill?: string; opacity?: number; transform?: string }
  | { kind: 'rect'; x: number; y: number; width: number; height: number; rx?: number; fill?: string; stroke?: string; strokeWidth?: number; opacity?: number; transform?: string };

/** Mixes a hex colour towards black (amount < 0) or white (amount > 0). */
export function shade(hex: string, amount: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const target = amount < 0 ? 0 : 255;
  const t = Math.abs(amount);
  const mix = (c: number) => Math.round(c + (target - c) * t);
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

const TERRACOTTA = '#C9734B';
const SOIL = '#5B4636';

function pot(color = TERRACOTTA, top = 66): Shape[] {
  return [
    { kind: 'path', d: `M28 ${top} L72 ${top} L66 94 L34 94 Z`, fill: color },
    { kind: 'rect', x: 25, y: top - 4, width: 50, height: 8, rx: 2, fill: shade(color, -0.12) },
    { kind: 'ellipse', cx: 50, cy: top - 3, rx: 22, ry: 2.2, fill: SOIL, opacity: 0.85 },
  ];
}

function leaf(cx: number, cy: number, len: number, width: number, angle: number, fill: string): Shape {
  // A leaf pointing up from (cx, cy), rotated by angle degrees.
  const d = `M${cx} ${cy} C${cx - width} ${cy - len * 0.35} ${cx - width * 0.6} ${cy - len * 0.85} ${cx} ${cy - len} C${cx + width * 0.6} ${cy - len * 0.85} ${cx + width} ${cy - len * 0.35} ${cx} ${cy} Z`;
  return { kind: 'path', d, fill, transform: `rotate(${angle} ${cx} ${cy})` };
}

function plantShapes({ form, color, accent }: Illustration): Shape[] {
  const dark = shade(color, -0.22);
  const light = shade(color, 0.18);
  const flower = accent ?? '#E8B04B';
  switch (form) {
    case 'trailing':
      return [
        ...[-60, -25, 10, 45].map((a, i) => leaf(50, 62, 26, 9, a, i % 2 ? color : light)),
        { kind: 'path', d: 'M30 64 C18 74 20 88 14 96', stroke: dark, strokeWidth: 2, fill: 'none' },
        { kind: 'path', d: 'M70 64 C82 74 80 86 88 94', stroke: dark, strokeWidth: 2, fill: 'none' },
        ...[[17, 78], [14, 90], [83, 76], [87, 88]].map(([x, y]) => ({ kind: 'ellipse' as const, cx: x, cy: y, rx: 5, ry: 3.5, fill: color, transform: `rotate(-30 ${x} ${y})` })),
        ...pot(),
      ];
    case 'upright':
      return [
        ...[-14, -5, 4, 13].map((a, i) => leaf(50 + (i - 1.5) * 5, 64, 52 - Math.abs(i - 1.5) * 8, 6, a, i % 2 ? color : dark)),
        { kind: 'path', d: 'M44 60 L44 30', stroke: light, strokeWidth: 1, opacity: 0.6 },
        ...pot(),
      ];
    case 'palm':
      return [
        { kind: 'path', d: 'M50 64 L50 26', stroke: dark, strokeWidth: 2.5 },
        ...[-70, -40, -12, 14, 42, 70].map((a, i) => leaf(50, 40, 30, 7, a, i % 2 ? color : light)),
        ...pot(),
      ];
    case 'bushy':
    case 'herb':
    case 'flowering':
    case 'vegetable': {
      const r = form === 'herb' ? 9 : 12;
      const blobs: Shape[] = [
        [38, 52], [62, 52], [50, 42], [42, 34], [58, 34], [50, 56],
      ].map(([x, y], i) => ({ kind: 'circle', cx: x, cy: y, r: r - (i % 3), fill: i % 2 ? color : light }));
      const extras: Shape[] = form === 'flowering'
        ? [[40, 36], [58, 30], [64, 48], [36, 52], [50, 44]].map(([x, y]) => ({ kind: 'circle', cx: x, cy: y, r: 4.5, fill: flower, stroke: shade(flower, -0.2), strokeWidth: 0.8 }))
        : form === 'vegetable'
          ? [[42, 46], [58, 40], [56, 56]].map(([x, y]) => ({ kind: 'ellipse', cx: x, cy: y, rx: 3.5, ry: 6, fill: flower }))
          : [[44, 30], [56, 40], [46, 48]].map(([x, y]) => ({ kind: 'circle', cx: x, cy: y, r: 2.5, fill: dark, opacity: 0.5 }));
      return [...blobs, ...extras, ...pot()];
    }
    case 'succulent':
      return [
        ...[-75, -45, -15, 15, 45, 75].map((a) => leaf(50, 60, 20, 8, a, color)),
        ...[-30, 0, 30].map((a) => leaf(50, 60, 13, 6, a, light)),
        ...(accent ? [{ kind: 'circle' as const, cx: 50, cy: 36, r: 5, fill: accent }] : []),
        ...pot(TERRACOTTA, 64),
      ];
    case 'climber':
      return [
        { kind: 'path', d: 'M50 64 L50 8', stroke: '#A07B52', strokeWidth: 2 },
        { kind: 'path', d: 'M50 62 C40 50 60 40 50 28 C42 18 56 12 50 6', stroke: dark, strokeWidth: 1.8, fill: 'none' },
        ...[[44, 52, -50], [57, 44, 50], [44, 34, -50], [56, 24, 50], [46, 14, -40]].map(([x, y, a]) => leaf(x, y, 12, 6, a, color)),
        ...(accent ? [[40, 44], [60, 32], [42, 20]].map(([x, y]) => ({ kind: 'circle' as const, cx: x, cy: y, r: 3.5, fill: accent })) : []),
        ...pot(),
      ];
    default:
      return [];
  }
}

function productShapes({ form, color, accent }: Illustration): Shape[] {
  const dark = shade(color, -0.2);
  const light = shade(color, 0.2);
  switch (form) {
    case 'pot':
      return [
        { kind: 'path', d: 'M22 34 L78 34 L70 90 L30 90 Z', fill: color },
        { kind: 'rect', x: 18, y: 26, width: 64, height: 10, rx: 3, fill: dark },
        { kind: 'path', d: 'M28 48 L72 48', stroke: light, strokeWidth: 2, opacity: 0.6 },
      ];
    case 'planter-long':
      return [
        { kind: 'rect', x: 8, y: 30, width: 84, height: 6, rx: 2, fill: '#8A8F8C' },
        { kind: 'path', d: 'M14 40 L86 40 L80 72 L20 72 Z', fill: color },
        { kind: 'rect', x: 12, y: 36, width: 76, height: 6, rx: 2, fill: dark },
        { kind: 'path', d: 'M24 36 L24 28 M76 36 L76 28', stroke: '#6E726F', strokeWidth: 3 },
      ];
    case 'hanging':
      return [
        { kind: 'path', d: 'M50 6 L28 50 M50 6 L72 50 M50 6 L50 50', stroke: '#8A8F8C', strokeWidth: 1.5 },
        { kind: 'path', d: 'M24 50 L76 50 C74 74 62 84 50 84 C38 84 26 74 24 50 Z', fill: color },
        { kind: 'path', d: 'M28 60 L72 60 M30 70 L70 70', stroke: dark, strokeWidth: 1.5, opacity: 0.6 },
      ];
    case 'trellis':
      return [
        ...[20, 40, 60, 80].map((x): Shape => ({ kind: 'path', d: `M${x} 8 L${x} 94`, stroke: color, strokeWidth: 3 })),
        ...[20, 40, 60, 80].map((y): Shape => ({ kind: 'path', d: `M14 ${y} L86 ${y}`, stroke: dark, strokeWidth: 2.5 })),
      ];
    case 'irrigation':
      return [
        { kind: 'path', d: 'M10 70 C30 50 40 90 60 70 C75 55 85 70 92 60', stroke: color, strokeWidth: 4, fill: 'none' },
        ...[[30, 40], [50, 34], [70, 42]].map(([x, y]) => ({ kind: 'path' as const, d: `M${x} ${y} C${x - 4} ${y + 6} ${x - 4} ${y + 10} ${x} ${y + 10} C${x + 4} ${y + 10} ${x + 4} ${y + 6} ${x} ${y} Z`, fill: accent ?? '#5F8FA0' })),
      ];
    case 'light':
      return [
        { kind: 'path', d: 'M6 24 C30 44 70 44 94 24', stroke: '#5A5A52', strokeWidth: 1.5, fill: 'none' },
        ...[18, 34, 50, 66, 82].map((x, i): Shape => ({ kind: 'circle', cx: x, cy: 36 + (i % 2) * 3 + (i === 2 ? 3 : 0), r: 5, fill: accent ?? color })),
        { kind: 'circle', cx: 50, cy: 70, r: 18, fill: accent ?? color, opacity: 0.15 },
      ];
    case 'seating':
      return [
        { kind: 'ellipse', cx: 50, cy: 40, rx: 30, ry: 9, fill: light },
        { kind: 'path', d: 'M22 42 L30 88 M78 42 L70 88 M50 48 L50 90', stroke: color, strokeWidth: 5 },
        { kind: 'path', d: 'M28 70 L72 70', stroke: dark, strokeWidth: 3 },
      ];
    case 'bag':
      return [
        { kind: 'path', d: 'M26 22 L74 22 L80 90 L20 90 Z', fill: color },
        { kind: 'rect', x: 24, y: 16, width: 52, height: 8, rx: 2, fill: dark },
        { kind: 'circle', cx: 50, cy: 56, r: 12, fill: accent ?? light },
      ];
    case 'tool':
      return [
        { kind: 'rect', x: 46, y: 8, width: 8, height: 36, rx: 3, fill: accent ?? '#A07B52' },
        { kind: 'path', d: 'M36 44 L64 44 L60 76 C58 86 42 86 40 76 Z', fill: color },
      ];
    case 'mat':
      return [
        { kind: 'path', d: 'M20 40 L90 40 L80 80 L10 80 Z', fill: color },
        ...[20, 32, 44, 56, 68].map((x): Shape => ({ kind: 'path', d: `M${x} 78 L${x + 4} 44`, stroke: light, strokeWidth: 1.5, opacity: 0.7 })),
      ];
    default:
      return plantShapes({ form, color, accent });
  }
}

export function illustrationShapes(spec: Illustration): Shape[] {
  return productShapes(spec);
}
