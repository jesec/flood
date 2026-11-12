export type RatioLevel = 'poor' | 'low' | 'even' | 'good' | 'great';

// Thresholds from https://github.com/Flood-UI/flood/issues/408#issuecomment-317402822.
// Anything at or above 10 stays at the deepest shade.
export const getRatioLevel = (ratio: number): RatioLevel | null => {
  if (!Number.isFinite(ratio) || ratio < 0) {
    return null;
  }

  if (ratio < 0.8) {
    return 'poor';
  }

  if (ratio < 1) {
    return 'low';
  }

  if (ratio < 2) {
    return 'even';
  }

  if (ratio < 10) {
    return 'good';
  }

  return 'great';
};

export const getRatioClassName = (ratio: number): string | undefined => {
  const level = getRatioLevel(ratio);

  return level == null ? undefined : `ratio ratio--${level}`;
};
