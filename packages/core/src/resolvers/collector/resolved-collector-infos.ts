import { ModuleRef } from '@nestjs/core';

import { CollectorMetadata } from './collector-metadata';

export interface ResolvedCollectorInfos {
  instance: InstanceType<any>;
  methodName: string;
  moduleRef: ModuleRef;
  collectors: CollectorMetadata[];
}
