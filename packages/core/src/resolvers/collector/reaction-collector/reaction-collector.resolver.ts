import { DiscordReactionCollectorOptions } from '../../../definitions/types/reaction-collector.type';
import { ReflectMetadataProvider } from '../../../providers/reflect-metadata.provider';
import { ClassResolveOptions } from '../../interfaces/class-resolve-options';
import { ClassResolver } from '../../interfaces/class-resolver';
import { CollectMethodEventsInfo } from '../collect-method-events-info';
import { CollectorMetadata } from '../collector-metadata';
import { CollectorType } from '../collector-type';
import { Injectable } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core';
import { Message, ReactionCollectorOptions } from 'discord.js';

@Injectable()
export class ReactionCollectorResolver implements ClassResolver {
  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  resolve({
    instance,
  }: ClassResolveOptions): CollectorMetadata<DiscordReactionCollectorOptions> {
    const reactionMetadata =
      this.metadataProvider.getReactionCollectorDecoratorMetadata(instance);

    if (!reactionMetadata) return;

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
      classInstance: instance,
      metadata: reactionMetadata,
      type: CollectorType.REACTION,
      filterMethodName,
      events,
    };
  }

  applyReactionCollector(message: Message, collector: CollectorMetadata): void {
    const { type, metadata, filterMethodName, classInstance, events } =
      collector;
    if (!this.isReactionCollector(type, collector)) return;

    const reactionCollectorOptions: ReactionCollectorOptions = {
      ...metadata,
    };

    if (filterMethodName) {
      reactionCollectorOptions.filter = (...filterArgs) => {
        return classInstance[filterMethodName](...filterArgs);
      };
    }

    const reactionCollector = message.createReactionCollector(
      reactionCollectorOptions,
    );

    Object.entries(events).forEach(
      ([methodName, { eventMethod, eventName }]) => {
        reactionCollector[eventMethod](eventName, (...eventArgs) =>
          classInstance[methodName](...eventArgs),
        );
      },
    );
  }

  private isReactionCollector(
    type: CollectorType,
    collector: CollectorMetadata,
  ): collector is CollectorMetadata<DiscordReactionCollectorOptions> {
    return type === CollectorType.REACTION;
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
