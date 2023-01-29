import { Inject, Injectable } from '@nestjs/common';
import {
  InteractionCollector,
  MappedInteractionTypes,
  MessageCollector,
  MessageComponentType,
  ReactionCollector,
} from 'discord.js';

import { COLLECTOR_EXPLORER_ALIAS } from '../definitions/constants/collector-explorer-alias';
import { CollectorExplorer } from '../explorers/collector/collector.explorer';
import { UseCollectorApplyOptions } from '../explorers/collector/use-collector-apply-options';

@Injectable()
export class CollectorProvider {
  constructor(
    @Inject(COLLECTOR_EXPLORER_ALIAS)
    private readonly collectorExplorer: CollectorExplorer,
  ) {}

  applyCollector(
    options: UseCollectorApplyOptions,
  ): Promise<
    (
      | ReactionCollector
      | MessageCollector
      | InteractionCollector<MappedInteractionTypes[MessageComponentType]>
    )[]
  > {
    return this.collectorExplorer.applyCollector(options);
  }
}
