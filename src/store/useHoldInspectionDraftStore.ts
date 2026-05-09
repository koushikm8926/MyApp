import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Mandatory shot carousel: URI per hold × shot slot. */
export type MandatoryShotUrisByHold = Record<string, Record<string, string>>;

export type DraftAttribute = {
  id: string;
  type: string;
  value: string;
  uri: string | null;
};

export type SublocationDraftPayload = {
  attributes: DraftAttribute[];
  comment: string;
};

function sublocationDraftStorageKey(
  holdId: string,
  zoneId: string,
  sublocationId: string
) {
  return `${holdId}::${zoneId}::${sublocationId}`;
}

interface HoldInspectionDraftState {
  mandatoryShotUrisByHold: MandatoryShotUrisByHold;
  sublocationDraftByKey: Record<string, SublocationDraftPayload>;

  setMandatoryShotUri: (holdId: string, shotId: string, uri: string) => void;

  upsertSublocationDraft: (key: string, payload: SublocationDraftPayload) => void;
}

export const useHoldInspectionDraftStore = create<HoldInspectionDraftState>()(
  persist(
    (set) => ({
      mandatoryShotUrisByHold: {},
      sublocationDraftByKey: {},

      setMandatoryShotUri: (holdId, shotId, uri) => {
        if (!holdId || !shotId || !uri) return;
        set((state) => ({
          mandatoryShotUrisByHold: {
            ...state.mandatoryShotUrisByHold,
            [holdId]: {
              ...(state.mandatoryShotUrisByHold[holdId] ?? {}),
              [shotId]: uri,
            },
          },
        }));
      },

      upsertSublocationDraft: (key, payload) =>
        set((state) => ({
          sublocationDraftByKey: {
            ...state.sublocationDraftByKey,
            [key]: {
              attributes: payload.attributes.map((a) => ({ ...a })),
              comment: payload.comment,
            },
          },
        })),
    }),
    {
      name: 'hold-inspection-draft-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function getSublocationDraftKey(
  holdId: string,
  zoneId: string,
  sublocationId: string
) {
  return sublocationDraftStorageKey(holdId, zoneId, sublocationId);
}

export function useMandatoryShotsUriMap(holdId: string) {
  return useHoldInspectionDraftStore(
    (s) => s.mandatoryShotUrisByHold[holdId] ?? EMPTY_SHOT_URI_MAP
  );
}

const EMPTY_SHOT_URI_MAP: Record<string, string> = {};

export function defaultSublocationAttributes(): DraftAttribute[] {
  return [{ id: '1', type: 'Condition', value: '', uri: null }];
}
