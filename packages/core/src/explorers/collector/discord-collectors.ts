import { ModuleRef } from '@nestjs/core';

import { CollectorMetadata } from './collector-metadata';

export interface DiscordCollectors {
  methodCollectors: {
    [methodName: string]: CollectorMetadata[];
  };
  classCollectors: CollectorMetadata[];
  moduleRef: ModuleRef;
}
