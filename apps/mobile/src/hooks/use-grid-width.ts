import { space } from '@bdu/core';
import { useWindowDimensions } from 'react-native';

import { MAX_WIDTH } from '@/components/ui';

/** Width of one card in an N-column grid inside a padded <Screen>. */
export function useGridItemWidth(columns = 2, gap: number = space.md): number {
  const { width } = useWindowDimensions();
  const content = Math.min(width, MAX_WIDTH) - space.lg * 2;
  return Math.floor((content - gap * (columns - 1)) / columns);
}
