import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'vehicles',
      columns: [
        { name: 'user_id', type: 'string' },
        { name: 'make', type: 'string', isOptional: true },
        { name: 'model', type: 'string', isOptional: true },
        { name: 'year', type: 'string', isOptional: true },
        { name: 'plate', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'inspections',
      columns: [
        { name: 'user_id', type: 'string' },
        { name: 'vehicle_name', type: 'string', isOptional: true },
        { name: 'status', type: 'string' },
        { name: 'data', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'photos',
      columns: [
        { name: 'inspection_id', type: 'string', isIndexed: true },
        { name: 'uri', type: 'string' },
        { name: 'type', type: 'string', isOptional: true },
        { name: 'status', type: 'string' },
        { name: 'metadata', type: 'string', isOptional: true },
      ]
    })
  ]
});
