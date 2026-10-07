export function checkThreshold(
  seoScore: number,
  aeoScore: number,
  threshold: number
): boolean {
  return (
    seoScore >= threshold &&
    aeoScore >= threshold
  );
}