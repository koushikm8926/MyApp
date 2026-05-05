import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export default class Vehicle extends Model {
  static table = 'vehicles';

  @field('user_id') userId!: string;
  @field('make') make!: string;
  @field('model') model!: string;
  @field('year') year!: string;
  @field('plate') plate!: string;
  
  @readonly @date('created_at') createdAt!: number;
}
