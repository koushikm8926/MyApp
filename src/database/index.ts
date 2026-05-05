import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import { schema } from './schema';
import Vehicle from './models/Vehicle';
import Inspection from './models/Inspection';
import Photo from './models/Photo';

const adapter = new SQLiteAdapter({
  schema,
  // We disable JSI temporarily to avoid complex native setup issues
  jsi: false,
  onSetUpError: error => {
    console.error('Database setup error', error);
  }
});

export const database = new Database({
  adapter,
  modelClasses: [
    Vehicle,
    Inspection,
    Photo,
  ],
});
