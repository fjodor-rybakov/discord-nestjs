import { ModuleRef } from '@nestjs/core';
import { Collector, Snowflake } from 'discord.js';

import { CollectorMetadata } from '../collector-metadata';
import { UseCollectorApplyOptions } from '../use-collector-apply-options';

export interface CollectorStrategy {
  setupCollector(
    options: UseCollectorApplyOptions,
    metadata: CollectorMetadata,
    moduleRef: ModuleRef,
  ): Promise<Collector<Snowflake, any, any>>;
}
