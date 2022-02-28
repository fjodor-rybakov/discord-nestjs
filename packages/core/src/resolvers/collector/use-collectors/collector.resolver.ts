import { Injectable, Type } from '@nestjs/common';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import {
  ClientEvents,
  InteractionCollector,
  InteractionCollectorOptions,
  MessageCollector,
  MessageCollectorOptions,
  ReactionCollector,
  ReactionCollectorOptions,
} from 'discord.js';

import { ReflectMetadataProvider } from '../../../providers/reflect-metadata.provider';
import { MethodResolveOptions } from '../../interfaces/method-resolve-options';
import { MethodResolver } from '../../interfaces/method-resolver';
import { BaseCollectorResolver } from '../base-collector.resolver';
import { CollectorType } from '../collector-type';
import { ResolvedCollectorInfos } from './resolved-collector-infos';
import { UseCollectorApplyOptions } from './use-collector-apply-options';

@Injectable()
export class CollectorResolver implements MethodResolver {
  private readonly collectorInfos: ResolvedCollectorInfos[] = [];

  constructor(
    private readonly baseCollectorResolver: BaseCollectorResolver,
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly moduleRef: ModuleRef,
  ) {}

  async resolve({ instance, methodName }: MethodResolveOptions): Promise<void> {
    const collectorTypes =
      this.metadataProvider.getUseCollectorsDecoratorMetadata(
        instance,
        methodName,
      );
    if (!collectorTypes) return;

    await this.addCollector({ instance, methodName }, collectorTypes);
  }

  async addCollector(
    { instance, methodName }: MethodResolveOptions,
    collectorTypes: Type[],
  ): Promise<void> {
    const collectors =
      collectorTypes.map((type) =>
        this.baseCollectorResolver.getCollectorMetadata(type),
      ) ?? [];

    this.collectorInfos.push({
      instance,
      methodName,
      collectors,
    });
  }

  async applyCollector({
    instance,
    methodName,
    event,
    eventArgs,
  }: UseCollectorApplyOptions): Promise<
    (ReactionCollector | MessageCollector | InteractionCollector<any>)[]
  > {
    const methodCollectors = this.getCollectorData({ instance, methodName });

    if (!methodCollectors) return;

    return Promise.all(
      methodCollectors.collectors.map(async (collector) => {
        const { type, metadata, filterMethodName, classInstance, events } =
          collector;
        switch (type) {
          case CollectorType.REACTION: {
            if (!this.isMessageEvent(event, eventArgs)) return;

            const [message] = eventArgs;
            const reactionCollectorOptions: ReactionCollectorOptions = {
              ...metadata,
            };
            const reactionCollector = message.createReactionCollector(
              reactionCollectorOptions,
            );

            const contextId = ContextIdFactory.create();
            this.moduleRef.registerRequestByContextId(
              reactionCollector,
              contextId,
            );
            const requestInstance = await this.moduleRef.resolve(
              classInstance.constructor,
              contextId,
            );

            if (filterMethodName)
              reactionCollector.filter = (...filterArgs) =>
                requestInstance[filterMethodName](...filterArgs);

            this.baseCollectorResolver.subscribeToEvents(
              reactionCollector,
              events,
              requestInstance,
            );

            return reactionCollector;
          }
          case CollectorType.MESSAGE: {
            if (
              !this.isMessageEvent(event, eventArgs) &&
              !this.isInteractionEvent(event, eventArgs)
            )
              return;
            const [messageOrInteraction] = eventArgs;
            const messageCollectorOptions: MessageCollectorOptions = {
              ...metadata,
            };
            const messageCollector =
              messageOrInteraction.channel.createMessageCollector(
                messageCollectorOptions,
              );

            const contextId = ContextIdFactory.create();
            this.moduleRef.registerRequestByContextId(
              messageCollector,
              contextId,
            );
            const requestInstance = await this.moduleRef.resolve(
              classInstance.constructor,
              contextId,
            );

            if (filterMethodName)
              messageCollector.filter = (...filterArgs) =>
                requestInstance[filterMethodName](...filterArgs);

            this.baseCollectorResolver.subscribeToEvents(
              messageCollector,
              events,
              requestInstance,
            );

            return messageCollector;
          }
          case CollectorType.INTERACTION: {
            if (
              !this.isMessageEvent(event, eventArgs) &&
              !this.isInteractionEvent(event, eventArgs)
            )
              return;
            const [messageOrInteraction] = eventArgs;
            const interactionCollectorOptions: InteractionCollectorOptions<any> =
              {
                ...metadata,
              };
            const interactionCollector =
              messageOrInteraction.channel.createMessageComponentCollector(
                interactionCollectorOptions,
              );

            const contextId = ContextIdFactory.create();
            this.moduleRef.registerRequestByContextId(
              interactionCollector,
              contextId,
            );
            const requestInstance = await this.moduleRef.resolve(
              classInstance.constructor,
              contextId,
            );

            if (filterMethodName)
              interactionCollector.filter = (...filterArgs) =>
                requestInstance[filterMethodName](...filterArgs);

            this.baseCollectorResolver.subscribeToEvents(
              interactionCollector,
              events,
              requestInstance,
            );

            return interactionCollector;
          }
        }
      }),
    );
  }

  private isMessageEvent(
    event: keyof ClientEvents,
    context: ClientEvents[keyof ClientEvents],
  ): context is ClientEvents['messageCreate'] {
    return event === 'messageCreate';
  }

  private isInteractionEvent(
    event: keyof ClientEvents,
    context: ClientEvents[keyof ClientEvents],
  ): context is ClientEvents['interactionCreate'] {
    return event === 'interactionCreate';
  }

  private getCollectorData({
    instance,
    methodName,
  }: MethodResolveOptions): ResolvedCollectorInfos {
    return this.collectorInfos.find(
      (item: ResolvedCollectorInfos) =>
        item.methodName === methodName && item.instance === instance,
    );
  }
}
