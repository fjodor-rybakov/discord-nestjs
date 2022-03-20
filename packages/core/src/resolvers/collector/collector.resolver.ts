import { Injectable, Scope, Type } from '@nestjs/common';
import { ContextIdFactory, MetadataScanner, ModuleRef } from '@nestjs/core';
import {
  ClientEvents,
  Collector,
  InteractionCollector,
  InteractionCollectorOptions,
  MessageCollector,
  MessageCollectorOptions,
  ReactionCollector,
  ReactionCollectorOptions,
} from 'discord.js';

import { BaseCollectorMetadata } from '../../definitions/types/base-collector-metadata';
import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { InstantiationService } from '../../services/instantiation.service';
import { FilterResolver } from '../filter/filter.resolver';
import { GuardResolver } from '../guard/guard.resolver';
import { MethodResolveOptions } from '../interfaces/method-resolve-options';
import { MethodResolver } from '../interfaces/method-resolver';
import { MiddlewareResolver } from '../middleware/middleware.resolver';
import { PipeResolver } from '../pipe/pipe.resolver';
import { CollectMethodEventsInfo } from './collect-method-events-info';
import { CollectorMetadata } from './collector-metadata';
import { CollectorType } from './collector-type';
import { ResolvedCollectorInfos } from './resolved-collector-infos';
import { UseCollectorApplyOptions } from './use-collector-apply-options';

@Injectable()
export class CollectorResolver implements MethodResolver {
  private readonly collectorInfos: ResolvedCollectorInfos[] = [];

  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly instantiationService: InstantiationService,
    private readonly middlewareResolver: MiddlewareResolver,
    private readonly guardResolver: GuardResolver,
    private readonly filterResolver: FilterResolver,
    private readonly pipeResolver: PipeResolver,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  async resolve({ instance, methodName }: MethodResolveOptions): Promise<void> {
    const classCollectors =
      this.metadataProvider.getUseCollectorsDecoratorMetadata(instance) ?? [];

    const methodCollectors =
      this.metadataProvider.getUseCollectorsDecoratorMetadata(
        instance,
        methodName,
      ) ?? [];

    if (classCollectors.length === 0 && methodCollectors.length === 0) return;

    const hostModule = this.instantiationService.getHostModule(instance);
    const localCollectorInstances =
      await this.instantiationService.resolveInstances(
        [...classCollectors, ...methodCollectors],
        hostModule,
      );

    const collectors: CollectorMetadata[] = localCollectorInstances.map(
      (collectorInstance) => {
        const { filterMethodName, events } =
          this.resolveBaseInfo(collectorInstance);

        const reactionMetadata =
          this.metadataProvider.getReactionCollectorDecoratorMetadata(
            collectorInstance,
          );

        if (reactionMetadata)
          return {
            classInstance: collectorInstance,
            metadata: reactionMetadata,
            type: CollectorType.REACTION,
            filterMethodName,
            events,
          };

        const messageMetadata =
          this.metadataProvider.getMessageCollectorDecoratorMetadata(
            collectorInstance,
          );

        if (messageMetadata)
          return {
            classInstance: collectorInstance,
            metadata: messageMetadata,
            type: CollectorType.MESSAGE,
            filterMethodName,
            events,
          };

        const interactionMetadata =
          this.metadataProvider.getInteractionCollectorDecoratorMetadata(
            collectorInstance,
          );

        if (interactionMetadata)
          return {
            classInstance: collectorInstance,
            metadata: interactionMetadata,
            type: CollectorType.INTERACTION,
            filterMethodName,
            events,
          };
      },
    );

    this.collectorInfos.push({
      instance,
      methodName,
      moduleRef: hostModule.getProviderByKey(ModuleRef).instance,
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
    const collectorDataList = this.getCollectorData({ instance, methodName });

    if (!collectorDataList) return;

    const { moduleRef } = collectorDataList;

    return Promise.all(
      collectorDataList.collectors.map(async (collector) => {
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

            const executedClassInstance = await this.registerRequest(
              moduleRef,
              classInstance,
              reactionCollector,
            );

            if (filterMethodName)
              reactionCollector.filter = (...filterArgs) =>
                executedClassInstance[filterMethodName](...filterArgs);

            this.subscribeToEvents(
              reactionCollector,
              events,
              executedClassInstance,
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

            const executedClassInstance = await this.registerRequest(
              moduleRef,
              classInstance,
              messageCollector,
            );

            if (filterMethodName)
              messageCollector.filter = (...filterArgs) =>
                executedClassInstance[filterMethodName](...filterArgs);

            this.subscribeToEvents(
              messageCollector,
              events,
              executedClassInstance,
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

            const executedClassInstance = await this.registerRequest(
              moduleRef,
              classInstance,
              interactionCollector,
            );

            if (filterMethodName)
              interactionCollector.filter = (...filterArgs) =>
                executedClassInstance[filterMethodName](...filterArgs);

            this.subscribeToEvents(
              interactionCollector,
              events,
              executedClassInstance,
            );

            return interactionCollector;
          }
        }
      }),
    );
  }

  private subscribeToEvents(
    collector: Collector<any, any, any>,
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

  private async registerRequest(
    moduleRef: ModuleRef,
    classInstance: InstanceType<any>,
    requestObject: unknown,
  ): Promise<InstanceType<any>> {
    if (moduleRef.introspect(classInstance.constructor).scope === Scope.DEFAULT)
      return classInstance;

    const contextId = ContextIdFactory.create();
    moduleRef.registerRequestByContextId(requestObject, contextId);
    return moduleRef.resolve(classInstance.constructor, contextId);
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
