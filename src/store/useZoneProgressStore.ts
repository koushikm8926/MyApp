import { create } from 'zustand';

/** Matches sublocation count used in ZoneDetailsScreen (e.g. Hatch Cover zone). */
export const SUBLOCATIONS_PER_ZONE = 11;

/** Stable fallback for selectors (avoid `?? []` creating a new reference each render). */
export const EMPTY_COMPLETED_SUBLOCATION_IDS: string[] = [];

interface ZoneProgressState {
  /** zoneId → completed sublocation ids */
  completedByZone: Record<string, string[]>;
  markSublocationComplete: (zoneId: string, sublocationId: string) => void;
}

export const useZoneProgressStore = create<ZoneProgressState>((set) => ({
  completedByZone: {},

  markSublocationComplete: (zoneId, sublocationId) => {
    if (!zoneId || !sublocationId) return;
    set((state) => {
      const prev = state.completedByZone[zoneId] ?? [];
      if (prev.includes(sublocationId)) return state;
      return {
        completedByZone: {
          ...state.completedByZone,
          [zoneId]: [...prev, sublocationId],
        },
      };
    });
  },
}));

export function getZoneCompletedIds(
  completedByZone: Record<string, string[]>,
  zoneId: string
): string[] {
  return completedByZone[zoneId] ?? [];
}

export function zoneProgressCounts(
  completedByZone: Record<string, string[]>,
  zoneId: string,
  total: number = SUBLOCATIONS_PER_ZONE
) {
  const completed = getZoneCompletedIds(completedByZone, zoneId).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, pct };
}
