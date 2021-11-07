import { Injectable } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core';
import {
  InteractionCollector,
  InteractionCollectorOptions,
  MessageCollector,
  MessageCollectorOptions,
  ReactionCollector,
  ReactionCollectorOptions,
} from 'discord.js';

import { DiscordMessageCollectorOptions } from '../../decorators/collector/message-collector/message-collector-options';
import { DiscordReactionCollectorOptions } from '../../decorators/collector/reaction-collector/reaction-collector-options';
import { BaseCollectorMetadata } from '../../definitions/types/base-collector-metadata';
import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { ClassResolveOptions } from '../interfaces/class-resolve-options';
import { ClassResolver } from '../interfaces/class-resolver';
import { CollectMethodEventsInfo } from './collect-method-events-info';
import { CollectorMetadata } from './collector-metadata';
import { CollectorType } from './collector-type';

@Injectable()
export class BaseCollectorResolver implements ClassResolver {
  constructor(
    private readonly metadataScanner: MetadataScanner,
    private readonly metadataProvider: ReflectMetadataProvider,
  ) {}

  resolve({
    instance,
  }: ClassResolveOptions): CollectorMetadata<
    DiscordReactionCollectorOptions | DiscordMessageCollectorOptions
  > {
    const baseCollectorMetadata = this.resolveBaseInfo(instance);

    const reactionMetadata =
      this.metadataProvider.getReactionCollectorDecoratorMetadata(instance);
    if (reactionMetadata)
      return {
        ...baseCollectorMetadata,
        type: CollectorType.REACTION,
        metadata: reactionMetadata,
      };

    const messageMetadata =
      this.metadataProvider.getMessageCollectorDecoratorMetadata(instance);
    if (messageMetadata)
      return {
        ...baseCollectorMetadata,
        type: CollectorType.MESSAGE,
        metadata: messageMetadata,
      };
  }

  subscribeToEvents(
    collector: ReactionCollector | MessageCollector | InteractionCollector<any>,
    events: CollectMethodEventsInfo,
    classInstance: InstanceType<any>,
  ): void {
    Object.entries(events).forEach(
      ([methodName, { eventMethod, eventName }]) => {
        // TODO: Fix problem with types later
        collector[eventMethod](eventName as any, (...eventArgs) =>
          classInstance[methodName](...eventArgs),
        );
      },
    );
  }

  applyFilter(
    collectorOptions:
      | ReactionCollectorOptions
      | MessageCollectorOptions
      | InteractionCollectorOptions<any>,
    filterMethodName: string,
    classInstance: InstanceType<any>,
  ): void {
    if (filterMethodName) {
      collectorOptions.filter = (...filterArgs) => {
        return classInstance[filterMethodName](...filterArgs);
      };
    }
  }

  private resolveBaseInfo(instance: InstanceType<any>): BaseCollectorMetadata {
    let filterMethodName;
    const events: CollectMethodEventsInfo = {};

    this.getInstanceMethods(instance).forEach((methodName: string) => {
      let eventMethod: 'on' | 'once' = 'on';
      let eventMetadata =
        this.metadataProvider.getOnCollectEventDecoratorMetadata(
          instance,
          methodName,
        );
      if (!eventMetadata) {
        eventMetadata =
          this.metadataProvider.getOnceCollectEventDecoratorMetadata(
            instance,
            methodName,
          );
        eventMethod = 'once';
      }
      if (eventMetadata)
        events[methodName] = {
          eventName: eventMetadata.event,
          eventMethod: eventMethod,
        };

      if (filterMethodName) return;
      filterMethodName = this.findFilterMethod(instance, methodName);
    });

    return {
      events,
      classInstance: instance,
      filterMethodName,
    };
  }

  private getInstanceMethods(instance: any): string[] {
    return this.metadataScanner.scanFromPrototype(
      instance,
      Object.getPrototypeOf(instance),
      (methodName) => methodName,
    );
  }

  private findFilterMethod(
    instance: InstanceType<any>,
    methodName: string,
  ): string {
    const filterMetadata = this.metadataProvider.getFilterDecoratorMetadata(
      instance,
      methodName,
    );

    if (filterMetadata) return methodName;
  }
}
