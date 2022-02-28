import { CollectorMetadata } from '../collector-metadata';

export interface ResolvedCollectorInfos {
  instance: InstanceType<any>;
  methodName: string;
  collectors: CollectorMetadata[];
}
