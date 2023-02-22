import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import {
  ChannelType,
  ClientEvents,
  MessageCollector,
  MessageCollectorOptions,
} from 'discord.js';

import { BaseEvents } from '../../../definitions/types/event.type';
import { CollectorMetadata } from '../collector-metadata';
import { CollectorRegister } from '../collector-register';
import { UseCollectorApplyOptions } from '../use-collector-apply-options';
import { CollectorStrategy } from './collector-strategy';

@Injectable()
export class MessageCollectorStrategy implements CollectorStrategy {
  constructor(private readonly collectorRegister: CollectorRegister) {}

  async setupCollector(
    { event, eventArgs }: UseCollectorApplyOptions,
    { metadata, filterMethodName, events, classInstance }: CollectorMetadata,
    moduleRef: ModuleRef,
  ): Promise<MessageCollector> {
    if (
      !this.isMessageEvent(event, eventArgs) &&
      !this.isInteractionEvent(event, eventArgs)
    )
      return;
    const [messageOrInteraction] = eventArgs;

    if (messageOrInteraction.channel.type !== ChannelType.GuildText) {
      return;
    }

    const messageCollectorOptions: MessageCollectorOptions = {
      ...metadata,
    };
    const messageCollector =
      messageOrInteraction.channel.createMessageCollector(
        messageCollectorOptions,
      );

    const executedClassInstance = await this.collectorRegister.registerRequest(
      moduleRef,
      classInstance,
      {
        collector: messageCollector,
        causeEvent: messageOrInteraction,
      },
    );

    if (filterMethodName)
      messageCollector.filter = (...filterArgs) =>
        executedClassInstance[filterMethodName](...filterArgs);

    this.collectorRegister.subscribeToEvents(
      messageCollector,
      events,
      executedClassInstance,
    );

    return messageCollector;
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
