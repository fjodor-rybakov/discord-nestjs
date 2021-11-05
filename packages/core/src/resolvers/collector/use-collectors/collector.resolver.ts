import { ReflectMetadataProvider } from '../../../providers/reflect-metadata.provider';
import { MethodResolveOptions } from '../../interfaces/method-resolve-options';
import { MethodResolver } from '../../interfaces/method-resolver';
import { ReactionCollectorResolver } from '../reaction-collector/reaction-collector.resolver';
import { ResolvedCollectorInfos } from './resolved-collector-infos';
import { UseCollectorApplyOptions } from './use-collector-apply-options';
import { Injectable, Type } from '@nestjs/common';
import { MetadataScanner, ModuleRef } from '@nestjs/core';
import { ClientEvents } from 'discord.js';

@Injectable()
export class CollectorResolver implements MethodResolver {
  private readonly collectorInfos: ResolvedCollectorInfos[] = [];

  constructor(
    private readonly reactCollectorResolver: ReactionCollectorResolver,
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
      this.reactCollectorResolver.resolve({ instance: classInstance }),
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
    context,
  }: UseCollectorApplyOptions) {
    const methodCollectors = this.getCollectorData({ instance, methodName });

    if (!methodCollectors) return;

    methodCollectors.collectors.map((collector) => {
      if (this.isMessageEvent(event, context)) {
        const [message] = context;
        this.reactCollectorResolver.applyReactionCollector(message, collector);
      }
    });
  }

  private isMessageEvent(
    event: keyof ClientEvents,
    context: ClientEvents[keyof ClientEvents],
  ): context is ClientEvents['messageCreate'] {
    return event === 'messageCreate';
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
