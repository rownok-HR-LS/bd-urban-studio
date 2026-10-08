import { illustrationShapes, type Illustration as Spec } from '@bdu/core';
import { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

/** Renders a product's generated illustration at the given size. Decorative, so hidden from screen readers. */
export function Illustration({ spec, size = 96 }: { spec: Spec; size?: number }) {
  const shapes = useMemo(() => illustrationShapes(spec), [spec]);
  return (
    <View aria-hidden>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {shapes.map((s, i) => {
          switch (s.kind) {
            case 'path':
              return (
                <Path key={i} d={s.d} fill={s.fill ?? 'none'} stroke={s.stroke} strokeWidth={s.strokeWidth}
                  strokeLinecap="round" opacity={s.opacity} transform={s.transform} />
              );
            case 'circle':
              return <Circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={s.fill} stroke={s.stroke} strokeWidth={s.strokeWidth} opacity={s.opacity} />;
            case 'ellipse':
              return <Ellipse key={i} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} fill={s.fill} opacity={s.opacity} transform={s.transform} />;
            case 'rect':
              return (
                <Rect key={i} x={s.x} y={s.y} width={s.width} height={s.height} rx={s.rx} fill={s.fill}
                  stroke={s.stroke} strokeWidth={s.strokeWidth} opacity={s.opacity} transform={s.transform} />
              );
          }
        })}
      </Svg>
    </View>
  );
}
