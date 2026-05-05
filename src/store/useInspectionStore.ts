import { create } from 'zustand';
import { databaseService, InspectionRecord, PhotoRecord } from '../services/databaseService';

interface InspectionState {
  inspections: InspectionRecord[];
  currentInspection: InspectionRecord | null;
  isLoading: boolean;
  
  loadInspections: (userId: string) => Promise<void>;
  startInspection: (userId: string, vehicleName: string) => Promise<string>;
  saveInspectionData: (id: string, data: any) => Promise<void>;
  addPhoto: (inspectionId: string, uri: string, type: string) => Promise<void>;
}

export const useInspectionStore = create<InspectionState>((set, get) => ({
  inspections: [],
  currentInspection: null,
  isLoading: false,

  loadInspections: async (userId) => {
    set({ isLoading: true });
    try {
      const data = await databaseService.getInspections(userId);
      set({ inspections: data });
    } finally {
      set({ isLoading: false });
    }
  },

  startInspection: async (userId, vehicleName) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newInspection: InspectionRecord = {
      id,
      userId,
      vehicleName,
      status: 'draft',
      data: JSON.stringify({}),
      createdAt: new Date().toISOString(),
    };

    await databaseService.createInspection(newInspection);
    set((state) => ({ 
      inspections: [newInspection, ...state.inspections],
      currentInspection: newInspection 
    }));
    return id;
  },

  saveInspectionData: async (id, data) => {
    const state = get();
    const inspection = state.inspections.find(i => i.id === id);
    if (!inspection) return;

    const existingData = JSON.parse(inspection.data || '{}');
    const newData = { ...existingData, ...data };
    const dataString = JSON.stringify(newData);

    await databaseService.updateInspectionData(id, dataString);
    
    set((state) => ({
      inspections: state.inspections.map(i => 
        i.id === id ? { ...i, data: dataString, status: 'pending' } : i
      ),
      currentInspection: state.currentInspection?.id === id 
        ? { ...state.currentInspection, data: dataString, status: 'pending' } 
        : state.currentInspection
    }));
  },

  addPhoto: async (inspectionId, uri, type) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newPhoto: PhotoRecord = {
      id,
      inspectionId,
      uri,
      type,
      status: 'pending',
      metadata: JSON.stringify({}),
    };

    await databaseService.addPhoto(newPhoto);
  },
}));
