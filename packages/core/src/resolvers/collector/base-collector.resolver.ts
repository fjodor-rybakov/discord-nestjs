import { Injectable, Type } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core';
import {
  Interaction,
  InteractionCollector,
  InteractionCollectorOptions,
  MessageCollector,
  MessageCollectorOptions,
  ReactionCollector,
  ReactionCollectorOptions,
} from 'discord.js';

import { DiscordInteractionCollectorOptions } from '../../decorators/collector/interaction-collector/interaction-collector-options';
import { DiscordMessageCollectorOptions } from '../../decorators/collector/message-collector/message-collector-options';
import { DiscordReactionCollectorOptions } from '../../decorators/collector/reaction-collector/reaction-collector-options';
import { BaseCollectorMetadata } from '../../definitions/types/base-collector-metadata';
import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { FilterResolver } from '../filter/filter.resolver';
import { GuardResolver } from '../guard/guard.resolver';
import { ClassResolveOptions } from '../interfaces/class-resolve-options';
import { ClassResolver } from '../interfaces/class-resolver';
import { MiddlewareResolver } from '../middleware/middleware.resolver';
import { PipeResolver } from '../pipe/pipe.resolver';
import { CollectMethodEventsInfo } from './collect-method-events-info';
import { CollectorMetadata } from './collector-metadata';
import { CollectorType } from './collector-type';

type CollectorMetadataOptions = CollectorMetadata<
  | DiscordReactionCollectorOptions
  | DiscordMessageCollectorOptions
  | DiscordInteractionCollectorOptions<Interaction>
>;

@Injectable()
export class BaseCollectorResolver implements ClassResolver {
  private readonly collectorMetadata: CollectorMetadataOptions[] = [];

  constructor(
    private readonly metadataScanner: MetadataScanner,
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly middlewareResolver: MiddlewareResolver,
    private readonly guardResolver: GuardResolver,
    private readonly filterResolver: FilterResolver,
    private readonly pipeResolver: PipeResolver,
  ) {}

  resolve({ instance }: ClassResolveOptions): void {
    const baseCollectorMetadata = this.resolveBaseInfo(instance);

    const reactionMetadata =
      this.metadataProvider.getReactionCollectorDecoratorMetadata(instance);
    if (reactionMetadata)
      this.collectorMetadata.push({
        ...baseCollectorMetadata,
        type: CollectorType.REACTION,
        metadata: reactionMetadata,
      });

    const messageMetadata =
      this.metadataProvider.getMessageCollectorDecoratorMetadata(instance);
    if (messageMetadata)
      this.collectorMetadata.push({
        ...baseCollectorMetadata,
        type: CollectorType.MESSAGE,
        metadata: messageMetadata,
      });

    const interactionMetadata =
      this.metadataProvider.getInteractionCollectorDecoratorMetadata(instance);
    if (interactionMetadata)
      this.collectorMetadata.push({
        ...baseCollectorMetadata,
        type: CollectorType.INTERACTION,
        metadata: interactionMetadata,
      });
  }

  getCollectorMetadata(collectorType: Type): CollectorMetadataOptions {
    return this.collectorMetadata.find(
      (metadata) => metadata.classInstance.constructor === collectorType,
    );
  }

  subscribeToEvents(
    collector: ReactionCollector | MessageCollector | InteractionCollector<any>,
    events: CollectMethodEventsInfo,
    classInstance: InstanceType<any>,
  ): void {
    Object.entries(events).forEach(
      ([methodName, { eventMethod, eventName }]) => {
        collector[eventMethod](eventName as any, async (...eventArgs) => {
          try {
            //#region apply middleware, guard, pipe
            await this.middlewareResolver.applyMiddleware(eventName, eventArgs);
            const isAllowFromGuards = await this.guardResolver.applyGuard({
              instance: classInstance,
              methodName,
              event: eventName,
              eventArgs,
            });
            if (!isAllowFromGuards) return;

            const pipeResult = await this.pipeResolver.applyPipe({
              instance: classInstance,
              methodName,
              event: eventName,
              eventArgs,
              initValue: eventArgs,
            });
            //#endregion

            classInstance[methodName](...(pipeResult || eventArgs));
          } catch (exception) {
            const isTrowException = await this.filterResolver.applyFilter({
              instance: classInstance,
              methodName,
              event: eventName,
              eventArgs,
              exception,
            });

            if (isTrowException) throw exception;
          }
        });
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
