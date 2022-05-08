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
import { BaseEvents } from '../../definitions/types/event.type';
import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { InstantiationService } from '../../services/instantiation.service';
import { FilterExplorer } from '../filter/filter.explorer';
import { GuardExplorer } from '../guard/guard.explorer';
import { MethodExplorer } from '../interfaces/method-explorer';
import { MethodExplorerOptions } from '../interfaces/method-explorer-options';
import { MiddlewareExplorer } from '../middleware/middleware.explorer';
import { PipeExplorer } from '../pipe/pipe.explorer';
import { CollectMethodEventsInfo } from './collect-method-events-info';
import { CollectorMetadata } from './collector-metadata';
import { CollectorType } from './collector-type';
import { DiscordCollectors } from './discord-collectors';
import { UseCollectorApplyOptions } from './use-collector-apply-options';

@Injectable()
export class CollectorExplorer implements MethodExplorer {
  private readonly cachedCollectors = new WeakMap<Type, DiscordCollectors>();
  private readonly initCollectorInstances: InstanceType<any>[] = [];

  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly instantiationService: InstantiationService,
    private readonly middlewareExplorer: MiddlewareExplorer,
    private readonly guardExplorer: GuardExplorer,
    private readonly filterExplorer: FilterExplorer,
    private readonly pipeExplorer: PipeExplorer,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  async explore({
    instance,
    methodName,
  }: MethodExplorerOptions): Promise<void> {
    const classCollectors =
      this.metadataProvider.getUseCollectorsDecoratorMetadata(instance) ?? [];

    const methodCollectors =
      this.metadataProvider.getUseCollectorsDecoratorMetadata(
        instance,
        methodName,
      ) ?? [];

    if (classCollectors.length === 0 && methodCollectors.length === 0) return;

    const hostModule = this.instantiationService.getHostModule(instance);
    const moduleRef =
      hostModule.getProviderByKey<ModuleRef>(ModuleRef).instance;
    const methodCollectorInstances =
      await this.instantiationService.exploreInstances(
        methodCollectors,
        hostModule,
      );
    const methodCollectorInfos = this.getCollectorsInfo(
      methodCollectorInstances,
    );
    const classType = instance.constructor;

    if (this.cachedCollectors.has(classType))
      this.cachedCollectors.get(classType).methodCollectors[methodName] =
        methodCollectorInfos;
    else {
      const classCollectorInstances =
        await this.instantiationService.exploreInstances(
          classCollectors,
          hostModule,
        );
      const classCollectorInfos = this.getCollectorsInfo(
        classCollectorInstances,
      );

      this.cachedCollectors.set(classType, {
        methodCollectors: { [methodName]: methodCollectorInfos },
        classCollectors: classCollectorInfos,
        moduleRef,
      });
    }

    this.initCollectorInstances.push(...methodCollectorInstances);
  }

  async applyCollector({
    instance,
    methodName,
    event,
    eventArgs,
  }: UseCollectorApplyOptions): Promise<
    (ReactionCollector | MessageCollector | InteractionCollector<any>)[]
  > {
    const classType = instance.constructor;

    if (!this.cachedCollectors.has(classType)) return;

    const { classCollectors, methodCollectors, moduleRef } =
      this.cachedCollectors.get(classType);

    return Promise.all(
      [...classCollectors, ...(methodCollectors[methodName] || [])].map(
        async (collector) => {
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
        },
      ),
    );
  }

  getInitCollectorInstances(): InteractionCollector<any>[] {
    return this.initCollectorInstances;
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
            await this.middlewareExplorer.applyMiddleware(eventName, eventArgs);
            const isAllowFromGuards = await this.guardExplorer.applyGuard({
              instance: classInstance,
              methodName,
              event: eventName,
              eventArgs,
            });
            if (!isAllowFromGuards) return;

            const pipeResult = await this.pipeExplorer.applyPipe({
              instance: classInstance,
              methodName,
              event: eventName,
              eventArgs,
              initValue: eventArgs,
            });
            //#endregion

            classInstance[methodName](...(pipeResult || eventArgs));
          } catch (exception) {
            const isTrowException = await this.filterExplorer.applyFilter({
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

  private getCollectorsInfo(
    collectorInstances: InstanceType<any>[],
  ): CollectorMetadata[] {
    return collectorInstances.map((collectorInstance) => {
      const { filterMethodName, events } =
        this.exploreBaseInfo(collectorInstance);

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
    });
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

  private exploreBaseInfo(instance: InstanceType<any>): BaseCollectorMetadata {
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
