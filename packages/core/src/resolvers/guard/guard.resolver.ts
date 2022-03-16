import { Injectable } from '@nestjs/common';
import { DiscoveryService, ModuleRef } from '@nestjs/core';

import { GuardType } from '../../definitions/types/guard.type';
import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { DiscordOptionService } from '../../services/discord-option.service';
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
    private readonly discoveryService: DiscoveryService,
  ) {}

  async resolve(options: MethodResolveOptions): Promise<void> {
    const { instance, methodName } = options;
    let guards = this.metadataProvider.getUseGuardsDecoratorMetadata(
      instance,
      methodName,
    );
    if (!guards) {
      const hasMetadataForGuard = this.checkApplyGlobalGuard(options);
      if (!hasMetadataForGuard) return;

      const guardAlreadyRegistered = this.getGuardData(options);
      if (guardAlreadyRegistered) return;

      guards = this.discordOptionService.getClientData().useGuards;
      if (guards.length === 0) return;
    }
    await this.addGuard(options, guards);
  }

  async addGuard(
    options: MethodResolveOptions,
    guards: GuardType[],
  ): Promise<void> {
    const { instance, methodName } = options;

    const instanceWrapper = this.discoveryService
      .getProviders()
      .find(({ token }) => token === instance.constructor);

    if (!instanceWrapper?.host)
      throw new Error(
        `Not found module for ${instance.constructor.name} class`,
      );

    const guardList = await Promise.all(
      guards.map((guard) => {
        if (typeof guard !== 'function') return guard;

        return instanceWrapper.host
          .getProviderByKey(ModuleRef)
          .instance.create(guard);
      }),
    );

    this.guardInfos.push({
      instance,
      methodName,
      guardList,
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

  private checkApplyGlobalGuard({
    instance,
    methodName,
  }: MethodResolveOptions): boolean {
    const someClassHasMetadata = [
      this.metadataProvider.getCommandDecoratorMetadata,
      this.metadataProvider.getSubCommandDecoratorMetadata,
    ].some((item) => item(instance));

    if (someClassHasMetadata) return true;

    return [
      this.metadataProvider.getOnEventDecoratorMetadata,
      this.metadataProvider.getOnceEventDecoratorMetadata,
    ].some((item) => item(instance, methodName));
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
