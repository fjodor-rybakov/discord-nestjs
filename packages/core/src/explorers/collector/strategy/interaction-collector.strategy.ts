import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import {
  ButtonInteraction,
  ClientEvents,
  InteractionCollector,
  MessageChannelCollectorOptionsParams,
  MessageComponentType,
  SelectMenuInteraction,
} from 'discord.js';

import { BaseEvents } from '../../../definitions/types/event.type';
import { CollectorMetadata } from '../collector-metadata';
import { CollectorRegister } from '../collector-register';
import { UseCollectorApplyOptions } from '../use-collector-apply-options';
import { CollectorStrategy } from './collector-strategy';

@Injectable()
export class InteractionCollectorStrategy implements CollectorStrategy {
  constructor(private readonly collectorRegister: CollectorRegister) {}

  async setupCollector(
    { event, eventArgs }: UseCollectorApplyOptions,
    { metadata, filterMethodName, events, classInstance }: CollectorMetadata,
    moduleRef: ModuleRef,
  ): Promise<InteractionCollector<ButtonInteraction | SelectMenuInteraction>> {
    if (
      !this.isMessageEvent(event, eventArgs) &&
      !this.isInteractionEvent(event, eventArgs)
    )
      return;
    const [messageOrInteraction] = eventArgs;
    const interactionCollectorOptions: MessageChannelCollectorOptionsParams<
      MessageComponentType,
      true
    > = {
      ...metadata,
    };
    const interactionCollector =
      messageOrInteraction.channel.createMessageComponentCollector(
        interactionCollectorOptions,
      );

    const executedClassInstance = await this.collectorRegister.registerRequest(
      moduleRef,
      classInstance,
      interactionCollector,
    );

    if (filterMethodName)
      interactionCollector.filter = (...filterArgs) =>
        executedClassInstance[filterMethodName](...filterArgs);

    this.collectorRegister.subscribeToEvents(
      interactionCollector,
      events,
      executedClassInstance,
    );

    return interactionCollector;
  }

  private isMessageEvent(
    event: BaseEvents,
    context: ClientEvents[keyof ClientEvents],
  ): context is ClientEvents['messageCreate'] {
    return event === 'messageCreate';
  }

  private isInteractionEvent(
    event: BaseEvents,
    context: ClientEvents[keyof ClientEvents],
  ): context is ClientEvents['interactionCreate'] {
    return event === 'interactionCreate';
  }
}
