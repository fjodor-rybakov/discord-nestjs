import { CollectMethodEventsInfo } from './collect-method-events-info';
import { CollectorType } from './collector-type';

export interface CollectorMetadata<TMetadata = any> {
  classInstance: InstanceType<any>;
  metadata: TMetadata;
  type: CollectorType;
  filterMethodName: string;
  events: CollectMethodEventsInfo;
}
