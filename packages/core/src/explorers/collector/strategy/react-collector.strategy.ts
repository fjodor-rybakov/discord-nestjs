import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import {
  ClientEvents,
  ReactionCollector,
  ReactionCollectorOptions,
} from 'discord.js';

import { BaseEvents } from '../../../definitions/types/event.type';
import { CollectorMetadata } from '../collector-metadata';
import { CollectorRegister } from '../collector-register';
import { UseCollectorApplyOptions } from '../use-collector-apply-options';
import { CollectorStrategy } from './collector-strategy';

@Injectable()
export class ReactCollectorStrategy implements CollectorStrategy {
  constructor(private readonly collectorRegister: CollectorRegister) {}

  async setupCollector(
    { event, eventArgs }: UseCollectorApplyOptions,
    { metadata, filterMethodName, events, classInstance }: CollectorMetadata,
    moduleRef: ModuleRef,
  ): Promise<ReactionCollector> {
    if (!this.isMessageEvent(event, eventArgs)) return;

    const [message] = eventArgs;
    const reactionCollectorOptions: ReactionCollectorOptions = {
      ...metadata,
    };
    const reactionCollector = message.createReactionCollector(
      reactionCollectorOptions,
    );

    const executedClassInstance = await this.collectorRegister.registerRequest(
      moduleRef,
      classInstance,
      reactionCollector,
    );

    if (filterMethodName)
      reactionCollector.filter = (...filterArgs) =>
        executedClassInstance[filterMethodName](...filterArgs);

    this.collectorRegister.subscribeToEvents(
      reactionCollector,
      events,
      executedClassInstance,
    );

    return reactionCollector;
  }

  private isMessageEvent(
    event: BaseEvents,
    context: ClientEvents[keyof ClientEvents],
  ): context is ClientEvents['messageCreate'] {
    return event === 'messageCreate';
  }
}
