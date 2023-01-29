import { ModuleRef } from '@nestjs/core';
import {
  InteractionCollector,
  MappedInteractionTypes,
  MessageCollector,
  MessageComponentType,
  ReactionCollector,
} from 'discord.js';

import { CollectorMetadata } from '../collector-metadata';
import { UseCollectorApplyOptions } from '../use-collector-apply-options';

export interface CollectorStrategy {
  setupCollector(
    options: UseCollectorApplyOptions,
    metadata: CollectorMetadata,
    moduleRef: ModuleRef,
  ): Promise<
    | ReactionCollector
    | MessageCollector
    | InteractionCollector<MappedInteractionTypes[MessageComponentType]>
  >;
}
