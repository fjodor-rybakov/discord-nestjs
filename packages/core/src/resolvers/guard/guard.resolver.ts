import { Injectable } from '@nestjs/common';

import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { DiscordOptionService } from '../../services/discord-option.service';
import { InstantiationService } from '../../services/instantiation.service';
import { MethodResolveOptions } from '../interfaces/method-resolve-options';
import { MethodResolver } from '../interfaces/method-resolver';
import { DiscordGuardOptions } from './discord-guard-options';
import { ResolvedGuardInfo } from './resolved-guard-info';

@Injectable()
export class GuardResolver implements MethodResolver {
  private readonly guardInfos: ResolvedGuardInfo[] = [];

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

    if (classGuards.length === 0 && methodGuards.length === 0) {
      if (globalGuards.length !== 0)
        this.guardInfos.push({
          instance,
          methodName,
          guardList: globalGuards,
        });

      return;
    }

    const localGuardInstances =
      await this.instantiationService.resolveInstances(
        [...classGuards, ...methodGuards],
        this.instantiationService.getHostModule(instance),
      );

    this.guardInfos.push({
      instance,
      methodName,
      guardList: [...globalGuards, ...localGuardInstances],
    });
  }

  async applyGuard(options: DiscordGuardOptions): Promise<boolean> {
    const { instance, methodName, event, eventArgs } = options;
    const guardListForMethod = this.getGuardData({ instance, methodName });
    if (!guardListForMethod) return true;

    for await (const guard of guardListForMethod.guardList) {
      const result = await guard.canActive(event, eventArgs);
      if (!result) return false;
    }
    return true;
  }

  private getGuardData({
    instance,
    methodName,
  }: MethodResolveOptions): ResolvedGuardInfo {
    return this.guardInfos.find(
      (item: ResolvedGuardInfo) =>
        item.methodName === methodName && item.instance === instance,
    );
  }
}
