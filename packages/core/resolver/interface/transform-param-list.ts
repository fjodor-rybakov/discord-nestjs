import { ArgNumOptions } from '../../decorator/interface/arg-num-options';
import { ArgRangeOptions } from '../../decorator/interface/arg-range-options';
import { TransformToUserOptions } from '../../decorator/interface/transform-to-user-options';

export interface TransformParamList {
  instance: any;
  propertyKey: string;
  last?: number;
  argNum?: ArgNumOptions;
  argRange?: ArgRangeOptions;
  transformToUser?: TransformToUserOptions;
}