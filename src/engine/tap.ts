export function calculateTapTempo(
  tapTimes: number[],
  minBpm: number,
  maxBpm: number,
): number | null {
  if (tapTimes.length < 2) {
    return null;
  }

  const gaps = tapTimes.slice(1).map((time, index) => time - tapTimes[index]);
  const averageGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
  const bpm = Math.round(60000 / averageGap);

  return Math.max(minBpm, Math.min(maxBpm, bpm));
}

