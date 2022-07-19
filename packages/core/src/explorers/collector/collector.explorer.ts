import { Injectable, Type } from '@nestjs/common';
import { MetadataScanner, ModuleRef } from '@nestjs/core';
import { Collector, InteractionCollector, Snowflake } from 'discord.js';

import { BaseCollectorMetadata } from '../../definitions/types/base-collector-metadata';
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
import { DiscordCollectors } from './discord-collectors';
import { InteractionCollectorStrategy } from './strategy/interaction-collector.strategy';
import { MessageCollectorStrategy } from './strategy/message-collector.strategy';
import { ReactCollectorStrategy } from './strategy/react-collector.strategy';
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
    private readonly reactCollectorStrategy: ReactCollectorStrategy,
    private readonly interactionCollectorStrategy: InteractionCollectorStrategy,
    private readonly messageCollectorStrategy: MessageCollectorStrategy,
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

  async applyCollector<T>(
    options: UseCollectorApplyOptions,
  ): Promise<Collector<Snowflake, T>[] | undefined> {
    const { instance, methodName } = options;
    const classType = instance.constructor;

    if (!this.cachedCollectors.has(classType)) return;

    const { classCollectors, methodCollectors, moduleRef } =
      this.cachedCollectors.get(classType);
    const collectors = [
      ...classCollectors,
      ...(methodCollectors[methodName] || []),
    ];

    return Promise.all(
      collectors.map((collector) =>
        collector.strategy.setupCollector(options, collector, moduleRef),
      ),
    );
  }

  getInitCollectorInstances(): InteractionCollector<any>[] {
    return this.initCollectorInstances;
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
          filterMethodName,
          events,
          strategy: this.reactCollectorStrategy,
        };

      const messageMetadata =
        this.metadataProvider.getMessageCollectorDecoratorMetadata(
          collectorInstance,
        );

      if (messageMetadata)
        return {
          classInstance: collectorInstance,
          metadata: messageMetadata,
          filterMethodName,
          events,
          strategy: this.messageCollectorStrategy,
        };

      const interactionMetadata =
        this.metadataProvider.getInteractionCollectorDecoratorMetadata(
          collectorInstance,
        );

      if (interactionMetadata)
        return {
          classInstance: collectorInstance,
          metadata: interactionMetadata,
          filterMethodName,
          events,
          strategy: this.interactionCollectorStrategy,
        };
    });
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
}
