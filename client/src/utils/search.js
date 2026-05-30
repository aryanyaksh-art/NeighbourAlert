export const DEFAULT_RADIUS_KM = 5;

export const RADIUS_OPTIONS_KM = [1, 2, 5, 10, 15, 20];

export function getEffectiveRadiusKm(searchCenter, radiusKm) {
  if (!searchCenter) return 0;
  return radiusKm > 0 ? radiusKm : DEFAULT_RADIUS_KM;
}
