import { Injectable, Type } from '@nestjs/common';

import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { DiscordOptionService } from '../../services/discord-option.service';
import { InstantiationService } from '../../services/instantiation.service';
import { MethodResolveOptions } from '../interfaces/method-resolve-options';
import { MethodResolver } from '../interfaces/method-resolver';
import { DiscordGuardOptions } from './discord-guard-options';
import { DiscordGuards } from './discord-guards';

@Injectable()
export class GuardResolver implements MethodResolver {
  private readonly cachedGuards = new WeakMap<Type, DiscordGuards>();

  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly discordOptionService: DiscordOptionService,
    private readonly instantiationService: InstantiationService,
  ) {}

  async resolve(options: MethodResolveOptions): Promise<void> {
    const { instance, methodName } = options;

    const globalGuards = this.discordOptionService.getClientData().useGuards;

    const classGuards =
      this.metadataProvider.getUseGuardsDecoratorMetadata(instance) ?? [];

    const methodGuards =
      this.metadataProvider.getUseGuardsDecoratorMetadata(
        instance,
        methodName,
      ) ?? [];

    const classType = instance.constructor;

    if (classGuards.length === 0 && methodGuards.length === 0) {
      if (globalGuards.length !== 0)
        this.cachedGuards.set(classType, {
          globalGuards,
          classGuards: [],
          methodGuards: {},
        });

      return;
    }

    const hostModule = this.instantiationService.getHostModule(instance);
    const methodGuardInstances =
      await this.instantiationService.resolveInstances(
        methodGuards,
        hostModule,
      );

    if (this.cachedGuards.has(classType))
      this.cachedGuards.get(classType).methodGuards[methodName] =
        methodGuardInstances;
    else {
      const classGuardInstances =
        await this.instantiationService.resolveInstances(
          classGuards,
          hostModule,
        );

      this.cachedGuards.set(classType, {
        methodGuards: { [methodName]: methodGuardInstances },
        classGuards: classGuardInstances,
        globalGuards,
      });
    }
  }

  async applyGuard(options: DiscordGuardOptions): Promise<boolean> {
    const { instance, methodName, event, eventArgs } = options;
    const classType = instance.constructor;

    if (!this.cachedGuards.has(classType)) return true;

    const { globalGuards, classGuards, methodGuards } =
      this.cachedGuards.get(classType);
    const guardList = [
      ...globalGuards,
      ...classGuards,
      ...(methodGuards[methodName] || []),
    ];

    for await (const guard of guardList) {
      const result = await guard.canActive(event, eventArgs);
      if (!result) return false;
    }
    return true;
  }
}
