import { Model } from '@nozbe/watermelondb';
import { field, relation } from '@nozbe/watermelondb/decorators';

export default class Photo extends Model {
  static table = 'photos';

  @field('uri') uri!: string;
  @field('type') type!: string;
  @field('status') status!: string;
  @field('metadata') metadata!: string;

  @relation('inspections', 'inspection_id') inspection!: any;
}
