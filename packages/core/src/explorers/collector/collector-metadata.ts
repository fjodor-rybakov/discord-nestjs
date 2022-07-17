import { CollectMethodEventsInfo } from './collect-method-events-info';
import { CollectorStrategy } from './strategy/collector-strategy';

export interface CollectorMetadata<TMetadata = any> {
  classInstance: InstanceType<any>;
  metadata: TMetadata;
  filterMethodName: string;
  events: CollectMethodEventsInfo;
  strategy: CollectorStrategy;
}
