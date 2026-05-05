import { database } from '../database';
import { Q } from '@nozbe/watermelondb';
import Vehicle from '../database/models/Vehicle';
import Inspection from '../database/models/Inspection';
import Photo from '../database/models/Photo';

export interface InspectionRecord {
  id: string;
  userId: string;
  vehicleName: string;
  status: 'draft' | 'pending' | 'completed' | 'uploaded';
  data: string; // JSON string
  createdAt: string;
}

export interface PhotoRecord {
  id: string;
  inspectionId: string;
  uri: string;
  type: string;
  status: 'pending' | 'uploaded';
  metadata: string; // JSON string
}

export const databaseService = {
  // Inspection Methods
  async createInspection(inspection: InspectionRecord) {
    try {
      await database.write(async () => {
        await database.collections.get<Inspection>('inspections').create((i: any) => {
          i._raw.id = inspection.id;
          i.userId = inspection.userId;
          i.vehicleName = inspection.vehicleName;
          i.status = inspection.status;
          i.data = inspection.data;
        });
      });
    } catch (error) {
      console.error('Database Error: Failed to create inspection', error);
      throw error;
    }
  },

  async getInspections(userId: string): Promise<InspectionRecord[]> {
    try {
      const inspections = await database.collections.get<Inspection>('inspections').query(
        Q.where('user_id', userId)
      ).fetch();
      
      return inspections.map(i => ({
        id: i.id,
        userId: i.userId,
        vehicleName: i.vehicleName,
        status: i.status as any,
        data: i.data,
        createdAt: new Date(i.createdAt).toISOString(),
      })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Database Error: Failed to get inspections', error);
      return [];
    }
  },

  async updateInspectionStatus(id: string, status: string) {
    try {
      await database.write(async () => {
        const inspection = await database.collections.get<Inspection>('inspections').find(id);
        await inspection.update((i: any) => {
          i.status = status;
        });
      });
    } catch (error) {
      console.error('Database Error: Failed to update inspection status', error);
      throw error;
    }
  },

  // Photo Methods
  async addPhoto(photo: PhotoRecord) {
    try {
      await database.write(async () => {
        const inspection = await database.collections.get<Inspection>('inspections').find(photo.inspectionId);
        await database.collections.get<Photo>('photos').create((p: any) => {
          p._raw.id = photo.id;
          p.inspection.set(inspection);
          p.uri = photo.uri;
          p.type = photo.type;
          p.status = photo.status;
          p.metadata = photo.metadata;
        });
      });
    } catch (error) {
      console.error('Database Error: Failed to add photo', error);
      throw error;
    }
  },

  async getPhotos(inspectionId: string): Promise<PhotoRecord[]> {
    try {
      const photos = await database.collections.get<Photo>('photos').query(
        Q.where('inspection_id', inspectionId)
      ).fetch();
      
      return photos.map(p => ({
        id: p.id,
        inspectionId: (p.inspection as any).id, 
        uri: p.uri,
        type: p.type,
        status: p.status as any,
        metadata: p.metadata,
      }));
    } catch (error) {
      console.error('Database Error: Failed to get photos', error);
      return [];
    }
  },

  // Vehicle Methods
  async getVehicles(userId: string): Promise<any[]> {
    try {
      const vehicles = await database.collections.get<Vehicle>('vehicles').query(
        Q.where('user_id', userId)
      ).fetch();
      
      return vehicles.map(v => ({
        id: v.id,
        userId: v.userId,
        make: v.make,
        model: v.model,
        year: v.year,
        plate: v.plate,
        createdAt: new Date(v.createdAt).toISOString(),
      })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Database Error: Failed to get vehicles', error);
      return [];
    }
  },

  async addVehicle(vehicle: { id: string; userId: string; make: string; model: string; year: string; plate: string }) {
    try {
      await database.write(async () => {
        await database.collections.get<Vehicle>('vehicles').create((v: any) => {
          if (vehicle.id) v._raw.id = vehicle.id;
          v.userId = vehicle.userId;
          v.make = vehicle.make;
          v.model = vehicle.model;
          v.year = vehicle.year;
          v.plate = vehicle.plate;
        });
      });
    } catch (error) {
      console.error('Database Error: Failed to add vehicle', error);
      throw error;
    }
  },
};

export const initDatabase = async () => {
  // WatermelonDB connects synchronously, nothing more is required to initialize here.
  return database;
};
