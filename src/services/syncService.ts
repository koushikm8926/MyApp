import { databaseService } from './databaseService';

export const syncService = {
  async addToQueue(action: string, payload: any) {
    const db = await databaseService.getDb();
    await db.executeSql(
      'INSERT INTO sync_queue (action, payload) VALUES (?, ?)',
      [action, JSON.stringify(payload)]
    );
  },

  async processQueue() {
    const db = await databaseService.getDb();
    const [results] = await db.executeSql(
      'SELECT * FROM sync_queue ORDER BY id ASC'
    );

    const queue: Array<{ id: number; action: string; payload: string }> = [];
    for (let i = 0; i < results.rows.length; i++) {
      queue.push(results.rows.item(i));
    }

    for (const item of queue) {
      try {
        console.log(`Processing sync item ${item.id}: ${item.action}`);

        // HERE: Call actual API based on action (e.g., uploadInspection)
        await new Promise(resolve => setTimeout(() => resolve(undefined), 500));

        // On success, remove from queue
        await db.executeSql('DELETE FROM sync_queue WHERE id = ?', [item.id]);

        // Update inspection status if applicable
        const payloadObj = JSON.parse(item.payload);
        if (payloadObj.inspectionId) {
          await databaseService.updateInspectionStatus(payloadObj.inspectionId, 'uploaded');
        }
      } catch (error) {
        console.error(`Failed to process sync item ${item.id}`, error);
        await db.executeSql(
          'UPDATE sync_queue SET attempts = attempts + 1, lastAttempt = CURRENT_TIMESTAMP WHERE id = ?',
          [item.id]
        );
      }
    }
  },
};
