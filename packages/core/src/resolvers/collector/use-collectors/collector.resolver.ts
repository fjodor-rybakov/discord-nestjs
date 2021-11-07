import { ReflectMetadataProvider } from '../../../providers/reflect-metadata.provider';
import { MethodResolveOptions } from '../../interfaces/method-resolve-options';
import { MethodResolver } from '../../interfaces/method-resolver';
import { BaseCollectorResolver } from '../base-collector.resolver';
import { CollectorType } from '../collector-type';
import { ResolvedCollectorInfos } from './resolved-collector-infos';
import { UseCollectorApplyOptions } from './use-collector-apply-options';
import { Injectable, Type } from '@nestjs/common';
import { MetadataScanner, ModuleRef } from '@nestjs/core';
import {
  ClientEvents,
  InteractionCollector,
  InteractionCollectorOptions,
  MessageCollector,
  MessageCollectorOptions,
  ReactionCollector,
  ReactionCollectorOptions,
} from 'discord.js';

@Injectable()
export class CollectorResolver implements MethodResolver {
  private readonly collectorInfos: ResolvedCollectorInfos[] = [];

  constructor(
    private readonly baseCollectorResolver: BaseCollectorResolver,
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly metadataScanner: MetadataScanner,
    private readonly moduleRef: ModuleRef,
  ) {}

  async resolve({ instance, methodName }: MethodResolveOptions): Promise<void> {
    const collectorTypes =
      this.metadataProvider.getUseCollectorsDecoratorMetadata(
        instance,
        methodName,
      );
    if (!collectorTypes) {
      return;
    }

    await this.addCollector({ instance, methodName }, collectorTypes);
  }

  async addCollector(
    { instance, methodName }: MethodResolveOptions,
    collectorTypes: Type[],
  ): Promise<void> {
    const collectorClassInstances = await Promise.all(
      collectorTypes.map((type) => this.moduleRef.create(type)),
    );

    const collectors = collectorClassInstances.map((classInstance: string) =>
      this.baseCollectorResolver.resolve({ instance: classInstance }),
    );

    this.collectorInfos.push({
      instance,
      methodName,
      collectors,
    });
  }

  applyCollector({
    instance,
    methodName,
    event,
    eventArgs,
  }: UseCollectorApplyOptions): (
    | ReactionCollector
    | MessageCollector
    | InteractionCollector<any>
  )[] {
    const methodCollectors = this.getCollectorData({ instance, methodName });

    if (!methodCollectors) return;

    return methodCollectors.collectors.map((collector) => {
      const { type, metadata, filterMethodName, classInstance, events } =
        collector;
      switch (type) {
        case CollectorType.REACTION: {
          if (!this.isMessageEvent(event, eventArgs)) return;

          const [message] = eventArgs;
          const reactionCollectorOptions: ReactionCollectorOptions = {
            ...metadata,
          };
          this.baseCollectorResolver.applyFilter(
            reactionCollectorOptions,
            filterMethodName,
            classInstance,
          );
          const reactionCollector = message.createReactionCollector(
            reactionCollectorOptions,
          );
          this.baseCollectorResolver.subscribeToEvents(
            reactionCollector,
            events,
            classInstance,
          );

          return reactionCollector;
        }
        case CollectorType.MESSAGE: {
          if (!this.isInteractionEvent(event, eventArgs)) return;
          const [interaction] = eventArgs;
          const messageCollectorOptions: MessageCollectorOptions = {
            ...metadata,
          };
          this.baseCollectorResolver.applyFilter(
            messageCollectorOptions,
            filterMethodName,
            classInstance,
          );
          const messageCollector = interaction.channel.createMessageCollector(
            messageCollectorOptions,
          );
          this.baseCollectorResolver.subscribeToEvents(
            messageCollector,
            events,
            classInstance,
          );

          return messageCollector;
        }
        case CollectorType.INTERACTION: {
          if (!this.isInteractionEvent(event, eventArgs)) return;
          const [interaction] = eventArgs;
          const interactionCollectorOptions: InteractionCollectorOptions<any> =
            {
              ...metadata,
            };
          this.baseCollectorResolver.applyFilter(
            interactionCollectorOptions,
            filterMethodName,
            classInstance,
          );
          const interactionCollector =
            interaction.channel.createMessageComponentCollector(
              interactionCollectorOptions,
            );
          this.baseCollectorResolver.subscribeToEvents(
            interactionCollector,
            events,
            classInstance,
          );

          return interactionCollector;
        }
      }
    });
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
