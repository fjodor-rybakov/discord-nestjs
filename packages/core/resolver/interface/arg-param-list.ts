import { ArgNumOptions } from '../../decorator/interface/arg-num-options';
import { ArgRangeOptions } from '../../decorator/interface/arg-range-options';

export interface ArgParamList {
  instance: any;
  propertyKey: string;
  last: number;
  argNum?: ArgNumOptions;
  argRange?: ArgRangeOptions;
}