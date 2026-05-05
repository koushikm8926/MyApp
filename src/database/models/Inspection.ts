import { Model } from '@nozbe/watermelondb';
import { field, readonly, date, children } from '@nozbe/watermelondb/decorators';
import Photo from './Photo';

export default class Inspection extends Model {
  static table = 'inspections';

  @field('user_id') userId!: string;
  @field('vehicle_name') vehicleName!: string;
  @field('status') status!: string;
  @field('data') data!: string;

  @readonly @date('created_at') createdAt!: number;

  @children('photos') photos!: any;
}
